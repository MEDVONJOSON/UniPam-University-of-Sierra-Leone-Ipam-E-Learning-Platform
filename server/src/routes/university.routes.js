const express = require("express");
const router = express.Router();
const universityController = require("../controllers/university.controller");

// ─── Generic routes (legacy) ─────────────────────────────────────────────────
router.get("/faculties", universityController.getFaculties);
router.get("/programs", universityController.getPrograms);
router.get("/modules", universityController.getModules);

// ─── IPAM-specific routes ────────────────────────────────────────────────────
router.get("/ipam/faculties", universityController.getIpamFaculties);
router.get("/ipam/departments", universityController.getIpamDepartments);
router.get("/ipam/programs", universityController.getIpamPrograms);
router.get("/ipam/programs/:programId", universityController.getIpamProgramById);

module.exports = router;
