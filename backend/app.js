const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

let dbConnected = false;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
  "https://cognifit-frontend-6coo.onrender.com",
];

const allowedOriginPatterns = [
  /^https:\/\/cognifit-frontend-.*\.onrender\.com$/,
  /^https:\/\/.*\.vercel\.app$/,
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const app = express();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(globalLimiter);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowedExplicit = allowedOrigins.includes(normalizedOrigin);
    const isAllowedPattern = allowedOriginPatterns.some((pattern) =>
      pattern.test(normalizedOrigin)
    );

    if (isAllowedExplicit || isAllowedPattern) {
      callback(null, true);
      return;
    }

    console.error(`CORS blocked origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/matching", require("./routes/matchingRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/audit", require("./routes/auditRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    dbConnected,
  });
});

// Centralized API error handling for upload and runtime errors.
app.use((error, req, res, next) => {
  if (!error) {
    next();
    return;
  }

  if (error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Resume file is too large. Maximum allowed size is 8MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "File upload failed",
    });
  }

  const status = error.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

const setDbConnected = (value) => {
  dbConnected = Boolean(value);
};

module.exports = {
  app,
  setDbConnected,
};
