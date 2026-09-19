import { motion } from "framer-motion";

const VERDICT_STYLES = {
  good: { dot: "bg-emerald-600", bar: "bg-emerald-600", text: "text-emerald-700 dark:text-emerald-400" },
  ok: { dot: "bg-amber-600", bar: "bg-amber-600", text: "text-amber-700 dark:text-amber-400" },
  weak: { dot: "bg-red-600", bar: "bg-red-600", text: "text-red-700 dark:text-red-400" },
};

export function CategoryBar({ label, score, verdict, reason }) {
  const styles = VERDICT_STYLES[verdict] || VERDICT_STYLES.weak;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{label}</span>
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{score}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${styles.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <p className={`text-xs mt-1 ${styles.text}`}>{reason}</p>
    </div>
  );
}
