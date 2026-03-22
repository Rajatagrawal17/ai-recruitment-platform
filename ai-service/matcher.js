// ==================== SKILL DATABASE ====================
const TECH_SKILLS = {
  languages: ["python", "javascript", "java", "csharp", "c++", "typescript", "php", "ruby", "go", "rust", "kotlin", "swift", "scala", "r", "matlab"],
  frontend: ["react", "vue", "angular", "html", "css", "tailwind", "bootstrap", "webpack", "babel", "nextjs", "gatsby", "svelte"],
  backend: ["nodejs", "express", "django", "flask", "spring", "asp.net", "fastapi", "rails", "laravel", "golang"],
  databases: ["mongodb", "mysql", "postgresql", "oracle", "redis", "cassandra", "elasticsearch", "firebase"],
  cloud: ["aws", "azure", "gcp", "docker", "kubernetes", "heroku", "netlify"],
  tools: ["git", "github", "gitlab", "jira", "docker", "kubernetes", "jenkins", "webpack", "npm", "yarn"]
};

const SOFT_SKILLS = ["leadership", "communication", "teamwork", "problem-solving", "project management", "agile", "scrum"];

const EXPERIENCE_LEVELS = {
  junior: ["entry", "junior", "0-2 years", "fresh", "fresher"],
  mid: ["mid", "senior", "3-5 years", "intermediate"],
  senior: ["senior", "lead", "5+ years", "principal", "architect", "expert"]
};

// ==================== EXTRACT SKILLS FROM TEXT ====================
exports.extractSkills = (text) => {
  if (!text) return { technical: [], soft: [], experience: "unknown" };

  const textLower = text.toLowerCase();
  const extracted = {
    technical: new Set(),
    soft: new Set(),
    experience: "unknown"
  };

  // Extract technical skills
  Object.values(TECH_SKILLS).forEach((skillArray) => {
    skillArray.forEach((skill) => {
      const regex = new RegExp(`\\b${skill}\\b`, "gi");
      if (regex.test(textLower)) {
        extracted.technical.add(skill);
      }
    });
  });

  // Extract soft skills
  SOFT_SKILLS.forEach((skill) => {
    const regex = new RegExp(`\\b${skill}\\b`, "gi");
    if (regex.test(textLower)) {
      extracted.soft.add(skill);
    }
  });

  // Determine experience level
  for (const [level, keywords] of Object.entries(EXPERIENCE_LEVELS)) {
    if (keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, "i").test(textLower))) {
      extracted.experience = level;
      break;
    }
  }

  return {
    technical: Array.from(extracted.technical),
    soft: Array.from(extracted.soft),
    experience: extracted.experience
  };
};

// ==================== CALCULATE MATCH SCORE ====================
exports.calculateMatchScore = (resumeText, jobDescription, jobSkills = []) => {
  if (!resumeText || !jobDescription) return 0;

  const textLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  // Extract skills from resume
  const resumeSkills = exports.extractSkills(resumeText);

  // 1. SKILL MATCHING (50% weight)
  let skillScore = 0;
  if (jobSkills.length > 0) {
    const matchedSkills = jobSkills.filter((skill) =>
      resumeText.toLowerCase().includes(skill.toLowerCase())
    );
    skillScore = Math.round((matchedSkills.length / jobSkills.length) * 100);
  } else {
    // Fallback: Generic keyword matching
    const jobKeywords = jobLower
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .map((w) => w.replace(/[^\w]/g, ""));

    const resumeKeywords = new Set(
      textLower
        .split(/\s+/)
        .filter((w) => w.length > 4)
        .map((w) => w.replace(/[^\w]/g, ""))
    );

    let matches = 0;
    jobKeywords.forEach((keyword) => {
      if (resumeKeywords.has(keyword)) matches++;
    });

    skillScore = Math.min(Math.round((matches / Math.max(jobKeywords.length, 1)) * 100), 100);
  }

  // 2. EXPERIENCE MATCH (30% weight)
  const resumeHasExperience = /\d+\s*(years?|yrs?)/i.test(resumeText);
  const experienceScore = resumeHasExperience ? 85 : 60;

  // 3. EDUCATION & QUALIFICATIONS (20% weight)
  const hasEducation = /bachelor|master|degree|btech|mtech|b.tech|m.tech|engineer|diploma|phd|certification|certified/i.test(resumeText);
  const educationScore = hasEducation ? 100 : 50;

  // Calculate weighted final score
  const finalScore = Math.round(
    (skillScore * 0.5) +
    (experienceScore * 0.3) +
    (educationScore * 0.2)
  );

  return Math.min(finalScore, 100);
};

// ==================== RANK CANDIDATES ====================
exports.rankCandidates = (candidates, jobDetail) => {
  return candidates
    .map((candidate) => ({
      ...candidate,
      matchScore: exports.calculateMatchScore(
        candidate.resumeText || candidate.resume || "",
        jobDetail.description,
        jobDetail.skills || []
      ),
      extractedSkills: exports.extractSkills(candidate.resumeText || candidate.resume || "")
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
};

// ==================== LEGACY FUNCTION (BACKWARDS COMPATIBLE) ====================
exports.calculateMatchScore_legacy = (resumeText, jobDescription) => {
  if (!resumeText || !jobDescription) return 0;

  const resume = resumeText.toLowerCase();
  const job = jobDescription.toLowerCase();

  const getKeywords = (text) => {
    return text
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .map((word) => word.replace(/[^\w]/g, ""));
  };

  const resumeKeywords = new Set(getKeywords(resume));
  const jobKeywords = new Set(getKeywords(job));

  let matches = 0;
  jobKeywords.forEach((keyword) => {
    if (resumeKeywords.has(keyword)) {
      matches++;
    }
  });

  return Math.min(Math.round((matches / Math.max(jobKeywords.size, 1)) * 100), 100);
};