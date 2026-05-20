const express = require("express");
const lmsController = require("../controllers/lms.controller");
const { authRequired } = require("../middleware/auth-required");
const { roleRequired } = require("../middleware/role-required");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router();

// Student / Public (if authRequired is omitted for catalog)
router.get("/course/:courseId", authRequired, asyncHandler(lmsController.getCourseLMS));
router.get("/lesson/:lessonId", authRequired, asyncHandler(lmsController.getLessonDetails));

// Instructor / Admin
router.post("/course/:courseId/modules", authRequired, roleRequired(["instructor", "lecturer", "admin"]), asyncHandler(lmsController.createModule));
router.post("/module/:moduleId/lessons", authRequired, roleRequired(["instructor", "lecturer", "admin"]), asyncHandler(lmsController.createLesson));

module.exports = router;
