# DWDG’ONE — Universitas Islam Indonesia

PRD draft 0.1 · 3 October 2026 · planning restart. Decision states are separate from build/test/deployment evidence. Existing product and records remain preserved.


## DWDG’ONE · Universitas Islam Indonesia

ID: root · confirmed · P0

PRD draft 0.1 • planning restart • 3 October 2026.
A connected, affordable organization web app for DWDG UII. This is a reviewable proposal, not an approved production implementation. Budget: target Rp35,000/month, hard ceiling Rp50,000/month. Initial audience: approximately 40 or more members. No organization-owned domain or shared Drive is currently available.
Explore product behavior, six division workflows, design, data, permissions, costs, environments, release practices, and launch evidence. Confirmed labels record explicit decisions or verified source facts; proposed labels record recommendations; open decisions need an answer; deferred items are outside the first release.
Editing this PRD changes the planning draft only. Existing application code and saved organizational records are preserved.

**Acceptance:** Every requirement can be inspected, edited, added, moved, or deleted with Undo. Export includes all requirements and their decision states.

**Owner:** Mahdy

**Source / assumption:** Current user request and budget/member/account answers, 3 October 2026; latest user budget correction: target Rp35,000/month, maximum Rp50,000/month


### Product purpose and first-version promise

ID: vision · proposed · P0

One dependable place to understand responsibilities, execute projects, find resources, and retain knowledge across student leadership batches. Keep the number of concepts and operating costs small. A polished first release means that advertised actions work across roles, phones, languages, and recoverable failures; it does not mean adding every conceivable ERP feature.

**Acceptance:** A member can identify their next work, update it, find its resource, and see the saved result without reconstructing the context from WhatsApp.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Product name and vocabulary

ID: vision-name · confirmed · P0

Brand: DWDG’ONE. Organization: DWDG UII — Universitas Islam Indonesia. Workspace is one organizational working context. Project is an initiative within a workspace. Work means execution; Resources means files, notes, folders, and external links. Capability means a specialized workflow enabled for a workspace. Avoid 'project workspace' and a second Workspace tab.

**Acceptance:** Navigation, headings, breadcrumbs, forms, support material, and PRD exports use the same vocabulary.

**Owner:** Mahdy

**Source / assumption:** User name selected in current request; Critique App Development user terminology discussion


#### Problems this release must solve

ID: vision-pains · proposed · P0

Fragmented work: responsibilities and decisions spread across chat, Sheets, Forms, and documents. Duplicate entry: the same deliverable reconstructed in several tools. Unclear coordination: missed deadlines and unresolved blockers. Lost continuity: context disappears when a batch or officer changes. Prior product failures include duplicate workspace/division navigation, inconsistent actions, shallow requirements, and generic dashboards.

**Acceptance:** Pilot interviews and task observations evaluate these problems directly; feature count and visual novelty are not success measures.

**Owner:** Product owner + division leads

**Source / assumption:** Verified survey pain-point columns E:F; current user restart and referenced critique


#### People the first release serves

ID: vision-personas · proposed · P0

Member: knows assigned work and resources, updates status, requests help.
Division lead: allocates work and reviews blockers/delivery within their scope.
VP: coordinates only reporting divisions and explicitly shared projects.
President: organization portfolio and responsible escalation.
Admin: Mahdy initially; operates accounts/configuration and recovery, with an appointed backup operator.
Specialist: PL/PM, finance reviewer, legal reviewer, recruiter, content reviewer have scoped action permissions. Actual named officers and appointment dates remain unconfirmed.

**Acceptance:** Each main journey has a named role, permitted scope, and error/recovery route. The plan never treats a title alone as unlimited authority.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Initial capacity and limits

ID: vision-capacity · confirmed · P0

Approximately 40 or more members is the user estimate, not an audited member count. This confirmed audience fact does not confirm a measured concurrency level or vendor capacity. Proposed performance fixtures are recorded separately so assumptions remain distinguishable from actual member evidence.

**Acceptance:** Actual invited/active members are counted before pilot; the estimate remains visibly approximate until verified.

**Owner:** Mahdy

**Source / assumption:** User answer 3 October 2026: '40 members more i think'


#### Proposed capacity fixtures and measured sizing

ID: vision-capacity-fixtures · proposed · P0

Use editable planning fixtures of 60 invited accounts, 15 simultaneous active members, and 100 accounts for a near-term stress case. Exercise representative task/resource/history queries, navigation, writes, and export rather than account count alone. Measure database growth, response latency, failures, and transfer under realistic record counts. These are test targets, not measured usage or a promise that every free service meets them.

**Acceptance:** A pilot capacity report records fixture size, peak concurrency, latency/error/transfer measurements, vendor quota headroom and any revised limits. Actual usage replaces assumptions before scaling.

**Owner:** Engineering + operations

**Source / assumption:** Sizing assumptions proposed for the user estimate of approximately 40+ members; actual concurrency and dataset size unknown

**Dependencies:** vision-capacity
costs
quality


#### Measure useful adoption without surveillance

ID: vision-pilot-value · proposed · P1

Proposed pilot measures: every active project has an accountable owner; each assigned task has enough context to act; a member can find a linked resource in under one minute in a usability exercise; division leads can resolve a blocker without duplicate record entry; missed reminders and failed saves are observed. Collect small anonymous or consented feedback and operational counts. Do not rank members by task volume, infer productivity, or use private HR/finance records for analytics.

**Acceptance:** At least one representative from each current division completes an observed journey; benchmark tasks and feedback methods are recorded with sample size.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Private organization app, not a public SaaS

ID: vision-distribution · proposed · P0

First release serves a single DWDG UII organization with invitation-only membership. Stable organization/workspace IDs and capability configuration leave room for reuse. Self-service organizations, tenant billing, customer onboarding, and a public marketplace are outside v1. A public login page must disclose minimal organization information and reveal no internal names, project counts, or content.

**Acceptance:** Unauthenticated users can access sign-in/help information only; a foreign organization ID cannot reveal DWDG data.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


### Launch scope, priorities, and evidence gaps

ID: scope · proposed · P0

P0 means launch integrity or complete minimum daily journey. P1 improves coverage after the coherent core. P2 stays deferred. A dense PRD can explain future direction without turning every brainstorm into a first-release commitment.

**Acceptance:** Launch checklist identifies mandatory decisions/journeys and does not claim all planned capabilities are implemented.

**Owner:** Mahdy / product owner

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


#### First production release connects six divisions through a minimal shared core

ID: scope_launch_core · proposed · P0

Proposed launch for roughly 40+ members includes real sign-in/access, current organization/batch, shared projects/tasks/milestones/blockers/decisions, meetings/minutes, internal notes/folders/link-based Resources, in-app reminders/inbox/search/export and minimum validated department paths. Specialized views reuse shared records. Evaluate all services against target Rp35,000/month and hard ceiling Rp50,000/month; native binary upload and paid integrations remain deferred unless later approved.

**Acceptance:** All six validated minimum journeys operate within the approved monthly cost target/ceiling and preserve data across reload/export.

**Owner:** Product owner

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Latest user production PRD request, 3 Oct 2026. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.

**Dependencies:** org_current_six


#### Use external tools through owned resource links to keep system small

ID: scope_link_first · proposed · P0

Use approved external working-document/tool links after organization account/folder ownership is settled. No shared Drive/domain exists today. DWDG stores context, responsibility, internal note/version metadata, review and canonical linked work. Native office/design editors, binary evidence hosting and provider mirroring remain deferred.

**Acceptance:** A real existing external resource can be registered, assigned, searched and reviewed without importing the provider's entire file system.

**Owner:** Mahdy / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** resource_provider_access


#### Defer expensive integrations and broad ERP functions

ID: scope_deferred · deferred · P2

Deferred: WhatsApp/Telegram bots, external calendar sync, auto social publishing, channel analytics, native e-sign execution, payments/bank/payroll/tax/accounting, AI summaries, automation builder, public client portal and self-service multi-tenant product. Revisit only with clear owner/cost/use case.

**Acceptance:** Launch copy never promises a deferred integration or external action.

**Owner:** Product owner

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


#### Validate HR and Strategy directly before their workflows freeze

ID: scope_hr_strategy_gap · open · P0

Survey provides no HR/S&G respondent evidence. Proposed fields/stages are planning hypotheses, not confirmed departmental needs. Schedule one representative walkthrough per team and edit the PRD; no invented sample programs become production data.

**Acceptance:** Each lead reviews a concrete proposed journey and unresolved items remain visibly open.

**Owner:** HR / S&G leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.

**Dependencies:** hr_validation,strategy_validation


#### Confirm leadership, cross-division grants, approvals and retention

ID: scope_rules_gap · open · P0

Unresolved launch inputs include current roster/reporting, action rights, project-only collaboration exception, financial limits, official legal numbering/SLA, client confidentiality, candidate data retention, resource/file caps and successor admin. Name owner and decision date for each; do not ask member users to choose system policy ad hoc.

**Acceptance:** All launch-blocking policy nodes have recorded answers and an approver before real accounts/data are onboarded.

**Owner:** Mahdy / President / domain leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. User request, 3 Oct 2026; Critique App Development conversation user messages.


#### Current implementation is reusable evidence, not production acceptance

ID: scope_evidence · confirmed · P0

Latest local QA reports 90 automated checks/build/document parity but browser visual and live interactions were blocked; shared auth/OAuth/storage/multi-user behavior was not verified. Preserve old code/data as reference. New release acceptance requires actual production-like role/file/concurrent journeys and rendered review.

**Acceptance:** PRD records known prior limits and does not label production complete from old test counts.

**Owner:** Engineering / QA

**Source / assumption:** qa/reference-redesign/VERIFICATION.md and active ACCEPTANCE.md. User request, 3 Oct 2026; Critique App Development conversation user messages.


#### Pilot uses real roles with safe representative records

ID: scope_pilot · proposed · P0

Proposed pilot cohort includes Admin/President, one scoped VP, one ordinary member, PL/PM, and legal/finance approvers; one lead per current division validates journey. Use sanitized seed/demo data in sandbox and permissioned real records only when launch policy ready. Test unauthorized paths and exports explicitly.

**Acceptance:** Pilot demonstrates owner/task/resource/deadline/review/export end to end and records failures rather than only screenshots.

**Owner:** Mahdy / division leads / QA

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_action_matrix


#### 40+ members; Rp35,000 target and Rp50,000 monthly ceiling

ID: scope_student_scale · confirmed · P0

Latest user decision: target Rp35,000/month and hard ceiling Rp50,000/month for roughly 40+ student members. This supersedes the earlier near-Rp0 target. No shared Drive or domain exists today. Plan realistic data volumes, mobile access, administration and complete recurring operating cost within the approved cap. Do not assume organization-wide paid licenses or institutional domain entitlement.

**Acceptance:** Operations plan explicitly budgets the 40+ cohort at Rp35,000/month target and never above Rp50,000/month without a new user decision.

**Owner:** Mahdy

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.


#### Open decision: organization-owned account/folder and custodian

ID: scope_org_storage_setup · open · P0

Choose who owns working document storage, who succeeds the custodian after graduation, actual provider permissions, and resource access-request contact. Drive is one option, not an existing shared asset. No personal-account folder becomes organization source of truth without ownership/handover agreement.

**Acceptance:** Approved setup names current custodian, successor and actual organization folder/access arrangement.

**Owner:** Mahdy / President / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** access_admin_handover


#### Proposed v1 stores records, notes and external links

ID: scope_links_default · proposed · P0

Use compact metadata/database records, native lightweight notes and internal folders; working PDF/office/design documents remain at approved external destinations. This baseline controls cost within target Rp35,000/month and hard ceiling Rp50,000/month. Native binary uploads, provider mirroring, heavy previews and unlimited revisions stay deferred unless separately approved. Evidence/review can still bind supplied version URLs and notes.

**Acceptance:** All six minimum journeys can finish with internal notes/folders and document URLs, with native binary upload excluded from launch cost assumptions.

**Owner:** Mahdy / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** scope_org_storage_setup


#### Optional services cannot become hidden launch dependencies

ID: scope_optional_services · proposed · P0

Sign-in provider and invitation channel are operations choices; provider setup/domain ownership are not assumed. Core external resources open by normal URL without API integration. Background reminders, file indexing, social delivery and automation require explicit later owner/cost/use case.

**Acceptance:** Core task/resource/report journey succeeds when optional integration credentials are absent.

**Owner:** Mahdy / engineering

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** scope_links_default


#### Document complete direction while releasing validated minimum paths

ID: scope_future_manifest · proposed · P0

P1/P2 branches keep recruitment detail, advanced capacity, richer analytics and integrations visible without promising launch completion. Moving a requirement to P0 requires a real use case, data need, maintainer, cost impact and acceptance scenario. Large PRD coverage is not automatic v1 scope adoption.

**Acceptance:** Release manifest separates shipped requirements, open blockers and deferred capabilities.

**Owner:** Product owner

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.


### Organization, workspaces, and batch continuity

ID: organization · proposed · P0

DWDG’ONE serves DWDG UII through one organizational model. Separate stable teams, workspaces, batch memberships, reporting lines, and enabled capabilities so future restructuring does not require rewriting pages.

**Acceptance:** Current six divisions can be represented, renamed, and later restructured without changing record identity.

**Owner:** Mahdy / organizational leadership

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


#### DWDG’ONE — Universitas Islam Indonesia

ID: org_identity · confirmed · P0

The user selected DWDG’ONE as the web app name and Universitas Islam Indonesia as its organization context. Use one exact display spelling across the planning artifact, later login, shell, reports, and exports. Confirm apostrophe treatment for domain names and compact wordmark separately.

**Acceptance:** All product-facing planning references use DWDG’ONE; older names appear only as historical source labels.

**Owner:** Mahdy

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages.


#### One Workspace concept; project tabs are Overview, Work, Resources

ID: org_vocabulary · confirmed · P0

Workspace means organizational/division context. A project is a bounded piece of work within that context. Work contains tasks/timeline/board/milestones. Resources combines folders/files/notes/apps/links. Remove ambiguous project Workspace labels and duplicate navigational entry points.

**Acceptance:** A user can explain the hierarchy organization → workspace → project without a second Workspace tab.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


#### Keep six current divisions active

ID: org_current_six · confirmed · P0

Strategy & Growth; Human Resource; External Engagement; Marketing, Communication & IT; Legal & Finance; Consulting. Client Engagement in the survey maps to External Engagement. Do not silently activate future teams or treat Client Engagement as an extra seventh division.

**Acceptance:** All six current workspaces are represented once; historical survey naming is mapped transparently.

**Owner:** Organizational leadership

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


#### Team identity survives rename or reparenting

ID: org_team_identity · proposed · P0

Each team has a stable ID, display name, short name, active/planned/archived state, and optional parent reporting unit. Store names as labels, never foreign keys. Renaming Legal & Finance changes its label while tasks, resources, permissions, reports, and history remain linked.

**Acceptance:** Rename a seeded team, reload, and verify its project, membership, resource, and audit links still resolve.

**Owner:** Product / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_current_six


#### Workspace enables capabilities without becoming another app

ID: org_workspace_config · proposed · P0

A workspace maps to an organizational unit and enables shared pages plus selected domain tools. Team hierarchy, workspace visibility, and capability flags are separate. Splitting Legal & Finance later can enable legal tools in Legal and finance tools in Finance without copying their entire records.

**Acceptance:** A workspace can enable or disable a capability without changing shared project IDs or losing historical records.

**Owner:** Admin / product

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** org_team_identity


#### Batch stores dated membership and leadership

ID: org_batch_model · proposed · P0

A batch has ID, name, start/end dates, draft/active/closed state, and reporting configuration. A person can hold different roles in different batches. Only one batch is active for ordinary navigation; closed batches remain readable by authorized users. Do not infer current role from last year's role.

**Acceptance:** Switching the active batch changes current roles without rewriting prior task authors or approval actors.

**Owner:** Admin / HR

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_team_identity


#### Validate reporting lines as an acyclic organization tree

ID: org_reporting_graph · proposed · P0

A reporting assignment joins team, supervising role/unit, and batch. Reject self-parenting, cycles, duplicate active parent lines, and inaccessible orphan teams. VP visibility derives from explicit reporting assignments, not title string matching.

**Acceptance:** A cycle or missing supervising assignment blocks activation with a list of affected teams.

**Owner:** Admin

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_batch_model


#### Future three-VP structure remains a draft

ID: org_future_three_vp · confirmed · P1

President → VP External: MarCom & IT and External Engagement with Client/Partnership. VP Internal: HR, S&G, Legal, Finance. VP Consulting: Project Delivery (provisional), Knowledge, Training. This is discussed future structure, not an assertion of current leadership assignments.

**Acceptance:** Future units appear in organization planning only and stay out of member navigation until explicit batch activation.

**Owner:** President / Mahdy

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_current_six


#### Expert Network remains planned two batches ahead

ID: org_expert_network · confirmed · P2

Expert Network was discussed for two batches ahead; its reporting relationship is undecided. Keep it as a planned unit with notes and a decision owner. No ordinary membership, access scope, or operational workflow is implied yet.

**Acceptance:** Expert Network is visibly planned, has no active member navigation, and has an explicit reporting decision marked open.

**Owner:** Organizational leadership

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_future_three_vp


#### Activate a batch only after a reviewed mapping

ID: org_activation_preview · proposed · P0

Preview proposed hierarchy, members, leadership, workspaces, enabled capabilities, open projects, resource ownership, and orphan records. Require all P0 assignments to be resolved. Activation records who approved, when, and which configuration version became active; reverting is a separate audited operation.

**Acceptance:** Dry-run lists unresolved assignments and produces no membership or project mutations; approved activation preserves previous batch history.

**Owner:** Admin / President

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_batch_model,org_reporting_graph


#### Split or merge divisions with explicit record destinations

ID: org_split_merge · proposed · P1

For Legal & Finance split, choose destination for legal requests, budgets, finance requests, shared projects, members, resources, and approvals. A preview identifies ambiguous records and permissions. Preserve IDs and historical origin; never guess destination from a title. Merges avoid duplicate copied tasks.

**Acceptance:** A split can be cancelled without change; applied mapping leaves no active record in an undefined workspace.

**Owner:** Admin / affected division leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_activation_preview


#### Preserve historical organization context

ID: org_history_snapshot · proposed · P0

Activity and approvals show actor identity and role/team at the time of the event, with current identity available separately. Closed-batch reports use the relevant batch scope. Reparenting a team does not rewrite who supervised a prior approval.

**Acceptance:** A historical project report remains traceable after a team rename, leader change, and new batch activation.

**Owner:** Admin / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** org_batch_model


#### Archive teams without deleting their work

ID: org_team_archive · proposed · P1

Archived teams stop receiving new work and leave ordinary navigation. Before archive, transfer open work and ownership or leave an explicit restricted historical owner. Historical resources remain retrievable within retention/access policy. A project cannot be assigned to an archived workspace.

**Acceptance:** Archiving blocks new assignment, preserves read access for authorized historical review, and exposes any untransferred open work.

**Owner:** Admin

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_workspace_config


#### Batch handover includes operational ownership

ID: org_handover · proposed · P0

Outgoing leads review open tasks, blockers, pending legal/finance approvals, partner follow-ups, current resources, subscriptions, and account ownership. Create a handover checklist and snapshot references; incoming leaders acknowledge assigned areas. Do not copy private passwords into a handover note.

**Acceptance:** An incoming lead can locate every open responsibility and the approved resource/account contact without reconstructing WhatsApp history.

**Owner:** President / division leads / HR

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_history_snapshot


#### Prepare isolated organization IDs; defer other-organization onboarding

ID: org_other_orgs · deferred · P2

Include organization ID in authorization and all scoped records now, but v1 launches for DWDG UII. Self-service tenants, billing, branding for other organizations, and cross-organization memberships are deferred. Future scalability must not expose DWDG data to another organization.

**Acceptance:** Architecture review shows explicit organization boundaries; v1 navigation and onboarding promise only DWDG UII.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. User request, 3 Oct 2026; Critique App Development conversation user messages.


#### Use Asia/Jakarta date semantics consistently

ID: org_timezone_calendar · proposed · P0

Proposed organization timezone Asia/Jakarta follows user locale. Store real timed instants with timezone interpretation and date-only due dates separately. Calendar reminders/activity boundaries follow defined organization or record timezone, never execution-host timezone.

**Acceptance:** Midnight and cross-day meeting fixtures render on correct Jakarta dates; date-only deadlines do not shift.

**Owner:** Engineering

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. User environment Asia/Jakarta.


#### Capability policy has owner and version across restructuring

ID: org_capability_owner · proposed · P1

Moving legal/finance tools to future teams transfers queue ownership through reviewed mapping. Preserve original batch/policy attribution; team rename cannot reset approved workflow stages/SLAs. Record capability owner, version and team mapping independently from navigation.

**Acceptance:** Reparenting preview lists pending records/policy owner and activation leaves no unowned request.

**Owner:** Admin / domain leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** org_split_merge


#### Verified duplicate person merge preserves authorship

ID: org_person_merge · proposed · P1

Potential duplicate accounts require verified identifier and admin review. Name similarity cannot prove same person. Preview memberships/tasks/resources/events, retain aliases/provenance and preserve historical actor references. Do not create a second member on repeat invite acceptance.

**Acceptance:** Verified merge preserves all ownership and historical actor links while same-name distinct people remain separate.

**Owner:** Admin / HR

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** hr_person,access_invitation


### People, roles, and record permissions

ID: access · proposed · P0

Separate permission to enter a workspace from permission to edit, delegate, approve, export, archive, or manage organization settings. UI, server, files, notifications, reports, and direct links must use the same scope.

**Acceptance:** A permission matrix covers every P0 object/action and is tested through UI and service requests.

**Owner:** Admin / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


#### Mahdy is intended administrator across all active workspaces

ID: access_admin_scope · confirmed · P0

This is a planning identity decision. Bind Mahdy to a verified account ID at setup; a display name or matching email string in a client script cannot confer admin rights. Proposed admin actions include organization configuration and membership management.

**Acceptance:** The intended administrator is explicitly named; actual account binding remains a launch setup item.

**Owner:** Mahdy

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_current_six


#### President can view all active workspaces

ID: access_president_scope · confirmed · P0

President visibility includes all current organizational workspaces. The title does not automatically confer system-admin privileges, financial approval, legal signature execution, or unrestricted destructive actions. Action rights need their own recorded policy.

**Acceptance:** President's permitted workspace list includes all active current units; admin-only controls remain governed separately.

**Owner:** President

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_action_matrix


#### VP can switch only within reporting divisions and subteams

ID: access_vp_scope · confirmed · P0

Derive the VP's permitted set from the active batch reporting graph. Parent portfolio summarizes only that set. Current VP titles and assigned divisions are not yet supplied; use explicit configuration and avoid guessing them from the future draft.

**Acceptance:** A VP receives only configured descendants, with another VP's records absent from results, counts, and exports.

**Owner:** Admin / VPs

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_reporting_graph


#### Ordinary member opens only their assigned division workspace

ID: access_member_scope · confirmed · P0

The user decided members should stay within their assigned division. A task assignment in another team cannot silently grant the entire team workspace. Multiple membership and project collaboration exceptions require explicit permission records and product policy.

**Acceptance:** A member's navigation, record search, charts, reminders, and direct links expose only the allowed scope.

**Owner:** Admin / division leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope


#### Versioned action-level permission matrix

ID: access_action_matrix · proposed · P0

Define read/create/update/assign/review/approve/archive/restore/export/manage_members/manage_roles per object type, role, and scope. Proposed defaults: members edit own assigned work; project leads manage project work; domain approvers own approvals; Admin manages access. Avoid a single broad canEdit flag.

**Acceptance:** A reviewer can determine actor/action/scope for tasks, resources, requests, budgets, meetings, and exports from one matrix.

**Owner:** Mahdy / President / domain leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.


#### Resolve current leaders and reporting assignments

ID: access_current_leaders · open · P0

Open input: current President account, current VP roles, division leaders, and which teams each VP supervises. Do not seed invented people or treat the discussed three-VP model as already active. Launch invitation/setup is blocked until these authoritative assignments exist.

**Acceptance:** Approved roster records identify every current leadership account and its actual scope before launch.

**Owner:** Mahdy / President

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_batch_model


#### Member edits assigned tasks and contributes authorized evidence

ID: access_member_edit · proposed · P0

Proposed member default: read allowed workspace projects/resources, update their assigned task status/evidence, add comments/notes in allowed records, and create drafts within policy. Changing another person's owner, closing a project, and removing other people's resources need elevated rights.

**Acceptance:** An ordinary member can finish their task and add evidence but cannot reassign another member or delete an unrelated file.

**Owner:** Division leads / product

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S04/S16.

**Dependencies:** access_action_matrix


#### PL and PM permissions are distinct from organization rank

ID: access_project_roles · proposed · P0

Survey explicitly asks separate PL/PM rights. Proposed PL owns solution scope/content and delivery review; PM manages schedule, task coordination, risks, and client-update records. A person may hold both with explicit assignment. President/VP visibility alone does not imply PL/PM authority.

**Acceptance:** A PL can record solution approval, a PM can adjust approved delivery schedule, and each action is traceable.

**Owner:** Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** access_action_matrix


#### Confirm who can approve, record payment, and view sensitive finance

ID: access_finance_policy · open · P0

Open policy: approver titles, approval limits, dual-review requirements, treasurer/payment-recorder role, and who may export financial evidence. Proposed requester cannot approve own request. Approval is a record of an authorized human decision; the app does not move funds.

**Acceptance:** Launch policy names approvers and amount rules and prevents a requester from self-approving.

**Owner:** Finance lead / President

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4/H4.

**Dependencies:** access_action_matrix


#### Confirm legal review and document-signature authority

ID: access_legal_policy · open · P0

Open policy: reviewers, official signatories, numbering issuer, revision approval, and final archive rights. User rank and access to Legal & Finance do not prove authority to sign. v1 records signature status/evidence, with actual e-sign execution deferred.

**Acceptance:** Each legal stage action has a named role; UI status wording does not imply the app executed a signature.

**Owner:** Legal lead / President

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J5.

**Dependencies:** access_action_matrix


#### Project grants allow limited cross-division collaboration

ID: access_project_collab · proposed · P0

Proposed grant joins user/team, project ID, allowed actions, reason, issuing actor, and expiry or batch. It opens only explicitly shared project work/resources. Sensitive HR/finance/legal items retain tighter restrictions. Declining or ending a grant removes project access without moving workspace membership.

**Acceptance:** A member assigned to a shared project can open allowed project records while other division projects remain hidden.

**Owner:** Admin / project lead

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_member_scope,access_action_matrix


#### Invitations carry minimum explicit membership

ID: access_invitation · proposed · P0

Invite a verified account into an organization, batch, team, and role with expiry. Proposed pending → accepted → active, expired/revoked branches. Duplicate invitation reuses or replaces the pending invite; it never creates a second person identity. Default grants no workspace until accepted and assigned.

**Acceptance:** An unaccepted invite cannot read data; an accepted invite opens only its assigned workspace.

**Owner:** Admin / HR

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_current_leaders


#### Suspension and access revocation apply immediately to new actions

ID: access_revocation · proposed · P0

Suspended/inactive membership blocks service reads/writes and new file links. UI refreshes scope, closes inaccessible details, and preserves an unsaved draft privately for review without allowing save to revoked context. Transfer assigned open tasks or show an unassigned owner warning.

**Acceptance:** A revoked member cannot save a stale open form or use an old download link beyond its defined expiry.

**Owner:** Admin / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope


#### One access filter for navigation, search, counts, charts, files, and export

ID: access_surface_scope · proposed · P0

Apply permissions before constructing results or aggregates. Hidden records must not leak titles, owner names, counts, reminders, or autocomplete suggestions. Server authorization is authoritative; hiding a sidebar item alone is insufficient for production.

**Acceptance:** Forbidden records remain absent through navigation, global search, chart counts, attachment APIs, CSV/print, and direct queries.

**Owner:** Engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_action_matrix


#### Restricted records expose only allowed fields

ID: access_sensitive_data · proposed · P0

Proposed restricted classes: recruitment contact/private review, financial evidence/payment detail, legal signatory/contact data, and client confidential documents. Store access class and reason, rather than marking an entire workspace private by habit. Shared task title cannot reveal confidential content unintentionally.

**Acceptance:** A member without restricted access sees a neutral unavailable link, never restricted field values or preview thumbnails.

**Owner:** HR / Legal / Finance / Consulting leads

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.

**Dependencies:** access_surface_scope


#### Audit role changes and high-consequence actions

ID: access_audit · proposed · P0

Record trusted actor/action/object/time/version/operation correlation and allowed before/after fields for permission changes, approvals, export, archive/restore, batch activation and number issuance. Ordinary members cannot edit events. User-facing Changes remains selected-workspace-only and applies record/field privacy. Privileged organization/security maintenance log is separate and restricted, with no implied right to broadcast cross-workspace history.

**Acceptance:** Admin can audit role/approval authority through authorized maintenance path while ordinary Changes never mixes workspaces or leaks restricted fields.

**Owner:** Admin / engineering

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_action_matrix


#### Delegation chooses from eligible people and keeps accountable owner

ID: access_delegation · proposed · P0

Delegating resource/work responsibility shows only eligible project/workspace people. Multiple contributors are allowed, but one accountable owner remains explicit. Assignment never grants hidden workspace access and must offer the project's explicit grant flow where necessary.

**Acceptance:** Assigning an inaccessible person yields a clear permission decision, not a broken link or automatic broad access.

**Owner:** Project / division leads

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_project_collab


#### Designed not-found and access-denied states

ID: access_denied · proposed · P0

Do not reveal whether a confidential record exists through title/detail/error messages. Provide a route back to the permitted workspace and an appropriate access-request contact when policy allows. Deleted records are distinguishable to authorized users through trash/history.

**Acceptance:** Opening a copied forbidden URL reveals no record metadata and leaves the user with a usable return path.

**Owner:** Product / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope


#### Resolve successor admin and emergency access ownership

ID: access_admin_handover · open · P0

Open decision: who is the second administrator or successor, what approved recovery process applies, and who owns domain/hosting/backups. A student organization cannot depend permanently on one graduating person's account. Admin transition requires verification and audit.

**Acceptance:** Launch handover names a verified successor and recovery owner; no secret is stored in ordinary planning notes.

**Owner:** Mahdy / President

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


#### Context access inheritance is distinct from folder responsibility

ID: access_resource_inheritance · proposed · P0

A resource defaults to organization/workspace/project boundary. Parent-folder responsibility is context, never automatic child task assignment or provider permission. Child restrictions may narrow access; broader child sharing uses explicit approved grant and never exposes siblings.

**Acceptance:** Adding folder owner creates no child task/member/provider grant.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** resource_responsibility,resource_folder


#### Restricted URL disclosure is an action permission

ID: access_url_disclosure · proposed · P0

A neutral project task may be visible while related contract URL/contact evidence remains private. Hide restricted URL/snippet/thumbnail in notification/search/export. Provider access is separate; DWDG should not spread a private location through a public description.

**Acceptance:** Restricted URL does not appear in unauthorized task notification or metadata export.

**Owner:** Legal / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** access_sensitive_data


#### Notifications recheck access after a queued event

ID: access_notification_revoked · proposed · P0

Render/delivery resolves current membership/grant, not event-time scope alone. Stale inbox links become neutral unavailable. If later external delivery is enabled, check scope immediately before send and avoid private title/body if recipient was revoked.

**Acceptance:** Revoke grant after event creation and opening inbox reveals no previous project metadata.

**Owner:** Engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** access_revocation,work_updates


#### Required independent approval cannot be fulfilled by role-switching

ID: access_independent_review · proposed · P0

Author submits work but cannot satisfy independent gate unless adopted small-team exception allows it. Exception records authority/reason/reviewed version. Same person PL+PM does not automatically satisfy client, legal or financial approval.

**Acceptance:** Changing displayed role cannot let requester approve their own financial request.

**Owner:** Domain approvers

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8/J5.

**Dependencies:** access_review_self_policy


#### Adopt explicit small-team reviewer separation policy

ID: access_review_self_policy · open · P0

Open: which review gates require a second person, and what happens when only one qualified reviewer exists. Proposed rule requires designated alternate or documented exception, not blocked anonymous dead-end. Student organization policy can stay lightweight while preserving accountability.

**Acceptance:** Every independent gate has alternate/exception path approved by leadership.

**Owner:** President / domain leads

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** access_action_matrix


#### Operational summary export excludes restricted fields

ID: access_sensitive_export · proposed · P0

A leadership viewer may export progress without private applicant review, receipts or signatory details. Export permission is separate from detail-field permission. Manifest explains excluded classes without leaking values; organization-wide archive/export is audited authorized-owner action.

**Acceptance:** Operational export omits private receipt/candidate fields under agreed matrix.

**Owner:** Admin / domain leads

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** analytics_reports


#### Pending approval can transfer; historical approval actor stays intact

ID: access_approver_transfer · proposed · P0

When approver leaves, authorized lead transfers pending queue with reason/notification. Successor reviews current version under own identity. Completed decisions retain original actor/batch role. Missing alternate shows escalation owner rather than silently auto-approving.

**Acceptance:** Offboarding approver leaves no dead pending queue and does not rewrite completed approvals.

**Owner:** Admin / domain leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** hr_roster_change


### Onboarding, adoption, and member lifecycle

ID: onboarding · proposed · P0

The first release must be understandable to students who have never used an ERP. Onboarding introduces the next useful action, confirms membership, and preserves operational knowledge across batches. Avoid forcing all members to fill long profiles or import every historical record before using the app.

**Acceptance:** A newly invited member can sign in, understand their context, open assigned work, and get help with no personal tutorial from the developer.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### First administrator setup and emergency recovery

ID: onboarding-first-admin · proposed · P0

Mahdy is the planned admin. Provisioning requires a verified concrete login identity, organization configuration, and an independent backup custodian. Bootstrap occurs once through a controlled server/setup procedure, not a public 'become admin' button or client-only name comparison. Recovery preserves audit history and revokes compromised sessions; no browser storage edit can escalate a real account.

**Acceptance:** Attempt duplicate bootstrap, wrong identity, forgotten access, and compromised recovery path; only verified operators can restore control.

**Owner:** Mahdy + backup custodian

**Source / assumption:** Referenced chat Mahdy admin confirmed; provisioning mechanism proposed


#### Invitation review and acceptance

ID: onboarding-invitations · proposed · P0

Invite through a validated roster: name/email, intended workspace, role, batch, and approver. Invitation has expiry and revocation. Acceptance binds the authenticated verified identity to the membership, not a display name. A typo can be corrected before acceptance. Duplicate invitations show the current state instead of creating duplicate people. Invitation delivery is separate from successful membership creation.

**Acceptance:** Expired, revoked, duplicate, wrong-email and already-member invitations produce clear recoverable outcomes.

**Owner:** Admin + HR

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### First useful view for each role

ID: onboarding-first-view · proposed · P0

Member opens their allowed workspace and My Work context. Lead sees work needing review and blockers. VP sees allowed reporting portfolio. President/admin may choose all allowed DWDG contexts with clear scope. No role sees a generic fictional dashboard as onboarding. Empty state offers the next permitted action and concise explanation of Workspace, Project, Work, and Resources.

**Acceptance:** New member with no tasks, lead with no project, and admin with empty organization can take an appropriate next step.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### A short guide, searchable help, and examples

ID: onboarding-quick-guide · proposed · P1

Provide concise EN/ID guidance: sign in, workspace scope, create/open a project, update work, use Resources, ask for help, notifications, and logout on shared devices. Examples remain sandbox-only or visibly illustrative; no demo seed mixes with real records. Explain external provider access: app assignment does not grant access to Drive/Canva.

**Acceptance:** A pilot member uses the guide to complete a task and resolve a denied external-link permission without a developer explanation.

**Owner:** Product + MarCom & IT

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Import only selected active work

ID: onboarding-migration · proposed · P0

Start with validated people/memberships and chosen active projects/resources. Do not import whole WhatsApp histories or every old spreadsheet to imitate completeness. Each import maps owners, workspace, dates/statuses and source provenance; unknown values are visible. Link old archives where appropriate. Import preview and rejected-row report are required before commit.

**Acceptance:** Source and target IDs/counts reconcile; duplicates are reviewed; no missing completion date is manufactured.

**Owner:** Data owner + division leads

**Source / assumption:** Current data preservation contract

**Dependencies:** data


#### Minimal personal profile and avatar

ID: onboarding-profile · proposed · P0

Collect display name and verified account identity, role/workspace membership, optional avatar and availability fields only if needed. A missing photo has initials and accessible name. Don't require date of birth, home address, student number, social handles, or biography for basic work. Members edit their own non-authoritative profile; organizational roles are managed separately.

**Acceptance:** A member can work without uploading a photo or providing unnecessary personal data; profile edits cannot grant role/access.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Membership changes and cross-division assignments

ID: onboarding-switcher · proposed · P0

Ordinary member scope is own division. If cross-division collaboration is needed, grant explicit project/resource collaboration with expiry/review and appropriate action rights; do not automatically expose the whole foreign workspace. Exact exception policy remains open. Workspace reassignment keeps historical attribution and audit; old cached scope is invalidated.

**Acceptance:** Move a member between divisions and grant/revoke a project exception; intended records remain available and former scope disappears.

**Owner:** President + admin

