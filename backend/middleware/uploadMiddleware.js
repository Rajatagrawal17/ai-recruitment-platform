const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Verify Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️  WARNING: Cloudinary environment variables not set. Resume uploads will fail!");
  console.warn("   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env");
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

const sanitizeFileBaseName = (name = "resume") =>
  String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "resume";

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const originalBaseName = path.parse(file.originalname).name;
    const safeBaseName = sanitizeFileBaseName(originalBaseName);

    return {
      folder: "cognifit-resumes", // Organize uploads in folder
      resource_type: "raw", // Important for PDFs and documents
      type: "upload", // Explicitly public upload delivery type
      access_mode: "public", // Ensure URL is publicly retrievable
      public_id: `${req.user._id}-${Date.now()}-${safeBaseName}`,
      format: path.extname(file.originalname).toLowerCase().slice(1),
    };
  },
});

// File filter (PDF/DOC/DOCX only)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const isAllowedMime = ALLOWED_MIME_TYPES.has(file.mimetype);
  const isAllowedExt = ALLOWED_EXTENSIONS.has(ext);

  console.log("📄 File validation:", {
    filename: file.originalname,
    mimetype: file.mimetype,
    ext: ext,
    isAllowedMime,
    isAllowedExt,
  });

  if (isAllowedMime || isAllowedExt) {
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type: ${file.mimetype}. Only PDF, DOC, DOCX allowed`);
    console.error("❌ File filter rejected:", error.message);
    cb(error, false);
  }
};

// Multer configuration with Cloudinary storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;
