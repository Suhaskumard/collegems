import Semester from "../models/Semester.model.js";
import { logAction } from "../utils/auditService.js";

// Get all semesters and their statuses
export const getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find().sort({ semester: 1 });
    res.json(semesters);
  } catch (error) {
    console.error("Get Semesters Error:", error);
    res.status(500).json({ message: "Failed to fetch semesters" });
  }
};

// Toggle semester freeze status
export const toggleSemesterFreeze = async (req, res) => {
  try {
    const { semesterStr } = req.params;
    const { isFrozen } = req.body;

    if (typeof isFrozen !== "boolean") {
      return res.status(400).json({ message: "isFrozen must be a boolean" });
    }

    let semester = await Semester.findOne({ semester: semesterStr });
    
    if (!semester) {
      // Create it if it doesn't exist
      semester = new Semester({
        semester: semesterStr,
        isFrozen,
        frozenBy: isFrozen ? req.user.id : null,
      });
      await semester.save();
    } else {
      semester.isFrozen = isFrozen;
      semester.frozenBy = isFrozen ? req.user.id : null;
      await semester.save();
    }

    // Log the action
    const actionType = isFrozen ? "FREEZE_SEMESTER" : "UNFREEZE_SEMESTER";
    await logAction(req.user.id, actionType, "Semester", semester._id, { semester: semesterStr });

    res.json({ message: `Semester ${semesterStr} is now ${isFrozen ? "frozen" : "unfrozen"}`, data: semester });
  } catch (error) {
    console.error("Toggle Semester Freeze Error:", error);
    res.status(500).json({ message: "Failed to update semester freeze status" });
  }
};
