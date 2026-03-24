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

const getCandidateSkillSet = async (user) => {
  const profile = await Candidate.findOne({ user: user._id });

  if (profile?.skills?.length) {
    return profile.skills;
  }

  const latestApplication = await Application.findOne({ candidate: user._id })
    .sort({ createdAt: -1 })
    .select("parsedResume resumeText");

  if (latestApplication?.parsedResume?.skills?.length) {
    return latestApplication.parsedResume.skills;
  }

  if (latestApplication?.resumeText) {
    return extractSkillsFromText(latestApplication.resumeText);
  }

  return [];
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
    const jobs = await Job.find().populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET RECOMMENDED JOBS (CANDIDATE)
========================= */
exports.getJobRecommendations = async (req, res) => {
  try {
    const candidateSkills = await getCandidateSkillSet(req.user);
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
        const jobSkills = (job.skills || []).map((skill) => normalizeSkill(skill)).filter(Boolean);
        const matchedSkills = jobSkills.filter((skill) => candidateSkillSet.has(skill));
        const matchScore = jobSkills.length
          ? Math.round((matchedSkills.length / jobSkills.length) * 100)
          : 0;

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
          matchedSkills,
          missingSkills: jobSkills.filter((skill) => !candidateSkillSet.has(skill)),
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
