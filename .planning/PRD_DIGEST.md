# PRD digest — what the planning workspace actually requires

Written by Claude on 6 Oct 2026 while reading the complete `state/PLANNING_WORKSPACE.md` (revision 4). Purpose: a faithful, compact index of requirements so design/prototype work stops inventing. Every bullet cites the requirement ID. This digest summarises; the workspace JSON remains the source of truth.

## 1. Product, scope, vocabulary (lines 1–380)

- `vision`: one dependable place to understand responsibilities, execute projects, find resources, retain knowledge across batches. Keep concepts and cost small. Polish = advertised actions work across roles, phones, languages, recoverable failures; NOT every ERP feature. Acceptance: a member identifies next work, updates it, finds its resource, sees saved result without WhatsApp.
- `vision-name` (confirmed): Workspace = one organisational context. Project = initiative within a workspace. **Work** = execution; **Resources** = files, notes, folders, external links. **Capability** = specialised workflow enabled for a workspace. Project main navigation has exactly 3 tabs **Overview / Work / Resources**. EN/ID vocabulary in 100% of navigation/forms/help.
- `vision-pains`: fragmented work, duplicate entry, unclear coordination, lost continuity. Prior failures: duplicate workspace/division navigation, inconsistent actions, shallow requirements, **generic dashboards**.
- `vision-personas`: every member has division + consultant function; Mahdy = SnG leader + highest Admin; President all workspaces; VPs reporting divisions; PL/PM/reviewer are engagement roles, not rank. Hidden IT account concealed.
- `vision-pilot-value` (P1): measure adoption without surveillance; no productivity rankings; resource-finding ≤60s target.
- `vision-distribution`: private invite-only org app; public login page reveals no internal names/counts/content.
- `scope_launch_core`: launch = real sign-in/access, current organisation/batch, shared **projects/tasks/milestones/blockers/decisions**, **meetings/minutes**, internal notes/folders/link-based Resources, **in-app reminders/inbox/search/export**, minimum validated department paths. Specialised views reuse shared records.
- `scope_link_first`, `scope_links_default`: external working documents as links; native notes + internal folders; no binary upload in v1.
- `scope_deferred` (deferred): WhatsApp/Telegram bots, **external calendar sync**, auto social publishing, channel analytics, e-sign, payments/bank/payroll/tax/accounting, **AI summaries**, automation builder, public client portal, multi-tenant. Launch copy never promises a deferred integration.
  - NOTE: owner said on 6 Oct "we're planning to use Google Calendar API" → conflicts with this deferred item; recorded as D23, needs a PRD update.
- `scope_hr_strategy_gap` (open): no HR/SnG survey evidence; proposed fields are hypotheses; no invented sample programmes as production data.
- `scope_pilot`: pilot cohort Admin/President, one VP, one member, PL/PM, legal/finance approvers; sanitised demo data.
- `scope_student_scale` (confirmed): 40+ members, Rp35k target / Rp50k ceiling, mobile access.

## 2. Organisation (lines 374–665)

- `org_current_six` (confirmed): President → one VP → six divisions EE, MCIT, HR, FnL, SnG, Consulting.
- `org_team_identity`, `org_workspace_config`: workspace maps to a unit and enables shared pages **plus selected domain tools (capabilities)**.
- `org_batch_model`: **batch** (start/end, draft/active/closed); roles per batch; only one active batch in ordinary navigation; closed batches readable.
- `org_future_three_vp` (confirmed P1): ideal 3-VP chart; current one-VP stays until activation.
- `org_handover`: batch handover checklist of open tasks, blockers, approvals, follow-ups, resources, accounts.
- `org_timezone_calendar`: Asia/Jakarta; timed instants vs date-only due dates stored separately; date-only deadlines never shift.

## 3. Access (lines 666–1090)

