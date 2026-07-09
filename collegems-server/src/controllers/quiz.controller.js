import Quiz from '../models/Quiz.model.js';
import Question from '../models/Question.model.js';
import QuizSubmission from '../models/QuizSubmission.model.js';

export const createQuiz = async (req, res) => {
  try {
    const { title, description, course, timeLimit, passingMarks, status, scheduledAt } = req.body;
    const quiz = new Quiz({
      title,
      description,
      course,
      createdBy: req.user._id,
      timeLimit,
      passingMarks,
      status,
      scheduledAt
    });
    await quiz.save();
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const createdQuestions = await Promise.all(
      questions.map(q => new Question({ ...q, quiz: quizId }).save())
    );

    res.status(201).json({ success: true, data: createdQuestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'teacher') {
      filter.createdBy = req.user._id;
    } else if (req.user.role === 'student') {
      filter.status = 'published';
    }
    const quizzes = await Quiz.find(filter).populate('course', 'name code').sort({ scheduledAt: 1 });
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'name code');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const questions = await Question.find({ quiz: quiz._id }).lean();
    
    if (req.user.role === 'student') {
      questions.forEach(q => { delete q.correctAnswer; });
    }

    res.status(200).json({ success: true, data: { quiz, questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    let score = 0;
    const questions = await Question.find({ quiz: quizId });

    answers.forEach(ans => {
      const question = questions.find(q => q._id.toString() === ans.questionId);
      if (question && question.type === 'MCQ' && question.correctAnswer === ans.selectedOption) {
        score += question.marks;
      }
    });

    const submission = new QuizSubmission({
      quiz: quizId,
      student: req.user._id,
      answers,
      score
    });

    await submission.save();

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
