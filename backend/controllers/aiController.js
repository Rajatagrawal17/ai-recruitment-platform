const {
  SkillExtractor,
  JobMatcher,
  ResumeAnalyzer,
  RecommendationEngine,
  InterviewAssistant,
} = require("../services/aiService");
const AIResumeAnalyzer = require("../services/aiResumeAnalyzer");
const MockAIResumeAnalyzer = require("../services/mockAIService");
const Job = require("../models/Job");
const User = require("../models/User");
const Anthropic = require("@anthropic-ai/sdk");

// Determine if we're in demo mode (no Claude API key)
const IS_DEMO_MODE = !process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY.includes("your_") || process.env.CLAUDE_API_KEY.length < 20;

if (IS_DEMO_MODE) {
  console.warn("⚠️  DEMO MODE: Claude API key not configured. Using mock data.");
  console.warn("   To use real Claude AI, set CLAUDE_API_KEY in .env");
}

const helpAnthropic = !IS_DEMO_MODE
  ? new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
  : null;

const normalizeConversation = (conversation = []) =>
  conversation
    .filter((item) => item && typeof item === "object" && typeof item.text === "string")
    .slice(-8)
    .map((item) => ({
      role: item.sender === "user" ? "user" : "assistant",
      text: item.text.slice(0, 1000),
    }));

const createHelpFallback = ({ message = "", role = "guest", isAuthenticated = false, path = "/" }) => {
  const q = message.toLowerCase().trim();

  const build = (reply, actions = [], followUps = []) => ({
    reply,
    actions,
    followUps,
    tone: "helpful",
    provider: "Local Assistant",
  });

  if (!q) {
    return build(
      "Ask me anything about jobs, applications, dashboards, resume help, or recruiter actions. If you want, I can also guide you step by step.",
      [],
      ["How do I apply for a job?", "Show me my dashboard", "Help me improve my resume"]
    );
  }

  if (/(hello|hi|hey)/.test(q)) {
    return build(
      "Hi, I’m your HireAI assistant. I can answer product questions, guide you through workflows, and suggest next actions.",
      [{ label: "Open Jobs", path: "/jobs" }],
      ["How do I apply?", "Where is my dashboard?", "What can this app do?"]
    );
  }

  if (q.includes("jobs") || q.includes("job")) {
    return build(
      "You can browse open roles from the Jobs page, open any role for full details, and then apply from the job page.",
      [{ label: "Open Jobs", path: "/jobs" }],
      ["How do I apply?", "How does match score work?", "Show me AI tools"]
    );
  }

  if (q.includes("apply") || q.includes("application")) {
    if (!isAuthenticated) {
      return build(
        "You’ll need to log in or create a candidate account before applying. After that, open a job and submit the application form with your resume.",
        [
          { label: "Login", path: "/login" },
          { label: "Register", path: "/register?role=candidate" },
        ],
        ["Show open jobs", "How do I complete my profile?", "Where do I upload my resume?"]
      );
    }

    return build(
      "Open a job, review the details, and submit your resume and application form. If you want, I can also explain how to improve your match score before you apply.",
      [{ label: "Open Jobs", path: "/jobs" }],
      ["Help me with my profile", "How do I improve my resume?", "Where do I track applications?"]
    );
  }

  if (q.includes("dashboard") || q.includes("profile")) {
    if (!isAuthenticated) {
      return build(
        "Please log in first, then I can take you to the correct dashboard and show you the right actions for your role.",
        [{ label: "Go to Login", path: "/login" }],
        ["How do I register?", "What role should I choose?", "Show me open jobs"]
      );
    }

    const dashboardPath = role === "candidate" ? "/candidate/dashboard" : "/dashboard";
    return build(
      `Your ${role || "user"} dashboard is where you can review your activity, progress, and next steps. If you’re a candidate, that includes applications, match scores, and profile completion.`,
      [{ label: "Open Dashboard", path: dashboardPath }],
      ["How do I improve my profile?", "Show AI tools", "How do I update my resume?"]
    );
  }

  if (q.includes("resume")) {
    return build(
      "Upload your resume in your profile or during application. The platform can analyze it, extract skills, and give feedback on ATS readiness and fit.",
      [{ label: "Complete Profile", path: "/complete-profile" }],
      ["How do I get a stronger match score?", "How do I improve my profile?", "What AI tools can I use?"]
    );
  }

  if (q.includes("match") || q.includes("score")) {
    return build(
      "Match score is based on how well your profile skills, experience, and resume align with the job requirements. Stronger overlap means a higher score.",
      [{ label: "Open AI Tools", path: "/ai-tools" }],
      ["How do I improve my match?", "How do I update my resume?", "Show jobs with best fit"]
    );
  }

  if (q.includes("tool") || q.includes("ai")) {
    return build(
      "The AI tools can help with job matching, resume analysis, skill gaps, salary prediction, and interview preparation. Tell me which one you want and I’ll guide you.",
      [{ label: "Open AI Tools", path: "/ai-tools" }],
      ["Help me with resume analysis", "Help me find jobs", "Prepare me for interviews"]
    );
  }

  if (q.includes("support") || q.includes("help")) {
    return build(
      `You’re currently on ${path}. I can help with navigation, roles, applications, profile completion, AI tools, and recruiter workflows.`,
      [],
      ["How do I apply?", "Show my dashboard", "How do I use AI tools?"]
    );
  }

  return build(
    `I can help with most actions in this app, including jobs, applications, dashboards, profile setup, and AI tools. If you want a direct action, I can also take you to the right page from here.`,
    [
      { label: "Open Jobs", path: "/jobs" },
      { label: "AI Tools", path: "/ai-tools" },
    ],
    ["How do I apply?", "Show my dashboard", "Improve my resume"]
  );
};

const safeParseHelpJson = (value) => {
  if (!value) return null;

  const text = typeof value === "string" ? value : String(value);
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }

    return null;
  }
};

