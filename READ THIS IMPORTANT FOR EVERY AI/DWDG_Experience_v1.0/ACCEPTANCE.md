# DWDG v1.1 reference redesign — acceptance and evidence

**Status: pending current-revision verification.** This is a verification contract, not a passed report. Deliver every page and all six divisions in one implementation. Record actual outcomes and evidence in the new QA report; preserve earlier reports as historical context.

Current evidence: [verification record](../../qa/reference-redesign/VERIFICATION.md) and [source/result comparison](../../qa/reference-redesign/REFERENCE_COMPARISON.md). Browser access was previously blocked despite the user's subsequent approval; current access and live QA outcomes must be recorded for this revision. Keep criteria unchecked until linked evidence establishes the complete journey. Earlier test counts and screenshots are baseline evidence, not a pass for the redesign.

## Composition gates

- [ ] Every page shares the 216px desktop sidebar, 56px toolbar, 40px navigation rows, and collapsible division group; tablet rail and mobile dock remain usable.
- [ ] Central palette matches the approved neutral light/dark colors; desktop title 24/32px, mobile title 28/34px, body 14/20px desktop and 15/22px mobile, metadata 12/16px.
- [ ] Projects defaults to grouped rows; Grid and Timeline remain functional with the same filters and records.
- [ ] At 1440 × 900, Projects has an approximately 200px combined summary, the first project starts within approximately 450px, and four ordinary 76px project rows are visible without scrolling.
- [ ] Portfolio uses 32px square marks, sparse dates, one selected-date readout, exact accessible values, and touch targets of at least 44px.
- [ ] Home and Tasks prioritize task titles, aligned completion/deadline anchors, inline context, restrained chips, and useful work over decorative statistics.
- [ ] Project detail uses broad work plus a narrow ownership/deadline/blocker column; tabs sit directly above content.
- [ ] Schedule, Documents, Updates, Organization, Settings, and all six divisions retain their specified distinct working compositions.
- [ ] Opaque reading/plot surfaces remain stable. Glass is limited to floating controls and overlays. Folder tiles, repeated descriptions, decorative eyebrows, unnecessary card shadows, and nested containers are removed.
- [ ] No staggered entrance delays records; all acceptance screenshots are settled frames compared directly with the supplied references.

## Functional journeys

- [ ] Start an empty workspace and inspect all primary destinations without runtime errors.
- [ ] Existing three-store data remains intact after loading the new UI and after reload; example records never overwrite saved work.
- [ ] Create/edit a project and task; assign a member/date/priority; switch list, board, timeline; verify the same record and filters.
- [ ] Complete a task; verify persisted completion timestamp, project progress, selected-day chart/list, and activity; reload and re-check.
- [ ] Dissolve occurs only after a successful save. Undo restores the same ID, previous completion state, and links. Rapid repeated actions do not lose records.
- [ ] Create milestones, blockers, dependencies, decisions, and evidence; resolve/update them and verify cross-page links.
- [ ] Add a document/link, preview/open it, create a revision, reload, and retrieve attachments; missing files and quota failures display actionable errors.
- [ ] Create/edit a timed meeting; verify actual start/duration; link minutes, decision, and follow-up task. Date-only tasks stay in all-day section.
- [ ] Consulting PL/PM, review, scope, and readiness workflow works through reload.
- [ ] Partner ownership, stages, notes, follow-up date, and linked project work through reload.
- [ ] Legal request/revision/signature-status and provisional local numbering work; labels do not imply external signature execution.
- [ ] Finance request, recorded approval/payment state, and IDR budget values reconcile locally.
- [ ] HR, Strategy, and Marketing records and their distinct visualizations work through reload.
- [ ] Open-app and reopening reminders do not duplicate due items; the UI does not promise delivery while closed.
- [ ] Search finds the advertised local record types; selecting a result opens the correct record.
- [ ] Filtered report, CSV, and print contain the selected records and correct counts. Export scope is explicit.

## Chart truth and interaction

