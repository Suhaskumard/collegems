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
  Trophy,
  Wallet,
  X,
  AlertCircle,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Users,
  IdCard,
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
import ProfileCompletionCard from "../user-components/ProfileCompletionCard";
import PlacementEligibility from "../user-components/PlacementEligibility";
import NotificationBell from "../common-components-management/NotificationBell";
import Scholarships from "../common-components-management/Scholarships";
import IDCard from "../user-components/IDCard";
import Teachers from "../hod-components/Teachers";


import StudentResults from "../user-components/StudentResults";
import StudentSeatView from "../user-components/StudentSeatView";
import UpcomingExamsWidget from "../user-components/UpcomingExamWidget";

import ResourceBooking from "../user-components/ResourceBooking";
import AnnouncementsView from "../user-components/AnnouncementsView";
import AlumniDirectory from "../common-components-management/AlumniDirectory";
import { extractArray } from "../utils/apiHelpers";
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
  | "announcements"
  | "leave"
  | "library"
  | "exam-form"
  | "my-seat"
  | "placement"
  | "faculty"
  | "scholarships"
  | "id-card"
  | "feedback"
  | "bus-routes"
  | "settings"
  | "faculty"
  | "alumni-directory"
  | "book-resources"
  | "settings";

const navigationItems = [
  { id: "overview" as TabType, label: "Overview", icon: LayoutGrid },
  { id: "announcements" as TabType, label: "Announcements", icon: Bell },
  { id: "attendance" as TabType, label: "Attendance", icon: CalendarCheck },
  { id: "assignments" as TabType, label: "Assignments", icon: FileText },
  { id: "fees" as TabType, label: "Fees", icon: Wallet },
  { id: "courses" as TabType, label: "Courses", icon: BookOpen },
  { id: "examschedule" as TabType, label: "Exam Schedule", icon: Calendar },
  { id: "academic-calendar" as TabType, label: "Academic Calendar", icon: CalendarDays },
  { id: "events" as TabType, label: "Events", icon: CalendarDays },
  { id: "faculty" as TabType, label: "Faculty", icon: Users },
  { id: "results" as TabType, label: "Results", icon: AwardIcon },
  { id: "achievements" as TabType, label: "Achievements", icon: Trophy },
  { id: "leave" as TabType, label: "Leave Requests", icon: ClipboardList },
  { id: "library" as TabType, label: "Library", icon: BookOpen },
  { id: "exam-form" as TabType, label: "Examination Form", icon: FileText },
  { id: "scholarships" as TabType, label: "Scholarships", icon: AwardIcon },
  //{ id: "id-card" as TabType, label: "ID Card", icon: IdCard },
  { id: "feedback" as TabType, label: "Feedback", icon: MessageSquare },
  { id: "alumni-directory" as TabType, label: "Alumni Directory", icon: Users },
  { id: "placement" as TabType, label: "Placement", icon: Briefcase },
  { id: "bus-routes" as TabType, label: "Bus Tracking", icon: Bus },
  { id: "faculty" as TabType, label: "Subject Faculty", icon: GraduationCap },
  { id: "book-resources" as TabType, label: "Book Resources", icon: CalendarDays },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setShowScheduleModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setProfileData(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
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
          {data?.notifications && data.notifications.length > 0 && (
            <div className="space-y-4">
              {data.notifications.map((notif: any, idx: number) => (
                <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border ${notif.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 text-amber-800'}`}>
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
              { title: "Attendance", value: data?.cards?.find((c: any) => c.title === "Attendance")?.value || "0%", icon: CalendarCheck, color: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
              { title: "Pending Assignments", value: data?.cards?.find((c: any) => c.title === "Pending Assignments")?.value || "0", icon: FileText, color: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
              { title: "Fee Due", value: `Rs ${data?.cards?.find((c: any) => c.title === "Fee Due")?.value || "0"}`, icon: Wallet, color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
              { title: "Courses", value: "Active", icon: BookOpen, color: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
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
      <div className={activeTab === "leave" || activeTab === "achievements" || activeTab === "my-seat" ? "" : "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"}>
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
        {activeTab === "announcements" && <AnnouncementsView />}
        {activeTab === "leave" && <LeaveRequest />}
        {activeTab === "library" && <Library />}
        {activeTab === "exam-form" && <ExaminationForm />}
        {activeTab === "feedback" && <StudentFeedback />}
        {activeTab === "bus-routes" && <BusRoutes />}

        {activeTab === "book-resources" && <ResourceBooking />}
        {activeTab === "placement" && <PlacementEligibility />}
        {activeTab === "scholarships" && <Scholarships />}
        {activeTab === "id-card" && <IDCard student={student} />}
        {activeTab === "faculty" && <Teachers />}
        {activeTab === "settings" && <div className="text-sm text-gray-600 dark:text-gray-300">Settings are not available yet for student accounts.</div>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Bell className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to load dashboard</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">There was an error loading your dashboard. Please try again.</p>
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Portal</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">{studentProgram}</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
              </button>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">{student?.name || "Student"}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">ID: {student?.studentId || "Not set"}</p>
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500 dark:text-gray-400 dark:text-gray-500"}`} />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => setActiveTab("settings")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" /> Settings
            </button>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                {darkMode ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
              </button>
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {activeTab === "overview" ? `${getGreeting()}, ${student?.name?.split(" ")[0] || "Student"}!` : navigationItems.find((item) => item.id === activeTab)?.label}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Here's what's happening with your academic progress.</p>
          </div>

          {/* Content Area */}
          {activeTab === "overview" ? (
            <div className="space-y-8">
              {/* Profile Completion */}
              {profileData?.profileCompletion && (
                <ProfileCompletionCard
                  percentage={profileData.profileCompletion.percentage}
                  missingFields={profileData.profileCompletion.missingFields}
                />
              )}

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
                    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
                    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
                    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
                  }[stat.color];

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${colorClasses}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-sm">
                        <TrendingUp
                          className={`w-4 h-4 ${stat.title === "Fee Due" && stat.value !== "₹0"
                              ? "text-amber-600"
                              : "text-green-600"
                            }`}
                        />
                        <span
                          className={`font-medium ${stat.title === "Fee Due" && stat.value !== "₹0"
                              ? "text-amber-600"
                              : "text-green-600"
                            }`}
                        >
                          {stat.trend}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 ml-1">status</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Assignment Reminders widget */}
              <AssignmentReminder />

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
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
                      blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100",
                      amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100",
                      emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100",
                    }[action.color];

                    return (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className={`flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700
                          transition-colors text-left ${colorClasses}`}
                      >
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">{action.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Schedule</h2>
                  <button
                    onClick={() => { }}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
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
                          className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${isUpcoming
                              ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 shadow-sm"
                              : "bg-gray-50 dark:bg-gray-900 border border-transparent"
                            }`}
                        >
                          <div className={`w-16 text-sm font-medium ${isUpcoming ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}>
                            {class_.time}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isUpcoming ? "text-blue-900 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
                              {class_.subject}
                            </p>
                            <p className={`text-sm ${isUpcoming ? "text-blue-600" : "text-gray-500 dark:text-gray-400 dark:text-gray-500"}`}>
                              {class_.faculty} • {class_.room} • {class_.type}
                            </p>
                          </div>
                          {isUpcoming && (
                            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:text-blue-400 rounded-full animate-pulse">
                              Next
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                      <p>No classes scheduled for today.</p>
                    </div>
                  )}
                </div>
              </div>

              <UpcomingExamsWidget />
              <StudentAchievements />
            </div>
          ) : (
            <div className={activeTab === "leave" || activeTab === "achievements" ? "" : "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"}>
              {activeTab === "attendance" && <Attendance />}
              {activeTab === "assignments" && <Assignment />}
              {activeTab === "fees" && <Fees />}
              {activeTab === "courses" && <Courses />}
              {activeTab === "examschedule" && <ExamSchedule />}
              {activeTab === "academic-calendar" && <AcademicCalendar role="student" />}
              {activeTab === "events" && <EventsStudent />}

              {activeTab === "results" && <StudentResults />}
              {activeTab === "achievements" && <StudentAchievements />}
              {activeTab === "leave" && <LeaveRequest />}
              {activeTab === "library" && <Library />}
              {activeTab === "exam-form" && <ExaminationForm />}

              {activeTab === "feedback" && <StudentFeedback />}
              {activeTab === "alumni-directory" && <AlumniDirectory />}

              {activeTab === "bus-routes" && <BusRoutes />}
              {activeTab === "book-resources" && <ResourceBooking />}
              {activeTab === "settings" && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Settings are not available yet for student accounts.
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              <p>Copyright {new Date().getFullYear()} Student Portal. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-gray-900 dark:text-white">Help</a>
                <Link to="/privacy" className="hover:text-gray-900 dark:text-white">Privacy</Link>
                <a href="#" className="hover:text-gray-900 dark:text-white">Terms</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
