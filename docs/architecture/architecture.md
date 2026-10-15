# Architecture

Target architecture of dwdg'ONE after the React + TypeScript migration. The reasons behind each choice are in `decision-log.md` (M1 to M17). Feature-level progress is in `../audit/feature-matrix.md`.

## Overview

```
Browser (static SPA on Vercel or Cloudflare Pages, M13)
  React 19 + TypeScript, Vite, Tailwind CSS, React Router, TanStack Query
        │  supabase-js (publishable key only)
        ▼
Supabase project
  Auth: Google OAuth, invite-only (hook private.before_user_created)
  PostgREST RPC: load_workspace(), apply_changes(text), link_current_user(), invite_preview(id)
  PostgreSQL: 61 public tables, RLS on every one, helper functions in schema app, private.bootstrap_settings
```

There is no custom server (M5). Every write is a row change that row level security authorises as the signed-in person. Service-role access exists only in the operator's data-move script (`scripts/database/`). It is never shipped to the browser.

## Repository layout

```
frontend/                 the React application (Vite root)
  index.html, package.json, tsconfig.json, vite.config.ts, vercel.json
  public/                 favicon, brand marks; people/ (demo photos, demo mode only)
  src/
    main.tsx, App.tsx
    app/
      router/             route table (39 page keys), legacy hash redirect, page history (Back/Forward, scroll)
      providers/          QueryClient, Auth, Preferences (theme/lang/look), Workspace store, Overlays, Shortcuts
      config/             env, capability registry (CAPS), Ship 1 gate (LATER), divisions and roles
    components/
      ui/                 primitives from the design system (Button, IconButton, Input, Menu, Popover, Tag, StatusBadge …)
      shared/             app-wide pieces (Icon, Avatar, Inspector, Toast, CommandPalette, AccountMenu, ShaderArt …)
    features/<module>/    work, operations, projects, programs, resources, schedule, updates, organisation, settings,
                          performance, accounts, hr, strategy, external, consulting, finance-legal, marketing-it, pins, auth
      components/ hooks/ services/ types/ utils/
    layouts/              ComfortableShell, CompactShell, SimpleShell (the three looks)
    lib/
      supabase/           client, workspace repository (load_workspace / apply_changes)
      workspace/          store, commit (Immer patches → table changes), history (undo/redo), shape (db ⇄ rows)
      i18n/               t(), plural(), dates; dictionary (English → Bahasa Indonesia)
      time.ts             clock adapter (real date; demo date in demo/test mode)
      ids.ts, cn.ts
    assets/               icon tables, brand SVGs (wordmark, lockup, division and role marks)
    styles/               index.css: Tailwind, design tokens as CSS variables, look/theme variants
    types/                workspace record types (Person, Task, Project, Meeting, Resource …)
  tests/                  unit (Vitest), e2e and visual parity (Playwright)
backend/                  README only: why there is no server (M5)
database/
  schema/                 schema-spec.mjs (single source for tables, columns, keys, policies)
  migrations/             SQL applied in order
  policies/               RLS_RULES.md (access rules in words)
  seeds/                  demo seed (development projects only)
  tests/                  rls_smoke.sql, shape tests
  backups/                README + .gitkeep (dumps are git-ignored)
docs/                     prd/, audit/, architecture/, database/, deployment/, development/
scripts/                  backup/, database/ (build-sql, move-data, export-demo), maintenance/, qa/
bin/                      archived, verified-obsolete files only (see docs/audit/archive-manifest.md)
```

Planning, reference and evidence folders stay where they are (M15): `.planning/`, `PROJECT_REFERENCES/`, `READ THIS IMPORTANT FOR EVERY AI/`, `qa/`, `backups/`.

## Frontend

### Data flow