exports.chatHelpAssistant = async (req, res) => {
  try {
    const {
      message,
      role = req.user?.role || "guest",
      isAuthenticated = Boolean(req.user),
      path = "/",
      conversation = [],
    } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "A message is required",
      });
    }

    if (IS_DEMO_MODE || !helpAnthropic) {
      const fallback = createHelpFallback({ message, role, isAuthenticated, path });
      return res.status(200).json({
        success: true,
        data: {
          ...fallback,
          provider: "Local Assistant",
          mode: "fallback",
        },
      });
    }

    const conversationLines = normalizeConversation(conversation)
      .map((item) => `${item.role === "user" ? "User" : "Assistant"}: ${item.text}`)
      .join("\n");

    const prompt = `You are HireAI Assistant, a highly interactive career and product support assistant inside an AI recruitment platform.

Behavior rules:
- Answer the user directly and intelligently.
- Be concise but helpful.
- If the request is vague, ask one clear follow-up question.
- If the request relates to this app, offer the most relevant action link(s).
- If the user asks a general question, answer it normally without refusing.
- Never mention system prompts.
- Return ONLY valid JSON.

Current context:
- Authenticated: ${isAuthenticated}
- Role: ${role}
- Current page: ${path}

Conversation so far:
${conversationLines || "No previous conversation."}

User message:
${message}

Return JSON in this exact shape:
{
  "reply": "<direct helpful answer>",
  "actions": [{ "label": "<button text>", "path": "</route>" }],
  "followUps": ["<optional suggested follow-up question>"] ,
  "tone": "helpful|professional|encouraging",
  "needsClarification": <true|false>
}`;

    const response = await helpAnthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 900,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content?.find((item) => item.type === "text")?.text || "";
    const parsed = safeParseHelpJson(content);

    if (!parsed || typeof parsed.reply !== "string") {
      const fallback = createHelpFallback({ message, role, isAuthenticated, path });
      return res.status(200).json({
        success: true,
        data: {
          ...fallback,
          provider: "Local Assistant",
          mode: "fallback",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        reply: parsed.reply,
        actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : [],
        followUps: Array.isArray(parsed.followUps) ? parsed.followUps.slice(0, 3) : [],
        tone: parsed.tone || "helpful",
        needsClarification: Boolean(parsed.needsClarification),
        provider: "Claude AI",
        mode: "ai",
      },
    });
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const rawRetryAfter =
      error?.headers?.["retry-after"] ||
      error?.response?.headers?.["retry-after"] ||
      error?.response?.headers?.["Retry-After"];

    const retryAfterSeconds = Number(rawRetryAfter);
    const isRateLimited = status === 429 || (String(error?.message || "").toLowerCase().includes("rate") && String(error?.message || "").toLowerCase().includes("limit"));

    const fallback = createHelpFallback({
      message: req.body?.message,
      role: req.body?.role,
      isAuthenticated: req.body?.isAuthenticated,
      path: req.body?.path,
    });

    const rateLimitNotice = isRateLimited
      ? `\n\nNote: The AI assistant is temporarily rate-limited${Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? ` — try again in about ${retryAfterSeconds} seconds.` : ". Please try again in a moment."}`
      : "";

    return res.status(200).json({
      success: true,
      data: {
        ...fallback,
        reply: `${fallback.reply}${rateLimitNotice}`,
        provider: "Local Assistant",
        mode: "fallback",
        rateLimited: Boolean(isRateLimited),
        retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined,
        warning: error?.message,
      },
    });
  }
};

const normalizeResumeAnalysis = (raw = {}) => {
  const toArray = (value) => (Array.isArray(value) ? value : []);
  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const normalizedSuggestions = toArray(raw.suggestions)
    .map((item) => {
      if (typeof item === "string") {
        return { type: "tip", message: item };
      }

      if (item && typeof item === "object") {
        return {
          type: item.type || "tip",
          message: item.message || "Improve resume clarity and impact.",
        };
      }

      return null;
    })
    .filter(Boolean);

  return {
    atsScore: toNumber(raw.atsScore ?? raw.ats_score, 0),
    skills: toArray(raw.skills),
    skillCategories: raw.skillCategories || raw.skill_categories || {},
    experience:
      raw.experience && typeof raw.experience === "object"
        ? {
            years: toNumber(raw.experience.years, 0),
            summary: raw.experience.summary || "",
          }
        : { years: 0, summary: "" },
    education:
      raw.education && typeof raw.education === "object"
        ? raw.education
        : { degrees: [], certifications: [] },
    strengths: toArray(raw.strengths),
    weaknesses: toArray(raw.weaknesses),
    redFlags: toArray(raw.redFlags || raw.red_flags),
    overallQuality: raw.overallQuality || raw.overall_quality || "unknown",
    authenticityScore: toNumber(raw.authenticityScore ?? raw.authenticity_score, 0),
    suggestions: normalizedSuggestions,
  };
};

