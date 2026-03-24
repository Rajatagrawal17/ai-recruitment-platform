require("dotenv").config();

const mongoose = require("mongoose");

const { runResumeInsightsBackfill } = require("../services/resumeBackfillService");

const args = process.argv.slice(2);
const shouldApply = args.includes("--apply");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const stats = await runResumeInsightsBackfill({
    apply: shouldApply,
    limit,
    logger: console,
  });

  console.log("\nBackfill summary");
  console.log("--------------");
  console.log(`Mode: ${stats.mode}`);
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
