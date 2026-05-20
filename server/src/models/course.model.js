const { pool } = require("../config/db");

class Course {
  static async findAll({ provider, category, level, query, isInternal }) {
    const params = [];
    const filters = [];

    if (provider) {
      params.push(String(provider).toLowerCase());
      filters.push(`LOWER(p.slug) = $${params.length}`);
    }
    if (category) {
      params.push(String(category).toLowerCase());
      filters.push(`LOWER(c.category) = $${params.length}`);
    }
    if (level) {
      params.push(String(level).toLowerCase());
      filters.push(`LOWER(c.skill_level) = $${params.length}`);
    }
    if (isInternal !== undefined) {
      params.push(isInternal === 'true' || isInternal === true);
      filters.push(`c.is_internal = $${params.length}`);
    }
    if (query) {
      params.push(`%${String(query).toLowerCase()}%`);
      filters.push(`(LOWER(c.title) LIKE $${params.length} OR LOWER(c.description) LIKE $${params.length})`);
    }

    const whereSql = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT c.*,
              p.name AS provider_name, p.slug AS provider_slug,
              u.email AS instructor_email
       FROM courses c
       JOIN providers p ON p.id = c.provider_id
       LEFT JOIN users u ON u.id = c.instructor_id
       ${whereSql}
       ORDER BY c.created_at DESC
       LIMIT 200`,
      params
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT c.*,
              p.name AS provider_name, p.slug AS provider_slug,
              u.email AS instructor_email
       FROM courses c
       JOIN providers p ON p.id = c.provider_id
       LEFT JOIN users u ON u.id = c.instructor_id
       WHERE c.id = $1
       LIMIT 1`,
      [id]
    );
    return result.rows[0];
  }

  static async create(courseData) {
    const {
      providerId,
      externalId,
      title,
      category,
      level,
      duration,
      hasCertificate,
      costType,
      externalUrl,
      description,
      isInternal = false,
      instructorId = null,
      instructorName = null,
      thumbnailUrl = null
    } = courseData;

    const result = await pool.query(
      `INSERT INTO courses (
        provider_id, external_id, title, category, skill_level, duration_label, has_certificate,
        cost_type, external_url, description, is_internal, instructor_id, instructor_name, thumbnail_url, is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, TRUE)
       RETURNING *`,
      [
        providerId,
        externalId,
        title,
        category,
        level,
        duration,
        hasCertificate,
        costType,
        externalUrl,
        description,
        isInternal,
        instructorId,
        instructorName,
        thumbnailUrl
      ]
    );
    return result.rows[0];
  }
}

module.exports = Course;
