# Owner review of the UX2 screens (6 Oct 2026, session 2)

Owner's words summarised; order = UX2 build order (highest impact first). Status is updated as items land.

| # | Screen | Owner said | Plan | Requirement / decision | Status (6 Oct) |
|---|---|---|---|---|---|
| O1 | Find a time | "If not the same as the reference it should be way better" | Match R046 fully (example prompts, tokens highlighted in the sentence, checking state, capsule with floating time pill, red clash, Book pill), then go beyond: a week strip showing where everyone is clear, people picked from the presidency/division menu | work_meeting_composer, R046, D9 | Done: highlighted sentence, examples, checking state, week strip, presidency/division picker, Meet toggle |
| O2 | Schedule | "As intuitive as Google Calendar, if not same it should be better" | Left panel with mini month and calendar list, event popover card anchored to the event, Google keyboard shortcuts (t, d, w, m, j, k, c), full titles on hover, title-then-time layout, day header opens the day | work_schedule, D23 | Done: left panel, event card, shortcuts, title-first events, day headers, phone toolbar, Day default under 1000 px |
| O3 | Projects | Each project should carry a randomised WebGL shader so projects are easy to tell apart ("I planned it in the PRD") | Deterministic per-project shader tile (rows, grid, header); static unless hovered; reduced-motion and no-WebGL fallbacks | design-resource-identity (P2), design-shaders (Deferred P2) → owner promotes; request to PM | Done: per-project shader tile, hue saved per project, hover animation |
| O4 | Resources | Same identity treatment as projects | Type-specific shader per item (folder material, note paper, sheet grid, link swirl) with per-item seed | design-resource-identity | Done: per-resource shader by type |
| O5 | My Work quick add | @ should open a menu of Presidency and divisions; hovering one opens its members with photo on the left, then nickname, then role | Two-level menu, keyboard too (Right opens, Left closes); typing after @ still filters | D27, work_task_fields | Done: two-level menu, keyboard, phone stack |
| O6 | Timeline / Gantt | "Feels bad and good at the same time"; mouse wheel must scroll left and right | Redesign: sticky labels and two-row header, planned start→due bars, markers for due-only, status colours, drag or arrow keys to move; wheel scrolls sideways | measure-timeline, timeline_unscheduled, design-timeline-interactions | Done: rebuilt Gantt, wheel scroll, drag and keys |
| O7 | Kanban | Icon colours not consistent with the same words elsewhere | Task statuses use the same colours and icons as the matching project stages (In review lime, Completed purple, In progress green) | design system rule 6 | Done |
| O8 | Updates | Unread dots are fine; add a category listing your responses: whether you replied and what you chose | "Your replies" view: invitations, offers, reviews, decisions with Replied (choice) / Not replied | work_updates | Done: Your replies view |
| O9 | Overall | "Be efficient, high quality, effective" | Fewer, better controls; verify each fix at 375 / 768 / 1440, light and dark | — | Ongoing |

PM review findings handled alongside: phone Schedule toolbar at 375 px; truncated event titles and all-day chips; phone quick-add placeholder; clash on a pending meeting stated in text, not colour alone.

## Round 2 (6 Oct, later)

| # | Owner said | Done |
|---|---|---|
| O10 | Picker cut off; roles should be icons | Member list positions itself beside, flipped or stacked so it is never clipped; in the composer it renders at page level. Roles show as role icons (division + role when searching), full role on hover and in the icon labels |
| O11 | Shader square too bland; different shaders, folder-like but not a folder (via the ChatGPT notes) | Project object: sleeve with a chamfered tab and a quiet rear plate; 8 shader families (flow, caustic, contour, pixel, grain, orbit, waves, cells) and 10 muted palettes, chosen once to differ from siblings and saved. Resources use type silhouettes: folder, note page with folded corner, link disc |
| O12 | ChatGPT review of Projects | Applied: no Stage column under stage groups, progress as bar + count, "Needs attention" from facts only, collapsible groups, count under the title, view switch beside the filters, larger objects in rows and grid. Not applied: "Health / On track / At risk" (invented status, forbidden by work_blockers), removing the white sheet and cream canvas (owner rules: work in white sheets, no cream), left-stripe selection (no side stripes), hiding "Created by" (D14). Shell items sent to UX1 as R6 |

