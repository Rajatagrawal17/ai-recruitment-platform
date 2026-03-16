const Job = require("../models/Job");

/* =========================
   CREATE JOB (ADMIN ONLY)
========================= */
exports.createJob = async (req, res) => {
  try {
    const { title, description, company } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      createdBy: req.user._id, // admin id
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully ✅",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET SINGLE JOB (PUBLIC)
========================= */
exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("createdBy", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET ALL JOBS (PUBLIC)
========================= */
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
