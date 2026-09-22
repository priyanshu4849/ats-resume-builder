import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { HatchButton } from "../components/HatchButton";
import { neoCardClass } from "../lib/theme";

export function NotFoundPage() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-violet-50 dark:bg-slate-950 flex items-center justify-center px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`w-full max-w-sm p-8 text-center ${neoCardClass}`}
      >
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-400 dark:bg-amber-300 border-[3px] border-slate-900 dark:border-slate-900" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Page not found
        </h1>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">
          That page doesn't exist, or it may have moved.
        </p>

        <Link to={token ? "/dashboard" : "/"}>
          <HatchButton className="w-full">
            {token ? "Back to dashboard" : "Back home"}
          </HatchButton>
        </Link>
      </motion.div>
    </div>
  );
}
