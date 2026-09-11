import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

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
        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 block"
      >
        &larr; Back to resume
      </button>

      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        ATS Match Analysis
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Paste a job description to see how well this resume matches, and get suggestions for weak
        bullet points.
      </p>

      <form onSubmit={handleAnalyze} className="mb-8">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={6}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md mb-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
        />
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={analyzing}
          className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-md font-medium hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Analyze"}
        </motion.button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Match Score</h2>
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-3xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {analysis.matchScore}
                </motion.div>
                <div className="text-slate-500 dark:text-slate-400">/ 100</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Missing Keywords
              </h2>
              {analysis.missingKeywords.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">None &mdash; good coverage.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="text-sm bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900 rounded-full px-3 py-1"
                    >
                      {keyword}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Weak Bullet Points
              </h2>
              {analysis.weakBullets.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No weak bullets flagged.</p>
              ) : (
                <div className="space-y-4">
                  {analysis.weakBullets.map((bullet, i) => (
                    <div
                      key={i}
                      className="border border-slate-200 dark:border-slate-800 rounded-md p-3"
                    >
                      <p className="text-sm text-slate-900 dark:text-slate-100 mb-1">{bullet.text}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{bullet.reason}</p>

                      <AnimatePresence mode="wait">
                        {suggestions[i] ? (
                          <motion.div
                            key="suggestion"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md p-3 mt-2"
                          >
                            <p className="text-sm text-green-900 dark:text-green-300 font-medium mb-1">
                              {suggestions[i].improved}
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-500 mb-2">
                              {suggestions[i].reason}
                            </p>
                            <button
                              onClick={() => handleCopy(i, suggestions[i].improved)}
                              className="text-xs font-medium text-green-800 dark:text-green-400 border border-green-300 dark:border-green-800 rounded-md px-2 py-1 hover:bg-green-100 dark:hover:bg-green-900/40"
                            >
                              {copiedIndex === i ? "Copied!" : "Copy"}
                            </button>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleGetSuggestion(i, bullet.text)}
                            disabled={rewritingIndex === i}
                            className="text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            {rewritingIndex === i ? "Rewriting..." : "Get rewrite suggestion"}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                Like a suggestion? Copy it and paste it into the matching bullet on the resume
                editor page &mdash; nothing here is saved automatically.
              </p>
            </div>

            <button
              onClick={() => navigate(`/resumes/${id}`)}
              className="text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              &larr; Back to resume
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
