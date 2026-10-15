# Architecture

How the repository is laid out and where new work goes. It describes the layout as of 8 October 2026; behaviour and product decisions live in `.planning/` and `READ THIS IMPORTANT FOR EVERY AI/`.

## The four code areas

```
frontend/   everything that runs in the browser
backend/    code that talks to a server or shared service
database/   the schema: migrations, policy tests, relations
bin/        command-line tools you run by hand
```

| Folder | Holds | Entry point |
|---|---|---|
| `frontend/app/` | The Vite application: the preserved local workspace (v1.1) and the dwdg'ONE design preview | `index.html`, `dwdg-one-preview.html` |
| `frontend/prototype/` | The clickable dwdg'ONE prototype (plain scripts, demo data, no build step), split into `core/`, `screens/`, `divisions/` | `index.html` |
| `frontend/concepts/` | Early design concept pages, kept for reference | `concept-v1.html`, `concept-v2.html` |
| `backend/client/` | The browser-side Supabase adapter and its contract tests | `shared-backend.mjs` |
| `database/` | Supabase SQL: `migrations/`, `tests/`, `relations/` (generated diagram) | `README.md` |
| `bin/` | Generators and maintenance scripts | `README.md` lists each tool |

Outside the code areas, unchanged: `.planning/` (planning workspace, workstreams, design system, planner tool), `PROJECT_REFERENCES/` and `READ THIS IMPORTANT FOR EVERY AI/` (specifications and references), `qa/` (verification evidence), `backups/`, `notes/`.

## Inside `frontend/app/src/`

Each folder is a feature or a layer. A feature folder keeps its code, styles and tests together. File names keep their original prefixes (`experience-`, `dwdg-one-`) so they stay searchable.

```
domain/                  data rules, no UI
  model/                   projects, tasks, events, progress
  division-workspaces/     the six division record models
  project-extras/          milestones, blockers, decisions, dependencies
shared/
  ui/                      icons, overlays, charts, escaping (used by both apps)
experience/              the v1.1 workspace
  boot/                    startup error boundary and entry
  shell/                   frame, navigation, Home / My tasks / Projects / Schedule / Project pages
  data/                    local stores and division record schemas
  i18n/                    English and Indonesian text, date formatting
  editors/                 create and edit forms
  pages/divisions/         the six division workspaces
  pages/secondary/         Documents, Organization, Settings, Updates
  pages/timeline/          timeline view
dwdg-one/                the dwdg'ONE preview
  shell/                   frame, preferences, effects, accessibility
  data/                    the local preview store
  features/home/ daily/ work/ projects/ schedule/ resources/ notes/ access/
legacy/                  v0.3 workspace and tokens, kept for reference
```

Every page and where its code is: [PAGE_MAP.md](PAGE_MAP.md). Dependencies point one way:

```
dwdg-one  ->  experience/i18n  ->  experience/data  ->  domain
dwdg-one, experience  ->  shared/ui
legacy    ->  domain, backend/client
```

`domain/` and `shared/` import nothing from the other folders, and `experience/` never imports `dwdg-one/`, so each can move to a shared package or a server later without untangling. Tests sit beside the file they test.

Some files still hold several pages: `experience/shell/experience.mjs` (Home, My tasks, Projects, Schedule, Project), `experience/pages/secondary/experience-secondary.mjs` (four pages), `dwdg-one/shell/dwdg-one-preview.mjs` (the project list and placeholders), the prototype scripts, and `backend/client/shared-backend.mjs`. They were moved, not split, because splitting edits code. The maps show what is inside each.

## Backend by feature

`backend/client/` holds one module today. [API_MAP.md](../backend/client/API_MAP.md) lists its functions by feature (session, members, core work, project access, project extras, documents, division workflows, finance, notifications, legacy import, realtime) and the tables each one touches. Those tables are grouped the same way in [database/relations/ERD.md](../database/relations/ERD.md).

## Data today and later

Today the product is local: records live in the browser (`dwdg-workspace-v1`, `dwdg-division-preview-v03`, `dwdg-project-extras-v1`). `backend/client/` and `database/` are preserved, not connected to the current UI; the repository makes no claim that shared mode is verified.

When the shared phase starts, the path is: `frontend` calls a data layer, the data layer calls `backend/client`, and that talks to the Supabase project whose schema is `database/migrations`. The tables and how they relate are in [database/relations/ERD.md](../database/relations/ERD.md).

## Where to put new work

- A new page in the workspace: a folder in `frontend/app/src/experience/pages/`. In the preview: `dwdg-one/features/<feature>/`. Pure rules it needs: `domain/<feature>/`. Shared widgets: `shared/`.
- A new prototype screen: a script in `frontend/prototype/screens/` (or `divisions/`), added to `index.html` in load order.
- A new server-side service (API route, job, webhook handler): `backend/<service-name>/`, with its own README. Keep Supabase client code in `backend/client/`.
- A schema change: a new file in `database/migrations/` named `YYYYMMDDNNNN_description.sql`; never edit an applied migration. Re-run `node bin/generate-db-relations.mjs`.
- A repeatable maintenance command: `bin/`, with a one-line entry in `bin/README.md`.
- A second frontend (admin console, mobile shell): `frontend/<name>/`, a sibling of `app/`, with its own config.

## Commands

| Task | Command |
|---|---|
| Run the app (and preview at `/dwdg-one-preview.html`) | `npm run dev` |
| Test frontend and backend | `npm test` |
| Production build into `dist/` | `npm run build` |
| Planning app, check, tests | `npm run prd`, `npm run prd:check`, `npm run prd:test` |

The generated maps (`PAGE_MAP.md`, `API_MAP.md`, `ERD.md`) are rebuilt with `node bin/generate-code-maps.mjs` and `node bin/generate-db-relations.mjs`. Old paths in earlier notes map to the current ones in [PATH_MAP.md](PATH_MAP.md).
