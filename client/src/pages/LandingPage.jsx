import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { HatchButton } from "../components/HatchButton";
import { NeoButton } from "../components/NeoButton";
import { neoCardClass } from "../lib/theme";

const steps = [
  {
    title: "Build or upload",
    desc: "Start from scratch, or upload an existing PDF/DOCX — we'll parse it into editable sections automatically.",
  },
  {
    title: "Analyze against a job",
    desc: "Paste a job description and get an ATS match score, a keyword gap list, and callouts on weak bullet points.",
  },
  {
    title: "Rewrite and export",
    desc: "Accept AI-suggested rewrites bullet by bullet with a real diff, then download a clean, ATS-safe PDF.",
  },
];

const features = [
  {
    title: "ATS match score",
    desc: "See exactly how your resume scores against a specific job description — not a generic checklist.",
  },
  {
    title: "Keyword gap check",
    desc: "A side-by-side view of keywords you already have vs. ones the job description expects.",
  },
  {
    title: "AI bullet rewrites",
    desc: "Weak bullets get rewritten with a word-level diff you can accept, regenerate, or reject.",
  },
  {
    title: "ATS-safe PDF export",
    desc: "One click to a clean, parser-friendly PDF once you're happy with the result.",
  },
];

export function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-violet-50 dark:bg-slate-950">
      <header className="border-b-[3px] border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 min-w-0 font-bold text-slate-900 dark:text-slate-100"
          >
            <span className="w-6 h-6 shrink-0 rounded-full bg-amber-400 border-2 border-slate-900" />
            <span className="truncate">ATS Resume Builder</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ThemeToggle />
            {token ? (
              <NeoButton size="sm" onClick={() => navigate("/dashboard")}>
                Go to dashboard
              </NeoButton>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Log in
                </Link>
                <HatchButton size="sm" onClick={() => navigate("/register")}>
                  Get started free
                </HatchButton>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12 text-center flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight"
        >
          Land more interviews,{" "}
          <span className="bg-amber-300 text-slate-900 px-2 rounded-md border-[3px] border-slate-900 inline-block">
            faster.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
          className="mt-5 text-lg text-slate-700 dark:text-slate-300 max-w-xl"
        >
          Build a resume, score it against a real job description, and let AI fix the weak spots —
          all before an applicant tracking system ever sees it.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <HatchButton
            className="w-full sm:w-auto"
            onClick={() => navigate(token ? "/dashboard" : "/register")}
          >
            {token ? "Go to dashboard" : "Get started free"}
          </HatchButton>
          {!token && (
            <NeoButton className="w-full sm:w-auto" onClick={() => navigate("/login")}>
              Log in
            </NeoButton>
          )}
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 flex justify-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-[40%] bg-violet-200 dark:bg-violet-950/60" />

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
            transition={{
              opacity: { delay: 0.3 },
              scale: { delay: 0.3 },
              y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
            }}
            className="absolute top-6 left-0 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full border-[3px] border-white dark:border-slate-950 flex items-center gap-1"
          >
            92 <span className="text-emerald-400">✓</span> ATS Score
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: [0, -6, 0] }}
            transition={{
              opacity: { delay: 0.5 },
              scale: { delay: 0.5 },
              y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
            }}
            className="absolute bottom-8 right-0 bg-amber-300 text-amber-900 text-xs font-semibold px-3 py-1.5 rounded-full border-[3px] border-slate-900"
          >
            + AI rewrite
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-10">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className={`p-6 ${neoCardClass}`}>
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-center mb-4">
                {i + 1}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-10">
          Everything you need to pass the screen
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-3xl border-[3px] border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <div className={`p-10 ${neoCardClass}`}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Ready to see your score?
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            Free to start — no credit card required.
          </p>
          <HatchButton onClick={() => navigate(token ? "/dashboard" : "/register")}>
            {token ? "Go to dashboard" : "Get started free"}
          </HatchButton>
        </div>
      </section>

      <footer className="border-t-[3px] border-slate-900 dark:border-slate-100 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Built with the MERN stack, Claude, and a lot of debugging.
      </footer>
    </div>
  );
}
