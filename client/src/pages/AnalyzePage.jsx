import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
        className="text-sm text-slate-600 hover:text-slate-900 mb-6 block"
      >
        &larr; Back to resume
      </button>

      <h1 className="text-2xl font-semibold text-slate-900 mb-2">ATS Match Analysis</h1>
      <p className="text-slate-600 mb-6">
        Paste a job description to see how well this resume matches, and get suggestions for weak
        bullet points.
      </p>

      <form onSubmit={handleAnalyze} className="mb-8">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={6}
          className="w-full px-3 py-2 border border-slate-300 rounded-md mb-3"
        />
        <button
          type="submit"
          disabled={analyzing}
          className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {analysis && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-2">Match Score</h2>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-slate-900">{analysis.matchScore}</div>
              <div className="text-slate-500">/ 100</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Missing Keywords</h2>
            {analysis.missingKeywords.length === 0 ? (
              <p className="text-sm text-slate-500">None &mdash; good coverage.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="text-sm bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-3 py-1"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Weak Bullet Points</h2>
            {analysis.weakBullets.length === 0 ? (
              <p className="text-sm text-slate-500">No weak bullets flagged.</p>
            ) : (
              <div className="space-y-4">
                {analysis.weakBullets.map((bullet, i) => (
                  <div key={i} className="border border-slate-200 rounded-md p-3">
                    <p className="text-sm text-slate-900 mb-1">{bullet.text}</p>
                    <p className="text-xs text-slate-500 mb-2">{bullet.reason}</p>

                    {suggestions[i] ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-2">
                        <p className="text-sm text-green-900 font-medium mb-1">
                          {suggestions[i].improved}
                        </p>
                        <p className="text-xs text-green-700 mb-2">{suggestions[i].reason}</p>
                        <button
                          onClick={() => handleCopy(i, suggestions[i].improved)}
                          className="text-xs font-medium text-green-800 border border-green-300 rounded-md px-2 py-1 hover:bg-green-100"
                        >
                          {copiedIndex === i ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGetSuggestion(i, bullet.text)}
                        disabled={rewritingIndex === i}
                        className="text-sm font-medium text-slate-900 border border-slate-300 rounded-md px-3 py-1 hover:bg-slate-100 disabled:opacity-50"
                      >
                        {rewritingIndex === i ? "Rewriting..." : "Get rewrite suggestion"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-4">
              Like a suggestion? Copy it and paste it into the matching bullet on the resume
              editor page &mdash; nothing here is saved automatically.
            </p>
          </div>

          <button
            onClick={() => navigate(`/resumes/${id}`)}
            className="text-sm font-medium text-slate-900 border border-slate-300 rounded-md px-4 py-2 hover:bg-slate-100"
          >
            &larr; Back to resume
          </button>
        </div>
      )}
    </Layout>
  );
}
