# DWDG’ONE — dual functions, task consent, data stewardship, and authority

Discussion revision · 5 October 2026 · Universitas Islam Indonesia.

This document takes precedence over older role, task-assignment, and data-ownership assumptions wherever they conflict with the user's latest instructions. It supplements `ORGANIZATION_DIVISION_BLUEPRINT.md`. It changes planning documentation only: no account, role, task, database, browser revision, or external service is modified. Workflow details below are proposed unless listed as confirmed.

## 1. Confirmed requirements from the latest user message

1. Every ordinary organizational member has two functions: consultant and their own division role. Joining Consulting work is not restricted to primary Consulting-division members.
2. Any member can work on tasks outside their division, and any member can propose a task to another member, subject to the recipient's consent.
3. Mahdy is head of SnG and also has Admin authority. Admin is the highest application authority and can act with powers above President, including deleting the President account.
4. There is an IT admin account that must not appear in search.
5. Only the incumbent President can perform normal presidency handover to another account.
6. HR can move members between divisions.
7. The President appoints VPs.
8. Directors can be appointed by the relevant VP, President, or Admin.
9. “Co” / “CD” means Co-Director, as clarified by the user and supplied hierarchy. Under Consulting Director are CD of Project Associates, CD of Knowledge, and CD of TnD, each with members. Ordinary EE/MarCom/HR/FnL/SnG leadership includes Director and Co-Director positions. These are explicit role assignments, not guessed titles from display names.
10. Director and above can remove/isolate members, disabling their application functions; they cannot ban someone above them. Equal-rank and cross-reporting scope rules are still unspecified.
11. Admin can appoint a replacement President through emergency recovery if the incumbent is removed/disabled/unavailable. This exception was explicitly selected by the user; normal handover remains incumbent-President-only.
12. Projects can be created only by CD/Co-Director and higher roles: Co-Director, Director, VP, President, Admin. Ordinary members' consultant function, task-consent rights, PL/PM assignment, and accepted collaboration do not automatically grant project creation. Rank eligibility and permission for the target workspace are checked separately.
13. Ordinary members can add, edit, and delete their own tasks; standalone tasks do not require a project or CD approval. Shared/requester-versus-assignee deletion boundaries are detailed as proposals in `TASK_CONTROLS_AVAILABILITY.md`.
14. Every ordinary member can mark completely unavailable dates/times with notes in Calendar. `TASK_CONTROLS_AVAILABILITY.md` captures inspected video reference, recurrence/conflict recommendations, note privacy, and separation from attendance/leave approval.

These requirements do not erase the confirmed current/ideal reporting chart or make every member an unrestricted browser of every workspace. Explicit consent and relevant record access are separate decisions.

## 2. One person, multiple independent functions

A person has one immutable identity and an individual login, with separately dated assignments:

- Primary division/branch membership and organizational position.
- Consultant participation/skills and engagement staffing assignments.
- Administrative authority, if granted.
- Specific record/task/program/request collaboration grants.
- Current account status and consent/appointment history.

Mahdy example: primary division SnG; position head/director as supplied; consultant function; highest Admin grant. A lower division position does not restrict the explicitly granted Admin authority. A member from HR or MarCom can contribute to an engagement without transferring into the Consulting division or receiving all Consulting resources.

Consultant function is not the Consulting organizational unit. PL/PM/project reviewer/mentor are context roles and do not automatically promote organizational rank. Participation rights do not prove skill certification, capacity, or eligibility for every specialized approval.

## 3. Consent-based task offer and acceptance

Recommended offer lifecycle: draft -> offered -> accepted / declined / change requested / withdrawn / expired. Accepted work then uses the ordinary task lifecycle. Administrative appointment and discipline are separate workflows from task offers.

