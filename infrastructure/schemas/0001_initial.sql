-- Circuit Crafter Database Schema
-- Initial migration

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  wallet_address TEXT UNIQUE,
  avatar_url TEXT,
  reputation_score INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'pro', 'premium')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT,
  settings_json TEXT DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);

-- Circuits table
CREATE TABLE IF NOT EXISTS circuits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  blueprint_json TEXT NOT NULL,
  thumbnail_url TEXT,
  is_public INTEGER DEFAULT 0,
  is_template INTEGER DEFAULT 0,
  fork_of TEXT,
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (fork_of) REFERENCES circuits(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_circuits_user ON circuits(user_id);
CREATE INDEX IF NOT EXISTS idx_circuits_public ON circuits(is_public);
CREATE INDEX IF NOT EXISTS idx_circuits_template ON circuits(is_template);
CREATE INDEX IF NOT EXISTS idx_circuits_created ON circuits(created_at);
CREATE INDEX IF NOT EXISTS idx_circuits_likes ON circuits(likes);
CREATE INDEX IF NOT EXISTS idx_circuits_plays ON circuits(plays);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  circuit_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  constraints_json TEXT,
  target_json TEXT NOT NULL,
  hints_json TEXT,
  time_limit_seconds INTEGER,
  plays INTEGER DEFAULT 0,
  solves INTEGER DEFAULT 0,
  avg_solve_time_seconds REAL,
  featured INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (circuit_id) REFERENCES circuits(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_challenges_creator ON challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON challenges(featured);
CREATE INDEX IF NOT EXISTS idx_challenges_plays ON challenges(plays);

-- Progress tracking table
CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  best_time_seconds REAL,
  attempts INTEGER DEFAULT 0,
  solution_circuit_id TEXT,
  rating TEXT CHECK(rating IN ('bronze', 'silver', 'gold')),
  completed_at TEXT,
  PRIMARY KEY (user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  FOREIGN KEY (solution_circuit_id) REFERENCES circuits(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON progress(completed);
CREATE INDEX IF NOT EXISTS idx_progress_rating ON progress(rating);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  metadata_json TEXT,
  nft_token_id TEXT,
  earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_achievements_unique ON achievements(user_id, achievement_type);

-- Circuit likes table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS circuit_likes (
  user_id TEXT NOT NULL,
  circuit_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, circuit_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (circuit_id) REFERENCES circuits(id) ON DELETE CASCADE
);

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  date TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  participants INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leaderboard cache table (for faster queries)
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('weekly', 'monthly', 'alltime')),
  data_json TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
