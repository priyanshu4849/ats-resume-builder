import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";

const RADIUS = 70;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function colorForScore(score) {
  if (score >= 75) return "#059669"; // emerald-600
  if (score >= 45) return "#d97706"; // amber-600
  return "#dc2626"; // red-600
}

export function ScoreGauge({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  const clamped = Math.max(0, Math.min(100, value));
  const color = colorForScore(clamped);

  useEffect(() => {
    const controls = animate(0, clamped, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [clamped]);

  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  return (
    <div className="relative w-[180px] h-[180px]">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        <motion.circle
          cx="90"
          cy="90"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          {displayValue}
        </span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">/ 100</span>
      </div>
    </div>
  );
}
