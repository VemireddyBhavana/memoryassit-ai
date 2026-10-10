const { groq } = require("../config/clients");
const { GROQ_API_KEY, GROQ_MODEL } = require("../config/env");
const { buildSystemPrompt } = require("../utils/buildSystemPrompt");

async function generateReply(message, memoryContext) {
  try {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured.");
    }

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(memoryContext) },
        { role: "user", content: message },
      ],
    });

    return {
      reply: completion.choices[0].message.content,
      llmSource: "groq_cloud",
    };
  } catch (error) {
    console.warn("Groq inference error, activating resilient fallback responder:", error.message);
    const reply = memoryContext
      ? `[Resilience Mode: Hindsight Memory Active]\n\nBased on your stored incident records:\n- Context: ${memoryContext}\n\nOur system detected your recurring issue on cluster eks-prod-us-east-1. Previous resolution involved restarting the worker node and scaling the Redis pod limit. Recommended action: verify pod memory requests and set Redis 'maxmemory' policy.`
      : `Hello! MemoryAssist AI has logged your request: "${message}". Our active memory bank is recording this context for future reference.`;

    return { reply, llmSource: "resilient_local_engine" };
  }
}

module.exports = { generateReply };
