import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

// Define User interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'hod' | 'admin';
  phone?: string;
  studentId?: string;
  department?: string;
  semester?: number;
  profilePicture?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

// Define User schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be less than 50 characters'],
      match: [/^[a-zA-Z\s\-'.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and dots'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => validator.isEmail(value),
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: function(this: IUser, value: string): boolean {
          // Only validate if password is being set or modified
          if (!this.isModified('password')) return true;

          // Password policy: at least 1 uppercase, 1 lowercase, 1 number, 1 special character
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return passwordRegex.test(value);
        },
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)',
      },
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'hod', 'admin'],
      default: 'student',
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(this: IUser, value: string): boolean {
          if (!value) return true; // Phone is optional
          return validator.isMobilePhone(value, 'any');
        },
        message: 'Please provide a valid phone number',
      },
    },
    studentId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      validate: {
        validator: function(this: IUser, value: string): boolean {
          if (!value) return true; // Student ID is optional
          const studentIdRegex = /^[A-Z]{2,4}-\d{4,}$/;
          return studentIdRegex.test(value);
        },
        message: 'Student ID must follow format: XXX-XXXX (e.g., STU-1234)',
      },
    },
    department: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Transform response (remove password and sensitive fields)
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;
  return obj;
};

// Create and export User model
const User = mongoose.model<IUser>('User', userSchema);
export default User;