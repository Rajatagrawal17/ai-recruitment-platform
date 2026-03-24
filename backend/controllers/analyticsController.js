const Application = require("../models/Application");

exports.getAnalytics = async (req, res) => {
  try {
    const applications = await Application.find().select("status parsedResume matchScore createdAt");

    const totalApplications = applications.length;
    const acceptedCount = applications.filter((app) => app.status === "accepted").length;
    const shortlistedCount = applications.filter((app) => app.status === "shortlisted").length;
    const rejectedCount = applications.filter((app) => app.status === "rejected").length;
    const pendingCount = applications.filter((app) => app.status === "pending").length;

    const acceptanceRate = totalApplications
      ? Number(((acceptedCount / totalApplications) * 100).toFixed(1))
      : 0;

    const skillCount = new Map();
    applications.forEach((app) => {
      (app.parsedResume?.skills || []).forEach((skill) => {
        const key = String(skill || "").trim();
        if (!key) return;
        skillCount.set(key, (skillCount.get(key) || 0) + 1);
      });
    });

    const topSkills = [...skillCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));

    const averageMatchScore = totalApplications
      ? Number((applications.reduce((sum, app) => sum + Number(app.matchScore || 0), 0) / totalApplications).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalApplications,
        acceptanceRate,
        averageMatchScore,
        statuses: {
          pending: pendingCount,
          shortlisted: shortlistedCount,
          accepted: acceptedCount,
          rejected: rejectedCount,
        },
        topSkills,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
