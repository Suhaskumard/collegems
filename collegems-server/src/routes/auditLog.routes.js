import express from "express";
import { getAuditLogs, exportAuditLogs, getSystemLogs } from "../controllers/auditLog.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Only HOD (Admin) should be able to view or export audit logs
router.use(protect);
router.use(restrictTo("hod"));

router.get("/", getAuditLogs);
router.get("/export", exportAuditLogs);
router.get("/system-logs", getSystemLogs);

export default router;
