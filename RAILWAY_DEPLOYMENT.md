# Railway Deployment Guide

## Prerequisites

- Railway account
- This repository connected to GitHub

## Services To Create

### 1. PostgreSQL Database

1. Create a Railway project.
2. Add a PostgreSQL database service.
3. Keep the database in the same Railway environment as the API service.

### 2. API Service

1. Add a new service from this GitHub repository.
2. Set the service root directory to `/services/api`.
3. Set the config file path to `/services/api/railway.toml`.
4. Confirm Railway is building with `services/api/Dockerfile`.
5. Generate a public Railway domain for this service.
6. Set the API variables listed below.
7. Deploy the service.

The API health check is `/health`. Do not use `/` because the API correctly returns `404` there.

### 3. Web Service

1. Add a second service from this GitHub repository.
2. Set the service root directory to `/apps/web`.
3. Set the config file path to `/apps/web/railway.toml`.
4. Confirm Railway is building with `apps/web/Dockerfile`.
5. Generate a public Railway domain for this service.
6. Set `NEXT_PUBLIC_API_BASE_URL` before deploying.
7. Deploy or redeploy the web service.
8. Go back to the API service, set `CORS_ORIGIN` to the final web URL, then redeploy the API.

The web health check is `/health`. Do not use `/` because the app redirects `/` to `/tasks`.

## Required Variables

### API

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<secure-random-string>
CORS_ORIGIN=https://<your-web-service>.up.railway.app
ADMIN_EMAILS=admin@example.com
UPLOAD_DIR=/data/uploads
ACCESS_TOKEN_TTL=24h
SHUTDOWN_TIMEOUT=10s
```

### Web

```text
NEXT_PUBLIC_API_BASE_URL=https://<your-api-service>.up.railway.app
```

`NEXT_PUBLIC_API_BASE_URL` is baked into the Next.js build, so redeploy the web service after changing it.

## Attachments

The default attachment adapter writes files to local disk and stores metadata in PostgreSQL.
For Railway, add a volume to the API service mounted at `/data` if uploaded files must survive redeploys.

## Troubleshooting

If the API deployment fails:

1. Confirm `/health` is the healthcheck path.
2. Confirm `DATABASE_URL` is present in the API service.
3. Confirm API logs contain `api listening`.
4. Confirm migrations are not failing in the logs.
5. Open `<API_URL>/health` and verify it returns `{"status":"ok"}`.

If the web app loads but signup/login/tasks fail:

1. Open browser devtools and check the API URL being requested.
2. Verify `NEXT_PUBLIC_API_BASE_URL` is the public API URL.
3. Redeploy the web service after changing `NEXT_PUBLIC_API_BASE_URL`.
4. Verify `CORS_ORIGIN` in the API service exactly matches the public web URL.
5. Redeploy the API service after changing `CORS_ORIGIN`.