**Source / assumption:** Scope rule confirmed; collaboration exceptions proposed

**Dependencies:** access


#### Departure, suspended membership, and reassignment

ID: onboarding-leavers · proposed · P0

Offboarding revokes sessions/memberships and removes actionable assignments or reassigns them through a preview. It preserves historical authorship, decisions, and completed work. Suspended users cannot continue via direct links, cached API tokens, or pending export jobs. Transfer owned external files/account custody before removing access. HR privacy deletion is a distinct process from deleting every trace of a former member.

**Acceptance:** Offboard a fixture user while active; server reads/writes fail safely, future owners receive work, and history/export integrity remains.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Support responsibility and downtime communication

ID: onboarding-help · proposed · P0

Assign named product/support and technical operators with contact route and volunteer response expectations. Show service status/update notices without revealing internal incident details. If a free project pauses or quota blocks service, members receive a plain explanation and known fallback; app cannot show success while unavailable. Published notices require explicit authorized operator action.

**Acceptance:** A rehearsed outage has a documented triage, recovery, member-facing notice draft, and return-to-service verification.

**Owner:** Operations + President

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


### Shared daily pages and complete work journeys

ID: workflows · proposed · P0

Home, My tasks, Projects, Schedule, Resources, Updates, workspace Changes, Organization, Settings and enabled division tools read canonical linked records. Each page defines scope, action, save behavior and empty/error states. Changes is strictly the selected permitted workspace; planning-editor history and production history remain distinct.

**Acceptance:** Each shared P0 journey works with empty and real scoped records, including reload and failed-save recovery.

**Owner:** Product / engineering

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.


#### Home prioritizes attention, owned work, and today's agenda

ID: work_home · proposed · P0

Show overdue/blocked/review-needed items, assigned tasks, and actual timed meetings. Leadership may view permitted portfolio attention separately; member Home remains their division. Avoid decorative KPI/quote grids. Completed work updates list and exact progress after persistence.

**Acceptance:** A member can identify and open their next responsibility from the initial viewport; empty attention has a useful next action.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope


#### Workspace switch preserves context and scopes every page

ID: work_switch_context · proposed · P0

Admin/President/VP select only permitted workspaces; ordinary member sees workspace identity. Remember allowed last context and page preference. Preserve drafts per context, selection, filters, and scroll on harmless returns; revoked context must not remain an editable stale page.

**Acceptance:** Switch away/back restores allowed draft and view; changing context changes projects, search, schedule, and counts together.

**Owner:** Product / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_vp_scope,access_revocation


#### My tasks groups overdue, today, upcoming, undated, and completed

ID: work_my_tasks · proposed · P0

Query assigned tasks in permitted scope. Provide text/project/status/date filters and list/board/timeline alternatives. Include undated tasks visibly. Bulk actions state selected count and permitted changes; unsupported mixed permissions report which items are skipped before save.

**Acceptance:** A task with no deadline remains findable; filters and record IDs stay consistent across view switches.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S01/S02/S04.

**Dependencies:** work_task_fields


#### Projects uses compact grouped rows with Grid and Timeline alternatives

ID: work_projects_register · proposed · P0

Default register groups by relevant workspace or explicit status, shows owner, deadline, completed/all tasks, next milestone and blocker context. Keep filtered result set identical across views. Creating a project belongs in permitted selected workspace and saves one canonical record.

**Acceptance:** At 1440×900 the approved compact density can be measured and a created project appears in all its linked views.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope


#### Project has three primary tabs: Overview, Work, Resources

ID: work_project_tabs · confirmed · P0

Direct user request favors minimal tabs combining related features. Overview summarizes goal/scope, owners, milestones, blockers, decisions and meaningful activity. Work contains tasks/list/board/timeline. Resources combines notes, folders, files, apps, and links. People, decisions, and activity can open contextual sections/inspectors.

**Acceptance:** A complete project journey needs only these three top-level tabs and preserves access to decisions, team, and history.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** org_vocabulary


#### Overview states project goal, boundary, accountable people, and next step

ID: work_overview · proposed · P0

Project fields: name, purpose, in-scope/out-of-scope, owning workspace, lead, PM where relevant, collaborators, start/target dates, status, next milestone. Supporting summary links to saved blockers, decisions, review/evidence, and resources instead of duplicating editable status fields.

**Acceptance:** A PM can open goal/scope, next milestone, unresolved blocker, and latest approval from Overview without searching separate tabs.

**Owner:** Project lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_project_tabs


#### Task stores responsibility, status, date semantics, and related work

ID: work_task_fields · proposed · P0

Required title and owning context; accountable assignee or explicit unassigned queue. Optional description, priority, date-only due date or real timed due datetime, linked project/milestone/resource, contributor list, evidence, created/updated/completed actor/time. Unknown historical times remain null.

**Acceptance:** Create an undated task and a date-only task; both persist with stable links and no invented completion or meeting hour.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S01/S02/S04/S14.


#### Task moves through explicit work states with recorded transitions

ID: work_task_lifecycle · proposed · P0

Proposed not started → in progress → in review → completed; blocked is a related blocker flag, with cancelled/archived terminal alternatives. Review can return to in progress with reason. Completion records real timestamp and actor; reopen clears current completion fields while retaining audit event.

**Acceptance:** Complete, reopen, and review-return actions reconcile current task state, activity history, and progress without duplicating the task.

**Owner:** Division / project leads

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G2:G8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_fields


#### Project status is an explicit planning/delivery decision

ID: work_project_lifecycle · proposed · P0

Proposed draft → planned → active → in review → completed → archived; on hold/cancelled require reason. Task completion percentage is separate from project status. Closing requires designated lead and unresolved P0 blockers/review items either resolved or explicitly waived with approval.

**Acceptance:** An empty project never becomes completed automatically; unresolved required review prevents silent close.

**Owner:** Project lead / PM

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_overview,access_project_roles


#### List, board, and timeline manipulate the same tasks

ID: work_work_views · proposed · P0

Saved view preferences are personal; changing view cannot clone tasks or move ownership. Board dragging validates permission/status and has keyboard action alternative. Timeline edits display date changes and dependency impact before commit; date-only tasks stay date-only.

**Acceptance:** Changing a task in board updates list and timeline under the same ID and reload preserves the change.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_task_lifecycle


#### Milestone links acceptance evidence and task dependencies

ID: work_milestones · proposed · P0

A milestone has title, owner, target date, proposed/active/review/achieved/cancelled state, linked required tasks, reviewer, evidence and recorded achievement date. Completion is based on recorded decision/checklist, not inferred from calendar passing. Overdue remains a date condition.

**Acceptance:** Passing target date marks overdue without achievement; achieving records evidence/actor/time and updates Overview.

**Owner:** Project lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_overview


#### Dependencies show who is waiting on which saved work

ID: work_dependencies · proposed · P0

Directed dependency identifies predecessor/successor task or milestone, responsible unit, needed-by date, reason, and state. Reject self-link and cycles. Cross-project relationships require access-safe wording; hidden predecessor detail uses neutral restricted context. A blocker and dependency remain different objects.

**Acceptance:** A cycle is rejected; an approved date change lists affected downstream tasks rather than inventing new dates.

**Owner:** PM / division leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S06/S14.

**Dependencies:** work_milestones,access_project_collab


#### Blocker has owner, severity, next action, and resolution

ID: work_blockers · proposed · P0

Fields: affected task/milestone/project, description, opened time/actor, responsible owner, low/medium/high severity, needed action, optional due date, open/escalated/resolved/withdrawn state, resolution note and actor/time. Do not replace this with fictional risk or organization-health score.

**Acceptance:** A blocker remains visible beside affected work until resolved/withdrawn and resolving records the outcome.

**Owner:** PM / division leads

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S06; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_dependencies


#### Decision captures proposal, authority, result, and linked scope

ID: work_decisions · proposed · P0

Proposed decision draft → awaiting decision → approved/rejected/superseded. Store decision question, alternatives/rationale, accountable approver, date, resulting change, linked project/resource/meeting, and superseded-by reference. A comment saying approved cannot substitute for the actual approval record.

**Acceptance:** An approved scope change links its approver and the resulting project version; prior decision remains readable.

**Owner:** Project / division lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** access_action_matrix


#### Schedule distinguishes timed meetings and all-day deadlines

ID: work_schedule · proposed · P0

Combined agenda/calendar reads tasks, milestones, follow-ups, publishing dates and meetings. Date-only items belong in all-day rows. Actual meetings include timezone, start, end/duration, participants and location/link. Filters are scoped by workspace/project/person and remain consistent with source records.

**Acceptance:** No task deadline is fabricated as an hourly appointment; opening an agenda item navigates to its canonical record.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S09/S13.

**Dependencies:** work_task_fields


#### Meeting composer supports participants and recorded conflicts

ID: work_meeting_composer · proposed · P0

Proposed compact composer expands in place with title, start/end, timezone, participants, agenda, project/workspace and meeting URL/location. Availability checks only known DWDG meetings for permitted participants. Clearly label unknown external availability; do not claim Google Calendar conflict detection.

**Acceptance:** Changing date/time shows actual known conflicts inline; missing external calendars are labeled unknown.

**Owner:** Product / PM

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_schedule


#### Meeting minutes create linked decisions and follow-up tasks

ID: work_meeting_outcomes · proposed · P0

Meeting lifecycle planned → held/cancelled, with actual held time where known. Agenda and minutes remain resources linked to meeting. Create follow-up from selected note with owner/date and backlink; create a decision record with approver. Preserve source note rather than duplicating the whole meeting as task text.

**Acceptance:** A held meeting produces one linked follow-up task and one linked decision, both visible in the project.

**Owner:** Meeting owner

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S10; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_decisions,work_schedule


#### Updates is an actionable, scoped inbox

ID: work_updates · proposed · P0

Persist per-user read/unread state for assignment, review request, due reminder, relevant decision, and important project changes. Each item points to its source event/record. Avoid generating a notification for every cosmetic edit or duplicating reminders on every reload. Group repeated changes to one source where appropriate.

**Acceptance:** Read state survives reload and a source update opens the permitted record rather than an inert message.

**Owner:** Product

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S08; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** access_surface_scope


#### Reminder rules identify recipient, timing, channel, and deduplication

ID: work_reminders · proposed · P0

Proposed launch within the Rp35,000/month target and Rp50,000/month hard ceiling uses in-app owned-task/follow-up/review reminders and catch-up on return. Persist occurrence/source keys and read/deduplication state. Do not promise delivery while app is closed. Email digest, push or bot channels require separately chosen provider/cost setup and remain later options.

**Acceptance:** In-app due items appear once per intended occurrence and no app-closed delivery is claimed.

**Owner:** Product / operations

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6.

**Dependencies:** work_updates


#### Global search finds permitted work and resource metadata

ID: work_search · proposed · P0

Search titles, descriptions/notes where authorized, project names, owner/member names, resource metadata, decisions and domain records. Results show type, context and last update; selecting opens correct inspector/page. Do not index password values, private recruitment review, or inaccessible attachments.

**Acceptance:** A permitted resource/task is findable from the shared search; restricted metadata and secrets are absent.

**Owner:** Product / engineering

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G9/J9; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_surface_scope,resource_secret_links


#### Organization overview shows ownership and cross-division matrix

ID: work_organization · proposed · P0

President/Admin see current active units, scoped projects, accountable lead, next milestone and blockers. VP sees assigned portfolio. Member organization page, if exposed, contains only authorized scope. The master matrix requested by Consulting is a derived view, not another spreadsheet to maintain.

**Acceptance:** A project edit updates both division view and master matrix without a second input form.

**Owner:** Leadership / Consulting

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J2; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** work_overview,access_vp_scope


#### Settings groups personal preferences and permitted administration

ID: work_settings · proposed · P0

Personal language/theme/motion/transparency/reminder preferences are distinct from organization configuration. Admin operations show consequences, current environment and authority. Resource/account connections use metadata and approved destinations. Do not bury sign-out/account or data export behind ambiguous workspace labels.

**Acceptance:** A member can change language/theme without organization-write rights; Admin-only settings remain guarded.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_action_matrix


#### All forms validate, retain drafts, and tell the truth about saving

ID: work_forms · proposed · P0

Required/invalid fields are explained inline and accessible. Disable duplicate submission during save; successful feedback appears only after confirmed persistence. Connection/conflict/quota errors retain user inputs and offer retry/review. Context switches retain safe drafts or explicitly ask to discard changes.

**Acceptance:** Forced save failure leaves entered values intact and never shows a success toast.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_fields


#### Undo restores exact record identity and relationships

ID: work_undo_archive · proposed · P0

After confirmed save, archive/remove/complete offers recoverable Undo window where policy permits. Restore same ID/prior completion fields/links/location only after rechecking current permission and expected record version. If someone edited or approved afterward, Undo must show conflict and avoid overwriting their work; sensitive approval reversal uses explicit authorized operation. Longer recovery uses authorized archive/trash and linked-record preview.

**Acceptance:** Rapid complete/Undo restores prior links and timestamps; stale Undo after another member update is blocked or reviewed without silently overwriting newer work.

**Owner:** Engineering / product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_task_lifecycle


#### Cross-page links stay canonical and tolerate missing records

ID: work_link_integrity · proposed · P0

Stable IDs connect project/task/resource/meeting/decision/partner/request. Show neutral missing/archived/restricted state if target cannot open. Deleting a file link cannot delete its external file; closing a project cannot orphan unresolved finance/legal handoff unnoticed.

**Acceptance:** An archived linked record has a recoverable reference; an inaccessible record leaks no title.

**Owner:** Engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S14/S15.

**Dependencies:** access_denied


#### Resolve shared-edit conflicts before overwriting work

ID: work_concurrent_updates · proposed · P0

Proposed server version or updated-at precondition on mutable records; stale edit offers compare/reload/copy draft rather than blind last-save wins. Repeated request IDs prevent duplicate tasks, expenses, numbers, or approvals. Notes collaboration can begin with explicit single-editor save semantics.

**Acceptance:** Two users saving different versions cannot silently erase the first user's update.

**Owner:** Engineering

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F2/J8.

**Dependencies:** work_forms


#### Activity describes real changes and separates history from current state

ID: work_activity · proposed · P0

Write append-only events for meaningful create/edit/delete/assignment/status/date/resource/approval/decision operations after successful commit, with trusted actor/time and permission-safe fields. Workspace Changes is selected workspace only, including Admin/President, never a silent organization-wide feed. Portfolio progress summaries are derived operational views, not combined Changes. Historical completion events differ from current completed-task count. Ordinary users cannot edit events; do not claim forensic immutability. PRD editor actions log planning changes only.

**Acceptance:** Reopen task updates current progress and retains prior event; switching workspace Changes reveals only that workspace and permitted record fields, even to leadership; planning edits never appear as production events.

**Owner:** Engineering / product

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_lifecycle,access_audit


#### Reusable project and meeting templates are optional starters

ID: work_templates · proposed · P1

Proposed templates carry fields/checklist suggestions without real people, dates, approvals or fabricated completed history. Applying template creates fresh IDs and asks for owner/context. A team can begin empty; illustrative records are clearly separate and never seeded over saved data.

**Acceptance:** Applying a template creates uncompleted records requiring assignment and does not alter existing work.

**Owner:** Division leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** work_task_fields


#### Availability is evidence-based scheduling assistance

ID: work_availability · proposed · P0

Prior brainstorm suggests assignments/effort/dates/meetings/declared availability/absence. Proposed minimum shows declared windows and recorded meeting conflicts. Task counts indicate workload but cannot prove busy/available. Missing external calendar/effort remains Unknown.

**Acceptance:** Picker displays evidence/basis and uses Unknown when no reliable declaration exists.

**Owner:** Product / HR / PM

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.


##### Member declares date/time windows with effective range

ID: availability_declared · proposed · P0

Optional recurring or one-off availability stores person, local window/timezone, effective dates and declaration timestamp. Students do not have assumed full-time work hours; availability is self-reported and expires. Login activity is not presence.

**Acceptance:** A one-off window appears as declared availability with source date in meeting composer.

**Owner:** Member / HR

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** org_timezone_calendar


##### Absence window hides private reason from work coordinators

ID: availability_absence · proposed · P1

Proposed requested/approved/declined/cancelled state with person/dates/reviewer; whether approval is needed is HR policy. Coordinators see unavailable interval, not medical/personal explanation. Absence doesn't reassign tasks automatically.

**Acceptance:** Picker shows unavailable window without exposing private reason.

**Owner:** Member / HR

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** hr_validation


##### Meeting conflict uses exact overlap and cancellation semantics

ID: availability_overlap · proposed · P0

Intervals overlap when each starts before the other ends; adjacent meetings do not. Cancelled excluded; tentative/accepted policy explicit. Timezone and cross-midnight considered. If meeting detail restricted, show neutral occupied interval only.

**Acceptance:** Back-to-back clear and midnight overlap conflict without forbidden title leakage.

**Owner:** Engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_schedule


##### Optional estimate supports planned capacity; no actual-hours claim

ID: availability_capacity · proposed · P1

Use explicit task estimate with labeled hours or points and optional planned allocation by date. Compare only to self-declared capacity using same unit. Missing estimate isn't zero; six tasks isn't automatic Busy. Budgeted v1 may show task counts/dates only.

**Acceptance:** Unestimated task yields unknown capacity and cannot generate definite availability badge.

**Owner:** PM / member

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** work_task_fields


##### Avatar opens person inspector with relevant workload evidence

ID: availability_person_inspector · proposed · P0

Show person/project role, permitted assigned tasks/projects, due work, known meetings and declared windows with last-updated basis. Historic contribution separate. Member cannot inspect unrelated private HR/candidate data through avatar.

**Acceptance:** Resource/avatar inspection shows only permitted assignments and labels unknown availability.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** access_surface_scope


##### Coordinator can review conflict before proceeding

ID: availability_override · proposed · P0

Show overlap or declared-unavailable warning before meeting save. Authorized person can continue with reason under agreed policy, notifying participant. Deadline assignment does not reserve time, and override doesn't alter member's original declaration.

**Acceptance:** Proceed-through-conflict records reason and continues showing actual overlap.

**Owner:** Meeting owner / PM

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** availability_overlap


##### Stale/absent availability never becomes guaranteed free time

ID: availability_stale · proposed · P0

Expire one-off windows; show stale recurring declaration after approved review period. No DWDG meeting conflict means only no recorded conflict. No external calendars or declarations means Unknown, even with zero tasks.

**Acceptance:** An empty meeting list displays no recorded conflict plus Unknown availability.

**Owner:** Product / HR

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** availability_declared


##### Scheduling events notify affected people with privacy limits

ID: availability_events · proposed · P1

Notify meeting invite/time change/cancel, attendance response and approved unavailable interval affecting planned meeting. Aggregate repeated edits. Don't broadcast every personal availability change or private absence reason to division.

**Acceptance:** Only affected recipients get one schedule change and no private reason.

**Owner:** Product / HR

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


##### Availability export labels self-reported and planned basis

ID: availability_export · proposed · P1

Agenda includes timezone/times/attendance and authorized declared-window basis, excluding private absence reasons. Workload export labels task counts and estimated effort separately from actual hours. External-calendar unknown data never becomes exported fact.

**Acceptance:** Export has timezone/source basis and no private reason or fabricated actual hours.

**Owner:** HR / PM

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** access_sensitive_export


#### Timeline supports 7D, 2W, 1M, 3M, 6M, 1Y

ID: timeline_ranges · proposed · P0

Prior brainstorm's ranges are proposed. Keep same task/milestone IDs, filter/selection/scroll and today marker. Labels/dependency lines simplify at long ranges with exact inspector. Reduced motion uses immediate controlled range updates; no empty-canvas flash.

**Acceptance:** Zoom changes preserve selected task/filters and all date values.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** work_work_views


#### Unscheduled and due-only work stays honest in Gantt

ID: timeline_unscheduled · proposed · P0

Undated tasks stay in Unscheduled list. Due-only task uses deadline marker; a span needs explicit start/end. Milestones use dated markers. Planned dates and real completion displayed distinctly, with no manufactured start/duration.

**Acceptance:** Due-only marker never shows invented duration and undated work is reachable.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_task_fields


#### Date drag validates without changing actual history

ID: timeline_date_validation · proposed · P0

Reject invalid/end-before-start spans or prohibited edits. Date-only due marker keeps date-only type; span changes planned dates only. Show old/new dates and exact form alternative. Failed save restores original geometry/values and keeps draft.

**Acceptance:** Invalid drag leaves dates unchanged; keyboard form performs same valid edit.

**Owner:** Engineering

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** work_forms


#### Start with finish-to-start prerequisite; advanced scheduler deferred

ID: timeline_dependency_semantics · proposed · P0

Proposed smallest dependency: successor needs predecessor completed/approved, optional explicit lag/date basis. No resource leveling/critical path/other types until validated. Dependency line always has saved source/target/reason/condition, not decorative relationship.

**Acceptance:** Inspector explains the exact prerequisite and advanced scheduling is not promised.

**Owner:** PM / product

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** work_dependencies


#### Cascade previews changes and requires authorized approval

ID: timeline_cascade · proposed · P1

Predecessor date edit produces suggested downstream date changes under explicit rules. Preview each old/new date/owner/target conflict. Locked/manual dates flag conflicts, never overwritten silently. PM/lead approves complete set or cancels; atomic save with reason and version prevents partial cascade.

**Acceptance:** Cancel preview leaves all dates unchanged; approval records exact affected records.

**Owner:** PM / lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** timeline_dependency_semantics


#### Approved client/legal/publication targets require separate change decision

ID: timeline_protected_dates · proposed · P0

Cascade beyond client target, contract commitment, publishing plan or adopted legal lead time shows conflict and required approver. Dependency edit does not constitute scope/client approval or external notification. Protected deadline cannot silently shift to resolve chart.

**Acceptance:** Moving predecessor beyond agreed target yields decision-required state without auto-moving commitment.

**Owner:** PM / PL / approver

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J8; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** timeline_cascade,consulting_scope


#### Deleted/restricted prerequisite remains unresolved until reviewed

ID: timeline_missing_prerequisite · proposed · P0

Reject graph cycles. Archived/missing prerequisite can't become automatically satisfied; show needed owner/action. Restricted predecessor exposes only allowed condition/status. Resolve/replace reference by authorized actor, preserving old relationship history.

**Acceptance:** Archive prerequisite leaves successor dependency unresolved and no unauthorized details leak.

**Owner:** PM / engineering

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** work_dependencies


#### Milestone view summarizes actual gates for leadership

ID: timeline_milestone_rollup · proposed · P0

Rail displays owner/target/state, required-task/review counts and approved evidence links. Review-return changes summary; no duplicated manual milestone percent. Leadership can inspect unresolved requirements rather than only colored success circles.

**Acceptance:** Milestone rail and Overview agree after required item returns to revision.

**Owner:** PL / PM / leadership

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8.

**Dependencies:** work_milestones


#### Gantt drag has keyboard/date-form/touch alternatives

ID: timeline_accessible · proposed · P0

Exact date/dependency form offers same action as drag, with semantic dates/prerequisite/state summary. Touch target and horizontal scroll don't trap vertical page motion. Keep focus and range/scroll on return; non-drag interaction works under reduced motion.

**Acceptance:** Keyboard/touch users make equivalent edit with validation and return focus.

**Owner:** Product / QA

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** timeline_ranges


#### Optional one-level subtasks reuse canonical tasks

ID: work_subtasks · proposed · P1

P1 proposal from critique universal work-model brainstorming. Default v1 can remain flat; if adopted, task gains nullable parent_task_id and supports one level only. Child is a canonical task with its own stable ID, assignee, dates, status, evidence and version, visible in Work/My tasks/Timeline/Resources. Parent/child must share project and workspace; access follows existing scope, not automatic grants. Parent containment describes breakdown, while Dependency is separate prerequisite. Reject self-parent, cycles, child-of-child and unavailable parent. All active noncancelled children must complete before parent can be explicitly completed/reviewed by its authorized owner; completing last child only signals ready for parent review and never invents parent approval/completion date. Project task progress counts eligible leaf tasks only, excluding parents with active children to avoid double-counting; parent checklist and delivery readiness remain separate labeled facts. Cancel/archive/delete previews effects on child links, blockers and progress; parent deletion cannot silently remove children. Restore preserves IDs and parent links when still permitted. Reparent is an authorized same-project operation with old/new parent review, version checks and no ownership reset; cross-project move is separate reviewed scope transfer. Bulk transitions cannot bypass child/reviewer rules.

**Acceptance:** With feature disabled, flat tasks/counts remain unchanged. With feature enabled, create parent and two children; they retain one canonical ID each across views, parent completion blocks while a child is open, leaf progress counts each eligible child once, forbidden/cyclic reparent fails, and parent archive/restore preserves child relationships without expanding access.

**Owner:** Product / PM / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md, universal project model lists Tasks and Subtasks as brainstorming; detailed semantics proposed, not adopted v1 scope.

**Dependencies:** work_task_fields,work_task_lifecycle,work_dependencies,analytics_progress,access_surface_scope,work_undo_archive


### Six divisions with distinct tools and shared records

ID: divisions · proposed · P0

Current six workspaces remain active, each with a fitted working composition. Specialized domain records link shared tasks/resources/schedule/decisions rather than running six disconnected task managers. HR and Strategy processes remain proposed pending direct validation.

**Acceptance:** Every current division has a launch-minimum workflow and evidence status; shared changes reflect across views.

**Owner:** Division leads / product

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


#### Strategy & Growth: initiatives, research, and dependencies

ID: division_strategy · proposed · P0

No Strategy respondent is represented in the eight-response survey. Retain existing proposed initiative/research/dependency direction as a hypothesis. Initial working layout is Now/Next/Later initiatives, shared milestones and decision trail, subject to S&G lead validation.

**Acceptance:** S&G lead can assess the proposed journey and identify required fields before launch.

**Owner:** Strategy & Growth lead

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.

**Dependencies:** org_current_six


##### Initiative records goal, evidence, horizon, and responsible owner

ID: strategy_initiative · proposed · P0

Fields: title, strategic objective, problem statement, owning workspace/owner, Now/Next/Later horizon, hypothesis, research/evidence links, decision status, linked project and review date. Horizon reflects explicit planning choice, not a predicted impact score.

**Acceptance:** Changing horizon updates initiative view without changing its project/task identity.

**Owner:** S&G lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** work_decisions


##### Research note stores source, date, finding, and implication

ID: strategy_research · proposed · P0

Use shared resource notes with source URL/file, observed date, method or context, finding, uncertainty and proposed decision. Keep factual observation separate from team recommendation. Attach to initiative/project instead of maintaining another research database in v1.

**Acceptance:** A research finding links its evidence and the decision it informs; an unknown source/date remains visibly missing.

**Owner:** S&G researchers

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** resource_notes


##### Strategy review turns initiatives into an explicit decision

ID: strategy_reviews · proposed · P0

Proposed idea → research → decision pending → approved for delivery / hold / rejected. Approved initiative links a project, accountable owner and milestone; rejection/hold includes reason and review date. Approval does not fabricate a project start timestamp.

**Acceptance:** Approving an initiative creates or links one delivery project and leaves evidence/rationale traceable.

**Owner:** S&G lead / authorized leadership

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** strategy_initiative,work_decisions


##### Cross-division strategy plan exposes obligations

ID: strategy_dependencies · proposed · P0

Record dependency on another workspace's actual task/milestone, owner, needed-by date and requested action. Use accessible dependency list/chain as primary fallback; no default impact×certainty matrix without a validated process. Leadership drilldown follows access scope.

**Acceptance:** Selecting a dependency opens its authorized canonical record and an invalid circular dependency is rejected.

**Owner:** S&G / PM

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** work_dependencies


##### Confirm S&G cadence, reporting outputs, and decision authority

ID: strategy_validation · open · P0

Open inputs: real recurring programs, annual/quarterly planning cadence, research categories, required output, approvers and how Now/Next/Later is used. Do not present assistant-generated initiative examples as real organization records.

**Acceptance:** A direct S&G walkthrough either approves these fields or edits them before implementation scope freezes.

**Owner:** S&G lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


##### Metric needs unit, source, owner and actual observation

ID: strategy_metric_definition · proposed · P1

Proposed registry: name/definition/goal/unit/source link/period/owner and actual supplied value. Targets human-entered; missing source/value unavailable. Budgeted v1 can link maintained Sheet instead of native KPI engine. No general performance score inferred from task counts.

**Acceptance:** Unsourced metric never renders successful trend or score.

**Owner:** S&G lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** strategy_validation


##### Experiment closes with evidence or inconclusive outcome

ID: strategy_experiment · proposed · P1

Optional hypothesis/intervention/measurement plan/owner/review date/project/resources/result/decision. Completion of tasks is not proof of causal improvement. Rejected/inconclusive result stays usable finding; special experimentation engine not needed at launch.

**Acceptance:** Close requires evidence/result or explicit inconclusive state.

**Owner:** S&G lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** strategy_research


##### Strategy decision queue and export preserve planning evidence

ID: strategy_events_export · proposed · P1

Notify reviewer of decision request and owner of review/dependency due. Export scoped initiative goal/horizon/owner/review date/decision/source/date/project links. No impact ranking without adopted metric; historical batch report preserves then-current state.

**Acceptance:** Decision request appears once and exported horizon/source match saved records.

**Owner:** S&G lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** work_updates,analytics_reports


##### S&G concrete validation: observe → decide → deliver

ID: strategy_acceptance · proposed · P0

Research note/evidence → initiative horizon/owner → decision → linked project → real cross-team prerequisite → review → scoped export. Use lead-provided real example later; sandbox sample fictitious. Record approved field/authority choices.

**Acceptance:** Lead completes scenario and explicitly validates or edits workflow hypotheses.

**Owner:** S&G lead / QA

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** strategy_validation


#### Human Resource: recruitment, onboarding, people, and development

ID: division_hr · proposed · P0

HR has no respondent in the eight-response sample. Initial proposal emphasizes people rather than a generic project dashboard, with recruitment queue, onboarding checklists and membership/batch continuity. Sensitive applicant/review data requires tighter access.

**Acceptance:** HR lead validates the proposed minimum journey; applicant detail is not exposed through ordinary member search.

**Owner:** HR lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


##### People directory separates identity from batch membership

ID: hr_person · proposed · P0

Person profile stores display name, avatar, contact fields needed for DWDG, active account reference and authorized skill/role metadata. Batch membership stores team, role, joined/left state and dates. Do not call student members employees or add payroll fields.

**Acceptance:** One person can move teams next batch without duplicate profile or rewritten historic authorship.

**Owner:** HR / Admin

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** org_batch_model


##### Recruitment application has candidate, stage, owner, and evidence

ID: hr_recruitment · proposed · P1

Proposed application fields: cycle/batch, candidate contact, preferred teams, source, responsible reviewer, stage and linked application resource. Proposed new → screening → interview → decision → accepted/rejected/withdrawn. Exact stages and scoring policy remain open; no inferred ranking.

**Acceptance:** A recruiter can move one candidate with actor/time and restrict private review fields.

**Owner:** HR lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_sensitive_data


##### Onboarding checklist creates real assigned work

ID: hr_onboarding · proposed · P0

Accepted member receives workspace membership and checklist for orientation, required documents, policy acknowledgment, account access and first assigned work. Checklist items have owner/due/evidence; status uses saved completion fields. A percent cannot imply acceptance of missing documents.

**Acceptance:** An onboarded member receives only correct workspace access and checklist progress matches saved items.

**Owner:** HR / team lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_invitation


##### Roster change transfers outstanding ownership

ID: hr_roster_change · proposed · P0

Membership active → leave/inactive/alumni with date and reason under approved privacy policy. Before removing access, show assigned tasks/resources/approvals/follow-ups. Transfer or leave explicit unresolved queue; suspension does not delete contributions or earlier audit identity.

**Acceptance:** Leaving member loses current access while tasks and resource ownership have a visible successor or unresolved state.

**Owner:** HR / Admin

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_revocation


##### Development plans use shared training work without performance scores

ID: hr_development · proposed · P1

Proposed development record contains member, agreed goal, mentor/owner, linked training project/session, resources and follow-up date. Record participation/evidence only when supplied. Avoid employee performance grades, inferred productivity or automatic promotions.

**Acceptance:** A development plan can link a session and evidence without inventing a score or duplicating the training project.

**Owner:** HR / future Training lead

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_meeting_outcomes


##### Confirm HR privacy, recruitment, and member-offboarding policy

ID: hr_validation · open · P0

Open inputs: candidate fields, consent/contact retention, reviewer access, real stages, orientation checklist, leave/alumni behavior and approving roles. Gather direct HR feedback rather than extrapolating from Consulting/Legal survey responses.

**Acceptance:** HR signs off required fields/access and identifies what candidate data should never enter v1.

**Owner:** HR lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


##### Attendance is declared per-event; unknown is preserved

ID: hr_attendance · proposed · P1

Optional invited/attended/excused/absent/unknown with marked-by/time and correction reason. Browser login is not attendance. Corrections retain event attribution. Attendance isn't payroll/productivity or automatic performance evaluation; HR policy controls use.

**Acceptance:** Missing entry shows Unknown; correction preserves prior event and actor.

**Owner:** HR / meeting owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** hr_validation


##### Sensitive feedback/1:1 system requires policy before release

ID: hr_private_feedback · deferred · P2

Private participant/date/agreed-actions notes separate from public membership. Neutral follow-up task may link restricted source without exposing reason. Dedicated performance/feedback data stays deferred until purpose, access and retention approved; no employee-style ratings invented.

**Acceptance:** Launch directory contains no unapproved private feedback/rating fields.

**Owner:** HR lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** access_sensitive_data


##### Candidate duplicate, withdrawal and acceptance do not mutate access silently

ID: hr_candidate_edgecases · proposed · P1

Duplicate contact/cycle warning needs review; same name isn't duplicate proof. Withdrawal cancels active evaluation/reminders per retention policy. Acceptance links invitation, never auto-activates account without membership approval. Private reviewer opinions remain restricted.

**Acceptance:** Withdrawing candidate stops active interview reminder; accepting candidate creates no unintended broad access.

**Owner:** HR reviewer

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** hr_recruitment,access_invitation


##### HR notifications route by reviewer/onboarding/assigned-member responsibility

ID: hr_events · proposed · P1

Application assignment/interview change/decision request/onboarding due/access assignment/handover items go to eligible recipients. Private candidate decisions and absence reasons excluded from general division feed. User access updates don't reveal other teams' rosters.

**Acceptance:** Candidate notification never exposes reviewer note to ordinary member.

**Owner:** HR / product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


##### Roster and onboarding export separate from restricted candidate records

ID: hr_exports · proposed · P0

Roster includes approved operational fields/batch membership; onboarding includes checklist state/owner/missing evidence. Candidate/private review export is restricted audited operation. Don't collect/export identity/health fields without genuine need; fields chosen before launch.

**Acceptance:** Ordinary roster export contains no candidate/private review/absence reason.

**Owner:** HR / Admin

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** access_sensitive_export


##### HR scenario covers invite, onboarding, transfer and departure

ID: hr_acceptance · proposed · P0

Invite → verified accept → correct own workspace → checklist/follow-up → next-batch team move → offboard/revoke → assign successor → preserve contribution. Sandbox identity is fake. One person record persists across transitions and all open ownership is resolved or visible.

**Acceptance:** No duplicated member/orphan task and departed account loses access immediately.

**Owner:** HR / Admin / QA

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** hr_roster_change,org_handover


#### External Engagement: client and partnership relationship work

ID: division_external · proposed · P0

Survey Client Engagement has one response and maps here. Need clear PIC, partnership timeline, mobile follow-up and reminders. A relationship record links work/legal/resources; v1 does not automatically send messages or become an unrestricted CRM.

**Acceptance:** Create relationship → assign PIC → log interaction → schedule follow-up → link project works without duplicate entry.

**Owner:** External Engagement lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D6:J6; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


##### Relationship has organization, kind, owner, and contact

ID: external_relationship · proposed · P0

Fields: partner/client organization, relationship kind, accountable owner, authorized contact details, stage, source, next follow-up, linked project/resources and notes. Client/Partnership are proposed categories or future teams, not newly active current divisions. Mark contact source and avoid invented records.

**Acceptance:** One relationship can link multiple projects while keeping one accountable PIC and dated next action.

**Owner:** External Engagement PIC

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E6/F6; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


##### Stages are explicit configurable relationship state

ID: external_stages · proposed · P0

Proposed prospect → contacted → discussion → agreement in review → active → paused/closed. Lost/declined needs reason. Legal agreement state is linked evidence, never inferred solely from CRM stage. Actual vocabulary should be confirmed by External lead before freezing.

**Acceptance:** Selecting a stage count filters exactly the saved relationship records in that stage.

**Owner:** External Engagement lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F6.

**Dependencies:** external_relationship


##### Follow-up is a canonical task linked to relationship

ID: external_followup · proposed · P0

Store owner, due date or real meeting time, requested outcome, communication channel and state. Completing records outcome and offers next follow-up; creating next task is an explicit action. Overdue follows deadline and cannot disappear when relationship stage changes.

**Acceptance:** A mobile PIC sees the same follow-up in relationship detail, My tasks and Schedule.

**Owner:** Relationship PIC

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_fields,work_reminders


##### Interaction log records what happened and what is next

ID: external_interaction · proposed · P0

