-- MySQL initialization script for calme2me
-- This script is executed automatically when the MySQL container starts

-- Create calme2me database
CREATE DATABASE IF NOT EXISTS calme2me_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'calme2me'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON calme2me_dev.* TO 'calme2me'@'%';
FLUSH PRIVILEGES;

-- Switch to database
USE calme2me_dev;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX email_idx (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cache (
  key VARCHAR(255) UNIQUE PRIMARY KEY,
  value LONGTEXT NOT NULL,
  expiration INT NOT NULL,
  INDEX expiration_idx (expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  queue VARCHAR(255) NOT NULL,
  payload LONGTEXT NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  reserved_at INT UNSIGNED,
  available_at INT UNSIGNED NOT NULL,
  created_at INT UNSIGNED NOT NULL,
  INDEX queue_idx (queue),
  INDEX available_at_idx (available_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS problems (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  pseudo VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'new',
  comments_count INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX uuid_idx (uuid),
  INDEX is_public_idx (is_public),
  INDEX created_at_idx (created_at),
  INDEX status_idx (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  problem_id BIGINT UNSIGNED NOT NULL,
  pseudo VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  reactions_count INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  INDEX problem_id_idx (problem_id),
  INDEX created_at_idx (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS problem_reactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  problem_id BIGINT UNSIGNED NOT NULL,
  pseudo VARCHAR(255) NOT NULL,
  reaction VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  UNIQUE KEY unique_problem_reaction (problem_id, pseudo),
  INDEX problem_id_idx (problem_id),
  INDEX reaction_idx (reaction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_reactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  comment_id BIGINT UNSIGNED NOT NULL,
  pseudo VARCHAR(255) NOT NULL,
  reaction VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_comment_reaction (comment_id, pseudo),
  INDEX comment_id_idx (comment_id),
  INDEX reaction_idx (reaction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS personal_access_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(80) UNIQUE NOT NULL,
  abilities LONGTEXT,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX tokenable_type_tokenable_id_idx (tokenable_type, tokenable_id),
  INDEX token_idx (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
