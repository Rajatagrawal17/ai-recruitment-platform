const jwt = require("jsonwebtoken");
const User = require("../models/User");
const axios = require("axios");
const { sendOTP } = require("../utils/otpService");

// In-memory OTP storage (use Redis in production)
const otpStorage = new Map();

// Generate random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Store OTP with expiration (10 minutes = 600 seconds)
const storeOTP = (key, otp) => {
  otpStorage.set(key, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });
};

// Verify OTP
const verifyOTPCode = (key, otp) => {
  const data = otpStorage.get(key);
  
  if (!data) return { valid: false, message: "OTP not found or expired" };
  
  if (Date.now() > data.expiresAt) {
    otpStorage.delete(key);
    return { valid: false, message: "OTP expired" };
  }
  
  if (data.attempts >= 3) {
    otpStorage.delete(key);
    return { valid: false, message: "Too many attempts. Request a new OTP" };
  }
  
  if (data.otp !== otp) {
    data.attempts++;
    return { valid: false, message: "Incorrect OTP" };
  }
  
  otpStorage.delete(key);
  return { valid: true, message: "OTP verified" };
};

/* =========================
   REGISTER USER
========================= */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully ✅",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================
   LOGIN USER
========================= */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 🔐 TOKEN
    const token = jwt.sign(
      {
        _id: user._id,       // 👈 important
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   SEND MOBILE OTP
========================= */
exports.sendMobileOTP = async (req, res) => {
  try {
    const { phoneNumber, method, email } = req.body;

    if (!phoneNumber || !method) {
      return res.status(400).json({
        success: false,
        message: "Phone number and method (sms/email) are required",
      });
    }

    if (!["sms", "email"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid method. Use 'sms' or 'email'",
      });
    }

    const otp = generateOTP();
    const key = `mobile_${phoneNumber}`;

    // Send OTP using provider service. Even if provider fails, keep OTP flow alive in demo mode.
    let result;
    try {
      result = await sendOTP(phoneNumber, otp, method, email);
    } catch (providerError) {
      console.error("OTP provider failed in sendMobileOTP:", providerError.message);
      result = {
        success: true,
        demo: true,
        error: providerError.message,
      };
    }

    if (!result || !result.success) {
      result = { success: true, demo: true };
    }

    // Store OTP for phone verification step
    storeOTP(key, otp);

    // If step-1 is using email method, also store under email key so verify-email-otp can validate same code path.
    if (method === "email" && email) {
      storeOTP(`email_${email}`, otp);
    }

    res.status(200).json({
      success: true,
      message: `OTP sent via ${method === "sms" ? "SMS" : "Email"}`,
      demo: result.demo || false,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   VERIFY MOBILE OTP
========================= */
exports.verifyMobileOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const key = `mobile_${phoneNumber}`;
    const result = verifyOTPCode(key, otp);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Mobile number verified successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   SEND EMAIL OTP
========================= */
exports.sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = generateOTP();
    const key = `email_${email}`;

    // Send OTP using provider service. Even if provider fails, keep OTP flow alive in demo mode.
    let result;
    try {
      result = await sendOTP(email, otp, "email", email);
    } catch (providerError) {
      console.error("OTP provider failed in sendEmailOTP:", providerError.message);
      result = {
        success: true,
        demo: true,
        error: providerError.message,
      };
    }

    if (!result || !result.success) {
      result = { success: true, demo: true };
    }

    // Store OTP
    storeOTP(key, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to email",
      demo: result.demo || false,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   VERIFY EMAIL OTP
========================= */
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const key = `email_${email}`;
    const result = verifyOTPCode(key, otp);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   VERIFY CAPTCHA (reCAPTCHA v3)
========================= */
exports.verifyCaptcha = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "CAPTCHA token is required",
      });
    }

    // Verify with Google reCAPTCHA v3
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
    
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      {
        params: {
          secret: recaptchaSecret,
          response: token,
        },
      }
    );

    const { success, score, action } = response.data;

    // reCAPTCHA v3 returns a score (0.0 - 1.0)
    // Higher score means more likely to be legitimate user
    if (!success || score < 0.5) {
      return res.status(400).json({
        success: false,
        message: "CAPTCHA verification failed",
        score,
      });
    }

    res.status(200).json({
      success: true,
      message: "CAPTCHA verified successfully",
      score,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
