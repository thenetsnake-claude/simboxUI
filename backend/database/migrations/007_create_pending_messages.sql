-- Create pending_messages table
CREATE TABLE IF NOT EXISTS pending_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  smseagle_id INT NOT NULL,
  validity_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  INDEX idx_validity_expires (validity_expires_at),
  INDEX idx_smseagle_id (smseagle_id),
  INDEX idx_message_id (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
