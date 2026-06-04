import dotenv from "dotenv";

dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/User.model.js";

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // remove old demo users if they exist
    await User.deleteMany({
      email: {
        $in: [
          "student@example.com",
          "teacher@example.com",
          "hod@college.edu",
        ],
      },
    });

    const hashedPassword = await bcrypt.hash("password123", 10);

    await User.create([
      {
        name: "Demo Student",
        email: "student@example.com",
        password: hashedPassword,
        role: "student",
        studentId: "STU001",
        semester: "6",
        course: "Computer Science",
      },
      {
        name: "Demo Teacher",
        email: "teacher@example.com",
        password: hashedPassword,
        role: "teacher",
        teacherId: "TCH001",
        department: "Computer Science",
      },
      {
        name: "Demo HOD",
        email: "hod@college.edu",
        password: hashedPassword,
        role: "hod",
        departmentCode: "CSE",
      },
    ]);

    console.log("Demo users created successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();