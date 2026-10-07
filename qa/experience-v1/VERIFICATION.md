# DWDG Experience v1.0 — verification record

**26 September 2026 · Partial verification; remaining browser QA blocked.** Further browser-control permission was explicitly denied during the session. The completed checks below remain valid within their recorded scope; the remaining browser matrix, settled screenshots, and recordings could not be completed. The approved [acceptance contract](<../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/ACCEPTANCE.md>) remains authoritative. This is not a full acceptance sign-off.

## Executed checks recorded so far

### Follow-up: direct-file blank screen

The user reported an empty static shell and supplied `file:///C:/Users/muhma/Documents/DWDG%20SYSMangment/index.html#home` as its address. This opening method does not provide the HTTP module-loading environment required by this Vite application. The existing Vite process for this workspace was confirmed listening on port 5173. Direct-file opening now shows a preview link and explanation, and a startup boundary displays module/runtime failures without clearing records. A Happy DOM integration test imports the real boot entry against the shipped HTML; separate tests cover direct-file guidance and escaped bilingual failure rendering. **81 tests pass and the production build passes** after this fix: [test output](tests-startup-fix.log), [build output](build-startup-fix.log). These are DOM integration tests, not fresh visual browser verification. The browser tool again denied access despite the user's explicit approval, so no post-fix browser screenshot is claimed.

| Check | Result and scope | Evidence owner |
|---|---|---|
| Existing and new automated tests | **78 tests passed, 0 failed**, after the final source changes. Includes storage preservation/rollback, linked counts, missing history, timeline geometry, document search metadata, overlay retirement, focus ownership and failed-save recovery. | [Final test output](tests-final.log) |
| Production build | **Passed**, Vite 7.3.6, 18 modules. Output: 221.09 kB JavaScript and 120.12 kB CSS before gzip, plus the existing local Pretendard font. | [Final build output](build-final.log) |
| Secondary renderers | Documents, Organization, Settings, and Updates render in EN and ID without `undefined`/object-string leakage; injected member text remains escaped. | Secondary-page agent, direct Node checks |
| Document and Organization filters | EN/ID checks passed for local file/link/metadata kinds, project division, metadata search, project owner intersection, filtered project links and task totals, and empty intersections. Root event-handler/browser integration remains to be exercised. | Secondary-page agent, direct Node assertions |
| Shared language helpers | Exact domain/storage validation messages, schema options, custom stage preservation, singular search types, rollback/protected-store errors, and invalid JSON text checked. Unknown user content stays unchanged. | Secondary-page agent, direct Node assertions |
| Documentation links and assets | Latest check: 101 local links across 7 specification/evidence documents, 0 broken links; design-token JSON parses. Earlier asset check confirmed all 17 copied references. | Documentation agent |
| Token parity | Light/dark color values and CSS variable maps matched `experience.css` when checked. The latest light secondary text is `#667060`, synchronized in the specification and token JSON. Visual contrast is not established by token equality. | Documentation agent |
| Survey recount | Original workbook read with openpyxl, read-only. 8 unique respondent rows; G/H selections recounted; provenance, ranges, sample limits, and source hash recorded. No survey data inserted into the application. | [Survey traceability](<../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md>) |

The Node checks above do not establish browser persistence, mobile keyboard behavior, focus restoration, chart touch interactions, or visual acceptance.

## Browser and visual evidence

Before browser permission was denied, root completed a **14-route sweep at 1440px in dark theme / Indonesian**, with **no console errors or global horizontal overflow observed in that sweep**. Root also inspected **390px light/English Home**, exercised task creation, reload, completion and Undo, and saved dark/Indonesian and reduced-motion preferences. These are limited observed outcomes, not a complete theme/language/responsive matrix. [Reference comparison](REFERENCE_COMPARISON.md) records which actual screenshots were opened and what they show.

The first 1440 dark/Indonesian route captures show the main content during a dimmed transition relative to the shell. They were flagged for settled-state recapture; do not use those initial frames to approve final dark-theme contrast. Documents/Organization captures also predate their new filters.

