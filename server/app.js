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
app.use(
  cors({
    origin: process.env.CLIENT_URL,
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
