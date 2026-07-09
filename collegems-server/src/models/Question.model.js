import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  type: { type: String, enum: ['MCQ', 'ShortAnswer'], required: true },
  text: { type: String, required: true },
  options: [{ type: String }], // Only for MCQ
  correctAnswer: { type: String, required: true },
  marks: { type: Number, required: true, default: 1 },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
