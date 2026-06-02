const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    companyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    location: {
      type: String,
      default: "Not specified",
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "remote", "hybrid"],
      default: "full-time",
    },
    salary: {
      type: Number,
      default: 0,
    },
    skills: [
      {
        type: String,
      },
    ],
    experience: {
      type: Number,
      default: 0,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

// Indexes for fast pagination and filtering
jobSchema.index({ createdAt: -1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1 });
jobSchema.index({ title: "text", description: "text", skills: "text" });

module.exports = mongoose.model("Job", jobSchema);

