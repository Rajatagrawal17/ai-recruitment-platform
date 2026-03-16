import React, { useEffect, useState } from "react";

const SearchHistory = ({ onSearchSelect }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) {
      setHistory(JSON.parse(saved).slice(0, 5)); // Show last 5 searches
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("searchHistory");
    setHistory([]);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.95))",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
        border: "1px solid #e1e8ed"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h4 style={{ margin: 0, color: "#667eea" }}>🕐 Recent Searches</h4>
        <button
          onClick={clearHistory}
          style={{
            background: "none",
            border: "none",
            color: "#999",
            cursor: "pointer",
            fontSize: "0.85rem",
            textDecoration: "underline"
          }}
        >
          Clear
        </button>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {history.map((search, index) => (
          <button
            key={index}
            onClick={() => onSearchSelect(search)}
            style={{
              padding: "0.4rem 0.8rem",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              borderRadius: "20px",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
};

export const saveSearchToHistory = (searchTerm) => {
  if (searchTerm.trim()) {
    const saved = localStorage.getItem("searchHistory");
    let history = saved ? JSON.parse(saved) : [];
    
    // Remove duplicates and add new search to the beginning
    history = [searchTerm, ...history.filter(s => s !== searchTerm)].slice(0, 10);
    
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }
};

export default SearchHistory;
