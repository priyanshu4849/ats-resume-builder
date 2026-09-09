const path = require("path");
const multer = require("multer");

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const hasAllowedMimeType = ALLOWED_MIME_TYPES.includes(file.mimetype);
    const hasAllowedExtension = ALLOWED_EXTENSIONS.includes(extension);

    if (hasAllowedMimeType || hasAllowedExtension) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
});

module.exports = upload;
