import { diffWords } from "diff";

export function BulletDiff({ original, improved }) {
  const parts = diffWords(original, improved);

  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-500 dark:text-slate-500">
        {parts
          .filter((part) => !part.added)
          .map((part, i) =>
            part.removed ? (
              <span
                key={i}
                className="line-through bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
              >
                {part.value}
              </span>
            ) : (
              <span key={i}>{part.value}</span>
            )
          )}
      </p>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {parts
          .filter((part) => !part.removed)
          .map((part, i) =>
            part.added ? (
              <span
                key={i}
                className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 rounded px-0.5"
              >
                {part.value}
              </span>
            ) : (
              <span key={i}>{part.value}</span>
            )
          )}
      </p>
    </div>
  );
}
