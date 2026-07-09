import express from 'express';
import { createQuiz, addQuestions, getQuizzes, getQuizDetails, submitQuiz } from '../controllers/quiz.controller.js';
import { authenticate, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(getQuizzes)
  .post(restrictTo('teacher', 'hod'), createQuiz);

router.post('/:quizId/questions', restrictTo('teacher', 'hod'), addQuestions);

router.get('/:id', getQuizDetails);

router.post('/:quizId/submit', restrictTo('student'), submitQuiz);

export default router;
