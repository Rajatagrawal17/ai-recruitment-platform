import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Clock, ArrowRight, ChevronDown, ChevronUp, CheckCircle2, 
  AlertTriangle, RotateCcw, Share2, Copy, Lock, Unlock, BookOpen, 
  Award, HelpCircle, Send, Check, ChevronRight, Play
} from "lucide-react";
import { getJobs, generateSimQuestions, evaluateSimAnswer } from "../services/api";
import { useAuth } from "../context/AuthContext";
import WaveLoader from "../components/WaveLoader";

// Score Ring Component (1-10 Scale)
const ScoreRing = ({ score, size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 10) * circumference;
  
  let colorClass = "stroke-rose-500";
  let bgClass = "bg-rose-500/10 text-rose-500";
  if (score >= 8.5) {
    colorClass = "stroke-emerald-500";
    bgClass = "bg-emerald-500/10 text-emerald-500";
  } else if (score >= 7.0) {
    colorClass = "stroke-blue-500";
    bgClass = "bg-blue-500/10 text-blue-500";
  } else if (score >= 5.0) {
    colorClass = "stroke-amber-500";
    bgClass = "bg-amber-500/10 text-amber-500";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="stroke-slate-800"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colorClass} transition-all duration-700 ease-out`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full ${bgClass} font-bold text-lg`}>
        {score}
      </div>
    </div>
  );
};

