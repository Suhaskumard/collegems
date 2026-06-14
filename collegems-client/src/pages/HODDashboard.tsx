import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutGrid, Users, GraduationCap, BookOpen, Building2, FileText,
  Wallet, DollarSign, Calendar, Menu, X, RefreshCw, ChevronRight,
  Bell, Search, UserCircle, LogOut, Settings, CalendarDays,
  Moon, Sun, MessageSquare, Award, Bus,
} from "lucide-react";
import api from "../api/axios";
import Students from "../common-components-management/Students";
import HODSalary from "../hod-components/Salary";
import HODTeacherAttendance from "../hod-components/TeacherAttendance";
import AcademicCalendar from "../common-components-management/AcademicCalendar";
import Teachers from "../hod-components/Teachers";
import Library from "../common-components-management/Library";
import HODSettings from "../hod-components/Settings";
import HODCourses from "../hod-components/Courses";
import HODExamForms from "../hod-components/ExamForms";
import AnnouncementForm from "../common-components-management/AnnouncementForm";
import AnnouncementManage from "../common-components-management/AnnouncementManage";
import FeedbackManagement from "../hod-components/FeedbackManagement";
import Scholarships from "../common-components-management/Scholarships";
import BusRoutes from "../common-components-management/BusRoutes";
import ExamHalls from "../hod-components/ExamHalls";
import HallAllocation from "../hod-components/HallAllocation";
import AuditLogs from "../hod-components/AuditLogs";
import BookingManagement from "../hod-components/BookingManagement";
import ResourceManagement from "../hod-components/ResourceManagement";

type TabType =
  | "overview"
  | "analytics"
  | "announcements"
  | "teachers"
  | "teachers-attendance"
  | "students"
  | "courses"
  | "classes"
  | "syllabus"
  | "fees"
  | "salary"
  | "examSchedule"
  | "events"
  | "academic-calendar"
  | "library"
  | "settings"
  | "reports"
  | "exam-forms"
  | "feedback"
  | "scholarships"
  | "bus-routes"
  | "exam-halls"
  | "hall-allocation"
  | "audit-logs"
  | "manage-bookings"
  | "manage-resources";

interface Data {
  cards: Array<{ title: string; value: number }>;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalClassess: number;
}

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  departmentCode?: string;
  role: string;
  avatarUrl?: string;
}

