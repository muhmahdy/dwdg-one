# UX2 handoff log

Newest first. Each session appends: date, model, what changed (paths), evidence, open questions, next step.

## 2026-10-06 · UX2 · Opus 5.5 · session 1 (cut short by usage limit)

**Changed (paths):**
- New `prototype/schedule.js`: Day/Week/Month calendar (D23, work_schedule), quick card + full editor, drag create/move/resize own items with keyboard equivalents (arrows move 15 min, Shift+arrows resize, Left/Right change day), others' meetings and Google busy locked, unavailable time editor (one-off default, weekly explicit, all-day, private note, overlap warning), meeting inspector (agenda, note-taker, project, time zone, RSVP, held/cancel with reason, .ics, outcomes: minutes note, decisions, follow-ups where someone else gets an offer), R046 composer (text parse EN/ID, manual people, date/start/duration exact controls, slot drag + arrows, categories without private notes, Unknown, inline clash + second-confirm send). Starts the app.
- New `prototype/plan.js`: Updates inbox, Projects register (76px grouped rows, Grid, Timeline), project page (exactly Overview/Work/Resources; scope, next milestone, blockers, milestones, decisions, people, factual progress, recent changes), stage rules (hold/cancel need reason; complete blocked by open blocker/review/no lead), create/edit project (CD+ only), milestone and decision inspectors, Resources explorer (pinned, workspace, by project, search, type filter, breadcrumbs, right-click/⋯ menu, inspector with purpose, note revisions with honest unsaved/failed/saved state, contributors, related work, resource→task or offer, link-issue report), Changes (one workspace, project filter `#/changes/<projectId>`, type filter, 50 per page), Organisation (scoped division matrix, portfolio for multi-workspace roles, people directory), Settings (account, language, theme, Google Calendar connect simulated, reminders note, export disabled, admin approvals, reset).
- New `prototype/screens.css` (UX2-owned styles), `prototype/i18n.js` (Indonesian dictionary, ~690 strings, informal "kamu"), `prototype/index.html` script/style tags.
- `prototype/work.js`: task status changes guarded by canEditTask (assignee, creator, reviewer, project lead/PM); accepted offers keep resource and meeting links.
- `.claude/launch.json`: added `prototype` config (vite on port 5180). Open `http://localhost:5180/prototype/index.html`.

**Evidence (browser pane, actual runs):** all 11 routes render with 0 runtime errors; register rows measure 76px, board lanes 280px/16px gap, resource rows 54px (≥52) with 20px icons; create meeting saves 1 record and 1 invite update; 09:00–11:45 block clashes at 09:30 but not at an 11:45 start; Dimas shows Unknown; keyboard move/resize/day change on own meeting, locked on others'; clash send needs a second confirm; resource→task for Salsa creates 1 offer and 0 tasks, accepting creates exactly 1 task with the resource ID; member Salsa has no project creation route and gets a neutral denial on another division's project; failed note save (`?fail=save`) keeps text, shows failure, writes nothing; EN/ID and 375px phone checked for My Work and Schedule. Demo data reset to seed after testing. Not verified: tablet width, dark/light full matrix, screen readers, month view interactions in depth.

**Ownership note:** `i18n.js`, `index.html` and shell CSS bits in `screens.css` (side-foot, tabbar More) touch UX1 territory; created because brief step 1 required the prototype to load. See REQUESTS R2.

**Open questions:** Indonesian tone ("kamu" vs "Anda"); recurring-block edits move the whole series (occurrence editing waits on access_availability_privacy_policy); clash policy (availability_override) prototyped as inline second confirm.

**Next step:** owner review of the prototype; move C015–C018 to Review through planner-cli with this evidence (not done this session); then build specs in `UX2/out/`.

## 2026-10-06 · UX2 · Opus 5.5 · session 1, owner review round

**Owner said:** use formal "Anda"; weekly-series drag behaviour is fine; OK on the UX1-owned files; many things still looked broken; wants a visible line between categories instead of whitespace only.

