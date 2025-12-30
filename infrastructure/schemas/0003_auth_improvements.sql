-- Auth improvements migration
-- Adds columns for JWT refresh tokens and account security

-- Add refresh token storage for JWT
ALTER TABLE users ADD COLUMN refresh_token_hash TEXT;

-- Add failed login tracking for rate limiting
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;

-- Add account lockout support
ALTER TABLE users ADD COLUMN locked_until TEXT;

-- Add email verification status
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;

-- Create sessions table for token management
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  revoked INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(refresh_token_hash);
