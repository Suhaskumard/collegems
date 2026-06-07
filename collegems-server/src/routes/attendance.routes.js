import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import {
  markAttendance,
  getMyAttendance,
  getLowAttendance
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post(
  "/mark",
  protect,
  allowRoles("teacher"),
  markAttendance
);

router.get(
  "/me",
  protect,
  allowRoles("student", "parent"),
  getMyAttendance
);

router.get(
  "/low",
  protect,
  allowRoles("teacher", "hod"),
  getLowAttendance
);

export default router;
