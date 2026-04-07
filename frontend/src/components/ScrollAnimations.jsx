import React from 'react';
import { motion } from 'framer-motion';

/**
 * Scroll Animation Components - Heavy Frame Motion Edition
 * Sophisticated, performant scroll-based animations
 */

// 1. FADE IN ON SCROLL
export const FadeInOnScroll = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 12,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 2. SCALE ON SCROLL
export const ScaleOnScroll = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 3. 3D ROTATING CARD
export const RotatingCardScroll = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 50, rotateY: -50 }}
      whileInView={{ opacity: 1, rotateX: 0, rotateY: 0 }}
      whileHover={{ rotateX: 5, rotateY: 5 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.8,
        delay,
        type: 'spring',
        stiffness: 80,
        damping: 15,
      }}
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 4. SCROLL REVEAL GRID
export const ScrollRevealGrid = ({
  items = [],
  columns = 3,
  className = '',
  renderItem,
}) => {
  return (
    <motion.div
      className={`scroll-reveal-grid grid-${columns} ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
        gap: '2rem',
      }}
    >
      {items && items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 40, scale: 0.85 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.5,
            delay: idx * 0.1,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
        >
          {renderItem ? renderItem(item, idx) : <div>{item}</div>}
        </motion.div>
      ))}
    </motion.div>
  );
};

// 5. PARALLAX SECTION
export const ParallaxSection = ({
  children,
  className = '',
}) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7 }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// 6. 3D PERSPECTIVE CARD
export const Perspective3DCard = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 90 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      whileHover={{ rotateY: 10, rotateX: 5 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.8,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 12,
      }}
      style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 7. BOUNCE IN ANIMATION
export const BounceInOnScroll = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.9,
        delay,
        type: 'spring',
        stiffness: 120,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 8. SLIDE IN FROM LEFT
export const SlideInLeft = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 9. SLIDE IN FROM RIGHT
export const SlideInRight = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 10. STAGGERED LIST
export const StaggeredList = ({
  items = [],
  renderItem,
  className = '',
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.12,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          },
        },
      }}
    >
      {items && items.map((item, idx) => (
        <motion.div
          key={idx}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
            },
          }}
        >
          {renderItem ? renderItem(item, idx) : <div>{item}</div>}
        </motion.div>
      ))}
    </motion.div>
  );
};

// 11. FLIP CARD ANIMATION
export const FlipCard = ({
  children,
  className = '',
  delay = 0,
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      onClick={() => setIsFlipped(!isFlipped)}
      className={className}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// 12. EXPAND SECTION
export const ExpandSection = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, width: 0, height: 0 }}
      whileInView={{ opacity: 1, width: 'auto', height: 'auto' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.8,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 13. BLUR IN
export const BlurIn = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 14. COLOR PULSE
export const ColorPulse = ({
  children,
  className = '',
  colors = ['#6366f1', '#ec4899', '#10b981'],
}) => {
  return (
    <motion.div
      animate={{ backgroundColor: colors }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: 'loop',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 15. CONTAINER ANIMATION
export const AnimatedContainer = ({
  children,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{ boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default {
  FadeInOnScroll,
  ScaleOnScroll,
  RotatingCardScroll,
  ScrollRevealGrid,
  ParallaxSection,
  Perspective3DCard,
  BounceInOnScroll,
  SlideInLeft,
  SlideInRight,
  StaggeredList,
  FlipCard,
  ExpandSection,
  BlurIn,
  ColorPulse,
  AnimatedContainer,
};
