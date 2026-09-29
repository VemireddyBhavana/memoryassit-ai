import { useState, useEffect, useRef } from "react";

const DEMO_SCENARIOS = [
  {
    title: "1. Report Production Incident",
    desc: "Customer reports Kubernetes OOM crash on AWS cluster eks-prod-us-east-1 with Redis caching.",
    prompt: "Hi, our production cluster eks-prod-us-east-1 crashed today with OOMKilled errors on the Redis cache pod. We had to restart the worker node.",
  },
  {
    title: "2. The 'Magic' Recall (3 Days Later)",
    desc: "Customer returns with a short question: 'It crashed again'. Watch AI recall exact cluster and previous fix!",
    prompt: "Our cluster crashed again today with the same error. What was our configuration and what did we do last time?",
  },
  {
    title: "3. Verify Context & History",
    desc: "Test persistent memory extraction and customer knowledge profile.",
    prompt: "Can you summarize all past issues and infrastructure details on my account?",
  }
];

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am MemoryAssist AI. I'm connected directly to your Hindsight Long-Term Memory Bank. How can I help with your enterprise infrastructure or support today?",
      memoriesUsed: [],
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("live"); // 'live' or 'bank'
  const [liveMemories, setLiveMemories] = useState([]);
  const [allBankMemories, setAllBankMemories] = useState([]);
  const [telemetry, setTelemetry] = useState({
    recallLatencyMs: null,
    totalLatencyMs: null,
    bankId: "MemoryAssist-AI",
    totalBankMemories: 0,
  });
  const [systemHealth, setSystemHealth] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Fetch health and bank memories on load
  useEffect(() => {
    fetchHealthAndMemories();
  }, []);

  const fetchHealthAndMemories = async () => {
    try {
      const [healthRes, memRes] = await Promise.all([
        fetch("http://localhost:5000/api/health").catch(() => null),
        fetch("http://localhost:5000/api/memories").catch(() => null),
      ]);

      if (healthRes && healthRes.ok) {
        const health = await healthRes.json();
        setSystemHealth(health);
      }

      if (memRes && memRes.ok) {
        const memData = await memRes.json();
        setAllBankMemories(memData.items || []);
        setTelemetry((prev) => ({
          ...prev,
          totalBankMemories: memData.items?.length || 0,
        }));
      }
    } catch (e) {
      console.error("Failed to load initial telemetry", e);
    }
  };

  const handleSend = async (messageText = input) => {
    const textToSend = messageText.trim();
    if (!textToSend || loading) return;

    setInput("");
    const userMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          customerId: "cust-nexus-01"
        }),
      });

      const data = await res.json();

      const assistantMessage = {
        role: "assistant",
        content: data.reply,
        memoriesUsed: data.recalledMemories || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.recalledMemories) {
        setLiveMemories(data.recalledMemories);
      }

      if (data.telemetry) {
        setTelemetry((prev) => ({
          ...prev,
          recallLatencyMs: data.telemetry.recallLatencyMs,
          totalLatencyMs: data.telemetry.totalLatencyMs,
          bankId: data.telemetry.bankId,
          totalBankMemories: prev.totalBankMemories + 1,
        }));
      }

      // Refresh bank memories in background
      setTimeout(fetchHealthAndMemories, 1200);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Unable to reach MemoryAssist backend. Please ensure the server is running on port 5000.",
          memoriesUsed: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <div className="ambient-glow" />

      {/* Enterprise Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">🧠</div>
          <div>
            <div className="brand-title">MemoryAssist AI</div>
            <div className="brand-subtitle">Autonomous Enterprise Memory Cockpit</div>
          </div>
        </div>

        <div className="header-badges">
          <div className="status-badge">
            <span className="pulse-dot"></span>
            <span>Hindsight Cloud: Connected (v{systemHealth?.hindsight?.version || "0.10.1"})</span>
          </div>

          <div className="tech-badge">
            ⚡ Groq LLaMA-3 / GPT-OSS
          </div>

          <div className="tech-badge" style={{ fontFamily: "var(--font-mono)" }}>
            Bank: {telemetry.bankId}
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="main-grid">
        {/* Left Sidebar: Customer Context & Interactive Demo Presets */}
        <aside className="sidebar-panel">
          <div>
            <div className="section-label">Active Customer Context</div>
            <div className="customer-card">
              <div className="customer-header">
                <div className="customer-avatar">NC</div>
                <div>
                  <div className="customer-name">Nexus Cloud Corp</div>
                  <div className="customer-tier">Enterprise VIP • Tier 1</div>
                </div>
              </div>
              <div className="meta-row">
                <span>Cluster ID:</span>
                <span className="meta-val">eks-prod-us-east-1</span>
              </div>
              <div className="meta-row">
                <span>Region:</span>
                <span className="meta-val">AWS us-east-1</span>
              </div>
              <div className="meta-row">
                <span>SLA Level:</span>
                <span className="meta-val" style={{ color: "var(--accent-emerald)" }}>99.99% (Urgent)</span>
              </div>
            </div>
          </div>

          <div>
            <div className="section-label">60-Second Demo Story</div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
              Click each scenario in order to demonstrate persistent Hindsight memory to the judges:
            </p>

            {DEMO_SCENARIOS.map((scenario, index) => (
              <button
                key={index}
                className="scenario-button"
                onClick={() => {
                  setInput(scenario.prompt);
                  handleSend(scenario.prompt);
                }}
                disabled={loading}
              >
                <div className="scenario-title">
                  <span>{scenario.title}</span>
                  <span style={{ color: "var(--accent-cyan)", fontSize: "14px" }}>→</span>
                </div>
                <div className="scenario-desc">{scenario.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: "auto", fontSize: "11px", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
            <div>Powered by <strong>Hindsight (Vectorize)</strong></div>
            <div>Active learning: Retain • Recall • Reflect</div>
          </div>
        </aside>

        {/* Center Panel: Conversational AI Cockpit */}
        <main className="chat-panel">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <div className={`message-avatar ${msg.role === "user" ? "user-av" : "bot-av"}`}>
                  {msg.role === "user" ? "👤" : "⚡"}
                </div>
                <div>
                  {msg.memoriesUsed && msg.memoriesUsed.length > 0 && (
                    <div className="memory-indicator-tag">
                      <span>🧠 Recalled {msg.memoriesUsed.length} Hindsight {msg.memoriesUsed.length === 1 ? "Memory" : "Memories"}</span>
                    </div>
                  )}
                  <div className="message-bubble">
                    <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row assistant">
                <div className="message-avatar bot-av">⚡</div>
                <div className="message-bubble" style={{ color: "var(--accent-cyan)" }}>
                  <span style={{ fontStyle: "italic" }}>Recalling memories from Hindsight & generating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="chat-input-container">
            <form
              className="input-wrapper"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                className="chat-input"
                placeholder="Ask MemoryAssist AI or report an infrastructure issue..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="send-button"
                disabled={loading || !input.trim()}
              >
                <span>Send</span>
                <span>↑</span>
              </button>
            </form>
          </div>
        </main>

        {/* Right Panel: Hindsight Live Memory Inspector */}
        <aside className="memory-inspector">
          <div className="inspector-header">
            <div className="inspector-title">
              <span>🧠 Hindsight Inspector</span>
              <span className="bank-tag">{telemetry.bankId}</span>
            </div>
            <button
              onClick={fetchHealthAndMemories}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "13px"
              }}
              title="Refresh Memory Bank"
            >
              🔄
            </button>
          </div>

          <div className="inspector-body">
            {/* Live Telemetry Card */}
            <div className="telemetry-grid">
              <div className="stat-box">
                <div className="stat-label">Recall Latency</div>
                <div className="stat-value">
                  {telemetry.recallLatencyMs ? `${telemetry.recallLatencyMs} ms` : "--"}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Memories</div>
                <div className="stat-value" style={{ color: "var(--accent-cyan)" }}>
                  {telemetry.totalBankMemories}
                </div>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              <button
                onClick={() => setActiveTab("live")}
                style={{
                  background: activeTab === "live" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                  color: activeTab === "live" ? "var(--text-primary)" : "var(--text-muted)",
                  border: activeTab === "live" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Active Query Recall ({liveMemories.length})
              </button>
              <button
                onClick={() => setActiveTab("bank")}
                style={{
                  background: activeTab === "bank" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                  color: activeTab === "bank" ? "var(--text-primary)" : "var(--text-muted)",
                  border: activeTab === "bank" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Bank Explorer ({allBankMemories.length})
              </button>
            </div>

            {/* Tab 1: Live Recalled Memories */}
            {activeTab === "live" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="section-label">
                  Recalled Facts Used in Prompt
                </div>

                {liveMemories.length === 0 ? (
                  <div className="empty-memory-state">
                    <div>No memories retrieved for the last message yet.</div>
                    <div style={{ marginTop: "6px", color: "var(--text-secondary)" }}>
                      Send a message or click a 60-Second Demo Story button on the left!
                    </div>
                  </div>
                ) : (
                  liveMemories.map((mem, idx) => (
                    <div key={idx} className="memory-card">
                      <div className="memory-card-top">
                        <span className="memory-type-pill">{mem.type || "Observation"}</span>
                        {mem.scores?.semantic && (
                          <span className="memory-score">
                            Match: {(mem.scores.semantic * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <div className="memory-content">{mem.text || mem.content}</div>

                      {mem.entities && Array.isArray(mem.entities) && (
                        <div className="memory-entity-tags">
                          {mem.entities.map((ent, eIdx) => (
                            <span key={eIdx} className="entity-pill">🏷️ {ent}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Full Bank Memory Explorer */}
            {activeTab === "bank" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="section-label">
                  All Persistent Memories in Hindsight Cloud
                </div>

                {allBankMemories.length === 0 ? (
                  <div className="empty-memory-state">Bank is currently empty.</div>
                ) : (
                  allBankMemories.map((mem, idx) => (
                    <div key={idx} className="memory-card" style={{ borderLeftColor: "var(--accent-purple)" }}>
                      <div className="memory-card-top">
                        <span className="memory-type-pill" style={{ background: "rgba(139, 92, 246, 0.2)", color: "#c084fc" }}>
                          {mem.fact_type || "Stored Fact"}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {mem.date ? new Date(mem.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Indexed"}
                        </span>
                      </div>
                      <div className="memory-content">{mem.text}</div>
                      {mem.entities && (
                        <div className="memory-entity-tags">
                          {String(mem.entities).split(",").map((ent, eIdx) => (
                            <span key={eIdx} className="entity-pill">🏷️ {ent.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
