import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { useSavedJobs } from "../context/SavedJobsContext";
import { useNavigate } from "react-router-dom";
import "./SavedJobs.css";

const SavedJobs = () => {
  const { savedJobs, unsaveJob, clearAllSavedJobs } = useSavedJobs();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // all, active, archived

  const filteredJobs = savedJobs; // Can add filtering logic later

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all saved jobs?")) {
      clearAllSavedJobs();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="text-red-500 fill-current" size={32} />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Saved Jobs
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved
                </p>
              </div>
            </div>
            {savedJobs.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                Clear All
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Empty State */}
        {savedJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart size={64} className="mx-auto text-gray-400 mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Saved Jobs Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start saving jobs to keep track of opportunities you're interested in
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/jobs")}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              Browse Jobs
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        ) : (
          /* Jobs Grid */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="saved-job-card group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all p-6"
              >
                {/* Job Card Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {job.company}
                  </p>
                </div>

                {/* Job Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {job.location && (
                    <p>
                      <span className="font-semibold">Location:</span> {job.location}
                    </p>
                  )}
                  {job.salary && (
                    <p>
                      <span className="font-semibold">Salary:</span> {job.salary}
                    </p>
                  )}
                  {job.experienceLevel && (
                    <p>
                      <span className="font-semibold">Experience:</span>{" "}
                      {job.experienceLevel}
                    </p>
                  )}
                </div>

                {/* Skills/Tags */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {job.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewJob(job._id)}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => unsaveJob(job._id)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    title="Remove from saved"
                  >
                    <Heart size={18} fill="currentColor" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
