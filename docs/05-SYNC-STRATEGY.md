# Message Synchronization Strategy

## Overview
Efficient synchronization system to minimize API calls to SMSEagle while keeping the local database up-to-date.

## Goals
1. Avoid fetching all messages on every request
2. Only fetch new messages since last sync
3. Update status of pending messages during validity period
4. Stop tracking messages after validity expires
5. Handle sync failures gracefully

---

## Synchronization Components

### 1. Incremental Message Sync

#### Process
1. **Get Last Sync State**
   - Query `sync_state` table for the last synced message ID per folder
   - Each folder (inbox, outbox, sent, error, delivered) tracks separately

2. **Fetch New Messages**
   - Call SMSEagle API: `GET /messages/{folder}?id_from={lastId + 1}`
   - Fetch only messages with ID greater than last synced ID
   - No limit parameter = get all new messages

3. **Save to Database**
   - Insert new messages into `messages` table
   - Use `smseagle_id` as unique identifier
   - Handle duplicates gracefully (UPSERT)

4. **Update Sync State**
   - Store the highest message ID received
   - Update `last_sync_time` timestamp

5. **Track Pending Messages**
   - For outbox/sent messages with validity < "max"
   - Calculate `validity_expires_at` timestamp
   - Insert into `pending_messages` table

#### Example Flow
```
Initial State:
sync_state.inbox.last_synced_id = 1000

Sync Execution:
1. Fetch messages: GET /messages/inbox?id_from=1001
2. Receive 5 new messages (IDs: 1001-1005)
3. Insert into messages table
4. Update sync_state: last_synced_id = 1005
```

### 2. Pending Message Status Updates

#### Purpose
Track delivery status of recently sent messages during their validity period.

#### Process
1. **Query Pending Messages**
   ```sql
   SELECT * FROM pending_messages
   WHERE validity_expires_at > NOW()
   ORDER BY validity_expires_at ASC
   ```

2. **Fetch Current Status**
   - For each pending message, query SMSEagle API
   - `GET /messages/sent?id_from={id}&id_to={id}`
   - Get current status (delivery_ok, delivery_failed, etc.)

3. **Update Database**
   - Update message status in `messages` table
   - Update `update_date` timestamp

4. **Remove Completed/Expired**
   - Delete from `pending_messages` if:
     - Status is final (delivery_ok, delivery_failed, error)
     - Validity period expired

#### Validity Period Calculation
```typescript
function calculateExpiryTime(sendDate: Date, validity: string): Date {
  const validityMap = {
    '5m': 5 * 60 * 1000,
    '10m': 10 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000
  };

  const ms = validityMap[validity] || 0;
  return new Date(sendDate.getTime() + ms);
}
```

### 3. Background Jobs

#### Job 1: Incremental Message Sync
- **Frequency**: Every 2 minutes
- **Action**: Sync all folders incrementally
- **Pseudo-code**:
  ```typescript
  async function syncAllFolders() {
    const folders = ['inbox', 'outbox', 'sent', 'error', 'delivered'];

    for (const folder of folders) {
      const lastId = await getLastSyncedId(folder);
      const newMessages = await fetchMessages(folder, lastId + 1);

      if (newMessages.length > 0) {
        await saveMessages(newMessages);
        await updateSyncState(folder, Math.max(...newMessages.map(m => m.id)));
        await trackPendingMessages(newMessages);
      }
    }
  }
  ```

#### Job 2: Status Update
- **Frequency**: Every 5 minutes
- **Action**: Update pending message statuses
- **Pseudo-code**:
  ```typescript
  async function updatePendingStatuses() {
    const pending = await getPendingMessages();

    for (const item of pending) {
      const currentStatus = await fetchMessageStatus(item.smseagle_id);
      await updateMessageStatus(item.message_id, currentStatus);

      if (isFinalStatus(currentStatus.status) || isExpired(item)) {
        await removePendingMessage(item.id);
      }
    }
  }
  ```

---

## Database Tables

### sync_state
Tracks last synchronized message ID per folder.
```sql
| folder    | last_synced_id | last_sync_time      |
|-----------|----------------|---------------------|
| inbox     | 1234           | 2024-01-15 10:30:00 |
| outbox    | 567            | 2024-01-15 10:30:00 |
| sent      | 5678           | 2024-01-15 10:30:00 |
| error     | 89             | 2024-01-15 10:30:00 |
| delivered | 5432           | 2024-01-15 10:30:00 |
```

