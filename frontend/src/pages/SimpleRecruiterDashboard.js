import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock3,
  Filter,
  Plus,
  Search,
  Users,
} from "lucide-react";
import {
  createJob,
  getAnalytics,
  getJobCandidates,
  getJobs,
  scheduleInterview,
  updateApplicationStatus,
} from "../services/api";

const initialForm = {
  title: "",
  description: "",
  company: "",
  location: "",
  type: "full-time",
  salary: "",
  skills: "",
};

const statusOptions = ["all", "pending", "shortlisted", "accepted", "rejected"];

const extractJobs = (res) => {
  const payload = res?.data;
  if (Array.isArray(payload?.jobs)) return payload.jobs;
  if (Array.isArray(payload)) return payload;
  return [];
};

const extractCandidates = (res) => {
  const payload = res?.data;
  if (Array.isArray(payload?.matchedCandidates)) return payload.matchedCandidates;
  if (Array.isArray(payload?.candidates)) return payload.candidates;
  if (Array.isArray(payload)) return payload;
  return [];
};

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-border bg-surface/60 p-4">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <Icon size={18} className="text-primary" />
    </div>
    <p className="mt-3 text-2xl font-bold text-text">{value}</p>
  </div>
);

const CandidateRow = ({ candidate, onStatusChange, onSchedule }) => {
  const [dateTime, setDateTime] = useState("");
  const [mode, setMode] = useState("video");
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-surface/40 p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="truncate font-semibold text-text">{candidate.candidateName || "Candidate"}</p>
          <p className="truncate text-sm text-text-muted">{candidate.candidateEmail || "No email"}</p>
          <p className="mt-1 text-xs text-text-muted">Match: {candidate.matchScore || 0}%</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input-modern text-sm"
            value={candidate.status || "pending"}
            onChange={(e) => onStatusChange(candidate._id, e.target.value)}
          >
            <option value="pending">pending</option>
            <option value="shortlisted">shortlisted</option>
            <option value="accepted">accepted</option>
            <option value="rejected">rejected</option>
          </select>

          <input
            type="datetime-local"
            className="input-modern text-sm"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
          <select className="input-modern text-sm" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="video">video</option>
            <option value="phone">phone</option>
            <option value="onsite">onsite</option>
          </select>
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => onSchedule(candidate._id, dateTime, mode)}
          >
            Schedule
          </button>

          {candidate.resume && (
            <a href={candidate.resume} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
              Download Resume
            </a>
          )}

          <button className="btn-secondary text-sm" onClick={() => setShowDetail((s) => !s)}>
            Details
          </button>
        </div>
      </div>

      {candidate.interview?.scheduledAt && (
        <p className="mt-2 text-xs text-emerald-300">
          Interview: {new Date(candidate.interview.scheduledAt).toLocaleString()} ({candidate.interview.mode || "video"})
        </p>
      )}

      {showDetail && (
        <div className="mt-3 rounded-md border border-border p-3 bg-surface/20 text-sm">
          <p className="font-semibold">Profile</p>
          <p className="text-text-muted">Skills: {(candidate.extractedSkills || candidate.parsedResume?.skills || []).join(", ") || "—"}</p>
          <p className="mt-1">Experience: {candidate.yearsExperience || candidate.experience || "—"} years</p>
          <div className="mt-2">
            <p className="font-semibold">Resume snippet</p>
            <p className="text-xs text-text-muted line-clamp-4">{candidate.resumeText || candidate.parsedResume?.summary || "No resume text available"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SimpleRecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  const [showJobForm, setShowJobForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  const [notice, setNotice] = useState({ type: "", message: "" });

  const setMessage = useCallback((type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => {
      setNotice({ type: "", message: "" });
    }, 2200);
  }, []);

  const loadJobsAndAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, analyticsRes] = await Promise.all([
        getJobs(),
        getAnalytics().catch(() => ({ data: { analytics: null } })),
      ]);

      const nextJobs = extractJobs(jobsRes);
      setJobs(nextJobs);
      setAnalytics(analyticsRes?.data?.analytics || null);

      if (nextJobs.length > 0 && !selectedJobId) {
        setSelectedJobId(nextJobs[0]._id);
      }
    } catch (error) {
      setMessage("error", error?.response?.data?.message || "Failed to load recruiter data");
    } finally {
      setLoading(false);
    }
  }, [selectedJobId, setMessage]);

  const loadCandidates = useCallback(async (jobId) => {
    if (!jobId) {
      setCandidates([]);
      return;
    }

    setLoadingCandidates(true);
    try {
      const res = await getJobCandidates(jobId, {
        sortBy,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: query || undefined,
        page,
        limit: 12,
      });
      setCandidates(extractCandidates(res));
      const meta = res?.data?.meta || {};
      setPage(meta.page || 1);
      setTotalPages(meta.totalPages || 1);
    } catch (error) {
      setMessage("error", error?.response?.data?.message || "Failed to load candidates");
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  }, [query, setMessage, sortBy, statusFilter]);

  useEffect(() => {
    loadJobsAndAnalytics();
  }, [loadJobsAndAnalytics]);

  useEffect(() => {
    loadCandidates(selectedJobId);
  }, [selectedJobId, loadCandidates]);

  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = [...candidates];

    if (q) {
      next = next.filter((c) => {
        const text = `${c.candidateName || ""} ${c.candidateEmail || ""}`.toLowerCase();
        return text.includes(q);
      });
    }

    if (statusFilter !== "all") {
      next = next.filter((c) => (c.status || "pending") === statusFilter);
    }

    if (sortBy === "name") {
      next.sort((a, b) => (a.candidateName || "").localeCompare(b.candidateName || ""));
    } else if (sortBy === "date") {
      next.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
    } else {
      next.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return next;
  }, [candidates, query, sortBy, statusFilter]);

  // CSV export
  const exportCSV = useCallback(() => {
    const rows = filteredCandidates.map((c) => ({
      name: c.candidateName || "",
      email: c.candidateEmail || "",
      matchScore: c.matchScore || 0,
      status: c.status || "",
      appliedAt: c.appliedAt || c.createdAt || "",
    }));

    const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(jobs.find((j) => j._id === selectedJobId)?.title || "candidates").replace(/[^a-z0-9_-]/gi, "_")}_candidates.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [filteredCandidates, jobs, selectedJobId]);

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.company.trim() || !form.description.trim()) {
      setMessage("error", "Title, company and description are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: String(form.skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await createJob(payload);
      setForm(initialForm);
      setShowJobForm(false);
      setMessage("success", "Job posted successfully");
      await loadJobsAndAnalytics();
    } catch (error) {
      setMessage("error", error?.response?.data?.message || "Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    if (!selectedJobId) return;
    try {
      await updateApplicationStatus(applicationId, status);
      setMessage("success", `Candidate marked as ${status}`);
      await loadCandidates(selectedJobId);
    } catch (error) {
      setMessage("error", error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleSchedule = async (applicationId, scheduledAt, mode) => {
    if (!selectedJobId) return;
    if (!scheduledAt) {
      setMessage("error", "Choose interview date and time first");
      return;
    }

    try {
      await scheduleInterview(applicationId, {
        scheduledAt,
        mode,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
      setMessage("success", "Interview scheduled");
      await loadCandidates(selectedJobId);
    } catch (error) {
      setMessage("error", error?.response?.data?.message || "Failed to schedule interview");
    }
  };

  const totalJobs = jobs.length;
  const openJobs = analytics?.openJobs ?? jobs.filter((j) => j.status !== "closed").length;
  const topScore = filteredCandidates[0]?.matchScore || 0;
  const pendingReviews = filteredCandidates.filter((c) => (c.status || "pending") === "pending").length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="rounded-2xl border border-border bg-surface/40 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Recruiter Dashboard</h1>
            <p className="mt-1 text-sm text-text-muted">
              Lightweight mode: faster loading, stable updates, no heavy animations.
            </p>
          </div>
          <button className="btn-primary inline-flex items-center gap-2" onClick={() => setShowJobForm((s) => !s)}>
            <Plus size={16} /> {showJobForm ? "Close" : "Post Job"}
          </button>
        </div>

        {notice.message && (
          <div
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${
              notice.type === "success" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {notice.message}
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <StatCard label="Total Jobs" value={totalJobs} icon={Briefcase} />
          <StatCard label="Open Jobs" value={openJobs} icon={CheckCircle2} />
          <StatCard label="Top Match" value={`${topScore}%`} icon={Users} />
          <StatCard label="Pending Reviews" value={pendingReviews} icon={Clock3} />
        </div>
      </section>

      {showJobForm && (
        <section className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
          <h2 className="text-lg font-semibold text-text">Create Job</h2>
          <form onSubmit={handleCreateJob} className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="input-modern" placeholder="Job title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <input className="input-modern" placeholder="Company" value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
            <input className="input-modern" placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
            <select className="input-modern" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="full-time">full-time</option>
              <option value="part-time">part-time</option>
              <option value="contract">contract</option>
              <option value="remote">remote</option>
              <option value="hybrid">hybrid</option>
            </select>
            <input className="input-modern" placeholder="Salary e.g. 8 LPA - 12 LPA" value={form.salary} onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))} />
            <input className="input-modern" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} />
            <textarea className="input-modern min-h-[110px] md:col-span-2" placeholder="Job description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <button type="submit" disabled={saving} className="btn-primary md:col-span-2">
              {saving ? "Posting..." : "Create Job"}
            </button>
          </form>
        </section>
      )}

      <section className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-border bg-surface/40 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Jobs</h2>
          <div className="mt-3 space-y-2 max-h-[560px] overflow-auto pr-1">
            {loading ? (
              <p className="text-sm text-text-muted">Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-text-muted">No jobs found.</p>
            ) : (
              jobs.map((job) => (
                <button
                  key={job._id}
                  type="button"
                  onClick={() => setSelectedJobId(job._id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedJobId === job._id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface/30 hover:bg-surface/50"
                  }`}
                >
                  <p className="font-semibold text-text line-clamp-1">{job.title}</p>
                  <p className="text-xs text-text-muted line-clamp-1">{job.company || "Company"}</p>
                  <p className="mt-1 text-xs text-text-muted line-clamp-1">{job.location || "Location"} • {job.type || "type"}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-text">Candidates</h2>
            <div className="grid w-full gap-2 md:w-auto md:grid-cols-3">
              <label className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-3 text-text-muted" />
                <input
                  className="input-modern w-full pl-9"
                  placeholder="Search candidate"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label className="relative">
                <Filter size={14} className="pointer-events-none absolute left-3 top-3 text-text-muted" />
                <select className="input-modern w-full pl-9" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <select className="input-modern w-full" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="score">Sort: score</option>
                <option value="name">Sort: name</option>
                <option value="date">Sort: date</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {!selectedJobId ? (
              <p className="text-sm text-text-muted">Select a job to view candidates.</p>
            ) : loadingCandidates ? (
              <p className="text-sm text-text-muted">Loading candidates...</p>
            ) : filteredCandidates.length === 0 ? (
              <p className="text-sm text-text-muted">No candidates found for current filters.</p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <button onClick={exportCSV} className="btn-secondary text-sm">Export CSV</button>
                    <div className="text-xs text-text-muted">Page {page} of {totalPages}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-secondary text-sm"
                      onClick={() => {
                        if (page > 1) setPage((p) => p - 1);
                      }}
                      disabled={page <= 1}
                    >
                      Prev
                    </button>
                    <button
                      className="btn-secondary text-sm"
                      onClick={() => {
                        if (page < totalPages) setPage((p) => p + 1);
                      }}
                      disabled={page >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {filteredCandidates.map((candidate) => (
                  <CandidateRow
                    key={candidate._id}
                    candidate={candidate}
                    onStatusChange={handleStatusChange}
                    onSchedule={handleSchedule}
                  />
                ))}
              </>
            )}
          </div>

          {analytics && (
            <div className="mt-5 rounded-xl border border-border bg-surface/20 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Quick Analytics</p>
              <div className="grid gap-2 text-sm md:grid-cols-4">
                <div className="rounded-lg bg-surface/40 p-2">Applications: {analytics.totalApplications || 0}</div>
                <div className="rounded-lg bg-surface/40 p-2">Acceptance: {analytics.acceptanceRate || 0}%</div>
                <div className="rounded-lg bg-surface/40 p-2">Avg Match: {analytics.averageMatchScore || 0}%</div>
                <div className="rounded-lg bg-surface/40 p-2">Time to Hire: {analytics.avgTimeToHire || 0} days</div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                <Calendar size={14} />
                Updated with live backend analytics
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default SimpleRecruiterDashboard;
