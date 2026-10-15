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

Tools live in `scripts/database/`: `build-sql.mjs` regenerates migrations 2 and 3 from the spec, `move-data.mjs` moves a saved workspace into Supabase, and `export-demo-db.mjs` produces the fully populated demo workspace.

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

```bash
# 1. Look first. No network, nothing is written. Fails if anything would be lost.
node scripts/database/move-data.mjs --input export.json        # a saved workspace
node scripts/database/move-data.mjs --demo                     # or the built-in demo data

# 2. Write it in one transaction, then count rows per table and read everything back to compare.
node --env-file=scripts/.env.local scripts/database/move-data.mjs --demo --apply --emails emails.json
```

`emails.json` links people to Google accounts: `{ "mahdy": "name@example.com", ... }`. The demo data contains 41 invented people. Load it only into a development project.

## Check it

```bash
node --test database/tests/shape.test.mjs                      # design checks, offline
psql "$SCRATCH_DATABASE_URL" -f database/tests/rls_smoke.sql   # access rules, scratch database only
```

The smoke test runs inside one transaction and rolls back, but it creates users and rows while it runs, so never point it at production.
