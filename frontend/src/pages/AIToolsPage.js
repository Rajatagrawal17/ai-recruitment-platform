import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  FileText,
  TrendingUp,
  Briefcase,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import AIJobMatcher from "../components/AIJobMatcher";
import ResumeAnalyzer from "../components/ResumeAnalyzer";
import SkillGapAnalyzer from "../components/SkillGapAnalyzer";
import SalaryPredictor from "../components/SalaryPredictor";
import InterviewPrep from "../components/InterviewPrep";

const AIToolsPage = () => {
  const [selectedTool, setSelectedTool] = useState("matcher");

  const tools = [
    {
      id: "matcher",
      name: "AI Job Matcher",
      description: "Find jobs that match your skills perfectly",
      icon: Zap,
      component: <AIJobMatcher />,
    },
    {
      id: "resume",
      name: "Resume Analyzer",
      description: "Get your resume analyzed by AI with ATS scoring",
      icon: FileText,
      component: <ResumeAnalyzer />,
    },
    {
      id: "skills",
      name: "Skill Gap Analyzer",
      description: "Identify missing skills and create a learning path",
      icon: TrendingUp,
      component: <SkillGapAnalyzer />,
    },
    {
      id: "salary",
      name: "Salary Predictor",
      description: "Predict your salary based on role, experience, and location",
      icon: Briefcase,
      component: <SalaryPredictor />,
    },
    {
      id: "interview",
      name: "Interview Prep",
      description: "Get interview questions and preparation tips",
      icon: BookOpen,
      component: <InterviewPrep />,
    },
  ];

  const currentTool = tools.find((tool) => tool.id === selectedTool);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <motion.section
        className="glass-card relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(8,145,178,0.14),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(29,78,216,0.10),transparent_34%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              AI Career Studio
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
              Professional AI tools for career decisions.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
              Switch between matching, resume feedback, skill planning, salary guidance, and interview preparation in one clean workspace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[32rem]">
            <div className="rounded-2xl border border-border bg-surface-soft px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Tools</p>
              <p className="mt-1 text-lg font-semibold text-text">5</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-soft px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Mode</p>
              <p className="mt-1 text-lg font-semibold text-text">Responsive</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-soft px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Focus</p>
              <p className="mt-1 text-lg font-semibold text-text">Career</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-soft px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">UX</p>
              <p className="mt-1 text-lg font-semibold text-text">Polished</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <motion.div
          className="glass-card p-4 sm:p-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-muted">
                Select a tool
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Each tool is designed to work well on both phones and large screens.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {tools.map((tool) => (
              <motion.button
                key={tool.id}
                variants={itemVariants}
                onClick={() => setSelectedTool(tool.id)}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  selectedTool === tool.id
                    ? "border-primary/30 bg-primary-soft shadow-card"
                    : "border-border bg-surface-soft hover:-translate-y-0.5 hover:border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      selectedTool === tool.id
                        ? "bg-primary text-white"
                        : "bg-white/70 text-primary dark:bg-surface-elevated"
                    }`}
                  >
                    <tool.icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-text">{tool.name}</h3>
                    <p className="mt-1 text-xs leading-5 text-text-muted">{tool.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentTool && (
            <motion.div
              key={currentTool.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="glass-card overflow-hidden p-4 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                    Active tool
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-text">{currentTool.name}</h2>
                </div>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  Ready
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                {currentTool.component}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <motion.section
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Zap size={20} />
          </div>
          <h3 className="text-base font-semibold text-text">Smart Matching</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            AI analyzes your profile and surfaces relevant roles with meaningful compatibility.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300">
            <FileText size={20} />
          </div>
          <h3 className="text-base font-semibold text-text">Resume Insights</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Get ATS-style feedback and clear improvements without clutter or fake scores.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-base font-semibold text-text">Skill Planning</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Identify gaps and get a clear learning path aligned to your target roles.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <Briefcase size={20} />
          </div>
          <h3 className="text-base font-semibold text-text">Salary Intelligence</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            See practical salary ranges based on role, experience, and market context.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5 sm:col-span-2 xl:col-span-1">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
            <BookOpen size={20} />
          </div>
          <h3 className="text-base font-semibold text-text">Interview Ready</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Practice with focused questions and preparation notes that are easy to follow on mobile.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5 sm:col-span-2 xl:col-span-1">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
            <ChevronRight size={20} />
          </div>
          <h3 className="text-base font-semibold text-text">Career Clarity</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Move from broad suggestions to a focused next step for your specific profile.
          </p>
        </motion.div>
      </motion.section>
    </main>
  );
};

export default AIToolsPage;