import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  Printer, 
  RefreshCw, 
  ChevronRight, 
  Check, 
  AlertTriangle,
  ArrowLeft,
  ChevronDown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSavedJobs } from "../context/SavedJobsContext";
import API from "../services/api";

const CoverLetterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedJobs } = useSavedJobs();
  
  // Job selector options
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  
  // Custom job fields
  const [isCustomJob, setIsCustomJob] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  
  // Settings
  const [highlights, setHighlights] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  
  // Generation & UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("");
  
  // Raw generated letter
  const [generatedLetter, setGeneratedLetter] = useState("");
  
  // Streaming state
  const [streamedLetter, setStreamedLetter] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  
  // For copy button feedback
  const [copied, setCopied] = useState(false);

  // Fetch candidate applied jobs
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await API.get("/applications/my");
        if (response.data?.success && response.data?.applications) {
          const applied = response.data.applications.map(app => app.job).filter(Boolean);
          // Combine with saved jobs
          const allJobs = [...savedJobs];
          applied.forEach(appJob => {
            if (!allJobs.some(j => j._id === appJob._id)) {
              allJobs.push(appJob);
            }
          });
          setJobs(allJobs);
        } else {
          setJobs(savedJobs);
        }
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
        setJobs(savedJobs);
      }
    };
    
    fetchAppliedJobs();
  }, [savedJobs]);

  // Autofill highlights from user profile skills/interests
  useEffect(() => {
    if (user) {
      const skillsStr = Array.isArray(user.skills) && user.skills.length > 0
        ? `my expertise in ${user.skills.slice(0, 3).join(", ")}`
        : "";
      const fieldStr = Array.isArray(user.fieldOfInterest) && user.fieldOfInterest.length > 0
        ? `interest in ${user.fieldOfInterest.join(", ")}`
        : "";
      
      let autofill = "";
      if (skillsStr && fieldStr) {
        autofill = `Highlight ${skillsStr} and my strong ${fieldStr}.`;
      } else if (skillsStr) {
        autofill = `Highlight ${skillsStr}.`;
      } else if (fieldStr) {
        autofill = `Highlight my strong ${fieldStr}.`;
      }
      
      if (autofill) {
        setHighlights(autofill);
      }
    }
  }, [user]);

  // Handle job dropdown change
  const handleJobChange = (e) => {
    const val = e.target.value;
    setSelectedJobId(val);
    if (val === "custom") {
      setIsCustomJob(true);
    } else {
      setIsCustomJob(false);
      // Clear custom fields
      setCustomTitle("");
      setCustomCompany("");
      setCustomDescription("");
    }
  };

  // Generate request
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    setGeneratedLetter("");
    setStreamedLetter("");
    
    // Validate inputs
    if (!selectedJobId) {
      setError("Please select a job or choose to paste a custom job description.");
      setLoading(false);
      return;
    }
    
    if (selectedJobId === "custom") {
      if (!customTitle || !customCompany || !customDescription) {
        setError("Please fill in the Job Title, Company Name, and Job Description fields.");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        tone,
        length,
        highlights
      };
      
      if (selectedJobId === "custom") {
        payload.jobTitle = customTitle;
        payload.company = customCompany;
        payload.jobDescription = customDescription;
      } else {
        payload.jobId = selectedJobId;
      }
      
      const response = await API.post("/ai/cover-letter", payload);
      
      if (response.data?.success && response.data?.data?.coverLetter) {
        const letterText = response.data.data.coverLetter;
        setGeneratedLetter(letterText);
        setProvider(response.data.provider || "Claude AI");
        startStreaming(letterText);
      } else {
        setError("Failed to generate cover letter. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Stream effect
  const intervalRef = useRef(null);
  const startStreaming = (text) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setStreamedLetter("");
    setIsStreaming(true);
    
    // Split text by words
    const words = text.split(" ");
    let index = 0;
    
    intervalRef.current = setInterval(() => {
      if (index < words.length) {
        setStreamedLetter((prev) => (prev ? prev + " " + words[index] : words[index]));
        index++;
      } else {
        clearInterval(intervalRef.current);
        setIsStreaming(false);
      }
    }, 40); // 40ms per word
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Helper selectors functions
  const tones = ["Professional", "Friendly", "Bold", "Concise", "Story-driven"];
  const lengths = [
    { label: "Short (~150 words)", value: "Short", range: [100, 200] },
    { label: "Medium (~250 words)", value: "Medium", range: [200, 300] },
    { label: "Long (~350 words)", value: "Long", range: [300, 400] }
  ];

  const currentLengthConfig = lengths.find(l => l.value === length) || lengths[1];

  // Calculate live word count
  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const currentWordCount = getWordCount(streamedLetter || generatedLetter);
  const isWithinTargetRange = 
    currentWordCount >= currentLengthConfig.range[0] && 
    currentWordCount <= currentLengthConfig.range[1];

  // Helper buttons actions
  const handleCopy = () => {
    const textToCopy = streamedLetter || generatedLetter;
    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = streamedLetter || generatedLetter;
    if (!textToDownload) return;
    
    const element = document.createElement("a");
    const file = new Blob([textToDownload], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    
    const companyName = selectedJobId === "custom" 
      ? customCompany 
      : (jobs.find(j => j._id === selectedJobId)?.company || "Company");
      
    element.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMakeShorter = () => {
    setLength("Short");
    // Trigger generate after length updates
    setTimeout(() => {
      handleSubmitWithCustomParams(tone, "Short");
    }, 50);
  };

  const handleMoreFormal = () => {
    setTone("Professional");
    setTimeout(() => {
      handleSubmitWithCustomParams("Professional", length);
    }, 50);
  };

  const handleSubmitWithCustomParams = async (targetTone, targetLength) => {
    setError("");
    setLoading(true);
    setGeneratedLetter("");
    setStreamedLetter("");
    
    try {
      const payload = {
        tone: targetTone,
        length: targetLength,
        highlights
      };
      
      if (selectedJobId === "custom") {
        payload.jobTitle = customTitle;
        payload.company = customCompany;
        payload.jobDescription = customDescription;
      } else {
        payload.jobId = selectedJobId;
      }
      
      const response = await API.post("/ai/cover-letter", payload);
      
      if (response.data?.success && response.data?.data?.coverLetter) {
        const letterText = response.data.data.coverLetter;
        setGeneratedLetter(letterText);
        setProvider(response.data.provider || "Claude AI");
        startStreaming(letterText);
      } else {
        setError("Failed to generate cover letter. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0F1E] px-4 py-8 text-white sm:px-6 lg:px-8 print-container">
      {/* CSS Styles for Print Mode */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print-container {
            padding: 0 !important;
            background: white !important;
          }
          /* Hide everything except the cover letter content */
          .no-print, nav, header, footer, button, .left-panel, .right-header, .right-footer, .word-count-badge {
            display: none !important;
          }
          .right-panel {
            width: 100% !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            color: black !important;
          }
          .letter-content {
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 12pt !important;
            line-height: 1.5 !important;
            color: black !important;
            white-space: pre-wrap !important;
          }
        }
      `}} />

      <div className="mx-auto max-w-7xl no-print">
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => navigate("/candidate/dashboard")} 
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-[#94A3B8] transition hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <Link 
            to="/ai-tools"
            className="flex items-center gap-1.5 text-sm text-[#00D4FF] hover:underline"
          >
            <span>AI Career Studio</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="mb-8 rounded-3xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#00D4FF]">
                <Sparkles size={12} /> AI Tools
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl gradient-text">Cover Letter Generator</h1>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Generate a highly tailored, role-specific cover letter in seconds using Claude-3.5-Sonnet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Panel: Controls */}
        <section className="lg:col-span-5 space-y-6 left-panel no-print">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-md">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <FileText className="text-[#00D4FF]" size={20} /> Controls
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* Job Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#E2E8F0]">Select Job</label>
                <div className="relative">
                  <select
                    value={selectedJobId}
                    onChange={handleJobChange}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 pr-10 text-sm text-white placeholder-white/30 focus:border-[#00D4FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00D4FF]/50"
                  >
                    <option value="" disabled className="bg-[#0D1326] text-[#64748B]">Select a saved or applied job...</option>
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id} className="bg-[#0D1326] text-white">
                        {job.title} at {job.company}
                      </option>
                    ))}
                    <option value="custom" className="bg-[#0D1326] text-[#00D4FF] font-semibold">
                      ➕ Paste Custom Job Description...
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#94A3B8]">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {/* Custom Job Fields */}
              {isCustomJob && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4"
                >
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#94A3B8]">Job Title *</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Frontend Engineer"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#00D4FF]/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#94A3B8]">Company Name *</label>
                    <input
                      type="text"
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#00D4FF]/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#94A3B8]">Job Description *</label>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Paste the job description or requirements here..."
                      rows="4"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#00D4FF]/50 focus:outline-none resize-y"
                    />
                  </div>
                </motion.div>
              )}

              {/* Highlights */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#E2E8F0]">Achievements to Highlight</label>
                <textarea
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="Add 2-3 key achievements or experiences you want to highlight..."
                  rows="3"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#00D4FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00D4FF]/50 resize-y"
                />
              </div>

              {/* Tone Selector */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-[#E2E8F0]">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                        tone === t
                          ? "bg-gradient-to-r from-[#0052FF] to-[#00D4FF] text-white shadow-md shadow-[#00D4FF]/10"
                          : "border border-white/10 bg-white/[0.03] text-[#94A3B8] hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selector */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-[#E2E8F0]">Length</label>
                <div className="space-y-2">
                  {lengths.map((l) => (
                    <label key={l.value} className="flex items-center gap-3 cursor-pointer text-sm text-[#94A3B8] hover:text-white transition">
                      <input
                        type="radio"
                        name="length"
                        value={l.value}
                        checked={length === l.value}
                        onChange={() => setLength(l.value)}
                        className="h-4 w-4 border-white/10 bg-white/[0.04] text-[#00D4FF] focus:ring-0"
                      />
                      <span className={length === l.value ? "text-white font-medium" : ""}>
                        {l.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0052FF] via-[#008CFF] to-[#00D4FF] px-6 py-4 text-center text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="animate-spin" size={16} /> Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={16} /> Generate Cover Letter
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* After Generation Actions (Only visible if letter generated) */}
          {(generatedLetter || streamedLetter) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-md space-y-3"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#94A3B8] mb-2">Adjust & Refine</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={loading || isStreaming}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.02] py-3 text-xs font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50"
                >
                  <RefreshCw size={14} /> Regenerate
                </button>
                <button
                  onClick={handleMakeShorter}
                  disabled={loading || isStreaming || length === "Short"}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.02] py-3 text-xs font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50"
                >
                  📏 Make Shorter
                </button>
                <button
                  onClick={handleMoreFormal}
                  disabled={loading || isStreaming || tone === "Professional"}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.02] py-3 text-xs font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50"
                >
                  👔 More Formal
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#00D4FF]/30 bg-[#00D4FF]/5 py-3 text-xs font-semibold text-[#00D4FF] transition hover:bg-[#00D4FF]/10"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy to Clipboard"}
                </button>
              </div>
            </motion.div>
          )}
        </section>

        {/* Right Panel: Preview */}
        <section className="lg:col-span-7 space-y-4 right-panel">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 md:p-8 backdrop-blur-md flex flex-col min-h-[600px] h-full shadow-2xl relative overflow-hidden">
            
            {/* Header (hidden in print) */}
            <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-6 right-header no-print">
              <div>
                <h2 className="text-lg font-bold text-white">Live Preview</h2>
                {provider && (
                  <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold">
                    Powered by: <span className="text-[#00D4FF]">{provider}</span>
                  </span>
                )}
              </div>

              {/* Export Controls */}
              {(generatedLetter || streamedLetter) && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    title="Copy to clipboard"
                    className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-[#94A3B8] transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={handleDownload}
                    title="Download as .txt"
                    className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-[#94A3B8] transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={handlePrint}
                    title="Print / Save as PDF"
                    className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-[#94A3B8] transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 select-text">
              {loading && !streamedLetter && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 no-print">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-[#00D4FF] animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00D4FF]" size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Drafting your cover letter</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">Our AI is reviewing the job details and highlights...</p>
                  </div>
                </div>
              )}
              
              {!loading && !generatedLetter && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-[#64748B] no-print">
                  <FileText size={64} className="mb-4 text-white/10" />
                  <h3 className="text-base font-semibold text-white/40">No letter generated yet</h3>
                  <p className="text-xs max-w-sm mt-1">Select a job on the left, adjust your preferences, and hit generate to see the preview here.</p>
                </div>
              )}

              {(generatedLetter || streamedLetter) && (
                <div className="relative p-2 rounded-2xl bg-white/[0.01] border border-white/5 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[400px] md:min-h-[500px] overflow-y-auto selection:bg-[#00D4FF]/20 selection:text-white letter-content">
                  {streamedLetter}
                  {isStreaming && <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#00D4FF] animate-pulse">█</span>}
                </div>
              )}
            </div>

            {/* Footer with Info (hidden in print) */}
            {(generatedLetter || streamedLetter) && (
              <div className="mt-6 pt-4 border-t border-white/8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between right-footer no-print">
                {/* Word Count validation */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#94A3B8]">Word Count:</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold word-count-badge ${
                    isWithinTargetRange 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {currentWordCount} words
                    {isWithinTargetRange ? (
                      <span className="text-[10px]">(Perfect)</span>
                    ) : (
                      <span className="text-[10px]">(Target: {currentLengthConfig.range[0]}-{currentLengthConfig.range[1]})</span>
                    )}
                  </span>
                </div>
                
                <span className="text-xs text-[#94A3B8]">
                  {isStreaming ? "✍️ Streaming letter..." : "✅ Generation complete"}
                </span>
              </div>
            )}
            
          </div>
        </section>

      </div>
    </main>
  );
};

export default CoverLetterPage;
