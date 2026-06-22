import Results from "../models/Results.model.js";
import Student from "../models/User.model.js";
import Course from "../models/Course.model.js";
import { logAction } from "../utils/auditService.js";
import { publishEvent } from "../utils/rabbitmq.js";
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
            .select("marks grade status semester");

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
        const { studentId, courseId, marks, grade } = req.body;

        // ✅ find using Mongo _id
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        await checkSemesterFrozen(course.semester);

        const result = await Results.create({
            studentId,
            courseId,
            marks,
            grade,
        });
        res.status(201).json(result);

        // Log result creation
        await logAction(req.user.id, "CREATE_RESULT", "Result", result._id, { studentId, courseId, marks, grade });
    } catch (err) {
        console.log("Create Result Error:", err);
        if (err.status === 403) return res.status(403).json({ message: err.message });
        res.status(500).json({ message: "Server Error" });
    }
};

export const publishResult = async (req, res) => {
    try {
        const existingResult = await Results.findById(req.params.id).populate("courseId");
        if (!existingResult) return res.status(404).json({ message: "Result not found" });
        
        await checkSemesterFrozen(existingResult.courseId?.semester || existingResult.semester);

        const result = await Results.findByIdAndUpdate(
            req.params.id,
            { status: "published" },
            { new: true, editorId: req.user.id }
        );
        res.json(result);

        // Log result publish
        await logAction(req.user.id, "PUBLISH_RESULT", "Result", result._id, { studentId: result.studentId });
        
        // Publish Domain Event
        publishEvent("academics", "result.published", {
            studentId: result.studentId,
            courseId: result.courseId,
            resultId: result._id,
            timestamp: new Date()
        });
    } catch (error) {
        if (error.status === 403) return res.status(403).json({ message: error.message });
        res.status(500).json({ message: "Publish failed" });
    }
};