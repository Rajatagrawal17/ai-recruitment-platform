import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import {
  Upload,
  Brain,
  Zap,
  ArrowRight,
  Briefcase,
  User,
  Zap as ZapIcon,
  Lock,
  BarChart3,
  Trophy,
  Search,
  MapPin,
  Sparkles,
} from "lucide-react";
import ParticleCanvas from "../components/ParticleCanvas";
import { ScrollReveal } from "../components/ScrollReveal";
import { StaggerList } from "../components/StaggerList";
import { TiltCard } from "../components/TiltCard";
import { MagneticButton } from "../components/MagneticButton";
import "./ModernLandingPage.css";

// ============================================================================
// ANIMATED COUNTER COMPONENT (framer-motion)
// ============================================================================

const AnimatedCounter = ({ to, duration = 2, suffix = "", label }) => {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString() + suffix);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          animate(count, to, {
            duration,
            ease: [0.4, 0, 0.2, 1],
          });
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration, started, count]);

  return (
    <div className="flex flex-col items-center p-4">
      <motion.span ref={ref} className="text-4xl sm:text-5xl font-extrabold text-[#00D4FF] tracking-tight">
        {rounded}
      </motion.span>
      {label && (
        <p className="text-xs sm:text-sm text-[#94A3B8] font-semibold uppercase tracking-wider mt-2">
          {label}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// STAGGERED LOGO ITEM COMPONENT
// ============================================================================

const socialLogos = [
  { initials: "GG", name: "Google" },
  { initials: "MS", name: "Microsoft" },
  { initials: "AM", name: "Amazon" },
  { initials: "NF", name: "Netflix" },
  { initials: "SF", name: "Salesforce" },
];

const parentLogoVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100,
      damping: 12 
    } 
  },
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("Remote");

  const popularCategories = [
    "React Developer",
    "Product Manager",
    "Data Scientist",
    "UX Designer",
    "DevOps",
  ];

  const handleChipClick = (category) => {
    setSearchQuery(category);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`);
  };

  const headlineFirstLine = "Find Your Perfect Role".split(" ");
  const headlineSecondLine = "Powered by AI".split(" ");

  return (
    <section className="hero-section py-20 lg:py-32" style={{ position: "relative", overflow: "hidden", zIndex: 1 }}>
      {/* Background Aurora and Grid texture */}
      <div className="aurora-bg">
        <div className="orb-1 aurora-orb" />
        <div className="orb-2 aurora-orb" />
        <div className="orb-3 aurora-orb" />
        <div className="orb-4 aurora-orb" />
        <div className="grid-texture" />
      </div>
      <div className="noise-overlay" />
      <ParticleCanvas />

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center">
        {/* Label Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md"
        >
          <span className="text-[#6366f1] animate-pulse">✦</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
            AI-POWERED RECRUITMENT STUDIO
          </span>
        </motion.div>

        {/* Staggered Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight select-none">
          {headlineFirstLine.map((word, i) => (
            <motion.span
              key={`line1-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: i * 0.06,
                ease: "easeOut",
              }}
              className="inline-block mr-2 md:mr-4"
            >
              {word}
            </motion.span>
          ))}
          <br />
          <span className="gradient-text-animated">
            {headlineSecondLine.map((word, i) => (
              <motion.span
                key={`line2-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: (headlineFirstLine.length + i) * 0.06 + 0.1,
                  ease: "easeOut",
                }}
                className="inline-block mr-2 md:mr-4"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-base sm:text-lg text-slate-400 mb-10 max-w-2xl leading-relaxed"
        >
          HireAI automatically matches your skills against top vacancies. Calculate real-time compatibility scores and skip the recruitment noise.
        </motion.p>

        {/* Interactive Search Bar */}
        <motion.form
          onSubmit={handleSearchSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="search-bar-container mb-6"
        >
          <Search size={20} className="text-[#6366f1] mr-3" />
          <input
            type="text"
            placeholder="Job title, skill, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
          />
          <select
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="location-dropdown-select"
          >
            <option value="Remote">📍 Remote</option>
            <option value="Bangalore">📍 Bangalore</option>
            <option value="Mumbai">📍 Mumbai</option>
            <option value="Delhi NCR">📍 Delhi NCR</option>
            <option value="Hyderabad">📍 Hyderabad</option>
            <option value="San Francisco">📍 San Francisco</option>
          </select>
          <MagneticButton type="submit" className="search-action-btn ml-3">
            <span>Find Jobs</span>
            <ArrowRight size={16} />
          </MagneticButton>
        </motion.form>

        {/* Floating Job Category Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase mr-2">
            Popular:
          </span>
          <StaggerList className="flex flex-wrap items-center justify-center gap-3">
            {popularCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleChipClick(category)}
                className="category-chip"
              >
                {category}
              </button>
            ))}
          </StaggerList>
        </div>

        {/* Social Proof Row */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Trusted by teams at
          </p>
          <StaggerList className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            {socialLogos.map((logo) => (
              <div
                key={logo.initials}
                className="social-logo-circle"
                title={logo.name}
              >
                {logo.initials}
              </div>
            ))}
          </StaggerList>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// STATS BAR SECTION
// ============================================================================

const StatsSection = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#070b16] px-4 sm:px-6 lg:px-8 border-y border-white/5">
      <div className="max-w-5xl mx-auto">
        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-center">
          <AnimatedCounter to={10000} suffix="+" label="Verified Jobs" />
          <AnimatedCounter to={500} suffix="+" label="Top Companies" />
          <AnimatedCounter to={95} suffix="%" label="AI Match Accuracy" />
        </StaggerList>
      </div>
    </section>
  );
};

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Upload,
      number: "01",
      title: "Upload Your Resume",
      desc: "Our AI reads your resume and automatically extracts your skills, experience level, and qualifications.",
    },
    {
      icon: Brain,
      number: "02",
      title: "AI Calculates Your Match",
      desc: "Get a real match percentage for every job — based on skills (50%), experience (30%), and education (20%).",
    },
    {
      icon: Zap,
      number: "03",
      title: "Apply & Get Hired",
      desc: "Apply to the best matched jobs and track your application status in real time.",
    },
  ];

  return (
    <section className="py-20 sm:py-32 bg-[#0A0F1E] px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How <span className="gradient-text-animated">HireAI</span> Works
          </h2>
          <p className="text-lg text-[#94A3B8]">Three simple steps to smarter hiring</p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Arrows on desktop */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1 pointer-events-none z-10">
            <div className="flex justify-between h-full px-[18%]">
              <div className="flex-1 flex items-center justify-end pr-8">
                <ArrowRight className="text-[#00D4FF]/40 w-6 h-6" />
              </div>
              <div className="flex-1 flex items-center justify-end pr-8">
                <ArrowRight className="text-[#00D4FF]/40 w-6 h-6" />
              </div>
            </div>
          </div>

          <StaggerList className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <TiltCard
                  key={index}
                  className="p-8 rounded-2xl bg-white/4 border border-[#00D4FF]/15 backdrop-blur-sm hover:border-[#00D4FF]/50 hover:bg-white/6 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-[#00D4FF]/10">
                      <Icon className="text-[#00D4FF] w-6 h-6" />
                    </div>
                    <span className="text-3xl font-bold text-[#00D4FF]/40">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed">{step.desc}</p>
                </TiltCard>
              );
            })}
          </StaggerList>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// DUAL ROLE CARDS SECTION
// ============================================================================

const DualRoleSection = () => {
  const recruiterFeatures = [
    "Post unlimited job listings",
    "AI ranks candidates by match score",
    "View ranked candidate list per job",
    "Accept or reject applications instantly",
    "Analytics dashboard with charts",
  ];

  const candidateFeatures = [
    "Upload resume — AI extracts your skills",
    "See your match % for every job",
    "Discover jobs that fit your profile",
    "Track all applications in one place",
    "OTP verified secure profile",
  ];

  return (
    <section className="py-20 sm:py-32 bg-[#0A0F1E] px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Built for Everyone in <span className="gradient-text-animated">Hiring</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recruiter Card */}
          <TiltCard
            className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-purple-500/5 via-white/2 to-transparent border border-purple-500/30 backdrop-blur-md"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 mb-6">
              <span className="text-sm font-semibold text-purple-400">
                FOR RECRUITERS
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="text-purple-400 w-8 h-8" />
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Post Jobs & Find Top Talent
              </h3>
            </div>

            <div className="space-y-4 mb-8">
              {recruiterFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-[#E2E8F0]"
                >
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Link to="/login">
              <MagneticButton
                className="px-6 py-3 border-2 border-purple-500/50 text-purple-400 rounded-lg font-semibold hover:bg-purple-500/10 transition-all duration-300 flex items-center gap-2 group"
              >
                Start Recruiting
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </Link>
          </TiltCard>

          {/* Candidate Card */}
          <TiltCard
            className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-white/2 to-transparent border border-[#00D4FF]/20 backdrop-blur-md"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-[#00D4FF]/20 border border-[#00D4FF]/40 mb-6">
              <span className="text-sm font-semibold text-[#00D4FF]">
                FOR CANDIDATES
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <User className="text-[#00D4FF] w-8 h-8" />
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Upload Resume & Get Matched
              </h3>
            </div>

            <div className="space-y-4 mb-8">
              {candidateFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-[#E2E8F0]"
                >
                  <span className="text-[#00D4FF] font-bold">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Link to="/jobs">
              <MagneticButton
                className="px-6 py-3 border-2 border-[#00D4FF]/50 text-[#00D4FF] rounded-lg font-semibold hover:bg-[#00D4FF]/10 transition-all duration-300 flex items-center gap-2 group"
              >
                Find Jobs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </Link>
          </TiltCard>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// BENTO GRID FEATURES SECTION
// ============================================================================
const BentoGridSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Resume Analysis",
      desc: "Paste or upload a resume — HireAI's AI instantly extracts technical skills, soft skills, experience years, and education level with zero manual work.",
      isLarge: true,
      skills: ["Python", "React", "Node.js", "AWS", "Docker"],
    },
    {
      icon: BarChart3,
      title: "Smart Match Score",
      desc: "Every candidate gets a precise match percentage per job using a weighted algorithm trusted by top recruiters.",
      isLarge: true,
      showBars: true,
    },
    {
      icon: ZapIcon,
      title: "10x Faster",
      desc: "Process 100 applications instantly",
    },
    {
      icon: Lock,
      title: "OTP Secured",
      desc: "SMS + Email dual verification",
    },
    {
      icon: BarChart3,
      title: "Live Analytics",
      desc: "Real-time hiring pipeline charts",
    },
    {
      icon: Trophy,
      title: "Ranked Results",
      desc: "Top candidates sorted by AI score",
    },
  ];

  const SkillPill = ({ skill }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-sm text-[#00D4FF] font-medium"
    >
      {skill}
    </motion.div>
  );

  const MatchBar = ({ label, percentage }) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-[#E2E8F0]">{label}</span>
        <span className="text-sm text-[#00D4FF]">{percentage}%</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="h-full bg-gradient-to-r from-[#00D4FF] to-cyan-400"
        />
      </div>
    </div>
  );

  return (
    <section className="py-20 sm:py-32 bg-[#0A0F1E] px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Everything You Need to Hire with <span className="gradient-text-animated">AI</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.isLarge;
            const colSpan = isLarge ? "sm:col-span-2" : "";

            return (
              <TiltCard
                key={index}
                className={`p-6 sm:p-8 rounded-2xl bg-white/4 border border-white/8 backdrop-blur-sm transition-all duration-300 ${colSpan}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <Icon className="text-[#00D4FF] w-6 h-6 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#94A3B8]">
                      {feature.desc}
                    </p>
                  </div>
                </div>

                {/* Skills Pills for AI Resume Analysis */}
                {feature.skills && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {feature.skills.map((skill, idx) => (
                      <SkillPill key={idx} skill={skill} />
                    ))}
                  </div>
                )}

                {/* Match Bars for Smart Match Score */}
                {feature.showBars && (
                  <div className="mt-6 space-y-3">
                    <MatchBar label="Skills Match" percentage={82} />
                    <MatchBar label="Experience" percentage={64} />
                    <MatchBar label="Education" percentage={90} />
                  </div>
                )}
              </TiltCard>
            );
          })}
        </StaggerList>
      </div>
    </section>
  );
};

