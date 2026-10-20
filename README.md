# DWDG UII Workspace

DWDG Workspace is an internal work system for projects, tasks, schedules, documents, decisions, blockers, and six division workflows. The app is React + TypeScript + Tailwind (Vite), backed by Supabase PostgreSQL.

The data layer is moving from one Supabase project to a **hub and six division projects** behind a small server. The code for every stage is written and tested without Supabase (PGlite and unit tests); **nothing has run against real Supabase projects yet**. The owner steps are in [docs/deployment/H0-CHECKLIST.md](docs/deployment/H0-CHECKLIST.md).

## Data architecture

```
Browser ──(sign-in only)──────────────► Supabase Auth (hub)
   │
   └─ /api/* ─► server (Hono, Node 24) ─► Hub project      core tables, people, accounts, audit_log
                                       ├─► Spoke sng       Strategy & Growth
                                       ├─► Spoke fnl       Finance & Legal      (sensitive)
                                       ├─► Spoke hr        Human Resource       (sensitive)
                                       ├─► Spoke mcit      Marketing, Communication & IT
                                       ├─► Spoke ee        External Engagement
                                       └─► Spoke cons      Consulting
```

- **Hub** holds the shared work tables (tasks, projects, meetings, programs), `people`, accounts and invitations, `division_progress` and `audit_log`. It keeps row level security; the person's own token is used for hub reads and writes.
- **Division projects ("spokes")** hold only that division's tables. They have RLS on and **no policy**: the browser's roles read and write nothing. Only the server, with the service key, reaches them, and it checks every row against the same rules the database used to apply (`server/src/lib/policy/`).
- **Server** holds every spoke URL and service key. Routes: `/api/health`, `/me`, `/workspace`, `/changes`, `/audit`, `/cron/ping`. See [server/README.md](server/README.md).
- A save that touches several projects has no cross-project transaction. If a division fails after another project saved, the server answers `502 partial_save` and the browser reloads. Saving is idempotent, so a repeat is safe.

Decisions M25 to M35 in [docs/architecture/decision-log.md](docs/architecture/decision-log.md) record why (the server replaces M5, "no dedicated backend").

### Data modes

`VITE_DATA_MODE` in `frontend/.env.local`:

| Mode | Records come from | Use |
|---|---|---|
| `supabase` (default) | The browser asks one Supabase project directly (single-database migrations) | Today's behaviour, until the cutover |
| `bff` | The server in `server/`, hub + spokes | Target; needs the H0 projects |
| `demo` | In-memory demo workspace and persona picker | Development (`npm run dev:demo`) |

Sign-in always uses Supabase. Service keys never go in a `VITE_` variable.

## Run locally

From this directory (PowerShell):

```powershell
npm.cmd install
npm.cmd run dev          # frontend; add VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env.local
npm.cmd run dev:demo     # frontend with the in-memory demo workspace, no Supabase needed
npm.cmd run dev:server   # the server (bff mode); Vite proxies /api to it
```

Open the address Vite prints (usually `http://127.0.0.1:5173/`).

## Database commands

| Command | What it does |
|---|---|
| `npm run db:build-sql` | Regenerates the single-database and hub/spoke migrations, `partition.json` and the smoke tests from `database/schema/schema-spec.mjs` |
| `npm run db:test` | Offline checks: shape, partition (one home per table, no foreign key across projects), personal data |
| `npm run db:bundle` | One SQL file per project in `database/bundles/` (not committed), to paste into a new, empty project |
| `npm run db:personal-data -- --demo` | Scans HR and Finance & Legal records for identity numbers, bank accounts, pay, e-mail and phone. Run on a real export before it enters those projects |
| `npm run backup:db` | Encrypted backup of all seven projects (also weekly via `.github/workflows/backup.yml`) |
| `node scripts/database/move-data.mjs …` | Moves a saved workspace into the hub and spokes; check, look first, then `--apply` with row-for-row read back. Never deletes |

To change the schema, edit `database/schema/schema-spec.mjs` only, then `npm run db:build-sql`. Never edit a migration already applied to a hosted project: after the first deployment a change is a new dated migration. Details: [database/README.md](database/README.md).

## Tests

```powershell
npm.cmd test             # frontend, server, database, backup and deploy tests
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

## Where things live

```
frontend/   React app (src/), prototype/ (clickable reference prototype)
server/     Hono server in front of the hub and the six division projects
database/   schema/ (spec), migrations/ (single DB), hub/, spoke/<division>/, policies/, tests/, backups/, seeds/
backend/    documentation only (the server lives in server/)
scripts/    database/ (build-sql, move-data, bundle), backup/, deploy/
docs/       architecture/, database/, deployment/, audit/, development/
.planning/  PRD workspace, workstreams, design system, ERP-MULTI-SUPABASE-MIGRATION-PLAN.md
.github/    workflows: keepalive.yml (pings every project), backup.yml
```

## Setting up the projects

Step by step in [docs/deployment/H0-CHECKLIST.md](docs/deployment/H0-CHECKLIST.md) (record results in [LOG.md](docs/deployment/LOG.md)); hosting the server in [docs/deployment/SERVER.md](docs/deployment/SERVER.md). Still open for the owner: creating the seven Supabase projects, naming the backup admin, repository secrets (`SERVER_URL`, `CRON_SECRET`, `DATABASE_URL_*`, `BACKUP_ENCRYPTION_KEY`), MFA and Auth rate limits, the server host, and off-GitHub backup storage. The cutover (H8) switches the default to `bff` after a verified backup.

## Specification and planning

Implementation agents start with [READ_FIRST](READ%20THIS%20IMPORTANT%20FOR%20EVERY%20AI/DWDG_Experience_v1.0/READ_FIRST.md) and [AGENTS.md](AGENTS.md). The experience pack there (specification, reference atlas, design tokens, acceptance contract) is the visual target. Architecture: [docs/architecture/architecture.md](docs/architecture/architecture.md). Gaps against the prototype: [docs/audit/prototype-gap.md](docs/audit/prototype-gap.md). PRD and planning state: [.planning/dwdg-one-prd/](.planning/dwdg-one-prd/README.md).
