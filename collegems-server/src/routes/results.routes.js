import express from 'express';
import { createResult, getResults, publishResult } from '../controllers/results.controller.js';
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
const router = express.Router();

router.get("/my", protect, getResults);
router.post('/create', protect, allowRoles("teacher", "hod"), createResult);
router.put('/:id/publish', protect, allowRoles("hod"), publishResult);
export default router;
