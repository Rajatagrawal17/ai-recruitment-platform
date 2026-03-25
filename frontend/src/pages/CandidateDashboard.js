import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BriefcaseBusiness,
  CircleAlert,
  Compass,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import MatchScoreBadge from "../components/MatchScoreBadge";
import { getCandidateApplications, getRecommendedJobs } from "../services/api";
import AnimatedBackground from "../components/AnimatedBackground";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const StatCard = ({ title, value, icon: Icon, hint, accent, reduceMotion }) => (
  <motion.article
    variants={item}
    whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
    className="glass-card p-5"
  >
    <div className="flex items-center justify-between">
      <p className="text-sm text-text-muted">{title}</p>
      <span className={`rounded-lg p-2 ${accent}`}>
        <Icon size={18} />
      </span>
    </div>
    <h3 className="mt-3 text-2xl font-bold text-text">{value}</h3>
    <p className="mt-1 text-xs text-text-muted">{hint}</p>
  </motion.article>
);

const ScoreBar = ({ score, reduceMotion }) => (
  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-soft">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.max(4, score)}%` }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
      className={`h-full rounded-full ${
        score >= 80
          ? "bg-emerald-500"
          : score >= 50
          ? "bg-amber-500"
          : "bg-rose-500"
      }`}
    />
  </div>
);

const CandidateDashboard = () => {
  const reduceMotion = useReducedMotion();
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appsRes, recommendationRes] = await Promise.all([
          getCandidateApplications(),
          getRecommendedJobs().catch(() => ({ data: { recommendations: [] } })),
        ]);

        setApplications(appsRes.data.applications || []);
        setRecommendations(recommendationRes.data.recommendations || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your candidate dashboard.");
      } finally {
        setLoading(false);
        setRecommendationLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = applications.length;
    const avgMatch = total
      ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / total)
      : 0;
    const pending = applications.filter((app) => app.status === "pending").length;
    const shortlisted = applications.filter((app) => app.status === "shortlisted").length;

    return { total, avgMatch, pending, shortlisted };
  }, [applications]);

  return (
    <motion.main
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.22 }}
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6"
    >
      <AnimatedBackground />
      <section className="glass-card overflow-hidden p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={14} /> Candidate Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold">Candidate Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              Track your applications, review AI feedback, and discover high-match opportunities tailored to your profile.
            </p>
          </div>
          <Link to="/jobs" className="btn-primary">
            <BriefcaseBusiness size={16} className="mr-2" />
            Browse Jobs
          </Link>
        </div>
      </section>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Total Applications"
          value={stats.total}
          hint="Every role you have applied for"
          icon={FileText}
          accent="bg-primary-soft text-primary"
          reduceMotion={reduceMotion}
        />
        <StatCard
          title="Average Match"
          value={`${stats.avgMatch}%`}
          hint="AI fit score across all applications"
          icon={TrendingUp}
          accent="bg-emerald-500/15 text-emerald-500"
          reduceMotion={reduceMotion}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          hint="Waiting for recruiter action"
          icon={CircleAlert}
          accent="bg-amber-500/15 text-amber-500"
          reduceMotion={reduceMotion}
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          hint="Great progress toward interview"
          icon={Compass}
          accent="bg-cyan-500/15 text-cyan-500"
          reduceMotion={reduceMotion}
        />
      </motion.section>

      <section className="glass-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Smart Job Recommendations</h2>
          <span className="text-xs text-text-muted">Top matches by your skills</span>
        </div>

        {recommendationLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="skeleton h-36" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Compass size={20} />
            </div>
            <h3 className="mt-4 text-base font-semibold">No recommendations yet</h3>
            <p className="mt-2 text-sm text-text-muted">
              Apply with a rich resume and we will personalize job recommendations based on extracted skills.
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-3 md:grid-cols-2"
          >
            {recommendations.slice(0, 4).map((job) => (
              <motion.article
                key={job._id}
                variants={item}
                layout
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="rounded-2xl border border-border bg-surface-soft p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-text-muted">{job.company}</p>
                  </div>
                  <MatchScoreBadge score={job.matchScore || 0} />
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  Matched: {(job.matchedSkills || []).slice(0, 4).join(", ") || "No direct match yet"}
                </p>
                {(job.missingSkills || []).length > 0 && (
                  <p className="mt-1 text-xs text-text-muted">
                    Gaps: {job.missingSkills.slice(0, 3).join(", ")}
                  </p>
                )}
                <p className="mt-2 text-xs text-text-muted">
                  Readiness: <span className="font-semibold capitalize text-text">{job.readiness || "emerging"}</span>
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {job.explanation?.summary || "AI explanation will appear here after profile analysis."}
                </p>
                <ScoreBar score={job.matchScore || 0} reduceMotion={reduceMotion} />
                <Link to={`/jobs/${job._id}`} className="btn-secondary mt-4 w-full text-sm">
                  View Role
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">Application Timeline</h2>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((row) => (
              <div key={row} className="skeleton h-16" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-surface-soft" />
            <h3 className="mt-4 text-lg font-semibold">No applications yet</h3>
            <p className="mt-2 text-sm text-text-muted">
              Start applying to roles and this area will show progress, scores, and actionable AI feedback.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-surface-soft text-left text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-5 py-3">Job</th>
                  <th className="px-5 py-3">Applied</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Match</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3">Interview</th>
                  <th className="px-5 py-3">AI Explanation</th>
                  <th className="px-5 py-3">AI Feedback</th>
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show">
                <AnimatePresence>
                  {applications.map((app) => (
                    <motion.tr
                      key={app._id}
                      variants={item}
                      className="border-t border-border hover:bg-surface-soft/60"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{app.job?.title || "Role"}</p>
                        <p className="text-xs text-text-muted">{app.job?.company || "Company"}</p>
                      </td>
                      <td className="px-5 py-4 text-text-muted">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-surface-soft px-2 py-1 text-xs font-medium capitalize text-text">
                          {app.status || "pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <MatchScoreBadge score={app.matchScore || 0} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-28">
                          <ScoreBar score={app.matchScore || 0} reduceMotion={reduceMotion} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {app.interview?.scheduledAt ? (
                          <div className="max-w-[180px] text-xs text-text-muted">
                            <p className="font-medium text-text">{new Date(app.interview.scheduledAt).toLocaleString()}</p>
                            <p className="capitalize">{app.interview.mode || "video"}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-xs space-y-1 text-xs text-text-muted">
                          <p className="font-medium text-text">
                            {app.matchExplanation?.summary || "Explanation pending."}
                          </p>
                          {(app.matchExplanation?.matchedSkills || []).length > 0 && (
                            <p>
                              Matched: {app.matchExplanation.matchedSkills.slice(0, 3).join(", ")}
                            </p>
                          )}
                          {(app.matchExplanation?.missingSkills || []).length > 0 && (
                            <p>
                              Missing: {app.matchExplanation.missingSkills.slice(0, 3).join(", ")}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="max-w-xs text-xs text-text-muted">
                          {app.resumeFeedback?.summary || "Feedback pending from AI analysis."}
                        </p>
                        {(app.resumeFeedback?.suggestions || []).length > 0 && (
                          <p className="mt-1 max-w-xs text-xs text-text-muted">
                            Tip: {app.resumeFeedback.suggestions[0]}
                          </p>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        )}
      </section>
    </motion.main>
  );
};

export default CandidateDashboard;
