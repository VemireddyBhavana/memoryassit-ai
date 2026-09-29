# MemoryAssist AI 🧠
### Autonomous Enterprise Customer Support & Incident Memory Cockpit

[![Hindsight](https://img.shields.io/badge/Memory_Engine-Hindsight_Cloud_v0.10.1-6366F1?style=flat-square)](https://hindsight.vectorize.io)
[![Groq](https://img.shields.io/badge/LLM_Inference-Groq_GPT--OSS--120B-06B6D4?style=flat-square)](https://groq.com)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_+_Vite-10B981?style=flat-square)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Express_+_Node.js-F59E0B?style=flat-square)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-white?style=flat-square)](LICENSE)

---

## 📌 The Problem

Enterprise technical support and DevOps incident management is broken in one specific way: **customers are forced to repeat themselves every single time.**

When a production Kubernetes cluster crashes at 2 AM — for the third time this month — the support engineer has to spend 15–30 minutes re-explaining:

- Which cluster ID failed (`eks-prod-us-east-1`)
- Their cloud architecture (Redis cache pod, node group instance type)
- What temporary mitigations were applied last week
- What the post-mortem action items were

**Stateless AI chatbots make this worse, not better.** They give the same generic checklist every session because they have zero memory of anything that came before. Standard RAG (Retrieval Augmented Generation) can search static documentation, but it cannot learn from past customer conversations.

Every session is day zero. Every incident starts from scratch.

---

## 💡 The Solution

**MemoryAssist AI** is an autonomous enterprise support agent that uses **[Hindsight](https://hindsight.vectorize.io/)** — a persistent agent memory system — to remember, recall, and learn across every customer interaction.

Instead of asking "Can you describe your infrastructure again?", the agent:

1. **Retains** every incident, fix, and infrastructure detail into a persistent cloud memory bank
2. **Recalls** the exact relevant history before every response — no repetition required
3. **Reflects** across all stored memories to synthesize executive post-mortems and proactive architectural recommendations

### Before Hindsight:
> Customer: *"Our cluster crashed again."*
> Agent: *"Can you describe your cluster setup and what error you're seeing?"*

### With Hindsight:
> Customer: *"Our cluster crashed again."*
> Agent: *"I can see `eks-prod-us-east-1` had a Redis OOMKilled issue 4 days ago. You restarted the worker node as a temporary fix. The permanent solution is setting Redis `maxmemory` to 800mb with an `allkeys-lru` eviction policy — here's the exact config..."*

**That delta is the entire value proposition.**

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    USER (Browser)                            │
│              React 19 + Vite Frontend                        │
└─────────────────────────┬────────────────────────────────────┘
                          │  POST /chat
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                 Express.js Backend (Node.js)                 │
│                                                              │
│  1. hindsight.recall(bankId, scopedQuery)  ← BEFORE LLM     │
│     └─ Returns relevant past memories + scores               │
│                                                              │
│  2. Inject memories → Groq system prompt                     │
│     └─ Groq GPT-OSS-120B generates contextual response       │
│                                                              │
│  3. hindsight.retain(bankId, interaction)  ← AFTER LLM      │
│     └─ Async, non-blocking. Never delays the response.       │
│                                                              │
│  4. hindsight.reflect(bankId, query)       ← ON DEMAND      │
│     └─ Agentic synthesis across ALL memories (post-mortem)   │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              Hindsight Cloud Memory Bank                     │
│              Bank ID: MemoryAssist-AI                        │
│  • Semantic vector search                                    │
│  • Entity extraction & tagging                               │
│  • Confidence scoring (semantic + reranker)                  │
│  • Persistent cross-session storage                          │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **`retain()`** | Stores every customer interaction to Hindsight Cloud asynchronously (zero latency impact) |
| **`recall()`** | Retrieves semantically relevant past memories before every LLM call, scoped by customer ID |
| **`reflect()`** | Runs agentic synthesis across ALL memories to generate executive post-mortems |
| **Multi-Tenant Memory** | 3 enterprise customer profiles, each with isolated memory context |
| **Live Memory Inspector** | Real-time panel showing recalled facts, confidence scores (%), and entity tags |
| **Latency Sparkline** | Visual history of recall latency per message |
| **P1 Incident Timer** | Live elapsed time tracker for critical incidents |
| **4-Tier Fallback** | Never shows a 500 error — gracefully degrades through cloud → local cache → LLM-free → static |
| **Voice Reader** | Browser TTS reads AI runbooks aloud |
| **Export to Markdown** | Post-mortems and chat transcripts downloadable as `.md` |
| **Toast Notifications** | Real-time alerts for every retain/recall event |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **Groq API Key** — [get one free at groq.com](https://groq.com)
- **Hindsight Cloud API Key & Bank ID** — [get one at ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io)

---

### 1. Clone the Repository

```bash
git clone https://github.com/VemireddyBhavana/memoryassit-ai.git
cd memoryassit-ai
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file (copy from the example):

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=MemoryAssist-AI
PORT=5000
```

Start the backend server:

```bash
npm start
# 🚀 MemoryAssist AI Server running on port 5000
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
# ➜  Local: http://localhost:5173/
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🛠️ API Reference

### `POST /chat`
The primary chat endpoint. Executes the full recall → inject → generate → retain pipeline.

**Request Body:**
```json
{
  "message": "Our cluster crashed again with the same OOM error.",
  "customerId": "cust-nexus-01"
}
```

**Response:**
```json
{
  "reply": "Based on your prior incident, eks-prod-us-east-1 had Redis OOMKilled on 2026-09-25. The worker node was restarted. Permanent fix: set maxmemory 800mb + allkeys-lru policy...",
  "recalledMemories": [
    {
      "text": "Production cluster eks-prod-us-east-1 crashed with OOMKilled on Redis cache pod...",
      "scores": { "semantic": 0.74, "reranker": 0.034, "final": 0.00041 },
      "entities": ["eks-prod-us-east-1", "Redis", "OOMKilled"]
    }
  ],
  "memoryCount": 112,
  "telemetry": {
    "recallLatencyMs": 897,
    "totalLatencyMs": 4167,
    "bankId": "MemoryAssist-AI",
    "retained": true,
    "memorySource": "hindsight_cloud",
    "llmSource": "groq_cloud"
  }
}
```

---

### `GET /api/health`
Returns connectivity status for Hindsight Cloud and Groq.

**Response (healthy):**
```json
{
  "status": "healthy",
  "hindsight": { "connected": true, "version": "0.10.1", "bankId": "MemoryAssist-AI" },
  "groq": { "connected": true, "model": "openai/gpt-oss-120b" }
}
```

---

### `GET /api/memories`
Lists all memories stored in the Hindsight bank. Falls back to local cache if cloud is unreachable.

---

### `POST /api/reflect`
Triggers `hindsight.reflect()` for agentic post-mortem synthesis across all stored memories.

**Request Body:**
```json
{ "query": "What is the recurring issue and what architectural changes do you recommend?" }
```

---

### `POST /api/reset`
Clears the local session cache. Useful for demo resets.

---

## 🎬 60-Second Demo Story

The UI has pre-built demo scenarios for each customer. Here's how to demonstrate the memory magic:

**Step 1 — Report an Incident (Interaction 1)**
> Click: *"1. Report EKS Incident"* in the left sidebar
> 
> This sends: *"Our production cluster `eks-prod-us-east-1` crashed with OOMKilled errors on the Redis cache pod."*
> 
> → Hindsight `retain()` indexes: cluster ID, error type, mitigation taken, infrastructure context.

**Step 2 — Watch the Magic Recall (Days Later)**
> Click: *"2. The 'Magic' Recall"*
>
> This sends only: *"Our cluster crashed again. What did we do last time?"*
>
> → Without any cluster ID or context, Hindsight `recall()` retrieves the exact prior incident.
> → The AI responds with the specific cluster name, previous fix, and permanent resolution.
> → The Memory Inspector shows confidence scores live (74–94%).

**Step 3 — Executive Post-Mortem**
> Click: *"🔮 4. Executive Post-Mortem"*
>
> → `hindsight.reflect()` synthesizes all stored memories into a root-cause analysis with architectural recommendations — no manual prompt engineering required.

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Vanilla CSS |
| Backend | Node.js, Express 5 |
| Memory Layer | [Hindsight Cloud](https://hindsight.vectorize.io/) (`@vectorize-io/hindsight-client` v0.10.1) |
| LLM Inference | [Groq](https://groq.com) — `openai/gpt-oss-120b` |
| Deployment | Local dev (backend: port 5000, frontend: port 5173) |

---

## 📂 Project Structure

```
memoryassist-ai/
├── backend/
│   ├── server.js          # Express server — all API routes + Hindsight integration
│   ├── package.json
│   ├── .env.example       # Template for required environment variables
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React app — chat UI + Memory Inspector
│   │   └── index.css      # Full design system (glassmorphic dark theme)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── article.md             # Technical blog article about this project
├── social_and_video.md    # LinkedIn post + video script
└── README.md              # This file
```

---

## 🔗 Resources

- [Hindsight Documentation](https://hindsight.vectorize.io/)
- [Hindsight GitHub Repository](https://github.com/vectorize-io/hindsight)
- [What is Agent Memory? — Vectorize](https://vectorize.io/what-is-agent-memory)
- [Groq Console](https://console.groq.com)
- [Hindsight Cloud Dashboard](https://ui.hindsight.vectorize.io)

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.
