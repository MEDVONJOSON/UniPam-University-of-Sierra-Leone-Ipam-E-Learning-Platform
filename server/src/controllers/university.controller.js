const { pool } = require("../config/db");

// ─── Original Generic Handlers ────────────────────────────────────────────────

exports.getFaculties = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, description FROM faculties ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
};

exports.getPrograms = async (req, res) => {
  const { facultyId } = req.query;
  try {
    let query = `
      SELECT up.id, up.name, up.degree_level, up.duration_years, d.name as department_name, f.id as faculty_id 
      FROM university_programs up
      JOIN departments d ON up.department_id = d.id
      JOIN faculties f ON d.faculty_id = f.id
    `;
    const values = [];

    if (facultyId) {
      query += ` WHERE f.id = $1`;
      values.push(facultyId);
    }

    query += ` ORDER BY up.name ASC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching university programs:", error);
    res.status(500).json({ error: "Failed to fetch university programs" });
  }
};

exports.getModules = async (req, res) => {
  const { programId, year, semester } = req.query;
  
  if (!programId || !year || !semester) {
    return res.status(400).json({ error: "programId, year, and semester are required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, module_code, module_name, credits 
       FROM university_modules 
       WHERE program_id = $1 AND academic_year = $2 AND semester = $3
       ORDER BY module_code ASC`,
      [programId, parseInt(year), parseInt(semester)]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ error: "Failed to fetch modules" });
  }
};

// ─── IPAM-Specific Handlers ───────────────────────────────────────────────────

/**
 * GET /api/v1/university/ipam/faculties
 * Returns all 5 IPAM faculties with live programme counts.
 */
exports.getIpamFaculties = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ipam_faculties ORDER BY id ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching IPAM faculties:", error);
    res.status(500).json({ error: "Failed to fetch IPAM faculties" });
  }
};

/**
 * GET /api/v1/university/ipam/departments?facultyId=f1
 * Returns departments, optionally filtered by faculty ID.
 */
exports.getIpamDepartments = async (req, res) => {
  const { facultyId } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM ipam_departments WHERE faculty_id = $1 ORDER BY name ASC`,
      [facultyId || null]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching IPAM departments:", error);
    res.status(500).json({ error: "Failed to fetch IPAM departments" });
  }
};

/**
 * GET /api/v1/university/ipam/programs?facultyId=f1&level=Degree&search=accounting
 * Returns programmes, optionally filtered by faculty, level, and search query.
 */
exports.getIpamPrograms = async (req, res) => {
  const { facultyId, level, search } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM ipam_programmes WHERE faculty_id = $1 AND level = $2 AND search = $3 ORDER BY name ASC`,
      [facultyId || null, level || null, search || null]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching IPAM programs:", error);
    res.status(500).json({ error: "Failed to fetch IPAM programs" });
  }
};

/**
 * GET /api/v1/university/ipam/programs/:programId
 * Returns a single programme with full details including faculty and department names.
 */
exports.getIpamProgramById = async (req, res) => {
  const { programId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM ipam_programmes WHERE id = $1`,
      [programId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Programme not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching IPAM program:", error);
    res.status(500).json({ error: "Failed to fetch IPAM program" });
  }
};
