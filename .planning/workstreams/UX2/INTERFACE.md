# UX2 interface

Prototype contract as of 2026-10-06 (draft until owner approval). Record shapes live in `prototype/data.js`.

**Routes:** `#/work`, `#/updates`, `#/schedule`, `#/projects`, `#/projects/<id>/<overview|work|resources>`, `#/resources`, `#/changes`, `#/changes/<projectId>`, `#/organisation`, `#/settings`.

**Record fields added by UX2 screens (for WRK, RES, SCH, SIG):**
- meeting: `state` planned|held|cancelled, `reason` (required to cancel), `heldAt`, `agenda`, `notetaker`, `project`, `minutes` (resource ID), `responses` {person: accepted|pending|declined}.
- unavailable: `date` (one-off) or `weekly`+`day`+`from`, `allDay`, `start`/`end` minutes, private `note`, `createdAt`. Never written to workspace Changes.
- offer: optional `resource` and `meeting` IDs; acceptance creates exactly one task carrying `links:[resource]` and `meeting`.
- resource: `purpose`, `contributors`, `reports[]` {reason notfound|denied|expired|wrong, by, at, note, state}, `history[]`, `editedBy/editedAt`, `archived`.
- milestone: `achievedAt`, `achievedBy` (only set by an explicit action). project: `reason` for hold/cancel.

**Rules the screens rely on:** half-open overlap; coverage Unknown = no declared time and no Google connection; others see "Unavailable"/"Busy in Google Calendar", never notes or titles; one unread "changed" update per guest and meeting; task status changes only by assignee, creator, reviewer, project lead/PM; project creation CD+ only.

**Update types:** offer, review, invite, overdue, changed, cancelled, minutes, blocker, unblocked, decision, decided, offer-accepted/declined/changes, approved, returned, rsvp-yes, rsvp-no, link-issue, delegated.

**QA hooks:** `?fail=save` makes note saves fail; Settings → Reset demo data restores the seed.

## Session 2 additions (6 Oct 2026)

**Record fields (for WRK, RES, SCH):**
- task: `start` (optional planned start, date-only; needs `due`; start ≤ due) drives Gantt bars; `mentions[]` (person IDs, never assignment, D27); `reviewChoice` approved|returned and `reviewedAt` set by the reviewer.
- meeting: `repliedAt{person: stamp}` when a guest answers; `meet` (Google Meet requested; the link comes from Google Calendar sync, D24).
- project and resource: `look = {f, p}` (shader family index 0–7, palette index 0–9; resources use family 8 folder, 9 note, 10 link), chosen once at creation as the least-used among siblings and saved. Art is generated from the record ID plus look; no stored image. Supersedes the earlier `hue` field.
- offer: may carry `resource` and `meeting`; acceptance creates one task with `links:[resource]`, `meeting`.

**Shared UI pieces UX2 owns (prototype):**
- People picker `pmHtml(key, query, exclude)` + `PICK[key] = {refresh, pick}`: Presidency and divisions, members on hover with photo, nickname, role; keyboard Up/Down/Right/Left/Enter/Tab/Escape. Used by quick-add @ (`qa`), composer (`cp`) and Schedule "Meet with" (`mw`). Hidden accounts must stay out of the person list (IAM to supply the filter).
- Identity art `IDN` (plan.js): one offscreen WebGL context, still PNG per tile, animation only while hovered, none under reduced motion or hidden tab, CSS gradient fallback. Modes: 0 project (liquid), 1 folder (layered), 2 note (paper, neutral), 3 link (swirl).
- Gantt (work.js): ranges 1 week/2 weeks/1 month/3 months; drag bar or ends, Left/Right moves a day, Shift+Left/Right changes due; one record changes per operation, Undo appends.
- Schedule shortcuts: T, D, W, M, J/N, K/P, C (on the Schedule page M means Month, not the global meeting shortcut).
- Updates "Your replies": invitations, offers, reviews and decisions addressed to the member, with Not replied or the recorded choice.

**Events the screens emit (for SIG):** reply to invitation (rsvp-yes/no with repliedAt), review approved/returned, dates changed on a task (Changes entry "edited", from/to span), project/resource hue assignment is not an event.

