import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import * as Slider from "@radix-ui/react-slider";
import Select from "react-select";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Bookmark,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  Layers3,
  Filter,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Trash2,
  X,
  DollarSign,
  Briefcase
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSavedJobs } from "../context/SavedJobsContext";
import { applyToJob, getCandidateApplications, getCandidateJobMatches, getJobs } from "../services/api";
import JobCard from "../components/JobCard";
import ApplyDrawer from "../components/ApplyDrawer";
import SkeletonJobCard from "../components/SkeletonJobCard";
import { toast } from "react-hot-toast";
import { normalize, getUserId, getExperienceBucket, formatSalary, displayCountText } from "../utils/jobHelpers";

const JOB_TYPES = ["full-time", "part-time", "remote", "contract"];
const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior 0-2yr" },
  { value: "mid", label: "Mid 3-5yr" },
  { value: "senior", label: "Senior 5+yr" },
];
const SORT_OPTIONS = [
  { value: "best-match", label: "Best Match" },
  { value: "newest", label: "Newest" },
  { value: "salary-high", label: "Salary High-Low" },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#0D1321",
    borderColor: state.isFocused ? "#6366f1" : "rgba(255,255,255,0.12)",
    boxShadow: state.isFocused ? "0 0 0 1px #6366f1" : "none",
    minHeight: 40,
    borderRadius: 10,
    "&:hover": { borderColor: "#6366f1" },
  }),
  menu: (base) => ({ ...base, backgroundColor: "#0D1321", zIndex: 60 }),
  menuList: (base) => ({ ...base, padding: 8 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgba(99,102,241,0.18)"
      : state.isFocused
      ? "rgba(255,255,255,0.06)"
      : "transparent",
    color: "#E2E8F0",
    borderRadius: 8,
    cursor: "pointer",
  }),
  multiValue: (base) => ({ ...base, backgroundColor: "rgba(99,102,241,0.14)" }),
  multiValueLabel: (base) => ({ ...base, color: "#a5b4fc" }),
  multiValueRemove: (base) => ({ ...base, color: "#a5b4fc", "&:hover": { backgroundColor: "rgba(99,102,241,0.18)", color: "white" } }),
  input: (base) => ({ ...base, color: "white" }),
  placeholder: (base) => ({ ...base, color: "#94A3B8" }),
  singleValue: (base) => ({ ...base, color: "white" }),
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 }}
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' }}
};

