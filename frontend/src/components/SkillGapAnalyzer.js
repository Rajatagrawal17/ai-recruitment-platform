import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import { getApiEndpoint } from '../utils/apiConfig';
import './SkillGapAnalyzer.css';

const SkillGapAnalyzer = () => {
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSkillInput = (value, type) => {
    const skills = value.split(',').map((s) => s.trim()).filter(Boolean);
    if (type === 'candidate') {
      setCandidateSkills(skills);
    } else {
      setRequiredSkills(skills);
    }
  };

  const handleAnalyze = async () => {
    if (!candidateSkills.length || !requiredSkills.length) {
      setError('Please enter both your skills and required skills.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const endpoint = getApiEndpoint('/ai/skill-gap');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ candidateSkills, requiredSkills }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Skill gap analysis failed');
      }

      setAnalysis(data.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Skill gap analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="skill-gap-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="gap-header">
        <TrendingUp size={24} className="text-purple-500" />
        <h3>Skill Gap Analyzer</h3>
      </div>

      {error && (
        <div style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#7f1d1d22', color: '#fecaca', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!analysis ? (
        <div className="gap-input">
          <div className="input-group">
            <label>Your Skills (comma-separated)</label>
            <input
              type="text"
              placeholder="Python, JavaScript, React..."
              value={candidateSkills.join(', ')}
              onChange={(e) => handleSkillInput(e.target.value, 'candidate')}
            />
          </div>

          <div className="input-group">
            <label>Required Skills (comma-separated)</label>
            <input
              type="text"
              placeholder="Python, JavaScript, TypeScript, Node.js..."
              value={requiredSkills.join(', ')}
              onChange={(e) => handleSkillInput(e.target.value, 'required')}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !candidateSkills.length || !requiredSkills.length}
            className="analyze-gap-btn"
          >
            {loading ? 'Analyzing...' : 'Analyze Gap'}
          </button>
        </div>
      ) : (
        <motion.div
          className="gap-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Match Percentage */}
          <div className="match-percentage">
            <div className="percentage-circle">
              <motion.div
                className="circle-fill"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: `${analysis.matchPercentage}%`,
                }}
              />
              <span>{analysis.matchPercentage}%</span>
            </div>
            <p>Skill Match</p>
          </div>

          {/* Skills You Have */}
          <div className="skills-section">
            <h4>✅ Skills You Have ({analysis.hasSkills.length})</h4>
            <div className="skills-list">
              {analysis.hasSkills.map((skill) => (
                <span key={skill} className="skill-have">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Skills to Learn */}
          {analysis.missingSkills.length > 0 && (
            <div className="skills-section">
              <h4>📚 Skills to Learn ({analysis.missingSkills.length})</h4>
              <div className="skills-list">
                {analysis.missingSkills.map((skill) => (
                  <span key={skill} className="skill-missing">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Path */}
          {analysis.learningPath?.length > 0 && (
            <div className="learning-path">
              <h4>
                <BookOpen size={18} /> Learning Path
              </h4>
              {analysis.learningPath.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="learning-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="item-header">
                    <h5>{item.skill}</h5>
                    <span className="weeks">{item.estimatedWeeks} weeks</span>
                  </div>
                  <ul className="resources">
                    {item.resources.map((resource, ridx) => (
                      <li key={ridx}>{resource}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setAnalysis(null);
              setCandidateSkills([]);
              setRequiredSkills([]);
            }}
            className="analyze-again-btn"
          >
            Analyze Different Skills
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SkillGapAnalyzer;
