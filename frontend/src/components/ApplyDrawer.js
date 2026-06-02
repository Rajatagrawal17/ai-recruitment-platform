import React, { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";
import { applyToJob } from "../services/api";
import { celebrateApply } from "../utils/celebrate";
import { useAuth } from "../context/AuthContext";
import { formatSalary, formatDisplaySalary } from "../utils/jobHelpers";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Sparkles,
  X,
} from "lucide-react";
import WaveLoader from "./WaveLoader";

function getScoreMeta(score = 0) {
  if (score >= 80) return { color: "#22C55E", label: "Strong" };
  if (score >= 60) return { color: "#EAB308", label: "Good" };
  if (score >= 40) return { color: "#FB923C", label: "Moderate" };
  return { color: "#EF4444", label: "Low" };
}

function ringValues(score, size, stroke) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return { radius, circumference, offset };
}

function ScoreRing({ score, meta, ring, compact = false }) {
  return (
    <div className={`relative ${compact ? "h-[60px] w-[60px]" : "h-[120px] w-[120px]"}`}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${compact ? 60 : 120} ${compact ? 60 : 120}`}>
        <circle cx={compact ? 30 : 60} cy={compact ? 30 : 60} r={compact ? 24 : 52} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={compact ? 6 : 10} />
        <motion.circle
          cx={compact ? 30 : 60}
          cy={compact ? 30 : 60}
          r={compact ? 24 : 52}
          fill="none"
          stroke={meta.color}
          strokeWidth={compact ? 6 : 10}
          strokeLinecap="round"
          strokeDasharray={ring.circumference}
          strokeDashoffset={ring.offset}
          initial={{ strokeDashoffset: ring.circumference }}
          animate={{ strokeDashoffset: ring.offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-semibold text-white">{score}%</span>
      </div>
    </div>
  );
}

function MatchRing({ score, meta, ring }) {
  return (
    <div className="relative mx-auto flex h-[140px] w-[140px] items-center justify-center rounded-full border border-white/8 bg-black/20">
      <ScoreRing score={score} meta={meta} ring={ring} />
      <div className="absolute -bottom-4 text-center text-sm font-semibold" style={{ color: meta.color }}>
        {meta.label}
      </div>
    </div>
  );
}

function MatchBar({ label, value, index }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.35 });
  return (
    <div ref={ref} className="mb-3">
      <div className="mb-1 flex items-center justify-between text-sm text-[#E2E8F0]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: inView ? `${value}%` : 0 }}
          transition={{ duration: 1, delay: index * 0.2 }}
          className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#2D6BFF]"
        />
      </div>
    </div>
  );
}

function InfoCard({ label, value, scrollable = false }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/4 p-4 ${scrollable ? "max-h-44 overflow-y-auto" : ""}`}>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">{label}</div>
      <div className="whitespace-pre-line text-sm leading-6 text-[#E2E8F0]">{value}</div>
    </div>
  );
}

function StepCard({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        <p className="mt-1 text-sm text-[#94A3B8]">{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00D4FF]"
      />
    </label>
  );
}

function ProgressDots({ step }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((index) => (
        <motion.span key={index} animate={{ scale: step >= index ? 1 : 0.9, opacity: 1 }} className={`h-2.5 w-2.5 rounded-full ${step >= index ? "bg-[#00D4FF]" : "bg-white/20"}`} />
      ))}
    </div>
  );
}

function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
      <ProgressDots step={step} />
      <span>Step {step} of 3</span>
    </div>
  );
}

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, index) => (
        <span
          key={index}
          className="absolute h-2 w-2 rounded-full confetti-dot"
          style={{
            left: `${(index * 17) % 100}%`,
            top: `${(index * 11) % 100}%`,
            background: ["#00D4FF", "#22C55E", "#F59E0B", "#FB7185", "#A855F7"][index % 5],
            animationDelay: `${index * 0.08}s`,
          }}
        />
      ))}
      <style>{`
        .confetti-dot { animation: confetti 1.8s ease-in-out infinite; }
        @keyframes confetti { 0% { transform: translateY(0) scale(0.8); opacity: 0; } 40% { opacity: 1; } 100% { transform: translateY(-120px) scale(1); opacity: 0; } }
      `}</style>
    </div>
  );
}

