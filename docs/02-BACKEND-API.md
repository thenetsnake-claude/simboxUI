# Backend API Specification

## Overview
RESTful API built with Express.js and TypeScript, serving as middleware between the Angular frontend and SMSEagle API.

## Base URL
`http://localhost:3000/api`

## Authentication
All endpoints require Auth0 JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Authorization Roles
- **admin**: Full access to all endpoints
- **support**: Limited access (cannot manage modem settings)

---

## Endpoints

### Authentication & Users

#### GET /auth/me
Get current user profile.
- **Auth**: Required
- **Role**: Any
- **Response**: User object with role

---

### Messages

#### GET /messages
Get paginated messages from a folder or conversation.
- **Auth**: Required
- **Role**: admin, support
- **Query Params**:
  - `folder`: inbox | outbox | sent | error | delivered (optional)
  - `phone_number`: Filter by phone number (optional)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50, max: 100)
  - `sort`: asc | desc (default: desc)
- **Response**:
  ```json
  {
    "messages": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 250,
      "pages": 5
    }
  }
  ```

#### GET /messages/conversations
Get list of conversations (unique phone numbers with latest message).
- **Auth**: Required
- **Role**: admin, support
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
- **Response**:
  ```json
  {
    "conversations": [
      {
        "phone_number": "+1234567890",
        "last_message": {...},
        "unread_count": 3,
        "last_activity": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
  ```

#### GET /messages/:id
Get single message by ID.
- **Auth**: Required
- **Role**: admin, support
- **Response**: Message object

#### POST /messages/sms
Send SMS message.
- **Auth**: Required
- **Role**: admin, support
- **Body**:
  ```json
  {
    "to": ["+1234567890"],
    "contacts": [1, 2],
    "groups": [1],
    "text": "Message text",
    "date": "2024-01-15T10:30:00Z",
    "encoding": "unicode",
    "validity": "1h",
    "modem_no": 1
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "results": [
      {
        "status": "queued",
        "number": "+1234567890",
        "id": 123
      }
    ]
  }
  ```

#### POST /messages/binary
Send binary SMS message.
- **Auth**: Required
- **Role**: admin, support
- **Body**:
  ```json
  {
    "to": "+1234567890",
    "data": "48656C6C6F",
    "modem_no": 1
  }
  ```
- **Response**: Similar to SMS send

#### PATCH /messages/:id/read
Mark message as read.
- **Auth**: Required
- **Role**: admin, support
- **Response**: Updated message object

---

### Contacts

#### GET /contacts
Get all contacts with pagination.
- **Auth**: Required
- **Role**: admin, support
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
  - `search`: Search by name or phone (optional)
- **Response**:
  ```json
  {
    "contacts": [...],
    "pagination": {...}
  }
  ```

#### GET /contacts/:id
Get single contact.
- **Auth**: Required
- **Role**: admin, support
- **Response**: Contact object with groups

#### POST /contacts
Create new contact.
- **Auth**: Required
- **Role**: admin, support
- **Body**:
  ```json
  {
    "name": "John Doe",
    "phone_number": "+1234567890"
  }
  ```
- **Response**: Created contact object

#### PUT /contacts/:id
Update contact.
- **Auth**: Required
- **Role**: admin, support
- **Body**: Same as POST
- **Response**: Updated contact object

#### DELETE /contacts/:id
Delete contact.
- **Auth**: Required
- **Role**: admin, support
- **Response**: Success message

---

### Groups

#### GET /groups
Get all groups with pagination.
- **Auth**: Required
- **Role**: admin, support
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
  - `search`: Search by name (optional)
- **Response**:
  ```json
  {
    "groups": [...],
    "pagination": {...}
  }
  ```

#### GET /groups/:id
Get single group with members.
- **Auth**: Required
- **Role**: admin, support
- **Response**: Group object with contact members

#### POST /groups
Create new group.
- **Auth**: Required
- **Role**: admin, support
- **Body**:
  ```json
  {
    "name": "Support Team"
  }
  ```
- **Response**: Created group object

#### PUT /groups/:id
Update group.
- **Auth**: Required
- **Role**: admin, support
- **Body**: Same as POST
- **Response**: Updated group object

#### DELETE /groups/:id
Delete group.
- **Auth**: Required
- **Role**: admin, support
- **Response**: Success message

#### POST /groups/:id/members
Add contacts to group.
- **Auth**: Required
- **Role**: admin, support
- **Body**:
  ```json
  {
    "contact_ids": [1, 2, 3]
  }
  ```
- **Response**: Updated group object

#### DELETE /groups/:id/members/:contactId
Remove contact from group.
- **Auth**: Required
- **Role**: admin, support
- **Response**: Success message

---

### Modems

#### GET /modems
Get all modems with custom names.
- **Auth**: Required
- **Role**: admin, support
- **Response**: Array of modem objects

#### GET /modems/:modem_no
Get single modem info.
- **Auth**: Required
- **Role**: admin, support
- **Response**: Modem object with status from SMSEagle

#### PUT /modems/:modem_no
Update modem custom name (admin only).
- **Auth**: Required
- **Role**: admin
- **Body**:
  ```json
  {
    "custom_name": "Office Modem"
  }
  ```
- **Response**: Updated modem object

---

### Sync

#### POST /sync/messages
Trigger manual message synchronization.
- **Auth**: Required
- **Role**: admin
- **Response**:
  ```json
  {
    "synced": {
      "inbox": 5,
      "outbox": 2,
      "sent": 10,
      "error": 0,
      "delivered": 8
    }
  }
  ```

#### GET /sync/status
Get sync status and statistics.
- **Auth**: Required
- **Role**: admin
- **Response**:
  ```json
  {
    "last_sync": "2024-01-15T10:30:00Z",
    "folders": {
      "inbox": {
        "last_synced_id": 1234,
        "last_sync_time": "2024-01-15T10:30:00Z"
      }
    }
  }
  ```

---

## Error Responses

All endpoints return consistent error format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Error Codes
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

---

## Rate Limiting
- API calls to SMSEagle are rate-limited
- Database queries are the primary data source
- Background sync runs every 2 minutes for new messages
- Pending message status updates run every 5 minutes
