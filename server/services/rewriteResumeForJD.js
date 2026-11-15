const rewriteBullet = require("./rewriteBullet");

// Weak bullets come back from the analysis as plain {text, reason} copies, not
// as references into the resume document, so we have to re-find each one by
// exact text match to know which experience/project entry to update later.
// If the resume was edited after the analysis ran, the text may no longer
// match anything — callers should treat a null location as "can't auto-apply,
// let the user copy it manually instead."
function locateBullet(resume, bulletText) {
  for (let i = 0; i < (resume.experience || []).length; i++) {
    const bulletIndex = resume.experience[i].bullets.indexOf(bulletText);
    if (bulletIndex !== -1) {
      return { section: "experience", entryIndex: i, bulletIndex };
    }
  }
  for (let i = 0; i < (resume.projects || []).length; i++) {
    const bulletIndex = resume.projects[i].bullets.indexOf(bulletText);
    if (bulletIndex !== -1) {
      return { section: "projects", entryIndex: i, bulletIndex };
    }
  }
  return null;
}

async function rewriteResumeForJD(resume, jobDescription, weakBullets, missingKeywords) {
  const bulletRewrites = await Promise.all(
    weakBullets.map(async (weak) => {
      const suggestion = await rewriteBullet(weak.text, jobDescription);
      return { ...suggestion, location: locateBullet(resume, weak.text) };
    })
  );

  const existingSkills = new Set((resume.skills || []).map((skill) => skill.toLowerCase()));
  const suggestedSkillsToAdd = (missingKeywords || []).filter(
    (keyword) => !existingSkills.has(keyword.toLowerCase())
  );

  return { bulletRewrites, suggestedSkillsToAdd };
}

module.exports = rewriteResumeForJD;
