import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.middleware.js";
import log from "../utils/logger.js";
import Fee from "../models/Fee.model.js";
import User from "../models/User.model.js";

const router = express.Router();

// Set fee for student
router.post(
  "/set",
  protect,
  allowRoles("hod"),
  asyncHandler(async (req, res) => {
    const { student, total, dueDate } = req.body;

    log.request("POST", "/api/fee/set", req.user?.id);

    if (!student || !total || !dueDate) {
      throw new AppError(
        "Student, total amount and due date are required",
        400,
        "MISSING_FIELDS"
      );
    }

    if (total <= 0) {
      throw new AppError("Total amount must be greater than 0", 400, "INVALID_AMOUNT");
    }

    const existingFee = await Fee.findOne({ student });
    if (existingFee) {
      throw new AppError("Fee already exists for this student", 409, "DUPLICATE_FEE");
    }

    const fee = await Fee.create({
      student,
      total,
      dueDate,
    });

    log.info(`Fee set for student: ${student}`, { feeId: fee._id, total });
    res.status(201).json({ success: true, data: fee });
  })
);

// Pay installment
router.post(
  "/pay",
  protect,
  allowRoles("student", "parent"),
  asyncHandler(async (req, res) => {
    const { amount } = req.body;

    log.request("POST", "/api/fee/pay", req.user?.id);

    if (!amount || amount <= 0) {
      throw new AppError("Valid amount is required", 400, "INVALID_AMOUNT");
    }

    let studentId = req.user.id;
    if (req.user.role === "parent") {
      const parent = await User.findById(req.user.id);
      if (!parent || !parent.childId) {
        throw new AppError("No child linked to parent account", 400, "NO_CHILD_LINKED");
      }
      studentId = parent.childId;
    }

    const fee = await Fee.findOne({ student: studentId });
    if (!fee) {
      throw new AppError("Fee record not found", 404, "NOT_FOUND");
    }

    fee.installments.push({ amount });
    fee.paid += amount;
    await fee.save();

    log.info(`Payment made: ${amount}`, { studentId, feeId: fee._id });
    res.json({
      success: true,
      message: "Payment successful",
      data: fee,
    });
  })
);

// Student views own fee
router.get(
  "/me",
  protect,
  allowRoles("student", "parent"),
  asyncHandler(async (req, res) => {
    log.request("GET", "/api/fee/me", req.user?.id);

    let studentId = req.user.id;
    if (req.user.role === "parent") {
      const parent = await User.findById(req.user.id);
      if (!parent || !parent.childId) {
        throw new AppError("No child linked to parent account", 400, "NO_CHILD_LINKED");
      }
      studentId = parent.childId;
    }

    const fee = await Fee.findOne({ student: studentId });
    if (!fee) {
      throw new AppError("No fee record found", 404, "NOT_FOUND");
    }

    res.json({ success: true, data: fee });
  })
);

// View all student fees
router.get(
  "/all",
  protect,
  allowRoles("teacher", "hod"),
  asyncHandler(async (req, res) => {
    log.request("GET", "/api/fee/all", req.user?.id);
    const fees = await Fee.find().populate("student", "name email");
    res.json({ success: true, data: fees });
  })
);

export default router;
