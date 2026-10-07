# UX2 build specs: W015–W018 (and the screens the owner added)

Status: draft for owner approval, 6 Oct 2026. Written by UX2 (Opus 5.5) from the clickable prototype in `prototype/` and the owner's review rounds O1–O77 (`UX2/out/owner-review.md`). Feature freeze applies while these specs are reviewed: new owner ideas go to `owner-review.md` and `REQUESTS.md`.

The prototype is the visual and behavioural reference. These specs say what to build, which records and rules sit behind each screen, and which stream builds each part. Where the prototype is only a simulation (Google sync, favicons, shader art, notifications), the spec says so.

## Files

| Spec | Screens | Packages | Main builders |
|---|---|---|---|
| [shared.md](shared.md) | Pieces used on every screen: task panel, sign-off, person panel, people picker, reactions and icons, undo and history, identity art, form controls, keyboard and wheel rules | W015–W018, W103, W104, W105 | UX1 (components), WRK, SIG |
| [W015-my-work.md](W015-my-work.md) | My Work (list, board, timeline), quick add, batch roadmap strip | W015, W100 | Frontend, WRK, SIG |
| [W016-projects.md](W016-projects.md) | Projects register, programs, project page (Overview, WBS, Work, Resources), dependencies, milestones | W016, W031, W032, W103, W106 | Frontend, WRK, IAM |
| [operations.md](operations.md) | Operations board, routine page, routine builder, runs, run requests | W099 (screens alongside W015/W016) | Frontend, WRK, SIG |
| [W017-resources.md](W017-resources.md) | Resources explorer and inspector, notes, links, folders | W017, W033, W034 | Frontend, RES |
| [W018-schedule.md](W018-schedule.md) | Schedule, unavailable time, meeting card and inspector, Find a time composer | W018, W035, W036, W096 | Frontend, SCH, ARC (Google sync) |

## How each spec is written

Every screen section has the same parts:
1. **Purpose and requirements**: the requirement IDs and owner decisions (D-numbers in `CONTEXT.md`) it implements.
2. **Layout**: regions, sizes that matter, responsive changes (desktop ≥ 1000 px, tablet 760–999 px, phone < 760 px).
3. **Fields**: what is shown and edited, with the record field behind it.
4. **States**: normal, empty, loading, error (save failed, offline), denied (no permission), plus record-specific states.
5. **Permissions shown**: who sees which control. A hidden control is never the only protection; the server (WRK, RES, SCH, IAM) enforces the same rule and returns a neutral denial.
6. **Events**: what each action writes: the record change, the workspace **Changes** entry (changes-scope), the **Updates** item for a person (work_updates), and the event SIG must deliver.
7. **Who builds it** and an **estimate** (S up to 2 days, M up to a week, L more than a week for one frontend developer; backend sized separately by the stream).

## Rules that apply everywhere

- **One record, many views.** A task, project, routine, meeting or resource has one ID. Every view (list, board, timeline, register, panel) reads and writes that record (work_work_views, resource_inspector).
- **Facts only.** No invented health scores, ratings or percentages typed by hand. Progress is counted from records: tasks done of total, milestones achieved, runs done (analytics_progress, D30).
- **Who did what.** Every item shows who created it and when, separately from who is responsible (D14). Every action that changes shared work writes one Changes entry with actor, time, and from and to where useful.
- **Undo.** Every change made by a click shows a toast with Undo, and joins the history stack (Ctrl+Z, Ctrl+Y; D45). Undo restores the exact previous record values; it never deletes history entries the server already wrote, it writes a reversing change.
- **Neutral denial.** When someone opens something they may not see or do, they get "This page is not available to you" or a plain sentence saying who can do it, never a leak of the hidden title (access_member_scope).
- **Save honesty.** A failed save keeps the person's input, says it failed and offers Retry; it never shows Saved (S018 acceptance 3, resource_revisions).
- **Copy.** English uses US spelling (D43); Indonesian uses formal "Anda". No em dashes or middle-dot chains in copy (design rules). Every string is in the i18n dictionary.
- **Design rules.** One green accent; horizontal hairlines only, no vertical rules or side stripes (D26); states are an icon plus a coloured word; circular photo avatars; text never on shader art (D20, D36).
- **Dates.** Date-only fields stay date-only; a time shows only when set. All dates are Asia/Jakarta (org_timezone_calendar). Overlap is half-open: 09:00–10:00 clashes with 09:30 and not with 10:00 (availability_overlap).

