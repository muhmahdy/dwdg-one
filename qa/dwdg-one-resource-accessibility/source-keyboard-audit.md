# Resources keyboard and focus source audit

Date: 4 October 2026. Scope: the separate DWDG’ONE local preview’s Resources explorer, inspector, resource forms and note reader/editor. Product records and the browser store were not mutated by this audit. Tests use isolated Happy DOM storage.

## Requirement and evidence boundary

The working PRD `measure-focus-zoom` proposes a visible 2px focus outline with 2px offset, six keyboard journeys without invisible/offscreen stops, simultaneous text-spacing overrides, 200% text resizing and 400% browser zoom. `measure-inspector` additionally requires keeping the initiating route, scroll, selection and draft on return. These remain proposed requirements; source inspection and DOM tests do not establish visual acceptance at enlarged text or zoom. Actual browser captures and keyboard traversal are owned by the root QA pass.

Read: current Resources controller, note styles, preview render/focus restoration, shared overlay controller, resource density/accessibility styles and the PRD focus/inspector/form sections.

## Demonstrated defects and settled fixes

| Source defect before this pass | Narrow Resources fix |
| --- | --- |
| Desktop More kept focus in the explorer. Tab then traversed remaining rows instead of the newly opened details. | All-width inspector entry focuses its Back/Close control, resets only the inspector’s scroll, and leaves desktop page scroll intact. The inspector remains non-modal. |
| Shift+F10 always stored the row-title opener, including when invoked on More. | Keyboard and pointer context entry preserve the actual button ID when available; title and More return to their respective canonical controls. |
| Save, Cancel and subform completion removed the focused button without selecting a remaining destination. | Saved resource/note returns focus to Edit. Related task and link-issue completion/Cancel return to their initiating action; Move enters its first destination and returns to Move after committing. |
| Ordinary note open and internal-reference open removed the initiating control and could leave focus on the document body. | Saved reader entry focuses its header Back control. A file/folder reference opens the inspector at its Back/Close control; a note reference opens the reader at Back. |
| Saved-reader reference Return restored content and scroll but lacked a focus destination. | The scoped return origin stores the referenced canonical ID and its occurrence index. Return after reload focuses that same occurrence. Editing-note returns retain the existing caret/textarea scroll/Preview recovery behavior. |
| Editor Escape returned to a saved note using an explorer opener that no longer existed. A new note had no stable Add destination after repaint. | Existing-note Escape focuses reader/detail Edit and keeps its unfinished draft. New-note Escape keeps the draft and focuses the stable Add button; explicit discard removes only that draft. |
| Validation focused fields with `preventScroll` even when they were offscreen or covered by sticky actions. Native Tab could similarly focus a covered textarea or disclosure. | A Resources-only focus-in check compares the focused rectangle with its current page/inspector viewport, sticky shell and sticky form footer. It centers only an actually covered/outside control. Visible controls retain scroll; native `summary` controls are included. |
| Actual keyboard QA found that Close could reveal the opener before restoring origin scroll, then scroll away from that focused opener. Saved-reference Return deliberately disabled reveal even if the source control moved outside the restored viewport. | Close and saved-reference Return now repaint, restore the stored origin scroll, then focus and conditionally reveal the exact canonical control. If it is already visible, the stored scroll stays unchanged. |
| Actual keyboard QA found that the last toolbar Undo disabled the focused Undo button and left focus on the body. | Undo remembers the selected/origin canonical resource and focuses its visible explorer row after restoration; if Undo removes it or it is filtered out, focus goes to Resources search. Undo for another workspace does not apply that destination or alter the current context. |

Implementation is confined to `dwdg-one-resources.mjs`: `revealFocusedControl`/`focusControl`/`enterInspector`, reference entry/return, Save and Undo destinations, canonical entry/close/subform destinations, and scoped keyboard/focus listeners. No preview/store/lifecycle changes were made in this pass.

Moving a note reader to the top also exposed an older context assumption: reader → More → Open note could replace the original explorer scroll with the current reader scroll. The controller now retains the original note-explorer/inspector return context; the existing 180px return regression passes.

## Browser QA focus destinations

