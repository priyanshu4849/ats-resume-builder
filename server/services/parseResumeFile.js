const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

async function parseResumeFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const isPdf = file.mimetype === "application/pdf" || extension === ".pdf";
  const isDocx =
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === ".docx";

  if (isPdf) {
    const parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
}

module.exports = parseResumeFile;