## Round 3 additions (6 Oct)
- resource: `brief: true` marks the one note that is a project's brief; its `body` is a safe HTML subset (h3, p, ul, ol, li, b, i, a with https href, a with `data-ref="type:id"` for in-app pages). RES must sanitise on the server the same way.
- resource link: `ref = {type: task|meeting|resource|project, id}` for a link to a page inside dwdg'ONE (resource_references); `url` stays empty. Removed targets show as "Removed page" without leaking titles.
- milestone: created from the Overview with title, owner, target (state active).
- Form controls (work.js `cfUpgrade`): any `select.input` or `input[type=date].input` becomes a custom control automatically; code keeps reading the hidden native element. UX1 may adopt this into the design system.


## Round 4 additions (6 Oct)
- project: `team = [{id, state: joined|invited|declined, by, at, answeredAt?, direct?}]`. Same-workspace and Presidency people are `joined` at once (`direct: true`); other divisions start `invited`. Lead and PM stay separate fields. `canSeeProject` includes any non-declined team entry and any workspace with a joined member (joint work). Request R8.
- update types: `pinvite` (to invitee), `padded` (direct add), `pinvite-yes`, `pinvite-no` (to inviter); ref `{type: 'project', id}` opens the project. Your replies lists project invitations.
- Changes verbs: added/invited/removed a collaborator, joined, declined to join, moved (resource).
- resource: `parent` now used inside projects too (project folders). Moving checks edit rights and refuses moving a folder into itself.
- link tiles: `linkTile(url)` (plan.js) renders the favicon squircle; favicon source for the real build is request R7.
- resource rows: `.rt` name link opens the target; the row opens the inspector (`data-insp`).
- wheel: one document-level rule in work.js maps vertical wheel to sideways scroll for any horizontal scroller.

**Events the screens emit (for SIG), round 4:** project invitation sent, accepted, declined; collaborator added or removed; resource moved.


## Round 6 additions (6 Oct)
- project: `org: boolean` (organisation-wide: every member can see it; the owning workspace runs it; set by President, VP or Admin). Request R9.
- Projects register scopes: ws (owned), shared (joint with the workspace, or org-wide run elsewhere), org, all (President, VP, Admin). Session keeps `pscope` and `psort` (stage, due, start, name). Default view is grid.
- Resource rows: single click opens the inspector, double-click opens the target (same as clicking the name).
- Calendar create: start = the 15-minute slot under the pointer (floor), default length 60 minutes.


