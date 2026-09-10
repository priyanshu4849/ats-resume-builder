import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Upload an existing resume</h1>
      <p className="text-slate-600 mb-6">
        PDF or DOCX, up to 5MB. We'll extract the text and structure it into editable sections.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-lg p-6 max-w-md"
      >
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full mb-4 text-sm text-slate-600"
        />

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-slate-900 text-white py-2 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {uploading ? "Processing..." : "Upload and parse"}
        </button>
      </form>
    </Layout>
  );
}
