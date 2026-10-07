# DWDG’ONE — connected Resources notes review

3 October 2026. This evidence covers a local preview increment, not full PRD acceptance.

## Result

Resources now opens notes in a readable document view and edits them inline. Explicit formatting supports headings, emphasis, lists, safe HTTPS hyperlinks and references to one canonical resource in the same workspace. Legacy plain notes remain literal. Folder, responsibility, related work and revisions remain contextual metadata; formatting does not copy linked resources or change their ownership.

Drafts retain editor mode, selection, scroll and expanded metadata through language/context changes and reload. Save acknowledges the resource, revision, draft removal and reader context in one write. Failure retains text and shows one honest error with an unavailable-saving status. Undo restores the previous revision. Missing/archived/foreign references show unavailable text rather than exposing another workspace's data.

## Automated evidence

- [Tests](tests.txt): 248 passed, 0 failed on the final stable source. Covers existing app checks plus note parsing/safe rendering, optional legacy fields, malformed-state byte preservation, reference scope, atomic failure/retry, revision provenance, Undo, metadata disclosure and caret recovery.
- [Build](build.txt): both preserved product and separate preview production entries built successfully.
- New note fields are additive to the existing preview schema. Preview keys remain `dwdg-one-ui-preview-v1` and `dwdg-one-resources-preview-v1`. No product store, attachment, backup or PRD seed was reset/imported.
- Windows development file polling was added after the server served stale linked CSS despite reload. The refreshed server was checked against actual computed styles before settled capture. This changes development refresh behavior only.

## Actual browser evidence

- Created the clearly labeled illustrative campaign note in Marketing, Communication & IT / DWDG welcome campaign / Review materials; assigned the demo administrator. Added an external HTTPS link and the canonical Reference document reference through the actual controls.
- A `javascript:` destination was rejected inline without losing the typed link fields. The HTTPS replacement rendered a real external anchor. External provider content/access was not tested.
- Opening a referenced resource, reloading and returning restored the unfinished source note. Save/reload retained formatting and both links. Editing, Save and Undo restored the exact original body.
- Selected text offsets 0–2 survived a language change while focus stayed on the language control. Metadata stayed expanded after owner selection, reload and workspace recovery.
- Switched to Consulting: the campaign note was absent. Returned to MarCom and resumed the draft with its original title, folder and metadata disclosure. This demonstrates local workspace isolation, not authenticated production permissions.
- The [disposable failure fixture](failure-preview.html) uses the same preview UI with an in-memory adapter; it never reads/writes browser/product storage. Simulated unavailable writes retained text, showed one error and an honest footer, and retry saved after recovery. [Failure capture](save-failure.jpg). This is fault injection, not a real quota outage.
- A 1,000-word, 100-paragraph illustrative note was entered/saved/read in that disposable fixture at 320px. It retained 16px/24px paragraphs and no document-width overflow. [Long note](long-note-320.jpg).

## Rendering

Thirty-two settled reader/editor captures cover 1440×900, 1024×900, 390×844 and 320×720, each in English/Indonesian and light/dark. [Geometry](render-metrics.json) and the [visual audit](audit.md) record the final states. All have document width equal to viewport width. Reader paragraphs are 16px/24px and max72ch; user text is unchanged across interface languages.

Save/Cancel remain visible. At 320×720 the editor deliberately uses a 200px text area so the sticky footer leaves its last line/resize edge exposed; other widths retain 320px desktop and 284px at 390. Actual visible reader actions and hyperlinks measured at least 44px high on the narrow phone view. Notes use solid surfaces and retain the shared reduced-motion rules; this increment did not introduce continuous animation.

The [10-second interaction walkthrough](note-interaction-walkthrough.mp4) consists of five settled captures of actual UI actions: edit/Preview, Save, Undo, open canonical reference, return. It is a stepped screenshot walkthrough, not continuous cursor or motion-performance footage.

## Remaining scope

The full UI/UX goal remains incomplete. Resource review/version approval, ownership handoff, multi-user conflicts/permissions, provider integration and native uploads are not established by this increment. Physical touch, virtual keyboards, screen-reader announcements, zoom/text-spacing and every expanded menu/device state remain unverified. Earlier Home/Work/Projects evidence retains its original scope.

The user selected folder and file identities first for the next WebGL visual iteration. Build those from the saved references with purposeful interaction motion and static/reduced-motion fallback before returning to Schedule. Do not silently equate this selection with approval of all shader policies or other PRD proposals. The PRD seed was not edited.
