const { escapeHtml, dateRange, renderContactLine } = require("./shared");

const ACCENT = "#2563eb";

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
            <span class="entry-title">${escapeHtml(exp.role)}${exp.company ? `<span class="at"> @ ${escapeHtml(exp.company)}</span>` : ""}</span>
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
      const stack = (proj.techStack || []).filter(Boolean).map(escapeHtml).join(" · ");
      return `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${escapeHtml(proj.name)}</span>
          </div>
          ${stack ? `<div class="entry-subtitle">${stack}</div>` : ""}
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
  return `<section><h2>Skills</h2><div class="pills">${items
    .map((s) => `<span class="pill">${escapeHtml(s)}</span>`)
    .join("")}</div></section>`;
}

function renderModernTemplate(resume) {
  const personalInfo = resume.personalInfo || {};
  const name = escapeHtml(personalInfo.name || resume.title || "Resume");
  const contactLine = renderContactLine(personalInfo);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${name}</title>
<style>
  @page { margin: 0.55in; }
  * { box-sizing: border-box; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    color: #1f2937;
    margin: 0;
    line-height: 1.45;
  }
  .header {
    border-bottom: 3px solid ${ACCENT};
    padding-bottom: 10px;
    margin-bottom: 16px;
  }
  h1 {
    font-size: 20pt;
    margin: 0 0 4px 0;
    color: ${ACCENT};
    letter-spacing: 0.3px;
  }
  .contact-line {
    font-size: 9.5pt;
    color: #4b5563;
  }
  h2 {
    font-size: 10.5pt;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: ${ACCENT};
    border-left: 3px solid ${ACCENT};
    padding-left: 8px;
    margin: 16px 0 8px 0;
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
    color: #111827;
  }
  .at {
    font-weight: normal;
    color: #4b5563;
  }
  .entry-dates {
    font-weight: normal;
    color: #6b7280;
    white-space: nowrap;
  }
  .entry-subtitle {
    color: #4b5563;
    font-size: 9.5pt;
    margin-top: 1px;
  }
  ul {
    margin: 4px 0 0 0;
    padding-left: 18px;
  }
  li {
    margin-bottom: 2px;
  }
  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }
  .pill {
    background: #eff6ff;
    color: ${ACCENT};
    border: 1px solid #bfdbfe;
    border-radius: 10px;
    padding: 2px 9px;
    font-size: 9pt;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    ${contactLine ? `<div class="contact-line">${contactLine}</div>` : ""}
  </div>
  ${renderEducation(resume.education)}
  ${renderExperience(resume.experience)}
  ${renderProjects(resume.projects)}
  ${renderSkills(resume.skills)}
</body>
</html>`;
}

module.exports = renderModernTemplate;
