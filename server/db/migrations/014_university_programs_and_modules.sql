BEGIN;

-- 1. University Programs Table (e.g., BSc Business Administration)
CREATE TABLE IF NOT EXISTS university_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  degree_level TEXT NOT NULL, -- e.g., 'BSc', 'MSc', 'Diploma'
  duration_years INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Modules Table (e.g., Introduction to Accounting)
CREATE TABLE IF NOT EXISTS university_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES university_programs(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL,
  module_name TEXT NOT NULL,
  academic_year INTEGER NOT NULL, -- 1, 2, 3, 4
  semester INTEGER NOT NULL, -- 1, 2
  credits INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, module_code)
);

-- 3. Update Profiles Table for Student Registration info
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id_number TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university_program_id UUID REFERENCES university_programs(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_academic_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_semester INTEGER;

-- Seed some initial data for IPAM
DO $$
DECLARE
    dept_is UUID;
    dept_ba UUID;
    prog_is UUID;
    prog_ba UUID;
BEGIN
    -- Get Department IDs
    SELECT id INTO dept_is FROM departments WHERE slug = 'information-systems' LIMIT 1;
    SELECT id INTO dept_ba FROM departments WHERE slug = 'business-admin' LIMIT 1;

    IF dept_is IS NOT NULL THEN
        -- Insert BSc Information Systems
        INSERT INTO university_programs (department_id, name, degree_level, duration_years)
        VALUES (dept_is, 'BSc Information Systems', 'BSc', 4)
        RETURNING id INTO prog_is;

        -- Insert Year 1, Semester 1 Modules for BSc IS
        INSERT INTO university_modules (program_id, module_code, module_name, academic_year, semester, credits) VALUES
        (prog_is, 'IS111', 'Introduction to Computer Science', 1, 1, 3),
        (prog_is, 'IS112', 'Mathematics for IT', 1, 1, 3),
        (prog_is, 'IS113', 'Communication Skills', 1, 1, 2);
    END IF;

    IF dept_ba IS NOT NULL THEN
        -- Insert BSc Business Administration
        INSERT INTO university_programs (department_id, name, degree_level, duration_years)
        VALUES (dept_ba, 'BSc Business Administration', 'BSc', 4)
        RETURNING id INTO prog_ba;

        -- Insert Year 1, Semester 1 Modules for BSc BA
        INSERT INTO university_modules (program_id, module_code, module_name, academic_year, semester, credits) VALUES
        (prog_ba, 'BA111', 'Introduction to Management', 1, 1, 3),
        (prog_ba, 'BA112', 'Business Mathematics', 1, 1, 3),
        (prog_ba, 'BA113', 'Microeconomics', 1, 1, 3);
    END IF;
END $$;

COMMIT;
