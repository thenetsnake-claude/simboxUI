# Questions and Assumptions

This document outlines questions that need clarification and assumptions made during the requirements phase.

---

## Critical Questions

### 1. Auth0 Configuration
**Q**: Do you already have an Auth0 tenant configured, or should I include setup instructions?
**Q**: How are the two groups (admins & support) configured in Auth0? Are they:
  - Auth0 Roles?
  - Auth0 Groups (via rules/actions)?
  - Custom claims in the JWT?

**Assumptions**:
- Auth0 tenant exists
- Groups/roles are passed in JWT token as custom claims
- Format: `token.permissions` or `token.roles` array containing "admin" or "support"

---

### 2. SMSEagle API Access
**Q**: Do you have an SMSEagle device/API endpoint ready for testing?
**Q**: Should the application support multiple SMSEagle devices, or just one?
**Q**: What's the expected API token format - is it already generated?

**Assumptions**:
- Single SMSEagle device
- API endpoint and token will be provided via `.env` file
- Token has full API access permissions

---

### 3. Database
**Q**: Should I include Docker configuration for MySQL, or will you provide a MySQL instance?
**Q**: What MySQL version should be targeted (5.7, 8.0)?
**Q**: Do you need database migration scripts or just the schema?

**Assumptions**:
- MySQL 8.0 will be used
- Docker Compose will be provided for local development
- Migrations will be handled via raw SQL files (no ORM migrations)
- Database name: `smseagle_ui`

---

### 4. Contact & Group Sync
**Q**: Should contacts and groups be synced FROM SMSEagle to our DB, or managed independently?
**Q**: If a contact is created in our UI, should it also be created in SMSEagle phonebook?
**Q**: Should there be a "sync" button to pull contacts/groups from SMSEagle?

**Assumptions**:
- **Two-way sync**: Contacts/groups created in UI are pushed to SMSEagle
- Contacts/groups from SMSEagle are synced to local DB on first load
- Manual "refresh" button in UI to re-sync from SMSEagle
- Local DB is the source of truth for UI display
- `smseagle_id` field links local records to SMSEagle records

---

### 5. Message Validity
**Q**: The requirement says "validity up to 1h", but SMSEagle API supports longer periods (up to 4 weeks). Should we:
  - Only allow up to 1h in the UI?
  - Allow all SMSEagle validity options but default to 1h?

**Assumptions**:
- UI will offer: 5m, 10m, 30m, 1h options only
- Default validity: 30 minutes
- This matches the "validity up to 1h" requirement

---

### 6. Binary SMS
**Q**: What's the expected use case for Binary SMS? Should we provide:
  - Free-form hex input field?
  - Predefined templates?
  - File upload that converts to hex?

**Assumptions**:
- Simple hex input field with validation
- Manual entry by advanced users
- No file upload initially (can be added later)
- Validation: Must be valid hexadecimal string

---

### 7. Message Folders & Status
**Q**: Should the UI show messages in multiple folders simultaneously, or require folder selection?
**Q**: Should "Conversations" view merge messages from all folders for a given number?

**Assumptions**:
- **Folder View**: User selects a folder (inbox, sent, etc.) and sees those messages
- **Conversation View**: Merges messages from ALL folders for a phone number, showing full bidirectional conversation
- Conversation view is the default/primary view
- Folder view is secondary/advanced view

---

### 8. Pagination
**Q**: What page size is preferred for message lists?
**Q**: Should we implement infinite scroll or traditional pagination?

**Assumptions**:
- Traditional pagination with page numbers
- Default page size: 50 messages
- Configurable via UI dropdown: 25, 50, 100
- Conversations list: 20 per page

---

### 9. Real-time Updates
**Q**: Do you want real-time updates (WebSocket/SSE) or is periodic polling acceptable?
**Q**: How important is it to see new messages instantly?

**Assumptions**:
- **Phase 1**: Polling every 30 seconds for new messages (frontend)
- **Phase 2** (future): Implement WebSocket for real-time push
- Background sync runs every 2 minutes server-side
- Users can manually refresh

---

### 10. Modem Naming
**Q**: Should the modem custom name be used everywhere instead of modem_no?
**Q**: What if no custom name is set?

**Assumptions**:
- If custom name exists: Display "Office Modem (1)"
- If no custom name: Display "Modem 1"
- Format: `{custom_name} ({modem_no})`
- Admins can set/edit custom names
- Support users see the names but can't change them

---

### 11. Initial Message Load
**Q**: On first application start (cold start), should we:
  - Fetch ALL historical messages from SMSEagle?
  - Fetch only recent messages (e.g., last 7 days)?
  - Start fresh and only track new messages?

