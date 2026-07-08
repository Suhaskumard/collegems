/**
 * Middleware to parse User-Agent header and IP address
 * to attach device information to the request object.
 */
export const detectDevice = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";

  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let device = "Desktop";

  const ua = userAgent.toLowerCase();

  // Browser detection
  if (ua.includes("firefox") || ua.includes("fxios")) {
    browser = "Firefox";
  } else if (ua.includes("edge") || ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("chrome") || ua.includes("crios")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("msie") || ua.includes("trident")) {
    browser = "Internet Explorer";
  } else if (ua.includes("opera") || ua.includes("opr/")) {
    browser = "Opera";
  }

  // OS detection
  if (ua.includes("windows nt")) {
    os = "Windows";
  } else if (ua.includes("macintosh") || ua.includes("mac os x")) {
    os = "macOS";
  } else if (ua.includes("android")) {
    os = "Android";
    device = "Mobile";
  } else if (ua.includes("iphone")) {
    os = "iOS";
    device = "Mobile";
  } else if (ua.includes("ipad")) {
    os = "iOS";
    device = "Tablet";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  req.deviceInfo = { browser, os, device };
  req.ipAddress = ip;
  next();
};
