import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup({ displayName, email, password });
      navigate("/dashboard", { replace: true });
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
        <p className="page-eyebrow">Get started</p>
        <h1>Create your account</h1>
        <p className="page-description">Your account keeps your conversations and saved memories private.</p>
        <label>Name<input type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" required minLength={2} maxLength={80} /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={254} /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required minLength={10} maxLength={128} /></label>
        <p className="form-hint">Use at least 10 characters.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="page-primary-link" type="submit" disabled={submitting}>{submitting ? "Creating account…" : "Create account"}</button>
        <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}
