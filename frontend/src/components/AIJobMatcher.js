import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { getApiEndpoint } from '../utils/apiConfig';
import './AIJobMatcher.css';

const AIJobMatcher = ({ candidateId, onJobsMatched }) => {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatchedJobs();
  }, [candidateId]);

  const fetchMatchedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = getApiEndpoint('/ai/match-jobs');
      const payload = candidateId ? { candidateId } : {};
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to fetch matched jobs');
      }

      if (data.success) {
        setMatchedJobs(data.data.slice(0, 5));
        onJobsMatched?.(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="ai-matcher-container">
        <div className="loading-skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-matcher-container error">
        <AlertCircle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="ai-matcher-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="matcher-header">
        <div className="header-content">
          <Zap size={24} className="text-cyan-500" />
          <div>
            <h3>AI Job Matcher</h3>
            <p>Jobs matched to your profile</p>
          </div>
        </div>
        <span className="job-count">{matchedJobs.length} matches</span>
      </div>

      <div className="matched-jobs-list">
        {matchedJobs.map((job, idx) => (
          <motion.div
            key={job._id}
            className="matched-job-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="job-info">
              <h4>{job.title}</h4>
              <p className="company">{job.company}</p>
              <div className="matched-skills">
                {job.matchedSkills?.slice(0, 3).map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className={`match-score ${getScoreColor(job.matchScore)}`}>
              <span className="score-number">{job.matchScore}%</span>
              <span className="score-label">Match</span>
            </div>
          </motion.div>
        ))}
      </div>

      {matchedJobs.length === 0 && (
        <div className="no-matches">
          <p>No jobs matched yet. Complete your profile to get better matches.</p>
        </div>
      )}
    </motion.div>
  );
};

export default AIJobMatcher;
