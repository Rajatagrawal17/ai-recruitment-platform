import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSavedJobs } from "../context/SavedJobsContext";
import { scoreResume, improveResumeSection } from "../services/api";
import { 
  extractJDKeywords, 
  checkCVKeywords,
  checkATSFormat 
} from '../utils/atsParser';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Brain,
  Check,
  ChevronRight,
  Briefcase,
  Layers,
  ArrowLeft,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";

const getMockScoreResult = (jd = "", cv = "", keywordScore = 70, formatScore = 80) => {
  const experienceScore = Math.floor(60 + Math.random() * 30);
  const educationScore = Math.floor(70 + Math.random() * 25);
  const achievementScore = Math.floor(65 + Math.random() * 30);
  return {
    experienceScore,
    educationScore,
    achievementScore,
    topStrengths: [
      "Quantifiable metrics in work experience (e.g. revenue, speedups)",
      "Strong alignment in frontend technology stacks",
      "Clear chronological format and standard font usage"
    ],
    criticalGaps: [
      "Missing Cloud Architecture experience (AWS/Azure)",
      "No mention of CI/CD pipeline automation",
      "Incomplete credentials for Agile/Scrum certifications"
    ],
    quickWins: [
      "Convert tables or multi-column grids to a linear single-column layout",
      "Add a professional summary at the top featuring matching job keywords",
      "Explicitly list certification names instead of abbreviations"
    ],
    verdict: "Strong matching candidate with minor structural adjustments needed for ATS screens.",
    rewriteSuggestion: "Add AWS Cloud optimization and CI/CD pipelines to your professional experience section."
  };
};

