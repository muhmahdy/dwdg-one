# MAPPING — DWDG'ONE prototype → Next.js (App Router) + Supabase (Stage 1)

Status: Stage 1 plan, approved on 12 Oct ("use all recommendations"). Stage 2 (database) is built; §6 and §9 below were updated to match it. No app code is written yet. Source: `frontend/prototype/` (decided by you). Everything below was checked against the source in this stage; where a point still depends on your answer it is marked **[ASK]**.

---

## 0. Decisions received and assumptions

| # | Question (AUDIT §11) | Answer / how I apply it |
|---|---|---|
| Q1 | Source frontend | **`frontend/prototype/` only.** `frontend/app/`, `frontend/concepts/`, `backend/client/shared-backend.mjs` are reference only. |
| Q2 | Database | **New, optimised schema** built from the prototype's features. Old `database/` SQL is reference (RLS helpers, version column, atomic RPC patterns, invite hook). |
| Q3 | URLs | You said "pick the best, beginner-friendly". **My choice: keep hash URLs (`/#/projects/p-plan26`) on one Next route.** Reasons in §2. Logged in MIGRATION_NOTES N8. |
| Q4 | Rendering | **"No visual change, only the tech stack."** I read this as: keep the HTML-string templates exactly as they are (markup identical) and move everything around them to Next/TS/Supabase. |
| Q5–Q10 | auth/roles, 39 pages, demo data, tests, fonts, versions | **Not answered.** Working assumptions (not final): Q6 all 39 pages incl. the `LATER` gate; Q8 no extra test libs now; Q9 keep the Google Fonts `<link>` identical; Q10 Next 15 + React 19. **Q5 and Q7 block Stage 2** and are asked again in §12. |

---

## 1. Strategy — how the port is done  **[ASK Q11]**

The prototype is 21 classic scripts sharing one global scope (≈12k lines of logic, ≈200 helper functions, `db`/`session`/`ui` reassigned at runtime by `DBCommit`). Two ways to move it into Next:

| | **A. Keep the legacy scripts byte-identical, wrap them** (recommended) | **B. Convert every script into TypeScript modules** |
|---|---|---|
| What happens | The 21 scripts are copied unchanged to `public/legacy/` and loaded in the original order by one small client component. All new work (Next layout, auth, Supabase data layer, RLS, Route Handlers/Server Actions) is TypeScript around them. | Each script becomes an ES module with imports/exports; `db`, `session`, `ui`, `save`, `render`, `toast` become fields of a shared object. |
| Rule 1–3 risk | Lowest. Markup, class names, function names, behavior untouched. Only ~4 small, listed edits (§11). | High. Every reference to `db`/`save`/`render` (thousands) and the runtime re-binding in `DBCommit`, `ui-polish`, `qa` must change; "last loaded wins" must be re-created by hand. |
| Beginner friendliness | Easy to follow: `public/legacy/` = the old app, everything else is the new Next/Supabase layer. The legacy part stays untyped JS. | One uniform TS codebase, but a very large and risky rewrite. |
| Result | Feature parity first. Option B can still be done later, file by file, with the parity checklist as safety net. | Slower; parity harder to prove. |

I recommend **A now, B optionally after Stage 4**. If you want B now, say so; it changes Stage 3 into a much longer sequence and I will re-plan.

---

## 2. Routing (Q3) — why hash stays

Measured in the source: 28 `route()` reads, 59 `go('…')` calls, 10 `location.hash = …` writes, **161 `href="#/…"` links** inside the HTML templates, plus the back/forward history (`PH`) keyed on `location.hash`. Routes have up to three segments (`#/page/id/sub`), e.g. `projects/<id>/wbs`, `performance/div/<id>`, `fnl-requests/new/legal`.

Moving to path URLs would mean rewriting those ~260 call sites **and changing the markup of 161 links** (`#/x` → `/x`) and adding click interception so they don't reload the page. That breaks rules 1–3 for no gain in behaviour. So:

