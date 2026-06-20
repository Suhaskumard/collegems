import AcademicCalendar from "./common-components-management/AcademicCalendar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoleRoute from "./routes/RoleRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import TimeTable from "./user-components/TimeTable";

import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import HodDashboard from "./pages/HODDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import MainDashboard from "./pages/MainDashboard";
import DashboardLayout from "./layouts/DashboardLayout";

import ExamSchedule from "./user-components/ExamSchedule";
import Courses from "./user-components/Courses";
import Teachers from "./hod-components/Teachers";
import StudentResults from "./user-components/StudentResults";
import EventsStudent from "./user-components/EventsStudent";
import QuickAccessAll from "./pages/QuickAccessAll";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReportGenerator from "./pages/ReportGenerator";
import ExaminationFormPage from "./pages/ExaminationFormPage";

import LostFoundPortal from "./pages/LostFoundPortal";
import VerifyStudent from "./pages/VerifyStudent";
import RiskDashboard from "./pages/RiskDashboard";


import Library from "./common-components-management/Library";
import ExamHalls from "./hod-components/ExamHalls";
import HallAllocation from "./hod-components/HallAllocation";
import StudentSeatView from "./user-components/StudentSeatView";
import AuditLogs from "./hod-components/AuditLogs";
import ResourceBooking from "./user-components/ResourceBooking";
import BookingManagement from "./hod-components/BookingManagement";
import ResourceManagement from "./hod-components/ResourceManagement";
import AnnouncementForm from "./common-components-management/AnnouncementForm";
import AnnouncementManage from "./common-components-management/AnnouncementManage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/verify/student/:studentId" element={<VerifyStudent />} />

        {/* Dashboard Layout */}
        <Route element={<DashboardLayout />}>

        

          {/* student/user pages */}
          <Route path="/examschedule" element={<ExamSchedule />} />
          <Route path="/results" element={<StudentResults />} />
          <Route path="/events" element={<EventsStudent />} />
          {/* <Route path="/calendar" element={<AcademicCalendar />} /> */}
          <Route path="/calendar" element={<AcademicCalendar />} />

          {/* Student/User Pages */}
          <Route path="/examschedule" element={<ExamSchedule />} />
          <Route path="/results" element={<StudentResults />} />
          <Route path="/events" element={<EventsStudent />} />


          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty"
            element={
              <ProtectedRoute>
                <Teachers />
              </ProtectedRoute>
            }
          />

          <Route path="/quickaccess" element={<QuickAccessAll />} />

           <Route path="/timetable" element={ <TimeTable /> } /> 


          {/* Your Added Feature */}
          <Route path="/lost-found" element={<LostFoundPortal />} />

          <Route path="/timetable" element={<TimeTable />} />

          {/* Existing Project Features */}
          <Route path="/library" element={<Library />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <RoleRoute role="student">
              <StudentDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/student/exam-form"
          element={
            <RoleRoute role="student">
              <ExaminationFormPage />
            </RoleRoute>
          }
        />

        <Route
          path="/student/my-seat"
          element={
            <RoleRoute role="student">
              <StudentSeatView />
            </RoleRoute>
          }
        />

        <Route
          path="/student/book-resources"
          element={
            <RoleRoute role="student">
              <ResourceBooking />
            </RoleRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <RoleRoute role="teacher">
              <TeacherDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/teacher/announcements"
          element={
            <RoleRoute role="teacher">
              <TeacherDashboard initialTab="announcements" />
            </RoleRoute>
          }
        />
        <Route
          path="/teacher/book-resources"
          element={
            <RoleRoute role="teacher">
              <ResourceBooking />
            </RoleRoute>
          }
        />

        {/* HOD Routes */}
        <Route
          path="/hod/dashboard"
          element={
            <RoleRoute role="hod">
              <HodDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/hod/reports"
          element={
            <RoleRoute role="hod">
              <ReportGenerator />
            </RoleRoute>
          }
        />



        <Route
          path="/hod/exam-halls"
          element={
            <RoleRoute role="hod">
              <ExamHalls />
            </RoleRoute>
          }
        />

        <Route
          path="/hod/hall-allocation"
          element={
            <RoleRoute role="hod">
              <HallAllocation />
            </RoleRoute>
          }
        />

        <Route
          path="/hod/audit-logs"
          element={
            <RoleRoute role="hod">
              <AuditLogs />
            </RoleRoute>
          }
        />

        <Route
          path="/hod/manage-bookings"
          element={
            <RoleRoute role="hod">
              <BookingManagement />
            </RoleRoute>
          }
        />

        <Route
          path="/hod/manage-resources"
          element={
            <RoleRoute role="hod">
              <ResourceManagement />
            </RoleRoute>
          }
        />

        <Route
          path="/parent/dashboard"
          element={
            <RoleRoute role="parent">
              <ParentDashboard />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
