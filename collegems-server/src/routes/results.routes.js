import express from 'express';
import { createResult, getResults, publishResult } from '../controllers/results.controller.js';
import { protect } from "../middlewares/auth.middleware.js";
import { checkDataLock } from "../middlewares/dataLock.middleware.js";
import { auditAction } from "../middlewares/audit.middleware.js";
const router = express.Router();

router.get("/my", protect, getResults);
router.post('/create', protect, checkDataLock('results'), auditAction('CREATE_RESULT', 'Results'), createResult);
router.put('/:id/publish', protect, checkDataLock('results'), auditAction('PUBLISH_RESULT', 'Results'), publishResult);
export default router;
