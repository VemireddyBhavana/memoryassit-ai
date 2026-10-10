import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  ["Dashboard", "/dashboard"],
  ["Memories", "/memories"],
  ["Profile", "/profile"],
  ["Settings", "/settings"],
];

export default function AppLayout() {
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
        </nav>
      </header>
      <main className="workspace-content">
        <Outlet />
      </main>
    </div>
  );
}
