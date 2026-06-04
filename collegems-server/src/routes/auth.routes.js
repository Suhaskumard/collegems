import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validateRegister } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", login);

export default router;
