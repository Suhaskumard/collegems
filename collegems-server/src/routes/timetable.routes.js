import express from "express";
import {
  generateTimetable,
  getTimetables,
  getTimetableStatus,
  getTimetableEntries,
  updateTimetableEntry,
  getRooms,
  getTimeSlots,
  getRules,
} from "../controllers/timetable.controller.js";

const router = express.Router();

// Configuration routes
router.get("/rooms", getRooms);
router.get("/timeslots", getTimeSlots);
router.get("/rules", getRules);

// Generation and retrieval routes
router.post("/generate", generateTimetable);
router.get("/", getTimetables);
router.get("/:id", getTimetableStatus);
router.get("/:id/entries", getTimetableEntries);

// Override routes
router.put("/entries/:entryId", updateTimetableEntry);

export default router;
