import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp } from 'lucide-react';
import './SalaryPredictor.css';

const SalaryPredictor = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: 'India',
    experience: 0,
    skills: '',
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience' ? parseInt(value) : value,
    }));
  };

  const handlePredict = async () => {
    if (!formData.jobTitle || formData.experience < 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/predict-salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPrediction(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="salary-predictor-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="predictor-header">
        <DollarSign size={24} className="text-green-500" />
        <h3>AI Salary Predictor</h3>
      </div>

      {!prediction ? (
        <div className="predictor-form">
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="jobTitle"
              placeholder="e.g., Senior Developer"
              value={formData.jobTitle}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="experience"
                min="0"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <select name="location" value={formData.location} onChange={handleChange}>
                <option value="India">India</option>
                <option value="US">US</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              placeholder="Python, React, AWS..."
              value={formData.skills}
              onChange={handleChange}
            />
          </div>

          <button
            onClick={handlePredict}
            disabled={loading || !formData.jobTitle}
            className="predict-btn"
          >
            {loading ? 'Predicting...' : 'Predict Salary'}
          </button>
        </div>
      ) : (
        <motion.div
          className="prediction-results"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="salary-box">
            <h4>Expected Salary Range</h4>
            <motion.div
              className="salary-range"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="range-item min">
                <span className="label">Minimum</span>
                <span className="amount">{prediction.min} LPA</span>
              </div>

              <div className="range-item current">
                <span className="label">Expected</span>
                <motion.span
                  className="amount highlight"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                >
                  {prediction.current} LPA
                </motion.span>
              </div>

              <div className="range-item max">
                <span className="label">Maximum</span>
                <span className="amount">{prediction.max} LPA</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="salary-insight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TrendingUp size={20} />
            <p>
              Your {formData.jobTitle} profile with {formData.experience} years of experience
              and {formData.skills ? 'in-demand skills' : 'current skills'} can earn approximately{' '}
              <strong>{prediction.current} LPA</strong> in {formData.location}.
            </p>
          </motion.div>

          <button
            onClick={() => {
              setPrediction(null);
              setFormData({ jobTitle: '', location: 'India', experience: 0, skills: '' });
            }}
            className="predict-again-btn"
          >
            Predict Another Role
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SalaryPredictor;
