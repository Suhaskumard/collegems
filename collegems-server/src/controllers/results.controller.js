import Results from "../models/Results.model.js";
import Student from "../models/User.model.js";
import Course from "../models/Course.model.js";
import { logAction } from "../utils/auditService.js";

export const getResults = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        let studentId = req.user.id;
        if (req.user.role === "parent") {
            const User = (await import("../models/User.model.js")).default;
            const parentUser = await User.findById(req.user.id);
            if (!parentUser || !parentUser.studentId) {
                return res.status(400).json({ message: "No child linked to this parent account" });
            }
            const studentUser = await User.findOne({ studentId: parentUser.studentId, role: "student" });
            if (!studentUser) {
                return res.status(404).json({ message: "Linked student not found" });
            }
            studentId = studentUser._id;
        }

        const results = await Results.find({
            studentId: studentId,
            status: "published",
        })
            .populate("courseId", "name code")
            .select("internalMarks externalMarks practicalMarks totalMarks grade status semester createdAt");

        res.json(results);
    } catch (error) {
        console.error("Get Results Error:", error);
        res.status(500).json({
            message: "Failed to fetch results",
        });
    }
};

export const createResult = async (req, res) => {
    try {
        const {
            studentId,
            courseId,
            semester,
            internalMarks,
            externalMarks,
            practicalMarks,
            totalMarks,
            grade,
            status,
        } = req.body;

        // ✅ find using Mongo _id
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (student.role !== "student") {
            return res.status(400).json({ message: "Specified user is not a student" });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Verify course ownership if user is a teacher
        if (req.user.role === "teacher" && course.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized to manage results for this course",
            });
        }

        // Verify student eligibility for the course
        const matchesSem = student.semester && course.semester === Number(student.semester);
        const matchesDept = student.course && course.department.toLowerCase() === student.course.toLowerCase();
        if (!matchesSem && !matchesDept) {
            return res.status(403).json({
                message: "Not authorized to grade this student (student is not in the course's department or semester)",
            });
        }

        const result = await Results.create({
            studentId,
            courseId,
            semester: semester || student.semester,
            internalMarks,
            externalMarks,
            practicalMarks,
            totalMarks,
            grade,
            status: status || "draft",
            createdBy: req.user.id,
        });

        res.status(201).json(result);

        // Log result creation with rich audit details
        await logAction(req.user.id, "CREATE_RESULT", "Result", result._id, {
            userRole: req.user.role,
            studentId,
            previousValue: null,
            newValue: {
                studentId,
                courseId,
                semester: semester || student.semester,
                internalMarks,
                externalMarks,
                practicalMarks,
                totalMarks,
                grade,
                status: result.status,
            },
        });
    } catch (err) {
        console.log("Create Result Error:", err);
        if (err.status === 403) return res.status(403).json({ message: err.message });
        res.status(500).json({ message: "Server Error" });
    }
};

export const publishResult = async (req, res) => {
    try {
        const result = await Results.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Result record not found" });
        }

        const previousValue = { status: result.status };
        result.status = "published";
        await result.save();

        res.json(result);

        // Log result publish with rich audit details
        await logAction(req.user.id, "PUBLISH_RESULT", "Result", result._id, {
            userRole: req.user.role,
            studentId: result.studentId,
            previousValue,
            newValue: { status: "published" },
        });
    } catch (error) {
        console.error("Publish Result Error:", error);
        res.status(500).json({ message: "Publish failed" });
    }
};