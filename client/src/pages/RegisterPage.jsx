import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuthIllustration } from "../components/AuthIllustration";
import { PasswordInput } from "../components/PasswordInput";
import { HatchButton } from "../components/HatchButton";
import { neoCardClass, neoInputClass } from "../lib/theme";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-violet-50 dark:bg-slate-950">
      <AuthIllustration
        headline="Build a resume that"
        highlight="gets seen."
        subtext="Upload, score, and rewrite your resume with AI — free to start."
      />

      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className={`w-full max-w-sm p-8 ${neoCardClass}`}
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-400 dark:bg-amber-300 border-[3px] border-slate-900 dark:border-slate-900" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
            Create an account
          </h1>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 text-sm font-medium text-red-700 bg-red-100 border-[3px] border-red-900 rounded-2xl px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mb-4 ${neoInputClass}`}
          />

          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mb-4 ${neoInputClass}`}
          />

          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Password
          </label>
          <div className="mb-6">
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <HatchButton type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Sign up"}
          </HatchButton>

          <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-slate-900 dark:text-slate-100 font-bold underline">
              Log in
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
