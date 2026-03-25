import React from "react";
import { motion } from "framer-motion";
import "./AnimatedCard.css";

const AnimatedCard = ({ children, delay = 0, onClick, className = "", ...props }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: delay * 0.1
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 22px 44px -12px rgba(79, 70, 229, 0.25), 0 4px 10px -4px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
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
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
