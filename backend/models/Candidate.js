const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    education: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    resumeParsedAt: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
