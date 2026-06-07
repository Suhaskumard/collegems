import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { 
    getAssessmentConfig, 
    saveAssessmentConfig, 
    getInternalAssessments, 
    saveInternalAssessment 
} from '../controllers/assessment.controller.js';

const router = express.Router();

// Routes for Assessment Config (Teachers/Admins)
router.get('/config/:courseId', protect, getAssessmentConfig);
router.post('/config/:courseId', protect, restrictTo('teacher', 'admin'), saveAssessmentConfig);

// Routes for Internal Assessments (Teachers/Admins to manage, Students to view can be added later)
router.get('/marks/:courseId', protect, restrictTo('teacher', 'admin'), getInternalAssessments);
router.post('/marks/:courseId/:studentId', protect, restrictTo('teacher', 'admin'), saveInternalAssessment);

export default router;
