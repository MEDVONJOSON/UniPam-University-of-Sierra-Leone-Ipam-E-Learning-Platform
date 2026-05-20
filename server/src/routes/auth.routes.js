const express = require("express");
const authController = require("../controllers/auth.controller");
const { authRequired } = require("../middleware/auth-required");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get("/me", authRequired, asyncHandler(authController.getMe));
router.patch("/me", authRequired, asyncHandler(authController.updateProfile));

module.exports = router;
