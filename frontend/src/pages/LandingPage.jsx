import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-glow" />
      <header className="landing-header">
        <Link className="workspace-brand" to="/">
          <span aria-hidden="true">🧠</span> MemoryAssist AI
        </Link>
        <nav aria-label="Account navigation">
          <Link to="/login">Log in</Link>
          <Link className="workspace-chat-link" to="/signup">Get started</Link>
        </nav>
      </header>
      <section className="landing-hero">
        <p className="page-eyebrow">AI incident memory for modern teams</p>
        <h1>Resolve incidents with the context your team already learned.</h1>
        <p className="page-description">
          MemoryAssist connects past incident knowledge with AI responses, so
          support teams can investigate recurring problems without starting
          from scratch.
        </p>
        <div className="page-actions">
          <Link className="page-primary-link" to="/chat">Try the live demo</Link>
          <Link className="page-secondary-link" to="/dashboard">Explore dashboard</Link>
        </div>
      </section>
    </main>
  );
}
