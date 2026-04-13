// Modern button component with hover animations and glow effects
import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export const ModernButton = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  disabled = false,
  glow = true,
  ...props
}) => {
  const baseStyles = "font-semibold rounded-lg transition-all duration-300 relative overflow-hidden";

  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50",
    secondary: "bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30",
    ghost: "text-white hover:bg-white/10",
    danger: "bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Glow effect background */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Modern card with hover effects
export const ModernCard = ({
  children,
  className = "",
  hover = true,
  glow = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      className={clsx(
        "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300",
        glow && "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20",
        hover && "hover:bg-white/10 hover:border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Gradient text component
export const GradientText = ({
  children,
  from = "from-blue-400",
  to = "to-purple-600",
  className = "",
}) => {
  return (
    <span
      className={clsx(
        `bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent`,
        className
      )}
    >
      {children}
    </span>
  );
};

// Animated title component
export const AnimatedTitle = ({
  children,
  as: Component = "h1",
  gradient = true,
  delay = 0,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <Component
        className={clsx(
          "font-bold leading-tight",
          gradient && "bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent",
          className
        )}
      >
        {children}
      </Component>
    </motion.div>
  );
};

// Badge component
export const ModernBadge = ({
  children,
  variant = "primary",
  className = "",
}) => {
  const variants = {
    primary: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    danger: "bg-red-500/20 text-red-300 border border-red-500/30",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

// Animated gradient background
export const AnimatedGradientBg = ({ children, className = "" }) => {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Hover glow effect wrapper
export const HoverGlow = ({
  children,
  glowColor = "blue",
  intensity = "50",
  className = "",
}) => {
  const glowClasses = {
    blue: `hover:shadow-lg hover:shadow-blue-${intensity}/50`,
    purple: `hover:shadow-lg hover:shadow-purple-${intensity}/50`,
    pink: `hover:shadow-lg hover:shadow-pink-${intensity}/50`,
  };

  return (
    <div className={clsx("transition-all duration-300", glowClasses[glowColor], className)}>
      {children}
    </div>
  );
};

export default {
  ModernButton,
  ModernCard,
  GradientText,
  AnimatedTitle,
  ModernBadge,
  AnimatedGradientBg,
  HoverGlow,
};
