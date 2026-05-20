-- 009_institutional_structure.sql
BEGIN;

-- 1. Faculties Table
CREATE TABLE IF NOT EXISTS faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  dean_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  head_of_department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(faculty_id, slug)
);

-- Seed Initial USL Structure
DO $$
DECLARE
    f_id UUID;
BEGIN
    -- Faculty of Engineering
    INSERT INTO faculties (name, slug, description) 
    VALUES ('Faculty of Engineering & Architecture', 'engineering-architecture', 'Leading faculty for technical and architectural studies.')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO f_id;
    
    INSERT INTO departments (faculty_id, name, slug) VALUES 
    (f_id, 'Department of Civil Engineering', 'civil-engineering'),
    (f_id, 'Department of Mechanical Engineering', 'mechanical-engineering'),
    (f_id, 'Department of Electrical Engineering', 'electrical-engineering')
    ON CONFLICT (faculty_id, slug) DO NOTHING;

    -- IPAM (Institute of Public Administration and Management)
    INSERT INTO faculties (name, slug, description) 
    VALUES ('IPAM - Institute of Public Admin & Management', 'ipam', 'Specialized institute for business, admin, and technology.')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO f_id;
    
    INSERT INTO departments (faculty_id, name, slug) VALUES 
    (f_id, 'Department of Information Systems', 'information-systems'),
    (f_id, 'Department of Business Administration', 'business-admin'),
    (f_id, 'Department of Accounting', 'accounting')
    ON CONFLICT (faculty_id, slug) DO NOTHING;

    -- FBC (Fourah Bay College - Arts/Social Sciences as a proxy faculty)
    INSERT INTO faculties (name, slug, description) 
    VALUES ('FBC - Faculty of Social Sciences & Law', 'fbc-social-sciences', 'Prestigious faculty for social studies and legal education.')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO f_id;
    
    INSERT INTO departments (faculty_id, name, slug) VALUES 
    (f_id, 'Department of Law', 'law'),
    (f_id, 'Department of Economics', 'economics'),
    (f_id, 'Department of Political Science', 'political-science')
    ON CONFLICT (faculty_id, slug) DO NOTHING;
END $$;

-- 3. Update Profiles and Courses to use these IDs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

COMMIT;
