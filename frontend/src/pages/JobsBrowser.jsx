import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import * as Slider from "@radix-ui/react-slider";
import Select from "react-select";
import CountUp from "react-countup";
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
    borderColor: state.isFocused ? "#00D4FF" : "rgba(255,255,255,0.12)",
    boxShadow: state.isFocused ? "0 0 0 1px #00D4FF" : "none",
    minHeight: 48,
    borderRadius: 14,
    "&:hover": { borderColor: "#00D4FF" },
  }),
  menu: (base) => ({ ...base, backgroundColor: "#0D1321", zIndex: 60 }),
  menuList: (base) => ({ ...base, padding: 8 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgba(0,212,255,0.18)"
      : state.isFocused
      ? "rgba(255,255,255,0.06)"
      : "transparent",
    color: "#E2E8F0",
    borderRadius: 10,
    cursor: "pointer",
  }),
  multiValue: (base) => ({ ...base, backgroundColor: "rgba(0,212,255,0.14)" }),
  multiValueLabel: (base) => ({ ...base, color: "#00D4FF" }),
  multiValueRemove: (base) => ({ ...base, color: "#00D4FF", "&:hover": { backgroundColor: "rgba(0,212,255,0.18)", color: "white" } }),
  input: (base) => ({ ...base, color: "white" }),
  placeholder: (base) => ({ ...base, color: "#94A3B8" }),
  singleValue: (base) => ({ ...base, color: "white" }),
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 }}
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' }}
};


function FilterSection({ label, children }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">{label}</h3>
      {children}
    </section>
  );
}

