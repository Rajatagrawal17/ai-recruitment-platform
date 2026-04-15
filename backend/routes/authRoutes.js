const express = require("express");
const router = express.Router();

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
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout (protected route)
router.post("/logout", protect, logoutUser);

// OTP Verification
router.post("/send-mobile-otp", sendMobileOTP);
router.post("/verify-mobile-otp", verifyMobileOTP);
router.post("/send-email-otp", sendEmailOTP);
router.post("/verify-email-otp", verifyEmailOTP);

// Forgot Password
router.post("/forgot-password", forgotPassword);
router.post("/send-reset-otp", sendResetOTP);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// CAPTCHA Verification
router.post("/verify-captcha", verifyCaptcha);

// Protected Route
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Profile accessed ✅",
    user: req.user,
  });
});

module.exports = router;
