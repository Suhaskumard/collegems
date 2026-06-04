const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'collegems-client/src/teacher-components/Assignment.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const importReplacement = `import {
  Plus,
  X,
  Calendar,
  FileText,
  Link2,
  Type,
  RefreshCw,
  Clock,
  Award,
  Paperclip,
  Save,
  AlertCircle,
  Eye,
  CheckCircle,
  Download
} from "lucide-react";`;

content = content.replace(/import \{[\s\S]*?\} from "lucide-react";/, importReplacement);

// Add states
const stateReplacement = `  const [error, setError] = useState<string | null>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<any | null>(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const hasCourseId = Boolean(courseId);`;

content = content.replace(/  const \[error, setError\] = useState<string \| null>\(null\);\n  const hasCourseId = Boolean\(courseId\);/, stateReplacement);

// Add viewSubmissions function
const viewSubmissionsFunc = `
  const fetchSubmissions = async (assignmentId: string) => {
    setLoadingSubmissions(true);
    setViewingSubmissions({ _id: assignmentId, loading: true });
    try {
      const res = await api.get(\`/assignment/teacher/submissions/\${assignmentId}\`);
      setViewingSubmissions(res.data);
    } catch (err: any) {
      console.error(err);
      alert("Failed to load submissions");
      setViewingSubmissions(null);
    } finally {
      setLoadingSubmissions(false);
    }
  };
`;

content = content.replace(/  const resetForm = \(\) => \{/, viewSubmissionsFunc + '\n  const resetForm = () => {');

// Add Submissions Modal UI just before the last closing div of return
const modalUI = `
      {/* Submissions Modal */}
      {viewingSubmissions && !viewingSubmissions.loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setViewingSubmissions(null)}
          />
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewingSubmissions.title} Submissions
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Total Submissions: {viewingSubmissions.submissions?.length || 0}
                </p>
              </div>
              <button
                onClick={() => setViewingSubmissions(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Submissions List */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {(!viewingSubmissions.submissions || viewingSubmissions.submissions.length === 0) ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No submissions yet for this assignment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewingSubmissions.submissions.map((sub: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4 min-w-[200px]">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold overflow-hidden">
                            {sub.student?.avatarUrl || sub.student?.photo ? (
                               <img src={sub.student.avatarUrl || sub.student.photo} alt={sub.student?.name} className="w-full h-full object-cover" />
                            ) : sub.student?.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{sub.student?.name || "Unknown Student"}</p>
                            <p className="text-sm text-gray-500">{sub.student?.email || "No email"}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end min-w-[150px]">
                          <span className={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium \${sub.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}\`}>
                            {sub.status === 'graded' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {sub.status === 'graded' ? 'Graded' : 'Submitted'}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(sub.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(sub.textResponse || sub.link) && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Text / Link Submission</h4>
                            {sub.textResponse && <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">{sub.textResponse}</p>}
                            {sub.link && (
                              <a href={sub.link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <Link2 className="w-4 h-4" /> View Link
                              </a>
                            )}
                          </div>
                        )}
                        
                        {sub.file && sub.file.url && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">File Submission</h4>
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded p-2">
                              <Paperclip className="w-5 h-5 text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate" title={sub.file.originalName}>{sub.file.originalName || "Attachment"}</p>
                                <p className="text-xs text-gray-500">{(sub.file.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <a href={\`http://localhost:5000\${sub.file.url}\`} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Grading Section */}
                      <div className="mt-4 flex items-center justify-end gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Marks:</label>
                          <input type="number" className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder={\`/\${viewingSubmissions.totalPoints || viewingSubmissions.maxMarks || 100}\`} defaultValue={sub.marks} />
                        </div>
                        <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                          Save Grade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/    <\/div>\n  \);\n\}\n$/, modalUI + '    </div>\n  );\n}\n');

const viewButtonUI = `
                      <span
                        className={\`text-xs px-2 py-1 rounded-full border \${
                          isActive
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }\`}
                      >
                        {isActive ? "Active" : "Closed"}
                      </span>
                      <button 
                        onClick={() => fetchSubmissions(assignment._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Submissions"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
`;

content = content.replace(/                      <span\n                        className={\`text-xs px-2 py-1 rounded-full border \${\n                          isActive\n                            \? "bg-green-50 text-green-700 border-green-200"\n                            : "bg-gray-50 text-gray-600 border-gray-200"\n                        }\`}\n                      >\n                        \{isActive \? "Active" : "Closed"\}\n                      <\/span>\n                    <\/div>\n                  <\/div>/g, viewButtonUI.trim());

// We also need to fix the div structure since we added a button inside the span's sibling.
const divStructureReplace = `
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={\`text-xs px-2 py-1 rounded-full border \${
                          isActive
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }\`}
                      >
                        {isActive ? "Active" : "Closed"}
                      </span>
                      <button 
                        onClick={() => fetchSubmissions(assignment._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                        title="View Submissions"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </div>
                  </div>
`;

content = content.replace(/                      <span\n                        className={\`text-xs px-2 py-1 rounded-full border \${\n                          isActive\n                            \? "bg-green-50 text-green-700 border-green-200"\n                            : "bg-gray-50 text-gray-600 border-gray-200"\n                        }\`}\n                      >\n                        \{isActive \? "Active" : "Closed"\}\n                      <\/span>\n                    <\/div>\n                  <\/div>/g, divStructureReplace.trim());

fs.writeFileSync(filePath, content, 'utf8');
