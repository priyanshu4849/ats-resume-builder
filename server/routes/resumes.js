const express = require("express");
const requireAuth = require("../middleware/auth");
const Resume = require("../models/Resume");

const router = express.Router();

const ALLOWED_UPDATE_FIELDS = [
  "title",
  "personalInfo",
  "education",
  "experience",
  "projects",
  "skills",
];

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const resume = await Resume.create({ userId: req.userId, title });
    res.status(201).json({ resume });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong creating the resume" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId });
    res.json({ resumes });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong fetching resumes" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong fetching the resume" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json({ resume });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong updating the resume" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.json({ message: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong deleting the resume" });
  }
});

module.exports = router;
