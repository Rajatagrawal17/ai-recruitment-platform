const authorizeRoles = require("../middleware/roleMiddleware");

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  updateLinkedInUrl,
  uploadResume,
  getUserProfile,
  getPersonalizedJobs,
  deleteResume,
  updateProfile,
} = require("../controllers/userProfileController");

router.get("/profile", protect, async (req, res) => {
  try {
    const user = req.user;
    const profileCompleteness = user.calculateProfileCompleteness();
    
    res.json({
      success: true,
      message: "Profile data fetched successfully",
      user: user,
      profileCompleteness: profileCompleteness,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// LinkedIn and Resume Profile Endpoints
router.get("/profile-info", protect, getUserProfile);
router.put("/profile-update", protect, updateProfile);
router.put("/linkedin", protect, updateLinkedInUrl);
router.post("/resume/upload", protect, upload.single("resume"), uploadResume);
router.delete("/resume", protect, deleteResume);
router.get("/personalized-jobs", protect, getPersonalizedJobs);

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin 👑",
    });
  }
);


module.exports = router;
