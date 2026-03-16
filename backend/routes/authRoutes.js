const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  sendMobileOTP,
  verifyMobileOTP,
  sendEmailOTP,
  verifyEmailOTP,
  verifyCaptcha,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// OTP Verification
router.post("/send-mobile-otp", sendMobileOTP);
router.post("/verify-mobile-otp", verifyMobileOTP);
router.post("/send-email-otp", sendEmailOTP);
router.post("/verify-email-otp", verifyEmailOTP);

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
