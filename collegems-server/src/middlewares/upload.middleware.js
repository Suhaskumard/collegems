import multer from "multer";

// 1. Storage Configuration for Assignments
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/assignments/");
  },
  filename: (req, file, cb) => {
    cb(null, `assignment-${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`); 
  },
});

// 2. Storage Configuration for Resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `resume-${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`); 
  },
});

// Shared File Type Filter (PDFs and Word Docs only)
const documentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and Word documents are allowed."), false);
  }
};

// --- EXPORTS ---

// Export 1: Assignment Uploader (The one we built)
export const uploadAssignment = multer({
  storage: assignmentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: documentFilter,
});

// Resume Upload Middleware Configuration
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`); 
  },
});

const resumeFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF documents are allowed."), false);
  }
};

export const uploadResume = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: resumeFilter,
});