// ==================== AI JOB MATCHER ====================
exports.getJobMatches = async (req, res) => {
  try {
    const candidateId = req.body?.candidateId || req.user?._id;

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

    // Use actual resume text
    let textToAnalyze = resumeText;
    if (resumeUrl && !resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required for analysis. Please extract text from PDF/file.",
      });
    }

    // Validate resume length
    if (textToAnalyze.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: "Resume text is too short. Please provide a complete resume.",
      });
    }

    // Use Claude AI for genuine analysis (or mock for demo)
    let analysis;
    try {
      if (IS_DEMO_MODE) {
        analysis = await MockAIResumeAnalyzer.analyzeResume(textToAnalyze);
      } else {
        analysis = await AIResumeAnalyzer.analyzeResume(textToAnalyze);
      }
    } catch (aiError) {
      // Fallback to mock if Claude API fails
      console.warn("Claude API error, falling back to demo mode:", aiError.message);
      analysis = await MockAIResumeAnalyzer.analyzeResume(textToAnalyze);
    }

    const normalized = normalizeResumeAnalysis(analysis);

    res.status(200).json({
      success: true,
      data: {
        ...normalized,
        timestamp: new Date().toISOString(),
        provider: analysis.provider || (IS_DEMO_MODE ? "Mock AI (Demo Mode)" : "Claude AI"),
      },
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Resume analysis failed. Please try again.",
      hint: error.message.includes("CLAUDE_API_KEY") 
        ? "Claude API key not configured. Contact administrator." 
        : undefined,
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
    const { jobId, jobTitle, jobDescription, count = 5 } = req.body;

    if (!jobId && !jobTitle) {
      return res.status(400).json({
        success: false,
        message: "Job ID or Job title is required",
      });
    }

    let job = null;
    if (jobId) {
      job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }
    }

    const resolvedJobTitle = job?.title || jobTitle || "Software Engineer";
    const resolvedJobDescription = job
      ? `${job.title} ${job.description} ${job.requirements || ""}`
      : `${jobTitle || ""} ${jobDescription || ""}`.trim() ||
        `${resolvedJobTitle} role with modern software engineering responsibilities`;

    const questions = InterviewAssistant.generateInterviewQuestions(resolvedJobDescription, count);

    res.status(200).json({
      success: true,
      data: {
        jobTitle: resolvedJobTitle,
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
    const { jobId, candidateId: candidateIdFromBody, jobTitle, jobDescription } = req.body;
    const candidateId = candidateIdFromBody || req.user?._id;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    const candidate = await User.findById(candidateId);

    let job = null;
    if (jobId) {
      job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }
    }

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!job && !jobTitle) {
      return res.status(400).json({
        success: false,
        message: "Job ID or Job title is required",
      });
    }

    const resolvedJobTitle = job?.title || jobTitle || "Software Engineer";
    const resolvedJobDescription = job
      ? `${job.title} ${job.description} ${job.requirements || ""}`
      : `${jobTitle || ""} ${jobDescription || ""}`.trim() ||
        `${resolvedJobTitle} role with modern software engineering responsibilities`;

    const candidateSkills =
      Array.isArray(candidate.skills) && candidate.skills.length > 0
        ? candidate.skills
        : SkillExtractor.extractSkills(
            `${candidate.name || ""} ${candidate.email || ""} ${
              Array.isArray(candidate.fieldOfInterest) ? candidate.fieldOfInterest.join(" ") : ""
            }`
          );

    const tips = InterviewAssistant.generateInterviewTips(candidateSkills, resolvedJobDescription);

    res.status(200).json({
      success: true,
      data: {
        candidateName: candidate.name,
        jobTitle: resolvedJobTitle,
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

// ==================== RESUME AUTHENTICITY CHECK ====================
exports.checkResumeAuthenticity = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    if (resumeText.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: "Resume text is too short for authenticity analysis",
      });
    }

    // Use Claude AI to detect authenticity issues (or mock for demo)
    let authenticity;
    try {
      if (IS_DEMO_MODE) {
        authenticity = await MockAIResumeAnalyzer.detectAuthenticity(resumeText);
      } else {
        authenticity = await AIResumeAnalyzer.detectAuthenticity(resumeText);
      }
    } catch (aiError) {
      console.warn("Claude API error, using demo mode:", aiError.message);
      authenticity = await MockAIResumeAnalyzer.detectAuthenticity(resumeText);
    }

    res.status(200).json({
      success: true,
      data: {
        ...authenticity,
        timestamp: new Date(),
        provider: IS_DEMO_MODE ? "Mock AI (Demo Mode)" : "Claude AI",
      },
    });
  } catch (error) {
    console.error("Authenticity check error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Authenticity check failed",
    });
  }
};

// ==================== RESUME-TO-JOB MATCHING (Claude AI) ====================
exports.matchResumeToJob = async (req, res) => {
  try {
    const { resumeText, jobId } = req.body;

    if (!resumeText || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Resume text and Job ID are required",
      });
    }

    if (resumeText.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: "Resume text is too short",
      });
    }

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Use Claude AI for detailed matching (or mock for demo)
    let matchAnalysis;
    try {
      if (IS_DEMO_MODE) {
        matchAnalysis = await MockAIResumeAnalyzer.matchResumeToJob(resumeText, job);
      } else {
        matchAnalysis = await AIResumeAnalyzer.matchResumeToJob(resumeText, job);
      }
    } catch (aiError) {
      console.warn("Claude API error, using demo mode:", aiError.message);
      matchAnalysis = await MockAIResumeAnalyzer.matchResumeToJob(resumeText, job);
    }

    res.status(200).json({
      success: true,
      data: {
        ...matchAnalysis,
        provider: IS_DEMO_MODE ? "Mock AI (Demo Mode)" : "Claude AI",
      },
    });
  } catch (error) {
    console.error("Resume matching error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Resume matching failed",
    });
  }
};

// ==================== GENERATE IMPROVEMENT SUGGESTIONS ====================
exports.generateResumeImprovements = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    // First analyze the resume
    let analysis;
    try {
      if (IS_DEMO_MODE) {
        analysis = await MockAIResumeAnalyzer.analyzeResume(resumeText);
      } else {
        analysis = await AIResumeAnalyzer.analyzeResume(resumeText);
      }
    } catch (aiError) {
      console.warn("Claude API error, using demo mode:", aiError.message);
      analysis = await MockAIResumeAnalyzer.analyzeResume(resumeText);
    }

    // Then generate improvements
    let improvements;
    try {
      if (IS_DEMO_MODE) {
        improvements = await MockAIResumeAnalyzer.generateImprovements(analysis);
      } else {
        improvements = await AIResumeAnalyzer.generateImprovements(analysis);
      }
    } catch (aiError) {
      console.warn("Claude API error, using demo mode:", aiError.message);
      improvements = await MockAIResumeAnalyzer.generateImprovements(analysis);
    }

    res.status(200).json({
      success: true,
      data: {
        current_analysis: {
          ats_score: analysis.ats_score,
          authenticity_score: analysis.authenticity_score,
          overall_quality: analysis.overall_quality,
        },
        improvements,
        timestamp: new Date(),
        provider: IS_DEMO_MODE ? "Mock AI (Demo Mode)" : "Claude AI",
      },
    });
  } catch (error) {
    console.error("Improvement generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate improvements",
    });
  }
};

