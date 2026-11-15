import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Shows what a slow request is doing. The server answers in one go, so it
// can't report real progress: the steps advance on a timer based on how long
// each kind of request usually takes, and the last step stays "in progress"
// until the request actually finishes. That way it never claims to be done
// before it is.
export function ProgressSteps({ title, steps, stepMs = 1500, className = "" }) {
  const [current, setCurrent] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (current >= steps.length - 1) return;
    const id = setTimeout(() => setCurrent((step) => step + 1), stepMs);
    return () => clearTimeout(id);
  }, [current, steps.length, stepMs]);

  // The bar stops short of full so it also never looks finished early.
  const percent = Math.round(((current + 0.5) / steps.length) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-2xl border-[3px] border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-800 p-4 ${className}`}
    >
      <p className="font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</p>

      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-4" aria-hidden="true">
        <motion.div
          className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400"
          initial={{ width: "0%" }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
        />
      </div>

      <ol className="space-y-2">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden="true"
                className={`shrink-0 w-5 h-5 rounded-full border-[3px] flex items-center justify-center ${
                  done
                    ? "border-emerald-700 dark:border-emerald-500 bg-emerald-500"
                    : active
                      ? "border-slate-300 dark:border-slate-600 border-t-indigo-600 dark:border-t-indigo-400 animate-spin motion-reduce:animate-none"
                      : "border-slate-300 dark:border-slate-600"
                }`}
              >
                {done && (
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                  </svg>
                )}
              </span>
              <span
                className={
                  done
                    ? "text-slate-500 dark:text-slate-400"
                    : active
                      ? "font-semibold text-slate-900 dark:text-slate-100"
                      : "text-slate-400 dark:text-slate-500"
                }
              >
                {label}
                {active && <span className="sr-only"> (in progress)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
