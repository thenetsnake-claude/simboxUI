# Validated Requirements

This document contains the finalized requirements after user validation.

## User Responses Summary

### 1. Auth0 Configuration ✅
- Auth0 tenant exists
- Groups are sent in JWT as custom claim **"role"** in the token
- Possible values: "admin" or "support"

### 2. SMSEagle Setup ✅
- Single SMSEagle device with **8 modems**
- Endpoint and token provided via `.env` file
- API access token has full permissions

### 3. Database ✅
- **MySQL 8.0**
- External instance (hostname, user, password in `.env`) for production
- Docker Compose for local development
- Raw SQL migration files
- **Database name: `simbox_ui`**

### 4. Contact & Group Sync ✅
- **Sync direction: UI → SMSEagle ONLY**
- **Local DB is single source of truth**
- When creating/updating contacts or groups in UI, push to SMSEagle
- Manual refresh button to pull from SMSEagle if needed

### 5. Message Validity ✅
- Options: **5min, 10min, 30min, 1h**
- **Default: 1h**

### 6. Binary SMS ✅
- Simple hex input field with validation (as assumed)

### 7. Message View ✅
- Conversation view as primary interface (as assumed)
- Folder view as secondary option

### 8. Pagination ✅
- Traditional pagination (as assumed)
- Page sizes: 25, 50, 100

### 9. Real-time Updates ✅
- Polling every 30 seconds (as assumed)
- **Manual refresh button added**
- Background sync: every 2 minutes server-side

### 10. Modem Naming ✅
- Display format: "{custom_name} ({modem_no})" (as assumed)
- Fallback: "Modem {modem_no}"

### 11. Initial Message Load ✅
- Fetch last 7 days on cold start (as assumed)

### 12. SMS Character Limits ✅
- Show character counter
- **Hard limit: 2000 characters**
- Show multi-part SMS warnings

### 13. User Management ✅
- Users managed in Auth0 only (as assumed)

### 14. Error Handling ✅
- Toast notifications for errors (as assumed)
- Failed messages in error folder
- Manual retry option

### 15. Search & Filtering ✅
- Messages: Filter by folder, date range, phone number
- Contacts: Search by name or phone
- Groups: Search by name
- **No full-text search on message content**

### 16. Time Zones ✅
- Store in UTC, display in user's browser timezone (as assumed)

### 17. Project Structure ✅
- Monorepo with `/backend` and `/frontend` folders (as assumed)

### 18. Deployment ✅
- **Docker-based deployment**
- **Kubernetes for production**
- Docker Compose for local development

### 19. Security ✅
- No additional security requirements (managed externally)

### 20. Testing ✅
- Unit tests, integration tests (as assumed)

---

## Additional Requirements

### Backend Framework
- **Node.js 22 LTS**
- **NestJS framework** (instead of Express.js)
- TypeScript strict mode
- Bull Queue + Redis for background jobs

### Frontend Theme
- **Light/Dark theme support must be implemented**
- Theme toggle in UI
- Persistent theme preference

---

## Final Technology Stack

### Backend
- Node.js 22 LTS
- NestJS (TypeScript)
- MySQL 8.0
- Redis (for Bull Queue)
- Auth0 JWT authentication
- Axios (SMSEagle API client)

### Frontend
- Angular 17+
- Angular Material
- Light/Dark theme support
- Auth0 Angular SDK
- RxJS for state management

### Infrastructure
- Docker Compose (local dev)
- Kubernetes (production)
- External MySQL instance (production)
- Redis for job queue

---

## Key Decisions

1. **Local DB is source of truth** for contacts/groups
   - UI changes push to SMSEagle
   - Manual refresh pulls from SMSEagle

2. **Single SMSEagle device** with up to 8 modems
   - Each modem can have a custom name

3. **NestJS** chosen for backend
   - Better structure for enterprise applications
   - Built-in dependency injection
   - Decorators for routes and validation
   - Better TypeScript support

4. **Polling-based updates** with manual refresh
   - Simpler implementation
   - Less resource intensive
   - Good enough for use case

5. **Character limit: 2000 chars**
   - Allows for longer messages
   - Still shows multi-part warnings

6. **Validity default: 1h**
   - Most messages should be delivered within an hour
   - Users can choose shorter periods if needed
