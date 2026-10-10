import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { useEffect, useState } from "react";
import { getSettings } from "../services/api.js";

const navigation = [
  ["Dashboard", "/dashboard"],
  ["Memories", "/memories"],
  ["Profile", "/profile"],
  ["Settings", "/settings"],
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    getSettings()
      .then(({ settings }) => { document.documentElement.dataset.theme = settings.theme; })
      .catch((error) => setLogoutError(error.message));
  }, []);

  async function handleLogout() {
    setLogoutError("");
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      setLogoutError(error.message);
    }
  }

  return (
    <div className="workspace-layout">
      <header className="workspace-header">
        <NavLink className="workspace-brand" to="/dashboard">
          <span aria-hidden="true">🧠</span> MemoryAssist AI
        </NavLink>
        <nav className="workspace-nav" aria-label="Main navigation">
          {navigation.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive ? "workspace-nav-link active" : "workspace-nav-link"
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink className="workspace-chat-link" to="/chat">
            Open Chat
          </NavLink>
          <span className="workspace-user">{user?.display_name}</span>
          <button className="workspace-logout" onClick={handleLogout}>Log out</button>
        </nav>
      </header>
      <main className="workspace-content">
        {logoutError && <p className="form-error" role="alert">{logoutError}</p>}
        <Outlet />
      </main>
    </div>
  );
}
