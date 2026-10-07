# DWDG’ONE — member task controls and availability calendar

Discussion revision · 5 October 2026. Latest direct user requirements take precedence over earlier task/calendar assumptions. No app/storage/service changes are made here; the seeded v0.2 editor remains unmerged with this discussion.

## Confirmed user requirements

1. CD is the abbreviation for Co-Director.
2. Ordinary members can add, edit, and delete their own tasks.
3. Every ordinary member can record dates/times when they are completely unavailable, with notes, through a calendar option.
4. The attached WhatsApp video is a scheduling interaction reference.
5. Earlier requirements remain: everyone has consultant and division functions; cross-person task assignment requires consent; only CD/Co-Director and higher can create projects.

Ownership boundaries for tasks created by one person and accepted by another are not fully specified by “their own.” Recommended behavior below distinguishes personal tasks and shared accepted work without requiring CD approval for personal task CRUD.

## Video reference evidence

Source: `C:\Users\muhma\Downloads\WhatsApp Video 2026-10-03 at 02.13.34.mp4`. Inspected 5 October 2026. File duration approximately 27.49 seconds, video 576 x 1280. Nine cropped samples across the clip show:

- Compact event composer with a date selector, title input, duration controls, and booking action.
- Participant addition while editing the event title; person rows are inserted into the timeline.
- Horizontal busy-time bars per participant.
- Vertical selected-time window spanning participant rows.
- Duration changes and repositioned time window.
- Green nonconflicting selection, red conflicting selection, and inline conflict message.
- Suggested time shortcuts and a selected event summary.

Evidence: `references/availability/video-contact-sheet.jpg` (full-frame samples) and `references/availability/meeting-interaction-sheet.jpg` (cropped interaction samples). Samples establish visible states/sequence, not exact animation timing, narration, verified natural-language parsing, an implemented scheduling engine, external-calendar integration, or the hidden provider's data semantics.

For DWDG use manual participant selection and explicit date/time controls as a complete baseline. Optional title-based participant recognition is not a launch dependency. Do not import the surrounding social-media/player UI as application design. Keep the previously agreed solid-surface direction.

## Member task CRUD

### Personal/self-managed tasks

- Member creates standalone task with title, optional notes, due date/time, status, and optional permitted contextual link. A project is not mandatory.
- Member edits their own task and sees the saved result through the same ID in My Work and calendar when relevant.
- Member deletes their own task without leadership approval. Recommend recoverable trash/Undo with explicit retention to decide; no silent reseeding or deletion of unrelated resources.
- Date-only due date is displayed separately from a timed meeting/busy interval. Task count or due date does not establish actual hours or availability.
- Personal-versus-shared visibility is a pending product policy; a personal task should not silently become a public project record by association.

### Tasks in shared/accepted work

- Members can create permitted tasks inside an accessible project; project-creation threshold does not prohibit member task creation.
- Assignment to another person is an offer until that person accepts the identified version.
- Recommend assignee control over progress, evidence, checklist, comments, and permitted task detail; requester/context lead handles changes to the agreed deliverable/scope with explicit recipient acknowledgment where material.
- Deleting/removing a shared task should record cancellation/removal, notify permitted participants, and preserve prior consent/change history. It must not claim completion or silently erase deliverable/payment/review evidence.
- If an assignee wants the task removed from their responsibilities, provide explicit withdrawal/reassignment rather than deleting the requester's entire history. Precise requester/assignee shared-delete powers remain to decide.
- Who created, requested, accepted, owns, and reviewed a task are separately recorded. Ordinary member cannot edit/delete others' tasks solely because everyone is a consultant.

## Unavailability records

Recommended fields: block ID, person ID, start, end, timezone, all-day flag, optional repeat rule, note, note visibility, author/editor/version, and cancellation/history. Use Asia/Jakarta display default; exact stored instants preserve timezone semantics. All-day ranges and cross-midnight intervals require explicit date semantics; reject end <= start.

Member self-service flow:

1. Open Calendar -> My availability or choose Block unavailable time.
2. Select date(s) and start/end or All day; optional weekly repeat for recurring classes/other commitments.
3. Add optional note and its sharing setting. Recommend showing others “Unavailable” plus time while keeping detailed explanation private by default, with deliberate sharing when useful. This visibility policy is a recommendation, not confirmed.
4. Save one block; show it on own calendar and relevant authorized participant availability view.
5. Before save, show conflicts with accepted meetings/obligations. Creating the block does not automatically cancel those records or fabricate an approved absence.
6. Member edits/deletes their own blocks. Recurring edits offer This occurrence / Future occurrences / Entire series; changing future recurrence preserves past record history.
7. Changed availability flags affected upcoming meetings/proposals for explicit review; notify relevant permitted organizer/participant under adopted notification policy.

Self-reported unavailability does not require HR approval as a baseline proposal. It is not an HR leave/absence approval or training exemption. HR attendance and excuse decisions remain linked but distinct records.

## Meeting scheduling flow informed by video

1. Organizer creates draft with title, purpose/context, date, duration, participant selection, and location/meeting link if known.
2. Show a row for each selected member with their recorded busy intervals and a bounded common time axis. Concealed IT account is absent from picker.
3. Choose time through draggable selector plus keyboard/manual time inputs. Keep exact start/end visible and support narrow-screen vertical/scroll layouts.
4. Show overlap source/category without revealing private notes: recorded unavailable block or accepted meeting. Adjacent intervals that only touch at boundaries are not overlapping.
5. Show green/no-recorded-conflict versus red/known-conflict. If member has no declared/known schedule, label coverage unknown; do not say Everyone is free solely because the app has no data.
6. Offer candidate slots based only on recorded coverage. Task deadlines are not timed busy events; external Google/WhatsApp schedules are not read without a separately adopted integration.
7. Send proposed meeting/invitation; requested, accepted, declined, tentative/change-requested, confirmed, cancelled, and completed have distinct states as adopted. A time with no conflict is not participant consent.
8. Recommended hard-unavailability policy: unresolved overlap prevents treating the affected person as confirmed; organizer can propose alternatives rather than override their declared availability silently. Exact override/exception rules remain open.
9. Recheck current block/meeting versions at confirmation to catch changed availability. Failed save retains draft and no false Booked message.
10. Record confirmed meeting; date/duration/participant changes trigger updated invitation/review under adopted policy. A calendar event alone never marks actual attendance.

Only member unavailable block fields and approved meeting windows should be visible for coordination; no private calendar-title, grade, absence reason, or provider credential leakage. Role hierarchy and accepted task access remain separately enforced.

## Changes, permissions, and preservation

Personal availability/task changes need private owner-visible history. Shared changes appear only in the appropriate authorized workspace/record context. Do not place every member's private task or unavailable-note contents in the current workspace Changes feed by default. Cross-division task uses canonical source plus explicit access rather than duplicated records.

Admin highest-authority operations remain recorded; editing somebody's availability/consent must not impersonate their self-declaration or acceptance. Ordinary leadership cannot invent availability by deleting a member's block through an unrelated project edit.

## Proposed acceptance scenarios

1. One ordinary active member can create, edit, reload, and delete one own standalone task without a CD role, while creating zero projects.
2. One own-task deletion preserves zero unintended deletions of linked files/meetings/other tasks and has the adopted Undo/trash outcome.
3. One task offered to another member creates zero accepted assignments before consent.
4. A 09:00–10:00 unavailable block conflicts with 09:30–10:00 and does not conflict with a meeting starting exactly 10:00, using consistent half-open interval rules.
5. A seven-occurrence recurring block creates seven distinct occurrences/references; edit This occurrence changes exactly one, preserving the other six.
6. One private unavailable note appears zero times in another member's scheduling panel, search, notification, workspace Changes, or export.
7. A participant with no recorded coverage shows unknown, not a guaranteed free interval.
8. Changed availability between draft and confirmation is rechecked; zero false confirmed participants bypass unresolved conflict policy.
9. Creating an unavailable block changes zero historical attendance/grades/approved absence decisions automatically.
10. Every drag selection can also be set by keyboard/manual controls; exact times remain readable and do not depend only on color.

## Next decisions to settle

First: shared-task edit/delete/withdrawal powers and availability-note visibility. These determine the practical boundary of “own data.”

Then: notification delivery/reminders while the app is closed, meeting acceptance/conflict policy, recurrence/timezone conventions, and first-launch essential scope. Specify channels against actual operating budget; do not promise WhatsApp, email, or push integration merely because the UI contains a reminder.