// ============================================================================
// FINAL CTA BANNER SECTION
// ============================================================================

const FinalCTASection = () => {
  return (
    <section className="py-20 sm:py-32 bg-[#0A0F1E] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle cyan gradient glow in background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00D4FF]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to Hire <span className="gradient-text-animated">Smarter?</span>
        </h2>

        <p className="text-lg sm:text-xl text-[#94A3B8] mb-12">
          Join recruiters and candidates already using HireAI to make
          better hiring decisions.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/login">
            <MagneticButton
              className="px-8 sm:px-10 py-4 bg-[#00D4FF] text-[#0A0F1E] rounded-full font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-[#00D4FF]/50 transition-all duration-300 btn-primary text-white"
            >
              Get Started Free
            </MagneticButton>
          </Link>

          <Link to="/jobs">
            <MagneticButton
              className="px-8 sm:px-10 py-4 border-2 border-white text-white rounded-full font-bold text-base sm:text-lg hover:bg-white/8 transition-all duration-300"
            >
              View Jobs
            </MagneticButton>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================================

const ModernLandingPage = () => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.scrollBehavior = "smooth";
    return () => {
      document.documentElement.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="bg-[#0A0F1E] text-white overflow-x-hidden">
      <ScrollReveal><HeroSection /></ScrollReveal>
      <ScrollReveal><StatsSection /></ScrollReveal>
      <ScrollReveal><HowItWorksSection /></ScrollReveal>
      <ScrollReveal><DualRoleSection /></ScrollReveal>
      <ScrollReveal><BentoGridSection /></ScrollReveal>
      <ScrollReveal><FinalCTASection /></ScrollReveal>
    </div>
  );
};

export default ModernLandingPage;
