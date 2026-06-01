import React from 'react';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 }
  }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut'
    }
  }
};

export function StaggerList({ children, className }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={container}
    >
      {React.Children.map(children, child => {
        if (!child) return null;
        return (
          <motion.div variants={item}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
