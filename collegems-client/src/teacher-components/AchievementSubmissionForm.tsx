import { useState } from "react";
import {Trophy, User, Tag, Calendar, FileText, Award, CheckCircle, Loader2, AlertCircle,} from "lucide-react";

//  Types 

interface FormData {
  achievementTitle: string;
  studentName: string;
  category: string;
  customCategory: string;
  year: string;
  description: string;
  rank: string;
}

interface FormErrors {
  achievementTitle?: string;
  studentName?: string;
  category?: string;
  customCategory?: string;
  year?: string;
  description?: string;
  rank?: string;
}

//  Constants 

const CATEGORIES = [
  "Coding",
  "Innovation",
  "Research",
  "Debate",
  "Sports",
  "Arts",
  "Music",
  "Other",
];

const RANKS = [
  { value: "gold", label: "1st Place / Gold" },
  { value: "silver", label: "2nd Place / Silver" },
  { value: "bronze", label: "3rd Place / Bronze" },
  { value: "special", label: "Special Recognition" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => String(CURRENT_YEAR - i));

const EMPTY_FORM: FormData = {
  achievementTitle: "",
  studentName: "",
  category: "",
  customCategory: "",
  year: "",
  description: "",
  rank: "",
};

//  Validation 

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.achievementTitle.trim()) {
    errors.achievementTitle = "Achievement title is required.";
  } else if (data.achievementTitle.trim().length < 3) {
    errors.achievementTitle = "Title must be at least 3 characters.";
  }

  if (!data.studentName.trim()) {
    errors.studentName = "Student name is required.";
  } else if (data.studentName.trim().length < 5) {
    errors.studentName = "Name must be at least 10 characters.";
  }

  if (!data.category) {
    errors.category = "Please select a category.";
  }

  if (data.category === "Other" && !data.customCategory.trim()) {
    errors.customCategory = "Please specify the category name.";
  } else if (data.category === "Other" && data.customCategory.trim().length < 5) {
    errors.customCategory = "Category name must be at least 10 characters.";
  }

  if (!data.year) {
    errors.year = "Please select a year.";
  }

  if (!data.description.trim()) {
    errors.description = "Description is required.";
  } else if (data.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  } else if (data.description.trim().length > 300) {
    errors.description = "Description must be under 300 characters.";
  }

  if (!data.rank) {
    errors.rank = "Please select a rank or recognition type.";
  }

  return errors;
}

//  Field Error Message 

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {message}
    </p>
  );
}

//  Form Field Wrapper 

function FieldWrapper({
  label,
  icon: Icon,
  required,
  children,
  error,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
        <Icon className="w-4 h-4 text-gray-400" />
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

//  Main Component 

export default function AchievementSubmissionForm() {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputBase =
    "w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const inputNormal = `${inputBase} border-gray-300`;
  const inputError = `${inputBase} border-red-400 bg-red-50`;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear customCategory when switching away from Other
      ...(name === "category" && value !== "Other" ? { customCategory: "" } : {}),
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate async submission delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // TODO: Connect submission form to backend API endpoint
    // Example: await api.post("/achievements/submit", formData);
    // TODO: Implement achievement approval workflow (submitted → pending → approved)
    // TODO: Add image/document upload support for proof of achievement
    console.log("Achievement submitted (mock):", {
      ...formData,
      category: formData.category === "Other" ? formData.customCategory : formData.category,
      submittedAt: new Date().toISOString(),
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData(EMPTY_FORM);
    setErrors({});

    // Auto-hide success message after 4 seconds
    setTimeout(() => setIsSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Submit Student Achievement
              </h1>
              <p className="text-gray-500 mt-0.5">
                Nominate a student for their outstanding accomplishment
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">
                Achievement submitted successfully!
              </p>
              <p className="text-sm text-green-700 mt-0.5">
                The achievement has been logged and will be reviewed shortly.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Row 1: Title + Student Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrapper
                label="Achievement Title"
                icon={Trophy}
                required
                error={errors.achievementTitle}
              >
                <input
                  type="text"
                  name="achievementTitle"
                  value={formData.achievementTitle}
                  onChange={handleChange}
                  placeholder="e.g. Hackathon Winner, National Olympiad"
                  className={errors.achievementTitle ? inputError : inputNormal}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Student Name"
                icon={User}
                required
                error={errors.studentName}
              >
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Full name of the student"
                  className={errors.studentName ? inputError : inputNormal}
                />
              </FieldWrapper>
            </div>

            {/* Row 2: Category + Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrapper
                label="Category"
                icon={Tag}
                required
                error={errors.category}
              >
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? inputError : inputNormal}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FieldWrapper>

              {formData.category === "Other" && (
                <FieldWrapper
                  label="Specify Category"
                  icon={Tag}
                  required
                  error={errors.customCategory}
                >
                  <input
                    type="text"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleChange}
                    placeholder="e.g. Entrepreneurship, Social Work"
                    className={errors.customCategory ? inputError : inputNormal}
                    autoFocus
                  />
                </FieldWrapper>
              )}

              <FieldWrapper
                label="Year"
                icon={Calendar}
                required
                error={errors.year}
              >
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={errors.year ? inputError : inputNormal}
                >
                  <option value="">Select year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </FieldWrapper>
            </div>

            {/* Row 3: Rank */}
            <FieldWrapper
              label="Rank / Recognition"
              icon={Award}
              required
              error={errors.rank}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {RANKS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                      formData.rank === r.value
                        ? "bg-blue-50 border-blue-400 text-blue-700 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rank"
                      value={r.value}
                      checked={formData.rank === r.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
              {errors.rank && <FieldError message={errors.rank} />}
            </FieldWrapper>

            {/* Row 4: Description */}
            <FieldWrapper
              label="Description"
              icon={FileText}
              required
              error={errors.description}
            >
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe the achievement (max 300 characters)"
                rows={4}
                maxLength={300}
                className={`${errors.description ? inputError : inputNormal} resize-none`}
              />
              <p className="mt-1 text-xs text-gray-400 text-right">
                {formData.description.length} / 300
              </p>
            </FieldWrapper>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setFormData(EMPTY_FORM);
                  setErrors({});
                  setIsSuccess(false);
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" />
                    Submit Achievement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
