import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, MapPin, Calendar, Users, Briefcase } from "lucide-react";
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
  searchQuery = ""
}) => {
  const navigate = useNavigate();
  const { toggleSaveJob } = useSavedJobs();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

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

  return (
    <motion.div
      onClick={handleView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: isMobile ? '12px' : '20px',
        width: '100%',
        padding: '18px 24px',
        background: isHovered ? 'rgba(22,33,62,0.95)' : 'rgba(22,33,62,0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: isHovered ? '3px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        marginBottom: '10px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxSizing: 'border-box',
        transform: isHovered ? 'translateX(3px)' : 'none',
      }}
    >
      {/* SECTION 1 — LEFT */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '56px',
          flexShrink: 0 
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${avatarBgColor} 0%, ${avatarBgColor}88 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {companyInitials}
        </div>
        <span 
          style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.45)',
            textAlign: 'center',
            marginTop: '6px',
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {companyNameShort}
        </span>
      </div>

      {/* SECTION 2 — CENTER */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Title */}
        <h3 
          style={{
            fontSize: '16px',
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

        {/* Location + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#94a3b8' }}>
            <MapPin size={12} className="text-[#6366f1]" />
            {job.location || "Remote"}
          </span>
          <span 
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '11px',
              color: '#cbd5e1'
            }}
          >
            {job.location === "Remote" || job.type === "remote" ? "Remote" : "Onsite"}
          </span>
          {isCandidate && score > 0 && (
            <span 
              style={{
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                fontSize: '11px',
                color: '#a5b4fc',
                fontWeight: 600
              }}
            >
              {score}% match
            </span>
          )}
        </div>

        {/* Posted time + applicants */}
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{postedLabel}</span>
          {!isMobile && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users size={11} className="text-[#06b6d4]" />
                {job.applicantsCount || 0} applied
              </span>
            </>
          )}
        </div>
      </div>

      {/* SECTION 3 — RIGHT */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '8px' : '12px', 
          flexShrink: 0 
        }}
      >
        {/* Employment Type */}
        <span 
          style={{
            background: 'rgba(99,102,241,0.15)',
            color: '#a5b4fc',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap'
          }}
        >
          {job.type || "Full Time"}
        </span>

        {/* Salary */}
        {!isMobile && (
          <span 
            style={{ 
              fontSize: '13px', 
              color: '#34d399', 
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
          >
            {salaryText}
          </span>
        )}

        {/* Apply Button */}
        <button
          disabled={isApplied}
          onClick={handleApply}
          style={{
            padding: isMobile ? '6px 14px' : '8px 20px',
            background: isApplied 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'linear-gradient(135deg, #6366f1, #06b6d4)',
            border: isApplied ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
            borderRadius: '20px',
            color: isApplied ? '#34d399' : 'white',
            fontSize: '13px',
            fontWeight: 500,
            cursor: isApplied ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s'
          }}
        >
          {isApplied ? "Applied" : "Apply"}
        </button>

        {/* Bookmark Button */}
        <motion.button
          onClick={handleSave}
          animate={isSaved ? { rotateY: 360 } : { rotateY: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '8px',
            color: isSaved ? '#8b5cf6' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default JobCard;
