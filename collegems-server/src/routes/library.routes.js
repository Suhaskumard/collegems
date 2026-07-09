import express from "express";
import {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getIssueRecords,
  getUserFines,
  payLibraryFine,
} from "../controllers/library.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Protected routes (any logged-in user can view books & borrow history)
router.get("/books", protect, getAllBooks);
router.get("/issues", protect, getIssueRecords);

// HOD / Teacher only routes for managing books and issue records
router.post("/books", protect, allowRoles("hod", "teacher"), addBook);
router.put("/books/:id", protect, allowRoles("hod", "teacher"), updateBook);
router.delete("/books/:id", protect, allowRoles("hod", "teacher"), deleteBook);
router.post("/issue", protect, allowRoles("hod", "teacher"), issueBook);
router.post("/return/:issueId", protect, allowRoles("hod", "teacher"), returnBook);

// Fine Management Routes
router.get("/fines", protect, getUserFines);
// Marking a fine paid is a staff action (the librarian collects the fine and
// records it here) - there's no payment gateway, so a self-service "pay" call
// from the student themselves can't be trusted as proof of payment.
router.post("/fines/:fineId/pay", protect, allowRoles("hod", "teacher"), payLibraryFine);

export default router;
