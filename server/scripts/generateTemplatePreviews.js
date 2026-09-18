// One-off dev tool: screenshots each resume template with sample data so the
// frontend can show a real preview thumbnail instead of a text-only label.
// Run manually with `npm run generate:previews` (from /server) any time a
// template's HTML/CSS changes — the PNGs are committed, not generated at runtime.
const path = require("path");
const puppeteer = require("puppeteer");
const { renderResumeHTML, TEMPLATE_NAMES } = require("../services/templates");

const sampleResume = {
  title: "Sample Resume",
  personalInfo: {
    name: "Jordan Avery",
    email: "jordan.avery@email.com",
    phone: "(555) 123-4567",
    linkedin: "linkedin.com/in/jordanavery",
    github: "github.com/jordanavery",
  },
  education: [
    {
      school: "State University",
      degree: "B.S. in Computer Science",
      startDate: "2020",
      endDate: "2024",
      gpa: "3.8",
    },
  ],
  experience: [
    {
      role: "Software Engineer Intern",
      company: "TechCorp",
      startDate: "May 2023",
      endDate: "Aug 2023",
      bullets: [
        "Built a REST API used by 10k+ daily active users, reducing average response time by 35%",
        "Led migration of legacy auth system to JWT, cutting login-related support tickets by half",
      ],
    },
    {
      role: "Frontend Developer",
      company: "StartupXYZ",
      startDate: "Jan 2022",
      endDate: "Apr 2023",
      bullets: [
        "Shipped a React dashboard adopted by every internal team, replacing three legacy tools",
      ],
    },
  ],
  projects: [
    {
      name: "ATS Resume Builder",
      techStack: ["React", "Node.js", "MongoDB", "Claude API"],
      link: "github.com/jordanavery/ats-resume-builder",
      bullets: [
        "Built a full-stack app that parses resumes and scores them against job descriptions using an LLM",
      ],
    },
  ],
  skills: ["JavaScript", "React", "Node.js", "MongoDB", "Python", "Git"],
};

const OUTPUT_DIR = path.join(__dirname, "..", "..", "client", "public", "template-previews");

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1000, deviceScaleFactor: 2 });
    // Templates don't declare an explicit background-color (they rely on the
    // browser's default white canvas). Headless Chrome auto-dark-themes pages
    // without one when the host OS is in dark mode, which renders near-black
    // with barely visible text — force light mode so previews look like the
    // real PDF output.
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);

    for (const templateName of TEMPLATE_NAMES) {
      const html = renderResumeHTML(sampleResume, templateName);
      await page.setContent(html, { waitUntil: "domcontentloaded" });
      // fullPage screenshots would crop to the viewport height we set above
      // (1000px), leaving a block of blank page below short resumes. Clip to
      // the real rendered content height instead.
      // document.documentElement.scrollHeight stretches to at least the
      // viewport height even when content is shorter; document.body's does not.
      const contentHeight = await page.evaluate(() => document.body.scrollHeight);
      const outputPath = path.join(OUTPUT_DIR, `${templateName}.png`);
      await page.screenshot({
        path: outputPath,
        clip: { x: 0, y: 0, width: 794, height: contentHeight },
      });
      console.log(`Wrote ${outputPath}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
