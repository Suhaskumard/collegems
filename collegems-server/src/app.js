// FILE: collegems-server/src/app.js

import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import httpContext from "express-http-context";
import { v4 as uuidv4 } from "uuid";

// Apply Global Multi-Tenant Plugin
import tenantPlugin from "./utils/tenantPlugin.js";
mongoose.plugin(tenantPlugin);

// Import Centralized Router
import apiRouter from "./routes/index.js";

// Middlewares & Utilities
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import tenantResolver from "./middlewares/tenantResolver.js";
import log from "./utils/logger.js";

const app = express();
app.set("query parser", "extended");

// ========================================
// MIDDLEWARES
// ========================================

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-ID"]
}));

app.use(express.json());

// Correlation ID Tracking & Request Logging
app.use(httpContext.middleware);
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  httpContext.set('correlationId', correlationId);
  res.setHeader('X-Correlation-ID', correlationId);
  log.request(req.method, req.originalUrl, req.user?.id || "anonymous");
  next();
});

// Static Files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// TODO: Multi-tenancy is not yet supported by the frontend or seeder
// import tenantResolver from "./middlewares/tenantResolver.js";
// app.use(tenantResolver);

// ========================================
// MOUNT ALL ROUTES UNDER /api
// ========================================
app.use("/api", apiRouter);

// ========================================
// HEALTH CHECK
// ========================================
app.get("/", (_req, res) => {
  log.request("GET", "/", "health-check");
  res.send("SCMS Backend Running");
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errorCode: "ROUTE_NOT_FOUND",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;