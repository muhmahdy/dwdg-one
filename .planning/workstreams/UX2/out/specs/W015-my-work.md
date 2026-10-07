# W015 · My Work (list, board, timeline)

**Packages:** W015 (frontend), W028–W030 (WRK), W100 (roadmap strip). **Stories:** S018, S011.
**Requirements:** work_home, work_my_tasks, work_work_views, work_task_fields, timeline_unscheduled, access_member_edit, access_delegation, work_task_lifecycle, work_blockers, work_routines, work_batch_roadmap, design-timeline-interactions, measure-timeline, measure-board, flow-daily-triage, flow-daily-execute, flow-daily-return. Owner decisions D12 (landing page), D14, D27, D32, D35, D44.
**Prototype:** `prototype/work.js` (PAGES.work, mwList, taskBoard, ganttV2, roadmapStrip, quick add).

---

## 1. Page frame

- Route `#/work`, the landing page after sign-in (D12). Header: "My Work", today's date in words, then on the right the Roadmap button (only while the roadmap is hidden) and the view switch **List, Board, Timeline**. The chosen view is remembered per person (work_work_views).
- Below the header: the batch roadmap strip (section 5), then quick add (section 2).
- **Which tasks:** tasks where the person is the lead or a joined responsible person, not trashed, not WBS summary rows (myTasks). Pending offers are never in this set (W015 acceptance 3).

## 2. Quick add

