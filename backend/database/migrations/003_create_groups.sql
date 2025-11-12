-- Create contact_groups table
CREATE TABLE IF NOT EXISTS contact_groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  smseagle_id INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_smseagle_id (smseagle_id),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create contact_group_members junction table
CREATE TABLE IF NOT EXISTS contact_group_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contact_id INT NOT NULL,
  group_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES contact_groups(id) ON DELETE CASCADE,
  UNIQUE KEY unique_contact_group (contact_id, group_id),
  INDEX idx_contact (contact_id),
  INDEX idx_group (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
