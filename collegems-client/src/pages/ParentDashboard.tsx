import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutGrid,
  CalendarCheck,
  AwardIcon,
  Wallet,
  CalendarDays,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  TrendingUp,
  ChevronRight,
  Moon,
  Sun,
  AlertCircle,
  Calendar,
  Users,
  Bus,
} from "lucide-react";
import api from "../api/axios";
import BusRoutes from "../common-components-management/BusRoutes";
import Attendance from "../user-components/Attendance";
import Fees from "../user-components/Fee";
import StudentResults from "../user-components/StudentResults";
import EventsStudent from "../user-components/EventsStudent";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const parent = data?.user;
  const child = data?.child;



  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "attendance", label: "Child's Attendance", icon: CalendarCheck },
    { id: "results", label: "Child's Results", icon: AwardIcon },
    { id: "fees", label: "Child's Fees", icon: Wallet },
    { id: "events", label: "College Notices", icon: CalendarDays },
    { id: "bus-routes", label: "Bus Tracking", icon: Bus },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading parent portal...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
            <Bell className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to load portal
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            There was an error loading your dashboard. Please try again.
          </p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex transition-colors">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" /> Parent Portal
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Monitoring child progress
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Child Profile Summary */}
            {child ? (
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                  Student Record
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                    {child.name?.charAt(0) || "S"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {child.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      ID: {child.studentId}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-purple-100 dark:border-purple-900/20 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Semester</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Sem {child.semester}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Course</span>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {child.course}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg text-xs text-red-600 dark:text-red-400">
                No student record linked.
              </div>
            )}
          </div>

          {/* Navigation */}
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
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      transition-colors relative
                      ${isActive
                        ? "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500"}`}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-auto text-purple-600 dark:text-purple-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="relative hidden sm:block">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search stats..."
                    className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64 text-gray-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative text-gray-600 dark:text-gray-300">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 px-3 py-2 border-l border-gray-200 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {parent?.name?.charAt(0) || "P"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {parent?.name || "Parent"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Parent Account
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {getGreeting()}, {parent?.name?.split(" ")[0] || "Parent"}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Monitoring academic progress for <span className="font-semibold text-purple-600 dark:text-purple-400">{child?.name}</span>.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-100/55 dark:border-purple-900/20 rounded-xl w-fit">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings Section */}
          {data?.notifications && data.notifications.length > 0 && (
            <div className="mb-8 space-y-4">
              {data.notifications.map((notif: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-400">{notif.title}</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content rendering */}
          {activeTab === "overview" ? (
            <div className="space-y-8">
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Child Attendance",
                    value: data?.cards?.find((c: any) => c.title === "Attendance")?.value || "0%",
                    icon: CalendarCheck,
                    color: "purple",
                    subtitle: "Target: > 75%",
                  },
                  {
                    title: "Pending Assignments",
                    value: data?.cards?.find((c: any) => c.title === "Pending Assignments")?.value || "0",
                    icon: AwardIcon,
                    color: "amber",
                    subtitle: "Awaiting submission",
                  },
                  {
                    title: "Fee Outstanding",
                    value: "₹" + (data?.cards?.find((c: any) => c.title === "Fee Due")?.value || "0"),
                    icon: Wallet,
                    color: "red",
                    subtitle: "Term fees dues",
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  const colorClasses = {
                    purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30",
                    amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30",
                    red: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30",
                  }[stat.color];

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${colorClasses}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-sm text-gray-500">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span>{stat.subtitle}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Child's Today's Schedule */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Child's Class Schedule Today
                </h2>
                <div className="space-y-4">
                  {data?.todayClasses && data.todayClasses.length > 0 ? (
                    data.todayClasses.map((class_: any, index: number) => (
                      <div
                        key={class_.id || index}
                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700"
                      >
                        <div className="w-16 text-sm font-semibold text-purple-700 dark:text-purple-400">
                          {class_.time}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {class_.subject}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Faculty: {class_.faculty} • Room: {class_.room} • {class_.type}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No classes scheduled for today.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-all">
              {activeTab === "attendance" && <Attendance />}
              {activeTab === "results" && <StudentResults />}
              {activeTab === "fees" && <Fees />}
              {activeTab === "events" && <EventsStudent />}
              {activeTab === "bus-routes" && <BusRoutes />}
            </div>
          )}

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Parent Portal. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-gray-950 dark:hover:text-white">Help</a>
                <Link to="/privacy" className="hover:text-gray-950 dark:hover:text-white">Privacy</Link>
                <a href="#" className="hover:text-gray-950 dark:hover:text-white">Terms</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
