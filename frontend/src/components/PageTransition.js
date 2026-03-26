import React from "react";
import { motion } from "framer-motion";

const PageTransition = ({ children, direction = "up" }) => {
  const directionMap = {
    up: { initial: { y: 50, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -50, opacity: 0 } },
    down: { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 50, opacity: 0 } },
    left: { initial: { x: 50, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -50, opacity: 0 } },
    right: { initial: { x: -50, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 50, opacity: 0 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  };

  const variants = directionMap[direction] || directionMap.up;

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
