import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

const AnimatedCounter = ({ value, duration = 2, delay = 0, suffix = "", prefix = "" }) => {
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const parsed = typeof value === "number" ? value : Math.round(value);
    return `${prefix}${Math.round(latest)}${suffix}`;
  });

  React.useEffect(() => {
    const parsed = typeof value === "number" ? value : Math.round(value);

    const animation = animate(count, parsed, {
      duration: duration,
      delay: delay,
      type: "spring",
      bounce: 0.3,
      stiffness: 50,
    });

    return animation.stop;
  }, [value, duration, delay]);

  return <motion.span>{rounded}</motion.span>;
};

export default AnimatedCounter;
