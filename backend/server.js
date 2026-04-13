require("dotenv").config();

const mongoose = require("mongoose");
const { app, setDbConnected } = require("./app");

/* =========================
   DEBUG (Remove later)
========================= */
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Set" : "✗ Not set");

/* =========================
   MONGODB CONNECTION
========================= */
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Start server on all interfaces (required for Render)
app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT} 🚀`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
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
    setDbConnected(true);
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed ❌");
    console.error("Error:", error.message);
    console.error("Full error:", error);
    // Don't exit - server can still respond, but DB queries will fail
  });
