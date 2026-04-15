const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["jobAlert", "applicationUpdate", "recommendation", "system"],
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: String,
    status: {
      type: String,
      enum: ["sent", "failed", "bounced", "unsubscribed"],
      default: "sent",
    },
    relatedJobId: mongoose.Schema.Types.ObjectId,
    relatedApplicationId: mongoose.Schema.Types.ObjectId,
    errorMessage: String,
    metadata: mongoose.Schema.Types.Mixed, // Store additional info as needed
  },
  { timestamps: true }
);

// Index for quick lookups
notificationLogSchema.index({ userId: 1, createdAt: -1 });
notificationLogSchema.index({ email: 1, createdAt: -1 });
notificationLogSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
