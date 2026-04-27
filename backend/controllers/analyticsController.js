const Application = require("../models/Application");
const Job = require("../models/Job");

exports.getAnalytics = async (req, res) => {
  try {
    const applications = await Application.find().select("status parsedResume matchScore createdAt interview job");
    const jobs = await Job.find().select("_id title status createdAt");

    const totalApplications = applications.length;
    const acceptedCount = applications.filter((app) => app.status === "accepted").length;
    const shortlistedCount = applications.filter((app) => app.status === "shortlisted").length;
    const rejectedCount = applications.filter((app) => app.status === "rejected").length;
    const pendingCount = applications.filter((app) => app.status === "pending").length;

    const acceptanceRate = totalApplications
      ? Number(((acceptedCount / totalApplications) * 100).toFixed(1))
      : 0;

    // Conversion funnel
    const conversionFunnel = {
      applied: totalApplications,
      shortlisted: shortlistedCount,
      interviewed: applications.filter((a) => a.interview?.scheduledAt).length,
      accepted: acceptedCount,
      shortlistRate: totalApplications ? Number(((shortlistedCount / totalApplications) * 100).toFixed(1)) : 0,
      interviewRate: shortlistedCount ? Number(((applications.filter((a) => a.interview?.scheduledAt).length / shortlistedCount) * 100).toFixed(1)) : 0,
      offerRate: applications.filter((a) => a.interview?.scheduledAt).length
        ? Number(((acceptedCount / applications.filter((a) => a.interview?.scheduledAt).length) * 100).toFixed(1))
        : 0,
    };

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

    // Jobs stats
    const totalJobs = jobs.length;
    const openJobs = jobs.filter((j) => j.status !== "closed").length;

    // Time-to-hire: average time from application to acceptance
    const acceptedApps = applications.filter((a) => a.status === "accepted");
    const avgTimeToHire =
      acceptedApps.length > 0
        ? Number(
          (
            acceptedApps.reduce((sum, app) => {
              const days = (new Date() - new Date(app.createdAt)) / (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / acceptedApps.length
          ).toFixed(1)
        )
        : 0;

    // Applications per job
    const avgAppPerJob = totalJobs > 0 ? Number((totalApplications / totalJobs).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalApplications,
        acceptanceRate,
        averageMatchScore,
        totalJobs,
        openJobs,
        avgTimeToHire,
        avgAppPerJob,
        conversionFunnel,
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
