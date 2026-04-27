const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const { calculateMatchScore, extractSkills, rankCandidates } = require("../../ai-service/matcher");

/* =========================
   GET MATCHED CANDIDATES FOR A JOB
========================= */
exports.getMatchedCandidatesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    // Query params for filtering and pagination
    const {
      status,
      minScore,
      maxScore,
      search,
      sortBy = "score",
      page = 1,
      limit = 50,
    } = req.query;

    const job = await Job.findById(jobId).populate("createdBy");
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Get all applications for this job
    const applications = await Application.find({ job: jobId }).populate("candidate");

    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No applications yet",
        matchedCandidates: [],
      });
    }

    // Score and rank candidates
    const scoredCandidates = applications.map((app) => ({
      _id: app._id,
      candidateId: app.candidate._id,
      candidateName: app.candidate.name,
      candidateEmail: app.candidate.email,
      resume: app.resume,
      yearsExperience: app.yearsExperience,
      currentMatchScore: app.matchScore,
      status: app.status,
      appliedAt: app.createdAt,
      interview: app.interview || null,
      matchExplanation: app.matchExplanation || {},
      resumeFeedback: app.resumeFeedback || {},
      matchScore: calculateMatchScore(
        app.resumeText || app.resume || "",
        job.description,
        job.skills || []
      ),
      extractedSkills: extractSkills(app.resumeText || app.resume || ""),
    }));

    // Sort by match score
    // Apply server-side filtering
    let filtered = scoredCandidates;

    if (status) {
      filtered = filtered.filter((c) => (c.status || "pending") === status);
    }

    const min = Number(minScore || -Infinity);
    const max = Number(maxScore || Infinity);
    if (!isNaN(min) || !isNaN(max)) {
      filtered = filtered.filter((c) => c.matchScore >= (isFinite(min) ? min : -Infinity) && c.matchScore <= (isFinite(max) ? max : Infinity));
    }

    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter((c) => (c.candidateName || "").toLowerCase().includes(s) || (c.candidateEmail || "").toLowerCase().includes(s));
    }

    // Sorting
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => (a.candidateName || "").localeCompare(b.candidateName || ""));
        break;
      case "date":
        filtered.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
        break;
      case "score":
      default:
        filtered.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Pagination
    const p = Math.max(1, Number(page || 1));
    const lim = Math.min(200, Number(limit || 50));
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / lim));
    const start = (p - 1) * lim;
    const end = start + lim;
    const pageItems = filtered.slice(start, end);

    res.status(200).json({
      success: true,
      message: `Found ${filtered.length} candidates for job`,
      job: {
        _id: job._id,
        title: job.title,
        description: job.description,
        skills: job.skills || [],
      },
      matchedCandidates: pageItems,
      meta: {
        total,
        page: p,
        limit: lim,
        totalPages,
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
   GET MATCHED JOBS FOR A CANDIDATE
========================= */
exports.getMatchedJobsForCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Get candidate's resume from their applications
    const candidateApp = await Application.findOne({ candidate: candidateId });
    const resumeText = candidateApp?.resumeText || candidateApp?.resume || "";

    // Get all jobs
    const jobs = await Job.find();

    // Score and rank jobs for candidate
    const scoredJobs = jobs.map((job) => ({
      _id: job._id,
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location || "Not specified",
      salary: job.salary || "Not specified",
      type: job.type || "full-time",
      skills: job.skills || [],
      createdAt: job.createdAt,
      matchScore: calculateMatchScore(resumeText, job.description, job.skills || []),
      extractedSkills: extractSkills(resumeText),
    }));

    // Sort by match score and filter top matches
    const topMatches = scoredJobs
      .filter((j) => j.matchScore >= 40) // Only show 40%+ matches
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      message: `Found ${topMatches.length} matching jobs for candidate`,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      resumeAnalysis: extractSkills(resumeText),
      matchedJobs: topMatches,
      allJobs: scoredJobs.length,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   ANALYZE RESUME & EXTRACT SKILLS
========================= */
exports.analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const analysis = extractSkills(resumeText);

    res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      analysis: {
        technicalSkills: analysis.technical,
        softSkills: analysis.soft,
        experienceLevel: analysis.experience,
        resumeLength: resumeText.length,
        hasEducation: /bachelor|master|degree|btech|mtech|engineer|diploma|phd|certification/i.test(resumeText),
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
   GET TOP CANDIDATES FOR ALL JOBS
========================= */
exports.getTopCandidatesForAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    const applications = await Application.find().populate("candidate");

    const jobMatches = await Promise.all(
      jobs.map(async (job) => {
        const jobApplications = applications.filter(
          (app) => app.job.toString() === job._id.toString()
        );

        const scoredApplicants = jobApplications
          .map((app) => ({
            candidateId: app.candidate._id,
            candidateName: app.candidate.name,
            candidateEmail: app.candidate.email,
            matchScore: calculateMatchScore(
              app.resumeText || app.resume || "",
              job.description,
              job.skills || []
            ),
            status: app.status,
            matchExplanation: app.matchExplanation || {},
          }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5); // Top 5 candidates per job

        return {
          jobId: job._id,
          jobTitle: job.title,
          company: job.company,
          totalApplications: jobApplications.length,
          topCandidates: scoredApplicants,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Top candidates retrieved successfully",
      jobMatches: jobMatches,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   SCORE SPECIFIC CANDIDATE FOR JOB
========================= */
exports.scoreCandidateForJob = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    const candidate = await User.findById(candidateId);
    const job = await Job.findById(jobId);

    if (!candidate || !job) {
      return res.status(404).json({
        success: false,
        message: "Candidate or Job not found",
      });
    }

    const application = await Application.findOne({
      candidate: candidateId,
      job: jobId,
    });

    const resumeText = application?.resumeText || application?.resume || "";
    const matchScore = calculateMatchScore(resumeText, job.description, job.skills || []);
    const skillAnalysis = extractSkills(resumeText);

    res.status(200).json({
      success: true,
      message: "Scoring completed",
      scoring: {
        candidateName: candidate.name,
        jobTitle: job.title,
        matchScore: matchScore,
        skillAnalysis: skillAnalysis,
        matchPercentage: `${matchScore}%`,
        recommendation: matchScore >= 80
          ? "Strong match - Highly recommended"
          : matchScore >= 60
          ? "Good match - Consider for interview"
          : matchScore >= 40
          ? "Potential match - Review further"
          : "Weak match - Consider other candidates",
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
