import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ScrollTriggerAnimation = ({ children, offsetStart = 0, offsetEnd = 1 }) => {
  const elementRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: elementRef,
    offset: [`${offsetStart}px start`, `${offsetEnd}px end`],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, 0]);

  return (
    <motion.div ref={elementRef} style={{ opacity, scale, y }}>
      {children}
    </motion.div>
  );
};

const ParallaxSection = ({ children, offset = 0.5 }) => {
  const elementRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (value) => value * offset);

  return (
    <motion.div ref={elementRef} style={{ y }}>
      {children}
    </motion.div>
  );
};

export { ScrollTriggerAnimation, ParallaxSection };
