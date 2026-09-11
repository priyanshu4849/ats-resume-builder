import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { PageTransition } from "./PageTransition";

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-violet-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b-[3px] border-slate-900 dark:border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 hover:opacity-80 transition-opacity"
          >
            <span className="w-6 h-6 rounded-full bg-amber-400 border-2 border-slate-900" />
            ATS Resume Builder
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {user && <span className="text-slate-700 dark:text-slate-300 font-medium">{user.name}</span>}
            <button
              onClick={handleLogout}
              className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold"
            >
              Log out
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
