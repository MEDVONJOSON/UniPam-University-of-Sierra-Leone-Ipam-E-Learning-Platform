-- 015_messages_and_assessments.sql
-- Creates 4 missing tables: messages, assessments, assessment_questions, assessment_attempts
-- These tables are defined in schema.prisma but were never migrated to the database.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Messages (Lecturer ↔ Student communication hub)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_name    TEXT        NOT NULL,
  from_role    TEXT        NOT NULL,
  to_user_id   TEXT        NOT NULL,        -- UUID or special values like "all", "all_students"
  to_name      TEXT        NOT NULL,
  course_id    TEXT,                         -- optional course reference (text to allow null/general)
  course_title TEXT,
  subject      TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  category     TEXT        NOT NULL DEFAULT 'general',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user   ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created   ON messages(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Assessments (Lecturer-created assessments per course)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  description      TEXT,
  opens_at         TIMESTAMPTZ,
  closes_at        TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_by       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_course_id  ON assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_by ON assessments(created_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Assessment Questions (Multiple-choice questions for each assessment)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_questions (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID    NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT    NOT NULL,
  options       TEXT    NOT NULL DEFAULT '[]',   -- JSON stringified array of option strings
  correct_index INTEGER NOT NULL,
  points        INTEGER NOT NULL DEFAULT 1,
  order_index   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment ON assessment_questions(assessment_id, order_index);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Assessment Attempts (Student submissions / scores)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID        NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers       TEXT        NOT NULL DEFAULT '[]',   -- JSON stringified array of answers
  score         INTEGER     NOT NULL,
  max_score     INTEGER     NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assessment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment ON assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user       ON assessment_attempts(user_id);

COMMIT;
