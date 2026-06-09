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
  LogOut,
  Users,
  Settings,
  Sun,
  Ticket,
  Trophy,
  Wallet,
  X,
  AlertCircle,
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
import Scholarships from "../common-components-management/Scholarships";
import IDCard from "../user-components/IDCard";
import Teachers from "../hod-components/Teachers";


import IDCard from "../user-components/IDCard";
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

  const navigationItems = [
    { id: "overview",          label: "Overview",          icon: LayoutGrid },
    { id: "attendance",        label: "Attendance",        icon: CalendarCheck },
    { id: "assignments",       label: "Assignments",       icon: FileText },
    { id: "fees",              label: "Fees",              icon: Wallet },
    { id: "courses",           label: "Courses",           icon: BookOpen },
    { id: "examschedule",      label: "Exam Schedule",     icon: Calendar },
    { id: "academic-calendar", label: "Academic Calendar", icon: CalendarDays },
    { id: "events",            label: "Events",            icon: CalendarDays },
    { id: "faculty",           label: "Faculty",           icon: Users },
    { id: "results",           label: "Results",           icon: AwardIcon },
    { id: "achievements",      label: "Achievements",      icon: Trophy },
    { id: "leave",             label: "Leave Requests",    icon: ClipboardList },
    { id: "library",           label: "Library",           icon: BookOpen },
    { id: "exam-form",         label: "Examination Form",  icon: FileText },
    { id: "feedback",          label: "Feedback",          icon: MessageSquare },
    { id: "scholarships",      label: "Scholarships",      icon: AwardIcon },
    { id: "id-card",           label: "ID Card",           icon: IdCard },
    { id: "bus-routes",        label: "Bus Tracking",      icon: Bus },
    { id: "feedback",          label: "Feedback",          icon: MessageSquare }, // ← NEW
    { id: "overview",           label: "Overview",          icon: LayoutGrid },
    { id: "attendance",         label: "Attendance",        icon: CalendarCheck },
    { id: "assignments",        label: "Assignments",       icon: FileText },
    { id: "fees",               label: "Fees",              icon: Wallet },
    { id: "courses",            label: "Courses",           icon: BookOpen },
    { id: "examschedule",       label: "Exam Schedule",     icon: Calendar },
    { id: "academic-calendar",  label: "Academic Calendar", icon: CalendarDays },
    { id: "events",             label: "Events",            icon: CalendarDays },
    { id: "results",            label: "Results",           icon: AwardIcon },
    { id: "leave",              label: "Leave Requests",    icon: ClipboardList }, // ← master
    { id: "library",            label: "Library",           icon: BookOpen },
    { id: "exam-form",          label: "Examination Form",  icon: FileText },      // ← master
    { id: "scholarships",       label: "Scholarships",      icon: AwardIcon },
    { id: "id-card",            label: "ID Card",           icon: IdCard },
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "attendance", label: "Attendance", icon: CalendarCheck },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "fees", label: "Fees", icon: Wallet },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "examschedule", label: "Exam Schedule", icon: Calendar },
    { id: "academic-calendar", label: "Academic Calendar", icon: CalendarDays },
    { id: "events", label: "Events", icon: CalendarDays },
    { id: "results", label: "Results", icon: AwardIcon },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "leave", label: "Leave Requests", icon: ClipboardList },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "exam-form", label: "Examination Form", icon: FileText },
    { id: "leave", label: "Leave Requests", icon: ClipboardList },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "exam-form", label: "Examination Form", icon: FileText },
    { id: "bus-routes", label: "Bus Tracking", icon: Bus }
  ];
  const renderTab = () => {
    if (activeTab === "overview") {
      return (
        <div className="space-y-8">
          {data?.notifications && data.notifications.length > 0 && (
            <div className="space-y-4">
              {data.notifications.map((notif: any, idx: number) => (
                <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border ${notif.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  <AlertCircle className={`w-5 h-5 mt-0.5 shrink-0 ${notif.type === 'danger' ? 'text-red-600' : 'text-amber-600'}`} />
                  <div>
                    <h3 className="font-semibold">{notif.title}</h3>
                    <p className="text-sm mt-1">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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

          {/* Notifications Section */}
          {data?.notifications && data.notifications.length > 0 && (
            <div className="mb-8 space-y-4">
              {data.notifications.map((notif: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800">{notif.title}</h3>
                    <p className="text-sm text-red-700 mt-1">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content Area */}
          {activeTab === "overview" ? (
            <div className="space-y-8">

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Attendance",
                    value: data?.cards?.find((c: any) => c.title === "Attendance")?.value || "0%",
                    icon: CalendarCheck,
                    color: "blue",
                    trend: "Overall",
                  },
                  {
                    title: "Pending Assignments",
                    value: data?.cards?.find((c: any) => c.title === "Pending Assignments")?.value || "0",
                    icon: FileText,
                    color: "amber",
                    trend: "Current",
                  },
                  {
                    title: "Fee Due",
                    value: "₹" + (data?.cards?.find((c: any) => c.title === "Fee Due")?.value || "0"),
                    icon: Wallet,
                    color: "emerald",
                    trend: "Total",
                  },
                  {
                    title: "Courses",
                    value: "Active",
                    icon: BookOpen,
                    color: "purple",
                    trend: "Active",
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  const colorClasses = {
                    blue: "bg-blue-50 text-blue-700",
                    amber: "bg-amber-50 text-amber-700",
                    emerald: "bg-emerald-50 text-emerald-700",
                    purple: "bg-purple-50 text-purple-700",
                  }[stat.color];

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${colorClasses}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-sm">
                        <TrendingUp
                          className={`w-4 h-4 ${
                            stat.title === "Fee Due" && stat.value !== "₹0"
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            stat.title === "Fee Due" && stat.value !== "₹0"
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {stat.trend}
                        </span>
                        <span className="text-gray-500 ml-1">status</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Assignment Reminders widget */}
              <AssignmentReminder />

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Submit Assignment",
                      description: "You have 2 pending assignments",
                      icon: FileText,
                      color: "blue",
                      onClick: () => setActiveTab("assignments"),
                    },
                    {
                      label: "Pay Fees",
                      description: "Due date: March 15, 2024",
                      icon: Wallet,
                      color: "amber",
                      onClick: () => setActiveTab("fees"),
                    },
                    {
                      label: "Submit Feedback",
                      description: "Share your thoughts on courses and campus",
                      icon: MessageSquare,
                      color: "emerald",
                      onClick: () => setActiveTab("feedback"),
                    },
                  ].map((action, index) => {
                    const Icon = action.icon;
                    const colorClasses = {
                      blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
                      amber: "bg-amber-50 text-amber-700 hover:bg-amber-100",
                      emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                    }[action.color];

                    return (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className={`flex items-start gap-4 p-4 rounded-lg border border-gray-200
                          transition-colors text-left ${colorClasses}`}
                      >
                        <div className="p-2 rounded-lg bg-white">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.label}</p>
                          <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {data?.todayClasses && data.todayClasses.length > 0 ? (
                    data.todayClasses.slice(0, 3).map((class_: any, index: number) => {
                      const parseTime = (timeStr: string) => {
                        const [time, modifier] = timeStr.split(" ");
                        let [hours, minutes] = time.split(":");
                        if (hours === "12") hours = "00";
                        if (modifier.toUpperCase() === "PM")
                          hours = String(parseInt(hours, 10) + 12);
                        return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
                      };
                      const now = new Date();
                      const currentMinutes = now.getHours() * 60 + now.getMinutes();
                      const isUpcoming =
                        data.todayClasses.findIndex(
                          (c: any) => parseTime(c.time) >= currentMinutes
                        ) === index;

                      return (
                        <div
                          key={class_.id || index}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                            isUpcoming
                              ? "bg-blue-50 border border-blue-200 shadow-sm"
                              : "bg-gray-50 border border-transparent"
                          }`}
                        >
                          <div className={`w-16 text-sm font-medium ${isUpcoming ? "text-blue-700" : "text-gray-700"}`}>
                            {class_.time}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isUpcoming ? "text-blue-900" : "text-gray-900"}`}>
                              {class_.subject}
                            </p>
                            <p className={`text-sm ${isUpcoming ? "text-blue-600" : "text-gray-500"}`}>
                              {class_.faculty} • {class_.room} • {class_.type}
                            </p>
                          </div>
                          {isUpcoming && (
                            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full animate-pulse">
                              Next
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No classes scheduled for today.</p>
                    </div>
                  )}
                </div>
              </div>

        <UpcomingExamsWidget />
          <StudentAchievements />
            </div>
          ) : (
            <div className={activeTab === "leave" || activeTab === "achievements" ? "" : "bg-white rounded-xl border border-gray-200 p-6"}>
              {activeTab === "attendance" && <Attendance />}
              {activeTab === "assignments" && <Assignment />}
              {activeTab === "fees" && <Fees />}
              {activeTab === "courses" && <Courses />}
              {activeTab === "examschedule" && <ExamSchedule />}
              {activeTab === "academic-calendar" && <AcademicCalendar role="student" />}
              {activeTab === "events" && <EventsStudent />}
              {activeTab === "faculty" && <Teachers />}
              {activeTab === "results" && <StudentResults />}
              {activeTab === "achievements" && <StudentAchievements />}
              {activeTab === "leave" && <LeaveRequest />}
              {activeTab === "library" && <Library />}
              {activeTab === "exam-form" && <ExaminationForm />}
              {activeTab === "scholarships" && <Scholarships />}
              {activeTab === "feedback" && <StudentFeedback />}
              {activeTab === "id-card" && <IDCard student={student} />}
              {activeTab === "settings" && (
              {activeTab === "settings" && <EventsStudent />}
              {activeTab === "results"           && <StudentResults />}
              {activeTab === "leave"             && <LeaveRequest />}
              {activeTab === "library"           && <Library />}
              {activeTab === "exam-form"         && <ExaminationForm />}
              {activeTab === "scholarships"      && <Scholarships />}
              {activeTab === "feedback"          && <StudentFeedback />}
              {activeTab === "id-card"           && <IDCard student={student} />}
              {activeTab === "settings"          && (
                <div className="text-sm text-gray-600">
                  Settings are not available yet for student accounts.
                </div>
              )}
              {activeTab === "bus-routes" && <BusRoutes />}

            </div>
          )}

          {/* Footer */}
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
