import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ background: "rgba(10, 14, 26, 0.98)" }}>
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full blur-[140px]"
        style={{ 
          top: '-10%', 
          left: '-10%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)' 
        }}
        animate={{
          x: [0, 150, -50, 0],
          y: [0, -100, 150, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute w-[70vw] h-[70vw] rounded-full blur-[160px]"
        style={{ 
          bottom: '-20%', 
          right: '-10%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)' 
        }}
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 100, -100, 0],
          scale: [1, 1.1, 0.8, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full blur-[120px]"
        style={{ 
          top: '30%', 
          left: '30%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)' 
        }}
        animate={{
          x: [0, 100, -100, 0],
          y: [0, 150, -50, 0],
          scale: [0.8, 1.3, 0.9, 0.8],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default AnimatedBackground;
