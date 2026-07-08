export interface ValidationResult {
  isValid: boolean;
  message?: string;
  sanitizedValue?: string | null;
}

export interface RegistrationValidationResult {
  isValid: boolean;
  errors: RegistrationErrors;
  sanitizedData: SanitizedRegistrationData;
}

export interface RegistrationErrors {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  studentId?: string;
  role?: string;
}

export interface SanitizedRegistrationData {
  email: string;
  name: string;
  phone: string | null;
  studentId: string | null;
}

export interface RegistrationInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  studentId?: string;
  role?: 'student' | 'teacher' | 'hod' | 'admin';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PasswordResetInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}