| Journey | Expected destination |
| --- | --- |
| Explorer More / title or More + Shift+F10 | `#one-inspector .one-panel-header [data-action="res-close"]` |
| Inspector Close / Escape | Exact `#one-res-row-RESOURCE_ID` or `#one-res-more-RESOURCE_ID` initiating button, with kept explorer query/path/selection/scroll |
| Saved note Open | `.one-notes-header [data-action="res-close"]` |
| Note Save, Cancel/discard, or editor Escape to saved reader | `.one-notes-header [data-action="res-edit"]` with the original note ID |
| External resource Save / unchanged Cancel | `#one-inspector [data-action="res-edit"]` with the original resource ID |
| New note Cancel or Escape to explorer | `#one-res-add`; Cancel discards explicitly, Escape keeps the draft |
| Note internal reference to an external file | Inspector header Back/Close; Return restores the source reference occurrence |
| Editing-note reference Return | `#one-res-content`, or the focusable `.one-notes-preview` when Preview was active; kept caret, text and scroll |
| Related task or link-issue Cancel/Save | Current detail surface’s `[data-action="res-task"]` / `[data-action="res-issue"]` |
| Move entry / successful Move | `#one-inspector [data-action="res-move-here"]` / current detail surface’s `[data-action="res-move"]` |
| Invalid title / URL | `#one-res-title` / `#one-res-url`, marked invalid and revealed if covered |
| HTTPS dialog Escape | `#one-notes-link-trigger`, with text/caret/pending link fields kept |
| Existing-resource picker Escape | `#one-notes-reference-trigger`, keeping the underlying note editor |
| Owner picker ArrowDown then Escape | Named list option → `#one-res-owner`; underlying form stays open |
| Last toolbar Undo | `#one-res-row-RESOURCE_ID` if restored and visible, otherwise `#one-res-search` |

When a detail action belongs to a collapsed note-details disclosure, the focus helper opens that disclosure before focusing its action. The desktop inspector has no focus trap. The shared modal controller supplies background inertness, dialog Tab containment, Escape dismissal and opener restoration; resource popovers retain their explicit option navigation and Tab exit behavior.

## Verification

`node --test dwdg-one-resources.test.mjs`: **45/45 passed**, including twelve new regressions covering EN/ID and 1440/320 inspector entry/return, note Save/Cancel/Escape, recoverable new forms, repeated saved references after reload, external metadata/subforms, note/form overlay Escape, covered-focus geometry/listener cleanup, offscreen-origin return ordering and Undo focus/context safety.

Combined command with `dwdg-one-resource-identity.test.mjs`, `dwdg-one-note.test.mjs` and `dwdg-one-note-store.test.mjs`: **80/80 passed**. Focus/context-only journeys assert canonical records/revisions/events stay unchanged. The preserved product-store sentinel remains unchanged throughout.

## Subsequent actual browser verification

The root's [verification](VERIFICATION.md) now records 96 settled default/enlarged/spacing/reflow states, actual editor and metadata traversal, exact reference return, validation/save/Undo, context draft recovery and final dialog timing checks. The isolated full suite passed 287/287 and the final build passed. Native browser zoom/text resizing, screen readers, physical devices and the full cross-page/role matrix remain unverified.

Two additional shared-overlay defects were demonstrated by actual native keyboard checks: confirmation and regular popover Escape temporarily focused the body until their exit completed, and the delayed opener callback could steal focus from a new inline editor. The small correction in `experience-ui.mjs` restores focus when the outgoing layer becomes inert and leaves exit retirement responsible only for removal. Seven full-motion timing/ownership regressions passed, including nested/replacement/destroy behavior and preserved animation-wait semantics. This shared correction also applies to the original app; no data store or migration changed.

The preview shell correction in `dwdg-one-preview.mjs` excludes the closed mobile sidebar from Tab and focuses the chosen page heading. Preview-only accessibility styles keep enlarged labels/control targets contained and let short-window forms flow without a sticky footer; the note field shrinks in short windows so its focused area fits beneath the shell. See [final metrics](metrics-check.json) and actual keyboard traces for their bounded coverage.

## Limits of this source audit

The geometry tests supply explicit rectangles; Happy DOM does not perform CSS layout or browser-native Tab navigation. Browser evidence is recorded separately above and does not mark the full PRD accessibility acceptance passed. The 80/80 combined result describes this audit's earlier component set, not the final 287-test full suite.
