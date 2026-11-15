import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

// A warm server answers the health check in well under a second, so if it
// takes longer than this we assume Render is waking it up from sleep.
const SLOW_AFTER_MS = 2500;
// A cold start on Render's free plan usually takes 30 to 60 seconds.
const GIVE_UP_AFTER_MS = 90000;
const RETRY_EVERY_MS = 3000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ServerStatusContext = createContext(null);

// status is one of: "checking" | "waking" | "ready" | "down"
export function ServerStatusProvider({ children }) {
  const [status, setStatus] = useState("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // One controller per attempt. Aborting it cancels the in-flight fetch,
    // both when we give up and when the effect is cleaned up.
    const controller = new AbortController();
    const { signal } = controller;

    const slowTimer = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "waking" : current));
    }, SLOW_AFTER_MS);

    const giveUpTimer = setTimeout(() => {
      controller.abort();
      setStatus("down");
    }, GIVE_UP_AFTER_MS);

    async function pingUntilAwake() {
      while (!signal.aborted) {
        try {
          await api.checkHealth(signal);
          clearTimeout(slowTimer);
          clearTimeout(giveUpTimer);
          setStatus("ready");
          return;
        } catch {
          // A network error or a 502 while Render is still booting the
          // server. Wait a moment and ask again until we hit the deadline.
          if (signal.aborted) return;
          await wait(RETRY_EVERY_MS);
        }
      }
    }

    pingUntilAwake();

    return () => {
      controller.abort();
      clearTimeout(slowTimer);
      clearTimeout(giveUpTimer);
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus("checking");
    setAttempt((n) => n + 1);
  }, []);

  return (
    <ServerStatusContext.Provider value={{ status, retry }}>
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  return useContext(ServerStatusContext);
}
