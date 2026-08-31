const express = require("express");
const { authRequired } = require("../middleware/auth-required");
const { roleRequired } = require("../middleware/role-required");
const { asyncHandler } = require("../middleware/async-handler");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authRequired);
router.use(roleRequired("admin"));

// Dashboard metrics
router.get("/stats", asyncHandler(adminController.getStats));
router.get("/recent-activity", asyncHandler(adminController.getRecentActivity));

// User management
router.get("/users", asyncHandler(adminController.getUsers));
router.get("/users/:id", asyncHandler(adminController.getUser));
router.post("/users", asyncHandler(adminController.createUser));
router.patch("/users/:id", asyncHandler(adminController.updateUser));
router.patch("/users/:id/approve", asyncHandler(adminController.approveUser));
router.patch("/users/:id/reject", asyncHandler(adminController.rejectUser));
router.post("/users/:id/reset-password", asyncHandler(adminController.resetPassword));
router.delete("/users/:id", asyncHandler(adminController.deleteUser));

// System reports
router.get("/reports", asyncHandler(adminController.getReports));

module.exports = router;