- **One Next route: `/`** (`app/page.tsx`). Every prototype URL keeps working exactly: `https://host/#/projects/p-plan26`.
- Beginner explanation: Next owns the page shell, auth and data; the prototype's own router still owns what is shown inside it.
- Later, after parity, real path URLs can be added as an optional change (not part of this migration).
- Server-side consequence: the server cannot read the hash, so **access control is not done by URL** but by RLS on data (§6/§9). Auth pages are the only real routes: `/auth/callback`, `/auth/signout`.

### 2.1 Page keys (all 39) → hash route shapes

Shapes taken from `href="#/…"` and `go('…')` in the code. Page key = first segment. "L" = in the `LATER` set (hidden in Ship 1, still migrated).

| Page key | Source file | Hash routes seen | L |
|---|---|---|---|
| work | screens/work.js (+ simple.js override) | `#/work` | |
| operations | work.js | `#/operations`, `#/operations/<id>` | |
| updates | plan.js (+ div-hr-sng, div-ee-cons wrap it) | `#/updates`, `#/updates/activity`, `#/updates/activity/<projectId>` | |
| projects | plan.js (+ simple.js) | `#/projects`, `#/projects/<id>`, `#/projects/<id>/{overview,wbs,people,resources}` | |
| programs | plan.js | `#/programs`, `#/programs/<id>`, `#/programs/new`, `#/programs/<id>/full` | |
| resources | plan.js | `#/resources` | |
| schedule | schedule.js | `#/schedule` | |
| settings | plan.js | `#/settings` | |
| organisation | plan.js | `#/organisation` | |
| changes | plan.js | `#/changes`, `#/changes/<projectId>` | L |
| performance | perf.js | `#/performance`, `#/performance/<id>`, `#/performance/div/<id>` | |
| attention | perf.js | `#/attention` | |
| oversight | perf.js | `#/oversight` | L |
| members | accounts.js | `#/members`, `#/members/<id>[/<x>]` | |
| invites | accounts.js | `#/invites`, `#/invites/<id>` | |
| invite | accounts.js | `#/invite/<id>` (public invitation page) | |
| welcome | accounts.js | `#/welcome` | |
| appointments | accounts.js | `#/appointments` | |
| handover | accounts.js | `#/handover` | |
| attendance | div-hr-sng.js | `#/attendance`, `#/attendance/<id>` | |
| monitoring | div-hr-sng.js | `#/monitoring`, `#/monitoring/<id>[/<x>]` | |
| recognition | div-hr-sng.js | `#/recognition`, `#/recognition/<id>` | |
| hr-people | div-hr-sng.js | `#/hr-people` | L |
| initiatives | div-hr-sng.js | `#/initiatives`, `#/initiatives/<id>` | L |
| decisions | div-hr-sng.js | `#/decisions`, `#/decisions/<id>` | L |
| relationships | div-ee-cons.js | `#/relationships`, `#/relationships/<id>` | L |
| opportunities | div-ee-cons.js | `#/opportunities`, `#/opportunities/<id>` | L |
| followups | div-ee-cons.js | `#/followups` | L |
| engagements | div-ee-cons.js | `#/engagements`, `#/engagements/<id>[/<x>]` | L |
| staffing | div-ee-cons.js | `#/staffing`, `#/staffing/<id>` | L |
| knowledge | div-ee-cons.js | `#/knowledge`, `#/knowledge/<id>` | L |
| cohorts | div-ee-cons.js | `#/cohorts` | L |
| fnl-requests | div-fnl-mcit.js | `#/fnl-requests`, `#/fnl-requests/<id>`, `#/fnl-requests/new/{legal,finance}` | L |
| budget | div-fnl-mcit.js | `#/budget` | L |
| register | div-fnl-mcit.js | `#/register` | L |
| period-reviews | div-fnl-mcit.js | `#/period-reviews` | L |
| content | div-fnl-mcit.js | `#/content`, `#/content/<id>`, `#/content/new[/<x>]` | L |
| it-requests | div-fnl-mcit.js | `#/it-requests`, `#/it-requests/<id>`, `#/it-requests/new/{it,brief}` | L |
| accounts-register | div-fnl-mcit.js | `#/accounts-register` | L |

