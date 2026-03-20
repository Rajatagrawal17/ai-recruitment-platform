import React from "react";
import { motion } from "framer-motion";
import "./LoadingAnimation.css";

const LoadingAnimation = ({ fullScreen = false }) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const dotVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 1.4,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  const skeletonVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  return (
    <div className={`loading-container ${fullScreen ? "fullscreen" : ""}`}>
      {/* Animated Dots Loader */}
      <motion.div
        className="dots-loader"
        variants={containerVariants}
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="dot"
            variants={dotVariants}
            style={{
              background: `hsl(${i * 120}, 70%, 50%)`
            }}
          />
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="loading-text"
      >
        Loading magical things...
      </motion.p>

      {/* Skeleton Cards */}
      <div className="skeleton-cards">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="skeleton-card"
            variants={skeletonVariants}
            animate="animate"
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingAnimation;
