const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/errorHandler");

const {
  registerUser,
  loginUser,
  logoutUser,
  sendMobileOTP,
  verifyMobileOTP,
  sendEmailOTP,
  verifyEmailOTP,
  verifyCaptcha,
  forgotPassword,
  sendResetOTP,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// Register
router.post("/register", asyncHandler(registerUser));

// Login
router.post("/login", asyncHandler(loginUser));

// Logout (protected route)
router.post("/logout", protect, asyncHandler(logoutUser));

// OTP Verification
router.post("/send-mobile-otp", asyncHandler(sendMobileOTP));
router.post("/verify-mobile-otp", asyncHandler(verifyMobileOTP));
router.post("/send-email-otp", asyncHandler(sendEmailOTP));
router.post("/verify-email-otp", asyncHandler(verifyEmailOTP));

// Forgot Password
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/send-reset-otp", asyncHandler(sendResetOTP));
router.post("/verify-reset-otp", asyncHandler(verifyResetOTP));
router.post("/reset-password", asyncHandler(resetPassword));

// CAPTCHA Verification
router.post("/verify-captcha", asyncHandler(verifyCaptcha));

// Protected Route
router.get("/profile", protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Profile accessed ✅",
    user: req.user,
  });
}));

module.exports = router;