function SuccessState({ matchScore }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/40 text-emerald-300">
        <Check size={38} />
      </div>
      <h3 className="text-2xl font-bold text-white">Application Submitted! 🎉</h3>
      <p className="mt-2 text-sm text-[#E2E8F0]">We&apos;ve sent a confirmation to your email.</p>
      <div className="mt-6 rounded-2xl border border-white/8 bg-white/4 p-4">
        <p className="text-sm text-[#94A3B8]">Your match score</p>
        <p className="text-3xl font-bold text-[#00D4FF]">{matchScore}%</p>
      </div>
      <button className="btn-primary mt-5 w-full text-white">View My Applications</button>
      <ConfettiBurst />
    </div>
  );
}

function ApplyDrawer({ open, onOpenChange, job, onSuccess }) {
  const { user } = useAuth();
  const score = Number(job?.matchScore || 0);
  const scoreMeta = getScoreMeta(score);
  const [tab, setTab] = useState("details");
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumeMode, setResumeMode] = useState("existing");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [typedSuggestion, setTypedSuggestion] = useState("");
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    yearsExperience: user?.yearsExperience || "",
    coverLetter: "",
  });
  const matchRing = ringValues(score, 120, 10);
  const compactRing = ringValues(score, 60, 6);

  useEffect(() => {
    if (open) {
      setTab("details");
      setStep(1);
      setSubmitted(false);
      setSubmitting(false);
      setResumeFile(null);
      setUploadProgress(0);
      setResumeMode(user?.resumeUrl ? "existing" : "upload");
      setTypedSuggestion("");
      setFormData({
        fullName: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        yearsExperience: user?.yearsExperience || "",
        coverLetter: "",
      });
    }
  }, [open, user]);

  const allSkills = useMemo(() => job?.skills || [], [job]);
  const matchedSkills = allSkills.slice(0, Math.max(1, Math.ceil(allSkills.length * 0.75)));
  const missingSkills = allSkills.slice(matchedSkills.length, matchedSkills.length + 2);

  function onDrop(files) {
    const file = files?.[0];
    if (!file) return;
    setResumeFile(file);
    setResumeMode("upload");
    setUploadProgress(10);
    const timer = setInterval(() => {
      setUploadProgress((value) => {
        if (value >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(100, value + 15);
      });
    }, 180);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
    maxFiles: 1,
  });

  function generateSuggestion() {
    const text = `I am excited to apply for the ${job?.title || "role"} at ${job?.company || "your company"}. My background in ${matchedSkills.slice(0, 3).join(", ") || "similar skills"} makes me a strong fit for this opportunity.`;
    const words = text.split(" ");
    setIsGenerating(true);
    setTypedSuggestion("");
    let index = 0;
    const interval = setInterval(() => {
      setTypedSuggestion((current) => `${current}${words[index]} `);
      index += 1;
      if (index >= words.length) {
        clearInterval(interval);
        setIsGenerating(false);
        setFormData((prev) => ({ ...prev, coverLetter: text }));
      }
    }, 60);
  }

  async function submitApplication() {
    if (!job?._id) return;
    if (!formData.fullName || !formData.email) {
      toast.error("Please complete your contact details.");
      return;
    }

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("jobId", job._id);
      form.append("fullName", formData.fullName);
      form.append("email", formData.email);
      form.append("phone", formData.phone || "");
      form.append("yearsExperience", formData.yearsExperience || 0);
      form.append("coverLetter", formData.coverLetter || typedSuggestion || "");
      if (resumeMode === "upload" && resumeFile) {
        form.append("resume", resumeFile);
      }

      const response = await applyToJob(form);
      celebrateApply();
      setSubmitted(true);
      toast.success("Application submitted successfully.");
      onSuccess?.(response.data.application);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!job) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.aside
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 z-[60] flex h-full w-full flex-col border-l border-[#00D4FF]/20 bg-[#0D1321] text-white shadow-2xl outline-none md:w-[520px]"
              >
            <VisuallyHidden>
              <Dialog.Title>Apply for {job.title}</Dialog.Title>
              <Dialog.Description>Submit your application details for the job role.</Dialog.Description>
            </VisuallyHidden>
            <div className="flex items-start justify-between border-b border-white/8 px-5 py-4">
              <div className="min-w-0 pr-4">
                <p className="truncate text-[1.3rem] font-bold text-white">{job.title}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  {job.company} · {job.location || "Remote"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ScoreRing score={score} meta={scoreMeta} compact ring={compactRing} />
                <Dialog.Close asChild>
                  <button className="rounded-full border border-white/10 bg-white/5 p-2 text-[#94A3B8] hover:text-white">
                    <X size={18} />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="border-b border-white/8 px-5 py-4">
              <div className="relative flex items-center gap-3 rounded-full bg-white/5 p-1 text-sm font-medium">
                {[
                  { key: "details", label: "Job Details" },
                  { key: "match", label: "Your Match" },
                  { key: "apply", label: "Apply" },
                ].map((item) => (
                  <button key={item.key} onClick={() => setTab(item.key)} className="relative flex-1 rounded-full px-3 py-2 text-center text-white/80">
                    {tab === item.key && <motion.span layoutId="apply-tab-pill" className="absolute inset-0 rounded-full bg-[#00D4FF]" transition={{ type: "spring", stiffness: 320, damping: 30 }} />}
                    <span className={`relative z-10 ${tab === item.key ? "text-[#0A0F1E]" : ""}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <AnimatePresence mode="wait">
                {tab === "details" && (
                  <motion.div key="details" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-5">
                    <InfoCard label="Description" value={job.description} scrollable />
                    <div>
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(job.skills || []).map((skill) => (
                          <span key={skill} className="rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-3 py-1 text-xs text-[#00D4FF]">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-[#E2E8F0]">
                      <InfoCard label="Experience" value={`${Number(job.yearsOfExperience || job.experience || 0)} years`} />
                      <InfoCard label="Salary" value={job.salary ? formatDisplaySalary(job.salary) : "Negotiable"} />
                      <InfoCard label="Type" value={job.type || "full-time"} />
                      <InfoCard label="Posted" value={job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "Recently"} />
                    </div>
                    <InfoCard label="Applicants" value={`${job.applicantsCount || 0} candidates already applied`} />
                  </motion.div>
                )}

                {tab === "match" && (
                  <motion.div key="match" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-5">
                    <div className="rounded-3xl border border-white/8 bg-white/4 p-5 text-center">
                      <MatchRing score={score} meta={scoreMeta} ring={matchRing} />
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      {[{ label: "Skills Match", value: 80 }, { label: "Experience Match", value: 60 }, { label: "Education Match", value: 90 }].map((item, index) => (
                        <MatchBar key={item.label} label={item.label} value={item.value} index={index} />
                      ))}
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">Why You're a Good Fit</h4>
                      <div className="space-y-2 text-sm text-[#E2E8F0]">
                        <p>✅ You have {matchedSkills.length}/{allSkills.length || matchedSkills.length} required skills</p>
                        <p>✅ Your experience matches the job requirements</p>
                        {missingSkills.length > 0 && <p>⚠️ You're missing: {missingSkills.join(", ")}</p>}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {matchedSkills.map((skill) => (
                          <span key={skill} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">{skill}</span>
                        ))}
                        {missingSkills.map((skill) => (
                          <span key={skill} className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#00D4FF]/20 bg-[#00D4FF]/8 p-4 text-sm text-[#E2E8F0]">
                      <p className="font-medium text-[#00D4FF]">💡 Tip</p>
                      <p className="mt-1">Adding Kubernetes to your resume could raise your match score to 94%.</p>
                    </div>
                  </motion.div>
                )}

                {tab === "apply" && (
                  <motion.div key="apply" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                    {submitted ? (
                      <SuccessState matchScore={score} />
                    ) : (
                      <div className="space-y-5 pb-8">
                        <StepIndicator step={step} />

                        {step === 1 && (
                          <StepCard title="Your Info" subtitle="Pre-filled from your profile">
                            <Field label="Full Name" value={formData.fullName} onChange={(value) => setFormData((prev) => ({ ...prev, fullName: value }))} />
                            <Field label="Email" value={formData.email} onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))} />
                            <Field label="Phone" value={formData.phone} onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))} />
                            <Field label="Years of Experience" type="number" value={formData.yearsExperience} onChange={(value) => setFormData((prev) => ({ ...prev, yearsExperience: value }))} />
                            <div className="flex justify-end">
                              <button onClick={() => setStep(2)} className="btn-primary inline-flex items-center gap-2 text-white">
                                Next <ChevronRight size={16} />
                              </button>
                            </div>
                          </StepCard>
                        )}

                        {step === 2 && (
                          <StepCard title="Resume" subtitle="Upload a new one or use your existing resume.">
                            {user?.resumeUrl && (
                              <button onClick={() => setResumeMode("existing")} className={`mb-4 w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${resumeMode === "existing" ? "border-[#00D4FF] bg-[#00D4FF]/10" : "border-white/10 bg-white/4"}`}>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-white">Use existing resume</span>
                                  <Check className={resumeMode === "existing" ? "text-[#00D4FF]" : "text-[#94A3B8]"} size={16} />
                                </div>
                                <p className="mt-1 text-xs text-[#94A3B8]">{user.resumeUrl}</p>
                              </button>
                            )}

                            <div {...getRootProps()} className={`rounded-3xl border-2 border-dashed p-6 text-center transition ${isDragActive ? "border-[#00D4FF] bg-[#00D4FF]/8" : resumeFile ? "border-[#00D4FF] bg-[#00D4FF]/6" : "border-white/12 bg-white/4"}`}>
                              <input {...getInputProps()} />
                              <FileUp className="mx-auto mb-3 text-[#00D4FF]" size={28} />
                              <p className="text-sm font-medium text-white">Drop your resume here or click to browse</p>
                              <p className="mt-1 text-xs text-[#94A3B8]">PDF, DOC, or DOCX</p>
                              {resumeFile && <p className="mt-3 text-sm text-[#E2E8F0]">{resumeFile.name}</p>}
                              {uploadProgress > 0 && <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full rounded-full bg-[#00D4FF]" /></div>}
                            </div>

                            <div className="flex items-center justify-between">
                              <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white">
                                <ChevronLeft size={16} /> Back
                              </button>
                              <button onClick={() => setStep(3)} className="btn-primary inline-flex items-center gap-2 text-white">
                                Next <ChevronRight size={16} />
                              </button>
                            </div>
                          </StepCard>
                        )}

                        {step === 3 && (
                          <StepCard title="Cover Letter" subtitle="Tell them why you're the perfect fit.">
                            <textarea
                              value={formData.coverLetter}
                              onChange={(event) => setFormData((prev) => ({ ...prev, coverLetter: event.target.value.slice(0, 500) }))}
                              rows={8}
                              placeholder="Tell them why you're the perfect fit..."
                              className="w-full rounded-3xl border border-white/10 bg-white/4 p-4 text-sm text-white outline-none transition focus:border-[#00D4FF]"
                            />
                            <div className={`mt-2 text-xs ${formData.coverLetter.length >= 450 ? "text-orange-300" : "text-[#94A3B8]"}`}>
                              {formData.coverLetter.length} / 500
                            </div>

                            <button onClick={generateSuggestion} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-4 py-2 text-sm font-medium text-[#00D4FF]">
                              <Sparkles size={16} /> AI Suggestion
                            </button>

                            {isGenerating && <div className="mt-3 text-sm text-[#94A3B8]">Generating your suggestion...</div>}
                            {!isGenerating && typedSuggestion && <div className="mt-3 rounded-2xl border border-white/8 bg-white/4 p-3 text-sm text-[#E2E8F0]">{typedSuggestion}</div>}

                            <div className="flex items-center justify-between pt-2">
                              <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white">
                                <ChevronLeft size={16} /> Back
                              </button>
                              <button onClick={submitApplication} disabled={submitting} className="btn-primary inline-flex w-full items-center justify-center gap-2 text-white disabled:cursor-not-allowed disabled:opacity-70">
                                {submitting ? <WaveLoader size="sm" /> : null}
                                Submit Application
                              </button>
                            </div>
                          </StepCard>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </Dialog.Content>
      </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default ApplyDrawer;
