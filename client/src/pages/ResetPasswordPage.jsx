import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuthIllustration } from "../components/AuthIllustration";
import { HatchButton } from "../components/HatchButton";
import { PasswordInput } from "../components/PasswordInput";
import { api } from "../api/client";
import { neoCardClass } from "../lib/theme";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-violet-50 dark:bg-slate-950">
      <AuthIllustration
        headline="Almost there —"
        highlight="new password."
        subtext="Choose a new password to get back into your account."
      />

      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`w-full max-w-sm p-8 ${neoCardClass}`}
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-400 dark:bg-amber-300 border-[3px] border-slate-900 dark:border-slate-900" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
            Set a new password
          </h1>

          {!token ? (
            <p role="alert" className="text-sm text-slate-700 dark:text-slate-300 text-center">
              This reset link is missing its token — please use the link from your email, or{" "}
              <Link to="/forgot-password" className="font-bold underline">
                request a new one
              </Link>
              .
            </p>
          ) : success ? (
            <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
              Password reset — taking you to log in...
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <p
                  role="alert"
                  className="mb-4 text-sm font-medium text-red-700 bg-red-100 border-[3px] border-red-900 rounded-2xl px-3 py-2"
                >
                  {error}
                </p>
              )}

              <label
                htmlFor="reset-password"
                className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1"
              >
                New password
              </label>
              <div className="mb-4">
                <PasswordInput
                  id="reset-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <label
                htmlFor="reset-confirm-password"
                className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1"
              >
                Confirm new password
              </label>
              <div className="mb-6">
                <PasswordInput
                  id="reset-confirm-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <HatchButton type="submit" disabled={loading} className="w-full">
                {loading ? "Resetting..." : "Reset password"}
              </HatchButton>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