- Permission to enter a workspace ≠ edit/delegate/approve/export/archive/manage (`access`).
- `access_admin_scope` (confirmed): Mahdy highest Admin above President; separate Admin grant.
- `access_president_scope` (confirmed): all workspaces; title ≠ admin/finance/legal powers.
- `access_vp_scope` (confirmed): VP switches only within reporting divisions.
- `access_member_scope` (confirmed): division context + consultant function + **consented** cross-division work with bounded grants.
- `access_member_edit` (confirmed): member creates/edits/deletes own standalone tasks; cannot create projects.
- `access_delegation` (confirmed): **any member may offer a cross-division task; recipient must accept** (no acceptance by silence); pending offers ≠ assignments.
- `access_project_roles`: PL (solution/content/review) and PM (schedule/coordination/risk) distinct from rank.
- `access_project_collab`: project grants for cross-division collaboration.
- `access_invitation`: pending → accepted → active; expired/revoked.
- `access_surface_scope`, `access_sensitive_data`, `access_url_disclosure`, `access_denied`: one access filter for nav/search/counts/files/export; neutral "unavailable" for restricted; designed not-found/denied states.
- `access_audit`: user-facing **Changes** is selected-workspace-only.
- Open: `access_current_leaders` (do not seed invented people as real), `access_finance_policy`, `access_legal_policy`, `access_review_self_policy`, `access_admin_handover`.

## 4. Divisions (lines 1091–…)

### SnG (`division_strategy`, hypotheses pending SnG validation)
- Initial working layout: **Now / Next / Later initiatives, shared milestones and decision trail**.
- `strategy_initiative`: objective, problem, owner, horizon, hypothesis, evidence links, decision status, linked project, review date.
- `strategy_research`: research notes (source, date, finding, uncertainty, proposed decision) as shared resource notes.
- `strategy_reviews`: idea → research → decision pending → approved / hold / rejected; approved links a project.
- `strategy_dependencies`: dependency list/chain on other workspaces' tasks/milestones; no default impact×certainty matrix.
- P1: metrics registry, experiments, decision queue/export.

### HR (`division_hr`)
- People-centred, not a generic project dashboard: recruitment queue (P1), **onboarding checklists**, membership/batch continuity.
- `hr_person`: profile vs batch membership; not "employees".
- `hr_attendance` (confirmed): **weekly meeting roster + absence notes**; present/late/excused/unexcused/not-required/unknown.
- `hr_roster_change`: offboarding shows open tasks/resources/approvals to transfer.
- `hr_development` (P1): 14-day monitoring/grades confirmed by owner; rubric open.
- `hr_private_feedback`: deferred.

### EE (`division_external`)
- Survey: clear PIC, partnership timeline, **mobile follow-up and reminders**.
- `external_relationship`: organisation, kind, owner (PIC), contact, stage, source, next follow-up, linked projects/resources.
- `external_stages`: prospect → contacted → discussion → agreement in review → active → paused/closed; lost needs reason.
- `external_followup`: follow-up is a canonical task; same item in relationship detail, **My tasks and Schedule**.
- `external_interaction`: interaction log; never claims WhatsApp/email delivery.
- `external_handoff`: client → Consulting/Legal/Finance via linked IDs.

### MCIT (`division_marketing`)
- Survey: accessible shared data, executor deadlines, **attractive usable UI**, notes, **proof of progress/completion**.
- `marketing_campaign`, `marketing_content` (executor, internal due vs planned publish, reviewers, evidence URL), `marketing_lifecycle` (idea → drafting → review → revision → approved → scheduled → published), `marketing_cadence` (content calendar: planned vs actual), `marketing_brand_assets`, `marketing_it_requests` (new → triaged → working → waiting → resolved/closed), `marketing_account_register` (no passwords), stale approval on new version, per-channel publication evidence.

### FnL (`division_legal_finance`)
- `legal_request` (NDA/PKS/BAST/SK/other intake), `legal_pipeline` (draft → submitted → triaged → drafting → in review → revision → approved for signature → awaiting signature → signed → registered/archived), `legal_sla` (open), `legal_numbering` (open), `legal_templates`, `legal_signature_status`, `legal_bast_gate` (PKS → BAST → invoice handoff to Finance; never automatic payment).
- `legal_requester_view`, `legal_urgent` (short lead time shown, exception recorded), `legal_number_void`, `legal_events`, `legal_export`, `legal_acceptance`.
- Finance: `finance_budget` (allocation per project/category, missing allocation shown as unavailable not zero), `finance_request` (requested / approved / paid kept separate; draft → submitted → under review → approved/rejected → partially paid/paid → reconciled; no self-approval), `finance_validation` (integer IDR, duplicate warning), `finance_comparisons` (allocation, commitment, paid, outstanding, no double counting), `finance_receipts_export`, `finance_sop` (open), `finance_amend`, `finance_events` (approved stays visibly unpaid). P1: adjustments, incoming invoices, period snapshot.

