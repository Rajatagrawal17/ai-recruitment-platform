import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import './ResumeAnalyzer.css';

const ResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please enter resume text');
      return;
    }

    setLoading(true);
    setError(null);
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
        setError(null);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error: ' + err.message);
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

      {error && (
        <div className="error-message" style={{ padding: '12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

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
          {/* Provider Info */}
          {analysis.provider && (
            <div style={{ padding: '8px 12px', background: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '4px', fontSize: '12px', color: '#0c4a6e', marginBottom: '16px', textAlign: 'center' }}>
              Results from: <strong>{analysis.provider}</strong>
            </div>
          )}

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
