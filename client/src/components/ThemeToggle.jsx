import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="relative w-9 h-9 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="text-base"
        >
          {isDark ? "🌙" : "☀️"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
