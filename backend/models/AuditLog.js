const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["login", "logout", "register", "password_reset", "profile_update", "failed_login"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    reason: {
      type: String, // e.g., "User initiated", "Token expired", "Session timeout"
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Store additional info like browser, OS, location
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 2592000, // Auto-delete logs after 30 days
    },
  },
  { timestamps: false } // We're using custom timestamp field
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
