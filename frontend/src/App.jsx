import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";

// ── Simple Markdown Renderer ─────────────────────────────────────────────────
function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let listBuffer = [];
  const flush = (key) => {
    if (listBuffer.length > 0) {
      elements.push(<ul key={`ul-${key}`} className="md-list">{listBuffer.map((item,i)=><li key={i} className="md-li">{inline(item)}</li>)}</ul>);
      listBuffer = [];
    }
  };
  const inline = (str) => {
    return str.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g).map((p,i)=>{
      if(p.startsWith("**")&&p.endsWith("**")) return <strong key={i}>{p.slice(2,-2)}</strong>;
      if(p.startsWith("`")&&p.endsWith("`")) return <code key={i} className="md-code">{p.slice(1,-1)}</code>;
      if(p.startsWith("*")&&p.endsWith("*")) return <em key={i}>{p.slice(1,-1)}</em>;
      return p;
    });
  };
  lines.forEach((line,idx)=>{
    if(/^#{1,3}\s/.test(line)){flush(idx);const lv=line.match(/^(#+)/)[1].length;elements.push(<div key={idx} className={`md-h${lv}`}>{inline(line.replace(/^#+\s/,""))}</div>);}
    else if(/^[-•*]\s/.test(line)){listBuffer.push(line.replace(/^[-•*]\s/,""));}
    else if(/^\d+\.\s/.test(line)){listBuffer.push(line.replace(/^\d+\.\s/,""));}
    else if(line.trim()===""){flush(idx);elements.push(<div key={idx} className="md-spacer"/>);}
    else{flush(idx);elements.push(<p key={idx} className="md-p">{inline(line)}</p>);}
  });
  flush("end");
  return <div className="md-body">{elements}</div>;
}

// ── Customer Data ─────────────────────────────────────────────────────────────
const CUSTOMERS = [
  {
    id: "cust-nexus-01", name: "Nexus Cloud Corp", tier: "Enterprise VIP • Tier 1",
    cluster: "eks-prod-us-east-1", region: "AWS us-east-1", sla: "99.99% (Urgent)",
    avatar: "NC", color: "#3b82f6", industry: "Cloud Infrastructure",
    scenarios: [
      { title: "1. Report EKS Incident", desc: "Customer reports Kubernetes OOM crash on cluster eks-prod-us-east-1 with Redis caching.", prompt: "Hi, our production cluster eks-prod-us-east-1 crashed today with OOMKilled errors on the Redis cache pod. We had to restart the worker node." },
      { title: "2. The 'Magic' Recall (3 Days Later)", desc: "Customer returns with a short question: 'It crashed again'. Watch AI recall exact cluster & previous fix!", prompt: "Our cluster crashed again today with the same error. What was our configuration and what did we do last time?" },
      { title: "3. Verify Infrastructure History", desc: "Test persistent memory extraction and customer knowledge profile.", prompt: "Can you summarize all past issues and infrastructure details on our Nexus Cloud account?" },
    ],
    suggested: ["What is the recommended Redis maxmemory policy for EKS?","Show me all open P1 incidents for our cluster.","Generate a runbook for OOMKilled prevention."],
  },
  {
    id: "cust-apex-02", name: "Apex Financial Systems", tier: "FinTech Ultra • Tier 0",
    cluster: "db-apex-primary", region: "AWS eu-west-1", sla: "99.999% (Mission-Critical)",
    avatar: "AF", color: "#10b981", industry: "Financial Services",
    scenarios: [
      { title: "1. Stripe Webhook Timeout", desc: "Report checkout gateway 504 timeouts and PostgreSQL connection pool exhaustion.", prompt: "Critical: Our payment service db-apex-primary in eu-west-1 is timing out on Stripe webhooks. PostgreSQL pool hit max connections (500)." },
      { title: "2. The 'Magic' Recall (FinTech)", desc: "Customer asks about recurring latency. Watch AI recall Stripe webhook limits and PgBouncer fix!", prompt: "Payment webhook latency spiked again. What connection pool setting and PgBouncer fix did we implement last time?" },
      { title: "3. Compliance & Audit History", desc: "Query financial compliance records and payment failure logs.", prompt: "Please summarize our recent database incident history for our PCI-DSS audit report." },
    ],
    suggested: ["What are the PgBouncer settings for our Stripe integration?","Show compliance summary for the last 90 days.","Recommend connection pool limits for 500 concurrent users."],
  },
  {
    id: "cust-stellar-03", name: "Stellar SaaS Platform", tier: "SaaS Growth • Tier 2",
    cluster: "k8s-stellar-prod", region: "GCP us-central1", sla: "99.9% (Standard)",
    avatar: "SS", color: "#f59e0b", industry: "SaaS / Startup",
    scenarios: [
      { title: "1. Cold Start Latency Spike", desc: "Serverless functions experiencing cold start delays causing user-facing latency.", prompt: "Our Cloud Run functions on k8s-stellar-prod are experiencing 3-5 second cold start delays that are causing our API gateway to timeout for end users." },
      { title: "2. Memory Recall — Latency Fix", desc: "Watch AI recall the exact cold start fix applied 2 weeks ago.", prompt: "The cold start issue is back. What min-instances setting and CPU allocation fix did we apply previously?" },
      { title: "3. Cost Optimization Review", desc: "Request infrastructure cost analysis and rightsizing recommendations.", prompt: "Can you review our GCP spend and suggest rightsizing options based on our past incident patterns?" },
    ],
    suggested: ["What is the optimal min-instances for Cloud Run to avoid cold starts?","Show our GCP cost breakdown for the last 30 days.","How do we set up autoscaling for k8s-stellar-prod?"],
  },
];

