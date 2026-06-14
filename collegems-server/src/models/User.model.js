import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher", "hod", "parent"], required: true },
  phone: { type: String },


  // Parent-specific fields
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.role === "parent";
    },
  },


  // Student-specific fields
  studentId: { type: String },
  semester: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },
  course: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },


  // Teacher-specific
  teacherId: { type: String },
  department: {
    type: String,
    required: function () {
      return this.role === "teacher";
    },
  },
  unavailableTimeSlots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "TimeSlot"
  }],


  // HOD-specific
  departmentCode: { type: String },

  settings: {
    preferences: {
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" },
      digestFrequency: { type: String, default: "weekly" },
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
  },
});

export default mongoose.model("User", userSchema);
