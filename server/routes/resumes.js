const express = require("express");
const requireAuth = require("../middleware/auth");
const upload = require("../middleware/upload");
const Resume = require("../models/Resume");
const parseResumeFile = require("../services/parseResumeFile");
const extractResumeData = require("../services/extractResumeData");
const scoreResumeAgainstJD = require("../services/scoreResumeAgainstJD");
const rewriteBullet = require("../services/rewriteBullet");

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

router.post("/upload", requireAuth, upload.single("resumeFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "resumeFile is required" });
    }

    const resumeText = await parseResumeFile(req.file);
    const extracted = await extractResumeData(resumeText);

    const resume = await Resume.create({
      userId: req.userId,
      title: req.file.originalname,
      source: "uploaded",
      rawUploadedText: resumeText,
      personalInfo: extracted.personalInfo,
      education: extracted.education,
      experience: extracted.experience,
      projects: extracted.projects,
      skills: extracted.skills,
    });

    res.status(201).json({ resume });
  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong processing the resume" });
  }
});

router.post("/:id/analyze", requireAuth, async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "jobDescription is required" });
    }

    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const result = await scoreResumeAgainstJD(resume, jobDescription);

    resume.atsAnalyses.push({
      jdText: jobDescription,
      matchScore: result.matchScore,
      missingKeywords: result.missingKeywords,
      weakBullets: result.weakBullets,
    });
    await resume.save();

    const analysis = resume.atsAnalyses[resume.atsAnalyses.length - 1];
    res.status(201).json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong analyzing the resume" });
  }
});

router.post("/:id/rewrite-bullet", requireAuth, async (req, res) => {
  try {
    const { bulletText, jobDescription } = req.body;

    if (!bulletText || !jobDescription) {
      return res.status(400).json({ error: "bulletText and jobDescription are required" });
    }

    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const suggestion = await rewriteBullet(bulletText, jobDescription);
    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong rewriting the bullet" });
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
