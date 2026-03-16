import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Toast from "../components/Toast";
import JobCard from "../components/JobCard";
import { FAKE_JOBS } from "../data/fakeData";
import "./Jobs.css";

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filters
  const [filters, setFilters] = useState({
    jobType: [],
    experienceLevel: 0,
    salaryRange: [0, 200000],
    skills: []
  });

  const [expandedFilters, setExpandedFilters] = useState({
    jobType: true,
    experience: true,
    salary: true,
    skills: true,
    location: true
  });

  useEffect(() => {
    loadFavorites();
    fetchJobs();
  }, []);

  const loadFavorites = () => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  };

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data.jobs || FAKE_JOBS);
      setFilteredJobs(res.data.jobs || FAKE_JOBS);
    } catch (error) {
      // Use fake data if API fails
      console.log("Using fake data for demonstration");
      setJobs(FAKE_JOBS);
      setFilteredJobs(FAKE_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [searchTerm, locationTerm, filters, sortBy, jobs, favorites]);

  const applyFilters = () => {
    let filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        !locationTerm || job.location?.toLowerCase().includes(locationTerm.toLowerCase());

      const matchesJobType =
        filters.jobType.length === 0 || filters.jobType.includes(job.jobType);

      const matchesSalary =
        (!job.salary || job.salary >= filters.salaryRange[0]) &&
        (!job.salary || job.salary <= filters.salaryRange[1]);

      return matchesSearch && matchesLocation && matchesJobType && matchesSalary;
    });

    // Apply sorting
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "salary") {
      filtered.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    }

    setFilteredJobs(filtered);
  };

  const toggleFavorite = (jobId, jobTitle) => {
    let updated;
    if (favorites.includes(jobId)) {
      updated = favorites.filter((id) => id !== jobId);
      setToastMessage(`Removed from favorites ❌`);
    } else {
      updated = [...favorites, jobId];
      setToastMessage(`Added to favorites ❤️`);
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    setShowToast(true);
  };

  const handleApplyClick = (jobId) => {
    navigate(`/apply/${jobId}`);
  };

  const toggleFilter = (filterName) => {
    setExpandedFilters({
      ...expandedFilters,
      [filterName]: !expandedFilters[filterName]
    });
  };

  const handleJobTypeChange = (type) => {
    setFilters({
      ...filters,
      jobType: filters.jobType.includes(type)
        ? filters.jobType.filter((t) => t !== type)
        : [...filters.jobType, type]
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setLocationTerm("");
    setFilters({
      jobType: [],
      experienceLevel: 0,
      salaryRange: [0, 200000],
      skills: []
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIdx, startIdx + itemsPerPage);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="jobs-container">
      {/* Animated Background Orbs */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Hero Banner */}
      <div className="jobs-hero">
        <h1 className="jobs-hero-title">Find Your Dream Job</h1>
        <p className="jobs-hero-subtitle">Discover opportunities matched to your skills</p>

        <div className="hero-search-wrapper">
          <div className="hero-search">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search jobs by title or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hero-search-input"
            />
          </div>

          <div className="hero-location">
            <svg className="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <input
              type="text"
              placeholder="Location"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              className="hero-location-input"
            />
          </div>

          <button className="hero-search-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            Search
          </button>
        </div>
      </div>

      <div className="jobs-content">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-header">
            <h3>Filters</h3>
            {Object.values(filters).some((v) => (Array.isArray(v) && v.length > 0) || v !== 0) && (
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear All
              </button>
            )}
          </div>

          {/* Job Type Filter */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleFilter("jobType")}
            >
              <span>Job Type</span>
              <svg className={`chevron ${expandedFilters.jobType ? "open" : ""}`} viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
            {expandedFilters.jobType && (
              <div className="filter-options">
                {["Full-time", "Part-time", "Contract", "Remote"].map((type) => (
                  <label key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.jobType.includes(type)}
                      onChange={() => handleJobTypeChange(type)}
                    />
                    <span className="checkbox-custom"></span>
                    {type}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Experience Level Filter */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleFilter("experience")}
            >
              <span>Experience Level</span>
              <svg className={`chevron ${expandedFilters.experience ? "open" : ""}`} viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
            {expandedFilters.experience && (
              <div className="filter-slider">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.experienceLevel}
                  onChange={(e) =>
                    setFilters({ ...filters, experienceLevel: parseInt(e.target.value) })
                  }
                  className="range-input"
                />
                <div className="range-labels">
                  <span>0 years</span>
                  <span>{filters.experienceLevel}+ years</span>
                </div>
              </div>
            )}
          </div>

          {/* Salary Range Filter */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleFilter("salary")}
            >
              <span>Salary Range</span>
              <svg className={`chevron ${expandedFilters.salary ? "open" : ""}`} viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
            {expandedFilters.salary && (
              <div className="filter-salary">
                <div className="salary-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.salaryRange[0]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        salaryRange: [parseInt(e.target.value), filters.salaryRange[1]]
                      })
                    }
                    className="salary-input"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.salaryRange[1]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        salaryRange: [filters.salaryRange[0], parseInt(e.target.value)]
                      })
                    }
                    className="salary-input"
                  />
                </div>
                <div className="salary-display">
                  ${(filters.salaryRange[0] / 1000).toFixed(0)}K - ${(filters.salaryRange[1] / 1000).toFixed(0)}K
                </div>
              </div>
            )}
          </div>

          {/* Location Filter */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleFilter("location")}
            >
              <span>Location</span>
              <svg className={`chevron ${expandedFilters.location ? "open" : ""}`} viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
          </div>
        </aside>

        {/* Jobs Grid Section */}
        <main className="jobs-main">
          {/* Top Bar */}
          <div className="jobs-top-bar">
            <div className="jobs-count">
              <span className="count-number">{filteredJobs.length}</span>
              <span className="count-label">jobs found</span>
            </div>

            <div className="sort-control">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="relevance">Relevance</option>
                <option value="date">Newest First</option>
                <option value="salary">Highest Salary</option>
              </select>
            </div>
          </div>

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <EmptyState onClearFilters={clearAllFilters} />
          ) : (
            <>
              <div className="jobs-grid">
                {paginatedJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isApplied={job.isApplied || false}
                    matchScore={job.matchScore}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${page === currentPage ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="jobs-container">
    <div className="background-orbs">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
    </div>
    <div className="jobs-hero skeleton-hero"></div>
    <div className="jobs-content">
      <aside className="filter-sidebar skeleton-sidebar"></aside>
      <main className="jobs-main">
        <div className="skeleton-top-bar"></div>
        <div className="jobs-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </main>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ error }) => (
  <div className="jobs-container">
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h2>Unable to Load Jobs</h2>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ onClearFilters }) => (
  <div className="empty-state-container">
    <div className="empty-icon">🔍</div>
    <h2>No jobs match your filters</h2>
    <p>Try adjusting your search criteria</p>
    <button className="btn btn-secondary" onClick={onClearFilters}>
      Clear Filters
    </button>
  </div>
);

export default Jobs;