# Web App

Next.js App Router frontend for the task manager.

## Navigation Guide

```text
src/app                 Routes, global layout, and providers
src/components/auth     Login/signup screens
src/components/layout   Authenticated shell and theme toggle
src/components/tasks    Dashboard, filters, table/cards, drawer form, pagination, realtime hook
src/components/ui       Small reusable UI primitives
src/context             AuthProvider and persisted session state
src/lib                 API client and formatting helpers
src/types               Shared task/auth TypeScript types
```

## UI Notes

- Desktop uses a table because many tasks are easier to scan row-by-row.
- Mobile uses cards because task metadata wraps more naturally on narrow screens.
- Create/edit opens in a drawer: bottom sheet on mobile, right drawer on desktop.
- The task list scrolls internally so pagination remains visible.
- The dashboard listens to WebSocket task events and quietly refreshes the active list.

## Run

```bash
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run dev
```
