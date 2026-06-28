import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

import courseRoutes from "./routes/course.routes.js";
import salaryRoutes from "./routes/salary.route.js";
import academicCalendarRoutes from "./routes/academicCalendar.routes.js";
import reportRoutes from "./routes/report.routes.js";
import examFormRoutes from "./routes/examForm.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import visitorRoutes from "./routes/visitors.routes.js";

import { authenticate } from "./middlewares/auth.middleware.js";

const app = express();

// Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5555"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/attendance", authenticate, attendanceRoutes);
app.use("/api/assignment", authenticate, assignmentRoutes);
app.use("/api/teacher-attendance", teacherAttendanceRoutes);
app.use("/api/events", eventRoute);
app.use("/api/results", authenticate, resultsRoutes);
app.use("/api/library", libraryRoutes);

app.use("/api/courses", courseRoutes);
app.use("/api/classes", classRoutes);

app.use("/api/fee", authenticate, feeRoutes);
app.use("/api/salary", authenticate, salaryRoutes);

app.use("/api/users", authenticate, userRoutes);
app.use("/api/leaves", authenticate, leaveRoutes);
app.use("/api/examschedule", authenticate, examScheduleRoutes);
app.use("/api/exam-forms", examFormRoutes);
app.use("/api/academic-calendar", academicCalendarRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/visitors", visitorRoutes);

// Health check (optional but useful)
app.get("/", (req, res) => {
  res.send("SCMS Backend Running 🚀");
});

export default app;
