import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import './ProfileCompletion.css';

const ProfileCompletion = () => {
  const { user } = useAuth();
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
    resumeFile: null, // Store actual file
    resumeUrl: '', // Display filename
  });

  // Fetch current profile data
  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📥 Fetching profile...");
      
      const response = await API.get('/users/profile-info');
      console.log("📥 Response data:", response.data);
      
      if (response.data.success && response.data.user) {
        console.log("✅ User data received:", response.data.user);
        const newFormData = {
          name: response.data.user.name || '',
          phoneNumber: response.data.user.phoneNumber || '',
          currentLocation: response.data.user.currentLocation || '',
          fieldOfInterest: (Array.isArray(response.data.user.fieldOfInterest) ? response.data.user.fieldOfInterest : []).join(', '),
          skills: (Array.isArray(response.data.user.skills) ? response.data.user.skills : []).join(', '),
          linkedinUrl: response.data.user.linkedinUrl || '',
          resumeFile: null,
          resumeUrl: response.data.user.resumeUrl ? response.data.user.resumeUrl.split('/').pop() : '',
        };
        console.log("📝 Setting form data:", newFormData);
        setFormData(newFormData);
        setProfileCompleteness(response.data.profileCompleteness || 0);
        console.log("✅ Profile loaded successfully");
      } else {
        console.warn("⚠️ Success flag false or no user in response:", response.data);
        setError(response.data.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      console.error('Error message:', err.message);
      setError(`Failed to update profile: ${err.response?.data?.message || err.message || 'Failed to fetch'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      console.log("✏️ Field updated:", name, "=", value);
      return updated;
    });
    setSuccess(false);
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf' && !file.type.includes('wordprocessingml')) {
        setError('Only PDF and DOCX files are allowed');
        e.target.value = '';
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      // Check file extension as backup
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx'].includes(ext)) {
        setError('Only PDF and DOCX files are allowed');
        e.target.value = '';
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        resumeFile: file,
        resumeUrl: file.name,
      }));
      setError(null);
      console.log("✅ File selected:", file.name, "Size:", file.size);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let uploadedResumeUrl = '';

      // If there's a new resume file, upload it first
      if (formData.resumeFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('resume', formData.resumeFile);

        console.log("📤 Uploading resume...");
        console.log("📋 File:", formData.resumeFile.name, "Size:", formData.resumeFile.size, "Type:", formData.resumeFile.type);

        // IMPORTANT: Do NOT set Content-Type header manually for FormData!
        // Axios will automatically set it with the correct boundary
        const uploadResponse = await API.post('/users/resume/upload', uploadFormData);

        console.log("✅ Resume upload response:", JSON.stringify(uploadResponse.data, null, 2));
        uploadedResumeUrl = uploadResponse.data.data?.resume || '';
        console.log("📄 Extracted resume URL:", uploadedResumeUrl);
        
        if (!uploadedResumeUrl) {
          console.warn("⚠️ No resume URL in response!");
        }
      }

      // Then update profile with other data
      const updateData = {
        name: formData.name || '',
        phoneNumber: formData.phoneNumber || '',
        currentLocation: formData.currentLocation || '',
        fieldOfInterest: formData.fieldOfInterest
          ? formData.fieldOfInterest
              .split(',')
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
          : [],
        skills: formData.skills
          ? formData.skills
              .split(',')
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
          : [],
        linkedinUrl: formData.linkedinUrl || '',
      };
      
      // Only add resumeUrl if we have one from upload
      if (uploadedResumeUrl) {
        updateData.resumeUrl = uploadedResumeUrl;
        console.log("✅ Added resumeUrl to update data:", uploadedResumeUrl);
      }
      
      console.log("📦 Final update payload:", JSON.stringify(updateData, null, 2));
      console.log("📤 Sending profile update...");

      const response = await API.put('/users/profile-update', updateData);

      console.log("📥 Profile update response:", JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log("✅ Profile updated successfully");
        console.log("📊 Response profileCompleteness:", response.data.profileCompleteness);
        console.log("📋 Response resumeUrl:", response.data.user?.resumeUrl);
        
        setProfileCompleteness(response.data.profileCompleteness || 0);
        setSuccess(true);
        
        // Give user feedback before redirecting
        setTimeout(() => {
          console.log("🔄 Redirecting to dashboard with updated percentage:", response.data.profileCompleteness);
          navigate('/candidate-dashboard', { replace: true });
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to update profile');
        console.error("❌ Update failed:", response.data);
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
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
      label: 'LinkedIn URL (optional)',
      type: 'text',
      weight: 8,
      placeholder: 'https://linkedin.com/in/yourprofile or linkedin.com/in/yourprofile',
    },
    {
      name: 'resumeFile',
      label: 'Resume (PDF)',
      type: 'file',
      weight: 12,
      accept: '.pdf',
      isFile: true,
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
            ) : field.isFile ? (
              <div className="file-input-wrapper">
                <input
                  id={field.name}
                  type="file"
                  accept={field.accept}
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor={field.name} className="file-label">
                  {formData.resumeUrl || 'Click to upload PDF'}
                </label>
              </div>
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
