const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAnalytics } = require("../controllers/analyticsController");

router.get("/", protect, authorizeRoles("recruiter", "admin"), getAnalytics);

module.exports = router;
