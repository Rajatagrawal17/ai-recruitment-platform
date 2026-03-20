import React from "react";
import { motion } from "framer-motion";
import "./AnimatedCard.css";

const AnimatedCard = ({ children, delay = 0, onClick, className = "" }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: delay * 0.1
      }
    },
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(79, 70, 229, 0.2)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className={`animated-card ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
