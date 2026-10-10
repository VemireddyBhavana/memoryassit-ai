import { useEffect, useMemo, useState } from "react";
import {
  createUserMemory,
  deleteUserMemory,
  getUserMemories,
  updateUserMemory,
} from "../services/api.js";

export default function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [hindsightMemories, setHindsightMemories] = useState([]);
  const [query, setQuery] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const result = await getUserMemories();
      setMemories(result.memories);
      setHindsightMemories(result.hindsight || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filteredMemories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return memories.filter((memory) => !needle || memory.content.toLowerCase().includes(needle));
  }, [memories, query]);

  async function save(event) {
    event.preventDefault();
    try {
      const result = editingId
        ? await updateUserMemory(editingId, content)
        : await createUserMemory(content);
      setMemories((previous) => editingId
        ? previous.map((memory) => memory.id === editingId ? result.memory : memory)
        : [result.memory, ...previous]);
      setContent("");
      setEditingId(null);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function remove(id) {
    try {
      await deleteUserMemory(id);
      setMemories((previous) => previous.filter((memory) => memory.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setContent("");
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="page-card">
      <p className="page-eyebrow">Personal knowledge</p>
      <h1>Memory library</h1>
      <p className="page-description">Search your private saved notes and chat records. These app-managed records can be edited or deleted; Hindsight cloud memories are shown separately and remain read-only here.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="memory-create-form" onSubmit={save}>
        <label htmlFor="memory-content">{editingId ? "Edit memory" : "Add a memory"}</label>
        <textarea id="memory-content" value={content} onChange={(event) => setContent(event.target.value)} minLength={1} maxLength={10000} required rows={3} />
        <div className="memory-form-actions">
          {editingId && <button className="page-secondary-link" type="button" onClick={() => { setEditingId(null); setContent(""); }}>Cancel edit</button>}
          <button className="page-primary-link" type="submit">{editingId ? "Save changes" : "Save memory"}</button>
        </div>
      </form>
      <label className="memory-search-label">Search saved memories
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by keyword…" />
      </label>
      <h2 className="memory-section-title">Your saved records</h2>
      {loading ? <p className="page-description">Loading memories…</p> : filteredMemories.length === 0 ? <p className="page-description">No saved memories match your search.</p> : (
        <div className="managed-memory-list">
          {filteredMemories.map((memory) => (
            <article className="managed-memory-card" key={memory.id}>
              <p>{memory.content}</p>
              <small>{memory.source} · {new Date(memory.updated_at).toLocaleString()}</small>
              <div className="memory-form-actions">
                <button className="page-secondary-link" type="button" onClick={() => { setEditingId(memory.id); setContent(memory.content); }}>Edit</button>
                <button className="danger-link" type="button" onClick={() => remove(memory.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <h2 className="memory-section-title">Hindsight cloud memories</h2>
      <p className="form-hint">Provider memories are read-only here; updates to these facts are retained through chat.</p>
      <div className="managed-memory-list">
        {hindsightMemories.map((memory, index) => (
          <article className="managed-memory-card" key={memory.id || `${memory.text}-${index}`}>
            <p>{memory.text || memory.content || JSON.stringify(memory)}</p>
            {memory.type && <small>{memory.type}</small>}
          </article>
        ))}
        {!loading && hindsightMemories.length === 0 && <p className="page-description">No Hindsight records returned by the provider.</p>}
      </div>
    </section>
  );
}
