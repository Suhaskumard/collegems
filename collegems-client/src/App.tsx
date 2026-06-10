import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoleRoute from "./routes/RoleRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

//import TimeTable from "./user-components/TimeTable";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import HodDashboard from "./pages/HODDashboard";
import MainDashboard from "./pages/MainDashboard";
import ParentDashboard from "./pages/ParentDashboard";
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
import VerifyStudent from "./pages/VerifyStudent";

import Library from "./common-components-management/Library";
import ExamHalls from "./hod-components/ExamHalls";
import HallAllocation from "./hod-components/HallAllocation";
import StudentSeatView from "./user-components/StudentSeatView";
import AuditLogs from "./hod-components/AuditLogs";
import ResourceBooking from "./user-components/ResourceBooking";
import BookingManagement from "./hod-components/BookingManagement";
import ResourceManagement from "./hod-components/ResourceManagement";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/verify/student/:studentId" element={<VerifyStudent />} />

        <Route element={<DashboardLayout />}>
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
          <Route path="/faculty" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
          <Route path="/quickaccess" element={<QuickAccessAll />} />
          <Route path="/library" element={ <Library /> } />

        </Route>

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
        <Route
          path="/teacher/dashboard"
          element={
            <RoleRoute role="teacher">
              <TeacherDashboard />
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
        <Route
          path="/hod/dashboard"
          element={
            <RoleRoute role="hod">
              <HodDashboard />
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
      </Routes>
    </BrowserRouter>
  );
}
