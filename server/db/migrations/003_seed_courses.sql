BEGIN;

INSERT INTO courses (
  provider_id,
  external_id,
  title,
  category,
  skill_level,
  duration_label,
  has_certificate,
  cost_type,
  external_url,
  description,
  is_active
)
SELECT p.id, 'COURSE-001', 'Web Development Fundamentals', 'Software Development', 'Beginner', '12h', TRUE, 'free',
       'https://www.coursera.org/', 'Build practical web skills from fundamentals to projects.', TRUE
FROM providers p
WHERE p.slug = 'coursera'
ON CONFLICT (provider_id, external_id) DO NOTHING;

INSERT INTO courses (
  provider_id,
  external_id,
  title,
  category,
  skill_level,
  duration_label,
  has_certificate,
  cost_type,
  external_url,
  description,
  is_active
)
SELECT p.id, 'COURSE-002', 'AI and Data Essentials', 'AI and Data', 'Intermediate', '18h', TRUE, 'free',
       'https://skillsbuild.org/', 'Learn practical AI workflows, model basics, and data handling.', TRUE
FROM providers p
WHERE p.slug = 'ibm-skillsbuild'
ON CONFLICT (provider_id, external_id) DO NOTHING;

INSERT INTO courses (
  provider_id,
  external_id,
  title,
  category,
  skill_level,
  duration_label,
  has_certificate,
  cost_type,
  external_url,
  description,
  is_active
)
SELECT p.id, 'COURSE-003', 'Cybersecurity Foundations', 'Cybersecurity', 'Beginner', '14h', TRUE, 'paid',
       'https://www.uniathena.com/', 'Understand core cyber risks, controls, and security operations.', TRUE
FROM providers p
WHERE p.slug = 'uniathena'
ON CONFLICT (provider_id, external_id) DO NOTHING;

INSERT INTO courses (
  provider_id,
  external_id,
  title,
  category,
  skill_level,
  duration_label,
  has_certificate,
  cost_type,
  external_url,
  description,
  is_active
)
SELECT p.id, 'COURSE-004', 'Modern React for Product Teams', 'Software Development', 'Intermediate', '16h', TRUE, 'paid',
       'https://www.udemy.com/', 'Build scalable React applications with reusable architecture.', TRUE
FROM providers p
WHERE p.slug = 'udemy'
ON CONFLICT (provider_id, external_id) DO NOTHING;

INSERT INTO courses (
  provider_id,
  external_id,
  title,
  category,
  skill_level,
  duration_label,
  has_certificate,
  cost_type,
  external_url,
  description,
  is_active
)
SELECT p.id, 'COURSE-005', 'Digital Entrepreneurship Sprint', 'Entrepreneurship', 'Beginner', '10h', TRUE, 'free',
       'https://idw.example.com/', 'Launch and validate digital products with lean execution methods.', TRUE
FROM providers p
WHERE p.slug = 'idw'
ON CONFLICT (provider_id, external_id) DO NOTHING;

COMMIT;
