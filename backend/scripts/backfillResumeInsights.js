require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
require("../models/Job");
require("../models/User");
const { calculateMatchScore } = require("../../ai-service/matcher");
const {
  parseResumeText,
  parseResumeFile,
  generateResumeFeedback,
  generateMatchExplanation,
} = require("../utils/resumeIntelligence");

const args = process.argv.slice(2);
const shouldApply = args.includes("--apply");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;

const backendRoot = path.resolve(__dirname, "..");

const resolveResumePath = (resumePath = "") => {
  if (!resumePath) return "";
  if (path.isAbsolute(resumePath)) return resumePath;
  return path.resolve(backendRoot, resumePath);
};

const parseResumeFromRecord = async (application) => {
  const existingText = String(application.resumeText || "").trim();

  if (existingText) {
    return {
      text: existingText,
      parsed: parseResumeText(existingText),
      source: "resumeText",
    };
  }

  const resolvedFilePath = resolveResumePath(application.resume);
  if (resolvedFilePath && fs.existsSync(resolvedFilePath)) {
    const parsedFile = await parseResumeFile(resolvedFilePath);
    return {
      text: String(parsedFile.text || "").trim(),
      parsed: parsedFile.parsed || parseResumeText(""),
      source: "resumeFile",
    };
  }

  return {
    text: "",
    parsed: parseResumeText(""),
    source: "empty",
  };
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const query = Application.find()
    .populate("job", "title company description skills experience yearsOfExperience")
    .populate("candidate", "name email");

  if (limit > 0) {
    query.limit(limit);
  }

  const applications = await query;

  const stats = {
    total: applications.length,
    parsedFromText: 0,
    parsedFromFile: 0,
    emptyResume: 0,
    updatedApplications: 0,
    updatedCandidates: 0,
    errors: 0,
  };

  for (const app of applications) {
    try {
      const parseResult = await parseResumeFromRecord(app);
      const parsedResume = parseResult.parsed || parseResumeText("");

      const requiredExperience = Number(
        app.job?.experience || app.job?.yearsOfExperience || 0
      );

      const yearsExperience =
        Number(app.yearsExperience || 0) > 0
          ? Number(app.yearsExperience)
          : Number(parsedResume?.experience?.years || 0);

      const resumeFeedback = generateResumeFeedback({
        parsedResume,
        jobSkills: app.job?.skills || [],
        requiredExperience,
      });

      const matchExplanation = generateMatchExplanation({
        parsedResume,
        jobSkills: app.job?.skills || [],
        requiredExperience,
      });

      const nextMatchScore =
        parseResult.text && app.job?.description
          ? calculateMatchScore(parseResult.text, app.job.description, app.job.skills || [])
          : Number(app.matchScore || 0);

      if (parseResult.source === "resumeText") stats.parsedFromText += 1;
      if (parseResult.source === "resumeFile") stats.parsedFromFile += 1;
      if (parseResult.source === "empty") stats.emptyResume += 1;

      if (shouldApply) {
        app.resumeText = parseResult.text || app.resumeText || "";
        app.parsedResume = parsedResume;
        app.yearsExperience = yearsExperience;
        app.resumeFeedback = resumeFeedback;
        app.matchExplanation = matchExplanation;
        app.matchScore = nextMatchScore;
        await app.save();
        stats.updatedApplications += 1;

        if (app.candidate?._id) {
          await Candidate.updateOne(
            { user: app.candidate._id },
            {
              $set: {
                user: app.candidate._id,
                name: app.candidate.name || app.candidateName || app.fullName || "Candidate",
                email: app.candidate.email || app.email || "",
                skills: parsedResume?.skills || [],
                experience: yearsExperience,
                education: parsedResume?.education || [],
                resumeParsedAt: new Date(),
              },
            },
            { upsert: true }
          );
          stats.updatedCandidates += 1;
        }
      }
    } catch (error) {
      stats.errors += 1;
      console.error(`Backfill failed for application ${app._id}: ${error.message}`);
    }
  }

  console.log("\nBackfill summary");
  console.log("--------------");
  console.log(`Mode: ${shouldApply ? "APPLY" : "DRY RUN"}`);
  console.log(`Applications scanned: ${stats.total}`);
  console.log(`Parsed from resumeText: ${stats.parsedFromText}`);
  console.log(`Parsed from resume file: ${stats.parsedFromFile}`);
  console.log(`Empty resume records: ${stats.emptyResume}`);
  console.log(`Applications updated: ${stats.updatedApplications}`);
  console.log(`Candidates synced: ${stats.updatedCandidates}`);
  console.log(`Errors: ${stats.errors}`);

  if (!shouldApply) {
    console.log("\nNo database changes were written. Re-run with --apply to persist updates.");
  }
};

run()
  .catch((error) => {
    console.error("Backfill script failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (err) {
      // Ignore disconnect errors on shutdown.
    }
  });
