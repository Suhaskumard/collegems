import Results from "../models/Results.model.js";
import Student from "../models/User.model.js";
import Course from "../models/Course.model.js";

export const getResults = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        let studentId = req.user.id;
        if (req.user.role === "parent") {
            const parent = await Student.findById(req.user.id);
            if (!parent || !parent.childId) {
                return res.status(400).json({
                    message: "No child linked to parent account",
                });
            }
            studentId = parent.childId;
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

        const result = await Results.create({
            studentId,
            courseId,
            marks,
            grade,
        });

        res.status(201).json(result);
    } catch (err) {
        console.log("Create Result Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const publishResult = async (req, res) => {
    try {
        const result = await Results.findByIdAndUpdate(
            req.params.id,
            { status: "published" },
            { new: true }
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Publish failed" });
    }
};