const {
  SkillExtractor,
  JobMatcher,
  ResumeAnalyzer,
  RecommendationEngine,
  InterviewAssistant,
} = require("../services/aiService");
const Job = require("../models/Job");
const User = require("../models/User");

// ==================== AI JOB MATCHER ====================
exports.getJobMatches = async (req, res) => {
  try {
    const { candidateId } = req.body || { candidateId: req.user?._id };

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    const matchedJobs = await JobMatcher.matchCandidateWithJobs(candidateId);

    res.status(200).json({
      success: true,
      data: matchedJobs,
      total: matchedJobs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== AI RESUME ANALYZER ====================
exports.analyzeResume = async (req, res) => {
  try {
    const { resumeText, resumeUrl } = req.body;

    if (!resumeText && !resumeUrl) {
      return res.status(400).json({
        success: false,
        message: "Resume text or URL is required",
      });
    }

    // If resumeUrl provided, fetch and parse it
    let textToAnalyze = resumeText;
    if (resumeUrl && !resumeText) {
      // In production, implement PDF parsing
      textToAnalyze = resumeUrl;
    }

    const analysis = ResumeAnalyzer.analyzeResumeText(textToAnalyze);

    res.status(200).json({
      success: true,
      data: {
        ...analysis,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== JOB RECOMMENDATIONS ====================
exports.getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const limit = req.query.limit || 5;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const recommendations = await RecommendationEngine.getRecommendedJobs(userId, limit);

    res.status(200).json({
      success: true,
      data: recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== SKILL ANALYSIS ====================
exports.analyzeSkills = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required for skill analysis",
      });
    }

    const skills = SkillExtractor.extractSkills(text);
    const categorized = SkillExtractor.categorizeSkills(skills);

    res.status(200).json({
      success: true,
      data: {
        skills,
        categorized,
        total: skills.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== INTERVIEW PREP ====================
exports.getInterviewQuestions = async (req, res) => {
  try {
    const { jobId, count = 5 } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const jobDescription = `${job.title} ${job.description} ${job.requirements || ""}`;
    const questions = InterviewAssistant.generateInterviewQuestions(jobDescription, count);

    res.status(200).json({
      success: true,
      data: {
        jobTitle: job.title,
        questions,
        total: questions.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== INTERVIEW TIPS ====================
exports.getInterviewTips = async (req, res) => {
  try {
    const { jobId, candidateId } = req.body;

    if (!jobId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: "Job ID and Candidate ID are required",
      });
    }

    const job = await Job.findById(jobId);
    const candidate = await User.findById(candidateId);

    if (!job || !candidate) {
      return res.status(404).json({
        success: false,
        message: "Job or candidate not found",
      });
    }

    const candidateSkills = SkillExtractor.extractSkills(
      candidate.bio || candidate.name || ""
    );
    const jobDescription = `${job.title} ${job.description} ${job.requirements || ""}`;

    const tips = InterviewAssistant.generateInterviewTips(candidateSkills, jobDescription);

    res.status(200).json({
      success: true,
      data: {
        candidateName: candidate.name,
        jobTitle: job.title,
        tips,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== SALARY PREDICTION ====================
exports.predictSalary = async (req, res) => {
  try {
    const { jobTitle, location, experience, skills } = req.body;

    if (!jobTitle || !experience) {
      return res.status(400).json({
        success: false,
        message: "Job title and experience are required",
      });
    }

    const salaryRange = RecommendationEngine.calculateSalaryRange(
      jobTitle,
      location || "India",
      { years: experience },
      skills || []
    );

    res.status(200).json({
      success: true,
      data: salaryRange,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== SKILL GAP ANALYSIS ====================
exports.analyzeSkillGap = async (req, res) => {
  try {
    const { candidateSkills, requiredSkills } = req.body;

    if (!candidateSkills || !requiredSkills) {
      return res.status(400).json({
        success: false,
        message: "Candidate skills and required skills are required",
      });
    }

    const hasSkills = candidateSkills.filter((s) =>
      requiredSkills.some((r) => r.toLowerCase() === s.toLowerCase())
    );

    const missingSkills = requiredSkills.filter((r) =>
      !candidateSkills.some((c) => c.toLowerCase() === r.toLowerCase())
    );

    const gapPercentage = Math.round((hasSkills.length / requiredSkills.length) * 100);

    // Suggest learning resources
    const learningPath = missingSkills.map((skill) => ({
      skill,
      resources: [
        `Udemy: ${skill} Masterclass`,
        `Coursera: ${skill} Professional Certificate`,
        `freeCodeCamp: ${skill} Tutorial`,
      ],
      estimatedWeeks: 2 + Math.floor(Math.random() * 4), // 2-6 weeks
    }));

    res.status(200).json({
      success: true,
      data: {
        hasSkills,
        missingSkills,
        gapPercentage,
        learningPath,
        matchPercentage: gapPercentage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== APPLICATION ASSISTANT ====================
exports.generateApplicationContent = async (req, res) => {
  try {
    const { jobId, candidateId, contentType = "cover_letter" } = req.body;

    if (!jobId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: "Job ID and Candidate ID are required",
      });
    }

    const job = await Job.findById(jobId);
    const candidate = await User.findById(candidateId);

    if (!job || !candidate) {
      return res.status(404).json({
        success: false,
        message: "Job or candidate not found",
      });
    }

    let generatedContent = "";

    if (contentType === "cover_letter") {
      generatedContent = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}.

With my background in [Your relevant experience], I am confident that I can bring significant value to your team. My expertise in key areas such as [Your skills] aligns perfectly with the requirements outlined in the job description.

I am particularly drawn to [specific aspect of the company/role], and I believe my [specific skill/experience] will enable me to contribute meaningfully to your organization.

I would welcome the opportunity to discuss how my qualifications can benefit your team. Thank you for considering my application.

Best regards,
${candidate.name}`;
    } else if (contentType === "email") {
      generatedContent = `Subject: Application for ${job.title} at ${job.company}

Dear [Hiring Manager Name],

I hope this email finds you well. I am writing to express my interest in the ${job.title} position at ${job.company}.

[Brief introduction highlighting your relevant experience]

I am excited about the opportunity to contribute to your team and would appreciate the chance to discuss how my skills can add value to your organization.

Thank you for your consideration. I look forward to hearing from you.

Best regards,
${candidate.name}
${candidate.email}`;
    } else if (contentType === "response") {
      generatedContent = `Thank you for reaching out about the ${job.title} position. I am very interested in this opportunity.

I believe my experience in [relevant skills] and my track record of [specific achievements] make me a strong fit for this role. I am particularly drawn to [company value/project], and I am excited about the possibility of contributing to your team.

I am available for an interview at your earliest convenience and can be reached at ${candidate.email}.

Looking forward to speaking with you soon.`;
    }

    res.status(200).json({
      success: true,
      data: {
        jobTitle: job.title,
        candidateName: candidate.name,
        contentType,
        generatedContent,
        note: "This is an AI-generated template. Please customize it with your specific experiences and achievements.",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== RECRUITER AI ASSISTANT ====================
exports.screenCandidates = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const jobSkills = SkillExtractor.extractSkills(
      `${job.title} ${job.description} ${job.requirements || ""}`
    );

    // Get all users (candidates)
    const candidates = await User.find({ role: "candidate" }).lean();

    // Score each candidate
    const scoredCandidates = candidates.map((candidate) => {
      const candidateSkills = SkillExtractor.extractSkills(
        `${candidate.name} ${candidate.bio || ""}`
      );

      const matchScore = JobMatcher.calculateMatchScore(
        candidateSkills,
        jobSkills,
        job.description
      );

      const redFlags = [];
      if (!candidateSkills.length) redFlags.push("No skills identified");
      if (matchScore < 30) redFlags.push("Low skill match");

      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        matchScore,
        candidateSkills,
        redFlags,
        recommendation: matchScore >= 70 ? "Highly Recommended" : matchScore >= 50 ? "Consider" : "Not Recommended",
      };
    });

    // Sort by score
    const sorted = scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      data: {
        jobTitle: job.title,
        candidates: sorted,
        total: sorted.length,
        recommendations: {
          recommended: sorted.filter((c) => c.matchScore >= 70),
          toConsider: sorted.filter((c) => c.matchScore >= 50 && c.matchScore < 70),
          notRecommended: sorted.filter((c) => c.matchScore < 50),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
