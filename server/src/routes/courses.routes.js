const express = require("express");
const courseController = require("../controllers/course.controller");
const { asyncHandler } = require("../middleware/async-handler");
const { authRequired } = require("../middleware/auth-required");
const { roleRequired } = require("../middleware/role-required");

const router = express.Router();

router.get("/", asyncHandler(courseController.getAllCourses));
router.get("/:courseId", asyncHandler(courseController.getCourseById));
router.post("/", authRequired, roleRequired(["admin"]), asyncHandler(courseController.createCourse));

module.exports = router;
