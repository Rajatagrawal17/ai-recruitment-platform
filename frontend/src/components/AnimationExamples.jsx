import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ANIMATION QUICK REFERENCE
 * Copy-paste ready animation snippets for your components
 */

// =============================================================
// 1. SIMPLE FRAMER MOTION SCROLL ANIMATIONS
// =============================================================

/**
 * Fade In on Scroll
 */
export const FadeInExample = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
  >
    Content fades in when scrolled into view
  </motion.div>
);

/**
 * Scale and Fade
 */
export const ScaleExample = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
  >
    Card with scale on view and hover
  </motion.div>
);

/**
 * Staggered Children
 */
export const StaggerExample = () => (
  <motion.ul
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-100px' }}
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    }}
  >
    {[1, 2, 3, 4].map((item) => (
      <motion.li
        key={item}
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 },
        }}
      >
        Item {item}
      </motion.li>
    ))}
  </motion.ul>
);

/**
 * Rotate and Tilt
 */
export const RotateExample = () => (
  <motion.div
    initial={{ opacity: 0, rotate: -10 }}
    whileInView={{ opacity: 1, rotate: 0 }}
    whileHover={{ rotate: 5, y: -10 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.6 }}
  >
    Hover to tilt
  </motion.div>
);

// =============================================================
// 2. GSAP SCROLL TRIGGER ANIMATIONS
// =============================================================

/**
 * Text Reveal on Scroll (GSAP)
 */
export const TextRevealGSAPExample = () => {
  const textRef = useRef(null);

  React.useEffect(() => {
    if (!textRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.from(textRef.current.querySelectorAll('h2, p'), {
      opacity: 0,
      y: 30,
      duration: 1,
      stagger: 0.2,
    });

    return () => tl.kill();
  }, []);

  return (
    <div ref={textRef}>
      <h2>Text reveals</h2>
      <p>with staggered timing</p>
    </div>
  );
};

/**
 * Parallax Background
 */
export const ParallaxGSAPExample = () => {
  const bgRef = useRef(null);

  React.useEffect(() => {
    if (!bgRef.current) return;

    gsap.to(bgRef.current, {
      backgroundPosition: '50% 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: bgRef.current,
        scrub: 1,
        start: 'top top',
        end: 'bottom top',
      },
    });
  }, []);

  return (
    <div
      ref={bgRef}
      style={{
        backgroundImage: 'url(...)',
        backgroundSize: 'cover',
        backgroundPosition: '50% 0%',
        height: '100vh',
      }}
    />
  );
};

/**
 * Counter Animation
 */
export const CounterGSAPExample = () => {
  const counterRef = useRef(null);

  React.useEffect(() => {
    if (!counterRef.current) return;

    const obj = { value: 0 };

    gsap.to(obj, {
      value: 150,
      duration: 2.5,
      ease: 'power2.out',
      onUpdate: () => {
        counterRef.current.textContent = Math.floor(obj.value);
      },
      scrollTrigger: {
        trigger: counterRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      // Cleanup
    };
  }, []);

  return <div ref={counterRef} className="text-5xl font-bold">0</div>;
};

/**
 * Horizontal Scroll
 */
export const HorizontalScrollGSAPExample = () => {
  const containerRef = useRef(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const slides = containerRef.current.querySelectorAll('.slide');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${slides.length * 500}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    tl.to(containerRef.current, {
      x: () => -(containerRef.current.scrollWidth - window.innerWidth),
      ease: 'none',
    });

    return () => tl.kill();
  }, []);

  return (
    <div ref={containerRef} className="flex">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="slide w-screen h-screen flex-shrink-0">
          Slide {n}
        </div>
      ))}
    </div>
  );
};

// =============================================================
// 3. MICRO INTERACTIONS
// =============================================================

/**
 * Button with Glow Effect
 */
export const GlowButtonExample = () => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
    style={{
      boxShadow: '0 0 0px rgba(99, 102, 241, 0.5)',
    }}
    animate={{
      boxShadow: [
        '0 0 0px rgba(99, 102, 241, 0.5)',
        '0 0 20px rgba(99, 102, 241, 0.8)',
        '0 0 0px rgba(99, 102, 241, 0.5)',
      ],
    }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    Glowing Button
  </motion.button>
);

/**
 * Flip Card
 */
export const FlipCardExample = () => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <motion.div
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      className="w-64 h-64 bg-indigo-600 rounded-lg cursor-pointer flex items-center justify-center text-white text-2xl font-bold"
    >
      {isFlipped ? 'Back' : 'Front'}
    </motion.div>
  );
};

/**
 * Animated Badge
 */
export const AnimatedBadgeExample = () => (
  <motion.span
    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="inline-block px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold"
  >
    New
  </motion.span>
);

/**
 * Loading Spinner
 */
export const LoadingSpinnerExample = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full"
  />
);

// =============================================================
// 4. CONTAINER ANIMATIONS
// =============================================================

/**
 * Animated Container with Shadow
 */
export const AnimatedContainerExample = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    whileHover={{ boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)' }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    className="p-8 bg-white rounded-lg border border-gray-100"
  >
    Hover for shadow effect
  </motion.div>
);

/**
 * Progress Bar
 */
export const ProgressBarExample = () => {
  const progressRef = useRef(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      gsap.to(progressRef.current, {
        scaleX: scrolled / 100,
        duration: 0.1,
        overwrite: 'auto',
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        ref={progressRef}
        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
        style={{ transformOrigin: 'left', scaleX: 0 }}
      />
    </div>
  );
};

// =============================================================
// COMPLETE EXAMPLE: LANDING PAGE SECTION
// =============================================================

export const CompleteLandingSectionExample = () => (
  <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
    <div className="max-w-6xl mx-auto">
      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-center mb-16"
      >
        Features
      </motion.h2>

      {/* Feature Grid with Stagger */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {['Feature 1', 'Feature 2', 'Feature 3'].map((feature, idx) => (
          <motion.div
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-lg shadow-md border border-gray-100"
          >
            <h3 className="text-xl font-bold mb-3">{feature}</h3>
            <p className="text-gray-600">Feature description goes here.</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mt-12"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold"
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  </section>
);

export default {
  FadeInExample,
  ScaleExample,
  StaggerExample,
  RotateExample,
  TextRevealGSAPExample,
  ParallaxGSAPExample,
  CounterGSAPExample,
  HorizontalScrollGSAPExample,
  GlowButtonExample,
  FlipCardExample,
  AnimatedBadgeExample,
  LoadingSpinnerExample,
  AnimatedContainerExample,
  ProgressBarExample,
  CompleteLandingSectionExample,
};
