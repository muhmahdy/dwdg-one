# Database (Supabase PostgreSQL)

Design and rationale: [docs/database/database-design.md](../docs/database/database-design.md). Access rules in words: [policies/RLS_RULES.md](policies/RLS_RULES.md).

## Layout

| Path | What it is |
|---|---|
| `schema/schema-spec.mjs` | The one file to edit to change tables, keys or policies |
| `schema/generated/tables.json` | Table list for tools (generated) |
| `migrations/20261012000100_foundation.sql` | Divisions, `people`, helper functions (`app.*`), the people guard, `link_current_user()`, `invite_preview()`, the invite-only sign-in hook |
| `migrations/20261012000200_workspace_tables.sql` | The other tables, indexes, foreign keys and RLS (**generated**) |
| `migrations/20261012000300_load_and_save.sql` | `load_workspace()`, `apply_changes()`, `import_workspace()` (**generated**) |
| `policies/RLS_RULES.md` | Who can see and change what, and what the database does not enforce |
| `tests/shape.test.mjs` | Offline design checks: the app's workspace becomes rows and comes back unchanged |
| `tests/rls_smoke.sql` | 61 access-rule checks, plain SQL, for a scratch database only |
| `seeds/` | Demo data for development projects (never production) |
| `backups/` | Local backup location and procedure ([backups/README.md](backups/README.md)); dumps are git-ignored |

Setting up the projects for real, step by step: [docs/deployment/H0-CHECKLIST.md](../docs/deployment/H0-CHECKLIST.md). `npm run db:bundle` writes one SQL file per project (`database/bundles/<project>.sql`, not committed) to paste into a new, empty project's SQL editor.

## Hub and division projects (stage H1 of the multi-Supabase plan)

The same tables, split over one **hub** project and six **division** projects ("spokes"). Plan: [.planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md](../.planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md). **The app still uses the single-database migrations above** by default (`VITE_DATA_MODE=supabase`); `bff` mode reads the hub and division projects through [`server/`](../server/README.md). Nothing below is applied to a real project yet (verified in PGlite only); setup is in the H0 checklist.

| Path | What it is |
|---|---|
| `hub/migrations/…000100_hub_foundation.sql` | The foundation above without `app.hr_reviews` (**generated** from it) |
| `hub/migrations/…000200_hub_tables.sql` | The 23 core, account and performance tables plus `store_values`, with the same RLS as today (**generated**) |
| `hub/migrations/…000300_hub_load_and_save.sql` | `load_workspace()`, `apply_changes()` for the hub's tables (**generated**) |
| `hub/migrations/…000400_hub_registry.sql` | `divisions.is_active / is_sensitive / schema_version`, `division_progress`, `audit_log` (hand-written) |
| `spoke/base/migrations/…000100_spoke_base.sql` | Identical in all six division projects: `schema_meta`, `row_tables`, `store_values`, `load_rows()`, `apply_rows()` (hand-written) |
| `spoke/<division>/migrations/…000200_<division>_tables.sql` | That division's tables: RLS on, **no policy**, no grant to `anon` / `authenticated` (**generated**) |
| `schema/generated/partition.json` | Where each table and stored value lives, and the foreign keys that had to go (only `sng_initiatives.project`) |
| `tests/partition.test.mjs` | Offline checks: one home per table, no foreign key across projects, pieces merge back into the whole workspace, generated SQL has no policy in a division project |
| `tests/rls_smoke_hub.sql` | `rls_smoke.sql` without the division-table checks plus checks for the hub's new tables (**generated**) |
| `tests/spoke_smoke.sql` | For any division project: the browser's roles read and write nothing; the service role saves, loads, repeats a save and deletes |

Apply order for a division project: the base file, then that division's file (their timestamps sort that way). Each table's home comes from its name prefix (`hr_`, `sng_`, `ee_`, `cons_`, `fnl_`, `mcit_`), or from a `home` set in `schema-spec.mjs`; everything else is the hub's.

