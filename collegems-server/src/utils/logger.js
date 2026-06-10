import fs from "fs";
import path from "path";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, "app.log");
const errorLogFile = path.join(logsDir, "error.log");

const getTimestamp = () => new Date().toISOString();

const log = {
  info: (message, data = {}) => {
    const logMessage = `[${getTimestamp()}] INFO: ${message}`;
    console.log(logMessage, data);
    fs.appendFileSync(logFile, `${logMessage} ${JSON.stringify(data)}\n`);
  },

  error: (message, error, data = {}) => {
    const stack = error?.stack || "No stack trace";
    const errorMessage = `[${getTimestamp()}] ERROR: ${message}`;
    console.error(errorMessage, error, data);
    fs.appendFileSync(
      errorLogFile,
      `${errorMessage}\nStack: ${stack}\nData: ${JSON.stringify(data)}\n---\n`
    );
  },

  warn: (message, data = {}) => {
    const warnMessage = `[${getTimestamp()}] WARN: ${message}`;
    console.warn(warnMessage, data);
    fs.appendFileSync(logFile, `${warnMessage} ${JSON.stringify(data)}\n`);
  },

  request: (method, path, userId = "anonymous", statusCode = null) => {
    const reqMessage = `[${getTimestamp()}] REQ: ${method} ${path} - User: ${userId}${
      statusCode ? ` - Status: ${statusCode}` : ""
    }`;
    console.log(reqMessage);
    fs.appendFileSync(logFile, `${reqMessage}\n`);
  },
};

export default log;
