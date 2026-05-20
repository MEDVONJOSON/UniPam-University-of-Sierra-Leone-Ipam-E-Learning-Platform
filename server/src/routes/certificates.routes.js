const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { pool } = require("../config/db");
const { authRequired } = require("../middleware/auth-required");
const { asyncHandler } = require("../middleware/async-handler");

const router = express.Router();
router.use(authRequired);

const uploadsDir = path.resolve(__dirname, "..", "..", "uploads", "certificates");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = String(file.originalname || "certificate").replace(/[^a-z0-9.\-_]/gi, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only PDF, PNG, JPG, and WEBP files are allowed."));
      return;
    }
    cb(null, true);
  }
});

router.get("/", asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT ca.id, ca.title, ca.file_name, ca.mime_type, ca.storage_key, ca.external_verification_url,
            ca.is_public, ca.created_at, c.title AS course_title
     FROM certificate_assets ca
     LEFT JOIN courses c ON c.id = ca.course_id
     WHERE ca.user_id = $1
     ORDER BY ca.created_at DESC`,
    [req.auth.userId]
  );
  return res.json({
    data: result.rows
  });
}));

router.post("/", upload.single("certificateFile"), asyncHandler(async (req, res) => {
  const { title, courseId = null, externalVerificationUrl = "", isPublic = "false" } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required." });
  }
  if (!req.file) {
    return res.status(400).json({ error: "certificateFile is required." });
  }

  const normalizedPublic = String(isPublic).toLowerCase() === "true";

  const inserted = await pool.query(
    `INSERT INTO certificate_assets (
      user_id, course_id, title, storage_key, file_name, mime_type, external_verification_url, is_public
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title, file_name, mime_type, storage_key, external_verification_url, is_public, created_at`,
    [
      req.auth.userId,
      courseId || null,
      String(title).trim(),
      `certificates/${req.file.filename}`,
      req.file.originalname,
      req.file.mimetype,
      externalVerificationUrl || null,
      normalizedPublic
    ]
  );

  return res.status(201).json({
    data: inserted.rows[0]
  });
}));

router.patch("/:certificateId/visibility", asyncHandler(async (req, res) => {
  const isPublic = Boolean(req.body.isPublic);
  const result = await pool.query(
    `UPDATE certificate_assets
     SET is_public = $1
     WHERE id = $2 AND user_id = $3
     RETURNING id, is_public`,
    [isPublic, req.params.certificateId, req.auth.userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Certificate not found." });
  }
  return res.json({
    data: result.rows[0]
  });
}));

module.exports = router;
