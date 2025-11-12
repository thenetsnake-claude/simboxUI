# Frontend Structure - Angular Application

## Overview
Single Page Application (SPA) built with Angular, featuring responsive design and role-based access control.

## Application Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services, guards, interceptors
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── services/
│   │   │       ├── api.service.ts
│   │   │       └── websocket.service.ts (future)
│   │   │
│   │   ├── shared/                  # Shared components, pipes, directives
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── pagination/
│   │   │   │   └── confirm-dialog/
│   │   │   ├── pipes/
│   │   │   │   ├── phone-format.pipe.ts
│   │   │   │   └── time-ago.pipe.ts
│   │   │   └── models/
│   │   │       ├── message.model.ts
│   │   │       ├── contact.model.ts
│   │   │       ├── group.model.ts
│   │   │       └── user.model.ts
│   │   │
│   │   ├── features/                # Feature modules
│   │   │   ├── messages/
│   │   │   │   ├── components/
│   │   │   │   │   ├── message-list/
│   │   │   │   │   ├── message-detail/
│   │   │   │   │   ├── conversation-list/
│   │   │   │   │   ├── send-sms/
│   │   │   │   │   └── send-binary-sms/
│   │   │   │   ├── services/
│   │   │   │   │   └── message.service.ts
│   │   │   │   ├── messages-routing.module.ts
│   │   │   │   └── messages.module.ts
│   │   │   │
│   │   │   ├── contacts/
│   │   │   │   ├── components/
│   │   │   │   │   ├── contact-list/
│   │   │   │   │   ├── contact-form/
│   │   │   │   │   └── contact-detail/
│   │   │   │   ├── services/
│   │   │   │   │   └── contact.service.ts
│   │   │   │   ├── contacts-routing.module.ts
│   │   │   │   └── contacts.module.ts
│   │   │   │
│   │   │   ├── groups/
│   │   │   │   ├── components/
│   │   │   │   │   ├── group-list/
│   │   │   │   │   ├── group-form/
│   │   │   │   │   └── group-detail/
│   │   │   │   ├── services/
│   │   │   │   │   └── group.service.ts
│   │   │   │   ├── groups-routing.module.ts
│   │   │   │   └── groups.module.ts
│   │   │   │
│   │   │   ├── settings/            # Admin only
│   │   │   │   ├── components/
│   │   │   │   │   ├── modem-list/
│   │   │   │   │   ├── modem-form/
│   │   │   │   │   └── sync-status/
│   │   │   │   ├── services/
│   │   │   │   │   ├── modem.service.ts
│   │   │   │   │   └── sync.service.ts
│   │   │   │   ├── settings-routing.module.ts
│   │   │   │   └── settings.module.ts
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── components/
│   │   │       │   └── dashboard/
│   │   │       ├── dashboard-routing.module.ts
│   │   │       └── dashboard.module.ts
│   │   │
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   └── app.module.ts
│   │
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles/
│       ├── _variables.scss
│       ├── _mixins.scss
│       └── styles.scss
│
└── angular.json
```

## Routing Structure

```
/                           → Dashboard (redirect based on role)
/login                      → Login page (Auth0)
/callback                   → Auth0 callback

/messages                   → Messages module (support, admin)
  /conversations            → Conversation list view
  /conversation/:phone      → Single conversation thread
  /folders                  → Folder-based view
  /folder/:name             → Messages in specific folder
  /send                     → Send SMS form
  /send-binary              → Send binary SMS form

/contacts                   → Contacts module (support, admin)
  /list                     → Contact list
  /create                   → Create contact
  /edit/:id                 → Edit contact
  /:id                      → Contact detail

/groups                     → Groups module (support, admin)
  /list                     → Group list
  /create                   → Create group
  /edit/:id                 → Edit group
  /:id                      → Group detail with members

/settings                   → Settings module (admin only)
  /modems                   → Modem list
  /modems/:modem_no         → Edit modem name
  /sync                     → Sync status and manual trigger

