import { useCallback, useState } from "react";
import { getHealth, getMemories } from "../services/api.js";

export default function useBackendOverview() {
  const [health, setHealth] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true);
    try {
      const [healthResult, memoriesResult] = await Promise.allSettled([
        getHealth(),
        getMemories(),
      ]);
      const healthOk = healthResult.status === "fulfilled";
      const memoriesOk = memoriesResult.status === "fulfilled";

      if (healthOk) setHealth(healthResult.value);
      if (memoriesOk) setMemories(memoriesResult.value.items || []);

      return {
        ok: healthOk && memoriesOk,
        memories: memoriesOk ? memoriesResult.value.items || [] : null,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { health, memories, loading, refresh };
}
