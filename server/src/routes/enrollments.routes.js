const express = require("express");
const { pool } = require("../config/db");
const { authRequired } = require("../middleware/auth-required");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router();

router.use(authRequired);

router.post("/", asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({
      error: "courseId is required"
    });
  }

  const courseResult = await pool.query(
    `SELECT id, title, category, external_url
     FROM courses
     WHERE id = $1
     LIMIT 1`,
    [courseId]
  );
  if (courseResult.rows.length === 0) {
    return res.status(404).json({ error: "Course not found." });
  }

  const existing = await pool.query(
    `SELECT id, user_id, course_id, status, progress_percent, lessons_completed, lessons_total, enrolled_at
     FROM enrollments
     WHERE user_id = $1 AND course_id = $2
     LIMIT 1`,
    [req.auth.userId, courseId]
  );
  if (existing.rows.length > 0) {
    return res.json({ data: existing.rows[0] });
  }

  const inserted = await pool.query(
    `INSERT INTO enrollments (user_id, course_id, status, progress_percent, lessons_completed, lessons_total, redirect_clicked_at)
     VALUES ($1, $2, 'enrolled', 0, 0, 0, NOW())
     RETURNING id, user_id, course_id, status, progress_percent, lessons_completed, lessons_total, enrolled_at`,
    [req.auth.userId, courseId]
  );

  await pool.query(
    "INSERT INTO learning_events (user_id, course_id, event_type, event_payload) VALUES ($1, $2, 'enrollment_click', $3::jsonb)",
    [req.auth.userId, courseId, JSON.stringify({ source: "catalog" })]
  );

  return res.status(201).json({
    data: inserted.rows[0],
    redirectUrl: courseResult.rows[0].external_url
  });
}));

router.get("/", asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT e.id, e.course_id, e.status, e.progress_percent, e.lessons_completed, e.lessons_total, e.enrolled_at,
            c.title, c.category, c.external_url, p.name AS provider_name
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     JOIN providers p ON p.id = c.provider_id
     WHERE e.user_id = $1
     ORDER BY e.enrolled_at DESC`,
    [req.auth.userId]
  );
  return res.json({
    data: result.rows
  });
}));

router.patch("/:enrollmentId/progress", asyncHandler(async (req, res) => {
  const progress = Number(req.body.progressPercent);
  if (Number.isNaN(progress)) {
    return res.status(400).json({ error: "progressPercent must be a number." });
  }

  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const status = normalizedProgress >= 100 ? "completed" : "enrolled";

  const result = await pool.query(
    `UPDATE enrollments
     SET progress_percent = $1,
         status = $2,
         completed_at = CASE WHEN $1 >= 100 THEN NOW() ELSE completed_at END
     WHERE id = $3 AND user_id = $4
     RETURNING id, course_id, status, progress_percent, enrolled_at, completed_at`,
    [normalizedProgress, status, req.params.enrollmentId, req.auth.userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Enrollment not found." });
  }

  await pool.query(
    "INSERT INTO learning_events (user_id, course_id, event_type, event_payload) VALUES ($1, $2, 'progress_updated', $3::jsonb)",
    [req.auth.userId, result.rows[0].course_id, JSON.stringify({ progressPercent: normalizedProgress })]
  );

  return res.json({ data: result.rows[0] });
}));

module.exports = router;
