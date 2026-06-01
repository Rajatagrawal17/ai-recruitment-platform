import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, MapPin, Calendar, Users, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSavedJobs } from "../context/SavedJobsContext";
import "./JobCard.css";

function getAvatarColor(name) {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

const getEstimatedSalary = (title = '', salary) => {
  if (salary) {
    if (typeof salary === 'string') return salary;
    if (salary.min && salary.max) {
      return `₹${Number(salary.min).toLocaleString()} - ₹${Number(salary.max).toLocaleString()}`;
    }
    if (salary.min) return `From ₹${Number(salary.min).toLocaleString()}`;
  }
  const t = title.toLowerCase();
  if (t.includes('react') || t.includes('frontend') || t.includes('vue')) return '₹8L-18L';
  if (t.includes('backend') || t.includes('node') || t.includes('java')) return '₹10L-22L';
  if (t.includes('senior') || t.includes('lead') || t.includes('principal')) return '₹18L-35L';
  if (t.includes('data') || t.includes('ml') || t.includes('ai') || t.includes('python')) return '₹15L-30L';
  if (t.includes('designer') || t.includes('ui') || t.includes('ux')) return '₹6L-14L';
  if (t.includes('devops') || t.includes('cloud') || t.includes('aws')) return '₹12L-25L';
  return '₹6L-15L';
};

const highlightText = (text, search) => {
  if (!search || !text) return text;
  const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
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
  searchQuery = "",
  isSelected = false
}) => {
  const navigate = useNavigate();
  const { toggleSaveJob } = useSavedJobs();
  const [isHovered, setIsHovered] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [justApplied, setJustApplied] = useState(isApplied);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    setJustApplied(isApplied);
  }, [isApplied]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSave = (event) => {
    event.stopPropagation();
    if (onSaveToggle) onSaveToggle(job);
    else toggleSaveJob(job);
  };

  const handleApply = async (event) => {
    event.stopPropagation();
    if (isApplied || isApplying || justApplied) return;
    setIsApplying(true);
    // Simulate loading for 1s
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsApplying(false);
    setJustApplied(true);
    if (onApply) onApply(job);
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
  
  const companyNameShort = job.company && job.company.length > 10
    ? job.company.slice(0, 9) + '…'
    : job.company || 'Company';

  const score = Number(matchScore || job.matchScore || 0);
  const salaryText = getEstimatedSalary(job.title, job.salary);

  if (isMobile) {
    return (
      <motion.div
        onClick={handleView}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          padding: '12px 14px',
          background: isSelected 
            ? 'rgba(99,102,241,0.08)' 
            : (isHovered ? 'rgba(22,33,62,0.95)' : 'rgba(22,33,62,0.8)'),
          backdropFilter: 'blur(12px)',
          border: isSelected 
            ? '1px solid rgba(99,102,241,0.4)' 
            : '1px solid rgba(255,255,255,0.06)',
          borderLeft: isHovered 
            ? '2.5px solid #6366f1' 
            : (isSelected ? '2.5px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.06)'),
          borderRadius: '14px',
          marginBottom: '8px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
          transform: isHovered ? 'translateX(3px)' : 'none',
        }}
      >
        {/* Left: 36px company avatar */}
        <div style={{ display: 'flex', flexShrink: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${avatarBgColor} 0%, ${avatarBgColor}88 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {companyInitials}
          </div>
        </div>

        {/* Center: job title (13px) + company + location (10px muted) */}
        <div style={{ flex: 1, minWidth: 0, marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <h3 
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'white',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {highlightText(job.title, searchQuery)}
          </h3>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {job.company} • {job.location || "Remote"}
          </span>
        </div>

        {/* Right: Apply button (small) + salary (10px green) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
          <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {salaryText}
          </span>
          <motion.button
            disabled={justApplied || isApplying}
            onClick={handleApply}
            animate={(isApplying || justApplied) ? { scale: [0.95, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: '4px 10px',
              background: justApplied 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'linear-gradient(135deg, #6366f1, #06b6d4)',
              border: justApplied ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
              borderRadius: '20px',
              color: justApplied ? '#34d399' : 'white',
              fontSize: '11px',
              fontWeight: 500,
              cursor: (justApplied || isApplying) ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            {isApplying ? (
              <Loader2 size={10} className="animate-spin text-white" />
            ) : justApplied ? (
              "Applied ✓"
            ) : (
              "Apply"
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={handleView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: '16px 20px',
        background: isSelected 
          ? 'rgba(99,102,241,0.08)' 
          : (isHovered ? 'rgba(22,33,62,0.95)' : 'rgba(22,33,62,0.8)'),
        backdropFilter: 'blur(12px)',
        border: isSelected 
          ? '1px solid rgba(99,102,241,0.4)' 
          : '1px solid rgba(255,255,255,0.06)',
        borderLeft: isHovered 
          ? '2.5px solid #6366f1' 
          : (isSelected ? '2.5px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.06)'),
        borderRadius: '14px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxSizing: 'border-box',
        transform: isHovered ? 'translateX(3px)' : 'none',
      }}
    >
      {/* 1. Company Avatar & Name */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '44px',
          flexShrink: 0 
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${avatarBgColor} 0%, ${avatarBgColor}88 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {companyInitials}
        </div>
        <span 
          style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.4)',
            textAlign: 'center',
            marginTop: '4px',
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {companyNameShort}
        </span>
      </div>

      {/* 2. Center Content */}
      <div style={{ flex: 1, minWidth: 0, marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {/* Row 1: Job Title + NEW badge */}
        <h3 
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'white',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {highlightText(job.title, searchQuery)}
          {isNew && (
            <span style={{ fontSize: '9px', background: 'rgba(99,102,241,0.2)', border: '1px solid #6366f1', color: '#a5b4fc', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
              NEW
            </span>
          )}
        </h3>

        {/* Row 2: pin icon + location + work-type badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <MapPin size={12} className="text-[#6366f1]" />
            {job.location || "Remote"}
          </span>
          <span 
            style={{
              padding: '1px 6px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '11px',
              color: '#cbd5e1'
            }}
          >
            {job.location === "Remote" || job.type === "remote" ? "Remote" : "Onsite"}
          </span>
        </div>

        {/* Row 3: clock icon + posted time + people icon + applied count */}
        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={11} />
            {postedLabel}
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Users size={11} className="text-[#06b6d4]" />
            {job.applicantsCount || 0} applied
          </span>
        </div>
      </div>

      {/* 3. Right Content */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          flexShrink: 0,
          marginLeft: '12px'
        }}
      >
        {/* Employment Type badge (purple pill) */}
        <span 
          style={{
            background: 'rgba(99,102,241,0.15)',
            color: '#a5b4fc',
            padding: '3px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap'
          }}
        >
          {job.type || "Full Time"}
        </span>

        {/* Salary pill (green tint) */}
        <span 
          style={{ 
            fontSize: '13px', 
            background: 'rgba(52,211,153,0.15)',
            border: '1px solid rgba(52,211,153,0.25)',
            color: '#34d399', 
            fontWeight: 500,
            padding: '3px 8px',
            borderRadius: '20px',
            whiteSpace: 'nowrap'
          }}
        >
          {salaryText}
        </span>

        {/* Match % badge (purple) */}
        {isCandidate && score > 0 && (
          <span 
            style={{
              padding: '3px 8px',
              borderRadius: '20px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              fontSize: '11px',
              color: '#a5b4fc',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {score}% match
          </span>
        )}

        {/* Apply Button */}
        <motion.button
          disabled={justApplied || isApplying}
          onClick={handleApply}
          animate={(isApplying || justApplied) ? { scale: [0.95, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: '8px 20px',
            background: justApplied 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'linear-gradient(135deg, #6366f1, #06b6d4)',
            border: justApplied ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
            borderRadius: '20px',
            color: justApplied ? '#34d399' : 'white',
            fontSize: '13px',
            fontWeight: 500,
            cursor: (justApplied || isApplying) ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.2s, border 0.2s'
          }}
        >
          {isApplying ? (
            <Loader2 size={12} className="animate-spin text-white" />
          ) : justApplied ? (
            "Applied ✓"
          ) : (
            "Apply"
          )}
        </motion.button>

        {/* Bookmark Button */}
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 1.3, rotate: 15 }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '8px',
            color: isSaved ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default JobCard;