Fields: occurred date/time if known, channel, participants, concise summary, evidence resource, and follow-up task. Historical unknown time stays date-only. An internal log entry cannot claim email/WhatsApp delivery; external communication is performed in the external tool.

**Acceptance:** Logging a call creates one dated interaction and optional follow-up with clear external-delivery status.

**Owner:** Relationship PIC

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6.

**Dependencies:** external_followup


##### Client handoff connects Consulting, Legal, and Finance

ID: external_handoff · proposed · P0

Create project from approved opportunity by linking existing relationship/contact, scope brief and decision. Legal request links same parties; Finance receives approved handoff references. Cross-division participants need explicit project grants; copying contacts/resources into multiple silos is avoided.

**Acceptance:** A client project can trace origin, agreement request and delivery owner through existing IDs.

**Owner:** External lead / Consulting / Legal

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5/J8.

**Dependencies:** access_project_collab,work_decisions


##### Contact data and stale relationship handling are controlled

ID: external_directory_privacy · proposed · P1

Limit contact fields to operational need; disclose to approved project/team only. Archive duplicate/stale contacts with links preserved. Merging duplicate organization names requires review of projects/follow-ups; a matching name cannot trigger automatic merge.

**Acceptance:** Duplicate merge preview exposes affected links and an archived contact's history remains traceable.

**Owner:** External lead

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.

**Dependencies:** access_sensitive_data


##### Confirm relationship stages, follow-up rhythm, and external channels

ID: external_validation · open · P0

One response supplies direction, not complete SOP. Open inputs: stage definitions, current contact owners, follow-up thresholds, confidentiality categories, and whether v1 email digest is enough. Telegram/WhatsApp bots remain deferred unless funded and deliberately selected.

**Acceptance:** Lead approves the stage/owner fields and accepts the launch reminder-channel policy.

**Owner:** External Engagement lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D6:J6.

**Dependencies:** external_stages


##### Opportunity is optional actual brief and next decision

ID: external_opportunity · proposed · P1

Child of relationship with requested problem/service/owner/stage/timeline/proposal/decision/next action. Amount/probability optional supplied estimates with basis. No weighted revenue pipeline in budgeted first version; convert to linked project without copying contacts.

**Acceptance:** Opportunity becomes one project while preserving same relationship/contact IDs.

**Owner:** External / Consulting

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** external_handoff


##### No-response follow-up preserves attempt and next action

ID: external_no_response · proposed · P0

Outcomes attempted/no response/responded/rescheduled are explicit. Completion of contact task doesn't mean partnership succeeded. Postponed due date logs reason; next follow-up is explicit task. Closing relationship resolves or cancels remaining tasks visibly.

**Acceptance:** No-response can create next task while original attempt remains in history.

**Owner:** PIC

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** external_followup


##### Relationship merge reviews agreements and open follow-ups

ID: external_duplicate_merge · proposed · P1

Similar name may represent distinct client/partner engagements. Preview contacts/projects/follow-ups/agreements; keep alias/source/history and restrictions. A merge cannot broaden contract visibility or drop unresolved obligation.

**Acceptance:** Merge retains all open follow-ups and private agreement access.

**Owner:** External lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** external_directory_privacy


##### PIC reminders and relationship exports represent real obligations

ID: external_events_export · proposed · P0

Notify assignment/follow-up due/date change/proposal review/agreement-ready/handoff. Mobile in-app catch-up first; CRM stage never asserts WhatsApp delivery. Export organization/kind/stage/PIC/next action/date/project and authorized contact fields only.

**Acceptance:** Due item appears once, export dates match source and restricted contact omitted.

**Owner:** External / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** work_reminders,access_sensitive_export


##### External mobile journey connects outreach to approved delivery

ID: external_acceptance · proposed · P0

Relationship/contact → PIC → interaction → no response/follow-up → date change → proposal resource → legal request → Consulting project grant → stage/filter/export. Verify notes/URL-only resources and copied unauthorized link behavior.

**Acceptance:** Mobile sequence keeps shared IDs/dates consistent and no provider message sent is implied.

**Owner:** External / Consulting / QA

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6/J5/J8.

**Dependencies:** external_handoff


#### Marketing, Communication & IT: content cadence and IT requests

ID: division_marketing · proposed · P0

Two survey responses require accessible shared data, executor deadlines, attractive usable UI, notes and proof of progress/completion. Keep publishing and IT work distinct capabilities on shared task/resource infrastructure, without separate app themes.

**Acceptance:** Content review and IT request journeys both link shared work/resources while using relevant fields.

**Owner:** MarCom & IT lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D3:J3/D7:J7; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


##### Campaign groups goals, channels, content, owners, and resources

ID: marketing_campaign · proposed · P0

Fields: campaign name/purpose, accountable owner, date range, channels, audience note and linked project. Content items are children or linked records, not duplicated project tasks. Any target metric is user supplied with unit and source; v1 can operate without analytics targets.

**Acceptance:** A campaign can locate its assigned content and assets from one view and no fictional engagement chart appears.

**Owner:** MarCom lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.


##### Content item records executor, deadline, stage, and evidence

ID: marketing_content · proposed · P0

Fields: title, campaign/project, content type/channel, responsible executor, planned publish date/time, internal due date, reviewers, asset/resource links, review note and published evidence URL/date. Planned schedule is distinct from actual publication; task progress evidence can be partial.

**Acceptance:** Executor can add progress evidence and reviewer can open the same resource from the content record.

**Owner:** Content executor

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_fields,resource_revisions


##### Content moves through draft, review, revision, scheduled, and published

ID: marketing_lifecycle · proposed · P0

Proposed idea → drafting → review → revision requested → approved → scheduled → published; cancelled/archived branches. Reviewer and approval time recorded; publishing is recorded only with actual evidence or explicit authorized attestation. Scheduled date passing cannot automatically publish.

**Acceptance:** A scheduled item remains scheduled until publication evidence/attestation is recorded.

**Owner:** MarCom reviewer / executor

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** marketing_content


##### Content calendar reconciles planned and actual dates

ID: marketing_cadence · proposed · P0

Schedule shows planned publications plus internal due dates with different labels. Stage counts and cadence select saved records. Unknown publication metrics remain unavailable; no Instagram analytics or channel delivery is implied without integration.

**Acceptance:** Selecting a calendar day opens the planned items and distinguishes actual published evidence.

**Owner:** MarCom lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G3/J7.

**Dependencies:** work_schedule,marketing_lifecycle


##### Brand/asset library links approved versions and usage notes

ID: marketing_brand_assets · proposed · P0

Asset-link resources carry supplied current/approved version URL, asset kind, campaign/project, reviewer, usage notes and actual original source. Pin brand guideline/logo references when organization ownership exists. Provider link is not a stored immutable copy; owner supplies old-version evidence where review requires it.

**Acceptance:** A content item points to its reviewed asset version and prior revisions remain available to authorized reviewers.

**Owner:** MarCom asset owner

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7.

**Dependencies:** resource_revisions


##### IT request has requester, system, severity, owner, and outcome

ID: marketing_it_requests · proposed · P0

Proposed request types: website issue, account/access assistance, internal tool change. Fields: problem, expected behavior, evidence, affected system, owner, priority and linked task. Proposed new → triaged → working → waiting → resolved/closed with requester confirmation. No password plaintext field.

**Acceptance:** An IT requester can track status and outcome while account secrets remain outside ordinary records.

**Owner:** IT lead

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_secret_links


##### External accounts register responsibility and approved access path

ID: marketing_account_register · proposed · P0

Record service name, purpose, official organization owner/contact, access-request process, renewal/expiry and secure vault reference where approved. Do not store passwords, API keys or recovery codes in content notes, search or exports. Admin handover includes ownership verification.

**Acceptance:** Searching an account finds the operational contact/access process and never exposes secret values.

**Owner:** IT / Admin

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J9; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_secret_links


##### Confirm publication approval and IT operating policy

ID: marketing_validation · open · P0

Open inputs: channel list, review authority, content type/stage names, due/publish timezone, evidence requirements, account owner and IT triage urgency. Survey asks for proof of work but does not specify a full editorial SOP.

**Acceptance:** Lead approves reviewer rights and minimal fields for content and IT request types.

**Owner:** MarCom & IT lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D3:J3/D7:J7.


##### Internal executor due and external publication date are separate

ID: marketing_dates · proposed · P0

Draft/review due may precede scheduled publish. Date changes notify corresponding responsible people. Moving publish date doesn't rewrite completed task history or approve changed copy; actual publication time remains independent.

**Acceptance:** Publish shift leaves executor/review history intact and flags actual conflict.

**Owner:** MarCom lead

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** marketing_content


##### New content version needs review of changed output

ID: marketing_stale_approval · proposed · P0

After approval, changed asset/copy marks approval stale or returns to review under policy. Keep old approval bound to old version. Minor metadata exemption requires adopted rule; scheduled state alone cannot authorize revised content.

**Acceptance:** Approved item revised to new resource version becomes review-needed.

**Owner:** MarCom reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** marketing_lifecycle,resource_revisions


##### Multiple channels have individual publication evidence

ID: marketing_publication_records · proposed · P0

Destination URL/channel/actual time if known and manual attestation basis per publication. One channel published doesn't make all channels done. Broken/private provider link flagged; no automated engagement/availability claim. Submission note alone isn't evidence of external publish.

**Acceptance:** Item can be published on one channel while another remains pending.

**Owner:** Executor / reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** marketing_content


##### Content and IT actionable events go to assigned role

ID: marketing_events · proposed · P0

Executor assigned/due; reviewer requested/revision returned/approval; schedule changed. IT triage/info-needed/resolved-awaiting-confirmation. No automated publishing or account-secret content in notification. Group repeated changes to same item.

**Acceptance:** Reviewer and executor receive correct actions without unrelated member notifications.

**Owner:** MarCom & IT / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


##### Content and IT exports carry different operational fields

ID: marketing_exports · proposed · P0

Content: campaign/channel/type/executor/internal due/planned publish/actual publish/review/version/evidence URL. IT: system/request/owner/priority/state/opened/resolved. Exclude credentials and unsourced engagement metrics. Missing actual publication remains unavailable.

**Acceptance:** Export preserves planned vs actual dates and includes no recovery/secret values.

**Owner:** MarCom & IT lead

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.

**Dependencies:** analytics_reports


##### Content and IT validation uses complete minimum journeys

ID: marketing_acceptance · proposed · P0

Content: create/assign/link draft/review return/new version/approve/schedule/actual evidence/export. IT: issue/triage/task/info request/resolve/requester confirm. Verify mobile/reload/save-failure and one task/resource relation with no paid provider integration.

**Acceptance:** Both sequences complete and preserve canonical links plus external-action truth.

**Owner:** MarCom & IT / QA

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D3:J3/D7:J7; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** marketing_validation


#### Legal & Finance: legal requests, controlled handoffs, and money records

ID: division_legal_finance · proposed · P0

Two responses cover fragmented requests/register/templates and status visibility; one selected budget/expense tracking. Legal suggestions are highly specific but do not establish officially adopted numbering/SLA/signature rules. Track records and evidence; v1 does not execute legal signatures or payments.

**Acceptance:** A legal request and related budget/request can be traced without claiming e-sign or money transfer.

**Owner:** Legal & Finance lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D4:J5; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


##### Legal request replaces disconnected forms with structured intake

ID: legal_request · proposed · P0

Fields: requester/team/project, document type (NDA/PKS/BAST/SK/other), purpose, required-by date, signatory variables, counterpart, KAK/proposal resources, owner and confidentiality. Save incomplete draft; submission validates type-specific required fields. Requesters see authorized status without private reviewer notes.

**Acceptance:** Submit a PKS request with signatory/KAK information and link the same client project/party IDs.

**Owner:** Legal requester / reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E5/J5.

**Dependencies:** access_legal_policy


##### Legal pipeline preserves review and revision evidence

ID: legal_pipeline · proposed · P0

Proposed draft → submitted → triaged → drafting → in review → revision requested → approved for signature → awaiting signature → signed → registered/archived; cancelled/rejected branches. Record actor/time and revision reason. Counterpart review and internal approval are distinct outcomes.

**Acceptance:** A revision return links the reviewed version and required change; signed requires approved evidence/attestation.

**Owner:** Legal reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J5.

**Dependencies:** legal_request,resource_revisions


##### H-2/H-3 lead times are a respondent suggestion pending adoption

ID: legal_sla · open · P0

One respondent described H-2 ordinary letters and H-3 contracts/agreements. Confirm working/calendar days, cutoff time, urgent exception, holiday calendar and approving role before rules become mandatory. Proposed v1 warns about short notice; automatic rejection requires explicit adopted policy.

**Acceptance:** UI cannot label these as official SOP until approved; configured urgency exception records approver and reason.

**Owner:** Legal lead / President

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5.

**Dependencies:** legal_request


##### Official document numbering needs atomic issuance and approved format

ID: legal_numbering · open · P0

Proposed server-assigned number only at authorized approval/registration, using approved type/batch/year sequence. Format, numbering moment, void/reserve/reissue policy and authority are open. Never duplicate numbers under simultaneous requests; cancelled number stays in logbook with reason rather than reused silently.

**Acceptance:** Concurrent issuance yields unique immutable numbers and every voided number remains auditable.

**Owner:** Legal lead / engineering

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** legal_pipeline,access_legal_policy


##### Master templates have owner, version, and approved-use status

ID: legal_templates · proposed · P0

Register supplied external PKS Client, NDA, member contract, integrity pact and PD-PRT template references only when actual files and approving owner exist. Store current/retired state, version URL/evidence, owner and required variables. Draft links its used version; do not invent contract content, legal approval or existing shared repository.

**Acceptance:** A request draft identifies the exact template revision used, and retired versions remain traceable.

**Owner:** Legal lead

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** resource_revisions


##### Signature status records evidence and outstanding signatories

ID: legal_signature_status · proposed · P0

Store expected signatories, requested/signed/declined state per party, evidence resource and date/actor if known. Missing evidence stays missing. v1 opens approved external process or records a supplied signed copy; actual e-signatures and identity verification are deferred integrations.

**Acceptance:** Final record clearly distinguishes awaiting signature, supplied signed evidence, and unverified attestation.

**Owner:** Legal reviewer / authorized signatory

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J5.

**Dependencies:** access_legal_policy


##### PKS → BAST → invoice is a visible controlled handoff

ID: legal_bast_gate · proposed · P0

Survey asks signed PKS → verified BAST → invoice/payment-term trigger. Proposed v1 requires authorized linked evidence and checklist for each gate, with human approval and reason for exception. 'Ready for invoice' creates a Finance request/notification, never a payment or external invoice automatically.

**Acceptance:** Unsigned PKS or unverified BAST prevents normal ready-for-invoice state; approved exception is recorded visibly.

**Owner:** Legal / Finance / Consulting

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** legal_signature_status,finance_request,consulting_review


##### Budget allocation records approved amount and scope

ID: finance_budget · proposed · P0

Fields: project/workspace/batch, category, allocated IDR amount, approver/date, revision reason and source. Proposed no allocation remains unavailable, not zero-budget success. Allocation changes preserve history and cannot fabricate revenue/account balance.

**Acceptance:** Budget summary matches approved allocations and displays missing allocation explicitly.

**Owner:** Finance approver

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4/H4; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** access_finance_policy


##### Finance request records requested, approved, and paid amounts separately

ID: finance_request · proposed · P0

Fields: requester, purpose/project/category, IDR amount, payee/recipient metadata limited by policy, supporting resources, needed-by, approval state and payment evidence. Proposed draft → submitted → under review → approved/rejected → partially paid/paid → reconciled; cancelled branch with reason.

**Acceptance:** A partial payment leaves outstanding amount visible and requester cannot self-approve.

**Owner:** Finance requester / approver

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4.

**Dependencies:** access_finance_policy


##### Validate IDR amount, duplicate evidence, and payment recording

ID: finance_validation · proposed · P0

Use typed integer IDR amounts; reject invalid negative request/payment and payment exceeding approved amount unless explicit amendment. Detect possible duplicate receipt/request based on reference/date/amount without auto-deleting. Payment recorded by authorized role with date/evidence; edit creates audited correction.

**Acceptance:** Paid-to-date and outstanding reconcile from payment records, and duplicate warning does not destroy either record.

**Owner:** Finance / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** finance_request


##### Allocation, commitment, and payment comparison uses honest formulas

ID: finance_comparisons · proposed · P0

Show allocation, approved commitment, paid-to-date and outstanding. If approved total includes paid requests, do not stack committed+paid as separate spend. Define committed as approved total or outstanding commitment explicitly. Remaining allocation = allocation minus approved commitment under adopted policy.

**Acceptance:** Exact IDR tracks reconcile to the adjacent request list and no overlapping amounts are double-counted.

**Owner:** Finance lead / product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** finance_budget,finance_request


##### Evidence and finance exports are scoped and reviewable

ID: finance_receipts_export · proposed · P0

Finance export includes selected period/project/category/currency/request state/approved/paid/outstanding and evidence URLs or native-note references. Restrict payment/bank/private receipt metadata under field policy. V1 CSV does not include provider receipt file contents. Stored receipt byte bundles apply only if native uploads are later approved; export must state actual coverage.

**Acceptance:** Exported totals match the selected saved requests and restricted evidence is excluded for unauthorized users.

**Owner:** Finance lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S03/S05/S11; User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_surface_scope,finance_comparisons


##### Confirm finance operating rules before launch

ID: finance_sop · open · P0

Open: approval thresholds, category list, reimbursements vs client invoices, partial/advance payments, required receipts, budget revision authority, monthly close and exception process. V1 excludes accounting ledger, payroll, tax, bank connection and actual payment execution.

**Acceptance:** Launch scope has approved minimal request/payment rules and explicitly excludes unsupported accounting claims.

**Owner:** Finance lead / President

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md. User request, 3 Oct 2026; Critique App Development conversation user messages.


##### Requester receives next legal action without private reviewer material

ID: legal_requester_view · proposed · P0

Show owner/queue/required-by/missing info/revision need and expected response under adopted SLA. Requester can amend draft or respond to returned revision. Post-approved/signed amendment needs formal new version/reissue; approval fields are protected.

**Acceptance:** Requester supplies missing signatory/KAK but cannot change reviewer approval.

**Owner:** Legal / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E5:F5/J5.

**Dependencies:** legal_request


##### Urgent request is an approved exception with actual risk

ID: legal_urgent · proposed · P0

Short notice displays remaining lead time and requests urgency authority. Exception captures reason/approver/date; no impossible turnaround guarantee. Accept/reject urgency yields clear next action and doesn't silently bypass contract review.

**Acceptance:** Same-day request cannot claim normal SLA compliance without adopted exception.

**Owner:** Legal lead

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5.

**Dependencies:** legal_sla


##### Void/reissue preserves the number register

ID: legal_number_void · proposed · P0

Wrong type/year/party follows approved void/supersede/reissue policy; retain issued number/reason/new link. No reuse hidden by rollback. Legacy import checks duplicates/origin without renumbering silently. Server atomic issuance remains essential even at small scale.

**Acceptance:** Voided number stays in register and cannot be issued to a new document.

**Owner:** Legal issuer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** legal_numbering


##### Legal queue notifies requester, reviewer and handoff owner

ID: legal_events · proposed · P0

Submit/missing info/revision/review due/short lead/signature-ready/evidence-added/BAST request/finance-ready events. Sensitive signatory data omitted from general inbox. Version reference distinguishes revised request; no reminder result can infer signed status.

**Acceptance:** Correct eligible recipients receive stage action with relevant version only.

**Owner:** Legal / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J5; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


##### Register export traces issued/void numbers and versions

ID: legal_export · proposed · P0

Number/type/project/requester/owner/stage/required-by/approval actor/date/current version/signature/BAST status and authorized links. Void/superseded cases explicit. No e-sign execution claim. Reconcile register counts against issuance audit.

**Acceptance:** Scoped issued/void register reconciles and each number has exact document/version.

**Owner:** Legal lead

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** legal_numbering,access_sensitive_export


##### Legal scenario tests revision, unique number and unsigned gate failure

ID: legal_acceptance · proposed · P0

PKS structured intake → short-lead warning → revision → approved version → concurrent unique numbering → missing signature gate blocked → evidence → BAST review → finance-ready. Approved policy supplied first; sandbox documents fictitious.

**Acceptance:** Scenario shows deliberate unsigned gate failure and unique immutable issuance.

**Owner:** Legal / Finance / QA

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E5:J5.

**Dependencies:** legal_numbering,legal_bast_gate


##### Budget amendment surfaces commitments before approval

ID: finance_amend · proposed · P0

Preview old/new allocation/approved commitment/paid/outstanding/headroom. Reduction below commitment flags deficit and required exception; can't rewrite payments/categories to fit chart. Preserve revision reason and source/approver.

**Acceptance:** Lower allocation visibly creates deficit and leaves paid records unchanged.

**Owner:** Finance approver

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** finance_budget,finance_comparisons


##### Refund/correction is a reviewed recorded adjustment

ID: finance_adjustments · proposed · P1

Separate outgoing payment and recorded refund/correction with original link, amount/evidence/actor/date/reason. Never delete payment evidence to hide error. Net-paid basis explicitly adopted; full accounting deferred. First version can allow authorized simple corrections only.

**Acceptance:** Correction reconciles net-paid while preserving original payment event.

**Owner:** Finance lead

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** finance_validation


##### Client invoice tracking uses incoming-money basis

ID: finance_incoming_terms · proposed · P1

Optional invoice reference/due/term amount/receipt state after legal gate, separate from outgoing expense requests. Minimal link/status metadata first. Native invoice generation/tax/payment collection deferred. Expected client income is not budget expenditure.

**Acceptance:** Incoming invoice and outgoing expense summaries never combine directions.

**Owner:** Finance / Consulting

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** legal_bast_gate


##### Finance notifications distinguish approval from payment

ID: finance_events · proposed · P0

Requester gets rejection/evidence request; approver pending queue; recorder approved-payment-ready; term owner due. Approved remains unpaid until authorized payment record. Deliver source links with current scope and no sensitive bank info in general text.

**Acceptance:** Approved request remains visibly unpaid until actual authorized record.

**Owner:** Finance / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates,finance_request


##### Period review stores report basis and outstanding discrepancies

ID: finance_period_snapshot · proposed · P1

Monthly/batch comparison of approvals/recorded payments/evidence yields owner/action list. Reviewed snapshot records filters/source version/totals. Later correction creates new report/version rather than invisible historic overwrite. Native ledger close deferred.

**Acceptance:** Prior reviewed snapshot remains traceable after payment correction.

**Owner:** Finance lead

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** finance_receipts_export


##### Finance scenario tests self-approval and partial-payment arithmetic

ID: finance_acceptance · proposed · P0

Allocation → evidence-link request → reject self-approval → approve → partial paid/outstanding → final payment → export → correction/reload. Include invalid amount and failed save. No payment service needed; all paid states are authorized recorded facts.

**Acceptance:** Totals reconcile after each stage and direct forbidden approval rejected.

**Owner:** Finance / QA

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4/H4.

**Dependencies:** finance_sop


#### Consulting: connected project delivery with PL/PM and review

ID: division_consulting · confirmed · P0

Three respondents supplied the strongest project-delivery evidence. Need a coherent overview of tasks/PJ/dates/milestones/blockers/decisions/revisions across projects without re-entering data. PL owns content/direction; PM manages schedule/coordination/risks/client updates as requested.

**Acceptance:** Delivery changes appear in project and Consulting portfolio without a second update form.

**Owner:** Consulting lead / PL / PM

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D2:J2/D8:J9.


##### Assign PL, PM, team, client contact, and reviewer explicitly

ID: consulting_roles · proposed · P0

Project allows separate PL/PM plus contributors and authorized client-update owner. Each role points to person ID and batch/project assignment, not free-text name. Survey describes the distinction but detailed authority remains proposed and needs Consulting approval. A person may hold both with explicit assignment; neither grants external signature/payment powers.

**Acceptance:** A project with missing PL/PM exposes setup gap and cannot claim approved readiness.

**Owner:** Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** access_project_roles


##### Scope brief and scope change use reviewed versions

ID: consulting_scope · proposed · P0

Project goal, deliverables, exclusions, constraints and assumptions belong to Overview/brief resource. Proposed change draft → review → approved/rejected → applied; records requester, PL solution review, PM schedule impact, client/leadership decision if required, reason and linked version.

**Acceptance:** Applying approved scope updates the project version; rejected change leaves scope intact and decision traceable.

**Owner:** PL / PM / authorized approver

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8.

**Dependencies:** work_decisions,resource_revisions


##### Delivery lanes show saved stages, milestones, and blockers

ID: consulting_delivery_lanes · proposed · P0

Proposed planning → discovery → analysis → solution → internal review → client delivery → closed, pending Consulting lead approval. Milestone markers and review gates reference actual records; a decorative lane cannot imply completion. Portfolio supports owner/client/status/date filters.

**Acceptance:** Selecting a milestone/review marker opens its canonical record; unknown stage stays unset rather than guessed.

**Owner:** Consulting lead / PM

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8.

**Dependencies:** work_milestones


##### Pre-delivery readiness checklist records reviewer and approval

ID: consulting_review · proposed · P0

Checklist includes required deliverables, evidence/resources, PL content review, PM coordination/completeness, unresolved blockers and permitted legal gate. Required items incomplete prevent normal ready-to-deliver; waiver requires authority, reason and time. Readiness is counts/state, not a fictional quality score.

**Acceptance:** One incomplete required item blocks readiness; completed review stores actor/date/version of reviewed output.

**Owner:** PL / PM / designated reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** access_project_roles,resource_revisions


##### Review feedback becomes linked revision work

ID: consulting_revision · proposed · P0

Survey asks director/manager revision notes. Reviewer selects deliverable/resource version, records requested change and owner/date, then creates a linked task. Resolution links revised version and reviewer confirmation. Feedback thread, task and resource are linked views of work, not duplicated approval authority.

**Acceptance:** A requested revision appears in Work with its resource/version and closing it requires review confirmation where mandated.

**Owner:** Reviewer / PL / executor

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G2; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_tasks,consulting_review


##### PM records client update and next client action

ID: consulting_client_update · proposed · P0

Record actual communication date/channel, summary, approved deliverable version, client feedback, pending decision and next follow-up task. Sending remains in an external communication tool unless integrated deliberately. Do not claim external message delivery from saving this record.

**Acceptance:** A client feedback note links its project/deliverable and resulting follow-up without automatic email sending.

**Owner:** PM

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** external_interaction


##### Portfolio derives several projects from canonical work

ID: consulting_portfolio · proposed · P0

Show per-project purpose/PL/PM, explicit delivery state, next milestone, overdue work, blockers, pending decisions, review readiness and client follow-up. Filtered totals and master matrix use same records. No second manual portfolio progress percentage.

**Acceptance:** Editing a task, blocker or review immediately changes its Consulting portfolio row and scoped export.

**Owner:** Consulting lead / PM

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E8/F8/J8/J2.

**Dependencies:** work_organization


##### Close delivery with outcome, accepted resources, and handover

ID: consulting_close · proposed · P1

Proposed closing review captures delivered/accepted version, client acceptance when provided, unresolved/waived items, legal/finance handoff status and lessons-learned note. Project archive does not destroy resources, tasks or approval history. Billing readiness remains a separate recorded gate.

**Acceptance:** Closing can show delivery done while invoice handoff remains pending, with evidence and next owner clear.

**Owner:** PL / PM / Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5/J8.

**Dependencies:** legal_bast_gate


##### Confirm delivery stage vocabulary and review authority

ID: consulting_validation · open · P0

Open: actual phase names, who starts projects, scope-change authority, PL/PM overlap rules, required review checklist, client acceptance evidence and escalation threshold. Survey roles are direct needs but detailed stage/SOP defaults are proposals.

**Acceptance:** Consulting lead reviews one end-to-end project scenario and approves or edits each gate before launch.

**Owner:** Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D2:J2/D8:J9.


##### Start records scope, roles and actual decision

ID: consulting_start · proposed · P0

Minimum client project setup includes client/relationship if applicable, goal/scope, PL/PM, target milestone/team grant and approved start decision. Internal work can have simpler adopted rule. Creating project is not client authorization or manufactured kickoff.

**Acceptance:** Missing roles/start approval keep setup-needed state.

**Owner:** Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** consulting_roles,work_decisions


##### Deliverable has output criteria and exact reviewed version

ID: consulting_deliverable · proposed · P0

Title/project/owner/expected output/acceptance criteria/milestone/resource version/state/reviewer. Proposed submitted/review/revision/approved/delivered/accepted stages. Internal approval, task completion and client acceptance are distinct. Budgeted v1 stores supplied version URL/note evidence.

**Acceptance:** Internal approval and client acceptance identify exact version and source actor.

**Owner:** PL / reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** consulting_review,resource_revisions


##### Scope/output change invalidates affected readiness review

ID: consulting_stale_ready · proposed · P0

New required item, scope version or deliverable version marks relevant checklist approval stale. Preserve prior event bound to past version and re-review changed items. PM cannot hide open blocker by moving lane or claiming high percent.

**Acceptance:** Output revision after approval returns affected readiness to review-needed.

**Owner:** PL / PM / reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** consulting_scope,consulting_deliverable


##### Potential risk is distinct from active blocker

ID: consulting_risk · proposed · P1

Optional human-entered qualitative impact/probability, mitigation/owner/trigger/review date. Trigger links real blocker; no predictive score or automatic project-health rating. Minimum launch may use notes plus blocker records pending review of dedicated risk need.

**Acceptance:** Risk trigger creates linked blocker without automatically changing other tasks.

**Owner:** PM

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8.

**Dependencies:** work_blockers


##### Delivery updates route to PL, PM and reviewer

ID: consulting_events · proposed · P0

Assignments/due milestone/escalated blocker/scope decision/submitted deliverable/revision/stale approval/client follow-up/legal-ready events. PL sees content decision, PM sees schedule risk, reviewer sees version-specific gate. Portfolio summary exposes only permitted facts.

**Acceptance:** Role-specific inbox points to exact record/version with no second status input.

**Owner:** Consulting / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G2/J8.

**Dependencies:** work_updates


##### External summary is a separately reviewed sanitized report

ID: consulting_export · proposed · P0

Internal export includes scope/PL/PM/tasks/milestones/blockers/decisions/deliverables/review/version/evidence. Client-ready report excludes private internal notes/contact/finance fields under adopted policy. This is an approved export, not client portal or automatic external delivery.

**Acceptance:** Internal/client report field differences explicit and each source version correct.

**Owner:** PM / Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; Latest user production PRD request, 3 Oct 2026.

**Dependencies:** access_sensitive_export


##### Connected Consulting scenario verifies one source of truth

ID: consulting_acceptance · proposed · P0

Scope/client/PL/PM → tasks/milestone/dependency → resource task → blocker → scope request → output revision → incomplete checklist blocked → approved review → recorded client evidence → BAST/finance → portfolio/export. Save failure/reload included.

**Acceptance:** Every task/review/resource update appears in portfolio under same IDs without duplicate input.

**Owner:** Consulting / Legal / Finance / QA

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E8:J8/J5.

**Dependencies:** consulting_validation


##### Timesheets and billable utilization are deferred

ID: consulting_timesheets · deferred · P2

Prior brainstorm mentions timesheets; survey doesn't establish hour billing or member-time policy. Optional effort estimates support planning, not actual hours. Timesheet/charging needs purpose/access/review/finance definition. Never derive work hours from clicks or completion events.

**Acceptance:** Launch metrics never label task counts or events as billable actual hours.

**Owner:** Consulting / Finance

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.


#### Future Knowledge and Training begin with shared capabilities

ID: division_future_knowledge_training · deferred · P2

Discussed future teams can use projects, notes/resources, tasks and meetings first. Specialized knowledge taxonomy, training attendance/evaluation and course management require direct requirements. Do not invent a learning-management platform for v1.

**Acceptance:** Future units remain draft and have no unsupported specialized workflow in launch scope.

**Owner:** Future VP Consulting

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.


### Resources unifies folders, files, notes, apps, and links

ID: resources · confirmed · P0

Direct user requested minimal project tabs combining folders/apps/notebook and visible responsible-person avatar bubbles with contextual work inspector. Every resource is an actionable object linked to canonical tasks, not a new project workspace or duplicate task manager.

**Acceptance:** A user can browse a folder, open linked app/note, delegate responsibility and create related work from Resources.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.


#### Resource kinds preserve their different behavior

ID: resource_types · proposed · P0

Launch kinds: native internal folder, lightweight note, external file/folder URL, external app/document URL, meeting note and approved template reference. Uploaded binary file is a future kind disabled until upload policy is approved. Shared metadata: title, owning organization/workspace/project, creator or added-by, owner/contributors, timestamps, parent/access class, short notes and related-task links.

**Acceptance:** Launch inspector distinguishes native note/folder from provider URL, and does not offer native binary upload or stored-file action by default.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.


#### Explorer combines pinned items, folders/files, notes, and apps/links

ID: resource_explorer · proposed · P0

Within Resources use useful groups, breadcrumbs, compact rows or controlled grid alternative, type/search/filter and recent updates. Parent-folder navigation does not produce another top-level tab. A project can contain no resources and offers add/create/link actions within permission.

**Acceptance:** A user can reach nested folder items, notes and app links from one tab with visible back/breadcrumb path.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_project_tabs


#### Resource shows responsible-person avatar bubbles

ID: resource_bubbles · confirmed · P0

User directly requested avatar bubbles for people delegated to folder/file/link work. Show accountable owner and assigned contributors with accessible names, overflow count, and click/tap to inspector. An avatar means responsibility, not proof of provider access or creator identity.

**Acceptance:** Assign two contributors and their named avatars appear on the resource after reload; overflow still exposes all assignees.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_delegation


#### Right-click and accessible alternatives open contextual resource inspector

ID: resource_inspector · confirmed · P0

User requested delegation, add task, delete/edit, creator and notes in side panel. Provide right-click where supported plus row overflow/button, Enter/open and touch tap equivalent. Inspector keeps selected resource/list context; mobile uses full-screen detail with return path.

**Acceptance:** Keyboard and touch users reach every right-click action; inspector shows selected object's title/type and permissible actions.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_types


#### Resource accountability is separate from a specific task assignment

ID: resource_responsibility · proposed · P0

Folder owner oversees area; file/note/link contributors may work on it. Linked task assignee owns a particular outcome/date. Adding a contributor does not auto-create a deadline or grant provider access. One accountable resource owner is visible even with many contributors.

**Acceptance:** A folder owner and linked-task assignee may differ without conflicting ownership labels.

**Owner:** Project lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_bubbles,access_delegation


#### Create task from resource creates one canonical work record

ID: resource_tasks · proposed · P0

Inspector action asks title, assignee, due date, priority and project/context. New task stores resourceId link; Resources shows related-work list derived from those links. Work/My tasks/Schedule/board use same ID. Changing task status anywhere updates related-work view without a second resource progress field.

**Acceptance:** Task created from a file appears exactly once in Work and My tasks; completing it updates resource inspector after reload.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S14.

**Dependencies:** work_task_fields,resource_inspector


#### Internal folder contains metadata with safe hierarchy rules

ID: resource_folder · proposed · P0

Folder has parent ID and project/workspace context. Reject cycles and moving a folder inside itself/descendant. Proposed reasonable depth with breadcrumbs; limit and bulk behavior require product validation. Folder names may repeat across branches but sibling collisions warn clearly.

**Acceptance:** Attempted recursive move is rejected with intact tree; valid move retains IDs and linked tasks.

**Owner:** Engineering / product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_types


#### External folder link does not mirror provider contents

ID: resource_external_folder · proposed · P0

A Google Drive folder resource stores URL/provider and context/ownership/access note. Opening goes to the provider; browsing its actual children requires a future provider integration. Clearly distinguish it from an internal folder so the user does not assume upload or permissions are synchronized.

**Acceptance:** An external folder opens its provider URL and never claims it contains indexed/copied external files.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_provider_access


#### Creator means added to DWDG when external creator is unknown

ID: resource_creator · proposed · P0

Store createdBy/createdAt for internal objects and addedBy/addedAt for external resource. Provider creator may be an optional supplied metadata field with provenance. Never infer who authored a Google Sheet merely because that person pasted its URL.

**Acceptance:** External resource inspector says who added it to DWDG and leaves actual provider creator unknown when unavailable.

**Owner:** Engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.


#### Notes are lightweight editable resources linked to context

ID: resource_notes · proposed · P0

Proposed rich or Markdown/plain text note with title, author/editor, project/workspace/folder, autosaved draft and explicit saved revision. Support project brief, research finding and minutes without a separate notebook tab. Export plain/Markdown text; do not claim real-time collaborative editing in first minimum scope.

**Acceptance:** A note is editable, findable in Resources/global search and recoverable after failed save.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S10.

**Dependencies:** work_forms


#### Revision history identifies current approved version and original

ID: resource_revisions · proposed · P0

Budgeted v1 revisions retain stable resource ID, internal note text or external version URL, revision label, author/time, change note and reviewer/state. A link cannot freeze provider contents if edited in place; reviewed output needs an owner-supplied immutable version/export link or documented version evidence. Native uploaded-blob version storage is deferred.

**Acceptance:** A review points to its exact supplied external version or note text and warns when external link has no stable version evidence.

**Owner:** Resource owner / reviewer

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5/J8.

**Dependencies:** work_activity


#### Stored binary uploads are deferred; v1 links working files

ID: resource_upload · deferred · P2

