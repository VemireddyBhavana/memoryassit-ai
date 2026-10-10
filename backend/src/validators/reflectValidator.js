const DEFAULT_REFLECT_QUERY =
  "What is the recurring issue with this customer infrastructure and what long-term architectural change do you recommend?";

function validateReflectInput(body) {
  const query = body?.query ?? DEFAULT_REFLECT_QUERY;
  if (typeof query !== "string" || !query.trim()) {
    return { valid: false, error: "Query must be a non-empty string." };
  }

  return { valid: true, value: { query } };
}

module.exports = { validateReflectInput, DEFAULT_REFLECT_QUERY };
