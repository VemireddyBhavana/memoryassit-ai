const localFallbackMemories = [
  {
    id: "fb-01",
    text: "Production cluster eks-prod-us-east-1 experienced an outage due to OOMKilled errors on Redis cache pod. Workload uses m5.large node group.",
    entities: ["eks-prod-us-east-1", "Redis", "OOMKilled", "AWS"],
    type: "fallback_memory",
    date: new Date().toISOString(),
  },
];

function findRelevantMemories(message) {
  const lower = message.toLowerCase();
  return localFallbackMemories.filter(
    (memory) =>
      memory.entities?.some((entity) => lower.includes(entity.toLowerCase())) ||
      lower.includes("cluster") ||
      lower.includes("crash") ||
      lower.includes("again") ||
      lower.includes("name"),
  );
}

function retainLocally(memory) {
  localFallbackMemories.unshift(memory);
  if (localFallbackMemories.length > 50) {
    localFallbackMemories.pop();
  }
}

function listLocalMemories() {
  return localFallbackMemories;
}

function resetLocalMemories() {
  localFallbackMemories.length = 0;
}

module.exports = {
  findRelevantMemories,
  listLocalMemories,
  resetLocalMemories,
  retainLocally,
};
