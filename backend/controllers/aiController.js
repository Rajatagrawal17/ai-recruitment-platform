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
