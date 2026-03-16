const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    },
    portfolioUrl: {
      type: String,
    },
    yearsExperience: {
      type: Number,
      default: 0,
    },
    resumeText: {
      type: String,
    },
    resume: {
      type: String,
    },
    coverLetter: {
      type: String,
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
