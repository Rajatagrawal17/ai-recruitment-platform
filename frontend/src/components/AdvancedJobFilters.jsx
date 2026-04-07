import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  X,
  Filter,
  Clock,
  Save,
  Trash2,
} from 'lucide-react';

const AdvancedJobFilters = ({
  onFilterChange,
  onSearch,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    keywords: '',
    skills: [],
    experience: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
    jobType: [],
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    const savedFilts = localStorage.getItem('savedFilters');
    if (saved) setRecentSearches(JSON.parse(saved));
    if (savedFilts) setSavedFilters(JSON.parse(savedFilts));
  }, []);

  const handleAddSkill = (skill) => {
    if (skill && !filters.skills.includes(skill)) {
      const updated = { ...filters, skills: [...filters.skills, skill] };
      setFilters(updated);
      onFilterChange(updated);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = {
      ...filters,
      skills: filters.skills.filter((s) => s !== skillToRemove),
    };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleSearch = () => {
    const searchEntry = {
      ...filters,
      timestamp: new Date().toLocaleString(),
    };
    setRecentSearches((prev) => [searchEntry, ...prev.slice(0, 4)]);
    localStorage.setItem(
      'recentSearches',
      JSON.stringify([searchEntry, ...recentSearches.slice(0, 4)])
    );
    onSearch(filters);
  };

  const handleSaveFilter = () => {
    const name = prompt('Save this filter as:');
    if (name) {
      const newSaved = {
        id: Date.now(),
        name,
        filters,
      };
      setSavedFilters((prev) => [newSaved, ...prev]);
      localStorage.setItem(
        'savedFilters',
        JSON.stringify([newSaved, ...savedFilters])
      );
    }
  };

  const handleLoadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    onFilterChange(savedFilter.filters);
    handleSearch();
  };

  const handleClearFilters = () => {
    const cleared = {
      keywords: '',
      skills: [],
      experience: '',
      salaryMin: '',
      salaryMax: '',
      location: '',
      jobType: [],
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const skillSuggestions = [
    'React',
    'JavaScript',
    'Python',
    'MongoDB',
    'Node.js',
    'TypeScript',
    'DevOps',
    'AWS',
    'Docker',
    'SQL',
  ];

  const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
  const jobTypes = ['Full-time', 'Contract', 'Remote', 'Hybrid'];
  const locations = ['New York', 'San Francisco', 'Austin', 'Seattle', 'Remote'];

  return (
    <div className="mb-6">
      {/* Main Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search jobs by title, company..."
            value={filters.keywords}
            onChange={(e) => {
              setFilters({ ...filters, keywords: e.target.value });
              onFilterChange({ ...filters, keywords: e.target.value });
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Filter size={18} />
            </motion.div>
          ) : (
            <Search size={18} />
          )}
          Search
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Filter size={18} />
          <ChevronDown
            size={18}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </motion.button>
      </motion.div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4 space-y-4"
          >
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (Select multiple)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.skills.map((skill) => (
                  <motion.div
                    key={skill}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:opacity-80"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {skillSuggestions.map((skill) => (
                  <motion.button
                    key={skill}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddSkill(skill)}
                    disabled={filters.skills.includes(skill)}
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm hover:border-indigo-600 transition-colors disabled:opacity-50"
                  >
                    + {skill}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <div className="flex gap-2 flex-wrap">
                {experienceLevels.map((level) => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilters({ ...filters, experience: level })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filters.experience === level
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 hover:border-indigo-600'
                    }`}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Salary ($K)
                </label>
                <input
                  type="number"
                  value={filters.salaryMin}
                  onChange={(e) =>
                    setFilters({ ...filters, salaryMin: e.target.value })
                  }
                  placeholder="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Salary ($K)
                </label>
                <input
                  type="number"
                  value={filters.salaryMax}
                  onChange={(e) =>
                    setFilters({ ...filters, salaryMax: e.target.value })
                  }
                  placeholder="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="flex gap-2 flex-wrap">
                {locations.map((loc) => (
                  <motion.button
                    key={loc}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilters({ ...filters, location: loc })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filters.location === loc
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 hover:border-indigo-600'
                    }`}
                  >
                    {loc}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {jobTypes.map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const updated = filters.jobType.includes(type)
                        ? filters.jobType.filter((t) => t !== type)
                        : [...filters.jobType, type];
                      setFilters({ ...filters, jobType: updated });
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filters.jobType.includes(type)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 hover:border-indigo-600'
                    }`}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveFilter}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <Save size={18} />
                Save Filter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearFilters}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2"
              >
                <X size={18} />
                Clear All
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Searches & Saved Filters */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock size={18} />
              Recent Searches
            </h3>
            <div className="space-y-2">
              {recentSearches.map((search, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ x: 5 }}
                  onClick={() => handleLoadSavedFilter({ filters: search })}
                  className="w-full text-left px-3 py-2 rounded hover:bg-indigo-50 text-sm text-gray-600 transition-colors"
                >
                  {search.keywords || 'All jobs'} · {search.timestamp}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Save size={18} />
              Saved Filters
            </h3>
            <div className="space-y-2">
              {savedFilters.map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center justify-between px-3 py-2 rounded hover:bg-indigo-50 transition-colors"
                >
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => handleLoadSavedFilter(saved)}
                    className="text-left text-sm text-gray-600 flex-1"
                  >
                    {saved.name}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSavedFilters((prev) =>
                        prev.filter((f) => f.id !== saved.id)
                      );
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdvancedJobFilters;
