import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Kanban,
  Users,
  Briefcase,
  BarChart3,
  Calendar,
  Sparkles,
  Settings,
  Bell,
  Clock,
  FileText,
  X,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Search,
  LogOut,
  Play,
  CalendarDays,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { getAIBriefing } from "../services/api";
import { toast } from "react-hot-toast";

// ============================================================================
// COUNT-UP ANIMATION HOOK (Exactly as specified)
// ============================================================================
function useCountUp(target) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

// ============================================================================
// SPARKLINE COMPONENT (Smooth SVG Line + Area Gradient)
// ============================================================================
const Sparkline = ({ data, color = "#6366f1" }) => {
  const width = 80;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3; // 3px padding
    return { x, y };
  });

  const pathD = `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  // Unique ID to avoid SVG gradient conflicts
  const gradId = useMemo(() => `sparkline-grad-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-80">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ============================================================================
// RECHARTS CUSTOM TOOLTIP
// ============================================================================
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121829] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
        <p className="text-[12px] font-bold text-white uppercase tracking-wider">{payload[0].payload.stage}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[14px] font-extrabold text-[#00D4FF]">{payload[0].value}</span>
          <span className="text-[11px] text-slate-400">candidates</span>
        </div>
      </div>
    );
  }
  return null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [timeRange, setTimeRange] = useState("30d");
  const [scrolled, setScrolled] = useState(false);

  // AI Briefing Banner State
  const [briefing, setBriefing] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [showBriefing, setShowBriefing] = useState(false);

  // Live Activity Feed State (12 initial, dynamically updates to show off springs)
  const [activities, setActivities] = useState([
    { id: 1, initials: "PA", text: "Priya Sharma applied for Senior React Developer", time: "2m ago", stage: "Applied", color: "purple" },
    { id: 2, initials: "AK", text: "Amit Khan was screened for Lead DevOps Engineer", time: "15m ago", stage: "Screened", color: "blue" },
    { id: 3, initials: "RD", text: "Rohan Das scheduled a Final Interview for AI Architect", time: "30m ago", stage: "Interviewed", color: "cyan" },
    { id: 4, initials: "SL", text: "Sneha Lingam was offered the Staff Product Manager role", time: "1h ago", stage: "Offered", color: "amber" },
    { id: 5, initials: "JM", text: "John Miller was hired as Director of Engineering", time: "2h ago", stage: "Hired", color: "green" },
    { id: 6, initials: "VG", text: "Vikram Gupta was screened for Frontend Developer", time: "3h ago", stage: "Screened", color: "blue" },
    { id: 7, initials: "NP", text: "Neha Patel applied for Technical Recruiter", time: "4h ago", stage: "Applied", color: "purple" },
    { id: 8, initials: "RC", text: "Rahul Chawla's application for iOS Engineer was rejected", time: "5h ago", stage: "Rejected", color: "rose" },
    { id: 9, initials: "TB", text: "Tanya Bose scheduled a Tech Interview for Fullstack Engineer", time: "6h ago", stage: "Interviewed", color: "cyan" },
    { id: 10, initials: "MS", text: "Mark Stone applied for Backend Developer (Go)", time: "8h ago", stage: "Applied", color: "purple" },
    { id: 11, initials: "SR", text: "Sanjay Rao was offered the QA Automation Lead role", time: "1d ago", stage: "Offered", color: "amber" },
    { id: 12, initials: "DM", text: "Deepika Murthy was hired as Senior UI/UX Designer", time: "1d ago", stage: "Hired", color: "green" },
  ]);

  // Notifications Mock State
  const [unreadCount, setUnreadCount] = useState(3);

  // Scroll Glassmorphism Listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch AI Briefing
  useEffect(() => {
    const isDismissed = sessionStorage.getItem("recruiter-ai-briefing-dismissed");
    if (isDismissed === "true") {
      setLoadingBriefing(false);
      setShowBriefing(false);
      return;
    }

    const fetchBriefing = async () => {
      try {
        setLoadingBriefing(true);
        const res = await getAIBriefing();
        if (res.data && res.data.success) {
          setBriefing(res.data.data);
          setShowBriefing(true);
        } else if (res.data) {
          setBriefing(res.data);
          setShowBriefing(true);
        }
      } catch (err) {
        console.error("Failed to load AI daily briefing:", err);
      } finally {
        setLoadingBriefing(false);
      }
    };
    fetchBriefing();
  }, []);

  // Live Activity Feed - dynamic append to demonstrate spring animations
  useEffect(() => {
    const candidateNames = [
      "Karan Malhotra",
      "Aishwarya Roy",
      "Rajesh Kumar",
      "Pooja Hegde",
      "Dev Patel",
      "Shreya Ghoshal",
      "Kabir Mehta",
      "Zara Hussain"
    ];
    const roles = [
      "Senior iOS Developer",
      "Lead Data Scientist",
      "Product Designer",
      "Backend Engineer (Rust)",
      "Security Specialist",
      "Agile Project Manager"
    ];
    const actions = [
      { text: "applied for", stage: "Applied", color: "purple" },
      { text: "was screened for", stage: "Screened", color: "blue" },
      { text: "scheduled an interview for", stage: "Interviewed", color: "cyan" },
      { text: "was offered the", stage: "Offered", color: "amber" },
      { text: "was hired as", stage: "Hired", color: "green" },
      { text: "was rejected for", stage: "Rejected", color: "rose" }
    ];

    const interval = setInterval(() => {
      const name = candidateNames[Math.floor(Math.random() * candidateNames.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      const newItem = {
        id: Date.now(),
        initials,
        text: `${name} ${action.text} ${role}`,
        time: "Just now",
        stage: action.stage,
        color: action.color
      };

      setActivities((prev) => [newItem, ...prev.slice(0, 14)]);
    }, 15000); // Add a new action every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDismissBriefing = () => {
    sessionStorage.setItem("recruiter-ai-briefing-dismissed", "true");
    setShowBriefing(false);
  };

  // Nav Items definition
  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Pipeline", icon: Kanban },
    { name: "Candidates", icon: Users },
    { name: "Jobs", icon: Briefcase },
    { name: "Analytics", icon: BarChart3 },
    { name: "Schedule", icon: Calendar },
    { name: "AI Tools", icon: Sparkles },
    { name: "Settings", icon: Settings },
  ];

  // Dynamic Funnel Conversion data based on Time Range Filter
  const funnelData = useMemo(() => {
    switch (timeRange) {
      case "7d":
        return [
          { stage: "Applied", count: 32, prevPct: 100, dropOff: 0 },
          { stage: "Screened", count: 20, prevPct: 62.5, dropOff: 37.5 },
          { stage: "Interviewed", count: 10, prevPct: 50, dropOff: 50 },
          { stage: "Offered", count: 4, prevPct: 40, dropOff: 60 },
          { stage: "Hired", count: 2, prevPct: 50, dropOff: 50 },
        ];
      case "90d":
        return [
          { stage: "Applied", count: 420, prevPct: 100, dropOff: 0 },
          { stage: "Screened", count: 280, prevPct: 66.7, dropOff: 33.3 },
          { stage: "Interviewed", count: 154, prevPct: 55, dropOff: 45 },
          { stage: "Offered", count: 52, prevPct: 33.8, dropOff: 66.2 },
          { stage: "Hired", count: 38, prevPct: 73.1, dropOff: 26.9 },
        ];
      case "30d":
      default:
        return [
          { stage: "Applied", count: 120, prevPct: 100, dropOff: 0 },
          { stage: "Screened", count: 80, prevPct: 66.7, dropOff: 33.3 },
          { stage: "Interviewed", count: 45, prevPct: 56.3, dropOff: 43.7 },
          { stage: "Offered", count: 15, prevPct: 33.3, dropOff: 66.7 },
          { stage: "Hired", count: 12, prevPct: 80, dropOff: 20 },
        ];
    }
  }, [timeRange]);

  // Today's schedule data
  const interviews = [
    { id: 1, time: "10:00 AM", name: "Rohan Das", role: "AI Architect", type: "Technical", initials: "RD", color: "from-blue-500 to-indigo-600" },
    { id: 2, time: "11:30 AM", name: "Sneha Lingam", role: "Staff Product Manager", type: "Final", initials: "SL", color: "from-purple-500 to-pink-600" },
    { id: 3, time: "02:00 PM", name: "Priya Sharma", role: "Senior React Developer", type: "Technical", initials: "PS", color: "from-cyan-500 to-blue-600" },
    { id: 4, time: "04:30 PM", name: "Amit Khan", role: "Lead DevOps Engineer", type: "HR", initials: "AK", color: "from-teal-500 to-green-600" }
  ];

  // Helper mapping color names to HSL design system utility classes
  const getStageColor = (color) => {
    switch (color) {
      case "purple": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "blue": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "cyan": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "amber": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "green": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rose": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getInitialsGradient = (initials) => {
    const sum = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
    const grads = [
      "from-purple-500 to-indigo-600",
      "from-cyan-500 to-blue-600",
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-pink-600",
    ];
    return grads[sum % grads.length];
  };

  // Sparkline Mock Datasets (7 days)
  const sparklineData = {
    applicants: [4, 8, 5, 12, 9, 15, 12],
    interviews: [2, 4, 3, 1, 5, 3, 4],
    offers: [1, 2, 0, 1, 3, 1, 2],
    timeToHire: [21, 20.5, 20.8, 19.5, 19.8, 19.0, 18.8]
  };

  // Count-up calculations
  const countApplicants = useCountUp(12);
  const countInterviews = useCountUp(4);
  const countOffers = useCountUp(2);
  const countTimeToHire = useCountUp(18); // Avg time to hire is 18.8d (displays rounded count-up to 18)

  return (
    <div className="min-h-screen bg-[#060813] text-white flex">
      {/* ======================================================================
          FIXED LEFT SIDEBAR (220px, desktop only)
          ====================================================================== */}
      <aside
        className="hidden lg:flex flex-col w-[220px] fixed top-0 bottom-0 left-0 z-50 overflow-y-auto"
        style={{
          background: "rgba(10, 10, 20, 0.6)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)"
        }}
      >
        {/* Logo & Recruiter Hub Header */}
        <div className="h-14 px-6 flex items-center gap-2.5 border-b border-white/5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-indigo-500/20">
            C
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">Recruiter Hub</h1>
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5 block">CogniFit AI</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  toast.success(`Switched to ${item.name} workspace`);
                }}
                className={`w-full flex items-center gap-2.5 px-4 h-11 text-sm font-semibold transition-all border-l-2 ${
                  active
                    ? "bg-indigo-500/10 border-indigo-500 text-indigo-300"
                    : "border-transparent text-slate-400 hover:bg-white/4 hover:text-white"
                }`}
              >
                <Icon size={16} className={active ? "text-indigo-400" : "opacity-60"} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => {
              logout();
              toast.success("Log out successful");
            }}
            className="w-full flex items-center gap-2.5 px-4 h-11 text-sm font-bold text-rose-400 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 transition"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ======================================================================
          MAIN CONTENT AREA
          ====================================================================== */}
      <div className="flex-1 flex flex-col lg:pl-[220px] min-w-0">
        
        {/* ====================================================================
            TOP NAVBAR (56px)
            ==================================================================== */}
        <header
          className={`h-14 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between transition-all duration-300 ${
            scrolled ? "bg-[#060813]/85 backdrop-blur-md border-b border-white/5" : "bg-transparent"
          }`}
        >
          {/* Welcome greeting */}
          <div>
            <h2 className="text-sm md:text-base font-bold text-white tracking-tight">
              Good morning, {user?.name || "Recruiter"}
            </h2>
            <p className="text-[10px] text-slate-400 hidden md:block">Here is your recruiting pipeline overview for today.</p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => {
                setUnreadCount(0);
                toast.success("Notifications cleared");
              }}
              className="relative p-2 rounded-full hover:bg-white/5 text-slate-300 hover:text-white transition"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center border border-[#060813] scale-95">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Recruiter Avatar */}
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-extrabold text-xs text-indigo-300 uppercase select-none">
              {(user?.name || "R")[0]}
            </div>
          </div>
        </header>

        {/* ====================================================================
            DASHBOARD CONTAINER
            ==================================================================== */}
        <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto pb-16">
          
          {/* ==================================================================
              AI DAILY BRIEFING BANNER
              ================================================================== */}
          <AnimatePresence>
            {showBriefing && briefing && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="relative rounded-2xl border p-4 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)",
                  borderColor: "rgba(99, 102, 241, 0.16)"
                }}
              >
                {/* Visual decoration glow */}
                <div className="absolute -top-12 -left-12 h-24 w-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 h-24 w-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start gap-3.5 relative z-10">
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 shrink-0 mt-0.5">
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-indigo-200 uppercase tracking-wider">AI Recruiting Briefing</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                      <span className="font-bold text-white">{briefing.greeting}</span> {briefing.topPriority} 
                      {briefing.insight && <span className="text-slate-400 block mt-0.5">💡 {briefing.insight}</span>}
                    </p>
                    {briefing.alert && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-[10px] font-semibold text-rose-300">
                        <AlertCircle size={12} />
                        <span>{briefing.alert}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleDismissBriefing}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition relative z-20"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ==================================================================
              ROW 1 — STATS CARD GRID (4 Columns)
              ================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARD 1: New applicants today */}
            <div
              className="rounded-2xl border p-5 flex flex-col justify-between"
              style={{
                background: "rgba(22, 33, 62, 0.8)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255, 255, 255, 0.06)"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                  <Users size={18} />
                </div>
                <Sparkline data={sparklineData.applicants} color="#a855f7" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">{countApplicants}</span>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">New Applicants Today</h4>
                <p className="text-[10px] text-purple-400 font-bold mt-1.5 flex items-center gap-1">
                  <span>+12 from yesterday</span>
                </p>
              </div>
            </div>

            {/* CARD 2: Interviews today */}
            <div
              className="rounded-2xl border p-5 flex flex-col justify-between"
              style={{
                background: "rgba(22, 33, 62, 0.8)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255, 255, 255, 0.06)"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                  <Calendar size={18} />
                </div>
                <Sparkline data={sparklineData.interviews} color="#06b6d4" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">{countInterviews}</span>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Interviews Scheduled</h4>
                <p className="text-[10px] text-cyan-400 font-bold mt-1.5 flex items-center gap-1">
                  <span>Next in 2 hours</span>
                </p>
              </div>
            </div>

            {/* CARD 3: Offers pending */}
            <div
              className="rounded-2xl border p-5 flex flex-col justify-between"
              style={{
                background: "rgba(22, 33, 62, 0.8)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255, 255, 255, 0.06)"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                  <FileText size={18} />
                </div>
                <Sparkline data={sparklineData.offers} color="#f59e0b" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">{countOffers}</span>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Offers Pending</h4>
                <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                  <span>2 expiring today</span>
                </p>
              </div>
            </div>

            {/* CARD 4: Avg time-to-hire */}
            <div
              className="rounded-2xl border p-5 flex flex-col justify-between"
              style={{
                background: "rgba(22, 33, 62, 0.8)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255, 255, 255, 0.06)"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Clock size={18} />
                </div>
                <Sparkline data={sparklineData.timeToHire} color="#10b981" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">{countTimeToHire} days</span>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Avg Time-to-Hire</h4>
                <p className="text-[10px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                  <span>↓ 1.2d vs last month</span>
                </p>
              </div>
            </div>

          </div>

          {/* ==================================================================
              ROW 2 — FUNNEL + FEED (60% / 40%)
              ================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* FUNNEL CHART (60%) */}
            <div
              className="lg:col-span-3 rounded-2xl border p-5 flex flex-col justify-between"
              style={{
                background: "rgba(22, 33, 62, 0.8)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255, 255, 255, 0.06)"
              }}
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Pipeline Conversion</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Hiring funnel status this month</p>
                </div>
                
                {/* Date range filters */}
                <div className="flex items-center gap-1 bg-[#060813] border border-white/5 rounded-lg p-0.5">
                  {["7d", "30d", "90d"].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        toast.success(`Swapped metrics to past ${range}`);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase transition-all ${
                        timeRange === range
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horizontal Bar Chart representation */}
              <div className="h-64 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={funnelData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                      tick={{ fill: "#94a3b8", fontWeight: "bold" }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar
                      dataKey="count"
                      fill="url(#funnelGradient)"
                      radius={[0, 8, 8, 0]}
                      animationDuration={800}
                    >
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Drop-off and conversion analysis values */}
              <div className="mt-4 border-t border-white/5 pt-4 grid grid-cols-5 gap-1.5 text-center">
                {funnelData.map((d, index) => (
                  <div key={d.stage}>
                    <p className="text-[10px] text-slate-400 font-bold leading-none">{d.stage}</p>
                    <p className="text-xs font-extrabold text-white mt-1">{d.count}</p>
                    {index > 0 ? (
                      <div className="mt-1 leading-normal">
                        <p className="text-[9px] text-[#00D4FF] font-bold">{(d.prevPct).toFixed(0)}% conv</p>
                        <p className="text-[9px] text-rose-500 font-bold">{(d.dropOff).toFixed(0)}% drop</p>
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-500 font-bold mt-1">Start</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE ACTIVITY FEED (40%) */}
            <div
              className="lg:col-span-2 rounded-2xl border p-5 flex flex-col justify-between"
              style={{
                background: "rgba(22, 33, 62, 0.8)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255, 255, 255, 0.06)",
                maxHeight: "410px"
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Live Activity Feed</h3>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-[#060813] border border-white/5 px-2 py-0.5 rounded">Real-Time</span>
              </div>

              {/* Activity Feed scrollarea */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar">
                <AnimatePresence initial={false}>
                  {activities.map((act) => (
                    <motion.div
                      key={act.id}
                      initial={{ y: -15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-white/4 bg-white/2 hover:bg-white/4 transition"
                    >
                      {/* Gradient Initials Avatar */}
                      <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs bg-gradient-to-tr ${getInitialsGradient(act.initials)} text-white`}>
                        {act.initials}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-200 font-semibold leading-snug break-words">{act.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-slate-400 font-medium">{act.time}</span>
                          <span className="text-slate-500 text-[8px]">•</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border ${getStageColor(act.color)}`}>
                            {act.stage}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* ==================================================================
              ROW 3 — TODAY'S SCHEDULE + QUICK ACTIONS
              ================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* SCHEDULE (60%) */}
            <div
              className="lg:col-span-3 rounded-2xl border p-5 flex flex-col justify-between"
              style={{
                background: "rgba(22, 33, 62, 0.8)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255, 255, 255, 0.06)"
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 font-bold">Today's Schedule</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Your planned meetings and screens</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold">
                  <CalendarDays size={14} />
                  <span>{interviews.length} Interviews</span>
                </div>
              </div>

              {/* Interview Rows */}
              <div className="space-y-2.5">
                {interviews.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-semibold">
                    <p className="text-xl">No interviews today 🎉</p>
                    <p className="text-xs text-slate-500 mt-1">Take a break or review new applications.</p>
                  </div>
                ) : (
                  interviews.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-white/5 bg-white/2 hover:border-indigo-500/20 hover:bg-white/4 transition"
                    >
                      <div className="flex items-center gap-3">
                        {/* Time badge */}
                        <div className="px-2.5 py-1.5 rounded-lg bg-[#060813] border border-white/5 text-[10px] font-bold text-indigo-400 tracking-wider font-mono">
                          {meeting.time}
                        </div>
                        
                        {/* Avatar */}
                        <div className={`h-8 w-8 rounded-full bg-gradient-to-tr ${meeting.color} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                          {meeting.initials}
                        </div>

                        {/* Candidate info */}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{meeting.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {meeting.role} • <span className="font-bold text-indigo-400">{meeting.type}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => toast.success("Interview reschedule screen open")}
                          className="p-2 rounded-lg bg-[#060813] border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition text-[10px] font-semibold"
                          title="Reschedule interview"
                        >
                          Reschedule
                        </button>
                        <a
                          href="https://meet.google.com"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            toast.success(`Joining interview with ${meeting.name}`);
                          }}
                          className="px-3.5 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-[10px] flex items-center gap-1.5 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition active:scale-95"
                        >
                          <Play size={12} fill="white" />
                          <span>Join Meet</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* QUICK ACTIONS GRID (40%) */}
            <div
              className="lg:col-span-2 rounded-2xl border p-5 flex flex-col justify-between"
              style={{
                background: "rgba(22, 33, 62, 0.8)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255, 255, 255, 0.06)"
              }}
            >
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Quick Actions</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-4">Execute routine recruiter processes</p>
              </div>

              {/* Grid 2x2 of buttons */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* BUTTON 1: Post new job */}
                <button
                  onClick={() => toast.success("Opening new job editor...")}
                  className="h-[72px] rounded-xl border border-white/5 bg-white/2 hover:bg-indigo-500/10 hover:border-indigo-500/40 flex flex-col items-center justify-center gap-1.5 transition duration-300 active:scale-97 group shadow-sm hover:shadow-indigo-500/10"
                >
                  <Plus size={20} className="text-indigo-400 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-200">Post New Job</span>
                </button>

                {/* BUTTON 2: Review pending */}
                <button
                  onClick={() => toast.success("Reviewing candidate application queue...")}
                  className="h-[72px] rounded-xl border border-white/5 bg-white/2 hover:bg-indigo-500/10 hover:border-indigo-500/40 flex flex-col items-center justify-center gap-1.5 transition duration-300 active:scale-97 group shadow-sm hover:shadow-indigo-500/10"
                >
                  <Clock size={20} className="text-indigo-400 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-200">Review Pending</span>
                </button>

                {/* BUTTON 3: Rank candidates */}
                <button
                  onClick={() => toast.success("Launching AI applicant matches ranker...")}
                  className="h-[72px] rounded-xl border border-white/5 bg-white/2 hover:bg-indigo-500/10 hover:border-indigo-500/40 flex flex-col items-center justify-center gap-1.5 transition duration-300 active:scale-97 group shadow-sm hover:shadow-indigo-500/10"
                >
                  <Sparkles size={20} className="text-indigo-400 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-200">Rank Candidates</span>
                </button>

                {/* BUTTON 4: Export report */}
                <button
                  onClick={() => {
                    toast.success("Hiring performance report compiled!");
                    setTimeout(() => {
                      toast.success("Excel report exported successfully 📁");
                    }, 800);
                  }}
                  className="h-[72px] rounded-xl border border-white/5 bg-white/2 hover:bg-indigo-500/10 hover:border-indigo-500/40 flex flex-col items-center justify-center gap-1.5 transition duration-300 active:scale-97 group shadow-sm hover:shadow-indigo-500/10"
                >
                  <FileSpreadsheet size={20} className="text-indigo-400 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-200">Export Report</span>
                </button>

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
