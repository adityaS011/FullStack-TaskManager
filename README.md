# Vector Task Manager

Full-stack task management application built from the assessment brief. The repo is organized as a small monorepo so the web and API can be deployed, tested, and scaled independently.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: Go, chi router, pgx, JWT auth
- Database: PostgreSQL
- Tooling: Docker Compose, GitHub Actions CI

## Project Structure

```text
apps/web                 Next.js frontend
apps/web/src/app         App Router pages and root providers
apps/web/src/components  Reusable UI, auth, layout, and task components
apps/web/src/context     Client auth state and session persistence
apps/web/src/lib         API client and shared frontend helpers
services/api             Go REST API
services/api/cmd/api     Application entrypoint and dependency wiring
services/api/internal    Auth, task, realtime, database, HTTP, config, validation packages
services/api/internal/database/migrations  SQL schema managed by the API at startup
.github/workflows        CI checks for API tests and web lint/build
```

Start reading from `services/api/cmd/api/main.go` for backend wiring and `apps/web/src/app/tasks/page.tsx` for the protected task screen.

## Run With Docker

```bash
cp .env.example .env
docker compose up --build
```

Open `http://localhost:3000`. The API health check is at `http://localhost:8080/health`.

## Run Locally

Start Postgres:

```bash
docker compose up db -d
```

Start the API:

```bash
cd services/api
DATABASE_URL="postgres://postgres:postgres@localhost:5432/vector_tasks?sslmode=disable" \
JWT_SECRET="local-development-secret" \
CORS_ORIGIN="http://localhost:3000" \
go run ./cmd/api
```

Start the web app:

```bash
cd apps/web
npm install
NEXT_PUBLIC_API_BASE_URL="http://localhost:8080" npm run dev
```

## Scripts

```bash
npm run lint:web
npm run build:web
npm run test:api
npm run dev:api
```

## API Summary

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /tasks`
- `GET /tasks?status=&q=&sort=&direction=&page=&pageSize=`
- `GET /tasks/{id}`
- `PATCH /tasks/{id}`
- `DELETE /tasks/{id}`
- `GET /admin/tasks` for admin users
- `GET /ws/tasks?token=<jwt>` for task mutation WebSocket events

Task routes require `Authorization: Bearer <token>`. Members only access their own tasks. Admin users are assigned by listing signup emails in `ADMIN_EMAILS`; those users can open the dashboard's "All users" view backed by `/admin/tasks`.

## Implemented Features

- Signup/login with bcrypt password hashing and JWT auth
- Protected task CRUD with per-user authorization
- Admin all-users task view with owner emails
- Status filtering, title search, pagination, and combined sorting
- Client-side validation and consistent API validation errors
- Loading, empty, and error states
- Optimistic complete/delete UI with rollback on failure
- Real-time task refreshes via WebSocket broadcasts
- Persisted auth state and persisted dark mode
- Dockerized local setup and CI pipeline
- Backend and frontend tests for auth, validation, realtime visibility, admin scope, and task UI behavior

## Assumptions And Trade-Offs

- JWTs are stored in local storage for assessment simplicity. A production consumer app should consider httpOnly refresh-token cookies.
- Admin access is opt-in via `ADMIN_EMAILS`, avoiding a public role selector during signup.
- An `activity_logs` table is included for future auditing, but the current UI does not expose activity history.
- File attachments are left as a future extension to keep the core assignment focused and reliable.
