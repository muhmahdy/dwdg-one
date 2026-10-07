# DWDG’ONE — Universitas Islam Indonesia

PRD draft 0.2 · 3 October 2026 · process flows, measurable criteria and linked prerequisites. Decision states are separate from build/test/deployment evidence. Existing product and records remain preserved.


## DWDG’ONE · Universitas Islam Indonesia

ID: root · confirmed · P0

PRD draft 0.2 • planning restart • 3 October 2026.
A connected, affordable organization web app for DWDG UII. This is a reviewable proposal, not an approved production implementation. Budget: target Rp35,000/month, hard ceiling Rp50,000/month. Initial audience: approximately 40 or more members. No organization-owned domain or shared Drive is currently available.
Explore product behavior, six division workflows, design, data, permissions, costs, environments, release practices, and launch evidence. Confirmed labels record explicit decisions or verified source facts; proposed labels record recommendations; open decisions need an answer; deferred items are outside the first release.
Editing this PRD changes the planning draft only. Existing application code and saved organizational records are preserved.

**Acceptance:** 1. Every current requirement ID can be inspected/edited; add/move/delete is recoverable through Undo.
2. Portable export includes N requirements for an N-node chosen document, with 0 silently dropped IDs or fields.
3. Budget remains Rp35,000/month target and Rp50,000/month hard ceiling; roughly40+ members is approximate, not an audited count.

**Owner:** Mahdy

**Source / assumption:** Current user request and budget/member/account answers, 3 October 2026; latest user budget correction: target Rp35,000/month, maximum Rp50,000/month


### Product, organization and division requirements

ID: product-planning · proposed · P0

Purpose, first-release scope, terminology, current/future organization, account authority and specialized workflows of six active divisions. This branch defines the work and policy the product must support. UI journeys describe how people perform it; backend contracts define how it is stored and enforced. Department SOP/approver/retention choices remain Open until actual owners confirm them.

**Acceptance:** 1. Contains purpose/scope/organization/permissions and all 6 current division requirement families.
2. Each adopted division has a journey and accountable policy owner.
3. There are 0 newly activated future divisions or invented SOP approvals.

**Owner:** Mahdy + President + division leads

**Source / assumption:** Latest user asks separate high-level planning branches and expert process consultation,3Oct2026.


#### Product purpose and first-version promise

ID: vision · proposed · P0

One dependable place to understand responsibilities, execute projects, find resources, and retain knowledge across student leadership batches. Keep the number of concepts and operating costs small. A polished first release means that advertised actions work across roles, phones, languages, and recoverable failures; it does not mean adding every conceivable ERP feature.

**Acceptance:** 1. A member can identify their next work, update it, find its resource, and see the saved result without reconstructing the context from WhatsApp.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


##### Product name and vocabulary

ID: vision-name · confirmed · P0

Brand: DWDG’ONE. Organization: DWDG UII — Universitas Islam Indonesia. Workspace is one organizational working context. Project is an initiative within a workspace. Work means execution; Resources means files, notes, folders, and external links. Capability means a specialized workflow enabled for a workspace. Avoid 'project workspace' and a second Workspace tab.

**Acceptance:** 1. Exactly1 product term Workspace refers to organizational context; project main navigation has exactly3 tabs Overview / Work / Resources.
2. Core navigation/forms/help use the adopted EN/ID vocabulary in100% of reviewed instances.

**Owner:** Mahdy

**Source / assumption:** User name selected in current request; Critique App Development user terminology discussion


##### Problems this release must solve

ID: vision-pains · proposed · P0

Fragmented work: responsibilities and decisions spread across chat, Sheets, Forms, and documents. Duplicate entry: the same deliverable reconstructed in several tools. Unclear coordination: missed deadlines and unresolved blockers. Lost continuity: context disappears when a batch or officer changes. Prior product failures include duplicate workspace/division navigation, inconsistent actions, shallow requirements, and generic dashboards.

**Acceptance:** 1. Pilot interviews and task observations evaluate these problems directly; feature count and visual novelty are not success measures.

**Owner:** Product owner + division leads

**Source / assumption:** Verified survey pain-point columns E:F; current user restart and referenced critique


##### People the first release serves

ID: vision-personas · proposed · P0

Member: knows assigned work and resources, updates status, requests help.
Division lead: allocates work and reviews blockers/delivery within their scope.
VP: coordinates only reporting divisions and explicitly shared projects.
President: organization portfolio and responsible escalation.
Admin: Mahdy initially; operates accounts/configuration and recovery, with an appointed backup operator.
Specialist: PL/PM, finance reviewer, legal reviewer, recruiter, content reviewer have scoped action permissions. Actual named officers and appointment dates remain unconfirmed.

**Acceptance:** 1. Map member, lead, VP, President, admin and specialist reviewer to at least6 explicit actor/action/scope fixture categories.
2. Each adopted journey identifies1 accountable policy owner and a denied/recovery path;0 title-only unlimited authority grants.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** access_action_matrix
org_current_six


##### Initial capacity and limits

ID: vision-capacity · confirmed · P0

Approximately 40 or more members is the user estimate, not an audited member count. This confirmed audience fact does not confirm a measured concurrency level or vendor capacity. Proposed performance fixtures are recorded separately so assumptions remain distinguishable from actual member evidence.

**Acceptance:** 1. Count actual invited/active members before pilot; record1 dated approximate→verified roster decision.
2. Do not equate the40+ estimate to a measured concurrency or guaranteed hosting capacity.

**Owner:** Mahdy

**Source / assumption:** User answer 3 October 2026: '40 members more i think'


##### Proposed capacity fixtures and measured sizing

ID: vision-capacity-fixtures · proposed · P0

Use editable planning fixtures of 60 invited accounts, 15 simultaneous active members, and 100 accounts for a near-term stress case. Exercise representative task/resource/history queries, navigation, writes, and export rather than account count alone. Measure database growth, response latency, failures, and transfer under realistic record counts. These are test targets, not measured usage or a promise that every free service meets them.

**Acceptance:** 1. A pilot capacity report records fixture size, peak concurrency, latency/error/transfer measurements, vendor quota headroom and any revised limits. Actual usage replaces assumptions before scaling.

**Owner:** Engineering + operations

**Source / assumption:** Sizing assumptions proposed for the user estimate of approximately 40+ members; actual concurrency and dataset size unknown

**Dependencies:** vision-capacity
scope_student_scale


##### Measure useful adoption without surveillance

ID: vision-pilot-value · proposed · P1

Proposed pilot measures: every active project has an accountable owner; each assigned task has enough context to act; a member can find a linked resource in under one minute in a usability exercise; division leads can resolve a blocker without duplicate record entry; missed reminders and failed saves are observed. Collect small anonymous or consented feedback and operational counts. Do not rank members by task volume, infer productivity, or use private HR/finance records for analytics.

**Acceptance:** 1. At least1 representative from each of6 current divisions completes an observed minimum journey.
2. In a resource-finding exercise, proposed target is≤60s per required known resource; record per-person time and sample size rather than claim a measured result.
3. Collect0 private HR/finance bodies for adoption analytics and produce0 member productivity rankings.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** vision-pains
analytics_metric_policy


##### Private organization app, not a public SaaS

ID: vision-distribution · proposed · P0

First release serves a single DWDG UII organization with invitation-only membership. Stable organization/workspace IDs and capability configuration leave room for reuse. Self-service organizations, tenant billing, customer onboarding, and a public marketplace are outside v1. A public login page must disclose minimal organization information and reveal no internal names, project counts, or content.

**Acceptance:** 1. Unauthenticated fixture has0 internal record/title/count disclosures.
2. A foreign organization ID has0 allowed DWDG reads/writes/search/export results.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** org_identity
access_action_matrix


#### Launch scope, priorities, and evidence gaps

ID: scope · proposed · P0

P0 means launch integrity or a complete minimum daily journey. P1 is important in the explicitly adopted scope; a P1 requirement may be deferred with a documented exclusion, while a P1 defect in promised essential behavior cannot be excused. P2 remains optional/later. A dense PRD can capture future direction without treating all brainstorms as a first-release commitment.

**Acceptance:** 1. Launch checklist identifies mandatory decisions/journeys and does not claim all planned capabilities are implemented.

**Owner:** Mahdy / product owner

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


##### First production release connects six divisions through a minimal shared core

ID: scope_launch_core · proposed · P0

Proposed launch for roughly 40+ members includes real sign-in/access, current organization/batch, shared projects/tasks/milestones/blockers/decisions, meetings/minutes, internal notes/folders/link-based Resources, in-app reminders/inbox/search/export and minimum validated department paths. Specialized views reuse shared records. Evaluate all services against target Rp35,000/month and hard ceiling Rp50,000/month; native binary upload and paid integrations remain deferred unless later approved.

**Acceptance:** 1. All six validated minimum journeys operate within the approved monthly cost target/ceiling and preserve data across reload/export.

**Owner:** Product owner

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Latest user production PRD request, 3 Oct 2026. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.

**Dependencies:** org_current_six


##### Use external tools through owned resource links to keep system small

ID: scope_link_first · proposed · P0

Use approved external working-document/tool links after organization account/folder ownership is settled. No shared Drive/domain exists today. DWDG stores context, responsibility, internal note/version metadata, review and canonical linked work. Native office/design editors, binary evidence hosting and provider mirroring remain deferred.

**Acceptance:** 1. A real existing external resource can be registered, assigned, searched and reviewed without importing the provider's entire file system.

**Owner:** Mahdy / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** resource_provider_access


##### Defer expensive integrations and broad ERP functions

ID: scope_deferred · deferred · P2

Deferred: WhatsApp/Telegram bots, external calendar sync, auto social publishing, channel analytics, native e-sign execution, payments/bank/payroll/tax/accounting, AI summaries, automation builder, public client portal and self-service multi-tenant product. Revisit only with clear owner/cost/use case.

**Acceptance:** 1. Launch copy never promises a deferred integration or external action.

**Owner:** Product owner

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


##### Validate HR and Strategy directly before their workflows freeze

ID: scope_hr_strategy_gap · open · P0

Survey provides no HR/S&G respondent evidence. Proposed fields/stages are planning hypotheses, not confirmed departmental needs. Schedule one representative walkthrough per team and edit the PRD; no invented sample programs become production data.

**Acceptance:** 1. Each lead reviews a concrete proposed journey and unresolved items remain visibly open.

**Owner:** HR / S&G leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.

**Dependencies:** hr_validation,strategy_validation


##### Confirm leadership, cross-division grants, approvals and retention

ID: scope_rules_gap · open · P0

Unresolved launch inputs include current roster/reporting, action rights, project-only collaboration exception, financial limits, official legal numbering/SLA, client confidentiality, candidate data retention, resource/file caps and successor admin. Name owner and decision date for each; do not ask member users to choose system policy ad hoc.

**Acceptance:** 1. All launch-blocking policy nodes have recorded answers and an approver before real accounts/data are onboarded.

**Owner:** Mahdy / President / domain leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_current_leaders
access_review_self_policy
security_privacy


##### Current implementation is reusable evidence, not production acceptance

ID: scope_evidence · confirmed · P0

Latest local QA reports 90 automated checks/build/document parity but browser visual and live interactions were blocked; shared auth/OAuth/storage/multi-user behavior was not verified. Preserve old code/data as reference. New release acceptance requires actual production-like role/file/concurrent journeys and rendered review.

**Acceptance:** 1. PRD records known prior limits and does not label production complete from old test counts.

**Owner:** Engineering / QA

**Source / assumption:** qa/reference-redesign/VERIFICATION.md and active ACCEPTANCE.md. User request, 3 Oct 2026; Critique App Development conversation user messages.


##### Pilot uses real roles with safe representative records

ID: scope_pilot · proposed · P0

Proposed pilot cohort includes Admin/President, one scoped VP, one ordinary member, PL/PM, and legal/finance approvers; one lead per current division validates journey. Use sanitized seed/demo data in sandbox and permissioned real records only when launch policy ready. Test unauthorized paths and exports explicitly.

**Acceptance:** 1. Pilot demonstrates owner/task/resource/deadline/review/export end to end and records failures rather than only screenshots.

**Owner:** Mahdy / division leads / QA

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_action_matrix
quality-defects


##### 40+ members; Rp35,000 target and Rp50,000 monthly ceiling

ID: scope_student_scale · confirmed · P0

Latest user decision: target Rp35,000/month and hard ceiling Rp50,000/month for roughly 40+ student members. This supersedes the earlier near-Rp0 target. No shared Drive or domain exists today. Plan realistic data volumes, mobile access, administration and complete recurring operating cost within the approved cap. Do not assume organization-wide paid licenses or institutional domain entitlement.

**Acceptance:** 1. Operations plan explicitly budgets the 40+ cohort at Rp35,000/month target and never above Rp50,000/month without a new user decision.

**Owner:** Mahdy

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.


##### Open decision: organization-owned account/folder and custodian

ID: scope_org_storage_setup · open · P0

Choose who owns working document storage, who succeeds the custodian after graduation, actual provider permissions, and resource access-request contact. Drive is one option, not an existing shared asset. No personal-account folder becomes organization source of truth without ownership/handover agreement.

**Acceptance:** 1. Approved setup names current custodian, successor and actual organization folder/access arrangement.

**Owner:** Mahdy / President / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** access_admin_handover


##### Proposed v1 stores records, notes and external links

ID: scope_links_default · proposed · P0

Use compact metadata/database records, native lightweight notes and internal folders; working PDF/office/design documents remain at approved external destinations. This baseline controls cost within target Rp35,000/month and hard ceiling Rp50,000/month. Native binary uploads, provider mirroring, heavy previews and unlimited revisions stay deferred unless separately approved. Evidence/review can still bind supplied version URLs and notes.

**Acceptance:** 1. All six minimum journeys can finish with internal notes/folders and document URLs, with native binary upload excluded from launch cost assumptions.

**Owner:** Mahdy / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** scope_org_storage_setup
resource_types


##### Optional services cannot become hidden launch dependencies

ID: scope_optional_services · proposed · P0

Sign-in provider and invitation channel are operations choices; provider setup/domain ownership are not assumed. Core external resources open by normal URL without API integration. Background reminders, file indexing, social delivery and automation require explicit later owner/cost/use case.

**Acceptance:** 1. Core task/resource/report journey succeeds when optional integration credentials are absent.

**Owner:** Mahdy / engineering

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** scope_links_default


##### Document complete direction while releasing validated minimum paths

ID: scope_future_manifest · proposed · P0

P1/P2 branches keep recruitment detail, advanced capacity, richer analytics and integrations visible without promising launch completion. Moving a requirement to P0 requires a real use case, data need, maintainer, cost impact and acceptance scenario. Large PRD coverage is not automatic v1 scope adoption.

**Acceptance:** 1. Release manifest separates shipped requirements, open blockers and deferred capabilities.

**Owner:** Product owner

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.


#### Organization, workspaces, and batch continuity

ID: organization · proposed · P0

DWDG’ONE serves DWDG UII through one organizational model. Separate stable teams, workspaces, batch memberships, reporting lines, and enabled capabilities so future restructuring does not require rewriting pages.

**Acceptance:** 1. Current six divisions can be represented, renamed, and later restructured without changing record identity.

**Owner:** Mahdy / organizational leadership

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


##### DWDG’ONE — Universitas Islam Indonesia

ID: org_identity · confirmed · P0

The user selected DWDG’ONE as the web app name and Universitas Islam Indonesia as its organization context. Use one exact display spelling across the planning artifact, later login, shell, reports, and exports. Confirm apostrophe treatment for domain names and compact wordmark separately.

**Acceptance:** 1. All product-facing planning references use DWDG’ONE; older names appear only as historical source labels.

**Owner:** Mahdy

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages.


##### One Workspace concept; project tabs are Overview, Work, Resources

ID: org_vocabulary · confirmed · P0

Workspace means organizational/division context. A project is a bounded piece of work within that context. Work contains tasks/timeline/board/milestones. Resources combines folders/files/notes/apps/links. Remove ambiguous project Workspace labels and duplicate navigational entry points.

**Acceptance:** 1. A user can explain the hierarchy organization → workspace → project without a second Workspace tab.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


##### Keep six current divisions active

ID: org_current_six · confirmed · P0

Strategy & Growth; Human Resource; External Engagement; Marketing, Communication & IT; Legal & Finance; Consulting. Client Engagement in the survey maps to External Engagement. Do not silently activate future teams or treat Client Engagement as an extra seventh division.

**Acceptance:** 1. All six current workspaces are represented once; historical survey naming is mapped transparently.

**Owner:** Organizational leadership

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


##### Team identity survives rename or reparenting

ID: org_team_identity · proposed · P0

Each team has a stable ID, display name, short name, active/planned/archived state, and optional parent reporting unit. Store names as labels, never foreign keys. Renaming Legal & Finance changes its label while tasks, resources, permissions, reports, and history remain linked.

**Acceptance:** 1. Rename a seeded team, reload, and verify its project, membership, resource, and audit links still resolve.

**Owner:** Product / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_current_six


##### Workspace enables capabilities without becoming another app

ID: org_workspace_config · proposed · P0

A workspace maps to an organizational unit and enables shared pages plus selected domain tools. Team hierarchy, workspace visibility, and capability flags are separate. Splitting Legal & Finance later can enable legal tools in Legal and finance tools in Finance without copying their entire records.

**Acceptance:** 1. A workspace can enable or disable a capability without changing shared project IDs or losing historical records.

**Owner:** Admin / product

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** org_team_identity
access_action_matrix


##### Batch stores dated membership and leadership

ID: org_batch_model · proposed · P0

A batch has ID, name, start/end dates, draft/active/closed state, and reporting configuration. A person can hold different roles in different batches. Only one batch is active for ordinary navigation; closed batches remain readable by authorized users. Do not infer current role from last year's role.

**Acceptance:** 1. Switching the active batch changes current roles without rewriting prior task authors or approval actors.

**Owner:** Admin / HR

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_team_identity


##### Validate reporting lines as an acyclic organization tree

ID: org_reporting_graph · proposed · P0

A reporting assignment joins team, supervising role/unit, and batch. Reject self-parenting, cycles, duplicate active parent lines, and inaccessible orphan teams. VP visibility derives from explicit reporting assignments, not title string matching.

**Acceptance:** 1. A cycle or missing supervising assignment blocks activation with a list of affected teams.

**Owner:** Admin

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_batch_model


##### Future three-VP structure remains a draft

ID: org_future_three_vp · confirmed · P1

President → VP External: MarCom & IT and External Engagement with Client/Partnership. VP Internal: HR, S&G, Legal, Finance. VP Consulting: Project Delivery (provisional), Knowledge, Training. This is discussed future structure, not an assertion of current leadership assignments.

**Acceptance:** 1. Future units appear in organization planning only and stay out of member navigation until explicit batch activation.

**Owner:** President / Mahdy

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_current_six


##### Expert Network remains planned two batches ahead

ID: org_expert_network · confirmed · P2

Expert Network was discussed for two batches ahead; its reporting relationship is undecided. Keep it as a planned unit with notes and a decision owner. No ordinary membership, access scope, or operational workflow is implied yet.

**Acceptance:** 1. Expert Network is visibly planned, has no active member navigation, and has an explicit reporting decision marked open.

**Owner:** Organizational leadership

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_future_three_vp


##### Activate a batch only after a reviewed mapping

ID: org_activation_preview · proposed · P0

Preview proposed hierarchy, members, leadership, workspaces, enabled capabilities, open projects, resource ownership, and orphan records. Require all P0 assignments to be resolved. Activation records who approved, when, and which configuration version became active; reverting is a separate audited operation.

**Acceptance:** 1. Dry-run lists unresolved assignments and produces no membership or project mutations; approved activation preserves previous batch history.

**Owner:** Admin / President

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_batch_model,org_reporting_graph


##### Split or merge divisions with explicit record destinations

ID: org_split_merge · proposed · P1

For Legal & Finance split, choose destination for legal requests, budgets, finance requests, shared projects, members, resources, and approvals. A preview identifies ambiguous records and permissions. Preserve IDs and historical origin; never guess destination from a title. Merges avoid duplicate copied tasks.

**Acceptance:** 1. A split can be cancelled without change; applied mapping leaves no active record in an undefined workspace.

**Owner:** Admin / affected division leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_activation_preview


##### Preserve historical organization context

ID: org_history_snapshot · proposed · P0

Activity and approvals show actor identity and role/team at the time of the event, with current identity available separately. Closed-batch reports use the relevant batch scope. Reparenting a team does not rewrite who supervised a prior approval.

**Acceptance:** 1. A historical project report remains traceable after a team rename, leader change, and new batch activation.

**Owner:** Admin / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** org_batch_model


##### Archive teams without deleting their work

ID: org_team_archive · proposed · P1

Archived teams stop receiving new work and leave ordinary navigation. Before archive, transfer open work and ownership or leave an explicit restricted historical owner. Historical resources remain retrievable within retention/access policy. A project cannot be assigned to an archived workspace.

**Acceptance:** 1. Archiving blocks new assignment, preserves read access for authorized historical review, and exposes any untransferred open work.

**Owner:** Admin

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_workspace_config


##### Batch handover includes operational ownership

ID: org_handover · proposed · P0

Outgoing leads review open tasks, blockers, pending legal/finance approvals, partner follow-ups, current resources, subscriptions, and account ownership. Create a handover checklist and snapshot references; incoming leaders acknowledge assigned areas. Do not copy private passwords into a handover note.

**Acceptance:** 1. An incoming lead can locate every open responsibility and the approved resource/account contact without reconstructing WhatsApp history.

**Owner:** President / division leads / HR

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_history_snapshot


##### Prepare isolated organization IDs; defer other-organization onboarding

ID: org_other_orgs · deferred · P2

Include organization ID in authorization and all scoped records now, but v1 launches for DWDG UII. Self-service tenants, billing, branding for other organizations, and cross-organization memberships are deferred. Future scalability must not expose DWDG data to another organization.

**Acceptance:** 1. Architecture review shows explicit organization boundaries; v1 navigation and onboarding promise only DWDG UII.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** org_identity


##### Use Asia/Jakarta date semantics consistently

ID: org_timezone_calendar · proposed · P0

Proposed organization timezone Asia/Jakarta follows user locale. Store real timed instants with timezone interpretation and date-only due dates separately. Calendar reminders/activity boundaries follow defined organization or record timezone, never execution-host timezone.

**Acceptance:** 1. Midnight and cross-day meeting fixtures render on correct Jakarta dates; date-only deadlines do not shift.

**Owner:** Engineering

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. User environment Asia/Jakarta.


##### Capability policy has owner and version across restructuring

ID: org_capability_owner · proposed · P1

Moving legal/finance tools to future teams transfers queue ownership through reviewed mapping. Preserve original batch/policy attribution; team rename cannot reset approved workflow stages/SLAs. Record capability owner, version and team mapping independently from navigation.

**Acceptance:** 1. Reparenting preview lists pending records/policy owner and activation leaves no unowned request.

**Owner:** Admin / domain leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** org_split_merge


##### Verified duplicate person merge preserves authorship

ID: org_person_merge · proposed · P1

Potential duplicate accounts require verified identifier and admin review. Name similarity cannot prove same person. Preview memberships/tasks/resources/events, retain aliases/provenance and preserve historical actor references. Do not create a second member on repeat invite acceptance.

**Acceptance:** 1. Verified merge preserves all ownership and historical actor links while same-name distinct people remain separate.

**Owner:** Admin / HR

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** hr_person,access_invitation


#### People, roles, and record permissions

ID: access · proposed · P0

Separate permission to enter a workspace from permission to edit, delegate, approve, export, archive, or manage organization settings. UI, server, files, notifications, reports, and direct links must use the same scope.

**Acceptance:** 1. A permission matrix covers every P0 object/action and is tested through UI and service requests.

**Owner:** Admin / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


##### Mahdy is intended administrator across all active workspaces

ID: access_admin_scope · confirmed · P0

This is a planning identity decision. Bind Mahdy to a verified account ID at setup; a display name or matching email string in a client script cannot confer admin rights. Proposed admin actions include organization configuration and membership management.

**Acceptance:** 1. The intended administrator is explicitly named; actual account binding remains a launch setup item.

**Owner:** Mahdy

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_current_six


##### President can view all active workspaces

ID: access_president_scope · confirmed · P0

President visibility includes all current organizational workspaces. The title does not automatically confer system-admin privileges, financial approval, legal signature execution, or unrestricted destructive actions. Action rights need their own recorded policy.

**Acceptance:** 1. President's permitted workspace list includes all active current units; admin-only controls remain governed separately.

**Owner:** President

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_action_matrix


##### VP can switch only within reporting divisions and subteams

ID: access_vp_scope · confirmed · P0

Derive the VP's permitted set from the active batch reporting graph. Parent portfolio summarizes only that set. Current VP titles and assigned divisions are not yet supplied; use explicit configuration and avoid guessing them from the future draft.

**Acceptance:** 1. For eachVP fixture, allowed workspace IDs equal its effective reporting descendants exactly.
2. A reporting change invalidates0 unrelated work records and grants0 unrelated divisions.

**Owner:** Admin / VPs

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_reporting_graph
access_action_matrix


##### Ordinary member opens only their assigned division workspace

ID: access_member_scope · confirmed · P0

The user decided members should stay within their assigned division. A task assignment in another team cannot silently grant the entire team workspace. Multiple membership and project collaboration exceptions require explicit permission records and product policy.

**Acceptance:** 1. A normal1-division member can see exactly its permitted workspace and0 other full division workspaces.
2. Any adopted cross-division project exception exposes only its explicitly allowed records, not an extra full workspace.

**Owner:** Admin / division leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope


##### Versioned action-level permission matrix

ID: access_action_matrix · proposed · P0

Define read/create/update/assign/review/approve/archive/restore/export/manage_members/manage_roles per object type, role, and scope. Proposed defaults: members edit own assigned work; project leads manage project work; domain approvers own approvals; Admin manages access. Avoid a single broad canEdit flag.

**Acceptance:** 1. The adopted matrix covers read/create/update/assign/review/approve/archive/restore/export/manage_members/manage_roles for every adopted object family.
2. All tested actor/action/scope cells produce expected allow/deny;0 undefined default-allow cells.
3. Member,lead,VP,President,admin and independent-review fixtures include at least6 role categories.

**Owner:** Mahdy / President / domain leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.


##### Resolve current leaders and reporting assignments

ID: access_current_leaders · open · P0

Open input: current President account, current VP roles, division leaders, and which teams each VP supervises. Do not seed invented people or treat the discussed three-VP model as already active. Launch invitation/setup is blocked until these authoritative assignments exist.

**Acceptance:** 1. Approved roster records identify every current leadership account and its actual scope before launch.

**Owner:** Mahdy / President

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_batch_model


##### Member edits assigned tasks and contributes authorized evidence

ID: access_member_edit · proposed · P0

Proposed member default: read allowed workspace projects/resources, update their assigned task status/evidence, add comments/notes in allowed records, and create drafts within policy. Changing another person's owner, closing a project, and removing other people's resources need elevated rights.

**Acceptance:** 1. An ordinary member can finish their task and add evidence but cannot reassign another member or delete an unrelated file.

**Owner:** Division leads / product

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S04/S16.

**Dependencies:** access_action_matrix


##### PL and PM permissions are distinct from organization rank

ID: access_project_roles · proposed · P0

Survey explicitly asks separate PL/PM rights. Proposed PL owns solution scope/content and delivery review; PM manages schedule, task coordination, risks, and client-update records. A person may hold both with explicit assignment. President/VP visibility alone does not imply PL/PM authority.

**Acceptance:** 1. A PL can record solution approval, a PM can adjust approved delivery schedule, and each action is traceable.

**Owner:** Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** access_action_matrix


##### Confirm who can approve, record payment, and view sensitive finance

ID: access_finance_policy · open · P0

Open policy: approver titles, approval limits, dual-review requirements, treasurer/payment-recorder role, and who may export financial evidence. Proposed requester cannot approve own request. Approval is a record of an authorized human decision; the app does not move funds.

**Acceptance:** 1. Launch policy names approvers and amount rules and prevents a requester from self-approving.

**Owner:** Finance lead / President

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4/H4.

**Dependencies:** access_action_matrix


##### Confirm legal review and document-signature authority

ID: access_legal_policy · open · P0

Open policy: reviewers, official signatories, numbering issuer, revision approval, and final archive rights. User rank and access to Legal & Finance do not prove authority to sign. v1 records signature status/evidence, with actual e-sign execution deferred.

**Acceptance:** 1. Each legal stage action has a named role; UI status wording does not imply the app executed a signature.

**Owner:** Legal lead / President

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J5.

**Dependencies:** access_action_matrix


##### Project grants allow limited cross-division collaboration

ID: access_project_collab · proposed · P0

Proposed grant joins user/team, project ID, allowed actions, reason, issuing actor, and expiry or batch. It opens only explicitly shared project work/resources. Sensitive HR/finance/legal items retain tighter restrictions. Declining or ending a grant removes project access without moving workspace membership.

**Acceptance:** 1. A member assigned to a shared project can open allowed project records while other division projects remain hidden.

**Owner:** Admin / project lead

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_member_scope,access_action_matrix


##### Invitations carry minimum explicit membership

ID: access_invitation · proposed · P0

Invite a verified account into an organization, batch, team, and role with expiry. Proposed pending → accepted → active, expired/revoked branches. Duplicate invitation reuses or replaces the pending invite; it never creates a second person identity. Default grants no workspace until accepted and assigned.

**Acceptance:** 1. An unaccepted invite cannot read data; an accepted invite opens only its assigned workspace.

**Owner:** Admin / HR

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_current_leaders
access_action_matrix


##### Suspension and access revocation apply immediately to new actions

ID: access_revocation · proposed · P0

Suspended/inactive membership blocks service reads/writes and new file links. UI refreshes scope, closes inaccessible details, and preserves an unsaved draft privately for review without allowing save to revoked context. Transfer assigned open tasks or show an unassigned owner warning.

**Acceptance:** 1. A revoked member cannot save a stale open form or use an old download link beyond its defined expiry.

**Owner:** Admin / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope


##### One access filter for navigation, search, counts, charts, files, and export

ID: access_surface_scope · proposed · P0

Apply permissions before constructing results or aggregates. Hidden records must not leak titles, owner names, counts, reminders, or autocomplete suggestions. Server authorization is authoritative; hiding a sidebar item alone is insufficient for production.

**Acceptance:** 1. Navigation/search/counts/charts/resource/history/export share the same allowed-record fixture IDs.
2. ForA-only/B-only/revoked/explicit-project-collaborator fixtures,0 unauthorized IDs,fields or counts leak.

**Owner:** Engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_action_matrix


##### Restricted records expose only allowed fields

ID: access_sensitive_data · proposed · P0

Proposed restricted classes: recruitment contact/private review, financial evidence/payment detail, legal signatory/contact data, and client confidential documents. Store access class and reason, rather than marking an entire workspace private by habit. Shared task title cannot reveal confidential content unintentionally.

**Acceptance:** 1. A member without restricted access sees a neutral unavailable link, never restricted field values or preview thumbnails.

**Owner:** HR / Legal / Finance / Consulting leads

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.

**Dependencies:** access_surface_scope


##### Audit role changes and high-consequence actions

ID: access_audit · proposed · P0

Record trusted actor/action/object/time/version/operation correlation and allowed before/after fields for permission changes, approvals, export, archive/restore, batch activation and number issuance. Ordinary members cannot edit events. User-facing Changes remains selected-workspace-only and applies record/field privacy. Privileged organization/security maintenance log is separate and restricted, with no implied right to broadcast cross-workspace history.

**Acceptance:** 1. Admin can audit role/approval authority through authorized maintenance path while ordinary Changes never mixes workspaces or leaks restricted fields.

**Owner:** Admin / engineering

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_action_matrix


##### Delegation chooses from eligible people and keeps accountable owner

ID: access_delegation · proposed · P0

Delegating resource/work responsibility shows only eligible project/workspace people. Multiple contributors are allowed, but one accountable owner remains explicit. Assignment never grants hidden workspace access and must offer the project's explicit grant flow where necessary.

**Acceptance:** 1. Assigning an inaccessible person yields a clear permission decision, not a broken link or automatic broad access.

**Owner:** Project / division leads

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_project_collab
access_action_matrix


##### Designed not-found and access-denied states

ID: access_denied · proposed · P0

Do not reveal whether a confidential record exists through title/detail/error messages. Provide a route back to the permitted workspace and an appropriate access-request contact when policy allows. Deleted records are distinguishable to authorized users through trash/history.

**Acceptance:** 1. Opening a copied forbidden URL reveals no record metadata and leaves the user with a usable return path.

**Owner:** Product / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope


##### Resolve successor admin and emergency access ownership

ID: access_admin_handover · open · P0

Open decision: who is the second administrator or successor, what approved recovery process applies, and who owns domain/hosting/backups. A student organization cannot depend permanently on one graduating person's account. Admin transition requires verification and audit.

**Acceptance:** 1. Launch handover names a verified successor and recovery owner; no secret is stored in ordinary planning notes.

**Owner:** Mahdy / President

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.


##### Context access inheritance is distinct from folder responsibility

ID: access_resource_inheritance · proposed · P0

A resource defaults to organization/workspace/project boundary. Parent-folder responsibility is context, never automatic child task assignment or provider permission. Child restrictions may narrow access; broader child sharing uses explicit approved grant and never exposes siblings.

**Acceptance:** 1. Adding folder owner creates no child task/member/provider grant.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** resource_responsibility,resource_folder


##### Restricted URL disclosure is an action permission

ID: access_url_disclosure · proposed · P0

A neutral project task may be visible while related contract URL/contact evidence remains private. Hide restricted URL/snippet/thumbnail in notification/search/export. Provider access is separate; DWDG should not spread a private location through a public description.

**Acceptance:** 1. Restricted URL does not appear in unauthorized task notification or metadata export.

**Owner:** Legal / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** access_sensitive_data


##### Notifications recheck access after a queued event

ID: access_notification_revoked · proposed · P0

Render/delivery resolves current membership/grant, not event-time scope alone. Stale inbox links become neutral unavailable. If later external delivery is enabled, check scope immediately before send and avoid private title/body if recipient was revoked.

**Acceptance:** 1. Revoke grant after event creation and opening inbox reveals no previous project metadata.

**Owner:** Engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** access_revocation,work_updates


##### Required independent approval cannot be fulfilled by role-switching

ID: access_independent_review · proposed · P0

Author submits work but cannot satisfy independent gate unless adopted small-team exception allows it. Exception records authority/reason/reviewed version. Same person PL+PM does not automatically satisfy client, legal or financial approval.

**Acceptance:** 1. Changing displayed role cannot let requester approve their own financial request.

**Owner:** Domain approvers

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8/J5.

**Dependencies:** access_review_self_policy


##### Adopt explicit small-team reviewer separation policy

ID: access_review_self_policy · open · P0

Open: which review gates require a second person, and what happens when only one qualified reviewer exists. Proposed rule requires designated alternate or documented exception, not blocked anonymous dead-end. Student organization policy can stay lightweight while preserving accountability.

**Acceptance:** 1. Every independent gate has alternate/exception path approved by leadership.

**Owner:** President / domain leads

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** access_action_matrix


##### Operational summary export excludes restricted fields

ID: access_sensitive_export · proposed · P0

A leadership viewer may export progress without private applicant review, receipts or signatory details. Export permission is separate from detail-field permission. Manifest explains excluded classes without leaking values; organization-wide archive/export is audited authorized-owner action.

**Acceptance:** 1. Operational export omits private receipt/candidate fields under agreed matrix.

**Owner:** Admin / domain leads

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** analytics_reports


##### Pending approval can transfer; historical approval actor stays intact

ID: access_approver_transfer · proposed · P0

When approver leaves, authorized lead transfers pending queue with reason/notification. Successor reviews current version under own identity. Completed decisions retain original actor/batch role. Missing alternate shows escalation owner rather than silently auto-approving.

**Acceptance:** 1. Offboarding approver leaves no dead pending queue and does not rewrite completed approvals.

**Owner:** Admin / domain leads

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** hr_roster_change


#### Six divisions with distinct tools and shared records

ID: divisions · proposed · P0

Current six workspaces remain active, each with a fitted working composition. Specialized domain records link shared tasks/resources/schedule/decisions rather than running six disconnected task managers. HR and Strategy processes remain proposed pending direct validation.

**Acceptance:** 1. Every current division has a launch-minimum workflow and evidence status; shared changes reflect across views.

**Owner:** Division leads / product

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


##### Strategy & Growth: initiatives, research, and dependencies

ID: division_strategy · proposed · P0

No Strategy respondent is represented in the eight-response survey. Retain existing proposed initiative/research/dependency direction as a hypothesis. Initial working layout is Now/Next/Later initiatives, shared milestones and decision trail, subject to S&G lead validation.

**Acceptance:** 1. S&G lead can assess the proposed journey and identify required fields before launch.

**Owner:** Strategy & Growth lead

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.

**Dependencies:** org_current_six


###### Initiative records goal, evidence, horizon, and responsible owner

ID: strategy_initiative · proposed · P0

Fields: title, strategic objective, problem statement, owning workspace/owner, Now/Next/Later horizon, hypothesis, research/evidence links, decision status, linked project and review date. Horizon reflects explicit planning choice, not a predicted impact score.

**Acceptance:** 1. Changing horizon updates initiative view without changing its project/task identity.

**Owner:** S&G lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** work_decisions


###### Research note stores source, date, finding, and implication

ID: strategy_research · proposed · P0

Use shared resource notes with source URL/file, observed date, method or context, finding, uncertainty and proposed decision. Keep factual observation separate from team recommendation. Attach to initiative/project instead of maintaining another research database in v1.

**Acceptance:** 1. A research finding links its evidence and the decision it informs; an unknown source/date remains visibly missing.

**Owner:** S&G researchers

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** resource_notes


###### Strategy review turns initiatives into an explicit decision

ID: strategy_reviews · proposed · P0

Proposed idea → research → decision pending → approved for delivery / hold / rejected. Approved initiative links a project, accountable owner and milestone; rejection/hold includes reason and review date. Approval does not fabricate a project start timestamp.

**Acceptance:** 1. Approving an initiative creates or links one delivery project and leaves evidence/rationale traceable.

**Owner:** S&G lead / authorized leadership

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** strategy_initiative,work_decisions


###### Cross-division strategy plan exposes obligations

ID: strategy_dependencies · proposed · P0

Record dependency on another workspace's actual task/milestone, owner, needed-by date and requested action. Use accessible dependency list/chain as primary fallback; no default impact×certainty matrix without a validated process. Leadership drilldown follows access scope.

**Acceptance:** 1. Selecting a dependency opens its authorized canonical record and an invalid circular dependency is rejected.

**Owner:** S&G / PM

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** work_dependencies


###### Confirm S&G cadence, reporting outputs, and decision authority

ID: strategy_validation · open · P0

Open inputs: real recurring programs, annual/quarterly planning cadence, research categories, required output, approvers and how Now/Next/Later is used. Do not present assistant-generated initiative examples as real organization records.

**Acceptance:** 1. A direct S&G walkthrough either approves these fields or edits them before implementation scope freezes.

**Owner:** S&G lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.

**Dependencies:** org_current_six


###### Metric needs unit, source, owner and actual observation

ID: strategy_metric_definition · proposed · P1

Proposed registry: name/definition/goal/unit/source link/period/owner and actual supplied value. Targets human-entered; missing source/value unavailable. Budgeted v1 can link maintained Sheet instead of native KPI engine. No general performance score inferred from task counts.

**Acceptance:** 1. Unsourced metric never renders successful trend or score.

**Owner:** S&G lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** strategy_validation


###### Experiment closes with evidence or inconclusive outcome

ID: strategy_experiment · proposed · P1

Optional hypothesis/intervention/measurement plan/owner/review date/project/resources/result/decision. Completion of tasks is not proof of causal improvement. Rejected/inconclusive result stays usable finding; special experimentation engine not needed at launch.

**Acceptance:** 1. Close requires evidence/result or explicit inconclusive state.

**Owner:** S&G lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** strategy_research


###### Strategy decision queue and export preserve planning evidence

ID: strategy_events_export · proposed · P1

Notify reviewer of decision request and owner of review/dependency due. Export scoped initiative goal/horizon/owner/review date/decision/source/date/project links. No impact ranking without adopted metric; historical batch report preserves then-current state.

**Acceptance:** 1. Decision request appears once and exported horizon/source match saved records.

**Owner:** S&G lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** work_updates,analytics_reports


###### S&G concrete validation: observe → decide → deliver

ID: strategy_acceptance · proposed · P0

Research note/evidence → initiative horizon/owner → decision → linked project → real cross-team prerequisite → review → scoped export. Use lead-provided real example later; sandbox sample fictitious. Record approved field/authority choices.

**Acceptance:** 1. Lead completes scenario and explicitly validates or edits workflow hypotheses.

**Owner:** S&G lead / QA

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** strategy_validation


##### Human Resource: recruitment, onboarding, people, and development

ID: division_hr · proposed · P0

HR has no respondent in the eight-response sample. Initial proposal emphasizes people rather than a generic project dashboard, with recruitment queue, onboarding checklists and membership/batch continuity. Sensitive applicant/review data requires tighter access.

**Acceptance:** 1. HR lead validates the proposed minimum journey; applicant detail is not exposed through ordinary member search.

**Owner:** HR lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.

**Dependencies:** org_current_six


###### People directory separates identity from batch membership

ID: hr_person · proposed · P0

Person profile stores display name, avatar, contact fields needed for DWDG, active account reference and authorized skill/role metadata. Batch membership stores team, role, joined/left state and dates. Do not call student members employees or add payroll fields.

**Acceptance:** 1. One person can move teams next batch without duplicate profile or rewritten historic authorship.

**Owner:** HR / Admin

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** org_batch_model


###### Recruitment application has candidate, stage, owner, and evidence

ID: hr_recruitment · proposed · P1

Proposed application fields: cycle/batch, candidate contact, preferred teams, source, responsible reviewer, stage and linked application resource. Proposed new → screening → interview → decision → accepted/rejected/withdrawn. Exact stages and scoring policy remain open; no inferred ranking.

**Acceptance:** 1. A recruiter can move one candidate with actor/time and restrict private review fields.

**Owner:** HR lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_sensitive_data


###### Onboarding checklist creates real assigned work

ID: hr_onboarding · proposed · P0

Accepted member receives workspace membership and checklist for orientation, required documents, policy acknowledgment, account access and first assigned work. Checklist items have owner/due/evidence; status uses saved completion fields. A percent cannot imply acceptance of missing documents.

**Acceptance:** 1. An onboarded member receives only correct workspace access and checklist progress matches saved items.

**Owner:** HR / team lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_invitation


###### Roster change transfers outstanding ownership

ID: hr_roster_change · proposed · P0

Membership active → leave/inactive/alumni with date and reason under approved privacy policy. Before removing access, show assigned tasks/resources/approvals/follow-ups. Transfer or leave explicit unresolved queue; suspension does not delete contributions or earlier audit identity.

**Acceptance:** 1. Leaving member loses current access while tasks and resource ownership have a visible successor or unresolved state.

**Owner:** HR / Admin

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_revocation


###### Development plans use shared training work without performance scores

ID: hr_development · proposed · P1

Proposed development record contains member, agreed goal, mentor/owner, linked training project/session, resources and follow-up date. Record participation/evidence only when supplied. Avoid employee performance grades, inferred productivity or automatic promotions.

**Acceptance:** 1. A development plan can link a session and evidence without inventing a score or duplicating the training project.

**Owner:** HR / future Training lead

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_meeting_outcomes


###### Confirm HR privacy, recruitment, and member-offboarding policy

ID: hr_validation · open · P0

Open inputs: candidate fields, consent/contact retention, reviewer access, real stages, orientation checklist, leave/alumni behavior and approving roles. Gather direct HR feedback rather than extrapolating from Consulting/Legal survey responses.

**Acceptance:** 1. HR signs off required fields/access and identifies what candidate data should never enter v1.

**Owner:** HR lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.

**Dependencies:** org_current_six
access_sensitive_data


###### Attendance is declared per-event; unknown is preserved

ID: hr_attendance · proposed · P1

Optional invited/attended/excused/absent/unknown with marked-by/time and correction reason. Browser login is not attendance. Corrections retain event attribution. Attendance isn't payroll/productivity or automatic performance evaluation; HR policy controls use.

**Acceptance:** 1. Missing entry shows Unknown; correction preserves prior event and actor.

**Owner:** HR / meeting owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** hr_validation


###### Sensitive feedback/1:1 system requires policy before release

ID: hr_private_feedback · deferred · P2

Private participant/date/agreed-actions notes separate from public membership. Neutral follow-up task may link restricted source without exposing reason. Dedicated performance/feedback data stays deferred until purpose, access and retention approved; no employee-style ratings invented.

**Acceptance:** 1. Launch directory contains no unapproved private feedback/rating fields.

**Owner:** HR lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** access_sensitive_data


###### Candidate duplicate, withdrawal and acceptance do not mutate access silently

ID: hr_candidate_edgecases · proposed · P1

Duplicate contact/cycle warning needs review; same name isn't duplicate proof. Withdrawal cancels active evaluation/reminders per retention policy. Acceptance links invitation, never auto-activates account without membership approval. Private reviewer opinions remain restricted.

**Acceptance:** 1. Withdrawing candidate stops active interview reminder; accepting candidate creates no unintended broad access.

**Owner:** HR reviewer

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** hr_recruitment,access_invitation


###### HR notifications route by reviewer/onboarding/assigned-member responsibility

ID: hr_events · proposed · P1

Application assignment/interview change/decision request/onboarding due/access assignment/handover items go to eligible recipients. Private candidate decisions and absence reasons excluded from general division feed. User access updates don't reveal other teams' rosters.

**Acceptance:** 1. Candidate notification never exposes reviewer note to ordinary member.

**Owner:** HR / product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


###### Roster and onboarding export separate from restricted candidate records

ID: hr_exports · proposed · P0

Roster includes approved operational fields/batch membership; onboarding includes checklist state/owner/missing evidence. Candidate/private review export is restricted audited operation. Don't collect/export identity/health fields without genuine need; fields chosen before launch.

**Acceptance:** 1. Ordinary roster export contains no candidate/private review/absence reason.

**Owner:** HR / Admin

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** access_sensitive_export


###### HR scenario covers invite, onboarding, transfer and departure

ID: hr_acceptance · proposed · P0

Invite → verified accept → correct own workspace → checklist/follow-up → next-batch team move → offboard/revoke → assign successor → preserve contribution. Sandbox identity is fake. One person record persists across transitions and all open ownership is resolved or visible.

**Acceptance:** 1. No duplicated member/orphan task and departed account loses access immediately.

**Owner:** HR / Admin / QA

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** hr_roster_change,org_handover


##### External Engagement: client and partnership relationship work

ID: division_external · proposed · P0

Survey Client Engagement has one response and maps here. Need clear PIC, partnership timeline, mobile follow-up and reminders. A relationship record links work/legal/resources; v1 does not automatically send messages or become an unrestricted CRM.

**Acceptance:** 1. Create relationship → assign PIC → log interaction → schedule follow-up → link project works without duplicate entry.

**Owner:** External Engagement lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D6:J6; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_current_six


###### Relationship has organization, kind, owner, and contact

ID: external_relationship · proposed · P0

Fields: partner/client organization, relationship kind, accountable owner, authorized contact details, stage, source, next follow-up, linked project/resources and notes. Client/Partnership are proposed categories or future teams, not newly active current divisions. Mark contact source and avoid invented records.

**Acceptance:** 1. One relationship links2 projects and retains exactly1 accountable PIC plus the recorded next action.
2. 0 contacts are exposed outside the adopted contact-field policy.

**Owner:** External Engagement PIC

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E6/F6; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_sensitive_data


###### Stages are explicit configurable relationship state

ID: external_stages · proposed · P0

Proposed prospect → contacted → discussion → agreement in review → active → paused/closed. Lost/declined needs reason. Legal agreement state is linked evidence, never inferred solely from CRM stage. Actual vocabulary should be confirmed by External lead before freezing.

**Acceptance:** 1. Selecting a stage count filters exactly the saved relationship records in that stage.

**Owner:** External Engagement lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F6.

**Dependencies:** external_relationship


###### Follow-up is a canonical task linked to relationship

ID: external_followup · proposed · P0

Store owner, due date or real meeting time, requested outcome, communication channel and state. Completing records outcome and offers next follow-up; creating next task is an explicit action. Overdue follows deadline and cannot disappear when relationship stage changes.

**Acceptance:** 1. A mobile PIC sees the same follow-up in relationship detail, My tasks and Schedule.

**Owner:** Relationship PIC

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_fields,work_reminders


###### Interaction log records what happened and what is next

ID: external_interaction · proposed · P0

Fields: occurred date/time if known, channel, participants, concise summary, evidence resource, and follow-up task. Historical unknown time stays date-only. An internal log entry cannot claim email/WhatsApp delivery; external communication is performed in the external tool.

**Acceptance:** 1. Logging a call creates one dated interaction and optional follow-up with clear external-delivery status.

**Owner:** Relationship PIC

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6.

**Dependencies:** external_followup


###### Client handoff connects Consulting, Legal, and Finance

ID: external_handoff · proposed · P0

Create project from approved opportunity by linking existing relationship/contact, scope brief and decision. Legal request links same parties; Finance receives approved handoff references. Cross-division participants need explicit project grants; copying contacts/resources into multiple silos is avoided.

**Acceptance:** 1. A client project can trace origin, agreement request and delivery owner through existing IDs.

**Owner:** External lead / Consulting / Legal

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5/J8.

**Dependencies:** access_project_collab,work_decisions


###### Contact data and stale relationship handling are controlled

ID: external_directory_privacy · proposed · P1

Limit contact fields to operational need; disclose to approved project/team only. Archive duplicate/stale contacts with links preserved. Merging duplicate organization names requires review of projects/follow-ups; a matching name cannot trigger automatic merge.

**Acceptance:** 1. Duplicate merge preview exposes affected links and an archived contact's history remains traceable.

**Owner:** External lead

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.

**Dependencies:** access_sensitive_data


###### Confirm relationship stages, follow-up rhythm, and external channels

ID: external_validation · open · P0

One response supplies direction, not complete SOP. Open inputs: stage definitions, current contact owners, follow-up thresholds, confidentiality categories, and whether v1 email digest is enough. Telegram/WhatsApp bots remain deferred unless funded and deliberately selected.

**Acceptance:** 1. Lead approves the stage/owner fields and accepts the launch reminder-channel policy.

**Owner:** External Engagement lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D6:J6.

**Dependencies:** external_stages


###### Opportunity is optional actual brief and next decision

ID: external_opportunity · proposed · P1

Child of relationship with requested problem/service/owner/stage/timeline/proposal/decision/next action. Amount/probability optional supplied estimates with basis. No weighted revenue pipeline in budgeted first version; convert to linked project without copying contacts.

**Acceptance:** 1. Opportunity becomes one project while preserving same relationship/contact IDs.

**Owner:** External / Consulting

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** external_handoff


###### No-response follow-up preserves attempt and next action

ID: external_no_response · proposed · P0

Outcomes attempted/no response/responded/rescheduled are explicit. Completion of contact task doesn't mean partnership succeeded. Postponed due date logs reason; next follow-up is explicit task. Closing relationship resolves or cancels remaining tasks visibly.

**Acceptance:** 1. No-response can create next task while original attempt remains in history.

**Owner:** PIC

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** external_followup


###### Relationship merge reviews agreements and open follow-ups

ID: external_duplicate_merge · proposed · P1

Similar name may represent distinct client/partner engagements. Preview contacts/projects/follow-ups/agreements; keep alias/source/history and restrictions. A merge cannot broaden contract visibility or drop unresolved obligation.

**Acceptance:** 1. Merge retains all open follow-ups and private agreement access.

**Owner:** External lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** external_directory_privacy


###### PIC reminders and relationship exports represent real obligations

ID: external_events_export · proposed · P0

Notify assignment/follow-up due/date change/proposal review/agreement-ready/handoff. Mobile in-app catch-up first; CRM stage never asserts WhatsApp delivery. Export organization/kind/stage/PIC/next action/date/project and authorized contact fields only.

**Acceptance:** 1. Due item appears once, export dates match source and restricted contact omitted.

**Owner:** External / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** work_reminders,access_sensitive_export


###### External mobile journey connects outreach to approved delivery

ID: external_acceptance · proposed · P0

Relationship/contact → PIC → interaction → no response/follow-up → date change → proposal resource → legal request → Consulting project grant → stage/filter/export. Verify notes/URL-only resources and copied unauthorized link behavior.

**Acceptance:** 1. Mobile sequence keeps shared IDs/dates consistent and no provider message sent is implied.

**Owner:** External / Consulting / QA

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6/J5/J8.

**Dependencies:** external_handoff


##### Marketing, Communication & IT: content cadence and IT requests

ID: division_marketing · proposed · P0

Two survey responses require accessible shared data, executor deadlines, attractive usable UI, notes and proof of progress/completion. Keep publishing and IT work distinct capabilities on shared task/resource infrastructure, without separate app themes.

**Acceptance:** 1. Content review and IT request journeys both link shared work/resources while using relevant fields.

**Owner:** MarCom & IT lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D3:J3/D7:J7; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** org_current_six


###### Campaign groups goals, channels, content, owners, and resources

ID: marketing_campaign · proposed · P0

Fields: campaign name/purpose, accountable owner, date range, channels, audience note and linked project. Content items are children or linked records, not duplicated project tasks. Any target metric is user supplied with unit and source; v1 can operate without analytics targets.

**Acceptance:** 1. One campaign locates3 linked content items and2 asset references without duplicating their canonical IDs.
2. Engagement values are invented0 times; absent actual metrics remain unavailable.

**Owner:** MarCom lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_action_matrix
org_timezone_calendar


###### Content item records executor, deadline, stage, and evidence

ID: marketing_content · proposed · P0

Fields: title, campaign/project, content type/channel, responsible executor, planned publish date/time, internal due date, reviewers, asset/resource links, review note and published evidence URL/date. Planned schedule is distinct from actual publication; task progress evidence can be partial.

**Acceptance:** 1. Executor can add progress evidence and reviewer can open the same resource from the content record.

**Owner:** Content executor

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_fields,resource_revisions


###### Content moves through draft, review, revision, scheduled, and published

ID: marketing_lifecycle · proposed · P0

Proposed idea → drafting → review → revision requested → approved → scheduled → published; cancelled/archived branches. Reviewer and approval time recorded; publishing is recorded only with actual evidence or explicit authorized attestation. Scheduled date passing cannot automatically publish.

**Acceptance:** 1. A scheduled item remains scheduled until publication evidence/attestation is recorded.

**Owner:** MarCom reviewer / executor

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** marketing_content


###### Content calendar reconciles planned and actual dates

ID: marketing_cadence · proposed · P0

Schedule shows planned publications plus internal due dates with different labels. Stage counts and cadence select saved records. Unknown publication metrics remain unavailable; no Instagram analytics or channel delivery is implied without integration.

**Acceptance:** 1. Selecting a calendar day opens the planned items and distinguishes actual published evidence.

**Owner:** MarCom lead

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G3/J7.

**Dependencies:** work_schedule,marketing_lifecycle


###### Brand/asset library links approved versions and usage notes

ID: marketing_brand_assets · proposed · P0

Asset-link resources carry supplied current/approved version URL, asset kind, campaign/project, reviewer, usage notes and actual original source. Pin brand guideline/logo references when organization ownership exists. Provider link is not a stored immutable copy; owner supplies old-version evidence where review requires it.

**Acceptance:** 1. A content item points to its reviewed asset version and prior revisions remain available to authorized reviewers.

**Owner:** MarCom asset owner

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7.

**Dependencies:** resource_revisions


###### IT request has requester, system, severity, owner, and outcome

ID: marketing_it_requests · proposed · P0

Proposed request types: website issue, account/access assistance, internal tool change. Fields: problem, expected behavior, evidence, affected system, owner, priority and linked task. Proposed new → triaged → working → waiting → resolved/closed with requester confirmation. No password plaintext field.

**Acceptance:** 1. An IT requester can track status and outcome while account secrets remain outside ordinary records.

**Owner:** IT lead

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_secret_links


###### External accounts register responsibility and approved access path

ID: marketing_account_register · proposed · P0

Record service name, purpose, official organization owner/contact, access-request process, renewal/expiry and secure vault reference where approved. Do not store passwords, API keys or recovery codes in content notes, search or exports. Admin handover includes ownership verification.

**Acceptance:** 1. Searching an account finds the operational contact/access process and never exposes secret values.

**Owner:** IT / Admin

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J9; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_secret_links


###### Confirm publication approval and IT operating policy

ID: marketing_validation · open · P0

Open inputs: channel list, review authority, content type/stage names, due/publish timezone, evidence requirements, account owner and IT triage urgency. Survey asks for proof of work but does not specify a full editorial SOP.

**Acceptance:** 1. Lead approves reviewer rights and minimal fields for content and IT request types.

**Owner:** MarCom & IT lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D3:J3/D7:J7.

**Dependencies:** access_action_matrix
resource_provider_access


###### Internal executor due and external publication date are separate

ID: marketing_dates · proposed · P0

Draft/review due may precede scheduled publish. Date changes notify corresponding responsible people. Moving publish date doesn't rewrite completed task history or approve changed copy; actual publication time remains independent.

**Acceptance:** 1. Publish shift leaves executor/review history intact and flags actual conflict.

**Owner:** MarCom lead

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** marketing_content


###### New content version needs review of changed output

ID: marketing_stale_approval · proposed · P0

After approval, changed asset/copy marks approval stale or returns to review under policy. Keep old approval bound to old version. Minor metadata exemption requires adopted rule; scheduled state alone cannot authorize revised content.

**Acceptance:** 1. Approved item revised to new resource version becomes review-needed.

**Owner:** MarCom reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** marketing_lifecycle,resource_revisions


###### Multiple channels have individual publication evidence

ID: marketing_publication_records · proposed · P0

Destination URL/channel/actual time if known and manual attestation basis per publication. One channel published doesn't make all channels done. Broken/private provider link flagged; no automated engagement/availability claim. Submission note alone isn't evidence of external publish.

**Acceptance:** 1. Item can be published on one channel while another remains pending.

**Owner:** Executor / reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** marketing_content


###### Content and IT actionable events go to assigned role

ID: marketing_events · proposed · P0

Executor assigned/due; reviewer requested/revision returned/approval; schedule changed. IT triage/info-needed/resolved-awaiting-confirmation. No automated publishing or account-secret content in notification. Group repeated changes to same item.

**Acceptance:** 1. Reviewer and executor receive correct actions without unrelated member notifications.

**Owner:** MarCom & IT / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J7; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


###### Content and IT exports carry different operational fields

ID: marketing_exports · proposed · P0

Content: campaign/channel/type/executor/internal due/planned publish/actual publish/review/version/evidence URL. IT: system/request/owner/priority/state/opened/resolved. Exclude credentials and unsourced engagement metrics. Missing actual publication remains unavailable.

**Acceptance:** 1. Export preserves planned vs actual dates and includes no recovery/secret values.

**Owner:** MarCom & IT lead

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.

**Dependencies:** analytics_reports


###### Content and IT validation uses complete minimum journeys

ID: marketing_acceptance · proposed · P0

Content: create/assign/link draft/review return/new version/approve/schedule/actual evidence/export. IT: issue/triage/task/info request/resolve/requester confirm. Verify mobile/reload/save-failure and one task/resource relation with no paid provider integration.

**Acceptance:** 1. Both sequences complete and preserve canonical links plus external-action truth.

**Owner:** MarCom & IT / QA

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D3:J3/D7:J7; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** marketing_validation


##### Legal & Finance: legal requests, controlled handoffs, and money records

ID: division_legal_finance · proposed · P0

Two responses cover fragmented requests/register/templates and status visibility; one selected budget/expense tracking. Legal suggestions are highly specific but do not establish officially adopted numbering/SLA/signature rules. Track records and evidence; v1 does not execute legal signatures or payments.

**Acceptance:** 1. A legal request and related budget/request can be traced without claiming e-sign or money transfer.

**Owner:** Legal & Finance lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D4:J5; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.

**Dependencies:** org_current_six


###### Legal request replaces disconnected forms with structured intake

ID: legal_request · proposed · P0

Fields: requester/team/project, document type (NDA/PKS/BAST/SK/other), purpose, required-by date, signatory variables, counterpart, KAK/proposal resources, owner and confidentiality. Save incomplete draft; submission validates type-specific required fields. Requesters see authorized status without private reviewer notes.

**Acceptance:** 1. Submit a PKS request with signatory/KAK information and link the same client project/party IDs.

**Owner:** Legal requester / reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E5/J5.

**Dependencies:** access_legal_policy


###### Legal pipeline preserves review and revision evidence

ID: legal_pipeline · proposed · P0

Proposed draft → submitted → triaged → drafting → in review → revision requested → approved for signature → awaiting signature → signed → registered/archived; cancelled/rejected branches. Record actor/time and revision reason. Counterpart review and internal approval are distinct outcomes.

**Acceptance:** 1. A revision return links the reviewed version and required change; signed requires approved evidence/attestation.

**Owner:** Legal reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J5.

**Dependencies:** legal_request,resource_revisions


###### H-2/H-3 lead times are a respondent suggestion pending adoption

ID: legal_sla · open · P0

One respondent described H-2 ordinary letters and H-3 contracts/agreements. Confirm working/calendar days, cutoff time, urgent exception, holiday calendar and approving role before rules become mandatory. Proposed v1 warns about short notice; automatic rejection requires explicit adopted policy.

**Acceptance:** 1. UI cannot label these as official SOP until approved; configured urgency exception records approver and reason.

**Owner:** Legal lead / President

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5.

**Dependencies:** legal_request


###### Official document numbering needs atomic issuance and approved format

ID: legal_numbering · open · P0

Proposed server-assigned number only at authorized approval/registration, using approved type/batch/year sequence. Format, numbering moment, void/reserve/reissue policy and authority are open. Never duplicate numbers under simultaneous requests; cancelled number stays in logbook with reason rather than reused silently.

**Acceptance:** 1. Concurrent issuance yields unique immutable numbers and every voided number remains auditable.

**Owner:** Legal lead / engineering

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** legal_pipeline,access_legal_policy


###### Master templates have owner, version, and approved-use status

ID: legal_templates · proposed · P0

Register supplied external PKS Client, NDA, member contract, integrity pact and PD-PRT template references only when actual files and approving owner exist. Store current/retired state, version URL/evidence, owner and required variables. Draft links its used version; do not invent contract content, legal approval or existing shared repository.

**Acceptance:** 1. A request draft identifies the exact template revision used, and retired versions remain traceable.

**Owner:** Legal lead

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** resource_revisions


###### Signature status records evidence and outstanding signatories

ID: legal_signature_status · proposed · P0

Store expected signatories, requested/signed/declined state per party, evidence resource and date/actor if known. Missing evidence stays missing. v1 opens approved external process or records a supplied signed copy; actual e-signatures and identity verification are deferred integrations.

**Acceptance:** 1. Final record clearly distinguishes awaiting signature, supplied signed evidence, and unverified attestation.

**Owner:** Legal reviewer / authorized signatory

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J5.

**Dependencies:** access_legal_policy


###### PKS → BAST → invoice is a visible controlled handoff

ID: legal_bast_gate · proposed · P0

Survey asks signed PKS → verified BAST → invoice/payment-term trigger. Proposed v1 requires authorized linked evidence and checklist for each gate, with human approval and reason for exception. 'Ready for invoice' creates a Finance request/notification, never a payment or external invoice automatically.

**Acceptance:** 1. Unsigned PKS or unverified BAST prevents normal ready-for-invoice state; approved exception is recorded visibly.

**Owner:** Legal / Finance / Consulting

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** legal_signature_status,finance_request,consulting_review


###### Budget allocation records approved amount and scope

ID: finance_budget · proposed · P0

Fields: project/workspace/batch, category, allocated IDR amount, approver/date, revision reason and source. Proposed no allocation remains unavailable, not zero-budget success. Allocation changes preserve history and cannot fabricate revenue/account balance.

**Acceptance:** 1. Budget summary matches approved allocations and displays missing allocation explicitly.

**Owner:** Finance approver

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4/H4; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** access_finance_policy


###### Finance request records requested, approved, and paid amounts separately

ID: finance_request · proposed · P0

Fields: requester, purpose/project/category, IDR amount, payee/recipient metadata limited by policy, supporting resources, needed-by, approval state and payment evidence. Proposed draft → submitted → under review → approved/rejected → partially paid/paid → reconciled; cancelled branch with reason.

**Acceptance:** 1. A partial payment leaves outstanding amount visible and requester cannot self-approve.

**Owner:** Finance requester / approver

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4.

**Dependencies:** access_finance_policy


###### Validate IDR amount, duplicate evidence, and payment recording

ID: finance_validation · proposed · P0

Use typed integer IDR amounts; reject invalid negative request/payment and payment exceeding approved amount unless explicit amendment. Detect possible duplicate receipt/request based on reference/date/amount without auto-deleting. Payment recorded by authorized role with date/evidence; edit creates audited correction.

**Acceptance:** 1. Paid-to-date and outstanding reconcile from payment records, and duplicate warning does not destroy either record.

**Owner:** Finance / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** finance_request


###### Allocation, commitment, and payment comparison uses honest formulas

ID: finance_comparisons · proposed · P0

Show allocation, approved commitment, paid-to-date and outstanding. If approved total includes paid requests, do not stack committed+paid as separate spend. Define committed as approved total or outstanding commitment explicitly. Remaining allocation = allocation minus approved commitment under adopted policy.

**Acceptance:** 1. Exact IDR tracks reconcile to the adjacent request list and no overlapping amounts are double-counted.

**Owner:** Finance lead / product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** finance_budget,finance_request


###### Evidence and finance exports are scoped and reviewable

ID: finance_receipts_export · proposed · P0

Finance export includes selected period/project/category/currency/request state/approved/paid/outstanding and evidence URLs or native-note references. Restrict payment/bank/private receipt metadata under field policy. V1 CSV does not include provider receipt file contents. Stored receipt byte bundles apply only if native uploads are later approved; export must state actual coverage.

**Acceptance:** 1. Exported totals match the selected saved requests and restricted evidence is excluded for unauthorized users.

**Owner:** Finance lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S03/S05/S11; User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_surface_scope,finance_comparisons


###### Confirm finance operating rules before launch

ID: finance_sop · open · P0

Open: approval thresholds, category list, reimbursements vs client invoices, partial/advance payments, required receipts, budget revision authority, monthly close and exception process. V1 excludes accounting ledger, payroll, tax, bank connection and actual payment execution.

**Acceptance:** 1. Launch scope has approved minimal request/payment rules and explicitly excludes unsupported accounting claims.

**Owner:** Finance lead / President

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md. User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_finance_policy


###### Requester receives next legal action without private reviewer material

ID: legal_requester_view · proposed · P0

Show owner/queue/required-by/missing info/revision need and expected response under adopted SLA. Requester can amend draft or respond to returned revision. Post-approved/signed amendment needs formal new version/reissue; approval fields are protected.

**Acceptance:** 1. Requester supplies missing signatory/KAK but cannot change reviewer approval.

**Owner:** Legal / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E5:F5/J5.

**Dependencies:** legal_request


###### Urgent request is an approved exception with actual risk

ID: legal_urgent · proposed · P0

Short notice displays remaining lead time and requests urgency authority. Exception captures reason/approver/date; no impossible turnaround guarantee. Accept/reject urgency yields clear next action and doesn't silently bypass contract review.

**Acceptance:** 1. Same-day request cannot claim normal SLA compliance without adopted exception.

**Owner:** Legal lead

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5.

**Dependencies:** legal_sla


###### Void/reissue preserves the number register

ID: legal_number_void · proposed · P0

Wrong type/year/party follows approved void/supersede/reissue policy; retain issued number/reason/new link. No reuse hidden by rollback. Legacy import checks duplicates/origin without renumbering silently. Server atomic issuance remains essential even at small scale.

**Acceptance:** 1. Voided number stays in register and cannot be issued to a new document.

**Owner:** Legal issuer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** legal_numbering


###### Legal queue notifies requester, reviewer and handoff owner

ID: legal_events · proposed · P0

Submit/missing info/revision/review due/short lead/signature-ready/evidence-added/BAST request/finance-ready events. Sensitive signatory data omitted from general inbox. Version reference distinguishes revised request; no reminder result can infer signed status.

**Acceptance:** 1. Correct eligible recipients receive stage action with relevant version only.

**Owner:** Legal / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J5; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


###### Register export traces issued/void numbers and versions

ID: legal_export · proposed · P0

Number/type/project/requester/owner/stage/required-by/approval actor/date/current version/signature/BAST status and authorized links. Void/superseded cases explicit. No e-sign execution claim. Reconcile register counts against issuance audit.

**Acceptance:** 1. Scoped issued/void register reconciles and each number has exact document/version.

**Owner:** Legal lead

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** legal_numbering,access_sensitive_export


###### Legal scenario tests revision, unique number and unsigned gate failure

ID: legal_acceptance · proposed · P0

PKS structured intake → short-lead warning → revision → approved version → concurrent unique numbering → missing signature gate blocked → evidence → BAST review → finance-ready. Approved policy supplied first; sandbox documents fictitious.

**Acceptance:** 1. Scenario shows deliberate unsigned gate failure and unique immutable issuance.

**Owner:** Legal / Finance / QA

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E5:J5.

**Dependencies:** legal_numbering,legal_bast_gate


###### Budget amendment surfaces commitments before approval

ID: finance_amend · proposed · P0

Preview old/new allocation/approved commitment/paid/outstanding/headroom. Reduction below commitment flags deficit and required exception; can't rewrite payments/categories to fit chart. Preserve revision reason and source/approver.

**Acceptance:** 1. Lower allocation visibly creates deficit and leaves paid records unchanged.

**Owner:** Finance approver

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** finance_budget,finance_comparisons


###### Refund/correction is a reviewed recorded adjustment

ID: finance_adjustments · proposed · P1

Separate outgoing payment and recorded refund/correction with original link, amount/evidence/actor/date/reason. Never delete payment evidence to hide error. Net-paid basis explicitly adopted; full accounting deferred. First version can allow authorized simple corrections only.

**Acceptance:** 1. Correction reconciles net-paid while preserving original payment event.

**Owner:** Finance lead

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** finance_validation


###### Client invoice tracking uses incoming-money basis

ID: finance_incoming_terms · proposed · P1

Optional invoice reference/due/term amount/receipt state after legal gate, separate from outgoing expense requests. Minimal link/status metadata first. Native invoice generation/tax/payment collection deferred. Expected client income is not budget expenditure.

**Acceptance:** 1. Incoming invoice and outgoing expense summaries never combine directions.

**Owner:** Finance / Consulting

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** legal_bast_gate


###### Finance notifications distinguish approval from payment

ID: finance_events · proposed · P0

Requester gets rejection/evidence request; approver pending queue; recorder approved-payment-ready; term owner due. Approved remains unpaid until authorized payment record. Deliver source links with current scope and no sensitive bank info in general text.

**Acceptance:** 1. Approved request remains visibly unpaid until actual authorized record.

**Owner:** Finance / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4; Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates,finance_request


###### Period review stores report basis and outstanding discrepancies

ID: finance_period_snapshot · proposed · P1

Monthly/batch comparison of approvals/recorded payments/evidence yields owner/action list. Reviewed snapshot records filters/source version/totals. Later correction creates new report/version rather than invisible historic overwrite. Native ledger close deferred.

**Acceptance:** 1. Prior reviewed snapshot remains traceable after payment correction.

**Owner:** Finance lead

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** finance_receipts_export


###### Finance scenario tests self-approval and partial-payment arithmetic

ID: finance_acceptance · proposed · P0

Allocation → evidence-link request → reject self-approval → approve → partial paid/outstanding → final payment → export → correction/reload. Include invalid amount and failed save. No payment service needed; all paid states are authorized recorded facts.

**Acceptance:** 1. Totals reconcile after each stage and direct forbidden approval rejected.

**Owner:** Finance / QA

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G4/H4.

**Dependencies:** finance_sop


##### Consulting: connected project delivery with PL/PM and review

ID: division_consulting · confirmed · P0

Three respondents supplied the strongest project-delivery evidence. Need a coherent overview of tasks/PJ/dates/milestones/blockers/decisions/revisions across projects without re-entering data. PL owns content/direction; PM manages schedule/coordination/risks/client updates as requested.

**Acceptance:** 1. Delivery changes appear in project and Consulting portfolio without a second update form.

**Owner:** Consulting lead / PL / PM

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D2:J2/D8:J9.

**Dependencies:** org_current_six


###### Assign PL, PM, team, client contact, and reviewer explicitly

ID: consulting_roles · proposed · P0

Project allows separate PL/PM plus contributors and authorized client-update owner. Each role points to person ID and batch/project assignment, not free-text name. Survey describes the distinction but detailed authority remains proposed and needs Consulting approval. A person may hold both with explicit assignment; neither grants external signature/payment powers.

**Acceptance:** 1. A project with missing PL/PM exposes setup gap and cannot claim approved readiness.

**Owner:** Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** access_project_roles


###### Scope brief and scope change use reviewed versions

ID: consulting_scope · proposed · P0

Project goal, deliverables, exclusions, constraints and assumptions belong to Overview/brief resource. Proposed change draft → review → approved/rejected → applied; records requester, PL solution review, PM schedule impact, client/leadership decision if required, reason and linked version.

**Acceptance:** 1. Applying approved scope updates the project version; rejected change leaves scope intact and decision traceable.

**Owner:** PL / PM / authorized approver

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8.

**Dependencies:** work_decisions,resource_revisions


###### Delivery lanes show saved stages, milestones, and blockers

ID: consulting_delivery_lanes · proposed · P0

Proposed planning → discovery → analysis → solution → internal review → client delivery → closed, pending Consulting lead approval. Milestone markers and review gates reference actual records; a decorative lane cannot imply completion. Portfolio supports owner/client/status/date filters.

**Acceptance:** 1. Selecting a milestone/review marker opens its canonical record; unknown stage stays unset rather than guessed.

**Owner:** Consulting lead / PM

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8.

**Dependencies:** work_milestones


###### Pre-delivery readiness checklist records reviewer and approval

ID: consulting_review · proposed · P0

Checklist includes required deliverables, evidence/resources, PL content review, PM coordination/completeness, unresolved blockers and permitted legal gate. Required items incomplete prevent normal ready-to-deliver; waiver requires authority, reason and time. Readiness is counts/state, not a fictional quality score.

**Acceptance:** 1. One incomplete required item blocks readiness; completed review stores actor/date/version of reviewed output.

**Owner:** PL / PM / designated reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** access_project_roles,resource_revisions


###### Review feedback becomes linked revision work

ID: consulting_revision · proposed · P0

Survey asks director/manager revision notes. Reviewer selects deliverable/resource version, records requested change and owner/date, then creates a linked task. Resolution links revised version and reviewer confirmation. Feedback thread, task and resource are linked views of work, not duplicated approval authority.

**Acceptance:** 1. A requested revision appears in Work with its resource/version and closing it requires review confirmation where mandated.

**Owner:** Reviewer / PL / executor

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G2; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_tasks,consulting_review


###### PM records client update and next client action

ID: consulting_client_update · proposed · P0

Record actual communication date/channel, summary, approved deliverable version, client feedback, pending decision and next follow-up task. Sending remains in an external communication tool unless integrated deliberately. Do not claim external message delivery from saving this record.

**Acceptance:** 1. A client feedback note links its project/deliverable and resulting follow-up without automatic email sending.

**Owner:** PM

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** external_interaction


###### Portfolio derives several projects from canonical work

ID: consulting_portfolio · proposed · P0

Show per-project purpose/PL/PM, explicit delivery state, next milestone, overdue work, blockers, pending decisions, review readiness and client follow-up. Filtered totals and master matrix use same records. No second manual portfolio progress percentage.

**Acceptance:** 1. Editing a task, blocker or review immediately changes its Consulting portfolio row and scoped export.

**Owner:** Consulting lead / PM

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E8/F8/J8/J2.

**Dependencies:** work_organization


###### Close delivery with outcome, accepted resources, and handover

ID: consulting_close · proposed · P1

Proposed closing review captures delivered/accepted version, client acceptance when provided, unresolved/waived items, legal/finance handoff status and lessons-learned note. Project archive does not destroy resources, tasks or approval history. Billing readiness remains a separate recorded gate.

**Acceptance:** 1. Closing can show delivery done while invoice handoff remains pending, with evidence and next owner clear.

**Owner:** PL / PM / Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5/J8.

**Dependencies:** legal_bast_gate


###### Confirm delivery stage vocabulary and review authority

ID: consulting_validation · open · P0

Open: actual phase names, who starts projects, scope-change authority, PL/PM overlap rules, required review checklist, client acceptance evidence and escalation threshold. Survey roles are direct needs but detailed stage/SOP defaults are proposals.

**Acceptance:** 1. Consulting lead reviews one end-to-end project scenario and approves or edits each gate before launch.

**Owner:** Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D2:J2/D8:J9.

**Dependencies:** access_project_roles


###### Start records scope, roles and actual decision

ID: consulting_start · proposed · P0

Minimum client project setup includes client/relationship if applicable, goal/scope, PL/PM, target milestone/team grant and approved start decision. Internal work can have simpler adopted rule. Creating project is not client authorization or manufactured kickoff.

**Acceptance:** 1. Missing roles/start approval keep setup-needed state.

**Owner:** Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** consulting_roles,work_decisions


###### Deliverable has output criteria and exact reviewed version

ID: consulting_deliverable · proposed · P0

Title/project/owner/expected output/acceptance criteria/milestone/resource version/state/reviewer. Proposed submitted/review/revision/approved/delivered/accepted stages. Internal approval, task completion and client acceptance are distinct. Budgeted v1 stores supplied version URL/note evidence.

**Acceptance:** 1. Internal approval and client acceptance identify exact version and source actor.

**Owner:** PL / reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** consulting_review,resource_revisions


###### Scope/output change invalidates affected readiness review

ID: consulting_stale_ready · proposed · P0

New required item, scope version or deliverable version marks relevant checklist approval stale. Preserve prior event bound to past version and re-review changed items. PM cannot hide open blocker by moving lane or claiming high percent.

**Acceptance:** 1. Output revision after approval returns affected readiness to review-needed.

**Owner:** PL / PM / reviewer

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** consulting_scope,consulting_deliverable


###### Potential risk is distinct from active blocker

ID: consulting_risk · proposed · P1

Optional human-entered qualitative impact/probability, mitigation/owner/trigger/review date. Trigger links real blocker; no predictive score or automatic project-health rating. Minimum launch may use notes plus blocker records pending review of dedicated risk need.

**Acceptance:** 1. Risk trigger creates linked blocker without automatically changing other tasks.

**Owner:** PM

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8.

**Dependencies:** work_blockers


###### Delivery updates route to PL, PM and reviewer

ID: consulting_events · proposed · P0

Assignments/due milestone/escalated blocker/scope decision/submitted deliverable/revision/stale approval/client follow-up/legal-ready events. PL sees content decision, PM sees schedule risk, reviewer sees version-specific gate. Portfolio summary exposes only permitted facts.

**Acceptance:** 1. Role-specific inbox points to exact record/version with no second status input.

**Owner:** Consulting / product

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G2/J8.

**Dependencies:** work_updates


###### External summary is a separately reviewed sanitized report

ID: consulting_export · proposed · P0

Internal export includes scope/PL/PM/tasks/milestones/blockers/decisions/deliverables/review/version/evidence. Client-ready report excludes private internal notes/contact/finance fields under adopted policy. This is an approved export, not client portal or automatic external delivery.

**Acceptance:** 1. Internal/client report field differences explicit and each source version correct.

**Owner:** PM / Consulting lead

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; Latest user production PRD request, 3 Oct 2026.

**Dependencies:** access_sensitive_export


###### Connected Consulting scenario verifies one source of truth

ID: consulting_acceptance · proposed · P0

Scope/client/PL/PM → tasks/milestone/dependency → resource task → blocker → scope request → output revision → incomplete checklist blocked → approved review → recorded client evidence → BAST/finance → portfolio/export. Save failure/reload included.

**Acceptance:** 1. Every task/review/resource update appears in portfolio under same IDs without duplicate input.

**Owner:** Consulting / Legal / Finance / QA

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E8:J8/J5.

**Dependencies:** consulting_validation


###### Timesheets and billable utilization are deferred

ID: consulting_timesheets · deferred · P2

Prior brainstorm mentions timesheets; survey doesn't establish hour billing or member-time policy. Optional effort estimates support planning, not actual hours. Timesheet/charging needs purpose/access/review/finance definition. Never derive work hours from clicks or completion events.

**Acceptance:** 1. Launch metrics never label task counts or events as billable actual hours.

**Owner:** Consulting / Finance

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.


##### Future Knowledge and Training begin with shared capabilities

ID: division_future_knowledge_training · deferred · P2

Discussed future teams can use projects, notes/resources, tasks and meetings first. Specialized knowledge taxonomy, training attendance/evaluation and course management require direct requirements. Do not invent a learning-management platform for v1.

**Acceptance:** 1. Future units remain draft and have no unsupported specialized workflow in launch scope.

**Owner:** Future VP Consulting

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.


### UI/UX, user flows and frontend experience

ID: experience-planning · proposed · P0

Role/account and division journeys; onboarding; daily work screens; Resources; honest reports; measurable visual/layout/component rules; external tool interaction. Journeys specify actor → screen/action → guard → record/output → failure/return → handoff. The measured design subtree supplies padding, gaps, text sizes, control geometry, responsive behavior and accessibility tests. Existing IDs and domain records are reused across views.

**Acceptance:** 1. Covers all 6 divisions plus Admin/member/lead/VP/President and account lifecycle.
2. Each proposed journey identifies start/end, permission/failure path and saved outputs.
3. Adopted shared components have measured values and 0 untraceable arbitrary layout exceptions.

**Owner:** Product + design + frontend

**Source / assumption:** User specifically requests flows, numerical design criteria and separate UI/UX planning,3Oct2026.


#### End-to-end user journeys

ID: user-flows · proposed · P0

These proposed journeys explain who enters each screen, which guards apply, what changes, and how users recover/hand work on. They do not provision accounts/services, send messages, migrate production data or prove implementation. Final department stages, action rights, SLA/numbering and privacy/retention need the named decision owners. Each stage links canonical requirement IDs; tests use clearly fictitious sandbox records. Workspace is organizational context; each project uses Overview / Work / Resources.

**Acceptance:** Each current role and six divisions has a complete entry-to-output journey, with negative/recovery paths and traceable existing requirements.

**Owner:** Mahdy / product / division leads

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** scope_launch_core,access_action_matrix,work_project_tabs


##### Research and assumption boundary for these flows

ID: flow-assumptions · proposed · P0

Account visibility comes from explicit user direction: Mahdy Admin, President all active workspaces, VP reporting scope, ordinary member own division. Exact role/action grants, current leaders, successor operator and custody are open. Eight survey responses inform Consulting, External, MarCom IT and Legal Finance; no HR/S&G response. Their journeys below are hypotheses to validate, not confirmed operating practice. Client Engagement maps to External. No new approved H-2/H-3 SLA, official document format, finance limit or launch date is invented.

**Acceptance:** Each flow reviewer records adopted/changed/deferred steps; unapproved policy remains visible and blocks its dependent real action.

**Owner:** Product owner / division leads

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_current_leaders,scope_rules_gap,scope_hr_strategy_gap,decision-sop


##### All journeys inherit cost, environment and save boundaries

ID: flow-operating-boundary · proposed · P0

Proposed first release serves roughly 40+ members, monthly target Rp 35,000 and hard ceiling Rp 50,000. Default Resources are native notes/internal folders/external URLs, with no assumed domain/shared Drive and no native binary upload. External publication/signature/payment/message is done elsewhere and only recorded here. Sandbox fixtures are synthetic; production onboarding waits access/custody/recovery gates. Save success requires authoritative commit/version; local PRD edits only change this planning draft.

**Acceptance:** Sandbox replay makes 0 production writes and 0 unintended external sends; all claimed saved outcomes have committed record/history evidence.

**Owner:** Mahdy / operators

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** scope_student_scale,scope_links_default,environments,engineering-api,changes-current-editor


##### Journey evidence uses exact records and denial assertions

ID: flow-test-contract · proposed · P0

For each adopted journey test named actor/role/scope and original record IDs/versions; note screen/action and committed output. Include fresh login, reload, browser Back, EN/ID, desktop/mobile, invalid input, failed save, stale version and unauthorized URL/API/search/export. Record actual evidence separately from proposed acceptance. Count constraints use defined synthetic fixtures, not performance scores or invented completion-time promises.

**Acceptance:** 0 unauthorized content/title/count/URL disclosures; 0 duplicate canonical records from retried writes; expected record IDs/states/totals reconcile exactly for the fixture.

**Owner:** QA / division representatives

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** quality-role-matrix,quality-integrity,launch_acceptancematrix


##### Account, role and membership journeys

ID: flows-accounts · proposed · P0

Start from verified identity and current-batch membership. Workspace visibility, project collaboration and action permissions are distinct. Each role journey ends in a scoped saved result or a clear denied/recovery state.

**Acceptance:** Admin, member, lead, VP, President and backup operator journeys all have allowed and denied fixture outcomes.

**Owner:** Admin / leadership / HR

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_action_matrix,onboarding


###### Admin: first-owner bootstrap and empty organization setup

ID: flow-admin-bootstrap · proposed · P0

Entry: authorized setup operator; Mahdy's concrete login identity and second custodian are unresolved until verified. Exit: one controlled initial admin, six configured current workspaces, current term, policies/custody references and next invitation action. This is an operator setup flow to implement later, not a public self-promotion screen.

**Acceptance:** A verified bootstrap produces exactly 1 initial organization/owner grant; duplicate or wrong-identity bootstrap produces 0 new admin grants.

**Owner:** Mahdy / appointed operator

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** security_bootstrap,onboarding-first-admin


###### 1–3 · Verify operator, identity and environment

ID: flow-admin-identity · proposed · P0

1. Actor: setup operator. Screen/action: controlled operator setup/runbook, select intended environment and organization. Guard: documented authority, isolated sandbox rehearsal and approved account custody; no production mutation from ordinary member UI. Output: setup checklist with environment/custodian references.
2. Actor: Mahdy. Action: authenticate through adopted managed identity provider and complete required administrator session/MFA setup. Guard: verified account-person binding; display name/email resemblance cannot grant admin. Output: verified account ID awaiting controlled owner grant.
3. Actor: authorized operator. Action: run one-time bootstrap using verified ID. Guard: organization has no existing bootstrap owner and server operation is idempotent. Output: active Admin grant and trusted setup audit. Denial: wrong identity/duplicate setup shows stopped operation and existing recovery contact, not become-admin fallback.

**Acceptance:** Sandbox wrong-ID, repeat and unauthenticated attempts create 0 owner grants; accepted operation records trusted actor/time.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** security_auth,security_mfa,entity_accountlink,access_admin_scope


###### 4–6 · Configure current organization and action policy

ID: flow-admin-org-config · proposed · P0

4. Actor: Admin. Screen: Organization setup. Save DWDG UII, selected active batch and six current units/workspaces with stable IDs. Guard: valid names, acyclic reporting, no duplicate active batch. Output: configuration draft/active state per approved setup; future three-VP tree stays draft.
5. Actor: Admin with President/domain reviewers. Screen: permission/configuration review. Bind actual leaders and adopt versioned action matrix. Guard: open leadership/approval decisions resolved; no guessed people or automatic finance/signature powers. Output: approved configuration version and accountability.
6. Actor: Admin. Screen: Settings/operations custody references. Record primary/backup service owners, recovery procedure and native-note/external-folder policy. Guard: no secret values in notes, no assumed existing Drive/domain. Output: safe contact/runbook references. Failure: retain draft and list unresolved launch inputs before invitations activate.

**Acceptance:** All six workspaces exist once; planned units remain absent from member switcher; setup has 0 secret values in normal records.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** org_current_six,org_batch_model,org_reporting_graph,access_current_leaders,decision-custody,scope_org_storage_setup


###### 7–9 · Prove scope and hand off onboarding

ID: flow-admin-proof · proposed · P0

7. Actor: Admin/QA. Action: sign out and back in, verify allowed workspace list, current scope and admin-only controls. Guard: server grant active; self-role edit path protected. Output: real setup result for candidate environment.
8. Actor: backup custodian. Action: rehearse permitted login/recovery on sandbox and locate latest independent archive/runbook. Guard: individually verified operator, no shared password. Output: recorded custody/recovery evidence and unresolved gaps.
9. Actor: Admin. Screen: Members/Invitations. Continue to reviewed invitation journey only after production gate is approved. Handoff: roster reviewer/HR. Audit: org/config/role writes go to permitted workspace Changes or restricted setup audit as appropriate; never broadcast all-org privileged events to members.

**Acceptance:** Reload retains approved setup; backup operator can perform documented permitted action; no production onboarding until required evidence is recorded.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** quality-role-matrix,reliability_succession,launch_ownership,changes-sensitive


###### Admin or authorized roster reviewer: create and correct an invitation

ID: flow-admin-invite · proposed · P0

Entry: approved membership/identity policy and active current workspace. Exit: one pending/accepted/expired/revoked invitation associated with actual intended scope; invitation delivery is separately observable.

**Acceptance:** Repeated roster submission creates exactly 1 pending invite per approved identity/context; no invite grants data before acceptance.

**Owner:** Admin / authorized HR roster reviewer

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** onboarding-invitations,access_invitation


###### 1–3 · Review person, team and role

ID: flow-invite-review · proposed · P0

1. Actor: roster reviewer. Screen: Members → Invite. Enter verified intended email/account reference, display name, current batch, one current workspace and role. Guard: reviewer has invite rights for that scope; domain alone is not membership. Output: invitation draft.
2. Actor: reviewer. Action: compare potential duplicate person/invite. Guard: same name isn't merge proof; existing member requires update flow rather than new identity. Output: reuse pending invite or reviewed new draft.
3. Actor: reviewer. Action: inspect role/scope/expiry and submit. Guard: cannot grant self elevation, foreign workspace or role above authority; specialist approval rights separate. Output: pending invitation with trusted inviter/time/expiry and 1 correlated audit event. Invalid input returns to draft with affected field.

**Acceptance:** Invalid email/scope/role saves 0 active membership; duplicate submission does not duplicate person/invite.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** entity_invitation,access_action_matrix


###### 4–6 · Deliver or recover pending invitation

ID: flow-invite-delivery · proposed · P0

4. Actor: reviewer. Screen: invitation detail. Use configured invitation delivery or approved invite-link distribution. Guard: channel is actually configured/authorized; UI doesn't claim email delivery from membership save. Output: delivery state or copyable approved link and expiry.
5. Actor: reviewer. Action: correct typo before acceptance, renew expired invite or revoke mistaken invite. Guard: cannot silently rebind an already accepted account. Output: revoked/replaced or updated pending invitation and safe actor/time history.
6. Return/handoff: recipient acceptance journey. If delivery fails, retain pending record and provide retry/contact route. If already accepted, open authorized membership detail. Any role change follows separate reviewed action; no automatic resend creates new member.
Optional channel branch: use email only after its delivery service, template, limits and evidence have been adopted/configured. The default acceptance uses the actual selected invitation delivery mechanism and does not depend on paid email.

**Acceptance:** Failed delivery leaves 1 recoverable pending invite; revoked/expired link creates 0 membership and leaks 0 internal records.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** security_auth,changes-actions


###### Invited person: authenticate, accept and enter correct workspace

ID: flow-invite-accept · proposed · P0

Entry: invite token/reference and verified identity. Exit: accepted invite bound to one person/account/current membership and a useful first view. Wrong/uninvited identity receives no data.

**Acceptance:** Valid acceptance yields 1 membership/person binding; wrong/expired/revoked/already-used attempts yield no duplicate and no unauthorized disclosure.

**Owner:** Invited person / Admin

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_invitation,security_auth


###### 1–3 · Authenticate before membership activation

ID: flow-accept-signin · proposed · P0

1. Actor: invited person. Screen: public sign-in/invitation page. Open invite. Guard: minimal public content only; token cannot reveal project/member data. Output: sign-in prompt and safe expiry/invalid status.
2. Actor: person. Action: sign in using adopted provider. Guard: verified authenticated identifier matches invitation policy; allowed-domain exception is approved separately. Output: identity session without broad workspace rights.
3. Actor: person. Screen: invitation confirmation. Review organization/workspace/role and required notice. Guard: active unrevoked invitation/current intended membership; server validates all. Output: accepted invitation and account-person-membership transaction. Wrong account offers sign out/switch account, never identity override.

**Acceptance:** Using another account sees 0 private organization titles/counts and cannot accept by editing displayed email.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** entity_accountlink,entity_membership,security_privacy


###### 4–6 · Activate scope and handle repeat acceptance

ID: flow-accept-landing · proposed · P0

4. Actor: accepted member. Screen: own workspace Home/My tasks. Server loads permitted records from active membership; default single-workspace user sees identity without misleading switcher. Output: actual assigned work or role-appropriate empty state.
5. Actor: person. Action: optional profile/avatar and EN/ID/theme preference. Guard: own nonauthoritative fields only; no photo/extra personal info required. Output: saved preferences/profile; role remains server-managed.
6. Return: repeat link reload opens existing membership or safe accepted state, creating no second person. Missing/inactive assignment goes to assignment-needed help state, not all-org default. Handoff: team/onboarding owner receives allowed acceptance event and checklist.

**Acceptance:** Repeat acceptance/reload preserves same IDs; empty member can take next allowed action; no fake seeded project is required.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** onboarding-first-view,onboarding-profile,work_home,access_member_scope


###### 7–8 · Revocation and save-race recovery

ID: flow-accept-race · proposed · P0

7. Actor: Admin/QA and recipient. Action: revoke invite immediately before recipient confirms. Guard: server rechecks token/version at commit. Output: rejected activation with safe recovery contact; local apparent accepted UI cannot persist access.
8. Actor: recipient. Action: retry after network timeout. Guard: idempotency/current state. Output: existing accepted membership or recoverable rejected state, not duplicate. Audit: accepted/revoked result uses authoritative actor/time; failed attempt is not a successful Changes event.

**Acceptance:** Concurrent revoke/accept grants 0 active unauthorized memberships; accepted timeout retry produces exactly 1 membership.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** data_concurrency,reliability_retry,changes-atomically


###### New member: first useful task and resource

ID: flow-member-first · proposed · P0

Entry: accepted own-division membership, with optional explicit shared-project grant. Exit: member understands context, finds work/resource and can reach help without developer tutorial.

**Acceptance:** Member with 1 assigned fixture task can open it and resource by ID; unassigned member gets useful empty state, not fictional work.

**Owner:** Member / team onboarding owner

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** onboarding-first-view


###### 1–4 · Learn context through an actual next action

ID: flow-member-orientation · proposed · P0

1. Actor: member. Screen: workspace Home. Read current workspace identity and attention/assigned items. Guard: current membership; other teams omitted. Output: real next work or no-assigned-work state.
2. Actor: member. Action: open assigned task to inspector, then its project Overview. Guard: task/project permission rechecked. Output: purpose, owner, due semantics, requested outcome and linked work.
3. Actor: member. Screen: project Resources. Open linked note/provider URL using visible action; avatar/right-click are optional accelerators. Guard: resource permission and separate provider rights. Output: native note or external destination; provider denied offers recorded owner/access-request contact.
4. Return: Back restores task selection/list scope. Use Help if owner/date/context missing. Handoff: onboarding lead receives only submitted issue/follow-up, not implicit external message; no task status changes just by viewing.

**Acceptance:** Keyboard and mobile complete same route; opening provider URL grants no provider permission; return retains selected task.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_overview,resource_inspector,resource_provider_access,engineering-routing


###### 5–7 · Save a small real update and verify it

ID: flow-member-first-action · proposed · P0

5. Actor: member. Task inspector: change allowed assigned task to In progress and add permitted context/evidence URL if needed. Guard: own editable task/current version and safe URL. Output: authoritative task revision and Changes in current workspace.
6. Actor: member. Reload and inspect Work/My tasks. Output: same ID/state; no second task or project progress input.
7. If save fails: keep draft/error, retry after connection/permission/version check. If forbidden task link: neutral denied state/back to own workspace, 0 leaked title. Handoff: assigned owner/reviewer sees appropriate update only after commit.

**Acceptance:** Failed save shows no success event; retry creates 0 duplicates and committed state survives reload.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_member_edit,work_forms,work_concurrent_updates,changes-atomically


###### Member: attention → execution → review/completion → return

ID: flow-member-daily · proposed · P0

Entry: authenticated active member within permitted scope. Exit: assigned work has one saved update/evidence/blocked or review/completed state, linked history and reliable return path.

**Acceptance:** Use 3 assigned tasks (overdue/today/undated): all stay findable and only permitted mutations commit.

**Owner:** Member

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_my_tasks,work_task_lifecycle


###### 1–3 · Triage owned work without false availability

ID: flow-daily-triage · proposed · P0

1. Actor: member. Screen: Home/My tasks. Select overdue/today/upcoming/undated or task filter. Guard: query scoped to allowed own assignments/project exceptions. Output: actual due items, exact saved dates and review requests.
2. Actor: member. Open task; inspect project context/resource/decision and blocker. Guard: restricted associated link is neutral rather than a leaked title. Output: enough context to act; no count of other-division work.
3. Actor: member. Schedule/assignee detail if useful. Output: actual timed meetings and declared availability basis, with Unknown where missing. Date-only due item is all-day; 3 tasks does not prove Busy. Viewing does not write activity.
Optional availability branch: declared windows/planned capacity are consulted only if adopted; without them the member still sees dated/undated assigned tasks and recorded meetings with Unknown external availability.

**Acceptance:** All 3 fixture tasks found including undated; unavailable linked record leaks 0 metadata; dates retain type.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_surface_scope,work_schedule,availability_stale


###### 4–6 · Work, evidence and blocker are explicit updates

ID: flow-daily-execute · proposed · P0

4. Actor: member. Execute work in appropriate native note/external app, then return task inspector. Guard: provider permission separate. Output: proposed task progress and supplied version/evidence reference.
5. Actor: member. If unable to proceed, add blocker description/requested action/owner/severity against same task or submit help request where role cannot create blocker. Output: open blocker and accountable handoff; blocked flag doesn't manufacture completion.
6. Actor: member. Submit status/evidence for review or permitted complete action. Guard: assigned task/current version/required evidence and reviewer gate. Output: in review or completed with actual actor/time; external provider execution not asserted automatically.

**Acceptance:** Evidence URL is safe/version basis explicit; blocker keeps task open; unauthorized completion saves 0 transition.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** resource_revisions,work_blockers,access_member_edit


###### 7–10 · Receive review result, Undo and verify shared views

ID: flow-daily-return · proposed · P0

7. Actor: reviewer/member. Review return creates requested change and notification; member opens same task from Updates and revises. Output: preserved feedback/version and current work state.
8. Actor: member. After permitted completion commit, task row may dissolve; project counts/current dated activity update from same records. Guard: no animation removal before save; legacy unknown time stays null.
9. Actor: member. Undo within permitted window restores prior state/links only if current version allows. If another reviewer edited afterward, show conflict and retain later work. Audit adds reversal rather than erasing original.
10. Actor: member. Reload/open Changes filtered by task in selected workspace, then Back. Output: same ID/progress and readable authorized event. Log out on shared device; next account sees no prior sensitive draft.

**Acceptance:** Completion timestamp persists; rapid Undo restores correct earlier fields; stale Undo overwrites 0 later edits; next account sees 0 private draft data.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_undo_archive,analytics_progress,analytics_completion,changes-scope,security_device


###### Division lead: plan work, delegate and review outcomes

ID: flow-division-lead · proposed · P0

Entry: explicit lead role/action grant for selected current division; ordinary visibility alone is insufficient. Exit: canonical project/task/resource assignments and reviewed outcome/escalation with one scoped report.

**Acceptance:** Lead can manage own permitted fixture project and cannot change unrelated division roles/approvals.

**Owner:** Division lead

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_action_matrix,work_projects_register


###### 1–3 · Create project and connected ownership

ID: flow-lead-plan · proposed · P0

1. Actor: lead. Screen: own workspace Projects → Create. Guard: create permission, active unit/batch. Enter purpose/scope/accountable owner/date or unknown. Output: one draft/planned project with stable ID and safe empty-task state.
2. Actor: lead. Project Work: add task/milestone/owner/date and actual prerequisite if needed. Guard: eligible person/permission, date validation, no cycles. Output: canonical linked work visible in all views.
3. Actor: lead. Resources: add native folder/note or approved external link; delegate contributors through inspector/avatar control. Guard: safe URL/allowed people; resource responsibility doesn't grant provider/foreign workspace access. Output: resource ownership and optional separate task.

**Acceptance:** Create 1 project/3 tasks/1 resource; all IDs reconcile across list/board/timeline/resource inspector.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_task_fields,work_milestones,work_dependencies,resource_tasks


###### 4–6 · Review exact output and handle exception

ID: flow-lead-review · proposed · P0

4. Actor: lead/designated reviewer. Open review-needed work from Home/Updates/Work. Guard: review action and exact submitted version; required independent reviewer policy. Output: review decision or requested revision with owner/date.
5. If author revises concurrently: current version check blocks stale approval; compare/link new version and review again. If required evidence/child gate incomplete, leave review-needed with reason. No role switching substitutes for separate finance/legal authority.
6. Actor: lead. Resolve blocker or escalate to permitted cross-project/VP owner. Guard: explicit shared-project grant where foreign participants need access. Output: canonical blocker resolution/decision/handoff; no duplicate personal task copy.

**Acceptance:** Stale version/self-approval policy violation records 0 valid approvals; revision goes to same task/resource.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_independent_review,consulting_stale_ready,work_concurrent_updates,access_project_collab


###### 7–9 · Close, export and retain accountability

ID: flow-lead-report · proposed · P0

7. Actor: lead. Review project closing criteria, unresolved blocker and domain handoff. Guard: close permission; required items resolved/authorized waiver. Output: explicit completed/archived project; task percent alone doesn't close it.
8. Actor: lead. Export selected project/division summary. Guard: allowed export fields; scope/date/currency basis visible. Output: exact selected records, missing-data states and external-link manifest with no provider bytes claim.
9. Actor: lead. Open selected-workspace Changes filtered by project and return. Output: creator/assignee/reviewer/date modifications under current field permissions. Pending responsibilities are assigned before batch handover.

**Acceptance:** Export IDs/totals exactly match chosen fixture; Changes contains 0 other-workspace events.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_project_lifecycle,analytics_reports,changes-scope,org_handover


###### VP: reporting portfolio and permitted workspace review

ID: flow-vp-reporting · proposed · P0

Entry: active VP grant plus current batch reporting edges. Exit: reviewed reporting-scope work/escalation and allowed export; Changes remains one selected workspace.

**Acceptance:** Fixture VP with 2 reporting units sees those 2, and 0 titles/counts/links from third nonreporting unit.

**Owner:** VP

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_vp_scope,org_reporting_graph


###### 1–4 · Select authorized scope and drill into work

ID: flow-vp-scope · proposed · P0

1. Actor: VP. Sign in → permitted portfolio Home/Organization. Guard: verified current reporting graph, no orphan inferred scope. Output: only configured descendant divisions and scoped summaries.
2. Actor: VP. Workspace selector: choose reporting unit. Guard: allowed context computed server-side. Output: Home/Projects/Schedule/Resources switch consistently; saved draft/selection preserved where still allowed.
3. Actor: VP. Portfolio project row → Overview/blocker/dependency. Guard: field-sensitive policy may hide candidate/receipt/contract details despite workspace visibility. Output: actual owner/date/requested action and allowed evidence.
4. Denied path: paste a nonreporting project URL or search its title. Output: neutral denied/return to permitted context, 0 hidden name/count/avatar/URL disclosure.

**Acceptance:** 2 permitted units remain available after reload; all tested secondary paths reveal 0 third-unit data.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_surface_scope,access_sensitive_data,work_switch_context,access_denied


###### 5–8 · Escalate with action rights and inspect workspace Changes

ID: flow-vp-action · proposed · P0

5. Actor: VP. Record decision/escalation only if action grant allows; otherwise request authorized decision owner through existing record. Output: accountable handoff, not assumed admin/finance/signature authority.
6. Actor: VP. Export reporting portfolio summary under export policy. Output: exact allowed project IDs and no restricted fields; personal bulk archive is not implied.
7. Actor: VP. Select one unit → Changes; filter actor/project/date. Output: that workspace history only, even when VP portfolio covers two units. A broader progress summary is not combined Changes.
8. If team reporting reassigned while session open: refresh allowed set, close removed context, reject stale form save and retain only safe draft recovery. Handoff unresolved scope to Admin.

**Acceptance:** 1 selected-workspace Changes query returns 0 second-workspace events; revoked descendant cannot be read/saved via stale tab.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_action_matrix,access_sensitive_export,changes-scope,access_revocation


###### President: all-workspace oversight with separate specialist rights

ID: flow-president · proposed · P0

Entry: President visibility grant covering active current workspaces. Exit: responsible organizational review, assigned escalation and approved scoped summary; administrator/legal/finance powers remain explicit.

**Acceptance:** President can select all 6 active workspaces but role alone permits 0 admin-only/specialist transactions.

**Owner:** President

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_president_scope,org_current_six


###### 1–4 · Review organization without rewriting team state

ID: flow-president-overview · proposed · P0

1. Actor: President. Home/Organization: choose all permitted portfolio summary. Guard: active President membership; query defines exact record scope and metrics. Output: six-unit project matrix, owners/milestones/blockers, no fictional health score.
2. Actor: President. Filter unit/project/date → open Overview. Guard: sensitive fields still separate. Output: status, next obligation and pending decision from same records; viewing does not create a work update.
3. Actor: President. Ask/approve organizational decision only under specific authority. Scope/client/finance/signature request with no grant offers authorized-owner handoff rather than universal approve control.
4. Actor: President. Select unit → Changes. Output: current unit only. No all-org Changes feed silently appears merely because President can view every workspace.

**Acceptance:** Portfolio count equals saved allowed projects; all sensitive/admin tests obey separate action matrix.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_organization,analytics_progress,access_action_matrix,changes-scope


###### 5–8 · Resolve escalation and review future configuration separately

ID: flow-president-handoff · proposed · P0

5. Actor: President/authorized decision owner. Record reviewed decision/reason and linked resulting work. Guard: exact version and independent-review policy. Output: attributable decision and assigned next owner, not chat-only approval.
6. Actor: President. Request/report export under field policy; review whether intended external sharing needs sanitized report. Output: permitted scope manifest; no private HR/contact/receipt data by default.
7. Actor: President with Admin. Review future three-VP/batch draft and mapping; approve only under organization action policy. Future units remain planned until separate activation validation.
8. Return: Back to original filtered portfolio. Missing owner/invalid reporting prompts Admin resolution; no invented assignment. Handoff is saved decision/task and scoped event; external communication happens separately.

**Acceptance:** Future draft review activates 0 planned units; decision/export retains exact actor/scope/version.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_decisions,access_sensitive_export,org_activation_preview


###### Backup operator: recover authorized control without escalating members

ID: flow-backup-operator · proposed · P0

Entry: named individually verified backup custodian with approved runbook, permission and usable independent archive/recovery material. Exit: restored authorized service/access or safe incident escalation, with actual recovery evidence.

**Acceptance:** Sandbox recovery proves intended custody; no public recovery action grants Admin by name or browser storage edit.

**Owner:** Backup operator / Mahdy / President

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_admin_handover,reliability_runbook,reliability_restore


###### 1–3 · Identify recovery need and safeguard evidence

ID: flow-recovery-triage · proposed · P0

1. Actor: backup operator. Support/status/runbook: identify lockout, compromised identity, vendor pause or data loss. Guard: actual authorization and environment confirmed; don't run reset against production by accident. Output: incident ID/severity/operator and evidence without secret/content leakage.
2. Actor: operator. Verify recovery route/account ownership with approved second-person process. Guard: no unverified chat display name or shared plaintext password. Output: authorized recovery operation or escalation if custody unavailable.
3. Actor: operator. If compromise, revoke affected sessions/access before broader restore under policy. If vendor unavailable, enter approved maintenance/continuity response; don't show saved-success fiction. Handoff: President/support receive appropriate notice draft, actual message sending separately authorized.

**Acceptance:** Unverified caller gains 0 privileged grants; compromise fixture invalidates old sessions under adopted policy.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** security_mfa,security_offboarding,reliability_incident,reliability_maintenance


###### 4–6 · Restore only into isolated target before cutover

ID: flow-recovery-rehearse · proposed · P0

4. Actor: operator. Select approved snapshot by age/schema/manifest. Guard: current decryption permission, independent backup usable; native notes/record links included, external provider file bytes excluded. Output: restore plan and scope/gaps.
5. Actor: operator. Restore isolated target; reconcile identity/relationship/count/current permission and sample native notes. Guard: no overwrite/reset of source app or production stores. Output: rehearsed target or failure report; partial restore isn't healthy state.
6. Actor: operator/approver. Review actual data loss/elapsed time against accepted RPO/RTO and decide production recovery/cutover separately. Output: recorded go/no-go with owner. Failed rehearsal returns to safe read-only/continuity and escalates missing archive.

**Acceptance:** Fixture IDs/counts/links reconcile exactly; restore target has 0 real outgoing notifications and excludes no scope silently.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** data_restore,quality-backup-proof,reliability_rporTo,environments


###### 7–9 · Return control, verify member access and record handover

ID: flow-recovery-return · proposed · P0

7. Actor: verified operators. Apply approved recovery procedure, rebind legitimate operator access as needed, and revoke compromised credentials. Guard: no blind role restoration from obsolete batch archive; current access policy validated.
8. Actor: QA/member/operator. Smoke sign-in/own task save/scoped export and denied role paths. Output: actual return-to-service checks before maintenance lifted; 0 false healthy badge without usable journeys.
9. Actor: operator. Update restricted incident/runbook/custody evidence and member-facing notice draft; record recovery operation and follow-up. Workspace Changes exposes only allowed affected workspace facts; privileged recovery details remain restricted. Backup custodian can repeat procedure without Mahdy device.

**Acceptance:** Return proof includes allowed/denied sign-in and one persisted task update; 0 stale restored-role elevation.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** quality-role-matrix,security_audit,reliability_succession,changes-sensitive


###### Admin/HR: move member to another team without losing work

ID: flow-membership-transfer · proposed · P0

Entry: approved current/batch transfer authority and new team assignment. Exit: updated membership/current scope, reviewed open-work transfer and preserved historical attribution; project exceptions explicit.

**Acceptance:** Fixture person moves A→B with same person ID, 0 unintended A data access and no orphan open task.

**Owner:** Admin / HR / affected leads

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** onboarding-switcher,org_batch_model,hr_roster_change


###### 1–4 · Review membership and responsibilities

ID: flow-transfer-preview · proposed · P0

1. Actor: Admin/authorized HR. Members → person membership → proposed transfer. Guard: authority over affected batch/units; verify identity and destination active workspace. Output: transfer draft, not duplicate invitation/person.
2. Actor: outgoing/incoming leads. Preview current tasks/resource ownership/approvals/follow-ups and explicit shared-project grants. Guard: permitted fields only. Output: chosen reassign/retain via explicit grant/unresolved decisions with accountable owner.
3. Actor: Admin. Validate destination role/date/reporting/specialist rights and avoid broad implicit grants. Required protected approval queues need designated successor. Output: reviewed mapping/version.
4. If destination invalid or ownership unresolved: stop apply, keep source membership/work unchanged and return preview with reason. No reseed or bulk data deletion resolves it.

**Acceptance:** Cancelled/invalid transfer makes 0 source record mutations and creates 0 second person identity.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_action_matrix,access_approver_transfer,entity_membership,access_project_collab


###### 5–8 · Apply atomically and refresh both sessions

ID: flow-transfer-apply · proposed · P0

5. Actor: Admin. Apply approved mapping with expected version/idempotency. Output: effective membership + chosen assignments + correlated safe events in affected scopes; historic authors remain original.
6. Actor: member. Existing session refreshes scope → own destination Home. Guard: source access revoked unless explicit approved project exception survives. Stale source draft cannot save; provide private recover/copy to allowed context only.
7. Actor: leads/member. Verify destination tasks/resources and transferred queues. Source-only/destination-only viewers see respective safe move events without foreign private names/URLs.
8. Return/handoff: incoming onboarding owner supplies missing setup; outgoing lead resolves retained work. Retry timeout reuses committed transfer; 0 duplicate grants. Future batch move preserves previous term role history.

**Acceptance:** Stale source read/write rejected; same IDs preserved and old-batch report still has original role/actor context.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_revocation,changes-move,data_concurrency,org_history_snapshot


###### Admin/HR: suspend or offboard and transfer ownership

ID: flow-membership-revoke · proposed · P0

Entry: adopted departure/security policy and authorized operator. Exit: no active former-user access, assigned successor/unresolved queue and preserved contribution; privacy deletion is separate.

**Acceptance:** Offboard active fixture session: 0 allowed new reads/writes/exports after revocation; prior authorship remains traceable.

**Owner:** Admin / HR / leads

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** onboarding-leavers,security_offboarding


###### 1–4 · Review scope and safe successor mapping

ID: flow-revoke-preview · proposed · P0

1. Actor: Admin/HR. Person membership → Suspend/Offboard. Guard: reason/effective date/authority and current identity; security incident may require immediate revoke then ownership follow-up.
2. Actor: lead/operator. List open task/resource/partner/legal/finance approval duties and account/provider ownership. Guard: field scope. Output: approved successors or explicit unresolved queue; no deletion of completed contributions.
3. Actor: operator. Review external account/file custody transfer separately at provider; DWDG role change cannot prove provider transfer. Output: acknowledgment/evidence reference or outstanding handover blocker.
4. If removing last verified administrator/custodian: require appointed successor/recovery route before normal handover. Emergency compromise policy remains explicit; never strand organization silently.

**Acceptance:** Departure preview identifies all seeded open responsibilities and no secrets are copied into handover notes.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** hr_roster_change,resource_account_history,access_admin_handover


###### 5–8 · Revoke, invalidate and verify history privacy

ID: flow-revoke-apply · proposed · P0

5. Actor: Admin. Apply suspension/offboarding and approved ownership mapping. Guard: atomic versioned operation or documented recoverable steps. Output: inactive membership, revoked grants/sessions and real audit.
6. Actor: former member/QA. Open old task URL/search/export/file-link request and submit stale form. Output: neutral denied/no private metadata; drafts clear/hide according to shared-device policy.
7. Actor: successor. Open transferred work/approval queue. Output: actual pending tasks with correct owner; past approval actor unchanged. Queued notifications recheck permission, not old delivery list.
8. Return/handoff: preserve permitted history and archive. If privacy deletion requested, use adopted retention process separately; removing membership doesn't purge all past authorship. Failed apply shows partial/failed operation honestly and retries idempotently.

**Acceptance:** 0 inaccessible title/count/URL/cache disclosures; 0 duplicate transfer tasks; authorized historical attribution and current queue both correct.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_notification_revoked,security_device,changes-sensitive,access_approver_transfer


###### President/Admin/leads: close a term and activate approved next batch

ID: flow-term-handover · proposed · P0

Entry: future/current batch draft, actual new officers and reviewed work/account mapping. Exit: active new term with stable records/custody and authorized old history; future organization activation is deliberate.

**Acceptance:** Dry-run makes 0 live changes; applied fixture retains all mapped IDs/history and exposes 0 unauthorized prior-team records.

**Owner:** President / Admin / outgoing and incoming leads

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** org_activation_preview,org_handover


###### 1–4 · Review organization draft and operational continuity

ID: flow-handover-map · proposed · P0

1. Actor: leadership/Admin. Organization → batch draft. Choose new batch/current proposed hierarchy and actual leaders. Guard: three-VP/Expert Network draft not assumed automatically current. Output: configuration draft only.
2. Actor: outgoing leads. Review open projects/tasks/blockers/resources/partner follow-ups/legal/finance queues and account custody. Output: mapped successor/state, evidence references and missing items; no plaintext secret handover.
3. Actor: incoming leads/custodian. Acknowledge work/account/folder/backup ownership with verified individual access. Guard: no assumed organization Drive/domain or entitlements. Output: signed-off operational mapping/readiness evidence.
4. Actor: Admin. Validate reporting cycles/orphans, Legal & Finance split destinations if adopted, memberships/actions and archived scope. Unresolved records block activation or receive approved explicit resolution; no guess-by-title migration.
Optional restructuring branch: activating the future three-VP draft or split/merge requires separately adopted mapping. The P0 handover also works with the same six units and changed officers only.

**Acceptance:** Every seeded open obligation has successor or explicit unresolved item; planned unit activation remains 0 before approval.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** org_reporting_graph,scope_org_storage_setup


###### 5–8 · Activate, revoke outgoing scope and rehearse successor operation

ID: flow-handover-activate · proposed · P0

5. Actor: authorized approvers/Admin. Review exact preview/version and activate batch. Output: current hierarchy/membership/capability mappings plus immutable scope IDs and safe correlated events; former batch history preserved.
6. Actor: outgoing/incoming accounts. Refresh sessions; former role no longer grants current access and incoming accounts get precisely approved units. Historic attribution does not turn into current role authority.
7. Actor: incoming operator/leads. Rehearse one task update, one allowed export, one workspace Changes inspection and backup recovery route. Output: successor-operated evidence without original developer personal credentials.
8. Failure/return: activation conflict retains old active version until safe resolution; approved rollback is a separately audited operation, not invisible history erase. Handoff unresolved next-batch work via assigned tasks.

**Acceptance:** 1 active batch; 0 cycles/orphans/unmapped scoped obligations in approved fixture; old officer cannot use stale role grant; successor can operate documented recovery.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** entity_reportingassignment,org_history_snapshot,access_revocation,reliability_succession,changes-move


##### Six division journeys and their specialist handoffs

ID: flows-divisions · proposed · P0

Operational journeys below are proposed compositions of the existing requirements. A record created in a division remains canonical across relevant pages; restricted details require explicit action/field access. These are scenarios for validation with actual officers, not proof that the workflows or SOPs have been adopted.

**Acceptance:** Each current division has a start, useful outcome, alternate failure path, and named handoff. Specialized finance, legal, recruitment and IT actions have separate guards.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** organization,divisions,access


###### Strategy & Growth · evidence → decision → delivery

ID: flow-strategy · proposed · P0

Actors: researcher/member, initiative owner, designated strategy reviewer, delivery lead and scoped VP. Trigger: a question, opportunity, or measurable improvement worth investigating. Finish: a held/rejected hypothesis with rationale, or an approved initiative linked to one canonical delivery project and later outcome review. This division has no direct survey respondent; actual cadence, authority and terminology require officer review.

**Acceptance:** Run one approved, one held and one rejected fixture. Each retains distinct evidence, rationale and authority without fabricated organizational health scores.

**Owner:** Strategy & Growth lead / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** division_strategy,strategy_acceptance,strategy_validation,scope_hr_strategy_gap


###### 1–3 · capture the question and evidence

ID: flow-strategy-intake · proposed · P0

1. Actor researcher opens Strategy workspace → Initiatives and creates an idea with goal/question, owner, horizon and source; current membership/create permission is checked before saving initiative ID/version.
2. Actor adds research notes or HTTPS source links in Resources and associates them to that initiative; dates, observed facts and interpretation remain distinct. Missing source/measurement is Unknown, not an invented value.
3. Owner moves idea → research and creates investigation tasks in the same canonical Work system. Failed save retains a labelled draft; duplicate retry returns the same initiative/task IDs; a restricted source provides a request-access route without disclosing contents.

**Acceptance:** Create one initiative with two sources and one task. Reload produces exactly 1 initiative, 2 associations and 1 task; unauthorized observer sees 0 restricted-note bodies. Workspace Changes records successful mutations only.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** strategy_initiative,strategy_research,resource_notes,work_task_fields,work_forms,changes-atomically


###### 4–6 · review an initiative without manufacturing certainty

ID: flow-strategy-decision · proposed · P0

4. Owner opens the initiative review screen and submits research → decision pending with evidence, benefit/effort assumptions, unresolved questions and proposed dependency owners.
5. Designated reviewer checks current scope/action grant and exact initiative version; chooses approved for delivery, hold, or rejected with rationale. Hold includes an explicit next review date or deliberate unset date; a VP title alone does not grant approval.
6. A newer evidence/version edit invalidates a stale approval attempt and returns the reviewer to the current diff. Rejection/hold closes that decision branch without deleting research; the owner receives a scoped next action and can later submit a new version.

**Acceptance:** Three fixture decisions map to three distinct outcomes with reviewer/time/version. A stale approval changes 0 records; a rejected initiative creates 0 delivery projects automatically.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** strategy_reviews,work_decisions,work_concurrent_updates,access_action_matrix,access_vp_scope,changes-event


###### 7–10 · link approved strategy to accountable work

ID: flow-strategy-deliver · proposed · P0

7. Approved owner selects Create project or Link existing; permission and duplicate association checks produce one project ID, accountable lead and required milestone. Approval itself does not fabricate an actual project start.
8. Delivery lead uses Overview → Work to assign canonical tasks and cross-division dependencies; an unavailable participant requires an explicit project grant, not implicit access from a mention. Blocked dependencies carry owner/next action.
9. Owner records outcome observations against the stated metric source/date or marks inconclusive. Project/milestone completion remains an explicit evidence-backed decision.
10. Reviewer opens initiative → linked project and exports only permitted evidence/rationale/outcome. Returning to Strategy retains filters/context; workspace Changes records local state transitions and scoped handoffs.
Optional P1 experiment/metric branch: adopted experiment or numeric observation framework may supplement outcome notes. Baseline retains dated evidence, rationale and an explicit outcome or inconclusive finding.

**Acceptance:** One approved initiative links exactly one chosen project. An ungranted division member cannot open it; metric history contains only recorded observations. Export reconciles the same initiative/project IDs.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** strategy_dependencies,work_project_tabs,work_milestones,access_project_collab,integration-exports,changes-scope


###### Human Resource · approved roster → onboarding → member continuity

ID: flow-hr-members · proposed · P0

Actors: authorized HR operator, approving administrator, new member, checklist owner and division lead. Trigger: an approved roster/role decision, not a recruitment acceptance alone. Finish: an active member can enter the correct division, complete real onboarding tasks and retain authorship through later transfer/departure. HR has no survey respondent, so privacy and appointment rules remain unapproved.

**Acceptance:** Validate invite/onboarding/transfer/departure with distinct people, account links and membership IDs. Restricted HR review fields are absent from ordinary member views.

**Owner:** HR lead / Admin / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** division_hr,hr_acceptance,hr_validation,security_hr


###### 1–3 · prepare the roster decision without silently granting access

ID: flow-hr-roster · proposed · P0

1. HR opens People in its authorized scope and searches existing person/contact before adding a person or proposed current-term membership. Minimum required identity/contact fields follow the adopted privacy policy.
2. HR records proposed division, role, effective term and rationale; privileged access changes require the authorized administrator/approver. An existing person gets a new membership association, not a duplicate identity.
3. The administrator reviews the exact roster proposal, checks actual action grants, and accepts/rejects it. A rejection returns to HR with reason; approving a roster does not claim an invitation was delivered or a user authenticated.

**Acceptance:** For 1 existing and 1 new person, approving proposals yields exactly 2 intended memberships and 0 duplicate people. An HR-only operator cannot assign Admin privileges. Audit identifies proposer and approver.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** hr_person,entity_person,entity_membership,access_admin_scope,entity_membership,security_bootstrap,changes-sensitive


###### 4–7 · invite and complete actual onboarding

ID: flow-hr-onboarding · proposed · P0

4. Authorized admin creates a scoped invitation; delivery follows the configured channel and invite acceptance matches the approved account identity. Pending/revoked/expired invitations remain visible to the authorized operator.
5. HR applies an optional reviewed onboarding template that creates real tasks with owners, target dates and linked notes/resources. Template application previews count and avoids duplicate checklist/task creation on retry.
6. New member signs in, sees their actual workspace, opens each assigned task, performs the work and submits evidence. The task owner/reviewer confirms checklist items using canonical task state; missing evidence stays incomplete.
7. HR and division lead review the membership's onboarding progress. Attendance, declared availability or development tasks are optional actual inputs; unknown attendance never becomes an absence/performance score.
Optional P1 branches: a dedicated onboarding-instance/report, event attendance or development plan is used only if adopted. Baseline offers reviewed orientation notes and 3 real canonical onboarding tasks; it does not require an HR analytics/development module.

**Acceptance:** Baseline fixture orientation with 3 items creates exactly 3 canonical tasks linked to the same member/context; applying the same operation adds 0 duplicates. If the optional onboarding module is adopted, one instance links those tasks. Member sees 0 private applicant/reviewer fields.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** hr_onboarding,security_auth,work_task_lifecycle,resource_provider_access


###### 8–10 · transfer, depart and hand over responsibilities

ID: flow-hr-continuity · proposed · P0

8. Authorized HR/admin previews a division/term change including open tasks, specialist queues, project grants and resource/account custodians. Actual task reassignment is a separate permitted decision.
9. At effective transfer/departure, apply account/membership/session controls, retain person/authorship IDs and close or reassign duties. Last-administrator guard and provider custody checklist prevent orphaned control; new restricted access is rechecked immediately.
10. HR exports scoped current roster/onboarding with effective dates and pending exceptions. Private applicant or feedback records use a separately authorized export. Successor acknowledges unresolved actions; safe source/destination events retain current workspace separation.

**Acceptance:** Transfer one member A→B with 2 unfinished tasks and 1 resource custody duty. Every duty is retained/reassigned/flagged exactly once; old access fails on direct URLs after effective revocation. Roster export excludes private recruitment data.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** hr_roster_change,hr_exports,security_offboarding,access_revocation,resource_account_history,org_activation_preview,changes-move


###### Human Resource · optional recruitment → explicit membership approval

ID: flow-hr-recruitment · proposed · P1

Actors: permitted recruiter, candidate contact, interview reviewer and authorized roster approver. Trigger: an adopted recruitment cycle with privacy/retention policy. Finish: a candidate outcome with evidence; an accepted candidate separately proceeds to approved roster/invitation. Candidate stages/scoring are proposed; no public application portal or auto-admission is promised.

**Acceptance:** Enable only if HR adopts the workflow. Test accepted, rejected, withdrawn, duplicate and stale-decision routes without granting organization access from candidate status.

**Owner:** HR lead / privacy owner / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** hr_recruitment,hr_candidate_edgecases,hr_validation,entity_recruitment


###### 1–3 · create and restrict a candidate application

ID: flow-hr-candidate · proposed · P1

1. Recruiter opens Recruitment cycle, checks policy and required-minimum fields, and enters a candidate/application resource; existing contact/cycle duplicates are flagged for review rather than silently merged.
2. Recruiter assigns reviewer and moves new → screening → interview only for recorded actions. Interview scheduling creates a restricted meeting; ordinary members see 0 applicant contact/reviewer notes.
3. Withdrawal records reason if voluntarily supplied, ends further active reminders and preserves authorized retention rules. Wrong identity/duplicate paths return to reviewed correction; no public roster or membership is created.

**Acceptance:** Two duplicate entries for one contact/cycle require an explicit decision and create no second membership. Withdrawn applicant receives 0 newly scheduled recruitment reminders. Restricted reviewer note is absent from generic search/export.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** hr_recruitment,hr_candidate_edgecases,security_hr,work_meeting_composer,work_search,hr_events


###### 4–6 · decide the application and hand off to an approved roster

ID: flow-hr-candidate-decision · proposed · P1

4. Reviewer opens current application evidence/version and records accepted/rejected with reason under adopted authority; scoring/ranking remains unset unless separately approved.
5. New evidence or concurrent reviewer update blocks a stale overwrite and returns a compare/refresh path. Decision notifications contain only the recipient's permitted fields.
6. Accepted application links a proposed roster/person entry for authorized membership approval. The later invitation/account link is separate; rejected/withdrawn candidates retain no app membership, and any later reapplication keeps its own cycle provenance.

**Acceptance:** Accepted candidate has 0 active organization memberships before explicit approval. Concurrent decisions preserve one authoritative application version and earlier event history. Export by an ordinary member exposes 0 application rows.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** hr_candidate_edgecases,hr_exports,entity_approval,entity_membership,work_concurrent_updates,security_exports,changes-sensitive


###### External Engagement · relationship → follow-up → approved handoff

ID: flow-external · proposed · P0

Actors: relationship PIC, division lead, scoped VP, Consulting lead, Legal reviewer and Finance operator. Trigger: a prospect, partnership/client enquiry, or recorded interaction. Finish: relationship closed/paused with reason, or active with an accountable canonical project and controlled legal/finance handoff. Survey source is one Client Engagement response mapped to External; exact CRM stages/channels remain proposals.

**Acceptance:** Run one no-response prospect, one declined prospect and one handed-off client. The relationship does not imply signed agreement, project access or money movement.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** division_external,external_acceptance,external_validation


###### 1–3 · find or create a relationship and accountable next step

ID: flow-external-intake · proposed · P0

1. PIC opens External workspace → Relationships, searches organization/contact to avoid duplicate outreach, and creates permitted minimum organization/contact metadata with kind and PIC. Potential duplicates go to explicit review, preserving provenance.
2. PIC records actual interaction date/channel/outcome or leaves contacted date unset. Saving prospect → contacted requires a recorded attempt; choosing a stage alone cannot fabricate interaction history.
3. PIC creates a canonical follow-up task with next action, assignee and actual needed-by date or explicit undated state. Phone UI saves/reloads the same relationship/task IDs; failed send/work remains an unsent draft or failed operation, never an invented interaction.

**Acceptance:** Create one relationship, one actual interaction and one follow-up task; Work, Relationships and Updates reference identical IDs. One retry creates 0 duplicates. Search by an ungranted member discloses 0 private contact fields.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** external_relationship,external_interaction,external_followup,entity_partner,entity_contact,entity_interaction,work_forms


###### 4–6 · handle contact, silence and a real opportunity

ID: flow-external-followup · proposed · P0

4. PIC opens the follow-up from Updates and acts using an authorized external channel outside DWDG’ONE; afterwards records the real attempt/outcome. No bot, email delivery or WhatsApp sending is assumed.
5. No response keeps attempt history and explicitly reschedules/cancels the task under adopted cadence; declined/lost requires a reason, and paused requires a next review date or deliberately unset date. An overdue date never means a contact failed.
6. An actual discussion may create an optional opportunity brief with requested scope, decision needed and supporting links. Lead records next decision from the current version; provider access failure creates a resource issue/owner route rather than public-link expansion.

**Acceptance:** No-response fixture records 2 attempts and exactly 1 active next follow-up. Declined fixture creates 0 delivery projects. Recipient reminders are deduplicated against the canonical task and canceled when its state warrants.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** external_no_response,external_stages,external_events_export,work_reminders,resource_link_issue,resource_provider_access


###### 7–10 · approve delivery context and legal/finance dependencies

ID: flow-external-handoff · proposed · P0

7. Lead records whether to pursue/hold/decline using adopted authority; pursuit links one existing/new Consulting project with agreed brief and an explicit accountable accepting owner.
8. Project lead previews any participant/division grant needed by Consulting or Legal. Sharing a resource/mention creates no access by itself; recipients without grants request permitted context and see no hidden documents.
9. Legal request attaches the actual counterpart/scope/signatory information and returns signed/BAST readiness evidence; Finance records only its own authorized invoice-term/request status. Relationship active is an explicit decision, never inferred as legal signed or paid.
10. PIC returns to Relationships for current state/next contact, and exports permitted relationships, stage, PIC, follow-up and linked handoff IDs. External client-facing summary gets a separately reviewed field selection; workspace Changes exposes only External-safe event context.
Optional P1 opportunity/receivable branch: an adopted opportunity/term record may be linked; the baseline uses reviewed brief and canonical project/Legal/Finance handoff tasks. Relationship activation does not depend on receivables.

**Acceptance:** 1 relationship → 1 project → 1 legal request retains canonical links. Missing participant grant blocks recipient direct access; unsigned legal state creates 0 normal ready-for-invoice transitions. Export row counts match filtered relationships.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** external_handoff,access_project_collab,consulting_start,legal_request,legal_bast_gate,external_events_export,changes-scope


###### MarCom & IT · content brief → reviewed output → recorded publication

ID: flow-marketing-content · proposed · P0

Actors: campaign owner, assigned executor, designated reviewer, authorized publication operator and scoped lead. Trigger: a campaign/content request. Finish: channel-specific publication evidence recorded against the approved version, or explicit cancellation/revision. Assignment, reminders and publication evidence reflect the two MarCom survey responses; exact approval policy remains open.

**Acceptance:** Validate content scheduled but unpublished, one revision loop, stale approval, and two-channel actual publication. External publishing occurs outside this app.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** division_marketing,marketing_acceptance,marketing_validation,marketing_lifecycle


###### 1–3 · define the brief, executor and two different dates

ID: flow-marketing-brief · proposed · P0

1. Campaign owner opens MarCom workspace → Campaigns/Content and creates/links a campaign with goal, channels, owner and content item. A standalone content item may remain outside a campaign without a fake parent.
2. Owner enters deliverable criteria, assigned executor, internal task due date and separately planned publication date/time per channel. Work tasks/resource associations remain canonical; scheduling assistance uses recorded meetings/declared availability only.
3. Executor opens Resources for the brief/brand notes and HTTPS asset/app links; avatar responsibility is context, not provider permission. Missing provider access gives owner/issue route. Drafting begins after a real saved transition, not when a task is merely opened.
Optional availability branch: if declared availability is adopted, use that labelled evidence. The baseline can assign work with recorded meetings and explicit coordinator judgment; no declaration feature is required.

**Acceptance:** One content item has distinct internal due and planned publication fields; date edits change neither actual publication nor completion history. A link to an inaccessible Canva/Drive asset creates no provider grant.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** marketing_campaign,marketing_content,marketing_dates,marketing_brand_assets,resource_bubbles,resource_provider_access,entity_contentitem


###### 4–7 · execute and review the exact resource version

ID: flow-marketing-review · proposed · P0

4. Executor edits work using external tools or native notes, records a current resource/version reference and submits drafting → review with required evidence. Missing URL/version/evidence returns clear validation while retaining the draft.
5. Reviewer checks current content/resource version and review action grant; either approves with actor/time or returns revision requested with linked feedback/revision task. Review notes contain only the permitted context.
6. Executor follows the canonical revision task, updates resource/version and resubmits. An approved asset edited afterward invalidates affected approval and scheduled-ready state; the reviewer receives a new scoped action.
7. Concurrent editor/reviewer write shows a current-versus-draft comparison; stale approval or duplicated retry cannot approve another version. Canceling content records reason and ends active publication/reminder obligations without deleting history.

**Acceptance:** Version V1 returned → V2 approved shows both review decisions and exactly one linked revision task. V3 edit makes V2 approval unusable for V3 publication readiness. Stale review modifies 0 authoritative state.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** marketing_stale_approval,resource_revisions,work_task_lifecycle,work_task_fields,work_concurrent_updates,entity_approval,marketing_events


###### 8–11 · schedule, publish outside the app and confirm outcomes

ID: flow-marketing-publication · proposed · P0

8. Authorized operator moves approved → scheduled with approved current version, planned channel/date and publication responsibility. Protected public dates require a deliberate change decision if moved.
9. When planned date passes, item remains scheduled; operator actually publishes using the external channel and records per-channel actual timestamp, public URL/evidence or approved explicit attestation. The app never claims to publish for the operator.
10. For two intended channels, one success and one failure retain independent outcomes. The failure creates a scoped follow-up/retry task, not an all-published summary; permission is rechecked before any recording or evidence edit.
11. Lead inspects content calendar planned versus actual, opens evidence and exports selected content/channel records. Internal notes/account access paths are excluded from a separately reviewed public report. Returning to Work uses the same executor task IDs.

**Acceptance:** With 2 channels and only 1 publication proof, there is 1 actual publication and 1 unresolved channel obligation. Scheduled-date passage alone produces 0 publication events. Export includes the same recorded actual evidence/time.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** marketing_cadence,marketing_publication_records,marketing_exports,timeline_protected_dates,resource_export_security,changes-atomically


###### MarCom & IT · service request → resolution → requester confirmation

ID: flow-it-support · proposed · P0

Actors: member requester, authorized IT triager, assigned technician, service/account custodian and requester confirmer. Trigger: a recorded access/system issue or support request. Finish: an evidence-backed resolution with requester confirmation or reopened case. This is a lightweight proposed request/task workflow, not a helpdesk SLA or new service subscription.

**Acceptance:** Validate an access issue, ordinary bug, blocked provider issue and reopened resolution using one request and linked canonical tasks.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** marketing_it_requests,marketing_account_register,marketing_validation


###### 1–4 · record, classify and assign a safe support request

ID: flow-it-request-triage · proposed · P0

1. Requester opens Help/IT request from their permitted workspace, gives affected service, symptom, impact and safe resource/screenshot link; form explicitly avoids password/token entry. Production support details are restricted if they expose personal data.
2. IT triager checks access, request version and current severity/owner; acknowledges under a separately adopted support policy. No response-time guarantee is fabricated from priority.
3. Triager creates/links canonical work tasks and identifies account/service custodian via safe register metadata. Linking a request does not let technicians change organization roles or provider permissions without the correct authority.
4. If missing reproducible information, triager requests a scoped clarification; if provider outage/credential custody blocks work, record blocker/next action. Requester sees useful status/reason, not internal secret-bearing notes.

**Acceptance:** 1 request with 2 engineering tasks retains 1 request ID and 2 canonical task IDs. Ordinary requester sees 0 secret values/private triage notes. Blocked provider access remains visibly unresolved.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** marketing_it_requests,resource_secret_links,resource_account_history,work_blockers,access_resource_inheritance,security_secrets


###### 5–8 · perform approved work and confirm whether the issue is solved

ID: flow-it-resolve · proposed · P0

5. Technician follows approved change/access/release procedures outside the request flow and records actual work/evidence, affected version and safe rollback guidance. A support request alone never authorizes production deployment.
6. Technician proposes resolved status with evidence and requester-confirmation task; requester opens the same request and confirms solved or reopens with new facts. Closing cannot silently turn a request into proof of live security/reliability.
7. Conflicting updates compare current version; cancellation/duplicate merge retains lineage and real tasks. Account custody transfer records the custodian/access-request path without copying a password.
8. IT lead exports scoped request states/owners/open blockers, hands off unresolved cases and updates permitted knowledge notes. Requester returns to their original work; workspace Changes and privileged operational audit remain separate.

**Acceptance:** Request resolved then reopened preserves one request ID, both transitions and evidence. A role lacking deploy privileges performs 0 releases from this journey. Request export excludes credentials and restricted diagnostic details.

**Owner:** Division lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** marketing_events,marketing_exports,work_concurrent_updates,resource_account_history,releases,security_audit,changes-scope


###### Legal & Finance · legal intake → approved document → signature/gate

ID: flow-legal · proposed · P0

Actors: authorized requester, legal triager/drafter, independent designated reviewer, authorized numbering operator, external signatories and Finance handoff owner. Trigger: a real document/agreement request. Finish: signed/registered reference and permitted downstream readiness, or a recorded rejection/cancellation/revision. Survey Legal respondent describes proposed PKS→BAST→invoice linkage; numbering moment, authority and lead times remain open.

**Acceptance:** Validate normal signed route, revision loop, unsigned downstream denial, unique issuance under concurrent requests, and urgent exception. No digital signature, document sending or legal validity is established by app status.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** division_legal_finance,legal_acceptance,legal_sla,access_legal_policy,legal_numbering


###### 1–4 · submit complete structured intake and triage it

ID: flow-legal-intake · proposed · P0

1. Requester opens their permitted project → legal request, supplies type/purpose, counterpart identity needed by policy, accountable owner, required-by date and source/KAK/resource links. A private legal queue field is unavailable to ordinary requesters.
2. Form validates required facts and safe links while retaining draft on validation/failure. Submit creates one request/version and scoped requester-facing next-action state; retry returns its original ID.
3. Legal triager checks workload and adopted authority, records triaged/drafting owner and returns missing information with a specific requirement. Requester corrects the same request, preserving submitted history.
4. If date is urgent, an authorized reviewer records exception rationale/risk and actual next action. H-2/H-3 are survey suggestions only; the app cannot promise lead time or self-approve urgency. Incomplete requests remain visible as waiting for information.

**Acceptance:** Submitting one request twice yields exactly 1 legal request. Missing signatory data blocks the applicable gate with retained draft; restricted reviewer fields are absent from requester search/detail/export. Urgency does not bypass authority.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** legal_request,legal_requester_view,legal_urgent,legal_sla,entity_legalrequest,work_forms,resource_link_validation


###### 5–8 · draft, review and revise with traceable versions

ID: flow-legal-draft-review · proposed · P0

5. Assigned drafter selects an approved-use template/version and records a draft resource/version in drafting → in review. Provider file editing occurs outside the app; internal notes/links reference the current output.
6. Reviewer reads exact draft version, counterpart response and policy checklist separately, then records approved for signature or revision requested with reason and linked revision work. A counterpart comment is not internal legal approval.
7. Drafter submits a new version linked to the prior reviewed version; requester sees permitted next action while confidential reviewer notes remain restricted. A failed save preserves draft but does not claim approved state.
8. Simultaneous edits or a changed draft before approval cause a stale-version denial and a compare/review return. Rejected/cancelled requests keep safe history and terminate active obligations instead of erasing the register.

**Acceptance:** Draft V1 returned → V2 approved yields two version references and distinct review decisions. Attempt to approve stale V1 changes 0 state. Requester sees 0 private reviewer-note bodies.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** legal_pipeline,legal_templates,resource_revisions,work_task_lifecycle,work_concurrent_updates,access_review_self_policy,changes-sensitive


###### 9–11 · issue an official number only under the adopted policy

ID: flow-legal-number · proposed · P0

9. Authorized numbering operator reaches the approved issuance/registration moment and confirms request type, batch/year, current approved version and sequence policy. Until format/moment/authority are adopted, this production action remains disabled rather than guessing a number.
10. Server executes one unique immutable issuance/register operation. Concurrent clients or retried submission receive distinct eligible numbers or the prior issued result for the same operation; neither relies on last-row+1 in the browser.
11. Wrong/withdrawn issued number follows authorized void/reissue with reason and lineage. Void remains in the register and is never silently recycled. Losing numbering authority between preview and save denies the operation and returns to current permitted view.

**Acceptance:** Two independent eligible requests issued concurrently receive 2 unique numbers; retrying one creates 0 extra numbers. One void remains in register/export with actor/reason and a linked reissue if authorized. Unadopted policy permits 0 issuance.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** legal_numbering,legal_number_void,entity_documentregister,security_permissions,reliability_retry,legal_export


###### 12–15 · record actual signatures and verify BAST readiness

ID: flow-legal-signatures · proposed · P0

12. Authorized operator transitions approved for signature → awaiting signature and records required signatories/current document version. Actual signing and document exchange occur using separately authorized external processes.
13. As evidence arrives, operator records each signature status/source or approved attestation against the exact version. Missing/declined signatory remains unresolved; a changed document requires a new appropriate review/signature assessment.
14. Only authorized complete evidence permits signed; authorized register/archive actions preserve numbered/signed version references. A due date passing cannot sign a document, and missing provider access cannot justify public exposure.
15. For the adopted PKS→BAST flow, legal reviewer checks signed agreement plus actual delivery/BAST evidence. Unverified BAST or unsigned PKS blocks normal ready-for-invoice; a permitted exception has explicit authority, reason and scope.

**Acceptance:** With 2 required signatories and only 1 recorded proof, request stays awaiting signature. Unsigned PKS and unverified BAST each block normal downstream readiness. Changed-version evidence never automatically satisfies old approval/signatures.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** legal_signature_status,legal_pipeline,legal_bast_gate,resource_revisions,resource_provider_access,entity_approval


###### 16–18 · hand off permitted evidence and close the register

ID: flow-legal-handoff · proposed · P0

16. Authorized Legal actor creates/links a Finance readiness/term record or notification containing only permitted source agreement, BAST/gate decision and next owner. It never creates a payment or automatically sends an invoice.
17. Finance recipient with actual grant acknowledges/returns missing information against canonical IDs; no grant yields a request-access path without signatory/private-review disclosure. Correcting a gate records a new decision, never edits old history invisibly.
18. Legal owner opens register export, checks exact issued/void/version/signature state and unresolved gates, then archives only permitted completed requests. Next-term owner receives unresolved actions; Changes remains selected workspace scoped.
Optional P1 receivable branch: native incoming-term tracking is used only if adopted. The baseline hands Finance one canonical scoped follow-up/task with gate evidence and next owner; no native invoice/term feature is needed.

**Acceptance:** One legal handoff yields one linked Finance readiness record or one canonical pending notification, never duplicate invoice/payment on retry. Legal export reconciles register rows exactly and excludes private fields for unauthorized requester.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** legal_events,legal_export,legal_bast_gate,security_exports,changes-scope,work_link_integrity


###### Legal & Finance · budget → expense request → recorded payment → reconciliation

ID: flow-finance-outgoing · proposed · P0

Actors: allocation approver, requester, independent finance reviewer, separately authorized payment recorder and period reviewer. Trigger: a project/organization spending need. Finish: reconciled recorded expense with evidence, or clear rejected/cancelled/outstanding state. This journey records approved human transactions; it does not hold money, transfer funds or promise accounting/tax completeness.

**Acceptance:** Run approved, rejected, self-approval-denied and partial-paid cases; run native refund adjustment only if its optional P1 feature is adopted. Exact integer IDR separates requested, approved, paid, outstanding and allocation balance.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** finance_acceptance,finance_sop,access_finance_policy,finance_request


###### 1–3 · establish an allocation before committing money

ID: flow-finance-allocation · proposed · P0

1. Authorized operator opens Finance → Budgets for permitted project/period and records allocation proposal with purpose, exact nonnegative integer IDR amount, source and version. Actual project financial figures are independent of the web-app operating budget.
2. Designated approver reviews allocation scope/authority and records approval or return reason; only approved allocation is used as the adopted budget basis. An unavailable reviewer yields a pending action, not auto-approval.
3. Amending a live allocation previews approved commitments/paid totals and remaining funds. A reduction below obligations requires adopted authority/explicit exception or denial; concurrent amendments compare versions and retain prior decisions.

**Acceptance:** Synthetic test allocation Rp 300,000 is clearly labelled fixture, not hosting budget. Approving it records exact 300000 IDR; forbidden/stale allocation amendment changes 0 approved amount. No balance is inferred from a missing allocation.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** finance_budget,finance_amend,entity_financebudget,entity_approval,work_concurrent_updates,access_finance_policy


###### 4–6 · submit a supported expense request

ID: flow-finance-submit · proposed · P0

4. Requester opens permitted budget/project and enters purpose/category, requested amount, minimal recipient metadata, needed-by and supporting native-note/external evidence reference. Positive integer IDR and allowed scope validation retain a draft on error.
5. Submit draft → submitted creates one request ID and reviewer action; missing evidence follows adopted required-field policy, not invented receipt bytes. Potential duplicate evidence/request is flagged for human confirmation.
6. Requester views status and next action through a permitted request summary. Sensitive payee/bank/receipt fields are restricted per policy; changing submitted amount/evidence creates a new version requiring current review. A retry cannot create another request.

**Acceptance:** One Rp 90,000 request submitted twice creates exactly 1 record with requested=90000. Invalid negative/fractional IDR is rejected. Ordinary other member sees 0 restricted recipient/evidence fields.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** finance_request,finance_validation,entity_financerequest,finance_receipts_export,security_finance,reliability_retry


###### 7–9 · approve independently and reserve the adopted commitment basis

ID: flow-finance-review · proposed · P0

7. Reviewer opens current submitted request, supporting references and actual approved allocation/commitments; under review checks specialist grant, self-approval rule and record version.
8. Reviewer approves an explicit amount, rejects, or returns for correction with reason under adopted policy. Approved amount is distinct from requested amount; over-allocation policy remains an explicit grant/exception decision rather than silent approval.
9. Record approval actor/time/version and approved commitment basis atomically. Requester/next payment owner receive scoped status/action. Rejection/return preserves original requested history; revoked authority or stale review fails without changing commitments.

**Acceptance:** Requester attempting self-approval produces 0 approvals. Approving Rp 90,000 against fixture Rp 300,000 records approved commitment 90,000 and remaining allocation 210,000 under the total-approved basis. Approval retry adds 0 duplicate commitments.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** access_review_self_policy,finance_comparisons,finance_events,entity_approval,security_permissions,changes-atomically


###### 10–13 · record an actual partial and final payment

ID: flow-finance-payment · proposed · P0

10. Separately authorized payment operator performs the approved payment outside DWDG’ONE using organizational procedures, then records actual amount/date/evidence reference and request ID. Selecting Approved never means paid.
11. Record first fixture payment Rp 30,000: request becomes partially paid, paid-to-date=30000 and approved outstanding=60000. An uncertain external transaction remains unconfirmed/pending investigation rather than paid twice.
12. After real confirmation, record final fixture Rp 60,000; paid-to-date=90000 and outstanding=0. Duplicate reference/operation is denied or resolved as prior result; an amount beyond allowed remaining total requires adopted adjustment authority.
13. A correction/refund creates reviewed adjustment/lineage, never silently rewrites old payment. Revoked payment role, stale balance or missing evidence returns to clear current permitted state without taking any external payment action.
Optional P1 adjustment branch: native refund/correction automation/entries require adopted policy/feature. Baseline flags a discrepancy, records a permitted linked decision/task and preserves original payment evidence; it never silently rewrites money records.

**Acceptance:** Two confirmed payments of 30,000 + 60,000 sum exactly to 90,000 IDR. Approved commitment stays 90,000 and remaining allocation stays 210,000. Duplicate retry creates 0 extra payment records. Approved status alone creates 0 paid amount.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** entity_paymentrecord,finance_validation,finance_comparisons,finance_events,security_finance,reliability_retry


###### 14–17 · reconcile evidence, retain discrepancies and export the period

ID: flow-finance-reconcile · proposed · P0

14. Period reviewer compares recorded payments/adjustments and external ledger/bank/receipt evidence under authorized access. Every unresolved mismatch has owner/next action; paid is not automatically reconciled.
15. Reviewer records reconciled only when adopted checklist matches exact request/payment totals and evidence. Missing external evidence holds discrepancy open; pending claims remain separate from confirmed amounts.
16. Save a period snapshot with as-of timestamp, included request/payment IDs and formula basis. Export budget/request/payment rows and note/link references, not default binary receipt bytes; requester export contains only permitted detail.
17. Hand off outstanding approved requests/discrepancies/custody to successor. Later correction creates a new snapshot/adjustment event; old snapshot remains identified as past basis and current workspace Changes reports safe finance mutations.
Optional P1 snapshot/adjustment branch: use a native period snapshot or reviewed adjustment feature only if adopted. Baseline reconciles exact canonical request/payment rows in a labelled as-of export and records unresolved correction action without changing old payment evidence.

**Acceptance:** Fixture report lists 1 allocation, 1 approved request and 2 payments: paid 90,000, outstanding 0, remaining 210,000 IDR. IDs/totals reconcile exactly. A one-IDR mismatch blocks normal reconciliation. An ungranted export yields 0 financial rows.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** finance_receipts_export,finance_comparisons,security_exports,changes-sensitive


###### Legal & Finance · optional receivable term → confirmed incoming receipt

ID: flow-finance-incoming · proposed · P1

Actors: Legal gate reviewer, Finance term operator, authorized receipt recorder and period reviewer. Trigger: approved ready-for-invoice evidence for a client delivery. Finish: minimal incoming invoice/term tracking with actual receipt/outstanding evidence. Native invoice generation, taxation and payment collection remain deferred; income is separate from outgoing expenses.

**Acceptance:** If P1 receivable tracking is adopted, test legal-gate denial and partial incoming receipt without treating expected income as expense or confirmed cash.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** finance_incoming_terms,legal_bast_gate,finance_sop


###### 1–3 · create a receivable reference from a permitted legal gate

ID: flow-finance-income-open · proposed · P1

1. Finance opens canonical Legal/Consulting handoff and checks current signed/BAST gate evidence and scoped term action. Missing/failed gate returns to Legal next owner; exception requires recorded authority/rationale.
2. Operator records external invoice reference/link, client/project, expected integer IDR term amount, due date and responsible collector under adopted policy. Actual invoice is issued outside the app; app status cannot claim external delivery.
3. Reviewer verifies term basis and linked agreement version; retry creates no duplicate term. Due date passage yields overdue condition only, never received state or legal debt determination.

**Acceptance:** An unsigned or unverified gate produces 0 normal receivable-readiness transitions. One handoff operation creates exactly 1 term. Expected 50,000 IDR is excluded from confirmed income until actual receipt evidence is recorded.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** finance_incoming_terms,legal_bast_gate,entity_approval,resource_link_validation,security_finance


###### 4–6 · record receipt and reconcile without mixing directions

ID: flow-finance-income-close · proposed · P1

4. Authorized recorder verifies actual incoming funds outside the app and records received amount/date/evidence against term ID; partial receipt leaves expected outstanding visible.
5. Reviewer checks totals and references, records reconciliation or discrepancy with owner. Duplicate receipt reference/operation is resolved without increasing received amount; uncertain payment stays unconfirmed.
6. Export incoming expected/received/outstanding separately from outgoing request/payment tables. Legal/Consulting see only the permitted handoff summary; successor receives unresolved collection actions and source links.

**Acceptance:** Synthetic term 50,000 IDR with confirmed receipts 20,000 + 30,000 shows received 50,000 and outstanding 0; outgoing spend stays unchanged. Retrying a receipt adds 0 duplicates. Export keeps expected income separate from expense commitment.

**Owner:** Legal & Finance lead / product / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** finance_incoming_terms,finance_period_snapshot,finance_receipts_export,reliability_retry,changes-sensitive


###### Consulting · agreed scope → reviewed deliverable → accepted handover

ID: flow-consulting · proposed · P0

Actors: accountable delivery lead, Project Leader (PL), Project Manager (PM), contributor, independent reviewer, client contact, Legal and Finance handoff owners. PL content/solution and PM schedule/coordination/risk/client-update separation comes from respondent detail; exact appointments/actions/stages require Consulting review. Trigger: approved enquiry or initiative. Finish: actual delivered/accepted outcome with unresolved obligations handed over, not decorative percent completion.

**Acceptance:** Run a project with 2 deliverables, 1 blocker, 1 scope revision, 1 review return and 1 legal/finance handoff. Overview, Work, Resources and portfolio reference the same IDs and actual states.

**Owner:** Consulting lead / PL / PM / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** division_consulting,consulting_acceptance,consulting_validation,consulting_roles


###### 1–4 · accept scope and appoint accountable delivery roles

ID: flow-consulting-start · proposed · P0

1. Delivery lead opens a permitted External/Strategy handoff or creates a draft Consulting project; checks duplicate project/relationship links and actual collaboration scope before accepting responsibility.
2. PL records scope brief/version with goal, boundary, output criteria, client assumptions and required resources. PM records schedule assumptions, client contact and next coordination action; actual start date remains unset until authorized start.
3. Lead names PL, PM, team and independent reviewer with explicit action permissions. When one person holds two roles, prohibited self-approval still applies; a title/assignment grants no new private resource/provider access.
4. Lead reviews current scope/roles and chooses planned → active or returns for correction. Missing client/scope approval is a pending decision, not implied agreement; failed save returns to retained draft and repeated accept operation retains one project ID.

**Acceptance:** Accepted handoff yields exactly 1 canonical project with explicit PL/PM/reviewer. Active state has authorized start evidence; draft has no fabricated start. Self-review and ungranted collaborator access fail.

**Owner:** Consulting lead / PL / PM / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** consulting_start,consulting_scope,consulting_roles,access_review_self_policy,access_project_collab,work_project_lifecycle,entity_project


###### 5–8 · define deliverables, milestones and one canonical work plan

ID: flow-consulting-plan · proposed · P0

5. PL defines each deliverable's output criteria and required evidence/resource versions. PM creates required tasks/assignees, milestones and finish-to-start dependencies in Work; optional subtasks retain canonical task IDs.
6. Timeline uses actual planned/due fields with undated work shown separately. PM consults declared availability/recorded meetings and honest workload counts; absent external calendars or effort cannot prove free capacity.
7. Resource inspector delegates responsibility and creates/links work against actual deliverable resources. Every task is the same record in list/board/timeline/member views, not copied into a second project workspace.
8. Team reviews required gates and owns cross-division next actions. A hidden/deleted prerequisite remains unresolved; project grants require authorized review, and protected client/legal targets require separate change authority.
Optional P1 branches: use one-level subtasks and declared/planned capacity only if separately adopted. The baseline fixture uses 6 flat canonical tasks and recorded meetings; none of these extensions gates project setup.

**Acceptance:** Two deliverables with 3 tasks each produce exactly 6 canonical tasks; list/board/timeline IDs match. Missing prerequisite blocks silent readiness. Undated task has no invented range. Resource assignment creates 0 access grants.

**Owner:** Consulting lead / PL / PM / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** consulting_deliverable,work_milestones,work_dependencies,work_work_views,timeline_unscheduled,timeline_protected_dates,resource_tasks


###### 9–12 · execute, surface a blocker and review scope/date changes

ID: flow-consulting-execute · proposed · P0

9. Contributor opens assigned work, performs actual work in native notes/external tools, records output/evidence and saves not started → in progress → in review as appropriate; a failed save does not show success.
10. A present obstruction creates an active blocker with owner/next action; a potential issue remains a risk. PM records actual client interaction/update separately from task completion or automatic notification.
11. PL/PM proposes scope or date changes with current version, reason and impact on deliverables/milestones/dependencies. Authorized reviewer confirms/rejects; a timeline cascade previews exact affected dates rather than shifting protected commitments silently.
12. Approved change creates a new scope/plan version, invalidates affected readiness and informs only permitted owners. Rejection keeps current plan and follow-up action; concurrent change returns comparison rather than overwriting another person's work.
Optional P1 cascade branch: dependency cascade is exercised only if adopted. Baseline uses authorized explicit date forms and reviewed affected obligations; a scope change never silently shifts client/legal/publication commitments.
Optional P1 risk-register branch: a native risk entity is used only if adopted. Baseline keeps potential-risk context in a labelled native note/decision, distinct from an active blocker.

**Acceptance:** Fixture blocker and risk remain distinct. One approved scope revision invalidates affected review gates; a rejected cascade moves 0 tasks. Client update records actual interaction date/source.

**Owner:** Consulting lead / PL / PM / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** consulting_scope,consulting_stale_ready,work_blockers,consulting_client_update,timeline_date_validation,work_concurrent_updates


###### 13–16 · review exact deliverables and resolve feedback

ID: flow-consulting-review · proposed · P0

13. PL submits deliverable/current output version with readiness checklist and required task evidence. Reviewer checks grant, independence, current scope/version and unresolved mandatory items.
14. Reviewer returns required changes or approves exact deliverable version with actor/time. A revision creates/links a canonical task and feedback reference, preserving reviewed V1.
15. Contributor/PL completes revision and submits V2; changed output/scope invalidates affected prior approval. Stale V1 approval or missing mandatory evidence blocks normal ready-for-delivery and returns a useful checklist next action.
16. PM confirms remaining client-delivery coordination obligations; readiness is explicitly recorded, not inferred from all task dates passing or a 100% task chart. A permitted waiver is separate authority/rationale/evidence and remains visible.

**Acceptance:** V1 returned → V2 approved preserves both decisions and exactly 1 revision task. Editing V3 invalidates V2-based readiness for V3. A normal readiness gate passes only with 0 mandatory evidence gaps; 100% task completion alone completes 0 projects.

**Owner:** Consulting lead / PL / PM / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** consulting_review,consulting_revision,consulting_stale_ready,resource_revisions,entity_approval,work_project_lifecycle,access_review_self_policy


###### 17–21 · record client delivery, legal gates and explicit closure

ID: flow-consulting-deliver · proposed · P0

17. Authorized client contact actually sends/presents the approved output outside DWDG’ONE and records delivery date/channel/version plus a safe evidence or authorized attestation. Planned client date alone remains planned.
18. Record actual client acceptance/rejection/next action under adopted policy. Rejection/unclear acceptance returns to revision or follow-up with owner; the app does not invent external acknowledgement.
19. Link permitted agreement/signature/BAST evidence to Legal for independent gate review; Finance tracks authorized invoice-term/expense state separately. Consulting delivery is not proof of signed BAST or received money.
20. Lead explicitly closes only when required delivery/review outcomes are evidenced and unresolved blockers/obligations are resolved or authorized handover/waiver is recorded. Archive preserves project/task/resource/decision IDs and authorship.
21. PM/lead checks portfolio summaries across canonical projects, exports a separately reviewed sanitized client report, and hands unresolved actions/knowledge to successor. Return from portfolio opens correct project/tab/context; Changes stays the selected workspace.
Optional P1 receivable branch: Finance creates a native incoming-term record only after that feature is adopted. Baseline creates a canonical scoped Finance follow-up/task with agreement/BAST references; neither route transfers money or issues an invoice.

**Acceptance:** Delivered but client-rejected project remains unresolved. Unsigned gate creates 0 normal invoice readiness. Closing records actor/time/evidence and the same project ID; client report contains 0 restricted internal fields.

**Owner:** Consulting lead / PL / PM / engineering / QA

**Source / assumption:** Verified original survey Form Responses 1, D2:J9, SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d; steps/stages/action rights remain proposed.

**Dependencies:** consulting_client_update,consulting_portfolio,consulting_export,legal_bast_gate,work_undo_archive,changes-scope,work_project_lifecycle


##### Shared work journeys · resources, scheduling, handoffs and trustworthy changes

ID: flows-shared · proposed · P0

These journeys connect division-specific entities without duplicating tasks, notes or approvals. Every mutation checks current membership/action/field scope and record version. The proposed plan remains notes/internal folders/external links first; binary uploads, provider synchronization and external sending need separate adoption.

**Acceptance:** Complete journeys from at least 2 divisions using identical canonical IDs. Test guarded return paths and reconcile states rather than treating feature count as completion evidence.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** workflows,resources,access_surface_scope,data_identity


###### Resource · discover → delegate → canonical task → review

ID: flow-resource-delegation · proposed · P0

Actors: resource contributor/owner, eligible assignee, task reviewer and permitted project lead. Trigger: a note/file/app link needs work or clarification. Finish: one resource and one linked task with evidence/next action, or an honest access issue. Folders/notes and link references are native; external binaries stay with their provider.

**Acceptance:** Fixture contains 1 internal folder, 1 native note and 1 external app link. Delegation creates 0 implicit access grants or copied provider files.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** resource_explorer,resource_inspector,resource_bubbles,resource_launch_limits


###### 1–4 · add or find resources and inspect their responsibility

ID: flow-resource-discover · proposed · P0

1. Contributor opens project → Resources, searches permitted title/type/owner and chooses an existing item or adds internal folder/native note/HTTPS app link. External folder link is a pointer, not a mirror.
2. Adding an item records DWDG creator/time and context; external author remains unknown unless separately recorded. Folder cycle/cross-scope rules reject invalid hierarchy and retain draft.
3. Right-click, keyboard menu, visible action or touch long-press opens the same inspector with title/type/current version, creator, permitted notes and responsible avatar bubbles. Popup respects focus/return to the origin item.
4. External link opens safely or user reports unable-to-open to the owner. Provider denial does not become a DWDG permission grant, a claimed successful preview or automatic public sharing.

**Acceptance:** All 4 inspector input routes expose equivalent permitted actions. Exactly 1 canonical resource persists after retry. Invalid folder cycle changes 0 hierarchy edges; inaccessible provider link has a clear issue route.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** resource_types,resource_folder,resource_external_folder,resource_creator,resource_inspector,resource_link_issue,resource_link_validation,design-accessibility


###### 5–8 · choose eligible responsibility and create one real work task

ID: flow-resource-assign · proposed · P0

5. Owner opens responsibility editor and selects eligible people in the permitted context. Avatar labels indicate accountability/contribution, distinct from provider access and specific task assignment.
6. For a folder, inherited responsibility is visible as folder context only; adding an explicit child contributor does not overwrite siblings/parent. Giving responsibility alone creates 0 access grants.
7. Owner selects Create task or Link task, defines output/date/reviewer and eligible assignee; saved task ID/resource association appears immediately in Work, My tasks and inspector. Linking existing work never clones it.
8. Member whose account is suspended/transferred during the dialog is rechecked at commit. Denied assignment returns eligible options with retained draft; duplicate submit returns the same task ID.

**Acceptance:** With 2 folder contributors and 1 explicit child contributor, child list stays 1 and inherited folder context stays 2. Create-task retry yields 1 task and 1 association; all surfaces resolve the same task ID. Delegation creates 0 memberships.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** resource_responsibility,resource_parent_responsibility,resource_tasks,access_delegation,access_resource_inheritance,entity_attachmentassociation,reliability_retry


###### 9–12 · execute, review and preserve identity through archive/move

ID: flow-resource-review · proposed · P0

9. Assignee performs work, records new note/output-version evidence and submits the canonical task for review. Task status does not mutate provider file contents.
10. Reviewer approves current version or returns feedback through existing task flow. Changes to reviewed output invalidate affected approval; simultaneous notes/editor writes show a useful compare/merge path.
11. Authorized rename/move/archive previews reference and scope consequences. Move/archive retains resource/task IDs and safe event context; new destination access requires explicit authorization.
12. Undo/archive recovery rechecks current grants/version and never overwrites a newer edit. Export contains permitted metadata/native notes/link manifest with clear missing-provider-file scope; native blob deletion is outside default v 1.

**Acceptance:** Rename preserves task association. Archive/restoration uses the same resource ID. Stale Undo overwrites 0 newer edits. Default export contains 0 provider binary contents or secrets.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** resource_revisions,resource_move,resource_delete,work_undo_archive,resource_export_bundle,resource_export_security,changes-move


###### Schedule · known availability → meeting → minutes → follow-up

ID: flow-meeting · proposed · P0

Actors: meeting coordinator, selected participants, minute-taker and decision/follow-up owners. Trigger: collaboration needs a timed meeting. Finish: held/cancelled meeting with useful outcomes and canonical follow-ups. Deadline and publication all-day/timed dates remain different records; no Google Calendar sync is assumed.

**Acceptance:** Validate overlap/cancellation/absence/unknown-availability routes, held meeting outcomes and failed-save recovery in Asia/Jakarta.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** work_schedule,work_meeting_composer,work_meeting_outcomes,org_timezone_calendar


###### 1–4 · schedule using declared and recorded evidence

ID: flow-meeting-compose · proposed · P0

1. Coordinator opens workspace Schedule → New meeting and sets title, start/end/timezone, participants, agenda/links and responsible minute-taker. Required end>start, permitted participant and scope checks precede save.
2. Picker displays effective declared windows, permitted recorded-meeting overlaps and absence status without private absence reason. Undeclared/stale external availability remains Unknown; task count cannot prove availability.
3. For a known conflict, coordinator either changes date/participants or explicitly records permitted override rationale. Cancelled meetings no longer occupy capacity; exact adjacency is not an overlap.
4. Save creates one meeting/attendee set and scoped notification action; failed save retains draft and shows not saved. Export .ics offers user-controlled calendar addition without claiming synchronized external attendance.
Optional absence/declaration branch: unavailable intervals are used only under the adopted availability feature. Baseline validates recorded meeting overlap and keeps unknown external availability labelled; no private absence feature is required.

**Acceptance:** Fixture 10:00–11:00 overlaps 10:30–11:30; 11:00–12:00 is adjacent with 0 overlap. Unknown declaration stays Unknown. Retry creates 1 meeting with exact attendees; unauthorized views expose 0 private absence reasons.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** availability_declared,availability_overlap,availability_override,availability_stale,entity_meeting,entity_attendee,work_forms


###### 5–7 · edit/cancel while preserving participants and drafts

ID: flow-meeting-change · proposed · P0

5. Authorized coordinator changes time/participant/agenda from current version; rechecks conflicts and recipient access. Changed meeting creates a distinct change event and deduplicated affected-participant action.
6. A simultaneous participant/coordinator edit causes comparison instead of overwriting; removed/revoked participant receives no unauthorized queued detail after grant recheck.
7. Cancel records actor/reason, ends current meeting-conflict occupancy and pending reminders, preserving history. Permitted rescheduling/restoration creates an explicit new state and keeps stable identity/lineage.
Optional availability-event branch: adopted declarations/absence alerts receive their own scoped update; baseline tests only meeting/attendee changes and canceled meeting conflicts.

**Acceptance:** Canceled meeting contributes 0 conflicts; queued notice for a revoked participant discloses 0 restricted fields. Stale time update writes 0 state and retains the coordinator's draft.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** access_notification_revoked,work_concurrent_updates,work_reminders,changes-undo


###### 8–11 · record what happened and create owned next actions

ID: flow-meeting-outcomes · proposed · P0

8. Minute-taker records held date/time and actual attendance where known; unknown stays unknown. Planned meeting date alone cannot mark held or members absent.
9. Add one native note/minutes resource and recorded decisions with result, authority and linked context. Decisions pending another authority remain proposed/pending, not automatically approved by being written in minutes.
10. Select a follow-up decision and create/link canonical task with eligible owner/due date/reviewer. One retry creates 0 duplicates; declined task/permission loss returns an explicit next-owner issue.
11. Participants and lead open meeting → linked minutes → task/decision, then return to Schedule. Export permitted .ics/minutes/next actions keeps canonical IDs and omits private notes/attendance reasons; workspace Changes is scoped.
Optional HR attendance branch: the proposed HR attendance feature is unnecessary for meeting outcomes. Baseline may record known meeting-attendee facts and Unknown without producing HR attendance/performance records.

**Acceptance:** One held meeting with 2 decisions and 3 follow-ups yields 1 minutes resource, 2 decisions and 3 canonical tasks. Minutes create 0 unauthorized approvals. Unknown attendance yields 0 fabricated absence records.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** work_meeting_outcomes,work_decisions,resource_notes,entity_decision,entity_task,access_delegation,changes-scope


###### Optional capacity planning · declaration → assignment warning → reviewed plan

ID: flow-availability · proposed · P1

Actors: member, task/meeting coordinator and scoped lead. Trigger: scheduling/assignment needs evidence beyond task counts. Finish: honest declared/meeting/planned-capacity basis with reviewed conflict. Optional estimate/capacity features are P1; default must still show Unknown without an estimate.

**Acceptance:** No screen infers busy/free from task count alone. Actual tracked hours, monitoring/presence signals and utilization claims remain outside this flow.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** work_availability,availability_capacity,design-availability-evidence


###### 1–3 · declare effective working windows and private absence

ID: flow-availability-declare · proposed · P1

1. Member opens own Availability, sets effective date range and declared hours/windows in Asia/Jakarta, or leaves it unset. These are self-reported preferences, not attendance or contractual working hours.
2. Member may record absence window with minimal optional private reason. Coordinator receives permitted unavailable interval only; changed declaration expires/refreshes its labelled evidence basis.
3. When permitted planned task estimate is entered, total effort is calculated over explicit planned interval against declared capacity; missing estimate/window stays unknown and does not become 0 workload.

**Acceptance:** After the effective date expires, availability becomes Unknown unless renewed. Unauthorized coordinators see 0 private reasons. Known estimates 2 h + 3 h show 5 h planned; an additional unknown estimate stays unknown.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** availability_declared,availability_absence,availability_stale,availability_capacity,entity_availability


###### 4–6 · review conflicts and export a truthful basis

ID: flow-availability-assign · proposed · P1

4. Coordinator opens assignee/avatar inspector, sees permitted assigned tasks/meeting overlaps/declaration freshness and planned estimates if enabled, then reviews warning before assignment.
5. Coordinator adjusts plan/assignee or explicitly records allowed override. Candidate membership/action grant/version is rechecked on commit; no automatic judgment of performance or roster penalty occurs.
6. Lead exports only permitted declared availability/planned-capacity basis and unresolved conflict owners. Missing external calendar/effort is labelled, not interpreted as spare capacity or billable utilization.
This P1 journey uses self-reported windows, recorded meetings and optional planned estimates; it requires no timesheet or actual-hour tracking. A future adopted timesheet may supply separately labelled permitted effort evidence, but remains outside the default journey and its acceptance.

**Acceptance:** Assignment outside a declared window shows a warning and a permitted override route. Revoked assignee is rejected at commit. Export labels self-reported/planned basis and includes 0 private absence reasons.

**Owner:** Product / engineering / QA

**Source / assumption:** Retrieved Critique App Development discussion and prior product/access draft; concrete journey details proposed.

**Dependencies:** availability_person_inspector,availability_override,availability_export,access_delegation


###### Cross-division handoff · shared project → accepted obligation → safe status

ID: flow-crossdivision · proposed · P0

Actors: originating owner, authorized project-grant approver, receiving division lead/specialist and scoped VP/President. Trigger: External, Strategy or delivery project needs another division's action. Finish: an accepted canonical linked obligation or a specific returned/denied next action. Project collaboration is separate from unrestricted workspace membership.

**Acceptance:** Fixture External → Consulting → Legal → Finance follows 1 canonical project chain, with 0 duplicate requests or unauthorized adjacent records. Failed recipient grant reveals 0 private context.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_project_collab,external_handoff,legal_bast_gate,work_link_integrity,changes-scope


###### 1–4 · describe an obligation and grant minimum context deliberately

ID: flow-crossdivision-prepare · proposed · P0

1. Originating owner opens project/task/resource and selects Request handoff; specifies receiving owner/action, required evidence, needed-by and canonical source IDs.
2. Preview shows the recipient's actual permitted context and field set. Originator lacking share/admin authority cannot grant access; approval route goes to an authorized operator with minimum scope and expiry if adopted.
3. Authorized operator adds/reviews explicit project collaboration scope, preserving home workspace membership. No task assignee, avatar bubble, mention or external-resource link creates membership/provider access.
4. Receiver follows the scoped handoff link; permitted users see only source context/action, ungranted users get an access-request/denied path without hidden titles/body/contacts. Originator sees pending grant/owner status, not a false accepted handoff.

**Acceptance:** Receiver granted only project P can open P and 0 other source-workspace projects. Ungranted receiver sees 0 restricted names/fields. Handoff references retain the same project/task/resource IDs.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_project_collab,access_surface_scope,access_resource_inheritance,access_denied,entity_projectunit,access_notification_revoked


###### 5–7 · accept or return the real receiving action

ID: flow-crossdivision-accept · proposed · P0

5. Receiving lead checks current request/version/authority, accepts responsibility and links one existing/new specialist request/task; acknowledgment records actor/time and next accountable owner.
6. Missing facts or unavailable authority returns specific required info/alternative owner with reason; originator updates the same request and resubmits. It does not create a separate PM workspace or duplicate task per division.
7. Changes in source scope/evidence require affected receiving review again; revoke/transfer before commit denies acceptance. Duplicate submit/acknowledgment returns prior canonical result.

**Acceptance:** Retry produces exactly 1 specialist request/action. Missing-information return retains the same handoff ID. Stale/revoked acceptance changes 0 responsibility records and creates 0 duplicates.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_task_fields,work_decisions,work_concurrent_updates,reliability_retry,access_revocation,resource_revisions


###### 8–10 · close the gate and retain isolated workspace history

ID: flow-crossdivision-return · proposed · P0

8. Receiving specialist completes permitted review/action with exact source version/evidence and returns a minimal next-state summary; originating member cannot read private reviewer/bank/signatory fields merely through the shared link.
9. Each selected workspace Changes view includes only authorized safe local/shared events under adopted scope; it never aggregates other divisions because President/Admin can access them. A record move has separate safe source/destination envelopes.
10. Originator/receiver inspect outcome, unblock canonical task/gate and export only their permitted handoff fields. Cancelled/revoked handoff preserves attribution and unresolved next owner; historical action never grants today's revoked access.

**Acceptance:** Selected External Changes contains 0 Consulting-only, Legal-private or Finance-private payloads. Scope changes only after explicit workspace selection. Originator export contains 0 restricted downstream fields; gate summary points to actual decision/evidence.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** access_sensitive_data,changes-scope,changes-sensitive,changes-move,work_dependencies,security_exports


###### Timeline · proposed date change → dependency preview → authorized cascade

ID: flow-timeline-change · proposed · P1

Actors: project coordinator, task/milestone owners and protected-target approver. Trigger: a planned task/date changes. Finish: deliberate permitted date set or unchanged plan with useful feedback. Proposed finish-to-start scheduling is P1; use the date form/list fallback when interactive cascade is not adopted.

**Acceptance:** Change 1 prerequisite with 2 downstream tasks and 1 protected milestone; inspect exact affected IDs/dates before saving. Undated work and actual history retain their semantics.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** timeline_dependency_semantics,timeline_cascade,design-timeline-interactions


###### 1–3 · edit planned dates and see exact affected work

ID: flow-timeline-preview · proposed · P1

1. Coordinator opens Work → Timeline at selected 7D/2W/1M/3M/6M/1Y range and chooses a task date form or accessible drag alternative. Only planned dates are editable here; actual completion/achievement remain recorded events.
2. Edit validates date ordering, timezone/due-only versus interval fields and current task version. Unscheduled work remains visible separately without inventing start/duration.
3. Dependency preview shows candidate downstream task/milestone IDs, old/new planned dates and missing/restricted prerequisite warnings. Cycles, deleted prerequisite or protected targets stop silent cascade; missing access never reveals hidden task details.

**Acceptance:** Prerequisite plus 2 downstream tasks previews 3 affected IDs before commit; due-only record remains due-only. Cycle creates 0 dependency edges. Preview changes 0 actual completion timestamps.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** timeline_ranges,timeline_unscheduled,timeline_date_validation,timeline_missing_prerequisite,timeline_accessible,work_dependencies


###### 4–6 · approve only the permitted change and recover conflicts

ID: flow-timeline-confirm · proposed · P1

4. Coordinator selects local-date-only or proposed cascade; action guard checks every touched record. A protected client/legal/publication milestone routes to separate change decision rather than shifting on drag.
5. Authorized confirmation saves adopted affected date set atomically with grouped safe events/owner next actions; cancellation saves 0 changes. Concurrent version mismatch returns preview again with retained intended date changes.
6. Back/Undo compares current versions/grants and records a new reversal only if permitted; newer work remains preserved. Project Overview/Work/timeline and owner reminders show same new dates and IDs.

**Acceptance:** Cancel writes 0 dates. Without separate approval, protected target changes 0 dates. Successful fixture cascade saves exactly 3 permitted changes. Stale Undo overwrites 0 newer edits.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** timeline_cascade,timeline_protected_dates,changes-import,work_concurrent_updates,work_undo_archive,work_reminders


###### Changes · inspect selected workspace mutations → context → permitted recovery

ID: flow-changes · proposed · P0

Actors: member, division lead, scoped VP, President or Admin using the currently selected workspace. Trigger: someone needs to understand an addition/edit/deletion/delegation or restore an accidental mutation. Finish: clear authorized before/after context and an allowed return/recovery route. This future server-backed workflow differs from local PRD-editor history.

**Acceptance:** Test 3 workspaces with distinct events under Admin/President/VP/member. Every view/filter/search/count/export is intersected with the selected workspace and current record/field access.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** changes,changes-scope,changes-sensitive,changes-current-editor


###### 1–4 · find and inspect a permitted event in one workspace

ID: flow-changes-find · proposed · P0

1. User selects workspaceA and opens Changes from workspace navigation, not a fourth project tab. The page states current workspace and available retained date window.
2. User filters date/actor/action/record/project; rows/counts/search results include only permittedA events and safe fields. A multiworkspace leader still seesA only until explicitly switching context.
3. User opens an addition/edit/deletion event to inspect actor/date/action/safe before-after/version and canonical context link. Deleted or restricted records provide safe tombstone/denied route, never raw private payload.
4. Returning from context preserves Changes filter/scroll/focus. A resource/task move exposes only safeA envelope here; destination workspace must be selected separately by an eligible user.
Optional P1 filter branch: advanced actor/action/date/project filters are exercised only if adopted. Baseline uses a chronological page for the selected workspace with safe details and clear retained-history window.

**Acceptance:** Workspace A has 2 events, B has 3 and C has 1: selected A query/export includes 2 eligible events and 0 B/C events. Restricted fields remain absent. Return preserves filter, position and focus.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** changes-location,changes-diff,changes-deletion,changes-details,changes-move,access_denied


###### 5–7 · Undo/archive recovery is a new authorized mutation

ID: flow-changes-recover · proposed · P0

5. User selects an offered Undo/Restore action for a recoverable event and previews exact record identity/relationships, current version and access consequences. Ordinary history entries cannot be edited/deleted.
6. Server rechecks current membership/action/field scope, retention window and concurrent changes. Eligible restoration records a new event with original/reversal linkage; conflict or removed access returns a denied/compare route with 0 writes.
7. Refresh/reload shows original event plus successful recovery event. Hard-purged/unrecoverable records give a clear limitation and privileged recovery contact; an ordinary user cannot trigger database restore or erase the audit.

**Acceptance:** Archive/restore retains the same object ID and 2 separate mutation events. Undo after a newer edit changes 0 records; original history remains. Ordinary member can edit/delete 0 audit rows.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** changes-undo,changes-integrity,work_undo_archive,data_softdelete,data_restore,security_audit


###### 8–9 · export current scope and distinguish other histories

ID: flow-changes-export · proposed · P1

8. Authorized user exports current filtered workspace history with basis/time/safe record fields; permissions are rechecked at export generation/download. The selected workspace is explicit in the manifest and rows reconcile to the permitted query.
9. Release notes, privileged security/admin audit and local PRD-editor Changes open through their separate appropriate contexts. Local planning history has unverified/local actor identity; it does not prove organization authentication or production mutation logging.

**Acceptance:** Selected A export contains 0 B/C events or restricted before/after fields. Planning-editor event never claims authenticated production identity. Privileged audit requires its separate action grant.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** changes-current-editor,access_audit,security_exports,entity_exportjob


###### Data export · choose scope → validate archive → usable handoff

ID: flow-export · proposed · P0

Actors: permitted record/report user, sensitive-export approver if required, and organization archive custodian. Trigger: reporting, semester handover or vendor-exit preparation. Finish: a clearly scoped portable artifact with exact reconciliation and external-file limitations. An export is not a backup restore, automatic provider download, or permission grant.

**Acceptance:** Test filtered operational CSV, authorized complete JSON and notes/link manifest using fixed fixture IDs. Budget/ownership/storage policy is adopted separately; no shared Drive is assumed.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** data_csv,data_json,data_manifest,data_exportownership,resource_export_bundle,security_exports


###### 1–3 · choose a purpose and authorized record/field scope

ID: flow-export-select · proposed · P0

1. User opens the relevant report/export screen in selected workspace/project and chooses CSV summary, portable JSON or notes/link manifest as permitted. UI states purpose, scope, as-of basis, included fields and external binary exclusion.
2. Preview counts/fields are derived from current authorized canonical records, not a browser's hidden cached collection. Sensitive HR/contact/finance/legal fields require explicit export grant; ordinary summary export removes them.
3. User confirms the concrete preview; server rechecks active grants and records export job/request scope. Cancel creates no archive; mid-job revocation prevents unauthorized generation/download and provides a clear return route.

**Acceptance:** Fixture scope has 4 permitted tasks and 2 restricted tasks: preview/output contain exactly 4 permitted IDs and 0 restricted rows/fields. Revoked export requester receives 0 downloadable restricted output.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** security_exports,access_sensitive_export,access_surface_scope,entity_exportjob


###### 4–6 · produce exact readable and portable output

ID: flow-export-validate · proposed · P0

4. Export includes stable IDs, versions, relationship references, timezone/currency/formula basis and manifest/schema version appropriate to its format. CSV formula-leading user content is escaped safely without silently changing source records.
5. Archive contains permitted native notes/metadata/link references and missing-provider-file scope. External file bytes, secrets, private review data and unsupported upload objects are absent unless a separately adopted feature explicitly includes them.
6. User opens the result and reconciles source IDs/counts/totals against preview. If output cannot be delivered due to browser/network/storage limits, show actual failure/available safe retry rather than claiming saved; same export operation stays identifiable.

**Acceptance:** Fixture 4 task IDs and exact IDR totals reconcile between query/CSV/JSON. Formula-leading fixture text does not execute as spreadsheet formula. Default manifest includes 0 external binaries/secret values; broken links are labelled rather than fabricated.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** data_csv,data_json,data_manifest,resource_export_security,entity_exportjob,work_forms


###### 7–9 · retain the archive under actual organizational custody

ID: flow-export-handoff · proposed · P0

7. Custodian stores the artifact in an approved, cost-budgeted organization-controlled location with actual account/folder ownership and access policy. Until chosen/configured, this remains an open custody action; the plan cannot claim an existing shared Drive.
8. Recipient receives only a separately authorized access path through organizational procedure outside the app and checks schema/version/manifest. Export permission does not grant provider access or guarantee offline copies of linked files.
9. Archive expiry/retention and operator recovery use adopted policy; later import/restore is separately privileged, validated and rehearsed in a sandbox. Handover acknowledges missing external files and unresolved links without deleting live data.

**Acceptance:** An operator can identify the real archive custodian/location/access policy and open a fixture archive. Recipient with no grant sees 0 private archive contents. Export operation performs 0 production restores/provider-permission changes.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** scope_org_storage_setup,reliability_succession,security_exports,data_restore,reliability_restore,integration-drive-ownership


###### Shared editing · honest save failure → comparison → safe retry

ID: flow-save-conflict · proposed · P0

Actors: any permitted record editor and a concurrent editor. Trigger: validation error, network timeout, stale revision or role revocation while editing. Finish: one intended permitted mutation or a retained/exportable unsaved draft with clear next action. Successful build or animation is not evidence of saved data.

**Acceptance:** Exercise the same contract on task, native note, legal review and finance approval. Domain-specific gates stay enforced; drafts contain only permitted user-entered content.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_forms,work_concurrent_updates,reliability_offline,reliability_retry


###### 1–3 · validate without losing the user's draft

ID: flow-save-validation · proposed · P0

1. User opens a permitted current-version record and edits fields. Validation identifies exact field/reason, focuses the relevant control and retains input, scroll and context.
2. Save checks current server action/field/record scope and version; pending feedback differs from saved. A network failure retains a labelled local draft under adopted cache/privacy policy, never a success toast.
3. User retries with the same operation identity, returns to record or exports permitted draft if supported. If the first response was lost after commit, query/idempotent retry retrieves the original saved result rather than duplicating a task/request/payment.

**Acceptance:** Timeout-after-commit fixture followed by retry yields exactly 1 mutation and 1 intended event group. Validation rejection writes 0 records and retains user input. Logout on a shared device follows draft/cache policy without private leakage.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_forms,reliability_retry,reliability_offline,security_device,changes-atomically


###### 4–7 · resolve concurrent changes without overwriting another person

ID: flow-save-compare · proposed · P0

4. Another editor updates version V1→V2 before this user submits V1. Server denies stale overwrite and returns only permitted current-versus-draft differences.
5. User refreshes/discards draft or reapplies chosen changes to V2 after review. Domain approvals/payments/numbering are not automatically merged as text; exact action/version checks run again.
6. Permission revoked during conflict resolution yields denied/read-only context and no server write; queued notices/export/recovery also recheck grants. User gets a permitted next-owner/support route.
7. A successful reviewed save becomes V3 with actual actor/time/event; both earlier changes remain in workspace Changes under current access. Undo rechecks latest version and cannot overwrite a subsequent V4.

**Acceptance:** V1 stale save changes 0 authoritative fields. Deliberate permitted reapply yields V3 and preserves V2 history. Revoked editor and stale Undo each write 0 records; conflict payload leaks 0 restricted fields.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_concurrent_updates,access_revocation,access_notification_revoked,changes-diff,work_undo_archive,security_audit


###### Updates · real trigger → scoped action → resolved obligation

ID: flow-notification · proposed · P0

Actors: event producer, eligible recipient and action owner. Trigger: a due reminder, review return, blocker, new assignment or handoff state. Finish: recipient reaches a permitted canonical next action or a safe no-longer-available route. Default in-app inbox and optional external channels are distinct; no email/bot delivery claim without configured proof.

**Acceptance:** Test event retry, resolved task, revoked recipient, missed scheduled run and restricted title. Inbox state is not a task's completion state.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** work_updates,work_reminders,access_notification_revoked,quality-notification-proof


###### 1–4 · notify the eligible recipient and open the real record

ID: flow-notification-action · proposed · P0

1. Saved event/reminder rule identifies recipient, canonical record, next action and adopted timing/channel; transaction/job identity prevents duplicate event retries. A scheduler miss is recorded/detected under operations policy, not silently described as on-time.
2. Before producing or delivering detail, recheck current record/field permission and eligibility. Revoked recipient receives no protected title/body; an already resolved/cancelled obligation suppresses obsolete active reminder under policy.
3. Recipient opens Updates item and follows canonical record/context. Missing/deleted/restricted target gives safe explanation/request-access path; read/unread merely tracks the inbox item.
4. Recipient performs the real permitted action or returns to Updates with preserved position. Resolving a task/review/handoff updates its own state and relevant inbox actions; marking read does not complete work. Optional email/WhatsApp sending remains separately configured and authorized.
Optional external-channel branch: configured/adopted email or WhatsApp automation is a separate future case, not a dependency of this P0 in-app journey. Baseline test uses only the in-app item and user-operated external links if relevant.

**Acceptance:** Retry 1 event produces exactly 1 intended recipient item. Revocation before delivery discloses 0 protected fields; marking item read completes 0 tasks. Canceled fixture creates 0 new active due reminders.

**Owner:** Product / engineering / QA

**Source / assumption:** Latest user asks explicit end-to-end division and account user flows. Current .planning/dwdg-one-prd/README.md and DWDG_ONE_PRD.md; this journey is proposed planning, not an implemented or approved SOP.

**Dependencies:** entity_notification,work_updates,work_reminders,reliability_scheduler,access_notification_revoked


#### Onboarding, adoption, and member lifecycle

ID: onboarding · proposed · P0

The first release must be understandable to students who have never used an ERP. Onboarding introduces the next useful action, confirms membership, and preserves operational knowledge across batches. Avoid forcing all members to fill long profiles or import every historical record before using the app.

**Acceptance:** 1. A newly invited member can sign in, understand their context, open assigned work, and get help with no personal tutorial from the developer.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


##### First administrator setup and emergency recovery

ID: onboarding-first-admin · proposed · P0

Mahdy is the planned admin. Provisioning requires a verified concrete login identity, organization configuration, and an independent backup custodian. Bootstrap occurs once through a controlled server/setup procedure, not a public 'become admin' button or client-only name comparison. Recovery preserves audit history and revokes compromised sessions; no browser storage edit can escalate a real account.

**Acceptance:** 1. Attempt duplicate bootstrap, wrong identity, forgotten access, and compromised recovery path; only verified operators can restore control.

**Owner:** Mahdy + backup custodian

**Source / assumption:** Referenced chat Mahdy admin confirmed; provisioning mechanism proposed

**Dependencies:** access_admin_scope
security_bootstrap
reliability_succession


##### Invitation review and acceptance

ID: onboarding-invitations · proposed · P0

Invite through a validated roster: name/email, intended workspace, role, batch, and approver. Invitation has expiry and revocation. Acceptance binds the authenticated verified identity to the membership, not a display name. A typo can be corrected before acceptance. Duplicate invitations show the current state instead of creating duplicate people. Invitation delivery is separate from successful membership creation.

**Acceptance:** 1. Test5 cases(expired/revoked/duplicate/wrong-email/already-member):0 unauthorized or duplicate memberships.
2. A successful acceptance binds exactly1 verified identity to the approved membership; delivery failure does not create fake acceptance.

**Owner:** Admin + HR

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** access_invitation
security_auth


##### First useful view for each role

ID: onboarding-first-view · proposed · P0

Member opens their allowed workspace and My Work context. Lead sees work needing review and blockers. VP sees allowed reporting portfolio. President/admin may choose all allowed DWDG contexts with clear scope. No role sees a generic fictional dashboard as onboarding. Empty state offers the next permitted action and concise explanation of Workspace, Project, Work, and Resources.

**Acceptance:** 1. Member/lead/VP/President/admin fixtures land in allowed contexts only;0 internal content appears outside permitted scope.
2. Empty fixtures offer at least1 appropriate permitted next action or clear help path.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** access_surface_scope
design-shell


##### A short guide, searchable help, and examples

ID: onboarding-quick-guide · proposed · P1

Provide concise EN/ID guidance: sign in, workspace scope, create/open a project, update work, use Resources, ask for help, notifications, and logout on shared devices. Examples remain sandbox-only or visibly illustrative; no demo seed mixes with real records. Explain external provider access: app assignment does not grant access to Drive/Canva.

**Acceptance:** 1. A pilot member uses the guide to complete a task and resolve a denied external-link permission without a developer explanation.

**Owner:** Product + MarCom & IT

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** design-navigation
work_task_lifecycle
resource_provider_access


##### Import only selected active work

ID: onboarding-migration · proposed · P0

Start with validated people/memberships and chosen active projects/resources. Do not import whole WhatsApp histories or every old spreadsheet to imitate completeness. Each import maps owners, workspace, dates/statuses and source provenance; unknown values are visible. Link old archives where appropriate. Import preview and rejected-row report are required before commit.

**Acceptance:** 1. Source and target IDs/counts reconcile; duplicates are reviewed; no missing completion date is manufactured.

**Owner:** Data owner + division leads

**Source / assumption:** Current data preservation contract

**Dependencies:** data_legacy
data_manifest


##### Minimal personal profile and avatar

ID: onboarding-profile · proposed · P0

Collect display name and verified account identity, role/workspace membership, optional avatar and availability fields only if needed. A missing photo has initials and accessible name. Don't require date of birth, home address, student number, social handles, or biography for basic work. Members edit their own non-authoritative profile; organizational roles are managed separately.

**Acceptance:** 1. A member can complete1 assigned task with0 uploaded photos and0 mandatory unneeded home/DOB/student-ID data.
2. Editing1 ordinary profile field grants0 extra role/approval permissions.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** data_people
security_privacy


##### Membership changes and cross-division assignments

ID: onboarding-switcher · proposed · P0

Ordinary member scope is own division. If cross-division collaboration is needed, grant explicit project/resource collaboration with expiry/review and appropriate action rights; do not automatically expose the whole foreign workspace. Exact exception policy remains open. Workspace reassignment keeps historical attribution and audit; old cached scope is invalidated.

**Acceptance:** 1. Move1 member fromA toB and add/revoke1 project-only exception; current permitted IDs reconcile exactly.
2. After revocation,0 direct API/search/history/export payloads from former scope remain available to new actions.

**Owner:** President + admin

**Source / assumption:** Scope rule confirmed; collaboration exceptions proposed

**Dependencies:** access_project_collab
access_revocation


##### Departure, suspended membership, and reassignment

ID: onboarding-leavers · proposed · P0

Offboarding revokes sessions/memberships and removes actionable assignments or reassigns them through a preview. It preserves historical authorship, decisions, and completed work. Suspended users cannot continue via direct links, cached API tokens, or pending export jobs. Transfer owned external files/account custody before removing access. HR privacy deletion is a distinct process from deleting every trace of a former member.

**Acceptance:** 1. Suspend1 active fixture identity; subsequent protected reads/writes/export execution return0 allowed data.
2. Reassign its outstanding work through1 reviewed mapping, preserving100% of historical stable author IDs.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** security_offboarding
access_revocation
data_people


##### Support responsibility and downtime communication

ID: onboarding-help · proposed · P0

Assign named product/support and technical operators with contact route and volunteer response expectations. Show service status/update notices without revealing internal incident details. If a free project pauses or quota blocks service, members receive a plain explanation and known fallback; app cannot show success while unavailable. Published notices require explicit authorized operator action.

**Acceptance:** 1. A rehearsed outage has a documented triage, recovery, member-facing notice draft, and return-to-service verification.

**Owner:** Operations + President

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** reliability_support
reliability_outage


#### Shared daily pages and complete work journeys

ID: workflows · proposed · P0

Home, My tasks, Projects, Schedule, Resources, Updates, workspace Changes, Organization, Settings and enabled division tools read canonical linked records. Each page defines scope, action, save behavior and empty/error states. Changes is strictly the selected permitted workspace; planning-editor history and production history remain distinct.

**Acceptance:** 1. Each shared P0 journey works with empty and real scoped records, including reload and failed-save recovery.

**Owner:** Product / engineering

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.


##### Home prioritizes attention, owned work, and today's agenda

ID: work_home · proposed · P0

Show overdue/blocked/review-needed items, assigned tasks, and actual timed meetings. Leadership may view permitted portfolio attention separately; member Home remains their division. Avoid decorative KPI/quote grids. Completed work updates list and exact progress after persistence.

**Acceptance:** 1. A member can identify and open their next responsibility from the initial viewport; empty attention has a useful next action.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope


##### Workspace switch preserves context and scopes every page

ID: work_switch_context · proposed · P0

Admin/President/VP select only permitted workspaces; ordinary member sees workspace identity. Remember allowed last context and page preference. Preserve drafts per context, selection, filters, and scroll on harmless returns; revoked context must not remain an editable stale page.

**Acceptance:** 1. Switch away/back restores allowed draft and view; changing context changes projects, search, schedule, and counts together.

**Owner:** Product / engineering

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_vp_scope,access_revocation


##### My tasks groups overdue, today, upcoming, undated, and completed

ID: work_my_tasks · proposed · P0

Query assigned tasks in permitted scope. Provide text/project/status/date filters and list/board/timeline alternatives. Include undated tasks visibly. Bulk actions state selected count and permitted changes; unsupported mixed permissions report which items are skipped before save.

**Acceptance:** 1. A task with no deadline remains findable; filters and record IDs stay consistent across view switches.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S01/S02/S04.

**Dependencies:** work_task_fields


##### Projects uses compact grouped rows with Grid and Timeline alternatives

ID: work_projects_register · proposed · P0

Default register groups by relevant workspace or explicit status, shows owner, deadline, completed/all tasks, next milestone and blocker context. Keep filtered result set identical across views. Creating a project belongs in permitted selected workspace and saves one canonical record.

**Acceptance:** 1. At 1440×900 the approved compact density can be measured and a created project appears in all its linked views.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_surface_scope
org_timezone_calendar


##### Project has three primary tabs: Overview, Work, Resources

ID: work_project_tabs · confirmed · P0

Direct user request favors minimal tabs combining related features. Overview summarizes goal/scope, owners, milestones, blockers, decisions and meaningful activity. Work contains tasks/list/board/timeline. Resources combines notes, folders, files, apps, and links. People, decisions, and activity can open contextual sections/inspectors.

**Acceptance:** 1. Each project has exactly3 primary tabs Overview/Work/Resources.
2. 1 linked task/resource appears through the same stable IDs in all relevant views, with0 duplication.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** org_vocabulary


##### Overview states project goal, boundary, accountable people, and next step

ID: work_overview · proposed · P0

Project fields: name, purpose, in-scope/out-of-scope, owning workspace, lead, PM where relevant, collaborators, start/target dates, status, next milestone. Supporting summary links to saved blockers, decisions, review/evidence, and resources instead of duplicating editable status fields.

**Acceptance:** 1. A PM can open goal/scope, next milestone, unresolved blocker, and latest approval from Overview without searching separate tabs.

**Owner:** Project lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_project_tabs


##### Task stores responsibility, status, date semantics, and related work

ID: work_task_fields · proposed · P0

Required title and owning context; accountable assignee or explicit unassigned queue. Optional description, priority, date-only due date or real timed due datetime, linked project/milestone/resource, contributor list, evidence, created/updated/completed actor/time. Unknown historical times remain null.

**Acceptance:** 1. Create4 tasks(undated,date-only,timed,unassigned queue); all4 stable IDs persist with correct field/null semantics.
2. There are0 fabricated completion timestamps,implicit meeting hours or duplicate assignee links.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S01/S02/S04/S14.

**Dependencies:** org_timezone_calendar
access_action_matrix


##### Task moves through explicit work states with recorded transitions

ID: work_task_lifecycle · proposed · P0

Proposed not started → in progress → in review → completed; blocked is a related blocker flag, with cancelled/archived terminal alternatives. Review can return to in progress with reason. Completion records real timestamp and actor; reopen clears current completion fields while retaining audit event.

**Acceptance:** 1. Move1 task through each adopted transition and back through permitted review/reopen; each change has1 authoritative event.
2. Reject1 invalid transition and1 unauthorized transition with0 record changes.
3. Completing/reopening1 task changes actual current state/history truth without fabricating previous dates.

**Owner:** Division / project leads

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G2:G8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_fields
access_member_edit


##### Project status is an explicit planning/delivery decision

ID: work_project_lifecycle · proposed · P0

Proposed draft → planned → active → in review → completed → archived; on hold/cancelled require reason. Task completion percentage is separate from project status. Closing requires designated lead and unresolved P0 blockers/review items either resolved or explicitly waived with approval.

**Acceptance:** 1. An empty project never becomes completed automatically; unresolved required review prevents silent close.

**Owner:** Project lead / PM

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_overview,access_project_roles


##### List, board, and timeline manipulate the same tasks

ID: work_work_views · proposed · P0

Saved view preferences are personal; changing view cannot clone tasks or move ownership. Board dragging validates permission/status and has keyboard action alternative. Timeline edits display date changes and dependency impact before commit; date-only tasks stay date-only.

**Acceptance:** 1. With30 task fixtures, list/board/timeline contain the same30 unique IDs under the same filter.
2. Edit1 task in each view; exactly1 record changes per operation and the other2 views reconcile.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_task_lifecycle


##### Milestone links acceptance evidence and task dependencies

ID: work_milestones · proposed · P0

A milestone has title, owner, target date, proposed/active/review/achieved/cancelled state, linked required tasks, reviewer, evidence and recorded achievement date. Completion is based on recorded decision/checklist, not inferred from calendar passing. Overdue remains a date condition.

**Acceptance:** 1. Passing target date marks overdue without achievement; achieving records evidence/actor/time and updates Overview.

**Owner:** Project lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_overview
access_project_roles


##### Dependencies show who is waiting on which saved work

ID: work_dependencies · proposed · P0

Directed dependency identifies predecessor/successor task or milestone, responsible unit, needed-by date, reason, and state. Reject self-link and cycles. Cross-project relationships require access-safe wording; hidden predecessor detail uses neutral restricted context. A blocker and dependency remain different objects.

**Acceptance:** 1. A cycle is rejected; an approved date change lists affected downstream tasks rather than inventing new dates.

**Owner:** PM / division leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S06/S14.

**Dependencies:** work_milestones,access_project_collab


##### Blocker has owner, severity, next action, and resolution

ID: work_blockers · proposed · P0

Fields: affected task/milestone/project, description, opened time/actor, responsible owner, low/medium/high severity, needed action, optional due date, open/escalated/resolved/withdrawn state, resolution note and actor/time. Do not replace this with fictional risk or organization-health score.

**Acceptance:** 1. A blocker remains visible beside affected work until resolved/withdrawn and resolving records the outcome.

**Owner:** PM / division leads

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S06; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_dependencies


##### Decision captures proposal, authority, result, and linked scope

ID: work_decisions · proposed · P0

Proposed decision draft → awaiting decision → approved/rejected/superseded. Store decision question, alternatives/rationale, accountable approver, date, resulting change, linked project/resource/meeting, and superseded-by reference. A comment saying approved cannot substitute for the actual approval record.

**Acceptance:** 1. An approved scope change links its approver and the resulting project version; prior decision remains readable.

**Owner:** Project / division lead

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** access_action_matrix


##### Schedule distinguishes timed meetings and all-day deadlines

ID: work_schedule · proposed · P0

Combined agenda/calendar reads tasks, milestones, follow-ups, publishing dates and meetings. Date-only items belong in all-day rows. Actual meetings include timezone, start, end/duration, participants and location/link. Filters are scoped by workspace/project/person and remain consistent with source records.

**Acceptance:** 1. No task deadline is fabricated as an hourly appointment; opening an agenda item navigates to its canonical record.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S09/S13.

**Dependencies:** work_task_fields
org_timezone_calendar


##### Meeting composer supports participants and recorded conflicts

ID: work_meeting_composer · proposed · P0

Proposed compact composer expands in place with title, start/end, timezone, participants, agenda, project/workspace and meeting URL/location. Availability checks only known DWDG meetings for permitted participants. Clearly label unknown external availability; do not claim Google Calendar conflict detection.

**Acceptance:** 1. Changing date/time shows actual known conflicts inline; missing external calendars are labeled unknown.

**Owner:** Product / PM

**Source / assumption:** .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_schedule


##### Meeting minutes create linked decisions and follow-up tasks

ID: work_meeting_outcomes · proposed · P0

Meeting lifecycle planned → held/cancelled, with actual held time where known. Agenda and minutes remain resources linked to meeting. Create follow-up from selected note with owner/date and backlink; create a decision record with approver. Preserve source note rather than duplicating the whole meeting as task text.

**Acceptance:** 1. One meeting creates2 linked follow-up tasks and1 decision from its minutes using canonical IDs.
2. The meeting/project/resource views reconcile those3 outputs exactly after reload/export.

**Owner:** Meeting owner

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S10; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_decisions,work_schedule


##### Updates is an actionable, scoped inbox

ID: work_updates · proposed · P0

Persist per-user read/unread state for assignment, review request, due reminder, relevant decision, and important project changes. Each item points to its source event/record. Avoid generating a notification for every cosmetic edit or duplicating reminders on every reload. Group repeated changes to one source where appropriate.

**Acceptance:** 1. Read state survives reload and a source update opens the permitted record rather than an inert message.

**Owner:** Product

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S08; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** access_surface_scope
access_revocation


##### Reminder rules identify recipient, timing, channel, and deduplication

ID: work_reminders · proposed · P0

Proposed launch within the Rp35,000/month target and Rp50,000/month hard ceiling uses in-app owned-task/follow-up/review reminders and catch-up on return. Persist occurrence/source keys and read/deduplication state. Do not promise delivery while app is closed. Email digest, push or bot channels require separately chosen provider/cost setup and remain later options.

**Acceptance:** 1. One due fixture has1 intended recipient rule and no delivery to unauthorized members.
2. Retry3 times produces0 duplicate logical notifications; quiet-hours/opt-out cases retain correct in-app due work.
3. App copy promises0 unconfigured closed-app or WhatsApp delivery.

**Owner:** Product / operations

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J6.

**Dependencies:** work_updates
org_timezone_calendar


##### Global search finds permitted work and resource metadata

ID: work_search · proposed · P0

Search titles, descriptions/notes where authorized, project names, owner/member names, resource metadata, decisions and domain records. Results show type, context and last update; selecting opens correct inspector/page. Do not index password values, private recruitment review, or inaccessible attachments.

**Acceptance:** 1. A permitted resource/task is findable from the shared search; restricted metadata and secrets are absent.

**Owner:** Product / engineering

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G9/J9; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_surface_scope,resource_secret_links


##### Organization overview shows ownership and cross-division matrix

ID: work_organization · proposed · P0

President/Admin see current active units, scoped projects, accountable lead, next milestone and blockers. VP sees assigned portfolio. Member organization page, if exposed, contains only authorized scope. The master matrix requested by Consulting is a derived view, not another spreadsheet to maintain.

**Acceptance:** 1. A project edit updates both division view and master matrix without a second input form.

**Owner:** Leadership / Consulting

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J2; .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** work_overview,access_vp_scope


##### Settings groups personal preferences and permitted administration

ID: work_settings · proposed · P0

Personal language/theme/motion/transparency/reminder preferences are distinct from organization configuration. Admin operations show consequences, current environment and authority. Resource/account connections use metadata and approved destinations. Do not bury sign-out/account or data export behind ambiguous workspace labels.

**Acceptance:** 1. A member can change language/theme without organization-write rights; Admin-only settings remain guarded.

**Owner:** Product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md, confirmed decisions and organization/access draft.

**Dependencies:** access_action_matrix


##### All forms validate, retain drafts, and tell the truth about saving

ID: work_forms · proposed · P0

Required/invalid fields are explained inline and accessible. Disable duplicate submission during save; successful feedback appears only after confirmed persistence. Connection/conflict/quota errors retain user inputs and offer retry/review. Context switches retain safe drafts or explicitly ask to discard changes.

**Acceptance:** 1. Submit3 invalid fields:0 invalid committed records,3 associated errors and100% retained draft values.
2. Test1 timeout retry,1 conflict and1 denied operation with0 silent overwrite or false success.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_fields
access_surface_scope


##### Undo restores exact record identity and relationships

ID: work_undo_archive · proposed · P0

After confirmed save, archive/remove/complete offers recoverable Undo window where policy permits. Restore same ID/prior completion fields/links/location only after rechecking current permission and expected record version. If someone edited or approved afterward, Undo must show conflict and avoid overwriting their work; sensitive approval reversal uses explicit authorized operation. Longer recovery uses authorized archive/trash and linked-record preview.

**Acceptance:** 1. For1 acknowledged change, permitted Undo retains the original event and appends1 reversal event.
2. If another user made1 incompatible later change, Undo changes0 fields until conflict/permission review succeeds.

**Owner:** Engineering / product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_task_lifecycle


##### Cross-page links stay canonical and tolerate missing records

ID: work_link_integrity · proposed · P0

Stable IDs connect project/task/resource/meeting/decision/partner/request. Show neutral missing/archived/restricted state if target cannot open. Deleting a file link cannot delete its external file; closing a project cannot orphan unresolved finance/legal handoff unnoticed.

**Acceptance:** 1. An archived linked record has a recoverable reference; an inaccessible record leaks no title.

**Owner:** Engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S14/S15.

**Dependencies:** access_denied


##### Resolve shared-edit conflicts before overwriting work

ID: work_concurrent_updates · proposed · P0

Proposed server version or updated-at precondition on mutable records; stale edit offers compare/reload/copy draft rather than blind last-save wins. Repeated request IDs prevent duplicate tasks, expenses, numbers, or approvals. Notes collaboration can begin with explicit single-editor save semantics.

**Acceptance:** 1. Two authorized users edit1 task from the same version; incompatible changes produce1 explicit recoverable conflict or adopted safe merge.
2. There are0 silent lost accepted writes or unauthorized conflict resolutions.

**Owner:** Engineering

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F2/J8.

**Dependencies:** work_forms


##### Activity describes real changes and separates history from current state

ID: work_activity · proposed · P0

Write append-only events for meaningful create/edit/delete/assignment/status/date/resource/approval/decision operations after successful commit, with trusted actor/time and permission-safe fields. Workspace Changes is selected workspace only, including Admin/President, never a silent organization-wide feed. Portfolio progress summaries are derived operational views, not combined Changes. Historical completion events differ from current completed-task count. Ordinary users cannot edit events; do not claim forensic immutability. PRD editor actions log planning changes only.

**Acceptance:** 1. Reopen task updates current progress and retains prior event; switching workspace Changes reveals only that workspace and permitted record fields, even to leadership; planning edits never appear as production events.

**Owner:** Engineering / product

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8; READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_lifecycle,access_audit


##### Reusable project and meeting templates are optional starters

ID: work_templates · proposed · P1

Proposed templates carry fields/checklist suggestions without real people, dates, approvals or fabricated completed history. Applying template creates fresh IDs and asks for owner/context. A team can begin empty; illustrative records are clearly separate and never seeded over saved data.

**Acceptance:** 1. Applying a template creates uncompleted records requiring assignment and does not alter existing work.

**Owner:** Division leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5.

**Dependencies:** work_task_fields


##### Availability is evidence-based scheduling assistance

ID: work_availability · proposed · P0

Prior brainstorm suggests assignments/effort/dates/meetings/declared availability/absence. Proposed minimum shows declared windows and recorded meeting conflicts. Task counts indicate workload but cannot prove busy/available. Missing external calendar/effort remains Unknown.

**Acceptance:** 1. Picker displays evidence/basis and uses Unknown when no reliable declaration exists.

**Owner:** Product / HR / PM

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.


###### Member declares date/time windows with effective range

ID: availability_declared · proposed · P0

Optional recurring or one-off availability stores person, local window/timezone, effective dates and declaration timestamp. Students do not have assumed full-time work hours; availability is self-reported and expires. Login activity is not presence.

**Acceptance:** 1. A one-off window appears as declared availability with source date in meeting composer.

**Owner:** Member / HR

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** org_timezone_calendar


###### Absence window hides private reason from work coordinators

ID: availability_absence · proposed · P1

Proposed requested/approved/declined/cancelled state with person/dates/reviewer; whether approval is needed is HR policy. Coordinators see unavailable interval, not medical/personal explanation. Absence doesn't reassign tasks automatically.

**Acceptance:** 1. Picker shows unavailable window without exposing private reason.

**Owner:** Member / HR

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** hr_validation


###### Meeting conflict uses exact overlap and cancellation semantics

ID: availability_overlap · proposed · P0

Intervals overlap when each starts before the other ends; adjacent meetings do not. Cancelled excluded; tentative/accepted policy explicit. Timezone and cross-midnight considered. If meeting detail restricted, show neutral occupied interval only.

**Acceptance:** 1. Back-to-back clear and midnight overlap conflict without forbidden title leakage.

**Owner:** Engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_schedule


###### Optional estimate supports planned capacity; no actual-hours claim

ID: availability_capacity · proposed · P1

Use explicit task estimate with labeled hours or points and optional planned allocation by date. Compare only to self-declared capacity using same unit. Missing estimate isn't zero; six tasks isn't automatic Busy. Budgeted v1 may show task counts/dates only.

**Acceptance:** 1. Unestimated task yields unknown capacity and cannot generate definite availability badge.

**Owner:** PM / member

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** work_task_fields


###### Avatar opens person inspector with relevant workload evidence

ID: availability_person_inspector · proposed · P0

Show person/project role, permitted assigned tasks/projects, due work, known meetings and declared windows with last-updated basis. Historic contribution separate. Member cannot inspect unrelated private HR/candidate data through avatar.

**Acceptance:** 1. Resource/avatar inspection shows only permitted assignments and labels unknown availability.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** access_surface_scope


###### Coordinator can review conflict before proceeding

ID: availability_override · proposed · P0

Show overlap or declared-unavailable warning before meeting save. Authorized person can continue with reason under agreed policy, notifying participant. Deadline assignment does not reserve time, and override doesn't alter member's original declaration.

**Acceptance:** 1. Proceed-through-conflict records reason and continues showing actual overlap.

**Owner:** Meeting owner / PM

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** availability_overlap


###### Stale/absent availability never becomes guaranteed free time

ID: availability_stale · proposed · P0

Expire one-off windows; show stale recurring declaration after approved review period. No DWDG meeting conflict means only no recorded conflict. No external calendars or declarations means Unknown, even with zero tasks.

**Acceptance:** 1. An empty meeting list displays no recorded conflict plus Unknown availability.

**Owner:** Product / HR

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** availability_declared


###### Scheduling events notify affected people with privacy limits

ID: availability_events · proposed · P1

Notify meeting invite/time change/cancel, attendance response and approved unavailable interval affecting planned meeting. Aggregate repeated edits. Don't broadcast every personal availability change or private absence reason to division.

**Acceptance:** 1. Only affected recipients get one schedule change and no private reason.

**Owner:** Product / HR

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


###### Availability export labels self-reported and planned basis

ID: availability_export · proposed · P1

Agenda includes timezone/times/attendance and authorized declared-window basis, excluding private absence reasons. Workload export labels task counts and estimated effort separately from actual hours. External-calendar unknown data never becomes exported fact.

**Acceptance:** 1. Export has timezone/source basis and no private reason or fabricated actual hours.

**Owner:** HR / PM

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** access_sensitive_export


##### Timeline supports 7D, 2W, 1M, 3M, 6M, 1Y

ID: timeline_ranges · proposed · P0

Prior brainstorm's ranges are proposed. Keep same task/milestone IDs, filter/selection/scroll and today marker. Labels/dependency lines simplify at long ranges with exact inspector. Reduced motion uses immediate controlled range updates; no empty-canvas flash.

**Acceptance:** 1. Zoom changes preserve selected task/filters and all date values.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** work_work_views


##### Unscheduled and due-only work stays honest in Gantt

ID: timeline_unscheduled · proposed · P0

Undated tasks stay in Unscheduled list. Due-only task uses deadline marker; a span needs explicit start/end. Milestones use dated markers. Planned dates and real completion displayed distinctly, with no manufactured start/duration.

**Acceptance:** 1. Due-only marker never shows invented duration and undated work is reachable.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_task_fields


##### Date drag validates without changing actual history

ID: timeline_date_validation · proposed · P0

Reject invalid/end-before-start spans or prohibited edits. Date-only due marker keeps date-only type; span changes planned dates only. Show old/new dates and exact form alternative. Failed save restores original geometry/values and keeps draft.

**Acceptance:** 1. Invalid drag leaves dates unchanged; keyboard form performs same valid edit.

**Owner:** Engineering

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** work_forms


##### Start with finish-to-start prerequisite; advanced scheduler deferred

ID: timeline_dependency_semantics · proposed · P0

Proposed smallest dependency: successor needs predecessor completed/approved, optional explicit lag/date basis. No resource leveling/critical path/other types until validated. Dependency line always has saved source/target/reason/condition, not decorative relationship.

**Acceptance:** 1. Inspector explains the exact prerequisite and advanced scheduling is not promised.

**Owner:** PM / product

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** work_dependencies


##### Cascade previews changes and requires authorized approval

ID: timeline_cascade · proposed · P1

Predecessor date edit produces suggested downstream date changes under explicit rules. Preview each old/new date/owner/target conflict. Locked/manual dates flag conflicts, never overwritten silently. PM/lead approves complete set or cancels; atomic save with reason and version prevents partial cascade.

**Acceptance:** 1. Cancel preview leaves all dates unchanged; approval records exact affected records.

**Owner:** PM / lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J8.

**Dependencies:** timeline_dependency_semantics


##### Approved client/legal/publication targets require separate change decision

ID: timeline_protected_dates · proposed · P0

Cascade beyond client target, contract commitment, publishing plan or adopted legal lead time shows conflict and required approver. Dependency edit does not constitute scope/client approval or external notification. Protected deadline cannot silently shift to resolve chart.

**Acceptance:** 1. Moving predecessor beyond agreed target yields decision-required state without auto-moving commitment.

**Owner:** PM / PL / approver

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F5/J8; .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** timeline_cascade,consulting_scope


##### Deleted/restricted prerequisite remains unresolved until reviewed

ID: timeline_missing_prerequisite · proposed · P0

Reject graph cycles. Archived/missing prerequisite can't become automatically satisfied; show needed owner/action. Restricted predecessor exposes only allowed condition/status. Resolve/replace reference by authorized actor, preserving old relationship history.

**Acceptance:** 1. Archive prerequisite leaves successor dependency unresolved and no unauthorized details leak.

**Owner:** PM / engineering

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** work_dependencies


##### Milestone view summarizes actual gates for leadership

ID: timeline_milestone_rollup · proposed · P0

Rail displays owner/target/state, required-task/review counts and approved evidence links. Review-return changes summary; no duplicated manual milestone percent. Leadership can inspect unresolved requirements rather than only colored success circles.

**Acceptance:** 1. Milestone rail and Overview agree after required item returns to revision.

**Owner:** PL / PM / leadership

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. F8/J8.

**Dependencies:** work_milestones


##### Gantt drag has keyboard/date-form/touch alternatives

ID: timeline_accessible · proposed · P0

Exact date/dependency form offers same action as drag, with semantic dates/prerequisite/state summary. Touch target and horizontal scroll don't trap vertical page motion. Keep focus and range/scroll on return; non-drag interaction works under reduced motion.

**Acceptance:** 1. Keyboard/touch users make equivalent edit with validation and return focus.

**Owner:** Product / QA

**Source / assumption:** Active Experience Specification v1.1, retained data and interaction contracts. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** timeline_ranges


##### Optional one-level subtasks reuse canonical tasks

ID: work_subtasks · proposed · P1

P1 proposal from critique universal work-model brainstorming. Default v1 can remain flat; if adopted, task gains nullable parent_task_id and supports one level only. Child is a canonical task with its own stable ID, assignee, dates, status, evidence and version, visible in Work/My tasks/Timeline/Resources. Parent/child must share project and workspace; access follows existing scope, not automatic grants. Parent containment describes breakdown, while Dependency is separate prerequisite. Reject self-parent, cycles, child-of-child and unavailable parent. All active noncancelled children must complete before parent can be explicitly completed/reviewed by its authorized owner; completing last child only signals ready for parent review and never invents parent approval/completion date. Project task progress counts eligible leaf tasks only, excluding parents with active children to avoid double-counting; parent checklist and delivery readiness remain separate labeled facts. Cancel/archive/delete previews effects on child links, blockers and progress; parent deletion cannot silently remove children. Restore preserves IDs and parent links when still permitted. Reparent is an authorized same-project operation with old/new parent review, version checks and no ownership reset; cross-project move is separate reviewed scope transfer. Bulk transitions cannot bypass child/reviewer rules.

**Acceptance:** 1. With feature disabled, flat tasks/counts remain unchanged. With feature enabled, create parent and two children; they retain one canonical ID each across views, parent completion blocks while a child is open, leaf progress counts each eligible child once, forbidden/cyclic reparent fails, and parent archive/restore preserves child relationships without expanding access.

**Owner:** Product / PM / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md, universal project model lists Tasks and Subtasks as brainstorming; detailed semantics proposed, not adopted v1 scope.

**Dependencies:** work_task_fields,work_task_lifecycle,work_dependencies,analytics_progress,access_surface_scope,work_undo_archive


#### Resources unifies folders, files, notes, apps, and links

ID: resources · confirmed · P0

Direct user requested minimal project tabs combining folders/apps/notebook and visible responsible-person avatar bubbles with contextual work inspector. Every resource is an actionable object linked to canonical tasks, not a new project workspace or duplicate task manager.

**Acceptance:** 1. A user can browse a folder, open linked app/note, delegate responsibility and create related work from Resources.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.


##### Resource kinds preserve their different behavior

ID: resource_types · proposed · P0

Launch kinds: native internal folder, lightweight note, external file/folder URL, external app/document URL, meeting note and approved template reference. Uploaded binary file is a future kind disabled until upload policy is approved. Shared metadata: title, owning organization/workspace/project, creator or added-by, owner/contributors, timestamps, parent/access class, short notes and related-task links.

**Acceptance:** 1. Render6 launch-kind fixtures; each distinguishes native note/folder/provider URL/template/meeting context appropriately.
2. Native binary upload controls are available0 times by default.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** org_vocabulary
access_surface_scope


##### Explorer combines pinned items, folders/files, notes, and apps/links

ID: resource_explorer · proposed · P0

Within Resources use useful groups, breadcrumbs, compact rows or controlled grid alternative, type/search/filter and recent updates. Parent-folder navigation does not produce another top-level tab. A project can contain no resources and offers add/create/link actions within permission.

**Acceptance:** 1. A user can reach nested folder items, notes and app links from one tab with visible back/breadcrumb path.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** work_project_tabs


##### Resource shows responsible-person avatar bubbles

ID: resource_bubbles · confirmed · P0

User directly requested avatar bubbles for people delegated to folder/file/link work. Show accountable owner and assigned contributors with accessible names, overflow count, and click/tap to inspector. An avatar means responsibility, not proof of provider access or creator identity.

**Acceptance:** 1. Assign two contributors and their named avatars appear on the resource after reload; overflow still exposes all assignees.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_delegation


##### Right-click and accessible alternatives open contextual resource inspector

ID: resource_inspector · confirmed · P0

User requested delegation, add task, delete/edit, creator and notes in side panel. Provide right-click where supported plus row overflow/button, Enter/open and touch tap equivalent. Inspector keeps selected resource/list context; mobile uses full-screen detail with return path.

**Acceptance:** 1. Keyboard and touch users reach every right-click action; inspector shows selected object's title/type and permissible actions.

**Owner:** Product owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_types


##### Resource accountability is separate from a specific task assignment

ID: resource_responsibility · proposed · P0

Folder owner oversees area; file/note/link contributors may work on it. Linked task assignee owns a particular outcome/date. Adding a contributor does not auto-create a deadline or grant provider access. One accountable resource owner is visible even with many contributors.

**Acceptance:** 1. A folder owner and linked-task assignee may differ without conflicting ownership labels.

**Owner:** Project lead

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_bubbles,access_delegation


##### Create task from resource creates one canonical work record

ID: resource_tasks · proposed · P0

Inspector action asks title, assignee, due date, priority and project/context. New task stores resourceId link; Resources shows related-work list derived from those links. Work/My tasks/Schedule/board use same ID. Changing task status anywhere updates related-work view without a second resource progress field.

**Acceptance:** 1. Create1 task from1 resource and delegate to1 eligible person; exactly1 task ID and1 association are created.
2. Retry3 times creates0 duplicate task/resource associations.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S14.

**Dependencies:** work_task_fields,resource_inspector


##### Internal folder contains metadata with safe hierarchy rules

ID: resource_folder · proposed · P0

Folder has parent ID and project/workspace context. Reject cycles and moving a folder inside itself/descendant. Proposed reasonable depth with breadcrumbs; limit and bulk behavior require product validation. Folder names may repeat across branches but sibling collisions warn clearly.

**Acceptance:** 1. Create1 three-level folder hierarchy;0 cycles,self-parent links or foreign-workspace children are accepted.
2. Rename/move1 folder preserves100% of fixture resource IDs and explicit relationships.

**Owner:** Engineering / product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_types
access_surface_scope


##### External folder link does not mirror provider contents

ID: resource_external_folder · proposed · P0

A Google Drive folder resource stores URL/provider and context/ownership/access note. Opening goes to the provider; browsing its actual children requires a future provider integration. Clearly distinguish it from an internal folder so the user does not assume upload or permissions are synchronized.

**Acceptance:** 1. An external folder opens its provider URL and never claims it contains indexed/copied external files.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** resource_provider_access


##### Creator means added to DWDG when external creator is unknown

ID: resource_creator · proposed · P0

Store createdBy/createdAt for internal objects and addedBy/addedAt for external resource. Provider creator may be an optional supplied metadata field with provenance. Never infer who authored a Google Sheet merely because that person pasted its URL.

**Acceptance:** 1. External resource inspector says who added it to DWDG and leaves actual provider creator unknown when unavailable.

**Owner:** Engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_surface_scope


##### Notes are lightweight editable resources linked to context

ID: resource_notes · proposed · P0

Proposed rich or Markdown/plain text note with title, author/editor, project/workspace/folder, autosaved draft and explicit saved revision. Support project brief, research finding and minutes without a separate notebook tab. Export plain/Markdown text; do not claim real-time collaborative editing in first minimum scope.

**Acceptance:** 1. A 1,000-word note is editable/findable/exportable; inject1 failed save and retain100% of typed text.
2. Successful revision acknowledgement persists after1 reload; unacknowledged text shows0 false Saved states.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S10.

**Dependencies:** work_forms
resource_types


##### Revision history identifies current approved version and original

ID: resource_revisions · proposed · P0

Budgeted v1 revisions retain stable resource ID, internal note text or external version URL, revision label, author/time, change note and reviewer/state. A link cannot freeze provider contents if edited in place; reviewed output needs an owner-supplied immutable version/export link or documented version evidence. Native uploaded-blob version storage is deferred.

**Acceptance:** 1. A review points to its exact supplied external version or note text and warns when external link has no stable version evidence.

**Owner:** Resource owner / reviewer

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J5/J8.

**Dependencies:** work_activity


##### Stored binary uploads are deferred; v1 links working files

ID: resource_upload · deferred · P2

The current budget target is Rp35,000/month with a hard ceiling of Rp50,000/month. Native binary uploads, coordinated blob/metadata cleanup, file/organization quotas and uploaded revisions remain deferred unless the user later approves a feasible storage/ownership/cost plan. Native notes/folders and approved external file links remain the proposed v1 resource baseline; preserve earlier upload code only as reference.

**Acceptance:** 1. Core evidence/resource workflows work with URLs and notes; launch UI does not promise native stored uploads.

**Owner:** Engineering / Admin

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** scope_links_default


##### Notes and external-resource context preview; richer file embedding optional

ID: resource_preview · proposed · P1

V1 shows internal notes and permitted resource metadata, and opens working documents at the approved provider. DWDG does not mirror provider files. Optional safe PDF/image embedding needs access/quotas/browser support policy; office editing and provider content indexing stay deferred. Preview unavailable still provides usable open/access-request contact.

**Acceptance:** 1. An external document remains usable through provider open/contact when embedded preview is unavailable.

**Owner:** Product / engineering

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** resource_provider_access


##### DWDG responsibility and provider permission are separate

ID: resource_provider_access · proposed · P0

Access to a resource record does not grant Google Drive/Canva/Figma/other app access. Show operational access note/request contact, open in external app and report link issue. Never promise provider synchronization, live preview, edit permission or availability without configured integration.

**Acceptance:** 1. Adding1 DWDG responsibility assignment changes external provider permissions0 times.
2. Broken or denied provider links retain1 identifiable custodian/recovery route.

**Owner:** Resource owner / product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_action_matrix


##### Move/rename preserves links and shows scope consequences

ID: resource_move · proposed · P0

Rename changes label only. Move within project updates parent; move across project/workspace previews access/ownership changes and linked tasks. Proposed cross-scope moves require authorized owner/lead and do not silently relocate related tasks. External linked file itself stays in provider location.

**Acceptance:** 1. Moving resource keeps its ID and task links; an unauthorized cross-workspace move is rejected.

**Owner:** Project / resource owner

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_project_collab,resource_folder


##### Default delete archives metadata, notes and folders

ID: resource_delete · proposed · P0

V1 inspector names removal of DWDG external link or reversible archive of native note/folder. Nonempty-folder archive previews permitted descendant and linked-work consequences. Deleting an external link never deletes provider file. Physical stored-file deletion and coordinated blob/metadata cleanup apply only if native uploads are adopted later with approved retention/cost/security policy. Default launch has no physical upload-delete action.

**Acceptance:** 1. Deleting an external link leaves provider file untouched; folder archive restores same allowed child/task relationships; no binary cleanup action appears before optional upload adoption.

**Owner:** Resource owner / Admin

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_undo_archive


##### Pin is a contextual shortcut to an existing resource

ID: resource_pin · proposed · P1

Personal or project pin scope is explicit. A pin stores a reference, not a duplicate resource. Removing pin does not remove resource; inaccessible or archived target is omitted or shown neutrally according to policy. Prioritize useful current resources rather than decorative quick-access tiles.

**Acceptance:** 1. Pin/unpin leaves canonical resource count unchanged and pin cannot expose restricted metadata.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming.

**Dependencies:** access_surface_scope
resource_types


##### Resource search finds metadata and linked responsibility safely

ID: resource_search · proposed · P0

Search title/type/notes/owner/tags/project within allowed context. Show folder path, external vs stored indicator, responsible avatars and linked task count. Full-text indexing of uploaded file contents or provider documents is deferred until justified by cost/security/quality.

**Acceptance:** 1. Search by an assigned person's name finds their permitted resources while private external content stays unindexed.

**Owner:** Engineering / product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; user messages are direct requests; assistant text is brainstorming. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G9/J9.

**Dependencies:** work_search


##### Account/password request becomes safe vault-reference discovery

ID: resource_secret_links · proposed · P0

Survey requested finding account passwords through search; proposed safe alternative is searchable account registry with service/purpose/owner and approved vault/access-request link. Never store secret values in resource notes, task text, URLs, preview, activity or export. Vault implementation/selection needs an explicit owner.

**Acceptance:** 1. Search/export1 fixture vault reference and1 forbidden secret marker; marker occurrences in user-facing results/history/export equal0.
2. Account discovery returns owner and approved access path only;0 plaintext tokens/passwords are stored.

**Owner:** IT / Admin

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J9; User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_sensitive_data
security_secrets


##### Export metadata and notes; provider files are separate

ID: resource_export_bundle · proposed · P0

Authorized JSON/CSV export includes resource metadata, note text and external references with manifest/scope/version. Working file contents and permissions remain at the approved provider; links may later become inaccessible. Native attachment bundle belongs with deferred uploads. Metadata export is not a complete provider backup.

**Acceptance:** 1. Export reconciles resource/note counts and explicitly states that external file contents/provider access were not copied.

**Owner:** Admin / engineering

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** access_surface_scope,resource_revisions


##### Confirm note/resource limits and organization account ownership

ID: resource_launch_limits · open · P0

Open v1 decisions: note size/revision retention, project/resource count, folder depth, external URL disclosure, account/folder ownership and separate provider-backup procedure. No organization shared Drive or domain exists today. Notes/link-only launch is proposed; native upload and content mirroring remain deferred.

**Acceptance:** 1. Approved native note/resource/folder limits, external URL disclosure and account custody are documented before real rollout; later uploads stay disabled until their separate policy is accepted.

**Owner:** Mahdy / IT / division leads

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** scope_student_scale
scope_org_storage_setup


##### Folder context doesn't overwrite child contributor lists

ID: resource_parent_responsibility · proposed · P0

Child avatar bubbles are explicit child responsibility unless contextual folder ownership is labeled separately. Removing parent person doesn't remove child assignee; adding folder contributor doesn't create tasks for every child. Provider permission remains external.

**Acceptance:** 1. Folder and child can show different owners with no hidden child assignments.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** access_resource_inheritance


##### Short object instruction links longer notes rather than duplicating

ID: resource_object_note · proposed · P0

Folder/file/link inspector has short purpose/instruction note. Substantial brief/research/minutes is separate note resource with link. Don't duplicate long note in every related task description; keep source/context vs assigned outcome clear.

**Acceptance:** 1. Object purpose and long brief both reachable from one inspector without duplicate contents.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user.

**Dependencies:** resource_notes


##### Reference existing resource; copying requires explicit provenance

ID: resource_references · proposed · P1

One resource may be linked to multiple allowed tasks/projects using approved context links. Add existing creates reference, not duplicate owner metadata. Explicit copy creates new metadata/ID with source relation, not automatic provider file duplication.

**Acceptance:** 1. Two tasks reference one Survey Sheet without two independent resource owners.

**Owner:** Product / engineering

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** resource_tasks


##### Validate safe URL scheme without guessing provider permission

ID: resource_link_validation · proposed · P0

Production external resource baseline accepts HTTPS links and rejects executable/javascript/data/file schemes and embedded credentials. Plain HTTP legacy destinations require explicitly reviewed exception rather than default acceptance. Preserve meaningful URL content while restricting private URL disclosure; do not fetch private documents to guess provider access.

**Acceptance:** 1. Unsafe/embedded-credential URL is rejected without losing draft; HTTPS provider link opens correctly and any legacy exception is explicit.

**Owner:** Engineering / IT

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. Latest user production PRD request, 3 Oct 2026.

**Dependencies:** resource_types
security_web


##### Unable-to-open report gives owner and recovery path

ID: resource_link_issue · proposed · P0

Flag not found/access denied/expired/wrong target, actor/time and owner follow-up. Record stays intact; app cannot prove provider deleted file from one denied attempt. Automated public status check cannot prove user authorization.

**Acceptance:** 1. Reported link issue offers contact/next action without deleting canonical tasks.

**Owner:** Resource owner / IT

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.

**Dependencies:** resource_provider_access


##### Resource events distinguish delegation, revision and linked task

ID: resource_events · proposed · P0

Notify assigned responsible person, required revision reviewer, linked-task assignee and owner of link issue. Private note draft produces no published update; pin/rename doesn't alert every member. Recipients reevaluated against current scope.

**Acceptance:** 1. Delegation yields one eligible event; draft save yields no review notification.

**Owner:** Product

**Source / assumption:** .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md; assistant brainstorming is a proposal unless directly requested by user. Active Experience Specification v1.1, retained data and interaction contracts.

**Dependencies:** work_updates


##### Safe exports preserve user text and exclude secrets

ID: resource_export_security · proposed · P0

CSV neutralizes formula-like leading values in output without changing app source text. Export IDs/path/type/notes/responsibility under current scope; restricted URLs omitted. No plaintext password/API/recovery code ordinary export or activity.

**Acceptance:** 1. Malicious title doesn't execute spreadsheet formula and restricted URL/secret absent.

**Owner:** Engineering / IT

**Source / assumption:** Latest user production PRD request, 3 Oct 2026. Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. J9.

**Dependencies:** access_sensitive_export


##### Account custodian transfer stores responsibility without secrets

ID: resource_account_history · proposed · P0

Registry stores current owner/access process/transfer actor/date/review date. Vault reference changes are historical metadata; no secret value audit. Handover complete requires successor acknowledgment of recovery/ownership externally before departing custodian access removed.

**Acceptance:** 1. Ownership audit has no credentials and successor confirmation is visible.

**Owner:** IT / Admin

**Source / assumption:** Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain. .planning/drafts/WORKSPACE_PRD_MINDMAP.md.

**Dependencies:** marketing_account_register,access_admin_handover


#### Honest operational charts and reports

ID: analytics · proposed · P0

Charts derive from authorized saved records, show units/basis/unknown states and open those records. Reporting reduces repetitive reconstruction; no invented organization health, productivity, hours, revenue or completion history.

**Acceptance:** 1. Every launch chart/report has a formula, access scope and accessible exact-value alternative.

**Owner:** Product / division leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.


##### Project progress = currently completed tasks / linked tasks

ID: analytics_progress · proposed · P0

Define included tasks explicitly, including archived/cancelled policy. Default proposed denominator active noncancelled linked tasks; completed count same eligible set. Empty project displays No tasks yet. Project status/readiness remains separate; task percentage is not client acceptance or strategic success. If optional P1 subtasks are adopted, use the same eligible leaf-task definition across charts/lists/exports and exclude structural parents with active children from numerator/denominator; show parent review state separately.

**Acceptance:** 1. Fixture10 eligible flat tasks with4 completed gives exactly40% current progress.
2. If optional subtasks are adopted, parent groups contribute0 extra counted units and only adopted eligible leaves determine numerator/denominator.
3. Zero-task denominator displays unavailable/empty rather than a fabricated score.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_task_lifecycle


##### Completed-task activity uses real recorded completion dates

ID: analytics_completion · proposed · P0

Currently completed tasks counted by stored completion date; undated legacy completions disclosed separately. Known observed zero days are zero, unobserved history unavailable. Today partial. Reopen/delete changes current-record counts; immutable event history, if offered, has different label.

**Acceptance:** 1. Only actual saved completion timestamps enter historical bins; undated completed fixtures contribute0 invented dated observations.
2. Reopen1 task preserves historical event truth while current-state totals change accurately.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** work_activity


##### Average excludes today, future, and unobserved days

ID: analytics_average · proposed · P0

Average = sum of dated currently completed task counts on completed observed calendar days / number of those days. Include known zero days. Empty denominator shows unavailable. Selected timezone/period basis visible; stable axis across comparison period; no claimed hours.

**Acceptance:** 1. Fixture3 observed finished days with counts0,2,4 yields average2; today,future andunobserved days contribute0 denominator units.
2. The displayed basis/timezone/date interval is explicit for100% of this report.

**Owner:** Engineering / product

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** analytics_completion


##### Chart selection synchronizes exact values and source list

ID: analytics_selection · proposed · P0

Mouse, keyboard, and tap select date/stage/project/category with accessible names. Date capsule, chart mark, exact readout and underlying list share controlled selection and survive resize/return. Restricted aggregates are computed from allowed records before chart construction.

**Acceptance:** 1. Selecting a bar/stage filters the exact same record IDs and focus remains usable on mobile.

**Owner:** Product / engineering

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** access_surface_scope


##### Division summaries use meaningful counts and actual amounts

ID: analytics_division_counts · proposed · P0

External stages = relationship counts; Marketing cadence = saved planned/actual dates and stage counts; HR = candidate stage and checklist count; S&G = explicit horizons/dependencies; Consulting = saved milestone/review states; Finance = exact IDR allocation/approval/payment. No unsupported conversion/performance/engagement metric.

**Acceptance:** 1. For each division select a summary mark and reconcile exact value to its underlying authorized records.

**Owner:** Division leads

**Source / assumption:** READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md, retained workflow/data contracts.

**Dependencies:** analytics_selection


##### Filtered report includes scope, basis, date and missing data

ID: analytics_reports · proposed · P0

Generate selected workspace/project/period summaries with owner, state, dates, blockers, decisions and resource/evidence links. CSV handles quoting/Unicode/formula-injection hygiene; print/export labels filters/timezone/currency and generation time. Missing values remain unavailable, not invented zeros.

**Acceptance:** 1. Export row IDs and totals match the filtered view and restricted columns stay excluded.

**Owner:** Product / engineering

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. S05; User request, 3 Oct 2026; Critique App Development conversation user messages.

**Dependencies:** access_surface_scope


##### Survey facts guide priorities without pretending to cover everyone

ID: analytics_survey · confirmed · P0

8 respondents: Consulting 3, MarCom IT 2, Legal Finance 2, Client Engagement 1; HR/S&G absent. Multi-select: reminders 8, progress/docs 7 each, assignment/reports/blockers 5 each, dashboard 4, notifications/calendar/minutes 3 each, budget 1. Separate most-important mentions have a different basis.

**Acceptance:** 1. PRD quotes correct sample, per-question basis and source range; HR/S&G processes stay proposed pending validation.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md.


##### Define success evidence from real adoption and completion journeys

ID: analytics_metric_policy · proposed · P1

Proposed product metrics: successful invite/sign-in, active members by defined week, task update success, unresolved P0 errors, overdue/blocker visibility and report usage with minimal privacy-preserving telemetry. Set target after baseline/pilot; do not invent productivity gain or student-member performance rankings.

**Acceptance:** 1. Pilot review can measure known journey success and errors without collecting unnecessary personal behavior.

**Owner:** Mahdy / product

**Source / assumption:** User request, 3 Oct 2026; Critique App Development conversation user messages. Original survey XLSX, Form Responses 1, D2:J9; freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d.

**Dependencies:** vision-pains
scope_student_scale


##### Current process and anticipated risk are different evidence

ID: survey_fragmentation · confirmed · P0

E2:E9 names WhatsApp/manual spreadsheets/Forms/Sheets/Drive. F5/F6 explicitly say serious program workload hasn't run yet and anticipate fragmentation/SLA/PIC problems. Do not state those as measured prevalent failures or quantified delays.

**Acceptance:** 1. PRD distinguishes supplied current method from respondent's future risk.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E2:F9.


##### Consulting asks master matrix, revisions and reviewed delivery

ID: survey_consulting_qualitative · confirmed · P0

G2 asks reviewed work/revision notes; J2 master matrix. E8/F8/J8 asks many projects without repeated input, PJ/dates/milestones/blockers/scope/decisions/readiness, distinct PL/PM, history and approval actor. This validates linked requirements, not adopted stage names.

**Acceptance:** 1. Qualitative needs map to canonical work/review nodes while stages remain proposed.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E2:J2/E8:J8.


##### Legal asks connected intake, register, versions and gate

ID: survey_legal_qualitative · confirmed · P0

E5/F5/J5 describe Forms/Sheets/Drive/WhatsApp, future duplicate-number risk, H-2/H-3 suggestion, revision/signature tracking, signatory/KAK input, numbering upon approval, master-template history and PKS→BAST→invoice. Official SOP/authority still open.

**Acceptance:** 1. Intake/numbering/SLA/version/gate cite precise evidence and retain adoption gaps.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E5:J5.


##### Marketing asks access, executor reminder and proof

ID: survey_marketing_qualitative · confirmed · P0

F3 data separation; F7 spreadsheet not accessible to everyone; J7 executor deadline and progress/completion evidence; J3 attractive view. Supports shared scoped work/reviewed resources, not social autopublishing/engagement analytics.

**Acceptance:** 1. Access/executor/evidence requirements map to source with channel integration deferred.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E3:J3/E7:J7.


##### External asks mobile PIC timeline and follow-up reminders

ID: survey_external_qualitative · confirmed · P0

F6 anticipates PIC/partnership timeline before program execution. J6 mobile-friendly and possible Telegram/WhatsApp/email. Mobile reminder outcome is supported; channel selection remains cost-sensitive proposal, not must-build bot.

**Acceptance:** 1. Mobile/PIC/follow-up included with explicit channel choice gap.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. E6:J6; Latest user budget decision, 3 Oct 2026: target Rp35,000/month; hard ceiling Rp50,000/month, superseding earlier near-Rp0 target. Initial cohort remains roughly 40+ members; no shared organization Drive or domain.


##### Password-search example maps to safe account-access discovery

ID: survey_secret_search · confirmed · P0

G9 search anything/J9 project file/password example captures findability need. Proposed searchable service/owner/access process/vault reference excludes secret values. Source content is not authorization to collect/index passwords.

**Acceptance:** 1. Traceability maps unsafe example to safe account registry and exclusions.

**Owner:** Product owner / IT

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. G9/J9.


##### Most-important free text is mentions, not clean top-three ranking

ID: survey_important_basis · confirmed · P0

Question H asks maximum three but H5/H7/H9 list or mention more. Report counts as mentions: reminder/docs 5 each; progress 4; dashboard/notifications 2; assignment/reports/blockers/minutes/budget 1; calendar 0. Never combine with G multi-select count or score.

**Acceptance:** 1. PRD labels mention basis and does not claim every respondent complied with max-three.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. H2:H9; SURVEY_TRACEABILITY.md.


##### Eight-response source excludes HR/S&G and unnecessary identifiers

ID: survey_privacy_scope · confirmed · P0

No survey establishes member count, weekly adoption, cost or department-wide consensus. Sample 8; Client name mapped to External; HR/S&G absent. Keep source workbook unchanged and cite range/hash without copying names/emails into shared PRD.

**Acceptance:** 1. All survey numbers cite correct basis and no respondent identifying fields copied.

**Owner:** Product owner

**Source / assumption:** Original survey XLSX, Form Responses 1, freshly read 3 Oct 2026; SHA256 4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d. D2:J9.


#### Design, navigation, and interaction contract

ID: design · proposed · P0

Quiet Notion-like working surfaces, compact CRM/task composition on desktop, Samsung-inspired mobile grouping/charts, and selective tactile controls from supplied references. Keep expressive identity restrained and operational text stable. Use one coherent component system; avoid six independently styled applications. This direction is a proposed baseline for the restart, informed by supplied references and prior user decisions.

**Acceptance:** 1. A complete set of core and division screens passes a shared design/interaction matrix before launch.

**Owner:** Design owner + Mahdy

**Source / assumption:** Referenced chats; Experience v1.1 reference atlas and actual CRM/Samsung images


##### One persistent shell and one workspace selector

ID: design-shell · confirmed · P0

Desktop has a compact sidebar, top search/action area, main work region and contextual inspector. The workspace name opens a searchable allowed-context selector; it does not silently navigate to Organization. Members with one allowed workspace see its identity without a misleading switcher. Organization management is an explicit destination. Workspace capabilities appear within the same shell.

**Acceptance:** 1. Switch across Home/Projects/Resources for all6 division fixtures; exactly1 persistent shell and1 meaningful workspace context remain.
2. Every allowed/denied workspace option reconciles with the action/scope matrix;0 duplicate division navigation.
3. Geometry follows measure-shell (216px sidebar/56px toolbar/40px navigation baseline).

**Owner:** Design + authorization owners

**Source / assumption:** Take notes on YouTube videos: explicit user workspace-dropdown request; scoped access decisions

**Dependencies:** org_vocabulary
access_surface_scope


##### Minimal global and project navigation

ID: design-navigation · proposed · P0

Proposed global destinations: Home, My Work, Projects, Schedule, Resources, Updates; Organization and Settings are secondary destinations subject to permissions. Workspace-specific capabilities appear below core destinations. Project navigation is exactly Overview / Work / Resources. List, board, timeline, milestones, and activity are view choices inside these tabs. Mobile uses a short dock and accessible More destination; do not hide required actions behind hover.

**Acceptance:** 1. Each project has exactly3 primary tabs, with view choices inside the adopted tab.
2. At320px and200% text zoom,0 required actions are available only by hover.

**Owner:** Product + design

**Source / assumption:** Critique App Development minimal project-tab request; renamed Resources direction

**Dependencies:** design-shell
org_vocabulary


##### Project information architecture

ID: design-project-tabs · proposed · P0

Overview: brief, owner, deadlines, milestones, blockers, latest decisions, delivery readiness and compact activity.
Work: one task collection through list, board, timeline, and milestone views; no duplicate task databases.
Resources: notes, internal folders, linked documents/apps, and later optional uploads, assignees, and contextual tasks.
Activity lives as a section or inspector within the relevant tab, avoiding an extra main tab unless research proves it necessary.

**Acceptance:** 1. Create1 task from1 resource; the same task ID appears in Work, relevant Overview counts and timeline without a duplicate.
2. Exactly3 primary tabs remain; activity is contextual unless a separate later decision is recorded.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** work_project_tabs
work_task_fields
resource_types


##### Readable density and aligned rows

ID: design-density · proposed · P1

Carry forward desktop targets as proposals: about 216px sidebar, 56px toolbar, 24/32px title, 14/20px body, 12/16px supporting text. Projects default to grouped 76px rows with Grid/Timeline alternatives. At 1440×900 target four ordinary rows visible below a compact summary. Allow long titles and accessibility zoom to expand rows rather than clip. Dense does not mean tiny controls or information at every pixel.

**Acceptance:** 1. At1440×900 normal zoom, first ordinary project row top≤450px and≥4 complete76px rows are visible.
2. At200% text zoom, content can expand;0 essential title/action clipping is caused by fixed row heights.

**Owner:** Design owner

**Source / assumption:** Experience v1.1 tokens; reference 12 CRM, 02 compact task groups

**Dependencies:** design-reference


##### Semantic surfaces, themes, and identity

ID: design-materials · proposed · P1

Proposed shared roles: mineral canvas #F5F6F8 / #131619; reading surface #FFFFFF / #1C2024; main text #171A1F / #F3F5F7; secondary text #606874 / #ACB4BD; identity sage #58703F / #BFD696; activity blue #3478F6 / #71A5FF. Semantic tokens drive both themes. Ordinary tables/notes remain opaque. Glass belongs on small floating controls/menus; tactile depth belongs on selected primary controls. These color values require rendered contrast checks.

**Acceptance:** 1. Light/dark screen review verifies text contrast, input boundaries, disabled/error states, chart distinctions, and solid-surface fallback.

**Owner:** Design owner

**Source / assumption:** Experience v1.1 design-tokens.json, observed brand/reference material

**Dependencies:** design-reference


##### Operational typography and wordmark

ID: design-typography · proposed · P1

Use existing locally served Pretendard/system fallback for operational text unless a reviewed change materially improves readability. Retain DWDG’ONE as the identity treatment rather than turning every heading into a brand graphic. Tabular figures align IDR values, dates, counts, and percentages. Default operational text remains readable; long labels wrap naturally. Do not load multiple large font families merely for decorative variety.

**Acceptance:** 1. Computed baseline matches measure-type-desktop and measure-type-mobile; operational product text≥12px.
2. Ten fixture date/count/IDR rows align; font failure preserves100% of essential labels/actions.

**Owner:** Design owner

**Source / assumption:** Experience v1.1 typography contract

**Dependencies:** design-reference


##### Reference register and attribution limits

ID: design-reference · proposed · P1

CRM/task stills establish visual grouping, row anchors, and inspector proportions. Samsung stills establish mobile charts, exact selected values, progress groups, and scroll context. The supplied meeting video is a reference for compact in-place composition. Prior YouTube notes verify chapter metadata, not full playback or narration. Never copy fictional people, statistics, account credentials, or instructions contained in a screenshot into product data.

**Acceptance:** 1. Reference comparisons identify which actual image supports each pattern; a still is never presented as proof of motion timing.

**Owner:** Design owner

**Source / assumption:** REFERENCE_ATLAS.md; prior video notes and referenced chat evidence


##### A visible action has a complete outcome

ID: design-actions · proposed · P0

Every visible control has a defined result, permission rule, pending state, success evidence, validation failure, and recovery action. Primary creation offers only fields needed to start; extra details remain available afterward. Disabled actions explain the unmet prerequisite when relevant. No decorative button can suggest that an email, signature, payment, calendar sync, or publication happened.

**Acceptance:** 1. For every adopted primary action, test success, denied, validation, conflict and failure:5 outcomes with0 false-success messages.
2. Each committed record mutation produces1 coherent history operation and persists after reload.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** work_forms
work_concurrent_updates


##### Contextual detail and resource actions

ID: design-inspector · confirmed · P0

Desktop detail uses a right inspector that preserves the list, selected item, and scroll. Mobile opens a usable full-screen detail with Back. Resource right-click is an accelerator; a visible More action and keyboard route expose the same inspector. Inspector sections include creator/added by, responsible people/avatar bubbles, notes, tasks, linked records, and allowed actions. Folder responsibility does not automatically grant file-provider access.

**Acceptance:** 1. For6 resource-kind fixtures, pointer, keyboard and touch routes open the same stable ID and permitted action set.
2. After10 open/close cycles, origin scroll/selection and uncommitted draft remain intact.

**Owner:** Design + resource owners

**Source / assumption:** Critique App Development explicit resource avatars and right-click side-panel request

**Dependencies:** resource_inspector
resource_tasks


##### Menus, dialogs, focus, and drafts

ID: design-overlays · proposed · P0

One overlay controller owns placement and focus. Small pickers anchor to their control, flip or shift at edges, and retain keyboard navigation. Destructive confirmation names the item and consequence. Escape closes the top eligible layer; closing restores logical focus. Editing drafts persist through harmless interactions. Leaving an unsaved draft has explicit save/discard behavior; external modal actions never erase it.

**Acceptance:** 1. Test4 viewport corners, Escape, nested menu, deleted opener and unsaved draft navigation.
2. 0 focus escapes from a modal;1 live opener receives focus on return where it still exists.
3. Adopted gap/dimensions follow measure-dialogs and measure-popovers.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** engineering-drafts


##### Purposeful motion and reduced-motion parity

ID: design-motion · proposed · P1

Motion explains state change: contextual panel expansion, selected-date changes, saved task completion, and undo. No entrance sequence delays work. Baseline proposal: 120–140ms press, 180–220ms picker, 260–320ms inspector, 220ms completion dissolve. Commit successfully before removing a row. Reduced motion removes spatial/blur effects and retains all state feedback. Heavy WebGL identity is deferred until ordinary operations meet performance and accessibility gates.

**Acceptance:** 1. Complete a task under successful save, failed save, reduced motion, rapid double action, and Undo; final data and focus remain correct.

**Owner:** Design + frontend

**Source / assumption:** Experience v1.1 motion tokens; prior user material/animation direction

**Dependencies:** design-reference


##### English and Bahasa Indonesia parity

ID: design-languages · confirmed · P0

Retain English and Bahasa Indonesia, with shared keys for navigation, fields, statuses, validation, charts, notifications, accessible names, emails if introduced, and exports. Format dates/numbers/IDR with chosen locale while retaining stable stored values. Never translate user-entered notes, task names, or filenames automatically. Proposed default remains English pending user preference.

**Acceptance:** 1. Review2 languages ×2 themes on all adopted shared controls;0 missing translation keys or raw internal error strings.
2. User content is translated automatically0 times.

**Owner:** Product + localization owner

**Source / assumption:** Workspace AGENTS and existing bilingual contract; default language proposed

**Dependencies:** vision-name


##### Date-only work and actual meeting times

ID: design-time · proposed · P0

Organization timezone defaults to Asia/Jakarta; display includes a timezone when ambiguity matters. Store date-only deadlines as dates rather than midnight UTC timestamps. Meetings have actual start, end/duration, and timezone. Overdue depends on agreed date semantics, not artificial 00:00 offsets. A user's travel timezone must not shift a date-only deadline. Availability timezone conversion remains explicit.

**Acceptance:** 1. A date-only deadline remains1 all-day calendar date in Asia/Jakarta, with0 invented meeting hour.
2. A timed meeting retains the exact start/end instants across2 device timezones and date-boundary fixtures.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** org_timezone_calendar


##### Empty, loading, denied, offline, and broken states

ID: design-empty · proposed · P0

Differentiate no records, no matching results, denied access, missing record, loading, offline, and failed retrieval. Empty views show one useful create/invite/import route appropriate to role. Broken external links distinguish missing metadata from provider permission problems. Loading retains layout and existing content where valid. A save retry retains input and avoids duplicate records.

**Acceptance:** 1. Exercise5 distinct states(empty/loading/denied/offline/failed) with0 fabricated records/charts and0 erased drafts.
2. Each actionable failure has1 understandable retry/resolve path where applicable.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** engineering-errors


##### Search as a scoped navigation tool

ID: design-search · proposed · P0

Search internal record metadata only within current permissions; support tasks, projects, people allowed to the viewer, resources, decisions, and capability records advertised in the UI. Show record type, context, and next action. No provider full-text indexing or plaintext passwords in v1. A stale result rechecks access before detail opens. Keyboard and mobile have equivalent routes.

**Acceptance:** 1. Search fixtures include task/project/resource and protected HR/finance fields;0 unauthorized matches/counts appear.
2. Revoke1 membership while a result is open: subsequent detail/read/write rechecks permission and exposes0 formerly allowed content.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** work_search


##### Phone use and real touch interactions

ID: design-mobile · proposed · P0

Support 360px and 390px phones, 768px tablet, 1024px compact desktop, and 1440px desktop. Mobile shows title and next action before decorative summaries; metadata moves to a second line. Use 44px effective touch targets, safe-area spacing, keyboard-safe forms, and accessible non-hover actions. The page owns scrolling; a sticky date capsule never covers work or focused input.

**Acceptance:** 1. At320/390px, ordinary form/page scroll width equals available viewport width;0 essential actions are clipped.
2. Complete at least1 Android and1 iOS real-device task/resource/review journey before product acceptance.
3. Primary touch targets≥44×44px under adopted measure-targets.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** design-navigation


##### Accessibility as core behavior

ID: design-accessibility · proposed · P0

Target WCAG 2.2 AA as a proposed design/testing goal, not a certified claim. Use semantic controls, persistent visible focus, proper dialogs/labels, contrast checking, descriptive errors, and status text independent of color. Charts offer readable record/value lists. Respect reduced motion and optional solid surfaces. Priority workflows remain usable by keyboard and at 200% zoom.

**Acceptance:** 1. Core keyboard journeys have0 inaccessible actions or invisible focus states.
2. Apply WCAG2.2AA target/contrast/reflow tests in measure-targets,measure-contrast andmeasure-focus-zoom.
3. Automated/manual findings list expected/observed evidence;0 certification claims are inferred from a test score.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


##### Preferences follow the person

ID: design-preferences · proposed · P0

Theme, language, notification preference, chosen view, and sensible page context persist per user. Default theme follows system until chosen. Presentation changes do not alter shared data. Store draft/context locally with privacy and logout clearing rules; don't expose previous member's notes on a shared laptop. Explicit logout ends session and clears sensitive cached data.

**Acceptance:** 1. Change language/theme/time preference once; it applies to all permitted screens for that user and does not alter another fixture user.
2. Logout/shared-device fixture retains0 private record caches under the adopted device policy.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** work_settings


##### Design proof before implementation acceptance

ID: design-ui-review · proposed · P0

Before coding a large screen set, map reusable shell, rows, forms, inspector, picker, chart, empty/error states, and core division-specific working views to the PRD. Review representative long/empty/dense/error states and both themes/languages. Production implementation follows the chosen requirements rather than improvising disconnected screen features.

**Acceptance:** 1. Review5 widths ×2 languages ×2 themes=20 configurations for representative core screens and6 minimum division journeys.
2. 0 unresolved essential layout/focus/action defects remain; record source IDs and measured exceptions.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** design-density
design-typography
design-languages
design-accessibility


##### Resource identity, scheduling depth, and discovery

ID: experience-advanced · proposed · P1

Keep advanced ideas in the PRD with specific behavior and a scope decision. Detailed maps must include them even when expensive implementation is deferred. An omitted idea should not reappear later as a surprise architectural change.

**Acceptance:** 1. Each advanced proposal states benefit, cost/performance/privacy boundary, fallback and first-version status.

**Owner:** Design + product

**Source / assumption:** Critique App Development brainstorming


###### Resource type and optional optical identity

ID: design-resource-identity · proposed · P2

Resource icon/provider labels distinguish note, folder, file, spreadsheet, app, and URL. Optional identity treatments discussed: project optical/liquid; folder material subtype; note quiet paper; spreadsheet grid; design app prism; storage layered; generic link swirl. These are brainstorming, not final assets or approved GPU requirement. Default compact rows remain readable with simple icons; optional tile view can carry identity.

**Acceptance:** 1. Members identify resource type with effects disabled; illustrative material never overrides filename/provider/assignee information.

**Owner:** Design owner

**Source / assumption:** Critique App Development assistant material taxonomy, not direct confirmation

**Dependencies:** resource_types
resource_link_validation


###### WebGL identity is a later tested enhancement

ID: design-shaders · deferred · P2

Record the WebGL/shader concept so it is not lost. Actual realtime effects are deferred for the budget-limited first release unless a lightweight prototype proves cost, battery, rendering and accessibility fit within the Rp35,000 monthly target/Rp50,000 ceiling. Static pre-rendered identity art is a candidate fallback. No effect on text/records, no required network paid API, no always-running animation in background tabs.

**Acceptance:** 1. Optional enhancement must pass no-WebGL, reduced-motion, low-power/mobile and resource-failure tests before enablement.

**Owner:** Design + engineering

**Source / assumption:** Critique shader ideas; current Rp35,000 target / Rp50,000 ceiling

**Dependencies:** measure-motion
quality-performance


###### Depth without more main tabs

ID: design-discoverability · proposed · P1

Expose advanced actions through contextual inspectors, explicit view controls, and meaningful resource rows rather than multiplying navigation. Keep essential create/save/back visible. Right-click and avatar details accelerate use but don't hide the only route. Discovery hints are short, dismissible, and not repeated on every visit.

**Acceptance:** 1. A first-time member completes resource delegation and task creation using visible actions; experienced member uses shortcuts.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** design-navigation
resource_inspector


###### Availability based on explicit evidence

ID: design-availability-evidence · proposed · P1

Availability can use voluntarily declared hours/unavailability, actual meetings, planned allocations and agreed capacity. No inferred green 'free now' from online presence or lack of tasks. Avoid labeling a date-only task as occupying all day. Show source/last update and unknown state. Personal availability details visible only under agreed scope.

**Acceptance:** 1. Member with no declared hours shows unknown; known meeting conflict is shown without exposing private meeting title.

**Owner:** HR + product

**Source / assumption:** Critique availability discussion; source F/J scheduling suggestions

**Dependencies:** availability_declared
availability_overlap


###### Assignment conflict as warning, not automatic judgment

ID: design-availability-assignment · proposed · P1

When selecting assignee or meeting time, show known conflicts and workload basis without inventing working hours. Default assignment is allowed unless an adopted hard constraint says otherwise; warning can be acknowledged with reason where required. Alternative assignee/time suggestions use known scope/data. Capacity measurement is proposed, not an HR performance ranking.

**Acceptance:** 1. Assign work with known conflict/unknown availability; UI explains basis and retains owner/date draft.

**Owner:** Product + HR

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** availability_capacity
availability_override


###### Timeline edits keep dates and dependencies coherent

ID: design-timeline-interactions · proposed · P1

Dragging or keyboard moving changes the same task dates shown elsewhere after validation. Dependencies reject cycles/self-links and communicate predecessor/blocked state. Moving one task never silently reschedules unrelated tasks. Optional downstream-date preview shows exact affected work and requires a committed action. Milestones have clear date/linked-task criteria, not percent bars with no source.

**Acceptance:** 1. Move a predecessor with downstream work, attempt a cycle, fail a save, and Undo; dates/links remain consistent.

**Owner:** Engineering + consulting

**Source / assumption:** Critique Work/timeline proposals

**Dependencies:** timeline_date_validation
timeline_accessible


###### V1 notes without a collaborative editor platform

ID: design-collaboration-editing · proposed · P1

Small native notes support agreed lightweight formatting and links, versioned save/conflict behavior, creator/last editor and permitted comment/review. Rich simultaneous cursors, full Docs clone, version diff editor and offline CRDT are deferred. Link Google Docs for intensive collaborative writing. Don't discard a note when two people save changes.

**Acceptance:** 1. Concurrent fixture edits receive recoverable version conflict; exported native note preserves its content.

**Owner:** Product + engineering

**Source / assumption:** Minimal tool/cost proposal

**Dependencies:** resource_notes
work_concurrent_updates


##### Measured UI specification — units, tolerances and test matrix

ID: design-measures · proposed · P0

Proposed implementation targets for DWDG’ONE product screens, distinct from the planning editor's host styles. Measure in CSS px at 100% browser zoom with loaded fonts, then separately test reflow/zoom/accessibility. Base values inherit the preserved Experience v1.1 tokens; new component values are proposals. A numeric target is an acceptance condition, not a claim that the current app already meets it. Accessibility expansion takes precedence over exact row geometry. Record any deliberate exception with component, reason and replacement value.

**Acceptance:** 1. Measure all listed values at 320, 390, 768, 1024 and 1440 CSS px viewport widths.
2. Ordinary fixed spacing/dimensions differ by at most 1 CSS px from adopted tokens at 100% zoom; content-driven dimensions and safe-area insets are excluded from this tolerance.
3. Review EN/ID × light/dark = 4 combinations at each width; 0 clipped essential actions or overlapping text.
4. At 200% text zoom and 400% browser zoom, content reflows without loss of core work actions; necessary two-dimensional work views have an equivalent readable list.

**Owner:** Design + frontend + QA

**Source / assumption:** User asks exact padding, text sizes, gaps and measurable criteria, 3 Oct 2026. Preserved Experience v1.1 design-tokens.json; new component targets proposed.

**Dependencies:** design-reference
design-languages
design-accessibility


###### Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 px

ID: measure-spacing · proposed · P1

Use the inherited spacing scale for padding, margins and gaps. Component authors choose named semantic tokens instead of accumulating arbitrary 17 px/23 px offsets. A 4 px micro gap joins icon/text metadata, 8 px groups closely related actions, 12 px separates row subparts, 16 px is phone content padding, 24 px is panel/grid spacing and 32 px is desktop page padding. Exact use is defined by component nodes rather than one universal gap.

**Acceptance:** 1. All new shared component spacing resolves to one of the 10 adopted scale values except documented optical/safe-area exceptions.
2. At each supported width, 0 adjacent action groups overlap.
3. Computed layout samples match adopted token values within 1 CSS px.

**Owner:** Design system owner

**Source / assumption:** Experience v1.1 design-tokens.json space array; DWDG-specific proposal, not an SAP numeric mandate.

**Dependencies:** design-reference


###### Responsive ranges and content padding

ID: measure-breakpoints · proposed · P0

Propose S < 600 px, M 600–1023 px, L 1024–1439 px and XL ≥ 1440 px, informed by Fiori responsive grouping. DWDG content horizontal padding: 16 px S, 24 px M, 32 px L/XL. Reading/panel padding: 16 px S, 24 px M/L/XL. A grid uses 24 px gap when multiple columns fit and 16 px for stacked phone groups. Breakpoints respond to content and input modality; a large touch tablet still gets touch targets. Do not hide create/review/export actions solely because the screen is small.

**Acceptance:** 1. At 599 → 600 px padding changes 16 → 24 px; at 1023 → 1024 px it changes 24 → 32 px; at 1439 → 1440 px it remains 32 px, with 0 duplicated shells.
2. At 320 px, page scroll width equals available viewport width for ordinary forms/lists.
3. Each breakpoint retains 100% of essential task/resource/review actions through visible controls or a labeled More route.

**Owner:** Design + frontend

**Source / assumption:** Local v1.1 page/panel tokens; SAP responsive grouping verified 3 Oct 2026 https://www.sap.com/design-system/fiori-design-web/v1-108/page-types/page-layouts/spacing . DWDG values are a proposal.

**Dependencies:** measure-spacing
design-mobile


###### Desktop type: page 24/32, section 18/24, body 14/20, meta 12/16

ID: measure-type-desktop · proposed · P1

Adopt local Pretendard/system fallback. At normal zoom: page title 24 px size/32 px line height, weight 600; section title 18/24 weight 600; body 14/20 weight 400; label 14/20 weight 550 or closest available approved weight; metadata 12/16 weight 400. Minimum operational product text 12 px. Normal labels do not become huge display typography. Use tabular figures for aligned dates/counts/IDR; proportional text for prose. Long labels wrap rather than shrink below their token.

**Acceptance:** 1. Computed font sizes/line heights equal 24/32, 18/24, 14/20 and 12/16 at 100% zoom in 5 sampled core screens.
2. No operational product text uses a size below 12 px.
3. A missing font falls back without 0-width labels, overlapping controls or lost task titles.
4. IDR columns align decimal-free integer digits across 10 fixture rows.

**Owner:** Design + frontend

**Source / assumption:** Experience v1.1 font tokens, retained as proposed restart baseline.

**Dependencies:** design-typography
measure-spacing


###### Phone type: body 15/22, title 28/34, editable text 16/24

ID: measure-type-mobile · proposed · P1

Carry forward mobile reading body 15/22 and page title 28/34 as proposals, with section 18/24 and metadata 12/16. Editable text inputs/textarea on phones use at least 16 px font/24 px line height to maintain readable editing; this is a deliberate editing exception to body 15. Continuous note/minutes prose uses the explicit 16/24 px reading exception (1.5 line-height); compact non-prose body remains 15/22 px. Larger text settings may increase row heights. Avoid reflowing a title into a clipped fixed-height toolbar.

**Acceptance:** 1. Compact non-prose body computes 15/22 px; continuous notes and editable text use at least 16/24 px at 320 and 390 px widths.
2. A 100-character project title wraps with 0 clipped characters in title/detail contexts.
3. Opening the on-screen keyboard preserves the active field and a reachable Save/Cancel route; verify on at least 1 real Android and 1 real iOS device before product launch.

**Owner:** Design + frontend

**Source / assumption:** Local v1.1 mobile type; 16px editing exception and continuous-text rhythm are proposed usability values.

**Dependencies:** measure-type-desktop
measure-breakpoints
design-mobile


###### Desktop shell: sidebar 216 px, toolbar 56 px, navigation rows 40 px

ID: measure-shell · proposed · P1

At L/XL use one 216 px sidebar and 56 px top toolbar. Sidebar internal padding 12 px, navigation row minimum 40 px, icon 20 px, icon-to-label gap 12 px. Navigation active state fills the row without moving its geometry. At M/S expose the same navigation through a drawer; proposed width 320 px capped at viewport minus 32 px. Rows expand for wrapped labels or increased text sizes. Organization/workspace identity remains distinct from a route title.

**Acceptance:** 1. At 1440 px, sidebar width 216 ± 1 px and toolbar height 56 ± 1 px at normal text scale.
2. At 320 px, drawer width ≤ 288 px and all navigation actions remain keyboard/touch accessible.
3. Switching among 6 division contexts produces exactly 1 persistent shell and 0 duplicate workspace selectors.

**Owner:** Design + frontend

**Source / assumption:** Experience v1.1 layout216/56/40/20; drawer limits and internal spacing proposed.

**Dependencies:** design-shell
measure-breakpoints
measure-type-desktop


###### Workspace switcher and project tabs

ID: measure-navigation · proposed · P0

Workspace switcher control minimum 40 px desktop/44 px touch height; options show one workspace identity each and only permitted scope. Search field height 40 px/44 px with 8 px list separation. Project tab row uses 12 px horizontal inter-tab gap and 8 px underline/content offset; main tabs remain Overview / Work / Resources. At 320 px, labels remain visible by wrapping/reflow, not reduced text. A one-workspace member gets clear identity with no meaningless multi-option menu.

**Acceptance:** 1. Every project exposes exactly 3 primary tabs.
2. Fixture member with 1 allowed workspace sees 0 unauthorized options; scoped VP options equal assigned descendants exactly.
3. All three tab labels remain readable at 320 px and 200% text zoom.
4. Switcher and tab controls meet measure-targets sizing.

**Owner:** Design + authorization + frontend

**Source / assumption:** Local40px control/44px touch tokens; exact gap proposals and confirmed one-Workspace terminology.

**Dependencies:** design-navigation
access_surface_scope
measure-targets


###### Controls 40 px; touch targets 44 × 44 px; accessibility minimum 24 × 24 px

ID: measure-targets · proposed · P0

DWDG proposes 40 px ordinary desktop input/button height, with primary phone controls and touch hit regions at least 44 × 44 CSS px. Visible 20 px icons can have larger transparent targets. Distinct touch hit regions do not overlap. WCAG 2.2 AA's pointer target minimum is 24 × 24 px with specified exceptions/spacing rules; DWDG 44 px touch preference is stronger, not a claim that WCAG AA always requires 44 px. Never use dense desktop styling to shrink touch editing targets. Compact desktop menu rows are an explicit component exception at 32 px minimum; ordinary form controls remain 40 px. Both retain the 44 px touch policy.

**Acceptance:** 1. Sample every interactive shared component; ordinary desktop form/button controls height ≥ 40 px (compact menu-item exception ≥ 32 px) and primary touch target bounds ≥ 44 × 44 px unless a recorded justified equivalent applies.
2. All other pointer targets meet 24 × 24 px or a documented WCAG exception.
3. At least 8 px separation between separate touch action buttons. Contiguous menu/navigation rows may meet edge-to-edge at 44 px pitch, with 0 overlapping hit regions; destructive dialogs retain separated action targets.

**Owner:** Design + accessibility QA

**Source / assumption:** Local40/44/20 tokens. Primary sources checked3Oct2026: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html ; Fiori content-density approach https://www.sap.com/design-system/fiori-design-web/v1-84/foundations/visual/cozy-compact .

**Dependencies:** design-accessibility
measure-spacing


###### Icons 20 px; responsibility avatars 24 px desktop /28 px phone

ID: measure-icons-avatars · proposed · P1

Operational icons use 20 px visual size and inherited 1.8 px stroke where the asset supports it. Proposed resource assignee avatars 24 px desktop/28 px phone with 4 px visual group gap; person profile/inspector avatar 40 px. Every actionable avatar uses a separate 44 px minimum touch target and readable accessible name; do not rely on overlapping interactive bubbles. For many people show 3 avatars then a +N labeled control with the full list; total count comes from permitted membership only.

**Acceptance:** 1. A resource with 5 contributors shows 3 identifiable avatars and +2, with all 5 accessible in the list.
2. Missing photos use initials for 100% of fixture people.
3. Actionable avatar touch targets satisfy 44 × 44 px without overlap; 0 hidden-member counts leak.

**Owner:** Design + frontend

**Source / assumption:** Local20px/1.8px icon tokens; avatar geometry and3-visible rule proposed for DWDG resources.

**Dependencies:** resource_bubbles
measure-targets


###### Projects: 76 px grouped rows, 12 px row inset, honest expansion

ID: measure-project-row · proposed · P1

Default desktop Projects view uses 76 px minimum grouped rows, with 12 px vertical row padding, 16 px horizontal inset and 12 px internal column/content gap. Title/body 14/20, meta 12/16. A summary targets about 200 px total height; first ordinary row starts no lower than 450 px from viewport top at 1440 × 900. At least 4 ordinary rows are visible there. Long titles, validation notices and text zoom expand rows; numbers are compact-baseline targets, not a fixed crop constraint. Grid/Timeline reuse identical project IDs.

**Acceptance:** 1. At 1440 × 900 normal zoom, first ordinary row top ≤ 450 px and ≥ 4 complete 76 px rows visible.
2. A 100-character title can be recovered through wrapping/detail without 0-information ellipsis.
3. The same 20-project fixture yields 20 unique IDs in List/Grid/Timeline; 0 duplicated records on view change.

**Owner:** Design + frontend

**Source / assumption:** Experience v1.1 project76px/summary200px/firstrow450px/fourrows; insets and gaps proposed.

**Dependencies:** work_projects_register
measure-type-desktop
measure-spacing


###### Work list: 48 px minimum desktop rows; touch actions 44 px

ID: measure-task-row · proposed · P1

Proposed ordinary task list row minimum 48 px desktop and 64 px phone when title/context occupy 2 lines; row horizontal inset 12 px desktop/16 px phone, 8 px icon/title gap and 12 px metadata gap. Task checkbox visual 20 px has 44 px touch target. Inline edit transitions do not move unrelated rows or lose selected draft. Due/status labels remain localized while user task text stays original.

**Acceptance:** 1. On a 30-task fixture, all 30 canonical IDs remain stored after filter/view switches; each rendered count equals the permitted matching subset.
2. Ordinary compact rows are at least 48 px desktop; touch hit regions meet 44 px.
3. Edit/error/Undo retains the selected task ID and draft in 10 consecutive fixture operations, with 0 silent record loss.

**Owner:** Design + frontend

**Source / assumption:** DWDG compact task reference direction; component dimensions proposed, not already measured implementation.

**Dependencies:** work_work_views
work_forms
measure-targets


###### Board: 280 px lanes, 12 px card gaps, 16 px card padding

ID: measure-board · proposed · P1

Proposed board lane width 280 px, inter-lane gap 16 px, card padding 16 px and between-card gap 12 px. Lanes retain status labels/counts; counts reconcile with the canonical task filter. On a phone, horizontally scroll only the board work area and keep a List alternative. Drag is an accelerator; Move to status provides non-drag pointer/keyboard control. Large titles wrap; cards do not truncate essential ownership or due warnings.

**Acceptance:** 1. Lane width 280 ± 1 px at normal zoom where space permits; gaps 16/12 px as adopted.
2. Moving 1 of 30 tasks changes exactly 1 task status and reconciles both lane counts.
3. The same move succeeds by keyboard/non-drag control; 0 task actions require dragging.

**Owner:** Design + frontend

**Source / assumption:** DWDG work-board proposal and accessible drag alternative. Dimensions are design targets.

**Dependencies:** work_work_views
measure-task-row
design-accessibility


###### Timeline: 48 px lanes, 24 px minimum day cells, 8 px bar inset

ID: measure-timeline · proposed · P1

Proposed work timeline lanes minimum 48 px, day-column minimum 24 px in short-range view, bar vertical inset 8 px and milestone visual 12 px. Longer ranges can aggregate labeled calendar columns rather than pretending individual days fit. Label column starts at 240 px desktop and can collapse with a permitted title inspector on phone. Timeline has real 2D scroll inside its work region; an equivalent date/list editor is always available. Do not shrink task text to fit a year-long picture.

**Acceptance:** 1. All 6 required ranges (7D/2W/1M/3M/6M/1Y) retain the same fixture task IDs.
2. At normal zoom lane height ≥ 48 px and bar hit regions satisfy pointer/touch policy.
3. A 7-day move changes planned dates by exactly 7 calendar days in Asia/Jakarta, with 0 fabricated actual completion dates.
4. Invalid/restricted changes leave 100% of original fixture values unchanged.

**Owner:** Design + frontend

**Source / assumption:** Timeline ranges/unscheduled behavior retained; geometry proposed for restart.

**Dependencies:** timeline_ranges
timeline_date_validation
timeline_accessible
measure-targets


###### Resources: 52 px rows, 20 px type icon, 12 px metadata gap

ID: measure-resource-row · proposed · P1

Proposed explorer row minimum 52 px desktop/64 px phone, 16 px horizontal inset, 20 px type icon and 12 px separation between title and ownership/actions. Pinned section uses the same resource IDs and can wrap into available columns with 16 px gap. Internal folders/notes and provider links have distinct text labels/icons; no fake provider contents. Row context menu and visible More route expose the same inspector/actions.

**Acceptance:** 1. A fixture of 2 folders, 2 notes and 2 provider links renders 6 unique resource IDs with correct kinds.
2. Desktop row minimum 52 px; phone actions meet 44 px targets and 0 row overlap at 320 px.
3. Right-click, More and keyboard routes open the same selected record ID and authorized action set in all 6 cases.

**Owner:** Design + frontend

**Source / assumption:** Critique resource explorer requirements; geometry proposed, shared local icon/spacing scale.

**Dependencies:** resource_explorer
resource_types
resource_inspector
measure-icons-avatars


###### Inspector: 360 px preferred width; 24/16 px padding; 12 px field gaps

ID: measure-inspector · proposed · P1

At ≥ 1024 px propose 360 px desktop right inspector, capped to avoid hiding essential work; allow explicit resize if adopted. Internal padding 24 px and section gaps 24 px, related-field gaps 12 px. At smaller screens use one full-width detail route with 16 px padding, clear Back and preserved origin position. Header actions use 44 px touch targets. Display creator/owner, responsibility, note, linked tasks and allowed actions without another persistent secondary navigation stack.

**Acceptance:** 1. At 1440 px, preferred inspector width 360 ± 1 px and 24 px content inset.
2. At 390 px, detail width ≤ available viewport width, 16 px inset and 0 inaccessible footer actions when keyboard opens.
3. After 10 open/close cycles, selected ID, origin scroll and active draft return unchanged unless the user committed an operation.

**Owner:** Design + frontend

**Source / assumption:** Critique contextual inspector/accessible alternatives; width/gaps proposed; local panel padding24/16 retained.

**Dependencies:** design-inspector
measure-breakpoints
measure-targets


###### Forms: 8 px label gap, 16 px field gap, 24 px section gap

ID: measure-forms · proposed · P0

Propose persistent labels 8 px above controls, 16 px vertical separation between independent fields and 24 px between sections. Ordinary controls 40 px desktop/44 px phone. Error/help text sits 8 px below the affected control and uses minimum 12 px readable type. Desktop fields can form 2 columns with 24 px gutter only when labels/values fit; phone forms have 1 column. Required/invalid is conveyed by text/semantics, not color alone. Content caps are separately adopted domain limits, not guesses hidden in design.

**Acceptance:** 1. Measure label 8 px, field 16 px and section 24 px spacing within 1 px on create task/project/request forms.
2. All 3 forms become 1 column at 320/390 px with 0 horizontal page overflow.
3. Submit each with 3 invalid fields: 3 attached errors, 1 clear summary, 0 saved invalid records and 100% retained user-entered values.

**Owner:** Design + frontend

**Source / assumption:** Shared local control/spacing/type tokens; explicit field-layout proposal.

**Dependencies:** work_forms
measure-targets
measure-type-mobile


###### Dialogs: 480 px preferred width; 24 px inset; safe viewport margins

ID: measure-dialogs · proposed · P0

Proposed simple confirmation dialog preferred 480 px width, capped at viewport minus 32 px on phones; complex task/project forms can use 640 px width if needed. Content padding 24 px desktop/16 px phone, title/body gap 12 px, action-group gap 8 px and 24 px separation above footer. Height respects visible viewport/keyboard with a reachable scroll region and footer. Delete preview names record, child count and recoverability; destructive action is never default focus merely for speed.

**Acceptance:** 1. At 320 px, dialog width ≤ 288 px; at 1440 px simple dialog target 480 px.
2. Tab/Shift+Tab stays within 1 modal; Escape returns to the live opener in 10 fixture dialogs.
3. Deleting a 3-record subtree shows 3 affected records before commit and Undo restores all 3 where domain policy permits.
4. No destructive record action completes before its adopted concrete confirmation.

**Owner:** Design + frontend

**Source / assumption:** DWDG overlay/draft contract; dialog measurements proposed.

**Dependencies:** design-overlays
engineering-record-removal
measure-forms


###### Menus: 8 px anchor gap; 32 px desktop /44 px touch item targets

ID: measure-popovers · proposed · P1

Menus/popovers anchor 8 px from their trigger and flip/shift to remain in a viewport inset of 8 px. Proposed minimum menu item height 32 px desktop/44 px touch; horizontal padding 12 px, icon 20 px and icon/label gap 8 px. Content can expand beyond these minima for localization/zoom. Place the menu near its actual action, not at a fixed screen center. Escape closes the top overlay and restores the opener without losing its draft.

**Acceptance:** 1. Test 4 viewport corners at 320/390/1440 px: menu bounds remain ≥ 8 px inside the visible viewport where space permits.
2. Gap from chosen anchor edge is 8 ± 1 px after collision handling.
3. All menu actions meet 24 px minimum pointer policy and 44 px touch target policy, with 0 covered essential menu items.

**Owner:** Design + frontend

**Source / assumption:** Local popoverGap8 and icon20; item heights/insets proposed within pointer policy.

**Dependencies:** design-overlays
measure-targets
measure-spacing


###### Notes: 16 px reading text, 24 px line height, 72-character measure

ID: measure-notes · proposed · P1

Propose notes/minutes reading body 16 px with 24 px line-height and maximum readable width 72 chwhere desktop space allows; phone fills available width with 16 px page inset. Paragraph separation 16 px, list-item separation 8 px. Native note editor shows unsaved/saving/saved/failed state near its title. State indicators are textual and reflect confirmed persistence. No simultaneous multi-author rich-editor claim in v1.

**Acceptance:** 1. A 1,000-word test note reads at 16/24 px with 0 clipped paragraphs in 2 themes.
2. At 1440 px, normal prose reading width ≤ 72 ch; at 320 px, note width ≤ available page width.
3. Inject 1 failed save: user text remains intact, failure is visible, and no Saved label appears before acknowledgement.

**Owner:** Design + frontend

**Source / assumption:** Native note requirement and DWDG reading-surface proposal; exact dimensions are not a vendor rule.

**Dependencies:** resource_notes
design-collaboration-editing
measure-type-mobile


###### Charts: 24 px panel inset, 44 px selection targets, readable alternatives

ID: measure-charts · proposed · P1

Charts derive values from saved permitted records. Proposed content padding 24 px desktop/16 px phone, title-to-plot 16 px, legend gap 8 px, axis/readout type 12/16. Keep selected-day/source-list relationship explicit. Retain local progress-track 6 px and rounded-bar 8 px visual radius where meaningful; thin neutral chart structure does not replace data labels. A chart area can be content-responsive; missing history shows unavailable rather than decorative fabricated bars.

**Acceptance:** 1. A known 10-record fixture reconciles chart/readable list totals exactly, with 0 unauthorized or undated fabricated observations.
2. Selected marks have 44 px touch route or equivalent accessible list control; text ≥ 12 px.
3. At 320 px no tick labels overlap; optional ticks reduce rather than text shrinking.
4. Selection of 1 date updates 1 shared date/readout/source-list context.

**Owner:** Design + frontend + data owner

**Source / assumption:** Local chart6px/8px/44px tokens; layout proposal and truthful analytics contracts.

**Dependencies:** analytics_selection
analytics_completion
measure-targets


###### Changes rows: 64 px minimum; 8 px diff spacing; 50-event page

ID: measure-changes · proposed · P1

Product workspace Changes uses a chronological readable list. Proposed ordinary row minimum 64 px, 16 px horizontal inset, 8 px actor/action/time gaps and 12 px detail-section gaps. Long diff values wrap in before/after columns on desktop and stack on phone with explicit labels. Default 50-event server page is a product API efficiency choice; it does not constrain the planning editor's requested All nodes view. Counts/search/exports use current authorized workspace only.

**Acceptance:** 1. In 100 fixture events, a 50-event page and its next cursor return 100 unique event IDs with 0 skips/duplicates.
2. On 320 px, 2 diff columns become 1 stacked sequence and 0 values escape page width.
3. Ordinary actor/action/time text is ≥ 12 px; 0 restricted event counts or values leak to a member fixture.

**Owner:** Design + frontend + authorization

**Source / assumption:** Required workspace Changes; component geometry proposed. API page target harmonized with operations consultation.

**Dependencies:** changes-filters
changes-details
changes-sensitive
measure-type-mobile


###### Radii 12 /20 /28 px; opaque operational surfaces

ID: measure-radius-surfaces · proposed · P1

Use inherited control 12 px, panel 20 px, feature 28 px and pill 999 px radii where the component truly has that surface. Tables/list groupings remain quiet and do not become stacks of decorative bordered cards. Main text/notes use opaque semantic surfaces. Glass is limited to approved floating controls/menus; proposed inherited blur 22 px/saturation 1.2 has an opaque fallback. A rounded container does not reduce clickable target bounds.

**Acceptance:** 1. Shared samples match 12/20/28 px adopted radius within 1 px; pill geometry remains fully rounded.
2. Disabling transparency yields opaque readable surfaces in 100% of overlay variants.
3. Long notes/tables have 0 mandatory translucent reading layers and 0 decoration-only repeated card wrappers.

**Owner:** Design + frontend

**Source / assumption:** Experience v1.1 radius/material tokens; preserve restrained reference direction.

**Dependencies:** design-materials
measure-targets


###### Contrast: normal text ≥ 4.5:1; qualifying large text ≥ 3:1

ID: measure-contrast · proposed · P0

Use semantic light/dark colors, measuring actual composite backgrounds including glass fallback. Normal text must reach 4.5:1; qualifying large text 3:1 per WCAG 2.2 minimum contrast, with applicable exceptions distinguished. Functional non-text boundaries/focus/meaningful marks use appropriate 3:1 contrast. Do not round a failing 4.499 ratio up to 4.5. The supplied palette is a candidate, not automatically compliant in every text/background pairing.

**Acceptance:** 1. Test every adopted normal-text pairing in light/dark: minimum 4.5:1 with 0 rounding exceptions.
2. Qualifying large text has ≥ 3:1; meaningful non-text indicators meet their applicable 3:1 rule.
3. All error/status meanings have readable text or shape in addition to color; 0 color-only task/finance states.

**Owner:** Accessibility QA + design

**Source / assumption:** Primary W3C source checked3Oct2026 https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html ; DWDG semantic palette remains proposed.

**Dependencies:** design-materials
design-accessibility


###### Focus 2 px; zoom 200/400%; user text-spacing overrides

ID: measure-focus-zoom · proposed · P0

Proposed visible focus outline 2 px with 2 px offset where layout permits, not removed or clipped behind sticky controls. At 200% text resizing and 400% browser zoom, ordinary pages reflow; work charts/boards may retain justified 2D work-area scrolling with an equivalent list. Test user overrides line height 1.5 × , paragraph gap 2 × font size, letter spacing 0.12 × , word spacing 0.16 × without loss. These are WCAG text-spacing override test values, not a demand that default compact type always uses them.

**Acceptance:** 1. Traverse at least 6 core journeys by keyboard: 0 invisible/offscreen focus stops or inaccessible primary actions.
2. All 4 override values apply simultaneously with 0 lost text/actions on ordinary forms/lists/notes.
3. At 200% text and 400% zoom, no essential control is covered by shell/dock; focus indicator remains visible and not clipped.

**Owner:** Accessibility QA + frontend

**Source / assumption:** Primary sources checked3Oct2026 https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html ; focus geometry is DWDG proposal.

**Dependencies:** design-accessibility
measure-contrast
measure-breakpoints


###### Motion 120/140/180/200/220/240/300 ms; reduced motion ≤ 100 ms

ID: measure-motion · proposed · P1

Retain proposed local timings: press 120 ms, hover 140 ms, route 180 ms, popover 200 ms, completion dissolve 220 ms, chart 240 ms, inspector 300 ms. Data/persistence success does not wait for animation and animation does not imply saved state. Reduced-motion setting uses immediate changes or ≤ 100 ms subtle opacity only, with 0 panning/scaling/blur-heavy transition. Do not animate every page item on entry, loop decoration in the background, or delay required input behind motion.

**Acceptance:** 1. Computed durations match adopted 120/140/180/200/220/240/300 ms tokens within 1 ms for each shared state.
2. With reduced motion, 0 spatial/blur animations and 0 continuously running decorative animations occur.
3. Data acknowledgement/error state appears independently of the animation completion in 10 simulated saves.

**Owner:** Design + frontend

**Source / assumption:** Experience v1.1 motion tokens; ≤100ms reduced-motion quantitative proposal.

**Dependencies:** design-motion
design-actions


###### Phone dock 64 px plus safe area; content clearance 16 px

ID: measure-mobile-dock · proposed · P1

Propose a short 64 px mobile dock plus actual platform safe-area inset, with 44 px hit regions and explicit More. Main content reserves dock height + safe area + 16 px bottom clearance. A phone keyboard must not trap the save action behind the dock; adapt editing layout to visible viewport. Core divisions/resources/actions remain reachable through the same navigation model, not a separate minimal mobile product with removed functionality.

**Acceptance:** 1. At 320/390 px, all essential navigation targets ≥ 44 px and 0 dock items overlap.
2. Last form field/action is reachable with at least 16 px clearance above dock/keyboard or through the adopted editing layout.
3. On at least 2 real phone platforms, task edit and legal/finance request flows complete without hidden Save/Cancel.

**Owner:** Design + frontend

**Source / assumption:** Mobile navigation proposal for DWDG; safe-area actual value is device dependent, not a fixed invented inset.

**Dependencies:** design-mobile
measure-targets
measure-breakpoints


###### Loading/error/empty states preserve geometry and drafts

ID: measure-state-layout · proposed · P0

Propose skeleton/placeholder blocks using the actual row/control dimensions and 16 px explanatory/action gaps. State copy names the missing data or failed action and the next permitted recovery step. No fictional chart fills an empty screen. Loaded records can expand for real text; loading should not collapse the navigation shell or replace a typed form. Delayed/failing operations distinguish retryable errors from access denial and conflict.

**Acceptance:** 1. For each of 5 states (empty/loading/denied/offline/failed), test Home, Work, Resources and a request form: 20 cases with 0 invented records and 0 lost typed drafts.
2. A disabled action has 1 visible explanation/recovery route where applicable.
3. Loading → loaded does not move the shell/sidebar dimensions and preserves the selected record ID.

**Owner:** Design + frontend

**Source / assumption:** Existing honest empty/error contracts; numerical test fixture proposed.

**Dependencies:** design-empty
engineering-errors
work_forms
measure-spacing


###### Design handoff: component dimensions, states and measured evidence

ID: measure-design-handoff · proposed · P0

Each adopted shared component has one named token contract, anatomical diagram/annotation, EN/ID copy keys, light/dark states, normal/focus/error/disabled/loading examples and interaction/recovery rules. The future build references these requirement IDs. Numeric layout inspection is paired with observed task completion; passing pixels alone does not prove permission or workflow correctness. Capture actual settled screenshots and computed bounds without treating design proposals as executed QA.

**Acceptance:** 1. Handoff covers 100% of adopted shared controls and 6 division minimum journeys.
2. Measure 5 widths × 2 languages × 2 themes = 20 configurations for core representative screens, with documented justified work-area scroll exceptions.
3. Release has 0 unresolved P0/P1 defects in promised essential scope; remaining P2 exceptions list owner and user impact.

**Owner:** Design + frontend + QA

**Source / assumption:** User requests SWE/ERP-quality PRD precision; proposed evidence contract.

**Dependencies:** design-ui-review
measure-state-layout
measure-focus-zoom
quality-defects


#### External services and strict integration boundaries

ID: integrations · proposed · P0

First-version default is link-first integration, minimizing cost and credential risk. External apps remain useful and recognizable Resources. Native record coordination belongs in DWDG’ONE; collaborative document editing, publishing, accounting, signatures, and passwords stay with tools designed for them unless a later approved integration has a complete contract.

**Acceptance:** 1. The UI describes exactly which action the app performs and which action opens an external provider.

**Owner:** Product + engineering

**Source / assumption:** Critique Resources as apps/files/notes/links; user Rp35,000 target / Rp50,000 ceiling


##### Generic URLs and supported app links

ID: integration-links · proposed · P0

Support https URLs and recognized Docs/Sheets/Drive/Canva/Figma/GitHub/Forms links with title, provider/type, owner, description, source context, and last reviewed date. Validate protocols; reject javascript/data/file URLs and embedded credentials. Do not fetch arbitrary URLs server-side by default. User-provided link title is not proof that the URL is safe/accessible.

**Acceptance:** 1. Test HTTPS,missing URL,malformed URL,javascript:,data: andfile: fixtures;0 unsafe URL executions.
2. For valid links, app metadata records1 owner/custodian and never claims to have granted provider access.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** resource_link_validation
security_web


##### Provider permission and app permission differ

ID: integration-provider-access · proposed · P0

DWDG resource visibility controls native notes, folders and link metadata. If native binary uploads are later adopted, their private access also follows DWDG authorization. Google/Canva/Figma/GitHub permission remains controlled by provider accounts. Assigning a person to a file or folder does not share the external item automatically. Inspector offers a clear access-request step and names the recorded owner/custodian. Never falsely claim that a user can open a linked file after app assignment.

**Acceptance:** 1. Assign1 person to1 provider link; provider permissions change0 times automatically.
2. A denied external file has1 visible access-request/owner route; app assignment shows0 false open-access promises.

**Owner:** Resource owner

**Source / assumption:** Critique actionable resources + scoped access

**Dependencies:** resource_provider_access
access_url_disclosure


##### Safe preview and external open

ID: integration-previews · deferred · P2

Default launch opens authorized external provider links; provider-supported embeds are optional and must respect permissions/browser restrictions. Native uploaded-file preview is deferred with binary upload, not a launch dependency. If later enabled, define small MIME/size limits, safe isolation and download fallback; never render untrusted HTML in the app origin. Missing/denied external links preserve metadata and offer an access-request route.

**Acceptance:** 1. Test missing URL, denied provider preview, unsupported MIME, network failure, and valid small PDF/image preview.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** integration-links
integration-provider-access


##### Folder continuity without assumed Shared Drive

ID: integration-drive-ownership · open · P0

User confirms no current shared Drive. Decide a controlled folder/account custody arrangement before importing real files, and verify whether university Google Workspace grants Shared Drive capability. Ordinary shared folder is not equivalent to Shared Drive. File ownership transfer and departed-account risk remain visible. Don't assume a personal student's account is permanent organizational infrastructure.

**Acceptance:** 1. Account/folder plan lists individual custodian permissions, recovery/succession, ownership limitations, and verified entitlement.

**Owner:** President + resource custodian

**Source / assumption:** Current user answer 3 October 2026

**Dependencies:** scope_org_storage_setup
resource_provider_access


##### Managed authentication with invited membership

ID: integration-auth · proposed · P0

Prefer a managed auth provider compatible with cost and production security requirements. Google sign-in is a candidate if available and correctly configured; it does not prove organization membership. Validate identity and active invitation/membership server-side. Consent/callback URLs, production/sandbox separation, unverified application limits, and university policy must be checked before launch.

**Acceptance:** 1. Authenticate in isolated staging and production configuration; wrong organization and revoked membership cannot reach records.

**Owner:** Engineering + account custodian

**Source / assumption:** Implementation choice remains proposed

**Dependencies:** security_auth
access_invitation
infrastructure_accounts


##### Email is optional until delivery is configured

ID: integration-email · proposed · P1

If invitation/reset/reminder email is required, define sender identity, provider rate limits, DNS/domain requirements, sender verification, retry/deduplication, unsubscribable reminders, and delivery monitoring. User has no domain; do not assume custom branded sender is available. Google sign-in may remove reset-email dependency but not membership invitation review. Default development email services are not production delivery.

**Acceptance:** 1. Real recipient test confirms configured email path before it is advertised; failed delivery leaves recoverable invitation state.

**Owner:** Operations

**Source / assumption:** Vendor research needed; no SMTP configured

**Dependencies:** decision-reminders
costs_email


##### Calendar export before calendar synchronization

ID: integration-calendar · proposed · P1

Propose simple permission-scoped .ics export for chosen meetings/deadlines with stable UID, correct timezone and date-only fields. Explain whether file import is a snapshot; no sync promises. Bidirectional Google Calendar and availability scraping are deferred until OAuth scopes, event identity/conflicts, deletion semantics, privacy, and cost have a complete design.

**Acceptance:** 1. Import .ics fixture in a calendar; date-only work stays all-day and actual timed meeting matches Asia/Jakarta.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** work_schedule
org_timezone_calendar


##### WhatsApp as a communication link, not hidden automation

ID: integration-whatsapp · deferred · P2

Allow a clearly labeled group/contact link with explicit ownership/privacy. Automated WhatsApp sending, group scraping, bulk messages, and API integration are outside v1 default. Linked minutes/decisions/tasks retain organizational record context when discussion occurs outside the app. Creating a task never sends a message without a configured, authorized notification channel.

**Acceptance:** 1. A task save has no surprise external message; external chat link exposes intended destination.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** scope_deferred


##### Credentials use an external password manager

ID: integration-credentials · proposed · P0

Survey includes a request for unified password/account lookup. Translate that into a safe credential-reference record: service name, custodian, restricted vault link, purpose, and access-request route. No plaintext passwords, recovery codes, bank credentials, or API tokens in searchable notes, files metadata, task comments, exports, or client bundles. Choose provider/custody separately.

**Acceptance:** 1. Searching a service locates its permitted custodian/reference; no secret value is available through ordinary search/export.

**Owner:** Admin + security

**Source / assumption:** Survey J9 qualitative request; safe alternative proposed

**Dependencies:** resource_secret_links
security_secrets


##### Legal signature status and provider execution

ID: integration-signature · deferred · P2

App records review/signatory/status/evidence links. It does not perform a legally binding electronic signature in v1. A signed-provider document may be linked as evidence under access policy; record signatory identity and source without claiming verification the app has not performed. Electronic signature integration needs adopted SOP, provider terms, legal verification, audit and costs.

**Acceptance:** 1. Status label says recorded signature/evidence, and no 'sign' action falsely implies external execution.

**Owner:** Legal lead

**Source / assumption:** Legal survey workflow; external execution out of scope

**Dependencies:** legal_signature_status
access_legal_policy


##### Financial records do not transfer money

ID: integration-payments · deferred · P2

Finance requests, allocations, approvals, paid amount/date/reference and reconciliation are records. Bank integration, online payment execution, payroll, tax filing, automated accounting, and scholarship/student payments are outside v1 default. A marked-paid request needs recorded evidence and permitted reviewer; it cannot be double-counted as a new expense.

**Acceptance:** 1. Paid-state fixture reconciles IDR totals and audit trail; there is no implicit external transaction.

**Owner:** Finance lead

**Source / assumption:** Budget survey need; minimum first-version scope

**Dependencies:** finance_validation
access_finance_policy


##### No AI expense or autonomous actions in v1 default

ID: integration-ai · deferred · P2

AI generation/chat/agents are deferred. Names like Intelligence, screenshot 'handoff to agent' text, and prior videos do not require an AI backend. If added later, define data sharing, prompts, opt-out, review, cost budget, evaluation, and authority boundaries. Members can complete every core workflow without an AI dependency.

**Acceptance:** 1. No paid AI/API key or unreviewed autonomous messaging is necessary for the launch.

**Owner:** Mahdy + product owner

**Source / assumption:** User selected DWDG'ONE; cost and screenshot-source discipline

**Dependencies:** scope_optional_services
security_exports


##### Exports remain usable outside the product

ID: integration-exports · proposed · P0

CSV provides table data and readable labels; JSON retains IDs, relationships, original typed values and schema/version; Markdown/print provides human-readable reports. Attachment manifest distinguishes app-stored bytes and provider links. Restricted exports recheck permissions server-side. Exported dates/currency and file counts are documented. Link-only export cannot promise ownership or provider backup.

**Acceptance:** 1. Export known20-record relation fixture with exact counts and0 unauthorized fields.
2. Formula-like CSV values remain inert; portable JSON restores stable IDs and relationship counts exactly.

**Owner:** Data owner

**Source / assumption:** User export/data-management request

**Dependencies:** data_json
data_csv
resource_export_security


### Backend, data, security and change history

ID: backend-planning · proposed · P0

Canonical entity relationships; validation/transaction/version/concurrency contracts; server-enforced identity/role/scope; API/module boundaries; workspace-only audit and export/recovery semantics. One task/resource/request is represented by one stable ID across UI views. Constraints protect sensitive data and exact records, rather than relying on client navigation as security. SAP-style master-data/process-control lessons are adapted to a small managed web app; no SAP runtime/license is implied.

**Acceptance:** 1. All adopted entity references resolve with 0 invalid foreign keys after representative operations.
2. Direct API/search/export/history tests have 0 unauthorized fields or records.
3. Every advertised committed mutation has exactly 1 coherent authoritative change set with reliable retry semantics.

**Owner:** Backend + data + security owners

**Source / assumption:** User asks SWE/SAP consultation perspective and separate backend planning,3Oct2026; detailed method sources in CONSULTATION_REVIEW.md.


#### Data model, ownership and portability

ID: data · proposed · P0

Use one authoritative relational dataset for the organization. A task, project, person or resource is one record surfaced in multiple views, never a separate copy per division. Stable IDs, explicit relationships, trustworthy dates and bounded retention matter more than collecting many fields. Production records and disposable examples must be visibly distinct. Preserve and assess all existing local records before any future migration.

**Acceptance:** An approved entity dictionary, migration mapping, retention policy and tested export/restore journey exist before importing real data.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.


##### First-year capacity assumptions

ID: data_assumptions · open · P0

Confirmed organization scale is roughly 40 members or more. Initial proposed planning: 60 invitations/accounts, 40 monthly active, 15 concurrent, 6 divisions, 20 active projects, 5,000 tasks/year and 200 linked external resources. Native binary upload volume is zero in default free V1; native notes/folders/links are app records. Stress: 100 members/25 concurrent. Optional future binary scenario: 200 files averaging 1 MB if separately adopted. No video hosting or Drive mirroring; assumptions are editable, not measured use. API/query fixture additionally proposes 20,000 safe audit events initially; stress corpus 25,000 tasks/100,000 events exposes history/index pressure without claiming member demand.

**Acceptance:** Sizing fixture separates confirmed roughly 40+members from proposed 60 invitations/40 MAU/15 concurrent sessions,6 divisions,20 activeprojects,5,000 tasks/year and 200 linked resources. Default native upload count 0. A 100-account/25-concurrent stress report is separately labeled; neither report is called actual usage.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** member-size


##### Stable identity and revision fields

ID: data_identity · proposed · P0

Every primary business record uses an opaque immutable UUID with organization scope, created/updated provenance and revision where mutable; pure joins may use documented unique composite keys. Organization itself is the root scope and does not require a fabricated parent organization_id. Display names, division labels, emails and document numbers are editable attributes, never primary keys. Server assigns authoritative timestamps; imported unknown dates remain null with provenance. API writes compare the revision so simultaneous edits cannot silently replace each other.

**Acceptance:** Rename 1 project and move 1 resource without changing IDs or breaking expected associations. For 20 concurrent writes with the same initial revision, exactly 1 valid first update wins; all stale updates return recoverable conflict and zero silent overwrites. Imported unknown dates remain null in 100% of mapped rows.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.


##### Organization and configurable divisions

ID: data_organization · proposed · P0

Organizations contain units/divisions with stable IDs, names, ordering, parent unit, active dates and enabled capabilities. Begin with one DWDG UII organization and the six confirmed divisions; store an organization_id boundary throughout without building a public multi-tenant SaaS. Rename, merge or retire units without erasing historical assignments. Configuration changes are privileged and audited.

**Acceptance:** Rename, retire and reparent 3 synthetic units across 2 terms: stable IDs and 100% of historical project references remain interpretable. Cross-organization unit/project references fail through UI and direct API with zero committed rows.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_organization
entity_unit
entity_workspace
entity_reportingassignment


##### Management terms and batch history

ID: data_batches · proposed · P1

A term/batch has an ID, human label, start/end dates, active/archive state and handover package. Memberships, role assignments and selected projects reference a term where appropriate; enduring resources can be organization-wide. Archiving a term makes historical operational work read-only by default while preserving report and search access according to permissions. Never reassign all old records to the new board.

**Acceptance:** Activate a second synthetic term and verify at most 1 default active term;100% of previous-term ownership/reporting/approval actor IDs remain unchanged. Invalid reversed date or cyclic reporting fixture blocks activation.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_term
entity_membership
entity_reportingassignment


##### People, accounts and membership are distinct

ID: data_people · proposed · P0

A person record is organizational identity; an auth account is login identity; membership states whether a person belongs to an organization/unit/term. Support a member with no login, an alumni read-only membership and account revocation without deleting authorship. Collect display name, necessary email, optional contact and role only. Student ID, birth date and private biography are not mandatory by default.

**Acceptance:** 1 person with 2 unit memberships and 1 verified login stays 1 person after offboarding/re-invitation; prior task/comment/audit authorship is preserved. Unverified matching name/email is never auto-merged; departed login retrieves zero protected rows.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_person
entity_accountlink
entity_membership


##### Time-bound role grants and delegated access

ID: data_roles · proposed · P0

Represent grants as subject, scope, role, starts_at, expires_at and granted_by. Separate organization administration, division leadership, project participation and sensitive workflow approval. A member can belong to multiple units but receives only explicit rights. Temporary delegates expire and appear in audit history. Financial approver and technical administrator are separate responsibilities even if a small team assigns both to one named person.

**Acceptance:** Expired, future-start, cross-unit and forged grants are 4 denied fixtures through direct API. A temporary valid grant permits only its adopted action/scope; expiration denies the next protected request using the same JWT.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_role
entity_membership
entity_reportingassignment


##### Project relationship contract

ID: data_projects · proposed · P0

Projects hold title, purpose, primary unit, lead, participants, collaborating units, lifecycle, visibility, planned dates, optional budget reference and term. Tasks, milestones, blockers, decisions, meetings and resources refer to the same project ID. A project may span divisions without becoming another Workspace. Allow an explicitly undated draft; publishing into active work requires owner and sufficient scheduling information, not fabricated dates.

**Acceptance:** Update 1 project shared with 2 permitted units: each view resolves the same project ID/revision and totals, with zero copied tasks. Active publication without adopted mandatory owner/date fields fails; an explicit undated draft remains allowed.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_project
entity_projectunit
entity_task


##### Task and dependency integrity

ID: data_tasks · proposed · P0

Tasks hold project ID, title, optional description, owner/assignees, status, priority, date-only due date or explicit timed event, completion timestamp, evidence links and sort order. Dependencies use typed edges with foreign keys and cycle checks. Cross-project dependencies must be deliberately supported or rejected with explanation. Deletion/archive checks references before changing downstream scheduling.

**Acceptance:** Reject self edge,2-node cycle,3-node cycle and forbidden cross-project edge in direct writes. Complete→reopen→complete preserves 1 task ID with truthful completion events and zero fabricated timestamps. Optional nesting tests apply only if P1 subtasks are adopted.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_task
entity_assignee
entity_dependency
entity_milestone


##### Meetings, minutes and decisions

ID: data_meetings · proposed · P0

Meetings store real start/end timestamps, organizer, attendees, location/meeting link, agenda and project/unit references. Minutes and decisions have author, revision, date and follow-up links. Task deadlines with only a date stay all-day; never convert them into invented meeting times. Meeting attendee removal does not erase authorship of prior minutes.

**Acceptance:** Create 1 meeting with 3 attendees,1 minutes note,1 decision and 2 follow-up tasks; every view resolves canonical saved IDs. Invalid end≤start is rejected; an all-day deadline produces zero invented timed meeting events.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_meeting
entity_attendee
entity_decision


##### Resource registry and folders

ID: data_resources · proposed · P0

Default resource types are native note, internal folder, external file/app/link or collection. Uploaded-file type is reserved for separately adopted future capability, not a launch requirement. Store title/provider/canonical URL or future object ID, actual owner, project/unit context, classification and revision metadata. Folder/association joins organize one canonical resource without copying provider bytes or widening provider access.

**Acceptance:** Associate 1 link/note with 2 permitted projects, move its folder and preserve 1 authoritative resource ID plus all expected joins. No provider bytes are copied and zero provider permissions are implicitly granted; protected child metadata is excluded from unrelated listings.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_resource
entity_folder
entity_link
entity_note
entity_attachmentassociation
data_linkfirst


##### Link-first storage policy

ID: data_linkfirst · proposed · P0

Default free V1 supports native editable notes, folders and external document/app links. Binary upload is deferred unless separately adopted. No organization Drive account currently exists; resource links show actual owner/access and succession risk, while a custodian folder plan is open. App permissions never grant provider access. Backups include app notes/metadata/relations plus external-link manifest, not external document bytes. Critical outside evidence needs its own agreed owner/archive procedure.

**Acceptance:** A member can add/find a permitted link and note with zero mandatory binary upload, paid domain or shared-Drive account. Inaccessible-provider fixture names actual owner/repair path; export contains note text and link metadata while explicitly excluding provider document bytes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infra-accounts


##### Optional future private binary upload lifecycle

ID: data_attachment · deferred · P2

Default free V1 has native notes/folders/external links, with no mandatory native binary upload. If binary storage is later explicitly adopted, specify object key, original name, MIME, bytes, checksum, uploader/classification/scan and revision. Proposed hard limit 10 MB/file with stricter preferred size; sanitize paths and reject executables. Commit metadata/object lifecycle carefully so interrupted save creates no permanent orphan. Preserve existing legacy blobs in migration archive without silently discarding them.

**Acceptance:** Conditional future gate: adopt an actual upload limit before implementation (initial proposal 10 MB/file). Boundary limit and limit+1 byte, interrupted metadata/object save, unauthorized download, quota exhaustion, orphan cleanup and restore scenarios all pass with zero lost prior versions. Default launch excludes this capability.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_linkfirst
security_permissions
costs-budget


##### Revision history without file explosion

ID: data_revisions · proposed · P1

Native note revisions and metadata changes keep bounded meaningful-save history. Default free V1 external file revision is a provider link/metadata record; DWDG does not copy or restore provider bytes. If future binary upload is adopted, replacing bytes creates immutable checksummed version with author and retained-file budget. Restoring any revision records actor/reason. Do not retain every keystroke or remove evidence references silently.

**Acceptance:** Restore an earlier native-note revision: same resource ID, exactly 1 new restoration revision/event and prior approved evidence still interpretable. Default external link revision creates zero copied/restorable provider bytes; adopted optional binary versions have a separate checksum/retained-byte gate.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_note
data_identity
data_retention


##### Division records link into shared work

ID: data_divisionentities · proposed · P0

Finance requests/budget lines, legal requests/register entries, partner/contact interactions, content/campaign items, recruitment/onboarding records and strategy initiatives are distinct typed records. Each can refer to shared projects, tasks, resources and responsible people. Do not duplicate partner names in every project or finance states in task labels. Sensitive fields live in restricted tables/views rather than one public JSON blob.

**Acceptance:** Trace 1 legal→finance and 1 partner→Consulting handoff through canonical project/task/resource IDs: no duplicated partner or finance state rows. Each of 6 divisions has an adopted minimum schema/workflow owner; HR/S&G hypotheses stay unapproved until review.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_financerequest
entity_legalrequest
entity_partner
entity_contentitem
entity_recruitment
entity_initiative


##### Amounts, currencies and financial state

ID: data_money · proposed · P0

V1 records IDR integer amounts; no floating-point currency arithmetic. Distinguish planned allocation, requested, approved, committed and paid amounts with dated actions. A recorded paid state is not a bank transaction. Collect only necessary receipt/proof metadata; do not retain bank credentials, payment card details or complete identity-document scans. Accounting/tax compliance and automated payments remain outside V1.

**Acceptance:** IDR fixture allocated 100,000/requested 90,000/approved 80,000/recorded payments 30,000+50,000 yields paid 80,000 and unpaid 0 for approved amount, without float rounding. Reject negative, fractional, non-IDR and over-recorded values under adopted rules. A paid record causes zero bank transactions.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.


##### Timezone and truthful history

ID: data_dates · proposed · P0

Organization defaults to Asia/Jakarta; store instants in UTC and date-only deadlines as dates. Distinguish planned/scheduled/completed timestamps and unknown imported values. Render with chosen English/Indonesian locale without rewriting member content. Recurrence rules specify timezone. A timestamp represents an event that happened; charts must not infer a completion day from last_updated.

**Acceptance:** Fixtures cover 23:59/00:01 Asia/Jakarta, leap day, end-before-start, date-only deadline and unknown imported completion: all 6 preserve intended semantics in EN/ID. Completion charts include zero invented dates or values inferred from updated_at.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.


##### Server validation and transaction boundaries

ID: data_validation · proposed · P0

Client validation helps users but server constraints are authoritative. Validate required fields, enum states, relation scope, date order, amount ranges and permission on every write. Related changes such as approval + activity event or task completion + evidence link commit atomically. Repeated requests carry idempotency IDs. Error responses identify recoverable fields without revealing private record names. Multi-row totals/number issuance require a chosen concurrency strategy (row locking, unique constraints or serializable transaction with bounded whole-transaction retry); a client check or several unrelated REST writes is insufficient.

**Acceptance:** Fault-inject each multi-row command boundary for task completion, approval and numbering: zero partial records/events and zero duplicate totals. Valid retry produces exactly 1 result; invalid enum, scope, date, amount or privilege returns safe actionable error without private record names.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_identity
data_cardinality
security_permissions
data_commands


##### Concurrent edit and save conflict policy

ID: data_concurrency · proposed · P0

Each update supplies the revision read by the editor. If stale, show current saved version, the user draft and field differences; allow reload, copy draft or a deliberate authorized reapply. Do not silently use last writer wins for approvals, ownership or money. Realtime refreshes must not replace active drafts, scroll or selection. Display saving, saved, offline and conflict states honestly. Approval/money graph races need server locking or serialization in addition to single-record revision checks; rerun whole transaction after a serialization failure with a bounded policy.

**Acceptance:** In 20 two-editor task/note/approval races, accepted revision increments once per committed change; every stale save preserves local draft and exposes conflict. No test yields silent last-writer replacement of approval/ownership/money, and realtime changes preserve active focus/selection.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_identity
security_permissions


##### Archive, trash, Undo and hard deletion

ID: data_softdelete · proposed · P0

Archive ends active work; trash is reversible metadata/note removal; permanent purge privileged with dependency preview. Proposed trash 30 days unless adopted evidence policy longer. Undo restores ID/relations/order/completion fields if version/permission allows, with explicit conflict otherwise. Removing an external link never deletes provider bytes. Optional native file cleanup only after recovery window/reference checks once capability adopted.

**Acceptance:** Archive/delete/Undo fixtures preserve 100% of expected IDs/relations/order/completion fields while permission or revision conflicts fail safely. Proposed trash window 30 days is policy-gated. External link removal triggers zero provider deletions; optional native purge cannot remove referenced recovery bytes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_concurrency
data_retention
security_permissions
data_auditscopes


##### Purpose-based retention schedule

ID: data_retention · open · P0

Proposed schedule: operational records retained through the active term plus 2 years; necessary governance/project outcomes archived longer by named owner; rejected recruitment applications purged after 90 days unless explicitly needed; trash 30 days; technical logs 30 days; audit events 1 year. These are planning defaults, not legal obligations. Confirm UII/DWDG policy and privacy requirements before real recruitment/finance data.

**Acceptance:** Approved table covers 100% of collected P0 fields/categories with purpose, owner, duration, exceptions and purge action. Dry-run fixtures on both sides of each adopted boundary produce exact planned counts and zero purged held/evidence-referenced records; proposed 90-day recruitment/30-day trash/1-year audit values remain unapproved until chosen.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_privacy
costs-budget


##### Human-readable filtered CSV export

ID: data_csv · proposed · P0

Members export only rows/fields they can read, with selected unit/term/project/date filters, timezone, generation timestamp and row count. Produce UTF-8 spreadsheet-friendly CSV, stable columns and labels for enum codes. Escape delimiters/newlines and spreadsheet formula-like values safely. IDR remains numeric with a currency column. A filtered report is labeled partial, never a backup.

**Acceptance:** Export 100 permitted rows including Indonesian text, multiline values, quotes and formula-like prefixes: parsed row count equals 100, selected filters/amounts reconcile exactly, and sensitive disallowed fields occur 0 times. File labels filtered/partial and is never described as complete recovery.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_exports
data_dates
data_limits


##### Portable complete JSON export contract

ID: data_json · proposed · P0

Admin export has schema_version, app_version, organization ID, export ID, term scope, generated_at, timezone, entity counts and records keyed by stable IDs. Preserve enums, relationships, nullable dates, authorship and revision information. Exclude passwords, session tokens, SMTP keys and service secrets. Rights-aware member export remains partial. Full archive/export jobs have status and retry rather than freezing the UI.

**Acceptance:** Default full JSON bundle has schema/version/scope/timestamp plus exact per-entity counts and every included stable relation. Empty-isolated import yields zero dangling references and preserves all native notes/null dates/revisions; credential/session-secret occurrence count 0.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_dictionary
security_exports
data_exportconsistency


##### External-link manifest and optional attachment scope

ID: data_manifest · proposed · P0

Default full app export contains versioned JSON, optional CSV views and resource manifest with provider URL/item ID, actual owner, classification and verification status; native note contents are included. External document bytes are explicitly excluded and remain provider-owned/access-controlled. This can be complete for app-owned records while not a document-byte archive. If optional native uploads are adopted later, add checksum/byte/path/inclusion status and actual blob copies; missing required native bytes then mark bundle incomplete.

**Acceptance:** Default record/note/link bundle reconciles 100% of required app-owned entity counts and native-note contents and labels external-provider-byte exclusion. Missing optional future native blob marks a file-enabled bundle incomplete; absence of an external byte copy does not falsely fail or claim document recovery.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_json
entity_note
entity_link


##### Restore is a separate privileged workflow

ID: data_restore · proposed · P0

Restore starts with format/checksum/count/relation validation and dry-run of IDs, people/account mapping and external links. Default V1 restores app-owned records/native notes/folders/link metadata; it cannot restore deleted external provider documents. Import into empty isolated destination, not silent merge/overwrite; destination archive and explicit confirmation precede commit. Reauthenticate accounts. Optional uploaded blobs require additional verified restore before that capability ships. The recovery destination is restricted and disposable, not the ordinary member-training sandbox; a training badge alone cannot authorize real backup data.

**Acceptance:** Dry-run rejects corrupt checksum, missing FK, unsupported schema and unreviewed person mapping in 4 fixtures before any destination write. Approved empty-destination import has exact manifest counts and zero stale access grants; repeated import is reconciled, not silent merge. External byte limitations remain visible.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_manifest
environments_copy
environments_secrets
data_authrestore


##### Existing local-store migration without erasure

ID: data_legacy · proposed · P0

Inventory existing three browser local stores and IndexedDB blobs; export all before any transform. Classify examples versus real work and map IDs/people explicitly, preserving unknown dates/owners. Default new V1 imports records/notes/link metadata only after review; existing native blobs remain in verified legacy archive until an adopted upload/move-to-provider plan covers them. No blob is silently discarded or falsely marked migrated. Repeat import is idempotent; original source remains recoverable.

**Acceptance:** Inventory/export all 3 existing local stores and legacy IndexedDB blobs before transformation; source remains recoverable. Apply same approved source twice: second run adds 0 duplicate records. Reconciliation accounts for 100% of source records/bytes as imported, excluded with reason, unresolved or preserved legacy archive.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_restore
entity_importjob


##### Data dictionary and schema ownership

ID: data_dictionary · proposed · P0

Named entities below are a relational planning baseline with field meaning, relations, constraints and access scope. Compatible low-volume records may consolidate where integrity/security remain sound; do not create one table per UI card. Shared stable identity/revision/audit fields apply universally. Proposed optional capabilities stay optional until V1 scope. Dictionary, indexes/migrations and API contract must stay aligned. Workspace Changes uses authorized server events with immutable actor and bounded redacted old/new data.

**Acceptance:** 100% of adopted P0 fields document meaning/type/nullability/validation/relations/scope/owner and chart/report source basis. Schema/API/export versions identify differences explicitly; zero unknown imported codes are silently remapped.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_identity
data_dates


###### Organization — fields and constraints

ID: entity_organization · proposed · P0

id, display_name, brand_name, default_locale, timezone, active_term_id, status. One initial DWDG UII organization; all domain entities reference organization_id. Name/brand can change without changing ID. Enforce approved timezone/locale and owner-only settings. Do not infer university legal status or institutional account control from name.

**Acceptance:** Create/rename organization and retain every existing relation; cross-organization reference is rejected.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** data_identity
data_dates


###### Division/unit — fields and constraints

ID: entity_unit · proposed · P0

id, organization_id, parent_unit_id, name_en, name_id, code, sort_order, active_from, inactive_at. Codes are stable aliases, names editable; unit tree rejects self/cycles and historical assignments remain. Start with six confirmed divisions. Retire rather than cascade-delete units. Membership/capability/project joins reference ID, not translated label.

**Acceptance:** Retire/rename unit without breaking archived work; parent cycle and duplicate active code fail.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_organization


###### Workspace context — fields and constraints

ID: entity_workspace · proposed · P0

Workspace is organizational/division context with immutable scope identity, organization_id/unit_id, capability config and member view preferences. ADR may reuse immutable unit ID as scope ID or use explicit workspace UUID, but audit/source/destination scopes must resolve consistently after rename/retirement. It is not a project container/duplicated database. Team/reporting/access are separate. Context selection never grants permission; mapping changes preserve historical event interpretation.

**Acceptance:** Rename/retire/reconfigure 1 unit: immutable scope identity preserves 100% of authorized historical event links. A→B context switch grants 0 new rights; project remains a separate record, never a second Workspace concept.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_unit


###### Management term/batch — fields and constraints

ID: entity_term · proposed · P0

id, organization_id, label, starts_on, ends_on, status, predecessor_term_id, handover_resource_id. Dates are real/planned explicit values; end before start invalid. At most one selected active default term; historical terms stay readable under grants. Projects may span terms through association rather than date-based accidental reassignment.

**Acceptance:** Archive previous term and preserve historical owner memberships, totals and sources.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_organization
data_dates


###### Person — fields and constraints

ID: entity_person · proposed · P0

id, organization_id, display_name, necessary_contact_email, avatar_resource_id optional, status. Person exists independently of login and survives departure. Email normalized for matching, not permanent primary key. Duplicate resolution is explicit; account linking never merges people solely from display name. Student ID/biography not required.

**Acceptance:** A no-login participant can own a task; authorized account link and deactivation preserve authorship.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_organization


###### Account-person link — fields and constraints

ID: entity_accountlink · proposed · P0

person_id, auth_provider_user_id, provider, linked_at, verified_email, revoked_at. Enforce uniqueness of active provider identity and person linkage policy. Provider tokens/passwords never enter business tables. Auth deletion preserves person and audit references. Linking/relinking is privileged identity resolution with verification; do not accept user-supplied account ID without authorization.

**Acceptance:** Each active login maps to exactly 1 verified intended person under adopted organization linkage policy; duplicate active provider identity and unauthorized relink fail. Revoked old JWT retrieves 0 protected records and export contains 0 live session secrets.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_person


###### Membership — fields and constraints

ID: entity_membership · proposed · P0

id, person_id, organization_id, unit_id optional, term_id optional, membership_state, joined_on, departed_on. Multiple active unit memberships allowed by organization rules; overlapping duplicate identical scope invalid. Membership is not equal to approval rights. Departure ends grants/sessions through offboarding while prior authored records remain.

**Acceptance:** 1 person participates in 2 units without duplicate identity; same person/scope overlapping duplicate membership is rejected. Departure exposes every active grant/open obligation for review while retaining 100% of prior authorship IDs.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_person
entity_unit
entity_term


###### Role definition and grant — fields and constraints

ID: entity_role · proposed · P0

role_definition: id/code/label plus documented allowed actions. role_grant: person_id, scope_type/scope_id, role_id, starts_at, expires_at, granted_by. No user-editable arbitrary permission JSON that escalates role. Scope belongs to same organization; expiry evaluated server-side. App admins and technical vendor operators are distinct.

**Acceptance:** Expired/future/unrelated scope grants and client-editable permission metadata yield 0 unauthorized actions. One valid adopted scoped grant permits its exact action set; changing role cannot rewrite historical actor or satisfy independent review by the same person.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_person
entity_workspace


###### Unit capability configuration — fields and constraints

ID: entity_capability · proposed · P0

unit_id, capability_code, enabled, config_version, changed_by. Capability names map to approved workflows such as partner pipeline or finance requests; enabling UI does not assign permission. Keep bounded configuration for V1 rather than arbitrary scripts/fields. Retiring capability retains old records with documented read-only handling.

**Acceptance:** Disable a unit capability while historical records remain accessible to authorized roles and direct endpoints enforce access.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_workspace


###### Invitation — fields and constraints

ID: entity_invitation · proposed · P0

id, organization_id, normalized_email, intended_person_id optional, intended_scope/role, token_hash, expires_at, created_by, accepted_at, revoked_at. Store token hash rather than recoverable full invitation token. Single-use, expiry and email ownership required; no auto-admin based solely on first signup or university domain.

**Acceptance:** Repeated/expired/uninvited acceptance fails; valid Google account receives precisely approved membership.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_membership
entity_accountlink
entity_role


###### Project — fields and constraints

ID: entity_project · proposed · P0

id, organization_id, primary_unit_id, term_id optional, title, purpose, lifecycle, lead_person_id, visibility, starts_on, target_on, archived_at, revision. Draft dates may be null; active publication requirements are explicit. Cross-unit participation uses joins and grants. Real completion date separate from target; owner can change without rewriting history.

**Acceptance:** One project appears in multiple permitted division views with shared saved status; invalid lifecycle/date transition fails.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_workspace
entity_term
entity_person


###### Project collaboration and participant joins — fields and constraints

ID: entity_projectunit · proposed · P0

project_id/unit_id association with participation_role; project_person join with person_id, project_role and active interval. Unique active pair and same organization constraints. Participation is explicit, not inferred from task mention. Restricted project access may need separate approved grant; ordinary collaborator can be read-only. Revocation does not delete past authored work.

**Acceptance:** Remove 1 collaborator from a project shared with 2 units: new protected reads/writes are denied while 100% of permitted history retains prior participant IDs. Duplicate active project-unit/project-person pair and cross-org relation fail.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_project
entity_unit
entity_person


###### Task — fields and constraints

ID: entity_task · proposed · P0

id, project_id, title, description, status_code, priority_code, due_on optional, scheduled_start/end optional, completed_at nullable, completed_by, sort_key, revision. Optional adopted subtask capability adds nullable parent_task_id: same project/workspace, one nesting level for first V1, reject self/cycles, and no implicit access grant. Nesting organizes work; dependency edges describe sequencing separately. Validate date-only/timed semantics. Completion/Undo commits true event fields; unassigned drafts remain explicit. If adopted, children own canonical status/owner/date/evidence/revision; parent completion waits active noncancelled children and explicit review. Project progress counts eligible leaves to avoid parent-plus-child double counting; default flat tasks remain unchanged.

**Acceptance:** One task remains canonical across list/board/timeline/inspector. Status/date/completion fields match exact saved revision; 20 same-revision races produce no silent overwrite. If P1 subtasks adopted, self/cycle/cross-project/second-level cases are 4 rejected fixtures and eligible-leaf progress counts each task once.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_project
data_dates
data_identity


###### Assignee joins — fields and constraints

ID: entity_assignee · proposed · P0

task_id/person_id, assignment_role, assigned_by, assigned_at, accepted_at optional, unassigned_at. Unique active task/person pair; one accountable owner may coexist with contributors if approved. Assignment cannot grant sensitive project access implicitly. Person must be eligible scope or explicit collaborator. Former assignee remains in history.

**Acceptance:** Multiple contributors do not duplicate a task; unassign/reassign updates permission-neutral work ownership.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_task
entity_person


###### Milestone — fields and constraints

ID: entity_milestone · proposed · P0

id, project_id, title, target_on optional, achieved_at nullable, owner_person_id, status, acceptance_note, evidence associations. Linked task join describes required versus supporting work. Completion cannot be inferred solely from target date or all tasks if explicit review is required. Unknown achieved dates stay unknown.

**Acceptance:** Milestone opens exact saved tasks/evidence; achieving records real timestamp and review author.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_project
entity_task


###### Dependency — fields and constraints

ID: entity_dependency · proposed · P0

id or unique composite source_type/source_id, target_type/target_id, dependency_kind, lag_days optional, created_by. Foreign keys/validated entity mapping, same organization and allowed scope. Reject self/cycles; deletion preview shows dependents. V1 can support only finish-before-start without building a scheduler; other kinds remain deferred. Cross-project edges expose only permitted titles.

**Acceptance:** Self, 2-node cycle, 3-node cycle and prohibited scope edges are rejected; restricted prerequisite has 0 unauthorized title leakage. Valid finish-to-start edge keeps saved IDs and an unresolved/deleted prerequisite remains blocked until reviewed.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_task


###### Blocker — fields and constraints

ID: entity_blocker · proposed · P0

id, project_id, linked_task_id optional, title, severity_code, owner_person_id, next_action, raised_at, resolved_at, resolution_note. Severity has documented meaning, not invented health score. Resolved_at requires deliberate resolution; age charts use raised timestamp only where known. A blocker can remain unresolved with no fabricated deadline.

**Acceptance:** Create/resolve blocker and link responsible action; portfolio count reconciles saved unresolved rows.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_project
entity_task
entity_person


###### Resource — fields and constraints

ID: entity_resource · proposed · P0

id, organization_id, type_code, title, owner_person_id, classification, provider, canonical_url optional, current_note_or_link_version_id optional, archive_state. Default native note/folder/link validates type-specific fields and safe protocols; associations link permitted contexts without copying provider bytes or granting outside access. Future optional uploaded-file type adds object-version reference only after storage/security/cost/recovery gate.

**Acceptance:** Associate same resource across two contexts and preserve one authoritative metadata/version history.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_workspace
entity_person


###### Folder hierarchy — fields and constraints

ID: entity_folder · proposed · P0

resource_id or folder_id, organization_id, parent_folder_id, title, owner_person_id, classification. Reject self/cyclic nesting; folder movement preserves child IDs. Folder association does not automatically loosen each restricted child access. External Drive folder is a link resource, not an assumed complete local copy. Delete behavior previews nested references.

**Acceptance:** Move folder without breaking resource references; restricted child cannot leak through visible folder listing.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_resource


###### External link/app resource — fields and constraints

ID: entity_link · proposed · P0

resource_id, url, provider_code optional, provider_item_id optional, actual_owner_label, ownership_checked_at, access_note, last_verified_at optional. Allow HTTPS approved schemes; reject script/data/executable URLs. Member-added app link is a launch point, not stored password/integration credential. Broken link status does not delete the original record.

**Acceptance:** Open safe link, repair inaccessible URL and retain actual owner/access explanation.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_resource


###### Note and note revision — fields and constraints

ID: entity_note · proposed · P0

resource_id, current_content, content_format, revision; note_revision has version, editor, edited_at, body/hash and restoration reason. Bounded rich-text sanitizer/plain text supported; comments separate. No realtime coauthor promise without conflict algorithm. Retain drafts by user/device policy; restricted notes excluded from broad indexing.

**Acceptance:** 2 editors racing one revision retain local draft and surface conflict; restoring an earlier body makes exactly 1 new audited revision. Export/restore native-note hash matches, and broad search contains 0 restricted note text.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_resource


###### File object/version — fields and constraints

ID: entity_fileversion · deferred · P2

Future optional native upload schema: id, resource_id, revision, object_key, original_name, MIME, bytes, checksum, uploaded_by/at, scan_state/state. Default free V1 supports external file links, native notes and folders, so binary table/storage need not ship. If adopted, bytes immutable per version, unique sanitized key/private authorization/server limits; deletion respects retention/references and backup completeness. No deferred control appears as a working upload feature.

**Acceptance:** Download matches checksum and scope; failed replacement leaves prior working version intact.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_resource
data_attachment
security_uploads


###### Comment — fields and constraints

ID: entity_comment · proposed · P0

id, entity_type/entity_id or typed join, author_person_id, body, created_at, edited_at, deleted_at, parent_comment_id optional. Same organization/scope validation and sanitizer. Mentions are explicit person references with permission-aware notifications; they do not grant access. Editing keeps bounded change history; hide deleted body according to retention.

**Acceptance:** Mentioned unauthorized member gets no sensitive preview; parent/child relation cannot cross restricted scopes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_person
data_cardinality


###### Decision — fields and constraints

ID: entity_decision · proposed · P0

id, project_id optional, unit_id optional, title, rationale, decision_state, decided_by, decided_at, related_resource_id, supersedes_decision_id optional. Draft/proposed/accepted/superseded distinguish brainstorming from adopted direction. Actual organizational authority must be confirmed; saved accepted label alone is not proof of external legal authorization.

**Acceptance:** Supersede a decision without erasing rationale; linked follow-up opens corresponding task.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_project
entity_resource
entity_person


###### Meeting — fields and constraints

ID: entity_meeting · proposed · P0

id, organization_id, project_id/unit_id optional, title, organizer_person_id, starts_at, ends_at, timezone, location_or_url, agenda_note_id, minutes_note_id, state. Validate end later than start and safe meeting URL. Attendees join separately. Cancellation retains history; reminders stop. V1 does not assume Google Calendar sync.

**Acceptance:** Reschedule/cancel actual-time meeting and reflect agenda/reminders without duplicate deadline events.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_workspace
entity_project
data_dates


###### Meeting attendee — fields and constraints

ID: entity_attendee · proposed · P0

meeting_id, person_id or approved external_contact_id, role, response_code, response_at. Unique participant relation and same organization scope for internal people. External participant contact privacy explicit; RSVP only where implemented, otherwise status is manually recorded. No fabricated availability/attendance inference from a meeting invitation.

**Acceptance:** Adding/removing attendee updates required access/notifications without asserting attendance occurred.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_meeting
entity_person


###### Availability/preferences — fields and constraints

ID: entity_availability · proposed · P1

person_id, weekday/time-window/timezone or dated exception, visibility, effective dates. Optional low-complexity scheduling preference, not surveillance/location or guaranteed attendance. Conflicting meetings show explicit data limitations. Time-zone/day handling matters; division members should not see private personal schedules unless user-approved. Advanced resource scheduling deferred.

**Acceptance:** Available window renders correctly and member controls visibility; no hidden performance/attendance score derived.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_person
data_dates


###### In-app notification and read state — fields and constraints

ID: entity_notification · proposed · P0

id, recipient_person_id, event_type, source_entity, created_at, due_at optional, dedupe_key, read_at, dismissed_at. Generated only for recipient with current access; sanitize preview and recheck on open. Distinguish reminder from actual delivered email. Recurrence/refresh does not duplicate events; archival cancels obsolete reminders.

**Acceptance:** Reopen app and see outstanding authorized reminder once; revocation removes sensitive preview.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_person


###### Activity event versus audit — fields and constraints

ID: entity_activity · proposed · P0

id, organization_id, workspace/unit scope, actor derived from verified server identity, event_type, entity reference, server occurred_at, summary_key and safe_payload. Workspace feed/Changes visibility filters scope and field access; archived/deleted resources use safe tombstone summary. Activity UI differs from privileged audit store and local-only editing history. Only actual events are recorded; unknown imported dates remain unknown. Declared chart event basis stays consistent.

**Acceptance:** Chart/feed reconcile chosen event basis and never expose private entity names through aggregate context.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_workspace
entity_person


###### Finance budget/allocation — fields and constraints

ID: entity_financebudget · proposed · P0

id, project_id optional, term_id, category_id, allocated_idr integer, approval_state, approved_by/at, notes restricted. Separate budget amendment rows or versioned changes with reason; planned allocation is not paid cash. Prevent negative amounts and undefined currencies. Public aggregate visibility is separately approved.

**Acceptance:** Budget amendment preserves each reviewed allocation version and exact integer IDR total. Negative/fractional/undefined currency fixtures are rejected; unauthorized user sees 0 private notes. Approval/revision joins resolve one canonical decision.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_project
entity_term
data_money


###### Expense/funding request — fields and constraints

ID: entity_financerequest · proposed · P0

id, project_id/budget_line_id, requester_person_id, amount_idr, purpose, requested_on, review_state, evidence_resource associations. Required amount positive integer; scope/requester enforced. Requested/approved/committed/paid values are distinct. Reject duplicate idempotency; requester cannot directly write approval fields. Bank details minimal/restricted if approved at all.

**Acceptance:** 10 repeated submit retries create 1 request; requester direct-edit of approval fields changes 0 rows. Valid reviewed amount/state transitions reconcile exact IDR values and referenced revision; adopted evidence/ownership requirements are enforced.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_financebudget
entity_person


###### Approval decision — fields and constraints

ID: entity_approval · proposed · P0

id, target_type/target_id, requested_by, reviewer_person_id, decision_code, decided_at, comment, target_revision, delegation_grant_id optional. Approval binds reviewed record revision and authorized role; content changes can invalidate approval deliberately. Self-approval policy is an open SOP choice, default deny for finance. No signature/bank execution implied.

**Acceptance:** Approved amount edited after review invalidates the affected decision under adopted policy. Self/expired/stale/skip-review fixtures produce 0 invalid approvals; valid decision binds exactly 1 reviewed revision and immutable actual reviewer identity.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_person
entity_role
data_identity


###### Recorded payment/reconciliation — fields and constraints

ID: entity_paymentrecord · proposed · P0

id, finance_request_id, recorded_amount_idr, paid_on, recorder_person_id, evidence_resource_id, reconciliation_state. Positive amount and request total limits; partial payment policy explicit if adopted. This is a human-recorded status, not integration to a bank. Evidence access private; correction creates auditable reversal/amendment rather than deleting history.

**Acceptance:** Fixture approved 100,000 with recorded partial 30,000+40,000+30,000 yields total 100,000; +1 over-recorded IDR is rejected if the adopted rule caps at approved amount. Correction keeps auditable original/reversal and creates 0 real bank actions; incoming finance uses separately declared basis.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_financerequest
entity_approval
data_money


###### Legal document request — fields and constraints

ID: entity_legalrequest · proposed · P0

id, requesting_unit/project, requester, document_type, purpose, target_on, legal_owner, stage, revision_resource_id, signature_status_code, finance_handoff_id optional. Workflow stages/SLAs/numbering are proposed pending official SOP. No electronic signature execution. Requested revision and final version link same resource history; confidential terms restricted.

**Acceptance:** Trace request→revision→recorded signature status→finance handoff with owner and no duplicate document copy.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_project
entity_resource
entity_person


###### Document register/number reservation — fields and constraints

ID: entity_documentregister · proposed · P0

id, legal_request_id, term_id, document_type, sequence_number, display_number, issued_on, issuing_authority, state. Unique official number scope must follow confirmed SOP; provisional labels until adopted. Concurrent number reservation atomic, void numbers preserved. Do not fabricate official authority/date/signature because a document is uploaded.

**Acceptance:** Race 10 mock reservations in one adopted number scope: 10 distinct numbers, 0 reused void numbers. Retries return original reservation. Provisional and officially issued records remain distinct; no invented issue/signature authority.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_legalrequest
entity_term
data_commands


###### Partner organization — fields and constraints

ID: entity_partner · proposed · P0

id, organization_id, name, sector optional, owner_person_id, relationship_stage, last_interaction_at derived from recorded interactions, next_followup_on optional, classification. Deduping uses reviewed identity cues, not name alone. Private contact joins separate. Link partner to multiple projects; stage distribution counts exact saved state.

**Acceptance:** Merge reviewed duplicate with relation preservation; stage count/filter returns underlying permitted partners.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_person


###### External contact — fields and constraints

ID: entity_contact · proposed · P0

id, partner_id optional, display_name, role/title, necessary email/phone optional, contact_owner, permitted_use_note, classification. Collect minimum professional contact data and avoid hidden personal profiles. Link interactions; own permission/retention. Export and sharing authorized by purpose. Do not imply consent to promotional email or WhatsApp broadcast from a saved contact.

**Acceptance:** Unauthorized member export excludes private contact details; owner can correct/remove unnecessary fields.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_partner


###### Partner interaction/follow-up — fields and constraints

ID: entity_interaction · proposed · P0

id, partner_id/contact_id, actor_person_id, happened_at nullable, channel_code, short_note, outcome_code, next_action_task_id, evidence_resource_id optional. Planned follow-up distinct from happened interaction; unknown date remains null. Sensitive correspondence stored only if necessary/restricted. Follow-up completion does not manufacture an outreach event.

**Acceptance:** Log actual interaction and create linked follow-up; overdue view comes from real saved dates.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_partner
entity_contact
entity_task
data_dates


###### Marketing content/campaign — fields and constraints

ID: entity_contentitem · proposed · P0

campaign: id/title/goal/project/owner. content_item: campaign_id, channel_code, executor, planned_publish_at, actual_publish_at nullable, stage, asset_resource_ids, review_decision_id, evidence_url. Completion means recorded actual result; external publishing/engagement metrics not assumed. Deadlines and assignments refer shared work.

**Acceptance:** Approved item has named executor/assets and recorded outcome; schedule does not falsely claim publication.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_project
entity_resource
entity_approval
data_dates


###### IT/service work request — fields and constraints

ID: entity_itrequest · proposed · P1

id, requesting_unit/person, title, category, impact, owner, stage, due_on, shared_task_id, evidence_resource_id, resolution_note. Used for internal website/tool/access work, not storing passwords. Access granting refers audited permission workflow; resolving ticket does not silently alter accounts. Prevent duplicate parallel task status by linking one authoritative work task.

**Acceptance:** Request→assignment→shared task→resolution can be traced and unauthorized access grant remains denied.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_task
entity_resource
entity_person


###### Recruitment application/review — fields and constraints

ID: entity_recruitment · proposed · P0

cycle: term/unit/open-close dates. application: applicant_person_id or temporary applicant ID, cycle_id, minimal answers, stage, submitted_at. review: reviewer, rubric_version, explicit assessment, decision_at. Restrict reviewer notes and purge rejected records by approved retention; public recruitment portal remains separate scoped decision. Avoid medical/demographic profiling.

**Acceptance:** Reviewer-only information stays private; applicant stage and known criteria are explicit without inferred performance score.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_term
entity_unit
entity_person


###### Onboarding/development — fields and constraints

ID: entity_onboarding · proposed · P1

id, membership_id, checklist_template_version, owner, items with completion timestamps and evidence, due_on optional, completion_state. Templates create instance IDs, preserving history when checklist changes. Development activities are explicit member opportunities, not employee scoring. Private feedback restricted if collected. Link shared tasks rather than duplicating responsibilities.

**Acceptance:** Update template without rewriting completed member history; progress equals known completed items/required items.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_membership
entity_task


###### Strategy initiative/research — fields and constraints

ID: entity_initiative · proposed · P0

id, owner/unit, term optional, title, hypothesis/purpose, horizon Now/Next/Later, stage, decision_due_on, research_resource associations, related_project_id, dependency_edges. Horizon is deliberate prioritization, not predicted success. Evidence distinguishes planned study from findings; dependencies refer stable records. Budget/resource assumptions explicit.

**Acceptance:** Move horizon and open saved dependency/research; no unsupported organizational health or success score.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_project
entity_resource


###### Privileged audit event — fields and constraints

ID: entity_audit · proposed · P0

id, actor_auth_id/person_id derived server-side, organization_id, source_workspace_id, destination_workspace_id optional, action_code, record_type/id, sanitized_title_snapshot, server_occurred_at, correlation_id, revision_before/after and permitted safe_diff. Delete creates tombstone evidence without requiring live record join. Cross-workspace moves identify both affected scopes but reveal only authorized title/diff. Server events immutable through app; local PRD-editor history is not production organization audit. Import/service jobs record verified service actor plus initiating authorized member; do not impersonate an end user.

**Acceptance:** Required create/edit/delete/move commands preserve 100% of trusted actor/time/scope/revision/correlation fields. Source-only/destination-only/neither/both cases reveal 0 inaccessible titles/private diffs/secrets; import provenance never impersonates a trusted current actor.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_workspace
entity_person
data_identity


###### Export job and manifest metadata — fields and constraints

ID: entity_exportjob · proposed · P0

id, requested_by, authorized_scope, export_schema_version, app_version, queued/started/completed_at, state, entity_counts, checksum, attachment inclusion/gaps, expires_at, retrieval_object_key. Queue and retry bounded/idempotent; download rights rechecked. Partial/filtered record-only export explicitly labeled. Job must fail if completeness verification fails.

**Acceptance:** Interrupted/failed/incomplete generation never shows complete or replaces latest-complete. Completed job has exact included counts/checksums; revoked or expired retrieval yields 0 protected contents. Default bundle excludes provider bytes and optional native scope stays explicit.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** data_json


###### Import/migration job — fields and constraints

ID: entity_importjob · proposed · P0

id, source_export_id/hash, dry_run_result, owner_mapping, legacy_id_mapping, destination_id/environment, proposed_actions/counts, state, applied_at, operator. Repeat source import is idempotent; default empty destination. No unreviewed overwrite/auto-owner fabrication. Audit and pre-import archive reference retained.

**Acceptance:** 4 invalid dry-run cases (schema/checksum/FK/person mapping) cause 0 destination writes. Applying identical approved source twice creates 0 duplicate rows/events; exact applied/excluded/unresolved counts reconcile and original archive is retained.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_exportjob
data_restore


###### Resource/entity association — fields and constraints

ID: entity_attachmentassociation · proposed · P0

resource_id, entity_type/entity_id or typed join, relation_kind, added_by/at. Validate same organization and permitted association; same resource may support task/project/decision. Access is explicit policy intersection rather than automatic union widening. Avoid unconstrained polymorphic IDs without referential checks. Removed association does not destroy resource bytes.

**Acceptance:** Link/unlink resource safely while remaining uses persist and restricted resource policy remains enforced.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_resource
data_cardinality


###### Member view preference — fields and constraints

ID: entity_preference · proposed · P0

person_id, theme, language, reduced_motion, reduced_transparency, default_context, notification_preference, bounded saved_filter/views. Only interface labels translate; member content untouched. Preference scope per user, revision compatible across devices. Reset preferences does not reset organization records. Analytics/security settings are not member-editable preference flags.

**Acceptance:** Language/theme change preserves content/drafts; another member retains their own preference values.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation.

**Dependencies:** entity_person


###### Batch-scoped reporting assignment — fields and constraints

ID: entity_reportingassignment · proposed · P0

id, organization_id, term_id, child_unit_id, supervisor_unit_id or supervisor_role_grant_id, effective_from/to, created_by and revision. Exactly one active reporting parent per child/term under adopted policy; tagged supervisor relation validates same organization/term and rejects self/cycles/orphans. VP access derives from verified active role grant plus permitted reporting descendants, not title or current mutable global parent label. Close/replace assignment retains historical graph; activate batch after complete validated preview.

**Acceptance:** 2 terms retain distinct historical reporting maps; exactly 1 active adopted parent per child/term, with self/cycle/cross-org/orphan fixtures blocked. Current VP reads only verified permitted descendants; former role receives 0 newly protected rows.

**Owner:** Organization owner + technical maintainer

**Source / assumption:** Product org_reporting_graph/access_vp_scope requirements reviewed2026-10-03; relational proposal, unimplemented. Consultation fixture checks proposed 2026-10-03; evidence pending, adopted SOP still required.

**Dependencies:** entity_term
entity_unit
entity_role


##### Permission-aware search and aggregates

ID: data_search · proposed · P0

Search and counts apply the same server access rules as record detail. An unauthorized person must not discover restricted project titles, contact details, finance amounts or recruitment notes through autocomplete, chart totals, activity feeds or error messages. General resource search indexes metadata and approved text; credentials and private receipt contents are excluded. Search indexes honor revocation and deletion.

**Acceptance:** As unrelated member and revoked collaborator, run search/count/autocomplete/direct-ID/export fixtures against 5 restricted categories (project, contact, finance, recruitment, private note): zero unauthorized names/values/existence counts leak.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_permissions
data_limits


##### Organization-controlled archives and vendor exit

ID: data_exportownership · proposed · P0

Export packages belong to DWDG, stored in an approved restricted organizational archive with two custodians and encryption. Record where external documents reside and who can transfer ownership at handover. Use PostgreSQL/schema migrations, portable JSON/CSV and standard object manifests to reduce exit cost; auth and realtime integrations still require replacement work. Schedule an annual export drill.

**Acceptance:** 2 named custodians independently locate/decrypt/validate 1 current complete archive and schema/ownership manifest with individual credentials. Portable records/notes can be inspected without vendor tooling; external byte recovery is not implied.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infrastructure_accounts
reliability_encryption


##### Confirmed scale: roughly 40 members or more

ID: member-size · confirmed · P0

Initial organization scale is roughly 40 members or more, confirmed by user. Exact active users, planned growth, concurrent event peaks and alumni access are open. Size V1 for this modest workload, with a measured 100-member stress scenario to reveal brittle queries without premature enterprise infrastructure.

**Acceptance:** Capacity/cost scenarios cite confirmed starting scale separately from proposed stress load.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.


##### Audit visibility for moves, deletion and privacy

ID: data_auditscopes · proposed · P0

Server event retains original and affected workspace scope plus action/revision. The current-workspace Changes page can show an authorized move-out/deletion event even when the live record moved/vanished; unrelated workspace remains absent. Permission revocation immediately redacts inaccessible old/new values. Historical title snapshots do not bypass current sensitive classification. Privileged investigators have separate documented rights; ordinary activity search/export follows normal scope. Audit actor derives from authenticated server identity, never client field.

**Acceptance:** Move 1 record A→B, delete 1 record and revoke 1 viewer: source-only/destination-only/neither/both viewers each receive only authorized current-scope event/tombstone values. Zero forbidden title/diff/actor/existence/count leakage through search/export/old JWT.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User Workspace Changes requirement, 2026-10-03; production data/security proposal, unimplemented. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_permissions
security_audit


##### Bound audit growth and retain necessary history

ID: data_auditretention · proposed · P1

Record meaningful committed create/edit/delete transitions, not every keystroke/autosave draft. Retain small safe diffs, immutable IDs and revision; cap oversized text snapshots with checksum/reference and authorized retrieval if justified. Size audit separately because Changes history may outgrow task text. Proposed one-year history is an open retention choice; preserve necessary approval/legal accountability under adopted policy and purge/archive deliberately. Audit never stores credentials or entire private file bytes.

**Acceptance:** Measure 20,000 baseline/100,000 stress safe events separately with capped text snapshots; schema/index/archive growth forecast remains below adopted budget trigger. Purge/archive reconciles 100% of eligible/held IDs and stores 0 credentials/provider bytes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User Workspace Changes requirement, 2026-10-03; production data/security proposal, unimplemented. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_retention
costs_sizing
entity_audit


##### Enforce scope, cardinality and deletion constraints

ID: data_cardinality · proposed · P0

Specify each required/optional relation, uniqueness rule and deletion action in the schema/API contract. Use foreign keys and unique/exclusion constraints for supported cross-record invariants, plus trusted transactional validation for graphs, tagged references and conditional workflow rules; a row CHECK is not a general cross-table validator. Composite organization/scope checks prevent a valid foreign UUID from crossing boundaries. At most one default active term and one adopted active reporting parent; one active identical membership/assignee/participant pair. Retired people/units retain references. Optional relations may be null, never a guessed placeholder; no uncontrolled cascade may erase audit, approval or evidence history.

**Acceptance:** Invalid fixtures include unknown FK, cross-org FK, duplicate membership, duplicate assignee, duplicate collaborator, second default term, overlapping reporting parent, cyclic folder, cyclic prerequisite and prohibited cascade: all 10 are rejected without partial data. Valid nullable/history fixtures retain 100% of expected references after export/restore.

**Owner:** Engineering + data/process owner (named people TBD)

**Source / assumption:** PostgreSQL constraints, checked 2026-10-03: https://www.postgresql.org/docs/current/ddl-constraints.html . DWDG integrity cases are proposed. Consultation planning checked 2026-10-03; numerical targets are proposed DWDG acceptance, not measured results or vendor SLA.

**Dependencies:** data_identity


##### Idempotent commands with an observable commit result

ID: data_commands · proposed · P0

Consequential writes carry a stable operation UUID scoped by organization, verified actor and command kind, with payload fingerprint and expected revision. A trusted transaction claims the key, validates live permissions/state, commits the record change plus audit and stores the resulting IDs/revision. Retrying identical payload returns the original authorized result; reuse with changed payload fails. Pending/failed/committed are distinct; a timeout is not failure proof. Propose 30-day command-receipt retention and a 24-hour client retry window, separate from domain approval/payment/import duplicate constraints. After expiry the operator reconciles outcome before making a new command. No claim of exactly-once external delivery; optional external actions need their own correlated lifecycle. Durable domain IDs/unique target-review transitions prevent duplicate business effects after short-lived command receipts expire; do not rely on UI buttons or receipt TTL alone. The API must document how expired/unknown outcome keys are reconciled before a new create/approval command.

**Acceptance:** Send 10 identical parallel approval/create retries: exactly 1 domain transition, 1 canonical audit change set and one returned result ID. Reuse key with changed amount/revision rejects 100% of attempts. Inject failure before commit: zero partial rows/events; timeout after commit returns the same result on authorized retry. Receipt expiry prevents blind UI resend and exposes reconciliation guidance.

**Owner:** Engineering + data/process owner (named people TBD)

**Source / assumption:** Original DWDG command design; PostgreSQL transaction isolation, checked 2026-10-03: https://www.postgresql.org/docs/current/transaction-iso.html . Consultation planning checked 2026-10-03; numerical targets are proposed DWDG acceptance, not measured results or vendor SLA.

**Dependencies:** data_identity
security_permissions


##### An archive represents one consistent data boundary

ID: data_exportconsistency · proposed · P0

Full exports capture all included entities, native note revisions and approved history at one documented consistent snapshot or an explicit bounded write-quiescence boundary. Sequential paged REST reads taken at different moments cannot be labeled a complete consistent backup without reconciliation. Use a verified logical dump or trusted repeatable-snapshot export appropriate to the managed plan; record start/end, schema version, scope, counts and checksums. A failed/partial export is never promoted as the latest complete recovery generation. External links carry last verification/owner metadata; their provider bytes remain outside this boundary.

**Acceptance:** While 100 synthetic writes create/edit/link records during a 5,000-task export, restored data has zero dangling relations, zero impossible mixed approval revisions and exact manifest counts/hashes for its chosen snapshot. Interrupt one export and confirm latest-complete pointer stays on the prior verified generation. Ordinary members cannot retrieve the full archive.

**Owner:** Engineering + data/process owner (named people TBD)

**Source / assumption:** PostgreSQL SQL-dump snapshot guidance, checked 2026-10-03: https://www.postgresql.org/docs/current/backup-dump.html . Portable-export mechanism requires implementation proof. Consultation planning checked 2026-10-03; numerical targets are proposed DWDG acceptance, not measured results or vendor SLA.

**Dependencies:** data_identity
security_permissions


##### Restore identity mappings without reviving old sessions

ID: data_authrestore · proposed · P0

Separate portable person/membership/role history from provider-owned Auth internals. Restore immutable business person IDs and historical attribution; fresh destination authentication is established through approved identity verification and account mapping. Never import access/refresh tokens, password hashes, live sessions, provider secrets or unreviewed administrator links into a portable bundle. Keep unresolved accounts quarantined from access rather than guessing by display name. Reference supported provider primary IDs only; trigger/link failures must not orphan authorized signup. Restoring rows does not prove OAuth callbacks, revoked grants or successor login work.

**Acceptance:** For all active restored memberships, 100% of mappings are either verified to exactly one intended person or explicitly quarantined; zero guessed/duplicate active links and zero imported session secrets. Test member, lead, finance reviewer and custodian login with fresh tokens; a departed person and an old source-environment token receive zero protected rows/actions.

**Owner:** Engineering + data/process owner (named people TBD)

**Source / assumption:** Supabase user management, checked 2026-10-03: https://supabase.com/docs/guides/auth/managing-user-data . Re-linking/quarantine workflow proposed. Consultation planning checked 2026-10-03; numerical targets are proposed DWDG acceptance, not measured results or vendor SLA.

**Dependencies:** entity_accountlink
data_roles
security_secrets


##### Bounded API pages, filters and query budgets

ID: data_limits · proposed · P0

Default record/Changes page size proposed 50, maximum 100; larger reports use authorized bounded export jobs rather than whole-table browser fetch. Stable cursor includes sort key plus immutable ID; apply scope before counts, search and pagination. Whitelist filters/sorts and document each list/detail/mutation route, expected fields, error codes, revision/idempotency handling and effective limits. Note/form payload limits remain an explicit product decision, enforced identically client/server once adopted. Separate cold Auth/network timing from DB/API service latency; collect safe query plans/index evidence without enabling unsafe production analysis.

**Acceptance:** Requests for 101 rows are capped or rejected by the documented contract; invalid sort/filter returns a safe validation error and zero leaked titles. Paginate 1,000 permitted rows with equal timestamps: each appears once with zero skips/duplicates in a fixed snapshot. Representative list/save paths meet reliability_performance baseline while measuring response bytes and indexed query plans.

**Owner:** Engineering + data/process owner (named people TBD)

**Source / assumption:** Supabase query optimization, checked 2026-10-03: https://supabase.com/docs/guides/database/query-optimization . Page limits are proposed DWDG controls. Consultation planning checked 2026-10-03; numerical targets are proposed DWDG acceptance, not measured results or vendor SLA.

**Dependencies:** data_assumptions
data_identity


##### A steward owns shared reference data changes

ID: data_masterdata · proposed · P0

Treat units, batch reporting, role/action definitions, capability configuration, lifecycle codes and finance categories as shared reference data with a named steward and version. Propose a small request→validate→review→activate record for consequential configuration changes: intended effective date, affected records/views/grants, migration/backfill needs and owner. Ordinary label fixes need no heavy approval engine; permission/reporting/state changes require recorded review before activation. Historical code meaning remains interpretable. SAP master-data governance informs this lightweight method; DWDG does not adopt SAP software or enterprise replication.

**Acceptance:** Change 1 unit label and 1 reporting parent for a new term: preview lists exact affected grants/records, invalid cycle blocks activation, and prior-term attribution remains unchanged. Every active role/status/capability code has 1 named steward, meaning and version; zero unknown codes are silently coerced during migration.

**Owner:** Engineering + data/process owner (named people TBD)

**Source / assumption:** Method adapted from SAP central governance, checked 2026-10-03: https://learning.sap.com/courses/sap-master-data-governance-on-sap-s-4hana/introducing-sap-master-data-governance . DWDG implementation and staffing proposed. Consultation planning checked 2026-10-03; numerical targets are proposed DWDG acceptance, not measured results or vendor SLA.

**Dependencies:** entity_capability
entity_reportingassignment
entity_role
data_cardinality


##### Versioned handoff and independent-review controls

ID: data_processcontrols · proposed · P0

For adopted sensitive workflows record policy/version, responsible role, input revision, permitted transition, output/evidence and the next accountable recipient. Submission, independent review and payment/publication/signature recording are separate actions. Propose default finance self-approval denial, including role-switching/delegation by the same person; actual organization exceptions remain Open with explicit owner/rationale/mitigation and later review. A successor may receive pending work but cannot rewrite the historical decision actor. No general BPM engine is required: fixed V1 state transitions and canonical joins can implement the agreed paths.

**Acceptance:** Test submitter also holding reviewer role, expired delegate, missing reviewer, stale reviewed revision and skipped approval: all 5 unsafe transitions fail atomically. A valid handoff preserves the same request/project/resource IDs and names the next owner once. Each adopted exception is visible in authorized audit and has a documented mitigation; no unadopted SOP is fabricated.

**Owner:** Engineering + data/process owner (named people TBD)

**Source / assumption:** SAP separation-of-duties method, checked 2026-10-03: https://help.sap.com/doc/e9674bba2e9f423da76f05c02c4a8554/2605/en-US/Security_Guide_for_SAP_Business_ByDesign.pdf ; OWASP server authorization principles: https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html . Consultation planning checked 2026-10-03; numerical targets are proposed DWDG acceptance, not measured results or vendor SLA.

**Dependencies:** entity_approval
entity_role
data_identity


#### Authentication, permissions and privacy

ID: security · proposed · P0

V1 is an internal invite-only organization product. Server enforcement is mandatory for membership, scoped work access and sensitive finance/HR information. A polished local UI does not establish real account security. Maintain least privilege, recoverable offboarding and operational traceability while keeping the number of sensitive fields small. Use managed identity rather than inventing a password system.

**Acceptance:** Real multi-user tests show allowed and denied actions across every scoped role; no security claim rests only on a hidden UI control.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed.


##### Invite-only sign-in and membership approval

ID: security_auth · open · P0

Propose Google OAuth as primary sign-in, matched to an approved invitation/person membership; an email domain alone does not authorize entry. Invitations have expiry, intended email, scope, inviter and single-use acceptance. Provide an explicit unauthorized state and request-access contact. Confirm whether all members have eligible Google/UII accounts and whether external collaborators are admitted before finalizing fallback sign-in.

**Acceptance:** Valid invite joins 1 intended membership exactly once. Repeated, expired, revoked, wrong-email and uninvited acceptance are 5 denied fixtures; forged domain/first-signup admin receives 0 elevated grants. Account eligibility/fallback is explicitly decided before real onboarding.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_bootstrap
entity_invitation
entity_accountlink
security_revocationlive
security_web


##### Deliberate first-owner bootstrap

ID: security_bootstrap · proposed · P0

Select organization product owner and technical account owner by a documented decision, not a sample student email. First-owner setup is a one-time privileged configuration outside normal public signup; remove bootstrap privilege after use. Require two trusted named account custodians and a documented recovery method. Both must verify access before inviting the first production cohort.

**Acceptance:** One-time bootstrap is removed after creating approved owner. Race 10 unauthorized normal signups against bootstrap:0 administrators. Both 2 named custodians verify essential vendor access/recovery with individual credentials before first production invitation.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infrastructure_accounts
entity_role


##### Permission matrix and deny-by-default API

ID: security_permissions · proposed · P0

Approve rows for member, unit lead, project lead, restricted collaborator, finance approver, HR reviewer, organization admin and technical maintainer. Columns cover discover/read/create/edit/assign/approve/export/archive/delete/configure. Scope by organization, unit, project and record classification; explicit grant required for restricted work. Enforce through database policies/server functions, including attachments and aggregates, rather than client-side checks alone.

**Acceptance:** Coverage matrix exercises allowed and denied discover/read/create/edit/assign/approve/export/archive/delete/configure cells for every adopted P0 role/table/view/RPC. Zero unowned or implicit privileged cells remain; cross-org/unit/project denials apply through direct API, not hidden controls.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_roles
entity_projectunit
entity_resource


##### Sensitive finance and legal access

ID: security_finance · proposed · P0

Members see only their submitted request and allowed status; finance officers and authorized approvers see amounts/evidence needed for review; broader portfolio summaries expose only approved totals. Legal materials may carry restricted classification and sharing grants. Do not make receipt images, bank account references or confidential agreement notes organization-wide. Approval cannot be performed by editing a generic task status.

**Acceptance:** Requester-as-reviewer, unrelated member, expired delegate and stale approved revision are 4 denied direct-API cases with 0 leaked private evidence and 0 invalid decisions. Valid reviewer sees only adopted required fields; explicit exception SOP remains Open rather than assumed.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_permissions
entity_approval
entity_paymentrecord
data_processcontrols


##### Minimal HR and recruitment privacy

ID: security_hr · proposed · P0

General membership directory shows necessary organizational identity. Applications, reviewer notes and personal contact detail are restricted to designated reviewers and the applicant where applicable. Avoid medical information, government ID images and free-text sensitive profiling. Stage changes are explicit decisions with a responsible reviewer; dashboards report bounded counts without identifying rejected applicants.

**Acceptance:** Ordinary members receive 0 private candidate/reviewer/contact fields through detail/search/count/Changes/export APIs. Valid reviewer and permitted applicant cases are recorded separately; recruitment collection cannot pass launch before purpose/retention/authority is approved.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_permissions
entity_recruitment
data_retention


##### Privacy notice and data-use choices

ID: security_privacy · open · P0

Before collecting production member or applicant information, publish a plain-language notice: purpose, collected fields, visibility, hosting providers/region, retention, contact, correction/deletion request and relevant external links. Have DWDG/UII confirm organizational responsibility and applicable privacy requirements; this PRD does not certify legal compliance. Optional fields stay optional and analytics avoids tracking individuals beyond operational necessity.

**Acceptance:** 100% of production collection entry points link adopted notice and classify required/optional fields. A synthetic correction/deletion request reaches 1 named data contact with scope/date/decision tracking; no unsupported legal-compliance claim appears.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_vendor
data_dictionary


##### Administrator MFA and session safeguards

ID: security_mfa · proposed · P0

Require MFA for vendor dashboard custodians and privileged app roles where the chosen identity flow supports it; prefer authenticator-based MFA to paid SMS. Reauthentication protects exporting the whole organization, changing access and destructive restores. Time out especially sensitive views appropriately; clear auth/user cache on sign-out. Do not use one shared admin login or save credentials in resources. Free-plan server session-lifetime/inactivity/single-session features are not assumed; application step-up for consequential commands needs its own verified supported implementation. A browser idle screen lock alone cannot enforce server revocation.

**Acceptance:** Both 2 custodians demonstrate supported vendor MFA/recovery. Full export/access change/destructive restore each require adopted verified step-up path; unsupported paid session controls are not assumed. Sign-out/user-switch exposes 0 previous private cache/draft records.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_device
infrastructure_accounts


##### Shared computers and local cache boundaries

ID: security_device · proposed · P0

Offer remember-this-device deliberately and explain its impact. Persist safe UI preferences by default; restrict caching of sensitive HR/finance content. On logout, revoked account, organization switch or session failure, stop subscriptions, clear scoped private cache and require sign-in. Offline drafts are marked device-local and may contain sensitive text; disclose and allow clearing them without erasing server data.

**Acceptance:** Run logout, revoked account, organization switch and expired session in 4 shared-browser fixtures: subsequent user sees 0 previous private records/drafts and no live subscription remains. Device-local unsaved draft is labeled and can be cleared without deleting server data.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_privacy
security_revocationlive


##### Secret management and public configuration

ID: security_secrets · proposed · P0

Only project URL and intentionally public publishable key may reach the web bundle. Service-role credentials, DB passwords, SMTP/API keys, backup encryption keys and deployment tokens stay in restricted secret stores/CI and never in Git, browser storage, exported PRD state or logs. Use separate environment credentials with least scope; inventory rotation owner and expiry. Rotate immediately after suspected exposure.

**Acceptance:** Production bundle/source history/CI logs/portable exports contain 0 service-role/DB/SMTP/archive/encryption/session secrets. Cross-environment credential attempts fail. Every active privileged credential has 1 named owner, scope and rotation/recovery record.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.


##### Optional binary upload security gate

ID: security_uploads · deferred · P2

Default V1 uses native notes/folders/external links; safe URL/sanitizer checks remain active. Before optional native upload ships require private object authorization, short-lived downloads, server size/type checks, sanitized paths and non-overwriting immutable IDs. Decide scanning versus restricted accepted types; never label uploaded bytes safe solely from success. Default V1 does not carry this backend/storage maintenance burden or claim private file retrieval was tested.

**Acceptance:** Only if native uploads are adopted:100% of permitted private retrieval/type/size/path/revocation/recovery cases pass; all unauthorized cases fail and prior versions stay intact. Default release requires safe native-note/link handling and no upload backend.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_attachment
security_web
reliability_restore


##### Web application protection

ID: security_web · proposed · P0

Render member-entered text without executing markup/scripts; sanitize any intentional rich text. Apply restrictive security headers, sensible content-security policy, HTTPS, explicit auth redirects and safe external link handling. Privileged changes validate current membership server-side. Avoid fetching arbitrary private user URLs server-side. Dependencies and integrations get a small documented threat review focused on likely risks.

**Acceptance:** Stored script, unsafe URL scheme, arbitrary auth redirect, expired token, forged role and forbidden origin are 6 negative fixtures:0 script execution, open-redirect privilege bypass or unauthorized commit. Safe text/approved links still render in both languages.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_secrets


##### Operational audit trail

ID: security_audit · proposed · P0

Production server records immutable actor_user_id/person_id from verified session/service identity, organization_id, workspace/unit scope, action, record type/id, sanitized title snapshot, server timestamp, correlation ID and record revision. Permitted old/new field differences redact secrets and private HR/finance values. Never accept client-supplied actor authority. App privileges cannot edit events; database operators retain documented administrative power. Workspace Changes is a filtered presentation of authorized events; local editor logs are separate and explicitly device-local.

**Acceptance:** For create/edit/delete/approval/role-change/import fixtures,100% of committed required events retain trusted actor/time/scope/revision/correlation. Forged actor/time and ordinary event edit/delete fail; protected HR/finance/secrets occur 0 times in unauthorized Changes responses.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** entity_audit
data_validation
data_retention


##### Export authorization and archive handling

ID: security_exports · proposed · P0

Apply row/field access to CSV/JSON/native notes/link manifests; optional attachment bundle only if native-upload capability adopted. Full app export is privileged, reauthenticated, logged and retrieved with expiry. External provider bytes/permissions are outside scope, and downloaded package cannot be revoked later. Use restricted encrypted archive custody; never include login sessions/vendor secrets.

**Acceptance:** Member, lead and custodian exports reconcile exactly to allowed scopes/fields; every completed full archive has 1 safe audit result. Revoked user cannot retrieve an old export URL. No session/secret enters any permitted bundle.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_permissions
security_secrets


##### Offboarding with retained authorship

ID: security_offboarding · proposed · P0

Departure revokes current memberships, grants, sessions and subscriptions; revoke vendor dashboard/Drive access separately. Reassign outstanding tasks, approvals, external document ownership and operational custodianship using a handover report. Preserve authored history with inactive identity. Alumni access is a new explicit read-only grant, not an accidental surviving session. Target removal within one working day of authorized offboarding request.

**Acceptance:** Suspend 1 person with 2 memberships,1 delegation and 3 open obligations: next protected requests using old JWT are denied, obligations are explicitly reassigned/unassigned and 100% of historical authorship IDs persist. Restore of old data cannot reactivate person silently.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_revocationlive
data_people
reliability_succession


##### Permission tests are release gates

ID: security_tests · proposed · P0

Scenario matrix uses isolated real backend for unrelated/collaborating member, lead, approver, admin, expired invite and departed member. Test direct API/catalog/aggregate/record policies, not only UI visibility; validate clean install and upgrade. Default V1 resource tests are notes/folders/links. Optional native-file Storage authorization joins matrix only if adopted and must pass before shipping. P0 privacy failure blocks launch regardless of design polish.

**Acceptance:** 100% of adopted P0 table/view/RPC read/write/aggregate/export paths have at least 1 positive and 1 negative scoped assertion; allowed writes verify affected returned rows, not merely no exception. Any unauthorized exposure/commit or unmet matrix cell blocks release.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase RLS and production checklist, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/deployment/going-into-prod . DWDG permission rules proposed. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_permissions
security_revocationlive
environments_test
security_web
security_audit


##### Vendor and hosting-region decision

ID: security_vendor · open · P0

Confirm available region closest to members, organizational approval for off-campus hosted data, provider terms and identity/document ownership. Explain that using a certified provider does not certify DWDG processes. Keep provider inventory and data locations current. If UII requires a particular region or institution-owned account, treat it as a decision input before purchase rather than moving sensitive data first.

**Acceptance:** Each selected hosting/Auth/archive dependency has 1 verified account custodian, data-location/terms decision and documented institutional conditions. Zero unverified UII benefits or compliance certifications are used as launch evidence.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infra-accounts


##### Fresh grant checks survive a still-valid JWT

ID: security_revocationlive · proposed · P0

A valid identity token proves authentication, not current business permission. Scoped policies/commands read trusted live account-link, membership, grant expiry and record classification; user-editable metadata never supplies authority. After suspension/revocation commits, the next protected request must fail even with an unexpired old JWT. In-flight sensitive transactions serialize/recheck against revocation so no new action commits using removed approval rights. Stop realtime subscriptions and purge scoped UI cache on detection; already viewed/exported content cannot be recalled. Supabase Free cannot be assumed to include paid lifetime/inactivity/single-session controls; client idle lock is only a device-privacy aid.

**Acceptance:** Use the same old JWT before/after revoking 4 fixtures (unit member, project collaborator, delegate, finance reviewer): all new protected reads/mutations after committed revocation are denied or return zero rows, with zero new authorized audit mutations. Race 20 approvals against revocation: commits serialize before valid revocation or reject; no post-revocation approval succeeds. Reconnecting UI does not reshow removed cached private data.

**Owner:** Engineering + data/process owner (named people TBD)

**Source / assumption:** Supabase RLS JWT freshness and session plan limits, checked 2026-10-03: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/auth/sessions . Strong business revocation is a proposed server control, not a claimed Free Auth feature. Consultation planning checked 2026-10-03; numerical targets are proposed DWDG acceptance, not measured results or vendor SLA.

**Dependencies:** entity_accountlink
data_roles


#### Implementation architecture and maintainability

ID: engineering · proposed · P0

Define a coherent implementation before restart coding. Preserve Vite and vanilla JavaScript under current instructions; select reuse/replacement based on evidence. A modular shared foundation serves all capabilities and one database/authorization contract. Avoid services whose maintenance/cost exceeds a student organization's capacity.

**Acceptance:** 1. Architecture map connects modules/entities/UI/actions and deployment environments to this PRD without unnecessary infrastructure.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract


##### Modules with explicit responsibilities

ID: engineering-modules · proposed · P0

Proposed modules: shell/router; domain entities/validation; authorization/scoping; data repositories/transactions; locale/formatting; shared components/overlay/drafts; notifications; exports/imports; capability registry; observability. UI rendering does not contain direct privileged policy or unrelated provider credentials. Domain logic is reusable in forms, imports, server operations, and tests.

**Acceptance:** 1. A code change to permissions/status/date/currency rules has a single authoritative implementation and relevant checks.

**Owner:** Engineering

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** org_workspace_config
data_identity


##### Configurable capability registry

ID: engineering-capability-registry · proposed · P0

Workspace configuration points to allowed capabilities and settings, not scattered checks against division display names. Each capability defines record types, nav entry, permission actions, default fields/stages, validation, charts, exports and localization keys. Current Legal & Finance can share two capabilities; a future split preserves records and changes workspace mappings rather than duplicating logic.

**Acceptance:** 1. Rename a team and move a capability to a draft new workspace; no form/navigation hardcoded name breaks.

**Owner:** Engineering

**Source / assumption:** Flexible organization requirement

**Dependencies:** org_workspace_config
org_capability_owner


##### Small, versioned data-operation contracts

ID: engineering-api · proposed · P0

Define each operation with actor, organization/workspace/resource scope, input fields/limits, allowed transition, expected version, result, error, idempotency and audit event. Reads use pagination and permitted projections; writes return authoritative saved record/revision. Authorization happens on the server/policy boundary. Client hints improve usability but cannot bypass policy.

**Acceptance:** 1. The same allowed operation works from UI/import; rejected operation preserves draft and returns a understandable error.

**Owner:** Engineering

**Source / assumption:** Proposed API contract

**Dependencies:** data_validation
security_permissions


##### Transactions for multi-record actions

ID: engineering-transactions · proposed · P0

Project archive/membership move/legal approval number allocation/finance approval/task creation from resource/export manifest need an explicit atomic boundary or recoverable job. A partial failure cannot leave missing links, allocated duplicate numbers, orphan files, or success UI. Server records state and retry key before side effects; cleanup status is visible when external storage cannot be atomic.

**Acceptance:** 1. Inject1 failure between data update and history write:0 partial committed records or fake successful events.
2. Retry the same command3 times:exactly1 committed logical change set.

**Owner:** Engineering

**Source / assumption:** Existing backend integrity lessons; proposed production contract

**Dependencies:** data_concurrency
security_audit


##### One authoritative state, many views

ID: engineering-state · proposed · P0

Tasks/resources/projects have one stored identity and version across list, board, timeline, portfolio, reminders and capability views. Derived counts are computed from saved data with an explicit definition; no independent duplicated status fields drift. UI selection/filter/scroll are presentation state. Background refresh doesn't erase draft/selection or move keyboard focus unexpectedly.

**Acceptance:** 1. Change1 task from list/board/timeline:exactly1 stable task record changes and3 permitted views reconcile.
2. Reload/export retain100% of fixture IDs/relations, with0 view-specific shadow copies.

**Owner:** Engineering

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** data_identity
engineering-api


##### A shared error vocabulary

ID: engineering-errors · proposed · P0

Distinguish unauthenticated, forbidden, missing/archived, validation, stale/conflict, rate/quota, unavailable/network, file-provider denied, and internal failure. Translate user-facing recovery. Preserve entered work on recoverable failure; show retry/export/discard path appropriate to the action. Avoid generic 'Something went wrong' with no next step or logging sensitive error payloads.

**Acceptance:** 1. Representative errors have usable messages, preserved draft and diagnostic ID/operation context without secrets.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** security_web
data_concurrency


##### Draft storage, save truth, and offline boundary

ID: engineering-drafts · proposed · P0

Drafts can remain local per user/device while shared records are authoritative server data. Mark unsaved/pending/conflict states clearly. Proposal v1 does not promise full offline shared writes; users may draft offline and manually retry after reconnect. Logout clears sensitive drafts according to policy. No success toast before commit; optimistic updates have explicit rollback/recovery.

**Acceptance:** 1. Inject failed/offline/conflict outcomes on3 draft saves:0 typed-text loss and0 premature Saved labels.
2. Success appears only after authoritative acknowledgement; rejected writes preserve1 recoverable draft.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** data_concurrency
security_device


##### Schema/version and backward compatibility

ID: engineering-versioning · proposed · P0

Version entity schema, imports, exports, migrations, and app release. Older exports require validated explicit adapter, not blind JSON merging. Server and client compatibility window protects members with old tabs during deployment. Deprecate fields only after migration and rollback window. Upgrade old local stores on a copy before importing production.

**Acceptance:** 1. Old-tab write and old export import have predictable safe outcome; incompatible schema produces a clear non-destructive error.

**Owner:** Engineering

**Source / assumption:** User update-system requirement

**Dependencies:** data_json
releases


##### A maintainable change process for volunteers

ID: engineering-review · proposed · P0

Changes link to requirement/bug ID and explain behavior, affected data, risk, validation and rollback. Use code review for permissions/migrations/finance/state transitions; independent review may be another competent maintainer or documented second-person review. Keep short architecture/setup/runbooks in repository. Avoid custom frameworks/libraries requiring one-person expertise.

**Acceptance:** 1. A new student maintainer can run sandbox, understand module map, prepare a safe candidate and locate recovery guide.

**Owner:** Engineering + successor maintainer

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** environments_test
quality-defects


##### Dependency and update discipline

ID: engineering-dependencies · proposed · P1

Keep the dependency set small, pin reproducible versions/lockfile, review vulnerabilities/licenses, and update through sandbox/staging checks. Automated dependency PRs do not deploy without checks. Document Node/runtime versions, database extensions, auth/library versions, and supported browser baseline. Avoid runtime CDN dependencies for operational essentials.

**Acceptance:** 1. Fresh install/build using the lockfile works; a dependency upgrade passes the committed relevant tests and rollback criteria.

**Owner:** Engineering

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** security_vendor


##### Assets, bundle size, and media ownership

ID: engineering-assets · proposed · P1

Serve fonts/icons/wordmark locally where practical and licensed. Resource thumbnails are optional and bounded. No automatic full-resolution upload/download on list navigation. Large optical/shader assets are deferred if they degrade low-end phones, reduced motion, solid surfaces, or data usage. Core records stay accessible when an asset fails.

**Acceptance:** 1. Offline/cache/asset failure preserves text/action usability; first-view payload matches performance budget.

**Owner:** Design + engineering

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** design-reference


##### Stable links and authorized navigation

ID: engineering-routing · proposed · P0

Entity URLs contain stable IDs and context, not only names. Deep links recheck active membership and record permission. Rename/move/archive redirects or explains outcome; browser Back preserves meaningful filters/scroll. A copied link is not a permission grant. A deleted resource displays an authorized recovery/related-record option without leaking inaccessible titles.

**Acceptance:** 1. Open copied task/project/resource links in each role, after rename/move/archive/logout; each behavior is correct.

**Owner:** Product + engineering owners

**Source / assumption:** DWDG'ONE PRD restart and referenced product critique; proposed detailed contract

**Dependencies:** access_surface_scope
work_link_integrity


##### Deterministic date, currency, and status rules

ID: engineering-time-tests · proposed · P0

Use testable clock/date formatting adapters; store instants in UTC plus actual timezone where required, and dates as date-only types. IDR amounts use integer rupiah (or documented smallest unit), never unbounded float calculations. Status enum definitions include allowed transitions and reviewer rules. Unknown history remains null/unavailable.

**Acceptance:** 1. Execute before-midnight/after-midnight,date-only,timed-end and cancelled-event cases with exact intended Asia/Jakarta outcomes.
2. Finance fixtures use integer IDR and0 float rounding drift in allocation/payment reconciliation.

**Owner:** Engineering + QA

**Source / assumption:** Chart truth and IDR contract

**Dependencies:** data_dates
data_money


##### Metric definition lives with its source

ID: engineering-kpi-contract · proposed · P0

A metric specifies scope, units, status basis, date/window, exclusions, denominator, known-history start, missing/partial state, and detail query. It never becomes a decorative fictional organizational health score. Rollups remain accessible only within viewer scope. Completion count by current task date differs from immutable activity ledger and must be labeled.

**Acceptance:** 1. For a fixed fixture, every visible metric reconciles to export/list records and definition across language/theme/filter.

**Owner:** Product + engineering

**Source / assumption:** Experience chart truth; survey reporting need

**Dependencies:** analytics_metric_policy
analytics_progress
analytics_average


##### Archive, trash, purge, and undo semantics

ID: engineering-record-removal · proposed · P0

Separate reversible archive/soft delete from permanent purge. Ordinary deletion retains ID, links/history and undo ability for a defined window; parent deletion previews child/resource effects. Permanent purge requires permitted actor, retention checks, dependency resolution and explicit confirmation. Undo rechecks current permissions and concurrent changes; it can't overwrite someone else's later decision.

**Acceptance:** 1. Delete1 permitted3-record hierarchy through preview;0 hidden restricted child metadata is disclosed.
2. Where restoration is permitted, restore all3 stable IDs/relations without overwriting1 later conflicting change.
3. Permanent purge occurs only under the adopted retention/authorization process.

**Owner:** Engineering + data owner

**Source / assumption:** User undo/reliable errors contract

**Dependencies:** data_softdelete
access_action_matrix
data_concurrency


#### Changes · workspace history

ID: changes · confirmed · P0

A dedicated Changes destination shows successful additions, edits, deletions, moves, archives, restores, approvals and role/configuration changes within the viewer's allowed current workspace. This is a required product capability. Its detailed retention, event semantics and sensitive-field policies below are proposed. The PRD planning editor has its own separate local Changes view; it does not represent actual production collaborators.

**Acceptance:** For every adopted create/edit/delete/move/restore/approval/configuration command, 100% of committed required changes appear once in current authorized workspace with trusted actor/time/action. Unrelated workspace or protected field leakage is 0; planning-editor history is distinct.

**Owner:** Mahdy

**Source / assumption:** Current user direct request: change history add/edit/delete anyone on workspace only Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** security_audit
entity_workspace


##### A workspace page without adding project tabs

ID: changes-location · proposed · P0

Place Changes in workspace navigation or as the chronological Changes view within Updates, with an explicit stable destination and label. Keep project main tabs Overview / Work / Resources unchanged. Project/resource inspector can deep-link to Changes filtered by that record. Product owner's exact sidebar choice remains open; minimum is one findable page for workspace changes.

**Acceptance:** From each of 6 permitted workspace fixtures, a keyboard/touch member opens the stable Changes destination and filters one project; context remains the selected workspace. Project main-tab count stays 3: Overview, Work, Resources.

**Owner:** Design + product

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** changes-scope


##### Mutation event taxonomy

ID: changes-actions · proposed · P0

Record create, field edit, assignment, status transition, date update, move/reparent, archive, soft delete, restore, purge metadata, approval/rejection, membership/invitation change, capability/configuration change, resource revision, and import. Read/view/search events are not shown as edits. Failed/rejected attempts belong separate security/diagnostic logs when appropriate, not successful-change history.

**Acceptance:** Test each adopted taxonomy action plus failed/rejected/no-op save. Successful meaningful multi-field mutation has 1 coherent change set; failed/rejected/no-op save has 0 fake successful events. Read/search does not count as edit.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** entity_audit


##### Minimal event fields

ID: changes-event · proposed · P0

event_id; organization_id; workspace_id or authorized affected scope; entity_type/entity_id; action; actor_user_id and historical display snapshot; server occurred_at; old/new version; changed field names with permitted before/after values; source operation; correlation/idempotency identifier; human-readable summary; sensitivity/redaction metadata. System jobs show System with job identity, not a fictitious person. All identities/timestamps come from trusted server context. Canonical event_id and command correlation are distinct: one multi-field command may have one change set, while bulk commands group per-record events. This count convention is explicit in the API/export schema.

**Acceptance:** Forged actor, person ID, timestamp and version fields in 4 client requests are ignored/rejected; 100% of committed events have authoritative server identity/time/correlation/revision. System/import action states verified job actor and initiating operator separately.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** entity_audit
data_identity


##### Save and history commit together

ID: changes-atomically · proposed · P0

For database changes, write the event within the same transaction or trusted change-capture path. A committed record without its required event is a failure; event without committed record is also a failure. External file side effects have explicit pending/succeeded/failed lifecycle and correlation. Retry with the same operation ID does not duplicate the event.

**Acceptance:** Inject failure before record save, after record save/before event, and before response in 3 scenarios. First 2 commit 0 partial data/events; committed third returns its original result. 10 same-command retries produce exactly 1 canonical event/change set.

**Owner:** Backend owner

**Source / assumption:** Proposed integrity for required history Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** data_commands
data_validation
changes-actions
changes-event


##### Workspace-only visibility

ID: changes-scope · confirmed · P0

Default Changes displays current selected workspace only. Members see their division and permitted records; VPs see reporting scope only when explicitly choosing that workspace. Admin/President can choose allowed workspace but history does not silently combine all DWDG. If an aggregate view is later added it must be explicit, permission-scoped and separately approved. Filters/counts and notifications obey the same policy.

**Acceptance:** Use A-only, B-only, both-scope, neither and revoked viewers: 5 roles against current A/B context via history/search/count/page/export/direct-ID/cache. Each response contains only authorized current-workspace events; forbidden title/actor/field/existence leaks 0.

**Owner:** Authorization owner

**Source / assumption:** User workspace-only scope + earlier access rules Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** security_permissions
entity_workspace
data_auditscopes


##### Record and field permissions still apply

ID: changes-sensitive · proposed · P0

Workspace membership is necessary but not sufficient for restricted HR, candidate, legal, finance, credential references or private comments. Redact before/after data and optionally whole events according to record/field policy. Showing 'redacted' still must not leak confidential titles/actors/counts when even existence is restricted. No passwords/tokens/file bytes in audit content.

**Acceptance:** Inspect candidate evaluation, private contact, receipt/bank reference, restricted legal note and credential-reference fixtures: ordinary member sees 0 hidden fields/titles/counts through Changes/detail/export. Redaction is applied before payload construction, not hidden in CSS.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** changes-scope
security_finance
security_hr


##### Useful readable differences

ID: changes-diff · proposed · P0

For ordinary structured fields show Status: In progress → Done, Owner: A → B, Date: 5 Oct → 7 Oct, Folder: Research → Deliverables. Long notes show a bounded changed-text view with deliberate access checks and optional expanded detail; don't dump entire sensitive documents. Preserve original saved value types and UI localization separately. A history entry explains exactly what changed without inventing reasons.

**Acceptance:** Change status, owner, date, folder and note in 5 fixtures: rendered authorized before/after values equal saved typed diff in EN/ID. Member content translation count 0; bounded long-text preview never includes hidden private body.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** changes-event
changes-sensitive


##### Deleted records retain safe attribution

ID: changes-deletion · proposed · P0

Soft-deletion event retains stable record ID, permitted title snapshot, actor/time, affected record count and selected relationships, allowing a viewer to understand what disappeared. Deep links show Deleted/Archived plus permitted recovery if available. Permanent purge removes content according to retention/privacy policy while retaining only permitted operational metadata. Delete hierarchy changes explicitly list child effect, not 'Folder deleted' while files vanish silently.

**Acceptance:** Delete a 10-item synthetic folder containing 2 protected children: allowed viewer sees exact permitted subtree effect with 0 private child disclosure. Restore preserves expected IDs/relations; permanent purge follows adopted holds/retention and leaves only permitted metadata.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** data_softdelete
changes-event
changes-sensitive


##### Undo and restore are new changes

ID: changes-undo · proposed · P0

Undo does not erase the original history. Append an Undo/Restore event pointing to the original operation and record resulting versions. Recheck actor permissions and concurrent edits; sensitive approvals cannot be blindly reverted. A restoration preserves ID/links when policy permits. Show original edit and reversal together when helpful.

**Acceptance:** Edit→Undo→Redo yields 3 attributable committed changes with ordered revisions and correct final state. Stale/unauthorized reversal adds 0 successful events and retains draft; original event is never deleted to undo it.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** data_concurrency
data_softdelete
changes-atomically


##### Moves between workspaces

ID: changes-move · proposed · P0

Cross-workspace move checks permission and transfers ownership/scope through a reviewed operation. Source history records allowed removal/move-out; destination records allowed move-in. Neither side displays restricted old/new workspace content or private actor information outside authorization. Historical access policy after membership/workspace changes must be explicitly defined, not inferred from old membership. A canonical correlated move may render in each authorized affected workspace; do not create two independent contradictory audit facts. Multi-step approval of a move is distinct from its atomic committed scope transition.

**Acceptance:** Move 1 record A→B as authorized actor: source-only and destination-only see correct redacted move-out/in for their selected scope; both-scope can find 1 correlated command through either view, neither sees 0 records. A denied source/destination move changes 0 data/events.

**Owner:** Authorization + data owner

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** data_auditscopes
changes-atomically
changes-sensitive


##### Imports, bulk edits, and event groups

ID: changes-import · proposed · P0

Bulk action/import emits a correlated summary with affected counts and reviewable per-record changes under permissions. Preserve provenance source, importer and validated mapping; original external author/timestamps are labeled imported metadata rather than trusted audit actor/time. A grouped event can expand lazily; no hundreds of repeated toasts.

**Acceptance:** Import/bulk-update 100 permitted fixtures: group summary counts equal authorized applied records and per-record revisions; repeat same source/command creates 0 duplicate changes. Original imported author/time is labeled provenance, not trusted current actor/time.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** entity_importjob
data_commands
changes-sensitive


##### Date, actor, action, record, and project filters

ID: changes-filters · proposed · P1

Provide clear current-workspace identity, chronological ordering, date interval, actor, action, record type and optional project/record filter. Search only permitted summaries/field metadata. Stable cursor pagination orders server time with ID tie-break. Empty filtered results differ from no recorded history. Event count is allowed-scope count, not organization's hidden total. Pin an initial event watermark for a browsing session and offer newer events deliberately; stable equal-time ordering uses event ID. Server visibility is recomputed on retrieval/revocation.

**Acceptance:** With 1,000 events including equal timestamps, page size 50/max100, combined date/actor/action/type/project filters return exact expected permitted IDs. Fixed-snapshot pagination has 0 duplicates/skips; new live events do not disrupt scroll or leak global totals.

**Owner:** Design + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** data_limits
changes-scope


##### Detail link and accessible chronological UI

ID: changes-details · proposed · P0

Rows show actor, action, record/context, timestamp and concise changed-value summary with details control. Native keyboard actions and readable time formatting work in both languages/themes; live updates do not unexpectedly shift current scroll/focus. Deleted-user name remains historical where retention permits; avatar missing uses initials rather than broken image.

**Acceptance:** Keyboard/touch opens 1 diff, linked record and return-to-list at same focus/scroll position; test EN/ID, light/dark, 200% zoom and reduced motion. Missing actor image has readable fallback; 0 protected values bypass detail authorization.

**Owner:** Product + engineering

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** changes-diff
changes-deletion


##### Retention and operational storage budget

ID: changes-retention · open · P0

History is an append-only operational record, not indefinite full-document version storage. Proposed retention duration must be decided against organizational needs/privacy/free-tier capacity. Separate short-lived diagnostic logs from organization history. Archive/export older events deliberately with manifest, access controls and restore/read policy; never silently remove history solely to stay on a free plan.

**Acceptance:** Adopt an owner/effective-date/purpose policy covering 100% of history fields and approved held exceptions. Measure 20,000 baseline/100,000 stress safe-event bytes; expiry/archive dry-run exactly reconciles eligible/held IDs and does not silently remove required accountability.

**Owner:** President + data custodian

**Source / assumption:** Required history; retention period not supplied Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** data_retention
data_auditretention
costs_sizing


##### Authorized history export

ID: changes-export · proposed · P1

Changes export retains selected workspace/filters/timezone, event IDs, trusted actor/time, action, permitted diffs, versions and correlation. Export itself records a safe administrative/security event where appropriate. Do not export redacted hidden before/after values or unauthorized user data. Plain CSV quoting prevents cells starting formula characters becoming executed spreadsheet formulas.

**Acceptance:** Export 100 filtered permitted events: parsed row count and IDs/diffs match selected scope exactly, credential/hidden-field occurrences 0. Formula-like text is neutralized without altering canonical values; archive/CSV labels distinguish partial history report from full recovery.

**Owner:** Data owner

**Source / assumption:** User data export requirement + history request Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** data_csv
security_exports
changes-sensitive


##### Audit cannot be edited through ordinary UI

ID: changes-integrity · proposed · P0

Members cannot edit/delete audit events through history UI or API. Admin maintenance follows specific retention/purge operation and review; ordinary admin access is not a reason to fabricate changes. Integrity controls include trusted actor, server transaction and restricted write paths. Hash chaining or tamper-evident external archive may be considered later; v1 must not claim forensic immutability without proof.

**Acceptance:** Ordinary member, editor and app admin attempts to change actor/time/event content through direct API produce 0 changed audit rows. Authorized retention maintenance records 1 safe correlated maintenance result under adopted policy. No forensic immutability claim follows.

**Owner:** Security reviewer

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** security_audit
changes-atomically


##### Changes is different from release notes

ID: changes-system-history · proposed · P1

Workspace Changes records data/configuration actions by people/system jobs. App release notes record shipped code/product updates, version, migration impacts and operator; they live in Help/Settings or release announcement. Neither feature substitutes for security diagnostics, backups, or data version recovery. The local PRD editor's Changes logs planning edits only.

**Acceptance:** Task-owner change, deployed-version note and local PRD edit are 3 distinctly labeled sources/destinations. Code release alone produces 0 fabricated member data edits; workspace audit does not imply rollback of records or external files.

**Owner:** Product + operations

**Source / assumption:** User explicitly requested workspace-only Changes page, 3 October 2026 Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.

**Dependencies:** releases_changelog


##### Planning editor history and honest identity

ID: changes-current-editor · confirmed · P0

The delivered PRD editor logs edits for this one planning document on this device. It records local actions, not authenticated organizational collaborators, and labels the actor accordingly. Undo/Redo appends a history entry. JSON export retains planning history; imported history is marked external/unverified. Browser persistence is not a secure production audit backend.

**Acceptance:** Add/edit/delete/move/import/Undo local planning actions record expected entries; reload reproduces full exported revision/history where storage works, otherwise export-required is visible. Imported actors/history are labeled external/unverified; production authentication claims 0.

**Owner:** Planning tool owner

**Source / assumption:** Current user asks Changes while working on editable PRD; implementation boundary explicit Consultation checks proposed 2026-10-03; product server audit evidence pending, local planning tool evidence separate.


### Hosting, cost, environments, releases and recovery

ID: operations-planning · proposed · P0

Verified provider constraints and editable cost scenarios; account custody; isolated development/test/staging/sandbox/production; deployment/update/rollback; backup/restore; monitoring/support and next-batch continuity. Monthly target Rp 35,000, hard maximum Rp 50,000 including adopted recurring/amortized charges and fees. Free core services are proposals, not availability guarantees or substitute for independently proven recovery.

**Acceptance:** 1. Actual adopted monthly estimate aims ≤ Rp 35,000 and never exceeds Rp 50,000 without changed user instruction.
2. Production/sandbox are isolated with 0 real-data fixtures or privileged browser secrets.
3. Named operators execute 1 full recovery and 1 release/rollback rehearsal before launch dependence.

**Owner:** Mahdy + secondary operator + budget authority

**Source / assumption:** Current user real-launch/cost/data/export/environment/update request; latest confirmed budget retained.


#### Recommended architecture within Rp35k target/Rp50k cap

ID: infrastructure · proposed · P0

Use static Vite/vanilla app on free Pages subdomain plus Supabase Free PostgreSQL/Auth and invited Google OAuth as a budget-fit core. Native resources default to notes/folders/external links; binary uploads deferred unless separately adopted. Allocate permitted small budget to independent encrypted archive/recovery if needed; private R2 Standard is candidate after eligibility/actual-cost checks, with custodian Drive alternative. Managed Pro cannot fit ceiling. No vendor uptime/automatic managed DB backup implied; no microservices/bespoke password auth.

**Acceptance:** An architecture decision records services, data flow, authentication boundary, costs, owner and fallback before implementation.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.

**Dependencies:** costs-budget
security_vendor
infrastructure_accounts
costs_prototype


##### Request and authorization flow

ID: infrastructure_requestpath · proposed · P0

Browser loads versioned static assets via HTTPS, authenticates with managed invited OAuth, reads policy-permitted records and commits transactional writes to bounded server operations. Default resources are native notes/folders and provider links; opening a link is external navigation with independent provider permission. Sensitive server jobs use separate secrets. Optional future file downloads need private signed authorization; UI filters never grant data access.

**Acceptance:** Trace task completion, sensitive approval and complete-export commands through UI→verified identity→live permission→transaction→audit→response: all 3 include version/idempotency/error handling. Zero privileged credentials reside in client or public redirects.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_permissions
data_validation
security_audit
data_commands


##### Static hosting scope and limits

ID: infrastructure_static · proposed · P0

Cloudflare Pages is suitable for the existing static app; static requests are free/unlimited under the checked policy, whereas Functions share Workers billing. Free Pages includes 500 monthly builds and 25 MiB maximum asset size. Keep member uploads out of the deploy folder. Use restrained commit previews and bundled local fonts; a hosting provider change must not alter domain data.

**Acceptance:** Build/deploy size meets current limits; frontend refresh and direct route navigation work with correct security headers.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Cloudflare Pages pricing and limits, checked 2026-10-03: https://developers.cloudflare.com/pages/functions/pricing/ ; https://developers.cloudflare.com/pages/platform/limits/ . Static assets and dynamic functions have different billing.

**Dependencies:** releases_assets
security_web


##### Managed PostgreSQL baseline

ID: infrastructure_database · proposed · P0

Use one small managed PostgreSQL instance per needed hosted environment on Free initially. Relational constraints, policy-enforced access, paginated queries and narrow scope keep cost/load modest. Database size includes indexes and accumulated history, not merely raw task text. Connection pooling applies to direct server jobs if needed. A compute upgrade follows measured pressure or reliability requirements rather than assuming 40 members require a paid plan.

**Acceptance:** Baseline has 0 dangling cross-scope relations, documented indexes for representative permitted lists, and measured API/list p95≤1 s/save p95≤1.5 s under reliability_performance fixture. Managed-provider plan eligibility/actual limits remain separately checked.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_dictionary
data_cardinality
security_permissions


##### Bounded realtime use

ID: infrastructure_realtime · proposed · P1

Subscribe only to the active project/work context where shared changes provide value. Close subscriptions on route change/sign-out; use debounced refresh and avoid broadcasting keystrokes or the entire record set. Realtime is a convenience; authoritative state comes from saved versioned records. V1 notes do not promise Google Docs-style simultaneous editing. Visible conflicts and refresh-on-return cover ordinary collaboration. Realtime is an optional transport optimization, not the permission/commit source of truth. Where not adopted, scoped manual refresh/bounded polling still exposes acknowledged current state without overwriting drafts; its transfer/latency is measured separately.

**Acceptance:** Open/close/switch a route 20 times: active connection/subscription count returns to baseline without accumulating. Another saved update appears while draft/focus survives; revoked scope returns 0 new protected payloads. Polling/realtime usage fits measured cost envelope.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_concurrency
security_revocationlive
data_limits
costs_triggers


##### Few server operations with bounded execution

ID: infrastructure_functions · proposed · P1

Use server functions only where needed: privileged transactions, invitations, scheduled backup/export orchestration and optional reminders. Each job validates identity/scope, carries idempotency key, has execution timeout, retry ceiling and failure status. Routine CRUD can use policy-protected managed APIs. Do not introduce a second general backend runtime merely for a simple UI action.

**Acceptance:** Retry task/approval/export 10 times with same command ID:1 authorized result/change set. Invalid scope or timeout-before-commit leaves 0 partial rows; timeout-after-commit is reconciled from committed receipt rather than duplicate creation.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_validation
data_commands
reliability_retry


##### Transactional email as a deliberate service

ID: infrastructure_email · open · P1

Primary login proposal is invited Google OAuth with no required auth email delivery; the administrator creates application invitations and members use an approved invitation URL in the existing authorized organizational channel. The system does not send messages to people as part of this PRD. In-app updates are default. Email recovery/invitations/magic links or alerts require verified custom SMTP and costs; bundled Supabase SMTP cannot be treated as production delivery. This is optional P1: default invited Google OAuth and in-app notifications must work with zero transactional emails; no default launch dependency requires a paid SMTP account.

**Acceptance:** Conditional email gate: if adopted, valid invitation/recovery messages reach at least 3 authorized test recipients outside vendor team, bounce/quota failure has a truthful support path, and exact daily/monthly rate/cost fits the budget. Default OAuth/in-app mode performs 0 required SMTP deliveries.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase custom SMTP, checked 2026-10-03: https://supabase.com/docs/guides/auth/auth-smtp . Delivery must be validated separately.

**Dependencies:** costs_email
security_auth


##### Free subdomain first; organization domain deferred

ID: infrastructure_domain · proposed · P0

Confirmed: no organization domain exists. Use a stable free Pages subdomain for the first launch; choose ASCII slug separately from DWDG’ONE display branding and verify availability later. Two hosting administrators protect continuity. Configure HTTPS and exact OAuth redirects for production/staging. A purchased custom domain and branded Supabase API domain are optional later budget decisions, not launch blockers.

**Acceptance:** Default free subdomain serves HTTPS and exact allowlisted production OAuth callbacks/deep routes; no paid domain or annual renewal is required. If own domain later adopted, verified quote/authorization/renewal custodian and separate upfront approval apply before activation.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.

**Dependencies:** infrastructure_accounts
security_web


##### Pragmatic vendor lock-in boundary

ID: infrastructure_portability · proposed · P1

PostgreSQL migrations, SQL business rules, resource manifests and portable exports make the data movable. Supabase Auth identifiers, RLS helpers, realtime and Storage links are integration-specific; document adapters and person-to-account mapping rather than pretending migration is automatic. Keep URLs/config out of domain records except provider resource links. Annual restore/export drill estimates exit effort.

**Acceptance:** A portable archive can be read without vendor tooling; replacement obligations are named in the architecture decision.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_exportownership
data_manifest


##### Self-hosting is deferred unless ownership changes

ID: infrastructure_selfhost · deferred · P2

A cheap VPS has visible invoice savings but adds patching, DB backup verification, mail delivery, monitoring and on-call recovery for student maintainers. Do not assume a donated server is costless or reliable. V1 uses managed services unless an institution offers a supported server with named operator, backups, access and recovery duties. Compare total monthly effort and handover risk, not only rental price.

**Acceptance:** Any self-hosting proposal includes named operator, maintenance schedule, recovery drill and total-cost comparison before adoption.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** costs-budget


##### Scale only after measured pressure

ID: infrastructure_scaling · proposed · P1

Optimize query scopes/indexes and attachment policy first; then increase managed compute or specific quota if measured load requires it. V1 supports future unit/term changes and modest organization growth through configuration; public multi-organization onboarding, per-tenant billing and high-volume collaboration are deferred. Avoid partitioning/sharding or separate databases per division.

**Acceptance:** A scaling decision cites latency/error/usage measurements and budget impact; a division addition requires no data copying.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** costs_triggers
reliability_performance
data_organization


##### External integrations remain optional adapters

ID: infrastructure_integrations · deferred · P2

V1 stores useful Drive/Canva/Sheets links and opens the provider. Calendar synchronization, WhatsApp delivery, social publishing, bank connections and electronic-signature execution are deferred until permissions, credentials, cost and failure behavior are separately specified. An unavailable integration cannot block core task saves. Describe recorded signature/payment status truthfully without implying an external transaction occurred.

**Acceptance:** Every V1 integration is labeled link-only or operational; unavailable providers show repair guidance while core work remains usable.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.

**Dependencies:** data_linkfirst
security_secrets


##### Confirmed no domain or shared Drive exists

ID: infra-accounts · confirmed · P0

The user has no organization domain or shared Drive account. Avoid claiming either already exists or is institutionally provided. New free hosting/database/GitHub/OAuth/archive custody arrangements are proposed work. Resource links may remain individually owned until an explicit custodianship plan is approved. Free shared My Drive folder and Google Workspace Shared Drive are different ownership models.

**Acceptance:** Architecture and onboarding reference actual verified accounts only, with no assumed UII entitlements.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.


##### Create custody plan with individual access

ID: infrastructure_accounts · open · P0

Propose an organization-designated primary custodian account for archive ownership, with two named successors given individual folder/operator access and documented recovery. Avoid password sharing or a generic login used by everyone. Hosting/GitHub/Supabase should use team invitations where free plan allows. Google My Drive ownership stays with individual file creators unless deliberately transferred; folder sharing alone does not transfer every file. Account setup/transfer permissions remain unverified.

**Acceptance:** Primary/backup operators independently access test archive/vendor project; file ownership and handover steps are documented.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Google storage and shared-drive ownership, checked 2026-10-03: https://support.google.com/googleone/answer/9004014 ; https://support.google.com/a/users/answer/7212025 . Actual UII entitlement unverified.

**Dependencies:** infra-accounts
security_secrets


##### UII education entitlement is unknown

ID: infrastructure_entitlement · open · P1

Do not assume UII email grants Shared Drives, expanded storage, SMTP, subdomain, SAML SSO or server resources. A named organizational contact may check the actual entitlement and allowed use later. First plan remains functional on ordinary eligible Google accounts and free hosting. If institutional resources exist, confirm access/ownership/retention and whether graduation revokes them before migrating data.

**Acceptance:** Any institutional dependency has evidence of entitlement/terms and a successor access plan.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Google storage and shared-drive ownership, checked 2026-10-03: https://support.google.com/googleone/answer/9004014 ; https://support.google.com/a/users/answer/7212025 . Actual UII entitlement unverified.

**Dependencies:** infra-accounts


##### Cloudflare D1 alternative: lower cash, more responsibility

ID: infrastructure_d1alternative · deferred · P2

Workers+D1 can be a free-cost alternative with checked 5 million rows read/day, 100,000 written/day and 5 GB total account storage. It requires server API, Google OAuth/session handling, authorization, file access and migration work rather than reusing managed Supabase identity/RLS directly. Free limits can stop queries and index writes count toward usage. Evaluate only if pause/reliability tradeoff makes Supabase unsuitable; do not build bespoke password auth or claim D1 itself supplies the complete product backend.

**Acceptance:** Alternative ADR covers identity/session security, permissions, recovery, workload and operator effort before replacing baseline.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Cloudflare D1 pricing, checked 2026-10-03: https://developers.cloudflare.com/d1/platform/pricing/ . Backend/auth engineering is a DWDG cost assumption.

**Dependencies:** costs-budget
security_permissions
data_manifest


#### Monthly operating budget and cost controls

ID: costs · confirmed · P0

Latest confirmed budget is target Rp 35,000/month where feasible and hard ceiling Rp 50,000/month; the earlier near-Rp 0 preference is superseded. Do not spend merely to reach target. Keep free core services when viable, with a small deliberate budget for independent recovery/storage and contingency. Ceiling includes recurring invoices, annual charges amortized monthly, tax, payment/card fees and email/backup/domain if used. Exact quotes/eligibility remain Open. USD examples use editable Rp 16,500/USD planning assumption, not live FX. Nothing purchased/provisioned.

**Acceptance:** Selected all-in recurring estimate includes 100% of vendor/annual-amortized/tax/payment/SMTP/archive/domain lines:≤Rp 35,000 target or documented justified variance, always≤Rp 50,000 hard ceiling. Zero unapproved automatic paid upgrade/overage remains enabled.

**Owner:** Treasurer + organization owner + technical maintainer

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs-budget
data_assumptions


##### Worked workload and storage estimate

ID: costs_sizing · proposed · P0

For proposed 60-account/15-concurrent envelope, 5,000 tasks at illustrative 2 KB ≈10 MB raw task text; relations/comments/indexes/audit/note versions add overhead. Proposed DB target 200 MB is measured against actual seed/schema. Default free V1 has 0 native-upload bytes and 200 linked resources; external file bytes do not consume app file-storage quota. At 20 MB compressed record export, 30 copies transfer ≈600 MB/month before ordinary traffic. Future optional 200 files ×1 MB =200 MB/year is separate scenario.

**Acceptance:** Measure baseline 60 accounts/5,000 tasks/200 links/20,000 audit events, with 0 native uploads, and record DB/index/history bytes plus 30-day API/export traffic forecast. Planning stays below 70% of applicable quota or has reviewed response; substitute actual readings after first pilot month.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_assumptions
data_retention


##### Supabase Pro is outside current budget

ID: costs_managed · deferred · P2

Checked Pro base is approximately $25/month for subscription plus one Micro after credit; at planning Rp 16,500/USD≈ Rp 412,500 before tax/fees. This exceeds Rp 50,000 hard cap and is not an approved launch option. Managed daily DB backups/larger quotas would need changed funding or institutional entitlement, both unconfirmed. It still does not independently retain external documents or optional native file bytes. Keep price as scale/reliability tradeoff information only.

**Acceptance:** Recheck chosen plan/compute and actual invoice preview; architecture stays within budget at measured pilot usage.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing, checked 2026-10-03: https://supabase.com/pricing . USD published quotas; recheck account allowances and billing before launch.

**Dependencies:** costs-budget


##### Continuous paid staging also exceeds ceiling

ID: costs_twoprojects · deferred · P2

Two continuously running paid Micro projects have checked illustrative base $35/month; at planning Rp 16,500/USD≈ Rp 577,500 before tax/fees, well above Rp 50,000 cap. Paid hourly restore/staging can also create unapproved bill. Use allowed isolated free project/local disposable test under current budget. Retain this paid price as explicitly excluded alternative, not a default or hidden prerequisite.

**Acceptance:** Budget distinguishes one-production-project and production-plus-staging scenarios; no accidental unused project remains billable.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase billing FAQ, checked 2026-10-03: https://supabase.com/docs/guides/platform/billing-faq . Compute is project-specific and hourly.

**Dependencies:** costs-budget
costs_freeprojects


##### Budget-fit first launch with free core

ID: costs_prototype · proposed · P0

Pages+Supabase Free is proposed core within Rp 35,000 target/Rp 50,000 ceiling, with native notes/folders/links and 0 mandatory binary uploads. Actual independent archive may incur small approved cost. Requires measured queries/transfer, record-note-link export/restore, invited membership, two custodians and pause/restriction handling. External document bytes remain provider-owned; critical evidence needs separate continuity. No assumption every dependency is forever free or Pro is affordable.

**Acceptance:** Before general launch, participants see truthful pilot/candidate status and operating limits; 1 complete independent export/restore and measured quota report exist. General-production label follows launch_gate, not a free-price or prototype claim.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing/backups, checked 2026-10-03: https://supabase.com/pricing ; https://supabase.com/docs/guides/platform/backups . Default DWDG file policy proposed.

**Dependencies:** costs_freeprojects
costs_freeactions
data_linkfirst
infra-accounts


##### Worked budget A: free core with small archive cost

ID: costs_monthlyA · proposed · P0

Illustrative core: Pages static/subdomain $0 + Supabase Free $0 + invited OAuth $0 mandatory email. Candidate R2 Standard 20 GB-month total, within operation allowances:10 GB free + 10×$0.015=$0.15≈ Rp 2,475 at assumed Rp 16,500/USD. Add Rp 2,000 placeholder tax/card/payment allowance→Rp 4,475; optional Rp 10,000 contingency reserve→Rp 14,475 planned envelope, below Rp 35,000 target and Rp 50,000 ceiling. Actual R2 eligibility/minimum transaction/rounding/tax fees unconfirmed; existing usable free archive may lower cash to Rp 0. Reserve is unspent availability, not an invoice.

**Acceptance:** Replace every unquoted charge/eligibility placeholder before adopting: illustrative Rp 14,475 envelope is not an invoice. Actual selected all-in recurring cost+agreed reserve targets≤Rp 35,000 and never exceeds Rp 50,000; annual upfront items are separately approved.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_backup
costs_freeactions
infrastructure_accounts
costs-budget


##### Worked budget B: domain is optional; Pro exceeds ceiling

ID: costs_monthlyB · deferred · P2

No domain is needed. Illustrative unquoted annual domain allowance Rp 180,000/year amortizes Rp 15,000/month; adding example Rp 4,475 archive/fees and Rp 10,000 reserve gives Rp 29,475 planning envelope, under Rp 35,000 target. Annual Rp 180,000 cash upfront is separate and requires approval/actual registrar initial-renewal-tax quote; this is not a purchase recommendation or quote. Supabase Pro $25≈ Rp 412,500/month at planning FX, far above Rp 50,000 cap; paid staging/SMTP also cannot be silently adopted. Stay free-core or choose another verified within-cap service. This optional-domain scenario is deferred with domain purchase and is not required for launch_funding; paid Pro is an excluded comparison, not a prerequisite for this scenario.

**Acceptance:** If domain adopted, exact first-year/renewal/tax quote and annual upfront approval are recorded; monthly amortized all-in total stays≤Rp 50,000, preferably≤Rp 35,000. Unquoted Rp 180,000/year illustration is not a purchase. $25 Pro is excluded by current ceiling.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_domain
costs_backup
costs-budget


##### Email quota and onboarding burst costs

ID: costs_email · open · P1

Google OAuth plus in-app updates has no mandatory SMTP invoice. Optional Resend Free has checked 3,000/month and 100/day; eligibility/domain verification/delivery/Auth limits need test. Its listed $20 Pro is≈ Rp 330,000 at planning FX before fees, outside cap. Do not introduce paid email as hidden dependency or promise free delivery. If production email necessary, research verified sender/provider all-in cost within Rp 35,000 target/Rp 50,000 cap before adoption.

**Acceptance:** Default OAuth/in-app mode has 0 mandatory SMTP deliveries/cost. If email is adopted, simulate approved onboarding/recovery burst against exact daily/monthly Auth/sender limits and quote: within all-in Rp35,000 target/Rp50,000 ceiling, with failures and required sender/domain setup proven.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Resend transactional pricing, checked 2026-10-03: https://resend.com/pricing . Recheck quota and SMTP eligibility before selecting.

**Dependencies:** costs-budget
infrastructure_accounts


##### Optional domain must fit monthly ceiling and upfront approval

ID: costs_domain · deferred · P2

No domain exists; stable free Pages subdomain is default. A future domain requires exact initial/renewal/tax quote and custodian. Monthly amortization counts against Rp 35,000 target/Rp 50,000 hard ceiling; annual upfront payment is a separate explicit cash decision. No TLD/domain/yearly price adopted and UII subdomain entitlement unverified. Do not purchase only to spend budget.

**Acceptance:** Record exact first-year/renewal quote and approval; domain lives under institutional/organizational custody.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.

**Dependencies:** infrastructure_domain
costs-budget


##### Prioritize small-budget independent backup storage

ID: costs_backup · proposed · P0

Target Rp 35,000/hard cap Rp 50,000 allows a deliberate small independent-archive budget if needed. Candidate private R2 Standard provides standard object credentials suited to restricted CI; current allowances/rates suggest small archive cost, but account eligibility/payment setup/rounding/tax/card fees and spend controls remain Open. Alternative: newly arranged restricted custodian Drive folder, measuring available shared 15 GB quota and verifying OAuth lifetime/ownership. Neither account exists by assumption; no payment or automation provisioned.

**Acceptance:** Quote/verify 1 actual independent archive destination, with 7 daily + 4 weekly + 3 monthly retained complete app-record/note/link generations and measured operations/transfer/fees. All-in cost≤Rp 50,000, preferably≤Rp 35,000. No provider document bytes are assumed included.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision 2026-10-03; R2 pricing checked 2026-10-03:https://developers.cloudflare.com/r2/pricing/ ; Google standard storage:https://support.google.com/googleone/answer/9004014 . Actual account costs/eligibility unconfirmed. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infrastructure_accounts
costs_freeactions
data_assumptions


##### Optional upload quota guardrails

ID: costs_storage · deferred · P2

Default free V1 native-upload volume is 0; linked documents/native note text live under separate provider/DB budgets. If uploads later adopted, propose 5 MB preferred/10 MB hard file ceiling and 500 MB app total including current+retained revisions, below provider quota. Warn/review/restrict nonessential uploads at 70/85/95% app budget while preserving reads/export. Do not treat provider 1 GB allowance as unlimited evidence archive. Cleanup respects retention/relations.

**Acceptance:** Usage panel reconciles bytes and versions; an oversize file is rejected with link-based alternative and no data loss.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** data_attachment
costs-budget
data_retention


##### Measured cost triggers and response

ID: costs_triggers · proposed · P0

Review monthly: registered/active users, DB disk, optional uploaded bytes/revisions if adopted (zero default), egress, realtime peak/messages, function invocations, email daily/monthly volume, preview builds and backup bytes. Proposed escalation: sustained 70% included quota, any unexpected paid line, DB p95 latency >1 s, backup failure or month estimate above approved ceiling. Response is diagnose query/file abuse first, then conscious plan/quota change; do not automatically raise spend.

**Acceptance:** Proposed vendor usage alerts at 70/85/95% and budget forecast warnings at Rp 35,000/Rp 45,000 reach named owners. At 100% quota or forecast>Rp 50,000, stop expansion/optional costly jobs and apply reviewed continuity response; never silently omit recovery data or auto-upgrade.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs-budget
costs_sizing


##### Spend caps do not cap the whole bill

ID: costs_spendcap · proposed · P0

Leave supported Supabase Pro spend cap on initially and understand that exceeding covered quotas may restrict service. Compute, branching, replicas, backend custom domains and provisioned disk performance are excluded from that cap. Other vendors have separate billing controls. Only billing owner may approve paid add-ons or additional environments; usage alerts are not a universal hard stop. Before any metered paid account is adopted, document bounded archive-job credentials/operation limits and actual available billing controls. Where a universal hard cap is unavailable, forecasts/alerts alone cannot guarantee the ceiling; choose a verified nonbillable destination or keep funding/containment decision Open before reliance.

**Acceptance:** Treasurer reviews 100% of covered/excluded bill items and actual account controls;1 new paid dependency cannot be enabled without recorded within-cap decision. Billing alert is not described as enforceable universal hard cap.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase cost control, checked 2026-10-03: https://supabase.com/docs/guides/platform/cost-control . Not every charge is capped. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_owner
costs-budget


##### Avoid unnecessary paid extras in V1

ID: costs_optional · proposed · P1

Exclude paid Supabase Pro/PITR/API custom domain, SMS MFA, log drains, analytics/search SaaS and managed queues under current cap unless later quoted within new approved conditions. Checked Workers Paid minimum $5≈ Rp 82,500 at planning FX also exceeds Rp 50,000 hard maximum before fees; static frontend requires none. Budget-fit archive is more valuable than decorative add-ons. Tight quota/recovery need triggers explicit alternative within cap or a new funding decision, never hidden upgrade.

**Acceptance:** Chosen V1 inventory contains 0 unapproved paid add-ons; every proposed addition names monthly/annual/tax/payment cost, owner and affected recovery/UX. No spending is incurred during planning.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Cloudflare Workers pricing, checked 2026-10-03: https://developers.cloudflare.com/workers/platform/pricing/ . Optional service, not required baseline. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs-budget


##### Billing owner, funding and cost review

ID: costs_owner · open · P0

Name Mahdy/approved product custodian, secondary operator and budget authority; actual billing identity/payment method still Open. Free dependencies need custody; any paid archive/domain requires deliberate reviewed quote, target Rp 35,000 and hard Rp 50,000 all-in monthly total. Track annual upfront separately and confirm funding before commitment. Never use a graduating developer sole personal card/account. Monthly usage/invoice and quarterly free-tier review remain necessary. No payment is attached/provisioned here.

**Acceptance:** 2 named custodians cover each critical vendor/billing/recovery dependency with access verification date and funding source. Payment authority is documented independently from technical admin; no sole personal card/account is assumed organizational continuity.

**Owner:** Treasurer + organization owner

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infra-accounts


##### Confirmed target Rp35,000/month; hard ceiling Rp50,000

ID: costs-budget · confirmed · P0

User latest decision: aim around Rp 35,000/month if possible; maximum Rp 50,000/month. This replaces earlier preference for near-zero cash. Free services remain sensible; there is no minimum spend. Budget must include all vendor recurring costs, amortized annual charges, tax/card/payment fees and optional SMTP/archive/monitoring. Exceeding target needs a concrete explained need; exceeding ceiling is not permitted without new user instruction. No services paid/provisioned here.

**Acceptance:** Actual selected all-in recurring estimate targets≤Rp 35,000 and never exceeds Rp 50,000 without new user instruction; every annual item has monthly amortization and separate upfront authority. Eligibility/fees verified, unspent reserve not an invoice and planning performs 0 purchases.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.


##### Free project slots and environment allocation

ID: costs_freeprojects · proposed · P0

Supabase Free checked allowance is two active projects for the applicable account constraints; confirm actual organization/account limits before setup. Allocate production one slot and isolated hosted staging/training one slot if available. Use local tests for branch work. Additional sandbox environment is not created just because frontend previews are free. Account limits, pauses and restore destination may require controlled scheduling of the nonproduction slot. A paid additional project is outside the current ceiling unless separately funded and approved; it cannot quietly become a launch prerequisite.

**Acceptance:** Environment inventory uses no more than actual verified free active-project allowance (checked planning allowance 2); production is untouched while a separately isolated slot supports rehearsal/restore. If the second slot is unavailable, its local/controlled-hosted verification alternative and remaining launch gaps are explicit.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing, checked 2026-10-03: https://supabase.com/pricing . USD published quotas; recheck account allowances and billing before launch.

**Dependencies:** infrastructure_accounts
costs-budget


##### Free CI and backup scheduling estimate

ID: costs_freeactions · proposed · P0

GitHub Free private repositories have checked allowance of 2,000 standard-runner minutes/month and 500 MB artifact storage, shared by owner account allowances. Illustrative 30 nightly backup runs ×5 minutes =150 minutes; 50 verification runs ×6 minutes =300, total 450 before retries/other repos. Use Linux small jobs, no plaintext backup artifacts/cache or commits. Stop paid overage and monitor allowance; free quota is not exclusively reserved for DWDG.

**Acceptance:** Measure actual job minutes/owner allowance: illustrative 30×5+50×6=450 minutes before retries/other repositories, compared with checked 2,000 standard-minute allowance. Plaintext member data in repo/log/artifacts/cache 0; paid overage cannot silently start.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** GitHub Actions billing/scheduling, checked 2026-10-03: https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule . DWDG automation not created. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infrastructure_accounts
costs-budget


##### Backups and repeated files consume free egress

ID: costs_freeegress · proposed · P0

Default V1 egress includes permitted record queries/native notes and independent records export, with external link opening charged by provider policy rather than app file delivery. Repeated full-table fetches can still exhaust quota. If binary uploads later adopted, user downloads/preview and blob copies add transfer; use verified incremental retention and manifests. Track actual aggregate egress with 70/85/95% alerts and never silently skip recovery-critical records/files.

**Acceptance:** Vendor measured 30-day transfer includes member reads/native notes and archive exports; proposed 70/85/95% alerts and projected total remain within verified allowance. Default native uploads 0; no recovery-critical records silently skipped to hide overage.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** DWDG’ONE operations proposal, 2026-10-03. Not yet an adopted organizational policy or verified implementation. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_triggers
data_manifest


#### Production, sandbox, staging and test separation

ID: environments · proposed · P0

Define environments before building the real service: local development, automated test, editable demo sandbox, hosted staging and production. Their data/credentials/URLs/notification destinations are separate. Production contains real organizational records; synthetic examples live elsewhere. A resettable sandbox is part of product training, never an alternate route that secretly writes into production.

**Acceptance:** Every named environment has URL/project/namespace, dataset, auth callback, secret scope, notification destination, reset rights, owner and cost. Production/test credentials/data are never shared; hosted project count fits verified allowance.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase environments guide, checked 2026-10-03: https://supabase.com/docs/guides/deployment/managing-environments . DWDG environment policy proposed. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_secrets
costs_freeprojects


##### Local development is disposable

ID: environments_dev · proposed · P0

Develop through Vite and local managed-service tooling where practical; use a synthetic fixture dataset and local auth/email substitutes. Developers can reset their own local database. Production database URLs and service keys are absent from ordinary development configuration. Document setup and minimum runtime versions so successors can reproduce the project without guessing.

**Acceptance:** 1 new maintainer starts from clean checkout using runbook without production secrets; deliberate production-endpoint request from local/test config is blocked or requires explicit documented privileged action. No existing member store is reset.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase environments guide, checked 2026-10-03: https://supabase.com/docs/guides/deployment/managing-environments . DWDG environment policy proposed. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** environments_secrets
environments_fixture


##### Automated tests use clean isolated data

ID: environments_test · proposed · P0

CI builds from lockfile, runs meaningful domain/transaction/permission tests against disposable schema and validates migrations from zero plus upgrade. No real student data or live email recipient appears in fixtures. Tests have predictable dates/IDs and remove only their own environment. Test reliability is recorded; retries do not conceal a failing permission or data-loss case.

**Acceptance:** Run fixture suite twice from reset synthetic state: identical expected counts/results and 0 production writes/real-member messages. Valid/invalid scope and command fault cases are reproducible rather than random hidden dependencies.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** environments_dev
environments_fixture


##### Member training sandbox

ID: environments_sandbox · proposed · P0

Sandbox displays a persistent Sandbox badge, distinct URL/theme accent and demo-data notice. Members may explore all agreed training flows using fictional people and documents; emails/external transactions are suppressed. Provide reset/export only for sandbox. Switching to production changes both auth/session context and data endpoint; do not implement sandbox as a client flag over real tables.

**Acceptance:** Create/edit/delete/reset 100 synthetic records with distinct credentials/namespaces:0 production rows, provider files or member notifications change. Visible sandbox badge and reset rights remain consistent across routes/direct API.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** environments_secrets
environments_fixture
costs_freeprojects


##### Hosted staging mirrors integrations

ID: environments_staging · proposed · P0

Near-zero plan uses an isolated hosted test project when the account's free allowance permits it; local disposable development/CI handles routine work. Staging has production-like schema/redirects/storage policies with synthetic accounts and independent keys. A second free project may fill active-project allowance; sandbox should reuse staging as an explicitly synthetic environment or stay local if needed, never share production tables. Temporary paid staging is optional funded alternative. Do not claim external integration tested solely from mocks.

**Acceptance:** Before pilot, hosted isolated candidate exercises 100% of adopted Auth/RLS/concurrency/export/recovery paths; default native upload paths 0. Account/project allowance and monthly cost are verified, not inferred from a frontend badge.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase environments guide, checked 2026-10-03: https://supabase.com/docs/guides/deployment/managing-environments . DWDG environment policy proposed. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** environments_secrets
environments_fixture
costs_freeprojects


##### Production writes and destructive operations

ID: environments_production · proposed · P0

Production is invite-only, backed up, monitored and changed by release procedure. Ordinary members never see seed/reset controls. Bulk imports, permission changes, archive purges and restore require scoped authorization, dry-run/count previews and audit. Backups precede destructive schema/data changes. Add a server-side maintenance/read-only switch for incidents so frontend deployment alone does not control write safety.

**Acceptance:** All direct/client write routes honor maintenance mode; after mode commits,0 new unapproved business mutations commit. No public reset endpoint or test credential reaches protected production data; designated safe smoke fixture is tracked/cleaned.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** environments_secrets
reliability_maintenance
security_bootstrap


##### Per-environment secret inventory

ID: environments_secrets · proposed · P0

Maintain independent project references, auth client configuration, sender credentials, bucket names, export destinations and CI tokens per environment. Preview builds use staging keys only. Secrets are injected securely at build/runtime; public config identifies intended environment. Restrict CI production credentials to protected release jobs and require deliberate production target. Rotate on handover or compromise.

**Acceptance:** Each active environment credential has 1 owner, purpose/scope, storage and rotation record;0 cross-environment authorization succeeds. Build/log scans and callback allowlist inspect exact candidate version.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_secrets
infrastructure_accounts


##### Test email and external side-effect suppression

ID: environments_email · proposed · P0

Local/test/sandbox mail routes to a sink or explicit allowlist; staging uses test recipients and clear subject prefix. No real WhatsApp/social publishing/bank/signature execution is enabled in any example environment. Fixture external links must not accidentally expose private real folders. An environment mismatch fails closed before dispatch. Production email has a separate verified sender decision.

**Acceptance:** Sandbox/test attempts to send 10 invitations/reminders to real member addresses are all blocked or captured by approved sink, with 0 external delivery. Default no-SMTP mode still supports primary OAuth/in-app notification journeys.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** environments_secrets


##### Representative synthetic data

ID: environments_fixture · proposed · P0

Fixtures cover six divisions, cross-unit project, long EN/ID labels, missing dates, empty tasks, restricted work, archived terms, broken provider link and finance amount boundaries. Default has no native binary upload; optional file capability adds failed-upload/missing-blob fixture only if enabled. Fictional people/documents only; training does not copy real applicant/partner/payment details.

**Acceptance:** Versioned fixtures cover 6 divisions and at least empty/long-label/archived/unassigned/revoked/stale/broken-link/conflicting-date states. Names/emails/notes are synthetic; production-person occurrence count 0.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_assumptions
data_dictionary


##### Production data never copied casually

ID: environments_copy · proposed · P0

Default policy forbids production exports in developer laptops or preview environments. Debug with synthetic reproduction and redacted technical diagnostics. If a production subset is strictly necessary, require named authorization, field minimization/anonymization, restricted destination, expiry and deletion evidence; private finance/HR attachments are excluded. A restore drill uses an approved isolated restricted destination, not a public sandbox.

**Acceptance:** Staging/debug fixtures contain 0 real personal identifiers or private receipt/candidate text. Restricted disaster-restore copy names destination,2 custodians, retention/delete date and verified access; it is never exposed as training demo.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_exports
reliability_encryption


##### Sandbox reset and production recovery differ

ID: environments_reset · proposed · P0

Sandbox reset removes only tagged synthetic environment data then reinstalls a versioned fixture set; it never shares auth/storage namespaces with production. Production restoration is a disaster-recovery operation with backup choice, loss estimate, downtime and verification. Use distinct wording and permissions. Avoid a general Reset all button whose meaning depends on a hidden configuration flag.

**Acceptance:** Reset 100 tagged sandbox rows restores exact versioned fixture counts and cannot target production namespace;0 production entities/notifications change. Production recovery remains separate privileged workflow with verified archive.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** environments_fixture
environments_secrets


##### Environment lifetime and costs

ID: environments_cost · proposed · P1

Inventory production, staging/sandbox and previews with owner/lifetime. Free account active-project limits are part of the design; do not create unlimited hosted branch databases. Use local isolated schemas/tests for routine branches. A continuous paid staging is optional. Before deleting a test/restore destination ensure evidence and independent archive are safe; never delete production to free a project slot.

**Acceptance:** Review 100% of hosted project/preview environments monthly with owner/lifetime/purpose/cost; active free-project count fits verified entitlement. No production destination is deleted to free a slot and no unexpected paid instance survives unnoticed.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing, checked 2026-10-03: https://supabase.com/pricing . USD published quotas; recheck account allowances and billing before launch. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_freeprojects
costs-budget


#### Controlled updates, migrations and rollback

ID: releases · proposed · P0

Each production change has version, scope, migration impact, validation, deployment record and recovery path. Update the product through source control and small releases; do not edit live code/database ad hoc. V1 can remain vanilla/Vite. Product polish includes safe updates and understandable release communication as much as visual finishing.

**Acceptance:** Another maintainer can ship or roll back a rehearsed release using a written runbook.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** environments
releases_version
releases_branch


##### Version and compatibility information

ID: releases_version · proposed · P0

Assign semantic app versions and monotonically ordered schema migration IDs; embed commit/build ID and required schema compatibility range. Export schema versions are independent and documented. Settings/support displays app/environment version for diagnosis. Breaking business behavior or data shape gets migration notes, not just a visual patch label.

**Acceptance:** Support record identifies 1 exact app/build/schema/export version and compatibility range; current and previous supported client cases are tested. Unsafe mismatched version commits 0 writes and offers draft-preserving update guidance.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_dictionary


##### Protected source and small changes

ID: releases_branch · proposed · P1

Use a protected main branch, reviewed pull requests and tagged release commits. A small student team can let one builder and one reviewer cover critical permission/migration changes; do not require a large bureaucracy. CI has least-scoped credentials and pins dependency lockfile. Experimental UI work stays in branches/previews until tested.

**Acceptance:** Every critical permission/schema change has 1 named reviewer, exact commit/tag and passed affected checks. Clean checkout reproduces candidate assets with pinned lockfile; privileged deployment credentials appear 0 times in repo.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infrastructure_accounts
security_secrets


##### Meaningful pre-release checks

ID: releases_checks · proposed · P0

Run build/startup, domain validation, transactions/idempotency/concurrency, direct permission denials, migration upgrade and default record/native-note/link export-restore. If optional native uploads explicitly adopted, add actual Storage authorization and file recovery gates before shipping. Inspect affected UI journeys and settled desktop/mobile, themes/languages, keyboard/reduced-motion/long labels. Historical local counts do not prove current live security or rendering.

**Acceptance:** 100% of adopted P0 release checks have current exact-build/environment evidence including direct denials, transaction races and app-owned export/restore. Zero unresolved essential-scope P0/P1 defects; adopted optional native files add separate gates only when enabled.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_tests
releases_premigration
releases_rollback
reliability_performance


##### Expand-contract schema migrations

ID: releases_migrations · proposed · P0

Expand with nullable/additive columns or new tables and compatible policies first; deploy clients that understand old/new data; backfill in bounded validated batches; switch reads; only later contract obsolete fields after old clients and exports are supported. Renames/removals cannot ship as destructive surprise. Each migration has estimated lock duration, row counts, constraints and rollback/forward-fix plan.

**Acceptance:** Rehearse current and previous supported clients on expanded schema:100% of required values/relations preserved and 0 unsafe writes. Backfill reports expected/actual counts, lock timing and failures; contract phase requires evidence no supported consumer needs removed fields.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_dictionary
data_cardinality
releases_oldclients
releases_premigration


##### Pre-migration backup and dry-run

ID: releases_premigration · proposed · P0

Before risky production migration produce verified recoverable app-owned DB/native-note/link export; optional native blob capability adds separate complete-file manifest/copy. Rehearse isolated staging, confirm schema/counts and lock duration/maintenance needs. Logical export is portable when vendor physical backup is not. Provider-link bytes are outside app restore unless separately archived by owner; database rollback cannot undo external messages or file changes.

**Acceptance:** Before risky cutover,1 latest complete independent generation is verified, isolated rehearsal reconciles 100% of required counts/relations/notes and records lock duration/loss/forward-fix plan. Provider bytes remain excluded; optional native files require separate complete manifest.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** reliability_backup
reliability_restore


##### Deployment order and post-deploy smoke

ID: releases_deploy · proposed · P0

Sequence compatible schema expansion, backend functions/policies, then immutable frontend assets; recheck login, permission boundaries, one real test record save, resource retrieval and background job health after deployment. Use synthetic designated production test records that can be safely cleaned. Observe error/latency/usage after a small member cohort before broader invitation. Name release owner and support contact.

**Acceptance:** Candidate build passes login, scoped read, synthetic save/Undo, note/link retrieval, Changes and backup-health smoke checks with 0 P0/P1 essential-flow failure. Proposed initial observation window 30 minutes plus pilot monitoring is recorded; rollback/stop threshold has named owner.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** releases_checks
releases_migrations
environments_production
releases_assets
reliability_monitoring


##### Frontend rollback versus data recovery

ID: releases_rollback · proposed · P0

Retain previous immutable frontend artifact and working config so hosting can restore it quickly. Rollback is safe only if schema/functions remain compatible. For data transformations, prefer validated forward fix; a database restore can lose later writes and requires deliberate recovery process. Document decision threshold: auth failure/data leakage/write corruption is immediate stop; isolated cosmetic issues may use a follow-up patch.

**Acceptance:** Proposed frontend rollback rehearsal restores prior compatible artifact within 15 staffed minutes, with 0 lost acknowledged records/drafts. Data recovery is separate and measures accepted≤24 hRPO/≤8 staffedhRTO; neither result is assumed from hosting rollback.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** releases_oldclients
reliability_restore
releases_migrations


##### Small feature flags and kill switches

ID: releases_flags · proposed · P1

Use a minimal server-controlled capability/flag list for risky new workflows and background jobs, scoped by environment/cohort. Core access rules never depend solely on frontend flags. Maintain owner, default, expiry/removal date and fallback. Turn off an integration or new approval flow without losing records; avoid a large flag platform for V1.

**Acceptance:** Disable 1 risky workflow/job in staging:0 new prohibited operations commit and canonical records remain intact. Every flag has 1 owner/default/expiry; authorization still denies forged frontend-enable request.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_permissions
entity_capability


##### Cache-safe assets and update experience

ID: releases_assets · proposed · P0

Build content-hashed assets with a short-lived app shell; do not serve a mixed bundle of two releases. The app can notice a newer compatible version and offer reload after draft save/copy. Service worker/offline caching is optional and deferred until update/revocation behavior is verified. Never force an immediate refresh that destroys a long note draft or approval review.

**Acceptance:** Open current and previous supported tabs through deployment:0 mixed-bundle startup failures or discarded unsaved drafts. Reload guidance identifies new compatible version; old incompatible client cannot commit unsafe writes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_concurrency
releases_oldclients
releases_version


##### Old tab and schema compatibility policy

ID: releases_oldclients · proposed · P1

Supported client window proposed: current and previous minor version during rollout. Clients include build/schema expectation; server rejects unsafe writes from incompatible old versions with actionable update message. Important role revocation applies immediately even to old tabs. Define how draft recovery works across changed forms, and avoid storing only a DOM-specific representation.

**Acceptance:** Keep an old tab open during staged migration; reads/writes behave safely and saved draft can be recovered after update.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** security_revocationlive
releases_version


##### Dependency and platform updates

ID: releases_dependencies · proposed · P1

Review dependency/security notices monthly and vendor deprecations quarterly. Patch urgent exploitable issues through affected checks; update runtime/build dependencies in a separate reviewable change where possible. Pin versions/lockfile, record compatibility and ensure a successor can rebuild. Do not add packages merely for decorative UI that existing components can provide.

**Acceptance:** Release record includes dependency changes and affected verification; clean checkout reproduces the artifact.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** releases_branch


##### Member-facing changelog and communication

ID: releases_changelog · proposed · P1

Publish short plain-language release notes inside the app: what changed, action needed, known issue and effective date. Explain workflow/field changes and downtime ahead of planned maintenance using the approved internal communication channel. Do not promise a feature merely because planning node says proposed. Existing user content remains intact during branding/navigation updates.

**Acceptance:** A member can find release/version details and understand whether an update affects their work.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** releases_version
launch_scope


##### Handover release rehearsal

ID: releases_rehearsal · proposed · P0

Before original maintainer leaves, successor performs one staging release, permission verification, export, restore and frontend rollback using only runbook and their own credentials. Record unexpected gaps and repair instructions. Success is demonstrated execution, not possession of a repository ZIP. Keep ownership of Git/vendor/domain/SMTP accounts transferable.

**Acceptance:** 1 successor using individual credentials completes staging release, permission check, export, isolated restore and frontend rollback from runbook;0 undocumented critical steps remain before handover. Achieved times and failed cases are recorded.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** reliability_runbook
launch_ownership
releases_rollback
releases_checks


#### Backup, recovery, incidents and daily operations

ID: reliability · proposed · P0

Budget-fit free core has no guaranteed vendor uptime or managed DB backups. Propose independent daily encrypted record/native-note/link export, two custodians and freshness/recovery checks; future optional binary files add separate copies. A small-budget private object archive is candidate within 35 k target/50 k maximum. Target≤24 h lost acknowledged work/≤8 staffed working h recovery only after drill proves it. Pause/weekends/missed jobs require honest boundary and owner/budget decision, not unsupported guarantee.

**Acceptance:** Before sensitive reliance,1 independent restore meets adopted RPO≤24 h/RTO≤8 staffedh and latest complete backup age≤24 h. Automated/manual staffing and free-pause limits explicitly accepted; vendor uptime guarantee remains 0.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs-budget
reliability_rporTo


##### Layered database and file backups

ID: reliability_backup · proposed · P0

On Free default V1, independently encrypt/export all app-owned relational records, native notes/folders and external-link manifest. External provider document bytes are excluded and cannot be restored by this backup; each critical resource needs separate provider owner/archive plan. Target daily generations with 7 daily + 4 weekly + 3 monthly, adjusted for privacy/size. Automation is proposed/unbuilt; until verified named custodian makes daily encrypted export. If native uploads later adopted, separate blob/checksum copy becomes required before shipping.

**Acceptance:** Proposed retention 7 daily + 4 weekly + 3 monthly complete app-owned record/note/link generations; newest verified snapshot age≤24 h at operational check. Each generation has exact counts/checksum and external-byte-exclusion scope. Failed export cannot advance latest-complete; optional native bytes require separate verified copies if enabled.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase backups, checked 2026-10-03: https://supabase.com/docs/guides/platform/backups . Free needs independent exports; Storage bytes need separate copies. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_manifest
costs_backup
reliability_encryption


##### RPO/RTO definitions and owner acceptance

ID: reliability_rporTo · open · P0

RPO is maximum accepted missing saved work after restoration; RTO is elapsed staffed recovery time after incident recognition. Proposed daily-backup design targets RPO ≤24 h and RTO ≤8 working h for the small dataset. Weekend/semester availability must be explicit. If finance/legal decisions cannot tolerate one day loss, increase recovery frequency/funding and re-test rather than relabeling existing backups as sufficient.

**Acceptance:** Owner adopts recovery/staffing targets before rehearsal; measured missing acknowledged work≤24 h and restore≤8 staffed working h after recognition, or status remains failed/Open. Weekend/exam coverage and elapsed wall time are recorded separately; no silent target relabeling.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_assumptions
launch_ownership


##### Restore drill before launch and quarterly

ID: reliability_restore · proposed · P0

Before launch restore independent record/note/link generation into restricted isolated destination, recreate secrets separately and map persons/auth accounts without importing sessions. Verify counts/relations/permissions/native note contents and login/task/approval journeys; external documents remain external with clear un-restored byte scope. Record achieved recovery duration/loss and repeat quarterly/handover. Free vendor restore is not assumed. Optional direct-file capability has separate checksum/retrieval recovery gate.

**Acceptance:** Restore 1 independent generation into isolated restricted destination: exact entity counts,0 dangling/cross-org references, matching native-note hashes and 100% verified-or-quarantined active identity mappings. Fresh member/lead/reviewer/custodian journeys pass; achieved duration/loss interval and external-byte exclusions recorded.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase backups, checked 2026-10-03: https://supabase.com/docs/guides/platform/backups . Free needs independent exports; Storage bytes need separate copies. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_restore
environments_copy
reliability_encryption
reliability_rporTo


##### Backup encryption and recovery keys

ID: reliability_encryption · proposed · P0

Encrypt full archives before offsite transfer; backup storage uses private access with narrow write-only/retention duties where possible. Two custodians can recover encryption keys through a restricted password manager/institutional arrangement. Keys stay separate from backups and code; rotating them includes verifying older generations can still be read. Do not place secrets in the PRD editor or general Documents library.

**Acceptance:** Both 2 custodians decrypt 1 test generation via documented individual recovery access; ordinary member retrieves 0 archive/key content. Rotation test opens older retained generation and new generation; no key resides beside archive or in code/logs.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_exports
security_secrets
infrastructure_accounts


##### Small operational monitoring set

ID: reliability_monitoring · proposed · P0

Track external page reachability, login failures, write error rate, server response latency, DB/storage quota, backup age, email bounce/failure and scheduled job status. Keep PII out of diagnostics; correlation/build IDs identify failures. Use vendor dashboards and a lightweight restricted operational report before paying for a large observability stack. Alert only meaningful failures or budget pressure to named custodians.

**Acceptance:** Simulate failed save, missed backup and 70% quota threshold in 3 cases: named owner receives actionable safe reference through approved method. Proposed backup warning age 20 h/breach>24 h and p95/error/usage indicators are visible; no private payload enters diagnostics.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_triggers
reliability_logs
reliability_rporTo


##### Logs, error reporting and retention

ID: reliability_logs · proposed · P0

Technical logs capture severity, operation, build/environment, correlation ID and safe error code, not access tokens, entire notes or receipt bodies. Proposed 30-day own diagnostic retention is distinct from vendor included log windows. Export only high-value incident diagnostics if needed; paid log drains are deferred. Members see honest recoverable error messages and a support reference, not a raw DB exception.

**Acceptance:** Inspect auth/write/job/error samples:0 tokens/passwords/private note/receipt bodies appear. Proposed 30-day own-log retention purge removes exactly eligible fixtures and preserves approved incident hold; safe correlation ID locates 1 reported failure.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_retention
security_secrets


##### V1 offline policy: safe drafts, honest saves

ID: reliability_offline · proposed · P0

V1 is online-first. When disconnected, cached permitted data may be read if allowed, and text drafts can be kept device-local with clear unsaved/offline badge. Do not promise server approval, assignment or payment state until acknowledgment. Background write queue/offline full CRUD is deferred; retry uses idempotency and revision checks. Reconnection prompts conflict review rather than overwriting newer saved work.

**Acceptance:** Disconnect before submit, after commit-before-response and during reconnect in 3 task/note/approval cases:0 false saved/approved states or duplicate commits. Draft survives where permitted; stale reconnect shows conflict and revoked cache stays inaccessible.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_concurrency
security_device
data_commands


##### Bounded retries and duplicate protection

ID: reliability_retry · proposed · P0

Retry transient reads/jobs with exponential delay, jitter and ceiling; do not endlessly retry authorization, invalid data or conflict. A write with uncertain result checks idempotency outcome before repeating. Disable repeated submission only while necessary and keep cancellation state honest. Background jobs record last success/error and manual retry rights. Duplicate request cannot create multiple invites, approvals or exports. Initial automatic budget proposal is at most 3 transient retries; user-driven conflict reconciliation is separate. Retried privileged responses still recheck current access before revealing a prior result.

**Acceptance:** Retry budget proposed≤3 automatic transient attempts with exponential jitter; invalid/unauthorized/conflict responses retry 0 times automatically. Timeout after commit reconciles 1 original result; no duplicate invites/approvals/exports. Final pending/failure state visible with manual recovery.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_commands


##### Performance targets from useful journeys

ID: reliability_performance · proposed · P0

Proposed V1 targets on representative Indonesian mobile connection: first useful app content ≤3 s after authenticated return, ordinary list/filter response p95 ≤1 s, save acknowledgment p95 ≤1.5 s, accessible interaction feedback within 100 ms. Measure cold/warm load and 15 concurrent sessions initially and 25 in stress scenario with representative data. Attachment transfer time depends on file/network and is shown separately. Targets are unverified until measured. Baseline unexpected-error denominator excludes intentionally denied authorization/conflict/invalid-data fixtures; record them separately. Compute nearest-rank p95 separately for valid reads and valid writes, not blended averages. Record actual device/browser/network RTT/throughput, cold cache state and sample counts; provider resume/OAuth round-trip and optional file transfer are separate measured paths, never hidden in the core latency claim.

**Acceptance:** Proposed baseline:60 invites/15 active concurrent sessions,20 projects,5,000 tasks,200 links,20,000 safe audit events. Over 20 minutes capture≥1,000 read and≥200 write samples with authenticated-return useful content p95≤3 s, list/filter API p95≤1 s, save acknowledgment p95≤1.5 s and local feedback≤100 ms; unexpected request errors<1%, lost/duplicate writes/leaks 0. Record cold/warm device/network/bytes/query plans. Stress 100 accounts/25 sessions/25,000 tasks/100,000 events separately reports limits; no unmeasured SLA is claimed.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_assumptions
data_limits


##### Incident severity and response

ID: reliability_incident · proposed · P0

P0 incident: unauthorized sensitive access, corruption/lost acknowledged writes or account takeover; restrict writes/access immediately, preserve safe diagnostics and involve named owners. P1: core login/work outage; investigate provider/service status and provide workaround. P2: localized workflow/design error; triage scheduled fix. Keep a simple incident register with onset, impact, decisions, communication, recovery and prevention; never delete evidence to tidy dashboards.

**Acceptance:** Run 2 tabletops (sensitive leak and core outage): each identifies 1 incident owner, safe containment/recovery/communication actions and evidence. During staffed hours proposed triage begins≤30 minutes after recognition; outside-hours coverage is explicit/Open. Zero secrets enter public incident notes.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** reliability_maintenance
security_offboarding
reliability_runbook
reliability_monitoring


##### Maintenance and read-only mode

ID: reliability_maintenance · proposed · P0

Server-owned mode can reject new writes while preserving authorized reads/export where safe. Show reason, start time and expected next update, with explicit unsaved drafts. For a privacy incident restrict affected reads as well. Old tabs and direct API calls honor the same mode. Schedule routine maintenance outside major event/recruitment deadlines where possible and announce it through the approved channel.

**Acceptance:** Toggle mode during 20 parallel task/approval writes: post-mode prohibited commits 0, valid earlier commits reconciled once, drafts retained. Old tabs/direct APIs honor mode; read restrictions for a privacy incident tested separately.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** releases_flags
data_commands


##### Vendor outage and manual work continuity

ID: reliability_outage · proposed · P1

During backend outage show unavailable state, retain safe drafts and link to latest approved operational export location accessible to custodians. Members may use the agreed temporary spreadsheet/form for urgent work with timestamp and owner; re-entry after recovery is reviewed for duplicates and history. Do not automatically switch to another live database with divergent records. A provider outage is not fixed by redeploying frontend blindly.

**Acceptance:** Continuity exercise records 3 urgent task/decision entries with real owner/time, then reconciles each exactly once after recovery. No automatic divergent database switch, invented approval or deleted original history occurs.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_exportownership
reliability_retry
reliability_rporTo


##### Student-term succession and account custody

ID: reliability_succession · proposed · P0

Keep organization-controlled Git, hosting, database, domain, SMTP, backup and external-document ownership with two named custodians. At term change inventory access, rotate necessary secrets, assign record owners, transfer billing and test recovery. Store runbooks and support contacts in a restricted institutional location and a discoverable product handover record. Never rely on one personal student email/card or one laptop backup.

**Acceptance:** Both 2 successors verify Git/host/DB/archive and any adopted domain/SMTP access using individual credentials. Handover inventory accounts for 100% of critical ownership/funding/keys/open obligations; departing access revoked without loss of necessary archives.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_owner
infrastructure_accounts
reliability_runbook


##### Operator runbook contents

ID: reliability_runbook · proposed · P0

Document architecture/environment map, account ownership, normal release, secret rotation, export, backup inspection, restore, rollback, membership offboarding, domain renewal, SMTP failure, storage cleanup and incident contacts. Include exact safe target checks and expected outcomes without embedding secrets. Keep it versioned with the product and validate by successor rehearsal; screenshots alone are insufficient operational instructions.

**Acceptance:** 1 second maintainer follows all critical release/export/restore/rollback/offboarding steps using approved target checks; every critical gap repaired or blocks launch. Runbook contains 0 secrets and identifies actual environments/owners.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infrastructure_requestpath
environments_secrets
data_manifest


##### Member support and error triage

ID: reliability_support · proposed · P1

Provide one agreed support contact/form with app version, environment, affected journey and safe error reference. Do not request passwords or private receipt screenshots through public chat. Product owner triages wording/workflow issues; technical maintainer triages errors/security. Publish realistic support hours for student volunteers. Track recurring failures and prioritize repairs before adding marginal features.

**Acceptance:** Submit 1 safe failed-save report with version/environment/correlation and receive assigned owner under declared support hours;0 password/private-receipt requests occur. Response-hour targets stay organizational Open decisions rather than invented SLA.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** releases_version
reliability_logs
launch_ownership


##### Inactivity pause and semester breaks

ID: reliability_freepause · proposed · P0

Free Supabase can pause after inactivity; this matters during exams/holidays and affects first return. Document who checks status, how to resume with current provider tooling, latest archive location and how members see unavailable state. Do not manufacture traffic solely to misrepresent free tier reliability. Before a known event verify availability and export; a stronger continuous-availability requirement triggers paid/institutional hosting decision.

**Acceptance:** Rehearse return-from-pause in test environment; members understand the free operating boundary and designated resume owner.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Supabase pricing, checked 2026-10-03: https://supabase.com/pricing . USD published quotas; recheck account allowances and billing before launch.

**Dependencies:** infrastructure_accounts
reliability_outage


##### Proposed archive automation: account/setup still open

ID: reliability_backupautomation · open · P0

Candidate budget-fit automation uses restricted private CI schedule: export app records/native notes/link manifest→encrypt/checksum→private object archive such as eligible R2 Standard with narrowly scoped keys. Actual account/payment eligibility and total charges must fit 35 k target/50 k ceiling. Drive destination remains alternative with verified API/OAuth lifetime/custody. No backup data in repo/logs/ordinary artifacts; no automation exists now. Manual daily encrypted export is explicit fallback; future native files add proven separate recovery.

**Acceptance:** After actual setup produce 7 complete encrypted record/note/link generations with exact manifest checks, simulate 1 missed run/token failure and restore 1 isolated generation. Raw records in CI logs/repo/ordinary artifacts 0; selected monthly cost≤Rp 50,000. Until proven, automation remains unbuilt/manual fallback.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** GitHub Actions billing/scheduling, checked 2026-10-03: https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule . DWDG automation not created. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_freeactions
infrastructure_accounts
data_manifest
reliability_encryption
costs_backup


##### Scheduled jobs are best-effort with missed-run detection

ID: reliability_scheduler · proposed · P0

GitHub scheduled runs may be delayed/dropped under load; schedule away from busy minute boundaries and measure latest successful backup. Public repositories can lose schedule after 60 days inactivity; private repository reduces exposure but does not create a schedule guarantee. Operators need a daily freshness check or independently checked stale status, and manual run rights. A green prior CI run is not proof today's export exists.

**Acceptance:** Simulate 1 delayed and 1 missed run: latest-complete age remains honest, breach>24 h visible and designated custodian can run/reconcile fallback. Prior green job alone never marks current generation complete.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** GitHub Actions billing/scheduling, checked 2026-10-03: https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule . DWDG automation not created. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** reliability_backupautomation
reliability_monitoring


##### Drive automation authorization and token expiry gap

ID: reliability_driveoauth · open · P1

Drive backup API authorization is distinct from login-only OAuth. External Google app in Testing can issue 7-day refresh tokens for scopes beyond basic profile; revoked/expired tokens stop backups. Choose minimal approved scope, publish/verify consent configuration as needed and handle invalid_grant with operator reauthorization. Do not put account passwords in CI or assume a service account has consumer Drive storage/ownership. Destination/scopes remain an implementation decision.

**Acceptance:** If Drive destination selected, test expected token lifetime and 1 revocation/expiry: failure actionable, latest-complete does not advance and plaintext credential leaks 0. Login-only OAuth success not proof of backup API authorization.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Google OAuth token lifetime, checked 2026-10-03: https://developers.google.com/identity/protocols/oauth2#expiration . Login-only scopes differ from Drive backup authorization. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** infrastructure_accounts
security_secrets


##### Drive folder access versus durable team ownership

ID: reliability_mysdrive · proposed · P1

An ordinary free My Drive folder can be shared with custodians; that does not make it a Workspace Shared Drive, whose files belong to the team. Track actual file owner and quota consumer for archives and editable documents. Protect archive from ordinary member edit/delete, keep at least one independent encrypted local custodian copy and rehearse ownership transfer/recovery before term change. Sharing cannot repair an already-deleted owner account.

**Acceptance:** Custodian access/ownership manifest matches actual provider state; departing owner handover preserves files.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Google storage and shared-drive ownership, checked 2026-10-03: https://support.google.com/googleone/answer/9004014 ; https://support.google.com/a/users/answer/7212025 . Actual UII entitlement unverified.

**Dependencies:** infrastructure_accounts
reliability_encryption


### Implementation sequence, acceptance and launch

ID: delivery-planning · proposed · P0

Dependency-led roadmap and evidence: what must be decided first, how the coherent core and six division paths are delivered, what tests/screen observations/restoration prove, and how a pilot moves into real use. Requirement priority/decision state is separate from defect severity and implementation status. No launch date or volunteer capacity is invented. All advertised essential flows must work, rather than relying on feature count.

**Acceptance:** 1. Pilot includes at least 1 representative per 6 active divisions and the required scoped roles.
2. Candidate has 0 unresolved P0/P1 defects in promised essential scope.
3. Launch record links the exact PRD/build version, executed evidence, named custodians and cost/recovery decisions.

**Owner:** Product + engineering + QA + division leads

**Source / assumption:** User requests polished real working product planned before coding; current restart scope.


#### Acceptance, testing, and evidence

ID: quality · proposed · P0

Release acceptance proves actual end-to-end use, data integrity, scoped permissions, restore capability, and reasonable performance. Source inspection, simulated interaction, rendered inspection, and live production verification are separate evidence levels. Requirements remain pending until their evidence exists.

**Acceptance:** 1. Launch checklist references dated results and known gaps for the candidate version.

**Owner:** QA owner + Mahdy

**Source / assumption:** Current user: polished working real launch; prior QA limitations


##### Role and access matrix

ID: quality-role-matrix · proposed · P0

Test unauthenticated, invited/unaccepted, active member, division lead, each VP reporting branch, President, admin, archived member, removed member, and explicit project collaborator. Include direct URL/API/storage/search/export/notification routes, not only navigation. Test role removal while a session is open and stale cached data afterward.

**Acceptance:** 1. Negative tests confirm no inaccessible fields, file bytes, names, counts, or authorization bypass; positive tests allow intended work.

**Owner:** Backend/security + QA

**Source / assumption:** Access decisions from referenced chat; detailed matrix proposed

**Dependencies:** access_action_matrix
security_permissions
security_offboarding


##### Daily member and division journeys

ID: quality-journey-matrix · proposed · P0

Core: accept invitation→open own workspace→find task→open resource→update status→verify reload.
Lead: create project→assign members→schedule work→resolve blocker→review evidence→archive.
Resources: folder→external-file link/native note→assign people→create linked task→reopen.
Meetings: schedule→agenda/minutes→decision→follow-up.
Capabilities: one realistic complete journey per current division, with actual records and role boundaries.

**Acceptance:** 1. Execute1 member journey,1 lead journey,1 resource/task journey,1 meeting journey and at least1 per6 division paths.
2. For every executed flow, record actor, input, saved IDs, permitted output, denied/failure route and reload/export result.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** user-flows
work_task_lifecycle
resource_types


##### Data invariants and concurrent edits

ID: quality-integrity · proposed · P0

Verify stable IDs, valid foreign keys, owner membership, workspace scope, allowed status transitions, date semantics, integer IDR, no duplicate request/payment count, task-resource relation, cycle rejection, and version/conflict handling. Retrying a timed-out write must not create a duplicate. Two members editing the same task receive a recoverable conflict or safely merge compatible changes; no silent last-write loss for sensitive states.

**Acceptance:** 1. Deliberate concurrency and network-failure tests leave a consistent auditable state and preserve entered changes.

**Owner:** Backend + QA

**Source / assumption:** Proposed integrity contract

**Dependencies:** data_validation
data_concurrency
data_softdelete


##### Reuse requires fresh regression evidence

ID: quality-regression · proposed · P0

Inventory existing domain logic and three local stores before a rewrite/migration. Preserve original backups and confirm legacy adapter behavior on copies. Choose reuse or replacement module by module based on testable behavior and design fit. Never reset localStorage or reseed user data to make a demo look complete. A production migration is explicit and reviewed, not implied by a UI restart.

**Acceptance:** 1. Dry-run migration reconciles source/target counts, IDs, relationships, missing attachment paths, and rejected rows; originals remain available.

**Owner:** Engineering + data owner

**Source / assumption:** AGENTS preservation contract; existing store/QA evidence

**Dependencies:** work_concurrent_updates
engineering-record-removal


##### Rendered visual matrix

ID: quality-visual · proposed · P1

Inspect 1440/1024/768/390/360px, EN/ID, light/dark, long titles, dense/empty data, 200% zoom, reduced motion, and real mobile keyboard behavior. Compare desktop to CRM/task references and mobile to Samsung group/chart patterns. Measure row density and clipping; don't infer geometry from stylesheet declarations. Use settled screens.

**Acceptance:** 1. Review20 width/language/theme combinations defined bymeasure-design-handoff for core representative screens.
2. 0 clipped essential controls, overlapping labels, false chart data or inaccessible focus states remain.

**Owner:** Design + QA

**Source / assumption:** Reference atlas and current QA matrix

**Dependencies:** measure-design-handoff
design-ui-review


##### Performance budgets for student devices

ID: quality-performance · proposed · P0

Proposed targets on mid-range phone and ordinary mobile network: meaningful cached navigation under 1s; common small list operations feel immediate; cold usable first view within about 3s under a documented test profile; compressed initial JS under about 250KB where practical. Paginate server lists, avoid loading every record/file, lazy-load nonessential charts, and retain stable UI while saving. Targets are hypotheses until measured.

**Acceptance:** 1. Measure cold/warm loads with dataset of 100 accounts and realistic tasks/resources; publish actual profile, payload, and slow-network outcomes.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** reliability_performance


##### Security verification before broad launch

ID: quality-security-review · proposed · P0

Review row/storage policies, invitation expiry, role-management restrictions, session/logout behavior, secrets exposure, HTML injection, external URLs, file size/type limits, rate abuse, and export authorization. Use plain-text content or sanitized supported rich text. Server/service keys never enter client bundle. Credentials are referenced through a password manager, never stored in Notes.

**Acceptance:** 1. A documented abuse checklist exercises key failure paths and an independently reviewed permission change before full membership rollout.

**Owner:** Security reviewer + admin

**Source / assumption:** Proposed launch security gate

**Dependencies:** security_tests


##### Recovery is demonstrated, not claimed

ID: quality-backup-proof · proposed · P0

Produce a record/native-note snapshot with schema/version and external-link manifest, restore to an isolated target, reconcile counts and relationships, and open sample records/notes/metadata. External-provider document bytes are not backed up by a link manifest or database dump. Adopt a separate provider-file continuity/export policy before relying on those documents. If native uploads are later enabled, add file bytes/checksum restore proof. Recovery evidence names operator, excluded scope, snapshot age and actual elapsed time.

**Acceptance:** 1. One complete restore rehearsal succeeds before real organizational data is relied upon; incomplete coverage stays a launch blocker.

**Owner:** Operations + data custodian

**Source / assumption:** Proposed backup acceptance

**Dependencies:** reliability_restore


##### Reminder and notification truth

ID: quality-notification-proof · proposed · P0

In-app due queues work on reopening. If closed-app delivery is included, test the actual scheduler, retry/deduplication, timezone, quiet-hours behavior, authorization, failed channel, and opt-out. Do not claim that a browser tab timer sends while the app is closed. Core due tracking remains usable if optional email fails.

**Acceptance:** 1. An overdue fixture created while logged out appears exactly1 time in the correct in-app due context after return.
2. Retry a queued action3 times:0 duplicate recipient notifications or unauthorized payloads.
3. Optional closed-app channels get separate executed evidence only if adopted.

**Owner:** Operations + QA

**Source / assumption:** Survey S01 reminder need; delivery scope proposed

**Dependencies:** work_reminders
work_updates


##### Launch defect severity and release criteria

ID: quality-defects · proposed · P0

P0 defect: data leak/loss, account lockout with no recovery, incorrect permissions, unrecoverable migration/restore, or false transaction state.
P1: essential journey broken, wrong calculations, save silently fails, mobile unusable.
P2: cosmetic or secondary inconvenience with practical workaround.
General launch requires zero unresolved P0/P1 defects in the promised scope. Known P2 issues have owner and description. A requirement marked Proposed/Confirmed is not marked tested automatically.

**Acceptance:** 1. General launch has0 unresolved P0/P1 defects in promised essential scope.
2. 100% of known P2 issues have owner, user impact and workaround/plan.
3. Candidate sign-off records1 exact build/PRD version, tested scope and explicit feature exclusions.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


##### Pilot feedback and support

ID: quality-feedback · proposed · P0

Offer an in-app Help/Report issue route with clear user steps and optional redacted screenshot. Capture version, page, role category, device category, expected/actual result and severity; avoid auto-attaching sensitive content. A shared issue board has owner and response expectations appropriate for volunteers. WhatsApp can remain a communication channel but records/decisions return to the system.

**Acceptance:** 1. A member submits an issue; triage reproduces it using safe test data, communicates a workaround, and links the fix to a release.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** onboarding-help


##### Minimal monitoring that protects privacy

ID: quality-observability · proposed · P0

Track uptime/error rate, failed writes, database/storage usage, backup age, scheduled-job success, and release version. Avoid recording note/file/finance body text, session tokens, passwords, or unnecessary member identifiers. Free logs have retention/size limits. Alerts are actionable and have an owner; a dashboard without notification ownership is insufficient.

**Acceptance:** 1. Exercise a failed backup and failed save; the responsible operator can find the event and required action without exposing content.

**Owner:** Operations

**Source / assumption:** Proposed minimal operations

**Dependencies:** reliability_monitoring
reliability_logs


#### Planning, implementation, pilot, and launch

ID: roadmap · proposed · P0

A PRD-first restart: settle critical operating decisions and first-version scope; implement from one requirement model; verify in isolated environments; pilot with representatives; launch gradually. No date is invented. Sequence is dependency-driven and will be estimated after the specification is reviewed.

**Acceptance:** 1. Every phase has exit evidence and named responsibilities rather than a percentage completion claim.

**Owner:** Mahdy + product/engineering owners

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


##### Stage 1 · review the PRD and scope

ID: roadmap-plan · proposed · P0

Use this editable draft to resolve cost, data custody, permissions, organization terms, division workflow owners, attachment/reminder scope, and launch recovery. Freeze a versioned baseline only after the important decisions have been discussed. Record changes and reasons. Do not build disconnected product screens while unresolved assumptions silently change.

**Acceptance:** 1. A versioned PRD baseline identifies confirmed scope, deferred features, required evidence, and remaining nonblocking questions.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** scope_rules_gap
decision-file-policy
decision-invite
strategy_validation
hr_validation
finance_sop


##### Stage 2 · shared model and working foundation

ID: roadmap-foundation · proposed · P0

Build organization/batch/membership policy, authentication, stable relational entities, one shell, localization, basic persistence/errors, and migration adapter before spreading to division screens. Establish nonproduction fixtures with no private data. Retain Vite/vanilla JS unless a later explicit architecture decision changes it.

**Acceptance:** 1. Create account/workspace/project/task/resource with correct permissions and persistence; backup/restore and rollback route exist.

**Owner:** Engineering

**Source / assumption:** AGENTS current stack; foundation proposed

**Dependencies:** roadmap-plan
engineering-modules
security_auth
data_identity


##### Stage 3 · complete core and divisions together

ID: roadmap-core · proposed · P0

Deliver shared daily journeys plus all six current division capabilities at the committed depth. Prefer a smaller complete workflow over impressive fragments. Map every task to a requirement ID. Cross-division request/project/resource links use shared records and permission rules.

**Acceptance:** 1. All accepted core journeys and one end-to-end division workflow each pass; dead primary actions and duplicate state are removed.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** roadmap-foundation
user-flows
work_project_tabs
access_surface_scope


##### Stage 4 · test, recovery, and migration rehearsal

ID: roadmap-isolated · proposed · P0

Use disposable local sandbox and isolated staging candidate. Run permission, concurrency, visual, data reconciliation, failed-save, restore, and deployment rollback checks. Use sanitized data only. Migrations expand before code depends on new fields and retain rollback-compatible reads.

**Acceptance:** 1. A release candidate has reproducible checks, restore proof, and no unresolved critical defects.

**Owner:** QA + operations

**Source / assumption:** Proposed lifecycle

**Dependencies:** roadmap-core
reliability_restore
security_tests
environments_sandbox


##### Stage 5 · representative pilot

ID: roadmap-pilot · proposed · P0

Propose a small pilot including Mahdy, at least one President/VP/lead role and one representative per six current divisions; exact people and duration are open. Start with a bounded set of real work after permissions/recovery gates pass. Gather observed phone/desktop usability and operation costs. Pilot participants know the support route and contingency if service pauses.

**Acceptance:** 1. Pilot produces actual usage, storage, failed-save, backup-age, role, and usability findings; major issues are fixed before all-member rollout.

**Owner:** Product owner + division leads

**Source / assumption:** Pilot composition/duration proposed

**Dependencies:** roadmap-isolated
launch_gate


##### Stage 6 · gradual organization launch

ID: roadmap-rollout · proposed · P0

Invite cohorts rather than importing every contact without review. Publish one concise guide for sign-in, workspace/project concepts, resources, permissions, reporting issues, and export/recovery responsibility. Assign two accountable account custodians. Each division migrates chosen active work once, with source reconciliation and ownership checks.

**Acceptance:** 1. New members complete the first-work journey; operators can recover access; chosen source work reconciles; rollback/support route is documented.

**Owner:** Mahdy + appointed custodian

**Source / assumption:** Actual app launch requested; rollout proposal

**Dependencies:** roadmap-pilot
launch_datacutover
launch_onboarding


##### Stage 7 · ongoing updates and batch handover

ID: roadmap-maintenance · proposed · P0

Use versioned changes, short release notes, migration review, scope-tested regressions, and staged deployment. Schedule regular backup/recovery checks and quota review. Before a new batch, verify organization draft, account custody, active members, records, cost ownership, and archive policy. Remove departed access without deleting their historical authorship.

**Acceptance:** 1. Next batch can operate accounts and restore/export data without Mahdy's personal device or private credentials.

**Owner:** Operations + future batch leaders

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** reliability_monitoring
org_handover


#### Real launch acceptance and staged adoption

ID: launch · proposed · P0

This PRD plans a polished production product; it does not authorize claiming the current local UI has launched. Finish the agreed V1 workflows across six divisions, real managed identity/permissions, persistence, recovery, update process and actual rendering evidence. Use a small production pilot before inviting the full organization; adoption is based on completed journeys and data confidence.

**Acceptance:** A dated launch record identifies exact build/config, 100% of adopted P0 requirement evidence, named owners, actual all-in budget ≤Rp 50,000, zero unresolved essential-scope P0/P1 defects, and explicitly excluded optional requirements/P2 workarounds.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending.

**Dependencies:** launch_gate
launch_pilot
launch_acceptancematrix


##### Freeze one credible V1 scope

ID: launch_scope · proposed · P0

Classify every requirement as launch-critical P0, useful P1 or deferred P2. Keep organization/workspace/project/work/resources vocabulary coherent. Include useful department workflows but defer payroll, banking, automated signatures, public SaaS tenancy, AI scoring and complex offline collaboration. A proposed node is not a delivery promise until scope is approved. Changes record purpose, cost and acceptance impact. Requirement priority is separate from defect severity: excluding an optional P1 requirement is deliberate scope choice; an essential-flow P1 defect still blocks launch.

**Acceptance:** 100% of proposed capabilities are explicitly adopted/excluded/deferred with owner, priority and evidence expectation before release scope freezes. Every adopted P0 maps to acceptance; deferred controls are not advertised as working.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_divisionentities
costs-budget


##### Launch blockers and go/no-go record

ID: launch_gate · proposed · P0

General launch blocks unresolved P0 or P1 defects in promised essential scope: unauthorized access, lost acknowledged data, broken save/Undo, incorrect calculations, unusable mobile essentials, no viable restore, unowned operator credentials or missing membership enforcement. P1 requirement priority is separate: optional requirement can be deliberately deferred/excluded with scope updated, but cannot excuse a P1 defect in advertised behavior. Known P2 defects need owner/workaround/date. Go/no-go uses current evidence, not old screenshot/test count.

**Acceptance:** Broader launch has 100% adopted P0 evidence and completed advertised journeys for all 6 divisions, zero unresolved P0/P1 essential-scope defects, measured current security/recovery and all-in cost≤Rp 50,000. Optional requirement exclusions and known P2 workaround/owner/date recorded.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_tests
reliability_restore
launch_design
launch_ownership
launch_funding
launch_securityreview
launch_recoveryreview
launch_pilot
launch_freecontract


##### Polish and accessibility evidence

ID: launch_design · proposed · P0

Inspect every primary page and six divisions at agreed desktop/mobile sizes with real long labels, empty/error/loading states, English/Indonesian, light/dark, keyboard, 200% zoom and reduced motion. Exercise actual controls/inspectors/drafts/Undo, not screenshot styling alone. Keep compact working hierarchy and consistent components; charts show saved values and missing history honestly. Preserve current references as source evidence without assuming every old choice must survive restart.

**Acceptance:** Current build has settled screenshots and interaction evidence covering the matrix; each failure has repair or explicit unresolved status.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract.

**Dependencies:** releases_checks


##### Pilot cohort and success evidence

ID: launch_pilot · open · P0

Propose 8–12 invited members covering six divisions, lead/reviewer roles and mobile users for a 2-week real low-sensitivity pilot after staging passes; exact cohort remains open. Confirmed full organization starts around 40 members or more. Track completed journeys, failed saves, resource finding, recovery and quota/support issues; avoid individual productivity rankings. Resolve all P0/P1 defects in promised essential scope before broader rollout; deliberately excluded optional requirements are documented separately. Pilot entry is launch_pilotentry; broader readiness is launch_gate after observed pilot results. There is no circular requirement to complete a pilot before deploying its candidate.

**Acceptance:** Proposed 8–12 members over 2 weeks cover all 6 divisions plus lead/reviewer/mobile roles. Every advertised division minimum journey observed at least once, failed/duplicate/lost saves and privacy leaks reconciled, usage/support feedback recorded, and essential-scope P0/P1 defects remaining at broader launch 0. Cohort/dates remain unapproved until chosen.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** launch_pilotentry
releases_deploy
launch_onboarding
reliability_monitoring


##### Initial data cutover and reconciliation

ID: launch_datacutover · proposed · P0

Owner decides what existing local records are actual work, examples, duplicates or obsolete drafts. Export all relevant sources, run import dry-run, map people, preserve unknown dates and confirm privacy/access. Avoid importing every personal folder blindly. After import, leads review project/task/resource counts and spot-check evidence; retain legacy archive before declaring the new system authoritative.

**Acceptance:** Reconciliation accounts for 100% of reviewed source records as imported/excluded/unresolved, with exact destination counts/mapping. All 3 local stores/legacy bytes remain recoverable; second approved import produces 0 duplicates. Required owner/grant exceptions block authority cutover.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** data_legacy
data_manifest
security_permissions
launch_ownership


##### Member onboarding and sandbox training

ID: launch_onboarding · proposed · P0

Provide a short guided first session: join membership, select division context, find assigned task, update it, locate resource, create a follow-up and use Undo. Train sensitive approvers separately and explain sandbox/production badges. Default views are useful with real records; empty states teach one next action. Provide concise Bahasa Indonesia/English help rather than long generic software tutorials.

**Acceptance:** At least 1 representative new member from each of 6 divisions completes adopted login→context→assigned task→save→resource→follow-up→Undo journey without developer taking over. Member identifies production versus sandbox correctly; pilot records timing/help needed rather than inventing adoption success.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** environments_sandbox
security_auth
launch_scope


##### Named operational responsibility before launch

ID: launch_ownership · open · P0

Assign product owner, treasurer/billing owner, primary and backup technical maintainers, data/privacy contact, each division lead and archive custodians. These are responsibilities, not invented names. Record support hours and semester handover plan. At least two people must have verified essential operator access; role independence and ability to cover exams/holidays matter for continuity.

**Acceptance:** Owner table has names, contact, role, verified access date and successor for 100% of critical dependencies; at least 2 people independently hold essential operator/recovery access. Support/exam/holiday cover explicit, not assumed.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** reliability_succession
costs_owner


##### Confirm actual spend within 35k target/50k maximum

ID: launch_funding · open · P0

Latest confirmed budget: target Rp 35,000/month where feasible, maximum Rp 50,000; earlier near-Rp 0 preference superseded. Verify free-core eligibility and exact archive/email/domain costs, tax/card fees and annual amortization. No requirement to spend full target. Protect recovery/custody first; optional Pro/paid staging lies outside cap. UII entitlements unverified. Actual quotes/account setup/funding for any paid line require explicit owner decision before organizational dependence.

**Acceptance:** Actual all-in worksheet includes 100% of selected recurring/annual-amortized/tax/payment charges and target≤Rp 35,000 or justified variance, hard≤Rp 50,000. Optional domain upfront cash separately approved; free eligibility/archive credentials verified before dependence.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_monthlyA
security_vendor


##### Focused production security review

ID: launch_securityreview · proposed · P0

Reviewer walks membership/invite/bootstrap, database policies, restricted native notes/link metadata, sensitive exports, secrets, logging/offboarding with direct API tests. Default V1 has no native binary upload. If later enabled, independently verify bucket/private-file download/recovery rules. Production config checked separately with safe designated records; no compliance/penetration-test certification is implied. Record actual result and unresolved risks.

**Acceptance:** Reviewer signs exact candidate build/config matrix:100% adopted P0 paths tested and 0 known P0/P1 essential-scope access or save-integrity defects. Production safe synthetic denials complement staging; no certification claim follows from checklist.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** security_tests
security_bootstrap
environments_production


##### Recovery and update rehearsal evidence

ID: launch_recoveryreview · proposed · P0

Before launch second custodian exports app records/native notes/link manifest, checks encrypted offsite copy, restores isolated data/permissions and explicitly confirms external document bytes are outside bundle. Then staging update/rollback and contact/account recovery rehearsal. Optional binary capability adds file checksums/retrieval/restore before enabling. A directory of snapshots without tested recovery is incomplete operational evidence.

**Acceptance:** Second custodian performs 1 complete independent app-record/note/link restore plus staging update/rollback; achieved RPO≤24 h/RTO≤8 staffedh or gate remains unresolved. Counts/hashes/grants reconcile, external-byte limitation explicit and optional native storage separately gated.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** reliability_restore
releases_rehearsal


##### Trace requirements to tests and sources

ID: launch_acceptancematrix · proposed · P0

Assign requirement IDs, source/evidence, priority, acceptance journey and owner. Survey responses are qualitative/quantitative evidence only within known sample; brainstorms and new decisions are proposals until adopted. Each P0 needs current build/environment result with date and evidence link. Preserve open decisions visibly; never mark passed because a detailed description exists.

**Acceptance:** Before gate decision,100% of adopted P0 IDs have owner, current build/environment, executed result/date/evidence link. Missing evidence pending/fail, never auto-pass. Confirmed decisions, numerical proposals and actual results remain separate.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Existing EXPERIENCE_SPEC.md sections 4-7 and SURVEY_TRACEABILITY.md, inspected 2026-10-03; historical local phase is evidence, not a production contract. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** launch_scope


##### First-month review and next release

ID: launch_postmonth · proposed · P1

After full launch review actual invoice, active members, successful/failed core journeys, data corrections, backup age, restore obligations, support load and department feedback. Adjust storage/retention and training before adding new integrations. Decide one small next-release scope based on observed needs; update PRD decisions and cost assumptions. Do not turn simple activity counts into member rankings.

**Acceptance:** First 30-day review records actual invoice/quotas/active users/core journey errors/backup ages/support and division feedback; total≤Rp 50,000 or immediate approved containment. Next scope 1 prioritized reviewable release proposal grounded in observations, without member ranking.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** User launch/restart request, 2026-10-03. Requirement planning; implementation and production acceptance pending. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** costs_triggers
reliability_support
launch_pilot


##### Achievable launch within 35k target/50k ceiling

ID: launch_freecontract · open · P0

Real launch can fit modest permitted budget using free core plus small verified independent archive cost, provided multi-user/privacy/save journeys, quota limits, custody and recovery pass. Boundary remains online-first/no 24-hour SLA, possible free pause/restriction and explicit manual/automated recovery responsibility. Default backups cover records/notes/link manifests, not outside documents. No guarantee of Rp 0 invoices. Crucial sensitive work waits for gates; optional upgrades cannot exceed Rp 50,000 silently.

**Acceptance:** Owner accepts budget-fit online-first/pause/support/recovery boundary using current measured evidence. Actual recurring total≤Rp 50,000, preferably≤Rp 35,000; newest verified archive≤24 h and 2 custodians can recover. No 24/7 uptime/zero-invoice/provider-byte recovery guarantee appears.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned. Consultation acceptance elaborated 2026-10-03; fixture/timing/retention targets proposed unless user-confirmed or sourced; actual evidence pending.

**Dependencies:** launch_funding
reliability_rporTo
reliability_freepause
reliability_backup
reliability_monitoring


##### Remaining operational decisions to settle

ID: launch_openoperations · open · P0

Confirmed: brand DWDG’ONE UII, latest target Rp 35,000/month/hard maximum Rp 50,000, roughly 40+ members and no current domain/shared Drive. Open: named operators/billing authority, actual Google identities, hosted region/privacy policy, archive destination/payment eligibility/credentials/automation, retention/recovery staffing and real migration records. Make decisions editable; never invent existing accounts or university benefits.

**Acceptance:** Decision register assigns owner and launch impact to every open item; dependent acceptance remains pending.

**Owner:** Product owner + technical maintainer (named people TBD)

**Source / assumption:** Latest user budget decision, 2026-10-03: target Rp35,000/month where feasible; hard maximum Rp50,000/month. Approximately 40+ members; no existing organization domain/shared Drive. Planning only; no account/payment provisioned.


##### Separate safe pilot entry from broader launch approval

ID: launch_pilotentry · proposed · P0

Pilot entry occurs after isolated staging validation, verified operators/budget, independent recovery rehearsal and deployment of the exact candidate build. Gate only the explicitly advertised low-sensitivity pilot scope: zero unresolved P0/P1 defects in those essential journeys. Excluded/deferred capabilities stay absent or honestly labeled. Pilot observations then feed broader launch_gate; a completed pilot is not a prerequisite for the first candidate deployment. Real sensitive reliance waits for the approved privacy/finance/HR policies and recovery goals.

**Acceptance:** Entry checklist identifies 1 exact build/config, proposed 8–12-person cohort, all 6 division journey owners, budget ≤Rp 50,000 and current restore/security evidence; zero unresolved P0/P1 defects in promised pilot scope. A missing operator, unresolved data leak, stale backup or failed save blocks invitation expansion.

**Owner:** Engineering + data/process owner (named people TBD)

**Source / assumption:** Original DWDG sequencing correction; proposed pilot and safety gates, not passed evidence. Consultation planning checked 2026-10-03; numerical targets are proposed DWDG acceptance, not measured results or vendor SLA.

**Dependencies:** launch_securityreview
launch_recoveryreview
launch_funding
launch_ownership
releases_checks
launch_scope
releases_deploy


### Decisions, sources and PRD maintenance

ID: planning-control · proposed · P0

Open decisions and versioned baseline management. Confirmed statements reflect direct decisions or verified evidence; Proposed means recommended; Open requires an answer; Deferred is outside the adopted first release. Browser revisions need a portable JSON handoff. Source files and the older baseline are preserved, and a new AI reads the latest chosen revision rather than assuming a generated seed contains all browser edits.

**Acceptance:** 1. Every adopted requirement has stable ID, owner, source/assumption and testable criteria.
2. Structured prerequisite links have 0 missing targets/self-links/cycles.
3. Old draft 0.1 remains available separately; an exported chosen revision can be imported with 0 silently discarded records/history.

**Owner:** Mahdy + planning owner

**Source / assumption:** Current PRD-first user direction and editable draft/source preservation contract.


#### Open decisions and discussion queue

ID: decisions · proposed · P0

Start discussion with decisions that change launch feasibility. Confirmed facts: name, monthly target Rp35,000 and ceiling Rp50,000, ~40+ members, no existing domain/shared Drive, scoped roles, current divisions and future organization draft. The detailed launch/SOP choices below remain editable. An open item has an owner, proposed default, impact, and required-before milestone.

**Acceptance:** 1. No unresolved launch-critical decision is silently replaced with an assumption.

**Owner:** Mahdy

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


##### Who holds organization accounts and recovery?

ID: decision-custody · open · P0

Need named primary and backup custodians for database/hosting/provider folder accounts, recovery email/factors, export locations, and billing if required. Proposed default: two appointed responsible people with individual administrator permissions, documented recovery, no shared plaintext passwords. No existing organization domain/Drive is available; university eligibility or institutional ownership must be checked separately.

**Acceptance:** 1. Before real data: both custodians can access required services and a recovery exercise succeeds.

**Owner:** Mahdy + President

**Source / assumption:** User confirms no domain/shared Drive


##### Can the operating plan fit Rp35,000–Rp50,000/month?

ID: decision-free-tradeoff · open · P0

Confirmed budget target Rp35,000/month, hard ceiling Rp50,000/month. Proposed baseline uses low-cost eligible managed services and a free subdomain, with independently tested backup/custody. Use the budget for necessary recurring operations rather than spending to reach a target. Resolve vendor inactivity/quota limits, actual backup destination costs, annualized charges and response ownership. Supabase Pro is outside this ceiling at checked pricing and needs a separate future budget decision. Small optional paid services must fit the all-in ceiling, including taxes/card fees and annual renewals. Affordable service is not a promise of always-on availability.

**Acceptance:** 1. Before general launch: limitations, fallback, backup age limits and operator ownership are accepted in the PRD; actual plan quota and terms verified.

**Owner:** Mahdy + President

**Source / assumption:** User revised budget: target Rp35,000/month, maximum Rp50,000/month; vendor limitations researched separately

**Dependencies:** costs_monthlyA
costs_owner
reliability_freepause


##### Where will documents live without a shared Drive?

ID: decision-file-policy · open · P0

Default launch Resources uses native notes/folders and links to external files; native binary upload is deferred unless explicitly enabled after storage/cost/security approval. The user has no current shared Drive. Arrange organization custody with named operators and individual sharing; distinguish Shared Drive entitlement from an ordinary shared folder. Review existing personal-file links and ownership continuity before import. No shared-account password distribution. Any optional provider charge/annual renewal counts toward target Rp35,000 and maximum Rp50,000/month.

**Acceptance:** 1. Choose provider/ownership, successor access, sensitive-resource policy and departure process before real import; keep native uploads disabled until explicitly accepted.

**Owner:** Mahdy + document custodian

**Source / assumption:** User no shared Drive; Resources discussion

**Dependencies:** scope_org_storage_setup
resource_provider_access


##### Which identities can join and who approves them?

ID: decision-invite · open · P0

Proposed invitation-only roster with verified identity and membership review; Google sign-in may reduce email-delivery costs if available and correctly configured. Decide whether @students.uii.ac.id/@uii.ac.id is mandatory or alumni/advisors/partners can receive exceptions. Do not infer membership from a domain alone. Mahdy's concrete login identity must be verified before admin provisioning.

**Acceptance:** 1. Before account rollout: invitation approver, allowed identities, exception expiry and first-admin identity are recorded and tested.

**Owner:** Mahdy + President

**Source / assumption:** Mahdy admin plan confirmed; no account provisioning authorized by PRD

**Dependencies:** access_action_matrix
org_batch_model


##### Who confirms each division’s minimum workflow?

ID: decision-sop · open · P0

Six division leads should review status names, required fields, reviewer roles, and completion evidence. Consulting PL/PM distinctions and Legal ticketing/numbering/PKS→BAST→invoice are respondent suggestions until officially adopted. HR/Strategy workflows lack survey representation and need direct feedback. Avoid giving invented SOPs a confirmed label.

**Acceptance:** 1. Before baseline: each capability has an accountable reviewer and minimum end-to-end accepted workflow, or explicitly provisional pilot treatment.

**Owner:** Division leads

**Source / assumption:** Survey evidence + respondent qualitative comments

**Dependencies:** scope_hr_strategy_gap
strategy_validation
hr_validation
finance_sop
consulting_validation
marketing_validation
external_validation


##### What does reminder delivery mean in v1?

ID: decision-reminders · open · P0

Survey reminders are highest-demand need. Proposed minimum: persistent due dates, actionable in-app due queue and reopening catch-up. Decide whether email while closed is essential enough to fund/setup SMTP and scheduler now. WhatsApp API, calendar synchronization, and push are deferred unless scope changes. The product must state its actual delivery behavior clearly.

**Acceptance:** 1. Before scope freeze: reminder channels, quiet hours, timezone, retries, cost and closed-app behavior are specified.

**Owner:** Mahdy + division leads

**Source / assumption:** Survey S01 8/8; free-budget constraint

**Dependencies:** scope_student_scale
work_updates


##### Retention, sensitive records, and export approval

ID: decision-data-policy · open · P0

Need organizational decisions for member contact/HR/candidate data, client contacts, legal documents, financial requests, archival periods, and who approves exports/deletion. Proposed minimum collect only what supports work; restrict sensitive content; preserve required operational history; avoid unnecessary student IDs/home addresses/bank data. Specific statutory obligations require qualified verification rather than an invented 'compliant' badge.

**Acceptance:** 1. Before collecting sensitive real data: data categories, purpose, access, retention/deletion, custodian and export workflow are documented.

**Owner:** President + HR/Legal/Finance leads

**Source / assumption:** Privacy/data-minimization proposal

**Dependencies:** security_privacy


##### Confirm wordmark treatment and default language

ID: decision-brand · open · P1

Name DWDG’ONE is settled; typography/logo spelling can use a reviewed wordmark asset. Proposed operational baseline retains current neutral palette, compact desktop rows and Samsung mobile groups while applying clean Notion-like structure and supplied tactile controls. Proposed default language English with ID switch. Resolve logo asset and default language without reopening product terminology.

**Acceptance:** 1. A reviewed logo/wordmark and first-login language exist before public-facing onboarding material.

**Owner:** Mahdy + MarCom & IT

**Source / assumption:** Name user-selected; previous design direction

**Dependencies:** vision-name
design-reference


##### Choose pilot owners, duration, and launch window

ID: decision-pilot · open · P0

There is no confirmed launch date, named QA operator, backup custodian, or representative pilot roster yet. Proposed sequence uses one representative from each current division and a leadership/admin role before broad rollout. Estimate implementation only after requirements and capacity are settled.

**Acceptance:** 1. Pilot owner, support owner, launch criteria and availability of volunteers are recorded; dates remain open until agreed.

**Owner:** Mahdy + President

**Source / assumption:** No schedule provided by user

**Dependencies:** quality-defects
vision-capacity-fixtures


##### Future structure activation remains separate

ID: decision-restructure · open · P1

Current six divisions remain active. Three-VP future structure remains a draft. Project Delivery is provisional; Expert Network belongs two batches ahead and reporting line is open. Choose future activation batch, leaders, project migration assignments, legal/finance split ownership, and role changes through a preview; never activate merely because the PRD shows the new tree.

**Acceptance:** 1. Activation requires a complete migration preview and named batch decision; old history remains queryable.

**Owner:** President + admin

**Source / assumption:** Referenced chat direct user confirmations

**Dependencies:** org_future_three_vp
org_activation_preview


#### How this PRD stays useful

ID: prd-management · proposed · P0

The planning tool is editable and its output is portable. A seed draft is not an approved baseline. User edits remain separate from the old app; sharing a JSON revision lets the next session inspect actual changes. Record requirement IDs, status, priority, owner, source, acceptance, and dependencies so detail can become implementation work without losing decisions.

**Acceptance:** 1. The PRD can be exported, reopened, changed, and compared without depending on the original conversation.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


##### Decision status and implementation status are separate

ID: prd-management-status · proposed · P0

Confirmed = explicit user decision or verified evidence. Proposed = recommended design/behavior pending discussion. Open = unanswered choice that affects scope/operations. Deferred = outside first-version commitment. Priority P0/P1/P2 indicates launch criticality/importance/secondary scope within the relevant commitment; it is not a test result. Implementation/test outcome must be tracked separately in delivery evidence.

**Acceptance:** 1. No node marked Confirmed implies deployed, secure, visually accepted, or tested; evidence fields link to actual checks.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification


##### Versions, sources, and traceability

ID: prd-management-baseline · proposed · P0

Keep original source references and dated price/quota checks. Exported draft contains stable requirement IDs and readable Markdown. Baseline version has owner/date and reviewed changes. New AI sessions must read current user revision, open decisions, and evidence before implementation. Prior implementation spec remains historical/reference input while this restart PRD is a draft; avoid two unexplained authorities.

**Acceptance:** 1. README identifies current draft and old materials, and explains that editing the planning app does not write back to production or overwrite the seed file automatically.

**Owner:** Mahdy + product owner

**Source / assumption:** DWDG'ONE restart request, 3 October 2026; proposed specification

**Dependencies:** prd-management-status
prd-management-dependencies


##### Edit, add, move, delete, and Undo

ID: prd-management-editor · confirmed · P0

The planning app provides readable outline and rightward map, editable requirement detail, add sibling/child, move with cycle prevention, subtree deletion with count, Undo/Redo, and JSON/Markdown export/import. Draft edits persist on this device when storage is available; portable export is the backup. A corrupt saved revision is surfaced for recovery rather than silently replaced.
Revision0.2 adds a continuous All nodes list and entire-document map option. Older baseline0.1 is preserved separately; browser changes are not implicitly merged into a regenerated seed.

**Acceptance:** 1. Add/edit/move/delete1 temporary subtree; Undo restores its exact stable IDs and field values.
2. For N current requirements, JSON/Markdown export containsN IDs; importing a valid chosen copy discards0 history events silently.
3. Current app data is changed0 times by planning edits.

**Owner:** Planning tool owner

**Source / assumption:** Current user asks edit/add/delete like prior session; safeguards proposed


##### Dependencies mean direct prerequisites; related concepts are not blocking edges

ID: prd-management-dependencies · proposed · P0

Use stable requirement IDs, one per line, for conditions that must be defined/adopted/implemented before the current requirement can safely be validated. Do not add every related feature, every ancestor, or a reverse link solely to look connected. Keep related process variants in notes/source/flow handoffs if they do not truly block the requirement. Foundational facts and taxonomy/group headings may correctly have no prerequisites. Optional/deferred scope must not accidentally block mandatory launch; conditional optional relationships are explained in notes. Dependency links are editable and browsable; invalid structured IDs are flagged.

**Acceptance:** 1. Build checks all structured dependency IDs with 0 missing targets, 0 self-dependencies and 0 directed cycles.
2. Review each launch prerequisite touching a Deferred/Open decision: optional branches are 0 hidden mandatory gates; genuine policy gaps stay explicit.
3. Each nonempty link has a substantive prerequisite explanation in the requirement/flow context; no blanket parent-link inflation.

**Owner:** Product + engineering + process reviewer

**Source / assumption:** Latest user asks thoughtfully filled dependencies; software/process traceability proposal,3Oct2026.


##### Numbered criteria with units, fixtures, tolerances and evidence

ID: prd-management-measurable · proposed · P0

Write acceptance as 1., 2., 3. checks when it helps execution. Numeric specifications include units and context: CSS px at 100% zoom, IDR integer amounts, response percentile with sample/mix/device, exact fixture counts, recovery working hours, and 0 unauthorized disclosure. A number is a proposed target until measured; sourced provider quotas are dated facts. Use pass/fail invariants when timing or size has no responsible basis. Never invent approval turnaround, retention legality, recruitment scoring or server capability to make every sentence numerical.

**Acceptance:** 1. Every new numeric target identifies unit and relevant fixture/measurement context.
2. Design dimensions reference 1 adopted token source; documented exceptions have owner/reason.
3. There are 0 invented measured results or unapproved business SLA promises.
4. Evidence records expected/observed values for 100% of adopted launch-blocking checks.

**Owner:** Design + engineering + QA + domain leads

**Source / assumption:** Latest user requests numerical acceptance including padding/type/gaps; proposed metrology contract.

**Dependencies:** prd-management-status


##### Continuous All nodes list and entire rightward map

ID: prd-management-all-nodes · confirmed · P0

Planning editor provides a continuous All nodes view that includes the complete chosen document hierarchy with full titles and accessible edit/open routes. No Next branches action is needed to access the list. Rightward map also offers an entire-document scope with pan/zoom and all parent connectors; the optional focused mode remains useful for detail. These are rendering choices, not a node-count ceiling. Keep readable text rather than squeezing the whole hierarchy into a tiny single screen. Outline search is local navigation and must not silently reduce All nodes content.

**Acceptance:** 1. All nodes list renders N stable IDs exactly once for a chosen N-node document, with 0 pagination controls.
2. Entire map contains N nodes and N − 1 hierarchy connectors for a valid single-root tree, with 0 branch-page omissions.
3. Select/edit/add/delete preserves complete rendering and export count; no arbitrary node-count cap is introduced.
4. All details remain inspectable at readable text size through pan/scroll/open, not font shrinking.

**Owner:** Planning tool owner

**Source / assumption:** Direct user asks an intuitive option to see every node without Next branches,3Oct2026.

**Dependencies:** prd-management-editor


##### Enterprise process rigor adapted to a 40+ member student organization

ID: prd-management-consultation · proposed · P0

Review trigger → intake → validated master references → assignment → work → independent review where needed → handoff → closure → archive. Track shared master records, authorized state transitions, version-bound approvals, segregation of duties, exception paths, reconciliation and audit. Fit specialist workflows to this small common core; validate gaps directly with actual division owners. Official SAP process/Fiori guidance informs methodology, while the proposed stack remains simple Vite/managed database/Auth within the established budget. A planning review does not confer certification or prove a live SAP integration.

**Acceptance:** 1. Review 6 division main journeys and account lifecycle for ownership, data, handoff, exception and audit coverage.
2. Shared IDs are reused across process handoffs with 0 duplicate shadow projects/tasks created by views.
3. Open SOP/authority/custody questions have an owner and required-before milestone.
4. No SAP license/runtime/paid infrastructure is added to the launch budget by this method choice.

**Owner:** Product/process + engineering reviewer + domain owners

**Source / assumption:** User asks SWE and SAP expert consultation perspective,3Oct2026; primary-source research in CONSULTATION_REVIEW.md.

**Dependencies:** prd-management-dependencies
prd-management-measurable

