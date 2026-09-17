const rateLimit = require("express-rate-limit");

// Overridable so the test suite (which shares these limiters across many
// requests within a single file) doesn't trip its own rate limits.
const AUTH_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 20;
const HEAVY_MAX = Number(process.env.HEAVY_RATE_LIMIT_MAX) || 20;

// Protects register/login/forgot-password/reset-password from brute-force,
// spam account creation, and reset-email spam.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

// Protects the routes that call the Claude API (billed per call) or run
// Puppeteer (CPU/memory heavy on a free-tier instance) from abuse.
const heavyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: HEAVY_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a few minutes." },
});

module.exports = { authLimiter, heavyLimiter };
