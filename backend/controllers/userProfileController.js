const User = require("../models/User");
const Job = require("../models/Job");
const fs = require("fs");
const path = require("path");
const { extractSkillsFromText } = require("../utils/resumeIntelligence");
let pdfParse;
try {
  pdfParse = require("pdf-parse/lib/pdf.js");
} catch (e) {
  try {
    pdfParse = require("pdf-parse");
  } catch (e2) {
    pdfParse = null;
  }
}
const mammoth = require("mammoth");
const axios = require("axios"); // ✅ Add for downloading Cloudinary files

// ✅ ENHANCED: Extract text from resume file (handles both local and Cloudinary URLs)
const extractTextFromResume = async (filePathOrUrl) => {
  try {
    let fileBuffer;
    const fileExtension = path.extname(filePathOrUrl).toLowerCase();

    // ✅ Check if it's a Cloudinary URL or local path
    if (filePathOrUrl.startsWith("http")) {
      // ✅ Download from Cloudinary
      console.log("📥 Downloading resume from Cloudinary:", filePathOrUrl);
      const response = await axios.get(filePathOrUrl, { 
        responseType: "arraybuffer",
        timeout: 10000 
      });
      fileBuffer = Buffer.from(response.data);
      console.log("✅ Downloaded:", fileBuffer.length, "bytes");
    } else {
      // Local file (for backwards compatibility)
      fileBuffer = fs.readFileSync(filePathOrUrl);
    }

    if (fileExtension === ".pdf") {
      if (!pdfParse) {
        console.warn("⚠️  PDF parsing not available, returning fallback text");
        return "PDF file uploaded successfully. Text extraction limited.";
      }

      try {
        const pdfModule = require("pdf-parse/lib/pdf");
        const pdfData = await pdfModule(fileBuffer);
        const extractedText = pdfData.text || "";
        console.log("✅ PDF parsed successfully:", extractedText.length, "characters");
        return extractedText;
      } catch (pdfError) {
        console.warn("⚠️  PDF parsing failed:", pdfError.message);
        return "PDF file uploaded. Please ensure it contains text.";
      }
    }

    if (fileExtension === ".docx") {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        console.log("✅ DOCX parsed successfully:", result.value.length, "characters");
        return result.value || "";
      } catch (docxError) {
        console.warn("⚠️  DOCX parsing failed:", docxError.message);
        return "DOCX file uploaded. Please ensure it contains text.";
      }
    }

    return "";
  } catch (error) {
    console.error("❌ Error extracting text from resume:", error.message);
    return "";
  }
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
      console.error("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        message: "Resume file is required. Please upload a PDF or DOCX file.",
      });
    }

    console.log("📁 File received from Cloudinary:", {
      filename: req.file.originalname,
      cloudinaryUrl: req.file.path,
      cloudinaryPublicId: req.file.filename,
      size: req.file.size,
    });

    // Cloudinary provides secure_url - use it directly
    const resumeUrl = req.file.path; // This is the Cloudinary secure URL

    // Extract text from resume (using the downloaded buffer from Cloudinary)
    const resumeText = await extractTextFromResume(req.file.path);

    // Extract skills
    const skills = extractSkillsFromText(resumeText);

    // Extract field of interest
    const fieldOfInterest = extractFieldOfInterest(resumeText);

    // Extract location
    const currentLocation = extractLocation(resumeText);

    // Fetch existing user data first to preserve any existing values
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user with extracted data
    const user = await User.findByIdAndUpdate(
      userId,
      {
        resumeUrl: resumeUrl, // Store the Cloudinary secure URL
        skills: skills,
        fieldOfInterest: fieldOfInterest.length > 0 ? fieldOfInterest : existingUser?.fieldOfInterest || [],
        currentLocation: currentLocation || existingUser?.currentLocation || "",
        resumeDataExtracted: true,
      },
      { new: true, runValidators: true }
    );

    console.log("✅ User after update:", {
      _id: user._id,
      resumeUrl: user.resumeUrl,
      skills: user.skills.length,
      fieldOfInterest: user.fieldOfInterest.length,
      currentLocation: user.currentLocation,
    });

    // Verify resume was saved
    if (!user.resumeUrl) {
      console.error("❌ ERROR: Resume URL not saved in database!");
      return res.status(500).json({
        success: false,
        message: "Failed to save resume URL to database",
      });
    }

    console.log("✅ Resume processed and saved successfully");
    console.log("📄 Resume Cloudinary URL:", user.resumeUrl);

    res.status(200).json({
      success: true,
      message: "Resume uploaded and processed successfully",
      data: {
        resume: user.resumeUrl,
        skills: user.skills,
        fieldOfInterest: user.fieldOfInterest,
        currentLocation: user.currentLocation,
        resumeDataExtracted: user.resumeDataExtracted,
      },
    });
  } catch (error) {
    console.error("❌ Resume upload error:", error.message);
    res.status(500).json({
      success: false,
      message: "Resume processing failed: " + error.message,
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
      "name email phoneNumber linkedinUrl resumeUrl fieldOfInterest skills currentLocation resumeDataExtracted"
    );

    // Calculate profile completeness
    const profileCompleteness = user.calculateProfileCompleteness();

    res.status(200).json({
      success: true,
      user: user,
      profileCompleteness: profileCompleteness,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   CALCULATE JOB MATCH SCORE
========================= */
const calculateJobMatchScore = (job, userProfile) => {
  let score = 0;
  let details = {
    skillMatch: 0,
    locationMatch: 0,
    interestMatch: 0,
    totalFactors: 0,
  };

  // 1. SKILL MATCHING (40 points max)
  if (userProfile.skills && userProfile.skills.length > 0 && job.skills) {
    const userSkillsLower = userProfile.skills.map((s) =>
      s.toLowerCase().replace(/\s+/g, " ")
    );
    const jobSkillsLower = (job.skills || []).map((s) =>
      s.toLowerCase().replace(/\s+/g, " ")
    );

    const matchingSkills = userSkillsLower.filter((skill) =>
      jobSkillsLower.some((jobSkill) => jobSkill.includes(skill) || skill.includes(jobSkill))
    );

    const skillPercentage = (matchingSkills.length / userSkillsLower.length) * 100;
    details.skillMatch = Math.round(skillPercentage);
    score += (matchingSkills.length / Math.max(userSkillsLower.length, 1)) * 40;
  }
  details.totalFactors++;

  // 2. LOCATION MATCHING (25 points max)
  if (userProfile.currentLocation) {
    const userLocationLower = userProfile.currentLocation.toLowerCase();
    const jobLocationLower = (job.location || "").toLowerCase();
    const jobTypeLower = (job.type || "").toLowerCase();

    if (
      jobLocationLower.includes(userLocationLower) ||
      userLocationLower.includes(jobLocationLower)
    ) {
      details.locationMatch = 100;
      score += 25;
    } else if (
      jobTypeLower.includes("remote") ||
      jobLocationLower.includes("remote")
    ) {
      details.locationMatch = 60;
      score += 15;
    } else {
      details.locationMatch = 0;
    }
  }
  details.totalFactors++;

  // 3. FIELD OF INTEREST MATCHING (25 points max)
  if (userProfile.fieldOfInterest && userProfile.fieldOfInterest.length > 0) {
    const jobTitleLower = (job.title || "").toLowerCase();
    const jobDescLower = (job.description || "").toLowerCase();

    let interestMatches = 0;
    userProfile.fieldOfInterest.forEach((interest) => {
      const interestLower = interest.toLowerCase();
      if (
        jobTitleLower.includes(interestLower) ||
        jobDescLower.includes(interestLower)
      ) {
        interestMatches++;
      }
    });

    const interestPercentage =
      (interestMatches / Math.max(userProfile.fieldOfInterest.length, 1)) * 100;
    details.interestMatch = Math.round(interestPercentage);
    score +=
      (interestMatches / Math.max(userProfile.fieldOfInterest.length, 1)) * 25;
  }
  details.totalFactors++;

  // 4. BONUS: SALARY MATCH (10 points max)
  if (job.salary) {
    const salaryNum = parseInt(job.salary);
    if (salaryNum >= 600000) {
      score += 10;
    } else if (salaryNum >= 400000) {
      score += 8;
    }
  }

  const finalScore = Math.round((score / 100) * 100);
  return {
    matchScore: Math.min(100, finalScore),
    matchDetails: details,
  };
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

    // If no resume uploaded, return empty
    if (!user.resumeDataExtracted) {
      return res.status(200).json({
        success: true,
        count: 0,
        jobs: [],
        message: "Please upload your resume to get personalized job recommendations",
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

    // Filter by location (but be more flexible)
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

    // Get jobs
    const jobs = await Job.find(filter)
      .select("_id title company location type salary skills description requiredExperience")
      .lean();

    // Calculate match score for each job
    const jobsWithScores = jobs.map((job) => {
      const { matchScore, matchDetails } = calculateJobMatchScore(job, {
        skills: user.skills || [],
        currentLocation: user.currentLocation || "",
        fieldOfInterest: user.fieldOfInterest || [],
      });

      return {
        ...job,
        matchScore,
        matchDetails,
      };
    });

    // Sort by match score descending
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 25 matches
    const topJobs = jobsWithScores.slice(0, 25);

    res.status(200).json({
      success: true,
      count: topJobs.length,
      jobs: topJobs,
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

/* =========================
   UPDATE USER PROFILE
========================= */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      name,
      phoneNumber,
      currentLocation,
      fieldOfInterest,
      skills,
      linkedinUrl,
      resumeUrl,
    } = req.body;

    console.log("📝 Updating profile with data:", {
      name,
      phoneNumber,
      currentLocation,
      fieldOfInterest,
      skills,
      linkedinUrl,
      resumeUrl,
    });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update all fields (even if empty string, to allow clearing fields)
    if (name !== undefined) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (currentLocation !== undefined) user.currentLocation = currentLocation;
    if (fieldOfInterest !== undefined) user.fieldOfInterest = Array.isArray(fieldOfInterest) ? fieldOfInterest : [];
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [];
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (resumeUrl !== undefined) {
      console.log("📄 Setting resumeUrl:", resumeUrl);
      user.resumeUrl = resumeUrl;
    } else {
      console.log("⚠️ resumeUrl not in request, preserving existing:", user.resumeUrl);
    }

    console.log("💾 Saving user with updated fields:", {
      name: user.name,
      phoneNumber: user.phoneNumber,
      currentLocation: user.currentLocation,
      fieldOfInterest: user.fieldOfInterest,
      skills: user.skills,
      linkedinUrl: user.linkedinUrl,
      resumeUrl: user.resumeUrl,
    });

    await user.save();
    console.log("✅ User saved successfully");
    
    // Verify the save worked
    const savedUser = await User.findById(userId);
    console.log("✅ Verified user in database:", {
      resumeUrl: savedUser.resumeUrl,
      skills: savedUser.skills.length,
      fieldOfInterest: savedUser.fieldOfInterest.length,
    });

    // Calculate profile completeness
    const profileCompleteness = user.calculateProfileCompleteness();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        currentLocation: user.currentLocation,
        fieldOfInterest: user.fieldOfInterest,
        skills: user.skills,
        linkedinUrl: user.linkedinUrl,
        resumeUrl: user.resumeUrl,
      },
      profileCompleteness: profileCompleteness,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