The current budget target is Rp35,000/month with a hard ceiling of Rp50,000/month. Native binary uploads, coordinated blob/metadata cleanup, file/organization quotas and uploaded revisions remain deferred unless the user later approves a feasible storage/ownership/cost plan. Native notes/folders and approved external file links remain the proposed v1 resource baseline; preserve earlier upload code only as reference.

**Acceptance:** Core evidence/resource workflows work with URLs and notes; launch UI does not promise native stored uploads.

**Owner:** Engineering / Admin

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** scope_links_default


#### Notes and external-resource context preview; richer file embedding optional

ID: resource_preview · proposed · P1

V1 shows internal notes and permitted resource metadata, and opens working documents at the approved provider. DWDG does not mirror provider files. Optional safe PDF/image embedding needs access/quotas/browser support policy; office editing and provider content indexing stay deferred. Preview unavailable still provides usable open/access-request contact.

**Acceptance:** An external document remains usable through provider open/contact when embedded preview is unavailable.

**Owner:** Product / engineering

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** resource_provider_access


#### DWDG responsibility and provider permission are separate

ID: resource_provider_access · proposed · P0

Access to a resource record does not grant Google Drive/Canva/Figma/other app access. Show operational access note/request contact, open in external app and report link issue. Never promise provider synchronization, live preview, edit permission or availability without configured integration.

**Acceptance:** A contributor can understand who to ask for provider access; inspector does not claim external permission was granted.

**Owner:** Resource owner / product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. User request, 3 Oct 2026; Critique App Development conversation user messages.


#### Move/rename preserves links and shows scope consequences

ID: resource_move · proposed · P0

Rename changes label only. Move within project updates parent; move across project/workspace previews access/ownership changes and linked tasks. Proposed cross-scope moves require authorized owner/lead and do not silently relocate related tasks. External linked file itself stays in provider location.

**Acceptance:** Moving resource keeps its ID and task links; an unauthorized cross-workspace move is rejected.

**Owner:** Project / resource owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_project_collab,resource_folder


#### Default delete archives metadata, notes and folders

ID: resource_delete · proposed · P0

V1 inspector names removal of DWDG external link or reversible archive of native note/folder. Nonempty-folder archive previews permitted descendant and linked-work consequences. Deleting an external link never deletes provider file. Physical stored-file deletion and coordinated blob/metadata cleanup apply only if native uploads are adopted later with approved retention/cost/security policy. Default launch has no physical upload-delete action.

**Acceptance:** Deleting an external link leaves provider file untouched; folder archive restores same allowed child/task relationships; no binary cleanup action appears before optional upload adoption.

**Owner:** Resource owner / Admin

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_undo_archive


#### Pin is a contextual shortcut to an existing resource

ID: resource_pin · proposed · P1

Personal or project pin scope is explicit. A pin stores a reference, not a duplicate resource. Removing pin does not remove resource; inaccessible or archived target is omitted or shown neutrally according to policy. Prioritize useful current resources rather than decorative quick-access tiles.

**Acceptance:** Pin/unpin leaves canonical resource count unchanged and pin cannot expose restricted metadata.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_surface_scope


#### Resource search finds metadata and linked responsibility safely

ID: resource_search · proposed · P0

Search title/type/notes/owner/tags/project within allowed context. Show folder path, external vs stored indicator, responsible avatars and linked task count. Full-text indexing of uploaded file contents or provider documents is deferred until justified by cost/security/quality.

**Acceptance:** Search by an assigned person's name finds their permitted resources while private external content stays unindexed.

**Owner:** Engineering / product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G9/J9.

**Dependencies:** work_search


#### Account/password request becomes safe vault-reference discovery

ID: resource_secret_links · proposed · P0

Survey requested finding account passwords through search; proposed safe alternative is searchable account registry with service/purpose/owner and approved vault/access-request link. Never store secret values in resource notes, task text, URLs, preview, activity or export. Vault implementation/selection needs an explicit owner.

**Acceptance:** Search finds account ownership and approved access path; test fixture secret strings do not appear in results/export.

**Owner:** IT / Admin

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J9; User request, 3 Oct 2026; Critique App Development conversation user messages.


#### Export metadata and notes; provider files are separate

ID: resource_export_bundle · proposed · P0

Authorized JSON/CSV export includes resource metadata, note text and external references with manifest/scope/version. Working file contents and permissions remain at the approved provider; links may later become inaccessible. Native attachment bundle belongs with deferred uploads. Metadata export is not a complete provider backup.

**Acceptance:** Export reconciles resource/note counts and explicitly states that external file contents/provider access were not copied.

**Owner:** Admin / engineering

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** access_surface_scope,resource_revisions


#### Confirm note/resource limits and organization account ownership

ID: resource_launch_limits · open · P0

Open v1 decisions: note size/revision retention, project/resource count, folder depth, external URL disclosure, account/folder ownership and separate provider-backup procedure. No organization shared Drive or domain exists today. Notes/link-only launch is proposed; native upload and content mirroring remain deferred.

**Acceptance:** Approved native note/resource/folder limits, external URL disclosure and account custody are documented before real rollout; later uploads stay disabled until their separate policy is accepted.

**Owner:** Mahdy / IT / division leads

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.


#### Folder context doesn't overwrite child contributor lists

ID: resource_parent_responsibility · proposed · P0

Child avatar bubbles are explicit child responsibility unless contextual folder ownership is labeled separately. Removing parent person doesn't remove child assignee; adding folder contributor doesn't create tasks for every child. Provider permission remains external.

**Acceptance:** Folder and child can show different owners with no hidden child assignments.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** access_resource_inheritance


#### Short object instruction links longer notes rather than duplicating

ID: resource_object_note · proposed · P0

Folder/file/link inspector has short purpose/instruction note. Substantial brief/research/minutes is separate note resource with link. Don't duplicate long note in every related task description; keep source/context vs assigned outcome clear.

**Acceptance:** Object purpose and long brief both reachable from one inspector without duplicate contents.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** resource_notes


#### Reference existing resource; copying requires explicit provenance

ID: resource_references · proposed · P1

One resource may be linked to multiple allowed tasks/projects using approved context links. Add existing creates reference, not duplicate owner metadata. Explicit copy creates new metadata/ID with source relation, not automatic provider file duplication.

**Acceptance:** Two tasks reference one Survey Sheet without two independent resource owners.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** resource_tasks


#### Validate safe URL scheme without guessing provider permission

ID: resource_link_validation · proposed · P0

Production external resource baseline accepts HTTPS links and rejects executable/javascript/data/file schemes and embedded credentials. Plain HTTP legacy destinations require explicitly reviewed exception rather than default acceptance. Preserve meaningful URL content while restricting private URL disclosure; do not fetch private documents to guess provider access.

**Acceptance:** Unsafe/embedded-credential URL is rejected without losing draft; HTTPS provider link opens correctly and any legacy exception is explicit.

**Owner:** Engineering / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** resource_types


#### Unable-to-open report gives owner and recovery path

ID: resource_link_issue · proposed · P0

Flag not found/access denied/expired/wrong target, actor/time and owner follow-up. Record stays intact; app cannot prove provider deleted file from one denied attempt. Automated public status check cannot prove user authorization.

**Acceptance:** Reported link issue offers contact/next action without deleting canonical tasks.

**Owner:** Resource owner / IT

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** resource_provider_access


#### Resource events distinguish delegation, revision and linked task

ID: resource_events · proposed · P0

Notify assigned responsible person, required revision reviewer, linked-task assignee and owner of link issue. Private note draft produces no published update; pin/rename doesn't alert every member. Recipients reevaluated against current scope.

**Acceptance:** Delegation yields one eligible event; draft save yields no review notification.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


#### Safe exports preserve user text and exclude secrets

ID: resource_export_security · proposed · P0

CSV neutralizes formula-like leading values in output without changing app source text. Export IDs/path/type/notes/responsibility under current scope; restricted URLs omitted. No plaintext password/API/recovery code ordinary export or activity.

**Acceptance:** Malicious title doesn't execute spreadsheet formula and restricted URL/secret absent.

**Owner:** Engineering / IT

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J9.

**Dependencies:** access_sensitive_export


#### Account custodian transfer stores responsibility without secrets

ID: resource_account_history · proposed · P0

Registry stores current owner/access process/transfer actor/date/review date. Vault reference changes are historical metadata; no secret value audit. Handover complete requires successor acknowledgment of recovery/ownership externally before departing custodian access removed.

**Acceptance:** Ownership audit has no credentials and successor confirmation is visible.

**Owner:** IT / Admin

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** marketing_account_register,access_admin_handover


### Changes · workspace history

ID: changes · confirmed · P0

A dedicated Changes destination shows successful additions, edits, deletions, moves, archives, restores, approvals and role/configuration changes within the viewer's allowed current workspace. This is a required product capability. Its detailed retention, event semantics and sensitive-field policies below are proposed. The PRD planning editor has its own separate local Changes view; it does not represent actual production collaborators.

**Acceptance:** Every successful advertised mutation appears in its authorized workspace history with attributable actor/time/action; unrelated workspace changes are absent.

**Owner:** Mahdy

**Source / assumption:** Current user direct request: change history add/edit/delete anyone on workspace only


#### A workspace page without adding project tabs

ID: changes-location · proposed · P0

Place Changes in workspace navigation or as the chronological Changes view within Updates, with an explicit stable destination and label. Keep project main tabs Overview / Work / Resources unchanged. Project/resource inspector can deep-link to Changes filtered by that record. Product owner's exact sidebar choice remains open; minimum is one findable page for workspace changes.

**Acceptance:** From any allowed workspace, a member can open Changes and filter a project without navigating another division.

**Owner:** Design + product

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Mutation event taxonomy

ID: changes-actions · proposed · P0

Record create, field edit, assignment, status transition, date update, move/reparent, archive, soft delete, restore, purge metadata, approval/rejection, membership/invitation change, capability/configuration change, resource revision, and import. Read/view/search events are not shown as edits. Failed/rejected attempts belong separate security/diagnostic logs when appropriate, not successful-change history.

**Acceptance:** A failed save creates no fake successful event; a successful multi-field edit has a coherent event/change set.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Minimal event fields

ID: changes-event · proposed · P0

event_id; organization_id; workspace_id or authorized affected scope; entity_type/entity_id; action; actor_user_id and historical display snapshot; server occurred_at; old/new version; changed field names with permitted before/after values; source operation; correlation/idempotency identifier; human-readable summary; sensitivity/redaction metadata. System jobs show System with job identity, not a fictitious person. All identities/timestamps come from trusted server context.

**Acceptance:** Tampering client actor/time is ignored or rejected; event records authoritative actor/time and current operation.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Save and history commit together

ID: changes-atomically · proposed · P0

For database changes, write the event within the same transaction or trusted change-capture path. A committed record without its required event is a failure; event without committed record is also a failure. External file side effects have explicit pending/succeeded/failed lifecycle and correlation. Retry with the same operation ID does not duplicate the event.

**Acceptance:** Inject error after data update and before event write; operation rolls back or recovers with exactly one consistent event.

**Owner:** Backend owner

**Source / assumption:** Proposed integrity for required history

**Dependencies:** data


#### Workspace-only visibility

ID: changes-scope · confirmed · P0

Default Changes displays current selected workspace only. Members see their division and permitted records; VPs see reporting scope only when explicitly choosing that workspace. Admin/President can choose allowed workspace but history does not silently combine all DWDG. If an aggregate view is later added it must be explicit, permission-scoped and separately approved. Filters/counts and notifications obey the same policy.

**Acceptance:** User in workspace A cannot find title/count/actor/field changes from B through search, pagination, export, direct link or cached response.

**Owner:** Authorization owner

**Source / assumption:** User workspace-only scope + earlier access rules

**Dependencies:** access


#### Record and field permissions still apply

ID: changes-sensitive · proposed · P0

Workspace membership is necessary but not sufficient for restricted HR, candidate, legal, finance, credential references or private comments. Redact before/after data and optionally whole events according to record/field policy. Showing 'redacted' still must not leak confidential titles/actors/counts when even existence is restricted. No passwords/tokens/file bytes in audit content.

**Acceptance:** Ordinary member cannot see hidden candidate evaluation, finance bank information or restricted legal revision through history.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Useful readable differences

ID: changes-diff · proposed · P0

For ordinary structured fields show Status: In progress → Done, Owner: A → B, Date: 5 Oct → 7 Oct, Folder: Research → Deliverables. Long notes show a bounded changed-text view with deliberate access checks and optional expanded detail; don't dump entire sensitive documents. Preserve original saved value types and UI localization separately. A history entry explains exactly what changed without inventing reasons.

**Acceptance:** Edit several fields; readable details align with stored change set and EN/ID formatting; user note text remains original.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Deleted records retain safe attribution

ID: changes-deletion · proposed · P0

Soft-deletion event retains stable record ID, permitted title snapshot, actor/time, affected record count and selected relationships, allowing a viewer to understand what disappeared. Deep links show Deleted/Archived plus permitted recovery if available. Permanent purge removes content according to retention/privacy policy while retaining only permitted operational metadata. Delete hierarchy changes explicitly list child effect, not 'Folder deleted' while files vanish silently.

**Acceptance:** Delete a resource tree, reopen Changes, and restore if allowed; history explains subtree effect without leaking protected children.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Undo and restore are new changes

ID: changes-undo · proposed · P0

Undo does not erase the original history. Append an Undo/Restore event pointing to the original operation and record resulting versions. Recheck actor permissions and concurrent edits; sensitive approvals cannot be blindly reverted. A restoration preserves ID/links when policy permits. Show original edit and reversal together when helpful.

**Acceptance:** Edit→Undo→Redo results in ordered attributable events and correct final state; prior event remains present.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Moves between workspaces

ID: changes-move · proposed · P0

Cross-workspace move checks permission and transfers ownership/scope through a reviewed operation. Source history records allowed removal/move-out; destination records allowed move-in. Neither side displays restricted old/new workspace content or private actor information outside authorization. Historical access policy after membership/workspace changes must be explicitly defined, not inferred from old membership.

**Acceptance:** A source-only viewer and destination-only viewer see appropriate redacted events; move does not become a route to hidden content.

**Owner:** Authorization + data owner

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Imports, bulk edits, and event groups

ID: changes-import · proposed · P0

Bulk action/import emits a correlated summary with affected counts and reviewable per-record changes under permissions. Preserve provenance source, importer and validated mapping; original external author/timestamps are labeled imported metadata rather than trusted audit actor/time. A grouped event can expand lazily; no hundreds of repeated toasts.

**Acceptance:** Import/update 100 permitted fixtures; Changes groups them accurately and filters/export reveal the corresponding allowed events.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Date, actor, action, record, and project filters

ID: changes-filters · proposed · P1

Provide clear current-workspace identity, chronological ordering, date interval, actor, action, record type and optional project/record filter. Search only permitted summaries/field metadata. Stable cursor pagination orders server time with ID tie-break. Empty filtered results differ from no recorded history. Event count is allowed-scope count, not organization's hidden total.

**Acceptance:** Combined filters yield expected fixture events, no duplicates/skips across pagination and no out-of-scope totals.

**Owner:** Design + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Detail link and accessible chronological UI

ID: changes-details · proposed · P0

Rows show actor, action, record/context, timestamp and concise changed-value summary with details control. Native keyboard actions and readable time formatting work in both languages/themes; live updates do not unexpectedly shift current scroll/focus. Deleted-user name remains historical where retention permits; avatar missing uses initials rather than broken image.

**Acceptance:** Keyboard/touch can inspect a diff, return to list position, and open permitted related record.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Retention and operational storage budget

ID: changes-retention · open · P0

History is an append-only operational record, not indefinite full-document version storage. Proposed retention duration must be decided against organizational needs/privacy/free-tier capacity. Separate short-lived diagnostic logs from organization history. Archive/export older events deliberately with manifest, access controls and restore/read policy; never silently remove history solely to stay on a free plan.

**Acceptance:** Retention setting has owner, effective date, scope and tested export/archive behavior; storage dashboard exposes history growth.

**Owner:** President + data custodian

**Source / assumption:** Required history; retention period not supplied

**Dependencies:** costs
data


#### Authorized history export

ID: changes-export · proposed · P1

Changes export retains selected workspace/filters/timezone, event IDs, trusted actor/time, action, permitted diffs, versions and correlation. Export itself records a safe administrative/security event where appropriate. Do not export redacted hidden before/after values or unauthorized user data. Plain CSV quoting prevents cells starting formula characters becoming executed spreadsheet formulas.

**Acceptance:** Export filtered history as permitted roles; scope/counts reconcile, and sensitive diff columns remain excluded.

**Owner:** Data owner

**Source / assumption:** User data export requirement + history request


#### Audit cannot be edited through ordinary UI

ID: changes-integrity · proposed · P0

Members cannot edit/delete audit events through history UI or API. Admin maintenance follows specific retention/purge operation and review; ordinary admin access is not a reason to fabricate changes. Integrity controls include trusted actor, server transaction and restricted write paths. Hash chaining or tamper-evident external archive may be considered later; v1 must not claim forensic immutability without proof.

**Acceptance:** Member/editor attempts to change event actor/time/content fail; authorized maintenance has its own traceable record.

**Owner:** Security reviewer

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Changes is different from release notes

ID: changes-system-history · proposed · P1

Workspace Changes records data/configuration actions by people/system jobs. App release notes record shipped code/product updates, version, migration impacts and operator; they live in Help/Settings or release announcement. Neither feature substitutes for security diagnostics, backups, or data version recovery. The local PRD editor's Changes logs planning edits only.

**Acceptance:** A user can distinguish 'task owner changed' from 'new release deployed' and from a PRD draft edit.

**Owner:** Product + operations

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026


#### Planning editor history and honest identity

ID: changes-current-editor · confirmed · P0

The delivered PRD editor logs edits for this one planning document on this device. It records local actions, not authenticated organizational collaborators, and labels the actor accordingly. Undo/Redo appends a history entry. JSON export retains planning history; imported history is marked external/unverified. Browser persistence is not a secure production audit backend.

**Acceptance:** Add/edit/delete/move/import/undo logs survive reload where storage works; no unrelated app/document changes appear.

**Owner:** Planning tool owner

**Source / assumption:** Current user asks Changes while working on editable PRD; implementation boundary explicit


### Honest operational charts and reports

ID: analytics · proposed · P0

Charts derive from authorized saved records, show units/basis/unknown states and open those records. Reporting reduces repetitive reconstruction; no invented organization health, productivity, hours, revenue or completion history.

**Acceptance:** Every launch chart/report has a formula, access scope and accessible exact-value alternative.

**Owner:** Product / division leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.


#### Project progress = currently completed tasks / linked tasks

ID: analytics_progress · proposed · P0

Define included tasks explicitly, including archived/cancelled policy. Default proposed denominator active noncancelled linked tasks; completed count same eligible set. Empty project displays No tasks yet. Project status/readiness remains separate; task percentage is not client acceptance or strategic success. If optional P1 subtasks are adopted, use the same eligible leaf-task definition across charts/lists/exports and exclude structural parents with active children from numerator/denominator; show parent review state separately.

**Acceptance:** Exact numerator/denominator match the filtered linked task list, including an empty project.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_lifecycle


#### Completed-task activity uses real recorded completion dates

ID: analytics_completion · proposed · P0

Currently completed tasks counted by stored completion date; undated legacy completions disclosed separately. Known observed zero days are zero, unobserved history unavailable. Today partial. Reopen/delete changes current-record counts; immutable event history, if offered, has different label.

**Acceptance:** A legacy completed task with null timestamp is excluded from date bars and included in an undated note.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_activity


#### Average excludes today, future, and unobserved days

ID: analytics_average · proposed · P0

Average = sum of dated currently completed task counts on completed observed calendar days / number of those days. Include known zero days. Empty denominator shows unavailable. Selected timezone/period basis visible; stable axis across comparison period; no claimed hours.

**Acceptance:** Known zero-day fixture lowers average correctly while pre-observation days do not enter denominator.

**Owner:** Engineering / product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** analytics_completion


#### Chart selection synchronizes exact values and source list

ID: analytics_selection · proposed · P0

Mouse, keyboard, and tap select date/stage/project/category with accessible names. Date capsule, chart mark, exact readout and underlying list share controlled selection and survive resize/return. Restricted aggregates are computed from allowed records before chart construction.

**Acceptance:** Selecting a bar/stage filters the exact same record IDs and focus remains usable on mobile.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** access_surface_scope


#### Division summaries use meaningful counts and actual amounts

ID: analytics_division_counts · proposed · P0

External stages = relationship counts; Marketing cadence = saved planned/actual dates and stage counts; HR = candidate stage and checklist count; S&G = explicit horizons/dependencies; Consulting = saved milestone/review states; Finance = exact IDR allocation/approval/payment. No unsupported conversion/performance/engagement metric.

**Acceptance:** For each division select a summary mark and reconcile exact value to its underlying authorized records.

**Owner:** Division leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** analytics_selection


#### Filtered report includes scope, basis, date and missing data

ID: analytics_reports · proposed · P0

Generate selected workspace/project/period summaries with owner, state, dates, blockers, decisions and resource/evidence links. CSV handles quoting/Unicode/formula-injection hygiene; print/export labels filters/timezone/currency and generation time. Missing values remain unavailable, not invented zeros.

**Acceptance:** Export row IDs and totals match the filtered view and restricted columns stay excluded.

**Owner:** Product / engineering

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S05; User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_surface_scope


#### Survey facts guide priorities without pretending to cover everyone

ID: analytics_survey · confirmed · P0

8 respondents: Consulting 3, MarCom IT 2, Legal Finance 2, Client Engagement 1; HR/S&G absent. Multi-select: reminders 8, progress/docs 7 each, assignment/reports/blockers 5 each, dashboard 4, notifications/calendar/minutes 3 each, budget 1. Separate most-important mentions have a different basis.

**Acceptance:** PRD quotes correct sample, per-question basis and source range; HR/S&G processes stay proposed pending validation.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


#### Define success evidence from real adoption and completion journeys

ID: analytics_metric_policy · proposed · P1

Proposed product metrics: successful invite/sign-in, active members by defined week, task update success, unresolved P0 errors, overdue/blocker visibility and report usage with minimal privacy-preserving telemetry. Set target after baseline/pilot; do not invent productivity gain or student-member performance rankings.

**Acceptance:** Pilot review can measure known journey success and errors without collecting unnecessary personal behavior.

**Owner:** Mahdy / product

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.


#### Current process and anticipated risk are different evidence

ID: survey_fragmentation · confirmed · P0

E2:E9 names WhatsApp/manual spreadsheets/Forms/Sheets/Drive. F5/F6 explicitly say serious program workload hasn't run yet and anticipate fragmentation/SLA/PIC problems. Do not state those as measured prevalent failures or quantified delays.

**Acceptance:** PRD distinguishes supplied current method from respondent's future risk.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E2:F9.


#### Consulting asks master matrix, revisions and reviewed delivery

ID: survey_consulting_qualitative · confirmed · P0

G2 asks reviewed work/revision notes; J2 master matrix. E8/F8/J8 asks many projects without repeated input, PJ/dates/milestones/blockers/scope/decisions/readiness, distinct PL/PM, history and approval actor. This validates linked requirements, not adopted stage names.

**Acceptance:** Qualitative needs map to canonical work/review nodes while stages remain proposed.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E2:J2/E8:J8.

**Dependencies:** division_consulting


#### Legal asks connected intake, register, versions and gate

ID: survey_legal_qualitative · confirmed · P0

E5/F5/J5 describe Forms/Sheets/Drive/WhatsApp, future duplicate-number risk, H-2/H-3 suggestion, revision/signature tracking, signatory/KAK input, numbering upon approval, master-template history and PKS→BAST→invoice. Official SOP/authority still open.

**Acceptance:** Intake/numbering/SLA/version/gate cite precise evidence and retain adoption gaps.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E5:J5.

**Dependencies:** division_legal_finance


#### Marketing asks access, executor reminder and proof

ID: survey_marketing_qualitative · confirmed · P0

F3 data separation; F7 spreadsheet not accessible to everyone; J7 executor deadline and progress/completion evidence; J3 attractive view. Supports shared scoped work/reviewed resources, not social autopublishing/engagement analytics.

**Acceptance:** Access/executor/evidence requirements map to source with channel integration deferred.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E3:J3/E7:J7.

**Dependencies:** division_marketing


#### External asks mobile PIC timeline and follow-up reminders

ID: survey_external_qualitative · confirmed · P0

F6 anticipates PIC/partnership timeline before program execution. J6 mobile-friendly and possible Telegram/WhatsApp/email. Mobile reminder outcome is supported; channel selection remains cost-sensitive proposal, not must-build bot.

**Acceptance:** Mobile/PIC/follow-up included with explicit channel choice gap.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E6:J6; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** division_external


#### Password-search example maps to safe account-access discovery

ID: survey_secret_search · confirmed · P0

G9 search anything/J9 project file/password example captures findability need. Proposed searchable service/owner/access process/vault reference excludes secret values. Source content is not authorization to collect/index passwords.

**Acceptance:** Traceability maps unsafe example to safe account registry and exclusions.

**Owner:** Product owner / IT

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G9/J9.

**Dependencies:** resource_secret_links


#### Most-important free text is mentions, not clean top-three ranking

ID: survey_important_basis · confirmed · P0

Question H asks maximum three but H5/H7/H9 list or mention more. Report counts as mentions: reminder/docs 5 each; progress 4; dashboard/notifications 2; assignment/reports/blockers/minutes/budget 1; calendar 0. Never combine with G multi-select count or score.

**Acceptance:** PRD labels mention basis and does not claim every respondent complied with max-three.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. H2:H9; SURVEY_TRACEABILITY.md.


#### Eight-response source excludes HR/S&G and unnecessary identifiers

ID: survey_privacy_scope · confirmed · P0

No survey establishes member count, weekly adoption, cost or department-wide consensus. Sample 8; Client name mapped to External; HR/S&G absent. Keep source workbook unchanged and cite range/hash without copying names/emails into shared PRD.

**Acceptance:** All survey numbers cite correct basis and no respondent identifying fields copied.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D2:J9.


### Design, navigation, and interaction contract

ID: design · proposed · P0

Quiet Notion-like working surfaces, compact CRM/task composition on desktop, Samsung-inspired mobile grouping/charts, and selective tactile controls from supplied references. Keep expressive identity restrained and operational text stable. Use one coherent component system; avoid six independently styled applications. This direction is a proposed baseline for the restart, informed by supplied references and prior user decisions.

**Acceptance:** A complete set of core and division screens passes a shared design/interaction matrix before launch.

**Owner:** Design owner + Mahdy

**Source / assumption:** Referenced chats; Experience v1.1 reference atlas and actual CRM/Samsung images


#### One persistent shell and one workspace selector

ID: design-shell · confirmed · P0

Desktop has a compact sidebar, top search/action area, main work region and contextual inspector. The workspace name opens a searchable allowed-context selector; it does not silently navigate to Organization. Members with one allowed workspace see its identity without a misleading switcher. Organization management is an explicit destination. Workspace capabilities appear within the same shell.

**Acceptance:** Switch workspace from Home, Projects, and Resources; all views update to the allowed scope, keep sensible context, and expose no duplicate division list.

**Owner:** Design + authorization owners

**Source / assumption:** Take notes on YouTube videos: explicit user workspace-dropdown request; scoped access decisions


#### Minimal global and project navigation

ID: design-navigation · proposed · P0

Proposed global destinations: Home, My Work, Projects, Schedule, Resources, Updates; Organization and Settings are secondary destinations subject to permissions. Workspace-specific capabilities appear below core destinations. Project navigation is exactly Overview / Work / Resources. List, board, timeline, milestones, and activity are view choices inside these tabs. Mobile uses a short dock and accessible More destination; do not hide required actions behind hover.

**Acceptance:** Users can distinguish organization context, project, and view without interpreting three different items named Workspace.

**Owner:** Product + design

**Source / assumption:** Critique App Development minimal project-tab request; renamed Resources direction


#### Project information architecture

ID: design-project-tabs · proposed · P0

Overview: brief, owner, deadlines, milestones, blockers, latest decisions, delivery readiness and compact activity.
Work: one task collection through list, board, timeline, and milestone views; no duplicate task databases.
Resources: notes, internal folders, linked documents/apps, and later optional uploads, assignees, and contextual tasks.
Activity lives as a section or inspector within the relevant tab, avoiding an extra main tab unless research proves it necessary.

**Acceptance:** A task created from a resource appears in Work with the same ID; Overview counts and timeline dates reconcile after editing.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Readable density and aligned rows

ID: design-density · proposed · P1

Carry forward desktop targets as proposals: about 216px sidebar, 56px toolbar, 24/32px title, 14/20px body, 12/16px supporting text. Projects default to grouped 76px rows with Grid/Timeline alternatives. At 1440×900 target four ordinary rows visible below a compact summary. Allow long titles and accessibility zoom to expand rows rather than clip. Dense does not mean tiny controls or information at every pixel.

**Acceptance:** Measure actual settled screen geometry; long project names and Indonesian labels remain usable at 200% zoom.

**Owner:** Design owner

**Source / assumption:** Experience v1.1 tokens; reference 12 CRM, 02 compact task groups


#### Semantic surfaces, themes, and identity

ID: design-materials · proposed · P1

Proposed shared roles: mineral canvas #F5F6F8 / #131619; reading surface #FFFFFF / #1C2024; main text #171A1F / #F3F5F7; secondary text #606874 / #ACB4BD; identity sage #58703F / #BFD696; activity blue #3478F6 / #71A5FF. Semantic tokens drive both themes. Ordinary tables/notes remain opaque. Glass belongs on small floating controls/menus; tactile depth belongs on selected primary controls. These color values require rendered contrast checks.

**Acceptance:** Light/dark screen review verifies text contrast, input boundaries, disabled/error states, chart distinctions, and solid-surface fallback.

**Owner:** Design owner

**Source / assumption:** Experience v1.1 design-tokens.json, observed brand/reference material


#### Operational typography and wordmark

ID: design-typography · proposed · P1

Use existing locally served Pretendard/system fallback for operational text unless a reviewed change materially improves readability. Retain DWDG’ONE as the identity treatment rather than turning every heading into a brand graphic. Tabular figures align IDR values, dates, counts, and percentages. Default operational text remains readable; long labels wrap naturally. Do not load multiple large font families merely for decorative variety.

**Acceptance:** Font loading failure preserves usable layout; all finance figures and date columns stay aligned in both languages.

**Owner:** Design owner

**Source / assumption:** Experience v1.1 typography contract


#### Reference register and attribution limits

ID: design-reference · proposed · P1

CRM/task stills establish visual grouping, row anchors, and inspector proportions. Samsung stills establish mobile charts, exact selected values, progress groups, and scroll context. The supplied meeting video is a reference for compact in-place composition. Prior YouTube notes verify chapter metadata, not full playback or narration. Never copy fictional people, statistics, account credentials, or instructions contained in a screenshot into product data.

**Acceptance:** Reference comparisons identify which actual image supports each pattern; a still is never presented as proof of motion timing.

**Owner:** Design owner

**Source / assumption:** REFERENCE_ATLAS.md; prior video notes and referenced chat evidence


#### A visible action has a complete outcome

ID: design-actions · proposed · P0

Every visible control has a defined result, permission rule, pending state, success evidence, validation failure, and recovery action. Primary creation offers only fields needed to start; extra details remain available afterward. Disabled actions explain the unmet prerequisite when relevant. No decorative button can suggest that an email, signature, payment, calendar sync, or publication happened.

**Acceptance:** Action inventory covers all core and capability screens; clicking every primary action produces its advertised saved outcome or explicit unavailable state.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Contextual detail and resource actions

ID: design-inspector · confirmed · P0

Desktop detail uses a right inspector that preserves the list, selected item, and scroll. Mobile opens a usable full-screen detail with Back. Resource right-click is an accelerator; a visible More action and keyboard route expose the same inspector. Inspector sections include creator/added by, responsible people/avatar bubbles, notes, tasks, linked records, and allowed actions. Folder responsibility does not automatically grant file-provider access.

**Acceptance:** Open the same folder/file/link by pointer, keyboard, and touch; each route can delegate/create a task with no context loss.

**Owner:** Design + resource owners

**Source / assumption:** Critique App Development explicit resource avatars and right-click side-panel request


#### Menus, dialogs, focus, and drafts

ID: design-overlays · proposed · P0

One overlay controller owns placement and focus. Small pickers anchor to their control, flip or shift at edges, and retain keyboard navigation. Destructive confirmation names the item and consequence. Escape closes the top eligible layer; closing restores logical focus. Editing drafts persist through harmless interactions. Leaving an unsaved draft has explicit save/discard behavior; external modal actions never erase it.

**Acceptance:** Exercise edge menus, Escape, nested actions, deleted opener, validation failure, and unsaved draft navigation on desktop and mobile.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Purposeful motion and reduced-motion parity

ID: design-motion · proposed · P1

Motion explains state change: contextual panel expansion, selected-date changes, saved task completion, and undo. No entrance sequence delays work. Baseline proposal: 120–140ms press, 180–220ms picker, 260–320ms inspector, 220ms completion dissolve. Commit successfully before removing a row. Reduced motion removes spatial/blur effects and retains all state feedback. Heavy WebGL identity is deferred until ordinary operations meet performance and accessibility gates.

**Acceptance:** Complete a task under successful save, failed save, reduced motion, rapid double action, and Undo; final data and focus remain correct.

**Owner:** Design + frontend

**Source / assumption:** Experience v1.1 motion tokens; prior user material/animation direction


#### English and Bahasa Indonesia parity

ID: design-languages · confirmed · P0

Retain English and Bahasa Indonesia, with shared keys for navigation, fields, statuses, validation, charts, notifications, accessible names, emails if introduced, and exports. Format dates/numbers/IDR with chosen locale while retaining stable stored values. Never translate user-entered notes, task names, or filenames automatically. Proposed default remains English pending user preference.

**Acceptance:** Complete the same core journey in EN and ID; missing translation keys fail QA; changing language preserves drafts and entered content.

**Owner:** Product + localization owner

**Source / assumption:** Workspace AGENTS and existing bilingual contract; default language proposed


#### Date-only work and actual meeting times

ID: design-time · proposed · P0

Organization timezone defaults to Asia/Jakarta; display includes a timezone when ambiguity matters. Store date-only deadlines as dates rather than midnight UTC timestamps. Meetings have actual start, end/duration, and timezone. Overdue depends on agreed date semantics, not artificial 00:00 offsets. A user's travel timezone must not shift a date-only deadline. Availability timezone conversion remains explicit.

**Acceptance:** Tests across midnight, month/year boundary and alternate browser timezone preserve date-only deadlines and render timed meetings accurately.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Empty, loading, denied, offline, and broken states

ID: design-empty · proposed · P0

Differentiate no records, no matching results, denied access, missing record, loading, offline, and failed retrieval. Empty views show one useful create/invite/import route appropriate to role. Broken external links distinguish missing metadata from provider permission problems. Loading retains layout and existing content where valid. A save retry retains input and avoids duplicate records.

**Acceptance:** Every main screen is inspected in these states; no empty chart implies zero activity when history is unavailable.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Search as a scoped navigation tool

ID: design-search · proposed · P0

Search internal record metadata only within current permissions; support tasks, projects, people allowed to the viewer, resources, decisions, and capability records advertised in the UI. Show record type, context, and next action. No provider full-text indexing or plaintext passwords in v1. A stale result rechecks access before detail opens. Keyboard and mobile have equivalent routes.

**Acceptance:** Query a title from an inaccessible workspace; neither content, count, snippets, avatars, nor a cached detail leaks.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Phone use and real touch interactions

ID: design-mobile · proposed · P0

Support 360px and 390px phones, 768px tablet, 1024px compact desktop, and 1440px desktop. Mobile shows title and next action before decorative summaries; metadata moves to a second line. Use 44px effective touch targets, safe-area spacing, keyboard-safe forms, and accessible non-hover actions. The page owns scrolling; a sticky date capsule never covers work or focused input.

**Acceptance:** Record mobile task edit, resource assignment, timed meeting, error/retry, and return navigation on an actual rendering engine.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Accessibility as core behavior

ID: design-accessibility · proposed · P0

Target WCAG 2.2 AA as a proposed design/testing goal, not a certified claim. Use semantic controls, persistent visible focus, proper dialogs/labels, contrast checking, descriptive errors, and status text independent of color. Charts offer readable record/value lists. Respect reduced motion and optional solid surfaces. Priority workflows remain usable by keyboard and at 200% zoom.

**Acceptance:** Keyboard-only journeys and manual screen-reader spot checks cover sign-in, task edit, workspace selection, resources, and finance review; defects are resolved before general launch.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Preferences follow the person

ID: design-preferences · proposed · P0

Theme, language, notification preference, chosen view, and sensible page context persist per user. Default theme follows system until chosen. Presentation changes do not alter shared data. Store draft/context locally with privacy and logout clearing rules; don't expose previous member's notes on a shared laptop. Explicit logout ends session and clears sensitive cached data.

**Acceptance:** Switch accounts on the same device; second user sees their own context and no first-user drafts or cached resources.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Design proof before implementation acceptance

ID: design-ui-review · proposed · P0

Before coding a large screen set, map reusable shell, rows, forms, inspector, picker, chart, empty/error states, and core division-specific working views to the PRD. Review representative long/empty/dense/error states and both themes/languages. Production implementation follows the chosen requirements rather than improvising disconnected screen features.

