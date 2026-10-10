import { Link } from "react-router-dom";

export default function PlaceholderPage({ title, description, children }) {
  return (
    <section className="page-card">
      <p className="page-eyebrow">MemoryAssist AI</p>
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
      {children}
      <div className="page-actions">
        <Link className="page-primary-link" to="/chat">
          Open the incident assistant
        </Link>
        <Link className="page-secondary-link" to="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </section>
  );
}
