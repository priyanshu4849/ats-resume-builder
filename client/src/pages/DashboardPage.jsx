import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { HatchButton } from "../components/HatchButton";
import { NeoButton } from "../components/NeoButton";
import { neoCardClass, neoInputClass } from "../lib/theme";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes() {
    try {
      const data = await api.listResumes(token);
      setResumes(data.resumes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const data = await api.createResume({ title: newTitle.trim() || "Untitled Resume" }, token);
      navigate(`/resumes/${data.resume._id}`);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Resumes</h1>
        <NeoButton onClick={() => navigate("/resumes/upload")}>Upload existing resume</NeoButton>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="New resume title (e.g. Frontend Developer Resume)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className={`flex-1 ${neoInputClass}`}
        />
        <HatchButton type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create blank"}
        </HatchButton>
      </form>

      {error && (
        <p className="text-sm font-medium text-red-700 bg-red-100 border-[3px] border-red-900 rounded-2xl px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      ) : resumes.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">
          No resumes yet. Create a blank one above, or upload an existing file.
        </p>
      ) : (
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="show"
          className={`divide-y-[3px] divide-slate-900 dark:divide-slate-100 overflow-hidden ${neoCardClass}`}
        >
          {resumes.map((resume) => (
            <motion.li key={resume._id} variants={itemVariants}>
              <button
                onClick={() => navigate(`/resumes/${resume._id}`)}
                className="w-full text-left px-5 py-4 hover:bg-white/50 dark:hover:bg-slate-900/50 flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100">{resume.title}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 rounded-full px-2 py-0.5 uppercase tracking-wide">
                  {resume.source}
                </span>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </Layout>
  );
}