/unauthorized               → Access denied page
```

## Key Components

### 1. Message Components

#### ConversationListComponent
- Displays list of conversations with latest message
- Shows unread count badge
- Click to navigate to conversation detail
- Search by phone number or contact name
- Pagination

#### ConversationDetailComponent
- Shows all messages for a specific phone number
- Grouped by date
- Messages ordered newest-first
- Send SMS inline
- Mark as read
- Auto-scroll to latest

#### MessageListComponent
- Folder-based message list view
- Filterable by folder type
- Pagination
- Search functionality
- Bulk actions (mark as read)

#### SendSmsComponent
- Form for sending SMS
- Multi-recipient selection (phone/contact/group)
- Character counter
- Encoding selector (standard/unicode)
- Date/time picker for scheduling
- Validity period selector
- Modem selector (with custom names)
- Preview before send

#### SendBinarySmsComponent
- Form for sending binary SMS
- Hex data input with validation
- Single recipient only
- Modem selector

### 2. Contact Components

#### ContactListComponent
- Paginated contact list
- Search by name or phone
- Click to view/edit
- Delete with confirmation
- Quick actions (send SMS)

#### ContactFormComponent
- Create/edit contact form
- Name and phone number fields
- Phone number validation
- Group assignment

#### ContactDetailComponent
- View contact information
- List of groups the contact belongs to
- Message history with this contact
- Quick send SMS

### 3. Group Components

#### GroupListComponent
- Paginated group list
- Search by name
- Member count display
- Click to view/edit

#### GroupFormComponent
- Create/edit group form
- Group name field
- Member selection (multi-select)

#### GroupDetailComponent
- View group information
- List of member contacts
- Add/remove members
- Send SMS to entire group

### 4. Settings Components (Admin Only)

#### ModemListComponent
- List of all modems
- Show custom name and modem number
- Status indicator (online/offline)
- Edit name action

#### ModemFormComponent
- Simple form to set custom modem name
- Modem number (readonly)
- Custom name input

#### SyncStatusComponent
- Display last sync times for each folder
- Show sync statistics
- Manual sync trigger button
- Live sync progress indicator

## State Management

### Services Pattern
Each feature has its own service that:
- Manages HTTP requests to backend API
- Caches data when appropriate
- Provides observables for components
- Handles error states

### Example: MessageService
```typescript
@Injectable({ providedIn: 'root' })
export class MessageService {
  private messagesCache$ = new BehaviorSubject<Message[]>([]);

  getMessages(params): Observable<MessagesResponse>
  getConversations(params): Observable<ConversationsResponse>
  sendSMS(data): Observable<SendResponse>
  sendBinarySMS(data): Observable<SendResponse>
  markAsRead(id): Observable<Message>
}
```

## UI Components Library

### Recommended: Angular Material
- Mature and well-maintained
- Comprehensive component set
- Good accessibility
- Responsive by default

### Key Components to Use
- MatButton, MatIconButton
- MatTable with MatPaginator
- MatFormField, MatInput, MatSelect
- MatDialog for confirmations
- MatDatepicker for scheduling
- MatChip for tags
- MatBadge for unread counts
- MatSidenav for navigation
- MatToolbar for header
- MatCard for content sections
- MatProgressSpinner for loading states

## Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column, drawer navigation)
- **Tablet**: 768px - 1024px (two columns where appropriate)
- **Desktop**: > 1024px (full multi-column layout)

### Mobile Optimizations
- Bottom navigation for primary actions
- Swipe gestures for common actions
- Collapsible sidebar
- Touch-friendly button sizes (min 44x44px)
- Optimized list views

## Authentication Flow

1. User lands on protected route
2. AuthGuard checks for valid Auth0 token
3. If no token, redirect to Auth0 login
4. Auth0 redirects back to /callback
5. Token stored in memory/localStorage
6. User profile fetched from backend
7. Role-based routing applied

## Authorization

### Role Guard
```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const userRole = this.authService.getUserRole();
    return this.checkRole(userRole, requiredRole);
  }
}
```

### Route Protection
```typescript
{
  path: 'settings',
  loadChildren: () => import('./features/settings/settings.module'),
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'admin' }
}
```

## Performance Optimizations

1. **Lazy Loading**: All feature modules lazy loaded
2. **OnPush Change Detection**: For list components
3. **Virtual Scrolling**: For large message lists
4. **Pagination**: Server-side pagination for all lists
5. **Caching**: Aggressive caching with invalidation strategy
6. **Debouncing**: Search inputs debounced (300ms)
7. **Image Optimization**: (if MMS support added later)

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in dialogs
- Screen reader friendly
- High contrast mode support
- Proper heading hierarchy
