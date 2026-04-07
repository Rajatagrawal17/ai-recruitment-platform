import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

/**
 * Mobile-optimized variants that reduce animation complexity on small screens
 */
const getMobileVariants = (isMobile) => {
  if (isMobile) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.3 } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    };
  }
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };
};

/**
 * Hook to check if device is mobile and should use reduced animations
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile || prefersReducedMotion;
};

/**
 * MobileOptimizedContainer - Wraps content with mobile-appropriate animations
 */
export const MobileOptimizedContainer = ({ children, style, className }) => {
  const isMobile = useIsMobile();
  const variants = getMobileVariants(isMobile);

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * MobileOptimizedStack - Responsive grid that adapts to mobile
 */
export const MobileOptimizedStack = ({ children, items = 3 }) => {
  const isMobile = useIsMobile();
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: isMobile ? { opacity: 0 } : { opacity: 0, y: 20 },
    show: isMobile ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`grid gap-4 ${
        isMobile
          ? 'grid-cols-1'
          : items === 3
          ? 'grid-cols-3'
          : items === 2
          ? 'grid-cols-2'
          : 'grid-cols-4'
      }`}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

/**
 * MobileOptimizedButton - Touch-friendly button with reduced animations on mobile
 */
export const MobileOptimizedButton = ({
  children,
  onClick,
  className,
  ...props
}) => {
  const isMobile = useIsMobile();

  return (
    <motion.button
      onClick={onClick}
      whileHover={isMobile ? {} : { scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={isMobile ? { duration: 0.1 } : { duration: 0.2 }}
      className={`${className} transition-all`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * Disable parallax on mobile
 */
export const useParallaxMobile = (offset = 50) => {
  const isMobile = useIsMobile();
  
  React.useEffect(() => {
    if (isMobile) {
      document.documentElement.style.scrollBehavior = 'auto';
    }
    return () => {
      document.documentElement.style.scrollBehavior = 'smooth';
    };
  }, [isMobile]);

  return isMobile ? 0 : offset;
};

export default MobileOptimizedContainer;
