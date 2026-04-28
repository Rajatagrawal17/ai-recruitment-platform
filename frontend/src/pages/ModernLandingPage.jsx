import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
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
} from "lucide-react";
import { Particles } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// ============================================================================
// HERO SECTION WITH PARTICLE NETWORK
// ============================================================================

const ParticleBackground = () => {
  const particlesInit = async (main) => {
    await loadSlim(main);
  };

  const particlesOptions = {
    background: {
      color: { value: "#0A0F1E" },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        push: { quantity: 4 },
        repulse: { distance: 200, duration: 0.4 },
      },
    },
    particles: {
      color: { value: "#00D4FF" },
      links: {
        color: "#00D4FF",
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: 2,
        straight: false,
      },
      number: { density: { enable: true, area: 800 }, value: 80 },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
      className="absolute inset-0"
    />
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-[#0A0F1E] flex items-center justify-center overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Label Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-[#00D4FF] bg-gradient-to-r from-[#00D4FF]/10 to-transparent"
        >
          <span className="text-[#00D4FF]">✦</span>
          <span className="text-sm font-medium text-[#00D4FF]">
            AI-POWERED RECRUITMENT
          </span>
        </motion.div>

        {/* Main Headline with Stagger */}
        <div className="mb-6">
          {["Hire Smarter.", "Match Better.", "With AI."].map(
            (line, index) => (
              <motion.h1
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.15 * index + 0.2,
                  ease: "easeOut",
                }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-2 leading-tight"
              >
                {line}
              </motion.h1>
            )
          )}
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="text-lg sm:text-xl text-[#94A3B8] mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          CogniFit uses AI to extract skills from resumes, calculate match
          scores, and rank the best candidates — automatically.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-8"
        >
          <Link
            to="/login"
            className="group relative inline-block"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 sm:px-10 py-4 bg-[#00D4FF] text-[#0A0F1E] rounded-full font-semibold text-base sm:text-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#00D4FF]/50"
            >
              Post a Job
            </motion.button>
          </Link>

          <Link
            to="/jobs"
            className="group relative inline-block"
          >
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.97 }}
              className="px-8 sm:px-10 py-4 border-2 border-white text-white rounded-full font-semibold text-base sm:text-lg transition-all duration-300"
            >
              Find Jobs
            </motion.button>
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="text-center text-sm sm:text-base text-[#94A3B8]"
        >
          <p>✓ Free to use &nbsp; ✓ No credit card &nbsp; ✓ AI matching included</p>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// ANIMATED STATS BAR SECTION
// ============================================================================

const StatCounter = ({ target, label, suffix = "" }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-bold text-[#00D4FF]"
      >
        {inView && (
          <CountUp
            start={0}
            end={
              typeof target === "number"
                ? target
                : parseInt(target.replace(/\D/g, ""))
            }
            duration={2.5}
            suffix={suffix}
          />
        )}
        {typeof target === "string" && !target.match(/^\d+$/) && !inView && target}
      </motion.div>
      <p className="text-sm sm:text-base text-[#94A3B8]">{label}</p>
    </div>
  );
};

const StatsSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="py-20 sm:py-32 bg-[#0A0F1E] px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-white/5 via-white/2 to-transparent border border-white/10 backdrop-blur-md">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            <StatCounter target={95} label="Match Accuracy" suffix="%" />
            <StatCounter target="10x" label="Faster Hiring" suffix="" />
            <StatCounter target="500+" label="Jobs Posted" suffix="" />
            <StatCounter target="50+" label="Skills Detected by AI" suffix="" />
          </div>
        </div>
      </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How CogniFit Works
          </h2>
          <p className="text-lg text-[#94A3B8]">Three simple steps to smarter hiring</p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Arrows on desktop */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1 pointer-events-none">
            <div className="flex justify-between h-full px-[18%]">
              <div className="flex-1 flex items-center justify-end pr-8">
                <ArrowRight className="text-[#00D4FF]/40 w-6 h-6" />
              </div>
              <div className="flex-1 flex items-center justify-end pr-8">
                <ArrowRight className="text-[#00D4FF]/40 w-6 h-6" />
              </div>
            </div>
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
                className="p-8 rounded-2xl bg-white/4 border border-[#00D4FF]/15 backdrop-blur-sm hover:border-[#00D4FF]/50 hover:bg-white/6 transition-all duration-300 group cursor-pointer"
                whileHover={{ y: -6 }}
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
              </motion.div>
            );
          })}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Built for Everyone in Hiring
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recruiter Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex items-center gap-3 text-[#E2E8F0]"
                >
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 border-2 border-purple-500/50 text-purple-400 rounded-lg font-semibold hover:bg-purple-500/10 transition-all duration-300 flex items-center gap-2 group"
              >
                Start Recruiting
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Candidate Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex items-center gap-3 text-[#E2E8F0]"
                >
                  <span className="text-[#00D4FF] font-bold">✓</span>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/jobs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 border-2 border-[#00D4FF]/50 text-[#00D4FF] rounded-lg font-semibold hover:bg-[#00D4FF]/10 transition-all duration-300 flex items-center gap-2 group"
              >
                Find Jobs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
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
      desc: "Paste or upload a resume — CogniFit's AI instantly extracts technical skills, soft skills, experience years, and education level with zero manual work.",
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Everything You Need to Hire with AI
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.isLarge;
            const colSpan = isLarge ? "sm:col-span-2" : "";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                whileHover={{ y: -6, borderColor: "rgba(0,212,255,0.5)" }}
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
              </motion.div>
            );
          })}
        </div>
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to Hire Smarter?
        </h2>

        <p className="text-lg sm:text-xl text-[#94A3B8] mb-12">
          Join recruiters and candidates already using CogniFit's AI to make
          better hiring decisions.
        </p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 sm:px-10 py-4 bg-[#00D4FF] text-[#0A0F1E] rounded-full font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-[#00D4FF]/50 transition-all duration-300"
            >
              Get Started Free
            </motion.button>
          </Link>

          <Link to="/jobs">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 sm:px-10 py-4 border-2 border-white text-white rounded-full font-bold text-base sm:text-lg hover:bg-white/8 transition-all duration-300"
            >
              View Jobs
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
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
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <DualRoleSection />
      <BentoGridSection />
      <FinalCTASection />
    </div>
  );
};

export default ModernLandingPage;
