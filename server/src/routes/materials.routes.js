const express = require("express");
const fs      = require("fs");
const path    = require("path");
const multer  = require("multer");
const materialController = require("../controllers/material.controller");
const { authRequired }   = require("../middleware/auth-required");
const { roleRequired }   = require("../middleware/role-required");
const { asyncHandler }   = require("../middleware/async-handler");

const router = express.Router({ mergeParams: true });
router.use(authRequired);

// ─── Upload storage ──────────────────────────────────────────────────────────
const uploadsDir = path.resolve(__dirname, "..", "..", "uploads", "materials");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = String(file.originalname || "material").replace(/[^a-z0-9.\-_]/gi, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

// All accepted MIME types
const ALLOWED_MIMES = [
  // PDF
  "application/pdf",
  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Images
  "image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/webp",
  // Video
  "video/mp4", "video/webm", "video/ogg",
  // Text / generic
  "text/plain"
];

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const allowed = ALLOWED_MIMES.includes(file.mimetype) ||
      [".pdf",".doc",".docx",".ppt",".pptx",".xls",".xlsx",
       ".png",".jpg",".jpeg",".gif",".svg",".webp",
       ".mp4",".webm",".ogg",".txt"].includes(ext);
    if (!allowed) {
      cb(new Error("File type not supported. Allowed: PDF, Word, PowerPoint, Excel, images, videos."));
      return;
    }
    cb(null, true);
  }
});

// ─── Lecturer routes ─────────────────────────────────────────────────────────
router.get("/",
  roleRequired(["lecturer", "admin"]),
  asyncHandler(materialController.listMaterials));

router.post("/",
  roleRequired(["lecturer", "admin"]),
  upload.single("file"),
  asyncHandler(materialController.createMaterial));

router.patch("/:materialId",
  roleRequired(["lecturer", "admin"]),
  asyncHandler(materialController.updateMaterial));

router.delete("/:materialId",
  roleRequired(["lecturer", "admin"]),
  asyncHandler(materialController.deleteMaterial));

// ─── Student routes ──────────────────────────────────────────────────────────
router.get("/published",
  asyncHandler(materialController.listPublishedMaterials));

router.get("/:materialId/download",
  asyncHandler(materialController.downloadMaterial));

// ─── Saved / Bookmarks (student) ────────────────────────────────────────────
router.post("/:materialId/save",   asyncHandler(materialController.saveMaterial));
router.delete("/:materialId/save", asyncHandler(materialController.unsaveMaterial));

module.exports = router;