| Viewport / condition | Current status | Evidence to record |
|---|---|---|
| 1440px | Dark/ID 14-route sweep: no console errors/global overflow observed; composition captures inspected but taken during fade | Settled recapture and remaining theme/language combinations blocked |
| 1024px | Not performed; blocked | Tablet landscape navigation, inspector, chart and long labels |
| 768px | Not performed; blocked | Tablet breakpoint, grouped surfaces and filter wrapping |
| 390px | Light/EN Home inspected; later fixes not visually rechecked | Other pages and final mobile chart/dock/menu states blocked |
| 360px | Not performed; blocked | Narrow mobile labels, date capsule and forms |
| 200% zoom | Not performed; blocked | Reflow, clipping, navigation and overlay reachability |
| Mobile keyboard | Not performed; blocked | Focused fields and save controls remain visible |
| Reduced motion / solid surfaces | Reduced-motion preference saved; complete effect/solid-surface review not performed | Final static/opaque treatment and persistence matrix blocked |

## Local journey outcomes to complete

| Journey | Result | Evidence |
|---|---|---|
| Existing stores preserved; reload retains edits | Created task survived reload; full pre-existing-store browser matrix not established | Root browser session before denial; store integrity also covered by automated tests |
| Task create/edit → completion → chart/project/calendar reconciliation | Task create/reload/complete exercised; full cross-page reconciliation not established | Root browser session before denial |
| Dissolve only after save; Undo restores identity/position; rapid interaction | Completion and Undo exercised; rapid repetition, failure animation and exact restored position not fully established | Root browser session before denial; recording unavailable |
| Settings dark/ID/reduced-motion preferences | Preferences saved | Root browser session before denial |
| Date, chart and record selection stay synchronized | Full interaction matrix unverified; blocked | — |
| Sticky controls scroll without covering chart/focus/dock | Unverified; blocked | — |
| Anchored menus at edges; Escape and focus restoration | Full edge/focus matrix unverified; blocked | — |
| Documents: upload → preview → revision → reload → missing-file treatment | Attachment file chooser stalled; upload and downstream attachment journey remain unverified | Root browser attempt; test fixture exists but does not prove upload |
| Meeting notes, decisions and linked follow-up task | Browser journey unverified; blocked | Source implemented; no browser acceptance claim |
| Six division records, stages and local save/reload | All six overview routes rendered in sweep; edit/reload/selection journeys unverified | Root 1440px dark/ID sweep |
| Search opens correct record type; Updates actions open correct records | Full interaction journey unverified; blocked | — |
| Filters, CSV scope, JSON backup/import and print | Latest filter rendering passed Node assertions; browser/export/print journey unverified | Secondary-page Node checks only |
| Storage failures keep records visible and show a usable recovery path | Automated domain/storage checks passed; browser treatment unverified | [78-test run](tests-final.log); browser review blocked |
| Empty, dense, long-label and error layouts | Partial initial screenshots only; full review blocked | Linked screenshots, not complete state coverage |

## Findings being resolved

Source audit raised project-activity attribution and Organization export/filter scope. Timeline milestone/dependency treatment and Consulting review markers have since been implemented in source. The project-lead name/division layout and blocker-scope labels were also fixed in source. These later changes have **not been visually rechecked** because browser permission was denied; the linked initial screenshots still show the earlier states. Final tests and a future permitted visual pass must establish their complete behavior.

Final source refinements also cover the visible reminder badge on returning to the app, document filename/revision search, explicit motion preferences, 44px compact mobile date controls, completion focus handoff, serialized bulk completion, and immediate action handoff between retiring overlays. The overlay changes have Node lifecycle regression coverage using DOM doubles. Root completion focus/bulk motion and the latest sticky appearance still need actual browser interaction checks.

External messaging, cloud synchronization, real signatures, background notification delivery, and multi-user enforcement are intentionally deferred. They are not acceptance failures for this local UI phase.

## Final run and remaining limitations

- Final test command/result: **`npm.cmd test` — 78 passed, 0 failed** ([output](tests-final.log)).
- Final production build result: **`npm.cmd run build` — passed** ([output](build-final.log)).
- Completed browser sweep: **1440px dark/ID, 14 routes, no console errors or global horizontal overflow observed**. Remaining matrix **blocked by explicitly denied browser-control permission**.
- Interaction recordings: **not produced; blocked**.
- Attachment upload: **unverified after file chooser stalled**.
- Full YouTube narration: **unverified**; only documented chapters and supplied visual references support the video-related guidance.
- Final screenshots must be recaptured after the latest UI changes when browser access is available. Existing captures are initial evidence, not final visual sign-off.

Do not mark the full acceptance contract passed from this partial evidence. Remaining browser checks require browser-control permission; no substitute static or source check establishes those interactions.
