import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import EnhancedJobCard from "../components/EnhancedJobCard";
import JobStatsDashboard from "../components/JobStatsDashboard";
import AnimatedBackground3D from "../components/AnimatedBackground3D";
import Pagination from "../components/Pagination";
import SearchHistory from "../components/SearchHistory";
import { getJobs } from "../services/api";
import { FAKE_JOBS } from "../data/fakeData";
import { Search, Filter, ChevronDown } from "lucide-react";

const EnhancedJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const titleRef = useRef(null);
  const searchRef = useRef(null);
  const jobsContainerRef = useRef(null);
  const itemsPerPage = 9;

  // Load jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const res = await getJobs();
        const jobData = res.data.jobs || FAKE_JOBS;
        setJobs(jobData);
        setFilteredJobs(jobData);
      } catch (error) {
        console.log("Using fake data");
        setJobs(FAKE_JOBS);
        setFilteredJobs(FAKE_JOBS);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // GSAP title animation
  useEffect(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }, []);

  // Filter and sort jobs
  useEffect(() => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.skills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((job) => job.type === selectedType);
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "salary-high") {
      filtered.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    } else if (sortBy === "salary-low") {
      filtered.sort((a, b) => (a.salary || 0) - (b.salary || 0));
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedType, sortBy, jobs]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  // Toggle favorite
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

  // Handle apply
  const handleApply = (jobId) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  const jobTypes = ["all", "full-time", "part-time", "contract", "remote", "hybrid"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      <AnimatedBackground3D />

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          ref={titleRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-Blue-400 to-cyan-300">Perfect Job</span>
                </h1>
                <p className="text-gray-300">Browse {jobs.length} opportunities matched to your skills</p>
              </div>

              {/* Search Bar */}
              <motion.div
                ref={searchRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3"
              >
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by title, company, or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                  />
                </div>
              </motion.div>

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3"
              >
                {/* Job Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type} className="bg-gray-900">
                      {type === "all" ? "All Types" : type.replace("-", " ").toUpperCase()}
                    </option>
                  ))}
                </select>

                {/* Sort Filter */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <option value="newest" className="bg-gray-900">
                    Newest First
                  </option>
                  <option value="salary-high" className="bg-gray-900">
                    Highest Salary
                  </option>
                  <option value="salary-low" className="bg-gray-900">
                    Lowest Salary
                  </option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Filter size={16} />
                  More Filters
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Stats Dashboard */}
          <AnimatePresence>
            {!isLoading && jobs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <JobStatsDashboard jobs={jobs} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Jobs Grid */}
          {isLoading ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  className="h-40 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl animate-pulse"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ))}
            </motion.div>
          ) : filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-3xl font-bold text-white mb-2">No jobs found</h2>
              <p className="text-gray-300 mb-8">Try adjusting your search or filters</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setSortBy("newest");
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          ) : (
            <>
              <motion.div
                ref={jobsContainerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {paginatedJobs.map((job, idx) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <EnhancedJobCard
                        job={job}
                        isFavorite={favorites.includes(job._id)}
                        onFavoriteToggle={toggleFavorite}
                        onApply={handleApply}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 flex justify-center gap-2"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setCurrentPage(page);
                        jobsContainerRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedJobsPage;
