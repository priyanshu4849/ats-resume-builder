const { escapeHtml, dateRange, renderContactLine } = require("./shared");

function renderBullets(bullets = []) {
  const items = bullets.filter(Boolean);
  if (items.length === 0) return "";
  return `<ul>${items.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`;
}

function renderEducation(education = []) {
  if (education.length === 0) return "";
  const items = education
    .map((edu) => {
      const range = dateRange(edu.startDate, edu.endDate);
      return `
        <div class="entry">
          <div class="entry-line"><span class="entry-title">${escapeHtml(edu.school)} — ${escapeHtml(edu.degree)}${edu.gpa ? ` (GPA: ${escapeHtml(edu.gpa)})` : ""}</span>${range ? `<span class="entry-dates">${range}</span>` : ""}</div>
        </div>`;
    })
    .join("");
  return `<section><h2>Education</h2>${items}</section>`;
}

function renderExperience(experience = []) {
  if (experience.length === 0) return "";
  const items = experience
    .map((exp) => {
      const range = dateRange(exp.startDate, exp.endDate);
      return `
        <div class="entry">
          <div class="entry-line"><span class="entry-title">${escapeHtml(exp.role)}${exp.company ? `, ${escapeHtml(exp.company)}` : ""}</span>${range ? `<span class="entry-dates">${range}</span>` : ""}</div>
          ${renderBullets(exp.bullets)}
        </div>`;
    })
    .join("");
  return `<section><h2>Experience</h2>${items}</section>`;
}

function renderProjects(projects = []) {
  if (projects.length === 0) return "";
  const items = projects
    .map((proj) => {
      const stack = (proj.techStack || []).filter(Boolean).map(escapeHtml).join(", ");
      return `
        <div class="entry">
          <div class="entry-line"><span class="entry-title">${escapeHtml(proj.name)}</span>${stack ? ` <span class="stack">(${stack})</span>` : ""}</div>
          ${renderBullets(proj.bullets)}
        </div>`;
    })
    .join("");
  return `<section><h2>Projects</h2>${items}</section>`;
}

function renderSkills(skills = []) {
  const items = skills.filter(Boolean);
  if (items.length === 0) return "";
  return `<section><h2>Skills</h2><p>${items.map(escapeHtml).join(", ")}</p></section>`;
}

function renderMinimalTemplate(resume) {
  const personalInfo = resume.personalInfo || {};
  const name = escapeHtml(personalInfo.name || resume.title || "Resume");
  const contactLine = renderContactLine(personalInfo);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${name}</title>
<style>
  @page { margin: 0.5in; }
  * { box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 9.5pt;
    color: #000;
    margin: 0;
    line-height: 1.35;
  }
  h1 {
    font-size: 15pt;
    margin: 0 0 2px 0;
  }
  .contact-line {
    font-size: 8.5pt;
    color: #333;
    margin-bottom: 10px;
  }
  h2 {
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin: 9px 0 4px 0;
    color: #000;
  }
  section:first-of-type h2 {
    margin-top: 0;
  }
  .entry {
    margin-bottom: 5px;
  }
  .entry-line {
    display: flex;
    justify-content: space-between;
  }
  .entry-title {
    font-weight: bold;
  }
  .stack {
    font-weight: normal;
    color: #444;
  }
  .entry-dates {
    color: #444;
    white-space: nowrap;
  }
  ul {
    margin: 2px 0 0 0;
    padding-left: 15px;
  }
  li {
    margin-bottom: 0px;
  }
  p {
    margin: 0;
  }
</style>
</head>
<body>
  <h1>${name}</h1>
  ${contactLine ? `<div class="contact-line">${contactLine}</div>` : ""}
  ${renderEducation(resume.education)}
  ${renderExperience(resume.experience)}
  ${renderProjects(resume.projects)}
  ${renderSkills(resume.skills)}
</body>
</html>`;
}

module.exports = renderMinimalTemplate;
