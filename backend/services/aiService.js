const Job = require("../models/Job");
const User = require("../models/User");

// ==================== SKILL EXTRACTION ====================
class SkillExtractor {
  static COMMON_SKILLS = {
    programming: ["javascript", "python", "java", "c++", "c#", "php", "ruby", "go", "rust", "typescript", "node.js", "react", "angular", "vue", "express", "django", "flask", "spring", "laravel"],
    databases: ["mongodb", "mysql", "postgresql", "sql", "oracle", "redis", "elasticsearch", "dynamodb", "cassandra", "firebase"],
    cloud: ["aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform", "jenkins"],
    tools: ["git", "linux", "unix", "windows", "macos", "vs code", "jira", "confluence", "slack"],
    methodologies: ["agile", "scrum", "kanban", "devops", "microservices", "rest", "graphql", "api design"],
    soft_skills: ["communication", "leadership", "teamwork", "problem solving", "critical thinking", "time management"],
  };

  static extractSkills(text) {
    if (!text) return [];
    const lowerText = text.toLowerCase();
    const skills = new Set();

    Object.values(this.COMMON_SKILLS).forEach((skillList) => {
      skillList.forEach((skill) => {
        if (lowerText.includes(skill)) {
          skills.add(skill);
        }
      });
    });

    return Array.from(skills);
  }

  static categorizeSkills(skills) {
    const categories = {};

    Object.keys(this.COMMON_SKILLS).forEach((category) => {
      categories[category] = skills.filter((skill) =>
        this.COMMON_SKILLS[category].includes(skill)
      );
    });

    return categories;
  }
}

// ==================== JOB MATCHER ====================
class JobMatcher {
  static calculateMatchScore(candidateSkills, jobSkills, jobDescription) {
    if (!candidateSkills?.length || !jobSkills?.length) return 0;

    // Skill match percentage
    const matchedSkills = candidateSkills.filter((skill) =>
      jobSkills.includes(skill)
    );
    const skillMatchRatio = matchedSkills.length / jobSkills.length;

    // Required skills match (weighted higher)
    const requiredSkills = this.extractRequiredSkills(jobDescription);
    const requiredMatches = requiredSkills.filter((skill) =>
      candidateSkills.includes(skill)
    );
    const requiredMatchRatio = requiredSkills.length > 0 ? requiredMatches.length / requiredSkills.length : 0;

    // Final score (70% required skills, 30% additional skills)
    const score = (requiredMatchRatio * 0.7 + skillMatchRatio * 0.3) * 100;
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  static extractRequiredSkills(jobDescription) {
    const requiredText = jobDescription.match(/required.*?skills(.*?)(?:\.|$)/i)?.[1] || "";
    return SkillExtractor.extractSkills(requiredText || jobDescription);
  }

  static async matchCandidateWithJobs(candidateId) {
    try {
      const candidate = await User.findById(candidateId);
      if (!candidate) return [];

      // Extract candidate skills from profile + resume-derived fields
      const storedSkills = Array.isArray(candidate.skills)
        ? candidate.skills.map((skill) => String(skill).toLowerCase())
        : [];
      const extractedSkills = SkillExtractor.extractSkills(
        `${candidate.name || ""} ${candidate.email || ""} ${
          Array.isArray(candidate.fieldOfInterest) ? candidate.fieldOfInterest.join(" ") : ""
        } ${storedSkills.join(" ")}`
      );
      const profileSkills = Array.from(new Set([...storedSkills, ...extractedSkills]));

      // Get all active jobs
      const jobs = await Job.find({
        $or: [{ status: "open" }, { status: "active" }, { status: { $exists: false } }],
      }).lean();

      // Calculate match score for each job
      const matchedJobs = jobs.map((job) => {
        const jobSkills = SkillExtractor.extractSkills(
          `${job.title} ${job.description} ${job.requirements || ""}`
        );

        const score = this.calculateMatchScore(
          profileSkills,
          jobSkills,
          job.description
        );

        return {
          ...job,
          matchScore: score,
          matchedSkills: profileSkills.filter((s) => jobSkills.includes(s)),
          missingSkills: jobSkills.filter((s) => !profileSkills.includes(s)),
        };
      });

      // Sort by match score (highest first)
      return matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error("Error in matchCandidateWithJobs:", error);
      return [];
    }
  }
}

// ==================== RESUME ANALYZER ====================
class ResumeAnalyzer {
  static analyzeResumeText(text) {
    if (!text) return {};

    const skills = SkillExtractor.extractSkills(text);
    const experience = this.extractExperience(text);
    const education = this.extractEducation(text);
    const atsScore = this.calculateATSScore(text, skills);

    return {
      skills,
      skillCategories: SkillExtractor.categorizeSkills(skills),
      experience,
      education,
      atsScore,
      suggestions: this.generateSuggestions(skills, experience, atsScore),
    };
  }

  static extractExperience(text) {
    const experiencePatterns = [
      /(\d+)\s*(?:years?|yrs?)\s+(?:of\s+)?experience/gi,
      /(?:experience|worked|employed).*?(\d+)\s*(?:years?|yrs?)/gi,
    ];

    let years = 0;
    experiencePatterns.forEach((pattern) => {
      const match = text.match(pattern);
      if (match) {
        const extracted = parseInt(match[1]) || 0;
        years = Math.max(years, extracted);
      }
    });

    return { years: Math.min(years, 50) }; // Cap at 50 years
  }

  static extractEducation(text) {
    const degrees = [];
    const degreePatterns = [
      /(?:bachelor|bsc|b\.s\.)/gi,
      /(?:master|msc|m\.s\.)/gi,
      /(?:phd|doctorate)/gi,
      /(?:diploma)/gi,
    ];

    degreePatterns.forEach((pattern) => {
      if (pattern.test(text)) {
        degrees.push(pattern.source.replace(/[()]/g, "").trim());
      }
    });

    return { degrees };
  }