1. Any active permitted member can create a task proposal for another eligible ordinary member across divisions. Assignment picker uses limited organization-wide member discovery, while excluding concealed/system accounts and banned/inactive recipients.
2. Proposer supplies title, expected result, necessary context, owner/requester, estimated scope if known, proposed due date, and resources. Search/discovery reveals only adopted public profile fields, not grades, contact secrets, or private workload notes.
3. Proposer must be permitted to share the referenced context. A public task wrapper cannot leak private HR/client/finance content. A sanitized offer may reference a private record through a controlled grant request.
4. Recipient sees sufficient permitted information to decide. Pending offer appears in My Work -> Invitations/Offers, distinct from accepted workload.
5. Recipient accepts, declines, or proposes changes. Decline/requested changes has no automatic penalty or assumed grade effect. No reply means pending/expired, never accepted.
6. Before acceptance is committed, server rechecks membership, account status, offer version, proposer authority to share, and required record grants. Recipient consent alone cannot grant source access the proposer does not control.
7. Acceptance records actor/time/version and activates the agreed task assignment with bounded necessary access. Where a separate resource/project approver is required, show accepted-awaiting-access rather than pretending work is ready.
8. The assignment grants task and explicitly authorized resources/context only, not all parent division/project/client records. Declining creates no persistent collaboration grant.
9. Preserve one task ID and separate offer/assignment identity; My Work, calendar, requester view, and permitted source workspace reference canonical records. Participants from several divisions do not create several copies of the task.
10. Material scope/due/assignee changes require a revised offer or explicit acknowledgment according to the adopted change policy. Reassignment requires the new person's consent; existing accepted responsibility stays clear until replacement/handover is agreed.
11. Multi-person tasks have one accountable owner and separately consented contributors/backup. Requester is not automatically responsible for execution, and a backup is not silently made owner.
12. Accepted assignee can request withdrawal/reassignment with reason and handover. Team reviews outstanding work rather than erasing history. Account ban blocks actions immediately; reassignment remains an explicit pending duty.

Any active member can be considered for work; appropriate access, required reviewer independence, actual expertise, and consent still constrain individual actions. Leadership rank must not silently bypass the task consent requirement.

## 4. Authority and appointments

Highest authority is Admin. The supplied hierarchy explicitly places Consulting's CD roles below Consulting Director and above their members. Use explicit role classes Admin, President, VP, Director, Co-Director/CD, Member for project-creation eligibility; ordinary division Director/Co-Director share their division's leadership context. This creation threshold does not itself settle same-rank discipline or grant CD the Director-and-above isolation action. Consultant participation is not a rank. Hidden IT Admin's powers are not established merely by its account label.

Recommended appointment matrix:

| Action | Confirmed actor | Proposed scope or unresolved condition |
|---|---|---|
| Normal presidency handover | Incumbent President | Named successor acceptance, current-office/version checks |
| Emergency presidency recovery | Admin | Explicit recovery reason, vacancy/incumbent status, named successor, separate audit |
| VP appointment | President | Named VP portfolio and effective date; Admin override follows its confirmed highest authority |
| Director appointment | Relevant VP, President, Admin | VP limited to reporting portfolio; no self-created broader authority |
| Co-Director appointment | Upper hierarchy | Precise rank and eligible appointing roles relative to Director pending |
| Create project, engagement, or campaign project | CD/Co-Director and higher | Active role and target workspace/action permission required; ordinary task offers remain open to members |
| Move ordinary member | HR | Date, source/destination, relevant access, open work/custody preview |
| Ban/isolate lower-ranked member | Director and above | Higher ranks forbidden; same-rank and reporting scope pending |
| Delete President account | Admin | Access removal plus retained business provenance; replacement through explicit Admin recovery |
| Grant/revoke Admin | Not expressly specified | Recommend highest Admin only; never inferred from SnG head or IT label |

Record appointments as explicit dated grants with actor, target, unit/portfolio, role, start/end, reason, current configuration, and predecessor. Demotion, expiry, and revocation retain history and recheck dependent permissions. A director selecting a task owner cannot promote them to VP. A VP cannot appoint a director outside portfolio under the proposed scope rule.

### Project creation threshold — confirmed

Apply CD-and-up eligibility to New project, consulting-engagement creation, campaign-as-project creation, duplication, template-based creation, API requests, and imports that create new live projects. A member cannot bypass the threshold by changing the entry point, using an existing project as a template, or becoming PL/PM. Separately authorized Admin recovery/import of historical records keeps original provenance and is not ordinary member creation.

