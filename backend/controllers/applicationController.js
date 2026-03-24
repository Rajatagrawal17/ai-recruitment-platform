const Application = require("../models/Application");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const { calculateMatchScore } = require("../../ai-service/matcher");
const {
  parseResumeText,
  parsePdfResume,
  generateResumeFeedback,
} = require("../utils/resumeIntelligence");

/* =========================
   APPLY JOB (CANDIDATE)
=========================*/
exports.applyJob = async (req, res) => {
  try {

    const { jobId, fullName, email, phone, linkedinUrl, portfolioUrl, yearsExperience, coverLetter, resumeText } = req.body;

    // check job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // check duplicate apply
    const alreadyApplied = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    /* =========================
       RESUME FILE
    ========================= */

    let resumePath = null;

    if (req.file) {
      resumePath = req.file.path;
    }

    /* =========================
       RESUME PARSING
    ========================= */

    let normalizedResumeText = String(resumeText || "").trim();
    let parsedResume = parseResumeText(normalizedResumeText);

    if (!normalizedResumeText && resumePath) {
      try {
        const parsedPdf = await parsePdfResume(resumePath);
        normalizedResumeText = parsedPdf.text;
        parsedResume = parsedPdf.parsed;
      } catch (parseError) {
        console.error("Resume parse fallback error:", parseError.message);
      }
    }

    const parsedSkills = parsedResume?.skills || [];
    const parsedExperienceYears =
      Number(yearsExperience || 0) > 0
        ? Number(yearsExperience)
        : Number(parsedResume?.experience?.years || 0);

    // Keep candidate profile in sync with latest parsed resume insights.
    await Candidate.updateOne(
      { email: req.user.email },
      {
        $set: {
          user: req.user._id,
          name: req.user.name,
          email: req.user.email,
          skills: parsedSkills,
          experience: parsedExperienceYears,
        },
      },
      { upsert: true }
    );

    /* =========================
       AI MATCH SCORE
    ========================= */

    let matchScore = 0;

    if (normalizedResumeText && job.description) {
      matchScore = calculateMatchScore(normalizedResumeText, job.description, job.skills || []);
    }

    const resumeFeedback = generateResumeFeedback({
      parsedResume,
      jobSkills: job.skills || [],
      requiredExperience: Number(job.experience || job.yearsOfExperience || 0),
    });

    /* =========================
       CREATE APPLICATION
    ========================= */

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      candidateName: fullName || req.user.name || "",
      jobTitle: job.title || "",
      company: job.company || "",
      fullName: fullName || "",
      email: email || "",
      phone: phone || "",
      linkedinUrl: linkedinUrl || "",
      portfolioUrl: portfolioUrl || "",
      yearsExperience: parsedExperienceYears,
      resume: resumePath,
      resumeText: normalizedResumeText,
      parsedResume,
      resumeFeedback,
      coverLetter: coverLetter || "",
      matchScore,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });

  } catch (error) {

    console.error("Apply Job Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================
   GET ALL APPLICATIONS (ADMIN)
=========================*/
exports.getAllApplications = async (req, res) => {
  try {

    const applications = await Application.find()
      .populate("candidate", "name email")
      .populate("job", "title company");

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/* =========================
   UPDATE APPLICATION STATUS (ADMIN)
=========================*/
exports.updateStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const allowedStatus = ["pending", "accepted", "rejected"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      application,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/* =========================
   GET MY APPLICATIONS (CANDIDATE)
=========================*/
exports.getMyApplications = async (req, res) => {
  try {

    const applications = await Application.find({
      candidate: req.user._id,
    }).populate("job", "title company description");

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