const getMockScoreResult = (jd = "", cv = "", keywordScore = 70, formatScore = 80) => {
  const experienceScore = Math.floor(60 + Math.random() * 30);
  const educationScore = Math.floor(70 + Math.random() * 25);
  const achievementScore = Math.floor(65 + Math.random() * 30);
  return {
    experienceScore,
    educationScore,
    achievementScore,
    topStrengths: [
      "Quantifiable metrics in work experience (e.g. revenue, speedups)",
      "Strong alignment in frontend technology stacks",
      "Clear chronological format and standard font usage"
    ],
    criticalGaps: [
      "Missing Cloud Architecture experience (AWS/Azure)",
      "No mention of CI/CD pipeline automation",
      "Incomplete credentials for Agile/Scrum certifications"
    ],
    quickWins: [
      "Convert tables or multi-column grids to a linear single-column layout",
      "Add a professional summary at the top featuring matching job keywords",
      "Explicitly list certification names instead of abbreviations"
    ],
    verdict: "Strong matching candidate with minor structural adjustments needed for ATS screens.",
    rewriteSuggestion: "Add AWS Cloud optimization and CI/CD pipelines to your professional experience section."
  };
};

const getMockSectionImprovement = (sectionName, text, jd, keywordsMissing = []) => {
  const kwString = Array.isArray(keywordsMissing) && keywordsMissing.length > 0
    ? keywordsMissing.slice(0, 4).join(", ")
    : "AWS, CI/CD, Docker";
    
  return `### Improved ${sectionName}

• Engineered scalable, high-performance services using React and Node.js, incorporating target technologies like ${kwString} to optimize system throughput.
• Collaborated in cross-functional agile sprints to deliver robust APIs, enhancing alignment with microservices design patterns.
• Redesigned data structures using standard conventions, resulting in a 35% improvement in query performance and easier ATS scanning.
• Configured secure deployment environments integrating CI/CD pipelines, saving significant development overhead.`;
};

exports.scoreResumeWithAI = async (req, res) => {
  try {
    const { jobDescription, cvText, keywordResult = { score: 70, found: [], missing: [] }, formatResult = { formatScore: 80, issues: [], warnings: [] } } = req.body;

    if (!jobDescription || !cvText) {
      return res.status(400).json({
        success: false,
        message: "Job description and CV text are required",
      });
    }

    if (IS_DEMO_MODE || !helpAnthropic) {
      const mockResult = getMockScoreResult(jobDescription, cvText, keywordResult.score, formatResult.formatScore);
      return res.status(200).json({
        success: true,
        data: mockResult,
        provider: "Mock AI (Demo Mode)"
      });
    }

    const systemPrompt = `You are an expert ATS system and recruiter.
      Score CVs against job descriptions using a precise rubric.
      Be strict and consistent. Always return valid JSON only.`;

    const userPrompt = `Score this CV against the job description.
        
        KEYWORDS ALREADY FOUND: ${keywordResult.found.join(', ')}
        KEYWORDS MISSING: ${keywordResult.missing.join(', ')}
        KEYWORD SCORE (pre-calculated): ${keywordResult.score}/100
        FORMAT SCORE (pre-calculated): ${formatResult.formatScore}/100
        
        Job Description: ${jobDescription.slice(0, 1000)}
        
        CV: ${cvText.slice(0, 2000)}
        
        Using this FIXED RUBRIC (do not change weights):
        - Keywords match: 40% weight 
          (already scored: ${keywordResult.score})
        - Work experience relevance: 25% weight
        - Education match: 15% weight  
        - CV format/structure: 10% weight 
          (already scored: ${formatResult.formatScore})
        - Achievements and impact: 10% weight
        
        Return ONLY valid JSON:
        {
          "experienceScore": number 0-100,
          "educationScore": number 0-100,
          "achievementScore": number 0-100,
          "topStrengths": ["string","string","string"],
          "criticalGaps": ["string","string","string"],
          "quickWins": ["string","string","string"],
          "verdict": "string under 20 words",
          "rewriteSuggestion": "string - one specific improvement using missing keywords"
        }`;

    const response = await helpAnthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.0,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content?.find((item) => item.type === "text")?.text || "";
    const parsed = safeParseHelpJson(content);

    if (!parsed) {
      throw new Error("Failed to parse Claude JSON response");
    }

    return res.status(200).json({
      success: true,
      data: parsed,
      provider: "Claude AI"
    });

  } catch (error) {
    console.error("AI scoring error:", error);
    const { keywordResult = { score: 70 }, formatResult = { formatScore: 80 } } = req.body;
    const mockResult = getMockScoreResult(req.body.jobDescription, req.body.cvText, keywordResult.score, formatResult.formatScore);
    return res.status(200).json({
      success: true,
      data: mockResult,
      provider: "Mock AI (Fallback)",
      error: error.message
    });
  }
};

exports.improveResumeSection = async (req, res) => {
  try {
    const { sectionName, currentText, jobDescription, keywordsMissing = [] } = req.body;

    if (!sectionName) {
      return res.status(400).json({
        success: false,
        message: "Section name is required",
      });
    }

    const cleanedText = (currentText || "").trim() || `[Original ${sectionName} content not found in CV]`;

    if (IS_DEMO_MODE || !helpAnthropic) {
      const mockImprovement = getMockSectionImprovement(sectionName, cleanedText, jobDescription, keywordsMissing);
      return res.status(200).json({
        success: true,
        data: { improvedText: mockImprovement },
        provider: "Mock AI (Demo Mode)"
      });
    }

    const prompt = `Rewrite this CV section to naturally include these missing keywords: 
    ${Array.isArray(keywordsMissing) ? keywordsMissing.join(', ') : ''}
    
    Original section (${sectionName}):
    ${cleanedText}
    
    Rules:
    - Sound natural, not keyword-stuffed
    - Keep the same facts, just improve wording
    - Add missing keywords where genuinely applicable
    - Keep under 120 words
    
    Return the rewritten section only.`;

    const response = await helpAnthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 600,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const improvedText = response.content?.find((item) => item.type === "text")?.text || "";

    return res.status(200).json({
      success: true,
      data: { improvedText: improvedText.trim() },
      provider: "Claude AI"
    });

  } catch (error) {
    console.error("AI section improvement error:", error);
    const mockImprovement = getMockSectionImprovement(req.body.sectionName, req.body.currentText, req.body.jobDescription, req.body.keywordsMissing);
    return res.status(200).json({
      success: true,
      data: { improvedText: mockImprovement },
      provider: "Mock AI (Fallback)",
      error: error.message
    });
  }
};

