import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuthIllustration } from "../components/AuthIllustration";
import { HatchButton } from "../components/HatchButton";
import { api } from "../api/client";
import { neoCardClass, neoInputClass } from "../lib/theme";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-violet-50 dark:bg-slate-950">
      <AuthIllustration
        headline="Forgot your"
        highlight="password?"
        subtext="No worries — we'll email you a link to set a new one."
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

          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-center">
            Reset your password
          </h1>

          {submitted ? (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center mt-4">
                If an account exists with that email, we've sent a link to reset your password.
                It expires in 1 hour.
              </p>
              <Link
                to="/login"
                className="block mt-6 text-sm font-bold text-center text-slate-900 dark:text-slate-100 underline"
              >
                Back to log in
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center mb-6">
                Enter the email on your account and we'll send you a reset link.
              </p>

              {error && (
                <p
                  role="alert"
                  className="mb-4 text-sm font-medium text-red-700 bg-red-100 border-[3px] border-red-900 rounded-2xl px-3 py-2"
                >
                  {error}
                </p>
              )}

              <label
                htmlFor="forgot-email"
                className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1"
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mb-6 ${neoInputClass}`}
              />

              <HatchButton type="submit" disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send reset link"}
              </HatchButton>

              <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 text-center">
                <Link to="/login" className="text-slate-900 dark:text-slate-100 font-bold underline">
                  Back to log in
                </Link>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
