import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Toast from "../components/Toast";
import JobCard from "../components/JobCard";
import { FAKE_JOBS } from "../data/fakeData";
import "./Jobs.css";

const normalizeJobType = (job) => {
  const rawType = String(job?.type || job?.jobType || "").toLowerCase();

  if (rawType.includes("remote")) return "remote";
  if (rawType.includes("part")) return "part-time";
  if (rawType.includes("contract")) return "contract";
  return "full-time";
};

const extractSalaryNumber = (salary) => {
  if (typeof salary === "number") return salary;

  if (Array.isArray(salary)) {
    const values = salary.map((value) => Number(value)).filter((value) => Number.isFinite(value));
    if (!values.length) return null;
    return Math.max(...values);
  }

  if (typeof salary === "string") {
    const values = salary
      .match(/\d+/g)
      ?.map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (!values?.length) return null;
    return Math.max(...values);
  }

  return null;
};

const extractExperienceYears = (job) => {
  const numeric = Number(job?.experience ?? job?.yearsOfExperience);
  if (Number.isFinite(numeric)) return numeric;

  const label = String(job?.experienceLevel || "");
  const numbers = label.match(/\d+/g)?.map((value) => Number(value)) || [];
  if (!numbers.length) return 0;
  return Math.max(...numbers);
};

