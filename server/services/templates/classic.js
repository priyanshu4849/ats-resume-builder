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
          <div class="entry-header">
            <span class="entry-title">${escapeHtml(edu.school)}</span>
            ${range ? `<span class="entry-dates">${range}</span>` : ""}
          </div>
          <div class="entry-subtitle">${escapeHtml(edu.degree)}${edu.gpa ? ` — GPA: ${escapeHtml(edu.gpa)}` : ""}</div>
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
          <div class="entry-header">
            <span class="entry-title">${escapeHtml(exp.role)}${exp.company ? `, ${escapeHtml(exp.company)}` : ""}</span>
            ${range ? `<span class="entry-dates">${range}</span>` : ""}
          </div>
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
          <div class="entry-header">
            <span class="entry-title">${escapeHtml(proj.name)}${stack ? ` | ${stack}` : ""}</span>
          </div>
          ${proj.link ? `<div class="entry-subtitle">${escapeHtml(proj.link)}</div>` : ""}
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

function renderClassicTemplate(resume) {
  const personalInfo = resume.personalInfo || {};
  const name = escapeHtml(personalInfo.name || resume.title || "Resume");
  const contactLine = renderContactLine(personalInfo);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${name}</title>
<style>
  @page { margin: 0.6in; }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    color: #111;
    margin: 0;
    line-height: 1.4;
  }
  h1 {
    font-size: 18pt;
    margin: 0 0 4px 0;
  }
  .contact-line {
    font-size: 9.5pt;
    margin-bottom: 16px;
  }
  h2 {
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #111;
    margin: 14px 0 8px 0;
    padding-bottom: 2px;
  }
  section:first-of-type h2 {
    margin-top: 0;
  }
  .entry {
    margin-bottom: 10px;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
  }
  .entry-title {
    font-weight: bold;
  }
  .entry-dates {
    font-weight: normal;
    white-space: nowrap;
  }
  .entry-subtitle {
    font-style: italic;
    margin-top: 1px;
  }
  ul {
    margin: 4px 0 0 0;
    padding-left: 18px;
  }
  li {
    margin-bottom: 2px;
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

module.exports = renderClassicTemplate;
