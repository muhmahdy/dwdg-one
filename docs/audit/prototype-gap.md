# Prototype gap: what the prototype still has that React lacks

Written 17 Oct 2026, at the end of Phase 3. Goal: `frontend/prototype/` is no longer needed as a reference. It is still needed until the items in sections 1 to 3 are fixed or accepted by the owner; then Phase 6 moves it to `bin/` (decisions M16, M22).

## How the gap was measured

| Check | Result |
|---|---|
| Pages, inspector panels and menus registered by the prototype (`docs/audit/prototype-registry.json`) against the React registries (`app/router/pages.tsx`, `PANELS`, `MENUS`) | **39 of 39 pages, 56 of 56 panels, 38 of 38 menus** exist in React |
| Every English UI string the prototype passes to `L()` or `plural()` (3,837 strings, all prototype scripts except the dictionary and QA) searched for in the React source | 44 are not found. Each was read in context: 6 are prototype-only text or test hooks, 21 are present under different wording or work through another mechanism, **17 are real differences** (7 behind the rules in section 1, 7 messages and 3 accessibility labels in section 2) |
| Drag-and-drop and pointer-drag interactions (12) exercised in both apps with real mouse input | No difference in outcome. Table in `feature-matrix.md` |
| Keyboard handlers (`ON_KEY`: timeline Alt+arrows, milestone arrows, WBS row keys, calendar letters, composer slot, Enter in pickers) looked up in React | All found |
| Compact and Simple pages compared pixel by pixel after the polish pass | Table in `feature-matrix.md`; leftovers in section 4 |

Not mapped one to one: the prototype's 542 `ACT` handlers. React has components and services instead of a string-keyed action table, so there is nothing to diff mechanically. Action coverage rests on the string check above (every button label and message the prototype shows) and on the page, panel and menu registries.

The result is **not empty**. The list follows.

## 1. Rules the prototype enforces and React does not

These change what a person can save, so they come first. All are in the Finance part; the screens exist and validate other things, but not these.

| # | Prototype | React today | What to add |
|---|---|---|---|
| G1 | Approving a finance request needs an approved budget line and cannot exceed the line's remaining allocation: "This request has no approved budget line. Link one first." and "Above the remaining allocation of {r}. Amend the allocation first; going over is an exception POL has not defined." (`divisions/div-fnl-mcit.js:1792-1793`) | `approveFinance` (`features/fnl/services/finance.ts:133`) and the Approve button (`features/fnl/components/FinancePage.tsx:166`) check only that the amount is positive and not above the requested amount, so a request without a budget line, or above what is left, can be approved | Both checks, with the allocation figure from `features/fnl/services/fnl-data.ts` |
| G2 | The paid-on, issued-on and received-on dates cannot be in the future: "Use the date the payment was actually made / it was actually issued / the money actually arrived." (`div-fnl-mcit.js:1814, 1839, 1844`) | `okDate` only checks the format (`fnl-data.ts:486`) and the `DateField`s have no `max` (`FinancePage.tsx:395`, `IncomingPage.tsx:258, 329`) | `date > today()` check and `max={today}` on the three fields |
| G3 | Amending an allocation: the new amount may not equal the current one ("That is the current amount."), and zero is allowed (only negatives are refused) (`div-fnl-mcit.js:1859`) | `AllocPanels.tsx:117` refuses zero and does not refuse an unchanged amount | Same-amount check; decide with the owner whether zero should be allowed |
| G4 | When a corrected attendance entry falls in a monitoring cycle that has started, the toast says so: "Correction saved. Monitoring cycle {c} now uses the corrected entry." (`divisions/div-hr-sng.js:436`) | `features/hr/services/attendance.ts:138` says only "Correction saved for {who}" | The cycle sentence when the cycle is not "planned" |

## 2. Messages and small behaviours that differ

None of these blocks work. Each is a sentence or a one-line guard.

