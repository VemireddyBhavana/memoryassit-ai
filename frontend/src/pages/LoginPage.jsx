import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Link className="workspace-brand" to="/">🧠 MemoryAssist AI</Link>
        <p className="page-eyebrow">Welcome back</p>
        <h1>Log in</h1>
        <p className="page-description">Access your saved conversations and memory workspace.</p>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={254} /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required minLength={10} maxLength={128} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="page-primary-link" type="submit" disabled={submitting}>{submitting ? "Logging in…" : "Log in"}</button>
        <p className="auth-switch">New to MemoryAssist? <Link to="/signup">Create an account</Link></p>
      </form>
    </main>
  );
}
