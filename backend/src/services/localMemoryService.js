const localFallbackMemories = [
  {
    id: "fb-01",
    text: "Production cluster eks-prod-us-east-1 experienced an outage due to OOMKilled errors on Redis cache pod. Workload uses m5.large node group.",
    entities: ["eks-prod-us-east-1", "Redis", "OOMKilled", "AWS"],
    type: "fallback_memory",
    date: new Date().toISOString(),
  },
];

function findRelevantMemories(message, userId) {
  const lower = message.toLowerCase();
  return localFallbackMemories.filter(
    (memory) =>
      memory.userId === userId &&
      (memory.entities?.some((entity) => lower.includes(entity.toLowerCase())) ||
        lower.includes("cluster") ||
        lower.includes("crash") ||
        lower.includes("again") ||
        lower.includes("name")),
  );
}

function retainLocally(memory, userId) {
  memory.userId = userId;
  localFallbackMemories.unshift(memory);
  let count = 0;
  for (const item of localFallbackMemories) {
    if (item.userId === userId) count += 1;
  }
  if (count > 50) {
    const oldest = localFallbackMemories.findLastIndex((item) => item.userId === userId);
    if (oldest >= 0) localFallbackMemories.splice(oldest, 1);
  }
}

function listLocalMemories(userId) {
  return localFallbackMemories.filter((memory) => memory.userId === userId);
}

function resetLocalMemories(userId) {
  for (let i = localFallbackMemories.length - 1; i >= 0; i -= 1) {
    if (localFallbackMemories[i].userId === userId) localFallbackMemories.splice(i, 1);
  }
}

module.exports = {
  findRelevantMemories,
  listLocalMemories,
  resetLocalMemories,
  retainLocally,
};
