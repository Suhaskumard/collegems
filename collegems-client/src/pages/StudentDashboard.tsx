import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AwardIcon,
  Bell,
  BookOpen,
  Bus,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  Ticket,
  Trophy,
  Wallet,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import AcademicCalendar from "../common-components-management/AcademicCalendar";
import AssignmentReminder from "../common-components-management/AssignmentReminder";
import BusRoutes from "../common-components-management/BusRoutes";
import Library from "../common-components-management/Library";
import Assignment from "../user-components/Assignment";
import Attendance from "../user-components/Attendance";
import Courses from "../user-components/Courses";
import ExamSchedule from "../user-components/ExamSchedule";
import ExaminationForm from "../user-components/ExaminationForm";
import EventsStudent from "../user-components/EventsStudent";
import Fees from "../user-components/Fee";
import StudentFeedback from "../user-components/Feedback";
import LeaveRequest from "../user-components/LeaveRequest";
import StudentAchievements from "../user-components/StudentAchievements";
import StudentResults from "../user-components/StudentResults";
import StudentSeatView from "../user-components/StudentSeatView";
import UpcomingExamsWidget from "../user-components/UpcomingExamWidget";

type TabType =
  | "overview"
  | "attendance"
  | "assignments"
  | "fees"
  | "courses"
  | "examschedule"
  | "academic-calendar"
  | "events"
  | "results"
  | "achievements"
  | "leave"
  | "library"
  | "exam-form"
  | "my-seat"
  | "feedback"
  | "bus-routes"
  | "settings";

const navigationItems = [
  { id: "overview" as TabType, label: "Overview", icon: LayoutGrid },
  { id: "attendance" as TabType, label: "Attendance", icon: CalendarCheck },
  { id: "assignments" as TabType, label: "Assignments", icon: FileText },
  { id: "fees" as TabType, label: "Fees", icon: Wallet },
  { id: "courses" as TabType, label: "Courses", icon: BookOpen },
  { id: "examschedule" as TabType, label: "Exam Schedule", icon: Calendar },
  { id: "my-seat" as TabType, label: "My Exam Seat", icon: Ticket },
  { id: "academic-calendar" as TabType, label: "Academic Calendar", icon: CalendarDays },
  { id: "events" as TabType, label: "Events", icon: CalendarDays },
  { id: "results" as TabType, label: "Results", icon: AwardIcon },
  { id: "achievements" as TabType, label: "Achievements", icon: Trophy },
  { id: "leave" as TabType, label: "Leave Requests", icon: ClipboardList },
  { id: "library" as TabType, label: "Library", icon: BookOpen },
  { id: "exam-form" as TabType, label: "Examination Form", icon: FileText },
  { id: "feedback" as TabType, label: "Feedback", icon: MessageSquare },
  { id: "bus-routes" as TabType, label: "Bus Tracking", icon: Bus },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const student = data?.user;
  const studentProgram = student?.course
    ? `${student.course}${student.semester ? ` - Sem ${student.semester}` : ""}`
    : "Course not set";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const renderTab = () => {
    if (activeTab === "overview") {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Attendance", value: data?.cards?.find((c: any) => c.title === "Attendance")?.value || "0%", icon: CalendarCheck, color: "bg-blue-50 text-blue-700" },
              { title: "Pending Assignments", value: data?.cards?.find((c: any) => c.title === "Pending Assignments")?.value || "0", icon: FileText, color: "bg-amber-50 text-amber-700" },
              { title: "Fee Due", value: `Rs ${data?.cards?.find((c: any) => c.title === "Fee Due")?.value || "0"}`, icon: Wallet, color: "bg-emerald-50 text-emerald-700" },
              { title: "Courses", value: "Active", icon: BookOpen, color: "bg-purple-50 text-purple-700" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <AssignmentReminder />
          <UpcomingExamsWidget />
          <StudentAchievements />
        </div>
      );
    }

    return (
      <div className={activeTab === "leave" || activeTab === "achievements" || activeTab === "my-seat" ? "" : "bg-white rounded-xl border border-gray-200 p-6"}>
        {activeTab === "attendance" && <Attendance />}
        {activeTab === "assignments" && <Assignment />}
        {activeTab === "fees" && <Fees />}
        {activeTab === "courses" && <Courses />}
        {activeTab === "examschedule" && <ExamSchedule />}
        {activeTab === "my-seat" && <StudentSeatView />}
        {activeTab === "academic-calendar" && <AcademicCalendar role="student" />}
        {activeTab === "events" && <EventsStudent />}
        {activeTab === "results" && <StudentResults />}
        {activeTab === "achievements" && <StudentAchievements />}
        {activeTab === "leave" && <LeaveRequest />}
        {activeTab === "library" && <Library />}
        {activeTab === "exam-form" && <ExaminationForm />}
        {activeTab === "feedback" && <StudentFeedback />}
        {activeTab === "bus-routes" && <BusRoutes />}
        {activeTab === "settings" && <div className="text-sm text-gray-600">Settings are not available yet for student accounts.</div>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Bell className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
          <p className="text-gray-600 mb-6">There was an error loading your dashboard. Please try again.</p>
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Student Portal</h2>
                <p className="text-sm text-gray-500 mt-1">{studentProgram}</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-gray-900">{student?.name || "Student"}</p>
              <p className="text-xs text-gray-600 mt-1">ID: {student?.studentId || "Not set"}</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button onClick={() => setActiveTab("settings")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <Settings className="w-4 h-4 text-gray-500" /> Settings
            </button>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <LogOut className="w-4 h-4 text-gray-500" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 rounded-lg">
                {darkMode ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {activeTab === "overview" ? `${getGreeting()}, ${student?.name?.split(" ")[0] || "Student"}!` : navigationItems.find((item) => item.id === activeTab)?.label}
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your academic progress.</p>
          </div>
          {renderTab()}
          <footer className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <p>Copyright {new Date().getFullYear()} Student Portal. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-gray-900">Help</a>
                <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
                <a href="#" className="hover:text-gray-900">Terms</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
