# Backend Structure - Node.js/TypeScript API

## Overview
RESTful API server built with Express.js and TypeScript, providing middleware between frontend and SMSEagle API.

## Application Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts           # MySQL connection config
│   │   ├── auth0.ts              # Auth0 configuration
│   │   ├── smseagle.ts           # SMSEagle API config
│   │   └── environment.ts        # Environment variables
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT validation
│   │   ├── role.middleware.ts    # Role-based access control
│   │   ├── error.middleware.ts   # Global error handler
│   │   ├── logger.middleware.ts  # Request logging
│   │   └── validation.middleware.ts # Request validation
│   │
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Contact.model.ts
│   │   ├── Group.model.ts
│   │   ├── Message.model.ts
│   │   ├── Modem.model.ts
│   │   ├── SyncState.model.ts
│   │   └── PendingMessage.model.ts
│   │
│   ├── repositories/
│   │   ├── UserRepository.ts
│   │   ├── ContactRepository.ts
│   │   ├── GroupRepository.ts
│   │   ├── MessageRepository.ts
│   │   ├── ModemRepository.ts
│   │   └── SyncStateRepository.ts
│   │
│   ├── services/
│   │   ├── auth/
│   │   │   ├── AuthService.ts    # Auth0 integration
│   │   │   └── TokenService.ts   # JWT token handling
│   │   │
│   │   ├── smseagle/
│   │   │   ├── SMSEagleClient.ts # SMSEagle API client
│   │   │   ├── MessageService.ts # Message operations
│   │   │   ├── ContactService.ts # Contact sync
│   │   │   ├── GroupService.ts   # Group sync
│   │   │   └── ModemService.ts   # Modem operations
│   │   │
│   │   ├── sync/
│   │   │   ├── SyncService.ts    # Main sync orchestrator
│   │   │   ├── MessageSyncService.ts
│   │   │   └── StatusUpdateService.ts
│   │   │
│   │   └── notification/
│   │       └── NotificationService.ts # Future: WebSocket/SSE
│   │
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── MessageController.ts
│   │   ├── ContactController.ts
│   │   ├── GroupController.ts
│   │   ├── ModemController.ts
│   │   └── SyncController.ts
│   │
│   ├── routes/
│   │   ├── index.ts              # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── message.routes.ts
│   │   ├── contact.routes.ts
│   │   ├── group.routes.ts
│   │   ├── modem.routes.ts
│   │   └── sync.routes.ts
│   │
│   ├── validators/
│   │   ├── message.validator.ts
│   │   ├── contact.validator.ts
│   │   └── group.validator.ts
│   │
│   ├── utils/
│   │   ├── logger.ts             # Winston logger
│   │   ├── errors.ts             # Custom error classes
│   │   ├── validation.ts         # Validation helpers
│   │   └── pagination.ts         # Pagination utilities
│   │
│   ├── jobs/
│   │   ├── syncMessages.job.ts   # Scheduled message sync
│   │   └── updateStatus.job.ts   # Scheduled status updates
│   │
│   ├── types/
│   │   ├── express.d.ts          # Express type extensions
│   │   ├── auth.types.ts
│   │   └── smseagle.types.ts
│   │
│   ├── database/
│   │   ├── connection.ts         # MySQL connection pool
│   │   ├── migrations/           # Database migrations
│   │   │   ├── 001_create_users.sql
│   │   │   ├── 002_create_contacts.sql
│   │   │   ├── 003_create_groups.sql
│   │   │   ├── 004_create_messages.sql
│   │   │   ├── 005_create_modems.sql
│   │   │   ├── 006_create_sync_state.sql
│   │   │   └── 007_create_pending_messages.sql
│   │   └── seeds/                # Seed data
│   │       └── 001_sync_state.sql
│   │
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── helpers/
│
├── .env.example
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Core Components

### 1. SMSEagle API Client

```typescript
// src/services/smseagle/SMSEagleClient.ts
class SMSEagleClient {
  private baseUrl: string;
  private accessToken: string;
  private axios: AxiosInstance;

  // Message operations
  async getMessages(folder: string, params?: any): Promise<Message[]>
  async sendSMS(data: SMSRequest): Promise<SMSResponse>
  async sendBinarySMS(data: BinaryRequest): Promise<SMSResponse>

  // Phonebook operations
  async getContacts(params?: any): Promise<Contact[]>
  async createContact(data: ContactRequest): Promise<Contact>
  async updateContact(id: number, data: ContactRequest): Promise<Contact>
  async deleteContact(id: number): Promise<void>

  async getGroups(params?: any): Promise<Group[]>
  async createGroup(data: GroupRequest): Promise<Group>
  async updateGroup(id: number, data: GroupRequest): Promise<Group>
  async deleteGroup(id: number): Promise<void>
  async addContactToGroup(groupId: number, contactId: number): Promise<void>
  async removeContactFromGroup(groupId: number, contactId: number): Promise<void>

  // Modem operations
  async getModemInfo(modemNo: number): Promise<ModemInfo>
}
```

### 2. Sync Service

