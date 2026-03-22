const express = require("express");
const router = express.Router();
const {
  getMatchedCandidatesForJob,
  getMatchedJobsForCandidate,
  analyzeResume,
  getTopCandidatesForAllJobs,
  scoreCandidateForJob,
} = require("../controllers/matchingController");

// AI Matching Routes
router.get("/job/:jobId/candidates", getMatchedCandidatesForJob);
router.get("/candidate/:candidateId/jobs", getMatchedJobsForCandidate);
router.post("/analyze-resume", analyzeResume);
router.get("/top-candidates", getTopCandidatesForAllJobs);
router.post("/score", scoreCandidateForJob);

module.exports = router;
