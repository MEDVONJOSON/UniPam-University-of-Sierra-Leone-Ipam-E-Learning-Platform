const { pool } = require("../config/db");

class LMS {
  // --- Modules ---
  static async findModulesByCourseId(courseId) {
    const result = await pool.query(
      "SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index ASC",
      [courseId]
    );
    return result.rows;
  }

  static async createModule(courseId, title, orderIndex = 0) {
    const result = await pool.query(
      "INSERT INTO modules (course_id, title, order_index) VALUES ($1, $2, $3) RETURNING *",
      [courseId, title, orderIndex]
    );
    return result.rows[0];
  }

  // --- Lessons ---
  static async findLessonsByModuleId(moduleId) {
    const result = await pool.query(
      "SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_index ASC",
      [moduleId]
    );
    return result.rows;
  }

  static async findLessonById(lessonId) {
    const result = await pool.query("SELECT * FROM lessons WHERE id = $1", [lessonId]);
    return result.rows[0];
  }

  static async createLesson(moduleId, data) {
    const { title, contentType, videoUrl, articleContent, orderIndex, durationMinutes } = data;
    const result = await pool.query(
      `INSERT INTO lessons (module_id, title, content_type, video_url, article_content, order_index, duration_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [moduleId, title, contentType, videoUrl, articleContent, orderIndex, durationMinutes]
    );
    return result.rows[0];
  }

  // --- Materials ---
  static async findMaterialsByLessonId(lessonId) {
    const result = await pool.query("SELECT * FROM materials WHERE lesson_id = $1", [lessonId]);
    return result.rows;
  }

  static async createMaterial(data) {
    const { lessonId, courseId, title, fileUrl, fileType } = data;
    const result = await pool.query(
      "INSERT INTO materials (lesson_id, course_id, title, file_url, file_type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [lessonId, courseId, title, fileUrl, fileType]
    );
    return result.rows[0];
  }

  // --- Assignments ---
  static async findAssignmentsByCourseId(courseId) {
    const result = await pool.query("SELECT * FROM assignments WHERE course_id = $1", [courseId]);
    return result.rows;
  }

  // --- Quizzes ---
  static async findQuizzesByLessonId(lessonId) {
    const result = await pool.query("SELECT * FROM quizzes WHERE lesson_id = $1", [lessonId]);
    return result.rows;
  }

  static async findQuizQuestions(quizId) {
    const result = await pool.query("SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index ASC", [quizId]);
    return result.rows;
  }
}

module.exports = LMS;
