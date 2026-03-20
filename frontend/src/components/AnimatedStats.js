import React from "react";
import { motion } from "framer-motion";
import "./AnimatedStats.css";

const AnimatedStats = ({ icon, label, value, change, delay = 0 }) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: delay * 0.1
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 15px 35px rgba(79, 70, 229, 0.25)"
    }
  };

  const numberVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: delay * 0.1 + 0.2
      }
    }
  };

  const changeVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: delay * 0.1 + 0.3
      }
    }
  };

  return (
    <motion.div
      className="stat-card"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <motion.div
        className="stat-icon"
        whileHover={{ scale: 1.1, rotate: 10 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {icon}
      </motion.div>

      <div className="stat-content">
        <motion.p className="stat-label">{label}</motion.p>
        <motion.h3 className="stat-value" variants={numberVariants}>
          {value}
        </motion.h3>

        {change && (
          <motion.div className="stat-change" variants={changeVariants}>
            <span className={`change-text ${change.type}`}>
              {change.type === "up" ? "↑" : "↓"} {change.value}% {change.label}
            </span>
          </motion.div>
        )}
      </div>

      {/* Background animation */}
      <motion.div
        className="stat-bg-animation"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.1, 0.8] }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          delay: delay * 0.2
        }}
      />
    </motion.div>
  );
};

export default AnimatedStats;
