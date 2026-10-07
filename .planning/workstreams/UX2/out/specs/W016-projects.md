# W016 · Projects, programs and the project page

**Packages:** W016 (frontend), W031, W032, W103, W106 (WRK). **Stories:** S086 (programs).
**Requirements:** work_projects_register, work_overview, work_project_tabs, work_project_lifecycle, access_project_creation_cd, access_project_collab, work_milestones, work_decisions, work_blockers, work_dependencies, timeline_dependency_semantics, work_subtasks, work_programs, work_type_model, measure-project-row, analytics_progress, changes-scope, design-shaders. Owner decisions D36, D38, D39, D40, D46, D47.
**Prototype:** `prototype/plan.js` (projectsRegister, projectPage, projectOverview, projectForm, wbsTab, INSP.ms, programs), `prototype/work.js` (ganttV2 project mode, WBS model).

---

## 1. Projects register

**Route** `#/projects`. Header: "Projects", the workspace name and count; buttons **New program** (Directors and above) and **New project** (Co-Directors and above, access_project_creation_cd).

**Scope tabs** (with counts; remembered per person):

| Tab | Shows |
|---|---|
| {Workspace short name} | projects the workspace owns |
| Shared with {workspace} | joint projects the workspace's people joined, and organization-wide projects run by another division (D38, D39) |
| Organization-wide | projects marked organization-wide (any division) |
| All divisions | every project; President, VPs and Admin only |

