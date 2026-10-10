import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../services/api.js";

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getSettings()
      .then(({ settings }) => {
        setTheme(settings.theme);
        document.documentElement.dataset.theme = settings.theme;
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  async function changeTheme(event) {
    const nextTheme = event.target.value;
    setError("");
    setNotice("");
    try {
      const result = await updateSettings(nextTheme);
      setTheme(result.settings.theme);
      document.documentElement.dataset.theme = result.settings.theme;
      setNotice("Theme preference saved.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="page-card">
      <p className="page-eyebrow">Preferences</p>
      <h1>Settings</h1>
      <p className="page-description">Choose the appearance used for your workspace.</p>
      <label className="settings-select">Color theme
        <select value={theme} onChange={changeTheme}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="form-success" role="status">{notice}</p>}
    </section>
  );
}
