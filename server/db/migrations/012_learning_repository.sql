-- 012_learning_repository.sql
-- Centralised Learning Materials Repository
-- Adds: course_modules, expands course_materials, saved_materials

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Course Modules  (grouping inside a course: Week 1, Topic A, Module 3 …)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_modules (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  description   TEXT,
  sort_order    INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id, sort_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Expand course_materials
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE course_materials
  ADD COLUMN IF NOT EXISTS module_id          UUID    REFERENCES course_modules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS material_category  TEXT    NOT NULL DEFAULT 'lecture_notes',
  -- Values: lecture_notes | assignment | past_exam | reading_material | reference |
  --         presentation | spreadsheet | image | recorded_lecture | other
  ADD COLUMN IF NOT EXISTS semester           TEXT,   -- e.g. "Semester 1", "First Semester"
  ADD COLUMN IF NOT EXISTS academic_year      TEXT,   -- e.g. "2024/2025"
  ADD COLUMN IF NOT EXISTS original_filename  TEXT,
  ADD COLUMN IF NOT EXISTS file_size_bytes    BIGINT,
  ADD COLUMN IF NOT EXISTS download_count     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published       BOOLEAN NOT NULL DEFAULT TRUE;

-- Add description column if it doesn't exist (may already exist from older schema)
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_course_materials_module_id    ON course_materials(module_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id    ON course_materials(course_id, is_published);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Saved (bookmarked) Materials  — student feature
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_materials (
  user_id     UUID        NOT NULL REFERENCES users(id)             ON DELETE CASCADE,
  material_id UUID        NOT NULL REFERENCES course_materials(id)  ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_materials_user_id ON saved_materials(user_id);

COMMIT;
