import StudentAnalytics from "../models/StudentAnalytics.model.js";
import User from "../models/User.model.js";
import Attendance from "../models/Attendance.model.js";
import InternalAssessment from "../models/InternalAssessment.model.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export const generateAnalyticsForStudent = async (studentId) => {
    try {
        // 1. Gather historical data for the student
        const student = await User.findById(studentId);
        if (!student || student.role !== "student") {
            throw new Error("Student not found or invalid role");
        }

        // Calculate attendance percentage
        const totalAttendance = await Attendance.countDocuments({ student: studentId });
        const presentAttendance = await Attendance.countDocuments({ student: studentId, status: "present" });
        const attendancePercentage = totalAttendance === 0 ? 100 : (presentAttendance / totalAttendance) * 100;

        // Calculate average internal marks
        const assessments = await InternalAssessment.find({ studentId });
        let totalInternalMarks = 0;
        let missedAssessments = 0;
        
        assessments.forEach(assessment => {
            if (assessment.totalInternalMarks > 0) {
                 totalInternalMarks += assessment.totalInternalMarks;
            } else {
                 missedAssessments += 1;
            }
        });
        
        const averageInternalMarks = assessments.length === 0 ? 50 : (totalInternalMarks / assessments.length);

        const payload = {
            student_id: student._id.toString(),
            attendance_percentage: attendancePercentage,
            average_internal_marks: averageInternalMarks,
            previous_gpa: null,
            missed_assessments: missedAssessments
        };

        // 2. Call ML Service
        const response = await fetch(`${ML_SERVICE_URL}/predict/dropout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Failed to fetch predictions from ML service");
        }

        const prediction = await response.json();

        // 3. Update or Create Analytics record
        const updatedAnalytics = await StudentAnalytics.findOneAndUpdate(
            { studentId: student._id },
            {
                dropoutRiskScore: prediction.dropout_risk_score,
                riskLevel: prediction.risk_level,
                predictedPerformance: prediction.predicted_grade,
                recommendedInterventions: prediction.recommended_interventions,
                lastCalculatedAt: new Date()
            },
            { new: true, upsert: true }
        );

        return updatedAnalytics;

    } catch (error) {
        console.error(`Error generating analytics for student ${studentId}:`, error);
        throw error;
    }
};

export const batchGenerateAnalytics = async () => {
    console.log("Starting batch analytics generation...");
    try {
        const students = await User.find({ role: "student" });
        for (const student of students) {
             await generateAnalyticsForStudent(student._id);
        }
        console.log("Batch analytics generation completed successfully.");
    } catch (error) {
        console.error("Error in batch analytics job:", error);
    }
};
