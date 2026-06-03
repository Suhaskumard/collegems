import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import {
  createAssignment,
  submitAssignment,
  evaluateAssignment,
} from "../controllers/assignment.controller.js";
import Assignment from "../models/Assignment.model.js";

const router = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads", "assignments");
fs.mkdirSync(uploadsDir, { recursive: true });

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = sanitizeFilename(file.originalname || "file");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const upload = multer({ storage });

router.post("/create", protect, allowRoles("teacher"), createAssignment);

router.post(
  "/submit/:id",
  protect,
  allowRoles("student"),
  upload.single("file"),
  submitAssignment,
);

router.post(
  "/evaluate/:id",
  protect,
  allowRoles("teacher"),
  evaluateAssignment,
);

// get assignments for a course
// Student assignments (course-wise)
router.get("/student", protect, allowRoles("student","teacher"), async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("course", "name code")
      .populate("teacher", "name");

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

export default router;