export default function ResumeScorePage() {
  const { savedJobs } = useSavedJobs();
  
  // Tabs and Inputs
  const [jobMode, setJobMode] = useState("saved"); // saved | custom
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const [cvMode, setCvMode] = useState("paste"); // paste | upload
  const [cvText, setCvText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [fileLoading, setFileLoading] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState(null);
  
  // Animated Score Ring & Verdict
  const [displayScore, setDisplayScore] = useState(0);
  
  // Section improver
  const [isImproving, setIsImproving] = useState(false);
  const [improvedText, setImprovedText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [lowestSection, setLowestSection] = useState(null);

  // HandlesSaved Job Select
  useEffect(() => {
    if (jobMode === "saved" && selectedJobId) {
      const job = savedJobs.find(j => j._id === selectedJobId);
      if (job) {
        setJobDescription(
          `Title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location || "Remote"}\n\nDescription:\n${job.description || ""}\n\nRequirements:\n${Array.isArray(job.requirements) ? job.requirements.join(", ") : (job.requirements || "")}`
        );
      }
    }
  }, [selectedJobId, jobMode, savedJobs]);

  // Handle File Upload & Extract
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type === "application/pdf") {
      try {
        setFileLoading(true);
        const { parsePDF } = await import("../utils/pdfParser");
        const res = await parsePDF(file);
        if (res.success && res.text) {
          setCvText(res.text);
          setUploadedFileName(file.name);
          toast.success(`PDF parsed successfully: ${res.pages} page(s)`);
        } else {
          toast.error("Failed to extract PDF text. Falling back to simple upload details.");
          setCvText(`Resume: ${file.name}\nSize: ${file.size} bytes`);
          setUploadedFileName(file.name);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error reading PDF file");
      } finally {
        setFileLoading(false);
      }
    } else if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCvText(e.target.result);
        setUploadedFileName(file.name);
        toast.success("TXT file loaded successfully");
      };
      reader.readAsText(file);
    } else {
      toast.error("Only PDF and TXT files are supported.");
    }
  };

  // Run ATS Scorer
  const handleScoreResume = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please provide a job description.");
      return;
    }
    if (!cvText.trim()) {
      toast.error("Please provide or upload your CV.");
      return;
    }

    setLoading(true);
    setResults(null);
    setLoadingStep(0);
    setImprovedText("");
    setLowestSection(null);

    // Simulate animated loading steps
    const stepsConfig = [500, 1000, 1500, 2000];
    let stepCount = 0;
    
    const stepIntervals = stepsConfig.map((duration, index) => {
      return setTimeout(() => {
        setLoadingStep(index + 1);
      }, stepsConfig.slice(0, index + 1).reduce((a, b) => a + b, 0));
    });

    try {
      // Step 1: Pre-extract keywords locally (no API)
      const jdKeywords = extractJDKeywords(jobDescription);
      const keywordResult = checkCVKeywords(cvText, jdKeywords.allKeywords);
      const formatResult = checkATSFormat(cvText);

      // Call Backend API
      const res = await scoreResume({ jobDescription, cvText, keywordResult, formatResult });
      const aiResult = res.data.data;
      
      // Step 3: Calculate final score using fixed rubric
      const finalScore = Math.round(
        (keywordResult.score * 0.40) +
        (aiResult.experienceScore * 0.25) +
        (aiResult.educationScore * 0.15) +
        (formatResult.formatScore * 0.10) +
        (aiResult.achievementScore * 0.10)
      );

      // Wait for animations to finish before showing results
      const totalTime = stepsConfig.reduce((a, b) => a + b, 0);
      setTimeout(() => {
        setResults({
          overallScore: finalScore,
          keywordScore: keywordResult.score,
          experienceScore: aiResult.experienceScore,
          educationScore: aiResult.educationScore,
          formatScore: formatResult.formatScore,
          achievementScore: aiResult.achievementScore,
          keywordsFound: keywordResult.found,
          keywordsMissing: keywordResult.missing,
          formatIssues: formatResult.issues,
          formatWarnings: formatResult.warnings,
          topStrengths: aiResult.topStrengths,
          criticalGaps: aiResult.criticalGaps,
          quickWins: aiResult.quickWins,
          verdict: aiResult.verdict,
          rewriteSuggestion: aiResult.rewriteSuggestion,
          atsFriendly: formatResult.issues.length === 0,
          provider: res.data.provider || "Claude AI"
        });
        setLoading(false);
      }, Math.max(0, totalTime - 500));

    } catch (err) {
      console.warn("Backend API error, falling back to local simulation", err);
      // Fallback
      setTimeout(() => {
        const jdKeywords = extractJDKeywords(jobDescription);
        const keywordResult = checkCVKeywords(cvText, jdKeywords.allKeywords);
        const formatResult = checkATSFormat(cvText);
        const mockResult = getMockScoreResult(jobDescription, cvText, keywordResult.score, formatResult.formatScore);
        const finalScore = Math.round(
          (keywordResult.score * 0.40) +
          (mockResult.experienceScore * 0.25) +
          (mockResult.educationScore * 0.15) +
          (formatResult.formatScore * 0.10) +
          (mockResult.achievementScore * 0.10)
        );
        setResults({
          overallScore: finalScore,
          keywordScore: keywordResult.score,
          experienceScore: mockResult.experienceScore,
          educationScore: mockResult.educationScore,
          formatScore: formatResult.formatScore,
          achievementScore: mockResult.achievementScore,
          keywordsFound: keywordResult.found,
          keywordsMissing: keywordResult.missing,
          formatIssues: formatResult.issues,
          formatWarnings: formatResult.warnings,
          topStrengths: mockResult.topStrengths,
          criticalGaps: mockResult.criticalGaps,
          quickWins: mockResult.quickWins,
          verdict: mockResult.verdict,
          rewriteSuggestion: mockResult.rewriteSuggestion,
          atsFriendly: formatResult.issues.length === 0,
          provider: "Mock AI (Fallback)"
        });
        setLoading(false);
      }, stepsConfig.reduce((a, b) => a + b, 0));
    }
  };

  // Count up score ring in center
  useEffect(() => {
    if (results) {
      let start = 0;
      const end = results.overallScore || 0;
      if (end === 0) {
        setDisplayScore(0);
        return;
      }
      const duration = 1200;
      const stepTime = Math.abs(Math.floor(duration / end));
      const timer = setInterval(() => {
        start += 1;
        setDisplayScore(start);
        if (start >= end) {
          clearInterval(timer);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [results]);

  // Section Improvement API Handler
  const handleImproveSection = async () => {
    if (!results) return;

    // Find the weakest section (minimum score) of experience, education, achievements
    const options = [
      { name: "Professional Experience", score: results.experienceScore },
      { name: "Education & Certifications", score: results.educationScore },
      { name: "Achievements & Impact", score: results.achievementScore }
    ];
    const weakest = options.reduce(
      (min, sec) => (sec.score < min.score ? sec : min),
      options[0]
    );

    setLowestSection(weakest);
    setIsImproving(true);
    setImprovedText("");

    // Look for heading match in CV text
    let originalSecText = "";
    const lines = cvText.split("\n");
    const headerIndex = lines.findIndex(line => {
      const trimmed = line.trim().toLowerCase();
      if (!trimmed) return false;
      return (
        trimmed.includes(weakest.name.split(" ")[0].toLowerCase()) ||
        weakest.name.toLowerCase().includes(trimmed)
      );
    });

    if (headerIndex !== -1) {
      originalSecText = lines.slice(headerIndex, headerIndex + 8).join("\n");
    }

    if (!originalSecText || !originalSecText.trim()) {
      originalSecText = `[Original ${weakest.name} content from CV text...]`;
    }
    
    setOriginalText(originalSecText);

    try {
      const res = await improveResumeSection({
        sectionName: weakest.name,
        currentText: originalSecText,
        jobDescription,
        keywordsMissing: results.keywordsMissing
      });

      const improved = res.data.data.improvedText;
      
      // Stream word by word
      const words = improved.split(" ");
      let cur = "";
      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          cur += words[i] + " ";
          setImprovedText(cur);
          i++;
        } else {
          clearInterval(interval);
          setIsImproving(false);
        }
      }, 40);

    } catch (err) {
      console.error(err);
      toast.error("Improvement generation failed");
      setIsImproving(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#34d399"; // Green
    if (score >= 50) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const stepsList = [
    "Reading your CV...",
    "Checking ATS compatibility...",
    "Comparing with job requirements...",
    "Generating insights..."
  ];

  return (
    <main className="min-h-screen bg-[#0A0F1E] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header section */}
        <header className="mb-8 rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#6366f1]/10 rounded-full blur-[100px]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
                <Brain size={12} className="text-[#6366f1] animate-pulse" />
                AI Tool Hub
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl gradient-text">ATS CV Scorer & Optimizer</h1>
              <p className="mt-2 text-sm text-[#94A3B8]">
                Instantly check your CV formatting alignment, analyze missing keywords, and rewrite low-score sections.
              </p>
            </div>
          </div>
        </header>

        {/* Two columns on desktop, single on mobile */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT 5 columns: Input panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm shadow-xl">
              <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-[#6366f1]" />
                1. Target Job Profile
              </h3>
              
              {/* Job Selector Tab Toggles */}
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl mb-4 text-xs font-medium">
                <button
                  onClick={() => setJobMode("saved")}
                  className={`py-2 rounded-lg text-center transition ${jobMode === "saved" ? "bg-[#6366f1] text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Saved Jobs
                </button>
                <button
                  onClick={() => setJobMode("custom")}
                  className={`py-2 rounded-lg text-center transition ${jobMode === "custom" ? "bg-[#6366f1] text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Custom Description
                </button>
              </div>

              {jobMode === "saved" ? (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Select Saved Job</label>
                  {savedJobs.length === 0 ? (
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center text-xs text-slate-400">
                      No saved jobs available. Go to the jobs browser to bookmark some roles.
                    </div>
                  ) : (
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0D1321] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
                    >
                      <option value="">-- Choose a Saved Job --</option>
                      {savedJobs.map(job => (
                        <option key={job._id} value={job._id}>
                          {job.title} - {job.company}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Paste Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    placeholder="Paste the full job requirements, skills, and details..."
                    className="w-full rounded-xl border border-white/10 bg-[#0D1321] p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#6366f1]"
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm shadow-xl">
              <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={16} className="text-[#6366f1]" />
                2. Your Curriculum Vitae (CV)
              </h3>

              {/* CV Selector Tab Toggles */}
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl mb-4 text-xs font-medium">
                <button
                  onClick={() => setCvMode("paste")}
                  className={`py-2 rounded-lg text-center transition ${cvMode === "paste" ? "bg-[#6366f1] text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Paste CV Text
                </button>
                <button
                  onClick={() => setCvMode("upload")}
                  className={`py-2 rounded-lg text-center transition ${cvMode === "upload" ? "bg-[#6366f1] text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Upload Resume
                </button>
              </div>

              {cvMode === "paste" ? (
                <div className="space-y-2">
                  <textarea
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    style={{ height: "400px" }}
                    placeholder="Copy and paste the plain text of your resume/CV here..."
                    className="w-full rounded-xl border border-white/10 bg-[#0D1321] p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#6366f1] resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    className={`rounded-xl border-2 border-dashed p-8 text-center transition relative ${
                      fileLoading ? "border-[#6366f1]/50 bg-[#6366f1]/5" : "border-white/10 hover:border-[#6366f1]/40"
                    }`}
                  >
                    {fileLoading ? (
                      <div className="space-y-3 py-6">
                        <Loader2 className="animate-spin mx-auto text-[#6366f1]" size={28} />
                        <p className="text-sm font-medium">Extracting text using PDFJS-dist...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="mx-auto text-slate-400" size={32} />
                        <div>
                          <p className="text-sm font-medium">Click to browse or drop your resume</p>
                          <p className="text-xs text-slate-500 mt-1">Supports PDF or plain TXT files</p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.txt"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {uploadedFileName && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-400">
                      <FileCheck size={16} />
                      <span className="font-medium truncate">{uploadedFileName}</span>
                      <span className="ml-auto text-[10px] bg-emerald-500/25 px-2 py-0.5 rounded-full">Extracted</span>
                    </div>
                  )}

                  {cvText && !fileLoading && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Preview parsed text ({cvText.length} chars)</span>
                      <div className="max-h-40 overflow-y-auto rounded-xl bg-[#0D1321] border border-white/5 p-3 text-[10px] text-slate-400 whitespace-pre-line leading-relaxed">
                        {cvText}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleScoreResume}
                disabled={loading || !cvText.trim() || !jobDescription.trim()}
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#06b6d4] hover:opacity-95 font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed text-white"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    Analyzing CV...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Score my CV
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT 7 columns: Results panel (empty until scored) */}
          <div className="lg:col-span-7">
            
            <AnimatePresence mode="wait">
              {/* Not Scored State */}
              {!loading && !results && (
                <motion.div
                  key="not-scored"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex flex-col items-center justify-center min-h-[70vh] rounded-2xl border border-white/5 bg-white/[0.01] px-6 py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-slate-400">
                    <Layers size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Resume Score Results</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Provide your CV contents and select your target job requirements on the left, then click "Score my CV" to start.
                  </p>
                </motion.div>
              )}

              {/* Loading State Checklist */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col justify-center min-h-[70vh] rounded-2xl border border-white/8 bg-white/[0.03] p-8 shadow-2xl"
                >
                  <div className="max-w-md mx-auto w-full space-y-6">
                    <div className="flex items-center gap-3">
                      <Loader2 size={24} className="animate-spin text-[#6366f1]" />
                      <h3 className="text-lg font-bold text-white">Scoring ATS Resume...</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Please wait. We are matching your skillset, education credentials, and work history milestones.
                    </p>

                    <div className="space-y-3.5 pt-4">
                      {stepsList.map((step, index) => {
                        const isDone = loadingStep > index;
                        const isActive = loadingStep === index;
                        return (
                          <div
                            key={step}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                              isDone
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : isActive
                                ? "bg-[#6366f1]/10 border-[#6366f1]/30 text-white"
                                : "bg-white/20 border-white/5 text-slate-500"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                            ) : isActive ? (
                              <Loader2 size={16} className="animate-spin text-[#6366f1] shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                            )}
                            <span className="text-xs font-medium">{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Results State */}
              {!loading && results && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  
                  {/* Top Stats: Score Ring & ATS Badge */}
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm flex flex-col md:flex-row items-center justify-around gap-6">
                    
                    {/* SCORE RING */}
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="transparent"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="10"
                          />
                          <motion.circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="transparent"
                            stroke={getScoreColor(results.overallScore)}
                            strokeWidth="10"
                            strokeDasharray="440"
                            initial={{ strokeDashoffset: 440 }}
                            animate={{ strokeDashoffset: 440 - (440 * results.overallScore) / 100 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-extrabold text-white">{displayScore}</span>
                          <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Score</span>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-300 font-medium max-w-[200px] leading-relaxed italic">
                        &ldquo;{results.verdict}&rdquo;
                      </p>
                    </div>

                    {/* ATS BADGE */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">ATS Compatibility</span>
                        <div className="mt-2">
                          {results.atsFriendly ? (
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
                              <CheckCircle size={14} />
                              ATS Friendly
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400">
                              <AlertCircle size={14} />
                              ATS Issues Found
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                        <div>🏆 Provider: <span className="font-semibold text-slate-200">{results.provider || "Claude AI"}</span></div>
                        <div>📊 Threshold: <span className="text-emerald-400 font-medium">&gt;70 for safe screening</span></div>
                      </div>
                    </div>

                  </div>

                  {/* SECTIONS BREAKDOWN */}
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Category breakdown</h4>
                    
                    <div className="space-y-4 pt-1">
                      {[
                        { name: "Keywords match (40%)", score: results.keywordScore },
                        { name: "Work experience (25%)", score: results.experienceScore },
                        { name: "Education (15%)", score: results.educationScore },
                        { name: "Format / structure (10%)", score: results.formatScore },
                        { name: "Achievements (10%)", score: results.achievementScore },
                      ].map((section, idx) => (
                        <div key={section.name} className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-200">{section.name}</span>
                            <span style={{ color: getScoreColor(section.score) }}>{section.score}/100</span>
                          </div>
                          
                          {/* Progress bar with animated mount */}
                          <div className="h-2 overflow-hidden rounded-full bg-white/5 relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${section.score}%` }}
                              transition={{ duration: 1.2, delay: idx * 0.1, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: getScoreColor(section.score) }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FORMAT ISSUES */}
                  {results.formatIssues && results.formatIssues.length > 0 && (
                    <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 border-b border-red-500/10 pb-2">
                        <AlertCircle size={14} />
                        Format Issues Detected
                      </h4>
                      <div className="grid gap-2">
                        {results.formatIssues.map((issue, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-300">
                            <XCircle size={14} className="shrink-0 text-red-400 mt-0.5" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FORMAT WARNINGS */}
                  {results.formatWarnings && results.formatWarnings.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-amber-500/10 pb-2">
                        <AlertCircle size={14} />
                        Format Warnings
                      </h4>
                      <div className="grid gap-2">
                        {results.formatWarnings.map((warning, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-300">
                            <AlertCircle size={14} className="shrink-0 text-amber-400 mt-0.5" />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3 COLUMNS: STRENGTHS, GAPS, WINS */}
                  <div className="grid gap-5 md:grid-cols-3">
                    
                    {/* Strengths (Green Column) */}
                    <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4.5 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
                        <CheckCircle size={14} />
                        Top Strengths
                      </h5>
                      <ul className="space-y-3 text-[11px] text-slate-300 leading-relaxed">
                        {results.topStrengths.map((str, idx) => (
                          <li key={idx} className="flex gap-2">
                            <Check size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Critical Gaps (Red Column) */}
                    <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4.5 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 border-b border-red-500/10 pb-2">
                        <XCircle size={14} />
                        Critical Gaps
                      </h5>
                      <ul className="space-y-3 text-[11px] text-slate-300 leading-relaxed">
                        {results.criticalGaps.map((gap, idx) => (
                          <li key={idx} className="flex gap-2">
                            <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quick Wins (Blue Column) */}
                    <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4.5 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 border-b border-blue-500/10 pb-2">
                        <Zap size={14} />
                        Quick Wins
                      </h5>
                      <ul className="space-y-3 text-[11px] text-slate-300 leading-relaxed">
                        {results.quickWins.map((win, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-blue-400 font-bold shrink-0 mt-0.5">{idx + 1}.</span>
                            <span>{win}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* KEYWORDS */}
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">ATS Keyword Analysis</h4>
                    
                    {/* Found Keywords */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider block">Keywords Found ({results.keywordsFound.length})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {results.keywordsFound.map(kw => (
                          <span key={kw} className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-[10px] text-emerald-300">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missed Keywords */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider block">Keywords Missed ({results.keywordsMissing.length})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {results.keywordsMissing.map(kw => (
                          <div key={kw} className="group relative inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/25 px-2.5 py-1 text-[10px] text-red-300">
                            <span>{kw}</span>
                            <span className="text-[8px] bg-red-500/20 text-red-400 px-1 rounded hover:bg-red-500/30 cursor-help" title={`Add this keyword naturally to your CV text.`}>
                              Add to CV
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* IMPROVE BUTTON SECTION */}
                  <div className="rounded-2xl border border-dashed border-[#6366f1]/30 bg-[#6366f1]/5 p-5 backdrop-blur-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Optimize Weakest Section with AI</h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Our algorithms detected your lowest scoring section. Let AI rewrite it for optimal ATS scoring.
                        </p>
                      </div>
                      <button
                        onClick={handleImproveSection}
                        disabled={isImproving}
                        className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-5 py-2.5 text-xs font-semibold text-white flex items-center gap-1.5 shrink-0 transition hover:opacity-95 disabled:opacity-40"
                      >
                        {isImproving ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Improving...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={12} />
                            Rewrite weakest section
                          </>
                        )}
                      </button>
                    </div>

                    {/* Before / After Comparison */}
                    <AnimatePresence>
                      {lowestSection && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-3 border-t border-white/5 overflow-hidden"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300">Weakest Section: <span className="text-[#a5b4fc]">{lowestSection.name}</span></span>
                            <span className="text-red-400 font-medium">Score: {lowestSection.score}/100</span>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2 text-[11px]">
                            {/* Before column */}
                            <div className="rounded-xl border border-white/5 bg-white/4 p-3.5 space-y-2">
                              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider block">Before</span>
                              <div className="text-slate-400 whitespace-pre-line leading-relaxed font-mono">
                                {originalText}
                              </div>
                            </div>

                            {/* After column with streaming */}
                            <div className="rounded-xl border border-[#6366f1]/20 bg-[#6366f1]/10 p-3.5 space-y-2">
                              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">AI Improved Version</span>
                              <div className="text-slate-200 whitespace-pre-line leading-relaxed font-mono">
                                {improvedText || (isImproving ? "Streaming improved layout..." : "Press Rewrite to generate optimization...")}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </main>
  );
}
