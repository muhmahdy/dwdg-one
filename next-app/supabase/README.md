# Supabase part of the migration (Stage 2)

Everything the database needs, written as plain SQL plus a few small Node scripts. Nothing here is connected to the Next.js app yet (that is Stage 3).

## What is in this folder

| Path | What it is |
|---|---|
| `migrations/20261012000100_foundation.sql` | divisions, `people`, the helper functions used by every rule (`app.*`), the people guard, `link_current_user()`, `invite_preview()`, the invite-only sign-in hook |
| `migrations/20261012000200_workspace_tables.sql` | the other 58 tables + `store_values`: columns, indexes, foreign keys, row level security (**generated**) |
| `migrations/20261012000300_load_and_save.sql` | `load_workspace()`, `apply_changes()`, `import_workspace()` (**generated**) |
| `schema-spec.mjs` | the one file to edit to change the tables or rules; `node supabase/tools/build-sql.mjs` regenerates migrations 2 and 3 |
| `lib/workspace-shape.mjs` | turns the prototype's `db` into rows and back (used by the move script and, in Stage 3, by the app) |
| `tools/move-data.mjs` | moves a saved prototype workspace into Supabase and verifies it |
| `tools/export-demo-db.mjs` | runs the original prototype headlessly to produce a fully populated demo `db` (no browser needed) |
| `tests/shape.test.mjs` | offline checks of the design (`node --test supabase/tests/shape.test.mjs`) |
| `tests/rls_smoke.sql` | 61 checks of the access rules, plain SQL |
| `RLS_RULES.md` | the access rules in words, and what the database does not enforce |
| `generated/tables.json` | table list for tools |

## How the data is stored (read once)

Each table has `id`, `pos`, `doc`, a few generated columns, `updated_at`, `updated_by`. `doc` is the prototype's record exactly as it was,
stored as `json` (not `jsonb`, because `jsonb` reorders keys and the screens show some lists in key order). The generated columns are
copies of fields such as `owner`, `project`, `div` that the database needs for foreign keys, indexes and security; they cannot disagree
with `doc`. Because the app gets back exactly what it saved, no screen has to change.

## Set up a Supabase project

1. Create a project at supabase.com. Authentication → Providers → Google: enable it and add the client id and secret from Google Cloud.
   Authentication → URL configuration: site URL = your app URL, redirect URL = `<app URL>/auth/callback`.
2. Apply the migrations in order, either with the Supabase CLI (`supabase link`, then `supabase db push`, run from `next-app/`) or by
   pasting the three files into the dashboard's SQL editor, 1 then 2 then 3.
3. Authentication → Hooks → **Before User Created** → type "Postgres function" → `private.before_user_created`. From now on only invited
   e-mail addresses can create an account.
4. Name the first administrator (one time, in the SQL editor):
   `insert into private.bootstrap_settings (key, value) values ('first_admin_email', 'you@example.com');`
5. Copy `.env.example` to `.env.local` and fill in the three Supabase values.

## Move the data

```bash
# 1. Look first. No network, nothing is written. Fails if anything would be lost.
node supabase/tools/move-data.mjs --input export.json        # your saved workspace
node supabase/tools/move-data.mjs --demo                     # or the built-in demo data

# 2. Write it. One transaction. Then it counts rows per table and reads everything back to compare.
npm install                                                   # Stage 3 provides package.json; needs @supabase/supabase-js
node --env-file=.env.local supabase/tools/move-data.mjs --demo --apply --emails emails.json
```

`emails.json` links people to Google accounts: `{ "mahdy": "name@example.com", ... }`. The demo data contains 41 invented/real-looking people;
do not load it into a production project unless you want them there (open question Q7).

## Check it

```bash
node --test supabase/tests/shape.test.mjs          # design checks, offline, no database
psql "$SCRATCH_DATABASE_URL" -f supabase/tests/rls_smoke.sql   # access rules, on a scratch Supabase/Postgres database only
```

The smoke test runs inside one transaction and rolls back, but it creates users and rows while it runs, so never point it at production.

## Not included

`config.toml` (the Supabase CLI writes it with `supabase init`; I could not run the CLI on this machine, which is an Intel-only binary).
