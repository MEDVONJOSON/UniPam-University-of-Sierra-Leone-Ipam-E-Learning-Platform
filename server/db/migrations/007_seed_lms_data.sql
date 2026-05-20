-- Seed a specialized internal course for demonstration
DO $$
DECLARE
    provider_id UUID;
    course_id UUID;
    module_id UUID;
BEGIN
    SELECT id INTO provider_id FROM providers WHERE slug = 'idw';

    -- Create Course
    INSERT INTO courses (provider_id, title, category, skill_level, duration_label, is_internal, description, external_url)
    VALUES (provider_id, 'Hybrid Learning Excellence', 'Professional Development', 'Intermediate', '4 Weeks', TRUE, 'Comprehensive training on using the UniPam platform.', '')
    RETURNING id INTO course_id;

    -- Create Modules
    INSERT INTO modules (course_id, title, order_index) VALUES (course_id, 'Introduction to UniPam', 0) RETURNING id INTO module_id;
    INSERT INTO lessons (module_id, title, content_type, video_url, article_content, order_index, duration_minutes)
    VALUES (module_id, 'Platform Overview', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'This lesson covers the basics.', 0, 10);
    INSERT INTO lessons (module_id, title, content_type, article_content, order_index, duration_minutes)
    VALUES (module_id, 'Account Setup', 'article', 'Details on setting up your account.', 1, 5);

    INSERT INTO modules (course_id, title, order_index) VALUES (course_id, 'Advanced Features', 1) RETURNING id INTO module_id;
    INSERT INTO lessons (module_id, title, content_type, video_url, order_index, duration_minutes)
    VALUES (module_id, 'Course Creation', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0, 15);

END $$;
