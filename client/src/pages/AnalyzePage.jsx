import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { HatchButton } from "../components/HatchButton";
import { NeoButton } from "../components/NeoButton";
import { neoCardClass, neoTextareaClass } from "../lib/theme";

export function AnalyzePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const [rewritingIndex, setRewritingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    setError("");
    setAnalyzing(true);
    setSuggestions({});
    try {
      const data = await api.analyzeResume(id, jobDescription, token);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGetSuggestion(index, bulletText) {
    setRewritingIndex(index);
    try {
      const data = await api.rewriteBullet(id, bulletText, jobDescription, token);
      setSuggestions((prev) => ({ ...prev, [index]: data.suggestion }));
    } catch (err) {
      setError(err.message);
    } finally {
      setRewritingIndex(null);
    }
  }

  async function handleCopy(index, text) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  return (
    <Layout>
      <button
        onClick={() => navigate(`/resumes/${id}`)}
        className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 mb-6 block"
      >
        &larr; Back to resume
      </button>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        ATS Match Analysis
      </h1>
      <p className="text-slate-700 dark:text-slate-400 mb-6">
        Paste a job description to see how well this resume matches, and get suggestions for weak
        bullet points.
      </p>

      <form onSubmit={handleAnalyze} className="mb-8">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={6}
          className={`mb-3 ${neoTextareaClass}`}
        />
        <HatchButton type="submit" disabled={analyzing}>
          {analyzing ? "Analyzing..." : "Analyze"}
        </HatchButton>
      </form>

      {error && (
        <p className="text-sm font-medium text-red-700 bg-red-100 border-[3px] border-red-900 rounded-2xl px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className={`p-5 ${neoCardClass}`}>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Match Score</h2>
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-3xl font-extrabold text-slate-900 dark:text-slate-100"
                >
                  {analysis.matchScore}
                </motion.div>
                <div className="text-slate-700 dark:text-slate-400 font-medium">/ 100</div>
              </div>
            </div>

            <div className={`p-5 ${neoCardClass}`}>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Missing Keywords</h2>
              {analysis.missingKeywords.length === 0 ? (
                <p className="text-sm text-slate-700 dark:text-slate-400">None &mdash; good coverage.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-[3px] border-slate-900 dark:border-slate-100 rounded-full px-3 py-1"
                    >
                      {keyword}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-5 ${neoCardClass}`}>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Weak Bullet Points</h2>
              {analysis.weakBullets.length === 0 ? (
                <p className="text-sm text-slate-700 dark:text-slate-400">No weak bullets flagged.</p>
              ) : (
                <div className="space-y-4">
                  {analysis.weakBullets.map((bullet, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-800 border-[3px] border-slate-900 dark:border-slate-100 rounded-2xl p-3"
                    >
                      <p className="text-sm text-slate-900 dark:text-slate-100 mb-1 font-medium">
                        {bullet.text}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{bullet.reason}</p>

                      <AnimatePresence mode="wait">
                        {suggestions[i] ? (
                          <motion.div
                            key="suggestion"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-emerald-50 dark:bg-emerald-950/30 border-[3px] border-emerald-800 dark:border-emerald-600 rounded-2xl p-3 mt-2"
                          >
                            <p className="text-sm text-emerald-900 dark:text-emerald-300 font-semibold mb-1">
                              {suggestions[i].improved}
                            </p>
                            <p className="text-xs text-emerald-800 dark:text-emerald-500 mb-2">
                              {suggestions[i].reason}
                            </p>
                            <NeoButton size="sm" onClick={() => handleCopy(i, suggestions[i].improved)}>
                              {copiedIndex === i ? "Copied!" : "Copy"}
                            </NeoButton>
                          </motion.div>
                        ) : (
                          <NeoButton
                            key="button"
                            size="sm"
                            onClick={() => handleGetSuggestion(i, bullet.text)}
                            disabled={rewritingIndex === i}
                          >
                            {rewritingIndex === i ? "Rewriting..." : "Get rewrite suggestion"}
                          </NeoButton>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-500 mt-4">
                Like a suggestion? Copy it and paste it into the matching bullet on the resume
                editor page &mdash; nothing here is saved automatically.
              </p>
            </div>

            <NeoButton onClick={() => navigate(`/resumes/${id}`)}>&larr; Back to resume</NeoButton>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
