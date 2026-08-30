const express = require("express");
const { healthCheckDb } = require("../config/db");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const db = await healthCheckDb();
  res.json({
    status: "ok",
    service: "unipam-backend",
    now: db.now
  });
}));

module.exports = router;