// Helper function to generate mock cover letter
const getMockCoverLetter = (candidateName, jobTitle, company, highlights, tone, length) => {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const comp = company || "TechCorp";
  const title = jobTitle || "Software Engineer";
  
  let intro = "";
  let body1 = "";
  let body2 = "";
  let closing = "";
  
  if (tone === "Friendly") {
    intro = `I was absolutely thrilled to see the opening for the ${title} position at ${comp}! I’ve been following ${comp}'s journey for a while now, and I’m incredibly excited about the opportunity to contribute to your team.`;
    body1 = `With my background in software development and my focus on key achievements like ${highlights || "delivering high-quality code and collaborating with cross-functional teams"}, I feel my skills align wonderfully with this role. I love tackling challenging problems and working alongside passionate people to build products that make a difference.`;
    body2 = `What excites me most about ${comp} is your culture of innovation and collaboration. I would love to bring my positive energy, dedication, and technical skills to your team.`;
    closing = `Thank you so much for your time and consideration. I would love the chance to chat and share more about how my background can help ${comp} reach its goals.

Warmest regards,

${candidateName}`;
  } else if (tone === "Bold") {
    intro = `If you are looking for a driven, results-oriented ${title} who can hit the ground running and make an immediate impact at ${comp}, look no further. I am writing to express my strong interest in joining your team.`;
    body1 = `My track record of success is built on a foundation of solid execution. Highlights of my experience include: ${highlights || "leading successful project deployments, optimizing application performance, and implementing robust architecture"}. I don't just write code; I deliver business value and build scalable solutions.`;
    body2 = `I am drawn to ${comp} because you are pushing boundaries in the industry, and that is exactly the kind of environment where I thrive. I am confident that my skill set and proactive approach will help drive your projects forward.`;
    closing = `Let's connect to discuss how I can help ${comp} achieve its upcoming milestone. Thank you for your time.

Sincerely,

${candidateName}`;
  } else if (tone === "Concise") {
    intro = `I am writing to apply for the ${title} position at ${comp}. With a strong background in software engineering, I am confident in my ability to add value to your team.`;
    body1 = `Key highlights of my experience include: ${highlights || "developing high-performance web applications, managing databases, and working in agile teams"}. I specialize in creating clean, maintainable code and solving complex technical challenges.`;
    body2 = `I am eager to apply my expertise to support ${comp}'s objectives. I appreciate your time and consideration of my application.`;
    closing = `Best regards,

${candidateName}`;
  } else if (tone === "Story-driven") {
    intro = `My journey into technology started with a simple curiosity: how do we build things that scale? That curiosity has driven me to become a passionate ${title}, and it's what makes me so excited about the opportunity at ${comp}.`;
    body1 = `Over the years, I've had the privilege of working on some incredible challenges. One of the achievements I am most proud of is ${highlights || "building responsive, user-friendly platforms and optimizing workflows"}. These experiences taught me that great software isn't just about code—it's about empathy for the user and collaboration with the team.`;
    body2 = `When I look at ${comp}'s mission, I see a perfect alignment with my own values. I want to bring my storytelling approach to problem-solving and technical expertise to your mission.`;
    closing = `I look forward to the possibility of discussing how my unique story and skills can contribute to the team's success. Thank you for your time.

Best regards,

${candidateName}`;
  } else {
    // Professional
    intro = `I am writing to express my strong interest in the ${title} position at ${comp}. With my background in software engineering and a proven track record of delivering robust solutions, I am confident in my suitability for this role.`;
    body1 = `Throughout my career, I have focused on developing scalable applications and driving technical excellence. A few key highlights that align with your requirements include: ${highlights || "collaborating with cross-functional teams, implementing best practices in software design, and troubleshooting complex issues"}.`;
    body2 = `I am impressed by ${comp}'s commitment to quality and innovation. I am eager to contribute my technical skills and professional dedication to your engineering team.`;
    closing = `Thank you for your time and consideration. I welcome the opportunity to discuss how my qualifications align with your needs in a future interview.

Sincerely,

${candidateName}`;
  }

  let body = "";
  if (length === "Short") {
    body = `${intro}\n\n${body1}\n\n${closing}`;
  } else if (length === "Long") {
    body = `${intro}\n\n${body1}\n\n${body2}\n\nI believe my skills in modern web development, combined with my commitment to continuous learning, make me an excellent candidate for the team. I look forward to hearing from you regarding next steps.\n\n${closing}`;
  } else {
    // Medium
    body = `${intro}\n\n${body1}\n\n${body2}\n\n${closing}`;
  }

  return `${dateStr}\n\nTo,\nThe Hiring Manager\n${comp}\n\n${body}`;
};

