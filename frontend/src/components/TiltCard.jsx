import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useMotionTemplate, animate } from 'framer-motion';

export function TiltCard({
  children,
  className = '',
  intensity = 15,
  style = {},
  ...props
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-intensity, intensity]);
  const shineX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const shineY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    animate(x, 0, { type: 'spring', stiffness: 200, damping: 20 });
    animate(y, 0, { type: 'spring', stiffness: 200, damping: 20 });
  };

  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      whileHover={{ scale: 1.02 }}
      {...props}
    >
      {children}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: useMotionTemplate`
            radial-gradient(circle at
            ${shineX} ${shineY},
            rgba(255,255,255,0.08) 0%,
            transparent 60%)`,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
    </motion.div>
  );
}
