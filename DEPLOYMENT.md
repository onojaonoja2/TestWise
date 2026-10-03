# Railway Deployment Guide

> **Secrets rule:** real credentials live ONLY in the Railway dashboard,
> the Vercel dashboard, and your local ignored `.env` / `.env.local`.
> Never paste real values into this file, chat logs, or git commits.
> `.env.example` documents key names with placeholders only.

## Overview

| Layer | Host |
|---|---|
| Next.js app + API routes (BullMQ producer) | Vercel (unchanged) |
| Background worker (`workers/document-worker.ts`, BullMQ consumer) | Railway service (moved off Render) |
| Redis (job queue) | Railway Redis plugin (moved off Render) |
| PostgreSQL (with **pgvector**) | Railway pgvector template (moved off Aiven) |
| Document storage | AWS S3 (unchanged) |
| AI | OpenRouter (unchanged) |

Target Railway project (example name `testwise`) holds three services:
`Postgres (pgvector template)` + `Redis` + `worker`.

No `railway.toml` is used on purpose: Railway's config-as-code is
deprecated (EOL 2026-12-01). Service settings below are configured once
in the dashboard; code changes deploy automatically from GitHub.

---

## Part 0: Rotate the exposed credentials (do this first)

The previous version of this guide contained live secrets. Treat all of
them as compromised and rotate before cutover:

1. **`NEXTAUTH_SECRET`** — generate a fresh one and store it in Railway
   (worker) + Vercel (app). Example generation only — run locally:
   `openssl rand -base64 32`. Note: rotating signs out every session.
2. **AWS IAM keys** (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) —
   create a new access key pair limited to the S3 bucket, update Railway
   + Vercel, then **deactivate and delete the old pair** in IAM.
3. **Aiven credentials** — retire by deleting the Aiven project only
   AFTER the migration is verified (Part 3) and a backup exists.
4. **`DATABASE_URL` / `REDIS_URL`** — replaced wholesale by the new
   Railway service URLs (Parts 1–3). Nothing to rotate, just swap.

## Part 1: Provision Railway

### Step 1: Create the project

1. Railway dashboard → **New Project** → **Empty Project**, name it
   e.g. `testwise`. Connect it to the GitHub repo (used by the worker
   service in Step 3).

### Step 2: PostgreSQL with pgvector (NOT the standard plugin)

Railway's standard Postgres image does **not** ship pgvector, and this
schema needs it (`DocumentChunk.embedding` is `vector(1536)`).

1. In the project click **+ New** → **Database** → deploy the
   **pgvector / Postgres-with-pgvector template**.
2. Open the database service → **Variables** tab. You will see both a
   private `DATABASE_URL` (e.g. `postgres://…@postgres.railway.internal…`)
   and a public URL. Keep both handy — nothing goes in this file.
3. Run once against the new database (Railway query tab or local
   `psql` with the public URL):
   `CREATE EXTENSION IF NOT EXISTS vector;`
   If this fails, you deployed the wrong template — start over with the
   pgvector one.

### Step 3: Redis plugin

