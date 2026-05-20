const Course = require("../models/course.model");
const { pool } = require("../config/db");

exports.getAllCourses = async (req, res) => {
  const { provider, category, level, q, isInternal } = req.query;
  const courses = await Course.findAll({ provider, category, level, query: q, isInternal });
  
  const formattedData = courses.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    level: row.skill_level,
    duration: row.duration_label || "",
    hasCertificate: row.has_certificate,
    costType: row.cost_type,
    externalUrl: row.external_url,
    description: row.description || "",
    thumbnailUrl: row.thumbnail_url || "",
    isInternal: row.is_internal,
    instructor: row.instructor_name ? { name: row.instructor_name, email: row.instructor_email } : null,
    provider: {
      name: row.provider_name,
      slug: row.provider_slug
    }
  }));

  res.json({ data: formattedData });
};

exports.getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return res.status(404).json({ error: "Course not found." });
  }

  res.json({
    data: {
      id: course.id,
      title: course.title,
      category: course.category,
      level: course.skill_level,
      duration: course.duration_label || "",
      hasCertificate: course.has_certificate,
      costType: course.cost_type,
      externalUrl: course.external_url,
      description: course.description || "",
      thumbnailUrl: course.thumbnail_url || "",
      isInternal: course.is_internal,
      instructor: course.instructor_name ? { name: course.instructor_name, email: course.instructor_email } : null,
      provider: {
        name: course.provider_name,
        slug: course.provider_slug
      }
    }
  });
};

exports.createCourse = async (req, res) => {
  const {
    providerSlug = "idw",
    externalId,
    title,
    category,
    level = "Beginner",
    duration = "",
    hasCertificate = true,
    costType = "free",
    externalUrl,
    description = "",
    isInternal = false,
    thumbnailUrl = ""
  } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: "title and category are required." });
  }

  // Get provider
  const providerResult = await pool.query(
    "SELECT id, name, slug FROM providers WHERE slug = $1 LIMIT 1",
    [String(providerSlug).toLowerCase()]
  );
  if (providerResult.rows.length === 0) {
    return res.status(400).json({ error: "Provider not found." });
  }
  const provider = providerResult.rows[0];

  // Logic for instructor
  const instructorId = req.auth?.role !== 'admin' ? req.auth?.userId : null;
  const instructorName = req.auth?.role !== 'admin' ? (req.user?.fullName || null) : null;

  const newCourse = await Course.create({
    providerId: provider.id,
    externalId: externalId || `IDW-${Date.now()}`,
    title,
    category,
    level,
    duration,
    hasCertificate,
    costType,
    externalUrl: externalUrl || "",
    description,
    isInternal,
    instructorId,
    instructorName,
    thumbnailUrl
  });

  res.status(201).json({
    data: {
      ...newCourse,
      provider: {
        name: provider.name,
        slug: provider.slug
      }
    }
  });
};