Recommended member route: submit a project proposal/request to an eligible lead; the authorized CD-or-higher actor reviews and creates/links the project. Record the requesting member separately from the actual creator. This proposal route is not yet a required user feature. Member task creation/offers and consented participation continue unchanged; no project is needed for a standalone cross-division task.

### Presidency handover

Normal process: incumbent names successor -> successor accepts -> incumbent confirms effective transfer -> system atomically ends old office grant and activates new grant -> privilege/session changes recorded. Enforce one active President. Use fresh authentication and revision checks for final transfer. The outgoing account does not necessarily leave the organization; consultant/division roles remain according to separate decisions.

Emergency recovery is confirmed: Admin can appoint a replacement if the incumbent is deleted/banned/unavailable. Proposed recovery flow separately records reason, current office/incumbent state, new account, effective date, fresh authentication, and successor acknowledgment. Atomically end or replace the prior office grant, retain its history, activate exactly one successor, and record Admin as recovery actor. Do not label this a voluntary outgoing-President handover, automatically assign office to the deleting Admin, or require an unavailable incumbent's consent for this confirmed recovery exception. Recovery mechanics and evidence requirements remain proposals.

## 5. Member transfer, suspension, isolation, and deletion

### HR transfer

Preview old/new division and branch, effective date, ordinary division access, accepted engagements/tasks, private grants, reviewers, resource/account custody, and unresolved offers. Change membership; retain person ID, consultant function, and historical assessment/attendance unit snapshots. Independently review continued task/project grants. Do not remove useful collaboration by assumption or retain private source-division access silently.

Moving a member is not authority to move/demote President/Admin or rewrite the reporting chart. Role-holder transfers need their separate appointment authority. Destination acknowledgment is a proposal, not an established requirement.

### Isolation/ban

User's requested isolation disables application functions. Recommended implementation: active -> suspended with reason/actor/date/review information. Revoke/deny active sessions and all write/read operations covered by the ban, including inherited consultant/task grants; allow at most a deliberately specified blocked-account information screen. Existing offline copies/provider access cannot be revoked by an app flag alone.

Check the target's highest effective protected authority, not only their primary division position. A director cannot ban Mahdy by viewing him as an SnG member while ignoring Admin. Deny privileged-role edits, appointment tricks, HR transfers, or direct endpoints that bypass the rank check. Same-rank discipline and cross-reporting scope are open; recommended baseline is strictly lower rank within reporting scope, with organization-wide action reserved for President/Admin.

Display accepted tasks, pending reviews, client duties, and custody needing handover. Suspension does not automatically mark work completed, delete artifacts, remove grades, or reassign accepted tasks. Restoration is a separately authorized action and must not silently restore roles already expired/revoked while suspended.

### Account deletion and historical records

Admin can delete the President's app account as explicitly requested. Recommend separation of login/account access, member identity/provenance, and organizational work records. Deleting a login does not cascade-delete signed document records, transactions, decisions, task outputs, attendance, or authorship. Account may be disabled/deleted in authentication while business history retains a dated former-member reference according to adopted retention policy.

Purging personal fields and deleting specific business records are separately scoped administrative actions. Preserve required historical links or explicit tombstones; no claim of absolute undeletability or legal retention period is made. An Admin business override records actor/reason rather than impersonating a President/signatory or fabricating external evidence.

Recommend a last-active-Admin guard plus an explicit controlled recovery arrangement before self-removal. This is a proposal; hidden IT Admin must not be assumed to be that recovery account until its powers and custody are agreed.

## 6. Hidden IT admin account

Confirmed: exists in the planned account model and is absent from search. Recommended concealment includes member directory, assignment/mention pickers, organization people charts, ordinary search, normal profile links, notifications suggesting contacts, and ordinary roster exports. Search output omits it entirely rather than returning a visibly redacted hit or count that reveals its existence.

Keep it visible to authorized Admin account-management/security audit surfaces. Concealment is not a replacement for authorization and does not mean unlogged administration. Standard workspace events may show a safe system-maintenance actor label while privileged audit retains actual account identity and actions.

