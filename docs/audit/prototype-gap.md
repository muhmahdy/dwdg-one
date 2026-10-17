# Prototype gap: what the prototype still has that React lacks

Written 17 Oct 2026, at the end of Phase 3; G1, G2, G4–G10, G12 and the accessibility labels fixed the same day (G8 and the rating label turned out to be dead prototype code). Goal: `frontend/prototype/` is no longer needed as a reference. It is still needed until the items in sections 1 and 2 are fixed or accepted by the owner; then Phase 6 moves it to `bin/` (decisions M16, M22).

## How the gap was measured

| Check | Result |
|---|---|
| Pages, inspector panels and menus registered by the prototype (`docs/audit/prototype-registry.json`) against the React registries (`app/router/pages.tsx`, `PANELS`, `MENUS`) | **39 of 39 pages, 56 of 56 panels, 38 of 38 menus** exist in React |
| Every English UI string the prototype passes to `L()` or `plural()` (3,837 strings, all prototype scripts except the dictionary and QA) searched for in the React source | 44 are not found. Each was read in context: 6 are prototype-only text or test hooks, 21 are present under different wording or work through another mechanism, **17 were listed as real differences** (7 behind the rules, 7 messages, 3 accessibility labels). All are fixed except G11 below (G3: owner keeps zero refused); two were never reachable in the prototype (see section 3) |
| Drag-and-drop and pointer-drag interactions (12) exercised in both apps with real mouse input | No difference in outcome. Table in `feature-matrix.md` |
| Keyboard handlers (`ON_KEY`: timeline Alt+arrows, milestone arrows, WBS row keys, calendar letters, composer slot, Enter in pickers) looked up in React | All found |
| Compact and Simple pages compared pixel by pixel after the polish pass | Table in `feature-matrix.md`; leftovers in section 4 |

Not mapped one to one: the prototype's 542 `ACT` handlers. React has components and services instead of a string-keyed action table, so there is nothing to diff mechanically. Action coverage rests on the string check above (every button label and message the prototype shows) and on the page, panel and menu registries.

The result is **not empty**. The list follows.

## 1. Rules the prototype enforces and React does not

Tidak ada. (G3, amending an allocation to Rp 0: the owner decided on 17 Oct 2026 to keep refusing zero in React. The unchanged-amount check was added.)

## 2. Messages and small behaviours that differ

| # | Prototype | React today |
|---|---|---|
| G11 | Save failures name what was kept: "Could not save. Your entries are kept here; try again." (Engagements), "…The draft is kept…" (handoff), "…Your draft is kept here…" (Finance), "…Your note is kept here…" (HR) | One generic message for every failed save (decision M7); the drafts are kept too. Left as is unless the owner wants the per-screen wording |

## 3. Prototype-only, not migrated on purpose

| Item | Why it stays behind |
|---|---|
| `?qa` sweep and the `?fail=save` failure switches (`core/qa.js`, `div-*.js`) | Test hooks. Playwright replaces them (M14); a failed save is covered by `transaction.test.ts` |
| Notices that say "Prototype: approve from Settings when signed in as Mahdy." and "(set up by the Admin, not in this prototype)" | They describe the prototype, not the product |
| The localStorage workspace store (`dwdg-one-proto-v2`) and the demo persona picker as the only sign-in | Replaced by Supabase and Google sign-in; the demo mode keeps the picker (M4, M9) |
| "No blockers" cell (`bkCell`, `screens/plan.js:213`) and the "Accepted work by rating" button (`rateMini`, `screens/perf.js:105`) | Defined in the prototype but never called, so no screen shows them. The registers show the attention cell ("–" when empty) and the rating words, as React does |
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

1. Accept or fix G11 (per-screen save-failure wording).
2. Decide on the Updates page card style and the Comfortable offsets above.
3. Keep `qa/refactor-baseline/` (screenshots) and `docs/audit/prototype-registry.json`: they are the record of what the prototype looked like and did, and they do not need the prototype folder to exist.
4. Phase 6 then moves `frontend/prototype/` to `bin/` with an entry in `archive-manifest.md`. `scripts/qa/shot.mjs`, `scripts/qa/capture-screens.mjs` and `scripts/qa/inventory-prototype.mjs` read the prototype and move with it or stop being used.
