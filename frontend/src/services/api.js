const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options, allowErrorResponse = false) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });
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

export function signUp(credentials) {
  return request("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export function logIn(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export function logOut() {
  return request("/api/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function getConversations() {
  return request("/api/conversations");
}

export function createConversation(customerId) {
  return request("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId }),
  });
}

export function getConversation(id) {
  return request(`/api/conversations/${encodeURIComponent(id)}`);
}

export function renameConversation(id, title) {
  return request(`/api/conversations/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export function deleteConversation(id) {
  return request(`/api/conversations/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function sendConversationMessage(id, message, customerId) {
  return request(`/api/conversations/${encodeURIComponent(id)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, customerId }),
  });
}

export function getProfile() {
  return request("/api/profile");
}

export function updateProfile(displayName) {
  return request("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
}

export function getSettings() {
  return request("/api/settings");
}

export function updateSettings(theme) {
  return request("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme }),
  });
}

export function getUserMemories() {
  return request("/api/memories");
}

export function createUserMemory(content) {
  return request("/api/memories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export function updateUserMemory(id, content) {
  return request(`/api/memories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export function deleteUserMemory(id) {
  return request(`/api/memories/${encodeURIComponent(id)}`, { method: "DELETE" });
}
