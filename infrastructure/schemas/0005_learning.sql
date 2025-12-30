-- Learning system migration
-- Tutorial progress, learning paths, certificates

-- Tutorial progress tracking
CREATE TABLE IF NOT EXISTS tutorial_progress (
  user_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  rating TEXT CHECK(rating IN ('bronze', 'silver', 'gold')),
  time_seconds REAL,
  attempts INTEGER DEFAULT 1,
  hints_used INTEGER DEFAULT 0,
  completed_at TEXT,
  PRIMARY KEY (user_id, chapter_id, level_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user ON tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_chapter ON tutorial_progress(user_id, chapter_id);

-- Learning path enrollments
CREATE TABLE IF NOT EXISTS learning_path_enrollments (
  user_id TEXT NOT NULL,
  path_id TEXT NOT NULL,
  enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  completed_at TEXT,
  certificate_id TEXT,
  PRIMARY KEY (user_id, path_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learning_enrollments_user ON learning_path_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_enrollments_path ON learning_path_enrollments(path_id);

-- Module completions within learning paths
CREATE TABLE IF NOT EXISTS module_completions (
  user_id TEXT NOT NULL,
  path_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  score INTEGER,
  PRIMARY KEY (user_id, path_id, module_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_module_completions_user ON module_completions(user_id, path_id);

-- Skill mastery tracking
CREATE TABLE IF NOT EXISTS skill_mastery (
  user_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0 CHECK(mastery_level BETWEEN 0 AND 100),
  last_practiced TEXT,
  practice_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, skill_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_skill_mastery_user ON skill_mastery(user_id);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  path_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  issued_at TEXT DEFAULT CURRENT_TIMESTAMP,
  verification_code TEXT UNIQUE NOT NULL,
  metadata_json TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification ON certificates(verification_code);
