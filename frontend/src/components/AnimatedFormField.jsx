import React from 'react';
import { motion } from 'framer-motion';

const inputVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

const focusVariants = {
  initial: { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  focus: { 
    borderColor: '#4f46e5',
    backgroundColor: '#f0f3ff',
    boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
  },
};

const AnimatedFormField = ({
  index = 0,
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  ...props
}) => {
  return (
    <motion.div
      custom={index}
      variants={inputVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <motion.input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        variants={focusVariants}
        initial="initial"
        whileFocus="focus"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200"
        {...props}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default AnimatedFormField;
