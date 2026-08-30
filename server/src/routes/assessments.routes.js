const express = require("express");
const assessmentController = require("../controllers/assessment.controller");
const { authRequired } = require("../middleware/auth-required");
const { roleRequired } = require("../middleware/role-required");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router({ mergeParams: true });
router.use(authRequired);

router.get("/", asyncHandler(assessmentController.listAssessments));
router.post("/", roleRequired(["lecturer", "admin"]), asyncHandler(assessmentController.createAssessment));
router.get("/:assessmentId", asyncHandler(assessmentController.getAssessmentDetail));
router.delete("/:assessmentId", roleRequired(["lecturer", "admin"]), asyncHandler(assessmentController.deleteAssessment));
router.post("/:assessmentId/attempt", asyncHandler(assessmentController.submitAttempt));
router.get("/:assessmentId/my-attempt", asyncHandler(assessmentController.myAttempt));
router.get("/:assessmentId/attempts", roleRequired(["lecturer", "admin"]), asyncHandler(assessmentController.listAttempts));

module.exports = router;
