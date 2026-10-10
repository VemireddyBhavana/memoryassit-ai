import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <section className="page-card">
      <p className="page-eyebrow">Workspace overview</p>
      <h1>Dashboard</h1>
      <p className="page-description">
        Your workspace routes are ready. Start with the existing incident chat
        demo, then return here as persistent conversations and account features
        are added.
      </p>
      <div className="dashboard-links">
        <Link to="/chat"><strong>Incident assistant</strong><span>Chat with memory recall and AI responses.</span></Link>
        <Link to="/memories"><strong>Memory library</strong><span>Memory management will be added in a later phase.</span></Link>
      </div>
    </section>
  );
}
