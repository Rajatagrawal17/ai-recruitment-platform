const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/errorHandler");

const {
  applyJob,
  getAllApplications,
  updateStatus,
  scheduleInterview,
  getMyApplications,
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/apply", protect, upload.single("resume"), asyncHandler(applyJob));

router.get("/my", protect, asyncHandler(getMyApplications));

router.get(
  "/all",
  protect,
  authorizeRoles("admin"),
  asyncHandler(getAllApplications)
);

router.put(
  "/status/:id",
  protect,
  authorizeRoles("recruiter", "admin"),
  asyncHandler(updateStatus)
);

router.put(
  "/schedule/:id",
  protect,
  authorizeRoles("recruiter", "admin"),
  asyncHandler(scheduleInterview)
);

// Add note to application timeline
router.post(
  "/notes/:id",
  protect,
  authorizeRoles("recruiter", "admin"),
  asyncHandler((req, res) => require("../controllers/applicationController").addApplicationNote(req, res))
);

// Get application timeline
router.get(
  "/timeline/:id",
  protect,
  authorizeRoles("recruiter", "admin"),
  asyncHandler((req, res) => require("../controllers/applicationController").getApplicationTimeline(req, res))
);

module.exports = router;