**Changed:**
- `prototype/screens.css`: hairline dividers above every section heading (pages, project overview, inspector), between grouped rows (Projects register, Organisation matrix, Changes), Changes day dividers, Settings as grouped panels with row dividers, overview side column as a tinted panel. Bug fixes: top search shortcut no longer stretches and truncates the label; segmented toggles space their icons; page headers keep their buttons together; Schedule toolbar on one row; today column no longer tinted green.
- `prototype/schedule.js`: toolbar reordered (Create, Find a time, navigation, then compact sync status, help popover, Show, view switch); help text moved from the page into a popover; overlapping events cascade like Google (later starts overlay with an indent, same-time starts split); composer suggestions start at 08:00.
- `prototype/work.js`, `plan.js`: raw dd/mm/yyyy date field replaced with a "Due date" chip; Updates grouped by day; Changes record links styled consistently.
- `prototype/i18n.js`: converted to formal "Anda" (75 strings), new strings added.

**Evidence (browser pane, 1174×914 dark):** My Work, Updates, Schedule, Projects, project Overview, Resources + inspector (ID), Changes and Settings re-screenshotted after the fixes; Schedule toolbar items share one row (measured); due-date chip sets 2026-10-09 date-only, Undo removes the task; 0 runtime errors. Demo data reset to seed afterwards.

**Open:** R3 (divider rule into the design system); a full light-theme and phone pass after these changes is still to do; C015–C018 not yet moved to Review.

## 2026-10-06 · UX2 · Opus 5.5 · session 1, wrap-up

- Owner: not fully satisfied with some UI and mechanics, but accepts this as the first version and wants to continue. Example given: the removed quick-add @mention.
- Restored @mentions (`prototype/work.js`, `plan.js`, `data.js` t4, `screens.css`, `i18n.js`): @ suggestions with photos, tokens preview (person, day, time), inline avatar + name in task rows, "Mentioned" row in the task inspector. A mention never assigns (access_delegation); request R4 asks the PM to record it.
- Verified in the browser pane: typed "Sync with @sal" + Tab + "about the roadmap fri 14:00" + Enter → task "Sync with Salsa about the roadmap", owner mahdy, due 2026-10-09, 14:00, mentions [salsa]; row shows Salsa's photo and name. Test task undone, demo data reset.
- Planning workspace revision 7 (planner-cli, actor "UX2 Opus 5.5"): C015–C018 moved Doing → Review with evidence. Not Done.
- **Next for UX2:** build specs for W015–W018 in `UX2/out/` (fields, states, empty/error/denied states, permissions, events) for WRK, RES, SCH, SIG; then a polish pass on owner reservations once the owner names them.

## 2026-10-06 · UX2 · Opus 5.5 · session 2

**Step 1 (owner review):** owner's list written to `UX2/out/owner-review.md` (O1–O9), with status per item. Owner asked about shaders: they exist as `design-shaders` (Deferred P2) and `design-resource-identity` (P2); owner wants them now → request R5.

**Changed (prototype/):**
- `work.js`: two-level people picker (Presidency/divisions → members with photo, nickname, role) for @mentions, shared with the composer and Schedule; task statuses use project-stage colours (O7); rebuilt Gantt (sticky labels, month/day header, planned start→due bars, due-only markers, milestones, weekends, today line, drag/keys, wheel scrolls sideways, edge chips jump); planned start field in the task inspector; review choice recorded; view and range preferences saved per member (work_work_views).
- `plan.js`: Updates "Your replies" view (O8); WebGL identity art for projects (rows, grid banner, header, timeline, organisation) and resources (rows, pins, inspector) with saved, well-separated hues (O3/O4).
- `schedule.js`: Google-like Schedule (O2): left panel with Create, mini month (busy-day dots), Meet with, calendar checkboxes, sync status; event card popover with Going? Yes/No, Details, Edit, .ics; keyboard shortcuts; day headers open the day; title-first events with full title/time on hover; "Clash" stated in text on pending clashes (PM d); phone toolbar redesigned (PM a); Day view default under 1000 px. Find a time (O1): sentence with highlighted people/day/length, example prompts, "Checking Google Calendar…", week strip with open start times per day, people picker, Meet toggle (no fake link), ⏎ send; suggestions from 08:00.
- `data.js`: planned starts on 11 tasks; one seeded mention. `screens.css`: styles for all of the above. `i18n.js`: new Indonesian strings for these screens only (allowed by brief step 5).