### pending_messages
Tracks messages that need status updates.
```sql
| id | message_id | smseagle_id | validity_expires_at  |
|----|------------|-------------|----------------------|
| 1  | 1234       | 5678        | 2024-01-15 11:30:00  |
| 2  | 1235       | 5679        | 2024-01-15 11:00:00  |
```

---

## Edge Cases & Error Handling

### 1. First Sync (Cold Start)
- `last_synced_id = 0` means no previous sync
- Decision: Fetch recent messages only (e.g., last 7 days)
- Prevents loading entire message history

```typescript
async function initialSync(folder: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const messages = await smseagle.getMessages(folder, {
    date_from: sevenDaysAgo.toISOString()
  });

  await saveMessages(messages);
  await updateSyncState(folder, Math.max(...messages.map(m => m.id)));
}
```

### 2. API Failures
- Log error and continue to next folder
- Don't update sync state on failure
- Retry on next scheduled run
- Exponential backoff for repeated failures

```typescript
async function syncFolderWithRetry(folder: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await syncFolder(folder);
      return;
    } catch (error) {
      logger.error(`Sync failed for ${folder}, attempt ${i + 1}`, error);
      if (i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000); // Exponential backoff
      }
    }
  }
}
```

### 3. Missing Messages (ID Gaps)
- SMSEagle might have gaps in message IDs
- Using `id_from` handles this naturally
- No special handling needed

### 4. Clock Skew
- Use message IDs, not timestamps for pagination
- Timestamps only for user display
- Validity expiry uses server time consistently

### 5. Database Duplicates
- Use UPSERT pattern (INSERT ... ON DUPLICATE KEY UPDATE)
- `smseagle_id` is unique index
- Update existing records if ID already exists

```typescript
async function saveMessage(message: Message) {
  const query = `
    INSERT INTO messages (
      smseagle_id, folder, phone_number, text, ...
    ) VALUES (?, ?, ?, ?, ...)
    ON DUPLICATE KEY UPDATE
      status = VALUES(status),
      update_date = VALUES(update_date)
  `;

  await db.execute(query, [...values]);
}
```

### 6. High Message Volume
- If sync returns > 1000 messages, break into batches
- Process in chunks to avoid memory issues
- Update sync state after each batch

```typescript
const BATCH_SIZE = 500;

async function syncLargeVolume(folder: string, fromId: number) {
  let currentId = fromId;
  let hasMore = true;

  while (hasMore) {
    const messages = await smseagle.getMessages(folder, {
      id_from: currentId,
      limit: BATCH_SIZE
    });

    if (messages.length > 0) {
      await saveMessages(messages);
      currentId = Math.max(...messages.map(m => m.id));
      await updateSyncState(folder, currentId);
    }

    hasMore = messages.length === BATCH_SIZE;
  }
}
```

---

## Performance Considerations

### 1. API Rate Limiting
- Limit concurrent requests to SMSEagle
- Use queue for API calls
- Respect any rate limits from SMSEagle

### 2. Database Indexes
- Index on `smseagle_id` for fast lookups
- Index on `folder` + `phone_number` for conversation queries
- Index on `validity_expires_at` for pending queries
- Index on date fields for filtering

### 3. Caching Strategy
- Cache modem names (rarely change)
- Cache contact list for short duration (5 minutes)
- Don't cache messages (always from DB)

### 4. Pagination
- Always use pagination in API responses
- Default limit: 50
- Max limit: 100
- Use cursor-based pagination for large datasets

---

## Monitoring & Logging

### Key Metrics to Track
1. **Sync Performance**
   - Messages synced per run
   - Sync duration per folder
   - Failed sync attempts

2. **API Usage**
   - API calls per minute
   - Response times
   - Error rates

3. **Database Performance**
   - Query execution times
   - Connection pool usage
   - Slow query log

### Logging Examples
```typescript
logger.info('Sync started', { folders: ['inbox', 'outbox', 'sent', 'error', 'delivered'] });
logger.info('Folder synced', { folder: 'inbox', newMessages: 5, duration: '234ms' });
logger.warn('No new messages', { folder: 'outbox', lastId: 567 });
logger.error('Sync failed', { folder: 'sent', error: err.message, lastId: 1234 });
```

---

## Future Enhancements

1. **WebSocket/SSE for Real-time Updates**
   - Push new messages to frontend without polling
   - Notify when message status changes

2. **Smart Sync Frequency**
   - Increase frequency during business hours
   - Decrease frequency at night
   - Adjust based on message volume

3. **Webhook Support**
   - Use SMSEagle webhooks if available
   - Reduce polling frequency
   - Immediate updates on new messages

4. **Message Archive**
   - Move old messages to archive table
   - Keep recent messages in main table
   - Improve query performance
