import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BriefcaseBusiness,
  CircleAlert,
  Compass,
  FileText,
  Sparkles,
  TrendingUp,
  ChevronRight,
  UserRoundPen,
  Undo2,
  CalendarX,
  XCircle
} from "lucide-react";
import MatchScoreBadge from "../components/MatchScoreBadge";
import PersonalizedJobs from "../components/PersonalizedJobs";
import UserProfileCard from "../components/UserProfileCard";
import { getCandidateApplications, getRecommendedJobs } from "../services/api";
import AnimatedBackground from "../components/AnimatedBackground";
import { useIsMobile } from "../components/MobileOptimizedAnimations";
import WithdrawModal from "../components/WithdrawModal";
import DeclineInterviewModal from "../components/DeclineInterviewModal";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const StatCard = ({ title, value, icon: Icon, hint, accent, reduceMotion, isMobile }) => (
  <motion.article
    variants={item}
    whileHover={reduceMotion || isMobile ? undefined : { y: -4, scale: 1.01 }}
    className="glass-card flex flex-col justify-between"
    style={{
      padding: isMobile ? '14px' : '20px',
      borderRadius: isMobile ? '12px' : '16px',
      height: '100%',
      minHeight: isMobile ? '100px' : 'auto',
      boxSizing: 'border-box'
    }}
  >
    <div>
      <div className="flex items-center justify-between gap-2">
        <p 
          style={{ 
            fontSize: isMobile ? '12px' : '14px', 
            color: isMobile ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)',
            margin: 0
          }}
          className="truncate"
        >
          {title}
        </p>
        <span className={`rounded-lg p-1.5 shrink-0 ${accent}`}>
          <Icon size={isMobile ? 15 : 18} />
        </span>
      </div>
      <h3 
        style={{ 
          fontSize: isMobile ? '20px' : '28px', 
          fontWeight: 500,
          margin: isMobile ? '6px 0 2px 0' : '12px 0 4px 0'
        }}
        className="text-text leading-tight truncate"
      >
        {value}
      </h3>
    </div>
    {!isMobile && hint && <p className="text-xs text-text-muted mt-1 leading-normal">{hint}</p>}
  </motion.article>
);

const ScoreBar = ({ score, reduceMotion }) => (
  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-soft">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.max(4, score)}%` }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
      className={`h-full rounded-full ${
        score >= 80
          ? "bg-emerald-500"
          : score >= 50
          ? "bg-amber-500"
          : "bg-rose-500"
      }`}
    />
  </div>
);

function useWithdrawTimer(createdAt) {
  const [timeLeft, setTimeLeft] = useState("");
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [hoursLeft, setHoursLeft] = useState(24);

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - new Date(createdAt).getTime();
      const left = 24 - elapsed / (1000 * 60 * 60);
      setCanWithdraw(left > 0);
      setHoursLeft(left);

      if (left > 0) {
        const h = Math.floor(left);
        const m = Math.floor((left - h) * 60);
        setTimeLeft(`${h}h ${m}m left`);
      } else {
        setTimeLeft("Window closed");
      }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return { timeLeft, canWithdraw, hoursLeft };
}

const getTimerBadgeStyle = (hoursLeft) => {
  if (hoursLeft > 12) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (hoursLeft >= 6) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  } else {
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "withdrawn":
      return (
        <span className="rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-semibold border border-slate-500/20 text-slate-400 uppercase">
          Withdrawn
        </span>
      );
    case "interview_scheduled":
      return (
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold border border-emerald-500/20 text-emerald-400 uppercase animate-pulse">
          Interview Scheduled
        </span>
      );
    case "interview_declined":
      return (
        <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold border border-rose-500/20 text-rose-400 uppercase">
          Declined
        </span>
      );
    case "hired":
      return (
        <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold border border-indigo-500/20 text-indigo-400 uppercase">
          Hired
        </span>
      );
    case "offer":
      return (
        <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold border border-cyan-500/20 text-cyan-400 uppercase">
          Offer Received
        </span>
      );
    case "rejected":
      return (
        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold border border-red-500/20 text-red-400 uppercase">
          Rejected
        </span>
      );
    case "shortlisted":
      return (
        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold border border-amber-500/20 text-amber-400 uppercase">
          Shortlisted
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold border border-primary/20 text-primary uppercase">
          {status || "pending"}
        </span>
      );
  }
};

