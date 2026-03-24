require("dotenv").config();

const mongoose = require("mongoose");
const { app, setDbConnected } = require("./app");

/* =========================
   DEBUG (Remove later)
========================= */
console.log("MONGO_URI:", process.env.MONGO_URI);

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
    setDbConnected(true);
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed ❌");
    console.error("Error:", error.message);
    console.error("Full error:", error);
    // Don't exit - server can still respond, but DB queries will fail
  });