## Round 3 (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O13 | Native dropdown "looks so ugly" | Every select and date field in UX2 screens is upgraded to a custom control: people with photo and role icons, projects with their object, filter box on long lists, keyboard support; a month-grid date picker with Today and Clear. The native element stays hidden as the value source |
| O14 | Project page lacks features: a brief where we write text, link pages and outside links | Overview now has a Brief document (headings, lists, bold, italic, https links and in-app page links shown as chips; template; revisions; honest save state), Links as app tiles (Google Docs/Sheets/Slides/Drive/Meet/Maps, Figma, Notion, Canva, Miro, GitHub, YouTube, or a page inside dwdg'ONE), and Add a milestone. Still exactly three tabs |
| O15 | Generated reference: take the good parts (app link tiles) | App-style link tiles adopted (drawn in the house 1.8px stroke style, muted palettes, no copied logos); the project object and folder/note/link silhouettes stay as the identity system |


## Round 4 (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O16 | Link tiles like Samsung app icons; logo from the site's tab icon, else a round web logo | Soft tinted squircle with a light rim and a hairline outline; the site's own favicon in the middle; a site without one shows a round web glyph. In-app pages show a neutral squircle (task, meeting, or the mini project object). Favicon fetching for the real build: request R7 |
| O17 | Link search under the brief toolbar has sloppy padding | Results float over the editor; one 28px icon column, the source on the right, equal row heights |
| O18 | Blocker row looks sloppy | Severity as a round mark plus word, the request and the task on their own lines, nothing truncated, no lone mono date. Overview rows (milestones, decisions) wrap instead of fading out |
| O19 | Where do I edit people; people from other divisions; joint projects | People has Add with the division-first picker. Same workspace and Presidency join at once; other divisions are invited and must accept (notice on the project, Updates entry, Your replies). Remove on hover. "Also with" lists partner divisions; the project shows in their registers as joint work. Request R8 |
| O20 | Every horizontal scroll should work with the mouse wheel | One rule for all sideways scrollers (board, strips, timelines): the wheel scrolls them until the edge, then the page scrolls; vertical scrollers keep priority |
| O21 | Folders inside projects | Project Resources has Folder, Note and Link, breadcrumbs, drag a row onto a folder (or the breadcrumb) to move it, and a Folder field in the inspector; new items land in the open folder |
| O22 | Resource list is messy; name should be a link, rest of the row opens the side panel | Rows use one fixed icon column and a quiet end cluster. The name opens the thing itself (site in a new tab, the in-app page, the folder, the brief in Overview); anywhere else opens details. Double-click a folder to open it |

Also fixed: the Overview stayed two columns at phone width (a round 3 rule overrode the phone layout); it is one column below 1000px again.
| O23 | Why do Google Forms and Classroom show the Google "G"? | The favicon services file both under the generic Google mark (and return nothing for forms.gle). Forms (docs.google.com/forms, forms.gle) and Classroom now use the products' own icons from Google's branding files; both are named in the tile subtitle |
| O24 | Empty brief: buttons glued to the text and to each other | Padding, 14px above the buttons, 8px between them |


## Round 6 (6 Oct): owner's keep / fix / remove list

| # | Owner said | Done |
|---|---|---|
| O25 | Resources and folders: double-click should open the thing right away | Single click opens details; double-click (or the name) opens the link, page, folder or brief. Detected on clicks, since the first click re-renders the row |
| O26 | Calendar: a click spawns the block lower than the cursor | The click time was rounded to the nearest 15 minutes, so it could round down the grid. It now starts in the 15-minute slot under the cursor |
| O27 | My Work: List/Board/Timeline switch moves between views | My Work keeps one page width in every view, so the switch stays in the same place (checked: same x in all three) |
| O28 | Projects: all projects for high authority; shared projects with their source division; organisation-wide master projects; Grid by default; a neater, more alive design; sort by start or target date | Scope tabs (SnG, Shared with SnG, Organisation-wide, All divisions for President/VP/Admin) with counts; origin tags (Joint · MCIT, Organisation-wide · HR); sort by Stage (grouped), Target date, Start date, Name, remembered; Grid is the default. New cards: tinted pocket in the project's palette, the project object rises out of it on hover while its shader plays, stage and start, two-line goal, progress and next milestone, lead and facts-only attention. Reduced motion respected. Organisation-wide flag in the project form for President, VP and Admin. Request R9 |
| O29 | Phone tab bar looks broken | Badges were clipped by the tab's overflow; they now sit on the icon corner with a ring. Project search on phones gets its own full-width row |
| O30 | Make every scrollbar more minimal | Thin, no track, thumb only while hovering the area, none on touch. Shell-wide, so UX1 is asked to adopt it (R10) |


## Round 7 (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O31 | Task panel status slider looks broken | Replaced by a 2 by 2 status grid with each status's icon and colour; nothing wraps |
| O32 | Improve all three Gantt charts, keep them different; fix broken text | Shared: month labels shorten to fit (no overlap), titles that do not fit a bar sit beside it, a Today tag. Project Work: status colours, dependency arrows, milestone rows. My Work: bars in each project's colour, rounded. Projects register: one band per project in its palette, the darker part is tasks completed, dates beside the band, milestones on a lane below (no text over diamonds) |
| O33 | Add a task by clicking anywhere on the Gantt grid | Click a day, or drag across days, type a name (with @mentions), Enter. Works in project Work and My Work; an "Add a task" row is always there |
| O34 | Predecessor and successor links, FS, SS, SF, FF; milestones checkable | Drag from the dot at a bar end to another bar: the ends you join set the type. Click an arrow to change type or remove it. Loops and self-links refused. A broken link turns red and dashed; "Fix N dates" previews the exact shifts and applies them only on confirm, with Undo. Task panel lists Waits for and Waiting for this, with type and add/remove. Milestone rows show linked tasks done and a tick to record achieved; drag a bar's dot onto a diamond to count the task toward it. Request R11 |
| O35 | Icons on tasks and activities, a wide range, like the reference | 68 line icons, 8 colours plus a custom colour, filter box. On tasks (panel header, rows, cards, Gantt) and meetings (panel header, calendar). Request R11 |
| O36 | WhatsApp-like emoji reactions on right-click | Right-click a task row, card, Gantt bar or meeting: reaction bar (6 + more) and Open / Change icon. Bubbles show under the item; tap to toggle; the owner gets one update. Request R11 |
| O37 | Scrollbars thinner, hard edges | 4px, square, no track, only while hovering |
| O38 | "Organization-wide", not "organisation" | Changed in UX2 screens; shell copy is UX1's (R12) |
| O39 | Folders and links: a short wait so a double-click does not flash the side panel | First click waits 260 ms; a second click opens the item instead |


## Round 8 (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O40 | Scrollbar near the panel's rounded corner looks sloppy | Scrollbar tracks keep 14px clear of the ends, so the thumb never runs into a rounded corner |
| O41 | Gantt still broken; emoji need a bubble; clicking it should show who reacted | Task names now always sit above the arrows. Everything beside a bar (title that does not fit, overdue, people, reactions) is one cluster placed past any arrow entering that end. Reactions are bubbles; clicking one opens who reacted, with a bar to add or change yours |
| O42 | Side panel scrolls sideways | Panel clips sideways; dependency rows rebuilt as cards (title and remove on top, a type chip below that opens the type menu); "Add a task it waits for" opens a task menu instead of two cramped selects |
| O43 | Several responsible people, also from other divisions | Responsible section with Add (division-first picker). Same division joins at once, other divisions are asked and share after accepting (Needs your response, Your replies). Request R13 |
| O44 | My Work Gantt should be more fun and show who you work with | Lanes per project with its object; bars are pills wearing the project's shader with a white title chip (animates on hover); due-only tasks are flags; today band; a strip with due this week, overdue, in progress, and "Working with" faces that highlight shared tasks; collaborators appear beside each bar |
| O45 | "Organisation" page title | Now "Organization" (the sidebar label is UX1's, R12) |
| O46 | Due date: dark red finish flag; planned start: green icon | Every due or target date field shows a dark red checkered flag, every planned start a green start mark (also the quick-add Due chip) |
| O47 | Task panel chaotic; Responsible needs multiple people | Same as O42 and O43, plus a separator before the details list |


## Round 9 (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O48 | Previous / next page and redo buttons; Ctrl+Z and Ctrl+Y | Top bar: back, forward, undo, redo (tooltips say what will be undone). Ctrl+Z undoes the last change that offered Undo, Ctrl+Y or Ctrl+Shift+Z redoes; text fields keep their own undo. Request R14 |
| O49 | People picker in the side panel is broken | The panel clipped the member list and a browser tooltip covered it. Pickers inside the panel now float at page level and follow the field; no tooltip |
| O50 | Flag marker in My Work slightly sloppy | Markers are just the flag; date, icon, faces and reactions sit in one cluster beside it, never overlapping |
| O51 | Reorder the project timeline rows by drag | Drag a task name up or down (green drop line), or Alt + arrow keys; the order is saved for the project, with Undo |
| O52 | Faces should fill the bar then become +n, and sit right | Bars show as many faces as fit after the title, then +n, on one line; row labels show up to 3 then +n; a stray margin that pushed +n down is gone |
| O53 | "Organisation" all over the place | Sidebar, More menu and role text now say Organization (owner instruction; R14 notes the app.js edit) |
| O54 | Project patterns keep changing | Cause: looks were picked the first time a project was drawn, so after each demo-data reset the order of pages changed the result. Now looks are picked once in creation order and saved; the seeded projects and resources carry fixed looks (the ones on screen today) |
| O55 | WBS and leveled tasks? | Answered with a recommendation (phases with one level of subtasks, work_subtasks P1); waiting for the owner's go-ahead |


## Round 10 (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O56 | After ticking or deleting, the page jumps to the top; same in the side panel | Cause: app.js keeps scroll only when the route has an id (R16). UX2 now keeps the page scroll on the same page and the panel scroll while it shows the same item |
| O57 | Milestones should be movable | Drag a diamond along the timeline, or focus it and use the arrow keys; with Undo. Lead, PM, milestone owner or Admin |
| O58 | A WBS tab right of Overview: tree map (vertical or horizontal) and a table like the reference; Work-tab tasks are work packages; WBS items are leveled and appear on the Gantt; work-package level optional | WBS tab with three views. Tree top-down (phases across, parts stacked below), tree left-to-right, and a table (Phase, Activity with codes 1.2.3, Resources, Schedule in days, Dates, Predecessor as FS/SS codes, Remarks, milestones as 0 d rows). Add phase, add a part under, add below, one level up or down, move, trash (with its parts). In the table: type to rename, Enter adds below, Tab and Shift+Tab change the level, days set the length. Work-tab tasks appear as "not in the WBS yet" and can be placed. The project Timeline follows the tree: indented rows, codes, phase and summary bars that roll up dates and progress, fold and unfold, drag a row into or out of a phase. Request R15 |
| O59 | Opening, closing or switching the side panel is a page state; back and forward many times | Back and forward now step through route and side panel states (up to 100) and restore the scroll; undo and redo keep up to 50 changes |


## Round 11 (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O60 | Wheel over task and milestone names should scroll the page, only the grid sideways; apply everywhere | Rule for every sideways scroller: over a sticky heading or label column the wheel stays vertical; over the grid it scrolls sideways until the edge |
| O61 | WBS table: rearrange better, neater, readable; edit by right-clicking a row | Rebuilt: one section per phase (a tinted header row with its roll-up and progress), columns WBS, Phase and activity, Resources, Days, Start, Finish, Predecessors, Remarks; numbers right-aligned, dates in their own columns, tree guides for levels, milestones as tagged rows, no selection highlight. Right-click any row (or box in the tree) for reactions, Rename, Set days, Icon, add, levels, move, details, trash |
| O62 | "Choose an icon" state looks ugly | The empty icon button is hidden until you hover the heading, then shows as a quiet "Icon" chip at the right; no browser tooltip |
| O63 | Vertical tree lines broken | Lists under a box now hang from a spine that starts under the parent box and ends in a rounded corner at the last child; nested levels narrow so lines stay aligned |
| O64 | Drag on the right half makes it a child, left half the same level? (owner asked for UX2's direction) | Adopted: on the timeline, the left half of a row drops the task beside it (a green line above or below), the right half drops it inside that row as its last part (a green box says "Make it a part of ..."). Alt + Left/Right change the level by keyboard. No text gets selected while dragging |

## Round 12 (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O65 | Top-down tree lines still broken | Connectors are no longer CSS pseudo-elements: one SVG is drawn from the real box positions after each render (rows of children get an elbow, stacked lists a spine from under the parent, left-to-right trees a mid-line), so they stay joined at any size |
| O66 | How to add and edit milestones anywhere, especially in the WBS | WBS toolbar "Add milestone"; right-click any WBS row "Add a milestone here" (placed under that part, dated at its finish). The milestone panel is now fully editable for its owner, lead, PM or co-director: name, target, owner, place in the WBS, linked tasks (add and remove), record achieved, delete with Undo. Right-click a milestone in the table, tree or timeline for edit, achieved, delete; it still drags on the timeline |
| O67 | Table not intuitive; right-click on level rows did not work; add hover; delete or add a descendant from right-click; drag and drop here too; right-click to edit who is responsible and the rest | Cells are plain text with row hover; double-click a cell to edit it (name, days, remarks; start and finish open the date picker). Right-click works on every row now (names were inputs that swallowed it): reactions, Rename, Responsible (search anyone, tick to add or remove; other divisions are asked), Dates, Days, Remarks, Icon, Status, Add a descendant, Add an item below, Add a milestone here, levels, move, Open details, Delete. Rows drag with the same rule as the timeline (left half beside, right half inside). Keyboard: Enter or F2 renames, Delete deletes, the menu key opens the menu |
| O68 | Tree icons not fitting | New icons: an org chart for top-down, a branching tree for left-to-right, a grid for the table |


## Brief step 4: D31 to D33 (6 Oct)

| # | Request | Built |
|---|---|---|
| O69 | Person panel (D33, availability_person_inspector, S082) | Click any avatar, person chip, mention or name: one panel with photo, full name, division and function, role icons, Admin or Board badge, LinkedIn and phone (optional; a member can hide the phone), date joined, Ask for a task and Find a time. A week calendar (with previous and next week) names only what the viewer shares: meetings both attend, meetings of the viewer's own workspace or of the whole organization; everything else shows Busy or Unavailable, and unavailable notes and Google titles never appear. "Between you two" lists open tasks and offers between them in full; other tasks only where the viewer could already see them. A member edits their own LinkedIn and phone from their panel |
| O70 | Routines (D31, work_routines, S079) | Projects has a Routines tab per workspace. Co-Director and up create a routine: name, how often (weekly, every 2 weeks, monthly, every N days), first date, due offset, optional project, who does it (take turns or one person), checklist. Each occurrence is its own task with its own owner, due date and checklist, and shows the routine as its context chip (D15). Skip one occurrence (the next is unchanged), pause and resume, edit (future occurrences only, past keep history), delete (past stay as tasks). Members repeat their own personal tasks from the task panel (Repeat) or from "Your repeating tasks". Seeds: SnG pulse check (every 2 weeks, rotating), monthly report, MarcomIT weekly posting, Mahdy's weekly review |
| O71 | Batch roadmap strip (D32, proposed, work_batch_roadmap, S080) | A collapsed strip at the top of My Work ("Next: Open recruitment opens, 20 Oct, in 14 days"); open state remembered per person. Expanded: the batch year with month ticks, a today marker, organization-level milestones (marked roadmap) placed in lanes so labels never overlap, achieved in green. Each item opens its milestone record. Only the President and VPs add or edit items (sign in as Fadhil or Raka to try it); no progress percentage. Owner to decide whether to keep it |


## Round 13: Operations (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O72 | Routines don't belong in Projects; they are operations, a looping instance of organization work, and operations are different from projects. The icon picker was nowhere to be seen; the UI and the system were not well thought through. "You're the director here" | Routines moved out of Projects into a new top-level area, **Operations**, next to Projects (sidebar, phone More menu, New menu). The board has three parts: **This week** (one card per run due this week or still open: the person whose turn it is in front, the due state as an icon and coloured word, steps done, a check button for whoever may finish it); **Rhythm** (every routine on one shared 12-week axis, 6 on a phone, with each run as a beat showing the photo of the person whose turn it was and a ring for what was recorded: done, done late, overdue, open now, coming up, skipped; this week shaded; hover for date, person and outcome; click to open that run); and a legend. Scopes: the workspace, Your repeating tasks, All divisions (President, VP, Admin). Each routine has its own page: big icon (click to change it with the icon picker), the routine as one plain sentence, Running or Paused, Edit, Pause, delete; its own rhythm strip; **This run** with the checklist to tick, Mark done, Move to another day, Skip; **Coming up** (Move, Skip, Restore a skipped one); **History** with recorded outcomes; the rotation order with who is up next; the steps; who created it. The **builder** is a full page written as questions (When does it come round? weekday buttons, first run; When is each run due? Who does it? take turns in an order you can rearrange, or the same person; Steps, Enter adds the next; optional project) with a live preview of the next six runs, dates and people. "Occurrence" is now called a **run** everywhere. No scores or rates |


## Round 14 (6 Oct)

| # | Owner said | Done |
|---|---|---|
| O73 | Roadmap: make collapse and hide more intuitive and nicer; where do I add a roadmap milestone? The black flag box looks sloppy | Three states per person. **One line** (default): flag outline icon, "Batch 2026", a mini track of the year with diamonds for each item (achieved green), a green dot for today, and "Next: Open recruitment opens, 20 Oct, in 14 days"; click anywhere to open. **Open**: the full year with labels, a collapse button and a hide button. **Hidden**: a toast says how to bring it back, and a quiet Roadmap button appears at the top of My Work next to the view switch. Adding items (President and VPs only): "Add a roadmap item" in the open strip, or open any milestone and turn on "Show on the batch roadmap"; others see "On the batch roadmap, set by the President and VPs". The black box is gone |
| O74 | My Work list wastes room and everything is too far apart | Rebuilt: one dense list in date groups (Overdue, Today, Later this week, Later, No date, Completed collapsed), each group foldable and remembered. Each task is one 38 px line: tick, title with reactions and state inline, where it belongs, who else is on it, due. A routine shows only its next run with "+2" for later ones, and its schedule instead of repeating the name. A right rail holds Needs your response (first three, Show all) with Accept and Decline in place, and Meetings today. In narrow windows the rail goes on top in single-line rows |
| O75 | Gantt name column slightly see-through, without the grid showing | The name column is frosted glass on every Gantt: bars passing under it show as a soft colour, the checker pattern is blurred away |
| O76 | Operations dates broken | The header now has two lines (month above, week day number below, this week's number in green) with one label per week column, so labels never collide. Beats size themselves to the space: photos when there is room, small photos when tighter, dots when weekly runs are very close |
| O77 | Question: can a member approve their own delegated task, skip, or finished run? | They could. Now sign-off: see R19. Delegated tasks and division routine runs go to In review when the doer finishes them, and only the signer (never the doer or a co-assignee) can record them as completed, with name and time. Members ask to skip or move a run with a reason; the leader approves or declines on the routine page or from My Work. The routine builder has "Who checks each run is done?" |


## Brief (updated by PM, 6 Oct): Programs and build specs

| # | Item | Done |
|---|---|---|
| O78 | Programs as umbrellas over projects and operations (D47, work_programs, S086) | New page `#/programs/{id}` (no sidebar item): goal, owner, period, created by; four counted tiles (projects, tasks done, milestones achieved, runs done so far); one timeline with project bars and milestones and operation runs; project and operation lists with Add and Remove. Projects and Operations registers have a "Group by program" toggle. Projects show "Part of {program}" or "Add to a program"; routine pages show the program in About. Directors and above create programs (New program on Projects); Co-Directors place their own items. Seeds: Partner Relations 2026 (EE), Content & Brand (MarcomIT), Consultant Training 2026 (Consulting, TnD branch) |
| O79 | Build specs W015–W018 | Written in `UX2/out/specs/`: README (index, rules, builders, size and priority table), shared, W015 My Work, W016 Projects and programs, operations, W017 Resources, W018 Schedule. Owner to confirm the P1 items before wave 1 |


## 8 Oct

| # | Owner said | Done |
|---|---|---|
| O80 | "Why can't I see Scopus or other random website icons?" | Google's icon service answers both "this site only has a small icon" and "no icon" with the same 16 px image, and the tile threw every 16 px answer away. Now: a 16 px answer is kept and shown at its own size; first the site's own /favicon.ico is tried from the browser (Scopus blocks icon services); a failed lookup also tries that file before the globe. Scopus could not be reached from UX2's machine at all, so its tile falls back to the small image there; in a browser that reaches scopus.com its own icon shows. The real build fetches icons server-side (D37, R7) |