```typescript
// src/services/sync/SyncService.ts
class SyncService {
  // Sync messages from all folders
  async syncAllMessages(): Promise<SyncResult>

  // Sync specific folder with incremental sync
  async syncFolder(folder: FolderType): Promise<number>

  // Update status of pending messages
  async updatePendingStatuses(): Promise<number>

  // Check and clean expired pending messages
  async cleanExpiredPending(): Promise<void>
}
```

```typescript
// src/services/sync/MessageSyncService.ts
class MessageSyncService {
  // Get last synced ID for folder
  private async getLastSyncedId(folder: string): Promise<number>

  // Fetch new messages since last sync
  private async fetchNewMessages(folder: string, fromId: number): Promise<Message[]>

  // Save messages to database
  private async saveMessages(messages: Message[]): Promise<void>

  // Update sync state
  private async updateSyncState(folder: string, lastId: number): Promise<void>

  // Add to pending messages if needed
  private async trackPendingMessage(message: Message): Promise<void>
}
```

### 3. Repository Pattern

```typescript
// Example: src/repositories/MessageRepository.ts
class MessageRepository {
  async findAll(filter: MessageFilter, pagination: Pagination): Promise<[Message[], number]>
  async findById(id: number): Promise<Message | null>
  async findByPhone(phone: string, pagination: Pagination): Promise<[Message[], number]>
  async findByFolder(folder: string, pagination: Pagination): Promise<[Message[], number]>
  async getConversations(pagination: Pagination): Promise<Conversation[]>
  async create(message: Message): Promise<Message>
  async update(id: number, data: Partial<Message>): Promise<Message>
  async markAsRead(id: number): Promise<void>
  async findBySMSEagleId(smseagleId: number): Promise<Message | null>
}
```

### 4. Authentication Middleware

```typescript
// src/middleware/auth.middleware.ts
import { auth } from 'express-oauth2-jwt-bearer';

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

export const attachUser = async (req, res, next) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await UserRepository.findByAuth0Id(auth0Id);

    if (!user) {
      // Create user from Auth0 token claims
      const newUser = await UserRepository.create({
        auth0_id: auth0Id,
        email: req.auth.email,
        name: req.auth.name,
        role: determineRole(req.auth) // From Auth0 groups/roles
      });
      req.user = newUser;
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    next(error);
  }
};
```

### 5. Role-Based Access Control

```typescript
// src/middleware/role.middleware.ts
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

// Usage in routes:
router.put('/modems/:modem_no', requireRole('admin'), ModemController.update);
```

### 6. Background Jobs

```typescript
// src/jobs/syncMessages.job.ts
import cron from 'node-cron';

// Run every 2 minutes
export const scheduleSyncJob = () => {
  cron.schedule('*/2 * * * *', async () => {
    try {
      logger.info('Starting scheduled message sync...');
      const result = await SyncService.syncAllMessages();
      logger.info('Sync completed', result);
    } catch (error) {
      logger.error('Sync failed', error);
    }
  });
};
```

```typescript
// src/jobs/updateStatus.job.ts
// Run every 5 minutes
export const scheduleStatusUpdateJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('Starting status update...');
      const updated = await SyncService.updatePendingStatuses();
      logger.info(`Updated ${updated} pending messages`);

      // Clean expired
      await SyncService.cleanExpiredPending();
    } catch (error) {
      logger.error('Status update failed', error);
    }
  });
};
```

## Database Access

### Connection Pool
```typescript
// src/database/connection.ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Migrations
Run migrations in order on application startup or via CLI:
```bash
npm run migrate
```

## Error Handling

### Custom Error Classes
```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(422, message, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}
```

### Global Error Middleware
```typescript
// src/middleware/error.middleware.ts
export const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  // Unknown errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

## Logging

```typescript
// src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smseagle_ui
DB_USER=root
DB_PASSWORD=

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://your-api-audience
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# SMSEagle
SMSEAGLE_BASE_URL=http://192.168.1.100/api/v2
SMSEAGLE_ACCESS_TOKEN=your-access-token

# Sync Settings
SYNC_INTERVAL_MINUTES=2
STATUS_UPDATE_INTERVAL_MINUTES=5

# Logging
LOG_LEVEL=info
```

## Validation

Using Joi for request validation:

```typescript
// src/validators/message.validator.ts
import Joi from 'joi';

export const sendSMSSchema = Joi.object({
  to: Joi.array().items(Joi.string().pattern(/^\+?[0-9]{10,15}$/)),
  contacts: Joi.array().items(Joi.number().integer().positive()),
  groups: Joi.array().items(Joi.number().integer().positive()),
  text: Joi.string().required().max(1000),
  date: Joi.date().iso().optional(),
  encoding: Joi.string().valid('standard', 'unicode').default('standard'),
  validity: Joi.string().valid('5m', '10m', '30m', '1h').optional(),
  modem_no: Joi.number().integer().min(1).max(8).optional()
}).or('to', 'contacts', 'groups');
```

## Testing Strategy

- **Unit Tests**: Services, repositories, utilities
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user flows

```json
// package.json scripts
{
  "test": "jest",
  "test:unit": "jest --testPathPattern=tests/unit",
  "test:integration": "jest --testPathPattern=tests/integration",
  "test:coverage": "jest --coverage"
}
```
