import express from "express";
import {
  addVisitor,
  getVisitors,
  markExit,
} from "../controllers/visitors.controller.js";

const router = express.Router();

router.post("/", addVisitor);
router.get("/", getVisitors);
router.put("/exit/:id", markExit);

export default router;