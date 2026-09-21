const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const resumeRoutes = require("./routes/resumes");

const app = express();
// Render sits behind a reverse proxy; without this, every request looks like
// it comes from the same internal IP, which breaks per-IP rate limiting.
app.set("trust proxy", 1);
app.use(helmet());
// Falls back to the known frontend URL if CLIENT_URL isn't set — the `cors`
// package treats `origin: undefined` as "trust no one" (not "trust everyone"
// like you'd expect), so a missing env var must not leave this blank.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://ats-resume-builder-ten-xi.vercel.app",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message || "Something went wrong" });
});

module.exports = app;
