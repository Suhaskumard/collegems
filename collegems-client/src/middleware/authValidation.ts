import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { validateRegistrationInput } from '../../utils/validators';
import type { RegistrationInput, LoginInput, PasswordResetInput } from '../../types/validation.types';

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { email, password, name, phone, studentId, role } = req.body;

  const { isValid, errors, sanitizedData } = validateRegistrationInput({
    email,
    password,
    name,
    phone,
    studentId,
    role,
  } as RegistrationInput);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors,
    });
  }

  req.body = {
    ...req.body,
    email: sanitizedData.email,
    name: sanitizedData.name,
    phone: sanitizedData.phone,
    studentId: sanitizedData.studentId,
    role: role || 'student',
  };

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { email, password } = req.body as LoginInput;
  const errors: Record<string, string> = {};

  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(validator.trim(email))) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body.email = validator.trim(email);
  next();
};

export const validatePasswordReset = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { email } = req.body as PasswordResetInput;

  if (!email || email.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  const sanitizedEmail = validator.trim(email);
  if (!validator.isEmail(sanitizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
    });
  }

  req.body.email = sanitizedEmail;
  next();
};

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { token, newPassword } = req.body;

  if (!token || token.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Reset token is required',
    });
  }

  if (!newPassword || newPassword.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'New password is required',
    });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long',
    });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)',
    });
  }

  next();
};

export default {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateResetPassword,
};