Recommended role: explicitly delegated technical operations, separate from normal member/consultant accounts. Whether it is full highest Admin or limited IT administrator is open. Protect its login separately, define custodian/recovery, avoid shared credentials, and do not let ordinary IT requests or role names create its authority. No account or credential is created by this document.

## 7. Data ownership: governance, stewardship, authorship, access

Product-governance recommendation: DWDG has organizational custody of official work records; individuals retain recorded authorship and specified access to their own personal records. This is a product custody proposal, not a legal claim about intellectual property or university/provider terms.

Separate four meanings:

1. Organizational custody: which organization/term retains official records and exports.
2. Record stewardship: which unit/person maintains accuracy, next actions, and handover.
3. Authorship/provenance: who created/submitted/approved/changed each version.
4. Access: who can see, edit, review, export, suspend, or delete that specific data.

Accountable task owner, folder-responsibility avatars, resource author, domain steward, provider file owner, and data access are not interchangeable. Becoming the task assignee never means owning all business data or granting access to everyone else.

### Proposed source-of-truth and stewardship matrix

| Data | Steward/custodian | Authoritative location | Ordinary access and change behavior |
|---|---|---|---|
| Person identity, account status, role grants | Admin; HR for permitted member fields/transfers | Native app; auth provider for login/session secrets | Public profile limited; membership/role changes privileged, historical identity retained |
| Consultant eligibility/profile and engagement assignment | Individual + permitted Consulting staffing lead | Native app | Approved skill/availability fields shared as adopted; personal declaration differs from verified outcome |
| Task offers, consent, owner, deadline, status | Requester + accepted assignee; contextual lead | Native app | Bounded participants/context access; explicit consent/revisions; one canonical task |
| Weekly attendance and absence notes | HR/authorized meeting officer | Native app for adopted registers | Member own record; organizer allowed register; private reason narrower |
| Fortnightly submissions, grades, corrections | HR + assigned reviewer | Native app after adopted rubric | Member own result; scoped reviewer; no public raw-grade directory |
| Award decisions | HR + recognition panel | Native app | Decision trail restricted; approved announcement selectively published |
| Partner/client/contact/opportunity records | EE with Partner/Client responsibility | Native app if replacing tracker, otherwise explicitly adopted Sheet plus controlled import | Selected operational fields; confidential context bounded; no assumed live sync |
| Engagement scope/deliverable review | Project Associates + PL/PM/reviewer | Native metadata/decisions; linked provider bytes | Version-specific approved evidence; one engagement with cross-division collaborators |
| Knowledge article/publication revision | Knowledge curator/reviewer | Native note/metadata or deliberately chosen provider source | Approved audience; exact version references; client originals stay restricted |
| TnD participation/session/assignment/outcome | TnD | Native app for adopted workflow | Participant own outcome and permitted staffing summary, distinct from HR grade |
| Legal number/register/review decision | FnL Legal | Native register when adopted | Controlled issuance/review; signature evidence separate |
| Finance request/approval/commitment/transaction | FnL Finance | Native adopted operational records | Permission-separated approval/payment and explicit corrections |
| Content production/review/publication | MarCom | Native workflow metadata; Canva/other provider for design bytes | Version-aware review; planned/actual publication separate |
| IT custody, incidents/releases | Authorized IT/Admin | Native safe register/audit plus selected infrastructure | No credentials in searchable records; technical scope separate |
| Strategy research/decisions | SnG | Native decisions/evidence links; Sheets for analysis | Permitted sources/aggregates; no inferred productivity/health data |

Do not force a native migration of a well-working Sheet. For each collection, name exactly one authoritative workflow record source and define fields imported/copied, update direction, mapping, conflicts, and stale-state display. V1 preference: native ownership/deadline/approval/consent state, external tools for analysis/file editing, deliberate CSV import where necessary. A Sheet date/PIC is not an app deadline/person until mapped through an adopted import/integration.

