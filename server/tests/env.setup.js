process.env.JWT_SECRET = "test-jwt-secret";
// The real limits are tight on purpose (protects auth from brute-force and
// the AI/PDF routes from cost abuse) — too tight for a growing test suite
// that shares one module-level limiter across many requests in one file.
process.env.AUTH_RATE_LIMIT_MAX = "1000";
process.env.HEAVY_RATE_LIMIT_MAX = "1000";
