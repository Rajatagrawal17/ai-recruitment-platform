import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, MapPin, Calendar, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSavedJobs } from "../context/SavedJobsContext";
import { TiltCard } from "./TiltCard";
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
  isSelected = false,
  scores = {},
  userProfile = null
}) => {
  const navigate = useNavigate();
  const { toggleSaveJob } = useSavedJobs();
  const [isHovered, setIsHovered] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [justApplied, setJustApplied] = useState(isApplied);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  
  const [isSkipped, setIsSkipped] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  
  const dragX = useMotionValue(0);
  const saveOpacity = useTransform(dragX, [0, 80], [0, 1]);
  const skipOpacity = useTransform(dragX, [-80, 0], [1, 0]);

  const touchTimer = useRef(null);
  const isMoving = useRef(false);

  const handleTouchStart = () => {
    isMoving.current = false;
    touchTimer.current = setTimeout(() => {
      if (!isMoving.current) {
        setShowContextMenu(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
    }
  };

  const handleTouchMove = () => {
    isMoving.current = true;
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
    }
  };

  const handleDragEnd = (event, info) => {
    const offsetX = info.offset.x;
    if (offsetX > 80) {
      if (onSaveToggle) onSaveToggle(job);
      else toggleSaveJob(job);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([10, 30, 10]);
      }
    } else if (offsetX < -80) {
      setIsSkipped(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(15);
      }
    }
  };

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

  const scoreData = scores[job._id];
  const salaryText = getEstimatedSalary(job.title, job.salary);

  if (isSkipped) return null;

  if (isMobile) {
    return (
      <TiltCard
        layoutId={`card-${job._id}`}
        onClick={handleView}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
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
          gap: '10px',
          x: dragX,
          position: 'relative',
          overflow: 'hidden'
        }}
        className="job-card"
      >
        {/* Swipe Overlays */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(16, 185, 129, 0.9)",
            zIndex: 10,
            opacity: saveOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "14px",
            pointerEvents: "none"
          }}
        >
          <span className="text-white font-bold text-sm uppercase tracking-wider">Save job</span>
        </motion.div>
        
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(239, 68, 68, 0.9)",
            zIndex: 10,
            opacity: skipOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "14px",
            pointerEvents: "none"
          }}
        >
          <span className="text-white font-bold text-sm uppercase tracking-wider">Skip</span>
        </motion.div>

        {/* Long Press Context Menu Overlay */}
        {showContextMenu && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setShowContextMenu(false);
            }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10, 10, 20, 0.95)",
              backdropFilter: "blur(12px)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              zIndex: 50,
              padding: "0 10px"
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave(e);
                setShowContextMenu(false);
              }}
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#a5b4fc",
                background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "6px 12px",
                cursor: "pointer"
              }}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({
                    title: job.title,
                    text: `Check out this job: ${job.title} at ${job.company}`,
                    url: `${window.location.origin}/jobs/${job._id}`
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`${window.location.origin}/jobs/${job._id}`);
                  alert("Link copied!");
                }
                setShowContextMenu(false);
              }}
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#06b6d4",
                background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "6px 12px",
                cursor: "pointer"
              }}
            >
              Share
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSkipped(true);
                setShowContextMenu(false);
              }}
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#fca5a5",
                background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "6px 12px",
                cursor: "pointer"
              }}
            >
              Hide
            </button>
          </div>
        )}

        {/* Left: 36px company avatar */}
        <div style={{ display: 'flex', flexShrink: 0 }}>
          <motion.div
            layoutId={`avatar-${job._id}`}
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
          </motion.div>
        </div>

        {/* Center: job title (14px) + company + location (12px muted) + type badge */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <motion.h3 
            layoutId={`title-${job._id}`}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {highlightText(job.title, searchQuery)}
          </motion.h3>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {job.company} • {job.location || "Remote"}
          </span>
          <div style={{ display: 'flex' }}>
            <span 
              style={{
                background: 'rgba(99,102,241,0.12)',
                color: '#a5b4fc',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '10px',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap'
              }}
            >
              {job.type || "Full Time"}
            </span>
          </div>
        </div>

        {/* Right: Apply button + salary */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <span 
            style={{ 
              fontSize: '12px', 
              background: 'rgba(52,211,153,0.15)',
              border: '0.5px solid rgba(52,211,153,0.25)',
              color: '#34d399', 
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '20px',
              whiteSpace: 'nowrap'
            }}
          >
            {salaryText}
          </span>
          <motion.button
            disabled={justApplied || isApplying}
            onClick={handleApply}
            animate={(isApplying || justApplied) ? { scale: [0.95, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              height: '32px',
              padding: '0 12px',
              background: justApplied 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'linear-gradient(135deg, #6366f1, #06b6d4)',
              border: justApplied ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
              borderRadius: '20px',
              color: justApplied ? '#34d399' : 'white',
              fontSize: '12px',
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
              <WaveLoader size="sm" />
            ) : justApplied ? (
              "Applied ✓"
            ) : (
              "Apply"
            )}
          </motion.button>
        </div>
      </TiltCard>
    );
  }

  return (
    <TiltCard
      layoutId={`card-${job._id}`}
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
        <motion.div
          layoutId={`avatar-${job._id}`}
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
        </motion.div>
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
        <motion.h3 
          layoutId={`title-${job._id}`}
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
        </motion.h3>

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

        {/* Match % badge */}
        {isCandidate && (
          <>
            {scoreData ? (
              <div
                title={
                  scoreData.breakdown
                    ? `${scoreData.reason}\n\nBreakdown:\n• Keywords: ${scoreData.breakdown.keywords}%\n• Experience: ${scoreData.breakdown.experience}%\n• Education: ${scoreData.breakdown.education}%\n• Location: ${scoreData.breakdown.location}%`
                    : scoreData.reason
                }
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                  cursor: 'help',
                  background: scoreData.score >= 80
                    ? 'rgba(16,185,129,0.15)'
                    : scoreData.score >= 60
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(255,255,255,0.06)',
                  color: scoreData.score >= 80
                    ? '#6ee7b7'
                    : scoreData.score >= 60
                    ? '#fcd34d'
                    : 'rgba(255,255,255,0.4)',
                  border: `0.5px solid ${
                    scoreData.score >= 80
                      ? 'rgba(16,185,129,0.3)'
                      : scoreData.score >= 60
                      ? 'rgba(245,158,11,0.3)'
                      : 'rgba(255,255,255,0.1)'
                  }`,
                  fontWeight: 600
                }}
              >
                {scoreData.score}% match
              </div>
            ) : userProfile?.skills?.length ? (
              <div 
                className="animate-pulse"
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                Scoring...
              </div>
            ) : null}
          </>
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
            <WaveLoader size="sm" />
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
    </TiltCard>
  );
};

export default JobCard;
