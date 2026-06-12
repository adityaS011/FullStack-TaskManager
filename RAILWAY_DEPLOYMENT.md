# Railway Deployment Guide

## Prerequisites
- Railway account
- This repository cloned locally

## Services to Create

### 1. PostgreSQL Database
1. In Railway, create a new project
2. Add a PostgreSQL database service
3. Note the database connection URL from Railway dashboard

### 2. API Service
1. Add a new service from the `services/api` directory
2. Use the `railway.toml` configuration in `services/api/`
3. Set the following environment variables:
   - `DATABASE_URL`: Use Railway's PostgreSQL connection URL (Railway provides this automatically via `DATABASE_URL` variable)
   - `JWT_SECRET`: Generate a secure random string
   - `CORS_ORIGIN`: Set to your Railway web app URL (e.g., `https://fullstack-taskmanager-production.up.railway.app`)
   - `ADMIN_EMAILS`: Set to admin email addresses
   - `UPLOAD_DIR`: Set to `/data/uploads`
   - `ACCESS_TOKEN_TTL`: Set to `24h`
   - `SHUTDOWN_TIMEOUT`: Set to `10s`
4. Deploy the service
5. Note the API service URL from Railway dashboard

### 3. Web Service
1. Add a new service from the `apps/web` directory
2. Use the `railway.toml` configuration in `apps/web/`
3. Set the following build environment variable:
   - `NEXT_PUBLIC_API_BASE_URL`: Set to your Railway API service URL (e.g., `https://api-production.up.railway.app`)
4. Deploy the service

## Important Notes

- The API service uses the Dockerfile ENTRYPOINT, so no startCommand is needed in railway.toml
- The web service uses Next.js standalone output, so `node server.js` is the correct start command
- The `NEXT_PUBLIC_API_BASE_URL` must be set as a build environment variable in Railway
- Railway automatically provides the `DATABASE_URL` environment variable for the PostgreSQL service
- Make sure CORS_ORIGIN in the API includes your web app URL

## Troubleshooting

If the web app shows a loading spinner:
1. Check that the API service is running and accessible
2. Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly in the web service
3. Check that `CORS_ORIGIN` in the API service includes the web app URL
4. Check Railway logs for both services
