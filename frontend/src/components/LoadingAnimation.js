import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./LoadingAnimation.css";

const LoadingAnimation = ({ fullScreen = false, text = "Processing...", scale = 1 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles for a data stream effect
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      angle: Math.random() * 360,
      radius: Math.random() * 40 + 60,
      duration: Math.random() * 1.5 + 1
    }));
    setParticles(newParticles);
  }, []);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`orbital-loader-wrapper ${fullScreen ? "fullscreen" : ""}`}
        style={{ transform: `scale(${scale})` }}
      >
        <div className="orbital-spinner">
          <div className="orbital-ring ring-3"></div>
          <div className="orbital-ring ring-2">
             <div className="orbital-satellite"></div>
          </div>
          <div className="orbital-ring ring-1">
             <div className="orbital-satellite"></div>
          </div>
          <div className="orbital-core"></div>
          
          {/* Render Particles */}
          {particles.map((p) => (
             <motion.div
               key={p.id}
               className="data-particle"
               style={{
                 width: p.size,
                 height: p.size,
               }}
               initial={{
                 x: Math.cos(p.angle * (Math.PI / 180)) * (p.radius * 2),
                 y: Math.sin(p.angle * (Math.PI / 180)) * (p.radius * 2),
                 opacity: 0,
               }}
               animate={{
                 x: Math.cos(p.angle * (Math.PI / 180)) * (p.radius * 0.2),
                 y: Math.sin(p.angle * (Math.PI / 180)) * (p.radius * 0.2),
                 opacity: [0, 1, 0],
               }}
               transition={{
                 duration: p.duration,
                 repeat: Infinity,
                 ease: "easeIn",
                 delay: p.id * 0.1
               }}
             />
          ))}
        </div>

        {text && (
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="orbital-text font-label"
          >
            {text}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingAnimation;
