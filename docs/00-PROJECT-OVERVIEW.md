# SMSEagle Web UI - Project Overview

## Project Description
A web-based user interface for managing SMS communications through SMSEagle devices. The application provides a modern, responsive interface for sending/receiving SMS messages, managing contacts and groups, and viewing conversation history.

## Technology Stack

### Backend
- **Runtime**: Node.js 22 LTS
- **Language**: TypeScript
- **Framework**: NestJS
- **Database**: MySQL 8.0
- **Authentication**: Auth0 (JWT with custom "role" claim)
- **API Client**: Axios (for SMSEagle API communication)
- **Background Jobs**: Bull Queue + Redis

### Frontend
- **Framework**: Angular 17+
- **UI Library**: Angular Material
- **Theme**: Light/Dark theme support
- **Authentication**: Auth0 Angular SDK
- **State Management**: RxJS Services

## Key Features

### 1. Authentication & Authorization
- Auth0 integration for secure login
- Two user roles:
  - **Admins**: Full access (settings, modem configuration, SMS operations, contacts)
  - **Support**: Limited access (send/read SMS, manage contacts/groups)

### 2. SMS Operations
- Send SMS and Binary SMS to:
  - Phone numbers (direct)
  - Individual contacts
  - Contact groups
- View sent/received messages in folders:
  - Inbox
  - Outbox
  - Sent
  - Error
  - Delivered
- Conversation view grouped by phone number
- Message parameters:
  - Text content
  - Recipients (to/contacts/groups)
  - Scheduled date/time
  - Text encoding (standard/unicode)
  - Validity period (5min, 10min, 30min, 1h - default: 1h)
  - Character limit: 2000 chars with counter
  - Modem selection (by name)

### 3. Contact Management
- CRUD operations for contacts (local DB is source of truth)
- Contact properties:
  - Name
  - Phone number
- Associate contacts with groups
- Sync to SMSEagle when creating/updating contacts
- Manual refresh button to pull from SMSEagle

### 4. Group Management
- CRUD operations for contact groups (local DB is source of truth)
- Group properties:
  - Name
  - Members (contacts)
- Add/remove contacts from groups
- Sync to SMSEagle when creating/updating groups
- Manual refresh button to pull from SMSEagle

### 5. Modem Management (Admins only)
- Single SMSEagle device with up to 8 modems
- Assign custom names to modems
- Map modem numbers (1-8) to user-friendly names
- View modem status and information

### 6. Message Synchronization
- Intelligent sync system to minimize API calls
- Database storage for all messages
- Background sync service:
  - Fetch only new messages (using ID-based pagination)
  - Update status of pending messages during validity period
  - Stop tracking messages after validity expires

### 7. UI/UX Requirements
- Responsive design (mobile, tablet, desktop)
- Light/Dark theme toggle
- Fast loading and navigation
- Pagination for message lists
- Polling-based updates (every 30 seconds) with manual refresh button
- Conversation threading
- Messages ordered newest-first

## Environment Configuration
All configuration via `.env` file:
- Database credentials (external MySQL for production)
- SMSEagle API endpoint and token (full permissions)
- Auth0 credentials (domain, audience, client ID)
- Server port and other settings
- Redis connection (for background jobs)

## Deployment
- **Development**: Docker Compose (MySQL + Redis + Backend + Frontend)
- **Production**: Kubernetes deployment
- **Database**: External MySQL 8.0 (simbox_ui)

## Non-Functional Requirements
- Performance: Fast response times, efficient pagination
- Security: Secure authentication, role-based access control
- Scalability: Handle multiple concurrent users
- Reliability: Robust error handling, data consistency
- Maintainability: Clean code, TypeScript strict mode, comprehensive logging

## Out of Scope
- MMS support (focus on SMS and Binary SMS only)
- WhatsApp, Signal, or other messaging platforms
- USSD codes
- Voice calls
- Email functionality
