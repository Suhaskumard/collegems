import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.middleware.js";
import log from "../utils/logger.js";
import ExamSchedule from "../models/ExamSchedule.model.js";
import { checkScheduleConflicts } from "../services/calendarValidation.service.js";

const router = express.Router();

// Create exam schedule
router.post(
  "/add",
  protect,
  allowRoles("hod", "admin", "teacher"),
  asyncHandler(async (req, res) => {
    const {
      examName,
      course,
      examDate,
      startTime,
      endTime,
      location,
      venue,
    } = req.body;

    log.request("POST", "/api/examschedule/add", req.user?.id);

    if (
      !examName ||
      !course ||
      !examDate ||
      !startTime ||
      !endTime ||
      !location ||
      !venue
    ) {
      throw new AppError("All fields are required", 400, "MISSING_FIELDS");
    }

    const validation = await checkScheduleConflicts({
      date: examDate,
      startTime,
      endTime
    });

    if (validation.hasConflict) {
      throw new AppError(
        validation.conflictMessage,
        409,
        "SCHEDULE_CONFLICT"
      );
    }

    const examSchedule = await ExamSchedule.create({
      examName,
      course,
      examDate,
      startTime,
      endTime,
      location,
      venue,
    });

    log.info(`Exam schedule created: ${examName}`, { scheduleId: examSchedule._id });
    res.status(201).json({ success: true, data: examSchedule });
  })
);

// Update exam schedule
router.put(
  "/update/:id",
  protect,
  allowRoles("hod", "admin", "teacher"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      examName,
      course,
      examDate,
      startTime,
      endTime,
      location,
      venue,
    } = req.body;

    log.request("PUT", `/api/examschedule/update/${id}`, req.user?.id);

    if (!id) {
      throw new AppError("Schedule ID is required", 400, "MISSING_ID");
    }

    const validation = await checkScheduleConflicts({
      date: examDate,
      startTime,
      endTime,
      excludeId: id
    });

    if (validation.hasConflict) {
      throw new AppError(
        validation.conflictMessage,
        409,
        "SCHEDULE_CONFLICT"
      );
    }

    const examSchedule = await ExamSchedule.findByIdAndUpdate(
      id,
      { examName, course, examDate, startTime, endTime, location, venue },
      { new: true, runValidators: true }
    );

    if (!examSchedule) {
      throw new AppError("Exam schedule not found", 404, "NOT_FOUND");
    }

    log.info(`Exam schedule updated: ${examName}`, { scheduleId: id });
    res.json({ success: true, data: examSchedule });
  })
);

// Delete exam schedule
router.delete(
  "/delete/:id",
  protect,
  allowRoles("hod", "admin", "teacher"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    log.request("DELETE", `/api/examschedule/delete/${id}`, req.user?.id);

    if (!id) {
      throw new AppError("Schedule ID is required", 400, "MISSING_ID");
    }

    const examSchedule = await ExamSchedule.findByIdAndDelete(id);
    if (!examSchedule) {
      throw new AppError("Exam schedule not found", 404, "NOT_FOUND");
    }

    log.info(`Exam schedule deleted: ${examSchedule.examName}`, { scheduleId: id });
    res.json({ success: true, message: "Exam schedule deleted successfully" });
  })
);

// Get upcoming exams for a student
router.get(
  "/upcoming",
  protect,
  allowRoles("student"),
  asyncHandler(async (req, res) => {
    const studentCourse = req.user.course;

    if (!studentCourse) {
      return res.json({ success: true, data: [] });
    }

    // Configurable date range (default 14 days)
    const days = parseInt(req.query.days) || 14;
    
    // Get current date and future date as YYYY-MM-DD strings
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    // Adjust for timezone differences by taking local date string
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(today);
    const futureDateStr = formatDate(futureDate);

    log.request("GET", "/api/examschedule/upcoming", req.user?.id);

    const upcomingExams = await ExamSchedule.find({
      course: studentCourse,
      examDate: {
        $gte: todayStr,
        $lte: futureDateStr
      }
    }).sort({ examDate: 1, startTime: 1 });

    res.json({ success: true, data: upcomingExams });
  })
);

// Get all exam schedules
router.get(
  "/all",
  protect,
  allowRoles("student", "teacher", "admin", "hod", "parent"),
  async (req, res) => {
    const examSchedule = await ExamSchedule.find({});
    res.json({ success: true, data: examSchedule });
  }
);

export default router;
