const { pool } = require("../config/db");

class Material {
  // ─── Lecturer / admin queries ───────────────────────────────────────────────

  static async findByCourseId(courseId) {
    const result = await pool.query(
      `SELECT cm.*,
              mo.title AS module_title,
              mo.sort_order AS module_sort_order,
              u.email AS uploader_email,
              p.full_name AS uploader_name
       FROM course_materials cm
       LEFT JOIN course_modules mo ON mo.id = cm.module_id
       LEFT JOIN users u ON u.id = cm.uploaded_by
       LEFT JOIN profiles p ON p.user_id = cm.uploaded_by
       WHERE cm.course_id = $1
       ORDER BY mo.sort_order ASC NULLS LAST, cm.created_at ASC`,
      [courseId]
    );
    return result.rows;
  }

  // ─── Student query — only published materials for enrolled courses ────────

  static async findPublishedByCourseId(courseId, userId) {
    // Verify enrollment first
    const enroll = await pool.query(
      `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 LIMIT 1`,
      [userId, courseId]
    );
    if (enroll.rowCount === 0) return null; // signals "not enrolled"

    const result = await pool.query(
      `SELECT cm.*,
              mo.title AS module_title,
              mo.sort_order AS module_sort_order,
              p.full_name AS uploader_name,
              CASE WHEN sm.material_id IS NOT NULL THEN true ELSE false END AS is_saved
       FROM course_materials cm
       LEFT JOIN course_modules mo ON mo.id = cm.module_id
       LEFT JOIN profiles p ON p.user_id = cm.uploaded_by
       LEFT JOIN saved_materials sm ON sm.material_id = cm.id AND sm.user_id = $2
       WHERE cm.course_id = $1 AND cm.is_published = TRUE
       ORDER BY mo.sort_order ASC NULLS LAST, cm.created_at ASC`,
      [courseId, userId]
    );
    return result.rows;
  }

  // ─── All materials across all enrolled courses (rich search) ─────────────

  static async findAllForEnrolledCourses(userId, {
    search, category, courseId,
    semester, academicYear, materialType, weekLabel, lecturer
  } = {}) {
    const params = [userId];
    let extra = "";

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      const p = params.length;
      extra += ` AND (
        LOWER(cm.title)            LIKE $${p} OR
        LOWER(cm.description)      LIKE $${p} OR
        LOWER(c.title)             LIKE $${p} OR
        LOWER(mo.title)            LIKE $${p} OR
        LOWER(cm.week_label)       LIKE $${p} OR
        LOWER(cm.original_filename)LIKE $${p} OR
        LOWER(p.full_name)         LIKE $${p}
      )`;
    }
    if (category) {
      params.push(category);
      extra += ` AND cm.material_category = $${params.length}`;
    }
    if (courseId) {
      params.push(courseId);
      extra += ` AND cm.course_id = $${params.length}`;
    }
    if (semester) {
      params.push(`%${semester.toLowerCase()}%`);
      extra += ` AND LOWER(cm.semester) LIKE $${params.length}`;
    }
    if (academicYear) {
      params.push(academicYear);
      extra += ` AND cm.academic_year = $${params.length}`;
    }
    if (materialType) {
      params.push(materialType);
      extra += ` AND cm.material_type = $${params.length}`;
    }
    if (weekLabel) {
      params.push(`%${weekLabel.toLowerCase()}%`);
      extra += ` AND LOWER(cm.week_label) LIKE $${params.length}`;
    }
    if (lecturer) {
      params.push(`%${lecturer.toLowerCase()}%`);
      extra += ` AND LOWER(p.full_name) LIKE $${params.length}`;
    }

    const result = await pool.query(
      `SELECT cm.*,
              c.title AS course_title,
              mo.title AS module_title,
              p.full_name AS uploader_name,
              CASE WHEN sm.material_id IS NOT NULL THEN true ELSE false END AS is_saved
       FROM course_materials cm
       JOIN enrollments e ON e.course_id = cm.course_id AND e.user_id = $1
       JOIN courses c ON c.id = cm.course_id
       LEFT JOIN course_modules mo ON mo.id = cm.module_id
       LEFT JOIN profiles p ON p.user_id = cm.uploaded_by
       LEFT JOIN saved_materials sm ON sm.material_id = cm.id AND sm.user_id = $1
       WHERE cm.is_published = TRUE ${extra}
       ORDER BY cm.created_at DESC
       LIMIT 500`,
      params
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT cm.*, c.title AS course_title
       FROM course_materials cm
       JOIN courses c ON c.id = cm.course_id
       WHERE cm.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create({
    courseId, moduleId, title, description, weekLabel,
    materialType, materialCategory, fileUrl, uploadedBy,
    originalFilename, fileSizeBytes, semester, academicYear,
    lectureNoteNumber, isPublished
  }) {
    const result = await pool.query(
      `INSERT INTO course_materials
         (course_id, module_id, title, description, week_label,
          material_type, material_category, file_url, uploaded_by,
          original_filename, file_size_bytes, semester, academic_year,
          lecture_note_number, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        courseId, moduleId || null, title, description || "", weekLabel || "",
        materialType, materialCategory || "lecture_notes", fileUrl, uploadedBy,
        originalFilename || null, fileSizeBytes || null,
        semester || null, academicYear || null,
        lectureNoteNumber || null,
        isPublished !== false
      ]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const allowed = ["title", "description", "week_label", "module_id",
                     "material_category", "semester", "academic_year",
                     "lecture_note_number", "is_published"];
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(fields)) {
      const col = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (allowed.includes(col)) {
        setClauses.push(`${col} = $${idx++}`);
        values.push(val);
      }
    }
    if (setClauses.length === 0) return null;
    values.push(id);
    const result = await pool.query(
      `UPDATE course_materials SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async incrementDownloadCount(id) {
    await pool.query(
      "UPDATE course_materials SET download_count = download_count + 1 WHERE id = $1",
      [id]
    );
  }

  static async delete(id) {
    const result = await pool.query(
      "DELETE FROM course_materials WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // ─── Saved / Bookmark ────────────────────────────────────────────────────

  static async saveMaterial(userId, materialId) {
    await pool.query(
      `INSERT INTO saved_materials (user_id, material_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, materialId]
    );
  }

  static async unsaveMaterial(userId, materialId) {
    await pool.query(
      "DELETE FROM saved_materials WHERE user_id = $1 AND material_id = $2",
      [userId, materialId]
    );
  }

  static async getSavedMaterials(userId) {
    const result = await pool.query(
      `SELECT cm.*,
              c.title AS course_title,
              mo.title AS module_title,
              p.full_name AS uploader_name,
              true AS is_saved
       FROM saved_materials sm
       JOIN course_materials cm ON cm.id = sm.material_id
       JOIN courses c ON c.id = cm.course_id
       LEFT JOIN course_modules mo ON mo.id = cm.module_id
       LEFT JOIN profiles p ON p.user_id = cm.uploaded_by
       WHERE sm.user_id = $1 AND cm.is_published = TRUE
       ORDER BY sm.saved_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = Material;
