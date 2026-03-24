import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  getJobs,
  getJobCandidates,
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

  const openToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const loadDashboard = async () => {
    try {
      const jobsRes = await getJobs();
      setJobs(jobsRes.data.jobs || []);
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

  const totalApplicants = Object.values(jobCandidates).flat().length;
  const topScore = ranking[0]?.matchScore || 0;

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
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
        <motion.article variants={item} whileHover={{ y: -4 }} className="glass-card p-5">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-sm">Total Jobs</span>
            <BriefcaseBusiness size={18} />
          </div>
          <p className="mt-3 text-3xl font-bold">{jobs.length}</p>
        </motion.article>
        <motion.article variants={item} whileHover={{ y: -4 }} className="glass-card p-5">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-sm">Loaded Applicants</span>
            <Users size={18} />
          </div>
          <p className="mt-3 text-3xl font-bold">{totalApplicants}</p>
        </motion.article>
        <motion.article variants={item} whileHover={{ y: -4 }} className="glass-card p-5">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-sm">Top Match Score</span>
            <Star size={18} />
          </div>
          <p className="mt-3 text-3xl font-bold">{topScore}%</p>
        </motion.article>
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <motion.aside
          layout
          className="glass-card overflow-hidden"
          animate={{ width: sidebarCollapsed ? 84 : "auto" }}
          transition={{ duration: 0.25 }}
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
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full" type="submit" disabled={saving}>
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
                    whileHover={{ y: -2 }}
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
                                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3"
                                    >
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
