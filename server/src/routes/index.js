const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const coursesRoutes = require("./courses.routes");
const enrollmentsRoutes = require("./enrollments.routes");
const dashboardRoutes = require("./dashboard.routes");
const certificatesRoutes = require("./certificates.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/courses", coursesRoutes);
router.use("/enrollments", enrollmentsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/certificates", certificatesRoutes);
router.use("/lms", require("./lms.routes"));

module.exports = router;
