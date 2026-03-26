const User = require("../models/User");
const Job = require("../models/Job");
const fs = require("fs");
const path = require("path");
const { extractSkillsFromText } = require("../utils/resumeIntelligence");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Extract text from resume file
const extractTextFromResume = async (filePath) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (fileExtension === ".pdf") {
    const pdfData = await pdfParse(fileBuffer);
    return pdfData.text || "";
  }

  if (fileExtension === ".docx") {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value || "";
  }

  return "";
};

// Extract job titles/field of interest from resume text
const extractFieldOfInterest = (text = "") => {
  const jobTitleKeywords = [
    "software developer",
    "software engineer",
    "fullstack",
    "full stack",
    "frontend",
    "backend",
    "mobile",
    "data scientist",
    "devops",
    "qa",
    "product manager",
    "ux designer",
    "system engineer",
    "cloud engineer",
    "machine learning",
    "ai engineer",
    "security engineer",
    "tech lead",
    "architect",
    "sr engineer",
    "senior",
  ];

  const interests = [];
  const lowerText = text.toLowerCase();

  for (const keyword of jobTitleKeywords) {
    if (lowerText.includes(keyword) && !interests.includes(keyword)) {
      interests.push(keyword);
    }
  }

  return interests.length > 0 ? interests : [];
};

// Extract location from resume text
const extractLocation = (text = "") => {
  // Common location patterns
  const locationKeywords = [
    "bangalore",
    "delhi",
    "mumbai",
    "hyderabad",
    "pune",
    "gurgaon",
    "noida",
    "ahmedabad",
    "remote",
    "work from home",
    "wfh",
    "new york",
    "san francisco",
    "seattle",
    "london",
  ];

  const lowerText = text.toLowerCase();

  for (const location of locationKeywords) {
    if (lowerText.includes(location)) {
      return location;
    }
  }

  return "";
};

/* =========================
   UPDATE LINKEDIN URL
========================= */
exports.updateLinkedInUrl = async (req, res) => {
  try {
    const { linkedinUrl } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!linkedinUrl) {
      return res.status(400).json({
        success: false,
        message: "LinkedIn URL is required",
      });
    }

    // Validate LinkedIn URL format
    if (!linkedinUrl.includes("linkedin.com")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid LinkedIn URL",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { linkedinUrl },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "LinkedIn URL updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        linkedinUrl: user.linkedinUrl,
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
   UPLOAD RESUME
========================= */
exports.uploadResume = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    // Extract text from resume
    const resumeText = await extractTextFromResume(req.file.path);

    // Extract skills
    const skills = extractSkillsFromText(resumeText);

    // Extract field of interest
    const fieldOfInterest = extractFieldOfInterest(resumeText);

    // Extract location
    const currentLocation = extractLocation(resumeText);

    // Update user with extracted data
    const user = await User.findByIdAndUpdate(
      userId,
      {
        resumeUrl: `/uploads/${req.file.filename}`,
        skills: skills,
        fieldOfInterest: fieldOfInterest.length > 0 ? fieldOfInterest : user?.fieldOfInterest || [],
        currentLocation: currentLocation || user?.currentLocation || "",
        resumeDataExtracted: true,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Resume uploaded and processed successfully",
      data: {
        resume: user.resumeUrl,
        skills: user.skills,
        fieldOfInterest: user.fieldOfInterest,
        currentLocation: user.currentLocation,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET USER PROFILE
========================= */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select(
      "name email phoneNumber linkedinUrl resumeUrl fieldOfInterest skills currentLocation"
    );

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET PERSONALIZED JOBS
========================= */
exports.getPersonalizedJobs = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build filter based on user profile
    let filter = {};

    // Filter by field of interest
    if (user.fieldOfInterest && user.fieldOfInterest.length > 0) {
      const titleRegex = user.fieldOfInterest.map(
        (field) => new RegExp(field, "i")
      );
      filter.title = { $in: titleRegex };
    }

    // Filter by location
    if (user.currentLocation) {
      filter.$or = [
        { location: new RegExp(user.currentLocation, "i") },
        { type: "remote" },
        { type: { $regex: "remote", $options: "i" } },
      ];
    }

    // Filter by skills matching
    if (user.skills && user.skills.length > 0) {
      const skillRegex = user.skills.map((skill) => new RegExp(skill, "i"));
      filter.skills = { $in: skillRegex };
    }

    // Get personalized jobs with sorting
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .select("title company location type salary skills description");

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: jobs,
      userProfile: {
        fieldOfInterest: user.fieldOfInterest,
        currentLocation: user.currentLocation,
        skills: user.skills,
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
   DELETE RESUME
========================= */
exports.deleteResume = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);

    if (!user || !user.resumeUrl) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    // Delete file from uploads folder
    const filePath = path.join(__dirname, "..", user.resumeUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update user
    user.resumeUrl = null;
    user.resumeDataExtracted = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
