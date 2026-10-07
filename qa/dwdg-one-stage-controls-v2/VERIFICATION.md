# Stage controls refinement — 4 October 2026

This revision implements the user's follow-up: outlined green Active circle, centered filter and option contents, a 500ms tooltip delay, animated help, and space between option backgrounds.

All stage icons now share an 18px outline slot. Flex alignment removes the nested inline baseline offset. Project filters have 44px minimum height; menu labels are vertically centered, with 4px gaps between ordinary options and a separate divider before On hold. Selected backgrounds remain darker than hover.

Tooltips enter with a 140ms fade and 4px slide and exit with a 100ms fade and 2px slide. Dismissed help loses its accessible description immediately. A new tooltip cannot be removed by an old retirement timer. Reduced motion uses static help and immediate removal. Escape suppresses reopening caused by restored focus or a stationary pointer; new keyboard input, clicks or actual pointer movement allow help again.

## Verification

- `tests.txt`: all 346 checks passed, including the 499ms/500ms boundary, draft and record preservation, Escape restoration, exit cleanup, rapid re-entry, reduced motion and existing app checks.
- `build.txt`: production build passed.
- `browser-matrix.json`: 16 actual render combinations covering English/Indonesian, light/dark, and 1440×900, 1024×900, 390×844 and 320×844. Labels are centered within 0.01px; ordinary row gaps measure 4px, option height is 44px, Active has no fill, and menus fit without horizontal overflow. Browser rectangle measurements use 0.01px tolerance for fractional transform rounding.
- Full screenshots and `menu-review-sheet.png` retain the corresponding visual evidence.
- `tooltip-film.json`, `frames/` and `tooltip-animation.gif` contain actual browser captures of opening and dismissal. Computed opacity samples show both `one-stage-tip-in` and `one-stage-tip-out` animations.
- Reduced motion and solid dark surfaces were inspected in Indonesian. Both tooltip and Completed animations computed to `none`. Escape restored the filter and remained dismissed after the 500ms show delay.
- `live-preview.png` shows the existing Strategy & Growth preview. Its three project records and selected row were retained. No project stage was changed during verification.

500ms is a choice for this preview, not a universal application standard. Framework defaults differ: [Material UI uses 100ms](https://mui.com/material-ui/api/tooltip/) and [Radix uses 700ms](https://www.radix-ui.com/primitives/docs/components/tooltip). No framework or dependency was added.

Only preview styles, stage-help behavior and corresponding checks changed. Existing app stores, preview records, preferences, attachments, backups, PRD data and lifecycle values remain preserved.
