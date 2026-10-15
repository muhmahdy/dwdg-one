# Database design

PostgreSQL on Supabase. The source of truth for tables, keys and policies is `database/schema/schema-spec.mjs`. `scripts/database/build-sql.mjs` generates migrations 2 and 3 from it. This page explains the design. `database/policies/RLS_RULES.md` gives the access rules in words.

Origin: Stage 2 of the earlier migration plan (`next-app/supabase/`, 12 Oct 2026), carried over unchanged (decision M6).

## Migrations

| File | Contents |
|---|---|
| `20261012000100_foundation.sql` | Schemas `app` (helper functions) and `private`; `private.bootstrap_settings`; `divisions` (6 fixed rows); `people`; helper functions `app.me_id`, `me_div`, `me_role`, `me_active`, `me_admin`, `me_email`, `base_rank`, `rank`, `is_board`, `is_top`, `is_top_or_admin`, `sees_div`, `can_write`, `is_hr_staff`, `hr_lead`, `unit_lead`, `can_members`, `acct_manage`, `can_see_project`, `is_project_lead`, `hr_reviews`; triggers `people_touch` and `people_guard`; RPCs `link_current_user()` and `invite_preview(id)`; auth hook `private.before_user_created` |
| `20261012000200_workspace_tables.sql` | **Generated.** The other 59 tables (58 record tables plus `store_values`): columns, generated columns, 207 indexes, 31 foreign keys (deferrable), 236 policies |
| `20261012000300_load_and_save.sql` | **Generated.** `load_workspace()`, `apply_changes(text)`, `import_workspace(text)` (service role only), `app.apply_rows(json)` |

Rule: never edit an applied migration. Add a new dated file `YYYYMMDDHHMMSS_description.sql`.

## Table shape

Every record table has the same columns:

| Column | Type | Meaning |
|---|---|---|
| `id` | `text` primary key | The record's own id as the app creates it (`t1`, `p-roadmap`, `mahdy`, `n<base36>`). Readable string ids are kept, so the client can create records offline-first and reference them before saving. |
| `pos` | `integer` | Position in the app's list. Lists are shown in this order. |
| `doc` | `json` | The full record. `json` (not `jsonb`) keeps key order, which some screens rely on. |
| generated columns | `text` / `boolean`, `generated always as (doc->>'…') stored` | Copies of key fields (owner, project, div, status …) for foreign keys, indexes and RLS. They cannot disagree with `doc`. |
| `updated_at`, `updated_by` | `timestamptz`, `uuid` (auth user) | Set by the `app.touch()` trigger on every write |
| check `<table>_id_matches_doc` | constraint | `doc->>'id'`, when present, must equal `id` |

`people` additionally has `auth_user_id uuid` (link to `auth.users`) and `email`, which are not part of `doc`.

## Tables (61)

| Group | Tables |
|---|---|
| Organisation | `divisions`, `people`, `store_values` (version numbers, switches, grant lists, numbering policy, keyed `<store>.<key>`) |
| Core work | `tasks`, `offers`, `projects`, `milestones`, `blockers`, `decisions`, `meetings`, `unavailable`, `gbusy`, `resources`, `updates` (notifications), `changes` (workspace activity), `programs`, `routines` (operations), `pins` |
| Human Resources | `hr_registers`, `hr_notices`, `hr_cycles`, `hr_assessments`, `hr_actions`, `hr_rounds`, `hr_packets`, `hr_onboarding_templates`, `hr_onboarding_instances` |
| Strategy & Growth | `sng_initiatives`, `sng_packets` |
| External Engagement | `ee_orgs`, `ee_contacts`, `ee_interactions`, `ee_fu`, `ee_postpones`, `ee_opps`, `ee_handoffs` |
| Consulting | `cons_engagements`, `cons_dlv`, `cons_staff`, `cons_kn`, `cons_cohorts` |
| Finance & Legal | `fnl_legal`, `fnl_register`, `fnl_allocations`, `fnl_requests`, `fnl_payments`, `fnl_incoming`, `fnl_periods` |
| Marketing Communication & IT | `mcit_campaigns`, `mcit_content`, `mcit_briefs`, `mcit_it`, `mcit_accounts` |
| Accounts and authority | `acct_invites`, `acct_grants`, `acct_memberships`, `acct_actions`, `acct_handovers`, `acct_log`, `acct_hidden` |
| Performance | `perf_escalations` |

The mapping from the app's in-memory workspace (for example `db.hr.registers`, or `db.cons.eng` keyed by project id) to tables is declared per table in `schema-spec.mjs` (`source`, `keyed`, `wrap`, `idField`, `positional`). `shape` (`decompose` / `compose`) converts in both directions, and a test checks that `compose(decompose(db))` returns the same data.

## Relationships and constraints

31 foreign keys where the data always satisfies them, for example `tasks.project → projects`, `tasks.parent → tasks`, `milestones.project → projects`, `hr_notices.reg → hr_registers`, `fnl_requests.alloc → fnl_allocations`, and `people.div → divisions`. They are deferrable, so one `apply_changes` call can insert a parent and child in any order. Links that the app leaves dangling on purpose (for example a milestone's `parent` that points at a WBS task) have no foreign key. The full list is in `schema-spec.mjs` (`fk`).

## Access policies

RLS is enabled on every public table. The pattern is:

- **select**: the person is active AND the table's read rule;
- **insert / update / delete**: the person may write (active, not the Board) AND the table's write rule.

The rules reproduce the prototype's visibility functions (`visibleDivs`, `canSeeProject`, `canSeeReg`, `seeDiv` …). They are listed table by table in `database/policies/RLS_RULES.md`, together with what the database does **not** enforce (in-row workflow actions, private fields, concurrent edits).

`load_workspace()` and `apply_changes()` are `security invoker`, so they can never see or change more than the person could through the tables directly. `apply_changes` raises an error when a policy silently refuses a delete, so a refused change is never reported as saved. Helper functions that read `people` are `security definer` with `search_path = ''`.

## Loading and saving

- `load_workspace()` returns `{table: [{id, pos, doc}]}` for every table in one call. For about 40 members this is bounded. Pagination per table is the documented next step if measured size grows (PRD `infrastructure_scaling`).
- `apply_changes(text)` takes `{table: {upsert: [...], delete: [...]}}` and applies every table in one transaction. Rows whose `doc` and `pos` did not change are skipped.
- Concurrency: last write wins per row (known limitation; the prototype had one user per browser).

## Migration strategy

1. Apply the three migrations in order to a new Supabase project (dashboard SQL editor, or `psql "$DATABASE_URL" -f …`).
2. Set the auth hook and the first administrator's e-mail (`database/README.md`).
3. Optionally move existing data with `scripts/database/move-data.mjs`. It defaults to a dry run, and `--apply` writes in one transaction and reads everything back to compare.
4. Later schema changes: edit `schema-spec.mjs`, regenerate, and commit the new migration file next to the spec change.

## Backup and restore

See `database/backups/README.md` and `scripts/backup/`. In short: a custom-format `pg_dump` named `database-backup-YYYY-MM-DD_HH-mm-ss.dump`, verified with `pg_restore --list`, restored only into a scratch database for drills. Dumps never go into Git.
