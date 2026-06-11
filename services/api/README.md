# API Service

Go REST API for authentication and task management.

## Navigation Guide

```text
cmd/api/main.go         Entrypoint, dependency wiring, graceful shutdown
internal/config         Environment parsing and defaults
internal/database       PostgreSQL connection and embedded migrations
internal/auth           User repository, password hashing, JWT issuing/validation
internal/task           Task domain service, validation, and PostgreSQL repository
internal/realtime       WebSocket hub for live task mutation events
internal/httpx          Router, middleware, request handlers, response shape
internal/validation     Shared validation helpers
```

## Request Flow

1. `cmd/api/main.go` loads config, connects to Postgres, runs migrations, and builds services.
2. `httpx/router.go` maps routes, applies auth/admin middleware, and exposes `/ws/tasks`.
3. Handlers decode JSON/query params and call the domain service.
4. Services validate/normalize inputs and enforce behavior.
5. Repositories execute PostgreSQL queries and return domain models.
6. Successful task mutations publish WebSocket events to affected members and admins.

Admin users are assigned through `ADMIN_EMAILS`. They can call `GET /admin/tasks` to list all users' tasks with owner email metadata.

## Run

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/vector_tasks?sslmode=disable" \
JWT_SECRET="local-development-secret" \
CORS_ORIGIN="http://localhost:3000" \
go run ./cmd/api
```
