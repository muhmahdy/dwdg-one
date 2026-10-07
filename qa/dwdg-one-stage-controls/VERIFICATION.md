# Project stage controls — 4 October 2026

Implemented the requested stage-control refinement in the isolated DWDG’ONE preview. Stage identities use a left icon and localized label in the filter trigger, menu, grouped list, summary inspector and project overview. Active uses a larger filled green circle; review uses a blue search icon; hold uses an amber hand; cancellation uses a red X; archive uses a gray box. Completed uses bold purple/blue text with a repeating light sweep.

Selected options use a darker fill than hover in both themes and retain their checkmark. Help appears after 3,000 ms of hover or keyboard focus. Leaving, clicking, scrolling, Escape and retiring an overlay dismiss it. It preserves existing descriptions and never moves focus. Reduced motion displays a static Completed label; solid surfaces and forced-color alternatives are provided.

## Evidence

- `tests.txt`: 343 tests passed, zero failed. Includes delayed help, nested icon/label pointer movement, keyboard menus, localization, persistence, failure recovery, role isolation and existing product checks.
- `build.txt`: production build passed after the final stylesheet adjustment.
- `browser-matrix.json`: actual browser rendering in English and Indonesian, light and dark, at 1440×900, 1024×900, 390×844 and 320×844. All 16 cases retain left icons, 44px minimum option targets, menus within the viewport and no horizontal page overflow.
- The delayed keyboard tip was inspected on desktop and at 320px; Escape dismissed it and restored focus to the filter. `id-dark-320-tip.png` and `completed-tip.png` show these states.
- `reduced-solid.png`: actual Indonesian dark rendering with reduced motion and solid surfaces; computed Completed animation was `none` and the menu surface was opaque.
- `completed-light-sweep.gif`, `film.json` and `frames/`: 40 actual browser frames over approximately eight seconds. The animation changes background position and the Completed tip stays visible without moving keyboard focus.
- `menu-review-sheet.png`: settled stage menus in every layout combination. Individual full screenshots are retained alongside it.
- `live-preview.png`: the user's existing Strategy & Growth preview after refreshing the old page. Three existing project rows and the selected row remain intact; no stage or record was changed during this check.

Light stage text colors were adjusted to remain above 4.5:1 against white, hover and selected menu backgrounds, including the gradient colors. Theme colors and menu fills were read from actual rendered styles. Pointer behavior is covered by delegated-event tests; delayed help and focus restoration were also observed in the browser.

The menu follows Draft, Planned, Active, In review and Completed, followed by On hold, Cancelled and Archived. Existing canonical stage values, labels and project grouping order remain unchanged. This is a control refinement, not approval of lifecycle transition rules.

The no-workspace demo-role check also exposed an existing display-preference save error: the shell supplied an inaccessible fallback workspace view. It now saves views only for accessible workspaces, while retaining private drafts and stored views. Role recovery and preservation checks pass.

Browser fixtures use in-memory storage. Product records, preview store keys, PRD editor data, attachments, backups and backend configuration were not reset or migrated.
