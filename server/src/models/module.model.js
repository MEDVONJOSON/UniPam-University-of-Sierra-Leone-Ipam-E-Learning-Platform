const { pool } = require("../config/db");

class Module {
  static async findByCourseId(courseId) {
    const result = await pool.query(
      `SELECT * FROM course_modules
       WHERE course_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [courseId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      "SELECT * FROM course_modules WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  static async create({ courseId, title, description = "", sortOrder = 0 }) {
    const result = await pool.query(
      `INSERT INTO course_modules (course_id, title, description, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [courseId, title, description, sortOrder]
    );
    return result.rows[0];
  }

  static async update(id, { title, description, sortOrder }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined)       { fields.push(`title = $${idx++}`);       values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (sortOrder !== undefined)   { fields.push(`sort_order = $${idx++}`);  values.push(sortOrder); }
    fields.push(`updated_at = NOW()`);

    values.push(id);
    const result = await pool.query(
      `UPDATE course_modules SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    // Unlink materials that belonged to this module (sets module_id = NULL)
    await pool.query(
      "UPDATE course_materials SET module_id = NULL WHERE module_id = $1",
      [id]
    );
    const result = await pool.query(
      "DELETE FROM course_modules WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  static async getNextSortOrder(courseId) {
    const result = await pool.query(
      "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM course_modules WHERE course_id = $1",
      [courseId]
    );
    return result.rows[0].next;
  }
}

module.exports = Module;
