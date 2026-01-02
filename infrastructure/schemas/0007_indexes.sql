-- Performance indexes migration
-- Additional indexes for common query patterns

-- Leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_progress_ranking ON user_progress(level DESC, xp DESC);

-- Weekly activity queries (can't use WHERE with date function in SQLite index)
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);

-- Activity feed by user
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id, created_at DESC);

-- Active users query
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);

-- Public circuits discovery
CREATE INDEX IF NOT EXISTS idx_circuits_public_created ON circuits(is_public, created_at DESC);

-- Popular circuits
CREATE INDEX IF NOT EXISTS idx_circuits_public_likes ON circuits(is_public, likes DESC);
CREATE INDEX IF NOT EXISTS idx_circuits_public_plays ON circuits(is_public, plays DESC);

-- Challenge leaderboard
CREATE INDEX IF NOT EXISTS idx_challenge_completions_ranking ON challenge_completions(challenge_id, best_time_seconds ASC);

-- User's challenge completions
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_completions(user_id);

-- User's completed tutorials
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user ON tutorial_progress(user_id, completed);

-- Unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);

-- Active sessions (not expired, not revoked)
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

-- Featured challenges
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON challenges(featured, difficulty);

-- Followers/following
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Comments by circuit
CREATE INDEX IF NOT EXISTS idx_comments_circuit ON comments(circuit_id, created_at DESC);

-- User achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, unlocked_at DESC);

-- Learning path enrollments
CREATE INDEX IF NOT EXISTS idx_learning_enrollments_user ON learning_path_enrollments(user_id);

-- User streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_ranking ON user_streaks(current_streak DESC);
