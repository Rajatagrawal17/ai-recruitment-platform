import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import "./AnimatedStats.css";

const AnimatedStats = ({ icon, label, value, change, delay = 0 }) => {
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  React.useEffect(() => {
    if (hasAnimated) {
      const parsed = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g,"")) || 0;
      const animation = animate(count, parsed, { duration: 1.5, delay: delay * 0.1, type: "spring", bounce: 0 });
      return animation.stop;
    }
  }, [value, hasAnimated, delay]);
  
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: delay * 0.1
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      boxShadow: "0 22px 44px -12px rgba(79, 70, 229, 0.25), 0 4px 10px -4px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const numberVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
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
      whileTap={{ scale: 0.98 }}
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
        <motion.h3 
          className="stat-value" 
          variants={numberVariants}
          onViewportEnter={() => setHasAnimated(true)}
          viewport={{ once: true }}
        >
          {typeof value === 'number' || !isNaN(parseFloat(String(value).replace(/[^0-9.-]+/g,""))) 
            ? <><motion.span>{rounded}</motion.span>{String(value).includes('%') ? '%' : ''}</> 
            : value}
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
