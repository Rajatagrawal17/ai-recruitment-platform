const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
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
    parsedResume: {
      skills: [
        {
          type: String,
          trim: true,
        },
      ],
      experience: {
        years: {
          type: Number,
          default: 0,
        },
        level: {
          type: String,
          default: "entry",
        },
      },
      education: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    resumeFeedback: {
      summary: {
        type: String,
        default: "",
      },
      missingSkills: [
        {
          type: String,
          trim: true,
        },
      ],
      weakAreas: [
        {
          type: String,
          trim: true,
        },
      ],
      suggestions: [
        {
          type: String,
          trim: true,
        },
      ],
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
      enum: ["pending", "shortlisted", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