1. **+ New** → **Database** → **Add Redis**.
2. Open the Redis service → **Variables**: note the private `REDIS_URL`
   (for the worker) and the public URL (for Vercel, which cannot reach
   Railway's private network).

### Step 4: Worker service

1. **+ New** → **GitHub Repo** → select the TestWise repo.
2. Service **Settings** → **Build**: set **Dockerfile Path** to
   `workers/Dockerfile` (auto-detection only finds a root Dockerfile,
   and ours lives under `workers/`).
3. **Settings** → **Deploy**:
   - Start Command: `npm run worker` (matches the Dockerfile `CMD`).
   - Restart Policy: `On Failure` (default is fine).
   - No healthcheck path — the worker exposes no HTTP port; Railway
     marks the deployment Active once the container starts. Healthy
     logs show `[Worker] Document processing worker started`.
4. **Variables** tab — set every key (values from your consoles only):

   | Key | Value source |
   |---|---|
   | `DATABASE_URL` | Reference the Postgres service, e.g. `${{Postgres.DATABASE_URL}}` (private URL — same-environment traffic stays internal) |
   | `REDIS_URL` | Reference the Redis service, e.g. `${{Redis.REDIS_URL}}` (private URL) |
   | `NEXTAUTH_SECRET` | Freshly rotated secret (Part 0) |
   | `AWS_ACCESS_KEY_ID` | New IAM key (Part 0) |
   | `AWS_SECRET_ACCESS_KEY` | New IAM secret (Part 0) |
   | `AWS_REGION` | Your bucket region |
   | `S3_BUCKET_NAME` | Your documents bucket |
   | `OPENROUTER_API_KEY` | Your OpenRouter key (AI generation runs in the app, but keep worker + app in sync) |
   | `OPENROUTER_MODEL` | Model id |
   | `NODE_ENV` | `production` |
   | `WORKER_CONCURRENCY` | `4` default; lower to `1`–`2` on small plans to cut memory |
   | `NODE_OPTIONS` | Optional, e.g. `--max-old-space-size=4096` to match plan RAM. The npm script already allows a high ceiling; this only needs setting if you want a lower cap. |

5. Deploy and watch logs for the startup line plus no Prisma/Redis
   connection errors.

> Private vs public URLs: Railway-to-Railway traffic must use the
> **private** URLs (or `${{Service.VAR}}` references). Anything outside
> Railway (Vercel, your laptop, `psql`/`pg_dump`) must use the
> **public** URLs, appending `?sslmode=require` if the driver complains.

---

## Part 2: Migrate PostgreSQL (Aiven → Railway)

The repo has **no `prisma/migrations/` directory** — the schema was
built with `db push`. A dump/restore preserves all data; `db push` is
the fallback for an empty database.

### Option A: dump + restore (keeps all data — recommended)

Prerequisites on your machine: `pg_dump`, `psql`, `pg_restore`
(PostgreSQL client tools).

```powershell
$env:AIVEN_DATABASE_URL   = "<paste Aiven URL locally>"
$env:RAILWAY_DATABASE_URL = "<paste Railway PUBLIC URL locally>"
.\scripts\migrate-db-to-railway.ps1
```

The script enables `vector` on Railway, dumps Aiven
(`--no-owner --no-acl`, custom format, timestamped backup under your
OS temp dir), restores with `--clean --if-exists`, then compares row
counts on `User`, `Organization`, `Test`, `Submission`, `Document`.
Type `YES` only when prompted. Keep the dump file until cutover is
verified.

### Option B: fresh schema (empty database, no data)

```powershell
$env:DATABASE_URL = "<paste Railway PUBLIC URL locally>"
npx prisma db push
npx prisma generate
```

Then seed only if you want demo data — check
`prisma/seed-production.ts` idempotency first; seeding twice may
duplicate rows.

---

## Part 3: Rewire Vercel (frontend)

1. Vercel project → **Settings** → **Environment Variables**:
   - `DATABASE_URL` → Railway Postgres **public** URL
     (`?sslmode=require` if Prisma rejects the connection).
   - `REDIS_URL` → Railway Redis **public** URL (producer and worker
     must share the same logical Redis).
   - Refresh any rotated values (`NEXTAUTH_SECRET`, AWS keys,
     OpenRouter) so app and worker agree.
2. **Deployments** → **Redeploy** the latest deployment.

## Part 4: Verify end-to-end

1. **Worker logs** (Railway): startup line present, no connection
   errors, graceful `[Worker] Received SIGTERM, closing...` on redeploy.
2. **Document flow**: upload a document in the Vercel app → worker logs
   `Processing document` → `processed successfully` → status `READY`.
3. **AI generation**: run a question-generation session (OpenRouter +
   S3 + DB + queue cooperating).
4. **Monitoring writes**: submission heartbeats update `lastHeartbeat`
   without errors.
5. Let it bake **24–48h** before touching the old infra.

## Part 5: Decommission + repo cleanup

1. Delete the Render worker + Redis **only after** the bake period.
2. Export one final Aiven backup, then delete the Aiven project.
3. Delete the old IAM key pair (Part 0) once nothing references it.
4. `render.yaml` still describes the old Render setup — delete that
   file once Render is torn down so nothing can be accidentally
   re-provisioned from it.

---

## Troubleshooting

- **`extension "vector" is not available`** — wrong Postgres image;
  redeploy using the pgvector template, then `CREATE EXTENSION`.
- **Prisma `Can't reach database server`** from Vercel/laptop — you used
  the private URL externally; switch to the public URL (+
  `?sslmode=require`).
- **BullMQ jobs stall / `READONLY` / connection resets** — producer and
  worker must point at the SAME Redis; check both `REDIS_URL`s. For
  `rediss://` URLs the app enables TLS automatically
  (`lib/queue/connection.ts`).
- **Worker OOM-killed** — lower `WORKER_CONCURRENCY` to `1`–`2` and/or
  set `NODE_OPTIONS=--max-old-space-size=…` to fit the plan before
  raising the plan size.
- **Missing env at boot** — the worker fails fast listing the absent
  keys (`REDIS_URL`, `DATABASE_URL`, AWS/S3 vars). Add them in the
  Railway service Variables tab and redeploy.
- **Aiven firewall** — the dump runs from your machine, so no Railway
  IP allow-listing is needed; only the worker needs DB reachability,
  which private networking handles.

## Local development (unchanged)

- `docker-compose.yml` still provides local Redis
  (`redis://localhost:6379`).
- Copy `.env.example` to `.env` / `.env.local` and fill values locally.
  Both files are gitignored; only `.env.example` (placeholders) is
  committed.
