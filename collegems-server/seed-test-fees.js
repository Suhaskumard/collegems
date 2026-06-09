import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Fee from "./src/models/Fee.model.js";
import User from "./src/models/User.model.js";

async function seedTestFees() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Find any one student
    const student = await User.findOne({ role: "student" });
    if (!student) {
      console.log("❌ No students found in the database. Please register a student first.");
      process.exit(1);
    }

    console.log(`Found student: ${student.email}`);

    // Clear existing fees for this student to avoid clutter
    await Fee.deleteMany({ student: student._id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Create an Upcoming Fee (due in 5 days)
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(today.getDate() + 5);
    
    await Fee.create({
      student: student._id,
      total: 5000,
      paid: 0,
      dueDate: fiveDaysFromNow,
      status: "Pending"
    });

    // 2. Create an Overdue Fee (due 2 days ago)
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    await Fee.create({
      student: student._id,
      total: 2500,
      paid: 500, // Partial payment
      dueDate: twoDaysAgo,
      status: "Partial" // The pre-save hook will auto-convert this to Overdue!
    });

    console.log("✅ Successfully injected test fees!");
    console.log("👉 Login as this student to see the dashboard alerts:");
    console.log(`   Email: ${student.email}`);
    
  } catch (error) {
    console.error("Error seeding fees:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedTestFees();
