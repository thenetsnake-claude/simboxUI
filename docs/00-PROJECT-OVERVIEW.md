# SMSEagle Web UI - Project Overview

## Project Description
A web-based user interface for managing SMS communications through SMSEagle devices. The application provides a modern, responsive interface for sending/receiving SMS messages, managing contacts and groups, and viewing conversation history.

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: Auth0
- **API Client**: Axios (for SMSEagle API communication)

### Frontend
- **Framework**: Angular (latest stable version)
- **UI Library**: Angular Material or PrimeNG
- **Authentication**: Auth0 Angular SDK
- **State Management**: RxJS / NgRx (to be decided)

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
  - Validity period (up to 1 hour)
  - Modem selection (by name)

### 3. Contact Management
- CRUD operations for contacts
- Contact properties:
  - Name
  - Phone number
- Associate contacts with groups

### 4. Group Management
- CRUD operations for contact groups
- Group properties:
  - Name
  - Members (contacts)
- Add/remove contacts from groups

### 5. Modem Management (Admins only)
- Assign custom names to modems
- Map modem numbers to user-friendly names

### 6. Message Synchronization
- Intelligent sync system to minimize API calls
- Database storage for all messages
- Background sync service:
  - Fetch only new messages (using ID-based pagination)
  - Update status of pending messages during validity period
  - Stop tracking messages after validity expires

### 7. UI/UX Requirements
- Responsive design (mobile, tablet, desktop)
- Fast loading and navigation
- Pagination for message lists
- Real-time or near real-time updates
- Conversation threading
- Messages ordered newest-first

## Environment Configuration
All configuration via `.env` file:
- Database credentials
- SMSEagle API endpoint and token
- Auth0 credentials
- Server port and other settings

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
