import Course from "../models/Course.model.js";
import Attendance from "../models/Attendance.model.js";
import Assignment from "../models/Assignment.model.js";
import Fee from "../models/Fee.model.js";
import User from "../models/User.model.js";
import Class from "../models/Classes.model.js";

export const getDashboardData = async (req, res) => {
  const { role, id } = req.user;
  const user = await User.findById(id)
    .select(
      "name email role studentId semester course teacherId department departmentCode childId",
    )
    .lean();

  // 👪 PARENT
  if (role === "parent") {
    const childId = user.childId;
    if (!childId) {
      return res.status(400).json({ message: "No child linked to parent account" });
    }
    
    const childUser = await User.findById(childId)
      .select("name email role studentId semester course")
      .lean();
      
    if (!childUser) {
      return res.status(404).json({ message: "Child student record not found" });
    }

    const total = await Attendance.countDocuments({ student: childId });
    const present = await Attendance.countDocuments({
      student: childId,
      status: "present",
    });

    const assignments = await Assignment.countDocuments({
      "submissions.student": { $ne: childId },
    });

    const fee = await Fee.findOne({ student: childId });

    const attendancePercentage = total ? Math.round((present / total) * 100) : 0;
    
    const notifications = [];
    if (total > 0 && attendancePercentage < 75) {
      notifications.push({
        id: "low_attendance",
        type: "warning",
        title: "Child's Low Attendance Alert",
        message: `${childUser.name}'s attendance is critically low (${attendancePercentage}%).`,
        date: new Date().toISOString()
      });
    }

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    
    const classes = await Class.find({ semester: parseInt(childUser.semester) || childUser.semester })
        .populate("courseName", "name")
        .populate("teacher", "name")
        .lean();

    let todayClasses = classes
      .filter((c) => c.schedule.toLowerCase().includes(today.toLowerCase()))
      .map((c) => {
        const timeMatch = c.schedule.match(/\d{1,2}:\d{2}\s*(AM|PM)/i);
        return {
          id: c._id,
          time: timeMatch ? timeMatch[0] : "09:00 AM",
          subject: c.courseName?.name || c.name,
          room: c.room || "TBD",
          type: "Lecture",
          faculty: c.teacher?.name || "Unknown",
        };
      });

    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier.toUpperCase() === 'PM') hours = parseInt(hours, 10) + 12;
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    };
    todayClasses.sort((a, b) => parseTime(a.time) - parseTime(b.time));

    return res.json({
      user,
      child: childUser,
      currentSemester: childUser?.semester,
      todayClasses,
      cards: [
        {
          title: "Attendance",
          value: total ? attendancePercentage + "%" : "0%",
        },
        { title: "Pending Assignments", value: assignments },
        { title: "Fee Due", value: fee ? fee.total - fee.paid : 0 },
      ],
      notifications
    });
  }

  // 🎓 STUDENT
  if (role === "student") {
    const total = await Attendance.countDocuments({ student: id });
    const present = await Attendance.countDocuments({
      student: id,
      status: "present",
    });

    const assignments = await Assignment.countDocuments({
      "submissions.student": { $ne: id },
    });

    const fee = await Fee.findOne({ student: id });

    const attendancePercentage = total ? Math.round((present / total) * 100) : 0;
    
    const notifications = [];
    if (total > 0 && attendancePercentage < 75) {
      notifications.push({
        id: "low_attendance",
        type: "warning",
        title: "Low Attendance Alert",
        message: `Your attendance is critically low (${attendancePercentage}%). Please maintain at least 75% to avoid academic penalties.`,
        date: new Date().toISOString()
      });
    }

    if (fee && fee.total - fee.paid > 0) {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const feeDate = new Date(fee.dueDate);
      feeDate.setHours(0, 0, 0, 0);
      
      const timeDiff = feeDate.getTime() - todayDate.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysLeft < 0) {
        notifications.push({
          id: "fee_overdue",
          type: "danger", // or "error" depending on frontend support
          title: "Fee Payment Overdue",
          message: `Your fee payment of $${fee.total - fee.paid} is OVERDUE. Please pay immediately.`,
          date: new Date().toISOString()
        });
      } else if (daysLeft <= 7) {
        notifications.push({
          id: "fee_upcoming",
          type: "warning",
          title: "Upcoming Fee Deadline",
          message: `You have a fee payment of $${fee.total - fee.paid} due in ${daysLeft} day(s).`,
          date: new Date().toISOString()
        });
      }
    }

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    
    // Fetch classes for student's semester
    const classes = await Class.find({ semester: parseInt(user.semester) || user.semester })
        .populate("courseName", "name")
        .populate("teacher", "name")
        .lean();

    // Parse classes or return mock structure if missing day/time specifics
    let todayClasses = classes
      .filter((c) => c.schedule.toLowerCase().includes(today.toLowerCase()))
      .map((c) => {
        // Simple regex to extract time if present (e.g., "10:00 AM - 11:00 AM")
        const timeMatch = c.schedule.match(/\d{1,2}:\d{2}\s*(AM|PM)/i);
        return {
          id: c._id,
          time: timeMatch ? timeMatch[0] : "09:00 AM",
          subject: c.courseName?.name || c.name,
          room: c.room || "TBD", // Database room or fallback
          type: "Lecture",
          faculty: c.teacher?.name || "Unknown",
        };
      });

    // Sort by time
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier.toUpperCase() === 'PM') hours = parseInt(hours, 10) + 12;
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    };
    todayClasses.sort((a, b) => parseTime(a.time) - parseTime(b.time));

    return res.json({
      user,
      currentSemester: user?.semester,
      todayClasses,
      cards: [
        {
          title: "Attendance",
          value: total ? attendancePercentage + "%" : "0%",
        },
        { title: "Pending Assignments", value: assignments },
        { title: "Fee Due", value: fee ? fee.total - fee.paid : 0 },
      ],
      notifications
    });
  }

  // 👨‍🏫 TEACHER
  if (role === "teacher") {
    const courses = await Course.countDocuments({ teacher: id });

    const pendingEval = await Assignment.countDocuments({
      teacher: id,
      submissions: { $elemMatch: { marks: { $exists: false } } },
    });

    return res.json({
      user,
      cards: [
        { title: "My Courses", value: courses },
        { title: "Pending Evaluations", value: pendingEval },
      ],
    });
  }

  // 🧑‍💼 HOD
  if (role === "hod") {
    const students = await User.countDocuments({ role: "student" });
    const teachers = await User.countDocuments({ role: "teacher" });
    const courses = await Course.countDocuments();
    const classes = await Class.countDocuments();

    return res.json({
      user,
      cards: [
        { title: "Students", value: students },
        { title: "Teachers", value: teachers },
        { title: "Courses", value: courses },
        { title: "Classes", value: classes },
      ],
    });
  }

  // 🛠 ADMIN
  if (role === "admin") {
    const users = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const teachers = await User.countDocuments({ role: "teacher" });

    return res.json({
      user,
      cards: [
        { title: "Total Users", value: users },
        { title: "Students", value: students },
        { title: "Teachers", value: teachers },
      ],
    });
  }

  res.status(403).json({ message: "Invalid role" });
};
