import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { HatchButton } from "../components/HatchButton";
import { NeoButton } from "../components/NeoButton";
import { neoCardClass } from "../lib/theme";

export function UploadPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
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
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Upload an existing resume
      </h1>
      <p className="text-slate-700 dark:text-slate-400 mb-6">
        PDF or DOCX, up to 5MB. We'll extract the text and structure it into editable sections.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onSubmit={handleSubmit}
        className={`p-6 max-w-md ${neoCardClass}`}
      >
        {error && (
          <p className="mb-4 text-sm font-medium text-red-700 bg-red-100 border-[3px] border-red-900 rounded-2xl px-3 py-2">
            {error}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />

        <div className="flex items-center gap-3 mb-4">
          <NeoButton type="button" size="sm" onClick={() => fileInputRef.current.click()}>
            Choose file
          </NeoButton>
          <span className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
            {file ? file.name : "No file chosen"}
          </span>
        </div>

        <HatchButton type="submit" disabled={!file || uploading} className="w-full">
          {uploading ? "Processing..." : "Upload and parse"}
        </HatchButton>
      </motion.form>
    </Layout>
  );
}
