-- Social features migration
-- Comments, follows, activity feed

-- Comments on circuits
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  circuit_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  parent_id TEXT,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (circuit_id) REFERENCES circuits(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_circuit ON comments(circuit_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- Comment reports for moderation
CREATE TABLE IF NOT EXISTS comment_reports (
  id TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports(status);

-- User follows
CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK(activity_type IN (
    'circuit_created',
    'circuit_forked',
    'circuit_liked',
    'challenge_completed',
    'achievement_unlocked',
    'level_up',
    'streak_milestone',
    'certificate_earned',
    'followed_user'
  )),
  target_id TEXT,
  target_type TEXT,
  metadata_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(created_at DESC);

-- Add follower/following counts to users (denormalized for performance)
ALTER TABLE users ADD COLUMN followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN following_count INTEGER DEFAULT 0;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN (
    'new_follower',
    'circuit_liked',
    'circuit_forked',
    'comment_received',
    'comment_reply',
    'achievement_unlocked',
    'daily_reminder',
    'streak_at_risk'
  )),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
