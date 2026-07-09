import mongoose from "mongoose";
import snapshotPlugin from "../plugins/snapshotPlugin.js";

const ResultsSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },

    semester: {
        type: String,
    },

    internalMarks: { type: Number, min: 0, max: 100 },
    externalMarks: { type: Number, min: 0, max: 100 },
    practicalMarks: { type: Number, min: 0, max: 100 },

    totalMarks: { type: Number, min: 0, max: 300 },

    grade: {
        type: String,
    },

    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }

}, { timestamps: true });

ResultsSchema.plugin(snapshotPlugin);

export default mongoose.model("Results", ResultsSchema);