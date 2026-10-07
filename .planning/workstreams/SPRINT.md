# UI completion sprint (6–7 October 2026)

Owner request (6 Oct, night): finish every screen, flow and interaction in the prototype before tomorrow's walkthrough with the organization's developer. The backend sessions (ARC, POL, OPS and the builders) wait until after the walkthrough.

**Goal:** a developer can sign in as any role, click through every planned destination, and see each one behave: the daily screens, every division's own tools, performance, Board, President and VP views, and the account lifecycle. The prototype stays browser-only demo data (D8). Policy details that POL and the spec packs have not settled are shown as the plan proposes them, and are listed as open in your handoff.

## Sessions (run in parallel; all Claude Opus 5.5, effort high, UI is Claude-only per D10)

| Session | Builds | Owns these files only | Read first (after the common list) |
|---|---|---|---|
| **UXP** | Team performance (D30), Board of Supervisors (D29), President and VP attention views | `prototype/perf.js`, `prototype/perf.css` | UX3/BRIEF, UX3/EXTRACT, DHR/EXTRACT (analytics_team_performance, hr_fortnightly_cycle, hr_attendance), IAM/EXTRACT (access_board_scope), blueprint §4 |
| **UXA** | Account lifecycle: invite and approval, first sign-in and profile, appointments, transfer, isolation, presidency handover, leaving and alumni | `prototype/accounts.js`, `prototype/accounts.css` | UX3/BRIEF, IAM/EXTRACT (flows-accounts and every flow-admin, flow-invite, flow-accept, flow-membership, flow-term node), DATA_OWNERSHIP_AUTHORITY.md §3–6, blueprint §2 |
| **UXD1** | Human Resources and Strategy & Growth tools | `prototype/div-hr-sng.js`, `prototype/div-hr-sng.css` | DHR/EXTRACT, DMS/EXTRACT (strategy_* and flow-strategy only), blueprint §7, §9, §12 |
| **UXD2** | External Engagement and Consulting tools, including the EE to Consulting handoff | `prototype/div-ee-cons.js`, `prototype/div-ee-cons.css` | DEC/EXTRACT, blueprint §5, §10, §12 |
| **UXD3** | Finance & Legal and MCIT tools | `prototype/div-fnl-mcit.js`, `prototype/div-fnl-mcit.css` | DFL/EXTRACT, DMS/EXTRACT (marketing_*, flow-marketing, flow-it), blueprint §6, §8, §12 |
| **UX2 (session 3)** | Clean-up only: R20, R21, "Canceled" (already in its brief) | its usual files | UX2/BRIEF |

UX1 session 2 runs **after** these finish (tomorrow morning). It runs the W021 matrix over every screen and is then allowed to fix small issues in any sprint file.

## Common reading list (every sprint session)

1. `AGENTS.md`, `.planning/workstreams/CONTEXT.md`, this file.
2. `.planning/workstreams/UX1/INTERFACE.md` (tokens, components, registries) and `.planning/workstreams/UX2/INTERFACE.md` (record shapes, pickers, inspector, patterns).
3. `.planning/ux/DIVISION_PATTERNS.md` (the 15 shared patterns) and the living design system `.planning/design/system/system.html` (patterns `p-table`, `p-board`, `p-request`, `p-review`, `p-handoff`, `p-attendance`, `p-rubric`, `p-money`, `p-register`, `p-decision`, `p-calendar`, `p-changes`).
4. `prototype/app.js` in full (helpers: `esc`, `L`, `av`, `icon`, `bicon`, `state`, `stage`, `person`, `me`, `ws`, `div`, `db`, `save`, `render`, `go`, `ui.insp`), and skim `work.js` and `plan.js` to match how existing screens are written.
5. Your own "Read first" column, then `.planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md` sections named there.

## How your file plugs in (no shell edits needed)

The PM added plug-in points to `app.js` and already loads your files in `index.html` (after `plan.js`, before `schedule.js`, which starts the app).

- **Wrap your whole file in `(() => { ... })();`.** All scripts share one global scope, so a top-level `const` with a name another file uses breaks the whole prototype. Write only to the registries.
- **Pages:** `PAGES.<page> = r => ({content, crumb})`, where `r = {page, id, sub}` from `#/page/id/sub`.
- **Navigation:** `CAPS[divId] = [[page, icon, 'English label', person => visible?], ...]` adds workspace tools below Changes for that division (design-navigation: capabilities below core destinations). `CAPS['*']` shows in every workspace. The phone More menu picks them up automatically. Push to the array; do not replace it.
- **Inspector, actions, menus:** `INSP.<type>`, `ACT['<prefix>-<name>']`, `MENUS.<name>`, `ON_INPUT`, `ON_CHANGE`, using the same conventions as `work.js`.
- **Demo accounts:** `PERSONAS_EXTRA.push(id)` adds a sign-in choice. Division directors (kirana HR, rani EE, galih MCIT, daniel FnL, reza Cons) are already on the sign-in list; also fadhil (President), raka (VP), mahdy (Admin, SnG Director), citra (FnL Co-Director), dimas (Cons Co-Director), salsa (member) and sekar (pending).
- **Data:** keep it in your own collections, created lazily: `db.hr = db.hr || seedHr(); save();`. Prefix keys by your division or session (`db.hr`, `db.sng`, `db.ee`, `db.cons`, `db.fnl`, `db.mcit`, `db.perf`, `db.acct`). Reuse existing people, projects, tasks and meetings by ID; never copy them (one record, many views). Never change `data.js`. The demo "today" is 2026-10-06.
- **Strings:** English with US spelling (D43). Add Indonesian with `Object.assign(window.ID_DICT, {...})` at the top of your file, formal "Anda".
- **Styles:** your own CSS file only, with every class prefixed (`.hr-`, `.ee-`, `.perf-` ...). Use tokens and the components in `components.css`. Use no new colors except the documented stage and state colors.

