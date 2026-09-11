# SafeRoute AI

**The fastest route is not always the right route.**

SafeRoute AI is a context-aware travel companion concept for women travelers. Instead of returning a single "best" route, it compares **Fastest**, **Safer**, and **Balanced** options — each with a plain-language explanation of *why* it was recommended, an honest confidence/uncertainty band, and one-tap access to emergency numbers and trusted contacts.

This is a hackathon prototype. All routing, weather, traffic, and activity signals are **simulated/demo data**, clearly labeled as such throughout the app — nothing here is real crime, incident, or traffic data, and no route is ever presented as guaranteed safe.

## Core idea

```
Frontend  →  Backend API  →  Context Engine  →  Recommendation Engine  →  Mock data providers
```

- **Context Engine** (`src/lib/server/contextEngine.ts`) aggregates four swappable providers — weather, traffic, transport availability, and public activity — into one snapshot.
- **Recommendation Engine** (`src/lib/server/recommendationEngine.ts`) combines that snapshot with a traveler's preferences to build Fastest / Safer / Balanced routes, each with an estimated context score, a confidence level, and 3–5 explanation reasons.
- Every score is shown next to its confidence and an uncertainty disclaimer — the app never asserts a route is objectively safe.

## Features

- **Journey Planner** → **Route Comparison** with explainable "Why this route?" reasoning
- **Safety Dashboard** — live context indicators plus a rich demo journey/recommendation history
- **Live Journey** — simulated progress, smart check-in prompts, "expected arrival passed" alerts, live-trip sharing toggle
- **Preferences** — personalization (transport mode, walking tolerance, route priority, accessibility), with a demo-profile switcher (5 fictional traveler personas)
- **Privacy Center** — explicit permission toggles, backend-persisted
- **Emergency / Help** — official emergency numbers (India) with one-tap `tel:` calling, plus a full Trusted Contacts CRUD backed by a real (demo-scoped) API

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · API routes as the backend (no separate server needed)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables or API keys are required — the app runs entirely on demo/mock data out of the box (`DEMO_MODE=true` by default).

To run a production build (recommended before deploying):

```bash
npm run build
npm run start
```

## Environment variables

See [`.env.example`](./.env.example). Everything is optional for the demo; these exist so real providers (weather/traffic/maps APIs, a database, real auth) can be swapped in later without changing the API contract.

## Project structure

```
src/
  app/                  Pages (App Router) + API routes under app/api/**
  components/           UI, layout, and feature components
  lib/
    demoData/           Centralized demo dataset (users, journeys, routes, snapshots)
    server/             Context Engine, Recommendation Engine, demo data stores, auth
    services/           Client-side service wrappers
    api/client.ts        Centralized frontend API layer — all fetch() calls live here
    types.ts             Shared domain types
prisma/
  schema.prisma          Reference schema for a future real database (not wired up yet)
```

## What's real vs. simulated

| Real (backed by API routes) | Simulated (demo data) |
|---|---|
| Trusted contacts (CRUD) | Weather, traffic, transport, activity signals |
| Journey lifecycle (start/check-in/complete) | Route geometry, ETA, safety/context scores |
| Preferences & privacy settings | Journey history, recommendation history, live-journey examples |

All of the above use in-memory demo stores (no database) scoped to an anonymous per-session cookie — data resets on server restart. This is intentional for a hackathon demo; see `prisma/schema.prisma` for the schema a real database would use.

## Security

- No API keys or secrets are ever exposed to the browser
- Per-user data isolation (verified: one session cannot read another's data)
- Nonce-based Content-Security-Policy, HSTS, and standard secure headers in production (`src/middleware.ts`, `next.config.ts`)
- Input validation and sanitized error responses on every API route

## Disclaimer

Nothing in this app is derived from real crime, safety, or incident data. Contextual scores are simulated signals meant to illustrate how an explainable, context-aware recommendation system could work — they are estimates, not guarantees, and should never be the sole basis for a real safety decision.