**Evidence (browser pane):** 1174 px desktop, 1440×900 dark, 768 tablet, 375 phone. All routes and the new features run with 0 runtime errors; @ menu → Consulting → Dimas inserts "@Dimas"; Your replies lists 4 waiting / 5 replied; project hues 345/165/75/255/30/120 in SnG; wheel moved the Gantt 140→260 px; event card opens beside the event; composer parsed "Roadmap sync with Salsa and Dimas thu 1 hour" (Salsa checking, Dimas Unknown, Thu selected). Demo data and view prefs reset afterwards. Not done: full light-theme pass on every screen at 768; screen-reader check.

**Open questions:** R5 (shader identity release/priority). Schedule uses M for Month on its own page (Google convention) while M opens the meeting composer elsewhere; UX1 to confirm the global shortcut map.

**Next step:** brief step 4, build specs for W015–W018 in `UX2/out/`.

## 2026-10-06 · UX2 · Opus 5.5 · session 2, round 2

**Owner feedback:** picker cut off and role text too long; shader square too bland (with a ChatGPT review of Projects for reference, owner left the call to UX2).

**Changed:** `work.js` picker (role icons, auto flip/stack, `--top` positioning); `schedule.js` composer picker rendered in `#pmfloat` at page level (the transformed dialog trapped fixed positioning), cleared when the composer closes; `plan.js` identity v2 (project object, 8 shader families, 10 muted palettes, `look` saved per record, resource silhouettes), Projects register v2 (6 columns, Needs attention from facts, collapsible groups saved per member, count under title); `screens.css` masks and layout. See `out/owner-review.md` O10–O12 for what was and was not adopted and why.

**Evidence (browser pane, 1174 px light):** register rows and grid render six distinct objects (Cells Coral, Pixel Slate, Flow Plum, Orbit Emerald, Contour Terracotta, Waves Olive); resources show folder/note/link silhouettes; composer picker opens under the input and the Consulting member list sits beside it inside the window; 0 runtime errors. Demo data reset.

**Open:** R5 (shader release/priority), R6 (shell items for UX1; owner to confirm whether to drop the white page sheet). Next: build specs W015–W018.

## 2026-10-06 · UX2 · Opus 5.5 · session 2, round 3

**Owner feedback:** native dropdown ugly; project page needs a brief with text and links; take app link tiles from a generated reference.

**Changed:** `work.js` custom dropdown and date picker for all selects/date inputs; `plan.js` Overview rebuilt (goal lead, scope, Brief editor and reader, Links tiles, milestones with add, blockers, decisions, changes; side panel with progress, next milestone, people, dates), provider detection and app tiles, brief note read-only in the resource inspector, reference links; `data.js` brief and five links on SnG roadmap; `screens.css`; `i18n.js` strings.

**Evidence (browser pane, 1276 px light):** brief renders with headings, lists and in-app chips; editing inserted a page link (task t12) and saved as a new revision; link tiles show Figma, Docs, Drive, Notion and a project; Lead dropdown shows photos and role icons and opens upward when space is short; date picker set a task due date to 10 Oct; offer recipient chosen by filter; 0 runtime errors across all routes. Demo data reset.

**Open:** R5, R6. Next: build specs W015–W018.


## Session 2, round 4 (6 Oct)
Owner feedback O16 to O22 done in plan.js, work.js, data.js, screens.css and i18n.js (new Indonesian strings, formal Anda). Verified in the browser pane at 1100 and 1440 px light, 375 px dark: favicons load (Docs/Sheets/Slides via path segment), missing favicons fall back to the web glyph, invite flow (Laras invites Mahdy to Website relaunch; accept makes it joint in the SnG register), Add people picker (Galih from MCIT becomes invited), project folders (create, move by inspector and by drag, breadcrumbs, double-click), name-link vs row click, wheel on Board, 0 runtime errors on 13 routes. Demo data reset after testing.
Open: R5, R6, R7 (favicon fetching on the server), R8 (cross-division project membership). Next: build specs for W015 to W018 in UX2/out/.


