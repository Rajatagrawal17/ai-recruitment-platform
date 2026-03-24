const express = require("express");
const router = express.Router();

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
router.post("/create", protect, createJob);

/* =========================
   PUBLIC GET JOBS
========================= */
router.get("/", getAllJobs);

/* =========================
   CANDIDATE JOB RECOMMENDATIONS
========================= */
router.get("/recommendations", protect, authorizeRoles("candidate"), getJobRecommendations);

/* =========================
   PUBLIC GET SINGLE JOB
========================= */
router.get("/:id", getJob);

/* =========================
   APPLY FOR JOB
========================= */
router.post("/:jobId/apply", protect, upload.single("resume"), (req, res, next) => {
  // Add jobId from params to body for applyJob controller
  req.body.jobId = req.params.jobId;
  next();
}, applyJob);

module.exports = router;