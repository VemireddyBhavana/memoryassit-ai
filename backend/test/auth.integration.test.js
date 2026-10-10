const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { randomUUID } = require("node:crypto");
const { query } = require("../src/db/pool");

const enabled = Boolean(process.env.DATABASE_URL);
const app = require("../server");
const { closeDatabase, initializeDatabase } = require("../src/db/pool");
let server;
let baseUrl;
let testEmail;

before(async () => {
  if (!enabled) return;
  await initializeDatabase();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  if (enabled) {
    if (testEmail) await query("DELETE FROM users WHERE email = $1", [testEmail]);
    await closeDatabase();
  }
});

test("signup, login, profile, settings, conversations, and memories are user-scoped", {
  skip: !enabled && "Set DATABASE_URL to run PostgreSQL integration tests.",
}, async () => {
  const email = `test-${randomUUID()}@example.com`;
  testEmail = email;
  const credentials = { displayName: "Integration User", email, password: "correct-horse-battery-staple" };
  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  assert.equal(signupResponse.status, 201);
  const cookie = signupResponse.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);

  async function api(path, options = {}) {
    return fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { Cookie: cookie, ...(options.headers || {}) },
    });
  }

  const me = await api("/api/auth/me");
  assert.equal((await me.json()).user.email, email);

  const profile = await api("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName: "Updated User" }),
  });
  assert.equal((await profile.json()).user.display_name, "Updated User");

  const settings = await api("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme: "light" }),
  });
  assert.equal((await settings.json()).settings.theme, "light");

  const conversation = await api("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId: "cust-test" }),
  });
  const conversationData = await conversation.json();
  assert.equal(conversation.status, 201);
  assert.equal((await api("/api/conversations")).status, 200);
  assert.equal((await api(`/api/conversations/${conversationData.conversation.id}`)).status, 200);

  const memory = await api("/api/memories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: "A private integration test memory." }),
  });
  const memoryData = await memory.json();
  assert.equal(memory.status, 201);
  const updatedMemory = await api(`/api/memories/${memoryData.memory.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: "Updated private integration memory." }),
  });
  assert.equal((await updatedMemory.json()).memory.content, "Updated private integration memory.");
  assert.equal((await api(`/api/memories/${memoryData.memory.id}`, { method: "DELETE" })).status, 200);
  assert.equal((await api(`/api/conversations/${conversationData.conversation.id}`, { method: "DELETE" })).status, 200);

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: credentials.password }),
  });
  assert.equal(loginResponse.status, 200);

  const logoutResponse = await api("/api/auth/logout", { method: "POST" });
  assert.equal(logoutResponse.status, 200);
});
