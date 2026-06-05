import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import {
  createLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  deleteLeave,
} from "../controllers/leave.controller.js";

const router = express.Router();

// ── Student endpoints ───────────────────────────────────────────────
router.post(
  "/",
  protect,
  allowRoles("student", "teacher"),
  createLeave
);

router.get(
  "/me",
  protect,
  allowRoles("student", "teacher"),
  getMyLeaves
);

router.delete(
  "/:id",
  protect,
  allowRoles("student", "teacher"),
  deleteLeave
);

// ── Faculty / HOD endpoints ─────────────────────────────────────────
router.get(
  "/all",
  protect,
  allowRoles("teacher", "hod"),
  getAllLeaves
);

router.patch(
  "/:id/review",
  protect,
  allowRoles("teacher", "hod"),
  reviewLeave
);

export default router;
