# Resources workspace density — visual audit

Reviewed the 24 saved `workspace-{1440,1024,768,390,360,320}-{en,id}-{light,dark}.jpg` states using the actual images, plus the workspace entries in `render-metrics.json`. The four 768px replacements were rechecked after the responsibility-count correction. These are disposable same-code fixtures with six illustrative Resources records; they do not read product/browser storage.

## Observed layout

| Viewport width | Ordinary fixture rows | Long-title row | Open / More targets |
| --- | --- | --- | --- |
| 1440px | 52px | 52px | Open ≥44px high; More 44×44px |
| 1024px | 52px | 68px | Open ≥44px high; More 44×44px |
| 768px | 64px | 84px | Open ≥44px high; More 44×44px |
| 390px | 78–94px | 160px | Open ≥58px high; More 60×44px |
| 360px | 78–112px | 178px | Open ≥58px high; More 60×44px |
| 320px | 94–112px | 200px | Open ≥74px high; More 60×44px |

The recorded row identities are 20×20px in every state, with 16px horizontal inset and 12px grid separation. All six canonical record IDs remain the same across the matrix. Recorded document width equals viewport width in all 24 states; adjacent rows do not overlap, and identity/Open/More rectangles stay within their rows. Visible titles and metadata stay separate from the trailing controls. At compact widths the Open/More rectangles retain a 12px gap.

The desktop composition is compact: the long title fits at 1440px and wraps without truncation at 1024px. Phone rows preserve the full title, resource kind, project/folder path and labeled update date by growing vertically. The 52px/64px figures are minimums, not fixed heights or a promise that every phone row remains 64px. Several lower records fall below the first phone viewport; the screenshots are initial-scroll captures, while metrics include all six rows.

At 1440px, dates and `0 / 1 tasks` occupy a separate labeled column. At narrower widths the same information moves into the context text, with `Updated`/`Diperbarui` and `tasks`/`tugas`. English fixture titles and project/folder names remain unchanged in Indonesian; interface labels and `Oct`/`Okt` are localized. The shared focused type selector has a visible outline in both themes.

At 768px the final captures correctly show AP and NP as the two actual responsible people, with no additional badge. The earlier two-avatars-plus-`+1` discrepancy was corrected and its captures replaced. Compact rows show one avatar and `+1` only when there is a second responsible person; unassigned rows use a neutral dash. The combined avatar/More control remains one 60×44px target.

## Variations and limits

- Compact one-avatar/overflow treatment and the current 26px standalone /24px compact avatars vary from the PRD's proposed three-visible and 24px desktop/28px phone geometry. Full responsibility names remain in the canonical inspector controls; this is not full `measure-icons-avatars` conformance.
- The 20px paper fold/external marker and More dots are visually subtle, especially on light surfaces. Explicit resource-kind text remains visible. This image review does not establish contrast ratios or standalone icon recognition.
- At 320px Add is visually an icon-only 44px control. The missing accessible label found during source review was corrected: the control now keeps `Add resource`/`Tambah sumber daya` independently of its hidden visible text, with an English/Indonesian semantic regression. Actual assistive-technology use remains outside this image audit.
- These captures establish responsive browser layout, not physical touch-device, screen-reader, mobile-keyboard or performance acceptance. File-detail and interaction evidence is reviewed separately. This limited density audit does not approve every working-draft PRD rule.
