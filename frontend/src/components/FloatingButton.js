import React from "react";
import { motion } from "framer-motion";

const FloatingButton = ({ children, onClick, className = "", ...props }) => {
  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.button
      className={className}
      variants={floatingVariants}
      initial="initial"
      animate="animate"
      onClick={onClick}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default FloatingButton;
