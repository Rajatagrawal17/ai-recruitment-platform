import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import MatchScoreBadge from "../components/MatchScoreBadge";
import {
  createJob,
  getAnalytics,
  getJobs,
  getJobCandidates,
  scheduleInterview,
  updateApplicationStatus,
} from "../services/api";
import { Search, Filter, Trophy, BriefcaseBusiness, Users, Star } from "lucide-react";

// Inline styles extracted from the Stitch HTML
const styleBlock = `
  body {
      background-color: #0b1326;
      background-image: 
          radial-gradient(circle at 20% 30%, rgba(60, 221, 199, 0.05) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(123, 208, 255, 0.05) 0%, transparent 40%);
  }
  .glass-panel {
      backdrop-filter: blur(20px);
      background: rgba(45, 52, 73, 0.4);
  }
  .orbit-container {
      position: relative;
      width: 300px;
      height: 300px;
  }
  .orbit-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 1px dashed rgba(144, 144, 151, 0.2);
      border-radius: 50%;
  }
  @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
  }
  .animate-pulse-soft {
      animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
`;

const initialForm = {
  title: "",
  company: "",
  description: "",
  location: "",
  type: "full-time",
  salary: "",
  skills: "",
};

const statusOptions = ["all", "pending", "shortlisted", "accepted", "rejected"];

const formatStatusBadge = (status) => {
  switch(status) {
    case 'shortlisted': return <span className="px-3 py-1 rounded-full bg-secondary/10 text-[10px] font-label font-bold text-secondary">Shortlisted</span>;
    case 'accepted': return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[10px] font-label font-bold text-emerald-400">Accepted</span>;
    case 'rejected': return <span className="px-3 py-1 rounded-full bg-rose-500/10 text-[10px] font-label font-bold text-rose-400">Rejected</span>;
    default: return <span className="px-3 py-1 rounded-full bg-surface-container-high text-[10px] font-label font-bold text-on-surface-variant">Pending</span>;
  }
}

