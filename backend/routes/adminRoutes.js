const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { runResumeBackfill } = require("../controllers/adminController");

const router = express.Router();

router.post(
  "/backfill-resume-insights",
  protect,
  authorizeRoles("admin"),
  runResumeBackfill
);

module.exports = router;