const ApplicationCard = ({
  app,
  expandedApp,
  setExpandedApp,
  onWithdrawClick,
  onDeclineClick,
  reduceMotion,
  isMobile
}) => {
  const { timeLeft, canWithdraw, hoursLeft } = useWithdrawTimer(app.createdAt);
  const isWithdrawn = app.status === "withdrawn";
  const companyName = app.job?.company || app.company || "Company";
  const companyInitials = companyName.charAt(0).toUpperCase();

  return (
    <motion.div
      variants={item}
      style={{ 
        opacity: isWithdrawn ? 0.5 : 1,
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxSizing: 'border-box',
        marginBottom: '10px'
      }}
      className="glass-card"
    >
      <div
        onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
        className="cursor-pointer"
        style={{ width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%' }}>
          {/* Company Avatar: 40px */}
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '16px',
              flexShrink: 0
            }}
          >
            {companyInitials}
          </div>

          {/* Title & Company */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: 'white' }} className="truncate">
              {app.job?.title || app.jobTitle || "Role"}
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '2px 0 4px 0' }} className="truncate">
              {companyName}
            </p>
            {/* Status Badge below company */}
            <div style={{ display: 'inline-flex', marginTop: '2px' }}>
              {getStatusBadge(app.status)}
            </div>
          </div>

          <motion.div
            animate={{ rotate: expandedApp === app._id ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ flexShrink: 0, marginTop: '4px' }}
          >
            <ChevronRight size={18} className="text-text-muted" />
          </motion.div>
        </div>

        {/* Match Score & ScoreBar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>AI Fit Score:</span>
          <MatchScoreBadge score={app.matchScore || 0} />
        </div>
        <ScoreBar score={app.matchScore || 0} reduceMotion={reduceMotion} />
      </div>

      <AnimatePresence>
        {expandedApp === app._id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
            className="mt-3 space-y-3 border-t border-white/5 pt-3"
          >
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Applied: {new Date(app.createdAt).toLocaleDateString()}
            </div>

            {app.interview?.scheduledAt && (
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, color: '#34d399' }}>
                  📅 {new Date(app.interview.scheduledAt).toLocaleString()}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0', textTransform: 'capitalize' }}>
                  {app.interview.mode || "video"} interview
                </p>
              </div>
            )}

            {app.matchExplanation?.summary && (
              <div>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px 0' }}>
                  Match Explanation
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                  {app.matchExplanation.summary}
                </p>
              </div>
            )}

            {app.resumeFeedback?.suggestions && app.resumeFeedback.suggestions.length > 0 && (
              <div style={{ borderLeft: '2px solid #8b5cf6', paddingLeft: '8px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#a5b4fc', margin: '0 0 2px 0' }}>
                  💡 AI Tip
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  {app.resumeFeedback.suggestions[0]}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions Section */}
      <div 
        className="border-t border-white/5 pt-3"
        style={{ 
          display: 'flex', 
          flexDirection: 'row',
          gap: '8px', 
          marginTop: '12px',
          width: '100%'
        }}
      >
        {/* Withdraw Button */}
        {!["withdrawn", "hired", "offer", "rejected"].includes(app.status) && (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '8px', width: '100%' }}>
            {canWithdraw ? (
              <button
                onClick={() => onWithdrawClick(app)}
                className="hover:opacity-90 transition"
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '0.5px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Undo2 size={14} />
                Withdraw ({timeLeft})
              </button>
            ) : (
              <button
                onClick={() => onWithdrawClick(app)}
                className="hover:opacity-90 transition"
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Contact to withdraw
              </button>
            )}
          </div>
        )}

        {/* Decline Interview Button */}
        {app.status === "interview_scheduled" && (
          <button
            onClick={() => onDeclineClick(app)}
            className="hover:opacity-90 transition"
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '0.5px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <CalendarX size={14} />
            Decline
          </button>
        )}

        {/* View details toggle as alternative action button on mobile */}
        <button
          onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
          className="hover:bg-white/10 transition"
          style={{
            flex: 1,
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          {expandedApp === app._id ? "Close Details" : "View Details"}
        </button>

        {/* Withdrawn State Messages */}
        {isWithdrawn && (
          <div style={{ width: '100%', fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.6)' }}>
              Withdrawn on {new Date(app.withdrawnAt || app.updatedAt).toLocaleDateString()}
            </span>
            <span>Pipeline closed</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ApplicationRow = ({
  app,
  onWithdrawClick,
  onDeclineClick,
  reduceMotion,
}) => {
  const { timeLeft, canWithdraw, hoursLeft } = useWithdrawTimer(app.createdAt);
  const isWithdrawn = app.status === "withdrawn";

  return (
    <motion.tr
      variants={item}
      style={{ opacity: isWithdrawn ? 0.5 : 1 }}
      className="border-t border-border hover:bg-surface-soft/60"
    >
      <td className="px-5 py-4">
        <p className="font-medium">{app.job?.title || app.jobTitle || "Role"}</p>
        <p className="text-xs text-text-muted">{app.job?.company || app.company || "Company"}</p>
      </td>
      <td className="px-5 py-4 text-text-muted">
        {new Date(app.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-4">
        {getStatusBadge(app.status)}
      </td>
      <td className="px-5 py-4">
        <MatchScoreBadge score={app.matchScore || 0} />
      </td>
      <td className="px-5 py-4">
        <div className="w-28">
          <ScoreBar score={app.matchScore || 0} reduceMotion={reduceMotion} />
        </div>
      </td>
      <td className="px-5 py-4">
        {app.interview?.scheduledAt ? (
          <div className="max-w-[180px] text-xs text-text-muted">
            <p className="font-medium text-text">
              {new Date(app.interview.scheduledAt).toLocaleString()}
            </p>
            <p className="capitalize">{app.interview.mode || "video"}</p>
          </div>
        ) : (
          <span className="text-xs text-text-muted">Not scheduled</span>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="max-w-xs space-y-1 text-xs text-text-muted">
          <p className="font-medium text-text">
            {app.matchExplanation?.summary || "Explanation pending."}
          </p>
          {(app.matchExplanation?.matchedSkills || []).length > 0 && (
            <p>
              Matched: {app.matchExplanation.matchedSkills.slice(0, 3).join(", ")}
            </p>
          )}
          {(app.matchExplanation?.missingSkills || []).length > 0 && (
            <p>
              Missing: {app.matchExplanation.missingSkills.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="max-w-xs text-xs text-text-muted">
          {app.resumeFeedback?.summary || "Feedback pending from AI analysis."}
        </p>
        {(app.resumeFeedback?.suggestions || []).length > 0 && (
          <p className="mt-1 max-w-xs text-xs text-text-muted">
            Tip: {app.resumeFeedback.suggestions[0]}
          </p>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-2 min-w-[150px]">
          {/* Withdraw Buttons */}
          {!["withdrawn", "hired", "offer", "rejected"].includes(app.status) && (
            <div className="flex flex-col gap-1 items-start">
              {canWithdraw ? (
                <>
                  <button
                    onClick={() => onWithdrawClick(app)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "0.5px solid rgba(239, 68, 68, 0.3)",
                      color: "#fca5a5",
                    }}
                  >
                    <Undo2 className="ti-arrow-back-up inline-block" size={13} />
                    Withdraw
                  </button>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border mt-1 ${getTimerBadgeStyle(
                      hoursLeft
                    )}`}
                  >
                    {timeLeft}
                  </span>
                </>
              ) : (
                <button
                  onClick={() => onWithdrawClick(app)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium transition"
                  style={{
                    backgroundColor: "transparent",
                    border: "0.5px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.4)",
                  }}
                >
                  Contact to withdraw
                </button>
              )}
            </div>
          )}

          {/* Decline Interview Button */}
          {app.status === "interview_scheduled" && (
            <button
              onClick={() => onDeclineClick(app)}
              className="flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition w-full"
            >
              <CalendarX size={13} />
              Decline interview
            </button>
          )}

          {/* Withdrawn State Messages */}
          {isWithdrawn && (
            <div className="text-xs text-text-muted space-y-0.5">
              <p className="font-semibold text-slate-400 leading-tight">
                Withdrawn by you on{" "}
                {new Date(app.withdrawnAt || app.updatedAt).toLocaleDateString()}
              </p>
              <p className="text-[11px] leading-tight">This role is no longer in your pipeline</p>
            </div>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

const DailyDigestBanner = ({ isMobile, user }) => {
  const greeting = `Hello, ${user?.name?.split(" ")[0] || "Candidate"}!`;
  return (
    <section 
      style={{
        margin: isMobile ? '0 12px 16px' : '0 0 24px 0',
        padding: isMobile ? '14px 16px' : '20px 24px',
        borderRadius: isMobile ? '14px' : '16px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxSizing: 'border-box'
      }}
      className="glass-card"
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>
            {greeting} 🌤️
          </h2>
          <span 
            style={{ 
              fontSize: '11px', 
              background: 'rgba(245,158,11,0.2)', 
              color: '#fbbf24', 
              border: '0.5px solid rgba(245,158,11,0.3)',
              padding: '2px 8px', 
              borderRadius: '12px',
              fontWeight: 600
            }}
          >
            🔥 High Activity
          </span>
        </div>
        <p style={{ fontSize: isMobile ? '13px' : '14px', color: 'rgba(255,255,255,0.7)', margin: '8px 0 12px 0', lineHeight: 1.5 }}>
          Your profile is in high demand! There are new matched roles matching your skills in React and Node.js.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Top pick:</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
            Senior React Developer at Google AI (95% Match)
          </span>
        </div>
      </div>
      
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <Link 
          to="/jobs" 
          className="btn-primary" 
          style={{ 
            width: isMobile ? '100%' : 'auto', 
            padding: '10px 20px', 
            fontSize: '13px',
            textAlign: 'center',
            justifyContent: 'center',
            height: '44px',
            boxSizing: 'border-box'
          }}
        >
          View Recommendations
        </Link>
      </div>
    </section>
  );
};

const CandidateDashboard = () => {
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedApp, setExpandedApp] = useState(null);
  const [withdrawApp, setWithdrawApp] = useState(null);
  const [declineApp, setDeclineApp] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWithdrawn = (appId, updatedFields) => {
    const originalApps = [...applications];
    setApplications(prev =>
      prev.map(app => (app._id === appId ? { ...app, ...updatedFields } : app))
    );
    return () => setApplications(originalApps);
  };

  const handleDeclined = (appId, updatedFields) => {
    const originalApps = [...applications];
    setApplications(prev =>
      prev.map(app => (app._id === appId ? { ...app, ...updatedFields } : app))
    );
    return () => setApplications(originalApps);
  };

  const loadData = useCallback(async () => {
    try {
      const [appsRes, recommendationRes] = await Promise.all([
        getCandidateApplications(),
        getRecommendedJobs().catch(() => ({ data: { recommendations: [] } })),
      ]);

      setApplications(appsRes.data.applications || []);
      setRecommendations(recommendationRes.data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your candidate dashboard. Please try again.");
    } finally {
      setLoading(false);
      setRecommendationLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0].clientY;
    } else {
      startYRef.current = -1;
    }
  };

  const handleTouchMove = (e) => {
    if (startYRef.current === -1 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - startYRef.current;
    if (distance > 0) {
      setPullDistance(Math.min(80, distance));
    }
  };

  const handleTouchEnd = async () => {
    if (startYRef.current === -1 || isRefreshing) return;
    if (pullDistance > 60) {
      setIsRefreshing(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
      await loadData();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const avgMatch = total
      ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / total)
      : 0;
    const pending = applications.filter((app) => app.status === "pending").length;
    const shortlisted = applications.filter((app) => app.status === "shortlisted").length;

    return { total, avgMatch, pending, shortlisted };
  }, [applications]);

  return (
    <motion.main
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.22 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        padding: isMobile ? '0 0 100px 0' : '0 0 80px 0',
        boxSizing: 'border-box'
      }}
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6 relative"
    >
      {/* Pull-to-refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          style={{
            position: "fixed",
            top: pullDistance > 0 ? `${pullDistance}px` : "70px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "rgba(15, 15, 26, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            transition: isRefreshing ? "none" : "top 0.1s ease"
          }}
        >
          <div 
            className={`h-5 w-5 rounded-full border-2 border-white/10 border-t-[#6366f1] ${isRefreshing ? "animate-spin" : ""}`}
            style={{
              transform: isRefreshing ? "none" : `rotate(${pullDistance * 4}deg)`
            }}
          />
        </div>
      )}
      <AnimatedBackground />
      
      {/* User Profile Welcome Card */}
      <UserProfileCard />

      {/* Daily Digest Banner */}
      <DailyDigestBanner isMobile={isMobile} user={user} />
      
      <section className="glass-card overflow-hidden p-6" style={{ padding: isMobile ? '16px' : '24px', borderRadius: isMobile ? '14px' : '16px' }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={14} /> Candidate Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold gradient-text" style={{ fontSize: isMobile ? '22px' : '30px' }}>Candidate Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              Track your applications, review AI feedback, and discover high-match opportunities tailored to your profile.
            </p>
          </div>
          <div 
            className="quick-actions"
            style={{
              display: isMobile ? 'grid' : 'flex',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'none',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '10px' : '12px',
              width: '100%',
              padding: isMobile ? '0' : '0',
              boxSizing: 'border-box'
            }}
          >
            <Link 
              to="/cover-letter" 
              className="btn-secondary text-center"
              style={{
                height: isMobile ? '56px' : 'auto',
                fontSize: isMobile ? '13px' : 'inherit',
                borderRadius: isMobile ? '14px' : '9999px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '8px',
                width: '100%',
                padding: '10px 16px',
                boxSizing: 'border-box'
              }}
            >
              <Sparkles size={isMobile ? 14 : 16} style={{ color: '#00D4FF' }} />
              <span>AI Cover Letter</span>
            </Link>
            <Link 
              to="/jobs" 
              className="btn-primary text-center"
              style={{
                height: isMobile ? '56px' : 'auto',
                fontSize: isMobile ? '13px' : 'inherit',
                borderRadius: isMobile ? '14px' : '9999px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '8px',
                width: '100%',
                padding: '10px 16px',
                boxSizing: 'border-box'
              }}
            >
              <BriefcaseBusiness size={isMobile ? 14 : 16} />
              <span>Browse Jobs</span>
            </Link>
          </div>
        </div>
      </section>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 10 : 16,
          padding: isMobile ? '0 12px' : '0',
          width: '100%',
          boxSizing: 'border-box'
        }}
        className="stats-grid"
      >
        <StatCard
          title="Total Applications"
          value={stats.total}
          hint="Every role you have applied for"
          icon={FileText}
          accent="bg-primary-soft text-primary"
          reduceMotion={reduceMotion}
          isMobile={isMobile}
        />
        <StatCard
          title="Average Match"
          value={`${stats.avgMatch}%`}
          hint="AI fit score across all applications"
          icon={TrendingUp}
          accent="bg-emerald-500/15 text-emerald-500"
          reduceMotion={reduceMotion}
          isMobile={isMobile}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          hint="Waiting for recruiter action"
          icon={CircleAlert}
          accent="bg-amber-500/15 text-amber-500"
          reduceMotion={reduceMotion}
          isMobile={isMobile}
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          hint="Great progress toward interview"
          icon={Compass}
          accent="bg-cyan-500/15 text-cyan-500"
          reduceMotion={reduceMotion}
          isMobile={isMobile}
        />
      </motion.section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <section className="glass-card p-5 flex flex-col justify-between" style={{ padding: isMobile ? '16px' : '20px', borderRadius: isMobile ? '14px' : '16px' }}>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ fontSize: isMobile ? '16px' : '18px' }}>
              <UserRoundPen size={18} className="text-primary" /> Profile Setup
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Manage your profile details and upload resume from one place.
            </p>
          </div>
          <div className="mt-4" style={{ width: '100%' }}>
            <Link 
              to="/complete-profile" 
              className="btn-primary inline-flex text-center justify-center items-center"
              style={{
                height: '44px',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box'
              }}
            >
              <UserRoundPen size={16} className="mr-2" />
              Open Profile Completion
            </Link>
          </div>
        </section>

        {/* AI Interview simulator card */}
        <section className="glass-card p-5 flex flex-col justify-between" style={{ padding: isMobile ? '16px' : '20px', borderRadius: isMobile ? '14px' : '16px' }}>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ fontSize: isMobile ? '16px' : '18px' }}>
              <Sparkles size={18} className="text-purple-500" /> AI Interview Simulator
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Practice real-time technical and behavioral interview questions tailored to your target jobs and get instant AI feedback.
            </p>
          </div>
          <div className="mt-4" style={{ width: '100%' }}>
            <Link 
              to="/interview-prep" 
              className="btn-primary inline-flex text-center justify-center items-center"
              style={{
                height: '44px',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box'
              }}
            >
              <Sparkles size={16} className="mr-2" />
              Start Mock Interview
            </Link>
          </div>
        </section>
      </div>

      {/* Personalized Jobs Section */}
      <PersonalizedJobs />

      <section className="glass-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Smart Job Recommendations</h2>
          <span className="text-xs text-text-muted">Top matches by your skills</span>
        </div>

        {recommendationLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="skeleton h-36" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Compass size={20} />
            </div>
            <h3 className="mt-4 text-base font-semibold">No recommendations yet</h3>
            <p className="mt-2 text-sm text-text-muted">
              Apply with a rich resume and we will personalize job recommendations based on extracted skills.
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-3 md:grid-cols-2"
          >
            {recommendations.slice(0, 4).map((job) => (
              <motion.article
                key={job._id}
                variants={item}
                layout
                whileHover={isMobile ? undefined : { y: -4 }}
                className="rounded-2xl border border-border bg-surface-soft p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm md:text-base truncate">{job.title}</h3>
                    <p className="text-sm text-text-muted truncate">{job.company}</p>
                  </div>
                  <MatchScoreBadge score={job.matchScore || 0} />
                </div>
                <p className="mt-2 text-xs text-text-muted line-clamp-2">
                  Matched: {(job.matchedSkills || []).slice(0, 4).join(", ") || "No direct match yet"}
                </p>
                {(job.missingSkills || []).length > 0 && (
                  <p className="mt-1 text-xs text-text-muted line-clamp-1">
                    Gaps: {job.missingSkills.slice(0, 3).join(", ")}
                  </p>
                )}
                <p className="mt-2 text-xs text-text-muted">
                  Readiness: <span className="font-semibold capitalize text-text">{job.readiness || "emerging"}</span>
                </p>
                <p className="mt-1 text-xs text-text-muted line-clamp-2">
                  {job.explanation?.summary || "AI explanation will appear here after profile analysis."}
                </p>
                <ScoreBar score={job.matchScore || 0} reduceMotion={reduceMotion} />
                <Link to={`/jobs/${job._id}`} className="btn-secondary mt-4 w-full text-sm">
                  View Role
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">Application Timeline</h2>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((row) => (
              <div key={row} className="skeleton h-16" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-surface-soft" />
            <h3 className="mt-4 text-lg font-semibold">No applications yet</h3>
            <p className="mt-2 text-sm text-text-muted">
              Start applying to roles and this area will show progress, scores, and actionable AI feedback.
            </p>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3 p-4"
          >
            <AnimatePresence>
              {applications.map((app) => (
                <ApplicationCard
                  key={app._id}
                  app={app}
                  expandedApp={expandedApp}
                  setExpandedApp={setExpandedApp}
                  onWithdrawClick={setWithdrawApp}
                  onDeclineClick={setDeclineApp}
                  reduceMotion={reduceMotion}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          // Desktop Table View
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-surface-soft text-left text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-5 py-3">Job</th>
                  <th className="px-5 py-3">Applied</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Match</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3">Interview</th>
                  <th className="px-5 py-3">AI Explanation</th>
                  <th className="px-5 py-3">AI Feedback</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show">
                <AnimatePresence>
                  {applications.map((app) => (
                    <ApplicationRow
                      key={app._id}
                      app={app}
                      onWithdrawClick={setWithdrawApp}
                      onDeclineClick={setDeclineApp}
                      reduceMotion={reduceMotion}
                    />
                  ))}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modals */}
      <WithdrawModal
        isOpen={!!withdrawApp}
        onClose={() => setWithdrawApp(null)}
        application={withdrawApp}
        onWithdrawn={handleWithdrawn}
      />
      <DeclineInterviewModal
        isOpen={!!declineApp}
        onClose={() => setDeclineApp(null)}
        application={declineApp}
        onDeclined={handleDeclined}
      />
    </motion.main>
  );
};

export default CandidateDashboard;
