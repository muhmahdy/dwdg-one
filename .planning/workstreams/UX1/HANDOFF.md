# UX1 handoff log

Newest first. Each session appends: date, model, what changed (paths), evidence, open questions, next step.

## 2026-10-06 · session 1 · Claude Opus 5.5 (UX1 brief, first-session list)

**Changed**
- `prototype/app.js`:
  - Quiet workspace heading (R6a) and quieter global New `.btn.newg` (R6b).
  - Operations nav item, phone More entry and highlight, and Routine / Repeating task in New (D34, R17).
  - One shared undo/redo stack (`UNDO`, `shUndo`, `shRedo`). `toast(msg, undo)` joins it; Ctrl+Z, Ctrl+Y and Ctrl+Shift+Z work.
  - Back/forward page states (`PH`, `phGo`), with buttons in the top bar (D45, R14).
  - `render()` keeps scroll for id-less routes and keeps the side-panel scroll (R16).
  - A handover block at the end disables UX2's interim copies until UX2 deletes them (R20).
- `prototype/app.css`:
  - Shell sized from tokens: sidebar 216, toolbar 56, nav rows 40, 20px nav icons, 12px gaps.
  - Hairlines between the nav groups (D26).
  - The history buttons are split into two groups by a gap instead of the vertical separator.
  - Page padding 32 / 24 / 16 (measure-breakpoints).
  - Phone dock 64 plus safe area, with 44px items. Took over UX2's shell rules (side foot, language toggle, dock badges).
  - Search collapses under 1100px. On phones, New is hidden from the top bar and undo/redo are 44px.
  - Removed the old scrollbar rule.
- `prototype/i18n.js`:
  - UX1 block at the top with US-spelling keys beside the British ones (D43). Removed the dead "Organisation" keys.
- `.planning/design/system/tokens.css`:
  - PRD measures: rows 48/76/52, sidebar 216, toolbar 56, inspector 360, nav 40, dock 64.
  - Type 14/20, 18/24, 12/16; phones 28/34 and 15/22.
  - Motion 120/140/180/200/220/240/300.
  - 44px controls on touch screens.
  - New `--focus-ring`.
- `.planning/design/system/components.css`:
  - Focus is now a 2px outline with 2px offset, drawn inside for rows and menus.
  - D26 hairline classes.
  - The owner's scrollbar rule (R10).
  - Phone editable text 16/24, and 44px menu items on touch.
- `.planning/design/system/README.md`:
  - Rule 1 now includes D26; focus, US-spelling and scrollbar rules added.
  - Measures table and exceptions E1 to E6.
- `system.html` regenerated.
- `INTERFACE.md` published.
- REQUESTS: R20 and R21 to UX2, R22 to the PM and owner; R2 takeover confirmed.
- Planner revision 13 (actor "UX1 Opus 5.5"): C011 moved to Review; C012, C020 and C021 moved to Doing, with evidence.

**Evidence** (browser, Vite on port 5180, My Work as Mahdy; screenshots in `evidence/2026-10-06/`)

| Width | EN light | EN dark | ID light | ID dark | Measured |
|---|---|---|---|---|---|
| 1440 | 1440-en-light | 1440-en-dark | 1440-id-light | 1440-id-dark | Sidebar 216, toolbar 56, nav row 40, inspector 360, padding 32, title 24/32, no horizontal overflow |
| 768 | 768-en-light | 768-en-dark | 768-id-light | 768-id-dark | Sidebar 216, toolbar 56, padding 24, no overflow; breadcrumb was clipped to "My W…" and is fixed (search collapses) |
| 390 | 390-en-light | 390-en-dark | 390-id-light | 390-id-dark | Toolbar 56, dock 64, dock items 44 to 46, top buttons 44x44, padding 16, title 28/34, body 15/22, no overflow; dock labels fit in Indonesian |

- **Focus:**
  - `focus-800-en-light.jpg` shows the 2px green-ink ring on a nav row.
  - Programmatic sweep of My Work: 48 of 58 focusable elements show a ring. The 10 without are UX2's `.mw-r` rows and `.rm2-hit`, whose outline color is invalid (R21).
- **Contrast:**
  - Focus ring: 5.47:1 on white and 4.96:1 on the canvas (light); 6.39:1 and 7.27:1 (dark).
  - The old green ring was 2.37:1 on white, which failed 3:1.
  - Sidebar `--mute` on the canvas: 4.71:1.
- **Behavior:**
  - A completed task was undone and redone with Ctrl+Z / Ctrl+Y and with the buttons. Stack counts were right and the task status round-tripped.
  - Back/forward between Projects and a project restored the hash and scroll (300).
  - Projects kept a 300px scroll after a re-render. The side panel kept a 120px scroll.
  - New menu: Operations and Routine appear once. Phone More: six 44px items; Operations opens with More highlighted.
  - No console errors.

**Not done or not verified**
- 200% text zoom, 400% browser zoom and text-spacing overrides (measure-focus-zoom).
- Real Android and iOS devices.
- Reduced-motion run.
- Screens other than My Work in the matrix.
- Loading, empty, error and denied states (W013, W021).
- Reference comparisons.
- VP scope fixtures (waits for W004).

**Open questions:** R22 (E1 control height, E5 tablet sidebar, E6 phone back/forward, Cancelled vs Canceled, `#/organisation` slug).

**Next step**
1. After UX2 clears R20 and R21, delete the handover block in app.js and the British i18n keys.
2. Run the matrix on Projects, Resources, Schedule, Updates and Settings, plus zoom and reduced motion.
3. Start W013: shared form, save-state and dialog components, including the D25 confirmation sheet.

## 2026-10-06 · session 1 addendum · Claude Opus 5.5
- At the UXP sprint session's request: `prototype/app.js` `visibleDivs` now includes role `board`, so Board of Supervisors accounts read every workspace (D29, access_board_scope). perf.js already blocks their writes and keeps them out of pickers.
- Verified: `board-hadi` appears on the sign-in list. Signing in lands on `#/oversight` with the shell rendered, all 6 workspaces in the switcher and no console errors.
- Open for the PM: D29/D30 say the Board sees "division summaries". Full read access to every workspace's pages is wider than that, so confirm with the owner whether Board should see only `#/oversight` summaries.
