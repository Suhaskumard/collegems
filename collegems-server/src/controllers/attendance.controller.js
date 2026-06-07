import Attendance from "../models/Attendance.model.js";
import User from "../models/User.model.js";

export const markAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

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
  } catch (err) {
    res.status(500).json({ message: "Attendance failed" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    let studentId = req.user.id;
    if (req.user.role === "parent") {
      const parent = await User.findById(req.user.id);
      if (!parent || !parent.childId) {
        return res.status(400).json({ message: "No child linked to parent account" });
      }
      studentId = parent.childId;
    }

    const data = await Attendance.find({
      student: studentId,
    }).populate("course", "name");

    // Map to include subject property for frontend compatibility
    const mappedData = data.map(item => ({
      ...item.toObject(),
      subject: item.course?.name || "Unknown"
    }));

    res.json(mappedData);
  } catch (err) {
    console.error("Get attendance error:", err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

export const getLowAttendance = async (req, res) => {
  try {
    const aggregateData = await Attendance.aggregate([
      {
        $group: {
          _id: "$student",
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          student: "$_id",
          totalClasses: 1,
          presentClasses: 1,
          percentage: {
            $multiply: [
              { $divide: ["$presentClasses", "$totalClasses"] },
              100
            ]
          }
        }
      },
      {
        $match: {
          percentage: { $lt: 75 },
          totalClasses: { $gt: 0 }
        }
      }
    ]);

    await Attendance.populate(aggregateData, {
      path: "student",
      model: "User",
      select: "name email studentId course semester"
    });

    res.json(aggregateData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch low attendance data" });
  }
};