## Round 7 additions (6 Oct)
- task: `deps = [{id, type: FS|SS|FF|SF}]` on the successor. Rules: no self-link, no cycle (checked transitively), a link never moves dates; violations are shown and fixed only through an explicit preview (fixPlan: smallest forward shift, duration kept, dependency order). Request R11.
- task and meeting: `icon = {n, c}` (n from ICONSET in work.js; c a colour key or #hex). `reactions = {emoji: [personId]}`, one per person. Updates `react-task`, `react-meeting` to the owner (deduped while unread).
- Gantt (work.js ganttV2): add-on-grid creates a task with start and due from the dragged days; drag connectors create links; Changes verbs `linked`, `unlinked`.
- Projects register timeline (plan.js projectTimeline): band = start to target, fill = tasks done / total (counted, not a health score).

**Events the screens emit (for SIG), round 7:** dependency linked/unlinked/type changed, dates fixed (one Changes entry per moved task), reaction added (owner notified), icon changed (no notification).


## Round 8 additions (6 Oct)
- task: `assignees = [{id, state: joined|invited|declined, by, at, answeredAt?, direct?}]`; `taskPeople(t)` = lead + joined. My Work includes joined tasks; canEditTask includes joined people. Updates: `tasked` (asked), `tadded` (added directly), `tasked-yes`, `tasked-no`. Changes verbs: added a person to, asked a person to share, removed a person from. Request R13.
- Date fields: id ending in due/target/date (not composer or calendar dates) shows the due flag; id ending in start shows the start mark.

**Events (for SIG), round 8:** share request sent, accepted, declined; person added or removed from a task.


## Round 9 additions (6 Oct)
- project and resource `look` is assigned once in creation order (ensureLooks) and never recomputed; seeds carry fixed looks.
- task: `order` (number) sets its row in the project timeline; unset tasks follow by start date.
- Undo history: every toast with an Undo function joins one stack (max 50); redo is snapshot-based. Shell placement is request R14.


## Round 10 additions (6 Oct)
- task: `parent` (task id or null), `inWbs` (bool), `phase` (bool), `order` (number among siblings), `remarks` (string). Summary = phase or has children; summaries are excluded from projTasks, My Work, the board and stats; their dates and progress roll up (rollup()). Links and Fix dates apply to work packages only. Request R15.
- milestone: `parent` (task id) places it in the WBS; dragging changes `target` (Changes entry "edited").
- Project tabs: overview, wbs, work, resources (route projects/:id/wbs).
- render wrapper in work.js keeps scroll (workaround for R16) and records page states for back/forward.


## Round 11 additions (6 Oct)
- Wheel rule (work.js): sticky elements keep vertical wheel scrolling; horizontal mapping only over non-sticky content.
- Timeline drop rule: left half = sibling before or after, right half = last child (wbsDrop). Keyboard: Alt+Up/Down move among siblings, Alt+Left/Right change level.
- WBS rows and tree boxes carry data-wrow / data-wid; right-click opens the WBS menu (with reactions).


## Brief step 4 additions (6 Oct)
- person: `linkedin`, `phone`, `hidePhone`, `joined` (date). Person calendar rule (personWeek): a meeting title is visible when the viewer organizes or was invited, or the meeting belongs to the viewer's own workspace or an organization-wide project; unavailable shows "Unavailable" and Google busy "Busy" to anyone but the person.
- routine: `{id, name, unit|null, personal, project, cadence: weekly|2w|monthly|custom, every, start, from?, dueOffset, time, owners[], rotate, checklist[], paused, skips[], createdBy, at, icon}`. Occurrence = task with `routine`, `occ` (date) and `checklist [{text, done}]`; generated up to 21 days ahead plus the next one; never merged. Editing or pausing removes only future occurrences nobody started. Unit routines: canCreateProject threshold; personal: owner only.
- milestone: `roadmap: true` puts it on the batch roadmap; only President and VP edit those. Session `rmOpen[personId]` keeps the strip open or closed.
**Events (for SIG):** routine created, edited, paused, occurrence skipped; profile fields changed (no notification).


## Round 13: Operations (6 Oct)
- Routes: `#/operations` (board), `#/operations/:id` (routine page), `#/operations/new` and `#/operations/new/personal` (builder), `#/operations/:id/edit`. The Projects register no longer has a Routines scope.
- Run (occurrence task) fields added: `moved` (date the run was moved to; due = moved + dueOffset). A moved run is kept when the definition is edited (pruneFuture skips it).
- Run state is derived, never stored: done, done late (doneAt after due), overdue (open, due passed), open now (run date reached), coming up (in My Work), planned (not generated yet, shown as coming up), skipped (date in skips).
- Routine icon: the same `{n, c}` as tasks; changing it updates every unfinished run.
- Permissions shown: Co-Director and up of the unit create, edit, pause, skip, move, restore and delete unit routines; members see the board and routine pages read-only and get a neutral denial on the builder; personal routines are visible only to their owner.
**Events (for SIG):** run moved, run restored (in addition to routine created, edited, paused, run skipped).


## Round 14 additions (6 Oct)
- Task: `signoffMode` ('on' | 'off' | absent = automatic), `signer` (per-task override), `doneBy`, `finishedAt`, `signedBy`, `signedAt`. Helpers in work.js: signerFor(t), canSignOff(t), canManageSignoff(t); setStatus is wrapped so "done" by a non-signer becomes "review" with reviewer = signer.
- Routine: `signoff` (default true for division routines), `signer`, `asks [{id, occ, task, kind: skip|move, to, by, reason, at, state: open|approved|declined|withdrawn, decidedBy, decidedAt}]`. Run state adds "rev" (waiting for sign-off).
- Update types: `run-ask`, `run-ask-ok`, `run-ask-no` (plan.js UPD). Sign-off uses the existing `review` and `approved` types.
- Session: `rmMode[personId]` = line | open | hidden (replaces rmOpen), `mwCol` (folded My Work groups).


## Programs and build specs (6 Oct, updated brief)
- program: `{id, name, div, goal, owner, start, end, createdBy, at}` (db.programs). project and routine: optional `program` (one program at most, same division). Routes `#/programs/{id}`, `#/programs/new`. Helpers in plan.js: canCreateProgram (Director and up, Admin), canManageProgram (owner, creator, division Directors and up), canPlace (item editors or program managers, same division), pgStats (counted from children; routine runs excluded from task counts).
- Session `pgBy {projects, ops}` keeps the Group by program toggles.
- Update and Changes verbs: created program, added to a program, took out of a program.
- **Build specs:** `UX2/out/specs/` is the contract for the frontend build of W015–W018 and the screens added by the owner (Operations, programs, WBS, sign-off, person panel). Each screen lists fields, states, permissions, events and builder.