- [ ] Count bars match dated, currently completed tasks; unknown legacy completion dates are not invented.
- [ ] Average includes known zero days, excludes today/future/unobserved days, and handles an empty denominator.
- [ ] Today is marked partial. Reopening/deleting a task changes current-record counts as explained by chart help.
- [ ] Date capsule, focused/touched mark, exact values, and detail list synchronize through resize, filters, and navigation.
- [ ] Axes remain stable within a comparison interval; all marks use accurate scale and visible units.
- [ ] Project progress denominator matches all linked tasks; an empty project says “No tasks yet.”
- [ ] Finance allocation/committed/paid values are labeled and do not silently double-count.
- [ ] Every chart has an accessible value list, empty/missing states, keyboard and touch operation.
- [ ] Stage/horizon charts select or filter actual underlying records, not inert illustrations.

## Overlay and motion checks

- [ ] Status/date/owner/filter menus stay anchored with 8px gap and flip/shift at all viewport edges.
- [ ] Inspectors preserve list context on desktop and form a usable full-screen detail on mobile.
- [ ] Search, confirm, short choices, chart details, bulk actions, and toasts follow the placement table.
- [ ] Escape closes the appropriate top layer; focus returns logically; modal focus does not escape; accessible labels are present.
- [ ] Drafts survive harmless navigation/dismissal, or explicit discard confirmation prevents accidental loss.
- [ ] Sticky date/filter controls reserve space and never cover focused content, chart marks, dock, safe areas, or mobile keyboard.
- [ ] Small scroll movements do not repeatedly restart sticky transitions.
- [ ] Reduced motion removes spatial/blur effects; reduced transparency produces designed solid controls.
- [ ] Failed saves keep content and state visible, report failure, and offer recovery.

## Visual matrix

Inspect these widths: **1440, 1024, 768, 390, 360px**. Check 200% zoom, mobile keyboard, long titles, long Indonesian labels, empty and dense data. Use actual browser rendering, not only CSS review.

| Surface | Light EN | Dark EN | Light ID | Dark ID | Required special state |
|---|---|---|---|---|---|
| Home / weekly activity | pending | pending | pending | pending | selected day, partial today, zero data, sticky scroll |
| Tasks / inspector | pending | pending | pending | pending | long task, menu edge, bulk selection, error, Undo |
| Projects / detail | pending | pending | pending | pending | empty project, progress, blocker, timeline |
| Schedule | pending | pending | pending | pending | timed meeting, all-day deadline, mobile keyboard |
| Documents | pending | pending | pending | pending | empty, preview, revision, missing attachment |
| Updates / Organization | pending | pending | pending | pending | no updates, due work, filtered export |
| Six division views | pending | pending | pending | pending | stage selection, saved edit, empty data |
| Settings / search | pending | pending | pending | pending | system theme, locale switch, solid glass, reduced motion |

Look specifically for consistent outer padding, panel padding, control heights, icon strokes, baseline alignment, radii, truncation, line height, selected states, contrast, and restrained glass. Compare desktop composition to CRM/task 12/02/09, and mobile charts/grouped surfaces to Samsung 60–63. In each viewport, use the same record set for before/reference/result assessment; never fabricate history to make a chart more attractive.

## Required evidence package

1. Test/build commands, results, environment, and date. Existing domain tests must remain green; add meaningful checks for new local workflows, date math, undo, persistence, and overlay lifecycle.
2. Screenshots across the visual matrix, including final desktop Home/project and mobile Samsung-inspired chart/scroll states.
3. Side-by-side or adjacent source/result references explaining the exact copied pattern and adaptation.
4. Short recordings: selected chart day → detail; expanded → sticky filters; anchored menu; task edit → completion → dissolve → Undo.
5. Explicit remaining gaps and unverified cases. “Rendered,” “source-inspected,” and “interaction-tested” are different evidence levels.

Do not mark this checklist passed from screenshots alone. A passing build does not establish visual quality, and a pleasing screen does not establish persistence or data correctness.
