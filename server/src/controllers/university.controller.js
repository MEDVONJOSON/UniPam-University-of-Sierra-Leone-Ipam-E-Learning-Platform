const { prisma } = require("../config/db");

// ─── Original Generic Handlers ────────────────────────────────────────────────

exports.getFaculties = async (req, res) => {
  try {
    const result = await prisma.faculty.findMany({
      orderBy: { name: "asc" }
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
};

exports.getPrograms = async (req, res) => {
  const { facultyId } = req.query;
  try {
    const where = {};
    if (facultyId) {
      where.department = { faculty_id: facultyId };
    }

    const result = await prisma.universityProgram.findMany({
      where,
      include: {
        department: {
          select: { name: true, faculty_id: true }
        }
      },
      orderBy: { name: "asc" }
    });

    const formatted = result.map(up => ({
      id: up.id,
      name: up.name,
      degree_level: up.degree_level,
      duration_years: up.duration_years,
      department_name: up.department.name,
      faculty_id: up.department.faculty_id
    }));

    res.json(formatted);
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
    const result = await prisma.universityModule.findMany({
      where: {
        program_id: programId,
        academic_year: parseInt(year, 10),
        semester: parseInt(semester, 10)
      },
      orderBy: { module_code: "asc" }
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ error: "Failed to fetch modules" });
  }
};

// ─── IPAM-Specific Handlers ───────────────────────────────────────────────────

/**
 * GET /api/v1/university/ipam/faculties
 * Returns all IPAM faculties with live programme counts.
 */
exports.getIpamFaculties = async (req, res) => {
  try {
    const list = await prisma.faculty.findMany({
      include: {
        departments: {
          include: {
            university_programs: true
          }
        }
      },
      orderBy: { name: "asc" }
    });

    const formatted = list.map(f => {
      let count = 0;
      f.departments.forEach(d => {
        count += d.university_programs.length;
      });
      return {
        id: f.id,
        name: f.name,
        slug: f.slug,
        dean_name: f.dean_name,
        description: f.description,
        programme_count: count
      };
    });

    res.json(formatted);
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
    const where = {};
    if (facultyId) {
      where.faculty_id = facultyId;
    }

    const result = await prisma.department.findMany({
      where,
      include: {
        university_programs: true
      },
      orderBy: { name: "asc" }
    });

    const formatted = result.map(d => ({
      id: d.id,
      faculty_id: d.faculty_id,
      name: d.name,
      slug: d.slug,
      head_of_department: d.head_of_department,
      programme_count: d.university_programs.length
    }));

    res.json(formatted);
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
    const where = {};
    if (facultyId) {
      where.department = { faculty_id: facultyId };
    }
    if (level) {
      where.degree_level = level;
    }
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const result = await prisma.universityProgram.findMany({
      where,
      include: {
        department: {
          select: { name: true, faculty_id: true }
        }
      },
      orderBy: { name: "asc" }
    });

    const formatted = result.map(up => ({
      id: up.id,
      faculty_id: up.department.faculty_id,
      department_id: up.department_id,
      name: up.name,
      level: up.degree_level,
      duration: `${up.duration_years} Years`,
      description: `IPAM ${up.degree_level} program in ${up.name}.`,
      requirements: "Five (5) WASSCE credits including English Language and Mathematics.",
      careers: "Private Sector, Public Sector, Non-Governmental Organisations"
    }));

    res.json(formatted);
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
    const up = await prisma.universityProgram.findUnique({
      where: { id: programId },
      include: {
        department: {
          include: {
            faculty: true
          }
        }
      }
    });

    if (!up) {
      return res.status(404).json({ error: "Programme not found" });
    }

    res.json({
      id: up.id,
      faculty_id: up.department.faculty_id,
      department_id: up.department_id,
      name: up.name,
      level: up.degree_level,
      duration: `${up.duration_years} Years`,
      description: `IPAM ${up.degree_level} program in ${up.name}.`,
      requirements: "Five (5) WASSCE credits including English Language and Mathematics.",
      careers: "Private Sector, Public Sector, Non-Governmental Organisations",
      faculty_name: up.department.faculty.name,
      department_name: up.department.name
    });
  } catch (error) {
    console.error("Error fetching IPAM program:", error);
    res.status(500).json({ error: "Failed to fetch IPAM program" });
  }
};
