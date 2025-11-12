# SMSEagle Web UI

A modern web-based user interface for managing SMS communications through SMSEagle devices.

## Features

- 📱 Send/Receive SMS and Binary SMS messages
- 💬 Conversation-based message view
- 👥 Contact and group management
- 🔧 Modem configuration (8 modems supported)
- 🔐 Auth0 authentication with role-based access control
- 🌓 Light/Dark theme support
- 📊 Message synchronization with intelligent caching
- 📄 Pagination and filtering
- 🚀 Fast and responsive UI

## Technology Stack

### Backend
- Node.js 22 LTS
- NestJS (TypeScript)
- MySQL 8.0
- Redis (Bull Queue)
- Auth0 JWT

### Frontend
- Angular 17+
- Angular Material
- Auth0 Angular SDK
- TypeScript

## Project Structure

```
simboxUI/
├── backend/          # NestJS API server
├── frontend/         # Angular application
├── docs/             # Documentation
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 22 LTS
- Docker & Docker Compose
- MySQL 8.0 (external instance or Docker)
- Redis (for background jobs)

### Environment Configuration

1. Copy `.env.example` to `.env` in both backend and frontend directories
2. Update the following variables:

**Backend `.env`:**
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=simbox_ui
DB_USER=root
DB_PASSWORD=

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-audience

# SMSEagle
SMSEAGLE_BASE_URL=http://192.168.1.100/api/v2
SMSEAGLE_ACCESS_TOKEN=your-access-token

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Frontend environment:**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  auth0: {
    domain: 'your-domain.auth0.com',
    clientId: 'your-client-id',
    audience: 'your-api-audience',
    redirectUri: window.location.origin
  }
};
```

### Local Development with Docker Compose

```bash
# Start all services (MySQL, Redis, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

### Manual Development Setup

#### Backend

```bash
cd backend
npm install
npm run migration:run  # Run database migrations
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
ng serve
```

## User Roles

- **Admin**: Full access to all features including modem configuration and settings
- **Support**: Can send/read SMS, manage contacts and groups

Roles are managed in Auth0 and sent via JWT token as a custom claim "role".

## Database Migrations

```bash
cd backend
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
```

## Testing

### Backend Tests
```bash
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm run test           # Unit tests
npm run test:headless  # Headless tests
```

## Deployment

### Docker Build

```bash
# Build backend
docker build -t simbox-backend ./backend

# Build frontend
docker build -t simbox-frontend ./frontend
```

### Kubernetes

See `k8s/` directory for Kubernetes manifests (coming soon).

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: http://localhost:3000/api/docs

## Architecture

### Message Synchronization

- Background job runs every 2 minutes to fetch new messages from SMSEagle
- Incremental sync using message IDs to minimize API calls
- Pending messages tracked during validity period
- Local database is source of truth for contacts and groups

### Contact/Group Sync

- Local database is the source of truth
- Changes in UI are pushed to SMSEagle automatically
- Manual refresh button to pull updates from SMSEagle if needed

## Contributing

This is a private project. For issues or feature requests, please contact the development team.

## License

Proprietary - All rights reserved
