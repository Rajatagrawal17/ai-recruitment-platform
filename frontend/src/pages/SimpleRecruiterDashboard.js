import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import {
  createJob,
  getAnalytics,
  getCompanies,
  getJobCandidates,
  getJobs,
  scheduleInterview,
  updateApplicationStatus,
} from "../services/api";
import Sparkline from "../components/Sparkline";

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
const sheetTabs = [
  { id: "overview", label: "Overview", description: "Summary and workspace" },
  { id: "company", label: "Company", description: "Select hiring company" },
  { id: "jobs", label: "Jobs", description: "Create and manage roles" },
  { id: "candidates", label: "Candidates", description: "Pipeline and actions" },
  { id: "analytics", label: "Analytics", description: "Hiring metrics" },
];

const companyKey = (value = "") => String(value).trim().toLowerCase();

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

const chipGradient = [
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-fuchsia-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

const StatCard = ({ label, value, icon: Icon, accent = "from-cyan-500 to-blue-600" }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    className="rounded-2xl border border-border bg-surface/60 p-4 shadow-sm backdrop-blur-xl"
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
        <p className="mt-2 text-2xl font-bold text-text">{value}</p>
      </div>
      <div className={`rounded-xl bg-gradient-to-br ${accent} p-3 text-white`}>
        <Icon size={18} />
      </div>
    </div>
  </motion.div>
);

const SheetCard = ({ active, title, description, onClick, icon: Icon, counter }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.98 }}
    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
      active ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-border bg-surface/30 hover:bg-surface/50"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <Icon size={15} className={active ? "text-primary" : "text-text-muted"} />
          <p className="text-sm font-semibold text-text">{title}</p>
        </div>
        <p className="mt-1 text-xs text-text-muted">{description}</p>
      </div>
      <span className="rounded-full bg-surface/60 px-2 py-1 text-[11px] text-text-muted">{counter}</span>
    </div>
  </motion.button>
);

const CompanyBadge = ({ company, active, onClick }) => (
  <motion.button
    type="button"
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`rounded-2xl border p-3 text-left transition-colors ${
      active ? "border-primary bg-primary/10" : "border-border bg-surface/30 hover:bg-surface/50"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${company._color || chipGradient[0]} text-sm font-bold text-white`}>
        {(company.name || "C").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text">{company.name}</p>
        <p className="truncate text-xs text-text-muted">{company.industry || company.location || "Company workspace"}</p>
      </div>
    </div>
  </motion.button>
);

