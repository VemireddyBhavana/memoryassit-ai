# MemoryAssist AI 🧠
### Autonomous Enterprise Customer Support & Incident Memory Cockpit

> An AI-powered support agent that uses **persistent memory** to remember every customer incident, recall past fixes instantly, and synthesize post-mortems automatically — so engineers never repeat themselves again.

[![Hindsight](https://img.shields.io/badge/Memory_Engine-Hindsight_Cloud_v0.10.1-6366F1?style=flat-square)](https://hindsight.vectorize.io)
[![Groq](https://img.shields.io/badge/LLM_Inference-Groq_GPT--OSS--120B-06B6D4?style=flat-square)](https://groq.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-10B981?style=flat-square)](https://react.dev)
[![Express](https://img.shields.io/badge/Backend-Express_+_Node.js-F59E0B?style=flat-square)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-white?style=flat-square)](LICENSE)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [How It Works](#-how-it-works)
- [System Architecture](#️-system-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#️-api-reference)
- [Demo Walkthrough](#-demo-walkthrough-60-seconds)
- [Hindsight Integration](#-hindsight-integration)
- [Resilience & Fallbacks](#-resilience--fallbacks)
- [Lessons Learned](#-lessons-learned)
- [Resources](#-resources)

---

## 🚨 Problem Statement

### The Real Pain: Stateless AI in Enterprise Support

Enterprise technical support and DevOps incident management has a critical failure mode: **customers are forced to re-explain their entire infrastructure every single time they contact support.**

Imagine this scenario:

> A Kubernetes cluster at a major cloud company crashes with `OOMKilled` errors on the Redis cache pod. The customer spends 20 minutes explaining their cluster ID, node group type, previous mitigations, and architectural constraints — all information that was already documented in a ticket two weeks ago. The AI assistant gives the same generic checklist it gives everyone. The engineer is frustrated. MTTR climbs.

This happens because **AI support agents are stateless**. They have no memory of past interactions. Standard RAG (Retrieval Augmented Generation) can search static documentation, but it cannot learn from previous conversations.

**Every session is day zero.**

### The Specific Costs

| Problem | Business Impact |
|---------|----------------|
| Customer re-explains context every session | 15–30 min wasted per incident |
| AI gives generic responses instead of personalized ones | Lower resolution quality, higher MTTR |
| No learning from past incidents | Same mistakes repeated across months |
| No pattern synthesis across tickets | Hidden systemic issues go unnoticed |
| Stateless bots lose all post-mortem context | Engineers rely on manual notes |

---

## 💡 Solution

**MemoryAssist AI** solves the statelessness problem by integrating **[Hindsight](https://hindsight.vectorize.io/)** — an active agent memory system — as the core architectural layer.

Instead of treating every conversation as the first, MemoryAssist AI:

1. **Retains** every incident detail, customer environment, mitigation, and outcome into a persistent long-term memory bank
2. **Recalls** the exact relevant history before generating every response — customers never have to repeat themselves
3. **Reflects** across all stored memories to generate executive-grade post-mortems and architectural recommendations automatically

### The Before vs. After

**❌ Without MemoryAssist AI (Stateless Agent):**

```
Customer: "Our cluster crashed again with the same OOM error."

AI: "I'd be happy to help! Can you please describe your 
     infrastructure setup and the exact error you're seeing?"
```

**✅ With MemoryAssist AI (Memory-Powered Agent):**

```
Customer: "Our cluster crashed again with the same OOM error."

AI: "I can see this is a recurring issue on your cluster 
     eks-prod-us-east-1. Four days ago, you experienced an 
     OOMKilled error on the Redis cache pod and restarted 
     the worker node as a temporary fix.

     The permanent solution is:
     1. Set Redis maxmemory to 800mb
     2. Use allkeys-lru eviction policy
     3. Configure memory alerts at 70% threshold

     Here's the exact config to apply..."
```

**Same short message. Completely different response. That's the power of agent memory.**

---

## ⚙️ How It Works

Every chat message goes through a **4-stage pipeline**:

```
User sends a message
        │
        ▼
┌─────────────────────────────────┐
│  STAGE 1: RECALL                │
│  hindsight.recall(bankId, msg)  │
│  → Fetch relevant past memories │
│    before the LLM ever sees it  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  STAGE 2: INJECT                │
│  Memories → System Prompt       │
│  → LLM now knows everything     │
│    that happened before         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  STAGE 3: GENERATE              │
│  Groq GPT-OSS-120B              │
│  → Produces contextual,         │
│    personalized response        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  STAGE 4: RETAIN (ASYNC)        │
│  hindsight.retain(bankId, text) │
│  → Store interaction to cloud   │
│    memory — non-blocking,       │
│    zero latency impact          │
└─────────────────────────────────┘
```

Each conversation makes the agent smarter. **Memory compounds.**

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   BROWSER (React 19 + Vite)              │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Left Panel  │  │  Chat Panel  │  │Right Panel   │  │
│  │              │  │              │  │              │  │
│  │ • Customer   │  │ • Messages   │  │🧠 Hindsight  │  │
│  │   selector   │  │ • Typing     │  │   Inspector  │  │
│  │ • Incident   │  │   indicator  │  │              │  │
│  │   metadata   │  │ • Voice TTS  │  │ • Recall tab │  │
│  │ • Severity   │  │ • Copy/Export│  │ • Bank tab   │  │
│  │   P1/P2/P3   │  │              │  │ • Reflect tab│  │
│  │ • 60-sec     │  │              │  │ • Timeline   │  │
│  │   demo       │  │              │  │ • Stats tab  │  │
│  │   scenarios  │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │  HTTP (localhost:5000)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                EXPRESS.JS BACKEND (Node.js)              │
│                                                         │
│  POST /chat ──────────────────────────────────────────► │
│    1. recall(bankId, customerId + message)               │
│    2. build system prompt with recalled memories         │
│    3. groq.chat.completions.create(...)                  │
│    4. retain(bankId, interaction) [async, non-blocking]  │
│    5. return reply + recalledMemories + telemetry        │
│                                                         │
│  GET  /api/health  → Hindsight + Groq connectivity      │
│  GET  /api/memories → List all bank memories            │
│  POST /api/reflect → Run agentic post-mortem            │
│  POST /api/reset  → Clear session cache                 │
└──────────┬─────────────────────────┬────────────────────┘
           │                         │
           ▼                         ▼
┌──────────────────┐    ┌────────────────────────────────┐
│   GROQ CLOUD     │    │   HINDSIGHT CLOUD MEMORY BANK  │
│                  │    │   Bank ID: MemoryAssist-AI      │
│  Model:          │    │                                 │
│  openai/         │    │  • Semantic vector search       │
│  gpt-oss-120b    │    │  • Entity extraction & tagging  │
│                  │    │  • Confidence scoring           │
│  Fast inference  │    │    (semantic + reranker)        │
│  ~500ms P99      │    │  • Persistent cross-session     │
│                  │    │  • 112+ facts indexed           │
└──────────────────┘    └────────────────────────────────┘
```

---

## ✨ Key Features

### Core AI Features

| Feature | Description |
|---------|-------------|
| **`retain()`** | After every chat exchange, the full interaction is stored asynchronously to Hindsight Cloud. Non-blocking — zero latency added to the user response. |
| **`recall()`** | Before every LLM call, Hindsight fetches semantically relevant memories scoped to the specific customer ID. |
| **`reflect()`** | Runs deep agentic reasoning across ALL stored memories to synthesize root causes, patterns, and long-term architectural recommendations. |
| **Multi-Tenant Scoping** | 3 enterprise customer profiles with isolated memory contexts. Memories are naturally clustered by customer ID prefix in recall queries. |

### UI/UX Features

| Feature | Description |
|---------|-------------|
| **Live Memory Inspector** | Right panel shows recalled memories in real time with semantic confidence scores (%) and entity tags after every message. |
| **Latency Sparkline** | Visual chart of recall latency history across the session. |
| **P1 Incident Timer** | Live elapsed-time tracker activates when severity is set to P1. |
| **Demo Scenario Buttons** | One-click scenario buttons that walk through the before/after memory demo for each customer. |
| **Toast Notifications** | Real-time alerts for every `retain()` and `recall()` event. |
| **Voice Reader** | Browser TTS reads AI runbook responses aloud. |
| **Export to Markdown** | Download post-mortems and chat transcripts as `.md` files. |
| **Suggested Prompts** | Context-aware prompt chips shown at session start for each customer. |
| **Customer Switcher** | Header dropdown to switch between enterprise customer contexts. |

### Resilience Features

| Feature | Description |
|---------|-------------|
| **4-Tier Fallback** | Hindsight Cloud → local keyword cache → LLM-free memory response → static message. Never shows a 500 error. |
| **Async Retain** | `retain()` uses `.catch()` so cloud write failures never impact the user response. |
| **Local Memory Cache** | In-memory fallback store (up to 50 entries) ensures continuity if cloud is unreachable. |

---

## 💻 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.2.8 | UI framework |
| **Build Tool** | Vite | 8.3.0 | Dev server & bundler |
| **Styling** | Vanilla CSS | — | Glassmorphic dark design system |
| **Backend** | Express.js | 5.2.1 | API server |
| **Runtime** | Node.js | 18+ | Server runtime |
| **Memory Layer** | Hindsight Client | 0.10.1 | `@vectorize-io/hindsight-client` |
| **LLM Inference** | Groq SDK | 1.6.0 | Fast cloud inference |
| **LLM Model** | GPT-OSS-120B | — | via `openai/gpt-oss-120b` on Groq |
| **HTTP Client** | Native Fetch | — | Browser fetch API |
| **Config** | dotenv | 18.0.4 | Environment variable loading |

---

## 📂 Project Structure

```
memoryassist-ai/
│
├── 📄 README.md                   ← This file
├── 📄 article.md                  ← Technical blog article (content submission)
├── 📄 social_and_video.md         ← LinkedIn post + video script + YouTube titles
├── 📄 .gitignore                  ← Ignores node_modules, .env, dist, logs
│
├── 📁 backend/
│   ├── 📄 server.js               ← Main Express server
│   │     ├── POST /chat           → recall → inject → generate → retain
│   │     ├── GET  /api/health     → Hindsight + Groq connectivity
│   │     ├── GET  /api/memories   → List all bank memories
│   │     ├── POST /api/reflect    → Agentic post-mortem synthesis
│   │     └── POST /api/reset      → Clear local session cache
│   ├── 📄 package.json
│   ├── 📄 .env.example            ← Template — copy this to .env
│   └── 📄 README.md
│
└── 📁 frontend/
    ├── 📁 src/
    │   ├── 📄 App.jsx             ← Main React app (644 lines)
    │   │     ├── MarkdownText     → Inline markdown renderer
    │   │     ├── ToastContainer   → Toast notification system
    │   │     └── App              → Main component (chat + inspector)
    │   └── 📄 index.css           ← Full design system (CSS variables, animations)
    ├── 📄 index.html
    ├── 📄 vite.config.js
    ├── 📄 package.json
    └── 📄 README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following before starting:

- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **Groq API Key** → Free at [console.groq.com](https://console.groq.com) (generous free tier)
- **Hindsight Cloud API Key & Bank ID** → [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io) (use promo code `MEMHACK99` for $50 free credits)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/VemireddyBhavana/memoryassit-ai.git
cd memoryassit-ai
```

---

### Step 2 — Set Up the Backend

```bash
cd backend
npm install
```

Create your environment file:

```bash
# On Windows:
copy .env.example .env

# On Mac/Linux:
cp .env.example .env
```

Open `backend/.env` and fill in your keys:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
HINDSIGHT_API_KEY=hsk_your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=MemoryAssist-AI
PORT=5000
```

Start the backend:

```bash
npm start
```

You should see:
```
🚀 MemoryAssist AI Server running on port 5000
```

---

### Step 3 — Set Up the Frontend

Open a **new terminal window**:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v8.3.1  ready in 1409 ms

  ➜  Local:   http://localhost:5173/
```

---

### Step 4 — Open the App

Go to **[http://localhost:5173](http://localhost:5173)** in your browser.

✅ The app will automatically connect to the backend on port 5000.
✅ The Hindsight Inspector on the right will show "Connected" status.

---

## 🔑 Environment Variables

All environment variables live in `backend/.env`. Here's what each one does:

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key for LLM inference. Get it free at [console.groq.com](https://console.groq.com) |
| `HINDSIGHT_API_KEY` | ✅ Yes | Your Hindsight Cloud API key. Get it at [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io) |
| `HINDSIGHT_BASE_URL` | ✅ Yes | Hindsight Cloud API base URL. Default: `https://api.hindsight.vectorize.io` |
| `HINDSIGHT_BANK_ID` | ✅ Yes | The name of your memory bank. Default: `MemoryAssist-AI`. You can change this to any name. |
| `PORT` | Optional | Backend server port. Default: `5000` |

> ⚠️ **Security:** The `.env` file is in `.gitignore` and will never be committed. Never share your API keys publicly.

---

## 🛠️ API Reference

### `POST /chat`

The primary endpoint. Executes the full **recall → inject → generate → retain** pipeline.

**Request Body:**
```json
{
  "message": "Our cluster crashed again with the same OOM error.",
  "customerId": "cust-nexus-01"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | ✅ | The user's message |
| `customerId` | string | Optional | Customer identifier for memory scoping. Default: `cust-nexus-01` |

**Response:**
```json
{
  "reply": "Based on your previous incident on eks-prod-us-east-1, the OOMKilled error was caused by Redis memory exhaustion. You restarted the worker node as a temporary fix. The permanent solution is to set Redis maxmemory to 800mb with an allkeys-lru eviction policy...",
  "recalledMemories": [
    {
      "id": "uuid-here",
      "text": "Production cluster eks-prod-us-east-1 crashed with OOMKilled on Redis cache pod. Worker node restarted.",
      "type": "world",
      "entities": ["eks-prod-us-east-1", "Redis", "OOMKilled", "AWS"],
      "scores": {
        "semantic": 0.74,
        "reranker": 0.034,
        "final": 0.00041
      }
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

Returns connectivity status for all services. Always returns 200 — never crashes.

**Response (Fully Connected):**
```json
{
  "status": "healthy",
  "hindsight": {
    "connected": true,
    "version": "0.10.1",
    "bankId": "MemoryAssist-AI",
    "features": {
      "observations": true,
      "mcp": true,
      "audit_log": true,
      "llm_trace": true
    }
  },
  "groq": {
    "connected": true,
    "model": "openai/gpt-oss-120b"
  },
  "timestamp": "2026-09-29T16:24:32.764Z"
}
```

**Response (Fallback Mode):**
```json
{
  "status": "resilient_fallback",
  "hindsight": {
    "connected": false,
    "fallbackMode": true,
    "error": "Connection timeout"
  }
}
```

---

### `GET /api/memories`

Lists all memories stored in the Hindsight memory bank. Falls back to local cache if cloud is unreachable.

**Response:**
```json
{
  "success": true,
  "bankId": "MemoryAssist-AI",
  "source": "hindsight_cloud",
  "items": [
    {
      "id": "uuid",
      "text": "Production cluster eks-prod-us-east-1 had OOMKilled error on Redis pod.",
      "type": "world",
      "entities": ["eks-prod-us-east-1", "Redis"],
      "mentioned_at": "2026-09-29T07:17:21.928518+00:00"
    }
  ]
}
```

---

### `POST /api/reflect`

Triggers `hindsight.reflect()` — agentic synthesis across **all** stored memories to generate executive post-mortems and long-term recommendations.

**Request Body:**
```json
{
  "query": "What is the recurring issue with this customer and what architectural changes do you recommend?"
}
```

**Response:**
```json
{
  "success": true,
  "bankId": "MemoryAssist-AI",
  "query": "What is the recurring issue...",
  "reflection": "Based on 4 months of incident data, the root cause is persistent Redis memory under-provisioning on eks-prod-us-east-1. The cluster has experienced 3 OOMKilled events. Long-term recommendation: migrate to AWS ElastiCache with multi-AZ replication and set hard memory limits via Kubernetes ResourceQuota...",
  "latencyMs": 3200,
  "source": "hindsight_reflect"
}
```

---

### `POST /api/reset`

Clears the local in-memory session cache. Useful for demo resets. Does NOT delete Hindsight Cloud memories.

**Response:**
```json
{
  "success": true,
  "message": "Session cache reset successfully."
}
```

---

## 🎬 Demo Walkthrough (60 Seconds)

The UI has **3 pre-built enterprise customer profiles** with demo scenarios. Here is the step-by-step walkthrough to demonstrate persistent memory:

### Customer: Nexus Cloud Corp (Kubernetes / AWS)

**Demo Step 1 — Report the Initial Incident**

Click: **"1. Report EKS Incident"** in the left sidebar

This sends:
> *"Hi, our production cluster `eks-prod-us-east-1` crashed today with OOMKilled errors on the Redis cache pod. We had to restart the worker node."*

What happens:
- The AI gives immediate troubleshooting advice
- `retain()` asynchronously stores: cluster ID, error type, node restart action, Redis pod details → Hindsight Cloud
- Memory Inspector shows: 0 recalled memories (first time — nothing existed before)

---

**Demo Step 2 — The Magic Recall (Days Later)**

Click: **"2. The 'Magic' Recall"** in the left sidebar

This sends only:
> *"Our cluster crashed again today with the same error. What was our configuration and what did we do last time?"*

No cluster ID. No context. Just that short message.

What happens:
- `recall()` executes with the scoped query
- Hindsight returns the exact prior incident — cluster name, Redis OOM details, previous worker node restart
- Memories are injected into the LLM system prompt
- AI responds with: specific cluster name, previous fix summary, and the permanent resolution (set Redis `maxmemory 800mb allkeys-lru`)
- Memory Inspector shows: confidence scores (74–94%), entity tags, memory text — live

---

**Demo Step 3 — Executive Post-Mortem**

Click: **"🔮 4. Executive Post-Mortem"** in the left sidebar

What happens:
- `reflect()` runs agentic reasoning across ALL stored memories
- Synthesizes root cause analysis, recurring patterns, long-term architectural roadmap
- Result is downloadable as a Markdown post-mortem report

---

### Other Customer Profiles

| Customer | Industry | Demo Scenario |
|---------|----------|--------------|
| **Apex Financial Systems** | FinTech | Stripe webhook timeouts + PostgreSQL connection pool exhaustion → PgBouncer fix recall |
| **Stellar SaaS Platform** | SaaS/GCP | Cloud Run cold start delays → min-instances setting recall |

---

## 🔌 Hindsight Integration

[Hindsight](https://github.com/vectorize-io/hindsight) is the agent memory layer that makes all of this work. Here's how each of the three verbs is implemented:

### `retain()` — Write to Long-Term Memory

```javascript
// backend/server.js
const interactionText = `Customer [${customerId}]: ${message}\nAgent: ${reply}`;

// Async — never blocks the user response
if (hindsight && process.env.HINDSIGHT_API_KEY) {
  hindsight.retain(BANK_ID, interactionText).catch((err) => {
    console.warn("Background Hindsight retain warning:", err.message);
  });
}
```

**Design decision:** The `.catch()` makes retention best-effort. The user always gets their response, even if the cloud write fails.

---

### `recall()` — Read Relevant Memories

```javascript
// backend/server.js
// Customer ID is prefixed to the query for natural memory scoping
const scopedQuery = `${customerId} ${message}`;
const recallResponse = await hindsight.recall(BANK_ID, scopedQuery);

const items = Array.isArray(recallResponse)
  ? recallResponse
  : (recallResponse?.results || []);

if (items.length > 0) {
  memoryContext = items
    .map((m) => m.text || m.content)
    .filter(Boolean)
    .join("\n");
}
```

**Design decision:** Prefixing with `customerId` creates natural per-tenant clustering via semantic search — no formal multi-tenancy API needed.

---

### `reflect()` — Agentic Synthesis

```javascript
// backend/server.js
const reflectResponse = await hindsight.reflect(BANK_ID, query);
// Returns synthesized insights, root-cause analysis, recommendations
// across the ENTIRE memory bank — not just a search result
```

**Design decision:** `reflect()` is qualitatively different from `recall()`. Recall is semantic search. Reflect is deep agentic reasoning across all stored facts — more like a senior engineer reading every ticket and forming a unified diagnosis.

---

### Memory Injection into System Prompt

```javascript
// backend/server.js
const completion = await groq.chat.completions.create({
  model: "openai/gpt-oss-120b",
  messages: [
    {
      role: "system",
      content: `You are MemoryAssist AI, an enterprise Customer Support Agent.

PREVIOUS RECALLED MEMORIES FROM HINDSIGHT:
${memoryContext || "No prior memories found for this specific query."}

CRITICAL: Always reference relevant past context naturally.
If this is a repeat issue, acknowledge the previous incident.`
    },
    { role: "user", content: message }
  ]
});
```

---

## 🛡️ Resilience & Fallbacks

MemoryAssist AI uses a 4-tier fallback system so it **never shows a 500 error**:

```
Tier 1: Hindsight Cloud + Groq (optimal path)
    │ FAILS?
    ▼
Tier 2: Local in-memory keyword cache + Groq
    │ FAILS?
    ▼
Tier 3: Hindsight Cloud + constructed response (no LLM)
    │ FAILS?
    ▼
Tier 4: Static fallback message ("Your request has been safely queued")
```

This matters in production environments where network hiccups, rate limits, and cold starts are expected.

---

## 📚 Lessons Learned

**1. Memory scoping is everything.**
How you structure what goes into `retain()` determines what comes out of `recall()`. Including customer ID, cluster names, and technical entity names in retained text dramatically improves recall precision.

**2. Async retention is non-negotiable for latency.**
`retain()` must fire in the background. Any synchronous write blocks the user response. Accepting eventual consistency for memory writes is the right trade-off.

**3. `reflect()` surprises people most.**
The expected wow-moment is `recall()`. The actual wow-moment is `reflect()`. Synthesized insight across all memories feels qualitatively different from a search result — it's where the agent stops feeling like a tool and starts feeling like a colleague.

**4. Show the memory layer — don't hide it.**
The live inspector panel showing recalled memories and confidence scores isn't just for debugging. Transparency about *why* the agent knows something builds trust.

**5. Fallbacks keep demos alive.**
Hardware fails, network drops, quotas reset. The 4-tier fallback chain meant the demo kept running even when Hindsight Cloud had a brief timeout mid-demo.

---

## 🔗 Resources

### Hindsight
- 📖 [Hindsight Documentation](https://hindsight.vectorize.io/)
- 💻 [Hindsight GitHub Repository](https://github.com/vectorize-io/hindsight)
- 🧠 [What is Agent Memory? — Vectorize](https://vectorize.io/what-is-agent-memory)
- ☁️ [Hindsight Cloud Dashboard](https://ui.hindsight.vectorize.io)

### LLM Inference
- ⚡ [Groq Console](https://console.groq.com)
- 📚 [Groq Documentation](https://console.groq.com/docs)

### Content
- 📄 [Article: How I Built an Enterprise Support Agent That Never Forgets](./article.md)
- 📣 [LinkedIn Post + Video Script](./social_and_video.md)

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ using **[Hindsight](https://hindsight.vectorize.io/)** · **[Groq](https://groq.com)** · **React 19** · **Express.js**

</div>
