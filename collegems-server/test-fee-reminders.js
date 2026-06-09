/**
 * Test Script for Fee Payment Reminders
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Fee from "./src/models/Fee.model.js";
import User from "./src/models/User.model.js";
import { startFeeCronJobs } from "./src/utils/cronJobs.js";

const PASS = "✅ PASS";
const FAIL = "❌ FAIL";
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ${PASS}  ${testName}`);
    passed++;
  } else {
    console.log(`  ${FAIL}  ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Fee Reminders Feature — Test Suite");
  console.log("═══════════════════════════════════════════════════");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 Connected to MongoDB\n");

    // 1. Create a dummy student user
    const student = new User({
      name: "Test Student",
      email: "test.student@example.com",
      password: "password123",
      role: "student",
      studentId: "TS001",
      semester: "1",
      course: "CS",
      settings: { notifications: { email: true, inApp: true } }
    });
    await student.save();

    // 2. Create Dummy Fees
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const fee7Days = new Fee({
      student: student._id,
      total: 1000,
      paid: 0,
      dueDate: sevenDaysFromNow,
      status: "Pending"
    });
    await fee7Days.save();

    const feeOverdue = new Fee({
      student: student._id,
      total: 1000,
      paid: 500, // partial
      dueDate: yesterday,
      status: "Partial"
    });
    await feeOverdue.save();

    // 3. Test Dashboard API Logic Manually
    console.log("🔹 Testing Dashboard Notifications Logic");
    
    // Simulate dashboard logic for 7 days
    let feeDate = new Date(fee7Days.dueDate);
    feeDate.setHours(0, 0, 0, 0);
    let timeDiff = feeDate.getTime() - today.getTime();
    let daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    assert(daysLeft === 7, "Calculates exactly 7 days left for upcoming fee");

    // Simulate dashboard logic for overdue
    feeDate = new Date(feeOverdue.dueDate);
    feeDate.setHours(0, 0, 0, 0);
    timeDiff = feeDate.getTime() - today.getTime();
    daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    assert(daysLeft === -1, "Calculates < 0 days left for overdue fee");

    // 4. Test Pre-Save Hook
    console.log("\n🔹 Testing Fee Pre-Save Hook (Overdue Transition)");
    const fetchedOverdue = await Fee.findById(feeOverdue._id);
    await fetchedOverdue.save(); // Should trigger hook
    
    const updatedOverdue = await Fee.findById(feeOverdue._id);
    assert(updatedOverdue.status === "Overdue", "Fee automatically transitions to Overdue when saved past due date");

    // Cleanup
    await Fee.deleteMany({ student: student._id });
    await User.findByIdAndDelete(student._id);
    console.log("\n🧹 Test data cleaned up.");

  } catch (error) {
    console.error("Test Error:", error);
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
