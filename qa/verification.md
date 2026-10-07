# Redesign verification — 21 September 2026

## Follow-up revision

Following the browser annotations, all four summary captions use blue text without a background; the save-status label was removed. Ambient sage is restored behind white cards, card framing is simplified, and project artwork has stronger color and more defined shapes. The pixel bars were replaced with a green line/area chart. Task rows open their editor when their non-control area is clicked; status pills now expose a native status selector.

Verified row-metadata click, direct status update, undo back to the original status, 7/30-day switching, and keyboard chart selection. Inspected the revised layout at 1110 × 912, 1440 × 900, 390 × 844, and the normal browser viewport. Mobile content has no page-level horizontal overflow. All four caption backgrounds compute to transparent; all use `#1D4ED8`. All ten model tests still pass, with no observed console errors. The test status change was undone.

Current screenshots: [desktop revision](revision-desktop.png), [mobile revision](revision-mobile.png). The original-pass observations and screenshots below are retained as historical verification, not the current visual design.

The existing vanilla JavaScript application, hash routes, local Inter file, model, and `dwdg-workspace-v1` storage format remain in place. No migration, framework, or network service was introduced.

## Passed

- All ten existing model tests pass, including validation, dependencies, Gantt dates, and JSON backup round-trip.
- Syntax checks pass for the workspace, chart, and materials modules.
- Local Inter returns HTTP 200 as `font/woff2` (352,240 bytes); browser font checks confirm it is available and the interface uses the Inter family.
- Desktop visual inspection at 1440 × 900 and 1280 × 800; tablet at 768 × 1024; mobile at 390 × 844. Overview, projects/details, task list/board, schedule, Gantt, settings, and dialogs were inspected across these checks. No page-level horizontal overflow was observed; tables/boards/timelines retain their intentional internal scrolling.
- Desktop measurements: heading 26 px, summary cards 104 px, paired overview panel edges aligned, chart/schedule row 275 px, project cards approximately 186 px, Gantt rows 44 px and bars 24 px. Mobile filters wrap, titles remain readable, and navigation has reserved bottom space.
- Project creation/editing, task creation/editing/completion, and event creation/editing work. Reload preserved edits.
- A due date before the start and completion before an unfinished dependency were rejected, with entered values retained and errors beside the relevant fields.
- Board dragging changed the task status; undo restored it.
- Gantt project filtering, drag-to-move, right-edge resizing, arrow movement, Shift+arrow resizing, and editing worked. Updated due dates appeared in the calendar.
- Seven/thirty-day switching and keyboard chart selection worked. Values included a newly completed test task and returned to the original totals after cleanup. Zero-count dates have no bar height.
- Offscreen artwork was observed paused; visible artwork resumed after scrolling. Filters remained at one shared SVG container through repeated route changes. Motion uses CSS transforms, with no continuous JavaScript animation loop.
- No browser console errors were observed during final inspection.

UI workflow verification used a temporary project, two tasks, and one event. These records were removed after verification. The existing workspace records were preserved. The normal activity history may include these test actions.

## Contrast

Calculated text-to-white contrast ratios: primary 17.93:1, secondary 7.81:1, supporting labels 6.10:1, not started 7.00:1, in progress 6.70:1, blocked 5.62:1, completed 5.00:1, overdue 6.57:1. White text on the primary green is 5.98:1. Secondary labels over the darkest permitted glass tint calculate to 4.72:1.

## Verification limits

- Tested in the Codex Chromium browser. Safari and Firefox fallback rendering were implemented but not run in those browsers.
- Reduced motion, reduced transparency, increased contrast, and hidden-tab pausing were checked in source, not with live OS preference switching. Offscreen pausing was verified live.
- Actual 200% browser zoom could not be activated through this browser's keyboard controls; responsive viewport checks are not claimed as a substitute.
- The export action produced its success message, but the browser did not expose a saved download for re-import. The model's JSON backup round-trip passed; the full browser download/upload round-trip remains unverified.
- Continuous layout/compositor profiling was not available. Transform-only animation and observer/listener cleanup were reviewed; the observed filter container count did not grow.
- Reference details were compared visually with the supplied examples; no pixel-identical or automated side-by-side comparison is claimed.

## Screenshots

- [Desktop overview](desktop-overview.png)
- [Desktop projects and artwork](desktop-projects.png)
- [Desktop Gantt](desktop-gantt.png)
- [Desktop schedule](desktop-schedule.png)
- [Mobile overview](mobile-overview.png)
- [Mobile schedule](mobile-schedule.png)
