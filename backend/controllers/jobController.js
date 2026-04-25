const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");
const { extractSkillsFromText } = require("../utils/resumeIntelligence");

const normalizeSkill = (skill = "") =>
  skill
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();

const toTitleCase = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .replace("Nodejs", "Node.js")
    .replace("Nextjs", "Next.js")
    .replace("Aws", "AWS")
    .replace("Gcp", "GCP");

const getReadinessLabel = (score) => {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "emerging";
};

const getCandidateInsights = async (user) => {
  const profile = await Candidate.findOne({ user: user._id });

  if (profile) {
    return {
      skills: profile.skills || [],
      experience: Number(profile.experience || 0),
      education: profile.education || [],
    };
  }

  const latestApplication = await Application.findOne({ candidate: user._id })
    .sort({ createdAt: -1 })
    .select("parsedResume resumeText yearsExperience");

  if (latestApplication?.parsedResume?.skills?.length) {
    return {
      skills: latestApplication.parsedResume.skills,
      experience: Number(
        latestApplication.yearsExperience || latestApplication.parsedResume?.experience?.years || 0
      ),
      education: latestApplication.parsedResume?.education || [],
    };
  }

  if (latestApplication?.resumeText) {
    return {
      skills: extractSkillsFromText(latestApplication.resumeText),
      experience: Number(latestApplication.yearsExperience || 0),
      education: [],
    };
  }

  return {
    skills: [],
    experience: 0,
    education: [],
  };
};

/* =========================
   CREATE JOB (ADMIN ONLY)
========================= */
exports.createJob = async (req, res) => {
  try {
    const { title, description, company } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      createdBy: req.user._id, // admin id
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully ✅",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET SINGLE JOB (PUBLIC)
========================= */
exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("createdBy", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET ALL JOBS (PUBLIC)
========================= */
exports.getAllJobs = async (req, res) => {
  try {
    console.log("📋 Fetching all jobs...");
    
    const jobs = await Job.find().populate("createdBy", "name email");
    
    console.log(`✅ Found ${jobs.length} jobs in database`);

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
      message: jobs.length === 0 ? "No jobs available yet" : "Jobs fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error.message);
    
    // Check if it's a database connection error
    if (error.message.includes("connect") || error.name === "MongoNetworkError") {
      console.error("🚨 Database connection failed!");
      return res.status(503).json({
        success: false,
        message: "Database not connected. Please set MONGO_URI in environment variables.",
        error: error.message,
        code: "DB_DISCONNECTED",
      });
    }
    
    // Generic error
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs: " + error.message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* =========================
   GET RECOMMENDED JOBS (CANDIDATE)
========================= */
exports.getJobRecommendations = async (req, res) => {
  try {
    const candidateInsights = await getCandidateInsights(req.user);
    const candidateSkills = candidateInsights.skills || [];
    const candidateExperience = Number(candidateInsights.experience || 0);
    const hasEducation = (candidateInsights.education || []).length > 0;
    const candidateSkillSet = new Set(candidateSkills.map((skill) => normalizeSkill(skill)));

    if (candidateSkillSet.size === 0) {
      return res.status(200).json({
        success: true,
        message: "No candidate skills found yet. Upload/apply with a resume to receive recommendations.",
        candidateSkills: [],
        recommendations: [],
      });
    }

    const jobs = await Job.find({ status: { $ne: "closed" } }).populate("createdBy", "name email");

    const recommendations = jobs
      .map((job) => {
        const jobSkillsOriginal = (job.skills || []).filter(Boolean);
        const jobSkillsNormalized = jobSkillsOriginal.map((skill) => normalizeSkill(skill));

        const matchedSkillsNormalized = jobSkillsNormalized.filter((skill) => candidateSkillSet.has(skill));
        const missingSkillsNormalized = jobSkillsNormalized.filter((skill) => !candidateSkillSet.has(skill));

        const matchedSkills = matchedSkillsNormalized.map((skill) => toTitleCase(skill));
        const missingSkills = missingSkillsNormalized.map((skill) => toTitleCase(skill));

        const skillMatchScore = jobSkillsNormalized.length
          ? Math.round((matchedSkillsNormalized.length / jobSkillsNormalized.length) * 100)
          : 0;

        const requiredExperience = Number(job.experience || job.yearsOfExperience || 0);
        const experienceScore = requiredExperience > 0
          ? Math.max(0, Math.min(100, Math.round((candidateExperience / requiredExperience) * 100)))
          : 80;

        const educationScore = hasEducation ? 100 : 65;

        const matchScore = Math.round(
          skillMatchScore * 0.75 + experienceScore * 0.2 + educationScore * 0.05
        );

        const readiness = getReadinessLabel(matchScore);
        const summary = matchedSkills.length
          ? `Matched ${matchedSkills.length}/${jobSkillsNormalized.length || matchedSkills.length} core skills${
              missingSkills.length ? ` with gaps in ${missingSkills.slice(0, 3).join(", ")}` : " and strong readiness"
            }.`
          : "Limited direct overlap right now; improve targeted role skills to increase fit.";

        return {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          salary: job.salary,
          description: job.description,
          skills: job.skills || [],
          matchScore,
          readiness,
          scoreBreakdown: {
            skillMatchScore,
            experienceScore,
            educationScore,
          },
          matchedSkills,
          missingSkills,
          explanation: {
            summary,
            strengths: matchedSkills.length
              ? [`Skill alignment: ${matchedSkills.slice(0, 4).join(", ")}`]
              : [],
            weaknesses: missingSkills.length
              ? [`Missing skills: ${missingSkills.slice(0, 4).join(", ")}`]
              : ["No major skill gaps identified"],
          },
          createdAt: job.createdAt,
        };
      })
      .filter((job) => job.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      candidateSkills,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
