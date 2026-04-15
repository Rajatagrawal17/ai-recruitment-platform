import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={20} className="animate-fade-in" />
      ) : (
        <Moon size={20} className="animate-fade-in" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
