import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import AdvancedJobFilters from "../components/AdvancedJobFilters";
import JobCard from "../components/JobCard";
import "./Jobs.css";

const FilteredJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/jobs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredJobs = useMemo(() => {
    if (!searchPerformed) return jobs;

    return jobs.filter((job) => {
      // Keywords filter
      if (filters.keywords) {
        const searchTerm = filters.keywords.toLowerCase();
        if (
          !job.title.toLowerCase().includes(searchTerm) &&
          !job.company.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }

      // Experience level filter
      if (filters.experience) {
        if (job.experienceLevel !== filters.experience) {
          return false;
        }
      }

      // Salary range filter
      if (filters.salaryMin || filters.salaryMax) {
        const jobSalary = parseInt(job.salary?.replace(/\D/g, "") || 0);
        const minSalary = parseInt(filters.salaryMin || "0") * 1000;
        const maxSalary = parseInt(filters.salaryMax || "9999999") * 1000;

        if (jobSalary < minSalary || jobSalary > maxSalary) {
          return false;
        }
      }

      // Location filter
      if (filters.location) {
        if (!job.location?.includes(filters.location)) {
          return false;
        }
      }

      // Job type filter
      if (filters.jobType && filters.jobType.length > 0) {
        if (!filters.jobType.includes(job.type)) {
          return false;
        }
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
        const hasAllSkills = filters.skills.some((skill) =>
          jobSkills.some((js) => js.includes(skill.toLowerCase()))
        );
        if (!hasAllSkills) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, filters, searchPerformed]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    setSearchPerformed(true);
  };

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <div className="header-content">
          <h1>🔍 Advanced Job Search</h1>
          <p>Filter jobs by salary, experience, skills, and more</p>
        </div>
      </div>

      <div className="jobs-container">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          <AdvancedJobFilters
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            isLoading={loading}
          />
        </div>

        {/* Jobs List */}
        <div className="jobs-list-section">
          {loading && !searchPerformed ? (
            <div className="loading-state">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="spinner"
              />
              <p>Loading jobs...</p>
            </div>
          ) : searchPerformed && filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="empty-state"
            >
              <h2>No jobs found</h2>
              <p>Try adjusting your filters or search criteria</p>
            </motion.div>
          ) : (
            <>
              <div className="results-header">
                <h2>
                  {filteredJobs.length} Job{filteredJobs.length !== 1 ? "s" : ""}{" "}
                  Found
                </h2>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="jobs-grid"
              >
                {filteredJobs.map((job) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilteredJobs;
