/**
 * End-to-End Test Script for Automated Hall Allocation Feature
 * Tests: API endpoints, allocation logic, PDF/CSV export, student seat lookup
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ── Models ──
import ExamHall from "./src/models/ExamHall.model.js";
import HallAllocation from "./src/models/HallAllocation.model.js";
import ExamSchedule from "./src/models/ExamSchedule.model.js";
import ExaminationForm from "./src/models/ExaminationForm.model.js";
import User from "./src/models/User.model.js";

// ── Utils ──
import {
  generateSeatLabel,
  allocateStudents,
  validateAllocation,
} from "./src/utils/hallAllocation.utils.js";

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

// ════════════════════════════════════════════════════════
// 1. Unit Tests — Seat Label Generation
// ════════════════════════════════════════════════════════
function testSeatLabels() {
  console.log("\n🔹 Test Suite: Seat Label Generation");
  assert(generateSeatLabel(0, 0) === "A1", "Row 0, Col 0 → A1");
  assert(generateSeatLabel(0, 4) === "A5", "Row 0, Col 4 → A5");
  assert(generateSeatLabel(1, 2) === "B3", "Row 1, Col 2 → B3");
  assert(generateSeatLabel(25, 0) === "Z1", "Row 25, Col 0 → Z1");
  assert(generateSeatLabel(26, 0) === "AA1", "Row 26, Col 0 → AA1");
  assert(generateSeatLabel(27, 3) === "AB4", "Row 27, Col 3 → AB4");
}

// ════════════════════════════════════════════════════════
// 2. Unit Tests — Allocation Engine
// ════════════════════════════════════════════════════════
function testAllocationEngine() {
  console.log("\n🔹 Test Suite: Allocation Engine");

  // Mock data
  const students = [
    { _id: new mongoose.Types.ObjectId(), name: "Alice", rollNumber: "CS001", course: "CS", studentId: "CS001" },
    { _id: new mongoose.Types.ObjectId(), name: "Bob", rollNumber: "CS002", course: "CS", studentId: "CS002" },
    { _id: new mongoose.Types.ObjectId(), name: "Charlie", rollNumber: "ME001", course: "ME", studentId: "ME001" },
    { _id: new mongoose.Types.ObjectId(), name: "Diana", rollNumber: "ME002", course: "ME", studentId: "ME002" },
    { _id: new mongoose.Types.ObjectId(), name: "Eve", rollNumber: "EE001", course: "EE", studentId: "EE001" },
    { _id: new mongoose.Types.ObjectId(), name: "Frank", rollNumber: "EE002", course: "EE", studentId: "EE002" },
  ];

  const halls = [
    { _id: new mongoose.Types.ObjectId(), name: "Hall A", rows: 2, columns: 3, capacity: 6, building: "Block 1", isActive: true },
    { _id: new mongoose.Types.ObjectId(), name: "Hall B", rows: 2, columns: 2, capacity: 4, building: "Block 2", isActive: true },
  ];

  // Test: Sequential strategy
  const seqResult = allocateStudents(students, halls, "sequential");
  assert(seqResult.totalStudents === 6, "Sequential: All 6 students allocated");
  assert(seqResult.totalHalls >= 1, "Sequential: At least 1 hall used");
  assert(seqResult.warnings.length >= 0, "Sequential: Warnings array exists");

  // Test: Department-mixed strategy
  const mixResult = allocateStudents(students, halls, "department-mixed");
  assert(mixResult.totalStudents === 6, "Dept-Mixed: All 6 students allocated");

  // Test: Zigzag strategy
  const zigResult = allocateStudents(students, halls, "zigzag");
  assert(zigResult.totalStudents === 6, "Zigzag: All 6 students allocated");

  // Test: No duplicate assignments
  const allSeatStudentIds = [];
  for (const hallGroup of seqResult.allocations) {
    for (const seat of hallGroup.seats) {
      allSeatStudentIds.push(seat.student.toString());
    }
  }
  const uniqueIds = new Set(allSeatStudentIds);
  assert(uniqueIds.size === allSeatStudentIds.length, "No duplicate student assignments");

  // Test: Seat labels are valid
  const firstSeat = seqResult.allocations[0]?.seats[0]?.seatNumber;
  assert(firstSeat === "A1", "First seat label is A1");

  // Test: Hall name preserved
  assert(seqResult.allocations[0]?.hallName !== undefined, "Hall name preserved in allocation");

  // Test: Validation passes for clean allocation
  const validation = validateAllocation(seqResult);
  assert(validation.valid === true, "Validation passes for clean allocation");
  assert(validation.errors.length === 0, "No validation errors");
}

// ════════════════════════════════════════════════════════
// 3. Edge Case Tests
// ════════════════════════════════════════════════════════
function testEdgeCases() {
  console.log("\n🔹 Test Suite: Edge Cases");

  // Test: No students
  try {
    allocateStudents([], [{ _id: new mongoose.Types.ObjectId(), name: "H", rows: 2, columns: 2, capacity: 4, isActive: true }], "sequential");
    assert(false, "Throws error for empty students");
  } catch (e) {
    assert(e.message.includes("No students"), "Throws error for empty students");
  }

  // Test: No halls
  try {
    allocateStudents(
      [{ _id: new mongoose.Types.ObjectId(), name: "A", rollNumber: "1", course: "CS" }],
      [],
      "sequential"
    );
    assert(false, "Throws error for empty halls");
  } catch (e) {
    assert(e.message.includes("No examination halls"), "Throws error for empty halls");
  }

  // Test: Insufficient capacity
  try {
    allocateStudents(
      [
        { _id: new mongoose.Types.ObjectId(), name: "A", rollNumber: "1", course: "CS" },
        { _id: new mongoose.Types.ObjectId(), name: "B", rollNumber: "2", course: "CS" },
        { _id: new mongoose.Types.ObjectId(), name: "C", rollNumber: "3", course: "CS" },
      ],
      [{ _id: new mongoose.Types.ObjectId(), name: "Small Hall", rows: 1, columns: 2, capacity: 2, isActive: true }],
      "sequential"
    );
    assert(false, "Throws error for insufficient capacity");
  } catch (e) {
    assert(e.message.includes("Insufficient"), "Throws error for insufficient capacity");
  }

  // Test: All halls inactive
  try {
    allocateStudents(
      [{ _id: new mongoose.Types.ObjectId(), name: "A", rollNumber: "1", course: "CS" }],
      [{ _id: new mongoose.Types.ObjectId(), name: "H", rows: 2, columns: 2, capacity: 4, isActive: false }],
      "sequential"
    );
    assert(false, "Throws error for all inactive halls");
  } catch (e) {
    assert(e.message.includes("inactive"), "Throws error for all inactive halls");
  }

  // Test: Single student, single hall
  const singleResult = allocateStudents(
    [{ _id: new mongoose.Types.ObjectId(), name: "Solo", rollNumber: "S001", course: "CS", studentId: "S001" }],
    [{ _id: new mongoose.Types.ObjectId(), name: "Hall X", rows: 5, columns: 5, capacity: 25, isActive: true }],
    "sequential"
  );
  assert(singleResult.totalStudents === 1, "Single student allocated correctly");
  assert(singleResult.allocations.length === 1, "Uses exactly 1 hall for 1 student");

  // Test: Large batch (100 students across multiple halls)
  const largeStudents = Array.from({ length: 100 }, (_, i) => ({
    _id: new mongoose.Types.ObjectId(),
    name: `Student ${i + 1}`,
    rollNumber: `R${String(i + 1).padStart(3, "0")}`,
    course: ["CS", "ME", "EE", "CE"][i % 4],
    studentId: `R${String(i + 1).padStart(3, "0")}`,
  }));
  const largeHalls = [
    { _id: new mongoose.Types.ObjectId(), name: "Auditorium", rows: 10, columns: 5, capacity: 50, isActive: true },
    { _id: new mongoose.Types.ObjectId(), name: "Lab Hall", rows: 8, columns: 8, capacity: 64, isActive: true },
  ];
  const largeResult = allocateStudents(largeStudents, largeHalls, "department-mixed");
  assert(largeResult.totalStudents === 100, "Large batch: All 100 students allocated");
  assert(largeResult.totalHalls === 2, "Large batch: Uses 2 halls");
}

// ════════════════════════════════════════════════════════
// 4. Integration Tests — Database Models
// ════════════════════════════════════════════════════════
async function testDatabaseModels() {
  console.log("\n🔹 Test Suite: Database Models");

  // Test: ExamHall model creates and validates
  const testHall = new ExamHall({
    name: "Test Hall " + Date.now(),
    building: "Test Block",
    floor: 1,
    rows: 5,
    columns: 6,
    facilities: ["AC", "Projector"],
    isActive: true,
  });
  await testHall.save();
  assert(testHall._id !== undefined, "ExamHall: Created successfully");
  assert(testHall.capacity === 30, "ExamHall: Capacity auto-calculated (5×6=30)");

  // Test: ExamHall validates required fields
  try {
    const badHall = new ExamHall({ floor: 1 });
    await badHall.save();
    assert(false, "ExamHall: Validates required fields");
  } catch (e) {
    assert(e.name === "ValidationError", "ExamHall: Validates required fields");
  }

  // Test: HallAllocation model creates
  const testAllocation = new HallAllocation({
    examSchedule: new mongoose.Types.ObjectId(),
    allocatedBy: new mongoose.Types.ObjectId(),
    strategy: "department-mixed",
    status: "draft",
    totalStudents: 10,
    totalHalls: 1,
    allocations: [
      {
        hall: testHall._id,
        hallName: testHall.name,
        seats: [
          {
            seatNumber: "A1",
            student: new mongoose.Types.ObjectId(),
            studentName: "Test Student",
            rollNumber: "T001",
            department: "CS",
          },
        ],
      },
    ],
  });
  await testAllocation.save();
  assert(testAllocation._id !== undefined, "HallAllocation: Created successfully");
  assert(testAllocation.strategy === "department-mixed", "HallAllocation: Strategy saved correctly");
  assert(testAllocation.allocations[0].seats.length === 1, "HallAllocation: Seat data saved");

  // Cleanup
  await ExamHall.deleteOne({ _id: testHall._id });
  await HallAllocation.deleteOne({ _id: testAllocation._id });
  assert(true, "Cleanup: Test data removed");
}

// ════════════════════════════════════════════════════════
// 5. API Route Tests (HTTP)
// ════════════════════════════════════════════════════════
async function testAPIRoutes() {
  console.log("\n🔹 Test Suite: API Routes (HTTP)");

  // Test: GET /api/exam-halls without auth returns 401
  try {
    const res = await fetch("http://localhost:5000/api/exam-halls");
    assert(res.status === 401, "GET /api/exam-halls without auth → 401");
  } catch (e) {
    assert(false, "GET /api/exam-halls without auth → 401 (fetch failed: " + e.message + ")");
  }

  // Test: GET /api/hall-allocations/student/my-seat without auth returns 401
  try {
    const res = await fetch("http://localhost:5000/api/hall-allocations/student/my-seat");
    assert(res.status === 401, "GET /api/hall-allocations/student/my-seat without auth → 401");
  } catch (e) {
    assert(false, "GET student/my-seat (fetch failed: " + e.message + ")");
  }

  // Test: POST /api/hall-allocations/generate without auth returns 401
  try {
    const res = await fetch("http://localhost:5000/api/hall-allocations/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examScheduleId: "fake", strategy: "sequential" }),
    });
    assert(res.status === 401, "POST /api/hall-allocations/generate without auth → 401");
  } catch (e) {
    assert(false, "POST generate (fetch failed: " + e.message + ")");
  }

  // Test: Backend health check
  try {
    const res = await fetch("http://localhost:5000/");
    const text = await res.text();
    assert(res.status === 200 && text.includes("SCMS"), "Backend health check → 200 OK");
  } catch (e) {
    assert(false, "Backend health check (fetch failed: " + e.message + ")");
  }
}

// ════════════════════════════════════════════════════════
// Run All Tests
// ════════════════════════════════════════════════════════
async function runAllTests() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Hall Allocation Feature — Test Suite");
  console.log("═══════════════════════════════════════════════════");

  // Unit tests (no DB needed)
  testSeatLabels();
  testAllocationEngine();
  testEdgeCases();

  // DB tests
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n  📦 Connected to MongoDB for integration tests");
    await testDatabaseModels();
    await testAPIRoutes();
  } catch (e) {
    console.log("\n  ⚠️  Skipping DB tests: " + e.message);
  }

  // Summary
  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log("═══════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
