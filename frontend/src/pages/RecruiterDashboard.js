import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Filter,
  Star,
  Users,
  Trophy,
  PlusSquare,
  Search,
} from "lucide-react";
import MatchScoreBadge from "../components/MatchScoreBadge";
import {
  createJob,
  getAnalytics,
  getJobs,
  getJobCandidates,
  scheduleInterview,
  updateApplicationStatus,
} from "../services/api";

const initialForm = {
  title: "",
  company: "",
  description: "",
  location: "",
  type: "full-time",
  salary: "",
  skills: "",
};

const statusOptions = ["all", "pending", "shortlisted", "accepted", "rejected"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const RecruiterDashboard = () => {
  const reduceMotion = useReducedMotion();
  const [jobs, setJobs] = useState([]);
  const [jobCandidates, setJobCandidates] = useState({});
  const [expandedJobId, setExpandedJobId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [analytics, setAnalytics] = useState(null);
  const [interviewDrafts, setInterviewDrafts] = useState({});

  const openToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const loadDashboard = async () => {
    try {
      const [jobsRes, analyticsRes] = await Promise.all([
        getJobs(),
        getAnalytics().catch(() => ({ data: { analytics: null } })),
      ]);
      setJobs(jobsRes.data.jobs || []);
      setAnalytics(analyticsRes.data.analytics || null);
    } catch (err) {
      openToast("error", err.response?.data?.message || "Unable to load recruiter dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const ranking = useMemo(() => {
    const merged = Object.values(jobCandidates).flat();
    const filtered = merged.filter((candidate) => {
      const matchesStatus = statusFilter === "all" || (candidate.status || "pending") === statusFilter;
      const text = `${candidate.candidateName || ""} ${candidate.candidateEmail || ""}`.toLowerCase();
      const matchesText = text.includes(query.toLowerCase());
      return matchesStatus && matchesText;
    });

    return [...filtered].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [jobCandidates, query, statusFilter]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createJob({
        ...form,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      setForm(initialForm);
      openToast("success", "Job posted successfully");
      await loadDashboard();
    } catch (err) {
      openToast("error", err.response?.data?.message || "Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  const handleExpandJob = async (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId("");
      return;
    }

    setExpandedJobId(jobId);

    if (jobCandidates[jobId]) {
      return;
    }

    setLoadingCandidates(true);
    try {
      const res = await getJobCandidates(jobId);
      setJobCandidates((prev) => ({
        ...prev,
        [jobId]: res.data.matchedCandidates || [],
      }));
    } catch (err) {
      openToast("error", err.response?.data?.message || "Unable to load candidates for this job");
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleStatusChange = async (applicationId, status, jobId) => {
    try {
      await updateApplicationStatus(applicationId, status);
      const res = await getJobCandidates(jobId);
      setJobCandidates((prev) => ({
        ...prev,
        [jobId]: res.data.matchedCandidates || [],
      }));
      openToast("success", `Candidate marked as ${status}`);
    } catch (err) {
      openToast("error", err.response?.data?.message || "Unable to update status");
    }
  };

  const updateInterviewDraft = (applicationId, field, value) => {
    setInterviewDrafts((prev) => ({
      ...prev,
      [applicationId]: {
        ...(prev[applicationId] || {}),
        [field]: value,
      },
    }));
  };

  const handleScheduleInterview = async (applicationId, jobId) => {
    const draft = interviewDrafts[applicationId] || {};
    if (!draft.scheduledAt) {
      openToast("error", "Select interview date and time first");
      return;
    }

    try {
      await scheduleInterview(applicationId, {
        scheduledAt: draft.scheduledAt,
        timezone: draft.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        mode: draft.mode || "video",
        meetingLink: draft.meetingLink || "",
        notes: draft.notes || "",
      });

      const res = await getJobCandidates(jobId);
      setJobCandidates((prev) => ({
        ...prev,
        [jobId]: res.data.matchedCandidates || [],
      }));

      openToast("success", "Interview scheduled successfully");
    } catch (err) {
      openToast("error", err.response?.data?.message || "Unable to schedule interview");
    }
  };

  const totalApplicants = Object.values(jobCandidates).flat().length;
  const topScore = ranking[0]?.matchScore || 0;

  return (
    <motion.main
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.22 }}
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            className={`fixed right-5 top-20 z-[70] rounded-xl px-4 py-3 text-sm font-medium shadow-card ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="glass-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Trophy size={14} /> Recruiter Command Center
            </p>
            <h1 className="mt-3 text-3xl font-bold">Recruiter Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              Post roles, track applicants, and prioritize high-confidence matches with animated insights and quick actions.
            </p>
          </div>
        </div>
      </section>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-3"
      >
        <motion.article variants={item} whileHover={reduceMotion ? undefined : { y: -4 }} className="glass-card p-5">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-sm">Total Jobs</span>
            <BriefcaseBusiness size={18} />
          </div>
          <p className="mt-3 text-3xl font-bold">{jobs.length}</p>
        </motion.article>
        <motion.article variants={item} whileHover={reduceMotion ? undefined : { y: -4 }} className="glass-card p-5">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-sm">Loaded Applicants</span>
            <Users size={18} />
          </div>
          <p className="mt-3 text-3xl font-bold">{totalApplicants}</p>
        </motion.article>
        <motion.article variants={item} whileHover={reduceMotion ? undefined : { y: -4 }} className="glass-card p-5">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-sm">Top Match Score</span>
            <Star size={18} />
          </div>
          <p className="mt-3 text-3xl font-bold">{topScore}%</p>
        </motion.article>
      </motion.section>

      {analytics && (
        <section className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Hiring Analytics</h2>
            <span className="text-xs text-text-muted">Live platform signals</span>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-surface-soft p-3">
              <p className="text-xs text-text-muted">Total Applications</p>
              <p className="mt-1 text-2xl font-bold">{analytics.totalApplications || 0}</p>
            </div>
            <div className="rounded-xl bg-surface-soft p-3">
              <p className="text-xs text-text-muted">Acceptance Rate</p>
              <p className="mt-1 text-2xl font-bold">{analytics.acceptanceRate || 0}%</p>
            </div>
            <div className="rounded-xl bg-surface-soft p-3">
              <p className="text-xs text-text-muted">Average Match</p>
              <p className="mt-1 text-2xl font-bold">{analytics.averageMatchScore || 0}%</p>
            </div>
            <div className="rounded-xl bg-surface-soft p-3">
              <p className="text-xs text-text-muted">Shortlisted</p>
              <p className="mt-1 text-2xl font-bold">{analytics.statuses?.shortlisted || 0}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-surface-soft p-3">
            <p className="text-xs text-text-muted">Top Skills in Pipeline</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(analytics.topSkills || []).slice(0, 8).map((item) => (
                <span key={item.skill} className="rounded-full bg-primary-soft px-2 py-1 text-xs font-medium text-primary">
                  {item.skill} ({item.count})
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <motion.aside
          className="glass-card overflow-hidden"
          animate={reduceMotion ? undefined : { width: sidebarCollapsed ? 84 : "auto" }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-sm font-semibold"
          >
            {sidebarCollapsed ? <PlusSquare size={18} /> : "Create Job Posting"}
            {sidebarCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {!sidebarCollapsed && (
            <form onSubmit={handleCreateJob} className="space-y-3 p-4">
              <input className="input-modern" name="title" value={form.title} onChange={handleChange} placeholder="Job title" required />
              <input className="input-modern" name="company" value={form.company} onChange={handleChange} placeholder="Company" required />
              <input className="input-modern" name="location" value={form.location} onChange={handleChange} placeholder="Location" required />
              <select className="input-modern" name="type" value={form.type} onChange={handleChange}>
                <option value="full-time">full-time</option>
                <option value="part-time">part-time</option>
                <option value="remote">remote</option>
                <option value="contract">contract</option>
              </select>
              <input className="input-modern" name="salary" value={form.salary} onChange={handleChange} placeholder="Salary range" required />
              <input
                className="input-modern"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="Skills (comma separated)"
                required
              />
              <textarea
                className="input-modern min-h-[110px]"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Job description"
                required
              />
              <motion.button whileHover={reduceMotion ? undefined : { scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} className="btn-primary w-full" type="submit" disabled={saving}>
                {saving ? "Posting..." : "Post Job"}
              </motion.button>
            </form>
          )}
        </motion.aside>

        <div className="space-y-5">
          <section className="glass-card p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">Candidate Ranking</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-2 top-2.5 text-text-muted" />
                  <input
                    className="input-modern pl-8"
                    placeholder="Search candidate"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Filter size={15} className="pointer-events-none absolute left-2 top-2.5 text-text-muted" />
                  <select
                    className="input-modern pl-8"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {ranking.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-5 text-sm text-text-muted">
                Load candidates from any job to see ranking insights here.
              </p>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3">
                {ranking.slice(0, 8).map((candidate, index) => (
                  <motion.article
                    key={candidate._id}
                    variants={item}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    className={`rounded-xl border p-3 ${
                      index < 2
                        ? "border-emerald-400/40 bg-emerald-500/10"
                        : "border-border bg-surface-soft"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                          {(candidate.candidateName || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{candidate.candidateName || "Candidate"}</p>
                          <p className="text-xs text-text-muted">{candidate.candidateEmail}</p>
                        </div>
                      </div>
                      <MatchScoreBadge score={candidate.matchScore || 0} />
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </section>

          <section className="glass-card overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-lg font-semibold">All Jobs</h2>
            </div>

            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="skeleton h-14" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-surface-soft text-left text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Posted</th>
                      <th className="px-4 py-3">Candidates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <React.Fragment key={job._id}>
                        <tr className="border-t border-border hover:bg-surface-soft/60">
                          <td className="px-4 py-3 font-medium">{job.title}</td>
                          <td className="px-4 py-3 text-text-muted">{job.company}</td>
                          <td className="px-4 py-3 text-text-muted">{new Date(job.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <button className="btn-secondary text-sm" onClick={() => handleExpandJob(job._id)}>
                              {expandedJobId === job._id ? "Hide Candidates" : "View Ranked Candidates"}
                            </button>
                          </td>
                        </tr>

                        {expandedJobId === job._id && (
                          <tr className="border-t border-border bg-surface-soft/50">
                            <td colSpan="4" className="px-4 py-3">
                              {loadingCandidates ? (
                                <div className="space-y-2">
                                  <div className="skeleton h-12" />
                                  <div className="skeleton h-12" />
                                </div>
                              ) : (jobCandidates[job._id] || []).length === 0 ? (
                                <p className="text-sm text-text-muted">No applicants for this job yet.</p>
                              ) : (
                                <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                                  {(jobCandidates[job._id] || []).map((candidate) => (
                                    <motion.div
                                      key={candidate._id}
                                      variants={item}
                                      className="rounded-xl border border-border bg-surface p-3"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                          <p className="text-sm font-semibold">{candidate.candidateName}</p>
                                          <p className="text-xs text-text-muted">{candidate.candidateEmail}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <MatchScoreBadge score={candidate.matchScore || 0} />
                                          <select
                                            className="input-modern min-w-[130px]"
                                            value={candidate.status || "pending"}
                                            onChange={(event) => handleStatusChange(candidate._id, event.target.value, job._id)}
                                          >
                                            <option value="pending">pending</option>
                                            <option value="shortlisted">shortlisted</option>
                                            <option value="accepted">accepted</option>
                                            <option value="rejected">rejected</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="mt-3 grid gap-2 text-xs text-text-muted md:grid-cols-2">
                                        <div className="rounded-lg bg-surface-soft p-2">
                                          <p className="font-semibold text-text">Why Good Match</p>
                                          <p className="mt-1">
                                            {candidate.matchExplanation?.summary || "AI explanation pending."}
                                          </p>
                                          {(candidate.matchExplanation?.matchedSkills || []).length > 0 && (
                                            <p className="mt-1">
                                              Matched: {candidate.matchExplanation.matchedSkills.slice(0, 4).join(", ")}
                                            </p>
                                          )}
                                        </div>
                                        <div className="rounded-lg bg-surface-soft p-2">
                                          <p className="font-semibold text-text">Weaknesses</p>
                                          {(candidate.matchExplanation?.missingSkills || []).length > 0 ? (
                                            <p className="mt-1">
                                              Missing: {candidate.matchExplanation.missingSkills.slice(0, 4).join(", ")}
                                            </p>
                                          ) : (
                                            <p className="mt-1">No major skill gaps detected.</p>
                                          )}
                                          {(candidate.resumeFeedback?.suggestions || []).length > 0 && (
                                            <p className="mt-1">Tip: {candidate.resumeFeedback.suggestions[0]}</p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="mt-3 grid gap-2 rounded-lg bg-surface-soft p-3 text-xs text-text-muted md:grid-cols-2">
                                        <div className="space-y-2">
                                          <p className="font-semibold text-text">Schedule Interview</p>
                                          <input
                                            type="datetime-local"
                                            className="input-modern"
                                            value={interviewDrafts[candidate._id]?.scheduledAt || ""}
                                            onChange={(event) => updateInterviewDraft(candidate._id, "scheduledAt", event.target.value)}
                                          />
                                          <select
                                            className="input-modern"
                                            value={interviewDrafts[candidate._id]?.mode || "video"}
                                            onChange={(event) => updateInterviewDraft(candidate._id, "mode", event.target.value)}
                                          >
                                            <option value="video">video</option>
                                            <option value="phone">phone</option>
                                            <option value="onsite">onsite</option>
                                          </select>
                                        </div>
                                        <div className="space-y-2">
                                          <input
                                            className="input-modern"
                                            placeholder="Meeting link (optional)"
                                            value={interviewDrafts[candidate._id]?.meetingLink || ""}
                                            onChange={(event) => updateInterviewDraft(candidate._id, "meetingLink", event.target.value)}
                                          />
                                          <input
                                            className="input-modern"
                                            placeholder="Notes (optional)"
                                            value={interviewDrafts[candidate._id]?.notes || ""}
                                            onChange={(event) => updateInterviewDraft(candidate._id, "notes", event.target.value)}
                                          />
                                          <button
                                            className="btn-primary w-full"
                                            onClick={() => handleScheduleInterview(candidate._id, job._id)}
                                            type="button"
                                          >
                                            Schedule Interview
                                          </button>
                                        </div>
                                      </div>

                                      {candidate.interview?.scheduledAt && (
                                        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                          Scheduled: {new Date(candidate.interview.scheduledAt).toLocaleString()} ({candidate.interview.mode || "video"})
                                        </p>
                                      )}
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>
    </motion.main>
  );
};

export default RecruiterDashboard;
