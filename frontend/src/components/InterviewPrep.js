import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, BookOpen, Lightbulb, AlertCircle } from 'lucide-react';
import { getApiEndpoint } from '../utils/apiConfig';
import './InterviewPrep.css';

const InterviewPrep = ({ jobId, jobTitle }) => {
  const [questions, setQuestions] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [tab, setTab] = useState('questions');
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [manualJobTitle, setManualJobTitle] = useState(jobTitle || '');
  const [manualJobDescription, setManualJobDescription] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const endpoint = getApiEndpoint('/jobs');
        const response = await fetch(endpoint);
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
          if (!selectedJobId && data.jobs.length > 0) {
            setSelectedJobId(data.jobs[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load jobs for interview prep:', err);
      }
    };

    fetchJobs();
  }, []);

  const getRequestPayload = () => {
    if (selectedJobId) {
      return { jobId: selectedJobId };
    }

    return {
      jobTitle: manualJobTitle,
      jobDescription: manualJobDescription,
    };
  };

  const validateInput = () => {
    if (selectedJobId) return true;
    if (manualJobTitle.trim()) return true;

    setError('Please select a job or enter a target role.');
    return false;
  };

  const handleGenerateQuestions = async () => {
    if (!validateInput()) return;

    setLoading(true);
    setError(null);
    try {
      const endpoint = getApiEndpoint('/ai/interview-questions');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...getRequestPayload(),
          count: 5,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to generate interview questions');
      }

      if (data.success) {
        setQuestions(data.data.questions);
        setTab('questions');
        setSelectedQuestion(0);
      }
    } catch (err) {
      setError(err.message || 'Unable to generate interview questions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTips = async () => {
    if (!validateInput()) return;

    setLoading(true);
    setError(null);
    try {
      const endpoint = getApiEndpoint('/ai/interview-tips');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(getRequestPayload()),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to generate interview tips');
      }

      if (data.success) {
        setTips(data.data.tips);
        setTab('tips');
      }
    } catch (err) {
      setError(err.message || 'Unable to generate interview tips');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="interview-prep-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="prep-header">
        <Mic size={24} className="text-blue-500" />
        <div>
          <h3>Interview Preparation</h3>
          {jobTitle && <p>{jobTitle}</p>}
        </div>
      </div>

      <div className="prep-actions" style={{ marginBottom: '1rem' }}>
        <div style={{ width: '100%' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem' }}>Target Job</label>
          {jobs.length > 0 ? (
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setError(null);
              }}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px' }}
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter target role, e.g. Frontend Developer"
                value={manualJobTitle}
                onChange={(e) => {
                  setManualJobTitle(e.target.value);
                  setError(null);
                }}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', marginBottom: '0.5rem' }}
              />
              <textarea
                rows={3}
                placeholder="Optional: Add job description for better interview tips"
                value={manualJobDescription}
                onChange={(e) => setManualJobDescription(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px' }}
              />
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="tip-card general" style={{ marginBottom: '1rem', color: '#fca5a5' }}>
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {questions.length === 0 && tips.length === 0 ? (
        <div className="prep-actions">
          <button
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="action-btn primary"
          >
            <BookOpen size={20} />
            {loading ? 'Generating...' : 'Generate Interview Questions'}
          </button>

          <button
            onClick={handleGenerateTips}
            disabled={loading}
            className="action-btn secondary"
          >
            <Lightbulb size={20} />
            {loading ? 'Generating...' : 'Get Interview Tips'}
          </button>
        </div>
      ) : (
        <div className="prep-content">
          {/* Tabs */}
          <div className="prep-tabs">
            <button
              className={`tab ${tab === 'questions' ? 'active' : ''}`}
              onClick={() => setTab('questions')}
            >
              <BookOpen size={18} />
              Questions ({questions.length})
            </button>
            <button
              className={`tab ${tab === 'tips' ? 'active' : ''}`}
              onClick={() => setTab('tips')}
            >
              <Lightbulb size={18} />
              Tips ({tips.length})
            </button>
          </div>

          {/* Questions Tab */}
          <AnimatePresence>
            {tab === 'questions' && questions.length > 0 && (
              <motion.div
                className="questions-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="question-display">
                  <motion.div
                    key={selectedQuestion}
                    className="question-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="question-number">
                      Question {selectedQuestion + 1} of {questions.length}
                    </span>
                    <div className="question-type">
                      {questions[selectedQuestion].type === 'technical'
                        ? '💻 Technical'
                        : '🎯 Behavioral'}
                    </div>
                    <p className="question-text">{questions[selectedQuestion].question}</p>

                    {questions[selectedQuestion].skill && (
                      <div className="question-skill">
                        <span>Focus Skill:</span>
                        <strong>{questions[selectedQuestion].skill}</strong>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Navigation */}
                <div className="question-nav">
                  <button
                    onClick={() =>
                      setSelectedQuestion(Math.max(0, selectedQuestion - 1))
                    }
                    disabled={selectedQuestion === 0}
                  >
                    ← Previous
                  </button>

                  <div className="question-dots">
                    {questions.map((_, idx) => (
                      <button
                        key={idx}
                        className={`dot ${idx === selectedQuestion ? 'active' : ''}`}
                        onClick={() => setSelectedQuestion(idx)}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setSelectedQuestion(
                        Math.min(questions.length - 1, selectedQuestion + 1)
                      )
                    }
                    disabled={selectedQuestion === questions.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips Tab */}
          <AnimatePresence>
            {tab === 'tips' && tips.length > 0 && (
              <motion.div
                className="tips-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {tips.map((tip, idx) => (
                  <motion.div
                    key={idx}
                    className={`tip-card ${tip.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span className="tip-icon">
                      {tip.type === 'strength' && '💪'}
                      {tip.type === 'growth' && '📈'}
                      {tip.type === 'general' && '💡'}
                    </span>
                    <p>{tip.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset Button */}
          <button
            onClick={() => {
              setQuestions([]);
              setTips([]);
              setSelectedQuestion(0);
            }}
            className="reset-btn"
          >
            Generate New Content
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default InterviewPrep;
