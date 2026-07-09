import { execSync } from "child_process";

/**
 * Checks if the configured port is already in use and terminates the conflicting process.
 * Exports a reusable utility function.
 * @param {number|string} port - The port number to check and clean up.
 */
const freePort = (port) => {
  try {
    const pid = execSync(`lsof -ti:${port}`, { encoding: "utf8", timeout: 2000 }).trim();
    if (pid) {
      execSync(`kill -9 ${pid}`, { timeout: 1000 });
      console.log(`Freed port ${port} (killed PID ${pid})`);
    }
  } catch {
    // Port is free, safely ignore the error.
  }
};

export default freePort;