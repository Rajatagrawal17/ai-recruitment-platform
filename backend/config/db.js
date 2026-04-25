const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in environment variables!");
      console.error("⚠️ Database connection will fail. Please set MONGO_URI in Render dashboard.");
      return false;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected Successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("⚠️ App will continue, but database queries will fail");
    console.error("📋 Make sure MONGO_URI is set correctly in Render environment variables");
    return false;
  }
};

module.exports = connectDB;
