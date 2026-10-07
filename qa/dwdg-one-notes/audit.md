# Notes visual audit — 3 October 2026

Scope: the isolated DWDG’ONE Resources note editor and full-width note reader. This is visual evidence for this slice, not approval of the working PRD or full product acceptance.

## Reference anchors

- CRM 12: one broad work area and quiet reading surface, with compact controls.
- Menu 08: concise choices and consistent control spacing.
- Tactile 20 and the supplied arrow/day/calendar references: a subtle rim and depth on Save and selected controls; neutral document surfaces.
- Samsung grouping: mobile controls wrap into clear groups without squeezing labels or using decorative cards.

## Editor evidence

Reviewed all 16 refreshed `editor-{1440,1024,390,320}-{en,id}-{light,dark}.jpg` captures, supplemented by `render-metrics.json`. Desktop frames are 1440×900 and 1024×900; phones are 390×844 and 320×720. Every capture matches its filename’s theme and interface language. User note content remains unchanged across languages.

- At both desktop widths, the editor is 686px wide and 320px high. Save and Cancel are fully visible; formatting controls fit in one row.
- At 390px, the editor is 358px wide and 284px high. The toolbar wraps into two rows; Save and Cancel remain visible.
- At 320×720, the toolbar wraps into three rows with readable labels. The first refreshed capture exposed a 37px overlap between the sticky footer and the 240px editor. All four final replacements confirm the scoped 200px editor resolves it: text area y448–648, footer y651–720. Text remains 16px/24px; long notes scroll inside the deliberately compact editor. The visible focused text area retains its outline.
- Actual frames show no document-width overflow, clipped toolbar labels, or illegible note text. Light/dark control surfaces remain distinct. Geometry reports `scrollWidth` equal to viewport width in every inspected editor state.

## Reader evidence

Reviewed all 16 `reader-{1440,1024,390,320}-{en,id}-{light,dark}.jpg` captures using the saved contact sheet and full-size 1440 EN light / 320 ID dark frames. Filename theme, language, and dimensions match. Reader paragraphs compute 16px/24px. The body is 686px wide on desktop, 358px at 390, and 288px at 320; geometry reports no document-width overflow. Titles and body text wrap naturally; external and internal links remain recognizable. Mobile action labels occupy two rows in Indonesian at 390px and at 320px, adding 44px above the title while preserving readable labels.

## Limits and next review

All 32 final reader/editor captures are settled with no document-width overflow in the recorded states. The earlier stale Vite stylesheet captures are superseded by these files. Physical touch, virtual keyboard behavior, screen-reader announcements, and every expanded metadata/menu state are not established by this visual audit. Material identities remain a separate next slice; the document should remain quiet and readable.
