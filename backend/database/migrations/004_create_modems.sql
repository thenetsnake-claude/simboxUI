-- Create modems table
CREATE TABLE IF NOT EXISTS modems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  modem_no INT UNIQUE NOT NULL CHECK (modem_no >= 1 AND modem_no <= 8),
  custom_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_modem_no (modem_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