## Session 2, round 6 (6 Oct)
Owner keep/fix/remove list (first part) O25 to O30 done in plan.js, work.js, schedule.js, data.js, screens.css, i18n.js. Verified in the browser pane at 1000, 1280 and 375 px: calendar ghost starts at or above the pointer (diff -4 to -8 px within the slot), resource double-click opens in-app pages and external links, My Work switch at the same x in List/Board/Timeline, Projects scope tabs and counts (SnG 7, Shared 1, Organisation-wide 2, All 13), sort by start date, shared tab shows the HR organisation-wide project, phone badges whole, 0 runtime errors on 9 routes. Demo data reset after testing.
New seed: p-plan26 (organisation-wide, SnG runs it, lead Fadhil, PM Mahdy), p-orient (organisation-wide, HR). Open: R5 to R10. Next: the rest of the owner's list if any, then person panel, routines and roadmap strip (brief step 4), then build specs.


## Session 2, round 7 (6 Oct)
O31 to O39 done in work.js (Gantt v2, dependencies, icons, reactions, status grid), plan.js (portfolio timeline, click delay, spelling), schedule.js (meeting icon and reactions), data.js (seed: t20 with a broken FS link for the Fix demo, icons, reactions, deps), screens.css, i18n.js. Verified in the browser pane at 1280 px and pane width: Fix 1 date preview and apply (t20 13–17 Oct to 15–19 Oct), drag-create task 14–16 Oct with @Nadia, drag-link FS, loop refused, right-click reaction notifies the owner, icon picker (68 icons) sets rocket/green, meeting icon and reaction in panel and calendar, folder/link single click opens the panel after the delay, 0 runtime errors across 11 routes and all views. Phone width not re-checked this round (the pane was being resized); phone rules unchanged except the Gantt label column.
Open: R5 to R12. Next: anything else from the owner, then person panel, routines and roadmap strip, then build specs.


## Session 2, round 8 (6 Oct)
O40 to O47 done in work.js (Gantt v2 rewrite with layering and side clusters, My Work design, responsible people, dependency cards, who-reacted, date icons), plan.js (Organization title, update types, replies), data.js (t1 shared with Salsa, t18 asks Mahdy to share), screens.css, i18n.js. Verified in the browser pane: no sideways scroll in the panel, Add Citra (FnL, asked) and Sekar (SnG, joined), Mahdy accepts t18 from Needs your response and it joins My Work, who-reacted popover lists people, My Work Gantt groups by project with shader pills (3 hydrated) and the Working-with filter dims 4 of 6, Organization title, 0 runtime errors. Phone width not re-checked (pane resized during testing).
Open: R5 to R13. Next: owner's call, then person panel, routines and roadmap strip, then build specs.


## Session 2, round 9 (6 Oct)
O48 to O54 done in work.js (history buttons and keys, floating pickers, faces, reorder, flag cluster), plan.js (ensureLooks, floating project picker), data.js (fixed looks), app.js (three Organization labels only, owner instruction, R14), screens.css, i18n.js. Verified: looks identical after reset and in any page order, Ctrl+Z / Ctrl+Y on a status change, back/forward, FnL members list opens fully inside the window from the side panel, Alt+Up reorders t12 above t1, faces "M +3" in a narrow bar, flag cluster starts 5 px after the flag, 0 runtime errors. Demo data reset.
Open: R5 to R14. Owner question pending: WBS / leveled tasks scope.


## Session 2, round 10 (6 Oct)
O56 to O59 done in work.js (render wrapper, page states, WBS model, hierarchical Gantt, milestone drag, table editing keys), plan.js (WBS tab, projTasks = work packages), data.js (SnG roadmap WBS: 3 phases, a summary activity, t21 and t22, milestone parents), screens.css, i18n.js. Verified: tick near the bottom of My Work keeps the scroll (400 to 368, content shorter), panel keeps 300 px after a status change, back closes the panel and forward reopens it, milestone ms1 dragged 14 to 16 Oct, tree views and table render, Enter adds 2.3 then Tab makes it 2.2.1, project Timeline shows phases, codes and summary bars with Fix 2 dates cascading, 0 runtime errors. Demo data reset.
Open: R5 to R16. Next: owner's call; then person panel, routines, roadmap strip; build specs.


