const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "node.js",
  "nodejs",
  "express",
  "react",
  "next.js",
  "nextjs",
  "angular",
  "vue",
  "python",
  "java",
  "spring",
  "mongodb",
  "mysql",
  "postgresql",
  "redis",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "terraform",
  "linux",
  "git",
  "rest api",
  "graphql",
  "system design",
  "microservices",
  "ci/cd",
  "jenkins",
  "tensorflow",
  "pytorch",
  "mlops",
  "data structures",
  "algorithms",
];

const EDUCATION_KEYWORDS = [
  "b.tech",
  "btech",
  "b.e",
  "be",
  "m.tech",
  "mtech",
  "bachelor",
  "master",
  "phd",
  "diploma",
  "computer science",
  "information technology",
  "electronics",
  "engineering",
  "university",
  "college",
  "certification",
  "certified",
];

const normalizeSkill = (skill = "") =>
  skill
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();

const uniqueSkills = (skills = []) => {
  const seen = new Map();

  for (const skill of skills) {
    const key = normalizeSkill(skill);
    if (!key) continue;

    if (!seen.has(key)) {
      const display = key
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
        .replace("Nodejs", "Node.js")
        .replace("Nextjs", "Next.js")
        .replace("Ci/cd", "CI/CD")
        .replace("Rest Api", "REST API")
        .replace("Aws", "AWS")
        .replace("Gcp", "GCP");

      seen.set(key, display);
    }
  }

  return Array.from(seen.values());
};

const extractSkillsFromText = (text = "") => {
  const lower = text.toLowerCase();
  const found = [];

  for (const keyword of SKILL_KEYWORDS) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");

    if (regex.test(lower)) {
      found.push(keyword);
    }
  }

  return uniqueSkills(found);
};

const extractEducationFromText = (text = "") => {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const matches = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (EDUCATION_KEYWORDS.some((keyword) => lower.includes(keyword))) {
      matches.push(line.length > 120 ? `${line.slice(0, 117)}...` : line);
    }
  }

  if (matches.length > 0) {
    return [...new Set(matches)].slice(0, 5);
  }

  return [];
};

const extractExperienceYears = (text = "") => {
  const matches = String(text).match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/gi) || [];
  if (!matches.length) {
    return 0;
  }

  const years = matches
    .map((item) => Number(item.match(/\d{1,2}/)?.[0] || 0))
    .filter((num) => Number.isFinite(num));

  return years.length ? Math.max(...years) : 0;
};

const getExperienceLevel = (years) => {
  if (years >= 7) return "senior";
  if (years >= 3) return "mid";
  if (years >= 1) return "junior";
  return "entry";
};

const parseResumeText = (text = "") => {
  const safeText = String(text || "");
  const skills = extractSkillsFromText(safeText);
  const years = extractExperienceYears(safeText);
  const education = extractEducationFromText(safeText);

  return {
    skills,
    experience: {
      years,
      level: getExperienceLevel(years),
    },
    education,
  };
};

const parsePdfResume = async (filePath) => {
  if (!filePath) {
    return { text: "", parsed: parseResumeText("") };
  }

  const buffer = await fs.promises.readFile(filePath);
  const parsedPdf = await pdfParse(buffer);
  const text = parsedPdf?.text || "";

  return {
    text,
    parsed: parseResumeText(text),
  };
};

const parseDocxResume = async (filePath) => {
  if (!filePath) {
    return { text: "", parsed: parseResumeText("") };
  }

  const result = await mammoth.extractRawText({ path: filePath });
  const text = result?.value || "";

  return {
    text,
    parsed: parseResumeText(text),
  };
};

const parseResumeFile = async (filePath, mimeType = "") => {
  if (!filePath) {
    return { text: "", parsed: parseResumeText("") };
  }

  const ext = path.extname(filePath).toLowerCase();

  if (
    mimeType === "application/pdf" ||
    ext === ".pdf"
  ) {
    return parsePdfResume(filePath);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    return parseDocxResume(filePath);
  }

  throw new Error("Unsupported resume format. Please upload PDF or DOCX.");
};

