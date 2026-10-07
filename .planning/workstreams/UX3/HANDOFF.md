# UX3 handoff log

Newest first. Each session appends: date, model, what changed (paths), evidence, open questions, next step.

## UI sprint · UXA — 2026-10-07 (Claude Opus 5.5)

Account lifecycle: invite and approval, first sign-in and profile, appointments, transfer, isolation, presidency handover and Admin recovery, leaving and alumni. Files: `prototype/accounts.js`, `prototype/accounts.css` only (plus a `prototype-uxa` entry on port 5195 in `.claude/launch.json` for this session's preview). Data lives in `db.acct` (created lazily; people, tasks and offers are reused by ID). Nothing in `data.js` or other sessions' files changed.

**Screens and routes**
- `#/members` (nav "Members" in every workspace for Admin, President, VP, HR Director/Co-Directors, and Directors for their own division): roster grouped by Presidency and division, filter Active / Waiting / Paused / Former, division filter, "N unresolved" badge, Admin-only "Hidden accounts" row (IT operations account, `access_hidden_it`). Tabs: Members, Invitations, Appointments, Presidency, Account audit.
- `#/members/<id>`: membership (org, batch, workspace, role, consultant function, joined, Google account for roster reviewers, invited and approved by), account actions with the rule that allows or refuses each one, duties left unresolved, open duty counts, role grants with dates, actor and predecessor, division membership history, account history (reasons restricted).
- `#/members/<id>/transfer`, `/pause`, `/leave`: one preview page each with details, what changes (access delta), every open duty (tasks: keep, leave unresolved, or offer to a named person; reviews: leave or ask someone; projects, decisions, routines, resources, unanswered offers listed), then Apply with Undo. Refused actions show the reason and change nothing.
- `#/invites` (+ `#/invites/<id>` opens one): open / joined / expired-or-revoked lists; side panel to create (name, Google account, workspace, role, link lifetime; duplicate address, existing member and same-name checks), copy link, correct details (new link), revoke with reason, renew an expired link, Admin approve or don't approve, history.
- `#/invite/<id>` public link (shown on the sign-in screen): nothing about DWDG before sign-in; prototype account chooser; wrong account sees nothing; expired, revoked and already-accepted states; Accept creates one pending person and lands on the existing "You're almost in" screen.
- `#/welcome` first sign-in after approval: membership, who invited and approved, the four words (Workspace, Project, Work, Resources), what you can do by role, HR onboarding tasks if UXD1 created them, optional LinkedIn/phone, language, theme, Open My Work.
- `#/appointments`: President (links to Presidency), VP and six Director offices with holder and since, Co-Director offices (action disabled until the rule is adopted), D28 draft notice, appointment history. Side panel: person, effective date (later date = scheduled), reason, predecessor preview, Appoint with Undo.
- `#/handover`: current office with office record number; normal handover (incumbent nominates, successor accepts or declines, incumbent signs in again, confirms) and Admin emergency recovery (account state, reason, evidence, successor acknowledges, Admin signs in again, confirms). Stale office record number refuses the confirm; other open handovers become "Out of date".
- `#/members/audit` (Admin, President): restricted account audit with reasons.
- Blocked sign-in screens for paused, left, alumni and not-approved accounts.

**Demo click path**
1. Sign in as Kirana (HR Director). Members → Invite someone: a name and `name@students.uii.ac.id`, workspace EE → Create invitation → Copy invitation link → "Prototype: open the link as the invited person".
2. Continue with Google → pick Andi (wrong account: nothing shown) → Use another account → pick the invited address → Accept invitation → "You're almost in".
3. Use another account → Mahdy (Admin). Updates shows the acceptance; Members → Invitations → the person → Approve.
4. Use another account → pick the new person → Welcome page → Open My Work.
5. Kirana → Members → Salsa → Move to another division → choose EE, offer one task to Fikri, leave one unresolved → Move. Salsa's page shows the unresolved duty; Fikri has the offer; SnG and EE Changes show the move.
6. Raka (VP) → Members → Mahdy → Pause access: refused, "Mahdy holds the Admin grant". Appointments → Director of EE → Appoint Alya with a reason (Undo restores Rani).
7. Rani (EE Director) → Members → Eko → Pause access with a reason. Sign in as Eko: "Your access is paused".
8. Fadhil (President) → Members → Presidency → Nominate Raka (division afterwards SnG). Raka accepts. Fadhil: Sign in again with Google → Transfer the presidency. Mahdy → Account audit shows every step with reasons.

**Requirements covered:** D2, D6, D14, D28 (as draft), D29 (Board kept out), access_invitation, flow-admin-invite (flow-invite-review, flow-invite-delivery), flow-invite-accept (flow-accept-signin, flow-accept-landing, flow-accept-race), onboarding-invitations, onboarding-first-view, security_auth, access_appointments (S006), access_presidency_transfer (S004, S005), access_admin_scope, access_isolation_rank (S008), flow-membership-revoke (flow-revoke-preview, flow-revoke-apply), flow-membership-transfer (flow-transfer-preview, flow-transfer-apply, S007), hr_roster_change, security_offboarding, access_revocation, access_denied, access_hidden_it (Admin view only), org_dual_functions, entity_invitation, entity_membership, entity_role, security_audit, DATA_OWNERSHIP_AUTHORITY §3-6, §8.

**Assumptions POL / IAM / the spec pack must confirm**
1. Roster reviewers (create invitations, move members, end memberships) = Admin plus HR Director and Co-Directors.
2. Invitations create Members only; Board of Supervisors invitation is shown disabled (Board accounts stay UXP's demo account). Link lifetime 14 days by default (7/30 options).
3. Isolation baseline: strictly lower effective rank inside reporting scope; President and Admin organization-wide; equal rank refused with "not decided". Restore uses the same rule.
4. Ending a membership: HR leads only below their own rank; Admin anyone except the President (handover first) and the Admin grant (successor rule open). Alumni read-only access is not granted (not decided).
5. Appointments: an appointee for Director comes from that division; the predecessor stays as a Member of their division; a predecessor without a division (VP, President) must be given one, labelled "not decided by the plan". No acceptance step for appointees (the plan names none). Co-Director appointment disabled.
6. Outgoing President's division after the office ends is chosen in the handover; successor's previous role ends. Recovery requires evidence unless the account is paused. Successor acknowledgment applies to recovery too (proposed).
7. Reassigning a duty always goes through a task offer (consent); a reviewer swap is direct plus an Update. Projects, routines, resources and decisions stay "unresolved until the lead or Director names a successor".
8. Reasons for pauses, departures and recoveries are visible to Admin, President, HR leads and the actor; Changes show only that access changed.
9. The hidden IT account's powers and custodian are not decided; it appears only on the Admin's Members page.

**Unfinished**
- Admin bootstrap and organization setup (flow-admin-bootstrap) is an operator runbook, not a screen; not built.
- Scheduled appointments and transfers never auto-apply because the demo day is fixed (6 Oct).
- No account deletion screen; "Account deleted" exists only as a recovery reason. Privacy purge is out of scope.
- Members nav appears under the workspace capabilities; UX1 may want it in the Organization group instead.
- The phone More menu lights up for Members, not for Invitations/Appointments/Presidency (they are tabs inside Members).
- Evidence: checked in the browser pane at desktop width (about 1330 px wide pane, not exactly 1440) and at 375 px, light and dark, English and Indonesian, 0 console errors; every flow above was clicked through. `node --check prototype/accounts.js` passes.

## UI sprint · UXP — 2026-10-06 (Claude Opus 5.5)

Team performance (D30), Board of Supervisors (D29), President and VP attention views (blueprint §4). Files: `prototype/perf.js`, `prototype/perf.css` only. UX1 added `p.role === 'board'` to `visibleDivs` in app.js at UXP's request; UXD1 exposed `window.ensureHrData` and `window.HR_RUBRIC` so Performance reads `db.hr` by ID.

**Screens and routes**
- `#/performance` (nav in every workspace): the viewer's team, scoped by role. Member: own page. Co-Director: own branch (Consulting) or the division's members below CD. Director: division. VP: reporting divisions, with a "this workspace / all reporting divisions" switch. HR Director and Co-Directors and the President: everyone, same switch. Board: division summaries only. Period = the 14-day HR windows (anchor Mon 7 Sep) or all cycles. Columns: HR cycle state, attendance (finalized registers only), completed, completed on or after due, overdue now, open blockers, sent back after review, offers accepted. Every number opens its records in the side panel (`perf-list`). Sorted by name; no sort by numbers, no totals in lists.
- `#/performance/<personId>`: delivery tiles (plus "waiting for sign-off", not counted as completed, D35), weekly registers with status chips and links to the HR register pages (`#/attendance/<id>`), every 14-day cycle with state; a finalized cycle shows raw criterion values and the weighted result (rubric v0.1, proposed). Reviewer rationale only for the person, HR leads and the reviewer. Out of scope = neutral denial.
- `#/performance/div/<divId>`: division summary (work tiles, HR cycle coverage counts, attendance counts). Board, President, VP, HR leads, Admin, that division's Director.
- `#/attention` (President, VP, Admin): counters, division cards that filter the page, decisions waiting for you and for others, escalations, unanswered cross-division handoffs (pending offers between divisions, project invitations across divisions, HR→MCIT publication packets in `requested`, EE handoffs from `db.ee.handoffs` when that file adds them), open blockers by severity, milestones and project ends in 14 days, approved decisions in 30 days and organization-wide projects. "What the Board sees" opens Oversight.
- Escalation flow (`db.perf.escalations`, `#/attention/<escId>` opens it): VP escalates a blocker with a reason and optional needed-by date → President acknowledges and names the next-step owner and date, or returns it for information → VP adds information and sends again, or withdraws → President records the resolution. Updates go to the sender and the next-step owner; each step writes the source division's Changes; every step has Undo (appends a Changes entry).
- `#/oversight` (Board landing, also viewable by leaders): read-only notice, division table (director, open projects, next milestone, overdue milestones, open blockers, decisions waiting; a row opens that workspace's Projects), open blockers, decisions waiting or decided in 30 days, milestones in 30 days.
- Board account `board-hadi` (Hadi Santoso, Board of Supervisors) on the sign-in list. Lands on Oversight. Every write is refused with one neutral toast and 0 changes (capture-phase guard for clicks, New menu, N/M/C keys, form submits, drags). The record exists in `db.people` only on the sign-in screen and during a Board session, so it never appears in any other member's pickers, mentions or search.

**Demo click path**
1. Sign in as Kirana (HR Director). Performance: HR team, Zahra shows Late (corrected entry), Indah Exempt. Switch to Everyone; open "Division summary" on SnG.
2. Sign in as Mahdy (SnG Director). Performance: SnG team. Annisa shows Incomplete (never 0). Click Mahdy's "Completed" number: the side panel lists the exact tasks.
3. Open Salsa: September cycle shows 4/5, 4/5, 5/5, 3/5 and the weighted result 80 (proposed rubric). Change Period to 21 Sep – 4 Oct: the cycle shows Submitted.
4. Sign in as Raka (VP). Attention: click the SnG division card to filter, then Escalate on "Q3 outcome numbers from Finance are not in yet", write a reason, send.
5. Sign in as Fadhil (President). Updates: "Raka escalated an item to you" opens it. Acknowledge, choose Daniel as next step, write what happens next. Raka and Daniel get Updates.
6. Fadhil: Attention → "What the Board sees".
7. Sign in as Hadi Santoso (Board). Oversight lands. Click New: "Board accounts are read-only". Open SnG → Projects read-only. Performance shows division summaries only; `#/performance/salsa` is denied.
8. Sign in as Salsa (member): Performance shows only her own page.

**Requirements covered:** D29, D30, D35 (counting), D14, analytics_team_performance, access_board_scope, access_surface_scope (Board), hr_fortnightly_cycle and hr_attendance (read only), hr_scoring_policy (Incomplete ≠ 0), access_sensitive_data (no reasons, no notes), blueprint §4 (attention, escalation), §12 (handoff states), W098, W101, S078, S081.

**Assumptions POL / IAM / DHR must confirm**
1. Which HR people "see everyone" (proposed: HR Director and Co-Directors).
2. Branch membership for Co-Directors (proposed Consulting map: Ilham → Bima, Naufal; Dimas → Olivia, Qonita; Putri → Maya, Prasetyo). Non-branch Co-Directors see their division's members.
3. Does the Admin grant add performance scope? Built per D30 literally: Mahdy sees SnG only. Admin does get Attention for all divisions.
4. Leaders see raw criterion values; rationale only for the person, HR and the reviewer (UXD1's rule). D30 says leaders see "feedback"; owner to decide.
5. "Completed on or after the due date" taken literally from D30, so a task done on its due date counts. If the intent is "late", it becomes "after the due date".
6. Reviews sent back counts the latest review choice only (tasks keep one `reviewChoice`).
7. Escalation: only the VP escalates, only to the President, with no threshold (blueprint says policy is open).
8. Board icon is a placeholder shield (D19 has no Board mark). Board name "Hadi Santoso" is fictional.
9. UX1 flagged that full read access to every workspace may be wider than "division summaries". access_board_scope text allows every division's projects, milestones, blockers and decisions read-only, so it was kept; owner to confirm.

**Unfinished**
- Decision approve/hold/reject with rationale and version (blueprint §4 step 3) uses the existing decision panel (approve/reject only); SnG decision packets are UXD1's.
- Attention reads EE→Consulting handoffs only if UXD2 stores them as `db.ee.handoffs` with `state: 'requested'`; check after UXD2 lands.
- The Board guard is a prototype net; real enforcement is IAM's server check (access_action_matrix).
- Demo task history is thin (few completed tasks in the seed), so most delivery numbers are 0. This is honest, not a defect.
