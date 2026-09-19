const { analyzeBullet } = require("./resumeHeuristics");

function verdictFor(score) {
  if (score >= 75) return "good";
  if (score >= 45) return "ok";
  return "weak";
}

function collectBullets(resume) {
  const experienceBullets = (resume.experience || []).flatMap((exp) => exp.bullets || []);
  const projectBullets = (resume.projects || []).flatMap((proj) => proj.bullets || []);
  return [...experienceBullets, ...projectBullets].filter(Boolean);
}

function scoreActionVerbs(bullets) {
  if (bullets.length === 0) {
    return { score: 0, verdict: "weak", reason: "No bullet points to evaluate yet." };
  }
  const strongCount = bullets.filter((b) => analyzeBullet(b).strongVerb).length;
  const score = Math.round((strongCount / bullets.length) * 100);
  const reason =
    score >= 75
      ? "Most bullets open with a strong action verb."
      : `${bullets.length - strongCount} of ${bullets.length} bullets don't open with a strong action verb.`;
  return { score, verdict: verdictFor(score), reason };
}

function scoreQuantifiedImpact(bullets) {
  if (bullets.length === 0) {
    return { score: 0, verdict: "weak", reason: "No bullet points to evaluate yet." };
  }
  const quantifiedCount = bullets.filter((b) => analyzeBullet(b).quantified).length;
  const score = Math.round((quantifiedCount / bullets.length) * 100);
  const reason =
    score >= 75
      ? "Most bullets back up their impact with a number."
      : `${bullets.length - quantifiedCount} of ${bullets.length} bullets have no number, %, or metric.`;
  return { score, verdict: verdictFor(score), reason };
}

function scoreLength(bullets) {
  const count = bullets.length;
  let score;
  if (count === 0) score = 0;
  else if (count <= 2) score = 40;
  else if (count <= 5) score = 70;
  else if (count <= 15) score = 100;
  else if (count <= 20) score = 80;
  else score = 60;

  let reason;
  if (count === 0) reason = "No experience or project bullets yet.";
  else if (count < 6) reason = `Only ${count} bullets total — likely reads as thin.`;
  else if (count <= 15) reason = `${count} bullets is a solid, one-page-friendly amount.`;
  else reason = `${count} bullets is a lot — may spill past one page.`;

  return { score, verdict: verdictFor(score), reason };
}

function scoreFormatting(resume) {
  const personalInfo = resume.personalInfo || {};
  const checks = [
    Boolean(personalInfo.name && personalInfo.email),
    (resume.education || []).length > 0,
    (resume.experience || []).length > 0 || (resume.projects || []).length > 0,
    (resume.skills || []).length > 0,
    collectBullets(resume).length > 0,
  ];
  const passed = checks.filter(Boolean).length;
  const score = Math.round((passed / checks.length) * 100);

  const missing = [];
  if (!checks[0]) missing.push("name/email");
  if (!checks[1]) missing.push("education");
  if (!checks[2]) missing.push("experience or projects");
  if (!checks[3]) missing.push("skills");
  if (!checks[4]) missing.push("bullet points");

  const reason =
    missing.length === 0
      ? "All core resume sections are filled in."
      : `Missing: ${missing.join(", ")}.`;

  return { score, verdict: verdictFor(score), reason };
}

function scoreKeywords(matchedKeywords, missingKeywords) {
  const total = matchedKeywords.length + missingKeywords.length;
  if (total === 0) {
    return { score: 100, verdict: "good", reason: "No specific keywords required by this job description." };
  }
  const score = Math.round((matchedKeywords.length / total) * 100);
  const reason = `${matchedKeywords.length} of ${total} key terms from the job description appear in your resume.`;
  return { score, verdict: verdictFor(score), reason };
}

function scoreResumeCategories(resume, { matchedKeywords = [], missingKeywords = [] } = {}) {
  const bullets = collectBullets(resume);

  return {
    keywords: scoreKeywords(matchedKeywords, missingKeywords),
    formatting: scoreFormatting(resume),
    actionVerbs: scoreActionVerbs(bullets),
    quantifiedImpact: scoreQuantifiedImpact(bullets),
    length: scoreLength(bullets),
  };
}

module.exports = scoreResumeCategories;
