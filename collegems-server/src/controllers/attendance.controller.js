import Attendance from "../models/Attendance.model.js";
import AttendanceAlert from "../models/AttendanceAlert.model.js";
import User from "../models/User.model.js";
import { logAction } from "../utils/auditService.js";
import { checkSemesterFrozen } from "../services/semesterService.js";
export const markAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    if (records && records.length > 0) {
      const firstStudent = await User.findById(records[0].studentId);
      if (firstStudent && firstStudent.semester) {
        await checkSemesterFrozen(firstStudent.semester);
      }
    }

    for (const r of records) {
      await Attendance.findOneAndUpdate(
        {
          student: r.studentId,
          date,
        },
        {
          status: r.status,
        },
        { upsert: true, new: true },
      );
    }

    res.json({ message: "Attendance saved" });

    // Log action
    await logAction(req.user.id, "UPDATE_ATTENDANCE", "Attendance", date, { recordsCount: records.length });
  } catch (err) {
    if (err.status === 403) return res.status(403).json({ message: err.message });
    res.status(500).json({ message: "Attendance failed" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
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

    const data = await Attendance.find({
      student: studentId,
    }).populate("course", "name");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getLowAttendance = async (req, res) => {
  try {
    const threshold = 75; // attendance percentage cutoff

    const result = await Attendance.aggregate([
      {
        $group: {
          _id: { student: "$student", course: "$course" },
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          percentage: {
            $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100],
          },
        },
      },
      {
        $match: { percentage: { $lt: threshold } },
      },
    ]);

    const populated = await Attendance.populate(result, [
      { path: "_id.student", select: "name email rollNumber" },
      { path: "_id.course", select: "name code" },
    ]);

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAttendanceAlerts = async (req, res) => {
  try {
    const alerts = await AttendanceAlert.find({ status: "active" })
      .populate("student", "name email studentId")
      .populate("course", "name code")
      .sort({ severity: 1, lastDetectedAt: -1 })
      .lean();

    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance alerts" });
  }
};

export const resolveAttendanceAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await AttendanceAlert.findByIdAndUpdate(
      id,
      { status: "resolved" },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ message: "Failed to resolve alert" });
  }
};