- One line: plus icon, text input ("Add a task, for example: Sync with @Salsa Fri 14:00"; on phones "Add a task, @ to mention"), a Due date chip, Add.
- Understands, live, as you type: **@Name** (people picker, shows photo and name; a mention never assigns, D27), a **day word** (today, tomorrow, mon to sun, and the Indonesian words), a **time** (14:00, at 9.30, jam 14:00, pukul 14:00). A preview line under the input shows what was understood.
- Enter or Add creates one task: lead = the person, creator = the person, due and time as understood, `mentions`. Toast "Task added" with Undo. No project and no approval needed (access_member_edit, W015 acceptance 2).
- **States:** empty input does nothing; a save failure keeps the text in the input with "Could not add. Retry".
- **Events:** task created (Changes "created" in the person's workspace). **Size:** M.

## 3. List view (default)

**Layout:** two columns on wide containers (list, then a 290 px right rail); one column under 880 px container width with the rail on top as compact single-line rows. Measured with a container query, so an open side panel also switches it.

**Groups** (in order; each folds and the fold is remembered per person; Completed starts folded):

| Group | Rule |
|---|---|
| Overdue | due before today, not done. Title and count in red |
| Today | due today. Shows "Nothing due today." when empty |
| Later this week | due after today, up to Sunday |
| Later | due after this week |
| No date | no due date |
| Completed | done, newest first, last 20 shown, count of all |

**Row (38 px, one line):** tick, title (icon, @mentions inline with photo, reactions compact, state word when In progress, In review or Blocked), context (routine schedule with loop icon, or project name, or division short name, with the division icon), "+n" when later runs of the same routine are folded, faces of other responsible people, due (weekday this week, date otherwise, time if set, red when late). Under 600 px container width the context and faces hide.

- **Routine runs:** only the earliest open run of each routine is listed; the rest fold into "+n" (O74).
- Clicking a row opens the task panel (shared.md section 1). The tick toggles done; with sign-off it sends the task for sign-off instead (shared.md section 2) and the tick shows the In review mark.

**Right rail:**
- **Needs your response:** share requests (Accept, Decline in place), task offers (opens the offer), work to sign off or review ("{who} finished this. Sign it off?"), run requests for leaders ("{who} asks to skip {date}"), meeting invitations (Accept, Decline in place). First three, then "Show all {n}".
- **Meetings today:** time, title, faces of others. "No meetings today." when empty.

**Empty states:** a brand-new member with no tasks: Today shows "Nothing due today." and the rail "Nothing waiting for you."; quick add has focus. **Denied:** not applicable (own page). **Error:** if the list cannot load, a single line "Could not load your work. Retry" in place of the groups; the rail loads independently.

**Size:** M.

## 4. Board view

- Four columns by status (Not started, In progress, In review, Completed), 280 px wide with 16 px gaps (measure-board). Cards: title, blocker state, reactions, context or lead's face, due, a menu "Move to". Drag a card to another column changes status, with the same sign-off rule as the tick. Keyboard: the card menu does the same as dragging.
- A filter box above ("Filter my tasks"). **Size:** S.

## 5. Batch roadmap strip (D32, W100)

**States per person** (`rmMode` = line, open or hidden):
- **One line (default):** flag outline icon in green, "Batch 2026", a mini track of the batch year with a diamond per roadmap item (achieved green, late red outline), a green dot for today, and "Next: {item}, {date}, in {n} days". The whole line opens it. An × hides it.
- **Open:** "Batch 2026", "August 2026 to July 2027", the next item, collapse and hide buttons; the year with month ticks, a Today marker, items as diamonds with labels placed in up to four lanes so labels never overlap; clicking an item opens its milestone. Footer: for the President and VPs "Add a roadmap item" and "Or open any milestone and turn on Show on the batch roadmap"; for others "Set by the President and VPs. Click an item to see its milestone."
- **Hidden:** toast "Roadmap hidden. Bring it back with Roadmap at the top of My Work." with Undo; the Roadmap button appears in the header.
- **Data:** milestones with `roadmap: true` (any project; usually the organization plan project). Only the President and VPs set or change them (canMsEdit). No progress percentage.
- **Size:** S.

## 6. Timeline view (Gantt)

Shared Gantt component with the project timeline (W016 section 7); My Work uses the "mine" mode.

- **Ranges:** 1 week, 2 weeks, 1 month, 3 months; Today button; a date span label. Remembered per person.
- **Summary chips:** "{n} due this week", "{n} overdue", "{n} in progress" (counts, click filters). "Working with" faces of the people the person shares tasks with; clicking one filters to shared tasks (O38).
- **Rows:** grouped by project (art tile, name, count), then "Personal and division tasks". The name column is sticky and frosted: bars passing under it show softly, the grid pattern does not (O75). Rows can be reordered by dragging the name (left half = beside, right half = inside as a part; WBS rule, O64).
- **Bars:** planned start (green start mark) to due (dark red finish flag); due-only tasks are a marker on the due day, never a bar and never busy hours (timeline_unscheduled, W015 acceptance 3). Faces of responsible people sit inside the bar up to its end, then "+n" (O39). Reactions show beside the bar. Status colors follow the project stage colors (O7).
- **Interactions:** drag the bar to move, drag an end to change start or due; Left and Right move a day, Shift+Left and Shift+Right change due (design-timeline-interactions); add a task by dragging across empty grid cells (start and due from the days, O27); right-click a bar for reactions.
- Weekends shaded, today column marked, the wheel scrolls sideways (shared.md section 9).
- **Events:** one Changes entry per moved task ("edited", from and to span). **Size:** L.

## 7. Offers ("Task for someone else")

- From New: title, person (picker), due, optional note, optional linked resource or meeting. Creates an offer, not a task. The receiver sees it in Needs your response; Accept creates exactly one task with the links (resource_tasks, S022), Decline or Ask for changes with a reason.
- The sender sees the offer as pending in their sent list; a pending offer never adds to anyone's workload (access_delegation, W015 acceptance 3).
- **Events:** offer, offer-accepted, offer-declined, offer-changes (Updates); Changes on accept. **Size:** M (shared with W017 resource→task).

## 8. Permissions shown

| Action | Who |
|---|---|
| Create own task, edit, delete | any active member (no project, no approval) |
| Tick done | lead, joined people, creator, reviewer, project lead or PM; with sign-off, only the signer completes |
| Change dates on the timeline | same as edit |
| Add or change roadmap items | President and VPs |
| See a task in My Work | lead or joined people only |

## 9. QA checks (from the acceptance lines)

1. One task ID is the same in list, board, timeline and the task panel (W015 acceptance 1, S018 acceptance 1).
2. Creating, editing and deleting an own task needs no project and no approval (W015 acceptance 2).
3. A pending offer does not appear in the receiver's My Work and does not count as accepted work; a due-only task draws no bar (W015 acceptance 3, S018 acceptance 2).
4. A delegated task ticked by its lead goes to In review with the giver as signer; the lead cannot complete it.
5. Save failure keeps the typed value and never shows saved (S018 acceptance 3).
