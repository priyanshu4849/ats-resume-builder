import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { HatchButton } from "../components/HatchButton";
import { NeoButton } from "../components/NeoButton";
import { ScoreGauge } from "../components/ScoreGauge";
import { CategoryBar } from "../components/CategoryBar";
import { neoCardClass, neoTextareaClass } from "../lib/theme";

export function AnalyzePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const [rewritingIndex, setRewritingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [rewritingResume, setRewritingResume] = useState(false);
  const [rewriteResult, setRewriteResult] = useState(null);
  const [selectedBullets, setSelectedBullets] = useState(new Set());
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.getResume(id, token).then((data) => setResume(data.resume)).catch((err) => setError(err.message));
  }, [id]);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    setError("");
    setAnalyzing(true);
    setSuggestions({});
    setRewriteResult(null);
    setApplySuccess("");
    try {
      const data = await api.analyzeResume(id, jobDescription, token);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleRewriteResume() {
    setError("");
    setApplySuccess("");
    setRewritingResume(true);
    try {
      const data = await api.rewriteResumeForJD(
        id,
        jobDescription,
        analysis.weakBullets,
        analysis.missingKeywords,
        token
      );
      setRewriteResult(data);
      setSelectedBullets(
        new Set(data.bulletRewrites.map((_, i) => i).filter((i) => data.bulletRewrites[i].location))
      );
      setSelectedSkills(new Set(data.suggestedSkillsToAdd.map((_, i) => i)));
    } catch (err) {
      setError(err.message);
    } finally {
      setRewritingResume(false);
    }
  }

  function toggleSelected(set, setSet, index) {
    const next = new Set(set);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSet(next);
  }

  async function handleApplyRewrite() {
    setError("");
    setApplying(true);
    try {
      const updatedExperience = resume.experience.map((exp) => ({ ...exp, bullets: [...exp.bullets] }));
      const updatedProjects = resume.projects.map((proj) => ({ ...proj, bullets: [...proj.bullets] }));

      rewriteResult.bulletRewrites.forEach((rewrite, i) => {
        if (!selectedBullets.has(i) || !rewrite.location) return;
        const { section, entryIndex, bulletIndex } = rewrite.location;
        const target = section === "experience" ? updatedExperience : updatedProjects;
        target[entryIndex].bullets[bulletIndex] = rewrite.improved;
      });

      const skillsToAdd = rewriteResult.suggestedSkillsToAdd.filter((_, i) => selectedSkills.has(i));
      const updatedSkills = [...resume.skills, ...skillsToAdd];

      const data = await api.updateResume(
        id,
        { experience: updatedExperience, projects: updatedProjects, skills: updatedSkills },
        token
      );
      setResume(data.resume);
      setRewriteResult(null);
      setApplySuccess("Applied — your resume has been updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  }

  async function handleDownloadPDF() {
    setError("");
    setDownloading(true);
    try {
      await api.exportResumePDF(id, token, resume?.template);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
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
          aria-label="Job description"
          rows={6}
          className={`mb-3 ${neoTextareaClass}`}
        />
        <HatchButton type="submit" disabled={analyzing}>
          {analyzing ? "Analyzing..." : "Analyze"}
        </HatchButton>
      </form>

      {error && (
        <p
          role="alert"
          className="text-sm font-medium text-red-700 bg-red-100 border-[3px] border-red-900 rounded-2xl px-3 py-2 mb-4"
        >
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
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-3">ATS Score</h2>
              <div className="flex flex-wrap items-center gap-8">
                <ScoreGauge value={analysis.matchScore} />
                {analysis.categories && (
                  <div className="flex-1 min-w-[240px] space-y-3">
                    <CategoryBar label="Keywords" {...analysis.categories.keywords} />
                    <CategoryBar label="Formatting" {...analysis.categories.formatting} />
                    <CategoryBar label="Action Verbs" {...analysis.categories.actionVerbs} />
                    <CategoryBar label="Quantified Impact" {...analysis.categories.quantifiedImpact} />
                    <CategoryBar label="Length" {...analysis.categories.length} />
                  </div>
                )}
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

            {(analysis.weakBullets.length > 0 || analysis.missingKeywords.length > 0) && (
              <div className={`p-5 ${neoCardClass}`}>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Rewrite My Resume For This Job
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-400 mb-3">
                  Rewrites the weak bullets above and proposes adding the missing keywords to your
                  skills. Nothing is saved until you review it and click Apply.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {!rewriteResult && (
                    <NeoButton onClick={handleRewriteResume} disabled={rewritingResume || !resume}>
                      {rewritingResume ? "Rewriting..." : "Rewrite my resume for this job"}
                    </NeoButton>
                  )}

                  <NeoButton
                    onClick={handleDownloadPDF}
                    disabled={!applySuccess || downloading}
                    title={
                      applySuccess
                        ? "Download the updated resume as a PDF"
                        : "Apply a rewrite first to enable download"
                    }
                  >
                    {downloading ? "Generating..." : "Download rewritten resume"}
                  </NeoButton>
                </div>

                {applySuccess && (
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
                    {applySuccess}
                  </p>
                )}

                <AnimatePresence>
                  {rewriteResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 mt-2"
                    >
                      {rewriteResult.bulletRewrites.map((rewrite, i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-slate-800 border-[3px] border-slate-900 dark:border-slate-100 rounded-2xl p-3"
                        >
                          <p className="text-xs text-slate-500 dark:text-slate-500 line-through mb-1">
                            {rewrite.original}
                          </p>

                          {rewrite.location ? (
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedBullets.has(i)}
                                onChange={() => toggleSelected(selectedBullets, setSelectedBullets, i)}
                                className="mt-1"
                              />
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {rewrite.improved}
                              </span>
                            </label>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {rewrite.improved}
                              </p>
                              <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                                Couldn&apos;t find this exact bullet in your resume anymore (it may
                                have changed since you analyzed) &mdash; copy it in manually instead.
                              </p>
                              <NeoButton
                                size="sm"
                                className="mt-2"
                                onClick={() => handleCopy(`bulk-${i}`, rewrite.improved)}
                              >
                                {copiedIndex === `bulk-${i}` ? "Copied!" : "Copy"}
                              </NeoButton>
                            </div>
                          )}
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {rewrite.reason}
                          </p>
                        </div>
                      ))}

                      {rewriteResult.suggestedSkillsToAdd.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 border-[3px] border-slate-900 dark:border-slate-100 rounded-2xl p-3">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            Add to Skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {rewriteResult.suggestedSkillsToAdd.map((skill, i) => (
                              <label
                                key={i}
                                className="flex items-center gap-1.5 text-sm font-semibold bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-[3px] border-slate-900 dark:border-slate-100 rounded-full px-3 py-1 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSkills.has(i)}
                                  onChange={() => toggleSelected(selectedSkills, setSelectedSkills, i)}
                                />
                                {skill}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <NeoButton
                          onClick={handleApplyRewrite}
                          disabled={applying || (selectedBullets.size === 0 && selectedSkills.size === 0)}
                        >
                          {applying
                            ? "Applying..."
                            : `Apply ${selectedBullets.size + selectedSkills.size} change${
                                selectedBullets.size + selectedSkills.size === 1 ? "" : "s"
                              } to my resume`}
                        </NeoButton>
                        <button
                          type="button"
                          onClick={() => setRewriteResult(null)}
                          className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          Discard
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <NeoButton onClick={() => navigate(`/resumes/${id}`)}>&larr; Back to resume</NeoButton>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
