const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Job Alerts
    jobAlerts: {
      enabled: { type: Boolean, default: true },
      frequency: { 
        type: String, 
        enum: ["immediate", "daily", "weekly"], 
        default: "weekly" 
      },
      categories: [String], // Job categories to receive alerts for
      locations: [String], // Preferred locations
      minSalary: { type: Number, default: 0 },
      experienceLevels: [String], // entry-level, mid-level, senior
    },

    // Application Updates
    applicationUpdates: {
      enabled: { type: Boolean, default: true },
      includeRejections: { type: Boolean, default: true },
    },

    // Recommendations
    recommendations: {
      enabled: { type: Boolean, default: true },
      frequency: { 
        type: String, 
        enum: ["daily", "weekly", "monthly"], 
        default: "weekly" 
      },
    },

    // System Notifications
    systemNotifications: {
      enabled: { type: Boolean, default: true },
      newsletters: { type: Boolean, default: false },
      productUpdates: { type: Boolean, default: true },
    },

    // Email
    email: {
      type: String,
      required: true,
    },
    unsubscribed: { type: Boolean, default: false },

    // Tracking
    lastJobAlertSent: Date,
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for quick lookups
notificationPreferenceSchema.index({ userId: 1 });
notificationPreferenceSchema.index({ email: 1 });

module.exports = mongoose.model("NotificationPreference", notificationPreferenceSchema);
