# Operations and routines

**Packages:** W099 (WRK routines engine), screens built with W015/W016. **Stories:** S079.
**Requirements:** work_routines, work_type_model, work_task_fields, work_task_lifecycle, access_project_creation_cd, org_timezone_calendar, work_programs. Owner decisions D15, D31, D34, D35, D47.
**Prototype:** `prototype/work.js` (opsBoard, opsDetail, opsBuilder, rhythm, rtBeats, ensureRoutines, sign-off and run requests).

## Words

- **Routine:** a definition of recurring work (name, owning division or one person, schedule, due offset, who does it, steps).
- **Run:** one occurrence of a routine ("putaran" in Indonesian). Each run is its own task with its own ID, owner, due date, checklist and completion; finishing one never finishes another (work_type_model).
- A personal **repeating task** is a routine owned by one person, visible only to them.

## Record

routine `{id, name, icon {n, c}, unit | null, personal, project | null, program | null, cadence weekly | 2w | monthly | custom, every, start, from, dueOffset, owners[], rotate, checklist[], paused, skips[], signoff, signer, asks[], createdBy, at}`.
run = task with `routine`, `occ` (planned date), optional `moved` (date it was moved to; due = moved + dueOffset), `checklist [{text, done}]`.

**Engine (WRK):**
- Generates runs up to 21 days ahead plus the next one (runs appear in the person's My Work about three weeks ahead). All dates in Asia/Jakarta.
- Monthly on day 29 to 31 falls back to the month's last day.
- Rotation: run n goes to owners[n mod count] when taking turns, else always owners[0].
- Editing or pausing removes only future runs nobody started (not done, no step ticked, not moved); past and started runs keep their history (work_routines acceptance 2).
- Skipping adds the date to `skips` and removes that run only; the next run is unchanged.

## 1. Operations board

**Route** `#/operations`, sidebar item "Operations" right under Projects (request R17 asks UX1 to own it in the shell), count = running routines of the workspace.

- Header: "Operations", "Work that keeps {division} running, week after week"; **New routine** (Co-Directors and above) or **New repeating task** (on the personal tab).
- Tabs: {workspace short name}, Your repeating tasks, All divisions (President, VPs, Admin).
- **This week:** one card per run due this week or still open: routine icon and name, the person's photo and name ("Your turn" in green for the viewer), run date, due state (icon and colored word: Due {date}, Due today, Overdue {n} days, Waiting for sign-off), steps done as small segments and "{d}/{n}", and a round check button for whoever may finish it.
- **Rhythm:** every routine on one shared axis, 12 weeks (4 back, 8 ahead; 6 weeks on phones). Header: month name above, week-start day number below, this week's number in a green pill; week columns lightly banded, this week tinted. Each row: icon, name, short schedule ("Weekly, Mon"), or "Paused", or "{n} requests" for leaders. Each run is a beat at its date: the photo of the person whose turn it was with a ring for the recorded outcome (Done green with a check, Done late amber with a clock, Overdue red with "!", Open now dark ring, Waiting for sign-off lime ring, Coming up faded with dashed ring, Skipped a small slashed dot). Beats shrink to small photos when tight and to dots when very tight, so they never overlap. Hover shows date, person and outcome; clicking a beat opens that run's task panel. A legend sits under the chart.
- **Group by program** toggle on the Rhythm header groups rows under their programs (D47).
- **Empty:** "No routines yet" with an explanation and New routine (leaders) or "Co-directors and above set up routines for a division. You can repeat a task of your own." Personal tab: "Nothing repeats yet" with New repeating task.

**Size:** M.

## 2. Routine page

**Route** `#/operations/{id}`.

- Header: large icon (click to change, editors), name, the routine as one sentence ("Every 2 weeks on Wednesday. Each run is due 2 days later. Salsa, Fikri and Mahdy take turns. Nadia signs off each run."), Running or Paused, Edit, Pause or Resume, More (Delete routine).
- Its own rhythm strip (14 weeks).
- **Requests** card (leaders): "{who} asks to skip {date}" or "{who} asks to move {date} to {date}", the reason, Decline, Approve.
- **This run:** "This run", state, the person (or "Your turn"), run date and due date, the checklist to tick, actions: "Done, send to {signer}" or Mark done (doer), Sign off and Ask for changes (signer), Open the task, Move (date picker in place), Skip this run (leaders; hidden while waiting for sign-off). With no open run: "Nothing open right now. Next run {date}, {name}'s turn." or the paused message.
- **Coming up:** the next six runs (generated and planned): date, person, state, Move and Skip, or Restore for a skipped date.
- **History:** past runs newest first: date, person, outcome (Done, Done {n} days late, Overdue {n} days, Skipped), steps.
- Side column: "Takes turns in this order" with numbers and "Up next", steps for each run, About (belongs to, program chip, serves a project, created by and date), and the note "Each run is its own task in that person's My Work, three weeks ahead. Finishing one never finishes another. Edits change future runs only."
- **Denied:** a routine of a division the viewer cannot see, or someone else's personal routine: "This routine isn't available".

**Size:** M.

## 3. Routine builder

**Routes** `#/operations/new`, `#/operations/new/personal`, `#/operations/{id}/edit`. A full page written as questions, with a live preview on the right.

| Question | Control | Record |
|---|---|---|
| Name | large title input with the icon button | name, icon |
| When does it come round? | Every week, Every 2 weeks, Every month, Every few days; weekday buttons (weekly kinds), every {n} days (custom), First run date ("Then the same day each month.") | cadence, every, start |
| When is each run due? | Same day, 1 day later, 2 days later, 3 days later, A week later | dueOffset |
| Who does it? (division routines) | Take turns or Same person every time; chips in order with numbers, Move earlier, Remove, Add a person (division members by rank) | owners, rotate |
| Who checks each run is done? (division routines) | A leader signs off, or Nobody, it counts when ticked; who signs off (division leaders) | signoff, signer |
| Steps for each run (optional) | numbered inputs; Enter adds the next, Backspace on an empty step removes it | checklist |
| Does it serve a project? (optional) | project select | project |

- **Preview:** "How it will run", the sentence, the next six runs with date, person and due date, and "Each run becomes its own task in that person's My Work, three weeks ahead." When editing: "Runs already done or started stay as they are. The rest follow the new plan."
- **Validation:** name required; first run required and not in the past for a new routine; at least one person.
- **Save:** Create routine, Make it repeat (personal) or Save for future runs. Toast with Undo.
- **Denied:** a member opening the division builder sees "Routines for a division are set up by co-directors and above" with a button to the personal builder (work_routines acceptance 3); editing without rights: "You can't edit this routine".

**Size:** L (with the engine: WRK M).

## 4. Run requests and sign-off

- Members cannot skip or move runs. In their run's task panel: "Can't make it? Ask to skip or move this run" opens Skip it or Move it (date), Why? (required), Send to {leader}. While open: "You asked to skip this run. Waiting for {leader}." with Withdraw.
- Leaders see requests on the routine page, in My Work's Needs your response, and as "{n} requests" on the board. Approve applies the skip or move; Decline leaves the run. Both are recorded (`decidedBy`, `decidedAt`) and the asker is notified.
- Sign-off of runs follows shared.md section 2.

## 5. Permissions shown

| Action | Who |
|---|---|
| Create, edit, pause, delete a division routine; skip, move, restore a run; approve requests | Co-Directors and above of that division (same threshold as projects) |
| Create a personal repeating task | anyone, for themselves |
| Finish a run | the person whose turn it is (then sign-off if on) |
| Sign off a run | the routine's signer, or another leader above the doer; never the doer |
| Ask to skip or move | the person whose turn it is |
| See division routines | members of that division (and the Presidency) |

## 6. Events

routine created, edited, paused, resumed, deleted; run skipped, moved, restored; run request sent, approved, declined, withdrawn; run finished (sent for sign-off), signed off, returned. Changes entries in the division's workspace (personal routines write none). Updates: run-ask (to leader), run-ask-ok, run-ask-no (to asker), review and approved for sign-off.

## 7. QA checks

1. A Co-Director creates a fortnightly routine; three runs have three IDs, owners and completion states (work_routines acceptance 1).
2. Editing the definition changes no past run; skipping one leaves the next unchanged (acceptance 2).
3. A member cannot create a division routine but can make a personal repeating task (acceptance 3).
4. A moved run survives a later edit of the routine.
5. A member's request to skip is applied only after a leader approves it.