**Acceptance:** Design checklist and reference comparisons link to current screenshots and requirements; historical screenshots/test counts do not approve the new release.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Resource identity, scheduling depth, and discovery

ID: experience-advanced · proposed · P1

Keep advanced ideas in the PRD with specific behavior and a scope decision. Detailed maps must include them even when expensive implementation is deferred. An omitted idea should not reappear later as a surprise architectural change.

**Acceptance:** Each advanced proposal states benefit, cost/performance/privacy boundary, fallback and first-version status.

**Owner:** Design + product

**Source / assumption:** Critique App Development brainstorming


##### Resource type and optional optical identity

ID: design-resource-identity · proposed · P2

Resource icon/provider labels distinguish note, folder, file, spreadsheet, app, and URL. Optional identity treatments discussed: project optical/liquid; folder material subtype; note quiet paper; spreadsheet grid; design app prism; storage layered; generic link swirl. These are brainstorming, not final assets or approved GPU requirement. Default compact rows remain readable with simple icons; optional tile view can carry identity.

**Acceptance:** Members identify resource type with effects disabled; illustrative material never overrides filename/provider/assignee information.

**Owner:** Design owner

**Source / assumption:** Critique App Development assistant material taxonomy, not direct confirmation


##### WebGL identity is a later tested enhancement

ID: design-shaders · deferred · P2

Record the WebGL/shader concept so it is not lost. Actual realtime effects are deferred for the budget-limited first release unless a lightweight prototype proves cost, battery, rendering and accessibility fit within the Rp35,000 monthly target/Rp50,000 ceiling. Static pre-rendered identity art is a candidate fallback. No effect on text/records, no required network paid API, no always-running animation in background tabs.

**Acceptance:** Optional enhancement must pass no-WebGL, reduced-motion, low-power/mobile and resource-failure tests before enablement.

**Owner:** Design + engineering

**Source / assumption:** Critique shader ideas; current Rp35,000 target / Rp50,000 ceiling


##### Depth without more main tabs

ID: design-discoverability · proposed · P1

Expose advanced actions through contextual inspectors, explicit view controls, and meaningful resource rows rather than multiplying navigation. Keep essential create/save/back visible. Right-click and avatar details accelerate use but don't hide the only route. Discovery hints are short, dismissible, and not repeated on every visit.

**Acceptance:** A first-time member completes resource delegation and task creation using visible actions; experienced member uses shortcuts.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


##### Availability based on explicit evidence

ID: design-availability-evidence · proposed · P1

Availability can use voluntarily declared hours/unavailability, actual meetings, planned allocations and agreed capacity. No inferred green 'free now' from online presence or lack of tasks. Avoid labeling a date-only task as occupying all day. Show source/last update and unknown state. Personal availability details visible only under agreed scope.

**Acceptance:** Member with no declared hours shows unknown; known meeting conflict is shown without exposing private meeting title.

**Owner:** HR + product

**Source / assumption:** Critique availability discussion; source F/J scheduling suggestions


##### Assignment conflict as warning, not automatic judgment

ID: design-availability-assignment · proposed · P1

When selecting assignee or meeting time, show known conflicts and workload basis without inventing working hours. Default assignment is allowed unless an adopted hard constraint says otherwise; warning can be acknowledged with reason where required. Alternative assignee/time suggestions use known scope/data. Capacity measurement is proposed, not an HR performance ranking.

**Acceptance:** Assign work with known conflict/unknown availability; UI explains basis and retains owner/date draft.

**Owner:** Product + HR

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


##### Timeline edits keep dates and dependencies coherent

ID: design-timeline-interactions · proposed · P1

Dragging or keyboard moving changes the same task dates shown elsewhere after validation. Dependencies reject cycles/self-links and communicate predecessor/blocked state. Moving one task never silently reschedules unrelated tasks. Optional downstream-date preview shows exact affected work and requires a committed action. Milestones have clear date/linked-task criteria, not percent bars with no source.

**Acceptance:** Move a predecessor with downstream work, attempt a cycle, fail a save, and Undo; dates/links remain consistent.

**Owner:** Engineering + consulting

**Source / assumption:** Critique Work/timeline proposals


##### V1 notes without a collaborative editor platform

ID: design-collaboration-editing · proposed · P1

Small native notes support agreed lightweight formatting and links, versioned save/conflict behavior, creator/last editor and permitted comment/review. Rich simultaneous cursors, full Docs clone, version diff editor and offline CRDT are deferred. Link Google Docs for intensive collaborative writing. Don't discard a note when two people save changes.

**Acceptance:** Concurrent fixture edits receive recoverable version conflict; exported native note preserves its content.

**Owner:** Product + engineering

**Source / assumption:** Minimal tool/cost proposal

**Dependencies:** resources


### External services and strict integration boundaries

ID: integrations · proposed · P0

First-version default is link-first integration, minimizing cost and credential risk. External apps remain useful and recognizable Resources. Native record coordination belongs in DWDG’ONE; collaborative document editing, publishing, accounting, signatures, and passwords stay with tools designed for them unless a later approved integration has a complete contract.

**Acceptance:** The UI describes exactly which action the app performs and which action opens an external provider.

**Owner:** Product + engineering

**Source / assumption:** Critique Resources as apps/files/notes/links; user Rp35,000 target / Rp50,000 ceiling


#### Generic URLs and supported app links

ID: integration-links · proposed · P0

Support https URLs and recognized Docs/Sheets/Drive/Canva/Figma/GitHub/Forms links with title, provider/type, owner, description, source context, and last reviewed date. Validate protocols; reject javascript/data/file URLs and embedded credentials. Do not fetch arbitrary URLs server-side by default. User-provided link title is not proof that the URL is safe/accessible.

**Acceptance:** Open safe HTTPS link with clear external navigation; malformed/dangerous protocol is rejected without losing input.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Provider permission and app permission differ

ID: integration-provider-access · proposed · P0

DWDG resource visibility controls native notes, folders and link metadata. If native binary uploads are later adopted, their private access also follows DWDG authorization. Google/Canva/Figma/GitHub permission remains controlled by provider accounts. Assigning a person to a file or folder does not share the external item automatically. Inspector offers a clear access-request step and names the recorded owner/custodian. Never falsely claim that a user can open a linked file after app assignment.

**Acceptance:** A fixture user allowed in app but denied at provider sees helpful guidance; no provider permission is silently widened.

**Owner:** Resource owner

**Source / assumption:** Critique actionable resources + scoped access


#### Safe preview and external open

ID: integration-previews · deferred · P2

Default launch opens authorized external provider links; provider-supported embeds are optional and must respect permissions/browser restrictions. Native uploaded-file preview is deferred with binary upload, not a launch dependency. If later enabled, define small MIME/size limits, safe isolation and download fallback; never render untrusted HTML in the app origin. Missing/denied external links preserve metadata and offer an access-request route.

**Acceptance:** Test missing URL, denied provider preview, unsupported MIME, network failure, and valid small PDF/image preview.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Folder continuity without assumed Shared Drive

ID: integration-drive-ownership · open · P0

User confirms no current shared Drive. Decide a controlled folder/account custody arrangement before importing real files, and verify whether university Google Workspace grants Shared Drive capability. Ordinary shared folder is not equivalent to Shared Drive. File ownership transfer and departed-account risk remain visible. Don't assume a personal student's account is permanent organizational infrastructure.

**Acceptance:** Account/folder plan lists individual custodian permissions, recovery/succession, ownership limitations, and verified entitlement.

**Owner:** President + resource custodian

**Source / assumption:** Current user answer 3 October 2026


#### Managed authentication with invited membership

ID: integration-auth · proposed · P0

Prefer a managed auth provider compatible with cost and production security requirements. Google sign-in is a candidate if available and correctly configured; it does not prove organization membership. Validate identity and active invitation/membership server-side. Consent/callback URLs, production/sandbox separation, unverified application limits, and university policy must be checked before launch.

**Acceptance:** Authenticate in isolated staging and production configuration; wrong organization and revoked membership cannot reach records.

**Owner:** Engineering + account custodian

**Source / assumption:** Implementation choice remains proposed

**Dependencies:** security
infrastructure


#### Email is optional until delivery is configured

ID: integration-email · proposed · P1

If invitation/reset/reminder email is required, define sender identity, provider rate limits, DNS/domain requirements, sender verification, retry/deduplication, unsubscribable reminders, and delivery monitoring. User has no domain; do not assume custom branded sender is available. Google sign-in may remove reset-email dependency but not membership invitation review. Default development email services are not production delivery.

**Acceptance:** Real recipient test confirms configured email path before it is advertised; failed delivery leaves recoverable invitation state.

**Owner:** Operations

**Source / assumption:** Vendor research needed; no SMTP configured

**Dependencies:** costs


#### Calendar export before calendar synchronization

ID: integration-calendar · proposed · P1

Propose simple permission-scoped .ics export for chosen meetings/deadlines with stable UID, correct timezone and date-only fields. Explain whether file import is a snapshot; no sync promises. Bidirectional Google Calendar and availability scraping are deferred until OAuth scopes, event identity/conflicts, deletion semantics, privacy, and cost have a complete design.

**Acceptance:** Import .ics fixture in a calendar; date-only work stays all-day and actual timed meeting matches Asia/Jakarta.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### WhatsApp as a communication link, not hidden automation

ID: integration-whatsapp · deferred · P2

Allow a clearly labeled group/contact link with explicit ownership/privacy. Automated WhatsApp sending, group scraping, bulk messages, and API integration are outside v1 default. Linked minutes/decisions/tasks retain organizational record context when discussion occurs outside the app. Creating a task never sends a message without a configured, authorized notification channel.

**Acceptance:** A task save has no surprise external message; external chat link exposes intended destination.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Credentials use an external password manager

ID: integration-credentials · proposed · P0

Survey includes a request for unified password/account lookup. Translate that into a safe credential-reference record: service name, custodian, restricted vault link, purpose, and access-request route. No plaintext passwords, recovery codes, bank credentials, or API tokens in searchable notes, files metadata, task comments, exports, or client bundles. Choose provider/custody separately.

**Acceptance:** Searching a service locates its permitted custodian/reference; no secret value is available through ordinary search/export.

**Owner:** Admin + security

**Source / assumption:** Survey J9 qualitative request; safe alternative proposed


#### Legal signature status and provider execution

ID: integration-signature · deferred · P2

App records review/signatory/status/evidence links. It does not perform a legally binding electronic signature in v1. A signed-provider document may be linked as evidence under access policy; record signatory identity and source without claiming verification the app has not performed. Electronic signature integration needs adopted SOP, provider terms, legal verification, audit and costs.

**Acceptance:** Status label says recorded signature/evidence, and no 'sign' action falsely implies external execution.

**Owner:** Legal lead

**Source / assumption:** Legal survey workflow; external execution out of scope


#### Financial records do not transfer money

ID: integration-payments · deferred · P2

Finance requests, allocations, approvals, paid amount/date/reference and reconciliation are records. Bank integration, online payment execution, payroll, tax filing, automated accounting, and scholarship/student payments are outside v1 default. A marked-paid request needs recorded evidence and permitted reviewer; it cannot be double-counted as a new expense.

**Acceptance:** Paid-state fixture reconciles IDR totals and audit trail; there is no implicit external transaction.

**Owner:** Finance lead

**Source / assumption:** Budget survey need; minimum first-version scope


#### No AI expense or autonomous actions in v1 default

ID: integration-ai · deferred · P2

AI generation/chat/agents are deferred. Names like Intelligence, screenshot 'handoff to agent' text, and prior videos do not require an AI backend. If added later, define data sharing, prompts, opt-out, review, cost budget, evaluation, and authority boundaries. Members can complete every core workflow without an AI dependency.

**Acceptance:** No paid AI/API key or unreviewed autonomous messaging is necessary for the launch.

**Owner:** Mahdy + product owner

**Source / assumption:** User selected DWDG'ONE; cost and screenshot-source discipline


#### Exports remain usable outside the product

ID: integration-exports · proposed · P0

CSV provides table data and readable labels; JSON retains IDs, relationships, original typed values and schema/version; Markdown/print provides human-readable reports. Attachment manifest distinguishes app-stored bytes and provider links. Restricted exports recheck permissions server-side. Exported dates/currency and file counts are documented. Link-only export cannot promise ownership or provider backup.

**Acceptance:** A permitted recipient can read a report; isolated restore can reconstruct allowed relational data; restricted fields stay absent.

**Owner:** Data owner

**Source / assumption:** User export/data-management request

**Dependencies:** data


### Data model, ownership and portability

ID: data · proposed · P0

Use one authoritative relational dataset for the organization. A task, project, person or resource is one record surfaced in multiple views, never a separate copy per division. Stable IDs, explicit relationships, trustworthy dates and bounded retention matter more than collecting many fields. Production records and disposable examples must be visibly distinct. Preserve and assess all existing local records before any future migration.

**Acceptance:** An approved entity dictionary, migration mapping, retention policy and tested export/restore journey exist before importing real data.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.


#### First-year capacity assumptions

ID: data_assumptions · open · P0

Confirmed organization scale is roughly 40 members or more. Initial proposed planning: 60 invitations/accounts, 40 monthly active, 15 concurrent, 6 divisions, 20 active projects, 5,000 tasks/year and 200 linked external resources. Native binary upload volume is zero in default free V1; native notes/folders/links are app records. Stress: 100 members/25 concurrent. Optional future binary scenario: 200 files averaging 1 MB if separately adopted. No video hosting or Drive mirroring; assumptions are editable, not measured use.

**Acceptance:** Capacity worksheet uses 60-account/15-concurrent initial planning and 100-member/25-concurrent stress scenario; actual membership remains separately confirmed around 40+.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.


#### Stable identity and revision fields

ID: data_identity · proposed · P0

Every entity uses an opaque immutable UUID, organization_id, created_at, created_by, updated_at, updated_by and revision number. Display names, division labels, emails and document numbers are editable attributes, never primary keys. Server assigns authoritative timestamps; imported unknown dates remain null with provenance. API writes compare the revision so simultaneous edits cannot silently replace each other.

**Acceptance:** Rename and move a record without breaking links; reject a stale write with a recoverable conflict.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_concurrency


#### Organization and configurable divisions

ID: data_organization · proposed · P0

Organizations contain units/divisions with stable IDs, names, ordering, parent unit, active dates and enabled capabilities. Begin with one DWDG UII organization and the six confirmed divisions; store an organization_id boundary throughout without building a public multi-tenant SaaS. Rename, merge or retire units without erasing historical assignments. Configuration changes are privileged and audited.

**Acceptance:** A division can be renamed or retired while old project ownership remains interpretable; records cannot cross organization boundaries.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Management terms and batch history

ID: data_batches · proposed · P1

A term/batch has an ID, human label, start/end dates, active/archive state and handover package. Memberships, role assignments and selected projects reference a term where appropriate; enduring resources can be organization-wide. Archiving a term makes historical operational work read-only by default while preserving report and search access according to permissions. Never reassign all old records to the new board.

**Acceptance:** Switch between two terms and preserve former owners, historical division labels and read permissions.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### People, accounts and membership are distinct

ID: data_people · proposed · P0

A person record is organizational identity; an auth account is login identity; membership states whether a person belongs to an organization/unit/term. Support a member with no login, an alumni read-only membership and account revocation without deleting authorship. Collect display name, necessary email, optional contact and role only. Student ID, birth date and private biography are not mandatory by default.

**Acceptance:** Deactivate a login without losing authorship; re-invite the same person without duplicating their organizational identity.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_offboarding


#### Time-bound role grants and delegated access

ID: data_roles · proposed · P0

Represent grants as subject, scope, role, starts_at, expires_at and granted_by. Separate organization administration, division leadership, project participation and sensitive workflow approval. A member can belong to multiple units but receives only explicit rights. Temporary delegates expire and appear in audit history. Financial approver and technical administrator are separate responsibilities even if a small team assigns both to one named person.

**Acceptance:** An expired delegation denies new sensitive actions; one scoped grant does not reveal unrelated restricted work.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Project relationship contract

ID: data_projects · proposed · P0

Projects hold title, purpose, primary unit, lead, participants, collaborating units, lifecycle, visibility, planned dates, optional budget reference and term. Tasks, milestones, blockers, decisions, meetings and resources refer to the same project ID. A project may span divisions without becoming another Workspace. Allow an explicitly undated draft; publishing into active work requires owner and sufficient scheduling information, not fabricated dates.

**Acceptance:** A cross-division task update is reflected in project, portfolio and relevant division views from one underlying row.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.


#### Task and dependency integrity

ID: data_tasks · proposed · P0

Tasks hold project ID, title, optional description, owner/assignees, status, priority, date-only due date or explicit timed event, completion timestamp, evidence links and sort order. Dependencies use typed edges with foreign keys and cycle checks. Cross-project dependencies must be deliberately supported or rejected with explanation. Deletion/archive checks references before changing downstream scheduling.

**Acceptance:** Reject self/cyclic dependencies; completing and reopening a task preserves truthful completion semantics and related links.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.


#### Meetings, minutes and decisions

ID: data_meetings · proposed · P0

Meetings store real start/end timestamps, organizer, attendees, location/meeting link, agenda and project/unit references. Minutes and decisions have author, revision, date and follow-up links. Task deadlines with only a date stay all-day; never convert them into invented meeting times. Meeting attendee removal does not erase authorship of prior minutes.

**Acceptance:** Create a meeting, save minutes, create a linked follow-up and find that task from both the meeting and project.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.


#### Resource registry and folders

ID: data_resources · proposed · P0

Default resource types are native note, internal folder, external file/app/link or collection. Uploaded-file type is reserved for separately adopted future capability, not a launch requirement. Store title/provider/canonical URL or future object ID, actual owner, project/unit context, classification and revision metadata. Folder/association joins organize one canonical resource without copying provider bytes or widening provider access.

**Acceptance:** Move or associate a resource twice without duplicating its bytes or implying that app permission grants external Drive access.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_linkfirst


#### Link-first storage policy

ID: data_linkfirst · proposed · P0

Default free V1 supports native editable notes, folders and external document/app links. Binary upload is deferred unless separately adopted. No organization Drive account currently exists; resource links show actual owner/access and succession risk, while a custodian folder plan is open. App permissions never grant provider access. Backups include app notes/metadata/relations plus external-link manifest, not external document bytes. Critical outside evidence needs its own agreed owner/archive procedure.

**Acceptance:** Members can add and locate a linked document; an inaccessible external file presents an honest repair path.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** infrastructure_accounts


#### Optional future private binary upload lifecycle

ID: data_attachment · deferred · P2

Default free V1 has native notes/folders/external links, with no mandatory native binary upload. If binary storage is later explicitly adopted, specify object key, original name, MIME, bytes, checksum, uploader/classification/scan and revision. Proposed hard limit 10 MB/file with stricter preferred size; sanitize paths and reject executables. Commit metadata/object lifecycle carefully so interrupted save creates no permanent orphan. Preserve existing legacy blobs in migration archive without silently discarding them.

**Acceptance:** Optional upload capability cannot ship until interrupted save/quota/authorization/missing-byte/deletion and recoverable backup journeys pass.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.

**Dependencies:** security_uploads


#### Revision history without file explosion

ID: data_revisions · proposed · P1

Native note revisions and metadata changes keep bounded meaningful-save history. Default free V1 external file revision is a provider link/metadata record; DWDG does not copy or restore provider bytes. If future binary upload is adopted, replacing bytes creates immutable checksummed version with author and retained-file budget. Restoring any revision records actor/reason. Do not retain every keystroke or remove evidence references silently.

**Acceptance:** Restore a previous note/file revision and retain evidence of the restoration; cost review can quantify retained bytes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Division records link into shared work

ID: data_divisionentities · proposed · P0

Finance requests/budget lines, legal requests/register entries, partner/contact interactions, content/campaign items, recruitment/onboarding records and strategy initiatives are distinct typed records. Each can refer to shared projects, tasks, resources and responsible people. Do not duplicate partner names in every project or finance states in task labels. Sensitive fields live in restricted tables/views rather than one public JSON blob.

**Acceptance:** Trace one legal-finance handoff and one partner-project handoff through linked records without duplicate data entry.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_finance


#### Amounts, currencies and financial state

ID: data_money · proposed · P0

V1 records IDR integer amounts; no floating-point currency arithmetic. Distinguish planned allocation, requested, approved, committed and paid amounts with dated actions. A recorded paid state is not a bank transaction. Collect only necessary receipt/proof metadata; do not retain bank credentials, payment card details or complete identity-document scans. Accounting/tax compliance and automated payments remain outside V1.

**Acceptance:** Finance totals reconcile from the same entries; restricted receipt contents are absent from general task search and exports.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Timezone and truthful history

ID: data_dates · proposed · P0

Organization defaults to Asia/Jakarta; store instants in UTC and date-only deadlines as dates. Distinguish planned/scheduled/completed timestamps and unknown imported values. Render with chosen English/Indonesian locale without rewriting member content. Recurrence rules specify timezone. A timestamp represents an event that happened; charts must not infer a completion day from last_updated.

**Acceptance:** Dates around midnight and local day boundaries produce correct reminders and chart counts; unknown history remains unavailable.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.


#### Server validation and transaction boundaries

ID: data_validation · proposed · P0

Client validation helps users but server constraints are authoritative. Validate required fields, enum states, relation scope, date order, amount ranges and permission on every write. Related changes such as approval + activity event or task completion + evidence link commit atomically. Repeated requests carry idempotency IDs. Error responses identify recoverable fields without revealing private record names.

**Acceptance:** A malformed, unauthorized or duplicate write never partially commits or double-counts totals.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Concurrent edit and save conflict policy

ID: data_concurrency · proposed · P0

Each update supplies the revision read by the editor. If stale, show current saved version, the user draft and field differences; allow reload, copy draft or a deliberate authorized reapply. Do not silently use last writer wins for approvals, ownership or money. Realtime refreshes must not replace active drafts, scroll or selection. Display saving, saved, offline and conflict states honestly.

**Acceptance:** Two members edit the same task and approval; one stale save yields a visible conflict and retains both intended changes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Archive, trash, Undo and hard deletion

ID: data_softdelete · proposed · P0

Archive ends active work; trash is reversible metadata/note removal; permanent purge privileged with dependency preview. Proposed trash 30 days unless adopted evidence policy longer. Undo restores ID/relations/order/completion fields if version/permission allows, with explicit conflict otherwise. Removing an external link never deletes provider bytes. Optional native file cleanup only after recovery window/reference checks once capability adopted.

**Acceptance:** Delete/Undo record or external-link metadata preserving relations/provider file; optional native-file cleanup cannot break permitted restored item.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.


#### Purpose-based retention schedule

ID: data_retention · open · P0

Proposed schedule: operational records retained through the active term plus 2 years; necessary governance/project outcomes archived longer by named owner; rejected recruitment applications purged after 90 days unless explicitly needed; trash 30 days; technical logs 30 days; audit events 1 year. These are planning defaults, not legal obligations. Confirm UII/DWDG policy and privacy requirements before real recruitment/finance data.

**Acceptance:** Publish a field-level retention table with owner, rationale and purge process; purge reports counts and exceptions.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_privacy


#### Human-readable filtered CSV export

ID: data_csv · proposed · P0

Members export only rows/fields they can read, with selected unit/term/project/date filters, timezone, generation timestamp and row count. Produce UTF-8 spreadsheet-friendly CSV, stable columns and labels for enum codes. Escape delimiters/newlines and spreadsheet formula-like values safely. IDR remains numeric with a currency column. A filtered report is labeled partial, never a backup.

**Acceptance:** Reconcile export row count to filtered UI and verify Indonesian text, multiline notes and formula-like user content in a spreadsheet.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_exports


#### Portable complete JSON export contract

ID: data_json · proposed · P0

Admin export has schema_version, app_version, organization ID, export ID, term scope, generated_at, timezone, entity counts and records keyed by stable IDs. Preserve enums, relationships, nullable dates, authorship and revision information. Exclude passwords, session tokens, SMTP keys and service secrets. Rights-aware member export remains partial. Full archive/export jobs have status and retry rather than freezing the UI.

**Acceptance:** Validate a sample export against a published schema and import it into an empty isolated workspace with referential integrity.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### External-link manifest and optional attachment scope

ID: data_manifest · proposed · P0

Default full app export contains versioned JSON, optional CSV views and resource manifest with provider URL/item ID, actual owner, classification and verification status; native note contents are included. External document bytes are explicitly excluded and remain provider-owned/access-controlled. This can be complete for app-owned records while not a document-byte archive. If optional native uploads are adopted later, add checksum/byte/path/inclusion status and actual blob copies; missing required native bytes then mark bundle incomplete.

**Acceptance:** Default record+note+link export labels external-byte exclusion clearly; optional file-enabled bundle cannot claim complete when its required blob is missing.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.

**Dependencies:** data_json
data_attachment


#### Restore is a separate privileged workflow

ID: data_restore · proposed · P0

Restore starts with format/checksum/count/relation validation and dry-run of IDs, people/account mapping and external links. Default V1 restores app-owned records/native notes/folders/link metadata; it cannot restore deleted external provider documents. Import into empty isolated destination, not silent merge/overwrite; destination archive and explicit confirmation precede commit. Reauthenticate accounts. Optional uploaded blobs require additional verified restore before that capability ships.

**Acceptance:** Restore default app bundle into isolated destination and reconcile counts/notes/relations and provider-link limitations; optional blob capability has separate round-trip gate.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_manifest
environments_sandbox


#### Existing local-store migration without erasure

ID: data_legacy · proposed · P0

Inventory existing three browser local stores and IndexedDB blobs; export all before any transform. Classify examples versus real work and map IDs/people explicitly, preserving unknown dates/owners. Default new V1 imports records/notes/link metadata only after review; existing native blobs remain in verified legacy archive until an adopted upload/move-to-provider plan covers them. No blob is silently discarded or falsely marked migrated. Repeat import is idempotent; original source remains recoverable.

**Acceptance:** A migration dry-run identifies missing owners and bytes; repeat import produces no duplicate records; original data remains recoverable.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.

**Dependencies:** data_restore


#### Data dictionary and schema ownership

ID: data_dictionary · proposed · P0

Named entities below are a relational planning baseline with field meaning, relations, constraints and access scope. Compatible low-volume records may consolidate where integrity/security remain sound; do not create one table per UI card. Shared stable identity/revision/audit fields apply universally. Proposed optional capabilities stay optional until V1 scope. Dictionary, indexes/migrations and API contract must stay aligned. Workspace Changes uses authorized server events with immutable actor and bounded redacted old/new data.

**Acceptance:** All P0 fields have documented meaning and permission; reports can explain where each measure comes from.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


##### Organization — fields and constraints

ID: entity_organization · proposed · P0

id, display_name, brand_name, default_locale, timezone, active_term_id, status. One initial DWDG UII organization; all domain entities reference organization_id. Name/brand can change without changing ID. Enforce approved timezone/locale and owner-only settings. Do not infer university legal status or institutional account control from name.

**Acceptance:** Create/rename organization and retain every existing relation; cross-organization reference is rejected.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Division/unit — fields and constraints

ID: entity_unit · proposed · P0

id, organization_id, parent_unit_id, name_en, name_id, code, sort_order, active_from, inactive_at. Codes are stable aliases, names editable; unit tree rejects self/cycles and historical assignments remain. Start with six confirmed divisions. Retire rather than cascade-delete units. Membership/capability/project joins reference ID, not translated label.

**Acceptance:** Retire/rename unit without breaking archived work; parent cycle and duplicate active code fail.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Workspace context — fields and constraints

ID: entity_workspace · proposed · P0

Workspace is organizational/division context with immutable scope identity, organization_id/unit_id, capability config and member view preferences. ADR may reuse immutable unit ID as scope ID or use explicit workspace UUID, but audit/source/destination scopes must resolve consistently after rename/retirement. It is not a project container/duplicated database. Team/reporting/access are separate. Context selection never grants permission; mapping changes preserve historical event interpretation.

**Acceptance:** Rename/retire/reconfigure a unit and retain stable Changes scope/entity links; switching context applies current server permissions.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Management term/batch — fields and constraints

ID: entity_term · proposed · P0

id, organization_id, label, starts_on, ends_on, status, predecessor_term_id, handover_resource_id. Dates are real/planned explicit values; end before start invalid. At most one selected active default term; historical terms stay readable under grants. Projects may span terms through association rather than date-based accidental reassignment.

**Acceptance:** Archive previous term and preserve historical owner memberships, totals and sources.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Person — fields and constraints

ID: entity_person · proposed · P0

id, organization_id, display_name, necessary_contact_email, avatar_resource_id optional, status. Person exists independently of login and survives departure. Email normalized for matching, not permanent primary key. Duplicate resolution is explicit; account linking never merges people solely from display name. Student ID/biography not required.

**Acceptance:** A no-login participant can own a task; authorized account link and deactivation preserve authorship.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Account-person link — fields and constraints

ID: entity_accountlink · proposed · P0

person_id, auth_provider_user_id, provider, linked_at, verified_email, revoked_at. Enforce uniqueness of active provider identity and person linkage policy. Provider tokens/passwords never enter business tables. Auth deletion preserves person and audit references. Linking/relinking is privileged identity resolution with verification; do not accept user-supplied account ID without authorization.

**Acceptance:** A login resolves one intended person; revoked link cannot retrieve private records; exports exclude session secrets.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Membership — fields and constraints

ID: entity_membership · proposed · P0

id, person_id, organization_id, unit_id optional, term_id optional, membership_state, joined_on, departed_on. Multiple active unit memberships allowed by organization rules; overlapping duplicate identical scope invalid. Membership is not equal to approval rights. Departure ends grants/sessions through offboarding while prior authored records remain.

**Acceptance:** One member participates in two units without two identities; departure report finds active grants and open obligations.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Role definition and grant — fields and constraints

ID: entity_role · proposed · P0

role_definition: id/code/label plus documented allowed actions. role_grant: person_id, scope_type/scope_id, role_id, starts_at, expires_at, granted_by. No user-editable arbitrary permission JSON that escalates role. Scope belongs to same organization; expiry evaluated server-side. App admins and technical vendor operators are distinct.

**Acceptance:** Expired or unrelated scope fails server checks; role assignment is auditable and exportable to authorized custodian.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Unit capability configuration — fields and constraints

ID: entity_capability · proposed · P0

unit_id, capability_code, enabled, config_version, changed_by. Capability names map to approved workflows such as partner pipeline or finance requests; enabling UI does not assign permission. Keep bounded configuration for V1 rather than arbitrary scripts/fields. Retiring capability retains old records with documented read-only handling.

**Acceptance:** Disable a unit capability while historical records remain accessible to authorized roles and direct endpoints enforce access.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Invitation — fields and constraints

ID: entity_invitation · proposed · P0

id, organization_id, normalized_email, intended_person_id optional, intended_scope/role, token_hash, expires_at, created_by, accepted_at, revoked_at. Store token hash rather than recoverable full invitation token. Single-use, expiry and email ownership required; no auto-admin based solely on first signup or university domain.

**Acceptance:** Repeated/expired/uninvited acceptance fails; valid Google account receives precisely approved membership.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Project — fields and constraints

ID: entity_project · proposed · P0

id, organization_id, primary_unit_id, term_id optional, title, purpose, lifecycle, lead_person_id, visibility, starts_on, target_on, archived_at, revision. Draft dates may be null; active publication requirements are explicit. Cross-unit participation uses joins and grants. Real completion date separate from target; owner can change without rewriting history.

**Acceptance:** One project appears in multiple permitted division views with shared saved status; invalid lifecycle/date transition fails.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Project collaboration and participant joins — fields and constraints

ID: entity_projectunit · proposed · P0

project_id/unit_id association with participation_role; project_person join with person_id, project_role and active interval. Unique active pair and same organization constraints. Participation is explicit, not inferred from task mention. Restricted project access may need separate approved grant; ordinary collaborator can be read-only. Revocation does not delete past authored work.

**Acceptance:** Remove collaborator and enforce access revocation while project history retains prior participation.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Task — fields and constraints

ID: entity_task · proposed · P0

id, project_id, title, description, status_code, priority_code, due_on optional, scheduled_start/end optional, completed_at nullable, completed_by, sort_key, revision. Optional adopted subtask capability adds nullable parent_task_id: same project/workspace, one nesting level for first V1, reject self/cycles, and no implicit access grant. Nesting organizes work; dependency edges describe sequencing separately. Validate date-only/timed semantics. Completion/Undo commits true event fields; unassigned drafts remain explicit. If adopted, children own canonical status/owner/date/evidence/revision; parent completion waits active noncancelled children and explicit review. Project progress counts eligible leaves to avoid parent-plus-child double counting; default flat tasks remain unchanged.

**Acceptance:** Complete/reopen/Undo reconcile truthful totals and dates. If subtasks adopted, reject other-project/workspace parent, self/cycle and second nesting level; nesting alone cannot add dependency or permission. Optional child update reflects canonical record; parent/leaf progress follows adopted rule without double counting.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Assignee joins — fields and constraints

ID: entity_assignee · proposed · P0

task_id/person_id, assignment_role, assigned_by, assigned_at, accepted_at optional, unassigned_at. Unique active task/person pair; one accountable owner may coexist with contributors if approved. Assignment cannot grant sensitive project access implicitly. Person must be eligible scope or explicit collaborator. Former assignee remains in history.

**Acceptance:** Multiple contributors do not duplicate a task; unassign/reassign updates permission-neutral work ownership.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Milestone — fields and constraints

ID: entity_milestone · proposed · P0

id, project_id, title, target_on optional, achieved_at nullable, owner_person_id, status, acceptance_note, evidence associations. Linked task join describes required versus supporting work. Completion cannot be inferred solely from target date or all tasks if explicit review is required. Unknown achieved dates stay unknown.

**Acceptance:** Milestone opens exact saved tasks/evidence; achieving records real timestamp and review author.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Dependency — fields and constraints

ID: entity_dependency · proposed · P0

id or unique composite source_type/source_id, target_type/target_id, dependency_kind, lag_days optional, created_by. Foreign keys/validated entity mapping, same organization and allowed scope. Reject self/cycles; deletion preview shows dependents. V1 can support only finish-before-start without building a scheduler; other kinds remain deferred. Cross-project edges expose only permitted titles.

**Acceptance:** Reject cyclic graph and preserve honest blocked status; unauthorized linked project name is hidden.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Blocker — fields and constraints

ID: entity_blocker · proposed · P0

id, project_id, linked_task_id optional, title, severity_code, owner_person_id, next_action, raised_at, resolved_at, resolution_note. Severity has documented meaning, not invented health score. Resolved_at requires deliberate resolution; age charts use raised timestamp only where known. A blocker can remain unresolved with no fabricated deadline.

**Acceptance:** Create/resolve blocker and link responsible action; portfolio count reconciles saved unresolved rows.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Resource — fields and constraints

ID: entity_resource · proposed · P0

id, organization_id, type_code, title, owner_person_id, classification, provider, canonical_url optional, current_note_or_link_version_id optional, archive_state. Default native note/folder/link validates type-specific fields and safe protocols; associations link permitted contexts without copying provider bytes or granting outside access. Future optional uploaded-file type adds object-version reference only after storage/security/cost/recovery gate.

**Acceptance:** Associate same resource across two contexts and preserve one authoritative metadata/version history.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Folder hierarchy — fields and constraints

ID: entity_folder · proposed · P0

resource_id or folder_id, organization_id, parent_folder_id, title, owner_person_id, classification. Reject self/cyclic nesting; folder movement preserves child IDs. Folder association does not automatically loosen each restricted child access. External Drive folder is a link resource, not an assumed complete local copy. Delete behavior previews nested references.

**Acceptance:** Move folder without breaking resource references; restricted child cannot leak through visible folder listing.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### External link/app resource — fields and constraints

ID: entity_link · proposed · P0

resource_id, url, provider_code optional, provider_item_id optional, actual_owner_label, ownership_checked_at, access_note, last_verified_at optional. Allow HTTPS approved schemes; reject script/data/executable URLs. Member-added app link is a launch point, not stored password/integration credential. Broken link status does not delete the original record.

**Acceptance:** Open safe link, repair inaccessible URL and retain actual owner/access explanation.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Note and note revision — fields and constraints

ID: entity_note · proposed · P0

resource_id, current_content, content_format, revision; note_revision has version, editor, edited_at, body/hash and restoration reason. Bounded rich-text sanitizer/plain text supported; comments separate. No realtime coauthor promise without conflict algorithm. Retain drafts by user/device policy; restricted notes excluded from broad indexing.

**Acceptance:** Two simultaneous note saves produce conflict with retained draft; earlier revision can be restored with audit.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### File object/version — fields and constraints

ID: entity_fileversion · deferred · P2

Future optional native upload schema: id, resource_id, revision, object_key, original_name, MIME, bytes, checksum, uploaded_by/at, scan_state/state. Default free V1 supports external file links, native notes and folders, so binary table/storage need not ship. If adopted, bytes immutable per version, unique sanitized key/private authorization/server limits; deletion respects retention/references and backup completeness. No deferred control appears as a working upload feature.

**Acceptance:** Download matches checksum and scope; failed replacement leaves prior working version intact.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Comment — fields and constraints

ID: entity_comment · proposed · P0

