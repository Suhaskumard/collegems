import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

const normalizeSettings = (settings) => {
  const safeSettings = settings || {};
  return {
    preferences: {
      language: "en",
      timezone: "UTC",
      digestFrequency: "weekly",
      ...(safeSettings.preferences || {}),
    },
    notifications: {
      email: true,
      sms: false,
      inApp: true,
      ...(safeSettings.notifications || {}),
    },
  };
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, email, phone, department, teacherId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (teacherId !== undefined) user.teacherId = teacherId;

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json(safeUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("settings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(normalizeSettings(user.settings));
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { preferences, notifications } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const current = normalizeSettings(user.settings);

    user.settings = {
      preferences: {
        ...current.preferences,
        ...(preferences || {}),
      },
      notifications: {
        ...current.notifications,
        ...(notifications || {}),
      },
    };

    await user.save();

    res.json(user.settings);
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ _id: id, role: "student" }).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
