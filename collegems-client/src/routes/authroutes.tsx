import express, { Router } from 'express';
import {
  register,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController';
import {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateResetPassword,
} from '../middlewares/validation/authValidation';
import { auth } from '../middlewares/auth';

const router: Router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/request-password-reset', validatePasswordReset, requestPasswordReset);
router.post('/reset-password', validateResetPassword, resetPassword);

// Protected routes
router.get('/profile', auth, getProfile);

export default router;