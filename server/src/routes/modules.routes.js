const express = require("express");
const moduleController = require("../controllers/module.controller");
const { authRequired } = require("../middleware/auth-required");
const { roleRequired } = require("../middleware/role-required");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router({ mergeParams: true });
router.use(authRequired);

router.get("/", asyncHandler(moduleController.listModules));
router.post("/", roleRequired(["lecturer", "admin"]), asyncHandler(moduleController.createModule));
router.patch("/:moduleId", roleRequired(["lecturer", "admin"]), asyncHandler(moduleController.updateModule));
router.delete("/:moduleId", roleRequired(["lecturer", "admin"]), asyncHandler(moduleController.deleteModule));

module.exports = router;
