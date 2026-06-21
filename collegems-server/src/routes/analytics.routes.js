import express from "express";
import StudentAnalytics from "../models/StudentAnalytics.model.js";
import { generateAnalyticsForStudent, batchGenerateAnalytics } from "../services/analytics.service.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/analytics/department/at-risk
// Retrieves a list of high-risk students
router.get("/department/at-risk", restrictTo("hod", "teacher", "admin"), async (req, res) => {
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

// GET /api/analytics/dashboard
// Retrieves a dashboard of student analytics with filtering
router.get("/dashboard", restrictTo("hod", "teacher", "admin"), async (req, res) => {
    try {
        const { riskLevel, course, semester } = req.query;
        let matchQuery = {};

        if (riskLevel) {
            matchQuery.riskLevel = riskLevel;
        }

        let studentMatch = {};
        if (course) {
            studentMatch["course"] = course;
        }
        if (semester) {
            studentMatch["semester"] = Number(semester);
        }

        let analytics = await StudentAnalytics.find(matchQuery)
            .populate({
                path: "studentId",
                select: "name email studentId semester course department",
                match: Object.keys(studentMatch).length > 0 ? studentMatch : undefined
            })
            .sort({ dropoutRiskScore: -1 });

        // Filter out null studentIds (those that didn't match the populate filter)
        analytics = analytics.filter(a => a.studentId !== null);

        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch analytics dashboard", error: error.message });
    }
});

// GET /api/analytics/student/:id
// Gets analytics for a specific student, triggers a fresh calculation if requested
router.get("/student/:id", restrictTo("hod", "teacher", "admin", "student"), async (req, res) => {
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

// POST /api/analytics/batch
// Run batch generation for all students
router.post("/batch", restrictTo("hod", "admin"), async (req, res) => {
    try {
        // Since batch might take time, we trigger it async and return immediately
        batchGenerateAnalytics();
        res.json({ success: true, message: "Batch analytics generation started." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to start batch analytics generation", error: error.message });
    }
});

export default router;
