import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Simplified Scroll Animation Hooks
 * Lightweight, performant scroll effects
 */

// 1. PARALLAX SCROLL EFFECT
export const useParallax = (offset = 50) => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (latest) => Math.min(latest * offset * 0.1, 100));
  return { ref, y };
};

// 2. FADE IN ON SCROLL
export const useFadeInOnScroll = (options = {}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.4'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return { ref, opacity, y };
};

// 3. SCALE ON SCROLL
export const useScaleOnScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 1], [0, 0.5, 1]);

  return { ref, scale, opacity };
};

// 4. STAGGER CHILDREN ON SCROLL
export const useStaggerOnScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  return { ref, scrollYProgress };
};

// 5. ROTATE ON SCROLL (3D effect)
export const useRotateOnScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.5', 'end 0.5'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [45, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-45, 0]);

  return { ref, rotateX, rotateY };
};

// 6. SCROLL PROGRESS BAR
export const useScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  
  return { scaleX };
};

// 7. BLUR ON SCROLL
export const useBlurOnScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, 10]);

  return { ref, blur };
};

// 8. HUE ROTATE ON SCROLL
export const useHueRotateOnScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const hueRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return { ref, hueRotate };
};

// 9. COMPLEX PARALLAX + FADE
export const useParallaxFade = (multiplier = 0.5) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 1', 'end 0.3'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [100, -100 * multiplier]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return { ref, opacity, y, scale };
};

// 10. SLIDING TEXT EFFECT
export const useSlidingText = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], [-500, 500]);

  return { ref, x };
};

// 11. GRADIENT ANIMATION ON SCROLL
export const useGradientOnScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const backgroundPosition = useTransform(
    scrollYProgress,
    [0, 1],
    ['0% 50%', '100% 50%']
  );

  return { ref, backgroundPosition };
};

// 12. CLIP-PATH ANIMATION (Complex)
export const useClipPathOnScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
      'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
    ]
  );

  return { ref, clipPath };
};

// 13. SHADOW DEPTH ON SCROLL
export const useShadowDepthOnScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const shadowBlur = useTransform(scrollYProgress, [0, 1], [5, 50]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 1], [0.1, 0.4]);

  return { ref, shadowBlur, shadowOpacity };
};

// 14. PERSPECTIVE SCROLL (3D Card)
export const usePerspectiveScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.5', 'end 0.5'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-200, 0, -200]);

  return { ref, rotateX, rotateY, z };
};

// 15. MORPHING SHAPE ON SCROLL
export const useMorphOnScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const borderRadius = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['0%', '25%', '50%', '75%', '0%']
  );

  return { ref, borderRadius };
};

export default {
  useParallax,
  useFadeInOnScroll,
  useScaleOnScroll,
  useStaggerOnScroll,
  useRotateOnScroll,
  useScrollProgress,
  useBlurOnScroll,
  useHueRotateOnScroll,
  useParallaxFade,
  useSlidingText,
  useGradientOnScroll,
  useClipPathOnScroll,
  useShadowDepthOnScroll,
  usePerspectiveScroll,
  useMorphOnScroll,
};
