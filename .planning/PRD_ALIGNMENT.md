# Prototype and design system vs the planning workspace

Claude wrote this on 6 Oct 2026, after reading the complete `PLANNING_WORKSPACE.md` (revision 4: PRD 772 nodes, WBS 102 packages, Kanban 96 cards, story map 76 stories). The cited digest is in `PRD_DIGEST.md`. IDs are PRD node, WBS package (W) or story (S) IDs.

## 1. Why the work drifted

Claude read only parts of the workspace and filled the gaps from references and guesses. That caused three kinds of drift:
- the invented divisions;
- features that no requirement asks for;
- missing P0 items that the PRD defines in detail (blockers, milestones, task states, Updates, EN/ID).

From now on, every screen change cites the requirement or story it serves.

## 2. What already matches

| Prototype feature | Plan source |
|---|---|
| My Work is the landing page | D12, `onboarding-first-view`, `flow-accept-landing` |
| Own task with no project; edit; trash with Undo; created-by | S011, S012, `access_member_edit`, `work_undo_archive`, D14 |
| Project creation only for CD and up (button hidden for Member) | S017, `access_project_creation_cd` (confirmed) |
| Project pages have exactly Overview / Work / Resources | `work_project_tabs` (confirmed) |
| Project stages: Draft, Planned, Active, In review, On hold, Completed, Cancelled, Archived | `work_project_lifecycle` |
| Folders, notes with revisions, links; "added by"; make a task from a resource | `resource_types`, `resource_creator`, `resource_tasks`, S020, S022 |
| Members mark unavailable time with a note; unknown is never shown as free | `work_availability` / `availability_declared` (confirmed), `availability_stale`, S024 |
| Meeting composer with per-person availability rows, natural-language input, drag or arrow keys | W018, S026, reference R046 |
| Accept or decline a meeting invitation; no auto-accept | S027, `availability_override` |
| Light/dark theme following the system | `design-preferences` |
| Pending-member approval | `access_invitation` (simplified) |

## 3. Built outside the plan

Update, 6 Oct (UX2 review): the owner kept quick-add @mentions (D27) and asked for horizontal hairlines between sections (D26).

Each item lists Claude's recommendation. The owner can overrule any of them.

| Item | Plan status | Recommendation |
|---|---|---|
| **People** page as a main destination | The PRD has **Organization** (`work_organization`: units, projects, leads, milestones, blockers) plus member search (S003). It has no People directory destination | Replace it with Organization. People stay findable through search and avatars |
| Quick-add parsing in My Work ("Draft brief Fri @Salsa") | Not in the PRD. `design-actions` says creation asks only for the fields needed to start | Keep a plain title field with optional date. Drop the token parsing (it belongs to the meeting composer per R046, not task capture) |
| Greeting line and summary sentence on My Work | Not in the PRD. `work_home` warns against decorative headers | Remove it and lead with the attention list |
| Google-Calendar-style editor with Event / Busy / **Task** segments | Event and Busy map to W018/W035. A task with a clock time is allowed (`work_task_fields`), but a task must never occupy hours (W015, `design-availability-evidence`) | Keep Event and Busy. A task created there stays a due marker, not a block |
| "Suggested times" in the composer | Only in P1 (`design-availability-assignment`) and in the open `availability_override` | Keep it, labelled as suggestions from recorded data only |
| Pin | P1 (`resource_pin`) | Keep it; it costs nothing |
| Every unavailable block defaults to weekly | Recurrence policy is still open (`access_availability_privacy_policy`, S025) | Default to one-off, with Repeat weekly as an explicit choice |
| Phone tab bar: My Work, Schedule, +, Projects, Resources | `measure-mobile-dock`: 64px dock plus **More** | Add More (Updates, Organization, Settings) |

## 4. Missing for the agreed P0 slice

The D1 cut keeps these WBS packages at P0. The gaps are listed by package.

**W012 shell and navigation** (`design-navigation`, `design-shell`, `measure-shell`):
- Global destinations should be My Work, Projects, Schedule, Resources and **Updates**, with **Organization** and Settings as secondary.
- **Changes** goes in workspace navigation or inside Updates (`changes-location`).
- An ordinary member should see the workspace **identity only, not a one-item switcher** (`work_switch_context`).
- Sizes: the PRD proposes sidebar 216px, toolbar 56px and inspector 360px. The system uses 232, 52 and 340. Align the system to the PRD unless the owner prefers the current values.

