import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion, useInView } from "framer-motion";
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
  TrendingUp,
  Zap,
  X,
  CheckSquare,
  SquareCheck,
  AlertCircle,
  Clock,
  Briefcase,
  DollarSign,
  MapPin,
  Send,
  Download,
} from "lucide-react";
import MatchScoreBadge from "../components/MatchScoreBadge";
import {
  addApplicationNote,
  createJob,
  getAnalytics,
  getApplicationTimeline,
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
const jobTypeOptions = ["full-time", "part-time", "remote", "contract", "hybrid"];
const interviewModes = ["video", "phone", "onsite"];

// Optimized scroll-triggered animations
const scrollContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const scrollItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Utility functions
const getStatusColor = (status) => {
  const colors = {
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    shortlisted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    accepted: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    rejected: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  };
  return colors[status] || colors.pending;
};

// Reusable stat card component
const StatCard = ({ label, value, icon: Icon, color, inView, delay }) => {
  return (
    <motion.article
      variants={scrollItem}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-card p-5 group cursor-pointer backdrop-blur-xl border border-white/10"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted uppercase tracking-wide">{label}</span>
        <motion.div
          whileHover={{ rotate: 12, scale: 1.15 }}
          className={`bg-gradient-to-br ${color} p-3 rounded-lg text-white shadow-lg`}
        >
          <Icon size={20} />
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay, duration: 0.4 }}
        className="mt-4 text-4xl font-bold tracking-tight"
      >
        {value}
      </motion.p>
    </motion.article>
  );
};

