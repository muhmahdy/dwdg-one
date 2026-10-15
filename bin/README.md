# bin: archived files

`bin/` holds files that were verified as obsolete or superseded and kept for reference (master prompt §5). Nothing here is part of the app, its build or its tests. It is not a place for executables, and it is not a substitute for `.gitignore`. Each entry, with its original path, reason and verification, is listed in [docs/audit/archive-manifest.md](../docs/audit/archive-manifest.md).

| Folder | Was | Superseded by |
|---|---|---|
| `frontend-app-v1.1/` | `frontend/app/`: Vite + vanilla JS v1.1 workspace and the dwdg'ONE preview | the React app in `frontend/` (migrated from the prototype) |
| `frontend-concepts/` | `frontend/concepts/`: early static concept pages | design references in `.planning/` |
| `backend-client-v0.3/` | `backend/client/`: browser-side adapter for the v0.3 schema | `frontend/src/lib/supabase/` |
| `database-v0.3/` | `database/migrations`, `tests`, `relations`, `README.md` for the v0.3 schema | `database/` (schema carried over from the Stage 2 plan) |
| `next-app-plan/` | `next-app/` audit, mapping and notes for the superseded Next.js plan | `docs/audit/`, `docs/architecture/` |
| `legacy-tools/` | `bin/generate-*.mjs`: generators for the archived code | `scripts/` |
| `docs-pre-react/` | `docs/ARCHITECTURE.md`, `PAGE_MAP.md`, `PATH_MAP.md` | `docs/architecture/architecture.md`. `PATH_MAP.md` still translates paths quoted in older notes. |

The icon table in `frontend-app-v1.1/src/shared/ui/experience-ui.mjs` is still read by `frontend/prototype/core/build-assets.mjs` and the `.planning/design` generators. Those reference tools are kept working by pointing them here.
