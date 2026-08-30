const { pool } = require("../config/db");

class Assessment {
  static async create({ courseId, title, description, opensAt, closesAt, durationMinutes, createdBy }) {
    const result = await pool.query(
      `INSERT INTO assessments (course_id, title, description, opens_at, closes_at, duration_minutes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [courseId, title, description, opensAt, closesAt, durationMinutes, createdBy]
    );
    return result.rows[0];
  }

  static async findByCourseId(courseId) {
    const result = await pool.query("SELECT * FROM assessments WHERE course_id = $1", [courseId]);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM assessments WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query("DELETE FROM assessments WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
  }

  static async addQuestion({ assessmentId, questionText, options, correctIndex, points, orderIndex }) {
    const result = await pool.query(
      `INSERT INTO assessment_questions (assessment_id, question_text, options, correct_index, points, order_index)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [assessmentId, questionText, JSON.stringify(options), correctIndex, points, orderIndex]
    );
    return result.rows[0];
  }

  static async findQuestionsByAssessmentId(assessmentId) {
    const result = await pool.query(
      "SELECT * FROM assessment_questions WHERE assessment_id = $1",
      [assessmentId]
    );
    return result.rows;
  }

  static async findAttempt(assessmentId, userId) {
    const result = await pool.query(
      "SELECT * FROM assessment_attempts WHERE assessment_id = $1 AND user_id = $2",
      [assessmentId, userId]
    );
    return result.rows[0];
  }

  static async findAttemptsByAssessmentId(assessmentId) {
    const result = await pool.query(
      "SELECT * FROM assessment_attempts WHERE assessment_id = $1",
      [assessmentId]
    );
    return result.rows;
  }

  static async createAttempt({ assessmentId, userId, answers, score, maxScore }) {
    const result = await pool.query(
      `INSERT INTO assessment_attempts (assessment_id, user_id, answers, score, max_score)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [assessmentId, userId, JSON.stringify(answers), score, maxScore]
    );
    return result.rows[0];
  }
}

module.exports = Assessment;
