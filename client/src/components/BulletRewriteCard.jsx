import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NeoButton } from "./NeoButton";
import { BulletDiff } from "./BulletDiff";

const TYPE_INTERVAL_MS = 12;

export function BulletRewriteCard({
  original,
  suggestion,
  loading,
  regenerating,
  applied,
  onAccept,
  onReject,
  onRegenerate,
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [doneTyping, setDoneTyping] = useState(false);

  useEffect(() => {
    if (!suggestion) return;
    const fullText = suggestion.improved;
    setDisplayedText("");
    setDoneTyping(false);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setDoneTyping(true);
      }
    }, TYPE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [suggestion?.improved]);

  if (applied) {
    return (
      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
        Applied &mdash; your resume has been updated.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">Thinking...</p>;
  }

  if (!suggestion) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      {doneTyping ? (
        <BulletDiff original={original} improved={suggestion.improved} />
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-500 line-through">{original}</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {displayedText}
            <span className="inline-block w-[2px] h-[1em] bg-slate-900 dark:bg-slate-100 align-middle ml-0.5 animate-pulse" />
          </p>
        </>
      )}

      {doneTyping && (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-400">{suggestion.reason}</p>
          <div className="flex flex-wrap items-center gap-3">
            <NeoButton size="sm" onClick={onAccept}>
              Accept
            </NeoButton>
            <NeoButton size="sm" onClick={onRegenerate} disabled={regenerating}>
              {regenerating ? "Regenerating..." : "Regenerate"}
            </NeoButton>
            <button
              type="button"
              onClick={onReject}
              className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Reject
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
