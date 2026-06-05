import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import User from "../models/User.model.js";
import {
  getMe,
  updateMe,
  updatePassword,
  getPreferences,
  updatePreferences,
  getStudentProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", protect, authorize("teacher", "hod"), getMe);
router.put("/me", protect, authorize("teacher", "hod"), updateMe);
router.put(
  "/me/password",
  protect,
  authorize("teacher", "hod"),
  updatePassword,
);
router.get(
  "/me/preferences",
  protect,
  authorize("teacher", "hod"),
  getPreferences,
);
router.put(
  "/me/preferences",
  protect,
  authorize("teacher", "hod"),
  updatePreferences,
);

// Teacher fetches all students
router.get(
  "/students",
  protect,
  authorize("teacher", "hod"),
  async (req, res) => {
    const students = await User.find({ role: "student" }).select(
      "name email role studentId course semester",
    );

    res.json(students);
  },
);

router.get(
  "/students/:id",
  protect,
  authorize("teacher", "hod"),
  getStudentProfile
);

router.get("/teachers", protect, authorize("hod", "teacher"), async (req, res) => {
  const teachers = await User.find({ role: "teacher" }).select("name email role teacherId department phone");

  res.json(teachers);
});

export default router;