**Assumptions**:
- Fetch messages from last 7 days on cold start
- This prevents overwhelming the system with potentially thousands of old messages
- Configurable via environment variable: `INITIAL_SYNC_DAYS=7`

---

### 12. SMS Character Limits
**Q**: Should the UI enforce SMS length limits (160 chars standard, 70 unicode)?
**Q**: Should we show multi-part SMS warnings?

**Assumptions**:
- Show character counter
- Standard encoding: 160 chars = 1 SMS, 306 = 2 SMS, etc.
- Unicode encoding: 70 chars = 1 SMS, 134 = 2 SMS, etc.
- Warning when message will be split
- No hard limit (allow multi-part messages)

---

### 13. User Management
**Q**: Can users be created/managed in the UI, or only through Auth0?
**Q**: Can admins change user roles in the UI?

**Assumptions**:
- Users are managed in Auth0 only
- No user management UI in the application
- Roles/groups assigned in Auth0
- Application reads roles from Auth0 JWT token

---

### 14. Error Handling
**Q**: When SMS send fails, how should we notify the user?
**Q**: Should failed messages be retryable?

**Assumptions**:
- Show error toast/notification immediately
- Failed messages appear in "error" folder
- Display error code and description
- Manual retry option available for failed messages

---

### 15. Search & Filtering
**Q**: What search capabilities are needed?
  - Search messages by text content?
  - Filter by date range?
  - Search contacts by name/phone?

**Assumptions**:
- **Messages**: Filter by folder, date range, phone number
- **Contacts**: Search by name or phone number
- **Groups**: Search by name
- Full-text search on message content (future enhancement)

---

### 16. Time Zones
**Q**: Should times be displayed in user's local timezone or server timezone?
**Q**: Does SMSEagle return timestamps in UTC?

**Assumptions**:
- Store all timestamps in UTC in database
- Display times in user's browser timezone
- Use ISO 8601 format for date/time inputs
- Show relative times ("2 minutes ago") for recent messages

---

### 17. File Structure
**Q**: Should backend and frontend be in:
  - Same repository (monorepo)?
  - Separate repositories?
  - Separate folders in same repo?

**Assumptions**:
- **Monorepo structure**: Single repository with two folders
  - `/backend` - Node.js/TypeScript API
  - `/frontend` - Angular application
  - `/docs` - Documentation
  - Root level: Docker Compose, README

---

### 18. Deployment
**Q**: What's the target deployment environment?
  - Docker containers?
  - Traditional VPS?
  - Cloud platform (AWS, Azure, GCP)?

**Assumptions**:
- Docker-based deployment
- Separate containers for: backend, frontend (nginx), mysql
- Docker Compose for orchestration
- Environment variables for configuration

---

### 19. Security
**Q**: Besides Auth0, any other security requirements?
  - HTTPS required?
  - Rate limiting?
  - CORS configuration?

**Assumptions**:
- HTTPS in production (via reverse proxy like nginx)
- CORS configured to allow frontend domain
- Rate limiting on API endpoints
- SQL injection protection via parameterized queries
- XSS protection via Angular sanitization

---

### 20. Testing
**Q**: What level of test coverage is expected?
  - Unit tests only?
  - Integration tests?
  - E2E tests?

**Assumptions**:
- Unit tests for services and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows (future)
- Minimum 60% code coverage target

---

## Assumptions Summary

### Functional Assumptions
1. ✅ Single SMSEagle device
2. ✅ Two-way sync for contacts/groups
3. ✅ Conversation view as primary interface
4. ✅ Validity limited to 1h max
5. ✅ Traditional pagination (not infinite scroll)
6. ✅ Polling-based updates (no WebSocket initially)
7. ✅ Last 7 days on cold start
8. ✅ Users managed in Auth0 only

### Technical Assumptions
1. ✅ MySQL 8.0
2. ✅ Node.js 18+ LTS
3. ✅ Angular 17+ (latest stable)
4. ✅ TypeScript strict mode
5. ✅ Docker-based deployment
6. ✅ Monorepo structure
7. ✅ Auth0 for authentication
8. ✅ Express.js for backend

### Design Assumptions
1. ✅ Angular Material for UI components
2. ✅ Responsive design (mobile-first)
3. ✅ Dark/light theme support (future)
4. ✅ Accessibility (WCAG 2.1 AA)

---

## Next Steps

**Please review the above questions and assumptions.**

For each question, please provide:
- ✅ Confirmation if assumption is correct
- ❌ Correction if assumption is wrong
- 💬 Additional context if needed

Once assumptions are validated, I'll proceed with:
1. Setting up the project structure
2. Implementing the backend
3. Implementing the frontend
4. Testing and deployment configuration
