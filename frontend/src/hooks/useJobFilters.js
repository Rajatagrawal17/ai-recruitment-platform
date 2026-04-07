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

  const applyFilters = useCallback(async (updatedFilters) => {
    setFilters(updatedFilters);
    setIsLoading(true);
    setCurrentPage(1);

    try {
      // Build query string
      const params = new URLSearchParams();
      
      if (updatedFilters.keywords) params.append('keyword', updatedFilters.keywords);
      if (updatedFilters.experience) params.append('experience', updatedFilters.experience);
      if (updatedFilters.salaryMin) params.append('salaryMin', updatedFilters.salaryMin);
      if (updatedFilters.salaryMax) params.append('salaryMax', updatedFilters.salaryMax);
      if (updatedFilters.location) params.append('location', updatedFilters.location);
      if (updatedFilters.jobType.length > 0) {
        updatedFilters.jobType.forEach(type => params.append('jobType', type));
      }
      if (updatedFilters.skills.length > 0) {
        updatedFilters.skills.forEach(skill => params.append('skills', skill));
      }

      params.append('page', 1);
      params.append('limit', 10);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/jobs/advanced-search?${params}`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data.jobs || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Filter error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePageChange = useCallback(async (page) => {
    setCurrentPage(page);
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      
      if (filters.keywords) params.append('keyword', filters.keywords);
      if (filters.experience) params.append('experience', filters.experience);
      if (filters.salaryMin) params.append('salaryMin', filters.salaryMin);
      if (filters.salaryMax) params.append('salaryMax', filters.salaryMax);
      if (filters.location) params.append('location', filters.location);
      if (filters.jobType.length > 0) {
        filters.jobType.forEach(type => params.append('jobType', type));
      }
      if (filters.skills.length > 0) {
        filters.skills.forEach(skill => params.append('skills', skill));
      }

      params.append('page', page);
      params.append('limit', 10);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/jobs/advanced-search?${params}`
      );

      if (!response.ok) throw new Error('Pagination failed');

      const data = await response.json();
      setResults(data.jobs || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

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
