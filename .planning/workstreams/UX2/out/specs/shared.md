# Shared pieces (used by W015–W018)

Prototype reference: `prototype/work.js` (task panel, sign-off, people picker, reactions, icons, history, person panel), `prototype/plan.js` (identity art), `prototype/screens.css`.

---

## 1. Task panel (side panel for one task)

**Requirements:** work_task_fields, work_task_lifecycle, access_member_edit, access_delegation, work_blockers, work_dependencies, work_reactions_icons, work_routines, resource_tasks, work_undo_archive; D14, D27, D35, D41, D42, D44.

**Layout:** right side panel, 360 px on desktop (measure-inspector), full-screen sheet on phones. Keeps its own scroll while the same task stays open. Opening, closing or switching the panel counts as a page state for Back and Forward (D45).

**Sections, top to bottom:**

| Section | Fields (record) | Shown when |
|---|---|---|
| Header | icon `icon {n, c}` (button to change), title with @mentions shown as photo and name, reaction bubbles | always |
| Status | four buttons: Not started, In progress, In review, Completed (`status` todo, doing, review, done). Blocked is never a status: it shows from an open blocker | not a WBS summary row |
| Run box | "Part of {routine}", run date, checklist `checklist [{text, done}]` with ticks, "{d} of {n} steps", Skip this one (leaders), "Can't make it? Ask to skip or move this run" (doer) | task is a routine run (`routine`, `occ`) |
| Review notice | for the reviewer or signer: who finished it, evidence link, Approve, Ask for changes (reason required). For others: "Waiting for {who} to review" | `status` = review |
| Changes requested | the reviewer's reason | returned and back in progress |
| Blocker | text, who can unblock, severity, action needed; Resolve (optional note). Report a blocker form | open blocker or form open |
| Title | `title` | can edit |
| Due date and time | `due` (date-only), `time` (minutes, optional) | can edit |
| Planned start | `start` (date-only, needs due, start ≤ due) | can edit; drives the timeline bar |
| Repeat | Does not repeat, Every week, Every 2 weeks, Every month. Creates a personal routine | own personal task (no project) |
| Notes | `notes` | can edit |
| Evidence link | `evidence` (must start with https://) | can edit |
| Sign-off | see section 2 | sign-off applies or the viewer manages it |
| Responsible people | lead `owner` plus `assignees [{id, state, by, at, answeredAt, direct}]` | always (edit for those allowed) |
| Dependencies | predecessors and successors with type FS, SS, FF, SF; add, change type, remove | always (edit for those allowed) |
| Details | Mentioned, Reviewer, Project, Milestone, Created by {who} on {date} (D14) | always |

**States:** loading (skeleton lines), saved inline per field, save failed (field keeps the typed value, red help text "Could not save. Retry", nothing reported as saved), denied (read-only view of the fields the viewer may see; status buttons disabled with "Only {who} or the project lead can change this task"), removed ("This task was removed" with Undo if the viewer removed it).

**Permissions shown (canEditTask):** the lead, a joined responsible person, the creator, the current reviewer, the project lead or PM. Everyone else sees read-only. A WBS summary row shows its rolled-up dates and progress, not a status control.

**Events:** each field change writes one Changes entry for the task's workspace ("edited", with from and to for dates and status); status changes write "changed status of" or "completed"; mentions never notify as an assignment. Updates: review (to reviewer), approved or returned (to owner), blocker (to the person who can unblock), unblocked (to the owner).

**Builder:** Frontend (panel), WRK (fields, lifecycle, validation). **Size:** L.

---

## 2. Sign-off (D35, confirmed)

**Requirements:** work_task_lifecycle, access_delegation, work_routines, analytics_team_performance.

**When sign-off applies (computed by WRK, never chosen by the doer):**
- A task someone else gave you: the creator is not the lead (accepted offers and assignments).
- Every run of a division routine, unless the routine's leader turned sign-off off.
- Any task a leader marks "Sign-off: Needed" (`signoffMode` = on).
- Never for your own tasks or personal repeats, or when a leader set "Not needed" (`signoffMode` = off).

**Who signs off (first match, never the lead or a co-responsible person):**
1. A person chosen for this task (`signer`).
2. The routine's chosen signer (`routine.signer`), then the routine's creator.
3. The person who gave the task.
4. The project PM, then the project lead.
5. The division's leaders by rank (Director, then Co-Directors).

**Flow:**
1. The doer ticks the task or presses "Done, send to {name}". The task moves to In review with reviewer = signer, `doneBy` and `finishedAt` are recorded, and the signer gets an Update ("{who} finished this. Sign it off?"). The toast says "Sent to {name} to sign off", with Undo.
2. Ticking again shows "Waiting for {name} to sign off."
3. The signer (or a leader above the doer, the giver, or the project lead or PM) chooses Sign off: status Completed, `signedBy`, `signedAt`. The doer gets an Update "approved". Or Ask for changes, with a reason: back to In progress, the doer gets "returned".
4. Reopening a completed task clears the current sign-off; the history stays in Changes.

**Shown in the task panel:** for the doer, "Sign-off: {name} checks it before it counts as done". For managers, a Needed / Not needed switch and a select of possible signers; for a done task, "Signed off by {name}, {date}".

**Counting rule (D30, DHR):** a delegated task or a run counts as completed in performance views only when signed off.

**Events:** sign-off requested, signed off, returned, sign-off mode changed, signer changed (Changes entries; Updates review, approved, returned). **Builder:** WRK (rule, server enforcement), Frontend (controls). **Size:** M.

---

## 3. Several responsible people (D44)

**Requirements:** access_delegation, access_project_collab, work_task_fields.

- One lead (`owner`) plus any number of people in `assignees`. People from the same division or the Presidency are added directly (`state` joined, `direct` true, Update "tadded"). People from another division are asked (`state` invited, Update "tasked"). The task is shared with them only after they accept; they can decline.
- Joined people see the task in My Work, can edit it and appear as faces on rows and bars.
- The panel lists each person with their state (Joined, Asked, Declined), who added them and when, and Remove for those allowed (lead, creator, project lead or PM).
- Events: added, asked, accepted, declined, removed (Changes; Updates tasked, tadded, tasked-yes, tasked-no). **Size:** M.

---

## 4. Person panel (D33)

**Requirements:** availability_person_inspector, onboarding-profile, access_availability_privacy_policy.

- Opens from any avatar, name chip or @mention (except inside pickers and the person's own controls). Panel: photo, full name, division and function, role icons, Admin or Board badge; LinkedIn and phone if the person shares them (the person can hide their phone); date joined.
- Actions: Ask for a task (opens an offer to them), Find a time (opens the composer with them).
- **Week calendar** with previous and next week. A meeting shows its title only if the viewer organizes it or was invited, or it belongs to the viewer's own workspace or an organization-wide project. Everything else shows "Busy". Unavailable time shows "Unavailable" with no note; Google busy shows "Busy". SCH must return this redacted week from the server; the client never receives hidden titles.
- **Between you two:** open tasks and pending offers between the viewer and that person in full; other tasks only if the viewer could already see them.
- On your own panel: edit LinkedIn and phone, hide phone. Events: profile field changed (Changes for the person only, no notification). **Size:** M.

---

## 5. People picker

**Requirements:** access_delegation, work_meeting_composer, D27.

- Two levels: the Presidency and divisions first; hovering or pressing Right shows that group's members with photo, nickname and role. Typing filters across everyone. Keyboard: Up, Down, Right, Left, Enter, Tab, Escape.
- Used by quick add (@), the composer, Schedule "Meet with", responsible people and the builder's "Who does it?".
- Hidden IT accounts never appear (IAM supplies the filter). **Builder:** UX1 component, data from IAM. **Size:** M.

---

## 6. Icons and reactions (D41, D42)

**Requirements:** work_reactions_icons, W104.

- **Icon:** any task, meeting or routine can carry one line icon and one color (`icon {n, c}`; about 70 icons, 8 colors or a custom hex). The empty icon button appears only on hover of the title ("Icon"). Changing a routine's icon updates its unfinished runs.
- **Reactions:** right-click any task row, meeting, Gantt bar or WBS row for a bubble of six emoji plus More. One reaction per person per item; choosing another replaces it; tapping your bubble removes it. Bubbles show the emoji and count; clicking a bubble shows who reacted.
- The item's owner gets one Update per reaction while unread (react-task, react-meeting). A reaction never counts as approval or consent.
- **Builder:** UX1 (bubble, picker), WRK (storage). **Size:** M.

---

## 7. History: Undo, Redo, Back, Forward (D45)

**Requirements:** work_undo_archive, changes-undo.

- Top bar: Back and Forward over page states (route plus open panel plus scroll), then Undo and Redo with the last action's name in the label. Ctrl+Z and Ctrl+Y (Cmd on Mac). Up to 50 steps.
- Every change made by a click joins the stack with the same function the toast's Undo uses. Undo writes a reversing change to the server; it does not erase Changes history.
- Prototype workaround: the history buttons are injected by work.js (request R14 asks UX1 to own them in the shell). **Builder:** UX1. **Size:** M.

---

## 8. Identity art (D36)

**Requirements:** design-shaders, design-resource-identity, W105.

- Each project and resource has `look = {f, p}` (shader family and palette), chosen once at creation as the least-used among its siblings and never recomputed, so art never changes when the record is edited.
- Art renders from the record ID plus look in one shared WebGL context as a still image; it animates only while hovered; no animation under reduced motion or in a hidden tab; a CSS gradient fallback without WebGL. Text is never placed on the art.
- Families: project (liquid), folder (layered), note (paper, neutral), link (favicon squircle instead of art, D37). **Builder:** UX1. **Size:** M.

---

## 9. Form controls and wheel rules

- Every select and date input uses the custom control (cfUpgrade in work.js): due-date fields show a red finish flag icon, planned-start fields a green start mark (O33). UX1 should adopt it into the design system.
- Mouse wheel over any sideways scroller (Gantt, boards, week strips, timelines) scrolls sideways until the edge, then the page scrolls. Over sticky label columns the wheel stays vertical. Shift+wheel stays native (O60).
- Scrollbars: thin, square, thumb only while the pointer is over the area (R10, UX1).

---

## 10. Update types the screens rely on (for SIG)

offer, offer-accepted, offer-declined, offer-changes, review, approved, returned, invite, rsvp-yes, rsvp-no, changed, cancelled, minutes, blocker, unblocked, decision, decided, overdue, link-issue, delegated, pinvite, padded, pinvite-yes, pinvite-no, tasked, tadded, tasked-yes, tasked-no, react-task, react-meeting, run-ask, run-ask-ok, run-ask-no.

One Update per recipient and trigger, deduplicated while unread (work_updates). The Updates page groups by day and has a "Your replies" view listing invitations, offers, reviews, decisions and project invitations addressed to the person, with Not replied or the recorded choice.
