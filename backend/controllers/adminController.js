const { runResumeInsightsBackfill } = require("../services/resumeBackfillService");

exports.runResumeBackfill = async (req, res) => {
  try {
    const apply = String(req.query.apply || "false").toLowerCase() === "true";
    const limit = Number(req.query.limit || 0);

    const stats = await runResumeInsightsBackfill({
      apply,
      limit,
      logger: console,
    });

    res.status(200).json({
      success: true,
      message: apply
        ? "Resume insights backfill applied successfully"
        : "Resume insights dry-run completed",
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
