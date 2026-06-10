// FILE: collegems-server/src/app.js
// WHAT CHANGED: added 2 lines for feedback routes (marked ← NEW)
// Everything else is identical to your original file.

import express from "express";
import cors from "cors";
import path from "path";

// Auth & Core
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import userRoutes from "./routes/user.routes.js";

// Student / Teacher
import attendanceRoutes from "./routes/attendance.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import feeRoutes from "./routes/fee.routes.js";
import examScheduleRoutes from "./routes/examschedule.routes.js";
import classRoutes from "./routes/class.route.js";
import teacherAttendanceRoutes from "./routes/teacher.attendance.route.js";
import eventRoute from "./routes/event.routes.js";
import resultsRoutes from "./routes/results.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";

import courseRoutes from "./routes/course.routes.js";
import salaryRoutes from "./routes/salary.route.js";
import academicCalendarRoutes from "./routes/academicCalendar.routes.js";
import reportRoutes from "./routes/report.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js"; // ← NEW
import examFormRoutes from "./routes/examForm.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import scholarshipRoutes from "./routes/scholarship.routes.js";
import idCardRoutes from "./routes/idcard.routes.js";
import { verifyStudent } from "./controllers/idcard.controller.js";
import busRouteRoutes from "./routes/busRoute.routes.js";
import syllabusRoutes from "./routes/syllabus.route.js";
import officeHoursRoutes from "./routes/officeHours.routes.js";
import examHallRoutes from "./routes/examHall.routes.js";
import hallAllocationRoutes from "./routes/hallAllocation.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import { authenticate } from "./middlewares/auth.middleware.js";

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => { callback(null, true); },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth",      authRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/attendance",        authenticate, attendanceRoutes);
app.use("/api/assignment",        authenticate, assignmentRoutes);
app.use("/api/teacher-attendance", teacherAttendanceRoutes);
app.use("/api/events",            eventRoute);
app.use("/api/results",           authenticate, resultsRoutes);
app.use("/api/library",           libraryRoutes);
app.use("/api/assessments", authenticate, assessmentRoutes);

app.use("/api/resources", authenticate, resourceRoutes);
app.use("/api/bookings", authenticate, bookingRoutes);

app.use("/api/courses",  courseRoutes);
app.use("/api/classes",  classRoutes);

app.use("/api/fee",    authenticate, feeRoutes);
app.use("/api/salary", authenticate, salaryRoutes);

app.use("/api/users", authenticate, userRoutes);
app.use("/api/leaves", authenticate, leaveRoutes);
app.use("/api/scholarships", authenticate, scholarshipRoutes);
app.use("/api/examschedule", authenticate, examScheduleRoutes);
app.use("/api/exam-forms", examFormRoutes);
app.use("/api/academic-calendar", academicCalendarRoutes);
app.use("/api/syllabus", authenticate, syllabusRoutes);
app.use("/api/reports",         reportRoutes);
app.use("/api/feedback",        authenticate, feedbackRoutes);
app.use("/api/student/idcard", idCardRoutes);
app.get("/api/verify/student/:studentId", verifyStudent);
app.use("/api/bus-routes", authenticate, busRouteRoutes);
app.use("/api/office-hours", officeHoursRoutes);
app.use("/api/exam-halls", authenticate, examHallRoutes);
app.use("/api/hall-allocations", authenticate, hallAllocationRoutes);
app.use("/api/audit-logs", authenticate, auditLogRoutes);
// Health check
app.get("/", (_req, res) => res.send("SCMS Backend Running 🚀"));

export default app;
