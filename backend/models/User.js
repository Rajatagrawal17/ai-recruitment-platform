const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [20, "Name cannot exceed 20 characters"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    // 👇 YEH ADD KARNA HAI
    role: {
      type: String,
      enum: ["admin", "recruiter", "candidate"],
      default: "candidate",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    mobileVerified: {
      type: Boolean,
      default: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    // LinkedIn and Resume Profile
    linkedinUrl: {
      type: String,
      trim: true,
    },

    resumeUrl: {
      type: String,
      trim: true,
    },

    resumePublicId: {
      type: String,
      trim: true,
    },

    currentLocation: {
      type: String,
      trim: true,
    },

    fieldOfInterest: {
      type: [String],
      default: [], // e.g., ["Software Developer", "Backend", "Full Stack"]
    },

    skills: {
      type: [String],
      default: [], // Extracted from resume/LinkedIn
    },

    resumeDataExtracted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 📊 Calculate profile completeness percentage
userSchema.methods.calculateProfileCompleteness = function () {
  let score = 0;
  const maxScore = 100;
  
  // Name: 15%
  if (this.name && this.name.trim().length > 0) score += 15;
  
  // Email: 10% (always filled - required)
  if (this.email) score += 10;
  
  // Phone Number: 10%
  if (this.phoneNumber && this.phoneNumber.trim().length > 0) score += 10;
  
  // Current Location: 10%
  if (this.currentLocation && this.currentLocation.trim().length > 0) score += 10;
  
  // Field of Interest: 15%
  if (this.fieldOfInterest && this.fieldOfInterest.length > 0) score += 15;
  
  // Skills: 15%
  if (this.skills && this.skills.length > 0) score += 15;
  
  // Resume URL: 17%
  if (this.resumeUrl && this.resumeUrl.trim().length > 0) score += 17;
  
  // LinkedIn URL: 8%
  if (this.linkedinUrl && this.linkedinUrl.trim().length > 0) score += 8;
  
  return Math.min(score, maxScore); // Cap at 100%
};

module.exports = mongoose.model("User", userSchema);