function EmptyFolderIllustration() {
  return (
    <svg viewBox="0 0 240 180" className="mx-auto h-40 w-56 text-[#00D4FF]/40">
      <path d="M26 56c0-8.8 7.2-16 16-16h39l16 16h117c8.8 0 16 7.2 16 16v57c0 8.8-7.2 16-16 16H42c-8.8 0-16-7.2-16-16V56z" fill="currentColor" opacity="0.12" />
      <path d="M26 74h188v55c0 8.8-7.2 16-16 16H42c-8.8 0-16-7.2-16-16V74z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <path d="M52 46h48l16 16h76" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="120" cy="103" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
      <path d="M113 103h14M120 96v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FiltersPanel({
  skillsOptions,
  searchInput,
  setSearchInput,
  handleSearchKeyDown,
  suggestionIndex,
  setSuggestionIndex,
  suggestions,
  selectedTypes,
  toggleType,
  selectedExperience,
  toggleExperience,
  isCandidate,
  minMatch,
  setMinMatch,
  selectedSkills,
  setSelectedSkills,
  salaryMin,
  setSalaryMin,
  salaryMax,
  setSalaryMax,
  clearAllFilters,
  setMobileFiltersOpen,
  mobile = false,
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">Smart Filters</h2>
        <p className="text-sm text-[#94A3B8]">Refine jobs with live filters and AI signals.</p>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1">
        <FilterSection label="Search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            <input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setSuggestionIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search jobs by title, company or skill..."
              className="w-full rounded-2xl border border-white/10 bg-white/6 py-3 pl-10 pr-10 text-sm text-white outline-none transition focus:border-[#00D4FF]"
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#94A3B8] hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
          <AnimatePresence>
            {suggestions.length > 0 && searchInput && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-[#0D1321] p-2">
                {suggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  return (
                    <button key={`${suggestion.type}-${suggestion.value}`} onClick={() => setSearchInput(suggestion.value)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${index === suggestionIndex ? "bg-white/8" : "hover:bg-white/5"}`}>
                      <Icon size={16} className="text-[#00D4FF]" />
                      <div>
                        <p className="text-sm text-white">{suggestion.label}</p>
                        <p className="text-xs text-[#94A3B8]">{suggestion.meta}</p>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </FilterSection>

        <FilterSection label="Employment Type">
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((type) => {
              const active = selectedTypes.includes(type);
              return (
                <button key={type} onClick={() => toggleType(type)} className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${active ? "border-[#00D4FF] bg-[#00D4FF] text-[#0A0F1E]" : "border-white/15 bg-transparent text-[#94A3B8]"}`}>
                  {type}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection label="Experience Level">
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((level) => {
              const active = selectedExperience.includes(level.value);
              return (
                <button key={level.value} onClick={() => toggleExperience(level.value)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${active ? "border-[#00D4FF] bg-[#00D4FF] text-[#0A0F1E]" : "border-white/15 bg-transparent text-[#94A3B8]"}`}>
                  {level.label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {isCandidate && (
          <FilterSection label="Minimum Match Score">
            <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
              <p className="mb-3 text-sm text-[#94A3B8]">Show jobs above: {minMatch}% match</p>
              <Slider.Root value={[minMatch]} min={0} max={100} step={1} onValueChange={([value]) => setMinMatch(value)} className="relative flex h-5 items-center">
                <Slider.Track className="relative h-1.5 flex-1 rounded-full bg-white/10">
                  <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-cyan-400" />
                </Slider.Track>
                <Slider.Thumb className="block h-4 w-4 rounded-full border border-[#00D4FF] bg-[#00D4FF] shadow-[0_0_0_4px_rgba(0,212,255,0.18)] outline-none" />
              </Slider.Root>
            </div>
          </FilterSection>
        )}

        <FilterSection label="Required Skills">
          <Select
            isMulti
            value={selectedSkills}
            onChange={setSelectedSkills}
            options={skillsOptions}
            styles={selectStyles}
            placeholder="Select skills"
            closeMenuOnSelect={false}
          />
        </FilterSection>

        <FilterSection label="Salary Range">
          <div className="grid grid-cols-2 gap-3">
            <input value={salaryMin} onChange={(event) => setSalaryMin(event.target.value)} placeholder="Min ₹" className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00D4FF]" />
            <input value={salaryMax} onChange={(event) => setSalaryMax(event.target.value)} placeholder="Max ₹" className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00D4FF]" />
          </div>
        </FilterSection>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-white/8 pt-4">
        <button onClick={clearAllFilters} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-[#94A3B8] transition hover:text-red-300">
          Clear All Filters
        </button>
        {mobile && (
          <button onClick={() => setMobileFiltersOpen(false)} className="rounded-2xl bg-[#00D4FF] px-4 py-3 text-sm font-semibold text-[#0A0F1E]">
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
}

export default function JobsBrowser() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { user, role } = useAuth();
  const { savedJobs, isJobSaved, toggleSaveJob, getSavedJobsCount, unsaveJob, clearAllSavedJobs } = useSavedJobs();
  const isCandidate = role === "candidate";
  const userId = getUserId(user);

  const [viewMode, setViewMode] = useState("all");
  const [allJobs, setAllJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [candidateApplications, setCandidateApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMode, setLoadingMode] = useState("all");
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
  const [previewJob, setPreviewJob] = useState(null);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const searchInputRef = useRef(null);
  const previewTimerRef = useRef(null);
  const listParentRef = useRef(null);
  const columnsRef = useRef(1);
  const gridRef = () => {};

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function loadJobs() {
    setLoading(true);
    setLoadingMode("all");
    try {
      console.log('API URL:', process.env.REACT_APP_API_URL);
      const response = await getJobs();
      console.log('Fetch response status:', response.status);
      const data = response.data;
      console.log('Jobs data:', data);
      setAllJobs(data.jobs || []);
      setError("");
    } catch (err) {
      console.error('Jobs fetch error:', err);
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

      setLoading(true);
      setLoadingMode("matched");
      try {
        const res = await getCandidateJobMatches(userId);
        setMatchedJobs(res.data.recommendations || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to load matched jobs.");
        setMatchedJobs([]);
      } finally {
        setLoading(false);
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

  const suggestions = useMemo(() => {
    if (!debouncedSearch) return [];
    const query = normalize(debouncedSearch);
    const seen = new Set();
    const items = [];

    baseJobs.forEach((job) => {
      const title = normalize(job.title);
      const company = normalize(job.company);
      if (title.includes(query) && !seen.has(`t-${job.title}`)) {
        items.push({ type: "title", label: job.title, meta: job.company, value: job.title, icon: Search });
        seen.add(`t-${job.title}`);
      }
      if (company.includes(query) && !seen.has(`c-${job.company}`)) {
        items.push({ type: "company", label: job.company, meta: job.title, value: job.company, icon: Building2 });
        seen.add(`c-${job.company}`);
      }
      (job.skills || []).forEach((skill) => {
        if (normalize(skill).includes(query) && !seen.has(`s-${skill}`)) {
          items.push({ type: "skill", label: skill, meta: job.title, value: skill, icon: Sparkles });
          seen.add(`s-${skill}`);
        }
      });
    });

    return items.slice(0, 6);
  }, [debouncedSearch, baseJobs]);

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
    if (minSalary !== null) jobs = jobs.filter((job) => Number(job.salary || 0) >= minSalary);
    if (maxSalary !== null) jobs = jobs.filter((job) => Number(job.salary || 0) <= maxSalary);

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

  function handleSearchKeyDown(event) {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestionIndex((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === "Enter" && suggestionIndex >= 0) {
      event.preventDefault();
      const suggestion = suggestions[suggestionIndex];
      if (suggestion) {
        setSearchInput(suggestion.value);
        setDebouncedSearch(suggestion.value);
        setSuggestionIndex(-1);
      }
    }
  }

  function openPreview(job) {
    clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => setPreviewJob(job), 1000);
  }

  function closePreview() {
    clearTimeout(previewTimerRef.current);
    setPreviewJob(null);
  }

  const compareJobs = filteredJobs.filter((job) => compareIds.includes(job._id));
  const pendingApplications = candidateApplications.filter((application) => application.status === "pending").length;

  const activeChips = useMemo(() => {
    const chips = [];
    if (debouncedSearch) {
      chips.push({ id: `search-${debouncedSearch}`, label: `Search: ${debouncedSearch}`, onClear: () => { setSearchInput(""); setDebouncedSearch(""); } });
    }
    selectedTypes.forEach((type) => {
      chips.push({ id: `type-${type}`, label: type.toUpperCase(), onClear: () => toggleType(type) });
    });
    selectedExperience.forEach((exp) => {
      const label = EXPERIENCE_LEVELS.find(e => e.value === exp)?.label || exp;
      chips.push({ id: `exp-${exp}`, label, onClear: () => toggleExperience(exp) });
    });
    selectedSkills.forEach((skill) => {
      chips.push({ id: `skill-${skill.value}`, label: skill.label, onClear: () => setSelectedSkills(prev => prev.filter(s => s.value !== skill.value)) });
    });
    if (salaryMin) {
      chips.push({ id: `sal-min-${salaryMin}`, label: `Min ₹${salaryMin}`, onClear: () => setSalaryMin("") });
    }
    if (salaryMax) {
      chips.push({ id: `sal-max-${salaryMax}`, label: `Max ₹${salaryMax}`, onClear: () => setSalaryMax("") });
    }
    return chips;
  }, [debouncedSearch, selectedTypes, selectedExperience, selectedSkills, salaryMin, salaryMax]);

  function onApplySuccess() {
    if (viewMode === "matched" && isCandidate && userId) {
      getCandidateJobMatches(userId).then((res) => setMatchedJobs(res.data.recommendations || [])).catch(() => null);
    }
    if (isCandidate && userId) {
      getCandidateApplications().then((res) => setCandidateApplications(res.data.applications || [])).catch(() => null);
    }
    getJobs().then((res) => setAllJobs(res.data.jobs || [])).catch(() => null);
  }

  const displayCount = filteredJobs?.length ?? 0;
  const totalCount = baseJobs?.length ?? 0;

  const rowVirtualizer = useVirtualizer({
    count: filteredJobs.length,
    getScrollElement: () => listParentRef.current,
    estimateSize: () => 100,   // estimated card height in px
    overscan: 5,               // render 5 cards above/below viewport
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (el) => el?.getBoundingClientRect().height
        : undefined,
  });
  
  // Safe roleSubtitle generation with defensive checks
  let roleSubtitle = "";
  try {
    const countText = displayCountText(displayCount);
    roleSubtitle = isCandidate 
      ? `${countText} positions available · AI-matched for you` 
      : `${countText} positions available`;
  } catch (e) {
    console.warn("Error generating roleSubtitle:", e);
    roleSubtitle = `${displayCount} positions available`;
  }

   // Safe render with error boundary
  try {
    return (
    <main className="min-h-screen overflow-x-hidden bg-[#0A0F1E] text-white">
      <style>{`
        .jobs-shimmer { background: linear-gradient(90deg, #0D1321 25%, #1a2035 50%, #0D1321 75%); background-size: 200% 100%; animation: shimmer 1.6s linear infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <ApplyDrawer open={Boolean(applyJob)} job={applyJob} onOpenChange={(open) => !open && setApplyJob(null)} onSuccess={onApplySuccess} />

      <Dialog.Root open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <AnimatePresence>
          {mobileFiltersOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-black backdrop-blur-sm"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-[28px] border-t border-white/10 bg-[#0D1321] p-5 shadow-2xl outline-none md:hidden"
                >
                  <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/15" />
                  <div className="mb-4 flex items-center justify-between">
                    <Dialog.Title className="text-lg font-semibold">Smart Filters</Dialog.Title>
                    <VisuallyHidden>
                      <Dialog.Description>Filter jobs dynamically by categories, locations, skills, and match scores.</Dialog.Description>
                    </VisuallyHidden>
                    <Dialog.Close asChild>
                      <button className="rounded-full p-2 text-[#94A3B8] hover:bg-white/5 hover:text-white">
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="max-h-[64vh] overflow-y-auto pr-1">
                    <FiltersPanel
                      skillsOptions={skillsOptions}
                      searchInput={searchInput}
                      setSearchInput={setSearchInput}
                      handleSearchKeyDown={handleSearchKeyDown}
                      suggestionIndex={suggestionIndex}
                      setSuggestionIndex={setSuggestionIndex}
                      suggestions={suggestions}
                      selectedTypes={selectedTypes}
                      toggleType={toggleType}
                      selectedExperience={selectedExperience}
                      toggleExperience={toggleExperience}
                      isCandidate={isCandidate}
                      minMatch={minMatch}
                      setMinMatch={setMinMatch}
                      selectedSkills={selectedSkills}
                      setSelectedSkills={setSelectedSkills}
                      salaryMin={salaryMin}
                      setSalaryMin={setSalaryMin}
                      salaryMax={salaryMax}
                      setSalaryMax={setSalaryMax}
                      clearAllFilters={clearAllFilters}
                      setMobileFiltersOpen={setMobileFiltersOpen}
                      mobile
                    />
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col xl:flex-row">
        <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 border-r border-white/8 bg-white/[0.03] px-5 py-6 backdrop-blur xl:block">
          <FiltersPanel
            skillsOptions={skillsOptions}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleSearchKeyDown={handleSearchKeyDown}
            suggestionIndex={suggestionIndex}
            setSuggestionIndex={setSuggestionIndex}
            suggestions={suggestions}
            selectedTypes={selectedTypes}
            toggleType={toggleType}
            selectedExperience={selectedExperience}
            toggleExperience={toggleExperience}
            isCandidate={isCandidate}
            minMatch={minMatch}
            setMinMatch={setMinMatch}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            salaryMin={salaryMin}
            setSalaryMin={setSalaryMin}
            salaryMax={salaryMax}
            setSalaryMax={setSalaryMax}
            clearAllFilters={clearAllFilters}
            setMobileFiltersOpen={setMobileFiltersOpen}
          />
        </aside>

        <section className="flex-1 px-4 pt-6 pb-[100px] sm:px-6 lg:px-8 lg:pt-8 lg:pb-[100px]">
          <header className="mb-6 rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent p-5 backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00D4FF]">
                  {displayCount} open positions
                </div>
                <h1 className="text-3xl font-bold sm:text-4xl gradient-text">Find Your Next Role</h1>
                <p className="mt-2 text-sm text-[#94A3B8] sm:text-base">AI-matched opportunities for you</p>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1.5 text-sm font-medium">
                {[
                  { key: "all", label: "All Jobs" },
                  { key: "matched", label: "AI Matched" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setViewMode(item.key)}
                    className="relative rounded-full px-5 py-2 text-white/80 transition-colors"
                  >
                    {viewMode === item.key && (
                      <motion.span layoutId="job-mode-pill" className="absolute inset-0 rounded-full bg-[#00D4FF]" transition={{ type: "spring", stiffness: 320, damping: 30 }} />
                    )}
                    <span className={`relative z-10 ${viewMode === item.key ? "text-[#0A0F1E]" : ""}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative max-w-2xl flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                <input
                  ref={searchInputRef}
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSuggestionIndex(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search jobs by title, company or skill..."
                  className="w-full rounded-2xl border border-white/10 bg-white/6 py-3 pl-11 pr-12 text-white placeholder:text-[#94A3B8] outline-none transition focus:border-[#00D4FF] focus:bg-white/8"
                />
                {searchInput && (
                  <button onClick={() => { setSearchInput(""); setDebouncedSearch(""); setSuggestionIndex(-1); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#94A3B8] hover:bg-white/5 hover:text-white">
                    <X size={16} />
                  </button>
                )}

                <AnimatePresence>
                  {suggestions.length > 0 && debouncedSearch && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute left-0 right-0 top-[110%] z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#0D1321] p-2 shadow-2xl">
                      {suggestions.map((suggestion, index) => {
                        const Icon = suggestion.icon;
                        return (
                          <button key={`${suggestion.type}-${suggestion.value}`} onClick={() => { setSearchInput(suggestion.value); setDebouncedSearch(suggestion.value); setSuggestionIndex(-1); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${index === suggestionIndex ? "bg-white/8" : "hover:bg-white/5"}`}>
                            <Icon size={16} className="text-[#00D4FF]" />
                            <div>
                              <div className="text-sm font-medium text-white">{suggestion.label}</div>
                              <div className="text-xs text-[#94A3B8]">{suggestion.meta}</div>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setMobileFiltersOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white md:hidden">
                <Filter size={16} /> Filters
              </button>

              <div className="hidden items-center gap-2 md:flex">
                <span className="text-sm text-[#94A3B8]">Sort</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-2xl border border-white/10 bg-[#0D1321] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00D4FF]">
                  {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </div>
          </header>

          <div className="mb-6 flex items-center justify-between text-sm text-[#94A3B8]">
            <span>
              {debouncedSearch || selectedTypes.length || selectedExperience.length || selectedSkills.length || salaryMin || salaryMax ? (
                `${displayCount} ${displayCount === 1 ? 'job matches' : 'jobs match'} your search`
              ) : (
                `Showing ${displayCount} ${displayCount === 1 ? 'job' : 'jobs'}`
              )}
            </span>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-[#00D4FF]">●</span>
              <span>{getSavedJobsCount()} saved jobs</span>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { label: "Full Time", type: "type", value: "full-time" },
              { label: "Remote", type: "type", value: "remote" },
              { label: "Part Time", type: "type", value: "part-time" },
              { label: "Entry Level", type: "experience", value: "junior" },
              { label: "Senior", type: "experience", value: "senior" },
              { label: "Contract", type: "type", value: "contract" },
            ].map((chip) => {
              const isActive = chip.type === "type" 
                ? selectedTypes.includes(chip.value)
                : selectedExperience.includes(chip.value);
              
              const handleToggle = () => {
                if (chip.type === "type") {
                  toggleType(chip.value);
                } else {
                  toggleExperience(chip.value);
                }
              };

              return (
                <button
                  key={chip.label}
                  onClick={handleToggle}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 border ${
                    isActive
                      ? "bg-[#00D4FF] border-[#00D4FF] text-[#0A0F1E] shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                      : "bg-white/4 border-white/10 text-[#94A3B8] hover:border-white/20 hover:text-white"
                  }`}
                >
                  {isActive && <Check size={12} />}
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mr-1">Active:</span>
              <AnimatePresence>
                {activeChips.map((chip) => (
                  <motion.button
                    key={chip.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                    }}
                    onClick={chip.onClear}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/25 px-3 py-1.5 text-xs font-semibold text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-all duration-200"
                  >
                    <span>{chip.label}</span>
                    <X size={12} className="shrink-0 text-[#00D4FF]/70 hover:text-white" />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#94A3B8] animate-pulse">
                <Loader2 className="animate-spin text-[#00D4FF]" size={16} />
                <span>Loading opportunities...</span>
              </div>
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3 animate-fade-in">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonJobCard key={index} />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[28px] border border-red-500/20 bg-red-500/5 px-6 py-16 text-center animate-fade-in">
              <EmptyFolderIllustration />
              <h2 className="mt-6 text-2xl font-bold text-red-400">Taking longer than usual...</h2>
              <p className="mt-2 max-w-lg text-sm text-[#94A3B8]">The server may be starting up. Refresh in 30 seconds.</p>
              <div className="mt-6 flex justify-center gap-4">
                <button onClick={loadJobs} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition shadow-lg shadow-red-500/20">
                  Try again
                </button>
                <button onClick={() => window.location.reload()} className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition">
                  Refresh
                </button>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            hasActiveFilters ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[28px] border border-white/8 bg-white/[0.04] px-6 py-16 text-center animate-fade-in">
                <EmptyFolderIllustration />
                <h2 className="mt-6 text-2xl font-bold text-white">No matches found</h2>
                <p className="mt-2 max-w-lg text-sm text-[#94A3B8]">Try adjusting your search or clearing filters to reveal more opportunities.</p>
                <button onClick={clearAllFilters} className="mt-6 rounded-full bg-[#00D4FF] px-6 py-3 font-semibold text-[#0A0F1E]">Clear Filters</button>
              </div>
            ) : (
              <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[28px] border border-white/8 bg-white/[0.04] px-6 py-16 text-center animate-fade-in">
                <Loader2 className="h-12 w-12 animate-spin text-[#00D4FF] mb-4" />
                <h2 className="mt-2 text-2xl font-bold text-white">Jobs are loading...</h2>
                <p className="mt-2 max-w-lg text-sm text-[#94A3B8]">Please wait while we fetch the latest opportunities.</p>
              </div>
            )
          ) : (
            <div
              ref={listParentRef}
              style={{
                height: filteredJobs.length > 5 ? "calc(100vh - 280px)" : "auto",
                overflowY: filteredJobs.length > 5 ? "auto" : "visible",
                position: "relative",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0,212,255,0.25) transparent",
              }}
            >
              {/* Spacer div that gives the virtualizer its total scroll height */}
              <div
                style={{
                  height: filteredJobs.length > 5
                    ? rowVirtualizer.getTotalSize()
                    : "auto",
                  position: filteredJobs.length > 5 ? "relative" : "static",
                }}
              >
                {filteredJobs.length > 5
                  ? rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const job = filteredJobs[virtualRow.index];
                      const matchData = candidateMatchMap[job._id];
                      const isApplied = appliedJobIds.has(String(job._id));
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
                            key={job._id}
                            layout
                            variants={itemVariants}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, y: 20 }}
                          >
                            <JobCard
                              job={job}
                              matchScore={matchData?.matchScore || job.matchScore || null}
                              matchExplanation={matchData?.explanation}
                              isApplied={isApplied}
                              isCandidate={isCandidate}
                              onViewDetails={() => navigate(`/jobs/${job._id}`)}
                              onApply={() => setApplyJob(job)}
                              onCompareToggle={(checked) => {
                                setCompareIds((prev) => {
                                  if (checked) {
                                    if (prev.length >= 3) {
                                      toast.error("You can compare up to 3 jobs.");
                                      return prev;
                                    }
                                    return [...prev, job._id];
                                  }
                                  return prev.filter((id) => id !== job._id);
                                });
                              }}
                              isCompared={compareIds.includes(job._id)}
                              onSaveToggle={() => toggleSaveJob(job)}
                              isSaved={isJobSaved(job._id)}
                              onHoverStart={() => openPreview(job)}
                              onHoverEnd={closePreview}
                              searchQuery={debouncedSearch}
                            />
                          </motion.div>
                        </div>
                      );
                    })
                  : (
                      <motion.div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          width: '100%'
                        }}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                      >
                        <AnimatePresence mode="popLayout">
                          {filteredJobs.map((job) => {
                            const matchData = candidateMatchMap[job._id];
                            const isApplied = appliedJobIds.has(String(job._id));
                            return (
                              <motion.div
                                key={job._id}
                                layout
                                variants={itemVariants}
                                exit={{ opacity: 0, y: 20 }}
                              >
                                <JobCard
                                  job={job}
                                  matchScore={matchData?.matchScore || job.matchScore || null}
                                  matchExplanation={matchData?.explanation}
                                  isApplied={isApplied}
                                  isCandidate={isCandidate}
                                  onViewDetails={() => navigate(`/jobs/${job._id}`)}
                                  onApply={() => setApplyJob(job)}
                                  onCompareToggle={(checked) => {
                                    setCompareIds((prev) => {
                                      if (checked) {
                                        if (prev.length >= 3) {
                                          toast.error("You can compare up to 3 jobs.");
                                          return prev;
                                        }
                                        return [...prev, job._id];
                                      }
                                      return prev.filter((id) => id !== job._id);
                                    });
                                  }}
                                  isCompared={compareIds.includes(job._id)}
                                  onSaveToggle={() => toggleSaveJob(job)}
                                  isSaved={isJobSaved(job._id)}
                                  onHoverStart={() => openPreview(job)}
                                  onHoverEnd={closePreview}
                                  searchQuery={debouncedSearch}
                                />
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>
                  )
                }
              </div>
            </div>
          )}

          <AnimatePresence>
            {previewJob && (
              <motion.aside initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed right-4 top-28 z-30 hidden w-80 rounded-2xl border border-white/10 bg-[#0D1321] p-4 shadow-2xl xl:block">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Quick Preview</p>
                    <p className="text-xs text-[#94A3B8]">Hover details for faster decisions</p>
                  </div>
                  <button onClick={closePreview} className="text-[#94A3B8] hover:text-white"><X size={16} /></button>
                </div>
                <p className="text-sm leading-6 text-[#E2E8F0]">{(previewJob.description || "").slice(0, 120)}...</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(previewJob.skills || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-3 py-1 text-xs text-[#00D4FF]">{skill}</span>
                  ))}
                </div>
                {isCandidate && (
                  <button onClick={() => setApplyJob(previewJob)} className="mt-4 w-full rounded-full bg-[#00D4FF] px-4 py-2.5 font-semibold text-[#0A0F1E]">Quick Apply</button>
                )}
              </motion.aside>
            )}
          </AnimatePresence>

          {compareIds.length > 0 && (
            <motion.div initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-[#0D1321] px-4 py-3 shadow-2xl">
              <button onClick={() => setCompareOpen(true)} className="flex items-center gap-3 text-sm font-semibold text-white">
                <Layers3 size={16} className="text-[#00D4FF]" /> Compare {compareIds.length} Jobs →
              </button>
            </motion.div>
          )}

          <Dialog.Root open={compareOpen} onOpenChange={setCompareOpen}>
            <AnimatePresence>
              {compareOpen && (
                <Dialog.Portal forceMount>
                  <Dialog.Overlay asChild>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-50 bg-black backdrop-blur-sm"
                    />
                  </Dialog.Overlay>
                  <Dialog.Content asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="fixed left-1/2 top-1/2 z-[60] max-h-[88vh] w-[min(1100px,95vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1321] p-6 shadow-2xl outline-none"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <Dialog.Title className="text-xl font-bold text-white">Compare Jobs</Dialog.Title>
                          <Dialog.Description className="text-sm text-[#94A3B8]">Side by side comparison of your shortlisted jobs.</Dialog.Description>
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
                              <div>Match: {Number(job.matchScore || candidateMatchMap[job._id]?.matchScore || 0)}%</div>
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

          {isCandidate && candidateApplications.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-4 right-4 z-30 hidden xl:block">
              <button onClick={() => setTrackerOpen((prev) => !prev)} className="flex items-center gap-3 rounded-full border border-white/10 bg-[#0D1321] px-4 py-3 text-sm text-white shadow-2xl">
                <Bell size={16} className="text-[#00D4FF]" />
                You have {pendingApplications} pending applications
              </button>
              <AnimatePresence>
                {trackerOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} className="absolute bottom-14 right-0 w-80 rounded-2xl border border-white/10 bg-[#0D1321] p-4 shadow-2xl">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Application Tracker</span>
                      <button onClick={() => setTrackerOpen(false)} className="text-[#94A3B8] hover:text-white"><X size={16} /></button>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {candidateApplications.slice(0, 4).map((application) => (
                        <div key={application._id} className="rounded-xl border border-white/8 bg-white/4 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">{application.jobTitle || application.job?.title || "Application"}</p>
                              <p className="text-xs text-[#94A3B8]">{application.company || application.job?.company || "Company"}</p>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${application.status === "accepted" ? "bg-emerald-500/15 text-emerald-300" : application.status === "rejected" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"}`}>
                              {application.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <div className="mt-10 flex justify-center">
            <button onClick={clearAllFilters} className="rounded-full border border-white/10 px-4 py-2 text-sm text-[#94A3B8] transition hover:border-red-400/40 hover:text-red-300">
              Clear All Filters
            </button>
          </div>
        </section>
      </div>
    </main>
    );
  } catch (renderError) {
    console.error("JobsBrowser render error:", renderError);
    return (
      <main className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-[#94A3B8] mb-6">We're working on fixing this. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-[#00D4FF] text-[#0A0F1E] rounded-full font-semibold hover:opacity-80 transition"
          >
            Refresh Page
          </button>
        </div>
      </main>
    );
  }
}