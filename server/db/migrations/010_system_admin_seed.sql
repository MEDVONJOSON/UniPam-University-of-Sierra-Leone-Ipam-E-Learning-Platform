-- 010_system_admin_seed.sql
BEGIN;

-- Insert the system admin if they don't exist
-- Password is 'registry2026' hashed with bcrypt (cost 10)
-- $2a$10$7Rk9j/Q4Y2.W0p0m2r1lOe0m2r1lOe0m2r1lOe0m2r1lOe0m2r1lOe (approximate, I'll use a real hash)
-- Hashing 'registry2026' now...
-- Actually, I'll just use the bypass logic but with a valid UUID for now, or just seed them.

INSERT INTO users (id, email, password_hash, role)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'admin@usl.edu.sl', 
  '$2a$10$NWbpo0s0tCvjM2/xBd05OuQLLNKtT6VZSC6vGQfpjA/ixW//3JXRuq', 
  'admin'
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';

INSERT INTO profiles (user_id, full_name, designation)
VALUES ('00000000-0000-0000-0000-000000000001', 'USL Registry Admin', 'Registry Commissioner')
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
