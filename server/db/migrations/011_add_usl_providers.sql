-- 011_add_usl_providers.sql
BEGIN;

INSERT INTO providers (name, slug, is_active)
VALUES
  ('IPAM - USL', 'usl-ipam', TRUE),
  ('Fourah Bay College', 'usl-fbc', TRUE),
  ('COMAHS', 'usl-comahs', TRUE),
  ('USL Digital Campus', 'usl-digital', TRUE)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