### Consulting (`division_consulting`, confirmed)
- Strongest survey evidence. Overview of tasks/PIC/dates/milestones/blockers/decisions/revisions across projects **without re-entering data**. PL = content/direction; PM = schedule/coordination/risks/client updates.
- Structure: Consulting Director → CD Project Associates / Knowledge / TnD → members. Members from any division may consult via consented staffing.
- `consulting_roles` (PL, PM, team, client contact, reviewer as person IDs; missing PL/PM = setup gap), `consulting_scope` (reviewed scope change), `consulting_delivery_lanes` (planning → discovery → analysis → solution → internal review → client delivery → closed; proposed), `consulting_review` (pre-delivery checklist; counts, not a quality score), `consulting_revision` (review feedback → linked revision task), `consulting_client_update`, `consulting_portfolio` (per-project PL/PM, state, next milestone, overdue, blockers, pending decisions; **no manual progress %**), `consulting_start`, `consulting_deliverable`, `consulting_stale_ready`, `consulting_events`, `consulting_export`, `consulting_acceptance`. Deferred: timesheets. P1: close, risk, Knowledge/TnD branches.

## 5. Experience planning and user flows (lines 2568–…)

- `experience-planning`: journeys = actor → screen/action → guard → record/output → failure/return → handoff. Measured design values; 0 arbitrary layout exceptions.
- `flow-operating-boundary`: external publication/signature/payment/message happens elsewhere and is only recorded here.
- `flow-accept-landing`: landing is **own workspace Home / My tasks**; single-workspace user sees no misleading switcher; empty state is real, no fake seeded project.
- `flow-member-orientation`: Home → task inspector → project Overview → project Resources; Back restores selection; viewing never changes status.
- `flow-member-first-action`: change own task to In progress, add evidence URL; reload shows same ID.
- `flow-daily-triage`: Home/My tasks filters **overdue / today / upcoming / undated**; Schedule shows timed meetings + declared availability, **Unknown where missing**; date-only due items are all-day; 3 tasks ≠ Busy.
- `flow-daily-execute`: blocker (description, requested action, owner, severity) on the same task; submit for review or complete.
- `flow-daily-return`: review return → Updates → revise; completion row may dissolve after save; **Undo** within window; Changes filtered by task.
- `flow-lead-plan`: CD and up create project (purpose, scope, owner, date or unknown) → Work (task, milestone, owner, date, prerequisite) → Resources (folder/note/link), delegate via inspector/avatar.
- `flow-lead-review`: review exact submitted version; stale approval blocked; escalate blocker to VP.
- `flow-lead-report`: close needs resolved items (task % alone never closes); export; Changes filtered by project.
- `flow-vp-scope` / `flow-vp-action`: VP lands on permitted portfolio Home/Organization; workspace selector switches Home/Projects/Schedule/Resources consistently; Changes is one selected unit only.
- `flow-president-overview`: six-unit project matrix (owners, milestones, blockers), **no fictional health score**; no all-org Changes feed.
- Account lifecycle flows (backup operator, transfer, revoke, term handover): operator/admin journeys, mostly for the real build, not the prototype.
- Division flows (`flows-divisions`): each division = start → useful outcome → failure path → named handoff. SnG initiatives (idea → research → decision → linked project); HR roster → invitation → **3 real onboarding tasks** → transfer/departure; EE relationship → interaction → follow-up task → handoff to Consulting/Legal/Finance; MCIT content brief (internal due vs planned publish) → review of exact version → publication evidence per channel; MCIT IT request → triage → resolve → requester confirms; Legal intake → draft/review versions → number (disabled until policy) → signatures → BAST gate → Finance handoff; Finance allocation → request → independent approval → partial/final payment → reconcile; Consulting scope/PL/PM → deliverables + 6 flat tasks → blocker vs risk → review V1/V2 → delivery → close.
- Shared flows (`flows-shared`):
  - `flow-resource-*`: project → Resources; add internal folder / native note / HTTPS link; right-click, keyboard, visible action or long-press opens the **same inspector** (title, type, version, creator, notes, **responsible avatar bubbles**); Create task / Link task from a resource; responsibility ≠ provider access.
  - `flow-meeting` (**"no Google Calendar sync is assumed"**): Schedule → New meeting: title, start/end/timezone, participants, **agenda/links, minute-taker**; picker shows declared windows, recorded-meeting overlaps, absence status without reason; undeclared = **Unknown**; conflict → change or record override reason; adjacency is not overlap; **export .ics** instead of sync. Edit/cancel with reason; cancelled frees capacity. Outcomes: held time, attendance where known, **minutes note, decisions, follow-up tasks**.
  - `flow-availability-declare`: Calendar → **Block unavailable time** (dates, start/end, all-day, timezone, note; note visibility); edit/delete own block; recurrence edit options occurrence / future / series. No CD/HR approval needed.
  - `flow-availability-assign` (P1): avatar inspector shows overlaps before assignment.
  - `flow-crossdivision`: Request handoff with receiving owner/action/evidence/needed-by; recipient accepts or returns.
  - `flow-timeline-change` (P1): Work → Timeline 7D/2W/1M/3M/6M/1Y; dependency preview.
  - `flow-changes`: **Changes** opened from workspace navigation (not a 4th project tab), chronological page for the selected workspace.
  - `flow-export`: CSV / JSON / notes+link manifest with preview.
  - `flow-save-conflict`: honest save failure, draft kept, compare on stale version.
  - `flow-notification`: **Updates** inbox; read ≠ done.
