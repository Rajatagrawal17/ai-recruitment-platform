import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import './ResumeAnalyzer.css';

const ResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ resumeText }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="resume-analyzer-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="analyzer-header">
        <FileText size={24} className="text-cyan-500" />
        <h3>Resume Analyzer</h3>
      </div>

      {!analysis ? (
        <div className="analyzer-input">
          <textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim()}
            className="analyze-btn"
          >
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </div>
      ) : (
        <motion.div
          className="analysis-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* ATS Score */}
          <div className="ats-score">
            <div className="score-card">
              <h4>ATS Score</h4>
              <motion.div
                className="score-circle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <span className="score">{analysis.atsScore}</span>
                <span className="score-max">/100</span>
              </motion.div>
              <p className="score-status">
                {analysis.atsScore >= 70
                  ? '✅ Good for ATS'
                  : '⚠️ Needs improvement'}
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="skills-section">
            <h4>Detected Skills ({analysis.skills.length})</h4>
            <div className="skills-grid">
              {analysis.skills.map((skill) => (
                <span key={skill} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="experience-section">
            <h4>Experience</h4>
            <p>{analysis.experience.years} years detected</p>
          </div>

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div className="suggestions">
              <h4>Suggestions for Improvement</h4>
              {analysis.suggestions.map((suggestion, idx) => (
                <div key={idx} className={`suggestion ${suggestion.type}`}>
                  {suggestion.type === 'warning' && <AlertCircle size={16} />}
                  {suggestion.type !== 'warning' && <CheckCircle size={16} />}
                  <p>{suggestion.message}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setAnalysis(null);
              setResumeText('');
            }}
            className="analyze-again-btn"
          >
            Analyze Another Resume
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResumeAnalyzer;
