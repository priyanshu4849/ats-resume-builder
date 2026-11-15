import { useState } from "react";
import { neoCardClass } from "../lib/theme";
import { formatAnalysisDate } from "../lib/formatAnalysisDate";

const SHOWN_BY_DEFAULT = 5;

// Same thresholds as ScoreGauge, so a score reads the same color everywhere.
function scorePillClass(score) {
  if (score >= 75) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-700 dark:border-emerald-500";
  if (score >= 45) return "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-700 dark:border-amber-500";
  return "bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-700 dark:border-red-500";
}

// Job descriptions usually open with the job title, so the first line is
// the most recognizable label for "which job was this?"
function jobLabel(jdText) {
  const firstLine = (jdText || "").split("\n").map((line) => line.trim()).find(Boolean) || "Untitled job";
  return firstLine.length > 90 ? `${firstLine.slice(0, 90).trimEnd()}...` : firstLine;
}

export function PastAnalyses({ analyses, currentId, onOpen }) {
  const [showAll, setShowAll] = useState(false);
  if (!analyses || analyses.length === 0) return null;

  const newestFirst = [...analyses].reverse();
  const visible = showAll ? newestFirst : newestFirst.slice(0, SHOWN_BY_DEFAULT);
  const hiddenCount = newestFirst.length - visible.length;

  return (
    <div className={`p-5 mb-8 ${neoCardClass}`}>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="font-bold text-slate-900 dark:text-slate-100">Past analyses</h2>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {analyses.length} saved
        </span>
      </div>

      <ul className="space-y-2">
        {visible.map((analysis) => {
          const isCurrent = analysis._id === currentId;
          return (
            <li key={analysis._id}>
              <button
                type="button"
                onClick={() => onOpen(analysis)}
                aria-current={isCurrent ? "true" : undefined}
                className={`w-full flex items-center gap-3 text-left rounded-2xl border-[3px] px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-slate-900 ${
                  isCurrent
                    ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                    : "border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <span
                  className={`shrink-0 w-12 text-center tabular-nums text-sm font-bold border-[3px] rounded-full py-0.5 ${scorePillClass(analysis.matchScore)}`}
                >
                  {analysis.matchScore}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 break-words">
                    {jobLabel(analysis.jdText)}
                  </span>
                  <span className="block text-xs text-slate-600 dark:text-slate-400">
                    {formatAnalysisDate(analysis.createdAt)}
                  </span>
                </span>
                <span
                  className={`shrink-0 text-xs font-bold ${
                    isCurrent ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {isCurrent ? "Viewing" : "Open"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
        >
          Show {hiddenCount} older
        </button>
      )}
    </div>
  );
}