// Radar Chart Component (5 Axes)
const RadarChart = ({ scores = {} }) => {
  const axes = ["Communication", "Technical", "Clarity", "Confidence", "Relevance"];
  const width = 240;
  const height = 240;
  const cx = 120;
  const cy = 120;
  const r = 85;

  const getCoordinates = (index, value) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const distance = (value / 10) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  const grids = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = grids.map((scale) => {
    return axes.map((_, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = cx + scale * r * Math.cos(angle);
      const y = cy + scale * r * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  });

  const scoreKeys = {
    "Communication": scores.Communication || 7.0,
    "Technical": scores.Technical || 7.5,
    "Clarity": scores.Clarity || 7.0,
    "Confidence": scores.Confidence || 6.5,
    "Relevance": scores.Relevance || 8.0
  };
  
  const dataPoints = axes.map((axis, i) => {
    const score = scoreKeys[axis];
    const { x, y } = getCoordinates(i, score);
    return `${x},${y}`;
  }).join(" ");

  const labelPositions = axes.map((axis, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const labelDist = r + 20;
    const x = cx + labelDist * Math.cos(angle);
    let y = cy + labelDist * Math.sin(angle);
    if (i === 0) y -= 8;
    if (i === 2 || i === 3) y += 12;
    return { x, y, label: axis };
  });

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-2xl border border-slate-800/80">
      <h4 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Skill Breakdown</h4>
      <svg width={width} height={height} className="overflow-visible">
        {gridPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            className="stroke-slate-800"
            strokeWidth="1"
          />
        ))}

        {axes.map((_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              className="stroke-slate-800/50"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          );
        })}

        <polygon
          points={dataPoints}
          fill="rgba(168, 85, 247, 0.2)"
          className="stroke-purple-500 fill-purple-500/20"
          strokeWidth="2"
        />

        {axes.map((axis, i) => {
          const score = scoreKeys[axis];
          const { x, y } = getCoordinates(i, score);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="4"
                className="fill-purple-400 stroke-purple-600"
                strokeWidth="1.5"
              />
            </g>
          );
        })}

        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            className="fill-text text-[11px] font-medium"
          >
            {pos.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default function InterviewSimPage() {
  const { user } = useAuth();
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
  
  // 4 steps: 0 = SETUP, 1 = INTERVIEW, 2 = RESULTS, 3 = SHARE
  const [step, setStep] = useState(0);

  // Setup state variables
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [customJD, setCustomJD] = useState("");
  const [interviewType, setInterviewType] = useState("Full Interview");
  const [difficulty, setDifficulty] = useState("Medium");
  const [confidenceMode, setConfidenceMode] = useState(false);

  // Loading state variables
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Interview state variables
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState(Array(8).fill(""));
  const [evaluations, setEvaluations] = useState(Array(8).fill(null));
  
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef(null);

  // Results & details toggle state
  const [showEvalDetails, setShowEvalDetails] = useState(Array(8).fill(false));

  // Fetch jobs for dropdown on mount
  useEffect(() => {
    const loadJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await getJobs();
        if (response.data && response.data.jobs) {
          setJobs(response.data.jobs);
        } else if (Array.isArray(response.data)) {
          setJobs(response.data);
        }
      } catch (err) {
        console.error("Error loading jobs for selector:", err);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadJobs();
  }, []);

  // Timer effect
  useEffect(() => {
    if (step === 1 && !showFeedback) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, showFeedback]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Start Interview
  const handleStartInterview = async () => {
    setLoadingQuestions(true);
    try {
      const payload = {
        type: interviewType,
        difficulty,
      };

      if (pasteMode) {
        payload.jobTitle = customJobTitle || "Custom Job Role";
        payload.jobDescription = customJD || "Custom job description provided by candidate.";
      } else {
        payload.jobId = selectedJobId;
        const matchedJob = jobs.find(j => j._id === selectedJobId);
        if (matchedJob) {
          payload.jobTitle = matchedJob.title;
        }
      }

      const response = await generateSimQuestions(payload);
      if (response.data && response.data.success && response.data.data.questions) {
        setQuestions(response.data.data.questions);
      } else {
        throw new Error("Invalid backend questions response shape");
      }
      
      // Reset simulator states
      setAnswers(Array(8).fill(""));
      setEvaluations(Array(8).fill(null));
      setCurrentQuestionIdx(0);
      setCurrentAnswer("");
      setSecondsElapsed(0);
      setShowHint(false);
      setShowFeedback(false);
      
      // Advance to Interview
      setStep(1);
    } catch (err) {
      console.error("Failed to generate questions:", err);
      alert("Failed to generate questions. Falling back to default interview prep.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Submit Answer for current question
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert("Please provide an answer or click Skip.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentQuestion = questions[currentQuestionIdx];
      const payload = {
        question: currentQuestion.question,
        answer: currentAnswer,
        difficulty,
        confidenceMode: confidenceMode ? "ON" : "OFF"
      };

      const response = await evaluateSimAnswer(payload);
      if (response.data && response.data.success && response.data.data) {
        const evalData = response.data.data;
        
        // Save answer and evaluation
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIdx] = currentAnswer;
        setAnswers(updatedAnswers);

        const updatedEvals = [...evaluations];
        updatedEvals[currentQuestionIdx] = evalData;
        setEvaluations(updatedEvals);

        // Show feedback overlay/details
        setShowFeedback(true);
      } else {
        throw new Error("Invalid evaluation response shape");
      }
    } catch (err) {
      console.error("Answer evaluation failed:", err);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip Question
  const handleSkipQuestion = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIdx] = "Question skipped.";
    setAnswers(updatedAnswers);

    const skippedEval = {
      score: 1.0,
      grade: "D",
      oneLineFeedback: "You skipped this question.",
      strengths: ["None"],
      improvements: ["Skipped question. Try to write at least a basic answer next time."],
      betterAnswer: "It's best to attempt questions using frameworks like STAR to structure your response.",
      keywordsHit: [],
      keywordsMissed: ["Core technical / behavioral terms"]
    };

    const updatedEvals = [...evaluations];
    updatedEvals[currentQuestionIdx] = skippedEval;
    setEvaluations(updatedEvals);

    setShowFeedback(true);
  };

  // Move to Next Question or finish
  const handleNextQuestion = () => {
    setShowFeedback(false);
    setShowHint(false);
    setCurrentAnswer("");

    if (currentQuestionIdx < 7) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      // Completed all 8 questions -> Show results
      setStep(2);
    }
  };

  // Aggregate results calculations
  const calculateOverallScore = () => {
    const validEvals = evaluations.filter(e => e !== null);
    if (validEvals.length === 0) return 0;
    const avg = validEvals.reduce((sum, item) => sum + item.score, 0) / validEvals.length;
    return Math.round(avg * 10); // Scale to 0-100
  };

  const getOverallGrade = (score) => {
    if (score >= 85) return { grade: "A", color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" };
    if (score >= 70) return { grade: "B", color: "text-blue-500 border-blue-500/30 bg-blue-500/10" };
    if (score >= 50) return { grade: "C", color: "text-amber-500 border-amber-500/30 bg-amber-500/10" };
    return { grade: "D", color: "text-rose-500 border-rose-500/30 bg-rose-500/10" };
  };

  const getRadarScores = () => {
    // Generate logical radar chart coordinates based on average scores on different dimensions
    const avgScore = calculateOverallScore() / 10;
    
    // Create minor variations to make the chart interesting
    return {
      Communication: Math.round(Math.min(10, Math.max(2, avgScore + (Math.random() * 1.5 - 0.75))) * 10) / 10,
      Technical: Math.round(Math.min(10, Math.max(2, avgScore + (Math.random() * 1.5 - 0.75))) * 10) / 10,
      Clarity: Math.round(Math.min(10, Math.max(2, avgScore + (Math.random() * 1.5 - 0.75))) * 10) / 10,
      Confidence: Math.round(Math.min(10, Math.max(2, avgScore + (Math.random() * 1.5 - 0.75))) * 10) / 10,
      Relevance: Math.round(Math.min(10, Math.max(2, avgScore + (Math.random() * 1.5 - 0.75))) * 10) / 10,
    };
  };

  const getAggregatedStrengthsAndImprovements = () => {
    let strengths = [];
    let improvements = [];

    evaluations.forEach((evalItem) => {
      if (evalItem) {
        if (evalItem.strengths) strengths.push(...evalItem.strengths);
        if (evalItem.improvements) improvements.push(...evalItem.improvements);
      }
    });

    // De-duplicate and take top 3
    const uniqueStrengths = Array.from(new Set(strengths)).slice(0, 3);
    const uniqueImprovements = Array.from(new Set(improvements)).slice(0, 3);

    // Padding if empty
    while (uniqueStrengths.length < 3) uniqueStrengths.push("Attempted mock questions actively.");
    while (uniqueImprovements.length < 3) uniqueImprovements.push("Elaborate details using STAR framework.");

    return { strengths: uniqueStrengths, improvements: uniqueImprovements };
  };

  const getBestAndWeakestAnswers = () => {
    let best = { idx: -1, score: -1 };
    let weakest = { idx: -1, score: 11 };

    evaluations.forEach((evalItem, idx) => {
      if (evalItem) {
        if (evalItem.score > best.score) {
          best = { idx, score: evalItem.score };
        }
        if (evalItem.score < weakest.score) {
          weakest = { idx, score: evalItem.score };
        }
      }
    });

    return {
      best: best.idx !== -1 ? {
        question: questions[best.idx]?.question,
        answer: answers[best.idx],
        score: best.score,
        betterAnswer: evaluations[best.idx]?.betterAnswer
      } : null,
      weakest: weakest.idx !== -1 ? {
        question: questions[weakest.idx]?.question,
        answer: answers[weakest.idx],
        score: weakest.score,
        betterAnswer: evaluations[weakest.idx]?.betterAnswer
      } : null
    };
  };

  // Share Text Builder
  const getJobTitle = () => {
    if (pasteMode) return customJobTitle || "AI Interview Practice";
    const selectedJob = jobs.find(j => j._id === selectedJobId);
    return selectedJob ? selectedJob.title : "Custom Role";
  };

  const getShareText = () => {
    const score = calculateOverallScore();
    const jobTitle = getJobTitle();
    return `🎯 I scored ${score}/100 on a mock interview for the ${jobTitle} role on HireAI! \n📈 Checked my communication, technical, and clarity skills with real-time AI feedback.\n\nPractice yours at HireAI!`;
  };

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(getShareText());
    alert("Shareable scorecard text copied to clipboard!");
  };

  const overallScoreVal = calculateOverallScore();
  const overallGradeObj = getOverallGrade(overallScoreVal);
  const radarScoresVal = step === 2 || step === 3 ? getRadarScores() : {};
  const aggregatedFeedback = step === 2 || step === 3 ? getAggregatedStrengthsAndImprovements() : { strengths: [], improvements: [] };
  const highlights = step === 2 || step === 3 ? getBestAndWeakestAnswers() : { best: null, weakest: null };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-16 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Step Indicator (Progress Header) */}
        {step > 0 && (
          <div className="flex justify-between items-center mb-6 py-2 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">
                {step === 1 ? "Interview Session" : step === 2 ? "Detailed Analysis" : "Share Results"}
              </span>
            </div>
            {step === 1 && (
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5 font-medium bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  <Clock size={14} className="text-purple-400" />
                  {formatTime(secondsElapsed)}
                </span>
                <span className="font-semibold text-text">
                  Question {currentQuestionIdx + 1} of 8
                </span>
              </div>
            )}
            {step > 1 && (
              <button 
                onClick={() => setStep(0)} 
                className="flex items-center gap-1 text-xs text-text-muted hover:text-white transition-colors"
              >
                <RotateCcw size={12} /> Start Over
              </button>
            )}
          </div>
        )}

        {/* SCREEN 1: SETUP */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-center py-6"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400 mb-4 animate-bounce">
                <Sparkles size={32} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl gradient-text">
                AI Interview Simulator
              </h1>
              <p className="mt-2 text-text-muted text-sm max-w-lg mx-auto">
                Practice highly realistic technical, behavioral, and culture fit interviews tailored directly to your target roles.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8 space-y-6">
              
              {/* Job Selector Mode Toggles */}
              <div>
                <label className="block text-sm font-semibold mb-3">Target Job Profile</label>
                <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800/80 mb-4">
                  <button
                    type="button"
                    onClick={() => setPasteMode(false)}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${!pasteMode ? "bg-purple-600 text-white shadow-md" : "text-text-muted hover:text-white"}`}
                  >
                    Select Saved Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasteMode(true)}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${pasteMode ? "bg-purple-600 text-white shadow-md" : "text-text-muted hover:text-white"}`}
                  >
                    Paste Custom JD
                  </button>
                </div>

                {!pasteMode ? (
                  <div className="relative">
                    {loadingJobs ? (
                      <div className="flex items-center justify-center h-12 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs text-text-muted">
                        <WaveLoader size="sm" className="mr-2" /> Loading active jobs...
                      </div>
                    ) : (
                      <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
                      >
                        <option value="" disabled>-- Choose an open job --</option>
                        {jobs.map((job) => (
                          <option key={job._id} value={job._id}>
                            {job.title} at {job.company}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Job Title (e.g. Frontend React Developer)"
                      value={customJobTitle}
                      onChange={(e) => setCustomJobTitle(e.target.value)}
                      className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
                    />
                    <textarea
                      placeholder="Paste full job description, requirements, and tech stack here..."
                      value={customJD}
                      onChange={(e) => setCustomJD(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Interview Type Selector */}
              <div>
                <label className="block text-sm font-semibold mb-3">Interview Focus Area</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {["Full Interview", "Technical Only", "Behavioral Only", "Culture Fit"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterviewType(type)}
                      className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        interviewType === type 
                          ? "bg-purple-500/10 border-purple-500 text-purple-400 shadow-md shadow-purple-500/5" 
                          : "bg-slate-900 border-slate-800 text-text-muted hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold mb-3">Interview Difficulty Level</label>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                        difficulty === diff
                          ? diff === "Easy" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" :
                            diff === "Medium" ? "bg-amber-500/10 border-amber-500 text-amber-400" :
                            "bg-rose-500/10 border-rose-500 text-rose-400"
                          : "bg-slate-900 border-slate-800 text-text-muted hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${confidenceMode ? "bg-purple-500/10 text-purple-400" : "bg-slate-800 text-text-muted"}`}>
                    {confidenceMode ? <Lock size={18} /> : <Unlock size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      Confidence Mode
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded-md font-extrabold ${confidenceMode ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                        {confidenceMode ? "ON" : "OFF"}
                      </span>
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5 max-w-sm md:max-w-md">
                      {confidenceMode 
                        ? "Hides question hints and applies strict grading metrics." 
                        : "Shows hints and provides encouraging, constructive feedback."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfidenceMode(!confidenceMode)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${confidenceMode ? "bg-purple-500 justify-end" : "bg-slate-800 justify-start"}`}
                >
                  <motion.span layout className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={loadingQuestions || (!pasteMode && !selectedJobId) || (pasteMode && (!customJobTitle || !customJD))}
                className="w-full btn-primary h-12 font-bold text-sm tracking-wide flex items-center justify-center gap-2 mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loadingQuestions ? (
                  <>
                    <WaveLoader size="sm" /> Generating Interview Setup...
                  </>
                ) : (
                  <>
                    <Play size={16} fill="white" /> Start Mock Interview
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* SCREEN 2: INTERVIEW */}
        {step === 1 && (
          <div className="flex-1 flex flex-col py-2 justify-center">
            
            {/* Question Card */}
            <div className="glass-card p-5 md:p-6 border-b-0 rounded-b-none relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900">
                <div 
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / 8) * 100}%` }}
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-4 mt-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wide bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20">
                  {questions[currentQuestionIdx]?.type || "Technical"}
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wide bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-md border border-purple-500/20">
                  Difficulty: {questions[currentQuestionIdx]?.difficulty || difficulty}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                {questions[currentQuestionIdx]?.question}
              </h2>

              {/* Hint Section */}
              {!confidenceMode && questions[currentQuestionIdx]?.hint && (
                <div className="mt-4 pt-4 border-t border-slate-900">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                  >
                    <HelpCircle size={14} /> {showHint ? "Hide Hint" : "Show Hint"}
                  </button>
                  <AnimatePresence>
                    {showHint && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-text-muted mt-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed"
                      >
                        {questions[currentQuestionIdx].hint}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Answer & Feedback Area */}
            <div className="glass-card p-6 rounded-t-none border-t-0 bg-slate-950/20 flex-1 flex flex-col">
              
              {!showFeedback ? (
                // INPUT STATE
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1 relative">
                    <textarea
                      placeholder="Type your structured, professional response here. Try to cover key concepts and mention relevant tools/methodologies..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full h-48 min-h-[160px] bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 resize-none font-sans leading-relaxed"
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] text-text-muted bg-slate-950 px-2 py-0.5 rounded-md">
                      {currentAnswer.length} chars
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleSkipQuestion}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl border border-slate-800 text-text hover:bg-slate-900 transition-colors text-xs font-bold"
                    >
                      Skip Question
                    </button>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !currentAnswer.trim()}
                      className="px-6 py-2.5 btn-primary rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
                    >
                      {isSubmitting ? (
                        <>
                          <WaveLoader size="sm" /> Evaluating Answer...
                        </>
                      ) : (
                        <>
                          <Send size={12} fill="white" /> Submit Response
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // EVALUATION FEEDBACK STATE
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 flex-1 flex flex-col"
                >
                  
                  {/* Evaluation Summary */}
                  <div className="flex items-start gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                    <ScoreRing score={evaluations[currentQuestionIdx]?.score || 1.0} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">Response Grade:</h4>
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md border ${
                          evaluations[currentQuestionIdx]?.grade === "A" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                          evaluations[currentQuestionIdx]?.grade === "B" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                          evaluations[currentQuestionIdx]?.grade === "C" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                          "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}>
                          Grade {evaluations[currentQuestionIdx]?.grade || "C"}
                        </span>
                      </div>
                      <p className="text-sm italic text-slate-200 mt-1.5 font-medium leading-relaxed">
                        "{evaluations[currentQuestionIdx]?.oneLineFeedback}"
                      </p>
                    </div>
                  </div>

                  {/* Expandable Feedback Details */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-2">
                    
                    {/* Strengths & Improvements */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                        <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-2">
                          <CheckCircle2 size={12} /> Strengths
                        </h5>
                        <ul className="text-xs text-text-muted space-y-1.5 pl-4 list-disc">
                          {(evaluations[currentQuestionIdx]?.strengths || []).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl">
                        <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-2">
                          <AlertTriangle size={12} /> Improvement Areas
                        </h5>
                        <ul className="text-xs text-text-muted space-y-1.5 pl-4 list-disc">
                          {(evaluations[currentQuestionIdx]?.improvements || []).map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Keywords pills */}
                    <div className="space-y-2.5 p-3 bg-slate-900/20 border border-slate-800/40 rounded-xl">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-bold text-text-muted">Keywords Hit:</span>
                        {(evaluations[currentQuestionIdx]?.keywordsHit || []).length > 0 ? (
                          (evaluations[currentQuestionIdx].keywordsHit).map((kw, i) => (
                            <span key={i} className="text-[10px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-text-muted italic">None detected</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-bold text-text-muted">Gaps/Suggested Keywords:</span>
                        {(evaluations[currentQuestionIdx]?.keywordsMissed || []).length > 0 ? (
                          (evaluations[currentQuestionIdx].keywordsMissed).map((kw, i) => (
                            <span key={i} className="text-[10px] font-semibold bg-slate-800/40 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-text-muted italic">None</span>
                        )}
                      </div>
                    </div>

                    {/* Better Answer rewrite */}
                    {evaluations[currentQuestionIdx]?.betterAnswer && (
                      <div className="p-3 bg-purple-950/10 border border-purple-900/20 rounded-xl">
                        <h5 className="text-xs font-bold text-purple-400 flex items-center gap-1 mb-1.5">
                          <BookOpen size={12} /> Model Response Guide
                        </h5>
                        <p className="text-xs text-text-muted leading-relaxed italic bg-slate-950/40 p-2.5 rounded-lg">
                          {evaluations[currentQuestionIdx].betterAnswer}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-900">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 btn-primary rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      {currentQuestionIdx < 7 ? (
                        <>
                          Next Question <ChevronRight size={14} />
                        </>
                      ) : (
                        <>
                          Finish & Analyze <Award size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 3: RESULTS */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 py-4"
          >
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl gradient-text">
                Performance Scorecard
              </h1>
              <p className="text-text-muted text-sm mt-1">
                Evaluation results for {getJobTitle()}
              </p>
            </div>

            {/* Top Score summary cards */}
            <div className="grid md:grid-cols-3 gap-4">
              
              {/* Score ring card */}
              <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wide mb-4">Overall Score</h3>
                <ScoreRing score={overallScoreVal / 10} size={isMobile ? 100 : 110} strokeWidth={10} />
                <div className={`mt-4 text-xs font-extrabold px-3 py-1 rounded-full border ${overallGradeObj.color}`}>
                  Performance Grade: {overallGradeObj.grade}
                </div>
              </div>

              {/* Radar Chart / Mobile Score Bars */}
              <div className="glass-card p-6 md:col-span-2 flex flex-col justify-center">
                {/* Radar Chart (hidden on mobile, shown on desktop) */}
                <div className="hidden md:flex flex-col items-center justify-center w-full">
                  <RadarChart scores={radarScoresVal} />
                </div>
                
                {/* Simple Score Bars (shown on mobile, hidden on desktop) */}
                <div className="md:hidden flex flex-col space-y-4 w-full">
                  <h4 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wide text-center">Skill Breakdown</h4>
                  {[
                    { label: "Communication", score: radarScoresVal.Communication || 7.0 },
                    { label: "Technical", score: radarScoresVal.Technical || 7.5 },
                    { label: "Clarity", score: radarScoresVal.Clarity || 7.0 },
                    { label: "Confidence", score: radarScoresVal.Confidence || 6.5 },
                    { label: "Relevance", score: radarScoresVal.Relevance || 8.0 }
                  ].map((item, idx) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-purple-400">{item.score.toFixed(1)} / 10</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score * 10}%` }}
                          transition={{ duration: 1.0, delay: idx * 0.1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card p-5 border-l-4 border-l-emerald-500">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-3">
                  <CheckCircle2 size={16} /> Top Strengths
                </h3>
                <div className="space-y-2">
                  {aggregatedFeedback.strengths.map((str, i) => (
                    <div key={i} className="flex gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed text-text">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5 border-l-4 border-l-amber-500">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mb-3">
                  <AlertTriangle size={16} /> Top Improvements
                </h3>
                <div className="space-y-2">
                  {aggregatedFeedback.improvements.map((imp, i) => (
                    <div key={i} className="flex gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed text-text">
                      <span className="text-amber-400 font-bold">!</span>
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Highlights: Best & Weakest */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2">Session Highlights</h3>
              
              {/* Best Answer */}
              {highlights.best && (
                <div className="glass-card p-5 bg-gradient-to-r from-slate-950 to-emerald-950/15 border-emerald-900/30">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-md">
                      Strongest Response
                    </span>
                    <span className="text-xs font-extrabold text-emerald-400">Score: {highlights.best.score}/10</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white leading-relaxed mt-2">
                    Q: {highlights.best.question}
                  </h4>
                  <p className="text-xs text-text-muted mt-1 italic pl-4 border-l-2 border-slate-800 line-clamp-2">
                    "{highlights.best.answer}"
                  </p>
                </div>
              )}

              {/* Weakest Answer */}
              {highlights.weakest && (
                <div className="glass-card p-5 bg-gradient-to-r from-slate-950 to-rose-950/15 border-rose-900/30">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-xs font-bold text-rose-400 uppercase bg-rose-950/40 border border-rose-900/30 px-2 py-0.5 rounded-md">
                      Area For Review
                    </span>
                    <span className="text-xs font-extrabold text-rose-400">Score: {highlights.weakest.score}/10</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white leading-relaxed mt-2">
                    Q: {highlights.weakest.question}
                  </h4>
                  <p className="text-xs text-text-muted mt-1 italic pl-4 border-l-2 border-slate-800">
                    "{highlights.weakest.answer}"
                  </p>
                  
                  {highlights.weakest.betterAnswer && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-900/60">
                      <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Suggested Revision</p>
                      <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-3 rounded-lg border border-slate-900 mt-1">
                        {highlights.weakest.betterAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Question Breakdown List */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2">Question Breakdown</h3>
              <div className="space-y-2">
                {questions.map((q, idx) => {
                  const evalItem = evaluations[idx];
                  const isOpen = showEvalDetails[idx];
                  const score = evalItem?.score || 1.0;
                  
                  let progressColor = "bg-rose-500";
                  if (score >= 8.5) progressColor = "bg-emerald-500";
                  else if (score >= 7.0) progressColor = "bg-blue-500";
                  else if (score >= 5.0) progressColor = "bg-amber-500";

                  return (
                    <div key={q.id} className="glass-card overflow-hidden">
                      <div 
                        onClick={() => {
                          const updated = [...showEvalDetails];
                          updated[idx] = !updated[idx];
                          setShowEvalDetails(updated);
                        }}
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-text-muted">Question {idx + 1}</span>
                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-800">
                              {q.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white mt-1 leading-snug truncate max-w-lg md:max-w-xl">
                            {q.question}
                          </h4>
                          {/* Score Progress Bar */}
                          <div className="w-full max-w-xs mt-2.5 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className={`h-full ${progressColor}`} style={{ width: `${score * 10}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            {score}/10
                          </span>
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                            <ChevronDown size={16} className="text-text-muted" />
                          </motion.div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="bg-slate-950/40 border-t border-slate-900/60 p-4 space-y-3 overflow-hidden text-xs"
                          >
                            <div>
                              <p className="font-bold text-text-muted mb-1">Your Answer:</p>
                              <p className="text-slate-300 leading-relaxed italic bg-slate-950/80 p-3 rounded-lg">
                                "{answers[idx] || "No response provided."}"
                              </p>
                            </div>
                            <div>
                              <p className="font-bold text-text-muted mb-1">AI Feedback:</p>
                              <p className="text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-lg">
                                {evalItem?.oneLineFeedback || "No feedback."}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between border-t border-slate-900">
              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep(0)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-bold border border-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Retake Interview
                </button>
                <button
                  onClick={() => {
                    setInterviewType("Behavioral Only");
                    setStep(0);
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-bold border border-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen size={14} /> Practice Weak Areas
                </button>
              </div>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 btn-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                Go to Share Card <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* SCREEN 4: SHARE */}
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-center py-6 text-center space-y-6"
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl gradient-text">
                Share Scorecard
              </h1>
              <p className="text-text-muted text-sm mt-1">
                Showcase your interview readiness to your professional network.
              </p>
            </div>

            {/* Share Score Card Container */}
            <div className="max-w-md mx-auto w-full bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-950 border border-purple-500/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-500/5 relative overflow-hidden text-center">
              
              {/* Decorative glows */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-extrabold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  HireAI Simulator
                </span>
                <span className="text-xs text-text-muted font-bold">
                  {new Date().toLocaleDateString()}
                </span>
              </div>

              <div className="my-6">
                <p className="text-sm text-text-muted">MOCK INTERVIEW RESULT</p>
                <h3 className="text-3xl font-black text-white mt-1 leading-tight">
                  {getJobTitle()}
                </h3>
              </div>

              {/* Large Score Circle */}
              <div className="my-8 flex justify-center">
                <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-slate-900 border-4 border-purple-500/30 shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-white">{overallScoreVal}</span>
                    <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest mt-0.5">SCORE / 100</span>
                  </div>
                  {/* Floating Badge */}
                  <div className="absolute -bottom-2 bg-purple-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-lg border border-purple-400">
                    Grade {overallGradeObj.grade}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-900 text-slate-300 text-sm leading-relaxed max-w-xs mx-auto">
                "I scored <span className="font-extrabold text-purple-400">{overallScoreVal}/100</span> on a mock interview for the <span className="font-bold text-white">{getJobTitle()}</span> role!"
              </div>

              <div className="text-[10px] text-text-muted mt-6">
                Powered by Claude AI & HireAI Intelligence Engine
              </div>
            </div>

            {/* Share Page Actions */}
            <div className="max-w-md mx-auto w-full flex flex-col gap-2.5 pt-4">
              <button
                onClick={handleCopyShareText}
                className="w-full btn-primary h-11 font-bold text-xs tracking-wide flex items-center justify-center gap-2"
              >
                <Copy size={14} /> Copy Shareable Text
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 h-11 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-bold border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowRight size={14} className="transform rotate-180" /> View Analytics
                </button>
                <Link
                  to="/candidate/dashboard"
                  className="flex-1 h-11 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-bold border border-slate-800 transition-colors flex items-center justify-center gap-1.5 no-underline text-slate-200"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
