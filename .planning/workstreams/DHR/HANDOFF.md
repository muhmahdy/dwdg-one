# DHR handoff log

Newest first. Each session appends: date, model, what changed (paths), evidence, open questions, next step.


## UI sprint · UXD1 (HR screens), 6 Oct 2026, Claude Opus 5.5

Files: `prototype/div-hr-sng.js` and `prototype/div-hr-sng.css` only. Data is seeded lazily into `db.hr`. Two held weekly meetings were added to `db.meetings` by ID (`m-hrw-1005`, `m-sngw-0930`); the 7 Oct register reuses `m2`. Hooks for UXP: `window.ensureHrData()`, `window.HR_RUBRIC`. Demo account added: Zahra, an HR member and the named attendance officer.

**Screens and routes** (HR workspace nav: Attendance, Monitoring, Recognition, People)
- `#/attendance`: the viewer's own attendance, with Send absence note. A register table is shown to HR, the President, the VP, Admin and the unit's Director or Co-Director.
- `#/attendance/<registerId>`: the roster splits into Expected, Guests, Not required and "Not expected" (unit members who were not invited). Each person has a status menu and a notice outcome. The officer finalizes the register. After that, a change needs a correction with a reason, and the side panel shows the full lineage.
- `#/monitoring`: the viewer's cycles, the review queue, the HR-check queue, a table of cycles, support actions and the proposed rubric.
- `#/monitoring/<cycleId>`: cycle setup with a reviewer-gap check (the 19 Oct cycle has 4 Cons members without a reviewer). Reconciliation counts. Steps: open, review, release, close.
- `#/monitoring/<cycleId>/<personId>`: one person's assessment.
  - A report form links real tasks for each function (division and consultant).
  - The reviewer can ask questions in a clarification thread, then scores against the rubric.
  - HR runs a completeness check.
  - The member acknowledges the result or asks for a correction; every version is kept.
  - Support actions can become a task with a neutral title ("Make it a task").
- `#/recognition` and `#/recognition/<roundId>`: Member of the Month rounds.
  - Coverage, shortlist and the panel decision.
  - A review flag when a finalized score is corrected.
  - Member consent before anything is sent to MCIT.
  - The HR → MCIT packet: requested, then accepted or returned, then announced with an evidence URL and date.
- `#/hr-people`: three parts.
  - Roster with batch membership. Roster export lists the included and excluded fields and downloads a CSV.
  - Onboarding: the template is applied as 3 real tasks, and applying it again creates none.
  - Links to UXA Members and to the recruitment project.

**Demo click path**
1. Sign in as **Salsa**. Updates → "Kirana opened a monitoring cycle" opens her 5 – 18 Oct report. Fill in achievements, tick tasks and submit.
2. Updates → "Your result for 7 – 20 Sep": the scores and the formula are shown. Click Ask for a correction.
3. Sign in as **Mahdy**, Salsa's reviewer.
   - Monitoring → Assigned to you: score Salsa's 21 Sep – 4 Oct report and send it to the HR check.
   - Open her 7 – 20 Sep correction request, choose Correct the scores and save v2.
4. Sign in as **Kirana**. Monitoring → Waiting for your HR check: finalize Salsa. Recognition → September 2026 now shows a review flag from the correction; the winner stays the same.
5. Still as Kirana: Attendance → SnG weekly sync on 7 Oct shows the reason on Nadia's note. Accept it as excused. The 5 Oct HR weekly meeting shows the lineage of Zahra's correction.
6. Sign in as **Zahra**, the officer. The same note shows "Reason restricted". On the 30 Sep sync, record Fikri and finalize. Sign in as **Mahdy** (Admin): reasons stay restricted for him too.
7. Sign in as **Galih** (MCIT). Recognition → publication request → Record the announcement with a link.
8. As Kirana again:
   - Monitoring → the 19 Oct cycle: Open stays disabled until the 4 reviewer gaps are filled.
   - People → Onboarding: Sekar waits for admin approval. Once Mahdy approves her in Settings, Apply checklist creates 3 tasks, and applying again creates 0.

**Requirements covered**
- PRD requirements: hr_attendance, hr_acceptance, access_sensitive_data, hr_fortnightly_cycle, hr_scoring_policy (as proposed), hr_monitoring_member_flow, org_dual_functions (the report links both functions), hr_development, hr_exports, hr_member_month, hr_events, hr_person, hr_onboarding, flow-hr-onboarding steps 5–7, security_hr (candidate records off).
- Work packages W044–W049 and stories S029–S038.
- Blueprint §7 and the §12 handoff contract (HR → MCIT).

**Assumptions for POL or the HR lead to confirm** (all shown in the app as proposed)
- Attendance statuses and their definitions: present, late, excused, unexcused, not required, not yet recorded.
- Who records attendance: the named officer or an HR Director or Co-Director.
- Who decides excuses: an HR Director or Co-Director.
- Who reads absence explanations: the member and HR Directors and Co-Directors only. Admin does not.
- Absence note categories: class or exam, health, family, organization duty, other.
- Weekly meeting scope: one meeting per unit, linked by meeting ID.
- Cycle anchor: Mon 7 Sep 2026.
- Cycle deadlines: report at end + 2 days, review at end + 6, corrections until end + 18.
- The pilot roster covers HR and SnG members only.
- Default reviewer:
  - unit Co-Director for members;
  - Director for Co-Directors;
  - VP for Directors;
  - Cons members without a branch have none.
- HR check: done by an HR lead who is neither the member nor the reviewer; the VP is the alternate.
- Rubric v0.1:
  - Criteria and weights: Quality 30, Agreed delivery 30, Collaboration 20, Development 20.
  - Each criterion is scored 1–5. The result is the sum of score ÷ 5 × weight, to one decimal.
  - A missing criterion makes the result Incomplete.
- The President, the VP and the member's Director or Co-Director see the finalized result only (D30). Reports, clarifications and support actions stay with the member, the reviewer and HR.
- Award month: a cycle counts toward the month in which it ends.
- Award panel: HR Director, HR Co-Director and the VP, with a recusal rule. Coverage must be complete before the panel decides. "No award" is an option.
- Member consent is needed before a packet goes to MCIT. The MCIT receiver is a Director or Co-Director.
- Onboarding template items: handbook, buddy, access.
- The fields in the roster export.

**Unfinished, or for the PM**
- Plug-in gap: `refTitle` and `chgRow` in plan.js know only the core record types. I wrapped `PAGES.updates`, `ACT['open-update']` and `chgRow` so records that carry `ref.h` or `target.h` show a title and open their route. A small registry in app.js would replace this.
- Not built:
  - the HR "Programs" screen (D47 programs are UX2's `#/programs`);
  - the recruitment candidate module (P1; it waits for hr_validation);
  - the audit for restricted HR exports.
- Members outside HR reach their attendance and monitoring pages only through Updates. Whether My Work gets an entry point is a PM decision.
- Changes entries name records only, never reasons or scores.
