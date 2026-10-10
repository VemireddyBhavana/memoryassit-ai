# MemoryAssist AI Backend

Express service that combines Hindsight memory recall/retention with Groq response generation. PostgreSQL stores accounts, opaque login sessions, conversations, messages, user memory records, and settings.

## Architecture

- `server.js` loads environment variables and starts the HTTP server.
- `src/app.js` configures Express middleware and mounts the API routers.
- `src/config/` contains environment settings and the Groq/Hindsight clients.
- `src/routes/` maps the existing API paths to controllers.
- `src/controllers/` handles HTTP request and response behavior.
- `src/services/` contains Hindsight, Groq, and local fallback-memory operations.
- `src/db/` contains the PostgreSQL pool and idempotent schema setup.
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
- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` — account and session endpoints.
- `/api/conversations` — authenticated conversation create/list/read/update/delete endpoints; messages are stored with each conversation.
- `/api/profile` and `/api/settings` — authenticated profile and theme preferences.
- `/api/memories` — authenticated user memory records with create, list, update, and delete operations. Provider memories are returned read-only as `hindsight` / `items`.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
# Set DATABASE_URL and SESSION_SECRET, then add Groq/Hindsight service credentials.
npm start
```

The backend listens on `http://localhost:5000` by default. Configure `PORT` to change it.

Environment variables:

- `GROQ_API_KEY` — Groq API key.
- `HINDSIGHT_API_KEY` — Hindsight Cloud API key.
- `HINDSIGHT_BASE_URL` — Hindsight API base URL.
- `HINDSIGHT_BANK_ID` — memory bank identifier.
- `PORT` — HTTP port (default `5000`).
- `DATABASE_URL` — PostgreSQL connection string. Required for auth and saved data.
- `SESSION_SECRET` — random secret reserved for future signing use (required in production).
- `CLIENT_ORIGIN` — allowed frontend origins, comma-separated if needed.
- `DATABASE_SSL` — set `true` when the managed PostgreSQL provider requires TLS.

## Test

Run `npm test`. Tests for routes not requiring a database run without external credentials. Configure PostgreSQL to exercise account and persistence flows.

## Current scope

Hindsight banks are namespaced per user; app-managed memory records are stored in PostgreSQL. The fallback response cache is process-local and is cleared when the server restarts. Configure TLS, backups, trusted origins, and deployment secrets for production.
