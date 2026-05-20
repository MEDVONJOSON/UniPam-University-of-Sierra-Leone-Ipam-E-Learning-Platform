BEGIN;

INSERT INTO providers (name, slug, is_active)
VALUES
  ('Coursera', 'coursera', TRUE),
  ('IBM SkillsBuild', 'ibm-skillsbuild', TRUE),
  ('Udemy', 'udemy', TRUE),
  ('UniAthena', 'uniathena', TRUE),
  ('IDW', 'idw', TRUE)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
