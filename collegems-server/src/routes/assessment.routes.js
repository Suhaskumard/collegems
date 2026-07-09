import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { checkDataLock } from '../middlewares/dataLock.middleware.js';
import {
    getAssessmentConfig,
    saveAssessmentConfig,
    getInternalAssessments,
    saveInternalAssessment
} from '../controllers/assessment.controller.js';

const router = express.Router();

// Routes for Assessment Config (Teachers/Admins)
router.get('/config/:courseId', protect, getAssessmentConfig);
router.post('/config/:courseId', protect, allowRoles('teacher', 'admin'), checkDataLock('results'), saveAssessmentConfig);

// Routes for Internal Assessments (Teachers/Admins to manage, Students to view can be added later)
router.get('/marks/:courseId', protect, allowRoles('teacher', 'admin'), getInternalAssessments);
router.post('/marks/:courseId/:studentId', protect, allowRoles('teacher', 'admin'), checkDataLock('results'), saveInternalAssessment);

export default router;
