const express = require("express");
const {
  getJobMatches,
  analyzeResume,
  getRecommendedJobs,
  analyzeSkills,
  getInterviewQuestions,
  getInterviewTips,
  predictSalary,
  analyzeSkillGap,
  generateApplicationContent,
  screenCandidates,
  checkResumeAuthenticity,
  matchResumeToJob,
  generateResumeImprovements,
  chatHelpAssistant,
} = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// AI Job Matcher - Get job matches for a candidate
router.post("/match-jobs", protect, getJobMatches);

// Resume Analyzer - Analyze resume text
router.post("/analyze-resume", analyzeResume);

// Job Recommendations - Get recommended jobs
router.post("/recommendations", protect, getRecommendedJobs);

// Skill Analysis - Extract skills from text
router.post("/analyze-skills", analyzeSkills);

// Interview Questions - Generate interview questions for a job
router.post("/interview-questions", protect, getInterviewQuestions);

// Interview Tips - Get interview preparation tips
router.post("/interview-tips", protect, getInterviewTips);

// Salary Prediction - Predict salary range
router.post("/predict-salary", predictSalary);

// Skill Gap Analysis - Analyze skill gaps
router.post("/skill-gap", analyzeSkillGap);

// Application Assistant - Generate application content
router.post("/generate-application", protect, generateApplicationContent);

// Recruiter Assistant - Screen candidates for a job
router.post("/screen-candidates", protect, screenCandidates);

// ==================== NEW CLAUDE AI ENDPOINTS ====================

// Public AI help assistant - interactive product and career support
router.post("/help-chat", chatHelpAssistant);

// Resume Authenticity - Check if resume is genuine/free of red flags
router.post("/check-authenticity", checkResumeAuthenticity);

// Resume to Job Matching - Match resume against specific job (Claude AI)
router.post("/match-resume-to-job", matchResumeToJob);

// Generate Resume Improvements - Get detailed improvement plan
router.post("/generate-improvements", generateResumeImprovements);

module.exports = router;
