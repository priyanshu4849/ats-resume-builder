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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="font-semibold text-slate-900 dark:text-slate-100 hover:opacity-80 transition-opacity"
          >
            ATS Resume Builder
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {user && <span className="text-slate-600 dark:text-slate-400">{user.name}</span>}
            <button
              onClick={handleLogout}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
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
