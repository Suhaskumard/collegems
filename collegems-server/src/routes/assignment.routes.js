// ─── FILE: collegems-server/src/routes/assignment.routes.js ──────────────────
// WHAT CHANGED: Added import for getUpcomingAssignments + one new GET route.
// Everything else is identical to your original file.
// ─────────────────────────────────────────────────────────────────────────────

import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { allowRoles } from "../middlewares/role.middleware.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.middleware.js";
import { getTeacherAssignments } from '../controllers/assignment.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { uploadAssignment } from '../middlewares/upload.middleware.js';
import { getAssignmentSubmissions } from '../controllers/assignment.controller.js';
import log from "../utils/logger.js";
import {
  createAssignment,
  submitAssignment,
  evaluateAssignment,
  getUpcomingAssignments,
} from "../controllers/assignment.controller.js";
import Assignment from "../models/Assignment.model.js";

const router = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads", "assignments");
fs.mkdirSync(uploadsDir, { recursive: true });

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = sanitizeFilename(file.originalname || "file");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});
const upload = multer({ storage });

// ── Existing routes with error handling ───────────────────────────────────────
router.post("/create", protect, allowRoles("teacher"), asyncHandler(createAssignment));

router.post(
  "/submit/:id",
  protect,
  allowRoles("student"),
  upload.single("file"),
  asyncHandler(submitAssignment)
);
router.post("/submit/:id", protect, restrictTo("student"), uploadAssignment.single("file"), submitAssignment);

router.post(
  "/evaluate/:id",
  protect,
  allowRoles("teacher"),
  asyncHandler(evaluateAssignment)
);
router.get("/teacher", protect, restrictTo("teacher", "hod"), getTeacherAssignments);

router.get(
  "/student",
  protect,
  allowRoles("student", "teacher"),
  asyncHandler(async (req, res) => {
    log.request("GET", "/api/assignment/student", req.user?.id);
    const assignments = await Assignment.find()
      .populate("course", "name code")
      .populate("teacher", "name");
    res.json({ success: true, data: assignments });
  })
);

router.get(
  "/teacher/submissions/:assignmentId",
  protect,
  allowRoles("teacher", "hod"),
  asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    log.request("GET", `/api/assignment/teacher/submissions/${assignmentId}`, req.user?.id);

    if (!assignmentId) {
      throw new AppError("Assignment ID is required", 400, "MISSING_ID");
    }
    router.get("/teacher/submissions/:id", protect, restrictTo("teacher", "hod"), getAssignmentSubmissions);

    const assignment = await Assignment.findById(assignmentId)
      .populate(
        "submissions.student",
        "name email avatarUrl photo profilePicture department rollNumber"
      )
      .populate("course", "name code");

    if (!assignment) {
      throw new AppError("Assignment not found", 404, "NOT_FOUND");
    }
    
    res.json({ success: true, data: assignment });
  })
);

router.get(
  "/reminders",
  protect,
  allowRoles("student"),
  asyncHandler(getUpcomingAssignments)
);

export default router;
