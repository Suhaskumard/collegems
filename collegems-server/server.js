import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { startFeeCronJobs, startAnalyticsCronJobs, startLibraryCronJobs, startAttendanceCronJobs } from "./src/utils/cronJobs.js";
import logger from "./src/utils/logger.js"
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { execSync } from "child_process";
import { allowedOrigins } from "./src/config/cors.js";
import configureSocketIO from "./src/socket/socket.js";
const PORT = process.env.PORT || 5000;

const freePort = () => {
  try {
    const pid = execSync(`lsof -ti:${PORT}`, { encoding: "utf8", timeout: 2000 }).trim();
    if (pid) {
      execSync(`kill -9 ${pid}`, { timeout: 1000 });
      console.log(`Freed port ${PORT} (killed PID ${pid})`);
    }
  } catch {
    // port is free
  }
};

if (!process.env.MONGO_URI) {
  logger.error(
    "Missing MONGO_URI in .env. Please set MONGO_URI to your MongoDB connection string.",
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  logger.error(
    "Missing JWT secrets in .env. Please set both JWT_SECRET and JWT_REFRESH_SECRET.",
  );
  process.exit(1);
}

validateEnv();
connectDB();

startFeeCronJobs();
startAnalyticsCronJobs();
startLibraryCronJobs();
startAttendanceCronJobs();

const httpServer = createServer(app);


const io = configureSocketIO(httpServer, app);


const startServer = (attempt = 0) => {
  if (attempt > 0) freePort(PORT);

  httpServer.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < 10) {
      logger.warn(`Port ${PORT} in use, killing contender and retrying (attempt ${attempt + 1})`);
      setTimeout(() => startServer(attempt + 1), 100);
    } else {
      logger.error(`Failed to start server on port ${PORT}:`, err.message);
      process.exit(1);
    }
  });

  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    await new Promise((resolve, reject) => {
      httpServer.close((err) => {
        if (err) return reject(err);
        console.log("HTTP server closed");
        resolve();
      });
    });

    io.disconnectSockets(true);

    await new Promise((resolve) => {
      io.close(() => {
        console.log("Socket.IO server closed");
        resolve();
      });
    });

    await disconnectDB();

    console.log("MongoDB connection closed");
    console.log("Graceful shutdown completed");

    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

setTimeout(startServer, 200);

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));