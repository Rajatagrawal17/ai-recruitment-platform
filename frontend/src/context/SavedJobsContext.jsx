import React, { createContext, useContext, useState, useEffect } from "react";

const SavedJobsContext = createContext();

export const SavedJobsProvider = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      const stored = localStorage.getItem("savedJobs");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error parsing saved jobs:", error);
      return [];
    }
  });

  // Persist to localStorage whenever savedJobs changes
  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
  }, [savedJobs]);

  const saveJob = (job) => {
    setSavedJobs((prev) => {
      const exists = prev.find((j) => j._id === job._id);
      if (exists) return prev;
      return [...prev, job];
    });
  };

  const unsaveJob = (jobId) => {
    setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));
  };

  const toggleSaveJob = (job) => {
    const isSaved = savedJobs.some((j) => j._id === job._id);
    if (isSaved) {
      unsaveJob(job._id);
    } else {
      saveJob(job);
    }
  };

  const isJobSaved = (jobId) => {
    return savedJobs.some((job) => job._id === jobId);
  };

  const getSavedJobsCount = () => {
    return savedJobs.length;
  };

  const clearAllSavedJobs = () => {
    setSavedJobs([]);
  };

  const value = {
    savedJobs,
    saveJob,
    unsaveJob,
    toggleSaveJob,
    isJobSaved,
    getSavedJobsCount,
    clearAllSavedJobs,
  };

  return (
    <SavedJobsContext.Provider value={value}>
      {children}
    </SavedJobsContext.Provider>
  );
};

export const useSavedJobs = () => {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error("useSavedJobs must be used within SavedJobsProvider");
  }
  return context;
};

export default SavedJobsProvider;