Tools live in `scripts/database/`: `build-sql.mjs` regenerates migrations 2 and 3, the hub and division files and `rls_smoke_hub.sql` from the spec, `move-data.mjs` moves a saved workspace into Supabase, and `export-demo-db.mjs` produces the fully populated demo workspace.

## Set up a Supabase project

1. Create a project at supabase.com. Under Authentication → Providers → Google, enable Google and add the client id and secret from Google Cloud. Under Authentication → URL configuration, set the site URL to the app URL and add `<app URL>/auth/callback` as a redirect URL.
2. Apply the migrations in order: paste the three files into the dashboard's SQL editor (1, then 2, then 3), or run `psql "$DATABASE_URL" -f database/migrations/<file>` for each.
3. Under Authentication → Hooks → **Before User Created**, choose type "Postgres function" and select `private.before_user_created`. From then on, only invited e-mail addresses can create an account.
4. Name the first administrator, once, in the SQL editor:
   `insert into private.bootstrap_settings (key, value) values ('first_admin_email', 'you@example.com');`
5. Copy `frontend/.env.example` to `frontend/.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Change the schema

```bash
# edit database/schema/schema-spec.mjs, then:
node scripts/database/build-sql.mjs
node --test database/tests/shape.test.mjs
```

Never edit a migration that has been applied to a hosted project. After the first deployment, a change becomes a **new** dated migration file; the generator then needs a target file name for the new migration.

## Move data

`move-data.mjs` cuts one workspace along the hub and division line and moves each piece to its project. One project is one transaction; there is none across projects, so a run that stops half way is simply run again (saving is idempotent). It never deletes anything.

```bash
# 1. Check. No network. Rows per project and table, and the proof that nothing would be lost: every part has a table,
#    ids are unique, references are valid (inside a project and between projects), the data rebuilds identically.
node scripts/database/move-data.mjs --input export.json        # a saved workspace
node scripts/database/move-data.mjs --demo                     # or the built-in demo data

# 2. Look first. Reads the projects (writes nothing) and says what each holds and what a move would add or change.
node --env-file=scripts/.env.local scripts/database/move-data.mjs --demo --target all

# 3. Move. Writes each named project, reads it back, compares every row (key order included). Exit code 1 if anything differs.
node --env-file=scripts/.env.local scripts/database/move-data.mjs --demo --target hub --apply --emails emails.json
node --env-file=scripts/.env.local scripts/database/move-data.mjs --demo --target spoke:hr,spoke:fnl --apply
```

`--target` is `hub`, `spoke:<ee|mcit|hr|fnl|sng|cons>`, a comma list, `all`, or `legacy` (today's single database, every table in one project). `--apply` needs an explicit `--target`. Each project needs `SUPABASE_URL_<P>` and `SUPABASE_SERVICE_KEY_<P>` in `scripts/.env.local` (template: `scripts/.env.example`); two projects with the same address are refused.

A project that already holds rows the source does not have is not touched (the extra rows are named) unless you add `--allow-extra`. A reference between projects that points at a record that is not there (a foreign key can no longer catch it, for example `sng_initiatives.project`) stops the move unless you add `--allow-dangling`.

`emails.json` links people to Google accounts: `{ "mahdy": "name@example.com", ... }`; it goes to the hub only. The demo data contains 41 invented people. Load it only into a development project. The move is tested against real migrations (`server/tests/parity/move-data.test.ts`: the hub and six division projects, written through `import_workspace` / `apply_rows`, read back through `load_workspace` / `load_rows`).

## Check it

```bash
node --test database/tests/shape.test.mjs                      # design checks, offline
psql "$SCRATCH_DATABASE_URL" -f database/tests/rls_smoke.sql   # access rules, scratch database only
```

The smoke test runs inside one transaction and rolls back, but it creates users and rows while it runs, so never point it at production.
