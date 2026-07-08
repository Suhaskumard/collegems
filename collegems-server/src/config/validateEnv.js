import dotenv from "dotenv";
dotenv.config(); // Ensure environment variables are loaded

/**
 * Validates required environment variables.
 * Exits the process with code 1 if any required variable is missing.
 * @returns {boolean} true if all variables are present.
 */
const validateEnv = () => {
  if (!process.env.MONGO_URI) {
    console.error(
      "Missing MONGO_URI in .env. Please set MONGO_URI to your MongoDB connection string."
    );
    process.exit(1);
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error(
      "Missing JWT secrets in .env. Please set both JWT_SECRET and JWT_REFRESH_SECRET."
    );
    process.exit(1);
  }

  return true;
};

export default validateEnv;