id, entity_type/entity_id or typed join, author_person_id, body, created_at, edited_at, deleted_at, parent_comment_id optional. Same organization/scope validation and sanitizer. Mentions are explicit person references with permission-aware notifications; they do not grant access. Editing keeps bounded change history; hide deleted body according to retention.

**Acceptance:** Mentioned unauthorized member gets no sensitive preview; parent/child relation cannot cross restricted scopes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Decision — fields and constraints

ID: entity_decision · proposed · P0

id, project_id optional, unit_id optional, title, rationale, decision_state, decided_by, decided_at, related_resource_id, supersedes_decision_id optional. Draft/proposed/accepted/superseded distinguish brainstorming from adopted direction. Actual organizational authority must be confirmed; saved accepted label alone is not proof of external legal authorization.

**Acceptance:** Supersede a decision without erasing rationale; linked follow-up opens corresponding task.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Meeting — fields and constraints

ID: entity_meeting · proposed · P0

id, organization_id, project_id/unit_id optional, title, organizer_person_id, starts_at, ends_at, timezone, location_or_url, agenda_note_id, minutes_note_id, state. Validate end later than start and safe meeting URL. Attendees join separately. Cancellation retains history; reminders stop. V1 does not assume Google Calendar sync.

**Acceptance:** Reschedule/cancel actual-time meeting and reflect agenda/reminders without duplicate deadline events.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Meeting attendee — fields and constraints

ID: entity_attendee · proposed · P0

meeting_id, person_id or approved external_contact_id, role, response_code, response_at. Unique participant relation and same organization scope for internal people. External participant contact privacy explicit; RSVP only where implemented, otherwise status is manually recorded. No fabricated availability/attendance inference from a meeting invitation.

**Acceptance:** Adding/removing attendee updates required access/notifications without asserting attendance occurred.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Availability/preferences — fields and constraints

ID: entity_availability · proposed · P1

person_id, weekday/time-window/timezone or dated exception, visibility, effective dates. Optional low-complexity scheduling preference, not surveillance/location or guaranteed attendance. Conflicting meetings show explicit data limitations. Time-zone/day handling matters; division members should not see private personal schedules unless user-approved. Advanced resource scheduling deferred.

**Acceptance:** Available window renders correctly and member controls visibility; no hidden performance/attendance score derived.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### In-app notification and read state — fields and constraints

ID: entity_notification · proposed · P0

id, recipient_person_id, event_type, source_entity, created_at, due_at optional, dedupe_key, read_at, dismissed_at. Generated only for recipient with current access; sanitize preview and recheck on open. Distinguish reminder from actual delivered email. Recurrence/refresh does not duplicate events; archival cancels obsolete reminders.

**Acceptance:** Reopen app and see outstanding authorized reminder once; revocation removes sensitive preview.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Activity event versus audit — fields and constraints

ID: entity_activity · proposed · P0

id, organization_id, workspace/unit scope, actor derived from verified server identity, event_type, entity reference, server occurred_at, summary_key and safe_payload. Workspace feed/Changes visibility filters scope and field access; archived/deleted resources use safe tombstone summary. Activity UI differs from privileged audit store and local-only editing history. Only actual events are recorded; unknown imported dates remain unknown. Declared chart event basis stays consistent.

**Acceptance:** Chart/feed reconcile chosen event basis and never expose private entity names through aggregate context.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Finance budget/allocation — fields and constraints

ID: entity_financebudget · proposed · P0

id, project_id optional, term_id, category_id, allocated_idr integer, approval_state, approved_by/at, notes restricted. Separate budget amendment rows or versioned changes with reason; planned allocation is not paid cash. Prevent negative amounts and undefined currencies. Public aggregate visibility is separately approved.

**Acceptance:** Amend allocation with audit and exact IDR reconciliation; unauthorized member cannot read restricted notes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Expense/funding request — fields and constraints

ID: entity_financerequest · proposed · P0

id, project_id/budget_line_id, requester_person_id, amount_idr, purpose, requested_on, review_state, evidence_resource associations. Required amount positive integer; scope/requester enforced. Requested/approved/committed/paid values are distinct. Reject duplicate idempotency; requester cannot directly write approval fields. Bank details minimal/restricted if approved at all.

**Acceptance:** Submit/edit-before-review/approve/reject record through permitted transitions and reconcile amount displays.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Approval decision — fields and constraints

ID: entity_approval · proposed · P0

id, target_type/target_id, requested_by, reviewer_person_id, decision_code, decided_at, comment, target_revision, delegation_grant_id optional. Approval binds reviewed record revision and authorized role; content changes can invalidate approval deliberately. Self-approval policy is an open SOP choice, default deny for finance. No signature/bank execution implied.

**Acceptance:** Editing approved amount forces explicit re-review policy; stale or unauthorized decision fails atomically.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Recorded payment/reconciliation — fields and constraints

ID: entity_paymentrecord · proposed · P0

id, finance_request_id, recorded_amount_idr, paid_on, recorder_person_id, evidence_resource_id, reconciliation_state. Positive amount and request total limits; partial payment policy explicit if adopted. This is a human-recorded status, not integration to a bank. Evidence access private; correction creates auditable reversal/amendment rather than deleting history.

**Acceptance:** Paid totals reflect recorded valid entries, detect over-recording and preserve correction history.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Legal document request — fields and constraints

ID: entity_legalrequest · proposed · P0

id, requesting_unit/project, requester, document_type, purpose, target_on, legal_owner, stage, revision_resource_id, signature_status_code, finance_handoff_id optional. Workflow stages/SLAs/numbering are proposed pending official SOP. No electronic signature execution. Requested revision and final version link same resource history; confidential terms restricted.

**Acceptance:** Trace request→revision→recorded signature status→finance handoff with owner and no duplicate document copy.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Document register/number reservation — fields and constraints

ID: entity_documentregister · proposed · P0

id, legal_request_id, term_id, document_type, sequence_number, display_number, issued_on, issuing_authority, state. Unique official number scope must follow confirmed SOP; provisional labels until adopted. Concurrent number reservation atomic, void numbers preserved. Do not fabricate official authority/date/signature because a document is uploaded.

**Acceptance:** Concurrent reservations avoid duplicate numbers; provisional record is visibly distinguished from officially issued document.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Partner organization — fields and constraints

ID: entity_partner · proposed · P0

id, organization_id, name, sector optional, owner_person_id, relationship_stage, last_interaction_at derived from recorded interactions, next_followup_on optional, classification. Deduping uses reviewed identity cues, not name alone. Private contact joins separate. Link partner to multiple projects; stage distribution counts exact saved state.

**Acceptance:** Merge reviewed duplicate with relation preservation; stage count/filter returns underlying permitted partners.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### External contact — fields and constraints

ID: entity_contact · proposed · P0

id, partner_id optional, display_name, role/title, necessary email/phone optional, contact_owner, permitted_use_note, classification. Collect minimum professional contact data and avoid hidden personal profiles. Link interactions; own permission/retention. Export and sharing authorized by purpose. Do not imply consent to promotional email or WhatsApp broadcast from a saved contact.

**Acceptance:** Unauthorized member export excludes private contact details; owner can correct/remove unnecessary fields.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Partner interaction/follow-up — fields and constraints

ID: entity_interaction · proposed · P0

id, partner_id/contact_id, actor_person_id, happened_at nullable, channel_code, short_note, outcome_code, next_action_task_id, evidence_resource_id optional. Planned follow-up distinct from happened interaction; unknown date remains null. Sensitive correspondence stored only if necessary/restricted. Follow-up completion does not manufacture an outreach event.

**Acceptance:** Log actual interaction and create linked follow-up; overdue view comes from real saved dates.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Marketing content/campaign — fields and constraints

ID: entity_contentitem · proposed · P0

campaign: id/title/goal/project/owner. content_item: campaign_id, channel_code, executor, planned_publish_at, actual_publish_at nullable, stage, asset_resource_ids, review_decision_id, evidence_url. Completion means recorded actual result; external publishing/engagement metrics not assumed. Deadlines and assignments refer shared work.

**Acceptance:** Approved item has named executor/assets and recorded outcome; schedule does not falsely claim publication.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### IT/service work request — fields and constraints

ID: entity_itrequest · proposed · P1

id, requesting_unit/person, title, category, impact, owner, stage, due_on, shared_task_id, evidence_resource_id, resolution_note. Used for internal website/tool/access work, not storing passwords. Access granting refers audited permission workflow; resolving ticket does not silently alter accounts. Prevent duplicate parallel task status by linking one authoritative work task.

**Acceptance:** Request→assignment→shared task→resolution can be traced and unauthorized access grant remains denied.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Recruitment application/review — fields and constraints

ID: entity_recruitment · proposed · P0

cycle: term/unit/open-close dates. application: applicant_person_id or temporary applicant ID, cycle_id, minimal answers, stage, submitted_at. review: reviewer, rubric_version, explicit assessment, decision_at. Restrict reviewer notes and purge rejected records by approved retention; public recruitment portal remains separate scoped decision. Avoid medical/demographic profiling.

**Acceptance:** Reviewer-only information stays private; applicant stage and known criteria are explicit without inferred performance score.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Onboarding/development — fields and constraints

ID: entity_onboarding · proposed · P1

id, membership_id, checklist_template_version, owner, items with completion timestamps and evidence, due_on optional, completion_state. Templates create instance IDs, preserving history when checklist changes. Development activities are explicit member opportunities, not employee scoring. Private feedback restricted if collected. Link shared tasks rather than duplicating responsibilities.

**Acceptance:** Update template without rewriting completed member history; progress equals known completed items/required items.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Strategy initiative/research — fields and constraints

ID: entity_initiative · proposed · P0

id, owner/unit, term optional, title, hypothesis/purpose, horizon Now/Next/Later, stage, decision_due_on, research_resource associations, related_project_id, dependency_edges. Horizon is deliberate prioritization, not predicted success. Evidence distinguishes planned study from findings; dependencies refer stable records. Budget/resource assumptions explicit.

**Acceptance:** Move horizon and open saved dependency/research; no unsupported organizational health or success score.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Privileged audit event — fields and constraints

ID: entity_audit · proposed · P0

id, actor_auth_id/person_id derived server-side, organization_id, source_workspace_id, destination_workspace_id optional, action_code, record_type/id, sanitized_title_snapshot, server_occurred_at, correlation_id, revision_before/after and permitted safe_diff. Delete creates tombstone evidence without requiring live record join. Cross-workspace moves identify both affected scopes but reveal only authorized title/diff. Server events immutable through app; local PRD-editor history is not production organization audit. Import/service jobs record verified service actor plus initiating authorized member; do not impersonate an end user.

**Acceptance:** Add/edit/delete/move events preserve verified actor and correct affected scopes; restricted HR/finance fields and inaccessible record titles never leak through event history.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Export job and manifest metadata — fields and constraints

ID: entity_exportjob · proposed · P0

id, requested_by, authorized_scope, export_schema_version, app_version, queued/started/completed_at, state, entity_counts, checksum, attachment inclusion/gaps, expires_at, retrieval_object_key. Queue and retry bounded/idempotent; download rights rechecked. Partial/filtered record-only export explicitly labeled. Job must fail if completeness verification fails.

**Acceptance:** Failed/incomplete bundle cannot show complete; authorized retrieval expires and count/checksum verifies.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Import/migration job — fields and constraints

ID: entity_importjob · proposed · P0

id, source_export_id/hash, dry_run_result, owner_mapping, legacy_id_mapping, destination_id/environment, proposed_actions/counts, state, applied_at, operator. Repeat source import is idempotent; default empty destination. No unreviewed overwrite/auto-owner fabrication. Audit and pre-import archive reference retained.

**Acceptance:** Dry-run exposes missing relations/people; duplicate run creates no duplicate data and applied counts reconcile.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Resource/entity association — fields and constraints

ID: entity_attachmentassociation · proposed · P0

resource_id, entity_type/entity_id or typed join, relation_kind, added_by/at. Validate same organization and permitted association; same resource may support task/project/decision. Access is explicit policy intersection rather than automatic union widening. Avoid unconstrained polymorphic IDs without referential checks. Removed association does not destroy resource bytes.

**Acceptance:** Link/unlink resource safely while remaining uses persist and restricted resource policy remains enforced.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Member view preference — fields and constraints

ID: entity_preference · proposed · P0

person_id, theme, language, reduced_motion, reduced_transparency, default_context, notification_preference, bounded saved_filter/views. Only interface labels translate; member content untouched. Preference scope per user, revision compatible across devices. Reset preferences does not reset organization records. Analytics/security settings are not member-editable preference flags.

**Acceptance:** Language/theme change preserves content/drafts; another member retains their own preference values.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.


##### Batch-scoped reporting assignment — fields and constraints

ID: entity_reportingassignment · proposed · P0

id, organization_id, term_id, child_unit_id, supervisor_unit_id or supervisor_role_grant_id, effective_from/to, created_by and revision. Exactly one active reporting parent per child/term under adopted policy; tagged supervisor relation validates same organization/term and rejects self/cycles/orphans. VP access derives from verified active role grant plus permitted reporting descendants, not title or current mutable global parent label. Close/replace assignment retains historical graph; activate batch after complete validated preview.

**Acceptance:** Two terms can have different reporting parents without rewriting old author/approval history; cycle blocks activation and VP sees only current configured descendants.

**Owner:** Organization owner + technical maintainer

**Source / assumption:** Product org_reporting_graph/access_vp_scope requirements reviewed2026-10-03; relational proposal, unimplemented.

**Dependencies:** entity_term
entity_unit
entity_role


#### Permission-aware search and aggregates

ID: data_search · proposed · P0

Search and counts apply the same server access rules as record detail. An unauthorized person must not discover restricted project titles, contact details, finance amounts or recruitment notes through autocomplete, chart totals, activity feeds or error messages. General resource search indexes metadata and approved text; credentials and private receipt contents are excluded. Search indexes honor revocation and deletion.

**Acceptance:** Attempt keyword search, aggregates and direct URL access as an unrelated member and confirm sensitive data remains absent.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_permissions


#### Organization-controlled archives and vendor exit

ID: data_exportownership · proposed · P0

Export packages belong to DWDG, stored in an approved restricted organizational archive with two custodians and encryption. Record where external documents reside and who can transfer ownership at handover. Use PostgreSQL/schema migrations, portable JSON/CSV and standard object manifests to reduce exit cost; auth and realtime integrations still require replacement work. Schedule an annual export drill.

**Acceptance:** Another maintainer can locate, decrypt and validate an archive using documented access without relying on the original developer.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_succession


#### Confirmed scale: roughly 40 members or more

ID: member-size · confirmed · P0

Initial organization scale is roughly 40 members or more, confirmed by user. Exact active users, planned growth, concurrent event peaks and alumni access are open. Size V1 for this modest workload, with a measured 100-member stress scenario to reveal brittle queries without premature enterprise infrastructure.

**Acceptance:** Capacity/cost scenarios cite confirmed starting scale separately from proposed stress load.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.


#### Audit visibility for moves, deletion and privacy

ID: data_auditscopes · proposed · P0

Server event retains original and affected workspace scope plus action/revision. The current-workspace Changes page can show an authorized move-out/deletion event even when the live record moved/vanished; unrelated workspace remains absent. Permission revocation immediately redacts inaccessible old/new values. Historical title snapshots do not bypass current sensitive classification. Privileged investigators have separate documented rights; ordinary activity search/export follows normal scope. Audit actor derives from authenticated server identity, never client field.

**Acceptance:** Move/delete/revoke scenarios preserve correct scoped history while proving inaccessible titles, private diffs and secrets remain hidden.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User Workspace Changes requirement, 2026-10-03; production data/security proposal, unimplemented.

**Dependencies:** security_permissions
security_audit


#### Bound audit growth and retain necessary history

ID: data_auditretention · proposed · P1

Record meaningful committed create/edit/delete transitions, not every keystroke/autosave draft. Retain small safe diffs, immutable IDs and revision; cap oversized text snapshots with checksum/reference and authorized retrieval if justified. Size audit separately because Changes history may outgrow task text. Proposed one-year history is an open retention choice; preserve necessary approval/legal accountability under adopted policy and purge/archive deliberately. Audit never stores credentials or entire private file bytes.

**Acceptance:** Measured audit fixture fits free DB planning budget; purge/export retain necessary authorized history and reveal no secrets.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User Workspace Changes requirement, 2026-10-03; production data/security proposal, unimplemented.

**Dependencies:** data_retention
costs_sizing


### Authentication, permissions and privacy

ID: security · proposed · P0

V1 is an internal invite-only organization product. Server enforcement is mandatory for membership, scoped work access and sensitive finance/HR information. A polished local UI does not establish real account security. Maintain least privilege, recoverable offboarding and operational traceability while keeping the number of sensitive fields small. Use managed identity rather than inventing a password system.

**Acceptance:** Real multi-user tests show allowed and denied actions across every scoped role; no security claim rests only on a hidden UI control.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed.


#### Invite-only sign-in and membership approval

ID: security_auth · open · P0

Propose Google OAuth as primary sign-in, matched to an approved invitation/person membership; an email domain alone does not authorize entry. Invitations have expiry, intended email, scope, inviter and single-use acceptance. Provide an explicit unauthorized state and request-access contact. Confirm whether all members have eligible Google/UII accounts and whether external collaborators are admitted before finalizing fallback sign-in.

**Acceptance:** An uninvited account is denied; an invited eligible account joins the intended membership exactly once; no inferred first administrator.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_bootstrap


#### Deliberate first-owner bootstrap

ID: security_bootstrap · proposed · P0

Select organization product owner and technical account owner by a documented decision, not a sample student email. First-owner setup is a one-time privileged configuration outside normal public signup; remove bootstrap privilege after use. Require two trusted named account custodians and a documented recovery method. Both must verify access before inviting the first production cohort.

**Acceptance:** Bootstrap cannot be replayed by another signup; two custodians can access required vendor accounts with individual credentials.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_succession


#### Permission matrix and deny-by-default API

ID: security_permissions · proposed · P0

Approve rows for member, unit lead, project lead, restricted collaborator, finance approver, HR reviewer, organization admin and technical maintainer. Columns cover discover/read/create/edit/assign/approve/export/archive/delete/configure. Scope by organization, unit, project and record classification; explicit grant required for restricted work. Enforce through database policies/server functions, including attachments and aggregates, rather than client-side checks alone.

**Acceptance:** Negative tests cover cross-division reads/writes, role escalation, project access revocation and restricted attachment retrieval.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed.

**Dependencies:** data_organization


#### Sensitive finance and legal access

ID: security_finance · proposed · P0

Members see only their submitted request and allowed status; finance officers and authorized approvers see amounts/evidence needed for review; broader portfolio summaries expose only approved totals. Legal materials may carry restricted classification and sharing grants. Do not make receipt images, bank account references or confidential agreement notes organization-wide. Approval cannot be performed by editing a generic task status.

**Acceptance:** A member cannot read another member receipt or approve their own request unless a deliberately documented exception exists.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_permissions
data_money


#### Minimal HR and recruitment privacy

ID: security_hr · proposed · P0

General membership directory shows necessary organizational identity. Applications, reviewer notes and personal contact detail are restricted to designated reviewers and the applicant where applicable. Avoid medical information, government ID images and free-text sensitive profiling. Stage changes are explicit decisions with a responsible reviewer; dashboards report bounded counts without identifying rejected applicants.

**Acceptance:** Ordinary members cannot discover private applicant records through search, exports, updates or direct IDs.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_permissions
data_retention


#### Privacy notice and data-use choices

ID: security_privacy · open · P0

Before collecting production member or applicant information, publish a plain-language notice: purpose, collected fields, visibility, hosting providers/region, retention, contact, correction/deletion request and relevant external links. Have DWDG/UII confirm organizational responsibility and applicable privacy requirements; this PRD does not certify legal compliance. Optional fields stay optional and analytics avoids tracking individuals beyond operational necessity.

**Acceptance:** Every real collection flow links to the approved notice; a member can request correction and understand who can read their data.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Administrator MFA and session safeguards

ID: security_mfa · proposed · P0

Require MFA for vendor dashboard custodians and privileged app roles where the chosen identity flow supports it; prefer authenticator-based MFA to paid SMS. Reauthentication protects exporting the whole organization, changing access and destructive restores. Time out especially sensitive views appropriately; clear auth/user cache on sign-out. Do not use one shared admin login or save credentials in resources.

**Acceptance:** Custodians demonstrate MFA/recovery; sign-out removes the previous user's private cached records before another login.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed.

**Dependencies:** security_device


#### Shared computers and local cache boundaries

ID: security_device · proposed · P0

Offer remember-this-device deliberately and explain its impact. Persist safe UI preferences by default; restrict caching of sensitive HR/finance content. On logout, revoked account, organization switch or session failure, stop subscriptions, clear scoped private cache and require sign-in. Offline drafts are marked device-local and may contain sensitive text; disclose and allow clearing them without erasing server data.

**Acceptance:** Switch users on one browser and confirm private records/drafts from the prior identity are inaccessible.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Secret management and public configuration

ID: security_secrets · proposed · P0

Only project URL and intentionally public publishable key may reach the web bundle. Service-role credentials, DB passwords, SMTP/API keys, backup encryption keys and deployment tokens stay in restricted secret stores/CI and never in Git, browser storage, exported PRD state or logs. Use separate environment credentials with least scope; inventory rotation owner and expiry. Rotate immediately after suspected exposure.

**Acceptance:** Inspect production bundle, repo and logs for secrets; a staging credential cannot operate on production.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed.


#### Optional binary upload security gate

ID: security_uploads · deferred · P2

Default V1 uses native notes/folders/external links; safe URL/sanitizer checks remain active. Before optional native upload ships require private object authorization, short-lived downloads, server size/type checks, sanitized paths and non-overwriting immutable IDs. Decide scanning versus restricted accepted types; never label uploaded bytes safe solely from success. Default V1 does not carry this backend/storage maintenance burden or claim private file retrieval was tested.

**Acceptance:** Enable optional uploads only after authorization, invalid paths/type/size, access revocation and complete backup/restore checks pass.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed.

**Dependencies:** security_permissions


#### Web application protection

ID: security_web · proposed · P0

Render member-entered text without executing markup/scripts; sanitize any intentional rich text. Apply restrictive security headers, sensible content-security policy, HTTPS, explicit auth redirects and safe external link handling. Privileged changes validate current membership server-side. Avoid fetching arbitrary private user URLs server-side. Dependencies and integrations get a small documented threat review focused on likely risks.

**Acceptance:** Test stored script-like content, arbitrary redirect targets, expired sessions and unauthorized requests; no execution or privilege gain occurs.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Operational audit trail

ID: security_audit · proposed · P0

Production server records immutable actor_user_id/person_id from verified session/service identity, organization_id, workspace/unit scope, action, record type/id, sanitized title snapshot, server timestamp, correlation ID and record revision. Permitted old/new field differences redact secrets and private HR/finance values. Never accept client-supplied actor authority. App privileges cannot edit events; database operators retain documented administrative power. Workspace Changes is a filtered presentation of authorized events; local editor logs are separate and explicitly device-local.

**Acceptance:** A client cannot spoof actor or edit event; Changes readers see only permitted workspace events/diffs and sensitive fields are redacted.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_retention


#### Export authorization and archive handling

ID: security_exports · proposed · P0

Apply row/field access to CSV/JSON/native notes/link manifests; optional attachment bundle only if native-upload capability adopted. Full app export is privileged, reauthenticated, logged and retrieved with expiry. External provider bytes/permissions are outside scope, and downloaded package cannot be revoked later. Use restricted encrypted archive custody; never include login sessions/vendor secrets.

**Acceptance:** Compare exports as member, lead and admin; each contains only permitted scope and every full export has an audit event.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Offboarding with retained authorship

ID: security_offboarding · proposed · P0

Departure revokes current memberships, grants, sessions and subscriptions; revoke vendor dashboard/Drive access separately. Reassign outstanding tasks, approvals, external document ownership and operational custodianship using a handover report. Preserve authored history with inactive identity. Alumni access is a new explicit read-only grant, not an accidental surviving session. Target removal within one working day of authorized offboarding request.

**Acceptance:** Former member cannot read/write after revocation; current lead can locate unassigned obligations and old authorship remains valid.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_succession


#### Permission tests are release gates

ID: security_tests · proposed · P0

Scenario matrix uses isolated real backend for unrelated/collaborating member, lead, approver, admin, expired invite and departed member. Test direct API/catalog/aggregate/record policies, not only UI visibility; validate clean install and upgrade. Default V1 resource tests are notes/folders/links. Optional native-file Storage authorization joins matrix only if adopted and must pass before shipping. P0 privacy failure blocks launch regardless of design polish.

**Acceptance:** Recorded positive/negative results cover all P0 tables/views/buckets; unresolved access leak blocks the release.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed.

**Dependencies:** environments_test


#### Vendor and hosting-region decision

ID: security_vendor · open · P0

Confirm available region closest to members, organizational approval for off-campus hosted data, provider terms and identity/document ownership. Explain that using a certified provider does not certify DWDG processes. Keep provider inventory and data locations current. If UII requires a particular region or institution-owned account, treat it as a decision input before purchase rather than moving sensitive data first.

**Acceptance:** Record approved data location/account custodian and any institutional conditions; no unsupported compliance badge is shown.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


### Implementation architecture and maintainability

ID: engineering · proposed · P0

Define a coherent implementation before restart coding. Preserve Vite and vanilla JavaScript under current instructions; select reuse/replacement based on evidence. A modular shared foundation serves all capabilities and one database/authorization contract. Avoid services whose maintenance/cost exceeds a student organization's capacity.

**Acceptance:** Architecture map connects modules/entities/UI/actions and deployment environments to this PRD without unnecessary infrastructure.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Modules with explicit responsibilities

ID: engineering-modules · proposed · P0

Proposed modules: shell/router; domain entities/validation; authorization/scoping; data repositories/transactions; locale/formatting; shared components/overlay/drafts; notifications; exports/imports; capability registry; observability. UI rendering does not contain direct privileged policy or unrelated provider credentials. Domain logic is reusable in forms, imports, server operations, and tests.

**Acceptance:** A code change to permissions/status/date/currency rules has a single authoritative implementation and relevant checks.

**Owner:** Engineering

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Configurable capability registry

ID: engineering-capability-registry · proposed · P0

Workspace configuration points to allowed capabilities and settings, not scattered checks against division display names. Each capability defines record types, nav entry, permission actions, default fields/stages, validation, charts, exports and localization keys. Current Legal & Finance can share two capabilities; a future split preserves records and changes workspace mappings rather than duplicating logic.

**Acceptance:** Rename a team and move a capability to a draft new workspace; no form/navigation hardcoded name breaks.

**Owner:** Engineering

**Source / assumption:** Flexible organization requirement

**Dependencies:** organization
divisions


#### Small, versioned data-operation contracts

ID: engineering-api · proposed · P0

Define each operation with actor, organization/workspace/resource scope, input fields/limits, allowed transition, expected version, result, error, idempotency and audit event. Reads use pagination and permitted projections; writes return authoritative saved record/revision. Authorization happens on the server/policy boundary. Client hints improve usability but cannot bypass policy.

**Acceptance:** The same allowed operation works from UI/import; rejected operation preserves draft and returns a understandable error.

**Owner:** Engineering

**Source / assumption:** Proposed API contract

**Dependencies:** data
security


#### Transactions for multi-record actions

ID: engineering-transactions · proposed · P0

Project archive/membership move/legal approval number allocation/finance approval/task creation from resource/export manifest need an explicit atomic boundary or recoverable job. A partial failure cannot leave missing links, allocated duplicate numbers, orphan files, or success UI. Server records state and retry key before side effects; cleanup status is visible when external storage cannot be atomic.

**Acceptance:** Inject failure between steps and retry; linked records reconcile and no duplicate side effect appears.

**Owner:** Engineering

**Source / assumption:** Existing backend integrity lessons; proposed production contract


#### One authoritative state, many views

ID: engineering-state · proposed · P0

Tasks/resources/projects have one stored identity and version across list, board, timeline, portfolio, reminders and capability views. Derived counts are computed from saved data with an explicit definition; no independent duplicated status fields drift. UI selection/filter/scroll are presentation state. Background refresh doesn't erase draft/selection or move keyboard focus unexpectedly.

**Acceptance:** Change status in one view; all other views reconcile to server state without duplicate task or stale finance amount.

**Owner:** Engineering

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### A shared error vocabulary

ID: engineering-errors · proposed · P0

Distinguish unauthenticated, forbidden, missing/archived, validation, stale/conflict, rate/quota, unavailable/network, file-provider denied, and internal failure. Translate user-facing recovery. Preserve entered work on recoverable failure; show retry/export/discard path appropriate to the action. Avoid generic 'Something went wrong' with no next step or logging sensitive error payloads.

**Acceptance:** Representative errors have usable messages, preserved draft and diagnostic ID/operation context without secrets.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Draft storage, save truth, and offline boundary

ID: engineering-drafts · proposed · P0

Drafts can remain local per user/device while shared records are authoritative server data. Mark unsaved/pending/conflict states clearly. Proposal v1 does not promise full offline shared writes; users may draft offline and manually retry after reconnect. Logout clears sensitive drafts according to policy. No success toast before commit; optimistic updates have explicit rollback/recovery.

**Acceptance:** Offline edit remains recoverable; reconnect save validates current permission/version; account switch exposes no other-user draft.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Schema/version and backward compatibility

ID: engineering-versioning · proposed · P0

Version entity schema, imports, exports, migrations, and app release. Older exports require validated explicit adapter, not blind JSON merging. Server and client compatibility window protects members with old tabs during deployment. Deprecate fields only after migration and rollback window. Upgrade old local stores on a copy before importing production.

**Acceptance:** Old-tab write and old export import have predictable safe outcome; incompatible schema produces a clear non-destructive error.

**Owner:** Engineering

**Source / assumption:** User update-system requirement

**Dependencies:** releases
data


#### A maintainable change process for volunteers

ID: engineering-review · proposed · P0

Changes link to requirement/bug ID and explain behavior, affected data, risk, validation and rollback. Use code review for permissions/migrations/finance/state transitions; independent review may be another competent maintainer or documented second-person review. Keep short architecture/setup/runbooks in repository. Avoid custom frameworks/libraries requiring one-person expertise.

**Acceptance:** A new student maintainer can run sandbox, understand module map, prepare a safe candidate and locate recovery guide.

**Owner:** Engineering + successor maintainer

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Dependency and update discipline

ID: engineering-dependencies · proposed · P1

Keep the dependency set small, pin reproducible versions/lockfile, review vulnerabilities/licenses, and update through sandbox/staging checks. Automated dependency PRs do not deploy without checks. Document Node/runtime versions, database extensions, auth/library versions, and supported browser baseline. Avoid runtime CDN dependencies for operational essentials.

**Acceptance:** Fresh install/build using the lockfile works; a dependency upgrade passes the committed relevant tests and rollback criteria.

**Owner:** Engineering

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Assets, bundle size, and media ownership

ID: engineering-assets · proposed · P1

Serve fonts/icons/wordmark locally where practical and licensed. Resource thumbnails are optional and bounded. No automatic full-resolution upload/download on list navigation. Large optical/shader assets are deferred if they degrade low-end phones, reduced motion, solid surfaces, or data usage. Core records stay accessible when an asset fails.

**Acceptance:** Offline/cache/asset failure preserves text/action usability; first-view payload matches performance budget.

**Owner:** Design + engineering

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Stable links and authorized navigation

ID: engineering-routing · proposed · P0

Entity URLs contain stable IDs and context, not only names. Deep links recheck active membership and record permission. Rename/move/archive redirects or explains outcome; browser Back preserves meaningful filters/scroll. A copied link is not a permission grant. A deleted resource displays an authorized recovery/related-record option without leaking inaccessible titles.

**Acceptance:** Open copied task/project/resource links in each role, after rename/move/archive/logout; each behavior is correct.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


#### Deterministic date, currency, and status rules

ID: engineering-time-tests · proposed · P0

Use testable clock/date formatting adapters; store instants in UTC plus actual timezone where required, and dates as date-only types. IDR amounts use integer rupiah (or documented smallest unit), never unbounded float calculations. Status enum definitions include allowed transitions and reviewer rules. Unknown history remains null/unavailable.

**Acceptance:** Tests exercise clock boundaries, safe integer amounts, rounding policy, invalid dates, and forbidden transitions.

**Owner:** Engineering + QA

**Source / assumption:** Chart truth and IDR contract

**Dependencies:** data


#### Metric definition lives with its source

ID: engineering-kpi-contract · proposed · P0

A metric specifies scope, units, status basis, date/window, exclusions, denominator, known-history start, missing/partial state, and detail query. It never becomes a decorative fictional organizational health score. Rollups remain accessible only within viewer scope. Completion count by current task date differs from immutable activity ledger and must be labeled.

**Acceptance:** For a fixed fixture, every visible metric reconciles to export/list records and definition across language/theme/filter.

**Owner:** Product + engineering

**Source / assumption:** Experience chart truth; survey reporting need

**Dependencies:** analytics


#### Archive, trash, purge, and undo semantics

ID: engineering-record-removal · proposed · P0

Separate reversible archive/soft delete from permanent purge. Ordinary deletion retains ID, links/history and undo ability for a defined window; parent deletion previews child/resource effects. Permanent purge requires permitted actor, retention checks, dependency resolution and explicit confirmation. Undo rechecks current permissions and concurrent changes; it can't overwrite someone else's later decision.

**Acceptance:** Delete/undo/restore/purge fixtures preserve intended relationships, and irreversible action has no misleading Undo promise.

**Owner:** Engineering + data owner

**Source / assumption:** User undo/reliable errors contract


### Recommended architecture within Rp35k target/Rp50k cap

ID: infrastructure · proposed · P0

Use static Vite/vanilla app on free Pages subdomain plus Supabase Free PostgreSQL/Auth and invited Google OAuth as a budget-fit core. Native resources default to notes/folders/external links; binary uploads deferred unless separately adopted. Allocate permitted small budget to independent encrypted archive/recovery if needed; private R2 Standard is candidate after eligibility/actual-cost checks, with custodian Drive alternative. Managed Pro cannot fit ceiling. No vendor uptime/automatic managed DB backup implied; no microservices/bespoke password auth.

**Acceptance:** An architecture decision records services, data flow, authentication boundary, costs, owner and fallback before implementation.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.

**Dependencies:** costs
security


#### Request and authorization flow

ID: infrastructure_requestpath · proposed · P0

Browser loads versioned static assets via HTTPS, authenticates with managed invited OAuth, reads policy-permitted records and commits transactional writes to bounded server operations. Default resources are native notes/folders and provider links; opening a link is external navigation with independent provider permission. Sensitive server jobs use separate secrets. Optional future file downloads need private signed authorization; UI filters never grant data access.

**Acceptance:** Diagram and tests trace one task update, one finance approval and one private download end to end.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_permissions


#### Static hosting scope and limits

ID: infrastructure_static · proposed · P0

Cloudflare Pages is suitable for the existing static app; static requests are free/unlimited under the checked policy, whereas Functions share Workers billing. Free Pages includes 500 monthly builds and 25 MiB maximum asset size. Keep member uploads out of the deploy folder. Use restrained commit previews and bundled local fonts; a hosting provider change must not alter domain data.

**Acceptance:** Build/deploy size meets current limits; frontend refresh and direct route navigation work with correct security headers.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Cloudflare Pages pricing and limits, checked 2026-10-03: https://developers.cloudflare.com/pages/functions/pricing/ ; https://developers.cloudflare.com/pages/platform/limits/ . Static assets and dynamic functions have different billing.

**Dependencies:** releases_assets


#### Managed PostgreSQL baseline

ID: infrastructure_database · proposed · P0

Use one small managed PostgreSQL instance per needed hosted environment on Free initially. Relational constraints, policy-enforced access, paginated queries and narrow scope keep cost/load modest. Database size includes indexes and accumulated history, not merely raw task text. Connection pooling applies to direct server jobs if needed. A compute upgrade follows measured pressure or reliability requirements rather than assuming 40 members require a paid plan.

**Acceptance:** Representative list and filter queries fit the agreed response target and scoped permission checks under proposed peak load.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_performance


#### Bounded realtime use

ID: infrastructure_realtime · proposed · P0

Subscribe only to the active project/work context where shared changes provide value. Close subscriptions on route change/sign-out; use debounced refresh and avoid broadcasting keystrokes or the entire record set. Realtime is a convenience; authoritative state comes from saved versioned records. V1 notes do not promise Google Docs-style simultaneous editing. Visible conflicts and refresh-on-return cover ordinary collaboration.

**Acceptance:** Route changes do not accumulate connections; another member update appears without overwriting a local draft.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_concurrency
costs_triggers


#### Few server operations with bounded execution

ID: infrastructure_functions · proposed · P1

Use server functions only where needed: privileged transactions, invitations, scheduled backup/export orchestration and optional reminders. Each job validates identity/scope, carries idempotency key, has execution timeout, retry ceiling and failure status. Routine CRUD can use policy-protected managed APIs. Do not introduce a second general backend runtime merely for a simple UI action.

**Acceptance:** An intentionally retried approval/export creates one result; timeout leaves truthful recoverable status.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_validation


#### Transactional email as a deliberate service

ID: infrastructure_email · proposed · P0

Primary login proposal is invited Google OAuth with no required auth email delivery; the administrator creates application invitations and members use an approved invitation URL in the existing authorized organizational channel. The system does not send messages to people as part of this PRD. In-app updates are default. Email recovery/invitations/magic links or alerts require verified custom SMTP and costs; bundled Supabase SMTP cannot be treated as production delivery.

