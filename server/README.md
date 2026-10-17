# Server

The server in front of the hub and the six division Supabase projects. Decision [M25 and M26](../docs/architecture/decision-log.md), plan [.planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md](../.planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md) (stage H2 of H0 to H8). A [Hono](https://hono.dev) app that runs on Node 24 without a build step (TypeScript is stripped natively), so the same `createApp()` can later sit behind Vercel Functions or Cloudflare.

**Where it stands (stage H7):** it serves the hub and all six divisions: Strategy & Growth (`sng`), Marketing, Communication & IT (`mcit`), External Engagement (`ee`), Consulting (`cons`), Human Resources (`hr`) and Finance & Legal (`fnl`). The browser can use it with `VITE_DATA_MODE=bff`; the default is still `supabase` (the browser asks Supabase directly), so nothing changes until someone switches. A division is served only when every one of its tables has an access rule in `src/lib/policy/`; today that is all six; a table added to the schema without a rule makes its whole division report `unavailable` until the rule is written (`tests/policy-coverage.test.ts` fails first) and none of its rows leave the server.

## Rules this code keeps

- The browser keeps Supabase **only for signing in**. Every record goes through `/api/*`.
- Every request carries the person's own access token. The server checks it with the hub's Auth service (`getUser`, never decoded locally) and reads the role from the hub, never from the request.
- Reads and writes of the core tables run **as the person**: their token goes to the hub, so the hub's row level security keeps deciding what they may see and change.
- The service role is used for `audit_log` and the health check. Division service keys exist only in this server's environment (`lib/divisions/client.ts`); a division project has no row level security of its own, so every division row is checked in `lib/policy/` against the same rule the database used to apply, before it is returned or written.
- Errors reach the client as a short code (`forbidden`, `invalid_input`, `division_unavailable`, `internal_error`). Messages from the database stay in the server log.
- A division without settings is "not connected", never an error at start-up.

## Routes (all under `/api`)

| Route | Needs sign-in | What it does |
|---|---|---|
| `GET /health` | no | Is the server up, and which divisions have settings. No network calls, no secrets |
| `GET /me` | yes | The person as the hub knows them (linked, role, division, rank) and each division's status |
| `GET /workspace` | yes | `{ rows, divisions }`: the hub's rows (filtered by the hub's RLS) plus the rows of each served division project (filtered here, row by row), in the shape of `load_workspace()`, and the division statuses. A division that cannot be read answers `unavailable` and the rest still loads |
| `GET /audit` | Admin or President | The newest lines of `audit_log` (`?limit=1..200`, `?division=`). The log is written by the server alone |
| `GET /cron/ping` | `CRON_SECRET` | The scheduled job: asks the hub and every connected division project one small question (so the free tier does not pause them) and saves each division's task counts as `division_progress`. Answers 200 with `ok: false` when something did not answer, so the scheduler can alert. Switched off (503) while `CRON_SECRET` is not set |
| `POST /changes` | yes | `{ changes: { table: { upsert: [{id,pos,doc}], delete: [id] } } }`. Validates and sorts each table to its project. Refuses the whole set before writing anything when a division it touches is not served (409 `division_unavailable`) or a division row is not allowed (403 `forbidden`). Then saves the hub as the person, then the division projects in parallel. If a division project fails after another project saved: 502 `partial_save` with `applied` and `failed`, and the browser reloads what the server holds |

Division status: `ok` (connected, switched on, has access rules), `not_configured` (no settings here), `inactive` (settings, but `divisions.is_active` is off in the hub), `unavailable` (switched on, but no access rules yet, or the project did not answer).

## Limits, audit and the scheduled jobs (stage H6)

