const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const protect = require("../middleware/authMiddleware");

/* =========================
   GET USER'S AUDIT LOGS
========================= */
router.get("/logs/user/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    // Users can only see their own logs (unless admin)
    if (req.user._id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view these logs",
      });
    }

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select("-__v");

    const totalLogs = await AuditLog.countDocuments({ userId });

    res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: {
        logs,
        pagination: {
          total: totalLogs,
          page: parseInt(page),
          pages: Math.ceil(totalLogs / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   GET RECENT LOGIN HISTORY
========================= */
router.get("/logs/login-history/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    // Users can only see their own history
    if (req.user._id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const logs = await AuditLog.find({
      userId,
      action: { $in: ["login", "logout"] },
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select("action status ipAddress userAgent timestamp");

    res.status(200).json({
      success: true,
      message: "Login history retrieved",
      data: {
        totalLogins: logs.filter((l) => l.action === "login").length,
        logs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   GET ALL AUDIT LOGS (ADMIN ONLY)
========================= */
router.get("/logs/all", protect, async (req, res) => {
  try {
    // Verify user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view all audit logs",
      });
    }

    const { action, userEmail, limit = 50, page = 1 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (userEmail) query.userEmail = { $regex: userEmail, $options: "i" };

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select("-__v");

    const totalLogs = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "All audit logs retrieved",
      data: {
        logs,
        pagination: {
          total: totalLogs,
          page: parseInt(page),
          pages: Math.ceil(totalLogs / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   CLEAR OLD AUDIT LOGS (ADMIN ONLY)
========================= */
router.delete("/logs/clear-old", protect, async (req, res) => {
  try {
    // Verify user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can clear audit logs",
      });
    }

    const { daysOld = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old audit logs`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
