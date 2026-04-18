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
      color: "from-blue-500 to-cyan-500",
      bgColor: "rgba(59, 130, 246, 0.1)",
      component: <AIJobMatcher />,
    },
    {
      id: "resume",
      name: "Resume Analyzer",
      description: "Get your resume analyzed by AI with ATS scoring",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      bgColor: "rgba(147, 51, 234, 0.1)",
      component: <ResumeAnalyzer />,
    },
    {
      id: "skills",
      name: "Skill Gap Analyzer",
      description: "Identify missing skills and create a learning path",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "rgba(34, 197, 94, 0.1)",
      component: <SkillGapAnalyzer />,
    },
    {
      id: "salary",
      name: "Salary Predictor",
      description: "Predict your salary based on role, experience, and location",
      icon: Briefcase,
      color: "from-orange-500 to-red-500",
      bgColor: "rgba(249, 115, 22, 0.1)",
      component: <SalaryPredictor />,
    },
    {
      id: "interview",
      name: "Interview Prep",
      description: "Get interview questions and preparation tips",
      icon: BookOpen,
      color: "from-indigo-500 to-blue-500",
      bgColor: "rgba(99, 102, 241, 0.1)",
      component: <InterviewPrep />,
    },
  ];

  const currentTool = tools.find((tool) => tool.id === selectedTool);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      {/* Header */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          🤖 AI-Powered Tools
        </h1>
        <p className="text-lg text-slate-400">
          Leverage artificial intelligence to advance your career
        </p>
      </motion.div>

      <div className="mx-auto max-w-7xl">
        {/* Tool Selector */}
        <motion.div
          className="mb-12 grid gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            {tools.map((tool) => (
              <motion.button
                key={tool.id}
                variants={itemVariants}
                onClick={() => setSelectedTool(tool.id)}
                className={`group relative overflow-hidden rounded-lg p-4 transition-all duration-300 ${
                  selectedTool === tool.id
                    ? "ring-2 ring-offset-2 ring-offset-slate-900"
                    : "hover:shadow-lg"
                }`}
                style={{
                  background:
                    selectedTool === tool.id
                      ? `linear-gradient(135deg, ${tool.color})`
                      : tool.bgColor,
                }}
              >
                <div className="relative z-10">
                  <tool.icon
                    className={`mb-2 size-6 ${
                      selectedTool === tool.id ? "text-white" : "text-blue-400"
                    }`}
                  />
                  <h3
                    className={`text-sm font-bold ${
                      selectedTool === tool.id ? "text-white" : "text-slate-200"
                    }`}
                  >
                    {tool.name}
                  </h3>
                  <p
                    className={`text-xs ${
                      selectedTool === tool.id ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {tool.description}
                  </p>
                </div>

                {/* Animated background glow */}
                {selectedTool === tool.id && (
                  <motion.div
                    className="absolute inset-0 -z-10 opacity-0"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      background: `linear-gradient(135deg, ${tool.color})`,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tool Display Area */}
        <AnimatePresence mode="wait">
          {currentTool && (
            <motion.div
              key={currentTool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {currentTool.component}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Info Section */}
        <motion.div
          className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-6"
          >
            <div className="mb-4 inline-block rounded-lg bg-blue-500/20 p-3">
              <Zap className="text-blue-400" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Smart Matching</h3>
            <p className="text-slate-400">
              AI analyzes your skills and finds jobs with 60%+ compatibility
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6"
          >
            <div className="mb-4 inline-block rounded-lg bg-purple-500/20 p-3">
              <FileText className="text-purple-400" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Resume Insights</h3>
            <p className="text-slate-400">
              Get authentic ATS scoring and actionable improvement suggestions
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6"
          >
            <div className="mb-4 inline-block rounded-lg bg-green-500/20 p-3">
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Skill Planning</h3>
            <p className="text-slate-400">
              Identify gaps and get personalized learning recommendations
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-6"
          >
            <div className="mb-4 inline-block rounded-lg bg-orange-500/20 p-3">
              <Briefcase className="text-orange-400" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Salary Intelligence</h3>
            <p className="text-slate-400">
              Predict salary ranges based on role, experience, and market trends
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 p-6"
          >
            <div className="mb-4 inline-block rounded-lg bg-indigo-500/20 p-3">
              <BookOpen className="text-indigo-400" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Interview Ready</h3>
            <p className="text-slate-400">
              AI-generated questions and personalized preparation tips
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-6"
          >
            <div className="mb-4 inline-block rounded-lg bg-cyan-500/20 p-3">
              <ChevronRight className="text-cyan-400" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Powered by Claude AI</h3>
            <p className="text-slate-400">
              Enterprise-grade AI analysis for authentic, accurate results
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-12 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-2 text-2xl font-bold text-white">
            Ready to Transform Your Career?
          </h3>
          <p className="mb-6 text-slate-300">
            Use our AI tools to get matched with perfect jobs, improve your resume, and
            ace interviews
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/50"
          >
            Start Using AI Tools
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default AIToolsPage;