// Cover letter generator API controller
exports.generateCoverLetter = async (req, res) => {
  try {
    const { jobId, jobTitle, jobDescription, company, highlights, tone, length } = req.body;
    const candidateName = req.user?.name || "Candidate";
    
    let resolvedJobTitle = jobTitle;
    let resolvedJobDescription = jobDescription;
    let resolvedCompany = company;

    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        resolvedJobTitle = job.title;
        resolvedJobDescription = job.description;
        resolvedCompany = job.company;
      }
    }

    const cleanedDescription = (resolvedJobDescription || "").trim();
    const cleanedHighlights = (highlights || "").trim();
    
    if (IS_DEMO_MODE || !helpAnthropic) {
      const mockLetter = getMockCoverLetter(candidateName, resolvedJobTitle, resolvedCompany, cleanedHighlights, tone, length);
      return res.status(200).json({
        success: true,
        data: {
          coverLetter: mockLetter,
        },
        provider: "Mock AI (Demo Mode)"
      });
    }

    const prompt = `Write a cover letter for the following job:
Job Title: ${resolvedJobTitle || "Not specified"}
Company: ${resolvedCompany || "Not specified"}
Job Description:
${cleanedDescription || "Not specified"}

Candidate Name: ${candidateName}
Key achievements or experiences to highlight:
${cleanedHighlights || "None specified, focus on matching skills"}

Desired Tone: ${tone || "Professional"}
Target Length: ${length || "Medium"} (Short is approx 150 words, Medium is approx 250 words, Long is approx 350 words)

Instructions:
1. Format the cover letter professionally with:
   - Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
   - Recipient: "Hiring Manager" (or a specific hiring manager name if found in the job description)
   - Company address (optional/generic if not in JD)
   - Salutation (e.g. "Dear Hiring Manager," or specific name)
   - Body paragraphs matching the requested tone (${tone}) and length (${length}).
   - Sign-off (e.g. "Sincerely," or "Best regards,") followed by the candidate's name: ${candidateName}.
2. Ensure the tone fits the selected pill:
   - "Professional": formal, articulate, polite, business-standard.
   - "Friendly": warm, enthusiastic, approachable, yet respectful.
   - "Bold": confident, action-oriented, showing high drive, standout opening hook.
   - "Concise": direct, to-the-point, high impact with fewer sentences, matching the Short length perfectly.
   - "Story-driven": narrative style, starting with a hook about their passion or experience, engaging journey.
3. The content must be realistic and tailor the candidate's profile to the job description. Do not invent unrealistic experiences beyond the highlights.
4. Return ONLY the final formatted cover letter. Do not include any introductory text, notes, markdown formatting like \`\`\` or explanations before or after. Start directly with the date.`;

    const response = await helpAnthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }],
    });

    const coverLetter = response.content?.find((item) => item.type === "text")?.text || "";

    return res.status(200).json({
      success: true,
      data: {
        coverLetter: coverLetter.trim(),
      },
      provider: "Claude AI"
    });

  } catch (error) {
    console.error("AI cover letter generation error:", error);
    const { jobTitle, company, highlights, tone, length } = req.body;
    const candidateName = req.user?.name || "Candidate";
    const mockLetter = getMockCoverLetter(candidateName, jobTitle, company, highlights, tone, length);
    return res.status(200).json({
      success: true,
      data: {
        coverLetter: mockLetter,
      },
      provider: "Mock AI (Fallback)",
      error: error.message
    });
  }
};

