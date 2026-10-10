function validateChatInput(body) {
  if (!body || !body.message || typeof body.message !== "string") {
    return { valid: false, error: "Message is required." };
  }

  return {
    valid: true,
    value: {
      message: body.message,
      customerId: body.customerId || "cust-nexus-01",
    },
  };
}

module.exports = { validateChatInput };
