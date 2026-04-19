require("dotenv").config();

const mongoose = require("mongoose");
const { app, setDbConnected } = require("./app");

/* =========================
   STARTUP LOGGING
========================= */
console.log("");
console.log("╔═════════════════════════════════════════════════════════════╗");
console.log("║        🚀 COGNIFIT AI RECRUITMENT BACKEND 🚀               ║");
console.log("╚═════════════════════════════════════════════════════════════╝");
console.log("📌 Environment:", process.env.NODE_ENV || "development");
console.log("🔑 JWT Secret:", process.env.JWT_SECRET ? "✓ Configured" : "✗ MISSING");
console.log("📊 MongoDB:", process.env.MONGO_URI ? "✓ Configured" : "✗ MISSING");
console.log("════════════════════════════════════════════════════════════\n");

/* =========================
   SERVER INITIALIZATION
========================= */
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Start server on all interfaces (required for Render)
app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on ${HOST}:${PORT}\n`);
});

/* =========================
   MONGODB CONNECTION WITH RETRY
========================= */
const MONGO_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelays: [2000, 4000, 8000], // 2s, 4s, 8s
};

const connectMongoDB = async (retryCount = 0) => {
  try {
    console.log(`📡 Connecting to MongoDB (attempt ${retryCount + 1}/${MONGO_RETRY_CONFIG.maxRetries + 1})...`);
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      w: "majority",
    });
    
    console.log("✅ MongoDB Connected Successfully!\n");
    setDbConnected(true);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed (attempt ${retryCount + 1}/${MONGO_RETRY_CONFIG.maxRetries + 1})`);
    console.error(`   Error: ${error.message}\n`);
    
    // If retries remaining, schedule next attempt
    if (retryCount < MONGO_RETRY_CONFIG.maxRetries) {
      const delayMs = MONGO_RETRY_CONFIG.retryDelays[retryCount];
      console.log(`⏳ Retrying in ${delayMs / 1000}s...\n`);
      
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return connectMongoDB(retryCount + 1);
    } else {
      console.error("⚠️  All MongoDB connection attempts exhausted!");
      console.error("⚠️  Server will continue running but database operations will fail!\n");
      setDbConnected(false);
      return false;
    }
  }
};

// Start connection attempts
connectMongoDB();
