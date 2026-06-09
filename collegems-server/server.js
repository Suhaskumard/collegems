import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { startFeeCronJobs } from "./src/utils/cronJobs.js";

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error(
    "Missing MONGO_URI in .env. Please set MONGO_URI to your MongoDB connection string.",
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error(
    "Missing JWT secrets in .env. Please set both JWT_SECRET and JWT_REFRESH_SECRET.",
  );
  process.exit(1);
}

connectDB();

startFeeCronJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
