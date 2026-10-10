import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getConversations, getUserMemories } from "../services/api.js";

export default function DashboardPage() {
  const [summary, setSummary] = useState({ conversations: 0, memories: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getConversations(), getUserMemories()])
      .then(([chats, memoryData]) => setSummary({
        conversations: chats.conversations.length,
        memories: memoryData.memories.length,
      }))
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <section className="page-card">
      <p className="page-eyebrow">Workspace overview</p>
      <h1>Dashboard</h1>
      <p className="page-description">Your saved incident conversations and private memory records are available from this workspace.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="dashboard-stats">
        <div><strong>{summary.conversations}</strong><span>Saved conversations</span></div>
        <div><strong>{summary.memories}</strong><span>Memory records</span></div>
      </div>
      <div className="dashboard-links">
        <Link to="/chat"><strong>Incident assistant</strong><span>Start or return to a conversation with memory recall and AI responses.</span></Link>
        <Link to="/memories"><strong>Memory library</strong><span>Search, edit, or remove your saved records.</span></Link>
      </div>
    </section>
  );
}
