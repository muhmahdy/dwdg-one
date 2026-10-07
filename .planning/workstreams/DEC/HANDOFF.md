# DEC handoff log

Newest first. Each session appends: date, model, what changed (paths), evidence, open questions, next step.

## UI sprint · UXD2

7 Oct 2026 · Claude Opus 5.5

**Files.**
- Changed: `prototype/div-ee-cons.js` (1,447 lines) and `prototype/div-ee-cons.css`.
- Also added a `prototype-uxd2` entry (port 5197) to `.claude/launch.json`, as the other sprint sessions did.
- No other file changed.

**Data.**
- Demo data is seeded lazily into `db.ee` and `db.cons` (seed versions 1 and 2).
- Core records are reused by ID: `p-hms`, `ms10`, `p-breakfast`, and UX2's `pg-train`, `p-coh1` and `p-coh2`.
- The file adds:
  - EE follow-up tasks `ee-f0` to `ee-f4`;
  - Consulting tasks `cons-rev1` and `cons-fu1`;
  - the draft project `p-umkm`;
  - the cohort session meetings `m-tnd-1` and `m-tnd-2`;
  - the staffing offers `o-st-zahra` and `o-st-naufal`.
- The agreed IDs `opp-hms` and `ho-hms` exist.
- `lgl-hms-pks`, `lgl-hms-bast` and `inv-hms-1` are linked by hash. When `db.fnl` holds one of these records, its state is read from there. Otherwise the screen says "State kept by FnL".

### Screens and routes

**External Engagement.** These show in the EE nav and are hidden for the Board.
- `#/relationships`: an organization table with stage-count filters and an in-place search over names and aliases. New relationship warns about possible duplicates.
- `#/relationships/<org>`:
  - contacts, with details restricted by branch;
  - opportunities, open follow-ups, and the interaction history with attempts;
  - linked projects, and Edit.
- `#/opportunities`: a Table or Board view, filtered by Partner or Client. The side states (on hold, lost, withdrawn) have their own columns.
- `#/opportunities/<opp>`:
  - the stage track and a gated stage menu;
  - proposal versions and the agreement link to FnL;
  - the handoff card;
  - follow-ups, interactions, stage history, and Edit.
- `#/followups`: follow-ups grouped as Overdue, Today, Next 7 days, Later and No date.
  - Record outcome closes the task.
  - Postpone needs a reason.
  - Recently completed follow-ups are listed below.

**Consulting.** These show in the Consulting nav.
- `#/engagements`: overview tiles, handoffs to Consulting, and the portfolio table. Each row shows:
  - Setup needed, the lane and the next milestone;
  - overdue work, blockers and decisions;
  - readiness and client follow-up.
- `#/engagements/<project>`:
  - roles and the start decision;
  - scope versions and change decisions;
  - deliverables and client updates;
  - risks and blockers, and legal and finance duties;
  - staffing and Knowledge used;
  - Close and Export.
- `#/engagements/<project>/<deliverable>` opens the deliverable panel:
  - the readiness checklist;
  - versions with their reviews;
  - submit, review, PM check and waiver;
  - delivery and the client response.
- `#/engagements/ho-…` opens the handoff panel.
- `#/staffing` and `#/staffing/<id>`: requests and offers, a candidate search across every division, and New staffing request. A member outside Consulting sees only their own offer.
- `#/knowledge` and `#/knowledge/<id>`:
  - the library, the review queue for curators, and your contributions;
  - the article page: provenance, versions, publishing to an audience, "Used in" at exact versions, reports and withdrawal.
- `#/cohorts` and `#/cohorts/<co>`:
  - the program, its cohorts and learning needs;
  - on each cohort, the sessions and the participant matrix;
  - the participant panel: submissions, review and the outcome gate.

**Shared views.**
- The task panel shows a follow-up's EE context and where a revision task comes from.
- Updates and Changes link to these routes through `ref.h` and `target.h`, wrapped the same way as `div-hr-sng.js` does it.

**Indonesian.**
- About 930 keys.
- They are filled only where `ID_DICT` has no entry, so other streams' wording is never overwritten.
- "Scope" follows the core term "Cakupan".

**Demo account added:** `arief`, an EE Client member and the PIC for HMS.

### Demo click path (about 8 minutes)
1. Sign in as **Rani** (EE Director) and open Opportunities, then **Data workshop for HMS members**.
   - Open the handoff card and click "Send to Ilham" in the side panel. It is refused because the win is not recorded yet.
   - From the stage menu choose **Won**, fill "What was agreed" and save. The notice "Won is not signed or paid" appears.
2. Click **Send to Ilham**. The card moves to Requested. Point out "What the receiver sees" and the locked contact and budget fields.
3. Sign in as **Ilham** (Consulting, Project Associates).
   - Updates shows "Rani sent you a handoff". Open it and click **Accept**.
   - The engagement is preselected as the HMS data workshop, so no project is duplicated. Click **Accept handoff**.
   - The engagement page opens with Setup needed (start decision). Record the start decision.
4. Still as Ilham, open Staffing, then **Co-facilitator, session 2**.
   - Naufal declined; Zahra (HR) is waiting.
   - Candidates show availability and TnD completion, never HR scores.
5. Sign in as **Zahra** (HR member). Open Staffing and click **Accept**. One task appears in My Work, and her division stays HR.
6. Sign in as **Reza** (Consulting Director). Open Engagements, the HMS data workshop, then **Session 1 deck and exercises**.
   - Version 1 was returned and has exactly one revision task.
   - Approve version 2.
   - Under Scope, **Decide** the change to version 2 and approve it. The One-page handout turns to **Approval stale**.
