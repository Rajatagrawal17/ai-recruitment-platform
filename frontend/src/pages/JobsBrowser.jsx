import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
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
import { toast } from "react-hot-toast";

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
  placeholder: (base) => ({ ...base, color: "#64748B" }),
  singleValue: (base) => ({ ...base, color: "white" }),
};

const normalize = (value = "") => String(value).toLowerCase().trim();
const getUserId = (user) => user?._id || user?.id || "";
const getExperienceBucket = (job) => {
  const years = Number(job?.yearsOfExperience || job?.experience || 0);
  if (years <= 2) return "junior";
  if (years <= 5) return "mid";
  return "senior";
};
const formatSalary = (salary) => {
  if (typeof salary === "number" && salary > 0) {
    const lpa = Math.max(1, Math.round(salary / 100000));
    return `₹${Math.max(1, Math.round(lpa * 0.85))} - ₹${Math.max(1, Math.round(lpa * 1.15))} LPA`;
  }
  if (Array.isArray(salary)) return `₹${salary[0]} - ₹${salary[1]}`;
  if (typeof salary === "string" && salary.trim()) return salary;
  return "Negotiable";
};
const displayCountText = (count) => {
  if (!count || count < 0) return "0";
  return String(count);
};

const FilterSection = ({ label, children }) => (
  <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">{label}</h3>
    {children}
  </section>
);

const EmptyFolderIllustration = () => (
  <svg viewBox="0 0 240 180" className="mx-auto h-40 w-56 text-[#00D4FF]/40">
    <path d="M26 56c0-8.8 7.2-16 16-16h39l16 16h117c8.8 0 16 7.2 16 16v57c0 8.8-7.2 16-16 16H42c-8.8 0-16-7.2-16-16V56z" fill="currentColor" opacity="0.12" />
    <path d="M26 74h188v55c0 8.8-7.2 16-16 16H42c-8.8 0-16-7.2-16-16V74z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
    <path d="M52 46h48l16 16h76" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="120" cy="103" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    <path d="M113 103h14M120 96v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const FiltersPanel = ({
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
}) => (
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
            placeholder="Search jobs"
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
              <button key={type} onClick={() => toggleType(type)} className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${active ? "border-[#00D4FF] bg-[#00D4FF] text-[#0A0F1E]" : "border-white/15 bg-transparent text-[#94A3B8]"}` }>
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
              <button key={level.value} onClick={() => toggleExperience(level.value)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${active ? "border-[#00D4FF] bg-[#00D4FF] text-[#0A0F1E]" : "border-white/15 bg-transparent text-[#94A3B8]"}` }>
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

const JobsBrowser = () => {