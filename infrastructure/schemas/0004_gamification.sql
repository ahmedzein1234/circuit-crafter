-- Gamification system migration
-- XP, levels, daily rewards, and achievement tracking

-- User progress table for XP and level tracking
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_circuits_created INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  total_wires_connected INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_progress_xp ON user_progress(xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_level ON user_progress(level DESC);

-- User achievements table (replaces old achievements table structure)
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  metadata_json TEXT,
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

-- Daily rewards tracking
CREATE TABLE IF NOT EXISTS daily_rewards (
  user_id TEXT NOT NULL,
  reward_date TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  bonus_earned INTEGER DEFAULT 0,
  claimed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, reward_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_daily_rewards_user ON daily_rewards(user_id, reward_date DESC);

-- Update user_streaks to include more fields
ALTER TABLE user_streaks ADD COLUMN streak_start_date TEXT;
ALTER TABLE user_streaks ADD COLUMN total_days_active INTEGER DEFAULT 0;
