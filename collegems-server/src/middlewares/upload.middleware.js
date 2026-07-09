// ─── FILE: collegems-server/src/middlewares/upload.middleware.js ───────────────────────
import multer from "multer";
import fs from "fs";
import path from "path";
import { verifyFileSignature, scanFileForMalware } from "../utils/malwareScanner.js";

// Ensure the secure-uploads/assignments directory exists
const secureAssignmentsDir = path.join(process.cwd(), "secure-uploads", "assignments");
fs.mkdirSync(secureAssignmentsDir, { recursive: true });

// Ensure the secure-uploads/resumes directory exists. Resumes are never
// served through express.static - retrieval goes through an authenticated
// route (see user.routes.js / user.controller.js downloadResumeFile).
export const secureResumesDir = path.join(process.cwd(), "secure-uploads", "resumes");
fs.mkdirSync(secureResumesDir, { recursive: true });

// 1. Storage Configuration for Assignments (secure location)
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, secureAssignmentsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename without spaces
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/\s+/g, "-");
    cb(null, `assignment-${timestamp}-${sanitized}`);
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

// Exported Multer upload handlers
export const uploadAssignment = multer({
  storage: assignmentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit (adjustable)
  fileFilter: documentFilter,
});

// Resume Upload Middleware Configuration
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, secureResumesDir);
  },
  filename: (req, file, cb) => {
    // Never derive the on-disk filename from the attacker-controlled
    // originalname - generate one and rely on resumeFilter below plus
    // validateResumeFile to guarantee the upload is actually a PDF.
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}.pdf`);
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

// resumeFilter only checks the client-supplied Content-Type header, which is
// trivial to spoof. Verify the actual file content after upload: real magic
// bytes plus a basic malware/script-injection scan, matching the checks
// already applied to assignment uploads.
export const validateResumeFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;

  try {
    const isValidSignature = await verifyFileSignature(filePath, ".pdf");
    if (!isValidSignature) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "File contents do not match the declared PDF format." });
    }

    const scanResult = await scanFileForMalware(filePath);
    if (!scanResult.safe) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: `Security threat detected: ${scanResult.reason}` });
    }

    next();
  } catch (error) {
    console.error("Resume upload validation failed:", error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.status(500).json({ message: "Failed to validate the uploaded resume." });
  }
};