## Stream responsibilities in one table

| Concern | Builder |
|---|---|
| Shell: sidebar, top bar, history buttons, search, New menu, toasts, dialogs, design tokens, form controls, scrollbars | UX1 (requests R6, R10, R12, R14, R16, R17 in REQUESTS.md) |
| Task, offer, project, program, milestone, dependency, blocker, routine, run, sign-off records and rules | WRK |
| Resources, notes, revisions, links, favicons, folders | RES |
| Calendar items, unavailable time, availability, meetings, Google Calendar sync | SCH (sync design by ARC, D24) |
| Who may see and do what (scopes, roles, Board accounts) | IAM |
| Updates delivery, reminders, event fan-out | SIG |
| The screens in these specs | Frontend maintainer (W015–W018), using UX1 components |

## Size and priority at a glance

| Item | Spec | Priority (D48) | Frontend size | Note |
|---|---|---|---|---|
| My Work list, groups, rail | W015 | P0 | M | |
| Board view | W015 | P0 | S | |
| Task timeline (Gantt) with drag, ranges, collaborators lane | W015 | P0 | L | shares the Gantt component with projects |
| Quick add with @mentions, day and time | W015 | P0 | M | |
| Task panel (all fields, review, blockers, links) | shared | P0 | L | |
| Several responsible people (D44) | shared | P0 | M | |
| Sign-off (D35) | shared | P0 | M | rule lives in WRK |
| Reactions and icons (D41, D42) | shared | P0 | M | |
| Person panel with shared-only calendar (D33) | shared | P0 | M | SCH supplies the redacted week |
| Undo/redo and back/forward (D45) | shared | P0 | M | UX1 shell |
| Batch roadmap strip (D32) | W015 | P0 | S | |
| Projects register: scopes, sort, rows, grid, timeline | W016 | P0 | M | |
| Joint and organization-wide projects (D38, D39) | W016 | P0 | M | IAM grants |
| Programs (D47) | W016 | P0 | M | |
| Project Overview tab | W016 | P0 | M | |
| WBS tab: tree views and table, drag levels (D46) | W016 | P0 | L | heaviest item |
| Project timeline with four dependency types (D40) | W016 | P0 | L | |
| Operations board, routine page, builder (D31, D34) | operations | P0 | L | |
| Run requests (skip or move) | operations | P0 | S | |
| Resources explorer, inspector, notes with revisions | W017 | P0 | L | |
| Link favicons (D37) | W017 | P0 | S | RES caches server-side |
| Identity art (D36) | shared | P0 | M | UX1 W105 |
| Schedule day, week, month with drag and keys | W018 | P0 | L | |
| Unavailable time editor | W018 | P0 | M | |
| Meeting card, inspector, outcomes | W018 | P0 | M | |
| Find a time composer (R046) | W018 | P0 | L | |
| Google Calendar two-way sync UI (D24) | W018 | P0 | M | SCH and ARC build the sync |

Every item is P0: the owner decided that every prototype feature is in the pilot build (D48). **Total:** 27 items (4 S, 15 M, 8 L), about 97 to 163 developer days for one frontend developer, roughly 19 to 33 weeks, plus the backend work sized by WRK, RES, SCH, IAM and SIG. Two frontend developers in parallel bring the frontend to about 10 to 16 weeks.
