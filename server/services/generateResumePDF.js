const puppeteer = require("puppeteer");
const { renderResumeHTML } = require("./templates");

async function generateResumePDF(resume, templateName) {
  const html = renderResumeHTML(resume, templateName);

  // --no-sandbox is needed on most container hosts (Render/Railway run as root,
  // which breaks Chromium's sandbox); harmless locally too.
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    // domcontentloaded, not networkidle0: our HTML has zero external resources,
    // and networkidle0 can hang waiting on Chrome's implicit favicon request in
    // sandboxed containers with no real network route for it.
    await page.setContent(html, { waitUntil: "domcontentloaded" });
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