**Toolbar:** search ("Find a project"), stage filter (the owner's stage set: All stages, Draft, Planned, Active, In review, Completed, On hold, Cancelled, Archived, with their icons), sort (Stage, Target date, Start date, Name), **Group by program** toggle, view switch **Rows, Grid, Timeline** (Grid is the default).

**Views:**
- **Rows:** 76 px rows (measure-project-row, W016 acceptance 1), grouped by stage when sorted by stage (Cancelled and Archived groups start folded). Columns: art tile, name with origin tag (Joint with {division}, Organization-wide) and "Created by {who}, {date}", lead, progress (tasks done of total, bar), next milestone, needs attention (blockers, items in review), target date (red when late).
- **Grid:** cards with identity art on top (text never on the art; tag and target date beside it), stage and start, name, goal, progress and next milestone, lead and attention.
- **Timeline:** one band per project from start to target, filled by tasks done of total (counted, not a health score), today line.
- **Group by program:** each program as a group header (program icon, name, owner, period, "{n} projects, {n} operations", Open program), then its projects in the current view; then "Not in a program".

**States:** empty workspace: "No projects yet" with "Start one with New project" (leaders) or "Co-directors and above create projects. You can still add your own tasks in My Work." (members). No match: "No projects match" with "Clear the search or choose All stages." Loading: card skeletons. Error: "Could not load projects. Retry".

**Size:** M.

## 2. Create and edit a project

- Side panel form: name (required), goal, in scope and out of scope (one per line), lead, PM (optional), start, target (not before start), stage on create (Planned, Draft, Active), **Organization-wide** switch (President, VP, Admin only, D39).
- Creating assigns the identity look once (shared.md section 8) and writes Changes "created project". Co-Directors and above in the workspace only; members get a neutral denial and there is no template or duplicate path around it (W016 acceptance 3).
- **Events:** created, edited (from and to per field). **Size:** S.

## 3. Project page frame

**Route** `#/projects/{id}/{overview|wbs|work|resources}`. Exactly four tabs (work_project_tabs, D46, W016 acceptance 2).

**Header:** hero art tile, name, stage (a menu for editors), lead and PM faces, start to target, the program chip ("Part of {program}", or "Add to a program" for editors when the division has programs), Edit details.

**Stage rules (work_project_lifecycle):** On hold and Cancelled need a reason (shown on Overview). Completed is refused while an open blocker, an item in review or no lead exists, and the refusal says which. Every stage change writes Changes with from and to.

**Denied:** a project outside the viewer's scope shows the neutral denial page without its name.

## 4. Overview tab

| Part | Content |
|---|---|
| Goal and stage reason | `goal`, `reason` |
| Scope | In scope, Out of scope lists |
| Brief | the project's one brief note (rich text: headings, lists, bold, italic, https links, in-app links); editors edit in place with honest Unsaved, Saving, Saved, Could not save states (resource_revisions) |
| Links and folders | link tiles with favicons (D37) and project folders (W017) |
| Milestones | title, owner, state, target; next one marked; Add a milestone (title, owner, target) |
| Open blockers | text, severity, who can unblock, task |
| Decisions | question, result, state; Record a decision (question, proposed result, who decides) |
| Recent changes | last five, link to all changes for the project |
| Side column | Progress (tasks done of total, "Counted from saved tasks. Not a health score."), next milestone, People (lead, PM, team with Joined, Invited, Declined; Add people; people from other divisions are invited and join only after accepting, D38), workspace and "Also with" divisions, start, target, created by |

An invitation notice shows at the top for someone invited to a joint project (Accept, Decline).
**Size:** M.

## 5. Programs (D47, W106)

**What:** an umbrella with a goal, owner and period that groups related projects and operations. A project or operation is in at most one program and keeps its own page and ID.

**Route** `#/programs/{id}`; `#/programs/new` for the create form. No sidebar item; reached from the registers' group headers, the program chips and the Projects header.

**Program page:**
- Header: program icon, "Program of {division}", name, goal, owner, period, "Created by {who}, {date}", Edit details (owner, creator, Directors and above of the division).
- Four counted tiles: Projects ({n} active, {n} ended), Tasks done ({d}/{n} with bar; routine runs excluded), Milestones achieved, Runs done so far. Note: "Counted from the projects and operations below. Nobody types a percentage."
- **Timeline:** one chart for the program's period: each project as a bar from start to target filled by tasks done, with its milestones as diamonds; each operation as its runs (done, late, overdue, open, coming up, skipped); the program period shaded; a today line; years in the label column header.
- **Projects** and **Operations** lists (art or icon, name, lead or schedule, stage or Running/Paused, counts), each with a remove button for those allowed, and **Add a project** / **Add an operation** pickers listing the division's items not yet in a program that the person may place.

**Create and edit form:** name (required), goal, owner (Co-Directors and above of the division), starts, ends (not before starts). Delete program (the children stay and lose the link).

**Permissions:** Directors, VPs, the President and Admin create programs in their scope (access_project_creation_cd pattern; a Co-Director gets the neutral denial "Programs are created by Directors and above" with "You can still place your own projects and operations into a program of your division."). Placing or removing an item: the item's own leads (project editors, routine editors) or the program's managers, only within the program's division. Removing a child changes the program, never the child.

**Events:** program created, edited, deleted; item added to or taken out of a program (Changes in the item's workspace). **Builder:** WRK (record, rules), Frontend. **Size:** M.

## 6. WBS tab (D46, W103)

**Model:** one tree of task records. A phase, or any item with parts under it, is a summary: its dates and progress roll up from its work packages (the leaves) and it never takes a status. Codes (1, 1.2, 1.2.3) follow sibling order. Tasks made in the Work tab are work packages outside the tree until placed. Milestones can be placed under a summary.

**Views:** tree map (horizontal or vertical, with drawn connectors and level icons) and a table.
- **Table:** one section per phase (tinted header row with roll-up dates and progress); columns WBS code, Phase and activity (level guides), Resources (faces), Days, Start, Finish, Predecessors, Remarks. Numbers right-aligned. Milestones as tagged rows.
- **Editing:** click a cell to edit (title, days, dates, remarks); right-click any row or box for Rename, Set days, Icon, Add a part, Add beside, Indent and Outdent, Move up and down, Responsible people, Details, Move to trash, plus reactions. Drag rows: left half drops beside, right half drops inside as the last part (O64). Keyboard: Alt+Up/Down among siblings, Alt+Left/Right change level.
- "Work packages not in the WBS yet" lists unplaced tasks with Place.
- Add a phase, Add a milestone.

**Permissions:** project editors (canEditProject). Others see read-only. **Events:** created, renamed, moved (parent and order), indented, outdented, trashed (Changes). **Builder:** WRK (tree, roll-up), Frontend. **Size:** L, the heaviest single item.

## 7. Work tab and the project timeline (D40)

- List, Board and Timeline over the project's work packages (same record as everywhere). List rows show the lead's face; done tasks fold.
- **Project timeline (Gantt, project mode):** rows follow the WBS (summaries as roll-up bars, phases tinted), milestones as diamonds that can be dragged to change their target (O50), side clusters for items outside the range.
- **Dependencies:** four types FS, SS, FF, SF on the successor (`deps [{id, type}]`); draw a link by dragging from a bar's connector to another bar, or add in the task panel. No self-links or cycles (checked across the chain). A link never moves dates by itself; a broken link is shown, and "Fix dates" opens a preview of the smallest forward shifts (durations kept) that the person confirms (timeline_dependency_semantics, timeline_protected_dates).
- **Events:** linked, unlinked, link type changed, dates fixed (one Changes entry per moved task). **Size:** L.

## 8. Resources tab

The project's resources in the Resources explorer component (W017), including project folders.

## 9. Milestone panel

Fields: name, target, owner, place in the WBS, linked tasks (done of total; link and unlink), Record as achieved (sets `achievedAt`, `achievedBy`; passing the date only marks it overdue, never done), Delete. For the President and VPs: "Show on the batch roadmap" (D32). Roadmap items are edited only by the President and VPs; others see "On the batch roadmap, set by the President and VPs".

## 10. QA checks

1. Default register rows measure 76 px; the project page has exactly four tabs (W016 acceptance 1, 2).
2. A member has no create path (button, URL, duplicate); a Co-Director creates in their workspace (acceptance 3).
3. A Director creates a program and places two projects and one operation; each keeps its ID and appears grouped in its own register; a Co-Director cannot create one but can place their own project; program progress changes when a child is removed and the child does not (work_programs acceptance 1–3).
4. A dependency never moves a date until Fix dates is confirmed; a cycle is refused.
5. Completing a project with an open blocker is refused with the reason.