All 39 registry keys are in the table above (checked against `docs/PAGE_MAP.md`). I will re-verify them with a script at the start of Stage 3.

Default route when the hash is empty: `work`. Unknown/forbidden page keys fall back inside the prototype exactly as today.

---

## 3. Target folder (new, inside `next-app/`; originals untouched)

```
next-app/
├─ AUDIT.md  MAPPING.md  MIGRATION_NOTES.md  PARITY_CHECKLIST.md (Stage 4)
├─ package.json  tsconfig.json  next.config.ts  .env.example  .gitignore
├─ middleware.ts                  refresh Supabase session cookie (Next 15; "proxy.ts" in Next 16)
├─ public/
│  ├─ legacy/                     the 21 prototype scripts, copied byte-identical (+ qa.js)
│  │  ├─ core/   assets.js icons.js data.js i18n.js app.js persistence.js ui-polish.js qa.js
│  │  ├─ screens/   work.js plan.js perf.js accounts.js friendly.js calm-shell.js simple.js handin.js pins.js people.js schedule.js
│  │  └─ divisions/ div-hr-sng.js div-ee-cons.js div-fnl-mcit.js
│  ├─ people/                     the 26 files from .planning/design/people/
│  └─ brand/                      dwdg-one-mark.svg (favicon) and any svg the CSS/JS references
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx               <html data-theme="light" lang="en">, <head> metadata/fonts, <body class="ds">, skip link, #app #layer #toast
│  │  ├─ page.tsx                 server component: reads the user, loads the workspace, renders <LegacyHost/>
│  │  ├─ globals-order.ts         imports the 13 CSS files in the original order (§7)
│  │  ├─ styles/                  the CSS files, moved unchanged (§7)
│  │  └─ auth/
│  │     ├─ callback/route.ts     Route Handler: OAuth code → session (new)
│  │     └─ signout/route.ts      Route Handler: sign out (new)
│  ├─ components/
│  │  └─ LegacyHost.tsx           "use client": loads the legacy scripts in order, starts the app (§5)
│  └─ lib/                        the ONLY place that talks to Supabase
│     ├─ supabase/{client,server,middleware}.ts
│     ├─ workspace.ts             loadWorkspace(): tables → the prototype's `db` shape
│     ├─ persist.ts               saveChanges(): `db` changes → tables (Server Action)
│     └─ types.ts                 TypeScript types for rows and for the `db` shape
└─ supabase/
   ├─ migrations/*.sql            Stage 2
   └─ seed / move-data script     Stage 2
```

---

## 4. HTML sections → components

The prototype has one HTML file and builds everything else as strings. With Strategy A, "components" are therefore few and the markup stays in the legacy scripts.

| Original (index.html / shell) | New | Notes |
|---|---|---|
| `<head>`: title, description, icon, preconnect, Google Fonts link | `layout.tsx` `metadata` + `<link>`s | Same text. Icon path `../../.planning/brand/dwdg-one-mark.svg` → `/brand/dwdg-one-mark.svg` (N2). |
| `<html lang="en" data-theme="light">` | `layout.tsx` | `suppressHydrationWarning` because scripts change `data-theme`/`data-look` after load. |
| `<body class="ds">` | `layout.tsx` | Same class. |
| `<a class="skip" href="#main">` | `layout.tsx` | Same markup. |
| `<div id="app">`, `<div id="layer">`, `<div id="toast" role="status" aria-live="polite">` | `layout.tsx`, **rendered empty and never re-rendered by React** | The legacy code owns their children via `innerHTML`; React must not own those children. |
| 13 `<link rel="stylesheet">` | `globals-order.ts` | §7. |
| 21 `<script>` + `qa.js` loader | `LegacyHost.tsx` | §5. |
| Sign-in / waiting screens (`signIn()`, `pick`) | stay in `app.js` markup | Behavior changes only through the auth bridge (§8). |
| Shell (top bar, sidebar, nav groups, profile menu, density, looks), 39 pages, 56 inspectors, 38 menus, quick-add, meeting composer, command palette, toast | unchanged in `public/legacy/**` | No JSX equivalent is created. |

---

## 5. DOM scripts → client component (`LegacyHost.tsx`)

