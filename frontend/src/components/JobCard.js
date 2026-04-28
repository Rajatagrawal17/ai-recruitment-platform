import React, { useMemo, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  CalendarClock,
  BriefcaseBusiness,
  Layers3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSavedJobs } from "../context/SavedJobsContext";

const hashToGradient = (input = "") => {
  const hash = Array.from(String(input)).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palettes = [
    ["#00D4FF", "#2D6BFF"],
    ["#7C3AED", "#00D4FF"],
    ["#0EA5E9", "#22C55E"],
    ["#F59E0B", "#EC4899"],
    ["#06B6D4", "#8B5CF6"],
  ];
  return palettes[hash % palettes.length];
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

const getMatchMeta = (score = 0) => {
  if (score >= 80) return { label: "Strong Match", color: "#22C55E" };
  if (score >= 60) return { label: "Good Match", color: "#EAB308" };
  if (score >= 40) return { label: "Moderate", color: "#FB923C" };
  return { label: "Low Match", color: "#EF4444" };
};

const JobCard = ({
  job,
  matchScore = null,
  isApplied = false,
  isCandidate = false,
  onViewDetails,
  onApply,
  onCompareToggle,
  isCompared = false,
  onSaveToggle,
  isSaved = false,
  onHoverStart,
  onHoverEnd,
}) => {
  const navigate = useNavigate();
  const { toggleSaveJob } = useSavedJobs();
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [scoreVisible, setScoreVisible] = useState(false);
  const hoverTimerRef = useRef(null);
  const cardRef = useRef(null);
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.35 });

  const skills = useMemo(() => job.skills || [], [job.skills]);
  const visibleSkills = showAllSkills ? skills : skills.slice(0, 4);
  const extraSkillCount = Math.max(0, skills.length - visibleSkills.length);
  const postedLabel = job.createdAt
    ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
    : "Recently";
  const score = Number(matchScore || job.matchScore || 0);
  const matchMeta = getMatchMeta(score);
  const [fromColor, toColor] = hashToGradient(job.company || job.title || "job");

  React.useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
      const timer = setTimeout(() => setScoreVisible(true), 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [inView, controls]);

  const handleSave = (event) => {
    event.stopPropagation();
    if (onSaveToggle) onSaveToggle(job);
    else toggleSaveJob(job);
  };

  const handleApply = (event) => {
    event.stopPropagation();
    if (isApplied) return;
    onApply?.(job);
  };

  const handleView = (event) => {
    event.stopPropagation();
    if (onViewDetails) onViewDetails(job);
    else navigate(`/jobs/${job._id}`);
  };

  const handleMouseEnter = () => {
    setHovering(true);
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      onHoverStart?.(job, cardRef.current?.getBoundingClientRect());
    }, 1000);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    clearTimeout(hoverTimerRef.current);
    onHoverEnd?.();
  };

  const applyLabel = isApplied ? "Applied ✓" : "Apply Now";

  return (
    <motion.article
      ref={(node) => {
        ref(node);
        cardRef.current = node;
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={controls}
      transition={{ duration: 0.45, ease: "easeOut" }}
      layout
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4, borderColor: "rgba(0,212,255,0.4)", boxShadow: "0 8px 32px rgba(0,212,255,0.12)" }}
      className="relative rounded-2xl border border-white/8 bg-white/4 p-6 text-white backdrop-blur-sm"
    >
      <div className="mb-5 flex items-start gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-[#0A0F1E]"
          style={{ background: `linear-gradient(135deg, ${fromColor}, ${toColor})` }}
        >
          {(job.company || job.title || "J").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[1.1rem] font-bold leading-6 text-white">{job.title}</h3>
          <p className="mt-1 text-sm text-[#94A3B8]">{job.company}</p>
        </div>

        <button
          onClick={handleSave}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-[#94A3B8] transition hover:border-[#00D4FF]/30 hover:text-[#00D4FF]"
          title="Save Job"
        >
          {isSaved ? <BookmarkCheck size={18} className="text-[#00D4FF]" /> : <Bookmark size={18} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <MetaPill icon={MapPin}>{job.location || "Remote"}</MetaPill>
        <MetaPill icon={BriefcaseBusiness}>{job.type || "full-time"}</MetaPill>
        <MetaPill icon={CalendarClock}>{postedLabel}</MetaPill>
      </div>

      {isCandidate && matchScore !== null && (
        <MatchBlock score={score} meta={matchMeta} visible={scoreVisible} />
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {visibleSkills.map((skill) => (
          <span key={skill} className="rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-3 py-1 text-[0.75rem] font-medium text-[#7DDFFF]">
            {skill}
          </span>
        ))}
        {extraSkillCount > 0 && (
          <button
            onClick={() => setShowAllSkills((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[0.75rem] text-[#94A3B8] transition hover:border-[#00D4FF]/25 hover:text-white"
          >
            {showAllSkills ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showAllSkills ? "Show less" : `+${extraSkillCount} more`}
          </button>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-4 text-sm text-[#94A3B8]">
        <div className="flex flex-wrap items-center gap-4">
          <span>{formatSalary(job.salary)}</span>
          <span className="h-4 w-px bg-white/10" />
          <span>{Number(job.yearsOfExperience || job.experience || 0)} years experience</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleView}
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:border-white/25"
        >
          View Details <ArrowRight size={16} className="ml-1 inline-block" />
        </motion.button>

        {isCandidate ? (
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,212,255,0.35)" }}
            whileTap={{ scale: 0.97 }}
            disabled={isApplied}
            onClick={handleApply}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${isApplied ? "cursor-not-allowed bg-emerald-500/15 text-emerald-300" : "bg-[#00D4FF] text-[#0A0F1E]"}`}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {isApplied ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              {applyLabel}
            </span>
          </motion.button>
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-center text-sm text-[#94A3B8]">
            AI matched jobs shown
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-[#94A3B8]">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={isCompared}
            onChange={(event) => onCompareToggle?.(event.target.checked)}
            className="h-4 w-4 rounded border-white/15 bg-transparent accent-[#00D4FF]"
            onClick={(event) => event.stopPropagation()}
          />
          Compare
        </label>
        <span className="h-3 w-px bg-white/10" />
        <span>{job.applicantsCount || 0} applicants</span>
      </div>

      {hovering && <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-[#00D4FF]/20" />}
    </motion.article>
  );
};

const MatchBlock = ({ score, meta, visible }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.35 });
  const progress = visible && inView ? `${score}%` : "0%";

  return (
    <div ref={ref} className="mt-5 rounded-2xl border border-white/8 bg-white/4 p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium text-[#E2E8F0]">Your AI Match</span>
        <span style={{ color: meta.color }}>{score}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: progress }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#2D6BFF]"
        />
      </div>
      <div className="mt-3 text-xs" style={{ color: meta.color }}>
        {meta.label}
      </div>
      <p className="mt-2 text-xs text-[#94A3B8]">{score >= 80 ? "🟢 Strong Match" : score >= 60 ? "🟡 Good Match" : score >= 40 ? "🟠 Moderate" : "🔴 Low Match"}</p>
    </div>
  );
};

const MetaPill = ({ children, icon: Icon }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-white/6 px-3 py-1 text-xs text-[#E2E8F0]">
    <Icon size={12} className="text-[#00D4FF]" />
    {children}
  </span>
);

export default JobCard;
