const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(body, isSignup = false) {
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const displayName =
    typeof body?.displayName === "string" ? body.displayName.trim() : "";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { valid: false, error: "Enter a valid email address." };
  }
  if (password.length < 10 || password.length > 128) {
    return { valid: false, error: "Password must be between 10 and 128 characters." };
  }
  if (isSignup && (displayName.length < 2 || displayName.length > 80)) {
    return { valid: false, error: "Name must be between 2 and 80 characters." };
  }
  return { valid: true, value: { email, password, displayName } };
}

module.exports = { validateCredentials };
