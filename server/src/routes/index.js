const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const coursesRoutes = require("./courses.routes");
const enrollmentsRoutes = require("./enrollments.routes");
const dashboardRoutes = require("./dashboard.routes");
const certificatesRoutes = require("./certificates.routes");
const universityRoutes = require("./university.routes");
const { authRequired } = require("../middleware/auth-required");
const { asyncHandler } = require("../middleware/async-handler");
const materialController = require("../controllers/material.controller");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/courses", coursesRoutes);
router.use("/enrollments", enrollmentsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/certificates", certificatesRoutes);
router.use("/notifications", require("./notifications.routes"));
router.use("/messages", require("./messages.routes"));
router.use("/lms", require("./lms.routes"));
router.use("/university", universityRoutes);
router.use("/admin", require("./admin.routes"));

// Repository: student browse across all enrolled courses
router.get("/repository/materials", authRequired, asyncHandler(materialController.listRepositoryMaterials));
router.get("/repository/saved", authRequired, asyncHandler(materialController.getSavedMaterials));

module.exports = router;
