const renderClassicTemplate = require("./classic");
const renderModernTemplate = require("./modern");
const renderMinimalTemplate = require("./minimal");

const TEMPLATES = {
  classic: renderClassicTemplate,
  modern: renderModernTemplate,
  minimal: renderMinimalTemplate,
};

function renderResumeHTML(resume, templateName) {
  const render = TEMPLATES[templateName] || TEMPLATES[resume.template] || TEMPLATES.classic;
  return render(resume);
}

module.exports = { renderResumeHTML, TEMPLATE_NAMES: Object.keys(TEMPLATES) };
