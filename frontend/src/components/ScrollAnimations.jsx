import React from 'react';
import { motion } from 'framer-motion';
import {
  useParallax,
  useFadeInOnScroll,
  useScaleOnScroll,
  useParallaxFade,
  useRotateOnScroll,
  useShadowDepthOnScroll,
  usePerspectiveScroll,
  useMorphOnScroll,
} from '../hooks/useScrollAnimations';

/**
 * SCROLL ANIMATION COMPONENTS
 * Pre-built components for common scroll animation patterns
 */

// 1. PARALLAX SECTION
export const ParallaxSection = ({
  children,
  offset = 50,
  className = '',
}) => {
  const { ref, y } = useParallax(offset);

  return (
    <motion.section
      ref={ref}
      style={{ y }}
      className={`parallax-section ${className}`}
    >
      {children}
    </motion.section>
  );
};

// 2. FADE IN ON SCROLL
export const FadeInOnScroll = ({
  children,
  className = '',
  duration = 0.5,
}) => {
  const { ref, opacity, y } = useFadeInOnScroll();

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={`fade-in-scroll ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 3. SCALE ON SCROLL
export const ScaleOnScroll = ({
  children,
  className = '',
}) => {
  const { ref, scale, opacity } = useScaleOnScroll();

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className={`scale-scroll ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 4. ROTATING CARD ON SCROLL
export const RotatingCardScroll = ({
  children,
  className = '',
}) => {
  const { ref, rotateX, rotateY } = useRotateOnScroll();

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        perspective: '1000px',
      }}
      className={`rotating-card ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 5. PARALLAX FADE STACKED
export const ParallaxFadeStack = ({
  children,
  className = '',
  multiplier = 0.5,
}) => {
  const { ref, opacity, y, scale } = useParallaxFade(multiplier);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale }}
      className={`parallax-fade-stack ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 6. SHADOW DEPTH CARD
export const ShadowDepthCard = ({
  children,
  className = '',
}) => {
  const { ref, shadowBlur, shadowOpacity } = useShadowDepthOnScroll();

  return (
    <motion.div
      ref={ref}
      style={{
        boxShadow: shadowOpacity.get()
          ? `0 20px ${shadowBlur}px rgba(99, 102, 241, ${shadowOpacity})`
          : '0 10px 20px rgba(0, 0, 0, 0.1)',
      }}
      className={`shadow-depth-card ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 7. PERSPECTIVE 3D CARD
export const Perspective3DCard = ({
  children,
  className = '',
}) => {
  const { ref, rotateX, rotateY, z } = usePerspectiveScroll();

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        z,
        perspective: '1200px',
      }}
      className={`perspective-3d-card ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 8. MORPHING SHAPE
export const MorphingShape = ({
  className = '',
  color = '#6366f1',
  size = 100,
}) => {
  const { ref, borderRadius } = useMorphOnScroll();

  return (
    <motion.div
      ref={ref}
      style={{
        borderRadius,
        background: color,
        width: size,
        height: size,
      }}
      className={`morphing-shape ${className}`}
    />
  );
};

// 9. SCROLL REVEAL TEXT
export const ScrollRevealText = ({
  text,
  className = '',
  staggerDelay = 0.1,
}) => {
  const { ref, opacity, y } = useFadeInOnScroll();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity, y }}
      className={`scroll-reveal-text ${className}`}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity }}
        transition={{ staggerChildren: staggerDelay }}
      >
        {text}
      </motion.h2>
    </motion.div>
  );
};

// 10. STAGGERED LIST ON SCROLL
export const StaggeredListScroll = ({
  items = [],
  className = '',
  itemComponent: ItemComponent = 'div',
}) => {
  const { ref, scrollYProgress } = useFadeInOnScroll();

  return (
    <motion.div
      ref={ref}
      className={`staggered-list-scroll ${className}`}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          <ItemComponent item={item} index={idx} />
        </motion.div>
      ))}
    </motion.div>
  );
};

// 11. PROGRESS TRACKING SCROLL
export const ScrollTracker = ({ children, className = '' }) => {
  const { scrollYProgress } = useFadeInOnScroll();

  return (
    <div className={`scroll-tracker ${className}`}>
      <motion.div
        className="progress-bar"
        style={{
          scaleX: scrollYProgress,
        }}
      />
      {children}
    </div>
  );
};

// 12. PARALLAX HERO SECTION
export const ParallaxHero = ({
  title,
  subtitle,
  backgroundImage,
  className = '',
}) => {
  const { ref, y: bgY } = useParallax(30);
  const { ref: contentRef, opacity, y } = useFadeInOnScroll();

  return (
    <section
      ref={ref}
      className={`parallax-hero ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundAttachment: 'fixed',
      }}
    >
      <motion.div
        ref={contentRef}
        style={{ y, opacity }}
        className="parallax-hero-content"
      >
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </motion.div>
    </section>
  );
};

// 13. SCROLL TRIGGERED COUNTER
export const ScrollCounter = ({
  from = 0,
  to = 100,
  duration = 2,
  className = '',
}) => {
  const { ref, scrollYProgress } = useFadeInOnScroll();
  const [displayValue, setDisplayValue] = React.useState(from);

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setDisplayValue(Math.floor(from + (to - from) * latest));
    });
    return () => unsubscribe();
  }, [scrollYProgress, from, to]);

  return (
    <motion.div
      ref={ref}
      className={`scroll-counter ${className}`}
    >
      <span>{displayValue}</span>
    </motion.div>
  );
};

// 14. ADVANCED SCROLL ANIMATION SECTION
export const AdvancedScrollSection = ({
  children,
  animationType = 'parallaxFade',
  className = '',
}) => {
  const animations = {
    parallaxFade: useParallaxFade(),
    scale: useScaleOnScroll(),
    rotate: useRotateOnScroll(),
    perspective: usePerspectiveScroll(),
    morph: useMorphOnScroll(),
  };

  const currentAnimation = animations[animationType] || animations.parallaxFade;

  return (
    <motion.section
      ref={currentAnimation.ref}
      style={currentAnimation}
      className={`advanced-scroll-section ${className}`}
    >
      {children}
    </motion.section>
  );
};

// 15. SCROLL REVEAL GRID
export const ScrollRevealGrid = ({
  items = [],
  columns = 3,
  className = '',
  renderItem,
}) => {
  const { ref, scrollYProgress } = useFadeInOnScroll();

  return (
    <motion.div
      ref={ref}
      className={`scroll-reveal-grid grid-${columns} ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '2rem',
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: idx * 0.1,
            duration: 0.4,
          }}
          viewport={{ once: true, margin: '-50px' }}
        >
          {renderItem ? renderItem(item, idx) : <div>{item}</div>}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default {
  ParallaxSection,
  FadeInOnScroll,
  ScaleOnScroll,
  RotatingCardScroll,
  ParallaxFadeStack,
  ShadowDepthCard,
  Perspective3DCard,
  MorphingShape,
  ScrollRevealText,
  StaggeredListScroll,
  ScrollTracker,
  ParallaxHero,
  ScrollCounter,
  AdvancedScrollSection,
  ScrollRevealGrid,
};
