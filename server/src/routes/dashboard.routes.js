const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authRequired } = require("../middleware/auth-required");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router();
router.use(authRequired);

router.get("/summary", asyncHandler(dashboardController.getDashboardSummary));
router.get("/recommendations", asyncHandler(dashboardController.getRecommendations));
router.get("/enrollments", asyncHandler(dashboardController.getEnrollments));

module.exports = router;
