import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB, disconnectDB } from "./src/config/db.js";
import {
  startFeeCronJobs,
  startAnalyticsCronJobs,
  startLibraryCronJobs,
  startAttendanceCronJobs,
} from "./src/utils/cronJobs.js";

import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import freePort from "./src/config/portCleanup.js";
import { initializeStudyGroupSockets } from "./src/socket/studyGroupSocket.js";
import { allowedOrigins } from "./src/config/cors.js";
import validateEnv from "./src/config/validateEnv.js";
const PORT = process.env.PORT || 5000;



validateEnv();
connectDB();

startFeeCronJobs();
startAnalyticsCronJobs();
startLibraryCronJobs();
startAttendanceCronJobs();

const httpServer = createServer(app);
freePort(PORT);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

app.set("io", io);

io.use((socket, next) => {
  const token =
    socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user?.id || socket.user?._id;

  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`User connected to socket: ${userId}`);
  }

  socket.on("disconnect", () => {
    if (userId) console.log(`User disconnected: ${userId}`);
  });
});

initializeStudyGroupSockets(io);


const startServer = (attempt = 0) => {
  if (attempt > 0) freePort(PORT);

  httpServer.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < 10) {
      console.log(`Port ${PORT} in use, killing contender and retrying (attempt ${attempt + 1})`);
      setTimeout(() => startServer(attempt + 1), 100);
    } else {
      console.error(`Failed to start server on port ${PORT}:`, err.message);
      process.exit(1);
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
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