import Assignment from "../models/Assignment.model.js";
import mongoose from "mongoose";

export const createAssignment = async (req, res) => {
  try {
    const { title, courseId, dueDate, description, submissionType } = req.body;
    const totalPointsRaw =
      req.body.totalPoints !== undefined
        ? req.body.totalPoints
        : req.body.maxMarks;

    if (!title || !courseId || !dueDate) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const totalPoints =
      totalPointsRaw !== undefined && totalPointsRaw !== ""
        ? Number(totalPointsRaw)
        : undefined;

    if (totalPointsRaw !== undefined && Number.isNaN(totalPoints)) {
      return res.status(400).json({
        message: "Invalid total points",
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      teacher: req.user.id,
      dueDate,
      totalPoints,
      submissionType: submissionType || "file",
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Create Assignment Error:", error);
    res.status(500).json({
      message: "Failed to create assignment",
    });
  }
};

// submit assignment
export const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const alreadySubmitted = assignment.submissions.some(
      (s) => s.student.toString() === req.user.id,
    );

    if (alreadySubmitted) {
      return res.status(400).json({
        message: "Assignment already submitted",
      });
    }

    const submissionType = assignment.submissionType || "file";
    const textResponse =
      typeof req.body.textResponse === "string"
        ? req.body.textResponse.trim()
        : "";
    const link =
      typeof req.body.link === "string" ? req.body.link.trim() : "";
    const hasFile = Boolean(req.file);
    const hasText = Boolean(textResponse);
    const hasLink = Boolean(link);

    if (submissionType === "file" && !hasFile) {
      return res.status(400).json({ message: "File is required" });
    }

    if (submissionType === "text" && !hasText) {
      return res.status(400).json({ message: "Text response is required" });
    }

    if (submissionType === "link" && !hasLink) {
      return res.status(400).json({ message: "Link is required" });
    }

    if (submissionType === "both" && (!hasFile || !hasText)) {
      return res.status(400).json({
        message: "File and text response are required",
      });
    }

    if (hasLink) {
      try {
        const parsed = new URL(link);
        if (!/^https?:$/.test(parsed.protocol)) {
          return res.status(400).json({ message: "Invalid link" });
        }
      } catch {
        return res.status(400).json({ message: "Invalid link" });
      }
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const submission = {
      student: req.user.id,
      submittedAt: new Date(),
      status: "submitted",
      textResponse: hasText ? textResponse : undefined,
      link: hasLink ? link : undefined,
      file: req.file
        ? {
            url: `${baseUrl}/uploads/assignments/${req.file.filename}`,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            filename: req.file.filename,
          }
        : undefined,
    };

    assignment.submissions.push(submission);

    await assignment.save();

    res.json({ message: "Assignment submitted", submission });
  } catch (error) {
    console.error("Submit Assignment Error:", error);
    res.status(500).json({ message: "Submission failed" });
  }
};

// evaluate assignment
export const evaluateAssignment = async (req, res) => {
  try {
    const { studentId, marks } = req.body;

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const submission = assignment.submissions.find(
      (s) => s.student.toString() === studentId,
    );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    submission.marks = marks;
    await assignment.save();

    res.json({ message: "Assignment evaluated" });
  } catch (error) {
    console.error("Evaluate Assignment Error:", error);
    res.status(500).json({
      message: "Evaluation failed",
    });
  }
};
