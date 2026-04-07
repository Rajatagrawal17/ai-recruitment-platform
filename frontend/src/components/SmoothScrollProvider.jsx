import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScrollProvider - Implements smooth scrolling with Lenis
 * Wraps the entire app for smooth scroll experience
 */
export const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis with optimized settings
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: true,
      touchMultiplier: 2,
    });

    const scroll = (time) => {
      lenisRef.current.raf(time);
      rafRef.current = requestAnimationFrame(scroll);
    };

    rafRef.current = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenisRef.current.destroy();
    };
  }, []);

  return <>{children}</>;
};

/**
 * Hook to access Lenis instance
 */
export const useLenis = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Get existing Lenis instance if available
    const lenis = window.lenis || lenisRef.current;
    if (lenis) {
      lenisRef.current = lenis;
    }
  }, []);

  return lenisRef.current;
};

export default SmoothScrollProvider;
