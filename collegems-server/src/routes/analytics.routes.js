import express from "express";
import StudentAnalytics from "../models/StudentAnalytics.model.js";
import { generateAnalyticsForStudent } from "../services/analytics.service.js";

const router = express.Router();

// GET /api/analytics/department/at-risk
// Retrieves a list of high-risk students
router.get("/department/at-risk", async (req, res) => {
    try {
        // Optional: Filter by departmentCode if using req.user
        const atRiskStudents = await StudentAnalytics.find({ riskLevel: "high" })
            .populate("studentId", "name email studentId semester course")
            .sort({ dropoutRiskScore: -1 });

        res.json({ success: true, data: atRiskStudents });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch at-risk students", error: error.message });
    }
});

// GET /api/analytics/student/:id
// Gets analytics for a specific student, triggers a fresh calculation if requested
router.get("/student/:id", async (req, res) => {
    try {
        const { forceRefresh } = req.query;
        let analytics = await StudentAnalytics.findOne({ studentId: req.params.id }).populate("studentId", "name email studentId course semester");

        // Generate if not exists or if forcefully requested
        if (!analytics || forceRefresh === 'true') {
             analytics = await generateAnalyticsForStudent(req.params.id);
             analytics = await StudentAnalytics.findById(analytics._id).populate("studentId", "name email studentId course semester");
        }

        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch student analytics", error: error.message });
    }
});

export default router;
