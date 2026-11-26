# DIP Dashboard

Monorepo for the Discover India Project dashboard (CSIT306).

```
client/   React + Vite single-page app
server/   Express API + PostgreSQL (pg), SQL migrations, seed script
.github/  CI workflow (job: lint-and-test) and PR template
render.yaml  Render Blueprint (Postgres + API + static site)
```

Sprint 5a enablers in this repo:

| Story | What is here |
|---|---|
| T1 | `.github/workflows/ci.yml` runs ESLint and tests for client and server on every pull request, applies migrations and seed against a real Postgres, and builds the client. ESLint configs in `client/` and `server/`. |
| T2 | `GET /health` in `server/src/app.js` runs `SELECT 1` on Postgres. `client/src/App.jsx` calls `VITE_API_URL/health` and shows the result. |
| T3 | `server/db/migrations/*.sql` create roles, themes, groups, users, roster_entries, group_assignments, itineraries and itinerary_legs (fields from A3 Figure 4). `server/scripts/seed.js` creates 16 test groups with reps, committee members, Fellows, assignments and two sample itineraries. |

## Run it locally

You need Node 20+ and either Docker or a local PostgreSQL 16.

```bash
# 1. Database
docker compose up -d                      # or create db "dip_dashboard" owned by user dip/dip yourself

# 2. API
cd server
cp .env.example .env
npm install
npm run db:setup                          # migrations + seed (safe to re-run)
npm run dev                               # http://localhost:3000/health

# 3. Web app (second terminal)
cd client
cp .env.example .env
npm install
npm run dev                               # http://localhost:5173
```

The page should say **API and database OK**. If it says *API unreachable*, the server is not running or `VITE_API_URL` is wrong. If it says *database unreachable*, check `DATABASE_URL`.

## Everyday commands

| Where | Command | Does |
|---|---|---|
| server | `npm run lint` / `npm test` | ESLint / Node test runner |
| server | `npm run migrate` | Apply new files in `db/migrations` |
| server | `npm run seed` | Insert test data (skips what exists) |
| client | `npm run lint` / `npm test` | ESLint / Vitest |
| client | `npm run build` | Production build into `client/dist` |
| root | `npm run lint` / `npm test` | Both packages |

## Adding a migration

Create the next numbered file, e.g. `server/db/migrations/005_tickets.sql`. Migrations are forward-only: never edit a file that is already on `main`; add a new one instead. The runner records applied files in `schema_migrations` and runs each file in its own transaction.

To start over locally: `docker compose down -v && docker compose up -d && cd server && npm run db:setup`.

## Seed accounts

All emails end in `@dip.example.test` (a reserved domain, so nothing is ever delivered).

| Role | Emails |
|---|---|
| head | `head@` |
| warden | `warden@` |
| committee | `committee1@` to `committee4@` (4 groups each) |
| fellow | `fellow1@` to `fellow4@` (4 groups each) |
| rep | `rep.g01@` to `rep.g16@` (one per group) |

G01 has an approved two-leg itinerary; G02 has one pending review.

## Workflow

1. Branch from `main`: `git checkout -b t2-health-page`.
2. Commit, push, open a pull request (the template asks which story it is).
3. CI job **lint-and-test** must pass and one teammate must approve before merge. Direct pushes to `main` are blocked.
4. Merging to `main` deploys to Render automatically.

## Deploy (Render)

`render.yaml` describes three resources: `dip-db` (Postgres), `dip-api` (Express), `dip-web` (static React build). Create them with **New > Blueprint** in Render, then set:

- `dip-api` → `CORS_ORIGIN` = the `dip-web` URL
- `dip-web` → `VITE_API_URL` = the `dip-api` URL (then redeploy `dip-web`, because Vite bakes it in at build time)

The API runs migrations on every start, and the seed while `SEED_ON_START=true`. Set it to `false` before any real data goes in.

Free-tier caveats: the free web service sleeps after 15 minutes idle (the first request then takes about a minute), and Render's free Postgres expires after 30 days. A3 chose an always-on instance for production; the free tier is fine for this walking skeleton.

## Environment variables

| Name | Where | Example |
|---|---|---|
| `DATABASE_URL` | server | `postgres://dip:dip@localhost:5432/dip_dashboard` |
| `DATABASE_SSL` | server | `true` only when connecting to a hosted DB from outside its network |
| `PORT` | server | `3000` |
| `CORS_ORIGIN` | server | `http://localhost:5173` (comma-separate several) |
| `SEED_ON_START` | server (Render) | `true` / `false` |
| `VITE_API_URL` | client | `http://localhost:3000` |
