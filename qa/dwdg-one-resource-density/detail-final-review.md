# Resources detail — final visual review

Inspected all 24 final `file-{1440,1024,768,390,360,320}-{en,id}-{light,dark}.jpg` captures and their entries in `render-metrics.json`, after the inspector scrollbar correction. Each frame shows the same illustrative `Reference PDF` file link. No implementation or tests were changed during this review.

## Observed result

- All 24 states have document width equal to viewport width. No horizontal clipping, overlapping fields or cut-off visible action labels appears in the saved images.
- At 1440px and 1024px, the right inspector retains its 360px outer layout and a 311px detail-reading column. The JSON's `inspector.width` measures that inner detail column, not the outer panel. The right edge has no visible scrollbar or reserved scrollbar strip. Edit/Pin, external Open, the URL, access explanation and link-issue action remain separated and readable in both themes.
- At 1024px the remaining explorer naturally wraps its full long title and project/folder/update context. Its combined avatar/More control stays separate from text; the selected `Reference PDF` and inspector title agree.
- At 768px the detail becomes a full-width route with a centered 620px reading column. At 390/360/320px the reading widths are 358/328/288px, preserving 16px page insets. The 56px layered file identity, title, type, Edit/Pin and external actions remain visible without crowding.
- Narrow detail views open at document scroll 0 with the return control focused. The visible focus outline fits within the viewport. The supplied URL stays readable; longer explanatory text and Indonesian property labels wrap vertically, without colliding with their values. Interface labels and `Oct`/`Okt` are localized; the fixture title, project/folder names and provider URL remain unchanged.

The separate `scrollbar-metrics.json` records a keyboard check in a folder inspector using the same hidden-scrollbar policy: End reaches `Archive resource` at scrollTop34, then Control+Home returns to `Back to Resources` at scrollTop0. This is actual keyboard-scroll evidence for that folder panel, rather than a claim derived from screenshots. The source retains `overflow-y:auto` on the desktop inspector.

## Limits of this evidence

These are initial-position viewport captures, not full-page images. Lower revision, related-work and removal sections extend below the first viewport; this review does not independently establish every lower file action's reachability. Hidden scrollbars remove the visual scroll-position cue, while keyboard scrolling remains evidenced separately.

The fixture has a short file title, one illustrative HTTPS URL and two responsible people. It does not visually exercise arbitrary long URLs, every resource kind or large contributor groups. The cream file surface and secondary text are subtler in light mode; contrast ratios, screen-reader use, physical touch devices and mobile-keyboard behavior are not established by these images. This is scoped responsive detail evidence, not complete PRD acceptance.
