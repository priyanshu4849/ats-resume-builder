import { motion } from "framer-motion";

export function AuthIllustration({ headline, highlight, subtext }) {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 dark:from-violet-950 dark:via-indigo-950 dark:to-slate-950 px-12 py-10 text-white">
      {/* Decorative background facets */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      <span className="relative font-semibold text-lg tracking-tight">ATS Resume Builder</span>

      <div className="relative flex flex-col items-center">
        <div className="relative w-72 h-72 flex items-center justify-center">
          <div className="absolute inset-0 rounded-[40%] bg-white/10" />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-40 bg-white rounded-2xl border-[3px] border-slate-900 shadow-[4px_4px_0_0] shadow-slate-900 p-3 text-slate-800"
          >
            <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-slate-900 mb-2" />
            <div className="h-2 w-3/4 rounded bg-slate-300 mb-1.5" />
            <div className="h-2 w-1/2 rounded bg-slate-200 mb-3" />
            <div className="h-1.5 w-full rounded bg-slate-100 mb-1" />
            <div className="h-1.5 w-full rounded bg-slate-100 mb-1" />
            <div className="h-1.5 w-5/6 rounded bg-slate-100 mb-1" />
            <div className="h-1.5 w-full rounded bg-slate-100" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: [0, -6, 0] }}
            transition={{ opacity: { delay: 0.3 }, scale: { delay: 0.3 }, y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
            className="absolute top-6 left-0 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full border-[3px] border-white flex items-center gap-1"
          >
            92 <span className="text-emerald-400">✓</span> ATS Score
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: [0, -6, 0] }}
            transition={{ opacity: { delay: 0.5 }, scale: { delay: 0.5 }, y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 } }}
            className="absolute bottom-8 right-0 bg-amber-300 text-amber-900 text-xs font-semibold px-3 py-1.5 rounded-full border-[3px] border-slate-900"
          >
            + AI rewrite
          </motion.div>
        </div>

        <h2 className="mt-8 text-3xl font-bold text-center leading-tight max-w-xs">
          {headline}{" "}
          <span className="bg-amber-300 text-slate-900 px-2 rounded-md border-[3px] border-slate-900">{highlight}</span>
        </h2>
        <p className="mt-3 text-sm text-white/80 text-center max-w-xs">{subtext}</p>
      </div>

      <div className="relative" />
    </div>
  );
}
