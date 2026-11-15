import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useServerStatus } from "../context/ServerStatusContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { NeoButton } from "./NeoButton";

const READY_MESSAGE_MS = 2500;

export function ServerWakeBanner() {
  const { status, retry } = useServerStatus();
  const reduceMotion = useReducedMotion();
  const [seconds, setSeconds] = useState(0);
  const [justWoke, setJustWoke] = useState(false);
  const sawWaking = useRef(false);

  // Count up while waking so the page never looks frozen.
  useEffect(() => {
    if (status !== "waking") return;
    sawWaking.current = true;
    const startedAt = Date.now();
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => {
      clearInterval(id);
      setSeconds(0);
    };
  }, [status]);

  // Only say "ready" if we told the user it was asleep. A warm server
  // answers so fast that the banner never needs to appear at all.
  useEffect(() => {
    if (status !== "ready" || !sawWaking.current) return;
    sawWaking.current = false;
    setJustWoke(true);
    const id = setTimeout(() => setJustWoke(false), READY_MESSAGE_MS);
    return () => clearTimeout(id);
  }, [status]);

  const visible = status === "waking" || status === "down" || justWoke;
  const offset = reduceMotion ? 0 : 24;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex justify-center sm:justify-end pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="server-banner"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: offset }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="pointer-events-auto w-full sm:max-w-sm rounded-2xl border-[3px] border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 shadow-[4px_4px_0_0] shadow-slate-900 dark:shadow-slate-100 p-4 text-sm text-slate-700 dark:text-slate-300"
          >
            {status === "waking" && (
              <>
                <div className="flex items-center justify-between gap-3 font-semibold text-slate-900 dark:text-slate-100">
                  {/* role={null}: the banner itself is already the status region.
                      Not undefined, because undefined falls back to the default "status". */}
                  <LoadingSpinner
                    label="Waking up the server"
                    className="text-slate-900 dark:text-slate-100"
                    role={null}
                  />
                  <span className="tabular-nums text-slate-500 dark:text-slate-400">{seconds}s</span>
                </div>
                <p className="mt-2">
                  It runs on a free plan that sleeps when nobody is using it, so the first load
                  can take up to a minute. You can keep using the page while it starts.
                </p>
              </>
            )}

            {status === "ready" && justWoke && (
              <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <span className="w-3 h-3 shrink-0 rounded-full bg-emerald-400 border-2 border-slate-900" />
                The server is ready.
              </p>
            )}

            {status === "down" && (
              <>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  The server isn&apos;t responding.
                </p>
                <p className="mt-1">It might still be starting. Give it a minute and try again.</p>
                <NeoButton size="sm" className="mt-3" onClick={retry}>
                  Try again
                </NeoButton>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