| # | Prototype | React today |
|---|---|---|
| G5 | Picking the task's own lead in the responsible menu shows "{who} leads this task. Change the lead in the task." (`screens/work.js:913`) | `features/projects/components/WbsMenus.tsx:300` returns silently |
| G6 | Removing a collaborator from a project says "{who} removed from the project" (`screens/plan.js:782`) | `features/collaboration/services/cp-actions.ts` says "{who} taken off" |
| G7 | A person who cannot change an item's icon gets "Only the owner can change this icon." (`screens/work.js:456`) | The icon item is hidden (`features/work/components/menus.tsx` `canIcon`), so there is no explanation |
| G8 | Projects register: a project with no blockers shows "No blockers" (`screens/plan.js:213`) | The cell is empty (`features/projects/components/Cells.tsx:49`) |
| G9 | Meeting invitations in lists read "{who} invited you, {when}" (`screens/work.js:41`) | Rail rows show only the date and time; the meeting panel says "{who} invited you" |
| G10 | The project quick-add placeholder is "Add a task to {project name}" (`screens/plan.js:298`) | "Add a task to this project" (`features/work/components/QuickAdd.tsx`) |
| G11 | Save failures name what was kept: "Could not save. Your entries are kept here; try again." (Engagements), "…The draft is kept…" (handoff), "…Your draft is kept here…" (Finance), "…Your note is kept here…" (HR) | One generic message for every failed save (decision M7); the drafts are kept too |
| G12 | Correcting an invitation that someone already accepted says "Only an invitation nobody accepted can be corrected." (`screens/accounts.js:585`) | `features/accounts/services/invite-actions.ts` (`correctInvite`) refuses without saying why |

Accessibility labels the prototype has and React words differently or lacks: "Left out" (screen-reader text in the client-report field list, `div-ee-cons.js:1076`), "Accepted work by rating" (`screens/perf.js:105`), and "organized by {who}" in the calendar item label (`screens/schedule.js:74`).

## 3. Prototype-only, not migrated on purpose

| Item | Why it stays behind |
|---|---|
| `?qa` sweep and the `?fail=save` failure switches (`core/qa.js`, `div-*.js`) | Test hooks. Playwright replaces them (M14); a failed save is covered by `transaction.test.ts` |
| Notices that say "Prototype: approve from Settings when signed in as Mahdy." and "(set up by the Admin, not in this prototype)" | They describe the prototype, not the product |
| The localStorage workspace store (`dwdg-one-proto-v2`) and the demo persona picker as the only sign-in | Replaced by Supabase and Google sign-in; the demo mode keeps the picker (M4, M9) |
| Hash routes (`#/projects/p-roadmap`) | Path routes with a redirect for old links (M8) |

## 4. Visual differences still open

Measured on 17 Oct 2026 at 1440×900, same persona and seed. Share of pixels that differ; about 0.1 to 0.3 % is text anti-aliasing.

| Where | Difference | Note |
|---|---|---|
| Updates page, Compact 5.6 %, Simple 4.7 % | White cards per day group and a wide canvas in `features/updates/components/UpdatesPage.tsx` | Came from an uncommitted edit that was already in the working tree before this pass; it measured 0.3 % and 0.1 % before. The prototype's Compact and Simple pages are flat lists, so the card style should apply to Comfortable only |
| Simple Projects toolbar | Division dropdown: the prototype stretches it across the row, React keeps it at most 280 px wide | Deliberate, decision M24. The owner may overrule it |
| Compact Schedule, 3.4 % | One pixel of calendar scroll position, so every hour line counts as different | Not a layout difference |
| Comfortable look: Projects 4.0 %, Programs 6.4 %, Operations 5.0 %, Attention 8.2 % | Mostly 1 to 3 px vertical offsets between groups and cards | Not part of the Compact and Simple pass |

## Before the prototype can be archived

1. Fix or accept G1 to G4 (they are rules). G5 to G12 and the accessibility labels can go in one small change.
2. Decide on the Updates page card style and the Comfortable offsets above.
3. Keep `qa/refactor-baseline/` (screenshots) and `docs/audit/prototype-registry.json`: they are the record of what the prototype looked like and did, and they do not need the prototype folder to exist.
4. Phase 6 then moves `frontend/prototype/` to `bin/` with an entry in `archive-manifest.md`. `scripts/qa/shot.mjs`, `scripts/qa/capture-screens.mjs` and `scripts/qa/inventory-prototype.mjs` read the prototype and move with it or stop being used.