## Session 2, round 11 (6 Oct)
O60 to O64 done in work.js and plan.js (WBS table rebuilt, right-click menu, drop rule, wheel rule, icon button), screens.css, i18n.js. Verified: table renders in phase sections with aligned columns, right-click on 1.2.1 shows reactions plus the full menu and Rename focuses its name, tree spines attach under parent boxes, drop on the right half of 1.1 makes 1.2.2 its part, drop below 2.2 on the left half makes it 2.3, wheel over a label leaves the timeline still (not prevented) and over the grid scrolls it 100 px, empty icon button hidden until hover, 0 runtime errors. The owner was using the browser pane during the last checks, so demo data was NOT reset this round.
Open: R5 to R16.

## Session 2, round 12 (6 Oct)
O65 to O68 done in work.js (SVG tree connectors, WBS and milestone menus, responsible picker menu, cell editing, row drag, milestone actions), plan.js (table rebuilt as plain cells, milestone panel editable, toolbar), screens.css, i18n.js. Verified in a separate background tab (the owner was using the main one): SVG connectors drawn in both tree views, phase right-click menu complete, responsible list shows the lead first, milestone right-click menu, double-click days 10 to 12 then Undo restored 14 Oct, Add milestone opens the panel with name focused then Undo removed it, 0 runtime errors. No demo data reset; test changes were undone.


## Session 2, brief step 4 (6 Oct)
D31 to D33 prototyped (O69 to O71) in work.js (person panel, avatar and chip handler, routines engine and panels, roadmap strip, demo seeds added on render via seedUpgrade so existing browser stores also get them), plan.js (Routines tab in Projects), screens.css, i18n.js. Verified in the browser: 4 routines generate separate occurrences with rotating owners (rt1: Salsa, Fikri, Mahdy, Salsa), skip removes only 14 Oct and Undo restores it, a new routine creates 3 occurrences then Undo removes them, personal Repeat on t4 creates 9 and 23 Oct then Undo, the person panel for Fikri names Strategy review and Survey findings review (shared) and shows Unavailable for his classes, the roadmap strip shows 6 items in non-overlapping lanes, roadmap editing locked for Mahdy, 0 runtime errors. Test changes were undone.
Next: brief step 5, the build specs for W015 to W018 in UX2/out/.


