import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Lock, Unlock, Plus } from "lucide-react";

interface Semester {
  semester: string;
  isFrozen: boolean;
  frozenAt?: string;
}

const SemesterManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [customSemester, setCustomSemester] = useState("");

  const defaultSemesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/semesters");
      setSemesters(data);
    } catch (error) {
      console.error("Error fetching semesters", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const toggleFreeze = async (semesterStr: string, currentStatus: boolean) => {
    try {
      const isFrozen = !currentStatus;
      await api.post(`/semesters/${semesterStr}/toggle`, { isFrozen });
      fetchSemesters();
    } catch (error: any) {
      console.error("Error toggling freeze status", error);
      alert(error.response?.data?.message || "Failed to toggle freeze status.");
    }
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSemester.trim()) return;
    
    // We just display it by trying to freeze it. If they add it, let's freeze it by default to register it.
    toggleFreeze(customSemester.trim(), false);
    setCustomSemester("");
  };

  // Merge default semesters with fetched ones
  const displayList = [...defaultSemesters];
  semesters.forEach((sem) => {
    if (!displayList.includes(sem.semester)) {
      displayList.push(sem.semester);
    }
  });
  
  // Sort numeric strings correctly
  displayList.sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading semester data...</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Freeze Semesters</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Marking a semester as completed (frozen) prevents any accidental modifications to its academic data (Results, Attendance, Assignments, Timetable).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {displayList.map((semStr) => {
            const dbSem = semesters.find((s) => s.semester === semStr);
            const isFrozen = dbSem ? dbSem.isFrozen : false;

            return (
              <div
                key={semStr}
                className={`p-4 border rounded-xl flex items-center justify-between transition-colors ${
                  isFrozen
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                    : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                }`}
              >
                <div>
                  <h3 className={`font-semibold ${isFrozen ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                    Semester {semStr}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                    isFrozen ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-700"
                  }`}>
                    {isFrozen ? "Completed (Frozen)" : "Active"}
                  </span>
                </div>
                <button
                  onClick={() => toggleFreeze(semStr, isFrozen)}
                  className={`p-2 rounded-full transition-colors ${
                    isFrozen
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
                  title={isFrozen ? "Unfreeze Semester" : "Freeze Semester"}
                >
                  {isFrozen ? <Lock size={18} /> : <Unlock size={18} />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add Custom Semester (e.g. "Fall 2024")</h3>
          <form onSubmit={handleCustomAdd} className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={customSemester}
              onChange={(e) => setCustomSemester(e.target.value)}
              placeholder="Semester identifier"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!customSemester.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} /> Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SemesterManagement;
