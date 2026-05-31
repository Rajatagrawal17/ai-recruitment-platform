import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, MapPin, Calendar, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSavedJobs } from "../context/SavedJobsContext";
import "./JobCard.css";

function getAvatarColor(name) {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

const formatSalary = (salary) => {
  if (!salary) return 'Salary not specified';
  if (typeof salary === 'string') return salary;
  if (salary.min && salary.max) {
    return `₹${Number(salary.min).toLocaleString()} - ₹${Number(salary.max).toLocaleString()}`;
  }
  if (salary.min) return `From ₹${Number(salary.min).toLocaleString()}`;
  if (typeof salary === "number" && salary > 0) {
    const lpa = Math.max(1, Math.round(salary / 100000));
    return `₹${Math.max(1, Math.round(lpa * 0.85))} - ₹${Math.max(1, Math.round(lpa * 1.15))} LPA`;
  }
  return "Negotiable";
};

const JobCard = ({
  job,
  matchScore = null,
  isApplied = false,
  isCandidate = false,
  onViewDetails,
  onApply,
  onSaveToggle,
  isSaved = false,
}) => {
  const navigate = useNavigate();
  const { toggleSaveJob } = useSavedJobs();
  const [animateBookmark, setAnimateBookmark] = useState(false);

  const handleSave = (event) => {
    event.stopPropagation();
    setAnimateBookmark(true);
    setTimeout(() => setAnimateBookmark(false), 400);
    if (onSaveToggle) onSaveToggle(job);
    else toggleSaveJob(job);
  };

  const handleApply = (event) => {
    event.stopPropagation();
    if (isApplied) return;
    if (onApply) onApply(job);
    else navigate(`/jobs/${job._id}/apply`);
  };

  const handleView = (event) => {
    event.stopPropagation();
    if (onViewDetails) onViewDetails(job);
    else navigate(`/jobs/${job._id}`);
  };

  const isNew = job.createdAt 
    ? (Date.now() - new Date(job.createdAt).getTime()) < 24 * 60 * 60 * 1000 
    : false;

  const postedLabel = job.createdAt
    ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
    : "Recently";

  const companyInitials = (job.company || "J").charAt(0).toUpperCase();
  const avatarBgColor = getAvatarColor(job.company || "Company");
  
  const score = Number(matchScore || job.matchScore || 0);

  const skills = job.skills || [];
  const visibleSkills = skills.slice(0, 3);
  const extraSkillsCount = skills.length - visibleSkills.length;

  return (
    <motion.div
      onClick={handleView}
      className="job-card glass-card"
      whileHover={{ y: -4, borderColor: "rgba(99, 102, 241, 0.4)", boxShadow: "var(--shadow-lg)" }}
      whileTap={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Card Header */}
      <div className="card-header flex items-start justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          {/* Company Logo / Initials Avatar */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${avatarBgColor} 0%, ${avatarBgColor}88 100%)` }}
          >
            {companyInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200">{job.company}</span>
              <span className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                <MapPin size={10} className="text-[#6366f1]" />
                {job.location || "Remote"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar size={10} />
                {postedLabel}
              </span>
              {isNew && (
                <span className="new-badge">
                  <span className="pulse-dot" />
                  NEW
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bookmark Button */}
        <motion.button
          onClick={handleSave}
          className={`bookmark-btn ${isSaved ? "saved" : ""} ${animateBookmark ? "animate-pop" : ""} p-2 rounded-full hover:bg-white/5`}
          title="Save Job"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          {animateBookmark && (
            <div className="particle-container">
              <div className="burst-particle"></div>
              <div className="burst-particle"></div>
              <div className="burst-particle"></div>
              <div className="burst-particle"></div>
            </div>
          )}
        </motion.button>
      </div>

      {/* Card Body */}
      <div className="card-body mt-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-white line-clamp-1">{job.title}</h3>
          {isCandidate && matchScore !== null && (
            <div className="shrink-0">
              {score >= 80 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                  {score}% match ✓
                </span>
              ) : score >= 50 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30">
                  {score}% match
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-3 py-1 text-xs font-medium text-slate-400 border border-slate-500/20">
                  View job
                </span>
              )}
            </div>
          )}
        </div>

        <p className="mt-2 text-sm font-semibold text-[#8b5cf6] flex items-center gap-1">
          <span className="text-[#6366f1] font-bold">₹</span> {formatSalary(job.salary)}
        </p>

        {/* Tags Row */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Base type tags */}
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-medium text-slate-300">
            {job.location === "Remote" || job.type === "remote" ? "Remote" : "On-site"}
          </span>
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-medium text-slate-300 capitalize">
            {job.type || "Full Time"}
          </span>
          {/* Skills tags */}
          {visibleSkills.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
          {extraSkillsCount > 0 && (
            <span className="skill-overflow">
              +{extraSkillsCount} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer mt-4 pt-4 flex items-center justify-between border-t border-white/10">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
          <Users size={12} className="text-[#06b6d4]" />
          {job.applicantsCount || 0} applied
        </span>
        
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleView}
            className="text-xs font-semibold text-[#06b6d4] hover:underline"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            View details
          </motion.button>
          {isCandidate && (
            <motion.button
              disabled={isApplied}
              onClick={handleApply}
              className={`btn-primary text-xs !py-1.5 !px-4 ${isApplied ? "!bg-emerald-500/10 !text-emerald-400 border border-emerald-500/20 cursor-not-allowed shadow-none" : ""}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {isApplied ? "Applied" : "Apply Now"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;
