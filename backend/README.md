# MemoryAssist AI Backend

Express service that combines Hindsight memory recall/retention with Groq response generation. It keeps an in-memory fallback cache so the demo can still respond when cloud credentials or connectivity are unavailable.

## Architecture

- `server.js` loads environment variables and starts the HTTP server.
- `src/app.js` configures Express middleware and mounts the API routers.
- `src/config/` contains environment settings and the Groq/Hindsight clients.
- `src/routes/` maps the existing API paths to controllers.
- `src/controllers/` handles HTTP request and response behavior.
- `src/services/` contains Hindsight, Groq, and local fallback-memory operations.
- `src/middleware/` provides JSON error handling and unknown-route responses.
- `src/validators/` validates chat and reflection request bodies.
- `src/utils/` contains shared prompt construction.

The existing integration flow is preserved: `/chat` recalls relevant memory from Hindsight, supplies it to Groq, then stores the interaction locally and asynchronously calls Hindsight `retain()`. When cloud recall or Groq inference is unavailable, the existing local responder/cache is used.

## API Endpoints

- `POST /chat` — accepts `{ "message": "...", "customerId": "..." }`, recalls memory, generates a reply, and retains the interaction.
- `GET /api/health` — reports Groq configuration and Hindsight connection/version status.
- `GET /api/memories` — lists Hindsight memories, falling back to the local cache.
- `POST /api/reflect` — accepts an optional `{ "query": "..." }` and requests a Hindsight reflection.
- `POST /api/reset` — clears the in-memory fallback cache.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
# Add your service credentials to .env
npm start
```

The backend listens on `http://localhost:5000` by default. Configure `PORT` to change it.

Environment variables:

- `GROQ_API_KEY` — Groq API key.
- `HINDSIGHT_API_KEY` — Hindsight Cloud API key.
- `HINDSIGHT_BASE_URL` — Hindsight API base URL.
- `HINDSIGHT_BANK_ID` — memory bank identifier.
- `PORT` — HTTP port (default `5000`).

## Test

Run `npm test`. The integration test exercises the HTTP routes using the local fallback path and does not require live cloud credentials.

## Current scope

This phase reorganizes the existing service without adding authentication, persistent application database storage, or user-scoped data. The fallback memory cache is process-local and is cleared when the server restarts.
