const express = require("express");
const { prisma } = require("../config/db");
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

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, category: true, external_url: true }
  });
  if (!course) {
    return res.status(404).json({ error: "Course not found." });
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      user_id_course_id: {
        user_id: req.auth.userId,
        course_id: courseId
      }
    }
  });
  if (existing) {
    return res.json({ data: existing });
  }

  const inserted = await prisma.enrollment.create({
    data: {
      user_id: req.auth.userId,
      course_id: courseId,
      status: "enrolled",
      progress_percent: 0,
      lessons_completed: 0
    }
  });

  await prisma.learningEvent.create({
    data: {
      user_id: req.auth.userId,
      course_id: courseId,
      event_type: "enrollment_click",
      event_payload: JSON.stringify({ source: "catalog" })
    }
  }).catch(() => {});

  return res.status(201).json({
    data: inserted,
    redirectUrl: course.external_url
  });
}));

router.get("/", asyncHandler(async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { user_id: req.auth.userId },
    include: {
      course: {
        include: {
          provider: { select: { name: true } }
        }
      }
    },
    orderBy: { enrolled_at: "desc" }
  });

  const formatted = enrollments.map(e => ({
    id: e.id,
    course_id: e.course_id,
    status: e.status,
    progress_percent: Number(e.progress_percent),
    lessons_completed: e.lessons_completed,
    lessons_total: 0,
    enrolled_at: e.enrolled_at,
    title: e.course.title,
    category: e.course.category,
    external_url: e.course.external_url,
    provider_name: e.course.provider?.name || ""
  }));

  return res.json({
    data: formatted
  });
}));

router.patch("/:enrollmentId/progress", asyncHandler(async (req, res) => {
  const progress = Number(req.body.progressPercent);
  if (Number.isNaN(progress)) {
    return res.status(400).json({ error: "progressPercent must be a number." });
  }

  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const status = normalizedProgress >= 100 ? "completed" : "enrolled";

  const updated = await prisma.enrollment.update({
    where: { id: req.params.enrollmentId },
    data: {
      progress_percent: normalizedProgress,
      status,
      completed_at: normalizedProgress >= 100 ? new Date() : undefined
    }
  }).catch(() => null);

  if (!updated) {
    return res.status(404).json({ error: "Enrollment not found." });
  }

  await prisma.learningEvent.create({
    data: {
      user_id: req.auth.userId,
      course_id: updated.course_id,
      event_type: "progress_updated",
      event_payload: JSON.stringify({ progressPercent: normalizedProgress })
    }
  }).catch(() => {});

  return res.json({ data: updated });
}));

module.exports = router;
