import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

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

export const protect = authenticate;

/**
 * Role-Based Access Control Middleware
 * Restricts access to specific user roles (e.g., 'teacher', 'admin', 'student')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if the user exists and if their role is in the allowed roles array
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Forbidden: You do not have permission to perform this action" 
      });
    }
    next();
  };
};