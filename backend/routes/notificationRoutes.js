const express = require("express");
const {
  getNotificationPreferences,
  updateNotificationPreferences,
  toggleNotificationType,
  unsubscribeFromEmails,
  getNotificationLogs,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user notification preferences
router.get("/preferences/:userId", getNotificationPreferences);

// Update notification preferences
router.put("/preferences/:userId", updateNotificationPreferences);

// Toggle specific notification type
router.patch("/preferences/:userId/:notificationType", toggleNotificationType);

// Get notification logs
router.get("/logs/:userId", getNotificationLogs);

// Unsubscribe from all emails (no auth required for this one - public)
router.post("/unsubscribe", (req, res, next) => {
  // Skip auth for unsubscribe
  const { unsubscribeFromEmails } = require("../controllers/notificationController");
  unsubscribeFromEmails(req, res);
});

module.exports = router;