const CandidateRow = ({ candidate, onStatusChange, onSchedule }) => {
  const [dateTime, setDateTime] = useState("");
  const [mode, setMode] = useState("video");
  const [showDetail, setShowDetail] = useState(false);

  return (
    <motion.div layout className="rounded-2xl border border-border bg-surface/40 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-text">{candidate.candidateName || "Candidate"}</p>
          <p className="truncate text-sm text-text-muted">{candidate.candidateEmail || "No email"}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{candidate.status || "pending"}</span>
            <span className="text-xs text-text-muted">Match {candidate.matchScore || 0}%</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select className="input-modern text-sm" value={candidate.status || "pending"} onChange={(e) => onStatusChange(candidate._id, e.target.value)}>
            <option value="pending">pending</option>
            <option value="shortlisted">shortlisted</option>
            <option value="accepted">accepted</option>
            <option value="rejected">rejected</option>
          </select>
          <input type="datetime-local" className="input-modern text-sm" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          <select className="input-modern text-sm" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="video">video</option>
            <option value="phone">phone</option>
            <option value="onsite">onsite</option>
          </select>
          <button type="button" className="btn-secondary text-sm" onClick={() => onSchedule(candidate._id, dateTime, mode)}>
            Schedule
          </button>
          {candidate.resume && (
            <a href={candidate.resume} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
              Resume
            </a>
          )}
          <button type="button" className="btn-secondary text-sm" onClick={() => setShowDetail((s) => !s)}>
            Details
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDetail && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface/20 p-3 text-sm">
            <p className="font-semibold text-text">Candidate Profile</p>
            <p className="mt-1 text-text-muted">Skills: {(candidate.extractedSkills || candidate.parsedResume?.skills || []).join(", ") || "—"}</p>
            <p className="mt-1 text-text-muted">Experience: {candidate.yearsExperience || candidate.experience || "—"} years</p>
            <p className="mt-3 text-xs leading-relaxed text-text-muted line-clamp-4">{candidate.resumeText || candidate.parsedResume?.summary || "No resume text available"}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SimpleRecruiterDashboard = () => {
  const [activeSheet, setActiveSheet] = useState("overview");
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
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

  const notify = useCallback((type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice({ type: "", message: "" }), 2200);
  }, []);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch first page immediately for fast render
      const [firstJobsRes, companiesRes, analyticsRes] = await Promise.all([
        getJobs(),
        getCompanies().catch(() => ({ data: { companies: [] } })),
        getAnalytics().catch(() => ({ data: { analytics: null } })),
      ]);

      const firstJobs = extractJobs(firstJobsRes);
      const totalPages = firstJobsRes?.data?.pages || 1;
      const nextCompanies = Array.isArray(companiesRes?.data?.companies) ? companiesRes.data.companies : [];
      setJobs(firstJobs);
      setCompanies(nextCompanies);
      setAnalytics(analyticsRes?.data?.analytics || null);

      if (!selectedCompany) {
        const firstCompany = nextCompanies[0]?.name || firstJobs[0]?.company || "";
        setSelectedCompany(firstCompany);
      }
      if (!selectedJobId && firstJobs[0]?._id) {
        setSelectedJobId(firstJobs[0]._id);
      }

      setLoading(false);

      // Load remaining pages in background
      if (totalPages > 1) {
        let allJobs = [...firstJobs];
        for (let p = 2; p <= totalPages; p++) {
          try {
            const res = await getJobs();
            allJobs = [...allJobs, ...extractJobs(res)];
            setJobs([...allJobs]);
          } catch {
            break;
          }
        }
      }
    } catch (error) {
      notify("error", error?.response?.data?.message || "Failed to load workspace");
      setLoading(false);
    }
  }, [notify, selectedCompany, selectedJobId]);


  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const companyOptions = useMemo(() => {
    const seen = new Map();
    [...companies, ...jobs.map((job) => ({ name: job.company, location: job.location, industry: job.industry, website: job.website }))]
      .filter((company) => company?.name)
      .forEach((company, index) => {
        const key = companyKey(company.name);
        if (!seen.has(key)) {
          seen.set(key, { ...company, _color: chipGradient[index % chipGradient.length] });
        }
      });
    return [...seen.values()];
  }, [companies, jobs]);

  const workspaceJobs = useMemo(() => {
    if (!selectedCompany || selectedCompany === "all") return jobs;
    return jobs.filter((job) => companyKey(job.company) === companyKey(selectedCompany));
  }, [jobs, selectedCompany]);

  const workspaceCompanyMeta = useMemo(() => {
    if (!selectedCompany || selectedCompany === "all") return null;
    return companyOptions.find((company) => companyKey(company.name) === companyKey(selectedCompany)) || null;
  }, [companyOptions, selectedCompany]);

  const selectedJob = useMemo(() => workspaceJobs.find((job) => job._id === selectedJobId) || workspaceJobs[0] || null, [selectedJobId, workspaceJobs]);

  useEffect(() => {
    if (workspaceJobs.length === 0) {
      setSelectedJobId("");
      return;
    }
    if (!workspaceJobs.some((job) => job._id === selectedJobId)) {
      setSelectedJobId(workspaceJobs[0]._id);
    }
  }, [selectedJobId, workspaceJobs]);

  const loadCandidates = useCallback(async (jobId, targetPage = 1) => {
    if (!jobId) {
      setCandidates([]);
      return;
    }

    setLoadingCandidates(true);
    try {
      const res = await getJobCandidates(jobId, { page: targetPage, limit: 12 });
      setCandidates(extractCandidates(res));
      setTotalPages(res?.data?.meta?.totalPages || 1);
    } catch (error) {
      setCandidates([]);
      notify("error", error?.response?.data?.message || "Failed to load candidates");
    } finally {
      setLoadingCandidates(false);
    }
  }, [notify]);

  useEffect(() => {
    loadCandidates(selectedJobId, page);
  }, [selectedJobId, page, loadCandidates]);

  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = [...candidates];

    if (q) {
      next = next.filter((candidate) => `${candidate.candidateName || ""} ${candidate.candidateEmail || ""}`.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      next = next.filter((candidate) => (candidate.status || "pending") === statusFilter);
    }

    next.sort((a, b) => {
      if (sortBy === "name") return (a.candidateName || "").localeCompare(b.candidateName || "");
      if (sortBy === "date") return new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0);
      return (b.matchScore || 0) - (a.matchScore || 0);
    });

    return next;
  }, [candidates, query, sortBy, statusFilter]);

  const exportCSV = useCallback(() => {
    const rows = filteredCandidates.map((candidate) => ({
      name: candidate.candidateName || "",
      email: candidate.candidateEmail || "",
      matchScore: candidate.matchScore || 0,
      status: candidate.status || "",
      appliedAt: candidate.appliedAt || candidate.createdAt || "",
    }));

    const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map((row) => Object.values(row).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(selectedJob?.title || "candidates").replace(/[^a-z0-9_-]/gi, "_")}_candidates.csv`;
    if (document.body) {
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
    URL.revokeObjectURL(url);
  }, [filteredCandidates, selectedJob]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      notify("error", "Title and description are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        company: selectedCompany && selectedCompany !== "all" ? selectedCompany : form.company,
        skills: String(form.skills || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await createJob(payload);
      setForm(selectedCompany && selectedCompany !== "all" ? { ...initialForm, company: selectedCompany } : initialForm);
      setShowJobForm(false);
      notify("success", "Job posted successfully");
      await loadWorkspace();
    } catch (error) {
      notify("error", error?.response?.data?.message || "Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    if (!selectedJobId) return;
    try {
      await updateApplicationStatus(applicationId, status);
      notify("success", `Candidate marked as ${status}`);
      await loadCandidates(selectedJobId, page);
    } catch (error) {
      notify("error", error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleSchedule = async (applicationId, scheduledAt, mode) => {
    if (!selectedJobId) return;
    if (!scheduledAt) {
      notify("error", "Choose interview date and time first");
      return;
    }

    try {
      await scheduleInterview(applicationId, {
        scheduledAt,
        mode,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
      notify("success", "Interview scheduled");
      await loadCandidates(selectedJobId, page);
    } catch (error) {
      notify("error", error?.response?.data?.message || "Failed to schedule interview");
    }
  };

  const createICS = ({ title, description, startISO, durationMin = 30, location = "" }) => {
    const start = new Date(startISO);
    const end = new Date(start.getTime() + durationMin * 60000);
    const pad = (value) => String(value).padStart(2, "0");
    const format = (date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
    return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Recruiter Workspace//EN\nBEGIN:VEVENT\nUID:${Math.random().toString(36).slice(2)}\nDTSTAMP:${format(new Date())}\nDTSTART:${format(start)}\nDTEND:${format(end)}\nSUMMARY:${title}\nDESCRIPTION:${description}\nLOCATION:${location}\nEND:VEVENT\nEND:VCALENDAR`;
  };

  const downloadICS = ({ title, description, startISO, durationMin = 30, location = "" }) => {
    const blob = new Blob([createICS({ title, description, startISO, durationMin, location })], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.replace(/[^a-z0-9]/gi, "_") || "event"}.ics`;
    if (document.body) {
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
    URL.revokeObjectURL(url);
  };

  const openGoogleCalendar = ({ title, description, startISO, durationMin = 30, location = "" }) => {
    const start = new Date(startISO);
    const end = new Date(start.getTime() + durationMin * 60000);
    const fmt = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, "");
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      details: description,
      location,
      dates: `${fmt(start)}/${fmt(end)}`,
    });
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank");
  };

  const totalJobs = workspaceJobs.length;
  const openJobs = analytics?.openJobs ?? workspaceJobs.filter((job) => job.status !== "closed").length;
  const pendingReviews = filteredCandidates.filter((candidate) => (candidate.status || "pending") === "pending").length;
  const topScore = filteredCandidates[0]?.matchScore || 0;
  const activeCompanyLabel = workspaceCompanyMeta?.name || selectedCompany || "All companies";

  const tabCounts = {
    jobs: workspaceJobs.length,
    candidates: filteredCandidates.length,
    analytics: analytics?.totalApplications || 0,
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,15,32,0.96))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
              <Sparkles size={12} /> Company Workspace
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl gradient-text">Recruiter Dashboard</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted md:text-base">
              A sheet-based hiring workspace built for one company at a time. Move between overview, company, jobs, candidates, and analytics without crowding everything into one screen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn-outline text-sm" onClick={loadWorkspace}>
              Refresh
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary inline-flex items-center gap-2" onClick={() => setShowJobForm((s) => !s)}>
              <Plus size={16} /> {showJobForm ? "Close Job Sheet" : "Open Job Sheet"}
            </motion.button>
          </div>
        </div>

        {notice.message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 rounded-2xl px-4 py-3 text-sm ${notice.type === "success" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
            {notice.message}
          </motion.div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Workspace" value={activeCompanyLabel} icon={Briefcase} accent="from-cyan-500 to-blue-600" />
          <StatCard label="Jobs" value={totalJobs} icon={Briefcase} accent="from-indigo-500 to-violet-600" />
          <StatCard label="Open Roles" value={openJobs} icon={CheckCircle2} accent="from-emerald-500 to-teal-600" />
          <StatCard label="Top Match" value={`${topScore}%`} icon={Users} accent="from-amber-500 to-orange-600" />
          <StatCard label="Pending Reviews" value={pendingReviews} icon={Clock3} accent="from-rose-500 to-pink-600" />
        </div>
      </section>

      <section className="mt-5 rounded-[28px] border border-border bg-surface/40 p-4 backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-5">
          {sheetTabs.map((sheet) => (
            <SheetCard
              key={sheet.id}
              active={activeSheet === sheet.id}
              title={sheet.label}
              description={sheet.id === "jobs" ? `${tabCounts.jobs} roles` : sheet.id === "candidates" ? `${tabCounts.candidates} candidates` : sheet.id === "analytics" ? `${tabCounts.analytics} applications` : sheet.description}
              counter={sheet.id === "jobs" ? tabCounts.jobs : sheet.id === "candidates" ? tabCounts.candidates : sheet.id === "analytics" ? tabCounts.analytics : "UI"}
              icon={sheet.id === "overview" ? Sparkles : sheet.id === "company" ? Briefcase : sheet.id === "jobs" ? Briefcase : sheet.id === "candidates" ? Users : Calendar}
              onClick={() => setActiveSheet(sheet.id)}
            />
          ))}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {activeSheet === "overview" && (
          <motion.section key="overview" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22, ease: "easeOut" }} className="mt-5 rounded-[28px] border border-border bg-surface/40 p-5 backdrop-blur-xl">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Workspace Snapshot</p>
                <h2 className="mt-2 text-2xl font-bold text-text">{activeCompanyLabel}</h2>
                <p className="mt-2 max-w-2xl text-sm text-text-muted">
                  Use the sheet tabs to keep the interface calm and role-focused. Company, job creation, candidate handling, and analytics are all separated into distinct sheets.
                </p>
              </div>
              <div className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${workspaceCompanyMeta?._color || chipGradient[0]} p-5 text-white shadow-lg`}>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">Active Company</p>
                <p className="mt-2 text-2xl font-bold">{activeCompanyLabel}</p>
                <p className="mt-1 text-sm text-white/80">{workspaceCompanyMeta?.industry || workspaceCompanyMeta?.location || "Hiring workspace"}</p>
              </div>
            </div>
          </motion.section>
        )}

        {activeSheet === "company" && (
          <motion.section key="company" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22, ease: "easeOut" }} className="mt-5 rounded-[28px] border border-border bg-surface/40 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-text">Company Sheet</h2>
                <p className="text-sm text-text-muted">Switch the company workspace. Only jobs from the selected company are shown in the other sheets.</p>
              </div>
              <div className="rounded-full border border-border bg-surface/30 px-3 py-1 text-xs text-text-muted">{companyOptions.length} companies</div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedCompany("all"); setSelectedJobId(""); setPage(1); }} className={`rounded-2xl border px-4 py-4 text-left ${!selectedCompany || selectedCompany === "all" ? "border-primary bg-primary/10" : "border-border bg-surface/30 hover:bg-surface/50"}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-variant text-lg font-bold">∞</div>
                  <div>
                    <p className="font-semibold text-text">All Companies</p>
                    <p className="text-xs text-text-muted">Combined view</p>
                  </div>
                </div>
              </motion.button>
              {companyOptions.map((company, index) => (
                <CompanyBadge key={company.name} company={{ ...company, _color: company._color || chipGradient[index % chipGradient.length] }} active={companyKey(selectedCompany) === companyKey(company.name)} onClick={() => { setSelectedCompany(company.name); setSelectedJobId(""); setPage(1); }} />
              ))}
            </div>
          </motion.section>
        )}

        {activeSheet === "jobs" && (
          <motion.section key="jobs" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22, ease: "easeOut" }} className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[28px] border border-border bg-surface/40 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Job Sheet</p>
                  <h2 className="mt-1 text-xl font-bold text-text">Create a role for {activeCompanyLabel}</h2>
                </div>
                <Briefcase size={18} className="text-primary" />
              </div>
              <form onSubmit={handleCreateJob} className="mt-4 grid gap-3 md:grid-cols-2">
                <input className="input-modern" placeholder="Job title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
                <input className="input-modern" placeholder="Company" value={selectedCompany && selectedCompany !== "all" ? selectedCompany : form.company} readOnly={Boolean(selectedCompany && selectedCompany !== "all")} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} />
                <input className="input-modern" placeholder="Location" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
                <select className="input-modern" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                  <option value="full-time">full-time</option>
                  <option value="part-time">part-time</option>
                  <option value="contract">contract</option>
                  <option value="remote">remote</option>
                  <option value="hybrid">hybrid</option>
                </select>
                <input className="input-modern" placeholder="Salary" value={form.salary} onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))} />
                <input className="input-modern" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))} />
                <textarea className="input-modern min-h-[120px] md:col-span-2" placeholder="Job description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                <button type="submit" disabled={saving} className="btn-primary md:col-span-2">
                  {saving ? "Posting..." : "Create Job"}
                </button>
              </form>
            </div>

            <div className="rounded-[28px] border border-border bg-surface/40 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Role Shelf</p>
                  <h2 className="mt-1 text-xl font-bold text-text">Jobs in {activeCompanyLabel}</h2>
                </div>
                <ChevronRight size={18} className="text-primary" />
              </div>
              <div className="mt-4 space-y-3 max-h-[560px] overflow-auto pr-1">
                {loading ? (
                  <p className="text-sm text-text-muted">Loading jobs...</p>
                ) : workspaceJobs.length === 0 ? (
                  <p className="text-sm text-text-muted">No jobs found for this company.</p>
                ) : (
                  workspaceJobs.map((job) => (
                    <motion.button key={job._id} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedJobId(job._id); setPage(1); setActiveSheet("candidates"); }} className={`w-full rounded-2xl border p-4 text-left transition-colors ${selectedJobId === job._id ? "border-primary bg-primary/10" : "border-border bg-surface/30 hover:bg-surface/50"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text">{job.title}</p>
                          <p className="truncate text-xs text-text-muted">{job.company || "Company"} • {job.location || "Location"}</p>
                        </div>
                        <Sparkline seed={job._id} width={92} height={28} />
                      </div>
                      <p className="mt-2 text-xs text-text-muted line-clamp-2">{job.type || "full-time"} • {job.skills?.join(", ") || "No skills listed"}</p>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </motion.section>
        )}

        {activeSheet === "candidates" && (
          <motion.section key="candidates" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22, ease: "easeOut" }} className="mt-5 rounded-[28px] border border-border bg-surface/40 p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Candidate Sheet</p>
                <h2 className="mt-1 text-xl font-bold text-text">Pipeline for {selectedJob?.title || "selected role"}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="btn-secondary text-sm" onClick={exportCSV}>Export CSV</button>
                <div className="rounded-full border border-border bg-surface/30 px-3 py-1 text-xs text-text-muted">Page {page} of {totalPages}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-3 text-text-muted" />
                <input className="input-modern w-full pl-9" placeholder="Search candidate" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
              <label className="relative">
                <Filter size={14} className="pointer-events-none absolute left-3 top-3 text-text-muted" />
                <select className="input-modern w-full pl-9" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <select className="input-modern w-full" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="score">Sort: score</option>
                <option value="name">Sort: name</option>
                <option value="date">Sort: date</option>
              </select>
            </div>

            <div className="mt-3 rounded-2xl border border-border bg-surface/20 px-3 py-2 text-xs text-text-muted">
              Workspace: {activeCompanyLabel} • Sheet: Candidates
            </div>

            <div className="mt-4 space-y-3">
              {!selectedJobId ? (
                <p className="text-sm text-text-muted">Select a role from the Jobs sheet to open candidate review.</p>
              ) : loadingCandidates ? (
                <p className="text-sm text-text-muted">Loading candidates...</p>
              ) : filteredCandidates.length === 0 ? (
                <p className="text-sm text-text-muted">No candidates found for current filters.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <button className="btn-secondary text-sm" onClick={() => page > 1 && setPage((p) => p - 1)} disabled={page <= 1}>Prev</button>
                    <button className="btn-secondary text-sm" onClick={() => page < totalPages && setPage((p) => p + 1)} disabled={page >= totalPages}>Next</button>
                  </div>
                  <div className="space-y-3">
                    {filteredCandidates.map((candidate) => (
                      <CandidateRow key={candidate._id} candidate={candidate} onStatusChange={handleStatusChange} onSchedule={handleSchedule} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.section>
        )}

        {activeSheet === "analytics" && (
          <motion.section key="analytics" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22, ease: "easeOut" }} className="mt-5 rounded-[28px] border border-border bg-surface/40 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Analytics Sheet</p>
                <h2 className="mt-1 text-xl font-bold text-text">Hiring metrics for {activeCompanyLabel}</h2>
              </div>
              <Calendar size={18} className="text-primary" />
            </div>
            {analytics ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-border bg-surface/30 p-4"><p className="text-xs uppercase tracking-wide text-text-muted">Applications</p><p className="mt-2 text-2xl font-bold text-text">{analytics.totalApplications || 0}</p></div>
                <div className="rounded-2xl border border-border bg-surface/30 p-4"><p className="text-xs uppercase tracking-wide text-text-muted">Acceptance</p><p className="mt-2 text-2xl font-bold text-text">{analytics.acceptanceRate || 0}%</p></div>
                <div className="rounded-2xl border border-border bg-surface/30 p-4"><p className="text-xs uppercase tracking-wide text-text-muted">Average Match</p><p className="mt-2 text-2xl font-bold text-text">{analytics.averageMatchScore || 0}%</p></div>
                <div className="rounded-2xl border border-border bg-surface/30 p-4"><p className="text-xs uppercase tracking-wide text-text-muted">Time to Hire</p><p className="mt-2 text-2xl font-bold text-text">{analytics.avgTimeToHire || 0} days</p></div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-text-muted">Analytics will appear once the backend returns hiring data.</p>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
};

export default SimpleRecruiterDashboard;