const RecruiterDashboard = () => {
  const reduceMotion = useReducedMotion();
  const [jobs, setJobs] = useState([]);
  const [jobCandidates, setJobCandidates] = useState({});
  const [expandedJobId, setExpandedJobId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [analytics, setAnalytics] = useState(null);
  const [interviewDrafts, setInterviewDrafts] = useState({});
  const [activeTab, setActiveTab] = useState("overview"); // overview, postings

  const openToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const loadDashboard = async () => {
    try {
      const [jobsRes, analyticsRes] = await Promise.all([
        getJobs(),
        getAnalytics().catch(() => ({ data: { analytics: null } })),
      ]);
      setJobs(jobsRes.data.jobs || []);
      setAnalytics(analyticsRes.data.analytics || null);
    } catch (err) {
      openToast("error", err.response?.data?.message || "Unable to load recruiter dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const ranking = useMemo(() => {
    const merged = Object.values(jobCandidates).flat();
    const filtered = merged.filter((candidate) => {
      const matchesStatus = statusFilter === "all" || (candidate.status || "pending") === statusFilter;
      const text = `${candidate.candidateName || ""} ${candidate.candidateEmail || ""}`.toLowerCase();
      const matchesText = text.includes(query.toLowerCase());
      return matchesStatus && matchesText;
    });

    return [...filtered].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [jobCandidates, query, statusFilter]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createJob({
        ...form,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      setForm(initialForm);
      openToast("success", "Job posted successfully");
      await loadDashboard();
      setActiveTab("overview");
    } catch (err) {
      openToast("error", err.response?.data?.message || "Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  const handleExpandJob = async (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId("");
      return;
    }
    setExpandedJobId(jobId);
    if (jobCandidates[jobId]) return;
    setLoadingCandidates(true);
    try {
      const res = await getJobCandidates(jobId);
      setJobCandidates((prev) => ({
        ...prev,
        [jobId]: res.data.matchedCandidates || [],
      }));
    } catch (err) {
      openToast("error", err.response?.data?.message || "Unable to load candidates for this job");
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleStatusChange = async (applicationId, status, jobId) => {
    try {
      await updateApplicationStatus(applicationId, status);
      const res = await getJobCandidates(jobId);
      setJobCandidates((prev) => ({
        ...prev,
        [jobId]: res.data.matchedCandidates || [],
      }));
      openToast("success", `Candidate marked as ${status}`);
    } catch (err) {
      openToast("error", "Unable to update status");
    }
  };

  const totalApplicants = Object.values(jobCandidates).flat().length;
  const topScore = ranking[0]?.matchScore || 0;

  return (
    <div className="font-body text-on-surface min-h-screen selection:bg-primary/30 antialiased overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: styleBlock }} />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed right-5 top-24 z-[70] rounded-xl px-4 py-3 text-sm font-label font-bold shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${
              toast.type === "success" ? "bg-primary text-on-primary-fixed" : "bg-error text-on-error"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.6)]">
        <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-600 font-headline">
              Orbital AI
            </span>
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`font-label text-sm uppercase tracking-wider transition-colors ${activeTab === "overview" ? "text-primary border-b-2 border-primary pb-1" : "text-slate-400 hover:text-slate-200"}`}
              >
                AI Match
              </button>
              <button 
                onClick={() => setActiveTab("postings")}
                className={`font-label text-sm uppercase tracking-wider transition-colors ${activeTab === "postings" ? "text-primary border-b-2 border-primary pb-1" : "text-slate-400 hover:text-slate-200"}`}
              >
                Hiring Center
              </button>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-3 bg-surface-container-high/50 border border-primary/10 px-4 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <p className="text-[10px] font-label tracking-widest text-on-surface-variant uppercase">
              Live: <span className="text-primary font-bold">{totalApplicants} AI Scored</span>
            </p>
            <div className="w-[1px] h-3 bg-outline-variant/30 mx-1"></div>
            <p className="text-[10px] font-label tracking-widest text-on-surface-variant uppercase italic opacity-70">
              System Synced
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-gradient-to-r from-primary to-on-primary-container text-on-primary px-6 py-2 rounded-full font-label text-sm font-bold scale-95 hover:scale-100 transition-transform"
                    onClick={() => setActiveTab("postings")}>
              Post Job
            </button>
            <img alt="Recruiter Profile" className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover" src="https://ui-avatars.com/api/?name=Recruiter&background=3cddc7&color=0b1326" />
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-12 w-full max-w-7xl mx-auto px-4 lg:px-8">
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-label text-xs font-bold text-primary uppercase tracking-[0.3em]">Neural Matching Engine</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-label text-[10px] font-bold text-primary uppercase tracking-wider">Active</span>
                  </div>
                </div>
                <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
                  Recruiter Dashboard
                </h1>
                <p className="text-on-surface-variant max-w-lg">
                  AI-driven analysis of your applicant pool. Revealing top high-probability matches based on semantic skill alignment to your open roles.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px]">
                  <span className="text-2xl font-bold text-primary">{topScore}%</span>
                  <span className="font-label text-[10px] text-slate-500 uppercase">Top Match Score</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px]">
                  <span className="text-2xl font-bold text-secondary">{jobs.length}</span>
                  <span className="font-label text-[10px] text-slate-500 uppercase">Active Jobs</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7 glass-panel rounded-3xl p-10 relative overflow-hidden group min-h-[400px]">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-12">
                    <h2 className="font-headline text-2xl font-bold">Orbital Compatibility Map</h2>
                    <Filter className="text-primary w-5 h-5" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="orbit-container">
                      <div className="orbit-ring w-full h-full opacity-40"></div>
                      <div className="orbit-ring w-[220px] h-[220px] opacity-20"></div>
                      <div className="orbit-ring w-[120px] h-[120px] opacity-10"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary rounded-full blur-[20px] opacity-30 animate-pulse"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_#3cddc7]"></div>
                      
                      {ranking.slice(0, 3).map((candidate, i) => {
                        const positions = [
                         "top-10 left-10",
                         "bottom-16 right-4",
                         "top-1/2 -right-4"
                        ];
                        const borders = ["border-primary/40", "border-secondary/40", "border-outline-variant/40"];
                        return (
                          <div key={i} className={`absolute ${positions[i % 3]} w-12 h-12 bg-surface-container-highest rounded-full border ${borders[i%3]} flex items-center justify-center shadow-[0_0_15px_rgba(60,221,199,0.3)] hover:scale-110 transition-transform`}>
                            <span className="text-[10px] font-bold">{candidate.matchScore}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="mt-8 flex gap-6 text-xs font-label">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Technical Alignment</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary"></span> Culture Proximity</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-headline text-xl font-bold">Top Ranked Matches</h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
                    <input 
                      placeholder="Filter..." 
                      className="bg-surface-container-high border-none text-xs rounded-full py-2 pl-9 pr-4 text-on-surface focus:ring-1 focus:ring-primary outline-none" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                {ranking.length === 0 ? (
                  <p className="text-sm text-text-muted p-6 border border-dashed border-outline-variant/30 rounded-xl">
                    No candidates loaded. Expand a job posting below to load and rank applicants.
                  </p>
                ) : ranking.slice(0, 8).map((candidate) => (
                  <motion.div key={candidate._id} className="bg-surface-container-low border border-surface-container-highest rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300 group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] cursor-pointer">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-headline text-xl font-bold text-primary border border-primary/20">
                          {(candidate.candidateName || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-lg">{candidate.candidateName}</h3>
                          <p className="font-label text-xs text-on-surface-variant truncate max-w-[150px]">{candidate.candidateEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-headline font-black text-2xl">{candidate.matchScore || 0}%</div>
                        <div className="font-label text-[10px] text-slate-500 uppercase tracking-tighter">AI Score</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {formatStatusBadge(candidate.status)}
                      {(candidate.matchExplanation?.matchedSkills || []).slice(0, 2).map((skill, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-surface-container-high text-[10px] font-label font-bold text-on-surface-variant truncate max-w-[100px]">{skill}</span>
                      ))}
                    </div>

                    <p className="text-xs text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
                      {candidate.matchExplanation?.summary || "AI match reasoning not generated."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                      <span className="text-[10px] font-label text-primary bg-primary/10 px-2 py-1 rounded">Rank #{ranking.findIndex(c => c._id === candidate._id) + 1}</span>
                      <button className="text-primary text-xs font-bold font-label flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                        Quick Action
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Jobs List Expanded View below Orbital UI */}
            <div className="glass-panel p-8 rounded-3xl mt-6 border border-surface-container-highest">
              <h2 className="font-headline text-2xl font-bold mb-6">Active Jobs Pipeline</h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-surface-container-high rounded w-full"></div>
                  <div className="h-10 bg-surface-container-high rounded w-full"></div>
                </div>
              ) : jobs.length === 0 ? (
                <p className="text-on-surface-variant text-sm">No active jobs yet.</p>
              ) : (
                 <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left align-middle border-collapse">
                   <thead>
                     <tr className="border-b border-outline-variant/20 text-text-muted font-label uppercase tracking-wider text-[10px]">
                       <th className="px-4 py-4 font-bold">Role Title</th>
                       <th className="px-4 py-4 font-bold">Company</th>
                       <th className="px-4 py-4 font-bold">Posted</th>
                       <th className="px-4 py-4 font-bold text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {jobs.map((job) => (
                       <React.Fragment key={job._id}>
                         <tr className="border-b border-surface-container-highest hover:bg-surface-container-high/30 transition-colors">
                           <td className="px-4 py-4 font-semibold text-primary">{job.title}</td>
                           <td className="px-4 py-4 text-on-surface-variant">{job.company}</td>
                           <td className="px-4 py-4 text-on-surface-variant">
                             {new Date(job.createdAt).toLocaleDateString()}
                           </td>
                           <td className="px-4 py-4 text-right">
                             <button
                               onClick={() => handleExpandJob(job._id)}
                               className="text-xs font-label font-bold uppercase tracking-wider text-secondary whitespace-nowrap bg-secondary/10 px-3 py-1.5 rounded-full hover:bg-secondary/20 transition-colors"
                             >
                               {expandedJobId === job._id ? "Collapse" : "Score Applicants"}
                             </button>
                           </td>
                         </tr>
                         {expandedJobId === job._id && (
                           <tr className="bg-surface-container-lowest border-b border-surface-container-highest">
                             <td colSpan={4} className="px-4 py-6">
                               {loadingCandidates ? (
                                  <div className="animate-pulse flex items-center justify-center py-4">
                                     <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                     <span className="ml-3 font-label text-xs text-primary uppercase tracking-widest">Scanning Resumes...</span>
                                  </div>
                               ) : (jobCandidates[job._id] || []).length === 0 ? (
                                 <p className="text-xs text-text-muted text-center italic py-2">No applicants in queue.</p>
                               ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(jobCandidates[job._id] || []).map((candidate) => (
                                      <div key={candidate._id} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                                         <div className="flex justify-between items-start mb-3">
                                            <div>
                                              <p className="font-semibold text-sm">{candidate.candidateName}</p>
                                              <p className="text-xs text-on-surface-variant">{candidate.candidateEmail}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="font-bold text-primary">{candidate.matchScore || 0}% Match</div>
                                              <select
                                                className="bg-surface-container text-xs border border-outline-variant/30 rounded px-2 py-1 outline-none"
                                                value={candidate.status || "pending"}
                                                onChange={(e) => handleStatusChange(candidate._id, e.target.value, job._id)}
                                              >
                                                {statusOptions.map((s) => (
                                                  <option key={s} value={s}>{s}</option>
                                                ))}
                                              </select>
                                            </div>
                                         </div>
                                         <p className="text-xs text-on-surface-variant bg-surface-container rounded p-2 border border-surface-bright/50">
                                            {candidate.matchExplanation?.summary || "Analyzing..."}
                                         </p>
                                      </div>
                                    ))}
                                 </div>
                               )}
                             </td>
                           </tr>
                         )}
                       </React.Fragment>
                     ))}
                   </tbody>
                 </table>
               </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Postings / Create Job View */}
        {activeTab === "postings" && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl max-w-2xl mx-auto border border-primary/20">
             <div className="mb-6 border-b border-primary/20 pb-4">
                <h2 className="font-headline text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Open New Mission</h2>
                <p className="font-label text-sm text-on-surface-variant mt-1">Deploy a new requisition to the AI matching grid.</p>
             </div>
             
             <form onSubmit={handleCreateJob} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-label uppercase tracking-wider text-slate-400">Mission Title</label>
                    <input className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior Backend Engineer" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-label uppercase tracking-wider text-slate-400">Fleet (Company)</label>
                    <input className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors" name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp" required />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-label uppercase tracking-wider text-slate-400">Location Sector</label>
                    <input className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors" name="location" value={form.location} onChange={handleChange} placeholder="Remote, Galaxy" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-label uppercase tracking-wider text-slate-400">Engagement Type</label>
                    <select className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors" name="type" value={form.type} onChange={handleChange}>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="remote">Remote (Full-time)</option>
                      <option value="contract">Contractor</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold font-label uppercase tracking-wider text-slate-400">Compensation Package</label>
                  <input className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors" name="salary" value={form.salary} onChange={handleChange} placeholder="$120k - $150k + Equity" required />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold font-label uppercase tracking-wider text-slate-400">Required Skills (Comma separated)</label>
                  <input className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors" name="skills" value={form.skills} onChange={handleChange} placeholder="Node.js, React, MongoDB" required />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold font-label uppercase tracking-wider text-slate-400">Mission Brief (Details)</label>
                  <textarea className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors min-h-[140px] resize-none" name="description" value={form.description} onChange={handleChange} placeholder="Looking for a visionary..." required />
               </div>

               <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} className="w-full bg-gradient-to-r from-primary to-secondary text-surface-container-lowest font-bold font-label uppercase tracking-widest py-3 rounded-xl mt-4 disabled:opacity-50 transition-all" type="submit" disabled={saving}>
                 {saving ? "Deploying..." : "Launch Requisition & Scan Grid"}
               </motion.button>
             </form>
           </motion.div>
        )}
      </main>

      <footer className="w-full py-12 border-t border-slate-800/30 bg-slate-950 mt-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-headline font-bold text-slate-300 tracking-tighter">Orbital AI</span>
          <p className="font-label text-xs text-slate-500">© 2024 Orbital AI. Built for the future of talent matching.</p>
          <div className="flex gap-8">
            <button className="font-label text-xs text-slate-600 hover:text-primary transition-colors">Privacy Orbit</button>
            <button className="font-label text-xs text-slate-600 hover:text-primary transition-colors">Terms of Gravity</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RecruiterDashboard;
