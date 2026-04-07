import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useGSAPScroll - Advanced GSAP scroll animation hook
 * Provides powerful scroll-based animation capabilities
 */

export const useGSAPScroll = (config = {}) => {
  const {
    trigger,
    startPos = 'top center',
    endPos = 'center center',
    markers = false,
    onEnter,
    onLeave,
  } = config;

  useEffect(() => {
    if (!trigger) return;

    const scrollTrigger = ScrollTrigger.create({
      trigger,
      start: startPos,
      end: endPos,
      markers,
      onEnter,
      onLeave,
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [trigger, startPos, endPos, markers, onEnter, onLeave]);
};

/**
 * Parallax scroll effect hook
 */
export const useParallaxGSAP = (elementRef, speed = 0.5) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const parallaxTL = gsap.timeline({
      scrollTrigger: {
        trigger: elementRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        markers: false,
      },
    });

    parallaxTL.to(elementRef.current, {
      y: window.innerHeight * speed,
      ease: 'none',
    }, 0);

    return () => {
      parallaxTL.kill();
    };
  }, [elementRef, speed]);
};

/**
 * Text animation on scroll (fade + slide)
 */
export const useTextRevealGSAP = (elementRef) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const textElements = elementRef.current.querySelectorAll('h1, h2, h3, p');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: elementRef.current,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1,
      },
    });

    textElements.forEach((el, index) => {
      tl.from(
        el,
        {
          opacity: 0,
          y: 30,
          duration: 1,
        },
        index * 0.1
      );
    });

    return () => {
      tl.kill();
    };
  }, [elementRef]);
};

/**
 * Staggered element animation on scroll
 */
export const useStaggerGSAP = (containerRef, itemSelector = '.item') => {
  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll(itemSelector);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
        end: 'center 30%',
        scrub: 1,
      },
    });

    gsap.set(items, { opacity: 0, y: 50 });

    items.forEach((item, index) => {
      tl.to(
        item,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
        },
        0
      );
    });

    return () => {
      tl.kill();
    };
  }, [containerRef, itemSelector]);
};

/**
 * Horizontal scroll snap effect
 */
export const useHorizontalScrollGSAP = (containerRef) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const slides = container.querySelectorAll('.slide');
    const totalWidth = slides.length * 100 + '%';

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: `+=${slides.length * 500}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    tl.to(container, {
      x: () => -(container.scrollWidth - window.innerWidth),
      ease: 'none',
    });

    return () => {
      tl.kill();
    };
  }, [containerRef]);
};

/**
 * Counter animation on scroll
 */
export const useCounterGSAP = (elementRef, endValue = 100, duration = 2) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const obj = { value: 0 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: elementRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        elementRef.current.textContent = Math.floor(obj.value).toLocaleString();
      },
    });

    return () => {
      tl.kill();
    };
  }, [elementRef, endValue, duration]);
};

/**
 * Clip path reveal animation
 */
export const useClipPathGSAP = (elementRef) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: elementRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.from(elementRef.current, {
      clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out',
    });

    return () => {
      tl.kill();
    };
  }, [elementRef]);
};

/**
 * Rotate and scale on scroll
 */
export const useRotateScaleGSAP = (elementRef, rotationDegrees = 360) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: elementRef.current,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1,
      },
    });

    tl.to(elementRef.current, {
      rotation: rotationDegrees,
      scale: 1.1,
      opacity: 1,
      duration: 1,
      ease: 'back.out',
    });

    return () => {
      tl.kill();
    };
  }, [elementRef, rotationDegrees]);
};

export default useGSAPScroll;
