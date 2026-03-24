require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =========================
   DEBUG (Remove later)
========================= */
console.log("MONGO_URI:", process.env.MONGO_URI);

/* =========================
   MIDDLEWARE
========================= */
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

// Add production URLs if set via env var
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, etc)
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
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/matching", require("./routes/matchingRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* =========================
   HEALTH CHECK ENDPOINT
========================= */
let dbConnected = false;

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    dbConnected,
  });
});

/* =========================
   MONGODB CONNECTION
========================= */
const PORT = process.env.PORT || 5000;

// Start server immediately (don't wait for DB)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

// Connect to MongoDB asynchronously
console.log("Attempting to connect to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  })
  .then(() => {
    console.log("MongoDB Connected ✅");
    dbConnected = true;
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed ❌");
    console.error("Error:", error.message);
    console.error("Full error:", error);
    // Don't exit - server can still respond, but DB queries will fail
  });
