import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { initializeStudyGroupSockets } from "./studyGroupSocket.js";
import { allowedOrigins } from "../config/cors.js";

/**
 * Configures and initializes the Socket.IO server.
 * @param {http.Server} httpServer - The HTTP server instance.
 * @param {express.Application} app - The Express application instance.
 * @returns {SocketIO.Server} The configured Socket.IO instance.
 */
const configureSocketIO = (httpServer, app) => {
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

  // Attach io instance to the Express app for use in route handlers
  app.set("io", io);

  // Socket.IO Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  // Socket.IO Connection & Disconnection Events
  io.on("connection", (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    if (userId) {
      socket.join(`user_${userId}`);
      logger.info(`User connected to socket: ${userId}`);
    }

    socket.on("disconnect", () => {
      if (userId) logger.info(`User disconnected from socket: ${userId}`);
    });
  });

  // Initialize any specific socket modules
  initializeStudyGroupSockets(io);

  return io;
};

export default configureSocketIO;