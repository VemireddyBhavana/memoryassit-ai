const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.GROQ_API_KEY = "";
process.env.HINDSIGHT_API_KEY = "";

const app = require("../server");
let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("existing API endpoints preserve their fallback behavior", async () => {
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.equal((await healthResponse.json()).status, "resilient_fallback");

  const invalidChatResponse = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(invalidChatResponse.status, 400);
  assert.equal((await invalidChatResponse.json()).reply, "Message is required.");

  const chatResponse = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Our production cluster crashed again.",
      customerId: "cust-test",
    }),
  });
  const chat = await chatResponse.json();
  assert.equal(chatResponse.status, 200);
  assert.equal(chat.telemetry.llmSource, "resilient_local_engine");
  assert.equal(chat.telemetry.retained, true);
  assert.ok(chat.recalledMemories.length > 0);

  const memoriesResponse = await fetch(`${baseUrl}/api/memories`);
  const memories = await memoriesResponse.json();
  assert.equal(memories.source, "local_resilient_cache");
  assert.ok(memories.items.some((memory) => memory.text.includes("cust-test")));

  const reflectResponse = await fetch(`${baseUrl}/api/reflect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "Summarize the incident history." }),
  });
  assert.equal(reflectResponse.status, 500);
  assert.equal((await reflectResponse.json()).success, false);

  const resetResponse = await fetch(`${baseUrl}/api/reset`, { method: "POST" });
  assert.equal(resetResponse.status, 200);
  assert.equal((await resetResponse.json()).success, true);

  const afterResetResponse = await fetch(`${baseUrl}/api/memories`);
  assert.deepEqual((await afterResetResponse.json()).items, []);
});
