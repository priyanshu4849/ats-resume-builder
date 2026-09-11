import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { HatchButton, hatchButtonClass } from "../components/HatchButton";
import { NeoButton } from "../components/NeoButton";
import { neoCardClass, neoInputClass, neoTextareaClass } from "../lib/theme";

const emptyEducation = { school: "", degree: "", startDate: "", endDate: "", gpa: "" };
const emptyExperience = { company: "", role: "", startDate: "", endDate: "", bulletsText: "" };
const emptyProject = { name: "", techStackText: "", bulletsText: "", link: "" };

const TEMPLATES = [
  { value: "classic", label: "Classic", description: "Plain black & white, timeless ATS format" },
  { value: "modern", label: "Modern", description: "Accent color, section bars, skill pills" },
  { value: "minimal", label: "Minimal", description: "Compact spacing, fits more on one page" },
];

const entryCardClass =
  "bg-white dark:bg-slate-800 border-[3px] border-slate-900 dark:border-slate-100 rounded-2xl p-4 mb-3 space-y-2";

function toBulletsArray(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toCommaArray(text) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ResumeEditorPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [exporting, setExporting] = useState(false);

  const [title, setTitle] = useState("");
  const [personalInfo, setPersonalInfo] = useState({});
  const [skillsText, setSkillsText] = useState("");
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [template, setTemplate] = useState("classic");

  useEffect(() => {
    loadResume();
  }, [id]);

  async function loadResume() {
    try {
      const data = await api.getResume(id, token);
      const resume = data.resume;
      setTitle(resume.title);
      setPersonalInfo(resume.personalInfo || {});
      setSkillsText((resume.skills || []).join(", "));
      setEducation(resume.education || []);
      setExperience(
        (resume.experience || []).map((exp) => ({
          ...exp,
          bulletsText: (exp.bullets || []).join("\n"),
        }))
      );
      setProjects(
        (resume.projects || []).map((proj) => ({
          ...proj,
          techStackText: (proj.techStack || []).join(", "),
          bulletsText: (proj.bullets || []).join("\n"),
        }))
      );
      setTemplate(resume.template || "classic");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function flashSaved() {
    setSavedMessage("Saved");
    setTimeout(() => setSavedMessage(""), 1500);
  }

  async function saveField(field, value) {
    setError("");
    try {
      await api.updateResume(id, { [field]: value }, token);
      flashSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  function saveTitle() {
    saveField("title", title);
  }

  function savePersonalInfo() {
    saveField("personalInfo", personalInfo);
  }

  function saveSkills() {
    saveField("skills", toCommaArray(skillsText));
  }

  function saveEducation() {
    saveField("education", education);
  }

  function saveExperience() {
    saveField(
      "experience",
      experience.map(({ bulletsText, ...rest }) => ({
        ...rest,
        bullets: toBulletsArray(bulletsText),
      }))
    );
  }

  function saveProjects() {
    saveField(
      "projects",
      projects.map(({ techStackText, bulletsText, ...rest }) => ({
        ...rest,
        techStack: toCommaArray(techStackText),
        bullets: toBulletsArray(bulletsText),
      }))
    );
  }

  async function handleSelectTemplate(value) {
    setTemplate(value);
    saveField("template", value);
  }

  async function handleExportPDF() {
    setError("");
    setExporting(true);
    try {
      await api.exportResumePDF(id, token, template);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
        >
          &larr; Back to dashboard
        </button>
        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {savedMessage}
            </span>
          )}
          <NeoButton onClick={handleExportPDF} disabled={exporting} size="sm">
            {exporting ? "Generating..." : "Download PDF"}
          </NeoButton>
          <Link to={`/resumes/${id}/analyze`} className={hatchButtonClass("sm")}>
            Analyze against a job
          </Link>
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-700 bg-red-100 border-[3px] border-red-900 rounded-2xl px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Template */}
      <Section title="PDF Template">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <motion.button
              key={t.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectTemplate(t.value)}
              className={`text-left rounded-2xl border-[3px] p-3 transition-colors ${
                template === t.value
                  ? "border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-800"
                  : "border-slate-900/40 dark:border-slate-100/40 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800"
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-slate-100">{t.label}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.description}</div>
            </motion.button>
          ))}
        </div>
      </Section>

      {/* Title */}
      <Section title="Resume Title" onSave={saveTitle}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={neoInputClass}
        />
      </Section>

      {/* Personal Info */}
      <Section title="Personal Info" onSave={savePersonalInfo}>
        <div className="grid grid-cols-2 gap-3">
          {["name", "email", "phone", "linkedin", "github"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field}
              value={personalInfo[field] || ""}
              onChange={(e) => setPersonalInfo({ ...personalInfo, [field]: e.target.value })}
              className={neoInputClass}
            />
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills" onSave={saveSkills}>
        <input
          type="text"
          placeholder="Comma-separated, e.g. JavaScript, React, Node.js"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          className={neoInputClass}
        />
      </Section>

      {/* Education */}
      <Section title="Education" onSave={saveEducation}>
        {education.map((entry, i) => (
          <div key={i} className={entryCardClass}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="School"
                value={entry.school || ""}
                onChange={(e) => updateArrayItem(setEducation, i, "school", e.target.value)}
                className={neoInputClass}
              />
              <input
                type="text"
                placeholder="Degree"
                value={entry.degree || ""}
                onChange={(e) => updateArrayItem(setEducation, i, "degree", e.target.value)}
                className={neoInputClass}
              />
              <input
                type="text"
                placeholder="Start date"
                value={entry.startDate || ""}
                onChange={(e) => updateArrayItem(setEducation, i, "startDate", e.target.value)}
                className={neoInputClass}
              />
              <input
                type="text"
                placeholder="End date"
                value={entry.endDate || ""}
                onChange={(e) => updateArrayItem(setEducation, i, "endDate", e.target.value)}
                className={neoInputClass}
              />
              <input
                type="text"
                placeholder="GPA"
                value={entry.gpa || ""}
                onChange={(e) => updateArrayItem(setEducation, i, "gpa", e.target.value)}
                className={neoInputClass}
              />
            </div>
            <RemoveButton onClick={() => removeArrayItem(setEducation, i)} />
          </div>
        ))}
        <NeoButton
          type="button"
          size="sm"
          onClick={() => setEducation([...education, { ...emptyEducation }])}
        >
          + Add education
        </NeoButton>
      </Section>

      {/* Experience */}
      <Section title="Experience" onSave={saveExperience}>
        {experience.map((entry, i) => (
          <div key={i} className={entryCardClass}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Company"
                value={entry.company || ""}
                onChange={(e) => updateArrayItem(setExperience, i, "company", e.target.value)}
                className={neoInputClass}
              />
              <input
                type="text"
                placeholder="Role"
                value={entry.role || ""}
                onChange={(e) => updateArrayItem(setExperience, i, "role", e.target.value)}
                className={neoInputClass}
              />
              <input
                type="text"
                placeholder="Start date"
                value={entry.startDate || ""}
                onChange={(e) => updateArrayItem(setExperience, i, "startDate", e.target.value)}
                className={neoInputClass}
              />
              <input
                type="text"
                placeholder="End date"
                value={entry.endDate || ""}
                onChange={(e) => updateArrayItem(setExperience, i, "endDate", e.target.value)}
                className={neoInputClass}
              />
            </div>
            <textarea
              placeholder="One bullet point per line"
              value={entry.bulletsText || ""}
              onChange={(e) => updateArrayItem(setExperience, i, "bulletsText", e.target.value)}
              rows={3}
              className={neoTextareaClass}
            />
            <RemoveButton onClick={() => removeArrayItem(setExperience, i)} />
          </div>
        ))}
        <NeoButton
          type="button"
          size="sm"
          onClick={() => setExperience([...experience, { ...emptyExperience }])}
        >
          + Add experience
        </NeoButton>
      </Section>

      {/* Projects */}
      <Section title="Projects" onSave={saveProjects}>
        {projects.map((entry, i) => (
          <div key={i} className={entryCardClass}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Project name"
                value={entry.name || ""}
                onChange={(e) => updateArrayItem(setProjects, i, "name", e.target.value)}
                className={neoInputClass}
              />
              <input
                type="text"
                placeholder="Link"
                value={entry.link || ""}
                onChange={(e) => updateArrayItem(setProjects, i, "link", e.target.value)}
                className={neoInputClass}
              />
            </div>
            <input
              type="text"
              placeholder="Tech stack, comma-separated"
              value={entry.techStackText || ""}
              onChange={(e) => updateArrayItem(setProjects, i, "techStackText", e.target.value)}
              className={neoInputClass}
            />
            <textarea
              placeholder="One bullet point per line"
              value={entry.bulletsText || ""}
              onChange={(e) => updateArrayItem(setProjects, i, "bulletsText", e.target.value)}
              rows={3}
              className={neoTextareaClass}
            />
            <RemoveButton onClick={() => removeArrayItem(setProjects, i)} />
          </div>
        ))}
        <NeoButton type="button" size="sm" onClick={() => setProjects([...projects, { ...emptyProject }])}>
          + Add project
        </NeoButton>
      </Section>
    </Layout>
  );
}

function updateArrayItem(setter, index, field, value) {
  setter((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
}

function removeArrayItem(setter, index) {
  setter((prev) => prev.filter((_, i) => i !== index));
}

function Section({ title, onSave, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`p-5 mb-6 ${neoCardClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        {onSave && (
          <NeoButton onClick={onSave} size="sm">
            Save
          </NeoButton>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-bold text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
    >
      Remove
    </button>
  );
}
