# DWDG reference redesign — verification record

**Revision:** v1.1 visual composition, 26 September 2026.  
**Status:** source implementation and automated checks complete; visual acceptance blocked.  
**Contract:** [current acceptance criteria](<../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/ACCEPTANCE.md>).

This record applies to the whole-app reference redesign. Earlier captures in `qa/experience-v1` describe the rejected composition and include transition frames. They are not evidence of this result. No current screenshot or interaction recording was fabricated or substituted.

## Completed implementation

- Shared 216px sidebar, 56px toolbar, collapsible divisions, neutral light/dark palette, Pretendard typography, compact controls, tablet rail, and mobile dock.
- Projects starts in an aligned row register, with Grid/Timeline alternatives and one combined activity/blocker summary. Each row displays saved completion counts, owner, deadline, and relevant blockers. Selection continues to use saved records.
- Home combines compact activity, date selection, and actionable task rows; Today agenda and grouped project progress form the supporting column. Project detail groups working records beside a narrower context column.
- Schedule, Documents, Updates, Organization, Settings, and all six divisions use the revised compositions. Documents is a metadata library, Organization starts with the ownership matrix, and Settings uses preference groups with separators.
- Shared chart and overlay styles were consolidated. Charts use 32px activity cells, slender blue count bars, accurate average/unknown-history states, exact value lists, and distinct state colors. Mobile details/search share the shell's 767px breakpoint.
- Actual markup/style audit repaired grid, filter, profile, inspector property, progress, mobile blocker, and timeline geometry mismatches. Timed meetings retain percentage positions against a definite hour-based plot height.
- Active specification, tokens, AI read-first instructions, reference comparisons, and GSD planning records reflect v1.1. The reference folder and historical source material remain intact.

## Execution evidence

| Check | Current outcome | Evidence |
|---|---|---|
| Source preservation | Pre-revision bounded archive retained | [Source backup](../../backups/reference-redesign-before-20260926-195458.zip) |
| Existing tests and targeted regressions | **90 passed, 0 failed** | `npm.cmd test`; [full log](tests.log) |
| Actual application startup | Passed using shipped HTML and actual boot entry in Happy DOM | [Startup tests](../../experience-startup.test.mjs); included in full log |
| Route/preferences regression | All 14 routes checked in EN/light and ID/dark; project-detail and view consistency also checked | Startup tests assert persistent shell, list migration, row identities/progress, filters, collapsed divisions, and no runtime errors |
| Existing record preservation | Passed with existing-store fixtures and adapter reload | Byte-for-byte original three stores preserved through navigation/preferences; custom fields and document revisions retained |
| Local save/Undo and chart semantics | Existing and targeted tests pass | Completion persistence, dependency validation, history/zero/partial handling, chart selection, overlay lifecycle, draft/error paths in test log |
| Production build | **Passed**, 21 modules transformed | `npm.cmd run build`; [build log](build.log) |
| CSS source parsing | All five active experience stylesheets parse | Production build and PostCSS source audit; this is not browser layout evidence |
| Documentation/assets/token parity | **32 token mappings match; 108 links, 0 broken; 17 references preserved** | [Validation report](document-validation.json), 15 documents checked |
| Browser inspection | **Blocked** after retry following the user's stated permission change | Saved browser security policy still denied access to the existing `http://127.0.0.1:5173/#projects` tab. No alternate browser surface or indirect workaround attempted |

Happy DOM checks execute application behavior but do not provide a rendering engine, viewport geometry, screenshots, or animation recordings. They do not satisfy the visual matrix below.

## Visual review

Use settled captures and the same saved record set. [Reference comparisons](REFERENCE_COMPARISON.md) specifies the visual targets.

| Page group | Light EN | Dark EN | Light ID | Dark ID |
|---|---|---|---|---|
| Home | Blocked | Blocked | Blocked | Blocked |
| My tasks / inspector | Blocked | Blocked | Blocked | Blocked |
| Projects / detail | Blocked | Blocked | Blocked | Blocked |
| Schedule | Blocked | Blocked | Blocked | Blocked |
| Documents | Blocked | Blocked | Blocked | Blocked |
| Updates / Organization | Blocked | Blocked | Blocked | Blocked |
| Settings / search | Blocked | Blocked | Blocked | Blocked |
| Six divisions | Blocked | Blocked | Blocked | Blocked |

All required responsive targets remain visually unverified: 1440, 1024, 768, 390, 360px; 200% zoom; physical mobile keyboard; long English/Indonesian labels; empty, dense, error, loading, and storage-failure rendering. Source styles and simulated failure tests are present, but no browser review is claimed.

The Projects density target at 1440 × 900 remains unmeasured: approximately 200px summary, first ordinary row within approximately 450px, and four ordinary 76px rows visible. Do not infer measured geometry from CSS declarations.

## Live interaction evidence

The following remain **blocked and unverified in the actual browser**:

- Task/project edit → save → reload.
- Complete → synchronized list/progress/chart → dissolve → rapid Undo.
- Chart/date/detail selection through filtering, navigation, and resizing.
- Sticky controls during scrolling without obstruction.
- Menus at viewport edges, Escape, restored focus, and retained drafts.
- Attachment/preview/revision and visible missing/quota error states.
- Division workflows, meeting follow-ups, cross-page links, filtered CSV, and print layouts.
- Reduced motion, solid surfaces, mobile keyboard placement, and failure feedback.

Required recordings—chart selection, scrolling controls, anchored menus, dissolve, and Undo—are not available. Full design acceptance must remain open until the saved browser restriction is removed and these checks actually run.

## Scope limits

No backend architecture, storage reset, framework migration, or automatic user-content translation was introduced. Full video narration remains unverified; documented chapters and supplied visual references guide the revision. External messaging, cloud sync, actual signatures, background delivery, and multi-user enforcement remain deferred.
