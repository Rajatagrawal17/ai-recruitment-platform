import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Save, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api"; // ✅ Use API service
import "./NotificationSettings.css";

const NotificationSettings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await API.get(
        `/notifications/preferences/${user._id}` // ✅ Use API service with proper base URL
      );
      const data = response.data;
      setPreferences(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setLoading(false);
    }
  };

  const handleToggle = (section, field) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field],
      },
    }));
  };

  const handleFrequencyChange = (section, value) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        frequency: value,
      },
    }));
  };

  const handleSalaryChange = (value) => {
    setPreferences((prev) => ({
      ...prev,
      jobAlerts: {
        ...prev.jobAlerts,
        minSalary: parseInt(value),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await API.put(
        `/notifications/preferences/${user._id}`, // ✅ Use API service
        preferences
      );

      if (response.status === 200 || response.data?.success) {
        setMessage("✅ Preferences saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error saving preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage("❌ Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="notification-settings-loading">
        <div className="spinner" />
        <p>Loading preferences...</p>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="notification-settings-error">
        <p>Error loading notification preferences</p>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="settings-container"
      >
        <div className="settings-header">
          <div className="header-content">
            <Bell size={32} className="header-icon" />
            <div>
              <h1>Email Notification Settings</h1>
              <p>Manage how you receive job alerts and updates</p>
            </div>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`message ${message.includes("✅") ? "success" : "error"}`}
          >
            {message}
          </motion.div>
        )}

        {/* Job Alerts Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="settings-section"
        >
          <h2>🎯 Job Alerts</h2>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="jobAlerts"
                  checked={preferences.jobAlerts.enabled}
                  onChange={() => handleToggle("jobAlerts", "enabled")}
                />
                <label htmlFor="jobAlerts">Enable Job Alerts</label>
              </div>
              <p className="setting-description">
                Receive emails when new jobs match your profile
              </p>
            </div>

            {preferences.jobAlerts.enabled && (
              <>
                <div className="setting-item">
                  <label>Frequency</label>
                  <select
                    value={preferences.jobAlerts.frequency}
                    onChange={(e) =>
                      handleFrequencyChange("jobAlerts", e.target.value)
                    }
                    className="setting-select"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>Minimum Salary</label>
                  <input
                    type="number"
                    value={preferences.jobAlerts.minSalary}
                    onChange={(e) => handleSalaryChange(e.target.value)}
                    placeholder="0"
                    className="setting-input"
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Application Updates Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="settings-section"
        >
          <h2>📋 Application Updates</h2>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="appUpdates"
                  checked={preferences.applicationUpdates.enabled}
                  onChange={() => handleToggle("applicationUpdates", "enabled")}
                />
                <label htmlFor="appUpdates">Track Application Status</label>
              </div>
              <p className="setting-description">
                Get notified when recruiters update your application status
              </p>
            </div>

            {preferences.applicationUpdates.enabled && (
              <div className="setting-item">
                <div className="setting-header">
                  <input
                    type="checkbox"
                    id="rejections"
                    checked={preferences.applicationUpdates.includeRejections}
                    onChange={() =>
                      handleToggle("applicationUpdates", "includeRejections")
                    }
                  />
                  <label htmlFor="rejections">
                    Include Rejection Notifications
                  </label>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recommendations Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="settings-section"
        >
          <h2>🤖 AI Recommendations</h2>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="recommendations"
                  checked={preferences.recommendations.enabled}
                  onChange={() => handleToggle("recommendations", "enabled")}
                />
                <label htmlFor="recommendations">
                  Personalized Job Recommendations
                </label>
              </div>
              <p className="setting-description">
                Receive AI-powered job suggestions based on your profile
              </p>
            </div>

            {preferences.recommendations.enabled && (
              <div className="setting-item">
                <label>Frequency</label>
                <select
                  value={preferences.recommendations.frequency}
                  onChange={(e) =>
                    handleFrequencyChange("recommendations", e.target.value)
                  }
                  className="setting-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>
        </motion.div>

        {/* System Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="settings-section"
        >
          <h2>🔔 System Notifications</h2>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="systemNotifs"
                  checked={preferences.systemNotifications.enabled}
                  onChange={() => handleToggle("systemNotifications", "enabled")}
                />
                <label htmlFor="systemNotifs">System Notifications</label>
              </div>
              <p className="setting-description">
                Important updates about your account and platform
              </p>
            </div>

            {preferences.systemNotifications.enabled && (
              <>
                <div className="setting-item">
                  <div className="setting-header">
                    <input
                      type="checkbox"
                      id="newsletters"
                      checked={preferences.systemNotifications.newsletters}
                      onChange={() =>
                        handleToggle("systemNotifications", "newsletters")
                      }
                    />
                    <label htmlFor="newsletters">Newsletter</label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-header">
                    <input
                      type="checkbox"
                      id="productUpdates"
                      checked={preferences.systemNotifications.productUpdates}
                      onChange={() =>
                        handleToggle("systemNotifications", "productUpdates")
                      }
                    />
                    <label htmlFor="productUpdates">Product Updates</label>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="settings-actions"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-save"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Preferences"}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotificationSettings;
