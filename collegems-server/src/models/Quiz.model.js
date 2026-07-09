import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeLimit: { type: Number, required: true, default: 30 }, // in minutes
  passingMarks: { type: Number, default: 40 },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  scheduledAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
