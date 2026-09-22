import { motion } from "framer-motion";

export function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400" role="status">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5 rounded-full border-[3px] border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 shrink-0"
      />
      <span>{label}</span>
    </div>
  );
}
