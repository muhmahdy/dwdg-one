# Resources accessibility — actual visual audit

Date: 4 October 2026. This review uses actual saved browser images and their recorded metrics, not source-only layout assumptions. Scope is the separate local-demo Resources preview. Product data was not changed during this review.

## Default rendering

Inspected all 16 `default-{1440,1024,390,320}-{en,id}-{light,dark}.jpg` images with the image viewer. Read their entries in `render-metrics.json` and compared the result with the settled Resources density matrix.

| Width | Ordinary row heights in these fixtures | Long-title row | Visible composition |
| --- | --- | --- | --- |
| 1440px | 52px | 52px | 216px sidebar; separate update/work and responsibility columns |
| 1024px | 52px | 68px | 216px sidebar; update/work moves into the opening control’s context, while responsibility stays separate |
| 390px | 78–94px | 160px | Drawer closed; grouped phone surface; one responsible avatar plus overflow inside More |
| 320px | 94–112px | 200px | Full title/context wraps vertically; icon-only Add; separate title and combined More target |

The 52px desktop and 64px phone figures are minimums. These phone fixture rows grow beyond 64px to retain complete titles, resource kind, project/folder context, update date and related-work summary. The naturally taller rows match the previous density review; the accessibility changes did not squeeze that text into a fixed-height row.

No visible horizontal clipping, title/control collision, overlapping row separators or misplaced responsibility badge appeared in the 16 frames. Recorded document width equals viewport width and `horizontalEscapes` is empty for every default state. The long handoff title is complete: one line at 1440px, two at 1024px and multiple lines on phones. Its context continues underneath rather than being replaced by an ellipsis.

The compact 20px identity treatment remains visually aligned with the rows. Folder and folded-paper file silhouettes are recognizable alongside explicit resource-kind labels; the file fold/external badge and More dots remain subtle on the light surface. This is a visual comparison, not an independent contrast-ratio measurement.

At 1440px the update date and `0 / 1 tasks` use their labeled column. At 1024px and phone widths, the same date/work information remains in the context with `Updated`/`Diperbarui` or task units. Project and folder titles remain user content when the language changes; interface labels and `Oct`/`Okt` change correctly. `Unassigned`/`Belum ditugaskan` wraps within the responsibility column at 1024px without colliding with More.

The two-person AP/NP fixture correctly shows both avatars in desktop responsibility cells. Phone rows show one avatar with `+1` for the second person; the badge is contained in the same trailing More control and does not cross into title/context text. The PRD’s proposed three-visible/28px phone avatar treatment is still a known variation, documented in the earlier density audit; these images do not establish that particular measurement as passed.

All frames capture focus on Add. Its blue outline is complete in light/dark and English/Indonesian, including the 320px icon-only control. Metrics record a solid 2px outline, a 44×44px Add target at 320px and right-side inset sufficient to keep the outline within the viewport. At wider phone size the named Add button also has a complete outline; export remains separate. The sidebar’s selected Resources state and all default desktop navigation labels remain visible without shrinkage or clipping.

The phone frames start at scroll zero. Lower records continue below their 844px viewport; that is normal page scrolling, not cropped record content. The metrics cover all six rows, while the initial screenshots alone do not prove footer or below-fold keyboard reachability. The recorded phone sidebar width belongs to the closed drawer and should not be described as a visible permanent sidebar.

## Remaining acceptance evidence

This default matrix supports responsive density, complete context and the captured Add focus indicator. The enlarged and reflow evidence is reviewed separately below. Shared overlay and record/draft behavior are covered in the source/DOM audit; screen-reader and physical-device acceptance remain outside these images.

## Final enlarged and reflow capture round

Reinspected all 80 replacement images with the image viewer, in batches of four: every configuration below, both languages, both themes, and all four modes (`list`, `file`, `reader`, `editor`). These replacement frames supersede the earlier enlarged round. The 16 default-image findings above remain applicable, giving 96 actual images reviewed. Read the final `render-metrics.json` and `text-overrides.mjs`. No product code or records were changed during this review.

| Configuration | Frames inspected | Evidence represented |
| --- | --- | --- |
| `text-200-1440` | 16 | QA-only source-declared typography scaling at a desktop viewport |
| `text-200-390` | 16 | The same typography override at phone width |
| `spacing-320` | 16 | All four spacing overrides together at 320px |
| `combined-320` | 16 | Typography scaling and all spacing overrides together at 320px |
| `reflow-320x225` | 16 | A 320×225 CSS viewport, equivalent in CSS size to 1280×900 at 400% zoom |

The final text override is a disposable QA style, not a browser preference. It doubles source-declared pixel `font-size` and `line-height` rules while retaining their media/container scope. New nodes receive the override before focus and scroll decisions. Relative and inherited values continue to follow CSS; this is not a claim that every computed font was independently measured and doubled. Reader metrics confirm 32px note text with 48px line height in all text-scaled reader states. The simultaneous spacing override applies line height 1.5, letter spacing 0.12em, word spacing 0.16em and paragraph bottom margin 2em.

