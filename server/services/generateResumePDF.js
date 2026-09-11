const puppeteer = require("puppeteer");
const renderResumeHTML = require("./resumeTemplate");

async function generateResumePDF(resume) {
  const html = renderResumeHTML(resume);

  // --no-sandbox is needed on most container hosts (Render/Railway run as root,
  // which breaks Chromium's sandbox); harmless locally too.
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = generateResumePDF;
