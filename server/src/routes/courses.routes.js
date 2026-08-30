const express = require("express");
const courseController = require("../controllers/course.controller");
const materialController = require("../controllers/material.controller");
const { asyncHandler } = require("../middleware/async-handler");
const { authRequired } = require("../middleware/auth-required");
const { roleRequired } = require("../middleware/role-required");

const router = express.Router();

router.get("/", asyncHandler(courseController.getAllCourses));
router.get("/mine", authRequired, roleRequired(["lecturer", "admin"]), asyncHandler(courseController.getMyCourses));
router.get("/:courseId", asyncHandler(courseController.getCourseById));
router.post("/", authRequired, roleRequired(["admin", "lecturer"]), asyncHandler(courseController.createCourse));
router.use("/:courseId/modules", require("./modules.routes"));
router.use("/:courseId/materials", require("./materials.routes"));
router.use("/:courseId/assessments", require("./assessments.routes"));

module.exports = router;