## Agreed routes (so sessions can link to each other's screens before they exist)

| Session | Page keys |
|---|---|
| UXP | `performance` (every workspace), `attention` (President, VP, Admin), `oversight` (Board landing) |
| UXA | `members`, `invites`, `appointments`, `handover`, `welcome` (first sign-in) |
| UXD1 | HR: `attendance`, `monitoring`, `recognition`, `hr-people`. SnG: `initiatives`, `decisions` |
| UXD2 | EE: `relationships`, `opportunities`, `followups`. Cons: `engagements`, `staffing`, `knowledge`, `cohorts` |
| UXD3 | FnL: `fnl-requests`, `budget`, `register`, `period-reviews`. MCIT: `content`, `it-requests`, `accounts-register` |

**The cross-division chain to show the developer (blueprint §12, shared handoff contract):**
1. EE: a Client opportunity with Himpunan Mahasiswa Statistika is won, then handed off to Consulting.
2. Consulting accepts it as the existing project `p-hms` (HMS data workshop), staffs Project Associates with consent, and reviews deliverables.
3. FnL Legal drafts and numbers the cooperation agreement (PKS), and later the handover record (BAST).
4. FnL Finance issues the invoice only after the BAST gate.

Use these record IDs so links resolve across files:
- `opp-hms` (EE opportunity)
- `ho-hms` (EE to Consulting handoff)
- `lgl-hms-pks` and `lgl-hms-bast` (legal requests)
- `inv-hms-1` (finance incoming invoice)

Link to them by hash, for example `#/opportunities/opp-hms` or `#/fnl-requests/lgl-hms-pks`. Also use these existing records:
- `p-breakfast` (EE partners)
- `p-site` (MCIT)
- `p-oprec` and `p-orient` (HR)
- `p-roadmap` and `p-plan26` (SnG)
- `p-close` (FnL monthly close)

## Rules that matter most for this sprint

- **Trace everything.** Cite the requirement ID in a short comment beside each behavior. If something is not in your extracts, CONTEXT.md or the blueprint, don't invent it. List it in your handoff.
- **Show the real states.** Use each record's own state list as a chip with icon and text, never color alone. Include the empty, denied ("you can't see this", pattern 13), not yet recorded and Unknown states. Incomplete is not zero. Nothing is fabricated (no health scores, leaderboards, signatures, payments or publications; the app records what happened elsewhere).
- **Respect who can see and do what.** Sign in as at least two roles and make the screen differ correctly: member, Co-Director, Director, VP or President, and Board where relevant. HR confidential notes stay hidden from people without the grant.
- **Show who made it and who is responsible.** Every record shows created by and when, separately from the responsible person and the reviewer (D14).
- **Breadth before depth.** Get every destination in your list working end to end at basic quality first, then deepen the main flow. A clickable path through every state beats one perfect screen.
- **Keep the prototype loading at all times.** Five sessions edit in parallel and the owner may open it at any moment. Run `node --check prototype/<your>.js` after every edit and keep 0 console errors. Check at 1440 px and 390 px, light and dark.
- **Leave the planning workspace alone.** Do not run planner-cli and do not edit REQUESTS.md tables during the sprint. Put questions in your handoff; the PM batches them afterwards.

## When you finish

1. Append a dated entry to your stream's `HANDOFF.md`:
   - UXP and UXA use `UX3/HANDOFF.md`.
   - UXD1 uses `DHR/HANDOFF.md` and `DMS/HANDOFF.md`.
   - UXD2 uses `DEC/HANDOFF.md`.
   - UXD3 uses `DFL/HANDOFF.md` and `DMS/HANDOFF.md`.
2. Start the entry with a heading `UI sprint · <session>`. It lists:
   - the screens and routes;
   - a demo click path for the walkthrough: which account to sign in as and what to click, in 5 to 10 steps;
   - requirement IDs covered;
   - assumptions that POL or the spec pack must confirm;
   - anything unfinished.
3. Reply with a summary of 10 lines or fewer for the PM.
