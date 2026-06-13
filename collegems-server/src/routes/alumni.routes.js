import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getAlumni, seedAlumni } from "../controllers/alumni.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getAlumni);
router.post("/seed", seedAlumni);

export default router;
