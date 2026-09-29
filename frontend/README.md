# MemoryAssist AI — Frontend

React 19 + Vite frontend for the MemoryAssist AI enterprise support cockpit.

## Stack

- **React 19** — UI framework
- **Vite 8** — build tool and dev server
- **Vanilla CSS** — full custom glassmorphic dark design system

## Development

```bash
npm install
npm run dev
# ➜ Local: http://localhost:5173/
```

The frontend expects the backend running on `http://localhost:5000`.  
See the [root README](../README.md) for full setup instructions.

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app — chat panel, memory inspector, scenario buttons |
| `src/index.css` | Full design system — CSS variables, glassmorphism, animations |
| `index.html` | HTML entry point |
| `vite.config.js` | Vite configuration |
