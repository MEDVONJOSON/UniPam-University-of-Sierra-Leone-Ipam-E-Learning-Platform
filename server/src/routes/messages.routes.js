const express = require("express");
const messagesController = require("../controllers/messages.controller");
const { authRequired } = require("../middleware/auth-required");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router();

router.get("/", authRequired, asyncHandler(messagesController.listMessages));
router.post("/", authRequired, asyncHandler(messagesController.sendMessage));
router.patch("/:id/read", authRequired, asyncHandler(messagesController.markMessageRead));

module.exports = router;
