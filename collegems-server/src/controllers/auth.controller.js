import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COLLEGE_DOMAIN = "@college.edu";
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$.{53}$/;

const normalizeEmail = (email) => email?.trim().toLowerCase();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const verifyPassword = async (plainPassword, storedPassword) => {
  if (typeof storedPassword !== "string" || !storedPassword) {
    return false;
  }

  return bcrypt.compare(plainPassword, storedPassword);
};

const generateAccessToken = (user) =>
  jwt.sign({ id: String(user._id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: String(user._id), role: user.role },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      studentId,
      teacherId,
      department,
      departmentCode,
      semester,
      course,
    } = req.body || {};

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Role-specific checks
    let userData = {
      name,
      email: normalizeEmail(email),
      password: await bcrypt.hash(password, 10),
      role,
    };

    if (role === "student") {
      if (!studentId) {
        return res.status(400).json({ message: "Student ID required" });
      }
      if (!semester || !course) {
        return res
          .status(400)
          .json({ message: "Semester and course required for student" });
      }

      userData = { ...userData, studentId, semester, course };
    }

    if (role === "teacher") {
      if (!teacherId) {
        return res.status(400).json({ message: "Teacher ID required" });
      }
      if (!department) {
        return res.status(400).json({ message: "Department required" });
      }
      userData = { ...userData, teacherId, department };
    }

    if (role === "hod") {
      if (!email.endsWith(COLLEGE_DOMAIN)) {
        return res.status(403).json({ message: "Use college email only" });
      }
      if (!departmentCode) {
        return res
          .status(400)
          .json({ message: "Department code required for HOD" });
      }
      userData = { ...userData, departmentCode };
    }

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // Create user
    const user = await User.create(userData);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "Registered successfully",
      accessToken,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);
    const { password } = body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({
      email: new RegExp(`^${escapeRegExp(email)}$`, "i"),
    }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await verifyPassword(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error("JWT secrets are not configured");
      return res.status(500).json({ message: "Authentication not configured" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        semester: user.semester,
        course: user.course,
        teacherId: user.teacherId,
        department: user.department,
        departmentCode: user.departmentCode,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
      }
    );
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
