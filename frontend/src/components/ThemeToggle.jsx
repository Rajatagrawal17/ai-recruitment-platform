import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-40 flex items-center w-[56px] h-[28px] rounded-full p-[2px] cursor-pointer shadow-md focus:outline-none"
      animate={{ backgroundColor: isDark ? "#312e81" : "#fde68a" }}
      transition={{ duration: 0.3 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-[24px] h-[24px] rounded-full flex items-center justify-center bg-white shadow-sm"
        animate={{
          x: isDark ? 28 : 0,
          rotate: isDark ? 360 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {isDark ? (
          <Moon size={14} className="text-indigo-900" />
        ) : (
          <Sun size={14} className="text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