  static calculateATSScore(text, skills) {
    let score = 0;

    // Text length (max 20 points)
    const wordCount = text.split(/\s+/).length;
    score += Math.min(20, wordCount / 10);

    // Skills (max 30 points)
    score += Math.min(30, skills.length * 3);

    // Keywords presence (max 20 points)
    const keywords = ["experience", "education", "skills", "project", "achievement"];
    const keywordMatches = keywords.filter((k) =>
      text.toLowerCase().includes(k)
    );
    score += (keywordMatches.length / keywords.length) * 20;

    // Formatting (max 30 points)
    const lines = text.split("\n");
    const hasStructure = lines.length > 5;
    if (hasStructure) score += 30;

    return Math.min(100, Math.round(score));
  }

  static generateSuggestions(skills, experience, atsScore) {
    const suggestions = [];

    if (skills.length < 5) {
      suggestions.push({
        type: "warning",
        message: "Add more technical skills to improve visibility",
      });
    }

    if (experience.years < 1) {
      suggestions.push({
        type: "info",
        message: "Consider adding your projects or internships",
      });
    }

    if (atsScore < 60) {
      suggestions.push({
        type: "warning",
        message: "Improve resume formatting for better ATS scanning",
      });
    }

    if (!skills.some((s) => ["python", "javascript", "java"].includes(s))) {
      suggestions.push({
        type: "tip",
        message: "In-demand skills like Python, JavaScript can improve your profile",
      });
    }

    return suggestions;
  }
}

// ==================== RECOMMENDATION ENGINE ====================
class RecommendationEngine {
  static async getRecommendedJobs(candidateId, limit = 5) {
    try {
      const matchedJobs = await JobMatcher.matchCandidateWithJobs(candidateId);
      
      // Filter jobs with match score >= 60%
      const recommendedJobs = matchedJobs
        .filter((job) => job.matchScore >= 60)
        .slice(0, limit);

      return recommendedJobs.map((job) => ({
        _id: job._id,
        title: job.title,
        company: job.company,
        matchScore: job.matchScore,
        matchedSkills: job.matchedSkills,
        missingSkills: job.missingSkills,
        reason: `${job.matchScore}% match based on your skills`,
      }));
    } catch (error) {
      console.error("Error in getRecommendedJobs:", error);
      return [];
    }
  }

  static calculateSalaryRange(jobTitle, location, experience, skills) {
    // Base salary by title
    const titleMultiplier = {
      junior: 0.8,
      senior: 1.3,
      lead: 1.5,
      manager: 1.6,
      director: 1.8,
    };

    // Experience multiplier
    const experienceMultiplier = Math.min(2.0, 0.9 + experience.years * 0.15);

    // Skills multiplier
    const inDemandSkills = ["ai", "ml", "kubernetes", "golang", "rust"];
    const skillMultiplier = skills.some((s) =>
      inDemandSkills.some((d) => s.toLowerCase().includes(d))
    )
      ? 1.2
      : 1.0;

    // Base salary (in LPA - adjust for your market)
    let baseSalary = 12; // Default 12 LPA

    // Apply multipliers
    const finalSalary = baseSalary * experienceMultiplier * skillMultiplier;

    return {
      min: Math.round(finalSalary * 0.85),
      max: Math.round(finalSalary * 1.15),
      current: Math.round(finalSalary),
      currency: "LPA",
    };
  }
}

// ==================== INTERVIEW ASSISTANT ====================
class InterviewAssistant {
  static generateInterviewQuestions(jobDescription, count = 5) {
    const keywords = SkillExtractor.extractSkills(jobDescription);
    const questions = [];

    // Technical questions
    keywords.slice(0, 2).forEach((skill) => {
      questions.push({
        type: "technical",
        question: `Tell us about your experience with ${skill}. What's your most complex project using ${skill}?`,
        skill,
      });
    });

    // Behavioral questions
    const behavioralQuestions = [
      "Describe a time you overcame a technical challenge. What was your approach?",
      "How do you stay updated with new technologies?",
      "Tell us about a project you're proud of. What was your role?",
      "How do you handle working in a fast-paced environment?",
      "Describe your experience working with a team.",
    ];

    questions.push(...behavioralQuestions.slice(0, count - questions.length).map((q) => ({
      type: "behavioral",
      question: q,
    })));

    return questions.slice(0, count);
  }

  static generateInterviewTips(candidateSkills, jobDescription) {
    const jobSkills = SkillExtractor.extractSkills(jobDescription);
    const tips = [];

    // Strength tips
    const strengths = candidateSkills.filter((s) => jobSkills.includes(s));
    if (strengths.length > 0) {
      tips.push({
        type: "strength",
        text: `Highlight your expertise in: ${strengths.slice(0, 3).join(", ")}`,
      });
    }

    // Development tips
    const gaps = jobSkills.filter((s) => !candidateSkills.includes(s));
    if (gaps.length > 0) {
      tips.push({
        type: "growth",
        text: `Be honest about learning: "${gaps[0]} is new to me, but I have experience learning similar technologies"`,
      });
    }

    // General tips
    tips.push(
      { type: "general", text: "Prepare examples using the STAR method (Situation, Task, Action, Result)" },
      { type: "general", text: "Research the company culture and values" },
      { type: "general", text: "Ask thoughtful questions about the role and team" }
    );

    return tips;
  }
}

module.exports = {
  SkillExtractor,
  JobMatcher,
  ResumeAnalyzer,
  RecommendationEngine,
  InterviewAssistant,
};