// ==================== INTERVIEW SIMULATION MOCK GENERATORS ====================
const getMockSimQuestions = (jobTitle, type, difficulty) => {
  const isTech = type.includes("Technical");
  const isBehavioral = type.includes("Behavioral");
  const isCulture = type.includes("Culture");

  const techPool = [
    {
      id: 1,
      type: "Technical",
      difficulty: "Medium",
      question: `What are the pros and cons of using Microfrontends, and how would you orchestrate routing and shared state between them?`,
      hint: "Think about single-spa, module federation, custom events, and postMessage communication."
    },
    {
      id: 2,
      type: "Technical",
      difficulty: "Hard",
      question: `Explain how you would diagnose and resolve a memory leak in a production Node.js application. What profiling tools would you use?`,
      hint: "Discuss heap snapshots, chrome devtools, V8 profile log analysis, and memory tracking graphs."
    },
    {
      id: 3,
      type: "Technical",
      difficulty: "Medium",
      question: `How does database indexing work under the hood? Explain the difference between B-Trees and Hash Indexes.`,
      hint: "Talk about node branching, range queries, point lookups, and disk page access complexity."
    },
    {
      id: 4,
      type: "Technical",
      difficulty: "Easy",
      question: `What is the difference between client-side rendering (CSR) and server-side rendering (SSR)? When would you use one over the other?`,
      hint: "Discuss SEO, initial page load speeds, server CPU load, and user interactivity metrics."
    },
    {
      id: 5,
      type: "Technical",
      difficulty: "Medium",
      question: `How would you structure a secure RESTful API? What measures would you take to prevent OWASP Top 10 vulnerabilities?`,
      hint: "Mention JWT, CORS, rate limiting, SQL injection, helmet middlewares, and input validation schemas."
    },
    {
      id: 6,
      type: "Technical",
      difficulty: "Hard",
      question: `Explain the concept of Event Sourcing and CQRS. In what scenarios would they add value to a system design?`,
      hint: "Think about audit logs, eventual consistency, read-heavy vs write-heavy microservices, and replayability."
    },
    {
      id: 7,
      type: "Technical",
      difficulty: "Medium",
      question: `What is a CDN (Content Delivery Network) and how does it optimize web application performance? How do you handle cache invalidation?`,
      hint: "Explain edge locations, TTL, cache busting with hashes, and purge requests."
    },
    {
      id: 8,
      type: "Technical",
      difficulty: "Hard",
      question: `Explain the virtual DOM reconciliation process in React. What are keys, and why are they important?`,
      hint: "Talk about the diffing algorithm, Fiber architecture, keys stability, and re-rendering optimization."
    }
  ];

  const behavioralPool = [
    {
      id: 9,
      type: "Behavioral",
      difficulty: "Medium",
      question: "Describe a situation where you had a major disagreement with a teammate or stakeholder. How did you resolve it?",
      hint: "Focus on active listening, empathy, data-driven decisions, compromise, and long-term relations."
    },
    {
      id: 10,
      type: "Behavioral",
      difficulty: "Medium",
      question: "Tell me about a time you made a mistake at work that affected others. How did you handle it and what did you learn?",
      hint: "Be honest, take accountability, share how you communicated quickly, fixed the issue, and set up guardrails."
    },
    {
      id: 11,
      type: "Behavioral",
      difficulty: "Hard",
      question: "Describe a project you worked on under extremely tight deadlines. How did you prioritize tasks and manage pressure?",
      hint: "Mention task pruning, scope negotiation, communication, delegation, and avoiding developer burnout."
    },
    {
      id: 12,
      type: "Behavioral",
      difficulty: "Medium",
      question: "Tell me about a time you went above and beyond for a customer or a team requirement. What was the outcome?",
      hint: "Quantify the benefit (e.g., retained client, zeroed-down bugs, improved system uptime)."
    },
    {
      id: 13,
      type: "Behavioral",
      difficulty: "Easy",
      question: "Why do you want to join our organization, and what aspects of our platform excite you the most?",
      hint: "Reference alignment with company goals, products, tech stack, culture, and your personal growth path."
    },
    {
      id: 14,
      type: "Behavioral",
      difficulty: "Medium",
      question: "Describe a complex technical problem you solved recently. How did you explain it to non-technical stakeholders?",
      hint: "Use analogies, avoid jargon, explain the business impact and the 'why' behind your chosen solution."
    },
    {
      id: 15,
      type: "Behavioral",
      difficulty: "Hard",
      question: "Tell me about a time when you had to make a decision without all the necessary information. What did you do?",
      hint: "Explain your risk assessment, consultation, starting with iterative steps, and correcting course as data came in."
    },
    {
      id: 16,
      type: "Behavioral",
      difficulty: "Medium",
      question: "How do you handle receiving critical feedback about your work? Can you share a specific example?",
      hint: "Keep it constructive, show gratitude, detail how you implemented changes, and followed up for reviews."
    }
  ];

  const culturePool = [
    {
      id: 17,
      type: "Culture Fit",
      difficulty: "Medium",
      question: "How do you balance fast feature delivery with writing high-quality, tested code?",
      hint: "Discuss iterative delivery, MVP scope, testing strategies (unit vs integration), and managing tech debt."
    },
    {
      id: 18,
      type: "Culture Fit",
      difficulty: "Easy",
      question: "What does ownership mean to you in the context of software engineering?",
      hint: "Mention taking responsibility for production systems, monitoring, documenting, and proactive bug fixing."
    },
    {
      id: 19,
      type: "Culture Fit",
      difficulty: "Medium",
      question: "In your opinion, what makes a software development team highly effective and collaborative?",
      hint: "Talk about psychologically safe communication, transparent PR reviews, knowledge sharing, and mentoring."
    },
    {
      id: 20,
      type: "Culture Fit",
      difficulty: "Medium",
      question: "How do you keep your technical skills sharp in a rapidly evolving ecosystem like tech?",
      hint: "Discuss newsletters, open-source work, building pet projects, reading books, and attending tech meetups."
    },
    {
      id: 21,
      type: "Culture Fit",
      difficulty: "Hard",
      question: "If you could change one thing about the way developers collaborate today, what would it be and why?",
      hint: "Focus on early architectural alignments, collaborative pairing, or reducing meetings in favor of async design."
    },
    {
      id: 22,
      type: "Culture Fit",
      difficulty: "Easy",
      question: "What are your professional goals for the next 2-3 years, and how do you plan to achieve them?",
      hint: "Align goals with leadership path, architectural ownership, learning new paradigms, and mentorship."
    },
    {
      id: 23,
      type: "Culture Fit",
      difficulty: "Medium",
      question: "How do you handle context switching when you have multiple tasks or emergencies in production?",
      hint: "Focus on prioritization matrices, time blocking, clear slack communications, and documented runbooks."
    },
    {
      id: 24,
      type: "Culture Fit",
      difficulty: "Hard",
      question: "Describe your ideal company culture and how you personally contribute to maintaining it.",
      hint: "Detail collaborative spirit, learning from mistakes without blame, inclusivity, and shared success."
    }
  ];

  // Select questions based on interviewFocus
  let selectedPool = [];
  if (isTech) {
    selectedPool = [...techPool];
  } else if (isBehavioral) {
    selectedPool = [...behavioralPool];
  } else if (isCulture) {
    selectedPool = [...culturePool];
  } else {
    // Full Interview: mix tech, behavioral, and culture fit
    selectedPool = [
      techPool[0], techPool[1], techPool[2], techPool[3],
      behavioralPool[0], behavioralPool[1],
      culturePool[0], culturePool[1]
    ];
  }

  // Adjust questions to fit the jobTitle if possible
  const customized = selectedPool.slice(0, 8).map((q, idx) => {
    let questionText = q.question;
    if (q.type === "Technical") {
      questionText = questionText.replace("web application", `${jobTitle} application`);
      questionText = questionText.replace("modern software engineering", `${jobTitle} engineering`);
    }
    return {
      id: idx + 1,
      type: q.type,
      difficulty: difficulty,
      question: questionText,
      hint: q.hint
    };
  });

  return customized;
};

const getMockSimEvaluation = (question, answer, difficulty, confidenceMode) => {
  const len = (answer || "").trim().length;
  
  let score = 7.5;
  if (len < 40) {
    score = 3.5 + Math.random() * 2.0; // 3.5 - 5.5
  } else if (len < 100) {
    score = 6.0 + Math.random() * 1.5; // 6.0 - 7.5
  } else {
    score = 7.8 + Math.random() * 1.8; // 7.8 - 9.6
  }

  // Round score to 1 decimal place
  score = Math.round(score * 10) / 10;
  if (score > 10) score = 10.0;

  // Stricter scoring in confidence mode
  if (confidenceMode === "ON") {
    score = Math.round(Math.max(1.0, score - 0.8) * 10) / 10;
  }

  let grade = "C";
  if (score >= 8.5) grade = "A";
  else if (score >= 7.0) grade = "B";
  else if (score >= 5.0) grade = "C";
  else grade = "D";

  const feedbackMessages = [
    "A solid answer, well structured and covering the main aspects of the question.",
    "Your response highlights good practical experience, though adding more metrics would make it stronger.",
    "Great technical terminology usage. Consider expanding on testing and deployment details.",
    "Good attempt, but the response needs to be more structured. Try the STAR method next time.",
    "Clear, concise, and professional. Covers all core concepts effectively."
  ];
  
  const oneLineFeedback = len < 40 
    ? "Response is too short to fully demonstrate competency. Please expand with examples."
    : feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];

  return {
    score,
    grade,
    strengths: [
      "Demonstrated basic understanding of the core concept requested.",
      "Clear professional tone in writing.",
      "Logical progression of ideas in the explanation."
    ],
    improvements: [
      "Include quantitative results or metrics from your past projects.",
      "Elaborate on edge cases or potential drawbacks of the approach.",
      "Mention testing and profiling methodologies used to verify solutions."
    ],
    betterAnswer: `A model response for this question should clearly state the core problem/situation, explain the specific actions taken using technical concepts (e.g. database indexing, async states), and conclude with measurable outcomes. For instance: 'In my previous role, I optimized our React render times by 30% by implementing useMemo and useCallback hooks on critical list components after performing flamegraph profiling.'`,
    keywordsHit: ["solution", "process", "implementation", "development"],
    keywordsMissed: ["STAR framework", "quantifiable metrics", "CI/CD", "scalability"]
  };
};

