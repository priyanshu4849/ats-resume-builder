const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    personalInfo: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
    },
    education: [
      {
        school: { type: String, trim: true },
        degree: { type: String, trim: true },
        startDate: { type: String, trim: true },
        endDate: { type: String, trim: true },
        gpa: { type: String, trim: true },
      },
    ],
    experience: [
      {
        company: { type: String, trim: true },
        role: { type: String, trim: true },
        startDate: { type: String, trim: true },
        endDate: { type: String, trim: true },
        bullets: [{ type: String }],
      },
    ],
    projects: [
      {
        name: { type: String, trim: true },
        techStack: [{ type: String }],
        bullets: [{ type: String }],
        link: { type: String, trim: true },
      },
    ],
    skills: [{ type: String }],
    atsAnalyses: [
      {
        jdText: { type: String, required: true },
        matchScore: { type: Number, required: true },
        missingKeywords: [{ type: String }],
        weakBullets: [
          {
            text: { type: String },
            reason: { type: String },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    source: {
      type: String,
      enum: ["scratch", "uploaded"],
      required: true,
      default: "scratch",
    },
    rawUploadedText: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
