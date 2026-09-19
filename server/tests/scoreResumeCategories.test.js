const scoreResumeCategories = require("../services/scoreResumeCategories");

const baseResume = {
  personalInfo: { name: "Jordan Avery", email: "jordan@example.com" },
  education: [{ school: "State University", degree: "B.S. Computer Science" }],
  skills: ["JavaScript", "React"],
  experience: [],
  projects: [],
};

describe("scoreResumeCategories", () => {
  it("scores action verbs and quantified impact based on bullet content", () => {
    const resume = {
      ...baseResume,
      experience: [
        {
          company: "TechCorp",
          role: "Intern",
          bullets: [
            "Built a REST API used by 10k+ daily active users",
            "Worked on backend stuff and helped fix bugs",
          ],
        },
      ],
    };

    const categories = scoreResumeCategories(resume, { matchedKeywords: [], missingKeywords: [] });

    // 1 of 2 bullets opens with a strong verb ("Built"); the other opens with "Worked on".
    expect(categories.actionVerbs.score).toBe(50);
    expect(categories.actionVerbs.verdict).toBe("ok");

    // 1 of 2 bullets has a number.
    expect(categories.quantifiedImpact.score).toBe(50);
  });

  it("gives a weak verdict and zero score when there are no bullets", () => {
    const categories = scoreResumeCategories(baseResume, { matchedKeywords: [], missingKeywords: [] });

    expect(categories.actionVerbs.score).toBe(0);
    expect(categories.actionVerbs.verdict).toBe("weak");
    expect(categories.quantifiedImpact.score).toBe(0);
    expect(categories.length.score).toBe(0);
  });

  it("scores formatting down when core sections are missing", () => {
    const incompleteResume = { personalInfo: {}, education: [], skills: [], experience: [], projects: [] };

    const categories = scoreResumeCategories(incompleteResume, { matchedKeywords: [], missingKeywords: [] });

    expect(categories.formatting.score).toBe(0);
    expect(categories.formatting.verdict).toBe("weak");
    expect(categories.formatting.reason).toMatch(/name\/email/);
  });

  it("scores formatting at 100 when all core sections are present", () => {
    const resume = {
      ...baseResume,
      experience: [{ company: "TechCorp", role: "Intern", bullets: ["Built something"] }],
    };

    const categories = scoreResumeCategories(resume, { matchedKeywords: [], missingKeywords: [] });

    expect(categories.formatting.score).toBe(100);
    expect(categories.formatting.verdict).toBe("good");
  });

  it("computes the keywords category from matched vs missing keywords", () => {
    const categories = scoreResumeCategories(baseResume, {
      matchedKeywords: ["JavaScript", "React"],
      missingKeywords: ["Node.js"],
    });

    // 2 of 3 total keywords matched.
    expect(categories.keywords.score).toBe(67);
    expect(categories.keywords.verdict).toBe("ok");
  });

  it("gives a perfect keywords score when the job description names nothing missing", () => {
    const categories = scoreResumeCategories(baseResume, { matchedKeywords: [], missingKeywords: [] });

    expect(categories.keywords.score).toBe(100);
    expect(categories.keywords.verdict).toBe("good");
  });

  it("scores length based on total bullet count across experience and projects", () => {
    const manyBullets = Array.from({ length: 8 }, (_, i) => `Did thing number ${i}`);
    const resume = {
      ...baseResume,
      experience: [{ company: "TechCorp", role: "Intern", bullets: manyBullets }],
    };

    const categories = scoreResumeCategories(resume, { matchedKeywords: [], missingKeywords: [] });

    expect(categories.length.score).toBe(100);
    expect(categories.length.verdict).toBe("good");
  });
});
