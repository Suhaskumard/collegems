import express from "express";
import { getSemesters, toggleSemesterFreeze } from "../controllers/semester.controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all semesters
router.get("/", authenticate, getSemesters);

// Toggle freeze status (Only HOD/Admin)
router.post("/:semesterStr/toggle", authenticate, restrictTo("hod"), toggleSemesterFreeze);

export default router;
