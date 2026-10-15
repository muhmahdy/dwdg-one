# Archive manifest

Every file or folder moved into `bin/` or removed during the React + TypeScript migration. Policy: master prompt §5. `bin/` holds verified archives only, never active code, secrets or deployment configuration.

Recovery point for everything below: branch `backup/pre-react-refactor-2026-10-15` (created from `main` at 3672ba9 before any change). Every archived file is also in Git history.

Status: **planned** (references checked, not moved yet) · **archived** (moved, build and tests re-run) · **removed** (deleted, with the reason).

## Planned in Phase 0 (15 Oct 2026)

| # | Original path | Destination | Reason | References found (`git grep`, excluding `qa/`, `backups/`, PRD history) | Required follow-up | Status |
|---|---|---|---|---|---|---|
| A1 | `frontend/app/` (v1.1 workspace and dwdg'ONE preview, about 60 modules and their tests) | `bin/frontend-app-v1.1/` | Not the migration source (M1). It would otherwise remain a competing implementation (master prompt §5). | Root `package.json` (`dev`, `build`, `preview`, `test`); `.claude/launch.json` (`dev`); `AGENTS.md`; `README.md`; `docs/*`; `bin/generate-code-maps.mjs`; `backend/client/shared-backend.test.mjs`; **`frontend/prototype/core/build-assets.mjs`** and `.planning/design/gen-v2.mjs`, `gen-directions.mjs`, `system/gen-system.mjs`, which read the icon table in `src/shared/ui/experience-ui.mjs` | Extract the icon table into the new app's icon module before moving. Repoint the three `.planning/design` generators and `build-assets.mjs` to the archived path. Replace the root scripts. | planned |
| A2 | `frontend/concepts/` | `bin/frontend-concepts/` | Static early concept pages, no data, not migrated (M1) | `.planning/DECISIONS.md`, `.planning/ux/FRIENDLY_UI_RESEARCH.md` (prose mentions), `docs/*`, `next-app/*` | none (prose only) | planned |
| A3 | `backend/client/` (`shared-backend.mjs`, tests, `API_MAP.md`) | `bin/backend-client-v0.3/` | v0.3 Supabase adapter for the v0.3 schema. Its only importer is `frontend/app/src/legacy/workspace.mjs` (A1). Replaced by `frontend/src/lib/supabase/` (M5, M6). | `AGENTS.md`, `README.md`, `docs/*`, `bin/*`, `frontend/app/src/legacy/workspace.mjs`, `next-app/*` | Archive together with A1 | planned |
| A4 | `database/migrations/` (4 files), `database/tests/workspace_rls.sql`, `database/relations/ERD.md`, `database/README.md` | `bin/database-v0.3/` | v0.3 schema, which does not match the prototype's data model (`next-app/AUDIT.md` §6.4). Replaced by the schema from `next-app/supabase/` (M6). | `backend/client/API_MAP.md`, `bin/*`, `docs/*`, `next-app/*` (prose); `next-app/supabase/migrations/20261012000100_foundation.sql` (a comment noting the patterns it reuses) | none (no code imports) | planned |
| A5 | `next-app/AUDIT.md`, `MAPPING.md`, `MIGRATION_NOTES.md`, `.env.example`, `.gitignore` | `bin/next-app-plan/` | Superseded Next.js plan (M2). Its measured audit is still cited by `docs/audit/*`, so it is kept rather than removed. | `docs/audit/*`, `docs/architecture/decision-log.md` | Update citations to the archived path | planned |
| A6 | `next-app/supabase/` | **not archived**: moved to `database/` (`migrations/`, `tests/`, `schema/`, `policies/RLS_RULES.md`) and `scripts/database/` (generators and data-move tools) | Active database design (M6) | `next-app/*` only | Fix relative paths inside the tools | planned |
| A7 | `bin/generate-code-maps.mjs`, `generate-db-relations.mjs`, `generate-v03-tokens.mjs` | `bin/legacy-tools/` | They generate maps and tokens for A1, A3 and A4. Once those are archived, these tools have nothing to run on. | `bin/README.md`, `docs/*`, `database/README.md`, `.planning/workstreams/CONTEXT.md` (prose) | none | planned |
| A8 | `bin/generate-comfortable-css.mjs` | `bin/legacy-tools/` | Generates `frontend/prototype/core/comfortable.gen.css`. Archived together with the prototype (A10). | `frontend/prototype/core/comfortable.gen.css` header, `bin/README.md` | Keep active until A10 | planned |
| A9 | `docs/ARCHITECTURE.md`, `docs/PAGE_MAP.md`, `docs/PATH_MAP.md` | `bin/docs-pre-react/` | They describe the layout before the migration. Replaced by `docs/architecture/architecture.md`. `PATH_MAP.md` still translates paths quoted in older notes, so it is kept in the archive. | `AGENTS.md`, `README.md`, `frontend/README.md`, `.planning/workstreams/CONTEXT.md` | Update AGENTS.md and README.md to the new docs | planned |
| A10 | `frontend/prototype/` | `bin/frontend-prototype/` | The migration source. Archived **only after** every feature reaches *Verified* in `feature-matrix.md` (M16). | many | Archive last | planned (blocked by parity) |

## Kept in place (checked, not archived)

| Path | Why it stays |
|---|---|
| `.planning/` | Planning workspace, decisions, design system, brand, planner tool (CLAUDE.md, AGENTS.md). Design tokens and brand assets are migration inputs. |
| `PROJECT_REFERENCES/`, `READ THIS IMPORTANT FOR EVERY AI/` | Owner references and specifications |
| `qa/` | Verification evidence, including `qa/refactor-baseline/` |
| `backups/` | Earlier owner-approved snapshots. They are not database dumps, and the master prompt's `database/backups/` is for database backups. |
| `notes/`, `GEMINI.md`, `CLAUDE.md`, `AGENTS.md` | Project instructions and notes |

## Removed

Nothing removed yet.
