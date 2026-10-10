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

test("health remains public and user data is unavailable without PostgreSQL", async () => {
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.equal((await healthResponse.json()).status, "resilient_fallback");

  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName: "Test User", email: "test@example.com", password: "long-enough-password" }),
  });
  assert.equal(signupResponse.status, 503);

  const chatResponse = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Our production cluster crashed again." }),
  });
  assert.equal(chatResponse.status, 503);

  const conversationsResponse = await fetch(`${baseUrl}/api/conversations`);
  assert.equal(conversationsResponse.status, 503);

  const memoriesResponse = await fetch(`${baseUrl}/api/memories`);
  assert.equal(memoriesResponse.status, 503);
});

test("credential validation rejects weak or malformed signup data", () => {
  const { validateCredentials } = require("../src/validators/authValidator");
  assert.equal(validateCredentials({ displayName: "A", email: "not-an-email", password: "short" }, true).valid, false);
  assert.equal(validateCredentials({ displayName: "Test User", email: "test@example.com", password: "long-enough-password" }, true).valid, true);
});

test("reflection reports unavailable when unauthenticated or database is not configured", async () => {
  const reflectResponse = await fetch(`${baseUrl}/api/reflect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "Summarize the incident history." }),
  });
  assert.equal(reflectResponse.status, 503);
});
