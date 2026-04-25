const Application = require("../models/Application");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const User = require("../models/User"); // ✅ Import User model
const { calculateMatchScore } = require("../../ai-service/matcher");
const { sendNotificationEmail } = require("../utils/notificationService");
const {
  parseResumeText,
  parseResumeFile,
  generateMatchExplanation,
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
       RESUME FILE & USER PROFILE
    ========================= */
    
    let resumePath = null;
    let finalResumeText = String(resumeText || "").trim();

    // ✅ If no resume uploaded with application, check user's profile
    if (req.file) {
      resumePath = req.file.path;
    } else if (!finalResumeText && req.user._id) {
      // ✅ Try to get resume from user profile
      try {
        const userProfile = await User.findById(req.user._id).select("resumeUrl skills fieldOfInterest currentLocation");
        if (userProfile?.resumeUrl) {
          console.log("📄 Using user's saved resume:", userProfile.resumeUrl);
          resumePath = userProfile.resumeUrl;
        }
      } catch (err) {
        console.warn("Could not load user profile resume:", err.message);
      }
    }

    /* =========================
       RESUME PARSING
    ========================= */

    let normalizedResumeText = finalResumeText;
    let parsedResume = parseResumeText(normalizedResumeText);

    if (!normalizedResumeText && resumePath) {
      try {
        const parsedFile = await parseResumeFile(resumePath, req.file?.mimetype);
        normalizedResumeText = parsedFile.text;
        parsedResume = parsedFile.parsed;
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
          education: parsedResume?.education || [],
          resumeParsedAt: new Date(),
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

    const matchExplanation = generateMatchExplanation({
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
      matchExplanation,
      coverLetter: coverLetter || "",
      matchScore,
      status: "pending",
    });

    sendNotificationEmail({
      to: application.email || req.user.email,
      subject: "Application Submitted Successfully",
      heading: "Application Received",
      message: `Your application for ${job.title} at ${job.company} has been submitted. We will notify you when there is an update.`,
      ctaLabel: "View Applications",
      ctaUrl: process.env.FRONTEND_URL || "http://localhost:3000/candidate/dashboard",
    }).catch((err) => {
      console.error("Application email notification failed:", err.message);
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

    const allowedStatus = ["pending", "shortlisted", "accepted", "rejected"];

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
    ).populate("job", "title company").populate("candidate", "email");

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

    if (status === "shortlisted" || status === "rejected") {
      const targetEmail = application?.email || application?.candidate?.email;
      const jobTitle = application?.job?.title || "this role";
      const company = application?.job?.company || "the company";
      const statusText = status === "shortlisted" ? "shortlisted" : "rejected";

      sendNotificationEmail({
        to: targetEmail,
        subject: `Application ${statusText}: ${jobTitle}`,
        heading: `Your application was ${statusText}`,
        message: `Your application for ${jobTitle} at ${company} is now marked as ${statusText}.`,
        ctaLabel: "Open Dashboard",
        ctaUrl: process.env.FRONTEND_URL || "http://localhost:3000/candidate/dashboard",
      }).catch((err) => {
        console.error("Status email notification failed:", err.message);
      });
    }

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/* =========================
   SCHEDULE INTERVIEW (RECRUITER/ADMIN)
=========================*/
exports.scheduleInterview = async (req, res) => {
  try {
    const { scheduledAt, timezone, mode, meetingLink, notes } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "scheduledAt is required",
      });
    }

    const application = await Application.findById(req.params.id)
      .populate("job", "title company")
      .populate("candidate", "email name");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.interview = {
      scheduledAt: new Date(scheduledAt),
      timezone: timezone || "UTC",
      mode: mode || "video",
      meetingLink: meetingLink || "",
      notes: notes || "",
      scheduledBy: req.user._id,
    };

    if (application.status === "pending") {
      application.status = "shortlisted";
    }

    await application.save();

    sendNotificationEmail({
      to: application.email || application?.candidate?.email,
      subject: `Interview Scheduled: ${application?.job?.title || "Role"}`,
      heading: "Interview Scheduled",
      message: `Your interview for ${application?.job?.title || "the role"} at ${application?.job?.company || "the company"} is scheduled on ${new Date(scheduledAt).toLocaleString()}.`,
      ctaLabel: "View Details",
      ctaUrl: process.env.FRONTEND_URL || "http://localhost:3000/candidate/dashboard",
    }).catch((err) => {
      console.error("Interview email notification failed:", err.message);
    });

    res.status(200).json({
      success: true,
      message: "Interview scheduled successfully",
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