1. `AuthProvider` reads the Supabase session. Signed out, the app shows the sign-in page. Signed in, it calls `link_current_user()` once, which links the Google account to a `people` row or creates the waiting person from a live invitation.
2. `WorkspaceProvider` loads the whole visible workspace with TanStack Query (`load_workspace()`) and composes the rows back into the prototype's `db` shape (`lib/workspace/shape.ts`, the same algorithm as `scripts/database/lib/workspace-shape.mjs`). RLS has already filtered the rows to what the person may see.
3. Components read slices of the store through `useWorkspace(selector)` (`useSyncExternalStore`), so a component re-renders only when its slice changes.
4. Every user action calls `commit(recipe, options)`:
   - Immer runs the recipe on a draft and returns the next state plus patches;
   - the patches are mapped to `{table: {upsert: rows, delete: ids}}` for the touched records only;
   - the store switches to the next state and `apply_changes()` is called;
   - on error the store returns to the previous state (and the undo stack and UI state with it), and the toast says "Could not save. Your changes are still here. Please try again.";
   - an action that offers Undo registers its reversal on the shared undo stack (50 entries, D45).
5. Per-device preferences (theme, language, look, collapsed sections) are kept in `localStorage` under the prototype's keys (M10).

### Rendering rules

- Functional components and hooks only. Each prototype page function (`PAGES[key]`) becomes a route component in its feature module. Each inspector (`INSP[type]`) becomes a panel component, each menu (`MENUS[type]`) a menu component, and each `ACT` handler a typed service function in `features/<module>/services/` called from an event handler.
- Business rules (`rank`, `visibleDivs`, `canCreateProject`, task and project lifecycles, offer and assignment rules) move into pure functions in `features/*/services` or `lib/` with unit tests. Rendering never mutates data directly.
- Strings go through `t()` with the prototype's English text as the key, so the existing Indonesian dictionary applies unchanged.
- Tailwind classes replace the CSS files (M3). The three looks and the dark theme are Tailwind custom variants on `body[data-look]` and `[data-theme]`.

### Routing

React Router, path URLs (M8): `/work`, `/projects/:id/:sub?`, and so on, one route per page key, with the same three-segment shape as before. On first load, a URL with `#/…` is replaced by the same path. Pages in `LATER` redirect to `/work` with the toast "Coming in a later release" unless Release preview is on. `changes` redirects to `/updates/activity`. In the Simple look, pages outside its nine redirect to `/work`.

## Backend and database

See `../database/database-design.md`. In short: each prototype collection is one table, `doc json` keeps the record exactly, generated columns carry the keys used by foreign keys, indexes and RLS, and two RPCs load and save.

## Authentication and authorisation

- Google OAuth with PKCE through Supabase Auth. The "before user created" hook admits only e-mail addresses with a live invitation, and the first administrator is named in `private.bootstrap_settings`.
- Row visibility and write rights are enforced by RLS (`database/policies/RLS_RULES.md`). In-row workflow rules (who approves, private fields) remain client-side, as in the prototype. This is a documented known limitation (`../audit/prd-inventory.md` X6).
- Demo mode (`VITE_DEMO_MODE=true`) replaces Supabase with an in-memory repository and restores the persona picker. It exists for local development and automated tests. Production builds fail if demo mode is on together with a production Supabase URL.

## Environments and configuration

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend, public | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | frontend, public | Publishable (anon) key; safe in the browser by design |
| `VITE_DEMO_MODE` | frontend, development only | In-memory data and persona picker |
| `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` | operator machine only | `scripts/database/move-data.mjs`; never prefixed `VITE_` |
| `DATABASE_URL` | operator machine only | `scripts/backup/*` (`pg_dump`, restore drills) |

Templates with placeholders only: `frontend/.env.example`, `scripts/.env.example`. Real values live in `.env.local` files, which are git-ignored.

## Deployment

The frontend builds to static files (`frontend/dist`). SPA fallback: `vercel.json` rewrites every path to `/index.html`. The same applies on Cloudflare Pages with a `_redirects` file if the owner chooses it (M13). The database is changed only through `database/migrations`, applied in order. Rollback means redeploying the previous frontend build; database changes roll forward with a new migration. See `../deployment/`.

## Quality gates

`npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test` (Vitest), `npm run test:e2e` (Playwright, demo mode, against `qa/refactor-baseline/`), `npm run build`. CI runs them in `.github/workflows/ci.yml`.
