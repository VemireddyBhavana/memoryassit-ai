const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options, allowErrorResponse = false) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok && !allowErrorResponse) {
    throw new Error(data.error || data.reply || `Request failed (${response.status}).`);
  }

  return data;
}

export function getHealth() {
  return request("/api/health");
}

export function getMemories() {
  return request("/api/memories");
}

export function sendChat(message, customerId) {
  return request("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, customerId }),
  });
}

export function createReflection(query) {
  return request("/api/reflect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  }, true);
}

export function resetMemorySession() {
  return request("/api/reset", { method: "POST" });
}
