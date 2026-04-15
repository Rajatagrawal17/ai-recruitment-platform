import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, X, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SearchHistoryManager.css";

const SearchHistoryManager = () => {
  const [searches, setSearches] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    const saved = localStorage.getItem("jobSearchHistory");
    if (saved) {
      setSearches(JSON.parse(saved));
    }
  };

  const saveToHistory = (searchQuery) => {
    const timestamp = new Date().toLocaleString();
    const newSearch = {
      id: Date.now(),
      query: searchQuery,
      timestamp,
      date: new Date(),
    };

    const updated = [newSearch, ...searches].slice(0, 20); // Keep last 20
    setSearches(updated);
    localStorage.setItem("jobSearchHistory", JSON.stringify(updated));
  };

  const deleteSearch = (id) => {
    const updated = searches.filter((s) => s.id !== id);
    setSearches(updated);
    localStorage.setItem("jobSearchHistory", JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all search history?")) {
      setSearches([]);
      localStorage.removeItem("jobSearchHistory");
    }
  };

  const repeatSearch = (searchQuery) => {
    saveToHistory(searchQuery);
    // Navigate to filtered jobs with the search query
    navigate(`/jobs/advanced-search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Group searches by date
  const groupedSearches = searches.reduce((acc, search) => {
    const date = new Date(search.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(search);
    return acc;
  }, {});

  const getTodayDate = () => new Date().toLocaleDateString();
  const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString();
  };

  const getDisplayDate = (dateStr) => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return dateStr;
  };

  return (
    <div className="search-history-manager">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="history-container"
      >
        <div className="history-header">
          <div className="header-content">
            <Clock className="header-icon" size={32} />
            <div>
              <h1>Search History</h1>
              <p>Your recent job searches</p>
            </div>
          </div>
          {searches.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAllHistory}
              className="clear-all-btn"
            >
              <Trash2 size={18} />
              Clear All
            </motion.button>
          )}
        </div>

        {searches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="empty-state"
          >
            <Clock size={64} className="empty-icon" />
            <h2>No search history yet</h2>
            <p>Your job searches will appear here</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/jobs")}
              className="primary-btn"
            >
              Start Searching
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({searches.length})
              </button>
              <button
                className={`filter-tab ${filter === "today" ? "active" : ""}`}
                onClick={() => setFilter("today")}
              >
                Today ({searches.filter(s => 
                  new Date(s.date).toLocaleDateString() === getTodayDate()
                ).length})
              </button>
              <button
                className={`filter-tab ${filter === "week" ? "active" : ""}`}
                onClick={() => setFilter("week")}
              >
                This Week
              </button>
            </div>

            {/* Search History List */}
            <div className="history-list">
              <AnimatePresence mode="popLayout">
                {Object.entries(groupedSearches).map(([date, items]) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="history-group"
                  >
                    <div className="group-date">{getDisplayDate(date)}</div>
                    <div className="search-items">
                      {items.map((search) => (
                        <motion.div
                          key={search.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          whileHover={{ x: 4 }}
                          className="search-item"
                        >
                          <div className="search-content">
                            <p className="search-query">{search.query}</p>
                            <span className="search-time">
                              {new Date(search.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="search-actions">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => repeatSearch(search.query)}
                              className="action-btn repeat-btn"
                              title="Repeat search"
                            >
                              <RotateCcw size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteSearch(search.id)}
                              className="action-btn delete-btn"
                              title="Delete search"
                            >
                              <X size={18} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default SearchHistoryManager;