export default function HODDashboard() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileRefreshing, setProfileRefreshing] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<Date | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [searchData, setSearchData] = useState({
    students: [],
    teachers: [],
    courses: [],
  });

  const [searchResults, setSearchResults] = useState({
    students: [],
    teachers: [],
    courses: [],
  });

  useEffect(() => {
    fetchDashboardData();
    fetchProfileData();
    fetchSearchData();
    const refreshProfile = () => fetchProfileData(true);
    const profileInterval = window.setInterval(refreshProfile, 15000);
    window.addEventListener("focus", refreshProfile);
    return () => {
      window.clearInterval(profileInterval);
      window.removeEventListener("focus", refreshProfile);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async (silent = false) => {
    try {
      if (silent) setProfileRefreshing(true);
      else setProfileLoading(true);
      const res = await api.get("/users/me");
      const user = res.data;
      if (user?.role !== "hod") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userData");
        navigate("/login", { replace: true });
        return;
      }
      setProfile({
        name: user.name || "", email: user.email || "",
        phone: user.phone || "", department: user.department || "",
        departmentCode: user.departmentCode || "", role: user.role || "hod",
        avatarUrl: user.avatarUrl || user.profilePicture || user.photo,
      });
      setProfileError(null);
      setProfileUpdatedAt(new Date());
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userData");
        navigate("/login", { replace: true });
        return;
      }
      setProfileError(error?.response?.data?.message || "Unable to load HOD profile.");
    } finally {
      setProfileLoading(false);
      setProfileRefreshing(false);
    }
  };

  const fetchSearchData = async () => {
    try {
      const [studentsRes, teachersRes, coursesRes] = await Promise.all([
        api.get("/users/students"),
        api.get("/users/teachers"),
        api.get("/courses/all"),
      ]);

      setSearchData({
        students: studentsRes.data?.data || studentsRes.data || [],
        teachers: teachersRes.data || [],
        courses: coursesRes.data || [],
      });
    } catch (error) {
      console.error("Error loading search data:", error);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults({
        students: [],
        teachers: [],
        courses: [],
      });
      return;
    }

    const query = searchTerm.toLowerCase();

    setSearchResults({
      students: searchData.students.filter(
        (student: any) =>
          student.name?.toLowerCase().includes(query) ||
          student.email?.toLowerCase().includes(query)
      ),
      teachers: searchData.teachers.filter(
        (teacher: any) =>
          teacher.name?.toLowerCase().includes(query) ||
          teacher.email?.toLowerCase().includes(query)
      ),
      courses: searchData.courses.filter(
        (course: any) =>
          course.name?.toLowerCase().includes(query) ||
          course.code?.toLowerCase().includes(query) ||
          course.department?.toLowerCase().includes(query)
      ),
    });
  }, [searchData, searchTerm]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    navigate("/login", { replace: true });
  };

  const navigationItems = [
    { id: "overview" as TabType, label: "Overview", icon: LayoutGrid },
    { id: "announcements" as TabType, label: "Announcements", icon: Bell },
    { id: "teachers" as TabType, label: "Teachers", icon: Users },
    { id: "teachers-attendance" as TabType, label: "Teachers Attendance", icon: Users },
    { id: "students" as TabType, label: "Students", icon: GraduationCap },
    { id: "academic-calendar" as TabType, label: "Academic Calendar", icon: Calendar },
    { id: "courses" as TabType, label: "Courses", icon: BookOpen },
    { id: "classes" as TabType, label: "Classes", icon: Building2 },
    { id: "syllabus" as TabType, label: "Syllabus", icon: FileText },
    { id: "fees" as TabType, label: "Fees", icon: Wallet },
    { id: "salary" as TabType, label: "Salary", icon: DollarSign },
    { id: "examSchedule" as TabType, label: "Exam Schedule", icon: Calendar },
    { id: "events" as TabType, label: "Organize Events", icon: CalendarDays },
    { id: "library" as TabType, label: "Library Catalog", icon: BookOpen },
    { id: "reports" as TabType, label: "Report Generator", icon: FileText },
    { id: "feedback" as TabType, label: "Feedback", icon: MessageSquare },
    { id: "exam-forms" as TabType, label: "Exam Forms", icon: FileText },
    { id: "scholarships" as TabType, label: "Scholarship Approvals", icon: Award },
    { id: "bus-routes" as TabType, label: "Bus Routes Management", icon: Bus },
    { id: "exam-halls" as TabType, label: "Exam Halls", icon: Building2 },
    { id: "hall-allocation" as TabType, label: "Hall Allocation", icon: Users },
    { id: "audit-logs" as TabType, label: "Audit Logs", icon: FileText },
    { id: "manage-bookings" as TabType, label: "Manage Bookings", icon: Calendar },
    { id: "manage-resources" as TabType, label: "Manage Resources", icon: Building2 },
  ];

  const statsCards = (data?.cards || []).map((card, index) => ({
    ...card,
    icon: [Users, GraduationCap, BookOpen, Building2][index % 4],
    color: ["bg-blue-50 text-blue-700", "bg-amber-50 text-amber-700", "bg-emerald-50 text-emerald-700", "bg-purple-50 text-purple-700"][index % 4],
  }));

  const activeLabel = navigationItems.find((item) => item.id === activeTab)?.label || "Overview";
  const profileDepartment = profile?.department || profile?.departmentCode || "Department not set";
  const profileInitials = profile?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const renderTab = () => {
    if (activeTab === "overview") {
      return (
        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile?.name || "HOD Profile"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profileDepartment}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{profile?.email || "No email available"}</p>
          </section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const placeholders: Partial<Record<TabType, string>> = {
      classes: "Class management is not connected on this dashboard yet.",
      syllabus: "Syllabus management is not connected on this dashboard yet.",
      fees: "Fee management is not connected on this dashboard yet.",
      examSchedule: "Use the exam schedule route to manage exam schedules.",
      events: "Event management is not connected on this dashboard yet.",
    };

    if (placeholders[activeTab]) {
      return <div className="text-sm text-gray-600 dark:text-gray-300">{placeholders[activeTab]}</div>;
    }

    return (
      <>
        {activeTab === "announcements" && (
          <div className="space-y-8">
            <AnnouncementForm />
            <hr className="border-gray-200 dark:border-gray-700" />
            <AnnouncementManage />
          </div>
        )}
        {activeTab === "teachers" && <Teachers />}
        {activeTab === "teachers-attendance" && <HODTeacherAttendance />}
        {activeTab === "students" && <Students />}
        {activeTab === "salary" && <HODSalary />}
        {activeTab === "academic-calendar" && <AcademicCalendar role="hod" />}
        {activeTab === "library" && <Library />}
        {activeTab === "courses" && <HODCourses />}
        {activeTab === "settings" && <HODSettings />}
        {activeTab === "feedback" && <FeedbackManagement />}
        {activeTab === "exam-forms" && <HODExamForms />}
        {activeTab === "scholarships" && <Scholarships />}
        {activeTab === "bus-routes" && <BusRoutes />}
        {activeTab === "exam-halls" && <ExamHalls />}
        {activeTab === "hall-allocation" && <HallAllocation />}
        {activeTab === "audit-logs" && <AuditLogs />}
        {activeTab === "manage-bookings" && <BookingManagement />}
        {activeTab === "manage-resources" && <ResourceManagement />}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">HOD Portal</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profileDepartment}</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
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
                      if (item.id === ("reports" as TabType)) {
                        navigate("/hod/reports");
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500 dark:text-gray-400"}`} />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => setActiveTab("settings")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Settings
            </button>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="relative hidden sm:block w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students, teachers, courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {searchTerm && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {(["students", "teachers", "courses"] as const).map((group) => (
                      <div key={group} className="p-2">
                        <h4 className="font-bold text-blue-600 capitalize">{group}</h4>
                        {searchResults[group].map((item: any) => (
                          <div key={item._id} className="p-2 border-b border-gray-100 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200">
                            {item.name || item.email || item.code}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                {darkMode ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
             <button
                onClick={() => navigate("/announcements")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                {profileInitials || "H"}
              </div>
              <button onClick={fetchDashboardData} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Refresh">
                <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{activeLabel}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {activeTab === "overview" ? "Welcome back. Here's what's happening with your department today." : `Manage ${activeLabel.toLowerCase()}.`}
            </p>
          </div>
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
