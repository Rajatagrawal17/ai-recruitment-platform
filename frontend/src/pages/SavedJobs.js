import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookmarkX, Trash2 } from "lucide-react";
import { useSavedJobs } from "../context/SavedJobsContext";
import JobCard from "../components/JobCard";

const SavedJobs = () => {
  const navigate = useNavigate();
  const { savedJobs, unsaveJob, clearAllSavedJobs, isJobSaved } = useSavedJobs();

  return (
    <main className="min-h-screen bg-[#0A0F1E] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#00D4FF]">
                Saved Jobs
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Your bookmarked jobs</h1>
              <p className="mt-2 text-sm text-[#94A3B8]">
                {savedJobs.length} job{savedJobs.length === 1 ? "" : "s"} saved in your collection.
              </p>
            </div>

            {savedJobs.length > 0 && (
              <button onClick={clearAllSavedJobs} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm text-[#E2E8F0] transition hover:border-red-400/30 hover:text-red-300">
                <Trash2 size={16} /> Clear All
              </button>
            )}
          </div>
        </div>

        {savedJobs.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center rounded-[28px] border border-white/8 bg-white/[0.04] px-6 py-16 text-center">
            <BookmarkX size={72} className="mb-5 text-[#94A3B8]" />
            <h2 className="text-2xl font-bold text-white">No saved jobs yet</h2>
            <p className="mt-2 max-w-lg text-sm text-[#94A3B8]">Browse jobs and save your favorites so you can return to them later.</p>
            <button onClick={() => navigate("/jobs")} className="mt-6 rounded-full bg-[#00D4FF] px-6 py-3 font-semibold text-[#0A0F1E]">
              Browse Jobs
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {savedJobs.map((job) => (
                <motion.div key={job._id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
                  <JobCard
                    job={job}
                    isCandidate={false}
                    isSaved={isJobSaved(job._id)}
                    onSaveToggle={() => unsaveJob(job._id)}
                    onViewDetails={() => navigate(`/jobs/${job._id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
};

export default SavedJobs;
