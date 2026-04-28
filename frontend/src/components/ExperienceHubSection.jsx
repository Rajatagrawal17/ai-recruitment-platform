import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedBackground3D from "./AnimatedBackground3D";
import AnimatedCounter from "./AnimatedCounter";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  PieChart,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Zap,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const roleCatalog = {
  recruiter: {
    badge: "Recruiter intelligence",
    title: "Turn hiring into a clean command center",
    description:
      "Post roles, rank candidates, schedule interviews, and keep every hiring signal in one place without the heavy dashboard feel.",
    accent: "from-cyan-500 via-sky-500 to-blue-600",
    stats: [
      { value: 42, suffix: "%", label: "faster shortlist" },
      { value: 18, suffix: "h", label: "saved each week" },
      { value: 96, suffix: "%", label: "match confidence" },
    ],
    highlights: [
      {
        icon: BriefcaseBusiness,
        title: "Company-scoped workspace",
        text: "Keep recruiters focused on one company, one pipeline, and one clean set of roles.",
      },
      {
        icon: SearchCheck,
        title: "Ranked candidate view",
        text: "See the strongest applicants first with match scores, filters, and quick actions.",
      },
      {
        icon: CalendarClock,
        title: "Fast interview handling",
        text: "Schedule interviews, export calendars, and move candidates without leaving the page.",
      },
    ],
    actions: ["Post roles", "Review pipeline", "Schedule interviews", "Track hiring analytics"],
    cta: "/dashboard",
    ctaLabel: "Open recruiter dashboard",
  },
  candidate: {
    badge: "Candidate journey",
    title: "Help candidates move faster with clarity",
    description:
      "Show applicants where they fit, how they scored, and what they should do next, so the experience feels guided instead of confusing.",
    accent: "from-violet-500 via-fuchsia-500 to-pink-600",
    stats: [
      { value: 3, suffix: "x", label: "faster apply flow" },
      { value: 89, suffix: "%", label: "profile clarity" },
      { value: 24, suffix: "/7", label: "job discovery" },
    ],
    highlights: [
      {
        icon: Upload,
        title: "Resume-first applications",
        text: "Apply from a single polished flow with upload, cover letter, and profile enrichment built in.",
      },
      {
        icon: PieChart,
        title: "Visible match context",
        text: "Candidates can understand fit, skill overlap, and recommended next steps at a glance.",
      },
      {
        icon: ShieldCheck,
        title: "Safe and guided flow",
        text: "Keep steps clear, mobile friendly, and trustworthy from discovery to submission.",
      },
    ],
    actions: ["Discover jobs", "Check match scores", "Save roles", "Track applications"],
    cta: "/jobs",
    ctaLabel: "Browse jobs",
  },
  both: {
    badge: "Shared hiring loop",
    title: "One platform, two polished journeys",
    description:
      "Visitors can switch between recruiter and candidate views to understand the platform from both sides before they sign up.",
    accent: "from-emerald-500 via-teal-500 to-cyan-600",
    stats: [
      { value: 2, suffix: "x", label: "role clarity" },
      { value: 5, suffix: "s", label: "switch time" },
      { value: 1, suffix: "flow", label: "shared system" },
    ],
    highlights: [
      {
        icon: Users,
        title: "Two audience paths",
        text: "Recruiters and candidates each get focused actions without losing the shared platform story.",
      },
      {
        icon: Zap,
        title: "Motion-first interface",
        text: "Framer Motion, GSAP, and ScrollTrigger keep the experience responsive and visually alive.",
      },
      {
        icon: BarChart3,
        title: "Data with context",
        text: "Analytics, match scoring, and role guidance are shown only where users need them.",
      },
    ],
    actions: ["Explore recruiter flow", "Explore candidate flow", "Read platform story", "Start free"],
    cta: "/register",
    ctaLabel: "Join the platform",
  },
};

const ExperienceHubSection = ({ className = "", compact = false }) => {
  const [selectedRole, setSelectedRole] = useState("both");
  const sectionRef = useRef(null);
  const active = roleCatalog[selectedRole];

  const roleKeys = useMemo(() => ["recruiter", "candidate", "both"], []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray("[data-story-card]");
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 48, rotateX: 10 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
            delay: index * 0.04,
          }
        );
      });

      gsap.fromTo(
        "[data-role-pill]",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [selectedRole]);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 text-white shadow-[0_28px_90px_rgba(2,6,23,0.55)] ${compact ? "py-12" : "py-16 md:py-20"} ${className}`}
    >
      <AnimatedBackground3D />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_34%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.55 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200"
            >
              <Sparkles size={14} /> Interactive experience hub
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="max-w-2xl text-4xl font-bold tracking-tight text-white md:text-5xl"
            >
              {active.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg"
            >
              {active.description}
            </motion.p>

            <div className="flex flex-wrap gap-3">
              {roleKeys.map((role) => {
                const selected = selectedRole === role;
                const label = role === "recruiter" ? "Recruiter view" : role === "candidate" ? "Candidate view" : "Both views";

                return (
                  <motion.button
                    key={role}
                    type="button"
                    data-role-pill
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(role)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      selected
                        ? "border-white/20 bg-white text-slate-950"
                        : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </motion.button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {active.stats.map((item) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.55 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <div className="text-3xl font-bold tracking-tight text-white">
                    <AnimatedCounter value={item.value} suffix={item.suffix} />
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={active.cta} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
                {active.ctaLabel}
                <ArrowRight size={16} />
              </Link>
              <Link to="/jobs" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                View job board
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${active.accent}`} />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">{active.badge}</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Role snapshot</h3>
              </div>
              <div className={`rounded-2xl bg-gradient-to-br ${active.accent} p-3 text-white shadow-lg`}>
                <Users size={18} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.28 }}
                className="mt-5 grid gap-3"
              >
                {active.highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      whileHover={{ y: -3 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`rounded-2xl bg-gradient-to-br ${active.accent} p-3 text-white shadow-lg`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-white">{item.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{item.text}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Actions unlocked</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {active.actions.map((item) => (
                  <span
                    key={item}
                    data-stack-tag
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {active.highlights.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={`${selectedRole}-${item.title}`}
                data-story-card
                whileHover={{ y: -4, rotateX: 2 }}
                className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-2xl bg-gradient-to-br ${active.accent} p-3 text-white shadow-lg`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Step</p>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{item.text}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Scroll-triggered reveal
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExperienceHubSection;