**Acceptance:** Production invitation/recovery emails reach test recipients outside the vendor team; delivery failures have a documented support path.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase custom SMTP, checked 2026-10-03: https://supabase.com/docs/guides/auth/auth-smtp . Delivery must be validated separately.

**Dependencies:** costs_email
security_auth


#### Free subdomain first; organization domain deferred

ID: infrastructure_domain · proposed · P0

Confirmed: no organization domain exists. Use a stable free Pages subdomain for the first launch; choose ASCII slug separately from DWDG’ONE display branding and verify availability later. Two hosting administrators protect continuity. Configure HTTPS and exact OAuth redirects for production/staging. A purchased custom domain and branded Supabase API domain are optional later budget decisions, not launch blockers.

**Acceptance:** Record domain authorization/renewal owner; HTTPS, OAuth redirect and password-reset redirects match the production domain.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.

**Dependencies:** infrastructure_accounts


#### Pragmatic vendor lock-in boundary

ID: infrastructure_portability · proposed · P1

PostgreSQL migrations, SQL business rules, resource manifests and portable exports make the data movable. Supabase Auth identifiers, RLS helpers, realtime and Storage links are integration-specific; document adapters and person-to-account mapping rather than pretending migration is automatic. Keep URLs/config out of domain records except provider resource links. Annual restore/export drill estimates exit effort.

**Acceptance:** A portable archive can be read without vendor tooling; replacement obligations are named in the architecture decision.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_exportownership


#### Self-hosting is deferred unless ownership changes

ID: infrastructure_selfhost · deferred · P2

A cheap VPS has visible invoice savings but adds patching, DB backup verification, mail delivery, monitoring and on-call recovery for student maintainers. Do not assume a donated server is costless or reliable. V1 uses managed services unless an institution offers a supported server with named operator, backups, access and recovery duties. Compare total monthly effort and handover risk, not only rental price.

**Acceptance:** Any self-hosting proposal includes named operator, maintenance schedule, recovery drill and total-cost comparison before adoption.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Scale only after measured pressure

ID: infrastructure_scaling · proposed · P1

Optimize query scopes/indexes and attachment policy first; then increase managed compute or specific quota if measured load requires it. V1 supports future unit/term changes and modest organization growth through configuration; public multi-organization onboarding, per-tenant billing and high-volume collaboration are deferred. Avoid partitioning/sharding or separate databases per division.

**Acceptance:** A scaling decision cites latency/error/usage measurements and budget impact; a division addition requires no data copying.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** costs_triggers
data_organization


#### External integrations remain optional adapters

ID: infrastructure_integrations · deferred · P2

V1 stores useful Drive/Canva/Sheets links and opens the provider. Calendar synchronization, WhatsApp delivery, social publishing, bank connections and electronic-signature execution are deferred until permissions, credentials, cost and failure behavior are separately specified. An unavailable integration cannot block core task saves. Describe recorded signature/payment status truthfully without implying an external transaction occurred.

**Acceptance:** Every V1 integration is labeled link-only or operational; unavailable providers show repair guidance while core work remains usable.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.


#### Confirmed no domain or shared Drive exists

ID: infra-accounts · confirmed · P0

The user has no organization domain or shared Drive account. Avoid claiming either already exists or is institutionally provided. New free hosting/database/GitHub/OAuth/archive custody arrangements are proposed work. Resource links may remain individually owned until an explicit custodianship plan is approved. Free shared My Drive folder and Google Workspace Shared Drive are different ownership models.

**Acceptance:** Architecture and onboarding reference actual verified accounts only, with no assumed UII entitlements.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.


#### Create custody plan with individual access

ID: infrastructure_accounts · open · P0

Propose an organization-designated primary custodian account for archive ownership, with two named successors given individual folder/operator access and documented recovery. Avoid password sharing or a generic login used by everyone. Hosting/GitHub/Supabase should use team invitations where free plan allows. Google My Drive ownership stays with individual file creators unless deliberately transferred; folder sharing alone does not transfer every file. Account setup/transfer permissions remain unverified.

**Acceptance:** Primary/backup operators independently access test archive/vendor project; file ownership and handover steps are documented.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Google storage and shared-drive ownership, checked 2026-10-03: https://support.google.com/googleone/answer/9004014 ; https://support.google.com/a/users/answer/7212025 . Actual UII entitlement unverified.


#### UII education entitlement is unknown

ID: infrastructure_entitlement · open · P1

Do not assume UII email grants Shared Drives, expanded storage, SMTP, subdomain, SAML SSO or server resources. A named organizational contact may check the actual entitlement and allowed use later. First plan remains functional on ordinary eligible Google accounts and free hosting. If institutional resources exist, confirm access/ownership/retention and whether graduation revokes them before migrating data.

**Acceptance:** Any institutional dependency has evidence of entitlement/terms and a successor access plan.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Google storage and shared-drive ownership, checked 2026-10-03: https://support.google.com/googleone/answer/9004014 ; https://support.google.com/a/users/answer/7212025 . Actual UII entitlement unverified.


#### Cloudflare D1 alternative: lower cash, more responsibility

ID: infrastructure_d1alternative · deferred · P2

Workers+D1 can be a free-cost alternative with checked 5 million rows read/day, 100,000 written/day and 5 GB total account storage. It requires server API, Google OAuth/session handling, authorization, file access and migration work rather than reusing managed Supabase identity/RLS directly. Free limits can stop queries and index writes count toward usage. Evaluate only if pause/reliability tradeoff makes Supabase unsuitable; do not build bespoke password auth or claim D1 itself supplies the complete product backend.

**Acceptance:** Alternative ADR covers identity/session security, permissions, recovery, workload and operator effort before replacing baseline.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Cloudflare D1 pricing, checked 2026-10-03: https://developers.cloudflare.com/d1/platform/pricing/ . Backend/auth engineering is a DWDG cost assumption.


### Monthly operating budget and cost controls

ID: costs · confirmed · P0

Latest confirmed budget is target Rp35,000/month where feasible and hard ceiling Rp50,000/month; the earlier near-Rp0 preference is superseded. Do not spend merely to reach target. Keep free core services when viable, with a small deliberate budget for independent recovery/storage and contingency. Ceiling includes recurring invoices, annual charges amortized monthly, tax, payment/card fees and email/backup/domain if used. Exact quotes/eligibility remain Open. USD examples use editable Rp16,500/USD planning assumption, not live FX. Nothing purchased/provisioned.

**Acceptance:** Actual all-in estimate fits Rp35,000 target or has explicit justified variance within Rp50,000 hard ceiling; no add-on auto-spending.

**Owner:** Treasurer + organization owner + technical maintainer

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.


#### Worked workload and storage estimate

ID: costs_sizing · proposed · P0

For proposed 60-account/15-concurrent envelope, 5,000 tasks at illustrative 2 KB ≈10 MB raw task text; relations/comments/indexes/audit/note versions add overhead. Proposed DB target 200 MB is measured against actual seed/schema. Default free V1 has 0 native-upload bytes and 200 linked resources; external file bytes do not consume app file-storage quota. At 20 MB compressed record export, 30 copies transfer ≈600 MB/month before ordinary traffic. Future optional 200 files ×1 MB =200 MB/year is separate scenario.

**Acceptance:** Measure representative seeded schema size and attachment distribution; replace estimates after first pilot month.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_assumptions


#### Supabase Pro is outside current budget

ID: costs_managed · deferred · P2

Checked Pro base is approximately $25/month for subscription plus one Micro after credit; at planning Rp16,500/USD≈ Rp412,500 before tax/fees. This exceeds Rp50,000 hard cap and is not an approved launch option. Managed daily DB backups/larger quotas would need changed funding or institutional entitlement, both unconfirmed. It still does not independently retain external documents or optional native file bytes. Keep price as scale/reliability tradeoff information only.

**Acceptance:** Recheck chosen plan/compute and actual invoice preview; architecture stays within budget at measured pilot usage.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing, checked 2026-10-03: https://supabase.com/pricing . USD published quotas; recheck account allowances and billing before launch.

**Dependencies:** infrastructure


#### Continuous paid staging also exceeds ceiling

ID: costs_twoprojects · deferred · P2

Two continuously running paid Micro projects have checked illustrative base $35/month; at planning Rp16,500/USD≈ Rp577,500 before tax/fees, well aboveRp50,000 cap. Paid hourly restore/staging can also create unapproved bill. Use allowed isolated free project/local disposable test under current budget. Retain this paid price as explicitly excluded alternative, not a default or hidden prerequisite.

**Acceptance:** Budget distinguishes one-production-project and production-plus-staging scenarios; no accidental unused project remains billable.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase billing FAQ, checked 2026-10-03: https://supabase.com/docs/guides/platform/billing-faq . Compute is project-specific and hourly.

**Dependencies:** environments_staging


#### Budget-fit first launch with free core

ID: costs_prototype · proposed · P0

Pages+Supabase Free is proposed core within Rp35,000 target/Rp50,000 ceiling, with native notes/folders/links and 0 mandatory binary uploads. Actual independent archive may incur small approved cost. Requires measured queries/transfer, record-note-link export/restore, invited membership, two custodians and pause/restriction handling. External document bytes remain provider-owned; critical evidence needs separate continuity. No assumption every dependency is forever free or Pro is affordable.

**Acceptance:** Pilot participants see prototype status; exports/restore and quota tracking are exercised before real dependence develops.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing/backups, checked 2026-10-03: https://supabase.com/pricing ; https://supabase.com/docs/guides/platform/backups . Default DWDG file policy proposed.


#### Worked budget A: free core with small archive cost

ID: costs_monthlyA · proposed · P0

Illustrative core: Pages static/subdomain $0 + Supabase Free $0 + invited OAuth $0 mandatory email. Candidate R2 Standard 20 GB-month total, within operation allowances:10 GB free + 10×$0.015=$0.15≈ Rp2,475 at assumed Rp16,500/USD. Add Rp2,000 placeholder tax/card/payment allowance→Rp4,475; optional Rp10,000 contingency reserve→Rp14,475 planned envelope, below Rp35,000 target andRp50,000 ceiling. Actual R2 eligibility/minimum transaction/rounding/tax fees unconfirmed; existing usable free archive may lower cash to Rp0. Reserve is unspent availability, not an invoice.

**Acceptance:** Replace placeholders with actual account billing before selection; all-in monthly amount including reserve is within target/cap.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** costs_backup
costs_freeactions
infrastructure_accounts


#### Worked budget B: domain is optional; Pro exceeds ceiling

ID: costs_monthlyB · proposed · P0

No domain is needed. Illustrative unquoted annual domain allowance Rp180,000/year amortizesRp15,000/month; adding exampleRp4,475 archive/fees andRp10,000 reserve givesRp29,475 planning envelope, underRp35,000 target. AnnualRp180,000 cash upfront is separate and requires approval/actual registrar initial-renewal-tax quote; this is not a purchase recommendation or quote. Supabase Pro $25≈ Rp412,500/month at planning FX, far aboveRp50,000 cap; paid staging/SMTP also cannot be silently adopted. Stay free-core or choose another verified within-cap service.

**Acceptance:** Domain remains deferred unless monthly total/annual upfront explicitly approved; Pro is excluded by current hard ceiling.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** costs_domain
costs_managed
costs_backup


#### Email quota and onboarding burst costs

ID: costs_email · proposed · P1

Google OAuth plus in-app updates has no mandatory SMTP invoice. Optional Resend Free has checked 3,000/month and 100/day; eligibility/domain verification/delivery/Auth limits need test. Its listed $20 Pro is≈ Rp330,000 at planning FX before fees, outside cap. Do not introduce paid email as hidden dependency or promise free delivery. If production email necessary, research verified sender/provider all-in cost within Rp35,000 target/Rp50,000 cap before adoption.

**Acceptance:** A launch email simulation fits both provider daily quota and Auth rate limit; recovery emails are not starved by bulk reminders.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Resend transactional pricing, checked 2026-10-03: https://resend.com/pricing . Recheck quota and SMTP eligibility before selecting.


#### Optional domain must fit monthly ceiling and upfront approval

ID: costs_domain · deferred · P2

No domain exists; stable free Pages subdomain is default. A future domain requires exact initial/renewal/tax quote and custodian. Monthly amortization counts againstRp35,000 target/Rp50,000 hard ceiling; annual upfront payment is a separate explicit cash decision. No TLD/domain/yearly price adopted and UII subdomain entitlement unverified. Do not purchase only to spend budget.

**Acceptance:** Record exact first-year/renewal quote and approval; domain lives under institutional/organizational custody.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.

**Dependencies:** infrastructure_domain


#### Prioritize small-budget independent backup storage

ID: costs_backup · proposed · P0

TargetRp35,000/hard cap Rp50,000 allows a deliberate small independent-archive budget if needed. Candidate private R2 Standard provides standard object credentials suited to restricted CI; current allowances/rates suggest small archive cost, but account eligibility/payment setup/rounding/tax/card fees and spend controls remain Open. Alternative: newly arranged restricted custodian Drive folder, measuring available shared 15 GB quota and verifying OAuth lifetime/ownership. Neither account exists by assumption; no payment or automation provisioned.

**Acceptance:** Select offsite destination and estimate retained generations plus transfer/operation usage; verify credentials and restore access.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision 2026-10-03; R2 pricing checked 2026-10-03:https://developers.cloudflare.com/r2/pricing/ ; Google standard storage:https://support.google.com/googleone/answer/9004014 . Actual account costs/eligibility unconfirmed.

**Dependencies:** infrastructure_accounts
costs_freeactions


#### Optional upload quota guardrails

ID: costs_storage · deferred · P2

Default free V1 native-upload volume is 0; linked documents/native note text live under separate provider/DB budgets. If uploads later adopted, propose 5 MB preferred/10 MB hard file ceiling and 500 MB app total including current+retained revisions, below provider quota. Warn/review/restrict nonessential uploads at 70/85/95% app budget while preserving reads/export. Do not treat provider 1 GB allowance as unlimited evidence archive. Cleanup respects retention/relations.

**Acceptance:** Usage panel reconciles bytes and versions; an oversize file is rejected with link-based alternative and no data loss.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_attachment


#### Measured cost triggers and response

ID: costs_triggers · proposed · P0

Review monthly: registered/active users, DB disk, optional uploaded bytes/revisions if adopted (zero default), egress, realtime peak/messages, function invocations, email daily/monthly volume, preview builds and backup bytes. Proposed escalation: sustained 70% included quota, any unexpected paid line, DB p95 latency >1 s, backup failure or month estimate above approved ceiling. Response is diagnose query/file abuse first, then conscious plan/quota change; do not automatically raise spend.

**Acceptance:** Every trigger has named owner and documented response; pilot dashboard uses actual vendor readings and agreed alert thresholds.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Spend caps do not cap the whole bill

ID: costs_spendcap · proposed · P0

Leave supported Supabase Pro spend cap on initially and understand that exceeding covered quotas may restrict service. Compute, branching, replicas, backend custom domains and provisioned disk performance are excluded from that cap. Other vendors have separate billing controls. Only billing owner may approve paid add-ons or additional environments; usage alerts are not a universal hard stop.

**Acceptance:** Review covered/excluded items with treasurer; attempted new paid service requires an explicit recorded budget decision.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase cost control, checked 2026-10-03: https://supabase.com/docs/guides/platform/cost-control . Not every charge is capped.

**Dependencies:** costs_owner


#### Avoid unnecessary paid extras in V1

ID: costs_optional · proposed · P1

Exclude paid Supabase Pro/PITR/API custom domain, SMS MFA, log drains, analytics/search SaaS and managed queues under current cap unless later quoted within new approved conditions. Checked Workers Paid minimum $5≈ Rp82,500 at planning FX also exceeds Rp50,000 hard maximum before fees; static frontend requires none. Budget-fit archive is more valuable than decorative add-ons. Tight quota/recovery need triggers explicit alternative within cap or a new funding decision, never hidden upgrade.

**Acceptance:** Architecture inventory contains no unapproved paid add-on; each future addition has purpose, owner and price impact.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Cloudflare Workers pricing, checked 2026-10-03: https://developers.cloudflare.com/workers/platform/pricing/ . Optional service, not required baseline.


#### Billing owner, funding and cost review

ID: costs_owner · open · P0

Name Mahdy/approved product custodian, secondary operator and budget authority; actual billing identity/payment method still Open. Free dependencies need custody; any paid archive/domain requires deliberate reviewed quote, target Rp35,000 and hardRp50,000 all-in monthly total. Track annual upfront separately and confirm funding before commitment. Never use a graduating developer sole personal card/account. Monthly usage/invoice and quarterly free-tier review remain necessary. No payment is attached/provisioned here.

**Acceptance:** Two named custodians own/account for every dependency; optional payment authority is documented separately.

**Owner:** Treasurer + organization owner

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Confirmed target Rp35,000/month; hard ceiling Rp50,000

ID: costs-budget · confirmed · P0

User latest decision: aim around Rp35,000/month if possible; maximum Rp50,000/month. This replaces earlier preference for near-zero cash. Free services remain sensible; there is no minimum spend. Budget must include all vendor recurring costs, amortized annual charges, tax/card/payment fees and optional SMTP/archive/monitoring. Exceeding target needs a concrete explained need; exceeding ceiling is not permitted without new user instruction. No services paid/provisioned here.

**Acceptance:** Every selected dependency has actual cost/eligibility check and total remains within target/maximum.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.


#### Free project slots and environment allocation

ID: costs_freeprojects · proposed · P0

Supabase Free checked allowance is two active projects for the applicable account constraints; confirm actual organization/account limits before setup. Allocate production one slot and isolated hosted staging/training one slot if available. Use local tests for branch work. Additional sandbox environment is not created just because frontend previews are free. Account limits, pauses and restore destination may require controlled scheduling or optional paid project.

**Acceptance:** Environment inventory fits actual verified free project allowance and offers isolated restore destination without touching production.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing, checked 2026-10-03: https://supabase.com/pricing . USD published quotas; recheck account allowances and billing before launch.


#### Free CI and backup scheduling estimate

ID: costs_freeactions · proposed · P0

GitHub Free private repositories have checked allowance of 2,000 standard-runner minutes/month and 500 MB artifact storage, shared by owner account allowances. Illustrative 30 nightly backup runs ×5 minutes =150 minutes; 50 verification runs ×6 minutes =300, total450 before retries/other repos. Use Linux small jobs, no plaintext backup artifacts/cache or commits. Stop paid overage and monitor allowance; free quota is not exclusively reserved for DWDG.

**Acceptance:** Measure actual CI/backup run durations and owner monthly allowance; confidential records are absent from repository/artifacts/logs.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** GitHub Actions billing/scheduling, checked 2026-10-03: https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule . DWDG automation not created.


#### Backups and repeated files consume free egress

ID: costs_freeegress · proposed · P0

Default V1 egress includes permitted record queries/native notes and independent records export, with external link opening charged by provider policy rather than app file delivery. Repeated full-table fetches can still exhaust quota. If binary uploads later adopted, user downloads/preview and blob copies add transfer; use verified incremental retention and manifests. Track actual aggregate egress with 70/85/95% alerts and never silently skip recovery-critical records/files.

**Acceptance:** Pilot vendor transfer readings reconcile expected downloads/exports; backup choice fits quota without silently skipping necessary files.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** costs_triggers
reliability_backup


### Production, sandbox, staging and test separation

ID: environments · proposed · P0

Define environments before building the real service: local development, automated test, editable demo sandbox, hosted staging and production. Their data/credentials/URLs/notification destinations are separate. Production contains real organizational records; synthetic examples live elsewhere. A resettable sandbox is part of product training, never an alternate route that secretly writes into production.

**Acceptance:** Environment matrix lists URLs, dataset, auth provider, secrets, reset rights, owner and monthly cost.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase environments guide, checked 2026-10-03: https://supabase.com/docs/guides/deployment/managing-environments . DWDG environment policy proposed.


#### Local development is disposable

ID: environments_dev · proposed · P0

Develop through Vite and local managed-service tooling where practical; use a synthetic fixture dataset and local auth/email substitutes. Developers can reset their own local database. Production database URLs and service keys are absent from ordinary development configuration. Document setup and minimum runtime versions so successors can reproduce the project without guessing.

**Acceptance:** A new maintainer boots local development from documented steps and cannot accidentally reach production.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase environments guide, checked 2026-10-03: https://supabase.com/docs/guides/deployment/managing-environments . DWDG environment policy proposed.


#### Automated tests use clean isolated data

ID: environments_test · proposed · P0

CI builds from lockfile, runs meaningful domain/transaction/permission tests against disposable schema and validates migrations from zero plus upgrade. No real student data or live email recipient appears in fixtures. Tests have predictable dates/IDs and remove only their own environment. Test reliability is recorded; retries do not conceal a failing permission or data-loss case.

**Acceptance:** Two independent runs produce equivalent results and never write to production or send real member notifications.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Member training sandbox

ID: environments_sandbox · proposed · P0

Sandbox displays a persistent Sandbox badge, distinct URL/theme accent and demo-data notice. Members may explore all agreed training flows using fictional people and documents; emails/external transactions are suppressed. Provide reset/export only for sandbox. Switching to production changes both auth/session context and data endpoint; do not implement sandbox as a client flag over real tables.

**Acceptance:** Perform training creation/deletion/reset and verify no production entity, file or notification changes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_secrets


#### Hosted staging mirrors integrations

ID: environments_staging · proposed · P0

Near-zero plan uses an isolated hosted test project when the account's free allowance permits it; local disposable development/CI handles routine work. Staging has production-like schema/redirects/storage policies with synthetic accounts and independent keys. A second free project may fill active-project allowance; sandbox should reuse staging as an explicitly synthetic environment or stay local if needed, never share production tables. Temporary paid staging is optional funded alternative. Do not claim external integration tested solely from mocks.

**Acceptance:** Release evidence includes actual Auth/RLS/Storage/concurrency checks on isolated hosted staging and total environment cost.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase environments guide, checked 2026-10-03: https://supabase.com/docs/guides/deployment/managing-environments . DWDG environment policy proposed.

**Dependencies:** costs_freeprojects
security_tests


#### Production writes and destructive operations

ID: environments_production · proposed · P0

Production is invite-only, backed up, monitored and changed by release procedure. Ordinary members never see seed/reset controls. Bulk imports, permission changes, archive purges and restore require scoped authorization, dry-run/count previews and audit. Backups precede destructive schema/data changes. Add a server-side maintenance/read-only switch for incidents so frontend deployment alone does not control write safety.

**Acceptance:** No public reset endpoint exists; maintenance mode blocks writes consistently across existing browser tabs.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_maintenance


#### Per-environment secret inventory

ID: environments_secrets · proposed · P0

Maintain independent project references, auth client configuration, sender credentials, bucket names, export destinations and CI tokens per environment. Preview builds use staging keys only. Secrets are injected securely at build/runtime; public config identifies intended environment. Restrict CI production credentials to protected release jobs and require deliberate production target. Rotate on handover or compromise.

**Acceptance:** Inspect preview and production builds; a test account/token cannot access production and each credential has named rotation owner.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_secrets


#### Test email and external side-effect suppression

ID: environments_email · proposed · P0

Local/test/sandbox mail routes to a sink or explicit allowlist; staging uses test recipients and clear subject prefix. No real WhatsApp/social publishing/bank/signature execution is enabled in any example environment. Fixture external links must not accidentally expose private real folders. An environment mismatch fails closed before dispatch. Production email has a separate verified sender decision.

**Acceptance:** Attempt a sandbox invitation to a real member address and confirm it is blocked or captured by the sink.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** infrastructure_email


#### Representative synthetic data

ID: environments_fixture · proposed · P0

Fixtures cover six divisions, cross-unit project, long EN/ID labels, missing dates, empty tasks, restricted work, archived terms, broken provider link and finance amount boundaries. Default has no native binary upload; optional file capability adds failed-upload/missing-blob fixture only if enabled. Fictional people/documents only; training does not copy real applicant/partner/payment details.

**Acceptance:** Design/interaction QA can test difficult states reproducibly without personal production records.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.


#### Production data never copied casually

ID: environments_copy · proposed · P0

Default policy forbids production exports in developer laptops or preview environments. Debug with synthetic reproduction and redacted technical diagnostics. If a production subset is strictly necessary, require named authorization, field minimization/anonymization, restricted destination, expiry and deletion evidence; private finance/HR attachments are excluded. A restore drill uses an approved isolated restricted destination, not a public sandbox.

**Acceptance:** Document debug/restore dataset handling; staging fixtures contain no real personal identifiers.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_privacy
security_exports


#### Sandbox reset and production recovery differ

ID: environments_reset · proposed · P0

Sandbox reset removes only tagged synthetic environment data then reinstalls a versioned fixture set; it never shares auth/storage namespaces with production. Production restoration is a disaster-recovery operation with backup choice, loss estimate, downtime and verification. Use distinct wording and permissions. Avoid a general Reset all button whose meaning depends on a hidden configuration flag.

**Acceptance:** Reset tests prove project/reference isolation; production UI provides no sandbox reset path.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_manifest


#### Environment lifetime and costs

ID: environments_cost · proposed · P1

Inventory production, staging/sandbox and previews with owner/lifetime. Free account active-project limits are part of the design; do not create unlimited hosted branch databases. Use local isolated schemas/tests for routine branches. A continuous paid staging is optional. Before deleting a test/restore destination ensure evidence and independent archive are safe; never delete production to free a project slot.

**Acceptance:** Monthly review finds all hosted projects/previews with owner and purpose; idle paid environments are deliberately handled.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing, checked 2026-10-03: https://supabase.com/pricing . USD published quotas; recheck account allowances and billing before launch.


### Controlled updates, migrations and rollback

ID: releases · proposed · P0

Each production change has version, scope, migration impact, validation, deployment record and recovery path. Update the product through source control and small releases; do not edit live code/database ad hoc. V1 can remain vanilla/Vite. Product polish includes safe updates and understandable release communication as much as visual finishing.

**Acceptance:** Another maintainer can ship or roll back a rehearsed release using a written runbook.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** environments
reliability


#### Version and compatibility information

ID: releases_version · proposed · P0

Assign semantic app versions and monotonically ordered schema migration IDs; embed commit/build ID and required schema compatibility range. Export schema versions are independent and documented. Settings/support displays app/environment version for diagnosis. Breaking business behavior or data shape gets migration notes, not just a visual patch label.

**Acceptance:** A bug report can identify exact deployed build and schema; incompatible client blocks unsafe writes with update guidance.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Protected source and small changes

ID: releases_branch · proposed · P1

Use a protected main branch, reviewed pull requests and tagged release commits. A small student team can let one builder and one reviewer cover critical permission/migration changes; do not require a large bureaucracy. CI has least-scoped credentials and pins dependency lockfile. Experimental UI work stays in branches/previews until tested.

**Acceptance:** A permission/schema change has reviewer and passed checks; production artifact is traceable to a tag/commit.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Meaningful pre-release checks

ID: releases_checks · proposed · P0

Run build/startup, domain validation, transactions/idempotency/concurrency, direct permission denials, migration upgrade and default record/native-note/link export-restore. If optional native uploads explicitly adopted, add actual Storage authorization and file recovery gates before shipping. Inspect affected UI journeys and settled desktop/mobile, themes/languages, keyboard/reduced-motion/long labels. Historical local counts do not prove current live security or rendering.

**Acceptance:** Release evidence links exact build, executed checks and remaining risks; failing P0 check stops rollout.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.

**Dependencies:** security_tests


#### Expand-contract schema migrations

ID: releases_migrations · proposed · P0

Expand with nullable/additive columns or new tables and compatible policies first; deploy clients that understand old/new data; backfill in bounded validated batches; switch reads; only later contract obsolete fields after old clients and exports are supported. Renames/removals cannot ship as destructive surprise. Each migration has estimated lock duration, row counts, constraints and rollback/forward-fix plan.

**Acceptance:** Old supported client continues safely after expansion; upgraded records preserve values; contract migration has recorded compatibility evidence.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_dictionary
releases_oldclients


#### Pre-migration backup and dry-run

ID: releases_premigration · proposed · P0

Before risky production migration produce verified recoverable app-owned DB/native-note/link export; optional native blob capability adds separate complete-file manifest/copy. Rehearse isolated staging, confirm schema/counts and lock duration/maintenance needs. Logical export is portable when vendor physical backup is not. Provider-link bytes are outside app restore unless separately archived by owner; database rollback cannot undo external messages or file changes.

**Acceptance:** Migration rehearsal and backup manifest exist; maintainer can estimate potential data loss and restore destination.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_backup
reliability_restore


#### Deployment order and post-deploy smoke

ID: releases_deploy · proposed · P0

Sequence compatible schema expansion, backend functions/policies, then immutable frontend assets; recheck login, permission boundaries, one real test record save, resource retrieval and background job health after deployment. Use synthetic designated production test records that can be safely cleaned. Observe error/latency/usage after a small member cohort before broader invitation. Name release owner and support contact.

**Acceptance:** Post-deploy smoke checks pass and recorded monitoring window shows no new P0 error before expanding cohort.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** releases_migrations
launch_pilot


#### Frontend rollback versus data recovery

ID: releases_rollback · proposed · P0

Retain previous immutable frontend artifact and working config so hosting can restore it quickly. Rollback is safe only if schema/functions remain compatible. For data transformations, prefer validated forward fix; a database restore can lose later writes and requires deliberate recovery process. Document decision threshold: auth failure/data leakage/write corruption is immediate stop; isolated cosmetic issues may use a follow-up patch.

**Acceptance:** Rehearse frontend rollback on staging; confirm old client compatibility and separately rehearse data recovery.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** releases_migrations
reliability_restore


#### Small feature flags and kill switches

ID: releases_flags · proposed · P1

Use a minimal server-controlled capability/flag list for risky new workflows and background jobs, scoped by environment/cohort. Core access rules never depend solely on frontend flags. Maintain owner, default, expiry/removal date and fallback. Turn off an integration or new approval flow without losing records; avoid a large flag platform for V1.

**Acceptance:** Disable a staged feature and optional job, verify core work remains intact and unauthorized endpoints remain protected.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Cache-safe assets and update experience

ID: releases_assets · proposed · P0

Build content-hashed assets with a short-lived app shell; do not serve a mixed bundle of two releases. The app can notice a newer compatible version and offer reload after draft save/copy. Service worker/offline caching is optional and deferred until update/revocation behavior is verified. Never force an immediate refresh that destroys a long note draft or approval review.

**Acceptance:** An older open tab sees safe update guidance; reload preserves saved work and intentionally retained draft.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_concurrency
releases_oldclients


#### Old tab and schema compatibility policy

ID: releases_oldclients · proposed · P1

Supported client window proposed: current and previous minor version during rollout. Clients include build/schema expectation; server rejects unsafe writes from incompatible old versions with actionable update message. Important role revocation applies immediately even to old tabs. Define how draft recovery works across changed forms, and avoid storing only a DOM-specific representation.

**Acceptance:** Keep an old tab open during staged migration; reads/writes behave safely and saved draft can be recovered after update.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_offboarding


#### Dependency and platform updates

ID: releases_dependencies · proposed · P1

Review dependency/security notices monthly and vendor deprecations quarterly. Patch urgent exploitable issues through affected checks; update runtime/build dependencies in a separate reviewable change where possible. Pin versions/lockfile, record compatibility and ensure a successor can rebuild. Do not add packages merely for decorative UI that existing components can provide.

**Acceptance:** Release record includes dependency changes and affected verification; clean checkout reproduces the artifact.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Member-facing changelog and communication

ID: releases_changelog · proposed · P1

Publish short plain-language release notes inside the app: what changed, action needed, known issue and effective date. Explain workflow/field changes and downtime ahead of planned maintenance using the approved internal communication channel. Do not promise a feature merely because planning node says proposed. Existing user content remains intact during branding/navigation updates.

**Acceptance:** A member can find release/version details and understand whether an update affects their work.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Handover release rehearsal

ID: releases_rehearsal · proposed · P0

Before original maintainer leaves, successor performs one staging release, permission verification, export, restore and frontend rollback using only runbook and their own credentials. Record unexpected gaps and repair instructions. Success is demonstrated execution, not possession of a repository ZIP. Keep ownership of Git/vendor/domain/SMTP accounts transferable.

**Acceptance:** Named successor completes rehearsed release/recovery and the departing maintainer is no longer the only operator.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_runbook
launch_ownership


### Backup, recovery, incidents and daily operations

ID: reliability · proposed · P0

Budget-fit free core has no guaranteed vendor uptime or managed DB backups. Propose independent daily encrypted record/native-note/link export, two custodians and freshness/recovery checks; future optional binary files add separate copies. A small-budget private object archive is candidate within 35k target/50k maximum. Target≤24 h lost acknowledged work/≤8 staffed working h recovery only after drill proves it. Pause/weekends/missed jobs require honest boundary and owner/budget decision, not unsupported guarantee.

**Acceptance:** Measured restore and latest backup age substantiate the chosen recovery target; unverified automation/availability gaps remain launch blockers.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** costs
launch_gate


#### Layered database and file backups

ID: reliability_backup · proposed · P0

On Free default V1, independently encrypt/export all app-owned relational records, native notes/folders and external-link manifest. External provider document bytes are excluded and cannot be restored by this backup; each critical resource needs separate provider owner/archive plan. Target daily generations with 7 daily+4 weekly+3 monthly, adjusted for privacy/size. Automation is proposed/unbuilt; until verified named custodian makes daily encrypted export. If native uploads later adopted, separate blob/checksum copy becomes required before shipping.

**Acceptance:** Default app bundle freshness/count/note/relations restore is verified with external-byte exclusion; optional blob-enabled capability adds separate complete-file gate.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase backups, checked 2026-10-03: https://supabase.com/docs/guides/platform/backups . Free needs independent exports; Storage bytes need separate copies.

**Dependencies:** data_manifest
costs_backup
reliability_backupautomation


#### RPO/RTO definitions and owner acceptance

ID: reliability_rporTo · open · P0

RPO is maximum accepted missing saved work after restoration; RTO is elapsed staffed recovery time after incident recognition. Proposed daily-backup design targets RPO ≤24 h and RTO ≤8 working h for the small dataset. Weekend/semester availability must be explicit. If finance/legal decisions cannot tolerate one day loss, increase recovery frequency/funding and re-test rather than relabeling existing backups as sufficient.

**Acceptance:** Organization owner accepts goals and staffing window; recovery drill records actual measured values and exceptions.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_restore


#### Restore drill before launch and quarterly

ID: reliability_restore · proposed · P0

Before launch restore independent record/note/link generation into restricted isolated destination, recreate secrets separately and map persons/auth accounts without importing sessions. Verify counts/relations/permissions/native note contents and login/task/approval journeys; external documents remain external with clear un-restored byte scope. Record achieved recovery duration/loss and repeat quarterly/handover. Free vendor restore is not assumed. Optional direct-file capability has separate checksum/retrieval recovery gate.

**Acceptance:** Written drill names backup, destination, duration, lost interval, verification results and gaps; one custodian independently repeats key steps.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase backups, checked 2026-10-03: https://supabase.com/docs/guides/platform/backups . Free needs independent exports; Storage bytes need separate copies.

**Dependencies:** data_restore
environments_copy


#### Backup encryption and recovery keys

ID: reliability_encryption · proposed · P0

Encrypt full archives before offsite transfer; backup storage uses private access with narrow write-only/retention duties where possible. Two custodians can recover encryption keys through a restricted password manager/institutional arrangement. Keys stay separate from backups and code; rotating them includes verifying older generations can still be read. Do not place secrets in the PRD editor or general Documents library.

**Acceptance:** Successor decrypts a test archive with documented access; an ordinary member cannot retrieve archive or key.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_exports
security_secrets


#### Small operational monitoring set

ID: reliability_monitoring · proposed · P0

Track external page reachability, login failures, write error rate, server response latency, DB/storage quota, backup age, email bounce/failure and scheduled job status. Keep PII out of diagnostics; correlation/build IDs identify failures. Use vendor dashboards and a lightweight restricted operational report before paying for a large observability stack. Alert only meaningful failures or budget pressure to named custodians.

**Acceptance:** Simulate failed save/backup and quota threshold; owner receives actionable event and can find correlation details.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** costs_triggers


#### Logs, error reporting and retention

ID: reliability_logs · proposed · P0

Technical logs capture severity, operation, build/environment, correlation ID and safe error code, not access tokens, entire notes or receipt bodies. Proposed 30-day own diagnostic retention is distinct from vendor included log windows. Export only high-value incident diagnostics if needed; paid log drains are deferred. Members see honest recoverable error messages and a support reference, not a raw DB exception.

**Acceptance:** Inspect representative logs/errors for secret/PII leakage; retention purge and support correlation work.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_audit


#### V1 offline policy: safe drafts, honest saves

ID: reliability_offline · proposed · P0

V1 is online-first. When disconnected, cached permitted data may be read if allowed, and text drafts can be kept device-local with clear unsaved/offline badge. Do not promise server approval, assignment or payment state until acknowledgment. Background write queue/offline full CRUD is deferred; retry uses idempotency and revision checks. Reconnection prompts conflict review rather than overwriting newer saved work.

**Acceptance:** Lose connection during task/note/approval save; UI never claims server success and draft survives where policy allows.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_concurrency
security_device


