import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfileCompletion.css';

const ProfileCompletion = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    currentLocation: '',
    fieldOfInterest: '',
    skills: '',
    linkedinUrl: '',
    resumeUrl: '',
  });

  // Fetch current profile data
  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/profile-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setFormData({
          name: data.user?.name || '',
          phoneNumber: data.user?.phoneNumber || '',
          currentLocation: data.user?.currentLocation || '',
          fieldOfInterest: (data.user?.fieldOfInterest || []).join(', '),
          skills: (data.user?.skills || []).join(', '),
          linkedinUrl: data.user?.linkedinUrl || '',
          resumeUrl: data.user?.resumeUrl || '',
        });
        setProfileCompleteness(data.profileCompleteness || 0);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        currentLocation: formData.currentLocation,
        fieldOfInterest: formData.fieldOfInterest
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
        skills: formData.skills
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
        linkedinUrl: formData.linkedinUrl,
        resumeUrl: formData.resumeUrl,
      };

      const response = await fetch('/api/users/profile-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setProfileCompleteness(data.profileCompleteness || 0);
        // Refresh user data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      weight: 15,
      required: true,
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'tel',
      weight: 10,
      placeholder: '+919999999999',
    },
    {
      name: 'currentLocation',
      label: 'Current Location',
      type: 'text',
      weight: 10,
      placeholder: 'e.g., Bangalore, Mumbai',
    },
    {
      name: 'fieldOfInterest',
      label: 'Field of Interest (comma-separated)',
      type: 'textarea',
      weight: 15,
      placeholder: 'e.g., Full Stack, Frontend, Backend',
    },
    {
      name: 'skills',
      label: 'Skills (comma-separated)',
      type: 'textarea',
      weight: 15,
      placeholder: 'e.g., React, Node.js, MongoDB, Python',
    },
    {
      name: 'linkedinUrl',
      label: 'LinkedIn URL',
      type: 'url',
      weight: 8,
      placeholder: 'https://linkedin.com/in/yourprofile',
    },
    {
      name: 'resumeUrl',
      label: 'Resume URL',
      type: 'url',
      weight: 12,
      placeholder: 'https://example.com/resume.pdf',
    },
  ];

  const calculateFieldStatus = (fieldName) => {
    const field = formData[fieldName];
    if (!field) return 'empty';
    if (typeof field === 'string') return field.trim().length > 0 ? 'filled' : 'empty';
    if (Array.isArray(field)) return field.length > 0 ? 'filled' : 'empty';
    return field ? 'filled' : 'empty';
  };

  if (loading) {
    return (
      <div className="profile-completion-page">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="profile-completion-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="profile-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} /> Back
        </button>
        <h1>Complete Your Profile</h1>
      </div>

      {/* Progress Bar */}
      <motion.div
        className="progress-section"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="progress-header">
          <h2>Profile Completeness</h2>
          <span className="completion-percentage">{profileCompleteness}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-background">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${profileCompleteness}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        {profileCompleteness === 100 && (
          <div className="completion-message success">
            <CheckCircle size={20} />
            <span>🎉 Profile is 100% complete!</span>
          </div>
        )}
        {profileCompleteness < 100 && (
          <div className="completion-message">
            <AlertCircle size={20} />
            <span>{100 - profileCompleteness}% to complete your profile</span>
          </div>
        )}
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="alert alert-error"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          className="alert alert-success"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <CheckCircle size={18} />
          <span>Profile updated successfully! Reloading...</span>
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="profile-form"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {fields.map((field, index) => (
          <motion.div
            key={field.name}
            className="form-group"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <div className="field-header">
              <label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              <span className="field-weight">+{field.weight}%</span>
            </div>

            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                rows="3"
                className={`form-input ${calculateFieldStatus(field.name)}`}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                className={`form-input ${calculateFieldStatus(field.name)}`}
              />
            )}

            <div className="field-status">
              {calculateFieldStatus(field.name) === 'filled' ? (
                <>
                  <CheckCircle size={14} className="status-icon filled" />
                  <span className="status-text">Filled</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="status-icon empty" />
                  <span className="status-text">Not filled</span>
                </>
              )}
            </div>
          </motion.div>
        ))}

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="submit-button"
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Save size={20} />
          {saving ? 'Saving Profile...' : 'Save Profile'}
        </motion.button>
      </motion.form>

      {/* Tips */}
      <motion.div
        className="tips-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3>💡 Tips for Better Profile</h3>
        <ul>
          <li>Fill all fields to unlock AI-powered job recommendations</li>
          <li>Add specific skills relevant to your target role</li>
          <li>Include your LinkedIn profile for verification</li>
          <li>Upload your resume for AI analysis</li>
          <li>Specify your fields of interest for better matches</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default ProfileCompletion;
