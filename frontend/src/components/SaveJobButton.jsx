import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useSavedJobs } from "../context/SavedJobsContext";

const SaveJobButton = ({ job, className = "" }) => {
  const { isJobSaved, toggleSaveJob } = useSavedJobs();
  const isSaved = isJobSaved(job._id);

  const handleClick = () => {
    toggleSaveJob(job);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isSaved
          ? "bg-red-500 text-white shadow-md"
          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900"
      } ${className}`}
      title={isSaved ? "Remove from saved" : "Save job"}
    >
      <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
      <span className="text-sm font-medium">{isSaved ? "Saved" : "Save"}</span>
    </motion.button>
  );
};

export default SaveJobButton;