- `onboarding-first-view`: member → own workspace + My Work; lead → review-needed + blockers; VP → reporting portfolio; President/Admin → choose contexts. **No generic fictional dashboard.** Empty state explains Workspace, Project, Work, Resources.
- `onboarding-profile`: minimal profile; **missing photo shows initials**.
- `workflows` (page list): **Home, My tasks, Projects, Schedule, Resources, Updates, workspace Changes, Organization, Settings, enabled division tools**.
- `work_home`: overdue / blocked / review-needed, assigned tasks, today's timed meetings; no decorative KPI grids.

## 6. Shared work pages (`workflows`, lines 4802–5560)

- `work_switch_context`: Admin/President/VP pick permitted workspaces; **ordinary member sees workspace identity only** (no switcher). Switching changes projects, search, schedule and counts together; remembers last context.
- `work_my_tasks`: groups **overdue, today, upcoming, undated, completed**; text/project/status/date filters; **list / board / timeline alternatives**; bulk actions with counts.
- `work_projects_register`: **compact grouped rows** (by workspace or status): owner, deadline, **completed/all tasks, next milestone, blocker**; **Grid and Timeline alternatives**; measured at 1440×900.
- `work_project_tabs` (confirmed): exactly **Overview / Work / Resources**. Overview = goal/scope, owners, milestones, blockers, decisions, meaningful activity. Work = tasks list/board/timeline. Resources = notes, folders, files, apps, links. People/decisions/activity open in inspectors.
- `work_overview`: name, purpose, in-scope/out-of-scope, owning workspace, lead, PM, collaborators, start/target, status, next milestone; links to blockers/decisions/review/resources.
- `work_task_fields`: title + context required; assignee or **unassigned queue**; optional description, priority, **date-only due or timed due**, project/milestone/resource links, contributors, evidence, created/updated/completed actor/time. Standalone personal task allowed. **Offer → accept is separate from assignment.**
- `work_task_lifecycle`: **not started → in progress → in review → completed**; blocked = blocker flag; cancelled/archived; review can return with reason.
- `work_project_lifecycle`: **draft → planned → active → in review → completed → archived; on hold / cancelled need a reason**. Task % separate from status. (Owner's 9-stage set in D20 is the visual version of this.)
- `work_work_views`: list/board/timeline on same tasks; board drag has keyboard alternative.
- `work_milestones`: title, owner, target, proposed/active/review/achieved/cancelled, required tasks, reviewer, evidence. Overdue ≠ achieved.
- `work_dependencies`: finish-to-start; no cycles. Blocker ≠ dependency.
- `work_blockers`: affected item, description, owner, **low/medium/high severity**, needed action, due, open/escalated/resolved/withdrawn, resolution. No health scores.
- `work_decisions`: draft → awaiting → approved/rejected/superseded; question, alternatives, approver, date, resulting change, links.
- `work_schedule`: **combined agenda/calendar of tasks, milestones, follow-ups, publishing dates and meetings**; date-only items in all-day rows; meetings have timezone, start, end, participants, location/link; filters by **workspace / project / person**; opening an item goes to its canonical record.
- `work_meeting_composer`: **compact composer expanding in place**: title, start/end, timezone, participants, **agenda, project/workspace, meeting URL/location**; conflicts only against known DWDG meetings; unknown labelled; **"do not claim Google Calendar conflict detection"**.
- `work_meeting_outcomes`: planned → held/cancelled; agenda and **minutes as linked resources**; create follow-up tasks and decisions from minutes.
- `work_updates`: **Updates** inbox with per-user read state: assignment, review request, due reminder, decision, important project change; grouped.
- `work_reminders`: in-app only at launch; no closed-app/WhatsApp promise.
- `work_search`: tasks, notes, projects, people, resources, decisions, domain records; result shows type, context, last update.
- `work_organization`: President/Admin **organization overview**: units, projects, lead, next milestone, blockers; Consulting master matrix is a derived view.
- `work_settings`: personal (language, theme, motion, transparency, reminders) separate from admin config; sign-out and export easy to find.
- `work_forms`, `work_undo_archive`, `work_link_integrity`, `work_concurrent_updates`, `work_activity`: honest saving, Undo with conflict check, neutral missing records, append-only activity, Changes per workspace.
- P1: `work_templates`, `work_subtasks` (one level).
- `work_availability` / `availability_declared` (**confirmed**): every member records completely unavailable dates/times **with notes**; all-day flag; timezone; no HR approval; empty schedule = **Unknown**. Recurrence and note visibility still open.
- `availability_overlap`: start-before-other-ends; adjacency clear; cancelled excluded; restricted meetings show neutral busy interval.
- `availability_person_inspector` (P0): **avatar opens person inspector** (role, assigned tasks/projects, due work, known meetings, declared windows with last-updated).
- `availability_override` (open), `availability_stale` (no recorded conflict ≠ free).
- Timeline: `timeline_ranges` **7D/2W/1M/3M/6M/1Y**, `timeline_unscheduled` (Unscheduled list; due-only = marker), `timeline_date_validation`, `timeline_dependency_semantics`, `timeline_protected_dates`, `timeline_missing_prerequisite`, `timeline_milestone_rollup` (milestone rail), `timeline_accessible`. P1 cascade.

## 7. Resources (`resources`, confirmed, lines 5560–)

- One Resources tab: folders, notes, apps, links; every resource linked to canonical tasks.
- `resource_types`: internal folder, note, external file/folder URL, external app/document URL, **meeting note**, template reference. Upload disabled.
- `resource_explorer`: groups, **breadcrumbs**, compact rows or grid, type/search/filter, recent updates.
- `resource_bubbles` (confirmed): **responsible-person avatar bubbles** with overflow; click opens inspector.
- `resource_inspector` (confirmed): **right-click** + overflow button + Enter + tap; delegation, add task, edit/delete, creator, notes in side panel; full-screen on mobile.
- `resource_responsibility`, `resource_tasks` (create task from resource: title, assignee, due, priority, context), `resource_folder`, `resource_external_folder`, `resource_creator` (added-by for external), `resource_notes` (revisions, no realtime), `resource_revisions`, `resource_provider_access`, `resource_move`, `resource_delete` (archive), `resource_pin` (P1), `resource_search`.
- `resource_secret_links` (account registry with vault reference, never passwords), `resource_object_note` (short purpose note in inspector, long brief as separate note), `resource_link_validation` (HTTPS only), `resource_link_issue` ("can't open" report → owner), `resource_events`, `resource_export_*`, `resource_account_history`, `resource_launch_limits` (open).

## 8. Analytics (lines 6016–6275)

- Charts only from saved records, with basis and an exact-value list; **no health/productivity/hours scores**.
- `analytics_progress`: progress = completed / active non-cancelled linked tasks; empty = "No tasks yet".
- `analytics_completion`, `analytics_average`, `analytics_selection`, `analytics_division_counts` (per-division meaningful counts), `analytics_reports`.
- Survey (`analytics_survey`, confirmed): 8 respondents (Consulting 3, MCIT 2, FnL 2, EE 1; no HR/SnG). Most wanted: **reminders 8, progress 7, docs 7, assignment/reports/blockers 5, dashboard 4, notifications/calendar/minutes 3**, budget 1. Most-important mentions: reminders/docs 5, progress 4, **calendar 0**.

## 9. Design contract (`design`, lines 6275–)

Note: owner decisions D16–D21 (Geist, green #00C25A, official logo, design system v2) supersede the PRD's proposed Pretendard / sage / mineral palette (`design-materials`, `design-typography`). Measurements below still apply unless the owner changes them.

- `design`: quiet Notion-like working surfaces, compact CRM/task layout on desktop, Samsung-style mobile grouping/charts, **one coherent component system, not six styled apps**.
- `design-shell` (confirmed): compact sidebar, top search/action area, main region, **right contextual inspector**. Workspace name opens a **searchable allowed-context selector**; one-workspace members see identity only. Organization is an explicit destination. Capabilities appear within the same shell.
- `design-navigation`: global **Home, My Work, Projects, Schedule, Resources, Updates**; **Organization and Settings secondary**; workspace capabilities below core destinations; mobile = short dock + **More**; nothing hover-only.
- `design-project-tabs`: Overview (brief, owner, deadlines, milestones, blockers, latest decisions, readiness, compact activity) / Work (list, board, timeline, milestone views) / Resources.
- `design-density` (P1): 216px sidebar, 56px toolbar, title 24/32, body 14/20, meta 12/16; **project rows 76px grouped**, ≥4 rows visible at 1440×900.
- `design-actions`: every visible control has a defined outcome; **creation asks only for fields needed to start; extra details afterward**; no button may suggest that an email, signature, payment, **calendar sync** or publication happened.
- `design-inspector` (confirmed): right inspector keeps list/selection/scroll; mobile full-screen with Back; sections: created/added by, responsible avatar bubbles, notes, tasks, linked records, actions.
- `design-overlays`: one overlay controller; anchored pickers flip at edges; Escape closes top layer; focus returns.
- `design-motion` (P1): 120–140ms press, 180–220ms picker, 260–320ms inspector, 220ms completion dissolve; commit before removing a row; reduced motion parity.
- `design-languages` (confirmed): **EN and Bahasa Indonesia parity**; never auto-translate user content.
- `design-time`: Asia/Jakarta; date-only deadlines stay dates.
- `design-empty`: distinct empty / no-results / denied / missing / loading / offline / failed states.
- `design-search`: scoped; shows type, context, next action.
- `design-mobile`: 360/390/768/1024/1440; title + next action first; 44px targets; page owns scrolling.
- `design-accessibility`: WCAG 2.2 AA target; status not by colour alone.
- `design-preferences`: theme, language, chosen view persist per user; default theme follows system.
- `design-ui-review`: 5 widths × 2 languages × 2 themes before coding large screen sets.
- P1/P2: `design-resource-identity`, `design-shaders` (deferred), `design-discoverability`, `design-availability-evidence` (no green "free now"; date-only task doesn't occupy a day), `design-availability-assignment`, `design-timeline-interactions`, `design-collaboration-editing`.
- `design-measures`: measure at 320/390/768/1024/1440; ±1px; EN/ID × light/dark.
- `measure-spacing`: 4/8/12/16/20/24/32/40/48/64.
- `measure-breakpoints`: S <600, M 600–1023, L 1024–1439, XL ≥1440; padding 16/24/32.
- `measure-type-desktop`: 24/32, 18/24, 14/20, 12/16; min 12px; tabular figures.
- `measure-type-mobile`: body 15/22, title 28/34, inputs 16/24.
- `measure-shell`: **sidebar 216, toolbar 56, nav rows 40, icon 20, gap 12**; M/S drawer 320 (≤288 at 320px).
- `measure-navigation`: switcher 40/44px; search 40/44px; project tabs 12px gap.
- `measure-targets`: controls 40px desktop, touch 44×44, menu rows ≥32 desktop.
- `measure-icons-avatars`: icons 20px; **responsibility avatars 24px desktop / 28px phone; 3 avatars then +N**; inspector avatar 40px; **initials when no photo**.
- `measure-project-row` 76px grouped rows; `measure-task-row` 48px desktop / 64px phone, checkbox 20px with 44px target; `measure-board` 280px lanes, 16px gap, 12px card gap, 16px padding, "Move to status" non-drag control; `measure-timeline` 48px lanes, 24px day cells, 240px label column; `measure-resource-row` 52px; `measure-inspector` **360px**, 24px padding; `measure-forms` 8/16/24; `measure-dialogs` 480px (640 complex); `measure-popovers` 8px anchor gap; `measure-notes` 16/24, 72ch, saving/saved/failed label by title; `measure-charts`; `measure-changes` 64px rows, 50/page; `measure-radius-surfaces` (PRD proposes 12/20/28; design system v2 uses 12/8/6, owner-approved D21); `measure-contrast` 4.5:1 / 3:1; `measure-focus-zoom` 2px focus; `measure-motion` 120/140/180/200/220/240/300ms; `measure-mobile-dock` **64px dock + safe area + More**; `measure-state-layout`; `measure-design-handoff`.

## 10. Integrations (lines 7202–7415)

- Link-first: Docs/Sheets/Drive/Canva/Figma/GitHub/Forms links with provider/type, owner, description, last reviewed. HTTPS only.
- `integration-provider-access`: assignment never shares the provider file; inspector offers access-request step naming the owner.
- `integration-drive-ownership` (open): no shared Drive today.
- `integration-auth`: managed auth; Google sign-in candidate (owner chose it, D2); membership validated server-side.
- `integration-email` (P1): no domain; optional.
- `integration-calendar` (P1): **.ics export before calendar sync; bidirectional Google Calendar deferred until OAuth scopes, event identity, conflicts, deletion, privacy and cost are designed.** → Owner's D23 (Google Calendar API planned) needs this node updated.
- Deferred: WhatsApp automation, e-signature, payments, **AI**, previews of uploads.
- `integration-credentials`: password manager reference only.
- `integration-exports`: CSV, JSON, Markdown/print.

## 12. WBS (102 packages; P0 slice per D1 marked ★)

Groups: wg-product, wg-experience, wg-backend, wg-operations, wg-delivery, wg-planning.

- ★W001 scope baseline. W002 work forms (Project/Program/Routine/Request) + handoff template. W003 current vs ideal org. W004 authority matrix. W005 shared-task + availability consent policy. W006 privacy/retention. W007 HR attendance/14-day rubric/award rules. W008 native vs external source per collection. W009 Consulting PL/PM policy.
- **Experience (Claude owns):**
  - ★W010 reference-led visual + content direction (one Workspace concept, exactly Overview/Work/Resources).
  - ★W011 measurable tokens + component states (spacing scale, 14/20 desktop, 15/22 phone, 16/24 inputs, 44px touch, 76px project rows, 48px task rows).
  - ★W012 persistent shell + scoped navigation (six contexts only to permitted roles; switch scopes search/counts/pages/Changes; back/forward + reload keep context).
  - ★W013 forms, drafts, honest save, Undo, accessible overlays.
  - W014 (P1) account/authority UIs (invite/accept/profile/appointments/transfer/isolation/presidency).
  - ★W015 **My Work + task list/board/timeline**: own standalone tasks, **pending offers, accepted work, blockers, due-date sections**; one ID across views; pending offer ≠ accepted workload; **due-only task never creates busy hours**.
  - ★W016 **project register** (76px grouped rows + Grid/Timeline), Overview, 3 tabs, CD-only creation.
  - ★W017 **resource explorer + inspector** (52px rows, 20px icon, 360px inspector, avatars, resource→task).
  - ★W018 **unavailable calendar + participant scheduling UI**: own block composer + participant timeline inspired by the local video (R046); **exact time inputs duplicate every drag**; 09:00–10:00 clashes 09:30 not 10:00; private notes never shown; unknown never Free; **invitation acceptance**.
  - W019 (P1) six division screens incl. EE Partner/Client, MarCom content/IT, HR attendance/monitoring/recognition, FnL queues, SnG research/decision, Consulting branches.
  - ★W020 EN/ID, light/dark, focus, zoom, touch, reduced motion.
  - ★W021 rendered visual/interaction acceptance (390/768/1440).
- **Backend:**
  - ★W022 schema; ★W023 invite-only auth; ★W024 permissions everywhere; W025–W027 (P1) suspension/appointments/HR transfer; ★W028 own task lifecycle + trash/Undo; W029 (P1) task offer/consent; W030 (P1) shared-task edits; ★W031 CD-up projects; W032 (P1) milestones/blockers/prerequisites/cascade; ★W033 resources/notes/folders/revisions; W034 (P1) safe links; ★W035 unavailable blocks + recurrence; ★W036 meetings, conflicts, **invitation response**, minutes linkage.
  - P1: W037 Updates/reminders, W038 Changes, W039 search, W041 import/restore, W042 metrics, W043 concurrency. ★W040 export.
- Division delivery packages (all P1): W044 HR weekly attendance, W045–W048 14-day cycle/scoring/feedback/Member of the Month, W049 HR onboarding, W050–W052 EE Partner/Client/handoff, W053 MarCom content, W054 IT requests, W055–W056 Legal intake/register, W057–W058 Finance, W059–W060 SnG, W061–W065 Consulting/PA/Knowledge/TnD. W066 Expertise Network (later, 2027).
- Operations: ★W067 budget model, W068 custody, ★W069 environments, W070 side-effect suppression, ★W071 encrypted archive, W072 restore, W073 monitoring, ★W074 release pipeline, W075–W077.
- Delivery: ★W078 synthetic fixtures, W079–W083 verification, ★W084 pilot, W085–W087 cutover/launch/first month.
- Planning tool: W088–W094 (done per Kanban C088–C094).
- Later: W095 binary upload; **W096 external calendar sync (later, P2)**: "manual scheduling and optional ICS export remain usable"; prerequisites W036, W068, W070. D23 pulls this forward for the real build; needs owner-approved PRD/WBS change.

## 11. Backend and data (lines 7415–…), for the architecture record (Iteration 2b)

- One relational dataset; one record per task/project/person/resource across views; UUIDs + revision; server timestamps.
- `data_assumptions` (open): 60 accounts, 40 MAU, 15 concurrent, 6 divisions, **20 active projects, 5,000 tasks/year, 200 links**; stress 100/25.
- Security, operations, costs, releases, reliability, quality, roadmap, launch (lines 8759–11390): real-build gates. Key points for planning: Supabase Free + Cloudflare Pages + Google OAuth within Rp35k/50k; no Pro; independent encrypted daily export; two custodians; pilot 8–12 members over 2 weeks after staging; zero P0/P1 defects in promised scope; roadmap stages plan → foundation → core + divisions together → isolated test → pilot → gradual launch → maintenance. `quality-journey-matrix`: member, lead, resource→task, meeting→minutes→decision→follow-up, one per division.
- `changes` (confirmed): dedicated **Changes** destination per selected workspace; `changes-location` = workspace navigation **or the chronological Changes view within Updates**; exact sidebar choice open.
- Open launch decisions: custody, budget fit, file policy, invite identities, division SOP owners, **reminder delivery meaning**, data policy, brand/default language, pilot owners, restructure timing.

### Late confirmed additions (lines 11709–12111, 4–5 Oct owner decisions)
- `org_dual_functions` (confirmed): every member has **division function + consultant function**; consultant ≠ Consulting unit.
- `access_project_creation_cd` (confirmed): **CD and up create projects/engagements/campaigns**; PL/PM is not rank.
- `access_hidden_it` (confirmed): hidden IT account never appears in ordinary search/pickers.
- `access_presidency_transfer`, `access_appointments`, `access_isolation_rank` (confirmed): President transfers normally; Admin emergency appoint; President appoints VPs; Director-and-up isolation can't target higher rank.
- Open: `access_personal_shared_task_policy`, `access_availability_privacy_policy` (proposed: busy interval/category shared, note private).
- `hr_fortnightly_cycle` (**confirmed**): HR monitoring/grading every 14 days; `hr_scoring_policy` (open rubric); `hr_monitoring_member_flow`; `hr_member_month` (**confirmed** Member of the Month, packet to MarCom without raw scores).
- `external_partner_branch` / `external_client_branch`: EE has **Partner** and **Client** branches.
- `consulting_project_associates` (P0), `consulting_knowledge` (P1), `consulting_tnd` (P1).
- `work_type_model`: work forms **Project / Program / Routine / Request**, all sharing canonical tasks/resources (this is where D15's "project/program/routine/request" context chip comes from).
- `data_custody_matrix`; planner nodes `prd-planner-*` (WBS, Kanban Backlog/Ready/Doing/Review/Done/Blocked, story map, canonical JSON).

- `data_organization`, `data_batches` (term/batch), `data_people` (person ≠ account ≠ membership; **IT account concealed**), `data_roles` (time-bound grants), `data_projects` (explicit undated draft allowed), `data_tasks`, `data_meetings` (start/end, organizer, attendees, location/link, agenda, project/unit), `data_resources`, `data_linkfirst`, `data_divisionentities`, `data_money` (integer IDR), `data_dates`, `data_validation`, `data_concurrency`, `data_softdelete` (trash 30 days proposed), `data_retention` (open), `data_csv`, `data_json`, `data_manifest`, `data_restore`, `data_legacy` (**inventory the existing 3 browser local stores before any migration**), `data_dictionary`.
