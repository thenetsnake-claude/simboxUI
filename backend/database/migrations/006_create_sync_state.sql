-- Create sync_state table
CREATE TABLE IF NOT EXISTS sync_state (
  id INT PRIMARY KEY AUTO_INCREMENT,
  folder ENUM('inbox', 'outbox', 'sent', 'error', 'delivered') NOT NULL,
  last_synced_id INT NOT NULL DEFAULT 0,
  last_sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_folder (folder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial sync state for all folders
INSERT INTO sync_state (folder, last_synced_id) VALUES
  ('inbox', 0),
  ('outbox', 0),
  ('sent', 0),
  ('error', 0),
  ('delivered', 0)
ON DUPLICATE KEY UPDATE folder=folder;
