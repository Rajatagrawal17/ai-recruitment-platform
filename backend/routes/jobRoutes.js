const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/errorHandler");

const {
   createJob,
   getAllJobs,
   getJob,
   getJobRecommendations,
} = require("../controllers/jobController");
const { applyJob } = require("../controllers/applicationController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

/* =========================
   ADMIN CREATE JOB
========================= */
router.post("/create", protect, authorizeRoles("recruiter", "admin"), asyncHandler(createJob));

/* =========================
   PUBLIC GET JOBS
========================= */
router.get("/", asyncHandler(getAllJobs));

/* =========================
   CANDIDATE JOB RECOMMENDATIONS
========================= */
router.get("/recommendations", protect, authorizeRoles("candidate"), asyncHandler(getJobRecommendations));

/* =========================
   PUBLIC GET SINGLE JOB
========================= */
router.get("/:id", asyncHandler(getJob));

/* =========================
   APPLY FOR JOB
========================= */
router.post("/:jobId/apply", protect, upload.single("resume"), (req, res, next) => {
  // Add jobId from params to body for applyJob controller
  req.body.jobId = req.params.jobId;
  next();
}, asyncHandler(applyJob));

module.exports = router;