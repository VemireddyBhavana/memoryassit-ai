require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const { HindsightClient } = require("@vectorize-io/hindsight-client");

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const hindsight = new HindsightClient({
  baseUrl: process.env.HINDSIGHT_BASE_URL,
  apiKey: process.env.HINDSIGHT_API_KEY,
});

const BANK_ID = process.env.HINDSIGHT_BANK_ID || "MemoryAssist-AI";

// Health & telemetry endpoint
app.get("/api/health", async (req, res) => {
  try {
    const version = await hindsight.getVersion();
    res.json({
      status: "healthy",
      hindsight: {
        connected: true,
        version: version.api_version,
        bankId: BANK_ID,
        features: version.features,
      },
      groq: {
        model: "openai/gpt-oss-120b",
        connected: true,
      }
    });
  } catch (err) {
    res.status(500).json({
      status: "degraded",
      error: err.message
    });
  }
});

// List all indexed memories in the bank
app.get("/api/memories", async (req, res) => {
  try {
    const memories = await hindsight.listMemories(BANK_ID);
    res.json({
      success: true,
      bankId: BANK_ID,
      items: memories.items || [],
    });
  } catch (err) {
    console.error("Failed to list memories:", err.message);
    res.status(500).json({ success: false, error: err.message, items: [] });
  }
});

// Primary Chat Endpoint with Hindsight Recall & Retain
app.post("/chat", async (req, res) => {
  const startTime = Date.now();
  try {
    const { message, customerId = "cust-enterprise-01" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Message is required." });
    }

    // 1. Recall relevant long-term memories from Hindsight
    let memoryContext = "";
    let recalledItems = [];
    const recallStart = Date.now();

    try {
      const recallResponse = await hindsight.recall(BANK_ID, message);
      const items = Array.isArray(recallResponse)
        ? recallResponse
        : (recallResponse?.results || []);

      recalledItems = items;

      if (items.length > 0) {
        memoryContext = items
          .map((m) => m.text || m.content)
          .filter(Boolean)
          .join("\n");
      }
    } catch (err) {
      console.log("Hindsight recall skipped/failed:", err.message);
    }
    const recallMs = Date.now() - recallStart;

    // 2. Query Groq with context
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are MemoryAssist AI, a world-class enterprise Customer Support and Incident Memory Agent.
You assist technical users, DevOps teams, and enterprise clients with speed, precision, and contextual awareness.

CRITICAL INSTRUCTIONS:
- You have access to persistent, long-term memory via Hindsight.
- If previous memories are provided below, ALWAYS reference relevant past context (ticket numbers, previous resolutions, technical environment, AWS/cloud region, customer preferences) naturally without forcing the customer to repeat themselves.
- If this is a repeat issue, acknowledge the previous incident and provide proactive troubleshooting.

PREVIOUS RECALLED MEMORIES FROM HINDSIGHT:
${memoryContext || "No prior memories found for this specific query."}
`
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    // 3. Retain interaction in Hindsight Cloud asynchronously
    hindsight.retain(
      BANK_ID,
      `Customer [${customerId}]: ${message}\nAgent: ${reply}`
    ).catch((err) => {
      console.log("Hindsight retain error:", err.message);
    });

    const totalMs = Date.now() - startTime;

    // Return rich response with live memory telemetry
    res.json({
      reply,
      recalledMemories: recalledItems,
      memoryCount: recalledItems.length,
      telemetry: {
        recallLatencyMs: recallMs,
        totalLatencyMs: totalMs,
        bankId: BANK_ID,
        retained: true,
      }
    });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      reply: "An error occurred while processing your request. Please try again.",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MemoryAssist AI Server running on port ${PORT}`);
});
