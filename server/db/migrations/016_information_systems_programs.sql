-- Ensure the Information Systems & Technology faculty exposes its four approved programs.
BEGIN;

DO $$
DECLARE
  info_faculty UUID;
  info_department UUID;
BEGIN
  SELECT id INTO info_faculty
  FROM faculties
  WHERE slug = 'info-systems-tech'
  LIMIT 1;

  IF info_faculty IS NOT NULL THEN
    SELECT id INTO info_department
    FROM departments
    WHERE faculty_id = info_faculty
    ORDER BY created_at
    LIMIT 1;

    IF info_department IS NOT NULL THEN
      DELETE FROM university_programs
      WHERE department_id = info_department
        AND name NOT IN (
          'BSc Information Systems',
          'BSc Information Technology',
          'BSc In Computer Networking',
          'Diploma in Information Systems'
        );

      INSERT INTO university_programs (department_id, name, degree_level, duration_years)
      SELECT info_department, program_name, degree_level, duration_years
      FROM (VALUES
        ('BSc Information Systems', 'Degree', 4),
        ('BSc Information Technology', 'Degree', 4),
        ('BSc In Computer Networking', 'Degree', 4),
        ('Diploma in Information Systems', 'Diploma', 2)
      ) AS approved(program_name, degree_level, duration_years)
      WHERE NOT EXISTS (
        SELECT 1
        FROM university_programs existing
        WHERE existing.department_id = info_department
          AND existing.name = approved.program_name
      );
    END IF;
  END IF;
END $$;

COMMIT;