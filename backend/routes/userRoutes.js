const authorizeRoles = require("../middleware/roleMiddleware");

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { asyncHandler } = require("../utils/errorHandler");
const {
  updateLinkedInUrl,
  uploadResume,
  getUserProfile,
  getPersonalizedJobs,
  deleteResume,
  updateProfile,
  getResumeViewUrl,
} = require("../controllers/userProfileController");

router.get("/profile", protect, asyncHandler(async (req, res) => {
  const user = req.user;
  const profileCompleteness = user.calculateProfileCompleteness();
  
  res.json({
    success: true,
    message: "Profile data fetched successfully",
    user: user,
    profileCompleteness: profileCompleteness,
  });
}));

// LinkedIn and Resume Profile Endpoints
router.get("/profile-info", protect, asyncHandler(getUserProfile));
router.put("/profile-update", protect, asyncHandler(updateProfile));
router.put("/linkedin", protect, asyncHandler(updateLinkedInUrl));
router.post("/resume/upload", protect, (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      console.error("📁 Multer error:", err.message);
      return res.status(400).json({
        success: false,
        message: "File upload error: " + err.message,
      });
    }
    next();
  });
}, asyncHandler(uploadResume));
router.get("/resume/view-url", protect, asyncHandler(getResumeViewUrl));
router.delete("/resume", protect, asyncHandler(deleteResume));
router.get("/personalized-jobs", protect, asyncHandler(getPersonalizedJobs));

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin 👑",
    });
  })
);


module.exports = router;