#### Bounded retries and duplicate protection

ID: reliability_retry · proposed · P0

Retry transient reads/jobs with exponential delay, jitter and ceiling; do not endlessly retry authorization, invalid data or conflict. A write with uncertain result checks idempotency outcome before repeating. Disable repeated submission only while necessary and keep cancellation state honest. Background jobs record last success/error and manual retry rights. Duplicate request cannot create multiple invites, approvals or exports.

**Acceptance:** Simulate timeout after server commit; client finds original result instead of creating a duplicate.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_validation


#### Performance targets from useful journeys

ID: reliability_performance · proposed · P0

Proposed V1 targets on representative Indonesian mobile connection: first useful app content ≤3 s after authenticated return, ordinary list/filter response p95 ≤1 s, save acknowledgment p95 ≤1.5 s, accessible interaction feedback within 100 ms. Measure cold/warm load and 15 concurrent sessions initially and 25 in stress scenario with representative data. Attachment transfer time depends on file/network and is shown separately. Targets are unverified until measured.

**Acceptance:** Record device/network/data volume, measured percentiles and failed cases; improvements preserve data integrity/accessibility.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_assumptions


#### Incident severity and response

ID: reliability_incident · proposed · P0

P0 incident: unauthorized sensitive access, corruption/lost acknowledged writes or account takeover; restrict writes/access immediately, preserve safe diagnostics and involve named owners. P1: core login/work outage; investigate provider/service status and provide workaround. P2: localized workflow/design error; triage scheduled fix. Keep a simple incident register with onset, impact, decisions, communication, recovery and prevention; never delete evidence to tidy dashboards.

**Acceptance:** Run a tabletop with one data leak and one outage; custodians know first actions and escalation contact.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_maintenance
security_offboarding


#### Maintenance and read-only mode

ID: reliability_maintenance · proposed · P0

Server-owned mode can reject new writes while preserving authorized reads/export where safe. Show reason, start time and expected next update, with explicit unsaved drafts. For a privacy incident restrict affected reads as well. Old tabs and direct API calls honor the same mode. Schedule routine maintenance outside major event/recruitment deadlines where possible and announce it through the approved channel.

**Acceptance:** Toggle maintenance in staging and confirm all write routes fail clearly without losing drafts; restore mode deliberately.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** releases_flags


#### Vendor outage and manual work continuity

ID: reliability_outage · proposed · P1

During backend outage show unavailable state, retain safe drafts and link to latest approved operational export location accessible to custodians. Members may use the agreed temporary spreadsheet/form for urgent work with timestamp and owner; re-entry after recovery is reviewed for duplicates and history. Do not automatically switch to another live database with divergent records. A provider outage is not fixed by redeploying frontend blindly.

**Acceptance:** Continuity drill records urgent task/decision and reconciles it exactly once after recovery.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_exportownership


#### Student-term succession and account custody

ID: reliability_succession · proposed · P0

Keep organization-controlled Git, hosting, database, domain, SMTP, backup and external-document ownership with two named custodians. At term change inventory access, rotate necessary secrets, assign record owners, transfer billing and test recovery. Store runbooks and support contacts in a restricted institutional location and a discoverable product handover record. Never rely on one personal student email/card or one laptop backup.

**Acceptance:** New custodians can release, pay, export and recover; departing custodian access is removed without outage.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** costs_owner


#### Operator runbook contents

ID: reliability_runbook · proposed · P0

Document architecture/environment map, account ownership, normal release, secret rotation, export, backup inspection, restore, rollback, membership offboarding, domain renewal, SMTP failure, storage cleanup and incident contacts. Include exact safe target checks and expected outcomes without embedding secrets. Keep it versioned with the product and validate by successor rehearsal; screenshots alone are insufficient operational instructions.

**Acceptance:** A second maintainer follows the runbook successfully; any undocumented step is added before launch.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Member support and error triage

ID: reliability_support · proposed · P1

Provide one agreed support contact/form with app version, environment, affected journey and safe error reference. Do not request passwords or private receipt screenshots through public chat. Product owner triages wording/workflow issues; technical maintainer triages errors/security. Publish realistic support hours for student volunteers. Track recurring failures and prioritize repairs before adding marginal features.

**Acceptance:** A member can report a failed save and owner can identify the event without asking for credentials.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.


#### Inactivity pause and semester breaks

ID: reliability_freepause · proposed · P0

Free Supabase can pause after inactivity; this matters during exams/holidays and affects first return. Document who checks status, how to resume with current provider tooling, latest archive location and how members see unavailable state. Do not manufacture traffic solely to misrepresent free tier reliability. Before a known event verify availability and export; a stronger continuous-availability requirement triggers paid/institutional hosting decision.

**Acceptance:** Rehearse return-from-pause in test environment; members understand the free operating boundary and designated resume owner.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing, checked 2026-10-03: https://supabase.com/pricing . USD published quotas; recheck account allowances and billing before launch.


#### Proposed archive automation: account/setup still open

ID: reliability_backupautomation · open · P0

Candidate budget-fit automation uses restricted private CI schedule: export app records/native notes/link manifest→encrypt/checksum→private object archive such as eligible R2 Standard with narrowly scoped keys. Actual account/payment eligibility and total charges must fit35k target/50k ceiling. Drive destination remains alternative with verified API/OAuth lifetime/custody. No backup data in repo/logs/ordinary artifacts; no automation exists now. Manual daily encrypted export is explicit fallback; future native files add proven separate recovery.

**Acceptance:** After setup prove seven complete record/note/link generations, missed-run handling and isolated restore; optional binary enabled only after incremental-file recovery passes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** GitHub Actions billing/scheduling, checked 2026-10-03: https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule . DWDG automation not created.

**Dependencies:** costs_freeactions
infrastructure_accounts
data_manifest


#### Scheduled jobs are best-effort with missed-run detection

ID: reliability_scheduler · proposed · P0

GitHub scheduled runs may be delayed/dropped under load; schedule away from busy minute boundaries and measure latest successful backup. Public repositories can lose schedule after 60 days inactivity; private repository reduces exposure but does not create a schedule guarantee. Operators need a daily freshness check or independently checked stale status, and manual run rights. A green prior CI run is not proof today's export exists.

**Acceptance:** Simulate missed schedule and alert/manual fallback; latest complete generation age is visible to custodians.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** GitHub Actions billing/scheduling, checked 2026-10-03: https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule . DWDG automation not created.

**Dependencies:** reliability_backupautomation


#### Drive automation authorization and token expiry gap

ID: reliability_driveoauth · open · P0

Drive backup API authorization is distinct from login-only OAuth. External Google app in Testing can issue 7-day refresh tokens for scopes beyond basic profile; revoked/expired tokens stop backups. Choose minimal approved scope, publish/verify consent configuration as needed and handle invalid_grant with operator reauthorization. Do not put account passwords in CI or assume a service account has consumer Drive storage/ownership. Destination/scopes remain an implementation decision.

**Acceptance:** Automation survives expected token lifetime in isolated test; expired authorization causes actionable failure and no false success.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Google OAuth token lifetime, checked 2026-10-03: https://developers.google.com/identity/protocols/oauth2#expiration . Login-only scopes differ from Drive backup authorization.

**Dependencies:** reliability_backupautomation


#### Drive folder access versus durable team ownership

ID: reliability_mysdrive · proposed · P0

An ordinary free My Drive folder can be shared with custodians; that does not make it a Workspace Shared Drive, whose files belong to the team. Track actual file owner and quota consumer for archives and editable documents. Protect archive from ordinary member edit/delete, keep at least one independent encrypted local custodian copy and rehearse ownership transfer/recovery before term change. Sharing cannot repair an already-deleted owner account.

**Acceptance:** Custodian access/ownership manifest matches actual provider state; departing owner handover preserves files.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Google storage and shared-drive ownership, checked 2026-10-03: https://support.google.com/googleone/answer/9004014 ; https://support.google.com/a/users/answer/7212025 . Actual UII entitlement unverified.

**Dependencies:** infrastructure_accounts


### Acceptance, testing, and evidence

ID: quality · proposed · P0

Release acceptance proves actual end-to-end use, data integrity, scoped permissions, restore capability, and reasonable performance. Source inspection, simulated interaction, rendered inspection, and live production verification are separate evidence levels. Requirements remain pending until their evidence exists.

**Acceptance:** Launch checklist references dated results and known gaps for the candidate version.

**Owner:** QA owner + Mahdy

**Source / assumption:** Current user: polished working real launch; prior QA limitations


#### Role and access matrix

ID: quality-role-matrix · proposed · P0

Test unauthenticated, invited/unaccepted, active member, division lead, each VP reporting branch, President, admin, archived member, removed member, and explicit project collaborator. Include direct URL/API/storage/search/export/notification routes, not only navigation. Test role removal while a session is open and stale cached data afterward.

**Acceptance:** Negative tests confirm no inaccessible fields, file bytes, names, counts, or authorization bypass; positive tests allow intended work.

**Owner:** Backend/security + QA

**Source / assumption:** Access decisions from referenced chat; detailed matrix proposed

**Dependencies:** access


#### Daily member and division journeys

ID: quality-journey-matrix · proposed · P0

Core: accept invitation→open own workspace→find task→open resource→update status→verify reload.
Lead: create project→assign members→schedule work→resolve blocker→review evidence→archive.
Resources: folder→external-file link/native note→assign people→create linked task→reopen.
Meetings: schedule→agenda/minutes→decision→follow-up.
Capabilities: one realistic complete journey per current division, with actual records and role boundaries.

**Acceptance:** At least one representative from each division completes a usable journey on phone or desktop; observed confusion becomes a documented change.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Data invariants and concurrent edits

ID: quality-integrity · proposed · P0

Verify stable IDs, valid foreign keys, owner membership, workspace scope, allowed status transitions, date semantics, integer IDR, no duplicate request/payment count, task-resource relation, cycle rejection, and version/conflict handling. Retrying a timed-out write must not create a duplicate. Two members editing the same task receive a recoverable conflict or safely merge compatible changes; no silent last-write loss for sensitive states.

**Acceptance:** Deliberate concurrency and network-failure tests leave a consistent auditable state and preserve entered changes.

**Owner:** Backend + QA

**Source / assumption:** Proposed integrity contract

**Dependencies:** data


#### Reuse requires fresh regression evidence

ID: quality-regression · proposed · P0

Inventory existing domain logic and three local stores before a rewrite/migration. Preserve original backups and confirm legacy adapter behavior on copies. Choose reuse or replacement module by module based on testable behavior and design fit. Never reset localStorage or reseed user data to make a demo look complete. A production migration is explicit and reviewed, not implied by a UI restart.

**Acceptance:** Dry-run migration reconciles source/target counts, IDs, relationships, missing attachment paths, and rejected rows; originals remain available.

**Owner:** Engineering + data owner

**Source / assumption:** AGENTS preservation contract; existing store/QA evidence

**Dependencies:** data


#### Rendered visual matrix

ID: quality-visual · proposed · P1

Inspect 1440/1024/768/390/360px, EN/ID, light/dark, long titles, dense/empty data, 200% zoom, reduced motion, and real mobile keyboard behavior. Compare desktop to CRM/task references and mobile to Samsung group/chart patterns. Measure row density and clipping; don't infer geometry from stylesheet declarations. Use settled screens.

**Acceptance:** Screenshots and observed interactions match the candidate build and dataset; missing states are explicitly unverified.

**Owner:** Design + QA

**Source / assumption:** Reference atlas and current QA matrix


#### Performance budgets for student devices

ID: quality-performance · proposed · P0

Proposed targets on mid-range phone and ordinary mobile network: meaningful cached navigation under 1s; common small list operations feel immediate; cold usable first view within about 3s under a documented test profile; compressed initial JS under about 250KB where practical. Paginate server lists, avoid loading every record/file, lazy-load nonessential charts, and retain stable UI while saving. Targets are hypotheses until measured.

**Acceptance:** Measure cold/warm loads with dataset of 100 accounts and realistic tasks/resources; publish actual profile, payload, and slow-network outcomes.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Security verification before broad launch

ID: quality-security-review · proposed · P0

Review row/storage policies, invitation expiry, role-management restrictions, session/logout behavior, secrets exposure, HTML injection, external URLs, file size/type limits, rate abuse, and export authorization. Use plain-text content or sanitized supported rich text. Server/service keys never enter client bundle. Credentials are referenced through a password manager, never stored in Notes.

**Acceptance:** A documented abuse checklist exercises key failure paths and an independently reviewed permission change before full membership rollout.

**Owner:** Security reviewer + admin

**Source / assumption:** Proposed launch security gate

**Dependencies:** security


#### Recovery is demonstrated, not claimed

ID: quality-backup-proof · proposed · P0

Produce a record/native-note snapshot with schema/version and external-link manifest, restore to an isolated target, reconcile counts and relationships, and open sample records/notes/metadata. External-provider document bytes are not backed up by a link manifest or database dump. Adopt a separate provider-file continuity/export policy before relying on those documents. If native uploads are later enabled, add file bytes/checksum restore proof. Recovery evidence names operator, excluded scope, snapshot age and actual elapsed time.

**Acceptance:** One complete restore rehearsal succeeds before real organizational data is relied upon; incomplete coverage stays a launch blocker.

**Owner:** Operations + data custodian

**Source / assumption:** Proposed backup acceptance

**Dependencies:** reliability


#### Reminder and notification truth

ID: quality-notification-proof · proposed · P0

In-app due queues work on reopening. If closed-app delivery is included, test the actual scheduler, retry/deduplication, timezone, quiet-hours behavior, authorization, failed channel, and opt-out. Do not claim that a browser tab timer sends while the app is closed. Core due tracking remains usable if optional email fails.

**Acceptance:** Simulate overdue while logged out, then return; in-app queue is correct and no duplicate optional message is sent.

**Owner:** Operations + QA

**Source / assumption:** Survey S01 reminder need; delivery scope proposed


#### Launch defect severity and release criteria

ID: quality-defects · proposed · P0

P0 defect: data leak/loss, account lockout with no recovery, incorrect permissions, unrecoverable migration/restore, or false transaction state.
P1: essential journey broken, wrong calculations, save silently fails, mobile unusable.
P2: cosmetic or secondary inconvenience with practical workaround.
General launch requires zero unresolved P0/P1 defects in the promised scope. Known P2 issues have owner and description. A requirement marked Proposed/Confirmed is not marked tested automatically.

**Acceptance:** Candidate sign-off names version, tested scope, unresolved defects, owners, and explicit feature exclusions.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Pilot feedback and support

ID: quality-feedback · proposed · P0

Offer an in-app Help/Report issue route with clear user steps and optional redacted screenshot. Capture version, page, role category, device category, expected/actual result and severity; avoid auto-attaching sensitive content. A shared issue board has owner and response expectations appropriate for volunteers. WhatsApp can remain a communication channel but records/decisions return to the system.

**Acceptance:** A member submits an issue; triage reproduces it using safe test data, communicates a workaround, and links the fix to a release.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Minimal monitoring that protects privacy

ID: quality-observability · proposed · P0

Track uptime/error rate, failed writes, database/storage usage, backup age, scheduled-job success, and release version. Avoid recording note/file/finance body text, session tokens, passwords, or unnecessary member identifiers. Free logs have retention/size limits. Alerts are actionable and have an owner; a dashboard without notification ownership is insufficient.

**Acceptance:** Exercise a failed backup and failed save; the responsible operator can find the event and required action without exposing content.

**Owner:** Operations

**Source / assumption:** Proposed minimal operations

**Dependencies:** reliability


### Planning, implementation, pilot, and launch

ID: roadmap · proposed · P0

A PRD-first restart: settle critical operating decisions and first-version scope; implement from one requirement model; verify in isolated environments; pilot with representatives; launch gradually. No date is invented. Sequence is dependency-driven and will be estimated after the specification is reviewed.

**Acceptance:** Every phase has exit evidence and named responsibilities rather than a percentage completion claim.

**Owner:** Mahdy + product/engineering owners

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Stage 1 · review the PRD and scope

ID: roadmap-plan · proposed · P0

Use this editable draft to resolve cost, data custody, permissions, organization terms, division workflow owners, attachment/reminder scope, and launch recovery. Freeze a versioned baseline only after the important decisions have been discussed. Record changes and reasons. Do not build disconnected product screens while unresolved assumptions silently change.

**Acceptance:** A versioned PRD baseline identifies confirmed scope, deferred features, required evidence, and remaining nonblocking questions.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Stage 2 · shared model and working foundation

ID: roadmap-foundation · proposed · P0

Build organization/batch/membership policy, authentication, stable relational entities, one shell, localization, basic persistence/errors, and migration adapter before spreading to division screens. Establish nonproduction fixtures with no private data. Retain Vite/vanilla JS unless a later explicit architecture decision changes it.

**Acceptance:** Create account/workspace/project/task/resource with correct permissions and persistence; backup/restore and rollback route exist.

**Owner:** Engineering

**Source / assumption:** AGENTS current stack; foundation proposed


#### Stage 3 · complete core and divisions together

ID: roadmap-core · proposed · P0

Deliver shared daily journeys plus all six current division capabilities at the committed depth. Prefer a smaller complete workflow over impressive fragments. Map every task to a requirement ID. Cross-division request/project/resource links use shared records and permission rules.

**Acceptance:** All accepted core journeys and one end-to-end division workflow each pass; dead primary actions and duplicate state are removed.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Stage 4 · test, recovery, and migration rehearsal

ID: roadmap-isolated · proposed · P0

Use disposable local sandbox and isolated staging candidate. Run permission, concurrency, visual, data reconciliation, failed-save, restore, and deployment rollback checks. Use sanitized data only. Migrations expand before code depends on new fields and retain rollback-compatible reads.

**Acceptance:** A release candidate has reproducible checks, restore proof, and no unresolved critical defects.

**Owner:** QA + operations

**Source / assumption:** Proposed lifecycle

**Dependencies:** environments
releases


#### Stage 5 · representative pilot

ID: roadmap-pilot · proposed · P0

Propose a small pilot including Mahdy, at least one President/VP/lead role and one representative per six current divisions; exact people and duration are open. Start with a bounded set of real work after permissions/recovery gates pass. Gather observed phone/desktop usability and operation costs. Pilot participants know the support route and contingency if service pauses.

**Acceptance:** Pilot produces actual usage, storage, failed-save, backup-age, role, and usability findings; major issues are fixed before all-member rollout.

**Owner:** Product owner + division leads

**Source / assumption:** Pilot composition/duration proposed


#### Stage 6 · gradual organization launch

ID: roadmap-rollout · proposed · P0

Invite cohorts rather than importing every contact without review. Publish one concise guide for sign-in, workspace/project concepts, resources, permissions, reporting issues, and export/recovery responsibility. Assign two accountable account custodians. Each division migrates chosen active work once, with source reconciliation and ownership checks.

**Acceptance:** New members complete the first-work journey; operators can recover access; chosen source work reconciles; rollback/support route is documented.

**Owner:** Mahdy + appointed custodian

**Source / assumption:** Actual app launch requested; rollout proposal

**Dependencies:** launch


#### Stage 7 · ongoing updates and batch handover

ID: roadmap-maintenance · proposed · P0

Use versioned changes, short release notes, migration review, scope-tested regressions, and staged deployment. Schedule regular backup/recovery checks and quota review. Before a new batch, verify organization draft, account custody, active members, records, cost ownership, and archive policy. Remove departed access without deleting their historical authorship.

**Acceptance:** Next batch can operate accounts and restore/export data without Mahdy's personal device or private credentials.

**Owner:** Operations + future batch leaders

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


### Real launch acceptance and staged adoption

ID: launch · proposed · P0

This PRD plans a polished production product; it does not authorize claiming the current local UI has launched. Finish the agreed V1 workflows across six divisions, real managed identity/permissions, persistence, recovery, update process and actual rendering evidence. Use a small production pilot before inviting the full organization; adoption is based on completed journeys and data confidence.

**Acceptance:** A signed launch record identifies build, owners, budget, executed acceptance evidence and remaining explicitly accepted P1 gaps.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_tests
reliability_restore
releases_checks


#### Freeze one credible V1 scope

ID: launch_scope · proposed · P0

Classify every requirement as launch-critical P0, useful P1 or deferred P2. Keep organization/workspace/project/work/resources vocabulary coherent. Include useful department workflows but defer payroll, banking, automated signatures, public SaaS tenancy, AI scoring and complex offline collaboration. A proposed node is not a delivery promise until scope is approved. Changes record purpose, cost and acceptance impact. Requirement priority is separate from defect severity: excluding an optional P1 requirement is deliberate scope choice; an essential-flow P1 defect still blocks launch.

**Acceptance:** All P0 requirements map to actual acceptance; deferred capabilities are not presented as working controls.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_divisionentities


#### Launch blockers and go/no-go record

ID: launch_gate · proposed · P0

General launch blocks unresolved P0 or P1 defects in promised essential scope: unauthorized access, lost acknowledged data, broken save/Undo, incorrect calculations, unusable mobile essentials, no viable restore, unowned operator credentials or missing membership enforcement. P1 requirement priority is separate: optional requirement can be deliberately deferred/excluded with scope updated, but cannot excuse a P1 defect in advertised behavior. Known P2 defects need owner/workaround/date. Go/no-go uses current evidence, not old screenshot/test count.

**Acceptance:** Zero unresolved P0/P1 defects in promised essential scope; scope exclusions and P2 workarounds have recorded owner and evidence.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_tests
reliability_restore
launch_design
launch_ownership


#### Polish and accessibility evidence

ID: launch_design · proposed · P0

Inspect every primary page and six divisions at agreed desktop/mobile sizes with real long labels, empty/error/loading states, English/Indonesian, light/dark, keyboard, 200% zoom and reduced motion. Exercise actual controls/inspectors/drafts/Undo, not screenshot styling alone. Keep compact working hierarchy and consistent components; charts show saved values and missing history honestly. Preserve current references as source evidence without assuming every old choice must survive restart.

**Acceptance:** Current build has settled screenshots and interaction evidence covering the matrix; each failure has repair or explicit unresolved status.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.

**Dependencies:** releases_checks


#### Pilot cohort and success evidence

ID: launch_pilot · open · P0

Propose 8–12 invited members covering six divisions, lead/reviewer roles and mobile users for a 2-week real low-sensitivity pilot after staging passes; exact cohort remains open. Confirmed full organization starts around 40 members or more. Track completed journeys, failed saves, resource finding, recovery and quota/support issues; avoid individual productivity rankings. Resolve all P0/P1 defects in promised essential scope before broader rollout; deliberately excluded optional requirements are documented separately.

**Acceptance:** Pilot report reconciles member feedback, observed journeys and error/usage; each division completes its advertised main workflow with zero unresolved P0/P1 defects before broader rollout.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.

**Dependencies:** environments_staging
launch_gate


#### Initial data cutover and reconciliation

ID: launch_datacutover · proposed · P0

Owner decides what existing local records are actual work, examples, duplicates or obsolete drafts. Export all relevant sources, run import dry-run, map people, preserve unknown dates and confirm privacy/access. Avoid importing every personal folder blindly. After import, leads review project/task/resource counts and spot-check evidence; retain legacy archive before declaring the new system authoritative.

**Acceptance:** Signed reconciliation lists imported/excluded records and attachment gaps; no existing browser data was silently reset.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_legacy
data_manifest


#### Member onboarding and sandbox training

ID: launch_onboarding · proposed · P0

Provide a short guided first session: join membership, select division context, find assigned task, update it, locate resource, create a follow-up and use Undo. Train sensitive approvers separately and explain sandbox/production badges. Default views are useful with real records; empty states teach one next action. Provide concise Bahasa Indonesia/English help rather than long generic software tutorials.

**Acceptance:** A new member completes the basic journey without developer intervention and understands whether data is real or demo.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** environments_sandbox
security_auth


#### Named operational responsibility before launch

ID: launch_ownership · open · P0

Assign product owner, treasurer/billing owner, primary and backup technical maintainers, data/privacy contact, each division lead and archive custodians. These are responsibilities, not invented names. Record support hours and semester handover plan. At least two people must have verified essential operator access; role independence and ability to cover exams/holidays matter for continuity.

**Acceptance:** Owner table contains names/contacts, access verification date and successor; no sole critical custodian remains.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_succession
costs_owner


#### Confirm actual spend within 35k target/50k maximum

ID: launch_funding · open · P0

Latest confirmed budget: target Rp35,000/month where feasible, maximum Rp50,000; earlier near-Rp0 preference superseded. Verify free-core eligibility and exact archive/email/domain costs, tax/card fees and annual amortization. No requirement to spend full target. Protect recovery/custody first; optional Pro/paid staging lies outside cap. UII entitlements unverified. Actual quotes/account setup/funding for any paid line require explicit owner decision before organizational dependence.

**Acceptance:** Signed actual all-in worksheet stays within 35k target or explained variance ≤50k ceiling; upfront annual cash approved separately.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.

**Dependencies:** costs_monthlyA
costs_monthlyB
security_vendor


#### Focused production security review

ID: launch_securityreview · proposed · P0

Reviewer walks membership/invite/bootstrap, database policies, restricted native notes/link metadata, sensitive exports, secrets, logging/offboarding with direct API tests. Default V1 has no native binary upload. If later enabled, independently verify bucket/private-file download/recovery rules. Production config checked separately with safe designated records; no compliance/penetration-test certification is implied. Record actual result and unresolved risks.

**Acceptance:** Security reviewer signs tested matrix for production build/config and confirms no known P0 access leak.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_tests
security_bootstrap


#### Recovery and update rehearsal evidence

ID: launch_recoveryreview · proposed · P0

Before launch second custodian exports app records/native notes/link manifest, checks encrypted offsite copy, restores isolated data/permissions and explicitly confirms external document bytes are outside bundle. Then staging update/rollback and contact/account recovery rehearsal. Optional binary capability adds file checksums/retrieval/restore before enabling. A directory of snapshots without tested recovery is incomplete operational evidence.

**Acceptance:** Measured recovery and rollback record meets accepted goals or is explicitly unresolved; successor has performed key steps.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** reliability_restore
releases_rehearsal


#### Trace requirements to tests and sources

ID: launch_acceptancematrix · proposed · P0

Assign requirement IDs, source/evidence, priority, acceptance journey and owner. Survey responses are qualitative/quantitative evidence only within known sample; brainstorms and new decisions are proposals until adopted. Each P0 needs current build/environment result with date and evidence link. Preserve open decisions visibly; never mark passed because a detailed description exists.

**Acceptance:** Trace matrix has no untested P0; source-faithful requirements and speculative defaults are clearly distinguishable.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.

**Dependencies:** launch_gate


#### First-month review and next release

ID: launch_postmonth · proposed · P1

After full launch review actual invoice, active members, successful/failed core journeys, data corrections, backup age, restore obligations, support load and department feedback. Adjust storage/retention and training before adding new integrations. Decide one small next-release scope based on observed needs; update PRD decisions and cost assumptions. Do not turn simple activity counts into member rankings.

**Acceptance:** Monthly review records measurements, budget variance, issues resolved and one prioritized next scope with owner.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** costs_triggers
reliability_support


#### Achievable launch within 35k target/50k ceiling

ID: launch_freecontract · open · P0

Real launch can fit modest permitted budget using free core plus small verified independent archive cost, provided multi-user/privacy/save journeys, quota limits, custody and recovery pass. Boundary remains online-first/no 24-hour SLA, possible free pause/restriction and explicit manual/automated recovery responsibility. Default backups cover records/notes/link manifests, not outside documents. No guarantee of Rp0 invoices. Crucial sensitive work waits for gates; optional upgrades cannot exceed Rp50,000 silently.

**Acceptance:** Owner accepts written free service boundary backed by current evidence; members see accurate availability/support expectations.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.

**Dependencies:** launch_gate
reliability_backupautomation
reliability_freepause


#### Remaining operational decisions to settle

ID: launch_openoperations · open · P0

Confirmed: brand DWDG’ONE UII, latest target Rp35,000/month/hard maximum Rp50,000, roughly 40+ members and no current domain/shared Drive. Open: named operators/billing authority, actual Google identities, hosted region/privacy policy, archive destination/payment eligibility/credentials/automation, retention/recovery staffing and real migration records. Make decisions editable; never invent existing accounts or university benefits.

**Acceptance:** Decision register assigns owner and launch impact to every open item; dependent acceptance remains pending.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.


### Open decisions and discussion queue

ID: decisions · proposed · P0

Start discussion with decisions that change launch feasibility. Confirmed facts: name, monthly target Rp35,000 and ceiling Rp50,000, ~40+ members, no existing domain/shared Drive, scoped roles, current divisions and future organization draft. The detailed launch/SOP choices below remain editable. An open item has an owner, proposed default, impact, and required-before milestone.

**Acceptance:** No unresolved launch-critical decision is silently replaced with an assumption.

**Owner:** Mahdy

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Who holds organization accounts and recovery?

ID: decision-custody · open · P0

Need named primary and backup custodians for database/hosting/provider folder accounts, recovery email/factors, export locations, and billing if required. Proposed default: two appointed responsible people with individual administrator permissions, documented recovery, no shared plaintext passwords. No existing organization domain/Drive is available; university eligibility or institutional ownership must be checked separately.

**Acceptance:** Before real data: both custodians can access required services and a recovery exercise succeeds.

**Owner:** Mahdy + President

**Source / assumption:** User confirms no domain/shared Drive


#### Can the operating plan fit Rp35,000–Rp50,000/month?

ID: decision-free-tradeoff · open · P0

Confirmed budget target Rp35,000/month, hard ceiling Rp50,000/month. Proposed baseline uses low-cost eligible managed services and a free subdomain, with independently tested backup/custody. Use the budget for necessary recurring operations rather than spending to reach a target. Resolve vendor inactivity/quota limits, actual backup destination costs, annualized charges and response ownership. Supabase Pro is outside this ceiling at checked pricing and needs a separate future budget decision. Small optional paid services must fit the all-in ceiling, including taxes/card fees and annual renewals. Affordable service is not a promise of always-on availability.

**Acceptance:** Before general launch: limitations, fallback, backup age limits and operator ownership are accepted in the PRD; actual plan quota and terms verified.

**Owner:** Mahdy + President

**Source / assumption:** User revised budget: target Rp35,000/month, maximum Rp50,000/month; vendor limitations researched separately

**Dependencies:** costs
reliability


#### Where will documents live without a shared Drive?

ID: decision-file-policy · open · P0

Default launch Resources uses native notes/folders and links to external files; native binary upload is deferred unless explicitly enabled after storage/cost/security approval. The user has no current shared Drive. Arrange organization custody with named operators and individual sharing; distinguish Shared Drive entitlement from an ordinary shared folder. Review existing personal-file links and ownership continuity before import. No shared-account password distribution. Any optional provider charge/annual renewal counts toward target Rp35,000 and maximum Rp50,000/month.

**Acceptance:** Choose provider/ownership, successor access, sensitive-resource policy and departure process before real import; keep native uploads disabled until explicitly accepted.

**Owner:** Mahdy + document custodian

**Source / assumption:** User no shared Drive; Resources discussion

**Dependencies:** resources
data


#### Which identities can join and who approves them?

ID: decision-invite · open · P0

Proposed invitation-only roster with verified identity and membership review; Google sign-in may reduce email-delivery costs if available and correctly configured. Decide whether @students.uii.ac.id/@uii.ac.id is mandatory or alumni/advisors/partners can receive exceptions. Do not infer membership from a domain alone. Mahdy's concrete login identity must be verified before admin provisioning.

**Acceptance:** Before account rollout: invitation approver, allowed identities, exception expiry and first-admin identity are recorded and tested.

**Owner:** Mahdy + President

**Source / assumption:** Mahdy admin plan confirmed; no account provisioning authorized by PRD


#### Who confirms each division’s minimum workflow?

ID: decision-sop · open · P0

Six division leads should review status names, required fields, reviewer roles, and completion evidence. Consulting PL/PM distinctions and Legal ticketing/numbering/PKS→BAST→invoice are respondent suggestions until officially adopted. HR/Strategy workflows lack survey representation and need direct feedback. Avoid giving invented SOPs a confirmed label.

**Acceptance:** Before baseline: each capability has an accountable reviewer and minimum end-to-end accepted workflow, or explicitly provisional pilot treatment.

**Owner:** Division leads

**Source / assumption:** Survey evidence + respondent qualitative comments

**Dependencies:** divisions


#### What does reminder delivery mean in v1?

ID: decision-reminders · open · P0

Survey reminders are highest-demand need. Proposed minimum: persistent due dates, actionable in-app due queue and reopening catch-up. Decide whether email while closed is essential enough to fund/setup SMTP and scheduler now. WhatsApp API, calendar synchronization, and push are deferred unless scope changes. The product must state its actual delivery behavior clearly.

**Acceptance:** Before scope freeze: reminder channels, quiet hours, timezone, retries, cost and closed-app behavior are specified.

**Owner:** Mahdy + division leads

**Source / assumption:** Survey S01 8/8; free-budget constraint

**Dependencies:** workflows


#### Retention, sensitive records, and export approval

ID: decision-data-policy · open · P0

Need organizational decisions for member contact/HR/candidate data, client contacts, legal documents, financial requests, archival periods, and who approves exports/deletion. Proposed minimum collect only what supports work; restrict sensitive content; preserve required operational history; avoid unnecessary student IDs/home addresses/bank data. Specific statutory obligations require qualified verification rather than an invented 'compliant' badge.

**Acceptance:** Before collecting sensitive real data: data categories, purpose, access, retention/deletion, custodian and export workflow are documented.

**Owner:** President + HR/Legal/Finance leads

**Source / assumption:** Privacy/data-minimization proposal

**Dependencies:** security
data


#### Confirm wordmark treatment and default language

ID: decision-brand · open · P1

Name DWDG’ONE is settled; typography/logo spelling can use a reviewed wordmark asset. Proposed operational baseline retains current neutral palette, compact desktop rows and Samsung mobile groups while applying clean Notion-like structure and supplied tactile controls. Proposed default language English with ID switch. Resolve logo asset and default language without reopening product terminology.

**Acceptance:** A reviewed logo/wordmark and first-login language exist before public-facing onboarding material.

**Owner:** Mahdy + MarCom & IT

**Source / assumption:** Name user-selected; previous design direction

**Dependencies:** design


#### Choose pilot owners, duration, and launch window

ID: decision-pilot · open · P0

There is no confirmed launch date, named QA operator, backup custodian, or representative pilot roster yet. Proposed sequence uses one representative from each current division and a leadership/admin role before broad rollout. Estimate implementation only after requirements and capacity are settled.

**Acceptance:** Pilot owner, support owner, launch criteria and availability of volunteers are recorded; dates remain open until agreed.

**Owner:** Mahdy + President

**Source / assumption:** No schedule provided by user

**Dependencies:** roadmap


#### Future structure activation remains separate

ID: decision-restructure · open · P1

Current six divisions remain active. Three-VP future structure remains a draft. Project Delivery is provisional; Expert Network belongs two batches ahead and reporting line is open. Choose future activation batch, leaders, project migration assignments, legal/finance split ownership, and role changes through a preview; never activate merely because the PRD shows the new tree.

**Acceptance:** Activation requires a complete migration preview and named batch decision; old history remains queryable.

**Owner:** President + admin

**Source / assumption:** Referenced chat direct user confirmations

**Dependencies:** organization


### How this PRD stays useful

ID: prd-management · proposed · P0

The planning tool is editable and its output is portable. A seed draft is not an approved baseline. User edits remain separate from the old app; sharing a JSON revision lets the next session inspect actual changes. Record requirement IDs, status, priority, owner, source, acceptance, and dependencies so detail can become implementation work without losing decisions.

**Acceptance:** The PRD can be exported, reopened, changed, and compared without depending on the original conversation.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Decision status and implementation status are separate

ID: prd-management-status · proposed · P0

Confirmed = explicit user decision or verified evidence. Proposed = recommended design/behavior pending discussion. Open = unanswered choice that affects scope/operations. Deferred = outside first-version commitment. Priority P0/P1/P2 indicates launch criticality/importance/secondary scope within the relevant commitment; it is not a test result. Implementation/test outcome must be tracked separately in delivery evidence.

**Acceptance:** No node marked Confirmed implies deployed, secure, visually accepted, or tested; evidence fields link to actual checks.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Versions, sources, and traceability

ID: prd-management-baseline · proposed · P0

Keep original source references and dated price/quota checks. Exported draft contains stable requirement IDs and readable Markdown. Baseline version has owner/date and reviewed changes. New AI sessions must read current user revision, open decisions, and evidence before implementation. Prior implementation spec remains historical/reference input while this restart PRD is a draft; avoid two unexplained authorities.

**Acceptance:** README identifies current draft and old materials, and explains that editing the planning app does not write back to production or overwrite the seed file automatically.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


#### Edit, add, move, delete, and Undo

ID: prd-management-editor · confirmed · P0

The planning app provides readable outline and rightward map, editable requirement detail, add sibling/child, move with cycle prevention, subtree deletion with count, Undo/Redo, and JSON/Markdown export/import. Draft edits persist on this device when storage is available; portable export is the backup. A corrupt saved revision is surfaced for recovery rather than silently replaced.

**Acceptance:** Edit long notes, delete/undo a branch, move/undo, reload saved state, import invalid data, and recover export; no loss is hidden.

**Owner:** Planning tool owner

**Source / assumption:** Current user asks edit/add/delete like prior session; safeguards proposed

