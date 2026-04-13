import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ScrollProgress = () => {
  const progressRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (progressRef.current) {
        const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        progressRef.current.style.scaleX = progress;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      ref={progressRef}
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-50"
      style={{ scaleX: 0 }}
    />
  );
};

export default ScrollProgress;
