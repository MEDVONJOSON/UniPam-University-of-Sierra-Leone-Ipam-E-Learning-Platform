const path = require("path");
const fs   = require("fs");
const Material = require("../models/material.model");
const Course   = require("../models/course.model");

function canManage(course, auth) {
  return auth.role === "admin" || course.instructor_id === auth.userId;
}

// ─── Resolve material type from mimetype / extension ────────────────────────
function resolveMaterialType(mimetype, originalname) {
  if (!mimetype) return "link";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("image/")) return "image";
  if (
    mimetype.includes("wordprocessingml") ||
    mimetype === "application/msword" ||
    (originalname && /\.(docx?|rtf)$/i.test(originalname))
  ) return "doc";
  if (
    mimetype.includes("presentationml") ||
    mimetype === "application/vnd.ms-powerpoint" ||
    (originalname && /\.(pptx?)$/i.test(originalname))
  ) return "presentation";
  if (
    mimetype.includes("spreadsheetml") ||
    mimetype === "application/vnd.ms-excel" ||
    (originalname && /\.(xlsx?)$/i.test(originalname))
  ) return "spreadsheet";
  return "doc";
}

// ─── Lecturer: list all materials (inc. unpublished) ────────────────────────
exports.listMaterials = async (req, res) => {
  const { courseId } = req.params;
  const materials = await Material.findByCourseId(courseId);
  res.json({ data: materials });
};

// ─── Student: list published materials for enrolled course ──────────────────
exports.listPublishedMaterials = async (req, res) => {
  const { courseId } = req.params;
  const rows = await Material.findPublishedByCourseId(courseId, req.auth.userId);
  if (rows === null) {
    return res.status(403).json({ error: "You are not enrolled in this course." });
  }
  res.json({ data: rows });
};

// ─── Student: browse all materials across all enrolled courses ───────────────
exports.listRepositoryMaterials = async (req, res) => {
  const { search, category, courseId, semester, academicYear, materialType, weekLabel, lecturer } = req.query;
  const materials = await Material.findAllForEnrolledCourses(req.auth.userId, {
    search, category, courseId, semester, academicYear, materialType, weekLabel, lecturer
  });
  res.json({ data: materials });
};


// ─── Upload / create material ────────────────────────────────────────────────
exports.createMaterial = async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (!canManage(course, req.auth)) {
    return res.status(403).json({ error: "You do not teach this course." });
  }

  const {
    title, description = "", weekLabel = "", externalUrl = "",
    moduleId, materialCategory = "lecture_notes",
    semester, academicYear, lectureNoteNumber, isPublished
  } = req.body;

  if (!title) return res.status(400).json({ error: "title is required." });

  let materialType, fileUrl, originalFilename, fileSizeBytes;

  if (req.file) {
    materialType     = resolveMaterialType(req.file.mimetype, req.file.originalname);
    fileUrl          = `/uploads/materials/${req.file.filename}`;
    originalFilename = req.file.originalname;
    fileSizeBytes    = req.file.size;
  } else if (externalUrl) {
    materialType = "link";
    fileUrl      = externalUrl;
  } else {
    return res.status(400).json({ error: "A file upload or externalUrl is required." });
  }

  const material = await Material.create({
    courseId,
    moduleId:          moduleId || null,
    title:             String(title).trim(),
    description,
    weekLabel,
    materialType,
    materialCategory,
    fileUrl,
    uploadedBy:        req.auth.userId,
    originalFilename,
    fileSizeBytes,
    semester:          semester || null,
    academicYear:      academicYear || null,
    lectureNoteNumber: lectureNoteNumber || null,
    isPublished:       isPublished !== "false" && isPublished !== false
  });

  // Notify all students enrolled in this course if published
  if (material.is_published) {
    try {
      const { pool } = require("../config/db");
      const enrollResult = await pool.query(
        "SELECT user_id FROM enrollments WHERE course_id = $1",
        [courseId]
      );
      const notifTitle = "New Learning Material Available";
      const itemDesc = material.week_label ? `${material.week_label} – ${material.title}` : material.title;
      const notifMsg = `${course.title}: ${itemDesc} has been uploaded by your lecturer.`;

      for (const row of enrollResult.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, $5)`,
          [row.user_id, notifTitle, notifMsg, "info", "/app/repository"]
        );
      }
    } catch (notifErr) {
      console.warn("Notification dispatch notice:", notifErr.message);
    }
  }

  res.status(201).json({ data: material });
};

// ─── Update material metadata (no file change) ───────────────────────────────
exports.updateMaterial = async (req, res) => {
  const { courseId, materialId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (!canManage(course, req.auth)) {
    return res.status(403).json({ error: "You do not teach this course." });
  }

  const material = await Material.findById(materialId);
  if (!material || material.course_id !== courseId) {
    return res.status(404).json({ error: "Material not found." });
  }

  const updated = await Material.update(materialId, req.body);
  res.json({ data: updated });
};

// ─── Download (serves file + increments counter) ─────────────────────────────
exports.downloadMaterial = async (req, res) => {
  const { materialId } = req.params;
  const material = await Material.findById(materialId);
  if (!material || !material.is_published) {
    return res.status(404).json({ error: "Material not found." });
  }

  // Verify user is enrolled (or is a lecturer/admin)
  if (req.auth.role === "student" || req.auth.role === "learner") {
    const { pool } = require("../config/db");
    const enroll = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 LIMIT 1",
      [req.auth.userId, material.course_id]
    );
    if (enroll.rowCount === 0) {
      return res.status(403).json({ error: "You are not enrolled in this course." });
    }
  }

  await Material.incrementDownloadCount(materialId);

  // External link — redirect
  if (material.material_type === "link") {
    return res.redirect(material.file_url);
  }

  // Serve file
  const filePath = path.resolve(process.cwd(), material.file_url.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found on server." });
  }

  const filename = material.original_filename || path.basename(filePath);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.sendFile(filePath);
};

// ─── Delete material ──────────────────────────────────────────────────────────
exports.deleteMaterial = async (req, res) => {
  const { courseId, materialId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (!canManage(course, req.auth)) {
    return res.status(403).json({ error: "You do not teach this course." });
  }

  const material = await Material.findById(materialId);
  if (!material || material.course_id !== courseId) {
    return res.status(404).json({ error: "Material not found." });
  }

  // Delete physical file if it exists
  if (material.material_type !== "link") {
    try {
      const filePath = path.resolve(process.cwd(), material.file_url.replace(/^\//, ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) { /* non-fatal */ }
  }

  await Material.delete(materialId);
  res.status(204).send();
};

// ─── Save / Bookmark ─────────────────────────────────────────────────────────
exports.saveMaterial = async (req, res) => {
  const { materialId } = req.params;
  const material = await Material.findById(materialId);
  if (!material) return res.status(404).json({ error: "Material not found." });
  await Material.saveMaterial(req.auth.userId, materialId);
  res.json({ data: { saved: true } });
};

exports.unsaveMaterial = async (req, res) => {
  const { materialId } = req.params;
  await Material.unsaveMaterial(req.auth.userId, materialId);
  res.json({ data: { saved: false } });
};

exports.getSavedMaterials = async (req, res) => {
  const materials = await Material.getSavedMaterials(req.auth.userId);
  res.json({ data: materials });
};