- **Rate limits** (`lib/ratelimit.ts`): per person, 240 saves and 30 loads a minute, 30 audit reads; per address, 30 refused tokens or secrets a minute, after which that address gets 429 `rate_limited` with `Retry-After`. Accepted requests are never counted per address, so an office behind one network is not blocked. The default counter is this process's memory; with several server instances (a serverless host) give `createApp()` a limiter backed by a shared store (Upstash Redis): it needs two methods, `hit` and `count`. Sign-in itself is Supabase Auth's: set its rate limits in the dashboard (Authentication, Rate Limits).
- **Access audit** (`lib/access/audit.ts`): a save that changes who may do what is written to `audit_log` with who did it: a change of `role`, `div`, `admin`, `board` or `status` of a person (old and new value), a person added or removed, and any write to `acct_invites`, `acct_grants`, `acct_memberships`, `acct_actions`, `acct_handovers`, `acct_hidden`. Ids and those fields only: no names, e-mail addresses or phone numbers. Whether the change is allowed is still decided by the hub (its policies and the people guard), which already carry the spec's matrix; the server records it. The app's own account screens are unchanged, because they save through `/api/changes` like everything else.
- **Sensitive divisions** (`lib/access/sensitive.ts`): HR and Finance & Legal (and any division the hub marks `is_sensitive`) write an `access.sensitive` line to the audit log whenever they hand a person records (`op: read`, how many) or change records (`op: write`, tables and counts). A person who is shown nothing of a sensitive division leaves no line, so the log records who SAW or CHANGED personal data and does not fill with everyone opening the app; refused saves are written as `changes.denied`. Lines hold counts and table names, never content. The dashboard does not need these divisions' records: it reads `division_progress`, which holds counts only.
- **Personal data check**: `npm run db:personal-data -- --demo` (or `--input export.json` on an export of the real workspace) scans the records of HR and Finance & Legal for identity numbers, tax numbers, bank accounts, pay, identity documents, e-mail addresses and phone numbers, by field name and by the shape of the value, and lists who holds authority over the two divisions. It prints where and what, never the value. Run it on the real data before it goes into the HR and FnL projects.
- **Scheduled jobs**: `.github/workflows/keepalive.yml` calls `/api/cron/ping` on Mondays and Thursdays and fails when anything did not answer; `.github/workflows/backup.yml` makes the weekly encrypted backups of all seven projects (`database/backups/README.md`). Repository secrets: `SERVER_URL`, `CRON_SECRET`, `DATABASE_URL_*`, `BACKUP_ENCRYPTION_KEY`.
- **Headers of the browser app**: `frontend/vercel.json` sets the Content-Security-Policy (the app's own scripts only, connections only to itself and Supabase, no framing), `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS, and rewrites every page path to `index.html` except `/api` and the built files. If the browser calls the server on another origin (`VITE_API_URL`), add that origin to `connect-src`. The API's own responses carry their headers from `secureHeaders()` and `Cache-Control: no-store`.

## Run it in production

One container, one process, on a small host (Render, Railway, Fly, or your own server): `server/Dockerfile` (build from the repository root), `render.yaml`, `server/fly.toml`, and the step by step in [docs/deployment/SERVER.md](../docs/deployment/SERVER.md). The entry is `src/main.ts` (`npm run start -w server`): it listens on `PORT`, answers `GET /api/health` for the host's health check, and stops cleanly on SIGTERM. `scripts/deploy/set-api-origin.mjs` makes the static app forward `/api` to it.

## Run it

```bash
cp server/.env.example server/.env.local     # fill in the hub URL and keys
npm run dev:server                           # http://127.0.0.1:8787/api
npm run dev                                  # in frontend/.env.local set VITE_DATA_MODE=bff; Vite proxies /api to the server
```

The hub project must have the single-database migrations or the hub migrations applied (`database/README.md`). The hub's `divisions.is_active` column comes with `hub/migrations/…_hub_registry.sql`; without it every division counts as inactive.

## Check it

```bash
npm run test -w server        # 1897 tests (about 45 s), no network: routes with a stand-in hub, the real gateway against a stand-in Supabase, and the parity tests (a real Postgres in this process)
npm run typecheck -w server
npm run lint -w server
```

`tests/parity/` runs the database's own helper functions and row level security policies in PGlite (Postgres in this process) next to the TypeScript rules, over a cast of 21 people and over the app's 41 demo people, and requires the same answer for every person, for reading, saving (the app's upsert, through `apply_changes`) and deleting (`helpers`, `sng`, `mcit`, `ee`, `cons`, `hr`, `fnl`, `demo`). `divisions.e2e.test.ts` goes further: the demo workspace is loaded once into the single-database schema (the truth) and once into four real division projects behind the server, and for all 41 people `GET /api/workspace` must return exactly the rows the database's policies give them, and a save must be accepted exactly when the database would store it. `division.e2e.test.ts` runs the whole server on a real division project (the spoke migrations in PGlite, reached through `load_rows` / `apply_rows` as the service role). Each comparison also checks that both outcomes happen, so it cannot pass by comparing two empty answers.

`tests/gateway.test.ts` runs the real supabase-js client against a local HTTP stand-in and checks whose key goes with each call. `tests/isolation.test.ts` reads the browser app's source and fails if it names a server variable or imports from here. The browser's lint also forbids importing the server.

## Layout

```
src/app.ts                     createApp(): middleware, error codes, the sign-in gate, routes
src/main.ts                    production entry: settings from the environment, all interfaces, clean stop on SIGTERM
src/dev.ts                     development entry (this machine only, reads .env.local)
src/start.ts                   starts and stops the HTTP server around an app (shared by both entries)
src/config.ts                  hub settings (only the hub is required)
src/generated/partition.ts     which table lives where (GENERATED by scripts/database/build-sql.mjs)
src/lib/divisions/             registry (settings per division), db(slug), status
src/lib/hub/gateway.ts         everything asked of the hub, behind an interface
src/lib/auth/principal.ts      who is asking: token check, role, rank, projects led
src/lib/auth/rules.ts          the database's helper functions (sees_div, unit_lead, hr_lead, ...) over a Principal
src/lib/policy/                access rule per division table (sng, mcit, ee, cons, values), index.ts says which tables are covered; types.ts holds mayRead / mayWrite / mayUpsert / mayDelete
src/lib/spoke/                 gateway (load_rows / apply_rows as the service role) and service (read and authorize per row)
src/lib/audit.ts               audit_log writes that never change an answer
src/lib/workspace/partition.ts keepHubRows, splitChanges
src/lib/ratelimit.ts            rate limiter (memory by default) and the middleware
src/lib/cron/keepalive.ts      what the scheduled job does
src/lib/access/audit.ts        audit of changes of authority
src/routes/                    health, cron, me, workspace, changes, audit
```

## Not done yet

- The deployed entry file and its host (open decision; Hono runs on Vercel Functions or Cloudflare).
- A shared-store rate limiter for a multi-instance deployment (the host runs one copy for now).
- The first real run of the scheduled jobs, a real backup and a restore drill (they need the Supabase projects).
