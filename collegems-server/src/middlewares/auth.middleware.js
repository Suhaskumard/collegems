import jwt from "jsonwebtoken";

const verifyToken = (token, req, res, next) => {
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
  verifyToken(token, req, res, next);
};

export const protect = authenticate;

// For routes opened as plain links (e.g. file downloads) where the browser
// can't attach an Authorization header. Scope this to that single route -
// don't use it as the global auth middleware, since tokens in URLs leak into
// browser history and server/proxy access logs.
export const authenticateFileDownload = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.query.token;
  verifyToken(token, req, res, next);
};

import { allowRoles } from "./role.middleware.js";
export const restrictTo = allowRoles;

