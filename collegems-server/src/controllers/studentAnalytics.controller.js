import Results from "../models/Results.model.js";
import Course from "../models/Course.model.js";
import Attendance from "../models/Attendance.model.js";

/**
 * @desc Get comprehensive academic analytics for a student
 * @route GET /api/analytics/student/:studentId/grade-trend
 * @access Private (student or HOD/teacher)
 */
export const getStudentGradeTrend = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, subject } = req.query; // optional filters

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const match = { studentId };
    if (semester) match.semester = semester;
    if (subject) match.courseId = subject;

    // Fetch results
    const results = await Results.find(match)
      .populate({ path: "courseId", select: "name code" })
      .sort({ createdAt: 1 })
      .lean();

    const subjectWiseMarks = results.map((r) => ({
      date: r.createdAt,
      course: r.courseId?.name || "Unknown",
      internal: r.internalMarks ?? 0,
      external: r.externalMarks ?? 0,
      practical: r.practicalMarks ?? 0,
      total: r.totalMarks ?? 0,
      grade: r.grade || "-",
      semester: r.semester || 1
    }));

    // Calculate Semester-wise performance
    const semesterMap = {};
    let totalMarksAll = 0;
    let countAll = 0;

    subjectWiseMarks.forEach(r => {
      if (!semesterMap[r.semester]) {
        semesterMap[r.semester] = { semester: r.semester, totalMarks: 0, count: 0 };
      }
      semesterMap[r.semester].totalMarks += r.total;
      semesterMap[r.semester].count += 1;
      totalMarksAll += r.total;
      countAll += 1;
    });

    const semesterWisePerformance = Object.values(semesterMap).map(s => ({
      semester: s.semester,
      averageMarks: s.count > 0 ? (s.totalMarks / s.count).toFixed(2) : 0
    }));

    const overallPercentage = countAll > 0 ? (totalMarksAll / countAll).toFixed(2) : 0;
    
    // CGPA approximation (assuming percentage / 9.5 for standard Indian scale)
    const cgpa = (overallPercentage / 9.5).toFixed(2);

    // Fetch Attendance
    let attendanceMatch = { student: studentId };
    if (semester) attendanceMatch.semester = semester;
    
    const totalAttendance = await Attendance.countDocuments(attendanceMatch);
    const presentAttendance = await Attendance.countDocuments({ ...attendanceMatch, status: "present" });
    const attendancePercentage = totalAttendance === 0 ? 100 : ((presentAttendance / totalAttendance) * 100).toFixed(2);

    res.json({ 
      success: true, 
      data: {
        subjectWiseMarks,
        semesterWisePerformance,
        overallPercentage,
        cgpa,
        attendancePercentage,
        totalAttendance,
        presentAttendance
      } 
    });
  } catch (error) {
    console.error("Error fetching grade trend:", error);
    res.status(500).json({ success: false, message: "Server error fetching analytics data" });
  }
};