const getJobSalaryNumber = (job) => {
  let val = job.salary;
  if (val && val !== "Not specified" && val !== "not specified" && val !== "Negotiable") {
    if (typeof val === 'number') return val;
    if (typeof val === 'object') {
      if (val.min) return Number(val.min);
      if (val.max) return Number(val.max);
    }
    if (typeof val === 'string') {
      const parsed = parseInt(val.replace(/[^0-9]/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        if (parsed < 100) return parsed * 100000;
        return parsed;
      }
    }
  }
  
  const t = (job.title || '').toLowerCase();
  if (t.includes('react') || t.includes('frontend') || t.includes('vue')) return 1300000;
  if (t.includes('backend') || t.includes('node') || t.includes('java')) return 1600000;
  if (t.includes('senior') || t.includes('lead') || t.includes('principal')) return 2650000;
  if (t.includes('data') || t.includes('ml') || t.includes('ai') || t.includes('python')) return 2250000;
  if (t.includes('designer') || t.includes('ui') || t.includes('ux')) return 1000000;
  return 1050000;
};

function EmptyFolderIllustration() {
  return (
    <svg viewBox="0 0 240 180" className="mx-auto h-32 w-48 text-[#6366f1]/40 animate-pulse">
      <path d="M26 56c0-8.8 7.2-16 16-16h39l16 16h117c8.8 0 16 7.2 16 16v57c0 8.8-7.2 16-16 16H42c-8.8 0-16-7.2-16-16V56z" fill="currentColor" opacity="0.12" />
      <path d="M26 74h188v55c0 8.8-7.2 16-16 16H42c-8.8 0-16-7.2-16-16V74z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <path d="M52 46h48l16 16h76" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="120" cy="103" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
      <path d="M113 103h14M120 96v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CollapsibleFilterSection({ title, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-white/5 py-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
      >
        <span>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 pr-1 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function JobsBrowser() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { isJobSaved, toggleSaveJob, getSavedJobsCount } = useSavedJobs();
  const isCandidate = role === "candidate";
  const userId = getUserId(user);

  const [viewMode, setViewMode] = useState("all");
  const [allJobs, setAllJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [candidateApplications, setCandidateApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [minMatch, setMinMatch] = useState(isCandidate ? 60 : 0);
  const [sortBy, setSortBy] = useState("best-match");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [applyJob, setApplyJob] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [trackerOpen, setTrackerOpen] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState({
    type: true,
    experience: true,
    salary: true,
    skills: true,
  });

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const searchInputRef = useRef(null);
  const listParentRef = useRef(null);
  const { scrollY } = useScroll();

  const headerY = useTransform(scrollY, [0, 100], [0, -20]);
  const headerOpacity = useTransform(scrollY, [0, 80], [1, 0.7]);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearch(searchInput.trim());
        setIsSearching(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function loadJobs() {
    if (!hasLoadedOnce) setLoading(true);
    try {
      const response = await getJobs();
      setAllJobs(response.data.jobs || []);
      setError("");
      setHasLoadedOnce(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load jobs right now.");
      setAllJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (isCandidate && userId) {
      getCandidateApplications()
        .then((res) => setCandidateApplications(res.data.applications || []))
        .catch(() => setCandidateApplications([]));
    }
  }, [isCandidate, userId]);

  useEffect(() => {
    async function loadMatchedJobs() {
      if (viewMode !== "matched") return;
      if (!isCandidate || !userId) {
        toast.error("Sign in as a candidate to view AI matched jobs.");
        setViewMode("all");
        return;
      }
      try {
        const res = await getCandidateJobMatches(userId);
        setMatchedJobs(res.data.recommendations || []);
      } catch (err) {
        toast.error("Unable to load AI matched jobs.");
        setMatchedJobs([]);
      }
    }
    loadMatchedJobs();
  }, [viewMode, isCandidate, userId]);

  const baseJobs = viewMode === "matched" ? matchedJobs : allJobs;

  const candidateMatchMap = useMemo(() => {
    const map = {};
    matchedJobs.forEach((job) => {
      map[job._id] = job;
    });
    return map;
  }, [matchedJobs]);

  const selectedJob = useMemo(() => {
    return baseJobs.find((j) => j._id === selectedJobId) || null;
  }, [baseJobs, selectedJobId]);

  const skillsOptions = useMemo(() => {
    const set = new Set();
    baseJobs.forEach((job) => (job.skills || []).forEach((skill) => skill && set.add(skill)));
    return Array.from(set).sort().map((skill) => ({ value: skill, label: skill }));
  }, [baseJobs]);

  const appliedJobIds = useMemo(() => {
    const set = new Set();
    candidateApplications.forEach((application) => {
      const jobId = application?.job?._id || application?.job;
      if (jobId) set.add(String(jobId));
    });
    return set;
  }, [candidateApplications]);

  const filteredJobs = useMemo(() => {
    let jobs = [...baseJobs];
    const query = normalize(debouncedSearch);

    if (query) {
      jobs = jobs.filter((job) => {
        const haystack = [job.title, job.company, job.location, job.description, ...(job.skills || [])].map(normalize);
        return haystack.some((field) => field.includes(query));
      });
    }

    if (selectedTypes.length) {
      jobs = jobs.filter((job) => selectedTypes.includes(normalize(job.type)));
    }

    if (selectedExperience.length) {
      jobs = jobs.filter((job) => selectedExperience.includes(getExperienceBucket(job)));
    }

    if (selectedSkills.length) {
      jobs = jobs.filter((job) => {
        const skillSet = new Set((job.skills || []).map(normalize));
        return selectedSkills.every((skill) => skillSet.has(normalize(skill.value)));
      });
    }

    const minSalary = salaryMin ? Number(salaryMin) : null;
    const maxSalary = salaryMax ? Number(salaryMax) : null;
    if (minSalary !== null) jobs = jobs.filter((job) => getJobSalaryNumber(job) >= minSalary);
    if (maxSalary !== null) jobs = jobs.filter((job) => getJobSalaryNumber(job) <= maxSalary);

    if (isCandidate && minMatch > 0) {
      jobs = jobs.filter((job) => {
        const score = Number(candidateMatchMap[job._id]?.matchScore || job.matchScore || 0);
        if (viewMode === "matched") {
          return score >= minMatch;
        }
        return !candidateMatchMap[job._id] || score >= minMatch;
      });
    }

    if (sortBy === "newest") {
      jobs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === "salary-high") {
      jobs.sort((a, b) => Number(b.salary || 0) - Number(a.salary || 0));
    } else {
      jobs.sort((a, b) => Number(b.matchScore || candidateMatchMap[b._id]?.matchScore || 0) - Number(a.matchScore || candidateMatchMap[a._id]?.matchScore || 0));
    }

    return jobs;
  }, [baseJobs, debouncedSearch, selectedTypes, selectedExperience, selectedSkills, salaryMin, salaryMax, minMatch, sortBy, isCandidate, candidateMatchMap]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      debouncedSearch.trim() ||
      selectedTypes.length > 0 ||
      selectedExperience.length > 0 ||
      selectedSkills.length > 0 ||
      salaryMin ||
      salaryMax
    );
  }, [debouncedSearch, selectedTypes, selectedExperience, selectedSkills, salaryMin, salaryMax]);

  function clearAllFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedTypes([]);
    setSelectedExperience([]);
    setSelectedSkills([]);
    setSalaryMin("");
    setSalaryMax("");
    setMinMatch(isCandidate ? 60 : 0);
  }

  function toggleType(type) {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]));
  }

  function toggleExperience(value) {
    setSelectedExperience((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }

  const compareJobs = filteredJobs.filter((job) => compareIds.includes(job._id));
  const pendingApplications = candidateApplications.filter((application) => application.status === "pending").length;

  function onApplySuccess() {
    if (viewMode === "matched" && isCandidate && userId) {
      getCandidateJobMatches(userId).then((res) => setMatchedJobs(res.data.recommendations || [])).catch(() => null);
    }
    if (isCandidate && userId) {
      getCandidateApplications().then((res) => setCandidateApplications(res.data.applications || [])).catch(() => null);
    }
    getJobs().then((res) => setAllJobs(res.data.jobs || [])).catch(() => null);
  }

  const rowVirtualizer = useVirtualizer({
    count: filteredJobs.length,
    getScrollElement: () => listParentRef.current,
    estimateSize: () => 92,
    overscan: 5,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (el) => el?.getBoundingClientRect().height
        : undefined,
  });

  const [activeDetailTab, setActiveDetailTab] = useState("about");

  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0A0F1E] text-white">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <ApplyDrawer open={Boolean(applyJob)} job={applyJob} onOpenChange={(open) => !open && setApplyJob(null)} onSuccess={onApplySuccess} />

      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 lg:px-8">
        <div className="flex gap-6 items-start w-full relative">
          
          {/* LEFT 220px: Sticky Filter Sidebar (desktop only) */}
          <aside className="hidden lg:block w-[220px] shrink-0 sticky top-[90px] h-[calc(100vh-120px)] overflow-y-auto pr-1 no-scrollbar border-r border-white/5">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Smart Filters</h2>
              <p className="text-[11px] text-slate-400">Refine with live filters</p>
            </div>

            {/* Employment Type */}
            <CollapsibleFilterSection
              title="Employment Type"
              isOpen={sidebarOpen.type}
              onToggle={() => setSidebarOpen(prev => ({ ...prev, type: !prev.type }))}
            >
              <div className="space-y-2 pt-1">
                {JOB_TYPES.map((type) => {
                  const active = selectedTypes.includes(type);
                  return (
                    <label key={type} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleType(type)}
                        className="rounded border-white/10 bg-[#0D1321] text-[#6366f1] focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  );
                })}
              </div>
            </CollapsibleFilterSection>

            {/* Experience Level */}
            <CollapsibleFilterSection
              title="Experience Level"
              isOpen={sidebarOpen.experience}
              onToggle={() => setSidebarOpen(prev => ({ ...prev, experience: !prev.experience }))}
            >
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="radio"
                    name="exp"
                    checked={selectedExperience.length === 0}
                    onChange={() => setSelectedExperience([])}
                    className="border-white/10 bg-[#0D1321] text-[#6366f1] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>All Experience</span>
                </label>
                {EXPERIENCE_LEVELS.map((level) => {
                  const active = selectedExperience.includes(level.value);
                  return (
                    <label key={level.value} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="radio"
                        name="exp"
                        checked={active}
                        onChange={() => setSelectedExperience([level.value])}
                        className="border-white/10 bg-[#0D1321] text-[#6366f1] focus:ring-0 w-3.5 h-3.5"
                      />
                      <span>{level.label}</span>
                    </label>
                  );
                })}
              </div>
            </CollapsibleFilterSection>

            {/* Salary Range */}
            <CollapsibleFilterSection
              title="Salary Range"
              isOpen={sidebarOpen.salary}
              onToggle={() => setSidebarOpen(prev => ({ ...prev, salary: !prev.salary }))}
            >
              <div className="space-y-4 pt-1 px-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>₹{salaryMin ? Number(salaryMin) / 100000 : 0}L</span>
                  <span>₹{salaryMax ? Number(salaryMax) / 100000 : 40}L+</span>
                </div>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
                  value={[
                    salaryMin ? Number(salaryMin) / 100000 : 0,
                    salaryMax ? Number(salaryMax) / 100000 : 40
                  ]}
                  max={40}
                  step={1}
                  onValueChange={([min, max]) => {
                    setSalaryMin(min === 0 ? "" : String(min * 100000));
                    setSalaryMax(max === 40 ? "" : String(max * 100000));
                  }}
                >
                  <Slider.Track className="bg-white/10 relative grow rounded-full h-[3px]">
                    <Slider.Range className="absolute bg-[#6366f1] rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-4 h-4 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-[#6366f1] cursor-pointer hover:bg-slate-100 transition"
                    aria-label="Min salary"
                  />
                  <Slider.Thumb
                    className="block w-4 h-4 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-[#6366f1] cursor-pointer hover:bg-slate-100 transition"
                    aria-label="Max salary"
                  />
                </Slider.Root>
              </div>
            </CollapsibleFilterSection>

            {/* Skills */}
            <CollapsibleFilterSection
              title="Required Skills"
              isOpen={sidebarOpen.skills}
              onToggle={() => setSidebarOpen(prev => ({ ...prev, skills: !prev.skills }))}
            >
              <div className="pt-1">
                <Select
                  isMulti
                  value={selectedSkills}
                  onChange={setSelectedSkills}
                  options={skillsOptions}
                  styles={selectStyles}
                  placeholder="Skills..."
                  closeMenuOnSelect={false}
                />
              </div>
            </CollapsibleFilterSection>

            {/* Clear All Filters */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <button
                onClick={clearAllFilters}
                className={`w-full rounded-xl py-2 text-xs font-semibold border transition-colors ${
                  hasActiveFilters
                    ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "border-white/10 text-slate-500 cursor-default"
                }`}
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* CENTER flex-1: Job Cards & Header */}
          <div className="flex-1 min-w-0 pb-[100px]">
            {/* Scroll transform header */}
            <motion.header
              style={{ y: headerY, opacity: headerOpacity }}
              className="mb-5 relative z-10"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold md:text-3xl gradient-text">Explore Careers</h1>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    Showing{" "}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={filteredJobs.length}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-semibold text-[#a5b4fc] inline-block"
                      >
                        {filteredJobs.length}
                      </motion.span>
                    </AnimatePresence>{" "}
                    matching positions.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* View mode toggle */}
                  <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-medium">
                    {[
                      { key: "all", label: "All" },
                      { key: "matched", label: "AI Matched" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setViewMode(item.key)}
                        className={`relative rounded-full px-4 py-1.5 text-white/80 transition-colors ${
                          viewMode === item.key ? "bg-[#6366f1] text-white" : ""
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Sort dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#0D1321] px-3 py-1.5 text-xs text-white outline-none focus:border-[#6366f1]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SEARCH BAR (Full Width, Height 44px) */}
              <div className="mt-4">
                <motion.div
                  animate={{
                    boxShadow: searchFocused ? "0 0 0 2px rgba(99,102,241,0.3)" : "0 0 0 0px transparent",
                    borderColor: searchFocused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    height: '44px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    padding: '0 14px',
                  }}
                >
                  <motion.div
                    animate={searchFocused ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center shrink-0 mr-3"
                  >
                    <Search size={18} className="text-[#94A3B8]" />
                  </motion.div>

                  <input
                    ref={searchInputRef}
                    value={searchInput}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by title, skill or company..."
                    className="flex-1 bg-transparent border-none outline-none text-white text-sm h-full"
                  />

                  {isSearching && <Loader2 size={16} className="animate-spin text-[#6366f1] mr-3" />}

                  {searchInput && (
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setDebouncedSearch("");
                      }}
                      className="text-[#94A3B8] hover:text-white p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </motion.div>
              </div>

              {/* HORIZONTAL FILTER CHIPS ROW */}
              <div className="mt-3 flex gap-[6px] overflow-x-auto no-scrollbar py-1">
                {[
                  { label: "All", type: "all" },
                  { label: "Full Time", type: "type", value: "full-time" },
                  { label: "Remote", type: "type", value: "remote" },
                  { label: "Part Time", type: "type", value: "part-time" },
                  { label: "Senior", type: "experience", value: "senior" },
                  { label: "Entry Level", type: "experience", value: "junior" },
                  { label: "Contract", type: "type", value: "contract" },
                ].map((chip) => {
                  let isActive = false;
                  if (chip.type === "all") {
                    isActive = selectedTypes.length === 0 && selectedExperience.length === 0;
                  } else if (chip.type === "type") {
                    isActive = selectedTypes.includes(chip.value);
                  } else {
                    isActive = selectedExperience.includes(chip.value);
                  }

                  const handleToggle = () => {
                    if (chip.type === "all") {
                      setSelectedTypes([]);
                      setSelectedExperience([]);
                    } else if (chip.type === "type") {
                      toggleType(chip.value);
                    } else {
                      toggleExperience(chip.value);
                    }
                  };

                  return (
                    <motion.button
                      key={chip.label}
                      layout
                      whileTap={{ scale: 0.93 }}
                      onClick={handleToggle}
                      className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                        isActive
                          ? "bg-[rgba(99,102,241,0.2)] border-[#6366f1] text-[#a5b4fc]"
                          : "border-[rgba(255,255,255,0.12)] bg-transparent text-[rgba(255,255,255,0.4)] hover:text-white hover:border-white/20"
                      }`}
                    >
                      {chip.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.header>

            {/* List area */}
            {loading && !hasLoadedOnce ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonJobCard key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center border border-red-500/20 bg-red-500/5 px-6 py-12 text-center rounded-2xl">
                <EmptyFolderIllustration />
                <h2 className="mt-4 text-xl font-bold text-red-400">Unable to load jobs</h2>
                <p className="mt-1 text-xs text-slate-400">Confirm server connections and refresh.</p>
                <button onClick={loadJobs} className="mt-4 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-semibold text-white">Retry</button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] px-6 py-16 text-center rounded-2xl">
                <EmptyFolderIllustration />
                <h2 className="mt-4 text-xl font-bold text-white">No jobs match</h2>
                <p className="mt-1 text-xs text-slate-400">Adjust active filters or clear them to start over.</p>
                <button onClick={clearAllFilters} className="mt-4 rounded-xl bg-[#6366f1] px-5 py-2.5 text-xs font-semibold text-white">Clear Filters</button>
              </div>
            ) : (
              <div
                ref={listParentRef}
                style={{
                  height: filteredJobs.length > 5 ? "calc(100vh - 280px)" : "auto",
                  overflowY: filteredJobs.length > 5 ? "auto" : "visible",
                  position: "relative",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(99,102,241,0.25) transparent",
                  paddingBottom: "80px" // bottom nav bar safe margin
                }}
              >
                <div
                  style={{
                    height: filteredJobs.length > 5 ? rowVirtualizer.getTotalSize() : "auto",
                    position: filteredJobs.length > 5 ? "relative" : "static",
                  }}
                >
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      width: '100%'
                    }}
                  >
                    {filteredJobs.length > 5
                      ? rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const job = filteredJobs[virtualRow.index];
                          const matchData = candidateMatchMap[job._id];
                          const isApplied = appliedJobIds.has(String(job._id));
                          const isSelected = job._id === selectedJobId;
                          return (
                            <div
                              key={virtualRow.key}
                              data-index={virtualRow.index}
                              ref={rowVirtualizer.measureElement}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: `translateY(${virtualRow.start}px)`,
                              }}
                            >
                              <motion.div
                                variants={itemVariants}
                                exit={{ opacity: 0, y: 16 }}
                              >
                                <JobCard
                                  job={job}
                                  matchScore={matchData?.matchScore || job.matchScore || null}
                                  isApplied={isApplied}
                                  isCandidate={isCandidate}
                                  onViewDetails={() => setSelectedJobId(job._id)}
                                  onApply={() => setApplyJob(job)}
                                  onSaveToggle={() => toggleSaveJob(job)}
                                  isSaved={isJobSaved(job._id)}
                                  searchQuery={debouncedSearch}
                                  isSelected={isSelected}
                                />
                              </motion.div>
                            </div>
                          );
                        })
                      : filteredJobs.map((job) => {
                          const matchData = candidateMatchMap[job._id];
                          const isApplied = appliedJobIds.has(String(job._id));
                          const isSelected = job._id === selectedJobId;
                          return (
                            <motion.div
                              key={job._id}
                              variants={itemVariants}
                              exit={{ opacity: 0, y: 16 }}
                            >
                              <JobCard
                                job={job}
                                matchScore={matchData?.matchScore || job.matchScore || null}
                                isApplied={isApplied}
                                isCandidate={isCandidate}
                                onViewDetails={() => setSelectedJobId(job._id)}
                                onApply={() => setApplyJob(job)}
                                onSaveToggle={() => toggleSaveJob(job)}
                                isSaved={isJobSaved(job._id)}
                                searchQuery={debouncedSearch}
                                isSelected={isSelected}
                              />
                            </motion.div>
                          );
                        })
                    }
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 320px: Desktop Side Panel (slides in on card click) */}
          <AnimatePresence>
            {selectedJob && !isMobile && (
              <motion.aside
                initial={{ x: 340, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 340, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="hidden lg:block w-[320px] shrink-0 sticky top-[90px] h-[calc(100vh-120px)] bg-[#0f0f1a]/75 border border-[#6366f1]/20 rounded-2xl p-5 overflow-y-auto no-scrollbar shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="text-sm font-semibold text-slate-400">Job Detail</h4>
                  <button
                    onClick={() => setSelectedJobId(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)` }}
                  >
                    {(selectedJob.company || "J").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">{selectedJob.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedJob.company}</p>
                  </div>
                </div>

                {/* 3 Stat pills */}
                <div className="flex gap-1.5 flex-wrap mt-4">
                  <span className="bg-white/5 px-2.5 py-1 rounded-full text-[10px] text-slate-300 font-medium">
                    {formatSalary(selectedJob.salary)}
                  </span>
                  <span className="bg-white/5 px-2.5 py-1 rounded-full text-[10px] text-slate-300 font-medium capitalize">
                    {selectedJob.type}
                  </span>
                  <span className="bg-white/5 px-2.5 py-1 rounded-full text-[10px] text-slate-300 font-medium">
                    {selectedJob.yearsOfExperience || selectedJob.experience || "Entry"}y exp
                  </span>
                </div>

                {/* Apply full width & Save Outline */}
                <div className="flex flex-col gap-2 mt-5">
                  <button
                    disabled={appliedJobIds.has(String(selectedJob._id))}
                    onClick={() => setApplyJob(selectedJob)}
                    className={`w-full py-2.5 rounded-full text-xs font-semibold text-center text-white ${
                      appliedJobIds.has(String(selectedJob._id))
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#6366f1] to-[#06b6d4] hover:opacity-90 transition"
                    }`}
                  >
                    {appliedJobIds.has(String(selectedJob._id)) ? "Applied ✓" : "Apply Now"}
                  </button>
                  <button
                    onClick={() => toggleSaveJob(selectedJob)}
                    className="w-full py-2.5 rounded-full text-xs font-semibold text-center text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/5 transition"
                  >
                    {isJobSaved(selectedJob._id) ? "Saved Job ✓" : "Save Job"}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 mt-6 mb-4">
                  {["about", "skills", "company"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveDetailTab(tab)}
                      className="flex-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-center relative"
                      style={{ color: activeDetailTab === tab ? "#a5b4fc" : "rgba(255,255,255,0.4)" }}
                    >
                      {tab}
                      {activeDetailTab === tab && (
                        <motion.div
                          layoutId="desktop-tab-line"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366f1]"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="text-xs leading-relaxed text-slate-300 pr-1 no-scrollbar h-[200px] overflow-y-auto">
                  {activeDetailTab === "about" && (
                    <p className="whitespace-pre-line">{selectedJob.description || "No description provided."}</p>
                  )}
                  {activeDetailTab === "skills" && (
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedJob.skills || []).map((sk) => (
                        <span key={sk} className="skill-tag">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                  {activeDetailTab === "company" && (
                    <div>
                      <p className="font-semibold text-white mb-2">{selectedJob.company}</p>
                      <p className="text-slate-400">
                        A technology-driven company located in {selectedJob.location || "Remote"}. Building scales, optimizing operations, and delivering values.
                      </p>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* MOBILE Bottom Sheet Detail drawer (<1024px viewport) */}
          <AnimatePresence>
            {selectedJob && isMobile && (
              <Dialog.Portal forceMount>
                <Dialog.Overlay asChild>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedJobId(null)}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                  />
                </Dialog.Overlay>
                <Dialog.Content asChild>
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 32 }}
                    className="fixed inset-x-0 bottom-0 z-50 h-[85vh] rounded-t-[20px] bg-[#0f0f1a] border-t border-[#6366f1]/20 p-5 shadow-2xl overflow-y-auto no-scrollbar"
                  >
                    {/* Top drag handle */}
                    <div
                      className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20 cursor-pointer"
                      onClick={() => setSelectedJobId(null)}
                    />

                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-base font-bold text-white">Job Preview</h3>
                      <button
                        onClick={() => setSelectedJobId(null)}
                        className="text-slate-400 hover:text-white p-1 rounded-full"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)` }}
                      >
                        {(selectedJob.company || "J").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">{selectedJob.title}</h2>
                        <p className="text-xs text-slate-400">{selectedJob.company}</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-white/5 p-2 rounded-xl text-center">
                        <DollarSign size={14} className="text-[#34d399] mx-auto mb-1" />
                        <span className="text-[10px] text-slate-300 font-medium block">
                          {formatSalary(selectedJob.salary)}
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl text-center">
                        <Briefcase size={14} className="text-[#6366f1] mx-auto mb-1" />
                        <span className="text-[10px] text-slate-300 font-medium block capitalize">
                          {selectedJob.type}
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl text-center">
                        <Sparkles size={14} className="text-[#06b6d4] mx-auto mb-1" />
                        <span className="text-[10px] text-slate-300 font-medium block">
                          {selectedJob.yearsOfExperience || selectedJob.experience || "Entry"}y exp
                        </span>
                      </div>
                    </div>

                    {/* Quick Apply and Save */}
                    <div className="flex flex-col gap-2 mt-5">
                      <button
                        disabled={appliedJobIds.has(String(selectedJob._id))}
                        onClick={() => {
                          setSelectedJobId(null);
                          setApplyJob(selectedJob);
                        }}
                        className={`w-full py-2.5 rounded-full text-xs font-semibold text-center text-white ${
                          appliedJobIds.has(String(selectedJob._id))
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#6366f1] to-[#06b6d4]"
                        }`}
                      >
                        {appliedJobIds.has(String(selectedJob._id)) ? "Applied ✓" : "Apply Now"}
                      </button>
                      <button
                        onClick={() => toggleSaveJob(selectedJob)}
                        className="w-full py-2.5 rounded-full text-xs font-semibold text-center text-slate-300 border border-white/10"
                      >
                        {isJobSaved(selectedJob._id) ? "Saved Job ✓" : "Save Job"}
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/5 mt-6 mb-4">
                      {["about", "skills", "company"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveDetailTab(tab)}
                          className="flex-1 pb-2 text-xs font-semibold uppercase tracking-wider text-center relative"
                          style={{ color: activeDetailTab === tab ? "#a5b4fc" : "rgba(255,255,255,0.4)" }}
                        >
                          {tab}
                          {activeDetailTab === tab && (
                            <motion.div
                              layoutId="mobile-tab-line"
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366f1]"
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Description Text */}
                    <div className="text-xs leading-relaxed text-slate-300 h-[180px] overflow-y-auto pb-4">
                      {activeDetailTab === "about" && (
                        <p className="whitespace-pre-line">{selectedJob.description || "No description provided."}</p>
                      )}
                      {activeDetailTab === "skills" && (
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedJob.skills || []).map((sk) => (
                            <span key={sk} className="skill-tag">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                      {activeDetailTab === "company" && (
                        <div>
                          <p className="font-semibold text-white mb-2">{selectedJob.company}</p>
                          <p className="text-slate-400">
                            Building products at {selectedJob.location || "Remote"}.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Dialog.Content>
              </Dialog.Portal>
            )}
          </AnimatePresence>

          {/* RADIX compare modal */}
          <Dialog.Root open={compareOpen} onOpenChange={setCompareOpen}>
            <AnimatePresence>
              {compareOpen && (
                <Dialog.Portal forceMount>
                  <Dialog.Overlay asChild>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-black backdrop-blur-sm"
                    />
                  </Dialog.Overlay>
                  <Dialog.Content asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="fixed left-1/2 top-1/2 z-[60] max-h-[88vh] w-[min(1100px,95vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1321] p-6 shadow-2xl outline-none"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <Dialog.Title className="text-xl font-bold text-white">Compare Jobs</Dialog.Title>
                        </div>
                        <Dialog.Close asChild>
                          <button className="rounded-full p-2 text-[#94A3B8] hover:bg-white/5 hover:text-white"><X size={18} /></button>
                        </Dialog.Close>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        {compareJobs.map((job) => (
                          <div key={job._id} className="rounded-2xl border border-white/10 bg-white/4 p-4">
                            <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                            <p className="text-sm text-[#94A3B8]">{job.company}</p>
                            <div className="mt-4 space-y-2 text-sm text-[#E2E8F0]">
                              <div>Salary: {formatSalary(job.salary)}</div>
                              <div>Experience: {Number(job.yearsOfExperience || job.experience || 0)} years</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              )}
            </AnimatePresence>
          </Dialog.Root>

        </div>
      </div>
    </main>
  );
}