7. Sign in as **Putri** (PM).
   - On the deck, click **Confirm completeness**. All 5 checks pass.
   - Record delivery, then the client response. They are separate records.
   - Close engagement stays unavailable while the other deliverables are open or stale. Show the PKS, BAST and invoice duties.
8. Optional:
   - As **Tasya** (EE Partner), the HMS contact details are restricted.
   - In Follow-ups, record a no-response on the Fakultas Hukum call. The attempt stays in the history and exactly one next follow-up is created.
   - As **Dimas**, publish version 3 of the cleaning checklist. The HMS engagement keeps version 2.
   - As **Putri**, open Cohorts, then Consultant cohort 1, then Zahra. Completed stays disabled until session 4 and the case presentation are recorded.

### Requirement IDs covered
- External Engagement:
  - `external_relationship`, `external_stages`, `external_interaction`, `external_followup`, `external_no_response`;
  - `external_directory_privacy`, `external_opportunity`, `external_client_branch`, `external_partner_branch` (stages only), `external_handoff`;
  - `data_processcontrols`, `entity_partner`, `entity_contact`, `entity_interaction`;
  - `flow-external-intake`, `flow-external-followup`, `flow-external-handoff`.
- Consulting:
  - `consulting_portfolio`, `consulting_start`, `consulting_roles`, `consulting_scope`, `consulting_deliverable`, `consulting_review`;
  - `consulting_revision`, `consulting_stale_ready`, `consulting_client_update`, `consulting_risk`, `consulting_close`, `consulting_export`;
  - `consulting_project_associates`, `consulting_knowledge`, `consulting_tnd`, `access_member_scope`;
  - `flow-consulting-start`, `flow-consulting-review`, `flow-consulting-deliver`.
- Work packages: W050–W052 and W061–W065.
- Stories: S010, S039–S041 and S054–S061.
- Blueprint §5, §10 and §12.

### Assumptions POL, IAM or the spec pack must confirm
1. **Stage lists.**
   - Opportunity stages follow blueprint §5. The final stage reads "Won" for a Client and "Active partnership" for a Partner. On hold, lost and withdrawn are side states.
   - The relationship stage on the organization is a separate list (`external_stages`).
   - Both stay open under `external_validation`.
2. **Stage gates.**
   - Contacted needs a recorded interaction.
   - Lost and withdrawn need a reason.
   - On hold and paused need a review date or an explicit "no date".
   - Won names an EE Director or Co-Director as the authorizer.
   - Sending the handoff needs Won and a saved proposal version.
3. **Visibility.**
   - Contact details and confidential fields go to the PIC, the backup, the matching branch, and EE Co-Directors and up.
   - The President and VP see the records but not the contact details.
   - Branch is read from the member's title until IAM provides branch grants.
4. **Handoff receivers.** The receiver is a named Consulting Co-Director or Director, and the Consulting Director may also answer. A draft is visible to EE only.
5. **Consulting authority.**
   - Scope changes are decided by the Consulting Director or the Project Associates Co-Director, never by the proposer.
   - The reviewer is never the PL, the owner or the submitter.
   - A waiver needs the Director.
   - Delivery and client updates are recorded by the client-update owner or the PM.
   - The start decision and roles are recorded by Co-Directors and up.
6. **Readiness.** Five checks: reviewer approval, approval against the current scope, an evidence link, no open blocker, and the PM completeness check.
7. **Closure.**
   - Every deliverable is client-accepted.
   - There are no open blockers.
   - Each legal or finance duty is resolved or handed to a named FnL person.
   - Closing sets the project to Completed and the handoff to Fulfilled.
8. **Knowledge.**
   - Audiences: whole organization, Consulting, or named people.
   - The curator is the Knowledge Co-Director or the Director, and never the author.
   - Publishing supersedes the previous version.
9. **TnD.**
   - Completion rule v0.1: every recorded session attended, an approved assignment, and the case presentation milestone `ms-c1b` achieved.
   - Staffing sees only "Completed".
10. **Staffing evidence.** Declared availability and TnD completion only.

### Unfinished
- External Engagement:
  - Relationship merge (`external_duplicate_merge`): only the duplicate warning is built.
  - Relationship export (`external_events_export`).
  - Editing or archiving a contact.
  - Partner obligations, fulfillment and renewal (`external_partner_branch` steps 8–10).
  - The Partner to FnL agreement handoff: links only.
- Consulting:
  - The protected-date cascade (`timeline_protected_dates`).
  - A curator duplicate-check step in Knowledge.
- TnD:
  - Creating sessions or assignments from the cohort page (one assignment is seeded).
  - Needs workflow beyond adding a need.
- FnL screens belong to UXD3. This file only links to `#/fnl-requests/<id>` and reads `db.fnl` generically.
- `?fail=save` keeps the draft for New relationship, Log interaction, Send handoff and Submit version only.

**Question for the PM.** Which route does the invoice use? I linked `#/fnl-requests/inv-hms-1`. UXD3 may use `budget/...` instead.

### Evidence
- **Headless (happy-dom):** 14 accounts in English and Indonesian rendered every route and panel with 0 errors. A scripted run of steps 1–8 passed.
- **Browser:**
  - 1440 px, dark and light.
  - 390 px, light: no horizontal page scroll on any route.
  - 0 console errors.
- **Not checked:** a screen reader pass, and 390 px in dark mode.
