import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import JobCard from "../components/JobCard";
import AdvancedJobFilters from "../components/AdvancedJobFilters";
import Pagination from "../components/Pagination";
import EnhancedNotificationCenter from "../components/EnhancedNotificationCenter";
import useJobFilters from "../hooks/useJobFilters";
import { getJobs } from "../services/api";
import SystemDiagnostics from "../components/SystemDiagnostics";
import "./Jobs.css";

const Jobs = () => {
  const navigate = useNavigate();
  const { filters, results, isLoading, currentPage, totalPages, applyFilters, handlePageChange } = useJobFilters();
  const [jobs, setJobs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState(null);

  // Load initial jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        console.log("🔄 Fetching jobs from API...");
        const res = await getJobs();
        console.log("✅ Jobs API Response:", res.data);
        setJobs(res.data.jobs || []);
        setError(null);
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("❌ Error fetching jobs:", error);
        setError(`Failed to load jobs: ${error.message}`);
        setJobs([]);
        setInitialLoadComplete(true);
      }
    };

    loadJobs();
  }, []);

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Initial search with all jobs
  useEffect(() => {
    if (initialLoadComplete && jobs.length > 0 && results.length === 0) {
      applyFilters(filters);
    }
  }, [initialLoadComplete, jobs.length]);

  const handleFilterChange = (newFilters) => {
    applyFilters(newFilters);
  };

  const handleSearch = (searchFilters) => {
    applyFilters(searchFilters);
  };

  const toggleFavorite = (jobId) => {
    let updated;
    if (favorites.includes(jobId)) {
      updated = favorites.filter((id) => id !== jobId);
    } else {
      updated = [...favorites, jobId];
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const userId = localStorage.getItem("userId");

  return (
    <main className="min-h-screen bg-gray-50">
      <EnhancedNotificationCenter userId={userId} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Your Perfect Job
          </h1>
          <p className="text-gray-600">
            {results.length > 0
              ? `Found ${results.length} opportunities`
              : "Explore amazing job opportunities tailored to your skills"}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800 font-semibold">⚠️ Error: {error}</p>
            <p className="text-red-700 text-sm mt-1">Check browser console (F12) for more details</p>
          </motion.div>
        )}

        {/* No Jobs Message */}
        {!error && initialLoadComplete && jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-blue-800 font-semibold">ℹ️ No jobs available yet</p>
            <p className="text-blue-700 text-sm mt-1">
              Check back soon or contact your administrator
            </p>
          </motion.div>
        )}

        {/* Diagnostics */}
        {(error || (initialLoadComplete && jobs.length === 0)) && (
          <SystemDiagnostics />
        )}

        {/* Advanced Filters */}
        <AdvancedJobFilters
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Results Section */}
        <div className="mt-8">
          {isLoading ? (
            // Loading State
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"
                />
              ))}
            </motion.div>
          ) : results.length === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No jobs found
              </h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  handleFilterChange({
                    keywords: '',
                    skills: [],
                    experience: '',
                    salaryMin: '',
                    salaryMax: '',
                    location: '',
                    jobType: [],
                  });
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Clear Filters
              </motion.button>
            </motion.div>
          ) : (
            <>
              {/* Job Cards Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {results.map((job) => (
                    <motion.div
                      key={job._id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        <JobCard
                          job={job}
                          isFavorite={favorites.includes(job._id)}
                          onFavoriteToggle={() => toggleFavorite(job._id)}
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Jobs;
