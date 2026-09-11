function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function dateRange(startDate, endDate) {
  const start = escapeHtml(startDate);
  const end = escapeHtml(endDate);
  if (!start && !end) return "";
  if (!end) return start;
  if (!start) return end;
  return `${start} - ${end}`;
}

function renderContactLine(personalInfo = {}) {
  const parts = [personalInfo.email, personalInfo.phone, personalInfo.linkedin, personalInfo.github]
    .filter(Boolean)
    .map(escapeHtml);
  return parts.join(" | ");
}

module.exports = { escapeHtml, dateRange, renderContactLine };
