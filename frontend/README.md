# EscrowHub Frontend

React 19 + Vite + Tailwind CSS v4 frontend for the Freelancer Escrow backend (Spring Boot microservices behind an API Gateway).

## Quick start

```bash
npm install
cp .env.example .env     # then edit the URLs if your gateway is not on localhost:8080
npm run dev              # http://localhost:5173
```

Production build: `npm run build` (output in `dist/`), preview with `npm run preview`.

## Configuration (.env)

All backend URLs come from `.env`. Nothing is hardcoded in the source.

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_URL` | API Gateway base URL | `http://localhost:8080` |
| `VITE_WS_URL` | Chat WebSocket (through the gateway) | `ws://localhost:8080/ws-chat` |

Vite reads `.env` at start. Restart `npm run dev` after changing it.
For production, set the same variables in your host (Vercel, Netlify, etc.) and use `https://` and `wss://`.
Also add your frontend origin to the gateway's `CorsConfig` allowed origins.

## Backend requirements

1. Start the gateway (8080) and the services: user, project, escrow, dispute, notification, ai, chat.
2. Add the one missing endpoint listed in `BACKEND_ADDITIONS.md` (`GET /projects/assigned`) so freelancers can see "My work".
3. Create an admin by registering with role `ADMIN` and verifying the email (test setup only).

## Features by role

| Role | Pages |
|---|---|
| Public | Landing, Login, Register, Email verify, Forgot / Reset password |
| Client | Overview, My projects, Post a project (AI milestone plan), Project detail (bids, hire, milestones, fund, approve, revision, dispute, AI deliverable check, review, chat), Wallet, Disputes, Notifications, Profile |
| Freelancer | Overview, Find work (filters), My work, Project detail (bid with AI proposal draft, start, submit, dispute, chat), Earnings, Disputes, Notifications, Profile + photo |
| Admin | Overview, Disputes (AI summary, release / refund / split), Users (block), Revenue |

## Project structure

```
src/
  api/axios.js          axios instance, token refresh on 401, error and money helpers
  auth/                 AuthContext, ProtectedRoute (role based)
  components/           ui.jsx (design system), AppShell, Navbar, Footer, Chat, MilestoneStepper
  pages/                one file per screen
  index.css             Tailwind theme tokens (colors, font)
```

## Design system

- Font: Manrope (self-hosted via `@fontsource-variable/manrope`, no external requests).
- Brand: deep teal (`brand-*`). Amber (`hold-*`) is used only for money held in escrow, so it always means "locked".
- Components in `components/ui.jsx`: Button, Card, Field, Input, Select, Textarea, Badge, StatusBadge, Modal, Spinner, Empty, PageHeader, Toast.
- Accessibility: visible focus rings, labelled inputs, `aria-live` for toasts and chat, Escape closes modals, `prefers-reduced-motion` respected.

## Notes

- Tokens are stored in `localStorage`. The access token is refreshed automatically when it expires.
- AI features (milestone plan, proposal draft, deliverable check, dispute summary) only suggest. Money moves only through escrow actions.
- The wallet "Add funds" is a test top-up. Replace it with a payment gateway for production.