**W015 My Work and task views** (`work_my_tasks`, `work_task_lifecycle`, S018):
- Sections: Overdue, Today, Upcoming, **No date**, Completed. The prototype merges overdue into Today and hides undated tasks inside Upcoming.
- Task states: **Not started → In progress → In review → Completed**, plus a **blocker** flag. The prototype only has done/not done.
- **List / Board / Timeline** views of the same tasks. The prototype has a list only.
- **Pending offers** from other divisions, with accept, decline or request changes (`access_delegation` confirmed, S013–S014).

**W016 projects** (`work_projects_register`, `work_overview`):
- Rows need **next milestone** and **open blocker**.
- Add Grid and Timeline alternatives.
- Overview needs in-scope/out-of-scope, PM, **milestones, blockers, latest decisions** and compact activity. None of those exist yet.

**W017 resources** (`resource_bubbles`, `resource_inspector`, both confirmed):
- **Avatar bubbles for owner plus contributors** (3, then +N). The prototype shows one owner avatar.
- **Right-click** plus a visible More button opening the same inspector. The prototype has no right-click.
- Short purpose note in the inspector (`resource_object_note`).
- Report a link that won't open to its owner (S023).

**W018/W036 scheduling and meetings** (`work_meeting_composer`, `work_meeting_outcomes`, S026–S028):
- The composer lacks **agenda, project/workspace, minute-taker and timezone**.
- Meetings have no outcomes yet: **minutes note → decisions → follow-up tasks**, held/cancelled with a reason.
- **Export .ics** per meeting (`integration-calendar`).

**W020 language:**
- **English and Bahasa Indonesia** are P0 (`design-languages` confirmed, D7 "Indonesian one tap away"). The prototype is English only.

**W013 forms:**
- Visible saving / saved / failed states and no false success. This matters less in a local prototype but should be represented.

**Updates inbox** (`work_updates`, S062; W037 is P1, but the navigation slot is P0):
- Assignments, review requests, due reminders and offers, with read/unread.
- This is the survey's number-one ask (reminders 8 of 8).

## 5. Conflicts between owner decisions and the PRD text

| Owner decision | PRD/WBS text | What to do |
|---|---|---|
| D23 "Google Calendar API is planned" | `scope_deferred` lists external calendar sync. `integration-calendar` says .ics first and defers sync. `flow-meeting` says "no Google Calendar sync assumed". W096/S076 are **later, P2** | **Owner choice needed** (see the question in chat) |
| D20/D21: Geist, green #00C25A, radii 12/8/6 | `design-typography` (Pretendard), `design-materials` (sage/mineral), `measure-radius-surfaces` (12/20/28) are all *proposed* | Update those PRD nodes to match D20/D21 through planner-cli |
| D12 My Work is the landing page | `design-navigation` lists both Home and My Work | Treat My Work as Home (`work_home` content lives there). Update the PRD node |
| D18 official names (MCIT, FnL, SnG) | Older nodes say MarCom IT and Legal & Finance | Rename the labels in the PRD |
| D6–D23 in general | Only in `DECISIONS.md`, not folded into the workspace | Fold them in as one reviewed patch |

## 6. Planning-workspace hygiene

- The Kanban doesn't track any of the design or prototype work. All product cards C001–C087 are in Backlog.
- W010 (visual direction) and W011 (tokens and components) have real evidence: the design system v2 and the owner reviews. They can move to **Review** with that evidence.
- W012–W018 can move to **Doing** while the prototype iterates.

## 7. Proposed next iteration (prototype only, no backend)

1. **Navigation:** Updates and Organization replace People. Member identity without a switcher. Phone More.
2. **My Work:** No date and Overdue sections; task states and blocker; pending offers; List/Board/Timeline.
3. **Projects:** milestones, blockers and decisions on Overview and rows.
4. **Resources:** contributor bubbles, right-click/More inspector, purpose note, can't-open report.
5. **Meetings:** agenda, minute-taker, project link; outcomes (minutes → decisions → follow-ups); .ics.
6. **EN/ID** toggle for all interface text.
7. Fold the decisions into the workspace and update the Kanban (owner reviews the patch first).
