import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserProfileCard = () => {
  const { user } = useAuth();
  const [profileCompleteness, setProfileCompleteness] = useState(75); // Default fallback
  const [loading, setLoading] = useState(true);

  // Fetch profile completeness from backend
  useEffect(() => {
    const fetchProfileCompleteness = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found in localStorage");
          setLoading(false);
          return;
        }

        const apiUrl = process.env.REACT_APP_API_URL || "";
        const endpoint = `${apiUrl}/api/users/profile-info`;
        console.log("Fetching profile from:", endpoint);

        const response = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);

        if (data.success && data.profileCompleteness !== undefined) {
          console.log("Setting profileCompleteness to:", data.profileCompleteness);
          setProfileCompleteness(data.profileCompleteness);
        } else if (data.profileCompleteness !== undefined) {
          console.log("Setting profileCompleteness to:", data.profileCompleteness);
          setProfileCompleteness(data.profileCompleteness);
        } else {
          console.warn("No profileCompleteness in response:", data);
        }
      } catch (error) {
        console.error("Error fetching profile completeness:", error);
        // Keep default value on error
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileCompleteness();
    }
  }, [user]);

  // Generate initials from user name
  const initials = useMemo(() => {
    if (!user?.name) return "U";
    
    const parts = user.name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || "U").toUpperCase();
  }, [user?.name]);

  // Format joined date (convert ISO to readable format)
  const joinedDate = useMemo(() => {
    if (!user?.createdAt) return null;
    const date = new Date(user.createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [user?.createdAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-card overflow-hidden"
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg"
          >
            {initials}
          </motion.div>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            {/* Welcome Heading */}
            <motion.h2
              className="text-2xl sm:text-3xl font-bold text-text mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Welcome back, {user?.name?.split(" ")[0] || "Candidate"}! 👋
            </motion.h2>

            {/* Email */}
            <motion.p
              className="text-text-muted text-sm sm:text-base mb-3 break-all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {user?.email || "Loading email..."}
            </motion.p>

            {/* Badges Row */}
            <motion.div
              className="flex flex-wrap gap-3 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Role Badge */}
              <span className="inline-flex items-center rounded-full bg-primary-soft px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide">
                {user?.role || "candidate"}
              </span>

              {/* Member Since Badge */}
              {joinedDate && (
                <span className="inline-flex items-center rounded-full border border-border/50 bg-surface-soft px-4 py-1.5 text-xs sm:text-sm font-medium text-text-muted">
                  📅 Member since {joinedDate}
                </span>
              )}

              {/* Status Indicator */}
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            className="hidden lg:flex gap-4 flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="text-center p-3 rounded-lg bg-primary-soft/50">
              <p className="text-2xl font-bold text-primary">∞</p>
              <p className="text-xs text-text-muted mt-1">Opportunities</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent-soft/50">
              <p className="text-2xl font-bold text-accent">✓</p>
              <p className="text-xs text-text-muted mt-1">Verified</p>
            </div>
          </motion.div>
        </div>

        {/* Progress Indicator */}
        <motion.div
          className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-text">Profile Completeness</span>
            <span className="text-xs font-semibold text-primary">{loading ? "..." : `${profileCompleteness}%`}</span>
          </div>
          <div className="w-full h-2 bg-surface-soft rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${profileCompleteness}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            {profileCompleteness === 100 
              ? "✅ Profile complete! You're ready for AI recommendations"
              : `${100 - profileCompleteness}% to go. Complete your profile to unlock AI-powered recommendations`}
          </p>
          {profileCompleteness < 100 && (
            <Link 
              to="/complete-profile" 
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Complete Profile →
            </Link>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;
