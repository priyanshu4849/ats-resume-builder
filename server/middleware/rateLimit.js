const rateLimit = require("express-rate-limit");

// Protects register/login from brute-force and spam account creation.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

// Protects the routes that call the Claude API (billed per call) or run
// Puppeteer (CPU/memory heavy on a free-tier instance) from abuse.
const heavyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a few minutes." },
});

module.exports = { authLimiter, heavyLimiter };
