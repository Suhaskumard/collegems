import { X, ExternalLink, Download, AlertTriangle, FileText } from "lucide-react";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  studentName: string;
}

export default function DocumentViewerModal({ isOpen, onClose, fileUrl, studentName }: DocumentViewerModalProps) {
  if (!isOpen || !fileUrl) return null;

  const fullUrl = fileUrl.startsWith('http') 
    ? fileUrl 
    : `http://localhost:5000${fileUrl}`;

  const cleanUrl = fullUrl.split('?')[0].toLowerCase();
  const isPdf = cleanUrl.endsWith('.pdf');
  
  const isOfficeDoc = 
    cleanUrl.endsWith('.docx') || 
    cleanUrl.endsWith('.doc') || 
    cleanUrl.endsWith('.pptx') || 
    cleanUrl.endsWith('.xlsx');

  // ✨ NEW: Detect if you are running on localhost
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Microsoft Office Web Viewer is generally more reliable than Google's
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {studentName}'s Submission
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isOfficeDoc ? "Office Viewer Mode" : "Native PDF Mode"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href={fullUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Open File</span>
            </a>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
            <button
              onClick={onClose}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Document Render Area */}
        <div className="flex-1 w-full bg-gray-200 dark:bg-gray-950 relative">
          
          {isPdf ? (
            /* 1. NATIVE PDF VIEWER (Works offline and locally) */
            <iframe
              src={`${fullUrl}#toolbar=0&navpanes=0`} 
              className="w-full h-full border-none bg-white"
              title={`${studentName} assignment`}
            />
          ) : isOfficeDoc && isLocalhost ? (
            /* 2. LOCALHOST INTERCEPTOR (Stops the annoying auto-download) */
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-gray-900">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Localhost Restriction
              </h4>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                Microsoft Office documents cannot be previewed while running on <b>localhost</b> because cloud viewers cannot access your personal computer. 
                <br/><br/>
                Once your app is deployed to the internet, this will automatically render the document.
              </p>
              <a 
                href={fullUrl}
                download
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download to Grade
              </a>
            </div>
          ) : isOfficeDoc && !isLocalhost ? (
            /* 3. PRODUCTION OFFICE VIEWER */
            <iframe
              src={officeViewerUrl} 
              className="w-full h-full border-none"
              title={`${studentName} office document`}
            />
          ) : (
            /* 4. FALLBACK FOR UNKNOWN FILES */
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-gray-900">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Preview Not Available
              </h4>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                This specific file format cannot be safely previewed in the browser.
              </p>
              <a 
                href={fullUrl}
                download
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                Download Securely
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}