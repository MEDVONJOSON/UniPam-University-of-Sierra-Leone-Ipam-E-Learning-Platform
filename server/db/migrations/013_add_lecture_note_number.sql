-- 013_add_lecture_note_number.sql
-- Adds lecture_note_number column to course_materials

BEGIN;

ALTER TABLE course_materials
  ADD COLUMN IF NOT EXISTS lecture_note_number TEXT;

COMMIT;