The 320×225 frames are a CSS viewport simulation. They do **not** certify native 400% browser zoom. The text override likewise does not certify browser-native text-only resizing.

### Settled visual findings

- The final metrics contain 96 unique states and zero recorded horizontal escapes. In visible content across the replacement frames, titles, context, avatars, inspector labels, reader paragraphs and editor controls remain within their surfaces. No new title/action, avatar/More or header/Back collision was observed. The captured Add, inspector Close, reader Back and editor title controls retain complete blue focus outlines in both themes and languages; their metrics record a solid 2px outline.
- Enlarged desktop rendering uses a consistently measured 432px visible sidebar, compared with 216px by default. Navigation labels remain readable without shrinking or overlapping. The navigation region has its own vertical scroll; Settings is not visible in these initial frames. The wider sidebar and larger text reduce the main-column space, so default row density is not retained.
- Desktop enlarged rows preserve the title and context by growing vertically. Both AP/NP avatars remain visible in the standalone responsibility column. `Unassigned` and `Belum ditugaskan` break within a word in their narrow cells, which is awkward but does not hide the label. Beside the file inspector, the narrower explorer uses the combined avatar/More treatment with the second-person `+1`, without crossing into the title.
- At 390px enlarged text, the Indonesian Add action and type filter wrap over extra lines. File actions and HTTPS addresses wrap within the full-width detail surface. Reader Back and Edit use separate rows where needed; the note title and Last editor context remain separate from those actions. The closed drawer is not a visible permanent phone sidebar.
- Spacing-only 320px frames retain recognizable grouping and readable wrapping in the inspector and reader. Full addresses and long link labels wrap instead of escaping horizontally; paragraph gaps and list spacing expand. The explicit resource kind and project/folder context remain separate from the trailing responsibility/More control in the visible rows.
- Combined 320px overrides produce substantial vertical growth and intra-word breaks: `Resources` becomes `Resourc` / `es`, and `Review` becomes `Revie` / `w`. Indonesian headings wrap at words; longer context words can also break within a word. The page heading retains its characters while the compact shell context ellipsizes. These frames are substantially less dense and less fluent to scan than default, although the visible text is not squeezed under the actions.
- The short 225px frames retain the shell and reveal the selected focus target beneath it. Add, inspector Close, reader Back and the editor title are visible with their outlines. All four short editor states record the footer as `static`; Save/Cancel therefore does not reserve a sticky block in that small viewport. The focused title spans 117–163px in those editor frames. An unfocused heading can be partly behind the shell after the page scrolls to reveal that field; that does not demonstrate a missing heading.

### Reading and reachability limits

The tall editor frames initially focus the title. Sticky Save/Cancel remains visible, but lower unfocused content is not all visible at once: the desktop Note details summary lies at the footer boundary, the enlarged Indonesian 390px textarea starts close to it, and the combined Indonesian 320px toolbar continues behind/below it. These images cannot independently establish traversal to every lower control. The Resources focus-reveal and return/Undo corrections are covered in the source/DOM audit and separate actual keyboard evidence, not inferred from these initial-focus screenshots.

The 225px frames show only a small portion of the page. Lower rows, file responsibility and revisions, the note body, metadata and Save/Cancel remain below the pictured area. Static-footer metrics confirm its positioning, but do not certify that every lower action was visited. The complete note content and all long-row context cannot be judged from the initial viewport alone. Text inputs and search placeholders also have normal single-line viewport clipping; their screenshots should not be described as exposing their entire editable value or accessible name.

Native 400% zoom, browser-native text resizing, screen-reader announcements, physical-device behavior and exhaustive keyboard acceptance across every configuration remain separate checks. The earlier `animation-sampling.json` is diagnostic only; it was not used to judge these settled replacement frames or establish motion acceptance.

No additional product change was proposed from this image review. Subsequent root keyboard verification resized the note field in windows at most 480px tall: at 320×225 it is 113px high and fits beneath the shell when focused. The four short-editor images were recaptured; their initial title focus remains 117–163px and their footer is still static. Root inspected the updated short-state examples and the actual final Save view. [Actual keyboard traces](short-editor-keyboard.json) now record 13 visible short-editor stops, while [enlarged traversal](after-editor-keyboard.json) and [expanded metadata](metadata-keyboard.json) separately cover lower-control reachability. These scoped checks resolve the previously unvisited editor-action question, without establishing every lower action in every configuration.

The evidence supports the captured responsive wrapping, contained surfaces and focused-control visibility, with the density and broader reachability limits above. It does not mark the entire working-draft accessibility requirement passed. See the [final verification](VERIFICATION.md) for shared-overlay timing fixes and remaining native-zoom/device/role boundaries.