## Session 2, round 13 (6 Oct)
O72: Operations built in work.js (opsBoard, opsDetail, opsBuilder, rhythm, rtBeats, runCard, opsNav; old INSP.routine, routinesBody and rt-save removed; open-rt and new-rt now navigate), plan.js (Routines scope removed), screens.css, i18n.js (+116). Verified in the browser: board renders 2 SnG routines and 1 run this week; All divisions groups MarcomIT and SnG; created a routine through the builder (Fri, every 2 weeks, Nadia, Mahdy and Annisa in turns, 2 steps, orange handshake icon) which made runs on 9 and 23 Oct with the icon; moved 23 Oct to 26 Oct; skip and restore of 9 Oct; edit to weekly kept past and started runs; delete through the More menu returned to the board. Member (Salsa): no create button, neutral denial on the builder and edit page, rt4 (Mahdy's personal) not available. Phone at 375 px: 6-week window. Test routine and its change entries removed; 0 new runtime errors.
Open: R5 to R18. Next: brief step 5, the build specs for W015 to W018 (include Operations in the WRK spec).


## Session 2, round 14 (6 Oct)
O73 to O77 in work.js (sign-off, run requests, roadmap v2, My Work list v2 mwList, rhythm header and beat sizes), plan.js (UPD types, roadmap switch in the milestone panel), screens.css, i18n.js (+65). Verified in the browser: Mahdy ticking t1 (given by Salsa) moved it to In review with Salsa as signer and a second tick said "Waiting for Salsa"; Salsa saw "Mahdy finished this. Sign it off?" in her rail and Approve recorded signedBy; afterwards co-assignees were excluded so t1's signer is now Nadia. On rt3, Hana's "Done, send to Laras" moved the run to review; Farah asked to skip 12 Oct with a reason; Laras saw the request and the run on the routine page, signed off and approved the skip; Updates got run-ask, run-ask-ok and approved. The roadmap switch shows for Fadhil, a read-only note for Mahdy. The frosted Gantt column and the Operations header were checked at 820 px and full width. All test changes were undone by hand (t1 back to In progress, rt3 run back to Not started, skip and request removed, the test updates and change entries removed); 0 runtime errors.
Open: R5 to R19. Next: brief step 5 (build specs W015 to W018).


## Session 3 (updated PM brief), 6 Oct
**Step 1, Programs (D47):** plan.js (programs block: pgPage, pgNew, pgForm, pgTimeline, pgGroups, pgChip, MENUS.pgplace and pgpick, seedPrograms; register toggle, New program button, project header chip), work.js (seedPrograms call in the render wrapper, Operations group by program via opsByProgram, Program row in the routine page), screens.css, i18n.js (+50). Seeds: pg-partner (p-breakfast, new p-renew, new routine rt5), pg-brand (p-site, rt3, new p-brandkit), pg-train (new p-coh1, p-coh2, routine rt6), with tasks and milestones. Verified in the browser: Laras (Co-Director) has no New program and gets the neutral denial on #/programs/new, takes Brand kit out of Content & Brand and puts it back; Rani (Director) creates a program, places two projects and one operation (stats 2 projects, 1 operation, tasks 0/5, milestones 0/2, runs 2/2, three timeline rows), removing Partner agreement renewals left the project record unchanged; Operations grouped by program as EE. Test program removed and links restored by hand; 0 runtime errors.
**Step 2, build specs:** `UX2/out/specs/` README.md, shared.md, W015-my-work.md, W016-projects.md, operations.md, W017-resources.md, W018-schedule.md. Includes a size and priority table (about 14 to 18 frontend weeks) for the owner to confirm P1 items.
**Step 3:** not started: UX1 has not reported any shell request done yet (UX1/HANDOFF.md empty), so opsNav, the render wrapper, the injected top-bar buttons and the scrollbar copy stay for now.
**Open:** owner approval of the specs; P1 confirmation. Cards C015–C018 stay in Review.
**Next:** owner review of the specs; then remove workarounds as UX1 closes R10, R14, R16, R17.


## Session 3 (clean-up), 8 Oct
**R20:** removed from work.js the interim undo stack (HIST, toast wrapper, runUndo, runRedo, Ctrl+Z handler), page history (NAV, navTo, nav-back, nav-fwd), paintHist and its observer, the scroll and page-state parts of the render wrapper (kept seedUpgrade, seedPrograms, ensureRoutines), opsNav and its observer, the MENUS.more and MENUS.new wrappers; svgD(RT_IC) replaced by icon('routine') in work.js and plan.js. Removed from screens.css the shell block, phone .tabbar rules, both scrollbar blocks, .histnav/.hist-sep and the hairlines now in components.css (kept .ov .sec-h, which components.css does not cover). US spelling: schedule.js organiz-, plan.js and work.js color; "Canceled" for meeting and decision states and the meeting copy; STAGES label set from plan.js until UX1 changes app.js (R23).
**R21:** every outline uses var(--focus-ring); My Work and task-row ticks 24 px with a 44 px touch hit area; quick add 16/24 on phones; due columns never wrap; under 600 px container width reactions and state move under the title.
**D48:** specs README lists every item as P0. Total recomputed from the sizes: 27 items (4 S, 15 M, 8 L), about 97 to 163 frontend developer days (19 to 33 weeks for one developer). The earlier "14 to 18 weeks" did not match the size definitions and is replaced.
**O80 (owner, favicons):** plan.js favDone chain: Google 64 px, else the site's own /favicon.ico (4 s), else Google's small icon at native size, else the globe. Verified: Figma, Docs, Drive, Notion 64 px; Scopus falls back to the small image (scopus.com unreachable from this machine, by browser and by curl).
**Evidence (browser, port 5180):** My Work, Projects, Operations, a routine, Resources, Schedule, a program and a WBS tab render with 0 runtime errors; no .histnav or injected Operations link; one shell Operations link; tick 24 px; 390 px: no horizontal overflow, quick add 16 px, a row with reactions and state 59 px tall with the title at 218 px. Console network errors come from favicon probes only.
**Next:** UX1 deletes the handover block and the British keys (R23); owner review of the specs.
