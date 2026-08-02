# Deploying QuantiX

Two independent pieces to deploy: the backend API (`backend/`) and the
frontend SPA (`frontend/`). They can live on different platforms — that's
normal and is what this guide assumes.

## Prerequisites

Before deploying anywhere:
1. `git rm --cached backend/.env backend/data/retail.sqlite` and commit —
   these must never be in the repo (see the security note at the bottom).
2. Generate a real `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   — save this somewhere, you'll paste it into the backend's env vars.
3. Push `database/` (migrations) — this is what provisions your production schema.

## 1. Backend — Render.com (recommended, has a free Postgres tier)

1. Push your repo to GitHub if you haven't.
2. In Render: **New > PostgreSQL** — create a database, copy its **Internal Database URL**.
3. **New > Web Service** — connect your repo, set:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm run db:migrate && npm start`
   - Environment variables:
     | Key | Value |
     |---|---|
     | `NODE_ENV` | `production` |
     | `JWT_SECRET` | (the value you generated above) |
     | `DATABASE_URL` | (the Postgres URL from step 2) |
     | `FRONTEND_URL` | your deployed frontend URL (set this after step 2 below, then redeploy) |
4. Deploy. Check `https://<your-service>.onrender.com/api/health` returns `{"status":"ok"}`.
5. Seed demo data once, from your machine, pointed at production:
   ```bash
   DATABASE_URL=<paste-external-db-url> NODE_ENV=production node backend/src/utils/seed.js
   ```

*Railway or Fly.io work the same way — provision Postgres, set the same env vars, same build/start commands.*

## 2. Frontend — Vercel (recommended)

1. Import the repo in Vercel, set **Root Directory** to `frontend`.
2. Framework preset: Vite. Build command: `vite build`. Output dir: `dist`
   (already configured in `frontend/vercel.json`, including the SPA rewrite
   so client-side routes like `/dashboard` don't 404 on refresh).
3. Environment variables (Project Settings > Environment Variables):
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |
   | `VITE_FIREBASE_API_KEY` etc. | only if you use Google sign-in |
4. Deploy. Go back to Render and set `FRONTEND_URL` to this Vercel URL, then redeploy the backend so CORS allows it.

*Netlify works the same way — same build command/output dir, same env vars, add a `_redirects` file with `/* /index.html 200` instead of `vercel.json`.*

## 3. Alternative — self-host everything with Docker

If you'd rather run this on your own VM instead of Render/Vercel:

```bash
cp backend/.env.example backend/.env   # edit JWT_SECRET
docker compose up --build
```

This runs Postgres + backend (port 4000) + frontend (port 3000) together —
see `docker-compose.yml` at the repo root. Point your reverse proxy /
domain at whichever ports you expose.

## Post-deploy checklist

- [ ] `/api/health` returns 200 on the deployed backend
- [ ] Logging in on the deployed frontend actually reaches the deployed backend (check Network tab — should NOT be hitting `localhost`)
- [ ] CORS isn't wide open (`FRONTEND_URL` is set, not left as the dev default)
- [ ] `JWT_SECRET` is a real random value, not the placeholder
- [ ] The committed `backend/.env` and `.sqlite` file from before are gone from git history / the Gemini key in them has been revoked
