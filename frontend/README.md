# MemoryAssist AI — Frontend

React 19 + Vite frontend for the MemoryAssist AI authenticated support workspace.

## Stack

- React 19 and Vite 8
- React Router for page routing
- Vanilla CSS design system with persisted light/dark preference

## Development

```bash
npm install
npm run dev
# Local: http://localhost:5173/
```

Start PostgreSQL and the backend first (see the [root README](../README.md)). The API defaults to `http://localhost:5000`. Set `VITE_API_URL` in `frontend/.env` to use a different backend URL.

## Frontend structure

- `src/main.jsx` — React entry point.
- `src/routes/AppRoutes.jsx` — route definitions and auth provider.
- `src/pages/` — landing, login, signup, dashboard, chat, memories, profile, and settings pages.
- `src/layouts/AppLayout.jsx` — shared navigation and workspace layout.
- `src/components/` — protected-route and shared UI components.
- `src/contexts/` and `src/hooks/` — authentication state and reusable hooks.
- `src/services/api.js` — cookie-enabled API calls to Express.
- `src/hooks/useBackendOverview.js` — backend health and memory refresh state.
- `src/index.css` — shared design system and routed-page styles.

The landing page is `/`. The authenticated dashboard and product pages are `/dashboard`, `/chat`, `/memories`, `/profile`, and `/settings`. Login and signup are at `/login` and `/signup`.

## Checks

```bash
npm run build
npm run lint
```