External files have actual provider owner/custodian, permission, link/version, and handover plan. App grants cannot grant Drive access; removing app access cannot revoke a shared external link; exporting metadata doesn't export provider bytes. With no existing organizational Drive/domain, provider custody is still an explicit setup decision within Rp35,000 target / Rp50,000 maximum.

## 8. Audit, Changes, and privileged actions

Keep workspace Changes scoped to selected workspace and permitted field details. Accepted cross-division collaboration can yield safe linked events in authorized contexts, not an unrestricted all-workspaces feed. Appointments, bans, account deletion, admin grants, concealed IT operations, and presidency transfer also need restricted administration audit.

Record actor, target, action, source/current version, reason, timestamp, outcome, and safe changed fields. Imported/PRD-local history is not authenticated production audit. Avoid secrets/private absence or assessment text in general logs. Proposed append-only application audit APIs preserve original events and record reversals; infrastructure operators retain actual control, so do not claim absolute tamper-proof logging.

Server-side checks must evaluate active status, role/action, reporting relation, explicit record grants, workflow stage, consent, and record version for reads and writes. Hidden navigation/search is insufficient. These design choices align with OWASP primary guidance: deny unspecified access, verify each request, and account for relationships and relevant attributes.

References verified 5 October 2026:
- https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

## 9. Proposed acceptance checks

1. One active ordinary member can retain one person ID across division role, consultant function, and three engagement assignments; no duplicated person records.
2. Ten offered tasks without recipient acceptance produce ten pending offers and zero accepted assignments.
3. Accepting one cross-division offer records one consent/version and one canonical assignment; retry creates zero duplicates.
4. Declining one offer grants zero private source records and produces zero automatic disciplinary/grade events.
5. A proposer lacking source-share permission grants zero private context access even if recipient presses Accept.
6. One accepted task from Consulting grants zero unrestricted Consulting workspace resources to an HR member.
7. HR transfer changes current division membership while preserving 100% of historical attendance/grade/provenance IDs and independent consultant function.
8. A Director with no Admin grant can ban zero targets with higher effective authority, including Mahdy despite his SnG position.
9. A suspended account performs zero authenticated business reads/writes/exports via app APIs or old sessions; downloaded/provider copies are explicitly outside this app guarantee.
10. IT admin appears in zero ordinary search/directory/assignment/mention/roster outputs, while authorized account management and restricted audit retain identity.
11. Only current President completes normal office handover; Admin's separately authorized emergency recovery can appoint one replacement, and concurrent/stale attempts create zero second active Presidents.
12. Admin deletion of President login removes access but deletes zero unrelated official deliverables, payments, signatures, or authorship references by cascade.
13. Role appointment events retain actor/unit/effective date; task assignment creates zero organizational promotions.
14. Material offer revision cannot silently inherit acceptance of a different version under adopted change policy.
15. Workspace Changes exposes zero private assessment/absence/credential fields to unauthorized participants; privileged administrative audit is separate.
16. Export labels native records, external links, missing bytes, and selected rights; secrets/session tokens appear zero times.
17. An active ordinary member with consultant and PL/PM assignments creates zero projects through UI/API/duplicate/template/import routes without a separate eligible role grant.
18. A permitted CD creates one project in an authorized workspace; retry creates zero duplicates and records creator identity/role/workspace.
19. A CD lacking target-workspace creation access creates zero projects there solely because their rank is eligible.
20. A member can still offer one standalone task across divisions; until accepted it creates zero accepted assignments and zero automatic projects.

## 10. Open decisions awaiting clarification

- Co-Director appointment scope and discipline authority; project creation eligibility and Consulting CD placement are confirmed.
- Emergency recovery mechanics/evidence/acknowledgment, with Admin appointment authority confirmed.
- Equal-rank discipline and cross-reporting ban scope; proposed baseline strictly lower rank within reporting scope.
- Exact powers/custodian/recovery of hidden IT admin; who can grant highest Admin and last-Admin recovery rule.
- Task scope-change consent, offer expiry, withdrawal, and default directory public fields.
- Private data field visibility, retention/deletion policy, provider/file custody, and collection-specific source-of-truth choice.
