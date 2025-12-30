-- Performance indexes migration
-- Additional indexes for common query patterns

-- Leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_progress_ranking ON user_progress(level DESC, xp DESC);

-- Weekly activity queries
CREATE INDEX IF NOT EXISTS idx_activity_weekly ON activity_feed(created_at)
  WHERE created_at >= date('now', '-7 days');

-- Active users query
CREATE INDEX IF NOT EXISTS idx_users_active ON users(last_login DESC)
  WHERE last_login IS NOT NULL;

-- Public circuits discovery
CREATE INDEX IF NOT EXISTS idx_circuits_discover ON circuits(is_public, created_at DESC)
  WHERE is_public = 1;

-- Popular circuits
CREATE INDEX IF NOT EXISTS idx_circuits_popular ON circuits(is_public, likes DESC, plays DESC)
  WHERE is_public = 1;

-- Challenge leaderboard
CREATE INDEX IF NOT EXISTS idx_progress_leaderboard ON progress(challenge_id, best_time_seconds ASC)
  WHERE completed = 1;

-- User's completed tutorials
CREATE INDEX IF NOT EXISTS idx_tutorial_completed ON tutorial_progress(user_id)
  WHERE completed = 1;

-- Unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, created_at DESC)
  WHERE read = 0;

-- Active sessions (not expired, not revoked)
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(user_id, expires_at)
  WHERE revoked = 0;

-- Featured challenges
CREATE INDEX IF NOT EXISTS idx_challenges_featured_active ON challenges(featured, difficulty)
  WHERE featured = 1;
