import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

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
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const data = await api.createResume({ title: newTitle }, token);
      navigate(`/resumes/${data.resume._id}`);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Your Resumes</h1>
        <button
          onClick={() => navigate("/resumes/upload")}
          className="text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Upload existing resume
        </button>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="New resume title (e.g. Frontend Developer Resume)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={creating}
          className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-md font-medium hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create blank"}
        </motion.button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      ) : resumes.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">
          No resumes yet. Create a blank one above, or upload an existing file.
        </p>
      ) : (
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden"
        >
          {resumes.map((resume) => (
            <motion.li key={resume._id} variants={itemVariants}>
              <button
                onClick={() => navigate(`/resumes/${resume._id}`)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">{resume.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
