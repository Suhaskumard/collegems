import dotenv from "dotenv";
dotenv.config();

import { initializeApp } from "./src/bootstrap/index.js";

// Execute the centralized bootstrap sequence
initializeApp();