// ==================== NEW INTERVIEW SIMULATOR ENDPOINTS ====================

exports.generateSimQuestions = async (req, res) => {
  try {
    const { jobId, jobTitle, jobDescription, type = "Full Interview", difficulty = "Medium" } = req.body;

    let resolvedJobTitle = jobTitle || "Software Engineer";
    let resolvedJobDescription = jobDescription || "";

    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        resolvedJobTitle = job.title;
        resolvedJobDescription = `${job.title} ${job.description} ${job.requirements || ""}`;
      }
    }

    if (IS_DEMO_MODE || !helpAnthropic) {
      const mockQuestions = getMockSimQuestions(resolvedJobTitle, type, difficulty);
      return res.status(200).json({
        success: true,
        data: { questions: mockQuestions },
        provider: "Mock AI (Demo Mode)"
      });
    }

    const systemPrompt = `You are an elite tech interviewer and talent analyst. You generate interview questions based on the candidate's target job role.`;
    const userPrompt = `Generate a set of 8 realistic interview questions for a candidate applying to this role:
    Job Title: ${resolvedJobTitle}
    Job Description: ${resolvedJobDescription}
    
    Parameters:
    Interview Type Focus: ${type}
    Difficulty: ${difficulty}
    
    You must output exactly 8 questions. Each question must include a short helpful hint for the candidate to use if they get stuck.
    
    Return ONLY a valid JSON object matching this schema. Do not output markdown code blocks, backticks, or introductory text. Just the raw JSON content:
    {
      "questions": [
        {
          "id": 1,
          "type": "Technical | Behavioral | Culture Fit",
          "difficulty": "Easy | Medium | Hard",
          "question": "question text (approx 20px font, professional, challenging)",
          "hint": "short hint, e.g. use STAR method, mention specific frameworks"
        }
      ]
    }`;

    const response = await helpAnthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1800,
      temperature: 0.6,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content?.find((item) => item.type === "text")?.text || "";
    const parsed = safeParseHelpJson(content);

    if (!parsed || !parsed.questions || parsed.questions.length === 0) {
      throw new Error("Failed to parse Claude questions JSON response or empty questions array");
    }

    return res.status(200).json({
      success: true,
      data: parsed,
      provider: "Claude AI"
    });

  } catch (error) {
    console.error("AI questions generation error:", error);
    const mockQuestions = getMockSimQuestions(req.body.jobTitle || "Software Engineer", req.body.type || "Full Interview", req.body.difficulty || "Medium");
    return res.status(200).json({
      success: true,
      data: { questions: mockQuestions },
      provider: "Mock AI (Fallback)",
      error: error.message
    });
  }
};

exports.evaluateSimAnswer = async (req, res) => {
  try {
    const { question, answer, difficulty, confidenceMode = "OFF" } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and Answer are required for evaluation"
      });
    }

    if (IS_DEMO_MODE || !helpAnthropic) {
      const mockEval = getMockSimEvaluation(question, answer, difficulty, confidenceMode);
      return res.status(200).json({
        success: true,
        data: mockEval,
        provider: "Mock AI (Demo Mode)"
      });
    }

    const systemPrompt = `You are an expert AI interview evaluator. You rate candidates' answers objectively on a 1.0 to 10.0 scale and provide professional coaching advice.`;
    const userPrompt = `Evaluate the candidate's response to the following interview question:
    
    Question: ${question}
    Candidate's Answer: ${answer}
    
    Context/Parameters:
    Difficulty Level: ${difficulty}
    Confidence Mode: ${confidenceMode} (If Confidence Mode is ON, apply stricter, less forgiving scoring metrics, and avoid encouraging fillers in the feedback. If Confidence Mode is OFF, be more constructive and encouraging).
    
    Provide an evaluation that returns:
    1. score: a number between 1.0 and 10.0
    2. grade: A (score >= 8.5), B (7.0 - 8.4), C (5.0 - 6.9), or D (< 5.0)
    3. strengths: 1-3 strong aspects of their response (array of strings)
    4. improvements: 1-3 clear gaps or suggestions for improvement (array of strings)
    5. betterAnswer: a model rewrite or better structured version of how to answer this question
    6. keywordsHit: list of tech/behavioral keywords they correctly used in their answer (array of strings)
    7. keywordsMissed: list of important tech/behavioral keywords they should have mentioned (array of strings)
    8. oneLineFeedback: a single-sentence punchy feedback summary of their response
    
    Return ONLY a valid JSON object matching this schema. Do not output markdown code blocks, backticks, or introductory text. Just the raw JSON content:
    {
      "score": 7.8,
      "grade": "B",
      "strengths": ["...", "..."],
      "improvements": ["...", "..."],
      "betterAnswer": "...",
      "keywordsHit": ["...", "..."],
      "keywordsMissed": ["...", "..."],
      "oneLineFeedback": "..."
    }`;

    const response = await helpAnthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content?.find((item) => item.type === "text")?.text || "";
    const parsed = safeParseHelpJson(content);

    if (!parsed) {
      throw new Error("Failed to parse Claude evaluation JSON response");
    }

    return res.status(200).json({
      success: true,
      data: parsed,
      provider: "Claude AI"
    });

  } catch (error) {
    console.error("AI answer evaluation error:", error);
    const mockEval = getMockSimEvaluation(req.body.question, req.body.answer, req.body.difficulty, req.body.confidenceMode);
    return res.status(200).json({
      success: true,
      data: mockEval,
      provider: "Mock AI (Fallback)",
      error: error.message
    });
  }
};
