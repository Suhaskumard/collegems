import express from "express";
import {
  addVisitor,
  getVisitors,
  markExit,
  updatedVisitor
}from "../controllers/visitors.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";



const router = express.Router();

router.post("/", authenticate, authorize("hod"),addVisitor);
router.get("/",authenticate, authorize("hod"), getVisitors);
router.put("/exit/:id",authenticate, authorize("hod"), markExit);
router.put("/:id", authenticate, authorize("hod"),updatedVisitor);

export default router;