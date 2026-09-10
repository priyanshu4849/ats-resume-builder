import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="font-semibold text-slate-900">
            ATS Resume Builder
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {user && <span className="text-slate-600">{user.name}</span>}
            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
