import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export function UploadPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const data = await api.uploadResume(file, token);
      navigate(`/resumes/${data.resume._id}`);
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Upload an existing resume
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        PDF or DOCX, up to 5MB. We'll extract the text and structure it into editable sections.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 max-w-md"
      >
        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full mb-4 text-sm text-slate-600 dark:text-slate-400"
        />

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2 rounded-md font-medium hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50"
        >
          {uploading ? "Processing..." : "Upload and parse"}
        </motion.button>
      </motion.form>
    </Layout>
  );
}
