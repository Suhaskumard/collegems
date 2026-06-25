import express from "express";
import { register, login, refresh, logout, verifyEmail, resendVerificationEmail } from "../controllers/auth.controller.js";
import { validateRegister } from "../middlewares/validation.middleware.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", registerLimiter, validateRegister, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

export default router;