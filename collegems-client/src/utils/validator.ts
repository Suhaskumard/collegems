import validator from 'validator';
import type {
  ValidationResult,
  RegistrationInput,
  RegistrationValidationResult,
  RegistrationErrors,
  SanitizedRegistrationData,
} from '../types/validation.types';

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email is required' };
  }

  const sanitizedEmail = validator.trim(email);

  if (!validator.isEmail(sanitizedEmail)) {
    return { isValid: false, message: 'Please provide a valid email address' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, message: 'Invalid email format' };
  }

  return { isValid: true, sanitizedValue: sanitizedEmail };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: 'Password is required' };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)',
    };
  }

  return { isValid: true };
};

export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const sanitizedName = validator.trim(name);

  if (sanitizedName.length === 0) {
    return { isValid: false, message: `${fieldName} cannot be empty` };
  }

  if (sanitizedName.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
  }

  if (sanitizedName.length > 50) {
    return { isValid: false, message: `${fieldName} must be less than 50 characters` };
  }

  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(sanitizedName)) {
    return {
      isValid: false,
      message: `${fieldName} can only contain letters, spaces, hyphens, apostrophes, and dots`,
    };
  }

  return { isValid: true, sanitizedValue: sanitizedName };
};

export const validatePhone = (phone: string | undefined): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: true, sanitizedValue: null };
  }

  const sanitizedPhone = validator.trim(phone);

  if (!validator.isMobilePhone(sanitizedPhone, 'any')) {
    return {
      isValid: false,
      message: 'Please provide a valid phone number',
    };
  }

  return { isValid: true, sanitizedValue: sanitizedPhone };
};

export const validateStudentId = (studentId: string | undefined): ValidationResult => {
  if (!studentId || studentId.trim() === '') {
    return { isValid: true, sanitizedValue: null };
  }

  const sanitizedStudentId = validator.trim(studentId);

  const studentIdRegex = /^[A-Z]{2,4}-\d{4,}$/;
  if (!studentIdRegex.test(sanitizedStudentId)) {
    return {
      isValid: false,
      message: 'Student ID must follow format: XXX-XXXX (e.g., STU-1234)',
    };
  }

  return { isValid: true, sanitizedValue: sanitizedStudentId };
};

export const validateRole = (role: string | undefined): ValidationResult => {
  const validRoles = ['student', 'teacher', 'hod', 'admin'];
  
  if (!role) {
    return { isValid: true, sanitizedValue: 'student' };
  }

  if (!validRoles.includes(role)) {
    return {
      isValid: false,
      message: `Role must be one of: ${validRoles.join(', ')}`,
    };
  }

  return { isValid: true, sanitizedValue: role };
};

export const validateRegistrationInput = (
  data: RegistrationInput
): RegistrationValidationResult => {
  const errors: RegistrationErrors = {};
  let isValid = true;

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.message;
    isValid = false;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.message;
    isValid = false;
  }

  const nameResult = validateName(data.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.message;
    isValid = false;
  }

  if (data.phone !== undefined) {
    const phoneResult = validatePhone(data.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.message;
      isValid = false;
    }
  }

  if (data.studentId !== undefined) {
    const studentIdResult = validateStudentId(data.studentId);
    if (!studentIdResult.isValid) {
      errors.studentId = studentIdResult.message;
      isValid = false;
    }
  }

  const roleResult = validateRole(data.role);
  if (!roleResult.isValid) {
    errors.role = roleResult.message;
    isValid = false;
  }

  const sanitizedData: SanitizedRegistrationData = {
    email: emailResult.sanitizedValue || data.email,
    name: nameResult.sanitizedValue || data.name,
    phone: phoneResult?.sanitizedValue || null,
    studentId: studentIdResult?.sanitizedValue || null,
  };

  return {
    isValid,
    errors,
    sanitizedData,
  };
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateStudentId,
  validateRole,
  validateRegistrationInput,
};