const express = require("express");
const notifController = require("../controllers/notifications.controller");
const { authRequired } = require("../middleware/auth-required");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router();
router.use(authRequired);

router.get("/", asyncHandler(notifController.listNotifications));
router.patch("/read-all", asyncHandler(notifController.markAllRead));
router.patch("/:id/read", asyncHandler(notifController.markRead));

module.exports = router;
