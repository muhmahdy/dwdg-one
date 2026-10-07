# DWDG’ONE — Home and daily My Work

Verified 3 October 2026. This is the next local UI increment, not full PRD or production acceptance. The working PRD and its Open/Deferred decisions remain unchanged.

## Delivered behavior

- Home reads the same saved tasks as Work: assigned open tasks, overdue attention, recorded project blockers, projects in review, all-day task deadlines and related-project progress. Meetings remain explicitly unavailable until Schedule is implemented. No motivational copy, invented completion history or average is displayed.
- New My Work contexts default to the local demo administrator’s assignments. Existing saved contexts and task metadata are retained. List groups overdue / today / upcoming / no date / completed; search and project/date/status/person filters affect counts and the same canonical IDs in List, Board and the existing date-grouped Timeline.
- Completion/reopen, explicit editing, draft recovery and workspace Undo share the original task store. Selected tasks can receive one status update; hidden selected counts and unavailable selections are disclosed. The batch is one atomic save and one Undo, including after reload. Foreign task IDs and foreign workspace selection-context keys are rejected before writing.
- Linked tasks open their exact active resource in the same project/workspace. Back restores filters, selection, scroll origin and an unfinished task edit. Missing, archived, foreign and wrong-project links show a neutral unavailable message. A linked task’s source project stays fixed in the form.
- A failed draft write remains visibly unsaved across Save rerenders. Saved records and prior bytes remain unchanged. A successful retry clears the recovered Work error. Closed unstored drafts retain an honest warning, guard unload while storage remains unavailable, and can persist their exact text when storage returns.

## Actual evidence

[202 automated tests](tests.txt) pass and the [production build](build.txt) passes. The tests include the preserved app/domain checks and new assignment/filter/atomic batch/validation/failure/return regressions. Product data, planning, attachment and backup storage keys remain byte-for-byte unchanged in the integration harness. A final focus regression verifies that repeated navigation/view actions restore the exact Work/Board/Timeline trigger, including language rerenders.

The 32 final `home/work-{1440|1024|390|320}-{en-light|en-dark|id-light|id-dark}.jpg` images were inspected as actual rendering, including reinspection of all 16 Work images after shortening ambiguous filter defaults. See [visual audit](audit.md) and [DOM geometry](geometry.json). Native captures sometimes differ by a few pixels from the requested desktop viewport, as recorded in the audit; phone captures are exact. No horizontal clipping or overlapping controls was found in these List states. The desktop shell measures 216px / 56px. Ordinary My Work rows are 64px; long titles expand. Projects retain their separate 76px contract.

[Project Work at 320px](project-work-320-guard.jpg) verifies the shared More action stays in its trailing column. The final filter defaults read Project / Date / Status / Mine, or Proyek / Tanggal / Status / Saya; accessible names retain full scope.

Live interactions used the existing browser’s saved Marcom demo. Three clearly labeled illustrative tasks were created through the UI, with yesterday/today/missing target dates. The earlier note-linked review task was explicitly assigned to the demo administrator. Existing records were not automatically reseeded. The project now contains 10 tasks with 3 completed; the personal view contains 4 open tasks.

[Resource return](resource-return.json) records the recovered text, assigned-person filter and title focus. [Bulk completion/reload/Undo](bulk-live.json) records 2 completed tasks after reload and 0 after one Undo, restoring the four date groups. The separate integration tests cover selected IDs and scroll/draft recovery through reload.

[Display fallbacks](fallbacks-live.json) record an actual 44×44 Home completion target, `0s` task transition under reduced motion, solid surfaces and a hidden optical canvas with static material and no draw count. Normal motion and nonsolid surfaces were restored afterward. The WebGL identity remains a small prototype; its Deferred PRD status is unchanged.

[Short interaction recording](daily-interaction.mp4) is compiled from 10 actual browser frames: Home → My Work → unfinished edit → original note → Back with draft → Cancel → Complete → Undo → Reload → Home. Idle time is trimmed; frame holds and size normalization are used, with no generated tweening. It demonstrates outcomes, not continuous timing or physical touch behavior. The source frames remain `record-01.jpg` through `record-10.jpg`.

## Remaining scope and limits

The browser matrix covers initial Home and My Work List states; project Work has one additional narrow guard capture. Automated tests cover Board/Timeline identity and keyboard/filter/form outcomes, but these are not a complete browser matrix for those states. Physical devices, screen keyboards, screen readers, zoom/text-spacing, all role/denial contexts, exhaustive touch targets, continuous animation timing and GPU/battery behavior remain unverified.

Home completion activity, actual Schedule meetings/availability, task review/evidence/dependencies, deeper Overview, Updates, Organization, advanced Settings and six specialist division layouts remain incomplete. The current Timeline groups dates; it is not an interactive dependency/timeline editor. Local Changes and demo administrator fixtures do not establish server audit or authenticated permissions. No backend provisioning or migration occurred.

Next connected slice: Schedule’s saved meeting fields and truthful all-day task deadlines, feeding the existing Home agenda. Availability remains optional/proposed and should follow the supplied video when that interaction is implemented.
