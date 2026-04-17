import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const UserProfileCard = () => {
  const { user } = useAuth();

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
            <span className="text-xs font-semibold text-primary">75%</span>
          </div>
          <div className="w-full h-2 bg-surface-soft rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">Complete your resume to unlock AI-powered recommendations</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;
