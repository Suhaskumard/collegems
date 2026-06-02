import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    dueDate: Date,
    totalPoints: Number,
    submissionType: {
      type: String,
      enum: ["file", "text", "link", "both"],
      default: "file"
    },
    instructionsFile: String,
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        submittedAt: Date,
        status: {
          type: String,
          enum: ["submitted", "graded"],
          default: "submitted"
        },
        textResponse: String,
        link: String,
        file: {
          url: String,
          originalName: String,
          mimeType: String,
          size: Number,
          filename: String
        },
        marks: Number
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