// ── Toast ─────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onDismiss(t.id)}>
          <span className="toast-icon">{t.icon}</span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState("cust-nexus-01");
  const currentCustomer = CUSTOMERS.find(c => c.id === selectedCustomerId) || CUSTOMERS[0];

  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hello! I am **MemoryAssist AI**. I'm connected to your Hindsight Long-Term Memory Bank for **Nexus Cloud Corp**.\n\nHow can I assist with your infrastructure or incident today?`,
    memoriesUsed: [], retained: false,
  }]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("live");
  const [liveMemories, setLiveMemories] = useState([]);
  const [allBankMemories, setAllBankMemories] = useState([]);
  const [bankSearch, setBankSearch] = useState("");
  const [reflection, setReflection] = useState(null);
  const [isReflecting, setIsReflecting] = useState(false);
  const [telemetry, setTelemetry] = useState({ recallLatencyMs: null, totalLatencyMs: null, bankId: "MemoryAssist-AI", totalBankMemories: 0, totalRetained: 0, avgLatencyMs: null });
  const [systemHealth, setSystemHealth] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [severity, setSeverity] = useState("P1");
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [incidentStartTime, setIncidentStartTime] = useState(null);
  const [incidentElapsed, setIncidentElapsed] = useState("00:00");
  const [retainedMsgIdx, setRetainedMsgIdx] = useState(null);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((message, type = "info", icon = "🔔") => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { fetchHealthAndMemories(); }, []);

  useEffect(() => {
    if (severity === "P1") { if (!incidentStartTime) setIncidentStartTime(Date.now()); }
    else { setIncidentStartTime(null); setIncidentElapsed("00:00"); }
  }, [severity]);

  useEffect(() => {
    if (!incidentStartTime) return;
    const iv = setInterval(() => {
      const elapsed = Math.floor((Date.now() - incidentStartTime) / 1000);
      setIncidentElapsed(`${String(Math.floor(elapsed/60)).padStart(2,"0")}:${String(elapsed%60).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(iv);
  }, [incidentStartTime]);

  const handleCustomerSwitch = (customerId) => {
    setSelectedCustomerId(customerId);
    const target = CUSTOMERS.find(c => c.id === customerId) || CUSTOMERS[0];
    setMessages([{ role: "assistant", content: `Switched customer context to **${target.name}** (${target.tier}).\n\nHindsight memory is now scoped to **${target.industry}**. How can I help?`, memoriesUsed: [], retained: false }]);
    setLiveMemories([]); setReflection(null);
    pushToast(`Switched to ${target.name}`, "success", "🏢");
  };

  const fetchHealthAndMemories = async () => {
    setIsRefreshing(true);
    try {
      const [healthRes, memRes] = await Promise.all([
        fetch("http://localhost:5000/api/health").catch(() => null),
        fetch("http://localhost:5000/api/memories").catch(() => null),
      ]);
      if (healthRes?.ok) setSystemHealth(await healthRes.json());
      if (memRes?.ok) {
        const memData = await memRes.json();
        setAllBankMemories(memData.items || []);
        setTelemetry(prev => ({ ...prev, totalBankMemories: memData.items?.length || 0 }));
      }
      setSyncStatus("✓ Synced!"); setTimeout(() => setSyncStatus(""), 2000);
    } catch { setSyncStatus("⚠️ Error"); setTimeout(() => setSyncStatus(""), 2500); }
    finally { setIsRefreshing(false); }
  };

  const handleSend = async (messageText = input) => {
    const textToSend = messageText.trim();
    if (!textToSend || loading) return;
    setInput("");
    const newUserIdx = messages.length;
    setMessages(prev => [...prev, { role: "user", content: textToSend }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, customerId: selectedCustomerId }),
      });
      const data = await res.json();
      const newAiIdx = newUserIdx + 1;
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, memoriesUsed: data.recalledMemories || [], retained: true }]);
      if (data.recalledMemories?.length > 0) {
        setLiveMemories(data.recalledMemories);
        pushToast(`🧠 ${data.recalledMemories.length} memories recalled`, "memory", "🧠");
      }
      if (data.telemetry) {
        setLatencyHistory(prev => { const next = [...prev, data.telemetry.recallLatencyMs].filter(Boolean); return next; });
        setTelemetry(prev => {
          const allLat = [...latencyHistory, data.telemetry.recallLatencyMs].filter(Boolean);
          const avg = allLat.length ? Math.round(allLat.reduce((a,b)=>a+b,0)/allLat.length) : null;
          return { ...prev, recallLatencyMs: data.telemetry.recallLatencyMs, totalLatencyMs: data.telemetry.totalLatencyMs, bankId: data.telemetry.bankId, totalBankMemories: prev.totalBankMemories+1, totalRetained: (prev.totalRetained||0)+1, avgLatencyMs: avg };
        });
      }
      setRetainedMsgIdx(newAiIdx);
      setTimeout(() => setRetainedMsgIdx(null), 3500);
      pushToast("Memory retained to Hindsight Bank", "success", "✅");
      setTimeout(fetchHealthAndMemories, 1200);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Unable to reach MemoryAssist backend. Please ensure the server is running on port 5000.", memoriesUsed: [], retained: false }]);
      pushToast("Backend unreachable — check port 5000", "error", "⚠️");
    } finally { setLoading(false); }
  };

  const handleRunReflection = async () => {
    setIsReflecting(true); setActiveTab("reflect");
    pushToast("Running Hindsight reflect()…", "info", "🔮");
    try {
      const res = await fetch("http://localhost:5000/api/reflect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `Synthesize an executive incident post-mortem and long-term architectural recommendations for ${currentCustomer.name} on cluster ${currentCustomer.cluster}.` }),
      });
      const data = await res.json();
      setReflection(data.reflection);
      pushToast("Executive post-mortem ready!", "success", "📋");
    } catch { setReflection("Unable to generate reflection. Please verify server connection."); pushToast("Reflection failed", "error", "❌"); }
    finally { setIsReflecting(false); }
  };

  const handleExportReflection = () => {
    if (!reflection) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([reflection], { type: "text/markdown" }));
    a.download = `postmortem-${currentCustomer.id}-${Date.now()}.md`; a.click();
    pushToast("Post-mortem exported!", "success", "📥");
  };

  const handleExportChat = () => {
    const md = `# MemoryAssist AI — Chat Transcript\n**Customer:** ${currentCustomer.name}\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n${messages.map(m=>`**${m.role==="user"?"User":"MemoryAssist AI"}:**\n${m.content}`).join("\n\n---\n\n")}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    a.download = `chat-transcript-${currentCustomer.id}-${Date.now()}.md`; a.click();
    pushToast("Chat transcript exported!", "success", "💬");
  };

  const handleResetSession = async () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingIndex(null);
    try { await fetch("http://localhost:5000/api/reset", { method: "POST" }); } catch {}
    setMessages([{ role: "assistant", content: `Session reset! Clean slate initialized for **${currentCustomer.name}**. Ready for a fresh demo test.`, memoriesUsed: [], retained: false }]);
    setLiveMemories([]); setReflection(null); setLatencyHistory([]);
    pushToast("Session cleared & reset", "info", "🧹");
  };

  const handleSpeak = (text, index) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingIndex === index) { window.speechSynthesis.cancel(); setSpeakingIndex(null); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[*#`_]/g,""));
    u.rate = 1.05; u.onend = () => setSpeakingIndex(null); u.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index); window.speechSynthesis.speak(u);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text); setCopiedIndex(index);
    pushToast("Copied to clipboard!", "success", "📋");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredMemories = allBankMemories.filter(mem => {
    if (!bankSearch.trim()) return true;
    const q = bankSearch.toLowerCase();
    return mem.text?.toLowerCase().includes(q) || String(mem.entities||"").toLowerCase().includes(q) || mem.fact_type?.toLowerCase().includes(q);
  });

  const timelineEvents = [
    { color: "var(--accent-rose)", time: "Day 1 • 09:30 AM", title: "Initial Incident Outage", desc: `Redis Pod OOMKilled on ${currentCustomer.cluster}. Worker node restarted; temporary limit raised to 1 GiB.`, tag: "Retained to Bank" },
    { color: "var(--accent-amber)", time: "Day 4 • 02:15 PM", title: "Recurring Issue Detected", desc: "Hindsight matched exact cluster & historical runbook with 94% confidence. AI suggested permanent maxmemory configuration.", tag: "Recalled without prompt" },
    { color: "var(--accent-indigo)", time: "Day 7 • 11:00 AM", title: "Fix Applied & Verified", desc: "Connection pool set to 200 max. PgBouncer deployed. Zero downtime migration completed.", tag: "Verified & Retained" },
    { color: "var(--accent-cyan)", time: "Today • Ongoing", title: "Agentic Post-Mortem Reflection", desc: "Generated long-term ElastiCache migration and node-isolation roadmap via hindsight.reflect().", tag: "Agent Learned" },
  ];

  return (
    <div className="app-layout">
      <div className="ambient-glow" />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">🧠</div>
          <div>
            <div className="brand-title">MemoryAssist AI</div>
            <div className="brand-subtitle">Autonomous Enterprise Memory Cockpit</div>
          </div>
        </div>
        <div className="header-badges">
          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
            <span style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600}}>TENANT:</span>
            <select value={selectedCustomerId} onChange={e=>handleCustomerSwitch(e.target.value)} className="tenant-select">
              {CUSTOMERS.map(c=><option key={c.id} value={c.id} style={{background:"#0f172a"}}>🏢 {c.name}</option>)}
            </select>
          </div>
          <div className="status-badge"><span className="pulse-dot"/><span>Hindsight Cloud (v{systemHealth?.hindsight?.version||"0.10.1"})</span></div>
          <div className="tech-badge">⚡ Groq GPT-OSS</div>
          <button onClick={handleExportChat} className="refresh-btn" title="Export chat transcript"><span>💬 Export Chat</span></button>
          <button onClick={handleResetSession} className="refresh-btn" style={{borderColor:"rgba(244,63,94,0.4)",color:"#fda4af"}} title="Reset session"><span>🧹 Reset</span></button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="main-grid">
        {/* Left Sidebar */}
        <aside className="sidebar-panel">
          <div>
            <div className="section-label">Active Customer Context</div>
            <div className="customer-card">
              <div className="customer-header">
                <div className="customer-avatar" style={{background:currentCustomer.color}}>{currentCustomer.avatar}</div>
                <div>
                  <div className="customer-name">{currentCustomer.name}</div>
                  <div className="customer-tier" style={{color:currentCustomer.color}}>{currentCustomer.tier}</div>
                </div>
              </div>
              {[["Industry",currentCustomer.industry],["Cluster ID",currentCustomer.cluster],["Region",currentCustomer.region]].map(([k,v])=>(
                <div key={k} className="meta-row"><span>{k}:</span><span className="meta-val">{v}</span></div>
              ))}
              <div className="meta-row"><span>SLA Level:</span><span className="meta-val" style={{color:"var(--accent-emerald)"}}>{currentCustomer.sla}</span></div>
              <div className="meta-row" style={{alignItems:"center",marginTop:"10px"}}>
                <span>Severity:</span>
                <div className="severity-pill-group">
                  {[["P1","🔴"],["P2","🟡"],["P3","🟢"]].map(([p,e])=>(
                    <button key={p} className={`severity-pill ${severity===p?`active ${p.toLowerCase()}`:""}`} onClick={()=>setSeverity(p)}>{e} {p}</button>
                  ))}
                </div>
              </div>
              {severity==="P1"&&(
                <div className="incident-timer">
                  <span className="timer-label">⏱ Incident Active</span>
                  <span className="timer-value">{incidentElapsed}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="section-label">60-Second Demo Story</div>
            <p style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"12px"}}>Click scenarios to demonstrate persistent memory for <strong>{currentCustomer.name}</strong>:</p>
            {currentCustomer.scenarios.map((sc,i)=>(
              <button key={i} className="scenario-button" onClick={()=>{setInput(sc.prompt);handleSend(sc.prompt);}} disabled={loading}>
                <div className="scenario-title"><span>{sc.title}</span><span style={{color:"var(--accent-cyan)",fontSize:"14px"}}>→</span></div>
                <div className="scenario-desc">{sc.desc}</div>
              </button>
            ))}
            <button className="scenario-button" style={{background:"linear-gradient(135deg,rgba(99,102,241,0.25),rgba(6,182,212,0.2))",borderColor:"rgba(99,102,241,0.5)",marginTop:"6px"}} onClick={handleRunReflection} disabled={isReflecting}>
              <div className="scenario-title" style={{color:"var(--accent-cyan)"}}><span>🔮 4. Executive Post-Mortem</span><span>{isReflecting?"⏳":"→"}</span></div>
              <div className="scenario-desc">Triggers <strong>hindsight.reflect()</strong> to synthesize root-cause &amp; architectural advice!</div>
            </button>
          </div>
          <div style={{marginTop:"auto",fontSize:"11px",color:"var(--text-muted)",borderTop:"1px solid var(--border-color)",paddingTop:"12px"}}>
            <div>Powered by <strong>Hindsight (Vectorize)</strong></div>
            <div>Full 3 Verbs: <strong>Retain • Recall • Reflect</strong></div>
          </div>
        </aside>

        {/* Center Chat Panel */}
        <main className="chat-panel">
          {severity==="P1"&&(
            <div className="p1-alert-banner">
              <div><strong>🚨 P1 CRITICAL INCIDENT ACTIVE:</strong> Priority routing enabled • On-call DevOps dispatched</div>
              <span style={{fontFamily:"var(--font-mono)",fontSize:"10.5px"}}>SLA: &lt;15m • Elapsed: <strong>{incidentElapsed}</strong></span>
            </div>
          )}
          <div className="chat-messages">
            {messages.map((msg,i)=>(
              <div key={i} className={`message-row ${msg.role}`}>
                <div className={`message-avatar ${msg.role==="user"?"user-av":"bot-av"}`}>{msg.role==="user"?"👤":"⚡"}</div>
                <div style={{maxWidth:"100%"}}>
                  {msg.memoriesUsed?.length>0&&(
                    <div className="memory-indicator-tag">🧠 Recalled {msg.memoriesUsed.length} Hindsight {msg.memoriesUsed.length===1?"Memory":"Memories"}</div>
                  )}
                  <div className="message-bubble">
                    {msg.role==="assistant"?<MarkdownText text={msg.content}/>:<p style={{whiteSpace:"pre-wrap"}}>{msg.content}</p>}
                  </div>
                  {msg.retained&&retainedMsgIdx===i&&<div className="retained-badge">✅ Retained to Hindsight Bank</div>}
                  {msg.role==="assistant"&&(
                    <div className="msg-actions">
                      <button className="msg-action-btn" onClick={()=>handleSpeak(msg.content,i)}>{speakingIndex===i?"⏹️ Stop":"🔊 Listen"}</button>
                      <button className="msg-action-btn" onClick={()=>handleCopy(msg.content,i)}>{copiedIndex===i?"✓ Copied":"📋 Copy"}</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading&&(
              <div className="message-row assistant">
                <div className="message-avatar bot-av">⚡</div>
                <div className="message-bubble typing-bubble">
                  <span className="typing-label">Recalling memories &amp; generating response</span>
                  <span className="typing-dots"><span/><span/><span/></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Suggested Prompts */}
          {!loading&&messages.length<=2&&(
            <div className="suggested-prompts">
              <span className="suggested-label">💡 Suggested for {currentCustomer.name}:</span>
              <div className="suggested-chips">
                {currentCustomer.suggested.map((p,i)=>(
                  <button key={i} className="suggested-chip" onClick={()=>handleSend(p)}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="chat-input-container">
            <form className="input-wrapper" onSubmit={e=>{e.preventDefault();handleSend();}}>
              <input type="text" className="chat-input" placeholder={`Ask MemoryAssist AI or report an issue for ${currentCustomer.name}...`} value={input} onChange={e=>setInput(e.target.value)} disabled={loading}/>
              <button type="submit" className="send-button" disabled={loading||!input.trim()}><span>Send</span><span>↑</span></button>
            </form>
          </div>
        </main>

        {/* Right Panel: Hindsight Inspector */}
        <aside className="memory-inspector">
          <div className="inspector-header">
            <div className="inspector-title"><span>🧠 Hindsight Inspector</span><span className="bank-tag">{telemetry.bankId}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              {syncStatus&&<span className="sync-status">{syncStatus}</span>}
              <button className="refresh-btn" onClick={fetchHealthAndMemories} disabled={isRefreshing} title="Sync Hindsight Cloud Memory Bank">
                <span className={`spin-icon ${isRefreshing?"spinning":""}`}>🔄</span>
                <span>{isRefreshing?"Syncing...":"Sync Bank"}</span>
              </button>
            </div>
          </div>
          <div className="inspector-body">
            {/* 4-stat telemetry grid */}
            <div className="telemetry-grid-4">
              {[
                {label:"Recall Latency",val:telemetry.recallLatencyMs?`${telemetry.recallLatencyMs}ms`:"--",color:""},
                {label:"Total Memories",val:telemetry.totalBankMemories,color:"var(--accent-cyan)"},
                {label:"Retained (Session)",val:telemetry.totalRetained||0,color:"var(--accent-emerald)"},
                {label:"Avg Latency",val:telemetry.avgLatencyMs?`${telemetry.avgLatencyMs}ms`:"--",color:"var(--accent-amber)"},
              ].map(({label,val,color})=>(
                <div key={label} className="stat-box">
                  <div className="stat-label">{label}</div>
                  <div className="stat-value" style={color?{color}:{}}>{val}</div>
                </div>
              ))}
            </div>

            {/* Latency Sparkline */}
            {latencyHistory.length>1&&(
              <div className="sparkline-container">
                <div style={{fontSize:"10px",color:"var(--text-muted)",fontWeight:700,marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Recall Latency History</div>
                <div className="sparkline">
                  {latencyHistory.slice(-12).map((v,i)=>{
                    const max=Math.max(...latencyHistory.slice(-12));
                    const h=Math.max(4,Math.round((v/max)*36));
                    return <div key={i} className="spark-bar" style={{height:`${h}px`}} title={`${v}ms`}/>;
                  })}
                </div>
              </div>
            )}

            {/* Grounding Score */}
            <div className="grounding-meter">
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",fontWeight:700}}>
                <span style={{color:"var(--text-secondary)"}}>Hindsight Grounding Score</span>
                <span style={{color:"var(--accent-cyan)",fontFamily:"var(--font-mono)"}}>{liveMemories.length>0?"98% (High)":"92% (Baseline)"}</span>
              </div>
              <div className="grounding-bar-bg"><div className="grounding-bar-fill" style={{width:liveMemories.length>0?"98%":"92%"}}/></div>
            </div>

            {/* Tabs */}
            <div className="tab-row">
              {[
                {key:"live",label:`Recall (${liveMemories.length})`},
                {key:"bank",label:`Explorer (${allBankMemories.length})`},
                {key:"reflect",label:"🔮 Reflect"},
                {key:"timeline",label:"🗓️ Timeline"},
                {key:"stats",label:"📊 Stats"},
              ].map(({key,label})=>(
                <button key={key} className={`tab-btn ${activeTab===key?"active-tab":""}`} onClick={()=>setActiveTab(key)}>{label}</button>
              ))}
            </div>

            {/* Tab: Live Recall */}
            {activeTab==="live"&&(
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <div className="section-label">Recalled Facts for {currentCustomer.name}</div>
                {liveMemories.length===0?(
                  <div className="empty-memory-state"><div>No memories retrieved yet.</div><div style={{marginTop:"6px",color:"var(--text-secondary)"}}>Send a message or click a Demo Story!</div></div>
                ):(
                  liveMemories.map((mem,idx)=>{
                    const score=mem.scores?.semantic??null;
                    return (
                      <div key={idx} className="memory-card">
                        <div className="memory-card-top">
                          <span className="memory-type-pill">{mem.type||"Observation"}</span>
                          {score!==null&&<span className="memory-score">Match: {(score*100).toFixed(0)}%</span>}
                        </div>
                        <div className="memory-content">{mem.text||mem.content}</div>
                        {score!==null&&(
                          <div className="confidence-bar-bg" title={`Semantic score: ${(score*100).toFixed(1)}%`}>
                            <div className="confidence-bar-fill" style={{width:`${(score*100).toFixed(0)}%`}}/>
                          </div>
                        )}
                        {mem.entities&&Array.isArray(mem.entities)&&(
                          <div className="memory-entity-tags">{mem.entities.map((ent,eIdx)=><span key={eIdx} className="entity-pill">🏷️ {ent}</span>)}</div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab: Bank Explorer */}
            {activeTab==="bank"&&(
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <div className="section-label">Search Persistent Cloud Memories</div>
                <input type="text" placeholder="Filter by keyword (e.g. redis, cluster, aws)..." value={bankSearch} onChange={e=>setBankSearch(e.target.value)} className="bank-search-input"/>
                {filteredMemories.length===0?(
                  <div className="empty-memory-state">No memories match &apos;{bankSearch}&apos;.</div>
                ):(
                  filteredMemories.map((mem,idx)=>(
                    <div key={idx} className="memory-card" style={{borderLeftColor:"var(--accent-purple)"}}>
                      <div className="memory-card-top">
                        <span className="memory-type-pill" style={{background:"rgba(139,92,246,0.2)",color:"#c084fc"}}>{mem.fact_type||"Stored Fact"}</span>
                        <span style={{fontSize:"10px",color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>{mem.date?new Date(mem.date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"Indexed"}</span>
                      </div>
                      <div className="memory-content">{mem.text}</div>
                      {mem.entities&&(
                        <div className="memory-entity-tags">{String(mem.entities).split(",").map((ent,eIdx)=><span key={eIdx} className="entity-pill">🏷️ {ent.trim()}</span>)}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Reflect */}
            {activeTab==="reflect"&&(
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div className="section-label" style={{margin:0}}>Hindsight Agentic Reflection</div>
                  {reflection&&<button onClick={handleExportReflection} className="refresh-btn" style={{fontSize:"10.5px"}}>📥 Export</button>}
                </div>
                {isReflecting?(
                  <div className="empty-memory-state" style={{borderColor:"var(--accent-cyan)",color:"var(--accent-cyan)"}}>
                    <div className="spin-icon spinning" style={{fontSize:"20px",marginBottom:"8px"}}>🧠</div>
                    <div>Executing <strong>hindsight.reflect()</strong>...</div>
                    <div style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"4px"}}>Synthesizing root-cause analysis from all stored memories.</div>
                  </div>
                ):reflection?(
                  <div className="memory-card" style={{borderLeftColor:"var(--accent-cyan)",background:"rgba(15,23,42,0.8)",lineHeight:"1.6",fontSize:"12px",whiteSpace:"pre-wrap"}}>{reflection}</div>
                ):(
                  <div className="empty-memory-state">
                    <div>No reflection generated yet.</div>
                    <button className="refresh-btn" style={{marginTop:"10px"}} onClick={handleRunReflection}>🔮 Run Executive Reflection Now</button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Timeline */}
            {activeTab==="timeline"&&(
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <div className="section-label">Incident Learning Timeline</div>
                <div className="timeline-track">
                  {timelineEvents.map((ev,i)=>(
                    <div key={i} style={{position:"relative"}}>
                      <div style={{position:"absolute",left:"-22px",top:"2px",width:"10px",height:"10px",borderRadius:"50%",background:ev.color}}/>
                      <div style={{fontSize:"10px",color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>{ev.time}</div>
                      <div style={{fontSize:"12px",fontWeight:700,color:"#fff",marginTop:"2px"}}>{ev.title}</div>
                      <div style={{fontSize:"11px",color:"var(--text-secondary)",marginTop:"2px"}}>{ev.desc}</div>
                      <span className="entity-pill" style={{marginTop:"6px",display:"inline-block"}}>{ev.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Stats */}
            {activeTab==="stats"&&(
              <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                <div className="section-label">Memory Bank Analytics</div>
                <div className="stats-health-card">
                  {[
                    ["Hindsight Cloud",systemHealth?.hindsight?.connected],
                    ["Groq AI",systemHealth?.groq?.connected],
                  ].map(([lbl,ok])=>(
                    <div key={lbl} className="stats-health-row">
                      <span>{lbl}</span>
                      <span className={`health-dot ${ok?"green":"red"}`}>{ok?"● Connected":"● Disconnected"}</span>
                    </div>
                  ))}
                  <div className="stats-health-row"><span>Memory Bank ID</span><span style={{fontFamily:"var(--font-mono)",fontSize:"10px",color:"#a5b4fc"}}>{telemetry.bankId}</span></div>
                  <div className="stats-health-row"><span>SDK Version</span><span style={{fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--accent-amber)"}}>{systemHealth?.hindsight?.version||"0.10.1"}</span></div>
                </div>
                <div>
                  <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:700,marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Session Usage</div>
                  {[
                    {label:"Messages Sent",value:messages.filter(m=>m.role==="user").length,max:20,color:"var(--accent-indigo)"},
                    {label:"Memories Retained",value:telemetry.totalRetained||0,max:20,color:"var(--accent-emerald)"},
                    {label:"Memories Recalled",value:liveMemories.length,max:10,color:"var(--accent-cyan)"},
                  ].map(({label,value,max,color})=>(
                    <div key={label} style={{marginBottom:"10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",marginBottom:"4px"}}>
                        <span style={{color:"var(--text-secondary)"}}>{label}</span>
                        <span style={{fontFamily:"var(--font-mono)",color,fontWeight:700}}>{value}</span>
                      </div>
                      <div className="grounding-bar-bg"><div className="grounding-bar-fill" style={{width:`${Math.min(100,(value/max)*100)}%`,background:color}}/></div>
                    </div>
                  ))}
                </div>
                <div className="feature-checklist">
                  <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:700,marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Hindsight Features Active</div>
                  {[
                    ["retain()","Stores every interaction to long-term cloud memory"],
                    ["recall()","Retrieves relevant past context per query"],
                    ["reflect()","Agentic synthesis of all stored memories"],
                    ["Multi-Tenant","Scoped memory per customer ID (3 customers)"],
                    ["Local Fallback","Zero-downtime graceful degradation"],
                    ["Voice Reader","Browser TTS for AI runbooks"],
                    ["Export MD","Post-mortem & chat transcript export"],
                    ["Incident Timer","Live P1 elapsed time tracker"],
                    ["Toast Alerts","Real-time retain/recall notifications"],
                    ["Markdown AI","Rich formatted AI responses"],
                  ].map(([feat,desc])=>(
                    <div key={feat} className="checklist-row">
                      <span className="check-icon">✅</span>
                      <div><span className="check-feat">{feat}</span><span className="check-desc"> — {desc}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
