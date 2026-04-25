import { useState, useCallback } from 'react';

export const useJobFilters = () => {
  const [filters, setFilters] = useState({
    keywords: '',
    skills: [],
    experience: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
    jobType: [],
  });

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allJobs, setAllJobs] = useState([]);

  const applyFilters = useCallback(async (updatedFilters) => {
    setFilters(updatedFilters);
    setIsLoading(true);
    setCurrentPage(1);

    try {
      // Fetch all jobs first if not already fetched
      let jobsToFilter = allJobs;
      if (jobsToFilter.length === 0) {
        const response = await fetch('http://localhost:5000/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        jobsToFilter = data.jobs || [];
        setAllJobs(jobsToFilter);
      }

      // Client-side filtering
      let filtered = jobsToFilter;

      // Keywords filter
      if (updatedFilters.keywords) {
        const keyword = updatedFilters.keywords.toLowerCase();
        filtered = filtered.filter(job =>
          job.title?.toLowerCase().includes(keyword) ||
          job.company?.toLowerCase().includes(keyword) ||
          job.description?.toLowerCase().includes(keyword)
        );
      }

      // Skills filter
      if (updatedFilters.skills.length > 0) {
        filtered = filtered.filter(job => {
          const jobSkills = (job.skills || []).map(s => s.toLowerCase());
          return updatedFilters.skills.some(skill =>
            jobSkills.some(js => js.includes(skill.toLowerCase()))
          );
        });
      }

      // Salary filter
      if (updatedFilters.salaryMin || updatedFilters.salaryMax) {
        filtered = filtered.filter(job => {
          const salary = job.salary || 0;
          const min = updatedFilters.salaryMin ? parseInt(updatedFilters.salaryMin) : 0;
          const max = updatedFilters.salaryMax ? parseInt(updatedFilters.salaryMax) : Infinity;
          return salary >= min && salary <= max;
        });
      }

      // Location filter
      if (updatedFilters.location) {
        filtered = filtered.filter(job =>
          job.location?.toLowerCase().includes(updatedFilters.location.toLowerCase())
        );
      }

      // Job type filter
      if (updatedFilters.jobType.length > 0) {
        filtered = filtered.filter(job =>
          updatedFilters.jobType.includes(job.type)
        );
      }

      setResults(filtered);
      setTotalPages(Math.ceil(filtered.length / 10));
    } catch (error) {
      console.error('Filter error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [allJobs]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Page change is handled by displaying paginated results from the filtered list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    filters,
    results,
    isLoading,
    currentPage,
    totalPages,
    applyFilters,
    handlePageChange,
  };
};

export default useJobFilters;
