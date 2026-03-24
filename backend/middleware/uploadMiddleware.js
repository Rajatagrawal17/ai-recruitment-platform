const multer = require("multer");
const path = require("path");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx"]);

// storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// file filter (pdf/docx allowed)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const isAllowedMime = ALLOWED_MIME_TYPES.has(file.mimetype);
  const isAllowedExt = ALLOWED_EXTENSIONS.has(ext);

  if (isAllowedMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or DOCX files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