Loading rules that preserve behavior (each is a real hazard found in the source):

1. **Order is fixed** and copied from `index.html`: assets, icons, data, i18n, app, persistence, work, plan, perf, accounts, div-hr-sng, div-ee-cons, div-fnl-mcit, friendly, calm-shell, simple, handin, pins, people, ui-polish, **schedule (last: it calls `render()` and starts the app)**. Scripts are injected one after another with `async = false`/`onload` chaining, so the global lexical scope and "last loaded wins" behave as before.
2. **Run once.** The scripts add document-level listeners (click, input, keydown, hashchange…). React StrictMode in dev runs effects twice, which would double every click. `LegacyHost` guards with a `window` flag, and `reactStrictMode` is set to `false` in `next.config.ts` as a second safeguard.
3. **Run only in the browser, after hydration.** `app.js` reads `localStorage`, `matchMedia`, `Date.now()`, `Math.random()` at load. Doing it before React hydrates would produce hydration mismatches, so the scripts are injected from `useEffect`.
4. **`DOMContentLoaded` handler.** `core/app.js:348` registers a `DOMContentLoaded` listener that installs the interim overrides (`toast`, `MENUS.new/more`, `paintHist`, `runUndo/Redo`, `opsNav`). In the original that event fires after all scripts ran. In Next the scripts are injected after the page is loaded, so the event would never fire. `LegacyHost` dispatches `new Event('DOMContentLoaded')` on `document` right after the last script, which reproduces the original order (render first, then the handler). Logged as N6; I will verify by checking that `toast` is the overridden one.
5. **Boot data.** Scripts need `db` and `session` synchronously at load (`let db = load()`). `page.tsx` fetches the workspace on the server, `LegacyHost` puts it on `window.__DWDG_BOOT__` **before** injecting scripts, and `load()` reads it (edit E1). If there is no data yet, `seedData()` still runs as today (only until Stage 2's data is in).
6. **`?qa`**: the original uses `document.write` to load `qa.js` only when the URL has `?qa`. The host does the same check and injects `qa.js` last (edit E5).
7. `file://` support is lost (Next needs a server). Not a regression for the product; noted.

---

## 6. Backend → Route Handlers / Server Actions

There are **no existing endpoints** (AUDIT §5). The following is **new code** that replaces `localStorage` as the store while keeping all 542 `ACT` handlers untouched:

| New piece | Type | Replaces | Contract |
|---|---|---|---|
| `GET /auth/callback` | Route Handler | (none; simulated sign-in) | `?code` from Google → `exchangeCodeForSession` → redirect `/`. **[ASK Q5]** |
| `POST /auth/signout` | Route Handler | `signout` ACT | clears Supabase session, redirects `/` |
| `loadWorkspace()` | server function used by `page.tsx` | `load()` in app.js | returns `{db, session}` in the prototype's exact shape, read through the user's own Supabase session (RLS decides what rows come back) |
| `saveChanges(changes)` | Server Action | `save()` in app.js | input: per-collection `{upserts[], deletes[]}`; server validates shape, calls one Postgres function `apply_changes(text)` in a single transaction; returns `{ok}` or `{ok:false, conflict}` |
| `loadSession / saveSession` | stay in `localStorage` | same | look, density, theme, language, nav state are per-browser UI preferences today and stay so (see §8 for `me`/`ws`) |
| Admin actions (invites, access, appointments, handover) | go through `saveChanges` | `acct-*` ACT handlers | authorised by RLS + RPC checks, not by the UI |

Validation: today it exists only in the ACT handlers and helpers (client). Those stay. The server adds a second layer (shape, enum values, ownership via RLS), which can only **reject** more, never change a valid result.

**How `save()` stays synchronous [ASK Q12].** The prototype's `DBCommit` expects `save()` to succeed or fail immediately (localStorage), and rolls everything back on failure with the toast "Could not save. Your changes are still here. Please try again." A network write cannot be synchronous. Proposal: `save()` keeps the in-memory `db` as the working copy and returns `true` at once; a queue sends the diff to `saveChanges`. If the server rejects it, the app restores the last confirmed snapshot and shows that same toast text. Difference from the original: the failure comes a moment later and the cause is network/permission instead of storage quota. I need your OK because this is a real behavior difference (logged N3).

---

## 7. CSS mapping (moved as-is, same order)

No `@import` and no `url()` pointing at files exist in any of these CSS files (checked), so nothing inside them changes. Order is the `<link>` order of `index.html`:

| # | Original | New (`src/app/styles/…`) |
|---|---|---|
| 1 | `.planning/design/system/tokens.css` | `system/tokens.css` |
| 2 | `.planning/design/system/components.css` | `system/components.css` |
| 3 | `frontend/prototype/core/app.css` | `core/app.css` |
| 4 | `core/screens.css` | `core/screens.css` |
| 5 | `screens/perf.css` | `screens/perf.css` |
| 6 | `screens/accounts.css` | `screens/accounts.css` |
| 7 | `divisions/div-hr-sng.css` | `divisions/div-hr-sng.css` |
| 8 | `divisions/div-ee-cons.css` | `divisions/div-ee-cons.css` |
| 9 | `divisions/div-fnl-mcit.css` | `divisions/div-fnl-mcit.css` |
| 10 | `core/comfortable.gen.css` (generated by `bin/`) | `core/comfortable.gen.css` |
| 11 | `core/friendly.css` | `core/friendly.css` |
| 12 | `core/calm.css` | `core/calm.css` |
| 13 | `core/simple.css` | `core/simple.css` |

(13 files, the checked list from `index.html`; AUDIT.md had said 14 and 22 scripts, now corrected to 13 and 21.) A prod-build check of the final CSS order is part of Stage 3 step 1. Fallback if Next reorders chunks: serve the same files with `<link>` tags from `public/`.

Assets referenced by the app: `photo()` → `/people/<id>.jpg` (N2), favicon → `/brand/dwdg-one-mark.svg`. Fonts: unchanged Google Fonts `<link>` (assumption Q9).

---

## 8. Auth and session mapping  **[ASK Q5]**

Today: `signIn()` shows 12 hard-coded demo personas; picking one sets `session.me` and `session.ws` (workspace/division) in `localStorage`; a pending person sees the waiting screen; there is no server check.

Proposed (needs your answers):
- Real **Google sign-in, invite-only** (like the old SQL hook) replaces the persona picker; `session.me` becomes the signed-in person's `people.id` (linked to `auth.users`).
- Persona picker: removed in production, or kept only for a local dev flag? Rule 3 says do not remove features, so I propose keeping it behind `NEXT_PUBLIC_DEMO_PERSONAS=true`.
- Role model: keep the prototype's (`president, vp, director, codirector, member, board` + `admin` flag, division = `ee|mcit|hr|fnl|sng|cons`). RLS functions replicate `rank`, `visibleDivs`, `canCreateProject`.

---

## 9. Schema → Postgres  — SUPERSEDED by Stage 2: see `supabase/schema-spec.mjs`, `supabase/README.md`, `supabase/RLS_RULES.md`

The list below was the Stage 1 proposal. What was built differs in one way: every record is stored whole in a `doc json` column and key fields are generated columns (reason in MIGRATION_NOTES N7), not one typed column per field.

Design principles proposed: `text` primary keys that keep the prototype's id format (client generates `uid()` ids and uses them before saving; uuid would force changing `uid()` and every reference); real columns for scalar fields; `jsonb` for nested arrays/objects (versions, history, evidence, reactions, responses); foreign keys where the prototype has a reference; `version int` for optimistic concurrency; RLS on every table.

| Prototype collection | Table | Notes |
|---|---|---|
| people | `people` | links to `auth.users` via `auth_user_id`; division, role, admin, status |
| tasks | `tasks` (+ `task_deps`, `task_assignees` if queried; else jsonb) | |
| offers | `offers` | |
| projects | `projects` (+ `project_team`) | stage = the 8 owner stages |
| milestones, blockers, decisions | same names | |
| meetings | `meetings` (+ `meeting_responses`) | `responses` map → rows |
| unavailable, gbusy | `availability`, `google_busy` | |
| resources | `resources` | folder/note/link, parent FK |
| updates, changes | `updates`, `changes` | append-only feeds |
| programs, pins, routines | `programs`, `pins`, `routines` | lazily seeded in the prototype |
| hr.* | `hr_registers, hr_notices, hr_cycles, hr_assessments, hr_actions, hr_rounds, hr_packets, hr_onboarding` | |
| sng.* | `sng_initiatives, sng_packets` | |
| ee.* | `ee_orgs, ee_contacts, ee_interactions, ee_followups, ee_postpones, ee_opps, ee_handoffs` | |
| cons.* | `cons_engagements, cons_deliverables, cons_staffing, cons_knowledge, cons_cohorts` | |
| fnl.* | `fnl_grants, fnl_policy, fnl_legal, fnl_register, fnl_allocations, fnl_requests, fnl_payments, fnl_incoming, fnl_periods, fnl_drafts` | |
| mcit.* | `mcit_grants, mcit_campaigns, mcit_content, mcit_briefs, mcit_it, mcit_accounts, mcit_drafts` | |
| acct.* | `acct_invites, acct_grants, acct_memberships, acct_actions, acct_handovers, acct_log, acct_office, acct_hidden` | |
| perf.escalations | `perf_escalations` | |

Table names follow the prototype's own key names (snake_case) as far as possible (rule "keep names where possible"). Exact columns come from the live data dump I already have; I will list them in the migration and flag any prototype field I could not map.

---

## 10. Per-stage order for Stage 3 (each step stops for your OK)

1. Next skeleton + `layout.tsx` + CSS + `LegacyHost` loading the untouched scripts with the **demo data in memory** (no Supabase yet): proves "looks and behaves the same".
2. Supabase client/server helpers + `middleware.ts` + auth (Q5).
3. `loadWorkspace()` / `saveChanges()` behind the `load()/save()` bridge, page group by group: `work` → `projects` → `schedule` → `updates/resources/settings/organisation` → `performance/attention/oversight` → accounts group → HR/SnG → EE/Cons → FnL/MCIT.
4. Parity checks after each group.

---

## 11. Edits to legacy files (complete list so far; each logged in MIGRATION_NOTES)

| ID | File | Edit | Why |
|---|---|---|---|
| E1 | core/app.js lines 12–15 | `load()/save()/loadSession()` read/write through the bridge instead of `localStorage` for `db` | storage moves to Supabase (unavoidable) |
| E2 | core/app.js line 54 | `photo()` path `../../.planning/design/people/…` → `/people/…` | relative path breaks under Next |
| E3 | core/app.js `signIn/pick/signout` (+ accounts.js invite flows) | auth via Supabase | pending Q5 |
| E4 | index.html → layout.tsx | skeleton moved, not edited | |
| E5 | `document.write` of qa.js | replaced by host injection | `document.write` unavailable after load |

Everything else (CSS, i18n, templates, ACT/INSP/MENUS) is copied byte-for-byte. I will check with `diff` in Stage 3 that the copied files equal the originals except for E1–E3.

---

## 12. Differences from the original and questions for you

Differences planned: N2 photo path; N3 async persistence (Q12); N6 synthetic `DOMContentLoaded`; N8 hash kept (no difference for users); `file://` not supported; environment variable names `VITE_*` → `NEXT_PUBLIC_*` (allowed).

Questions needing your decision before Stage 2/3:

- **Q11 — Strategy A or B (§1)?** Recommended: A (wrap the legacy scripts, convert later if you want).
- **Q12 — Async saving (§6).** OK with "save instantly in memory, send to Supabase right after, roll back with the same toast if it fails"?
- **Q5 — Login.** Real Google sign-in, invite-only? Keep the demo personas behind a dev flag? Confirm the role model stays as the prototype's.
- **Q7 — Demo data.** Put the 42 demo people / seed records and 26 photos into Supabase as seed data, or load them only in local dev?
- **Q6, Q8, Q9, Q10** — confirm the working assumptions in §0 (all 39 pages; no extra test libraries yet; Google Fonts link unchanged; Next 15 + React 19).