// Candidate row component with batch select
const CandidateRow = ({ candidate, job, selected, onSelect, onStatusChange, onScheduleInterview, interviewDraft, onInterviewDraftChange }) => {
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);

  const loadNotes = async () => {
    if (!candidate?._id) return;
    setLoadingNotes(true);
    try {
      const res = await getApplicationTimeline(candidate._id);
      setNotes(res.data.timeline || []);
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addApplicationNote(candidate._id, { text: newNote.trim() });
      setNewNote("");
      await loadNotes();
    } catch (err) {
      console.error("Failed to add note", err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg border p-4 transition-all ${
        selected
          ? "border-primary bg-primary/10 ring-2 ring-primary/50"
          : "border-border hover:border-primary/40 hover:bg-surface-soft/40"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Header row with checkbox and candidate info */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(candidate._id)}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                selected
                  ? "bg-primary text-background"
                  : "bg-surface-variant text-text-muted hover:bg-primary/40"
              }`}
              aria-label={selected ? "Deselect candidate" : "Select candidate"}
            >
              {selected ? <CheckSquare size={20} /> : <SquareCheck size={20} />}
            </motion.button>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 font-semibold text-background text-sm shadow-lg"
              >
                {(candidate.candidateName || "C").charAt(0).toUpperCase()}
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text truncate">{candidate.candidateName || "Candidate"}</p>
                <p className="text-xs text-text-muted truncate">{candidate.candidateEmail}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <MatchScoreBadge score={candidate.matchScore || 0} />
            <motion.select
              whileHover={{ scale: 1.02 }}
              className={`input-modern min-w-[110px] text-sm ${getStatusColor(candidate.status || "pending")}`}
              value={candidate.status || "pending"}
              onChange={(e) => onStatusChange(candidate._id, e.target.value, job._id)}
              aria-label="Change candidate status"
            >
              <option value="pending">pending</option>
              <option value="shortlisted">shortlisted</option>
              <option value="accepted">accepted</option>
              <option value="rejected">rejected</option>
            </motion.select>
          </div>
        </div>

        {/* Match explanation cards */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.1 }}
          className="grid gap-2 md:grid-cols-2 text-xs"
        >
          <div className="rounded-lg bg-surface-soft/60 border border-emerald-500/20 p-3">
            <p className="font-semibold text-emerald-300 flex items-center gap-2">
              <Star size={14} /> Why Good Match
            </p>
            <p className="mt-1 text-text-muted line-clamp-2">
              {candidate.matchExplanation?.summary || "Strong candidate alignment detected."}
            </p>
            {(candidate.matchExplanation?.matchedSkills || []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {candidate.matchExplanation.matchedSkills.slice(0, 3).map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-300">
                    <span className="size-1 bg-emerald-300 rounded-full" />
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-surface-soft/60 border border-amber-500/20 p-3">
            <p className="font-semibold text-amber-300 flex items-center gap-2">
              <AlertCircle size={14} /> Areas to Develop
            </p>
            {(candidate.matchExplanation?.missingSkills || []).length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {candidate.matchExplanation.missingSkills.slice(0, 3).map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-amber-300">
                    <span className="size-1 bg-amber-300 rounded-full" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-text-muted">No major skill gaps detected.</p>
            )}
          </div>
        </motion.div>

        {/* Interview section */}
        {candidate.interview?.scheduledAt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300"
          >
            <Clock size={14} />
            <span>Interview scheduled: {new Date(candidate.interview.scheduledAt).toLocaleString()} ({candidate.interview.mode})</span>
          </motion.div>
        )}

        {/* Interview scheduling form toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowInterviewForm(!showInterviewForm)}
          className="btn-secondary text-sm w-full"
          aria-expanded={showInterviewForm}
        >
          {showInterviewForm ? "Cancel" : "Schedule Interview"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => { setShowNotes((s) => !s); if (!showNotes) await loadNotes(); }}
          className="btn-secondary text-sm w-full"
          aria-expanded={showNotes}
        >
          {showNotes ? "Hide Notes" : "Notes"}
        </motion.button>

        <AnimatePresence>
          {showInterviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-2 md:grid-cols-2 rounded-lg bg-surface-soft/40 border border-primary/20 p-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Date & Time</label>
                <input
                  type="datetime-local"
                  className="input-modern text-sm"
                  value={interviewDraft?.scheduledAt || ""}
                  onChange={(e) => onInterviewDraftChange(candidate._id, "scheduledAt", e.target.value)}
                  aria-label="Interview date and time"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Mode</label>
                <select
                  className="input-modern text-sm"
                  value={interviewDraft?.mode || "video"}
                  onChange={(e) => onInterviewDraftChange(candidate._id, "mode", e.target.value)}
                  aria-label="Interview mode"
                >
                  {interviewModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="url"
                className="input-modern text-sm md:col-span-2"
                placeholder="Meeting link (optional)"
                value={interviewDraft?.meetingLink || ""}
                onChange={(e) => onInterviewDraftChange(candidate._id, "meetingLink", e.target.value)}
                aria-label="Meeting link"
              />
              <textarea
                className="input-modern text-sm md:col-span-2 min-h-20"
                placeholder="Interview notes (optional)"
                value={interviewDraft?.notes || ""}
                onChange={(e) => onInterviewDraftChange(candidate._id, "notes", e.target.value)}
                aria-label="Interview notes"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onScheduleInterview(candidate._id, job._id)}
                className="btn-primary md:col-span-2 text-sm flex items-center justify-center gap-2"
                type="button"
              >
                <Send size={16} /> Confirm Interview
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg bg-surface-soft/40 border border-border p-3"
            >
              <div className="mb-2">
                <label className="text-xs font-semibold text-text-muted">Add note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="input-modern w-full min-h-[60px] text-sm"
                  placeholder="Add internal note for this candidate"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleAddNote} className="btn-primary text-sm">Add Note</button>
                  <button onClick={() => setNewNote("")} className="btn-secondary text-sm">Clear</button>
                </div>
              </div>

              <div className="mt-2 max-h-40 overflow-auto space-y-2">
                {loadingNotes ? (
                  <div className="text-sm text-text-muted">Loading notes...</div>
                ) : notes.length === 0 ? (
                  <div className="text-sm text-text-muted">No notes yet</div>
                ) : (
                  notes.map((n, idx) => (
                    <div key={idx} className="text-sm border rounded p-2 bg-surface/30">
                      <div className="text-xs text-text-muted">{n.author || "recruiter"} • {new Date(n.createdAt).toLocaleString()}</div>
                      <div className="mt-1">{n.text}</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const RecruiterDashboard = () => {
  const reduceMotion = useReducedMotion();
  const [jobs, setJobs] = useState([]);
  const [jobCandidates, setJobCandidates] = useState({});
  const [expandedJobIds, setExpandedJobIds] = useState(new Set());
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [analytics, setAnalytics] = useState(null);
  const [interviewDrafts, setInterviewDrafts] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [sortBy, setSortBy] = useState("score"); // score, name, date

  const openToast = useCallback((type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const loadDashboard = useCallback(async () => {
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
  }, [openToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Memoized ranking with advanced filtering
  const ranking = useMemo(() => {
    const merged = Object.values(jobCandidates).flat();
    const filtered = merged.filter((candidate) => {
      const matchesStatus = statusFilter === "all" || (candidate.status || "pending") === statusFilter;
      const text = `${candidate.candidateName || ""} ${candidate.candidateEmail || ""}`.toLowerCase();
      const matchesText = text.includes(query.toLowerCase());
      return matchesStatus && matchesText;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.candidateName || "").localeCompare(b.candidateName || "");
        case "date":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "score":
        default:
          return (b.matchScore || 0) - (a.matchScore || 0);
      }
    });

    return sorted;
  }, [jobCandidates, query, statusFilter, sortBy]);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleCreateJob = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    // Client-side validation
    if (!form.title.trim() || !form.company.trim() || !form.description.trim()) {
      openToast("error", "Title, company and description are required");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      skills: String(form.skills || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      await createJob(payload);
      setForm(initialForm);
      setShowPreview(false);
      openToast("success", "Job posted successfully! 🎉");
      await loadDashboard();
    } catch (err) {
      openToast("error", err.response?.data?.message || "Failed to create job");
    } finally {
      setSaving(false);
    }
  }, [form, openToast, loadDashboard]);

  const handleExpandJob = useCallback(async (jobId) => {
    setExpandedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });

    if (jobCandidates[jobId]) {
      return;
    }

    setLoadingCandidates((prev) => ({ ...prev, [jobId]: true }));
    try {
      const params = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: query || undefined,
        sortBy: sortBy || "score",
        page: 1,
        limit: 50,
      };

      const res = await getJobCandidates(jobId, params);
      setJobCandidates((prev) => ({
        ...prev,
        [jobId]: res.data.matchedCandidates || [],
      }));
    } catch (err) {
      openToast("error", err.response?.data?.message || "Unable to load candidates for this job");
    } finally {
      setLoadingCandidates((prev) => ({ ...prev, [jobId]: false }));
    }
  }, [jobCandidates, openToast]);

  const handleStatusChange = useCallback(async (applicationId, status, jobId) => {
    try {
      await updateApplicationStatus(applicationId, status);
      const res = await getJobCandidates(jobId);
      setJobCandidates((prev) => ({
        ...prev,
        [jobId]: res.data.matchedCandidates || [],
      }));
      openToast("success", `Candidate marked as ${status} ✓`);
    } catch (err) {
      openToast("error", err.response?.data?.message || "Unable to update status");
    }
  }, [openToast]);

  const updateInterviewDraft = useCallback((applicationId, field, value) => {
    setInterviewDrafts((prev) => ({
      ...prev,
      [applicationId]: {
        ...(prev[applicationId] || {}),
        [field]: value,
      },
    }));
  }, []);

  const handleScheduleInterview = useCallback(async (applicationId, jobId) => {
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

      setInterviewDrafts((prev) => {
        const next = { ...prev };
        delete next[applicationId];
        return next;
      });

      openToast("success", "Interview scheduled successfully! 📅");
    } catch (err) {
      openToast("error", err.response?.data?.message || "Unable to schedule interview");
    }
  }, [interviewDrafts, openToast]);

  const handleSelectCandidate = useCallback((candidateId) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  }, []);

  const handleBatchStatusChange = useCallback(async (status) => {
    if (selectedCandidates.size === 0) {
      openToast("error", "No candidates selected");
      return;
    }
    const count = selectedCandidates.size;

    try {
      const promises = Array.from(selectedCandidates).map(async (appId) => {
        const candidate = Object.values(jobCandidates)
          .flat()
          .find((c) => c._id === appId);
        if (candidate) {
          await updateApplicationStatus(appId, status);
        }
      });

      await Promise.all(promises);
      setSelectedCandidates(new Set());
      await loadDashboard();
      openToast("success", `${count} candidates marked as ${status}`);
    } catch (err) {
      openToast("error", "Failed to batch update candidates");
    }
  }, [selectedCandidates, jobCandidates, openToast, loadDashboard]);

  const totalApplicants = useMemo(() => Object.values(jobCandidates).flat().length, [jobCandidates]);
  const topScore = useMemo(() => ranking[0]?.matchScore || 0, [ranking]);

  // Scroll refs for animation triggers
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const analyticsRef = useRef(null);
  const jobsRef = useRef(null);
  const rankingRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-50px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });
  const analyticsInView = useInView(analyticsRef, { once: true, margin: "-50px" });
  const jobsInView = useInView(jobsRef, { once: true, margin: "-50px" });
  const rankingInView = useInView(rankingRef, { once: true, margin: "-50px" });

  return (
    <motion.main
      initial={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6 z-0"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed right-5 top-20 z-[70] rounded-xl px-4 py-3 text-sm font-medium shadow-card backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-emerald-500/90 text-white"
                : "bg-rose-500/90 text-white"
            }`}
            role="alert"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <motion.section
        ref={headerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card p-6 border border-white/10 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary"
            >
              <Trophy size={14} /> Recruiter Command Center
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-3 text-4xl font-bold bg-gradient-to-r from-primary via-purple-300 to-primary bg-clip-text text-transparent"
            >
              Recruiter Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-2 max-w-2xl text-sm text-text-muted leading-relaxed"
            >
              Post roles, track applicants, and prioritize high-confidence matches with smart insights and quick actions.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Stats Cards - Scroll Triggered */}
      <motion.section
        ref={statsRef}
        variants={scrollContainer}
        initial="hidden"
        animate={statsInView ? "show" : "hidden"}
        className="grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Total Jobs"
          value={jobs.length}
          icon={BriefcaseBusiness}
          color="from-blue-500 to-blue-600"
          inView={statsInView}
          delay={0}
        />
        <StatCard
          label="Loaded Applicants"
          value={totalApplicants}
          icon={Users}
          color="from-purple-500 to-purple-600"
          inView={statsInView}
          delay={0.05}
        />
        <StatCard
          label="Top Match Score"
          value={`${topScore}%`}
          icon={Star}
          color="from-amber-500 to-amber-600"
          inView={statsInView}
          delay={0.1}
        />
      </motion.section>

      {/* Batch Actions Toolbar */}
      {selectedCandidates.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass-card border-l-4 border-primary p-4 flex items-center justify-between gap-4 backdrop-blur-xl flex-wrap"
        >
          <div className="flex items-center gap-3">
            <motion.div className="bg-primary/20 rounded-full px-3 py-1 text-sm font-semibold text-primary">
              {selectedCandidates.size} selected
            </motion.div>
            <p className="text-sm text-text-muted">Perform batch actions on selected candidates</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBatchStatusChange("shortlisted")}
              className="btn-secondary text-sm"
            >
              Shortlist
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBatchStatusChange("accepted")}
              className="btn-primary text-sm"
            >
              Accept
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCandidates(new Set())}
              className="btn-secondary text-sm"
            >
              Clear
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Analytics Section */}
      {analytics && (
        <motion.section
          ref={analyticsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={analyticsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-card p-5 border border-white/10 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={analyticsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            className="mb-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <motion.div className="p-2 bg-primary/20 rounded-lg">
                <TrendingUp size={20} className="text-primary" />
              </motion.div>
              <h2 className="text-lg font-semibold">Hiring Analytics</h2>
            </div>
            <span className="text-xs text-text-muted bg-surface-soft px-3 py-1 rounded-full">Live platform signals</span>
          </motion.div>
          <motion.div
            variants={scrollContainer}
            initial="hidden"
            animate={analyticsInView ? "show" : "hidden"}
            className="grid gap-3 md:grid-cols-4"
          >
            {[
              { label: "Total Applications", value: analytics.totalApplications || 0 },
              { label: "Acceptance Rate", value: `${analytics.acceptanceRate || 0}%` },
              { label: "Average Match", value: `${analytics.averageMatchScore || 0}%` },
              { label: "Open Jobs", value: analytics.openJobs || 0 },
              { label: "Avg Time to Hire", value: `${analytics.avgTimeToHire || 0}d` },
              { label: "Avg Apps per Job", value: analytics.avgAppPerJob || 0 },
              { label: "Shortlist Rate", value: `${analytics.conversionFunnel?.shortlistRate || 0}%` },
              { label: "Interview Rate", value: `${analytics.conversionFunnel?.interviewRate || 0}%` },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={scrollItem}
                whileHover={{ scale: 1.05, y: -4 }}
                className="rounded-lg bg-surface-soft/60 border border-white/5 p-4 cursor-pointer transition-all"
              >
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wide">{stat.label}</p>
                <motion.p
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={analyticsInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="mt-2 text-3xl font-bold"
                >
                  {stat.value}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>

          {analytics.conversionFunnel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={analyticsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-4 rounded-lg bg-surface-soft/40 border border-white/5 p-4"
            >
              <p className="text-xs text-text-muted flex items-center gap-2 font-semibold uppercase tracking-wide mb-3">
                <Zap size={14} className="text-blue-500" /> Conversion Funnel
              </p>
              <div className="space-y-2">
                {[
                  { label: "Applied", value: analytics.conversionFunnel.applied, color: "from-blue-500 to-blue-600" },
                  { label: "Shortlisted", value: analytics.conversionFunnel.shortlisted, rate: `${analytics.conversionFunnel.shortlistRate}%`, color: "from-cyan-500 to-cyan-600" },
                  { label: "Interviewed", value: analytics.conversionFunnel.interviewed, rate: `${analytics.conversionFunnel.interviewRate}%`, color: "from-emerald-500 to-emerald-600" },
                  { label: "Accepted", value: analytics.conversionFunnel.accepted, rate: `${analytics.conversionFunnel.offerRate}%`, color: "from-amber-500 to-amber-600" },
                ].map((stage, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={analyticsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.2 + idx * 0.05, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{stage.label}</span>
                        <span className="text-xs text-text-muted">{stage.value} {stage.rate && `(${stage.rate})`}</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-soft/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={analyticsInView ? {
                            width: `${analytics.conversionFunnel.applied > 0
                              ? Math.min(100, Math.max(0, (stage.value / analytics.conversionFunnel.applied) * 100))
                              : 0}%`,
                          } : { width: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${stage.color}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          {(analytics.topSkills || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={analyticsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-4 rounded-lg bg-surface-soft/40 border border-white/5 p-4"
            >
              <p className="text-xs text-text-muted flex items-center gap-2 font-semibold uppercase tracking-wide mb-3">
                <Zap size={14} className="text-amber-500" /> Top Skills in Pipeline
              </p>
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={analyticsInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                {(analytics.topSkills || []).slice(0, 12).map((item) => (
                  <motion.span
                    key={item.skill}
                    whileHover={{ scale: 1.12, y: -3 }}
                    className="rounded-full bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary cursor-pointer transition-all"
                  >
                    {item.skill} <span className="text-primary/60 ml-1">({item.count})</span>
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.section>
      )}

      <section ref={jobsRef} className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* Sidebar - Create Job */}
        <motion.aside
          className="glass-card overflow-hidden border border-white/10 backdrop-blur-xl"
          initial={{ opacity: 0, x: -30 }}
          animate={jobsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            whileHover={{ backgroundColor: "rgba(60, 221, 199, 0.05)" }}
            className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-sm font-semibold transition-colors"
            aria-expanded={!sidebarCollapsed}
          >
            <div className="flex items-center gap-2">
              <PlusSquare size={18} />
              {!sidebarCollapsed && "Create Job Posting"}
            </div>
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.form
                onSubmit={handleCreateJob}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 p-4"
              >
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1.5">Job Title *</label>
                  <input className="input-modern w-full" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Senior React Developer" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1.5">Company *</label>
                  <input className="input-modern w-full" name="company" value={form.company} onChange={handleChange} placeholder="Your company" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1.5">Location *</label>
                  <input className="input-modern w-full" name="location" value={form.location} onChange={handleChange} placeholder="e.g., San Francisco, CA" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1.5">Job Type *</label>
                  <select className="input-modern w-full" name="type" value={form.type} onChange={handleChange}>
                    {jobTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1.5">Salary Range *</label>
                  <input className="input-modern w-full" name="salary" value={form.salary} onChange={handleChange} placeholder="e.g., $80k - $120k" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1.5">Required Skills *</label>
                  <input
                    className="input-modern w-full text-xs"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, TypeScript..."
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1.5">Job Description *</label>
                  <textarea
                    className="input-modern w-full min-h-[100px] text-sm"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Detail the role, responsibilities, and expectations..."
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  type="submit"
                  disabled={saving}
                  aria-busy={saving}
                >
                  <PlusSquare size={16} />
                  {saving ? "Posting..." : "Post Job"}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setShowPreview((p) => !p)}
                  className="btn-secondary w-full mt-2 flex items-center justify-center gap-2"
                >
                  {showPreview ? "Hide Preview" : "Preview"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.aside>

        {/* Preview panel */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 border border-white/10 backdrop-blur-xl mt-4 lg:mt-0"
          >
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <div className="mb-2">
              <div className="text-xl font-bold">{form.title || "Job Title"}</div>
              <div className="text-sm text-text-muted">{form.company || "Company"} • {form.location || "Location"}</div>
            </div>
            <div className="mb-2 text-sm">
              {form.description ? <p className="line-clamp-4">{form.description}</p> : <p className="text-text-muted">No description</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {(String(form.skills || "") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0,6).map((skill) => (
                <span key={skill} className="rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-medium">{skill}</span>
              ))}
            </div>
            <div className="mt-3 text-sm text-text-muted">Salary: {form.salary || "N/A"} • Type: {form.type}</div>
          </motion.div>
        )}

        <div className="space-y-5">
          {/* Candidate Ranking Section */}
          <motion.section
            ref={rankingRef}
            initial={{ opacity: 0, y: 30 }}
            animate={rankingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            id="candidates"
            className="glass-card p-4 border border-white/10 backdrop-blur-xl"
          >
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={rankingInView ? { opacity: 1 } : { opacity: 0 }}
                className="text-lg font-semibold flex items-center gap-2"
              >
                <Star size={20} className="text-amber-500" />
                Top Ranked Candidates
              </motion.h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-2.5 text-text-muted" />
                  <input
                    className="input-modern pl-9"
                    placeholder="Search candidate..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search candidates"
                  />
                </div>
                <div className="relative">
                  <Filter size={15} className="pointer-events-none absolute left-3 top-2.5 text-text-muted" />
                  <select
                    className="input-modern pl-9"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  className="input-modern"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort by"
                >
                  <option value="score">Sort: Score</option>
                  <option value="name">Sort: Name</option>
                  <option value="date">Sort: Date</option>
                </select>
              </div>
            </div>

            {ranking.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={rankingInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border-2 border-dashed border-border p-8 text-center"
              >
                <Users size={40} className="mx-auto mb-3 text-text-muted opacity-50" />
                <p className="text-sm text-text-muted">Load candidates from any job to see ranking insights here.</p>
              </motion.div>
            ) : (
              <motion.div
                variants={scrollContainer}
                initial="hidden"
                animate={rankingInView ? "show" : "hidden"}
                className="grid gap-2"
              >
                {ranking.slice(0, 12).map((candidate, index) => (
                  <CandidateRow
                    key={candidate._id}
                    candidate={candidate}
                    job={{ _id: candidate.jobId || "" }}
                    selected={selectedCandidates.has(candidate._id)}
                    onSelect={handleSelectCandidate}
                    onStatusChange={handleStatusChange}
                    onScheduleInterview={handleScheduleInterview}
                    interviewDraft={interviewDrafts[candidate._id]}
                    onInterviewDraftChange={updateInterviewDraft}
                  />
                ))}
              </motion.div>
            )}
          </motion.section>

          {/* All Jobs Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={jobsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            id="jobs"
            className="glass-card overflow-hidden border border-white/10 backdrop-blur-xl"
          >
            <div className="border-b border-border px-4 py-3 bg-surface-soft/30">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                All Jobs
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((row) => (
                  <motion.div
                    key={row}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: row * 0.1 }}
                    className="skeleton h-16 rounded-lg"
                  />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center">
                <BriefcaseBusiness size={48} className="mx-auto mb-3 text-text-muted opacity-50" />
                <p className="text-sm text-text-muted">No jobs posted yet. Create your first job in the sidebar!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                <AnimatePresence>
                  {jobs.map((job, jobIdx) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: jobIdx * 0.05 }}
                      className="p-4 hover:bg-surface-soft/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{job.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                            <MapPin size={12} />
                            <span>{job.company}</span>
                            <span>•</span>
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="btn-secondary text-sm whitespace-nowrap"
                          onClick={() => handleExpandJob(job._id)}
                          aria-expanded={expandedJobIds.has(job._id)}
                        >
                          {expandedJobIds.has(job._id) ? "Hide" : "View"} ({jobCandidates[job._id]?.length || 0})
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {expandedJobIds.has(job._id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 pt-3 border-t border-border space-y-2"
                          >
                            {loadingCandidates[job._id] ? (
                              <div className="space-y-2">
                                {[1, 2].map((i) => (
                                  <div key={i} className="skeleton h-20 rounded-lg" />
                                ))}
                              </div>
                            ) : (jobCandidates[job._id] || []).length === 0 ? (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-text-muted py-4 text-center rounded-lg bg-surface-soft/30"
                              >
                                No applicants for this job yet.
                              </motion.div>
                            ) : (
                              <motion.div
                                variants={scrollContainer}
                                initial="hidden"
                                animate="show"
                                className="space-y-2"
                              >
                                {(jobCandidates[job._id] || []).map((candidate) => (
                                  <CandidateRow
                                    key={candidate._id}
                                    candidate={candidate}
                                    job={job}
                                    selected={selectedCandidates.has(candidate._id)}
                                    onSelect={handleSelectCandidate}
                                    onStatusChange={handleStatusChange}
                                    onScheduleInterview={handleScheduleInterview}
                                    interviewDraft={interviewDrafts[candidate._id]}
                                    onInterviewDraftChange={updateInterviewDraft}
                                  />
                                ))}
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.section>
        </div>
      </section>
    </motion.main>
  );
};

export default RecruiterDashboard;