const generateResumeFeedback = ({ parsedResume, jobSkills = [], requiredExperience = 0 }) => {
  const candidateSkills = parsedResume?.skills || [];
  const normalizedCandidate = new Set(candidateSkills.map((skill) => normalizeSkill(skill)));

  const normalizedJobSkills = uniqueSkills(jobSkills).map((skill) => normalizeSkill(skill));
  const missingSkills = normalizedJobSkills
    .filter((skill) => !normalizedCandidate.has(skill))
    .map((skill) =>
      skill
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    );

  const weakAreas = [];
  if (missingSkills.length > 0) {
    weakAreas.push(`Missing required skills: ${missingSkills.join(", ")}`);
  }

  const experienceYears = parsedResume?.experience?.years || 0;
  if (requiredExperience > 0 && experienceYears < requiredExperience) {
    weakAreas.push(
      `Experience gap: Job expects ${requiredExperience}+ years, resume shows ${experienceYears} years`
    );
  }

  if ((parsedResume?.education || []).length === 0) {
    weakAreas.push("Education section is not clearly visible in the resume");
  }

  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Add project work or certifications that demonstrate ${missingSkills.slice(0, 3).join(", ")}`);
  }
  if (requiredExperience > 0 && experienceYears < requiredExperience) {
    suggestions.push("Highlight internships, freelance work, or measurable outcomes to strengthen experience proof");
  }
  if ((parsedResume?.education || []).length === 0) {
    suggestions.push("Include degree, university, and graduation year to improve recruiter confidence");
  }
  if (suggestions.length === 0) {
    suggestions.push("Resume aligns well with this role. Add measurable impact points for each recent project");
  }

  const summary = missingSkills.length
    ? `You are missing ${missingSkills.slice(0, 3).join(", ")} for this role.`
    : "Your resume is broadly aligned with this job requirements.";

  return {
    summary,
    missingSkills,
    weakAreas,
    suggestions,
  };
};

const generateMatchExplanation = ({ parsedResume, jobSkills = [], requiredExperience = 0 }) => {
  const candidateSkills = uniqueSkills(parsedResume?.skills || []);
  const jobSkillList = uniqueSkills(jobSkills || []);

  const candidateSet = new Set(candidateSkills.map((skill) => normalizeSkill(skill)));
  const matchedSkills = jobSkillList.filter((skill) => candidateSet.has(normalizeSkill(skill)));
  const missingSkills = jobSkillList.filter((skill) => !candidateSet.has(normalizeSkill(skill)));

  const strengths = [];
  const weaknesses = [];

  if (matchedSkills.length > 0) {
    strengths.push(`Strong skill alignment in ${matchedSkills.slice(0, 4).join(", ")}`);
  }

  const candidateExperienceYears = Number(parsedResume?.experience?.years || 0);
  if (requiredExperience > 0 && candidateExperienceYears >= requiredExperience) {
    strengths.push(`Experience fit: ${candidateExperienceYears} years meets required ${requiredExperience}+ years`);
  }

  if ((parsedResume?.education || []).length > 0) {
    strengths.push("Education details are present and readable");
  }

  if (missingSkills.length > 0) {
    weaknesses.push(`Missing role skills: ${missingSkills.slice(0, 5).join(", ")}`);
  }

  if (requiredExperience > 0 && candidateExperienceYears < requiredExperience) {
    weaknesses.push(`Experience gap: ${candidateExperienceYears} years vs required ${requiredExperience}+ years`);
  }

  if ((parsedResume?.education || []).length === 0) {
    weaknesses.push("Education section is unclear or missing");
  }

  const summary = matchedSkills.length
    ? `Matched ${matchedSkills.length}/${jobSkillList.length || matchedSkills.length} key skills${
        missingSkills.length ? ` with gaps in ${missingSkills.slice(0, 3).join(", ")}` : " and shows strong overall fit"
      }.`
    : "Limited direct skill overlap with this role; review transferable experience and projects.";

  return {
    summary,
    matchedSkills,
    missingSkills,
    strengths,
    weaknesses,
  };
};

module.exports = {
  parseResumeText,
  parsePdfResume,
  parseDocxResume,
  parseResumeFile,
  generateMatchExplanation,
  generateResumeFeedback,
  extractSkillsFromText,
};
