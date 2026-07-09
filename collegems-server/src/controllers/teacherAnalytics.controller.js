import User from "../models/User.model.js";
import Course from "../models/Course.model.js";
import Attendance from "../models/Attendance.model.js";
import Results from "../models/Results.model.js";
import StudentAnalytics from "../models/StudentAnalytics.model.js";

// @desc    Get Teacher dashboard analytics metrics
// @route   GET /api/analytics/teacher/dashboard
// @access  Private (Teacher only)
export const getTeacherDashboardMetrics = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get courses taught by teacher
    const courses = await Course.find({ teacher: teacherId }).lean();
    const courseIds = courses.map(c => c._id);

    if (courseIds.length === 0) {
        return res.json({ success: true, data: { message: "No courses assigned." }});
    }

    // Class Performance Overview
    const results = await Results.find({ courseId: { $in: courseIds } }).lean();
    let totalMarks = 0;
    let count = 0;
    let passCount = 0;
    let failCount = 0;

    results.forEach(r => {
        totalMarks += r.totalMarks || 0;
        count++;
        // Assuming pass mark is 40%
        if ((r.totalMarks || 0) >= 40) passCount++;
        else failCount++;
    });

    const averageMarks = count > 0 ? (totalMarks / count).toFixed(2) : 0;

    // Students with low marks (arbitrary threshold < 40)
    const lowMarksStudents = results.filter(r => (r.totalMarks || 0) < 40).map(r => r.studentId);
    
    res.json({
        success: true,
        data: {
            totalCoursesTaught: courses.length,
            averageMarks,
            passCount,
            failCount,
            lowMarksStudentsCount: new Set(lowMarksStudents).size
        }
    });

  } catch (error) {
    console.error("Error fetching Teacher dashboard metrics:", error);
    res.status(500).json({ success: false, message: "Server error fetching Teacher metrics" });
  }
};
