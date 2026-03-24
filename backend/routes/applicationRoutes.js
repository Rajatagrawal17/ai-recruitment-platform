const express = require("express");
const router = express.Router();

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

router.post("/apply", protect, upload.single("resume"), applyJob);

router.get("/my", protect, getMyApplications);

router.get(
  "/all",
  protect,
  authorizeRoles("admin"),
  getAllApplications
);

router.put(
  "/status/:id",
  protect,
  authorizeRoles("recruiter", "admin"),
  updateStatus
);

router.put(
  "/schedule/:id",
  protect,
  authorizeRoles("recruiter", "admin"),
  scheduleInterview
);

module.exports = router;