const normalizeSkill = (value) => String(value || "").trim().toLowerCase();

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
    company: "",
    experienceLevel: 0,
    salaryRange: [0, 200000],
    skills: [],
    remoteOnly: false,
    minMatchScore: 0,
    onlyFavorites: false,
  });

  const [expandedFilters, setExpandedFilters] = useState({
    jobType: true,
    company: true,
    experience: true,
    salary: true,
    skills: true,
    aiScore: true,
    location: true,
  });

  const availableJobTypes = useMemo(() => {
    return ["full-time", "part-time", "contract", "remote"];
  }, []);

  const availableCompanies = useMemo(() => {
    return Array.from(new Set(jobs.map((job) => String(job.company || "").trim()).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [jobs]);

  const availableSkills = useMemo(() => {
    return Array.from(
      new Set(
        jobs
          .flatMap((job) => (Array.isArray(job.skills) ? job.skills : []))
          .map((skill) => String(skill).trim())
          .filter(Boolean)
      )
    )
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 20);
  }, [jobs]);

  const hasActiveFilters =
    searchTerm.trim() ||
    locationTerm.trim() ||
    filters.jobType.length > 0 ||
    filters.company ||
    filters.experienceLevel > 0 ||
    filters.salaryRange[0] > 0 ||
    filters.salaryRange[1] < 200000 ||
    filters.skills.length > 0 ||
    filters.remoteOnly ||
    filters.minMatchScore > 0 ||
    filters.onlyFavorites;

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
  }, [searchTerm, locationTerm, filters, sortBy, jobs, favorites]);

  const applyFilters = () => {
    let filtered = jobs.filter((job) => {
      const normalizedSearch = searchTerm.toLowerCase();
      const normalizedLocation = locationTerm.toLowerCase();
      const normalizedType = normalizeJobType(job);
      const normalizedCompany = String(job.company || "").trim();
      const salaryValue = extractSalaryNumber(job.salary);
      const yearsOfExperience = extractExperienceYears(job);
      const normalizedSkills = (job.skills || []).map((skill) => normalizeSkill(skill));
      const normalizedTitle = String(job.title || "").toLowerCase();
      const normalizedDescription = String(job.description || "").toLowerCase();
      const normalizedCompanyText = normalizedCompany.toLowerCase();
      const normalizedJobLocation = String(job.location || "").toLowerCase();
      const searchableSkills = normalizedSkills.join(" ");

      const matchesSearch =
        !normalizedSearch ||
        normalizedTitle.includes(normalizedSearch) ||
        normalizedDescription.includes(normalizedSearch) ||
        normalizedCompanyText.includes(normalizedSearch) ||
        searchableSkills.includes(normalizedSearch);

      const matchesLocation =
        !normalizedLocation || normalizedJobLocation.includes(normalizedLocation);

      const matchesJobType =
        filters.jobType.length === 0 || filters.jobType.includes(normalizedType);

      const matchesCompany = !filters.company || filters.company === normalizedCompany;

      const matchesExperience = yearsOfExperience >= filters.experienceLevel;

      const matchesSalary =
        salaryValue === null ||
        (salaryValue >= filters.salaryRange[0] && salaryValue <= filters.salaryRange[1]);

      const matchesSkills =
        filters.skills.length === 0 ||
        filters.skills.every((requiredSkill) => normalizedSkills.includes(normalizeSkill(requiredSkill)));

      const matchesRemote =
        !filters.remoteOnly ||
        normalizedType === "remote" ||
        normalizedJobLocation.includes("remote") ||
        normalizedJobLocation.includes("work from home");

      const matchScore = Number(job.matchScore);
      const matchesAiScore =
        filters.minMatchScore === 0 ||
        (Number.isFinite(matchScore) && matchScore >= filters.minMatchScore);

      const matchesFavorite = !filters.onlyFavorites || favorites.includes(job._id);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesJobType &&
        matchesCompany &&
        matchesExperience &&
        matchesSalary &&
        matchesSkills &&
        matchesRemote &&
        matchesAiScore &&
        matchesFavorite
      );
    });

    // Apply sorting
    if (sortBy === "date") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt || b.postedDate || 0) - new Date(a.createdAt || a.postedDate || 0)
      );
    } else if (sortBy === "salary") {
      filtered.sort(
        (a, b) =>
          (extractSalaryNumber(b.salary) || 0) - (extractSalaryNumber(a.salary) || 0)
      );
    } else {
      filtered.sort((a, b) => {
        const scoreA = Number(a.matchScore) || 0;
        const scoreB = Number(b.matchScore) || 0;
        const dateA = new Date(a.createdAt || a.postedDate || 0).getTime() || 0;
        const dateB = new Date(b.createdAt || b.postedDate || 0).getTime() || 0;
        return scoreB - scoreA || dateB - dateA;
      });
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
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

  const handleSkillToggle = (skill) => {
    setFilters({
      ...filters,
      skills: filters.skills.includes(skill)
        ? filters.skills.filter((item) => item !== skill)
        : [...filters.skills, skill],
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setLocationTerm("");
    setFilters({
      jobType: [],
      company: "",
      experienceLevel: 0,
      salaryRange: [0, 200000],
      skills: [],
      remoteOnly: false,
      minMatchScore: 0,
      onlyFavorites: false,
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
            {hasActiveFilters && (
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
                {availableJobTypes.map((type) => (
                  <label key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.jobType.includes(type)}
                      onChange={() => handleJobTypeChange(type)}
                    />
                    <span className="checkbox-custom"></span>
                    {type.replace(/(^|-)\w/g, (char) => char.toUpperCase())}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Company Filter */}
          <div className="filter-section">
            <button className="filter-section-header" onClick={() => toggleFilter("company")}>
              <span>Company</span>
              <svg className={`chevron ${expandedFilters.company ? "open" : ""}`} viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
            {expandedFilters.company && (
              <div className="filter-options">
                <select
                  className="filter-select"
                  value={filters.company}
                  onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                >
                  <option value="">All companies</option>
                  {availableCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
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

          {/* Skills Filter */}
          <div className="filter-section">
            <button className="filter-section-header" onClick={() => toggleFilter("skills")}>
              <span>Skills</span>
              <svg className={`chevron ${expandedFilters.skills ? "open" : ""}`} viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
            {expandedFilters.skills && (
              <div className="filter-options">
                <div className="skill-chip-grid">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className={`skill-chip-filter ${filters.skills.includes(skill) ? "active" : ""}`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Toggles */}
          <div className="filter-section">
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.remoteOnly}
                  onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                Remote only
              </label>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.onlyFavorites}
                  onChange={(e) => setFilters({ ...filters, onlyFavorites: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                Favorites only
              </label>
            </div>
          </div>

          {/* AI Match Score Filter */}
          <div className="filter-section">
            <button className="filter-section-header" onClick={() => toggleFilter("aiScore")}>
              <span>Minimum AI Match</span>
              <svg className={`chevron ${expandedFilters.aiScore ? "open" : ""}`} viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
            {expandedFilters.aiScore && (
              <div className="filter-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minMatchScore}
                  onChange={(e) =>
                    setFilters({ ...filters, minMatchScore: parseInt(e.target.value, 10) || 0 })
                  }
                  className="range-input"
                />
                <div className="range-labels">
                  <span>0%</span>
                  <span>{filters.minMatchScore}%+</span>
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
            {expandedFilters.location && (
              <div className="filter-options">
                <p className="filter-note">Use the location search box above for city/country filtering.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Jobs Grid Section */}
        <main className="jobs-main">
          {hasActiveFilters && (
            <div className="active-filters-bar">
              <span className="active-filters-title">Active filters:</span>
              <div className="active-filters-list">
                {searchTerm && <span className="active-filter-chip">Search: {searchTerm}</span>}
                {locationTerm && <span className="active-filter-chip">Location: {locationTerm}</span>}
                {filters.company && <span className="active-filter-chip">Company: {filters.company}</span>}
                {filters.jobType.map((type) => (
                  <span key={type} className="active-filter-chip">
                    Type: {type}
                  </span>
                ))}
                {filters.skills.map((skill) => (
                  <span key={skill} className="active-filter-chip">
                    Skill: {skill}
                  </span>
                ))}
                {filters.remoteOnly && <span className="active-filter-chip">Remote only</span>}
                {filters.onlyFavorites && <span className="active-filter-chip">Favorites only</span>}
                {filters.minMatchScore > 0 && (
                  <span className="active-filter-chip">AI Match: {filters.minMatchScore}%+</span>
                )}
              </div>
            </div>
          )}

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