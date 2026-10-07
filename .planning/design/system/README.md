# dwdg'ONE design system v2

Owner: Claude (UI/UX is never delegated, D10). Approved direction: `.planning/design/v2.html` and decisions D17–D20.

## Files

| File | Purpose |
|---|---|
| `tokens.css` | All colours, type, space, radius, elevation and motion as CSS variables. Light on `:root`, dark on `[data-theme="dark"]` |
| `components.css` | Base components and the 15 division patterns (`../../ux/DIVISION_PATTERNS.md`). Wrap pages in `.ds` |
| `gen-system.mjs` | Builds `system.html`, the living reference. Re-run after any change: `node .planning/design/system/gen-system.mjs` |
| `../people/` | 24 demo photos and names for the prototype only |
| `../../brand/` | Official logo, dwdg'ONE lockup, role and division icons |

## Rules (do not break)

1. No side stripes, left accent borders or vertical divider rules. Separate surfaces by tone, spacing and the sheet ring. Thin horizontal hairlines between sections and between grouped rows are allowed (owner decision D26): use `.page .sec-h`, `.hl-sec`, `.grp`, `.colh` and `.hl-rows` from `components.css`, `--line-strong` for section lines and `--line` for row lines, inset 16px from row edges. Exception: calendar grids keep faint day/hour lines because they organize time.
2. One accent: `--green`. Green text uses `--green-ink`. Focus uses `--focus-ring` (green ink in light, green in dark), drawn as a 2px outline with 2px offset; rows and menu items draw it inside. Semantic colours (`--danger`, `--warning`) only for meaning.
3. Hover (`--hover`) and selected (`--sel`, `--sel-neutral`) are different tones, and rows/items have a gap so they never touch.
4. Corners: sheets `--r-sheet` 12, controls `--r-ctl` 8, chips `--r-chip` 6. Avatars and toggles are round.
5. Type: Geist; numbers, times, money and register numbers in Geist Mono. Sentence case; no all-caps section labels; no em dashes in UI copy. English copy uses US spelling (D43: organization, color); Indonesian uses formal Anda.
6. Every state (project stages, pipeline, requests, review, attendance) is an icon plus a coloured word (`.st` + `.s-*` tone). No pill or tinted-badge states; the owner rejected them as generic. EE pipeline steps use a filling pie icon.
7. Notices are white sheets with a solid severity glyph, never tinted blocks.
8. Participant identity is shown as division icon then role icon(s) (`.idl`), with accessible labels.
9. Project stages are the owner's 9-stage set with the defined colours. No light sweep. Only Completed animates (its gradient), and it stops under reduced motion.
10. Every record shows Created by and date separately from Responsible and Reviewer.
11. Unknown is never shown as free or zero (`.tag-unknown`); restricted information uses `.restricted` without leaking details.
12. Contrast: text 4.5:1 and marks 3:1 on their surfaces in both themes. Check new colours before adding them.
13. Use only icons from the existing UI set and `../../brand/icons`. Add new ones in the same 1.8px stroke style.
14. Scrollbars are 4px, square, without track or arrows, and appear only while the pointer is over the scrolling area; touch screens hide them (owner, R10). The rule lives once, at the end of `components.css`.

## Measures (PRD `design-measures`)

Tokens follow the PRD measures. Values in CSS px at 100% zoom.

| Measure | PRD node | Token | Value |
|---|---|---|---|
| Sidebar width | measure-shell | `--sidebar-w` | 216 |
| Toolbar height | measure-shell | `--topbar-h` | 56 |
| Navigation row | measure-shell | `--nav-row-h` | 40 |
| Inspector width | measure-inspector | `--inspector-w` | 360 |
| Project row | measure-project-row | `--project-row-h` | 76 |
| Task and list row | measure-task-row | `--row-h` | 48 |
| Resource row | measure-resource-row | `--resource-row-h` | 52 |
| Phone dock | measure-mobile-dock | `--dock-h` | 64 plus safe area |
| Touch target | measure-targets | `--touch` | 44 |
| Content padding | measure-breakpoints | `--page-x` (app.css) | 32 at 1024+, 24 at 600 to 1023, 16 under 600 |
| Type | measure-type-desktop | `--t-title`, `--t-h2`, `--t-body`, `--t-caption` | 24/32, 18/24, 14/20, 12/16 |
| Spacing | measure-spacing | `--s1` to `--s16` | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| Radii | measure-radius-surfaces | `--r-sheet`, `--r-ctl`, `--r-chip` | 12, 8, 6 |
| Motion | measure-motion | `--d-press` to `--d-panel` | 120, 140, 180, 200, 220, 240, 300; 0 with reduced motion |
| Focus | measure-focus-zoom | `--focus-ring` | 2px outline, 2px offset |

### Deliberate exceptions

| # | Component | PRD value | Used | Reason |
|---|---|---|---|---|
| E1 | Desktop buttons and inputs (`--ctl-h`) | 40 | 34 (inputs 38) | Owner-approved compact v2 toolbars. Touch screens (`pointer: coarse`) get 44. Owner to confirm or ask for 40 |
| E2 | Operational icons | 20 | 18 in rows and buttons, 20 in navigation | The 18px set reads better beside 14px text; navigation uses 20 as measured |
| E3 | Small text `--t-small` | not in PRD | 13/19 | Secondary lines inside rows; never below the 12px floor |
| E4 | Menu rows `.mi` | 32 desktop, 44 touch | 36 desktop, 44 touch | Above the desktop minimum |
| E5 | Shell breakpoint | drawer at M/S (under 1024) | sidebar down to 761, phone dock at 760 and below | A 768px tablet keeps the sidebar; owner to confirm |
| E6 | Phone top bar | D45 back, forward, undo and redo in the top bar | Undo and redo only, 44px; New lives in the dock | The phone's own back gesture walks the same hash history; repeating New beside the dock's New crowded the page name |
