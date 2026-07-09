import test from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.model.js";
import Book from "../models/Book.model.js";
import BookIssue from "../models/BookIssue.model.js";
import jwt from "jsonwebtoken";

// Regression test for #507: GET /api/library/issues must not mutate data.
// It previously flipped overdue "issued" records to "overdue" and saved them
// on read. The response should still reflect overdue status (derived), but the
// persisted record must remain untouched by the GET handler.
test("getIssueRecords does not persist overdue status on read", async (t) => {
  let mongoServer;
  let student;
  let studentToken;
  let overdueIssue;

  t.before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const jwtSecret = process.env.JWT_SECRET || "testsecret";
    process.env.JWT_SECRET = jwtSecret;

    student = await User.create({
      name: "Read-Only Student",
      email: "readonly.student@test.com",
      password: "password123",
      role: "student",
      studentId: "S-RO-507",
      semester: "3",
      course: "Computer Science",
    });

    studentToken = jwt.sign({ id: student._id, role: student.role }, jwtSecret);

    const book = await Book.create({
      title: "Overdue Book",
      author: "Jane Doe",
      category: "Fiction",
      isbn: "978-0000000507",
      quantity: 5,
      availableQuantity: 4,
    });

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Past due but still stored as "issued" (the cron job hasn't run yet).
    overdueIssue = await BookIssue.create({
      book: book._id,
      user: student._id,
      issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dueDate: threeDaysAgo,
      status: "issued",
    });
  });

  t.after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  await t.test("response derives overdue status", async () => {
    const res = await request(app)
      .get("/api/library/issues")
      .set("Authorization", `Bearer ${studentToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);

    const returned = res.body.issues.find(
      (i) => String(i._id) === String(overdueIssue._id)
    );
    assert.ok(returned, "issued record should be returned");
    assert.strictEqual(
      returned.status,
      "overdue",
      "past-due record should read as overdue"
    );
  });

  await t.test("stored record is not mutated by the GET", async () => {
    const stored = await BookIssue.findById(overdueIssue._id);
    assert.strictEqual(
      stored.status,
      "issued",
      "GET must not persist the overdue transition"
    );
  });
});
