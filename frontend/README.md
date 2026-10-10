# MemoryAssist AI — Frontend

React 19 + Vite frontend for the MemoryAssist AI enterprise support cockpit.

## Stack

- **React 19** — UI framework
- **Vite 8** — build tool and dev server
- **React Router** — client-side page routing
- **Vanilla CSS** — full custom glassmorphic dark design system

## Development

```bash
npm install
npm run dev
# ➜ Local: http://localhost:5173/
```

The frontend expects the backend running on `http://localhost:5000`. Set
`VITE_API_URL` in a frontend `.env` file to use a different backend URL.
See the [root README](../README.md) for full setup instructions.

## Frontend structure

- `src/main.jsx` — React entry point.
- `src/routes/AppRoutes.jsx` — public, workspace, and chat routes.
- `src/pages/` — landing, login/signup placeholders, dashboard, existing chat cockpit, memories, profile, and settings pages.
- `src/layouts/AppLayout.jsx` — shared navigation and layout for workspace pages.
- `src/components/PlaceholderPage.jsx` — reusable placeholder page used by unfinished areas.
- `src/services/api.js` — shared calls to the existing Express API.
- `src/hooks/useBackendOverview.js` — reusable health and memory-bank refresh state.
- `src/index.css` — shared design system and routed-page styles.
- `index.html` — HTML entry point.
- `vite.config.js` — Vite configuration.

The existing chat cockpit is available at `/chat`; the landing page is `/`.
The login, signup, memories, profile, and settings routes are placeholders only.
Authentication, persistent user conversations, and memory editing are not part
of this frontend restructuring phase.

## Checks

```bash
npm run build
npm run lint
```
