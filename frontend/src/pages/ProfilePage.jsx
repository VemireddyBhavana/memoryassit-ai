import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/api.js";
import useAuth from "../hooks/useAuth.js";

export default function ProfilePage() {
  const { setUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then(({ user }) => { setDisplayName(user.display_name); setEmail(user.email); })
      .catch((requestError) => setError(requestError.message));
  }, []);

  async function save(event) {
    event.preventDefault();
    setNotice("");
    setError("");
    try {
      const result = await updateProfile(displayName);
      setDisplayName(result.user.display_name);
      setUser(result.user);
      setNotice("Profile updated.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="page-card">
      <p className="page-eyebrow">Account</p>
      <h1>Profile</h1>
      <p className="page-description">Update your display name and review your account email.</p>
      <form className="profile-form" onSubmit={save}>
        <label>Name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} maxLength={80} required /></label>
        <label>Email<input value={email} readOnly /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-success" role="status">{notice}</p>}
        <button className="page-primary-link" type="submit">Save profile</button>
      </form>
    </section>
  );
}
