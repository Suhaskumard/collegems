import { useEffect, useState } from "react";
import {
  FileText,
  BookOpen,
  Award,
  Loader2,
  GraduationCap,
  TrendingUp,
  Download,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Printer,
} from "lucide-react";
import axios from "../api/axios";
import { extractArray } from "../utils/apiHelpers";


interface Course {
  _id: string;
  name: string;
  code: string;
  credits?: number;
}

interface Result {
  _id: string;
  courseId: Course;
  semester: string;
  internalMarks: number;
  externalMarks: number;
  practicalMarks: number;
  totalMarks: number;
  grade: string;
  published: boolean;
  createdAt: string;
}

interface ResultSummary {
  totalCredits: number;
  earnedCredits: number;
  totalMarks: number;
  percentage: number;
  sgpa?: number;
  cgpa?: number;
}

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case "A+":
    case "A":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "B":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "C":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "D":
      return "text-orange-700 bg-orange-50 border-orange-200";
    default:
      return "text-rose-700 bg-rose-50 border-rose-200";
  }
};

const getGradeIcon = (grade: string) => {
  switch (grade.charAt(0)) {
    case "A":
      return "🏆";
    case "B":
      return "📚";
    case "C":
      return "📝";
    default:
      return "📖";
  }
};

export default function StudentResults() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/results/my");
      setResults(extractArray(res.data));
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique semesters for filter
  const semesters = ["all", ...new Set(results.map((r) => r.semester))];

  // Filter results
  const filteredResults = results.filter((result) => {
    const matchesSemester = filterSemester === "all" || result.semester === filterSemester;
    const matchesSearch = 
      result.courseId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.courseId.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSemester && matchesSearch;
  });

  // Calculate summary statistics
  const summary: ResultSummary = {
    totalCredits: results.reduce((acc, r) => acc + (r.courseId.credits || 3), 0),
    earnedCredits: results.filter(r => r.grade !== "F").reduce((acc, r) => acc + (r.courseId.credits || 3), 0),
    totalMarks: results.reduce((acc, r) => acc + r.totalMarks, 0),
    percentage: results.length > 0 
      ? Math.round((results.reduce((acc, r) => acc + r.totalMarks, 0) / (results.length * 100)) * 100) 
      : 0,
    sgpa: results.length > 0 
      ? parseFloat((results.reduce((acc, r) => {
          const gradePoints = 
            r.grade === "A+" ? 10 :
            r.grade === "A" ? 9 :
            r.grade === "B" ? 8 :
            r.grade === "C" ? 7 :
            r.grade === "D" ? 6 : 0;
          return acc + (gradePoints * (r.courseId.credits || 3));
        }, 0) / results.reduce((acc, r) => acc + (r.courseId.credits || 3), 0)).toFixed(2))
      : undefined,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const resultsData = filteredResults.map(r => ({
      "Course Name": r.courseId.name,
      "Course Code": r.courseId.code,
      "Semester": r.semester,
      "Internal": r.internalMarks,
      "External": r.externalMarks,
      "Practical": r.practicalMarks,
      "Total": r.totalMarks,
      "Grade": r.grade,
    }));

    const csvContent = [
      Object.keys(resultsData[0]).join(","),
      ...resultsData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <>
        <div className="min-h-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading your results...</p>
          </div>
        </div>
      </>
    );
  }

  if (!results.length) {
    return (

      <>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Yet</h3>
          <p className="text-gray-500 mb-6">
            Your results haven't been published yet. Check back later or contact your department.
          </p>
          <button
            onClick={fetchResults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4" />
            Refresh
          </button>
        </div>
      
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Academic Results</h1>
            <p className="text-gray-500 mt-1">View your grades and academic performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Total Courses</p>
              <GraduationCap className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{results.length}</p>
            <p className="text-xs text-gray-400 mt-1">Across {semesters.length - 1} semesters</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Average Percentage</p>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{summary.percentage}%</p>
            <p className="text-xs text-gray-400 mt-1">Overall performance</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">SGPA</p>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{summary.sgpa || "N/A"}</p>
            <p className="text-xs text-gray-400 mt-1">Current semester</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Credits Earned</p>
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {summary.earnedCredits}/{summary.totalCredits}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total credits</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by course name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem === "all" ? "All Semesters" : sem}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-sm text-gray-500">
                {filteredResults.length} {filteredResults.length === 1 ? "result" : "results"}
              </p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Internal
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    External
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Practical
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <BookOpen className="w-4 h-4 text-blue-700" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {result.courseId.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600 font-mono">
                        {result.courseId.code}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{result.semester}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{result.internalMarks}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{result.externalMarks}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{result.practicalMarks}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900">
                        {result.totalMarks}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getGradeColor(result.grade)}`}>
                        <span>{getGradeIcon(result.grade)}</span>
                        {result.grade}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => {
                          setSelectedResult(result);
                          setShowDetails(true);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No results match your filters</p>
              <button
                onClick={() => {
                  setFilterSemester("all");
                  setSearchTerm("");
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Result Details Modal */}
        {showDetails && selectedResult && (
          <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Result Details</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Course Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Course Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedResult.courseId.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Course Code</p>
                      <p className="text-sm font-medium text-gray-900">{selectedResult.courseId.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Credits</p>
                      <p className="text-sm font-medium text-gray-900">{selectedResult.courseId.credits || 3}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Semester</p>
                      <p className="text-sm font-medium text-gray-900">{selectedResult.semester}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Marks Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Internal Marks</span>
                      <span className="text-sm font-medium text-gray-900">{selectedResult.internalMarks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">External Marks</span>
                      <span className="text-sm font-medium text-gray-900">{selectedResult.externalMarks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Practical Marks</span>
                      <span className="text-sm font-medium text-gray-900">{selectedResult.practicalMarks}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Total Marks</span>
                        <span className="text-lg font-bold text-blue-600">{selectedResult.totalMarks}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Grade Information</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Grade Obtained</p>
                      <p className={`text-2xl font-bold inline-block px-3 py-1 rounded-lg mt-1 ${getGradeColor(selectedResult.grade)}`}>
                        {selectedResult.grade}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Published On</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedResult.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    {selectedResult.grade === "F" 
                      ? "You need to reappear for this examination."
                      : "Congratulations on your result! Keep up the good work."}
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Performance Chart (Optional) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            Semester-wise Performance
          </h3>
          <div className="space-y-3">
            {semesters.filter(s => s !== "all").map((semester) => {
              const semesterResults = results.filter(r => r.semester === semester);
              const avgPercentage = semesterResults.reduce((acc, r) => acc + r.totalMarks, 0) / semesterResults.length;
              
              return (
                <div key={semester} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{semester}</span>
                    <span className="font-medium text-gray-900">{avgPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${avgPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}