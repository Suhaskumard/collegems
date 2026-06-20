import mongoose from "mongoose";

const SemesterSchema = new mongoose.Schema(
  {
    semester: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    frozenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Semester", SemesterSchema);
