const NotificationPreference = require("../models/NotificationPreference");
const NotificationLog = require("../models/NotificationLog");
const { sendEmail } = require("../utils/emailService");
const User = require("../models/User");

// Get user notification preferences
exports.getNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate authorization
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let preferences = await NotificationPreference.findOne({ userId });

    // Create default preferences if not exists
    if (!preferences) {
      const user = await User.findById(userId);
      preferences = new NotificationPreference({
        userId,
        email: user.email,
      });
      await preferences.save();
    }

    res.json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Validate authorization
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      const user = await User.findById(userId);
      preferences = new NotificationPreference({
        userId,
        email: user.email,
      });
    }

    // Update preferences
    Object.assign(preferences, updates);
    preferences.lastUpdatedAt = new Date();
    await preferences.save();

    res.json({
      message: "Notification preferences updated successfully",
      preferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Toggle notification type
exports.toggleNotificationType = async (req, res) => {
  try {
    const { userId, notificationType } = req.params;
    const { enabled } = req.body;

    // Validate authorization
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      const user = await User.findById(userId);
      preferences = new NotificationPreference({
        userId,
        email: user.email,
      });
    }

    // Update specific notification type
    if (preferences[notificationType]) {
      preferences[notificationType].enabled = enabled;
      await preferences.save();

      res.json({
        message: `${notificationType} notifications ${enabled ? "enabled" : "disabled"}`,
        preferences,
      });
    } else {
      res.status(400).json({ message: "Invalid notification type" });
    }
  } catch (error) {
    console.error("Error toggling notification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Unsubscribe from all emails
exports.unsubscribeFromEmails = async (req, res) => {
  try {
    const { email } = req.body;

    const preferences = await NotificationPreference.findOne({ email });

    if (!preferences) {
      return res.status(404).json({ message: "User not found" });
    }

    preferences.unsubscribed = true;
    await preferences.save();

    res.json({ message: "Successfully unsubscribed from all emails" });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get notification logs for user
exports.getNotificationLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, status } = req.query;

    // Validate authorization
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const query = { userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const logs = await NotificationLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await NotificationLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notification logs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Send job alert email
exports.sendJobAlert = async (userId, jobs) => {
  try {
    const user = await User.findById(userId);
    const preferences = await NotificationPreference.findOne({ userId });

    if (!user || !preferences || !preferences.jobAlerts.enabled || preferences.unsubscribed) {
      return { success: false, reason: "User opted out or not found" };
    }

    const result = await sendEmail(user.email, "jobAlert", [user.name, jobs]);

    // Log the notification
    const log = new NotificationLog({
      userId,
      type: "jobAlert",
      email: user.email,
      subject: `${jobs.length} New Job Opportunities Matched for You`,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error,
      metadata: { jobCount: jobs.length },
    });
    await log.save();

    // Update last alert sent time
    preferences.lastJobAlertSent = new Date();
    await preferences.save();

    return result;
  } catch (error) {
    console.error("Error sending job alert:", error);
    return { success: false, error: error.message };
  }
};

// Send application update email
exports.sendApplicationUpdate = async (userId, jobTitle, companyName, status) => {
  try {
    const user = await User.findById(userId);
    const preferences = await NotificationPreference.findOne({ userId });

    if (!user || !preferences || !preferences.applicationUpdates.enabled || preferences.unsubscribed) {
      return { success: false, reason: "User opted out or not found" };
    }

    // Don't send rejection if user opted out
    if (status === "rejected" && !preferences.applicationUpdates.includeRejections) {
      return { success: false, reason: "User opted out of rejection emails" };
    }

    const result = await sendEmail(user.email, "applicationUpdate", [user.name, jobTitle, companyName, status]);

    // Log the notification
    const log = new NotificationLog({
      userId,
      type: "applicationUpdate",
      email: user.email,
      subject: `Update on Your Application to ${companyName}`,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error,
      metadata: { jobTitle, companyName, status },
    });
    await log.save();

    return result;
  } catch (error) {
    console.error("Error sending application update:", error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    // Create notification preferences for new user
    let preferences = await NotificationPreference.findOne({ userId });
    if (!preferences) {
      preferences = new NotificationPreference({
        userId,
        email: user.email,
      });
      await preferences.save();
    }

    const result = await sendEmail(user.email, "welcomeEmail", [user.name]);

    // Log the notification
    const log = new NotificationLog({
      userId,
      type: "system",
      email: user.email,
      subject: "Welcome to AI Recruitment Platform",
      status: result.success ? "sent" : "failed",
      errorMessage: result.error,
    });
    await log.save();

    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = exports;
