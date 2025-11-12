# Database Schema

## Overview
MySQL database schema for storing messages, contacts, groups, modem configurations, and sync state.

## Tables

### 1. users
Stores user information synced from Auth0.
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  auth0_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role ENUM('admin', 'support') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_auth0_id (auth0_id)
);
```

### 2. contacts
Stores phonebook contacts.
```sql
CREATE TABLE contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  smseagle_id INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_phone (phone_number),
  INDEX idx_smseagle_id (smseagle_id)
);
```

### 3. contact_groups
Stores contact groups.
```sql
CREATE TABLE contact_groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  smseagle_id INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_smseagle_id (smseagle_id)
);
```

### 4. contact_group_members
Many-to-many relationship between contacts and groups.
```sql
CREATE TABLE contact_group_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contact_id INT NOT NULL,
  group_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES contact_groups(id) ON DELETE CASCADE,
  UNIQUE KEY unique_contact_group (contact_id, group_id),
  INDEX idx_contact (contact_id),
  INDEX idx_group (group_id)
);
```

### 5. modems
Stores modem configurations with custom names.
```sql
CREATE TABLE modems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  modem_no INT UNIQUE NOT NULL,
  custom_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_modem_no (modem_no)
);
```

### 6. messages
Stores all SMS messages (sent and received).
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  smseagle_id INT UNIQUE NOT NULL,
  folder ENUM('inbox', 'outbox', 'sent', 'error', 'delivered') NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  text TEXT,
  text_binary TEXT,
  encoding VARCHAR(20),
  modem_no INT,
  sender_name VARCHAR(255),
  status VARCHAR(50),
  error_code INT,
  oid VARCHAR(255),
  validity VARCHAR(20),
  processed BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  insert_date TIMESTAMP,
  update_date TIMESTAMP,
  receive_date TIMESTAMP,
  delivery_date TIMESTAMP,
  sending_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_smseagle_id (smseagle_id),
  INDEX idx_folder (folder),
  INDEX idx_phone (phone_number),
  INDEX idx_modem (modem_no),
  INDEX idx_receive_date (receive_date),
  INDEX idx_sending_date (sending_date),
  INDEX idx_folder_phone (folder, phone_number)
);
```

### 7. sync_state
Tracks synchronization state to avoid fetching all messages.
```sql
CREATE TABLE sync_state (
  id INT PRIMARY KEY AUTO_INCREMENT,
  folder ENUM('inbox', 'outbox', 'sent', 'error', 'delivered') NOT NULL,
  last_synced_id INT NOT NULL DEFAULT 0,
  last_sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_folder (folder)
);
```

### 8. pending_messages
Tracks messages that need status updates during validity period.
```sql
CREATE TABLE pending_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  smseagle_id INT NOT NULL,
  validity_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  INDEX idx_validity_expires (validity_expires_at),
  INDEX idx_smseagle_id (smseagle_id)
);
```

## Initial Data

### Sync State Initialization
```sql
INSERT INTO sync_state (folder, last_synced_id) VALUES
  ('inbox', 0),
  ('outbox', 0),
  ('sent', 0),
  ('error', 0),
  ('delivered', 0);
```

## Relationships

1. **users → contacts**: One-to-many (user creates multiple contacts)
2. **users → contact_groups**: One-to-many (user creates multiple groups)
3. **contacts ↔ contact_groups**: Many-to-many (via contact_group_members)
4. **messages → modems**: Many-to-one (messages sent via modems)
5. **messages → pending_messages**: One-to-one (for tracking updates)

## Indexing Strategy

Indexes are created on:
- Foreign keys for join performance
- Frequently queried columns (phone_number, folder, dates)
- Composite indexes for common query patterns (folder + phone_number)

## Notes

1. `smseagle_id` columns store the ID from SMSEagle API
2. Local `id` columns are auto-incremented primary keys
3. All timestamps are stored in UTC
4. `validity_expires_at` in pending_messages is calculated when message is sent
5. Phone numbers stored as strings to preserve formatting
