import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

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
        <h1 className="text-2xl font-semibold text-slate-900">Your Resumes</h1>
        <button
          onClick={() => navigate("/resumes/upload")}
          className="text-sm font-medium text-slate-900 border border-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-100"
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
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create blank"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : resumes.length === 0 ? (
        <p className="text-slate-500">
          No resumes yet. Create a blank one above, or upload an existing file.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
          {resumes.map((resume) => (
            <li key={resume._id}>
              <button
                onClick={() => navigate(`/resumes/${resume._id}`)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between"
              >
                <span className="font-medium text-slate-900">{resume.title}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  {resume.source}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
