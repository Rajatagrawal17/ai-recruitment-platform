// Animation utilities and hooks for smooth, professional interactions
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Hook for fade-in animations on scroll
export const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const {
    delay = 0,
    duration = 0.8,
    distance = 30,
    direction = "up",
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const startY = direction === "up" ? distance : -distance;
    const startX = direction === "left" ? distance : direction === "right" ? -distance : 0;

    gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        y: startY,
        x: startX,
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => {
      if (ref.current?.gsap) ref.current.gsap.kill();
    };
  }, [delay, duration, distance, direction]);

  return ref;
};

// Hook for parallax effect
export const useParallax = (speed = 10) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      y: (i, target) => {
        return (1 - ScrollTrigger.getVelocity() / 300) * -speed;
      },
      ease: "none",
      scrollTrigger: {
        trigger: ref.current,
        onUpdate: (self) => {
          gsap.to(ref.current, {
            y: self.getVelocity() * -0.05,
            overwrite: false,
            duration: 0.8,
          });
        },
      },
    });
  }, [speed]);

  return ref;
};

// Hook for counter animations
export const useCountUp = (target = 100, duration = 2) => {
  const ref = useRef(null);
  const countRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;

    const updateCount = () => {
      ref.current.textContent = Math.floor(countRef.current);
    };

    gsap.to(countRef, {
      current: target,
      duration,
      ease: "power2.out",
      onUpdate: updateCount,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        once: true,
      },
    });
  }, [target, duration]);

  return ref;
};

// Hook for staggered list animations
export const useStaggerAnimation = (children = 3, stagger = 0.1) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll("[data-animate]");
    gsap.fromTo(
      items,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger,
        ease: "power2.out",
      }
    );
  }, [stagger]);

  return containerRef;
};

// Hook for scroll progress bar
export const useScrollProgress = () => {
  const progressRef = useRef(null);

  useEffect(() => {
    if (!progressRef.current) return;

    gsap.to(progressRef.current, {
      scaleX: () => window.scrollY / (document.documentElement.scrollHeight - window.innerHeight),
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        onUpdate: (self) => {
          if (progressRef.current) {
            progressRef.current.style.scaleX = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
          }
        },
      },
    });
  }, []);

  return progressRef;
};

export default {
  useScrollReveal,
  useParallax,
  useCountUp,
  useStaggerAnimation,
  useScrollProgress,
};
