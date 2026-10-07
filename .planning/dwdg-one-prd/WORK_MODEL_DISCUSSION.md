# DWDG’ONE — work model and division workflow discussion

Working discussion revision · 4 October 2026. This supplements the existing PRD; it does not overwrite the seeded editor or import browser edits. No application or operational data is changed.

The subsequent same-day user organization clarification is recorded in `ORGANIZATION_DIVISION_BLUEPRINT.md`, which takes precedence for current/ideal hierarchy and division coverage. Current President → one VP → six divisions is preserved. Ideal VP Consulting has sibling Consulting and Expertise Network; Consulting contains Project Associates, Knowledge, and TnD. Ideal VP Internal retains FnL as one division. Expertise Network is planned for 2027, superseding the older two-batch timing.

## Source and decision register

- The user accepted discussing Project, Program, Routine, and Request as work types with shared Tasks and persistent Records. Acceptance of the model is not approval of every workflow policy below.
- The user explicitly confirms Consulting's three branches: Project Associates, Knowledge, and TnD. Represent each under Consulting, not directly under VP Consulting. Expand TnD provisionally as Training & Development.
- The older referenced “Take notes on YouTube videos” chat supplied a provisional future chart. The latest user clarification supersedes its hierarchy/naming/timing where they differ; see `ORGANIZATION_DIVISION_BLUEPRINT.md`. Do not silently activate this ideal chart or rename operational records.
- HR monitoring and grading is required. The user clarified on 4 October: one cycle every two weeks, not twice a week.
- Member of the Month is required. Eligibility, criteria, scoring weights, panel, tie handling, announcement consent, and appeal timing are recommendations below, not recovered approved policies.
- The user additionally confirmed that HR takes participant lists and absence notes for weekly meetings. This is a weekly process separate from fortnightly monitoring/grading and monthly recognition. Specific attendance statuses and grading effects below are proposals.
- Referenced chats were read using read_thread: 01a0dd42-4430-7711-b682-79c4fcbb2a44; 01a0c407-856a-7700-834c-54b16551d47e; 6ac00bd6-2b88-83ec-90cc-2689c91c8d24; 6ac25c9c-78f8-83ec-8838-81f63afc62f1. The original critique's bounded handoff contains general HR/performance requirements, but the retrieved pages do not establish a previous grading rubric or Member of the Month policy. Do not claim these proposals are confirmed SOPs.
- Existing PRD gaps: org-future/Consulting Knowledge and Training were treated as future shared-capability placeholders; HR flows emphasize membership/onboarding; measure-project-row carries a project-list layout. These gaps require a subsequent deliberate PRD revision, not just additional decorative nodes.

## Organization and work are separate models

Organization -> term/batch -> reporting units -> memberships/roles describes responsibility and access. Project/Program/Routine/Request describes work. A unit is not a project, and a work type does not determine a person's reporting line.

The same person can have a primary division, a specialist unit membership, and a scoped project assignment. None grants unrestricted access to private HR records or client material. Reporting changes have effective dates; completed reviews retain their historical unit and reviewer context.

Four shared work types remain useful, but each division requires domain records, domain transitions, and appropriate interfaces. Do not force everything into an unstructured generic work_items table or automatically add a fifth work type for every capability.

- Project: bounded delivery with scope, milestones, reviews, deliverables, and closure.
- Program: sustained initiative with cycles/cohorts, sessions, participants, assignments, and outcome records.
- Routine: recurring definition generating individually identifiable occurrences with checklists, deadlines, and actual completion.
- Request: submitted need progressing through an explicit handler/review/resolution process.
- Tasks: concrete actions with owner, optional backup/contributors, due date, state, and one primary context. Multiple views reference the same task ID.
- Records: persistent domain facts such as member profile, assessment, partner, opportunity, content item, agreement, transaction, knowledge article, attendance, or award decision. Records can have workflows without being mislabeled as projects.

## Consulting: three named specialist units

### Project Associates — engagement delivery

Recommended responsibility: scope, staffing requests, delivery coordination, client-facing outputs, review readiness, and closure. PL owns solution/content direction; PM owns coordination/schedule/risk/updates, following the supplied Consulting survey distinction. Exact authority to accept/start/send remains configurable and unapproved.

1. Intake owner receives a prospective engagement or internal proposal. Link partner/opportunity ID and safe intake evidence; do not duplicate client identity. Declined intake retains reason and permitted history.
2. PL drafts the scope version: problem, deliverables, exclusions, assumptions, acceptance conditions, dependency on client data, and expected review gates. PM drafts dates, communication cadence, risks, and next actions.
3. Authorized lead makes a recorded accept/start decision. Missing authorization leaves the engagement pending; planned start is not actual start. Scope approval alone is not a signed contract.
4. PM requests staffing by role, skill, required period, reviewer need, and declared availability. Members can accept/decline assignments. Task count does not prove available hours; actual workload collection remains a separate policy.
5. TnD provides permitted training/completion evidence when relevant to staffing. Knowledge provides reusable methods/cases/templates with version and use restrictions. Project staff do not gain access to all private participant assessments or every archived client artifact.
6. PL and PM create work packages, canonical tasks, milestones, and deliverable records. Each deliverable has an accountable owner, reviewer, acceptance checklist, and required evidence/version. Tasks can reference the same deliverable without copying it.
7. The team records progress, dependencies, and blockers. A blocker has a next-action owner and escalation path. A completed task does not imply its deliverable has passed review.
8. Contributor submits deliverable version N. Reviewer records approve/changes requested, comments tied to that version, and review date. New version N+1 retains N and its review; comments are resolved or explicitly carried forward.
9. A scope-change request records old/new scope, rationale, effects on dates/resources, and approving authority. Pending change does not silently modify the approved baseline.
10. Authorized sender records actual client delivery, channel, delivered version, and evidence/attestation. Internal approval, delivery, and client acceptance remain distinct states.
11. Client feedback/rejection creates revision or follow-up work. Legal agreement/BAST readiness and Finance obligations are linked separately; delivery is not proof of signature or payment.
12. Closure checks deliverables, acceptance, unresolved obligations, and handover. Any waived requirement names approver and reason.
13. Retrospective owner proposes reusable lessons/templates to Knowledge and training needs to TnD. Knowledge receives a sanitized draft, not unrestricted client folders. TnD receives permitted learning needs, not confidential client details by default.

Main interface: engagement portfolio table plus delivery board; engagement detail retains Overview / Work / Resources, with review/scope information placed inside those sections rather than proliferating top-level tabs.

### Knowledge — organizational knowledge lifecycle

Recommended responsibility: preserve, review, classify, publish, find, and refresh reusable consulting knowledge. A file link by itself is not a reviewed knowledge article.

1. Author submits a knowledge contribution or delivery retrospective with source, owner, intended audience, tags, original context, and confidentiality declaration.
2. Knowledge curator checks duplicates and provenance, proposes article versus update to an existing article, and requests missing material.
3. Author prepares a reusable summary/template/method; sensitive client names/data are excluded from the proposed wider-access publication.
4. Authorized reviewer checks accuracy, permitted reuse, completeness, and audience. Restricted original evidence remains restricted even if a sanitized summary is published.
5. Reviewer returns changes or approves a specific version. Publish only that version with author, reviewer, date, audience, and next review date.
6. Search exposes only permitted titles/content/links. Users can find by topic, method, industry, program, and linked engagement where allowed.
7. Projects and TnD sessions reference article/version IDs. Editing the current article does not silently rewrite the historical source used in a completed session or approved deliverable.
8. Users report outdated material through a correction request. Review creates a new version; archive/withdrawal retains permitted history and explains unavailable links.

Main interface: searchable knowledge collection, compact list/grid, topic filters, and an article inspector. Provider file links retain separate provider permissions and are not automatically backed up.

### TnD — Training & Development

Recommended responsibility: identify skill needs, design learning programs, run cohorts/sessions, assess learning, and follow up on development. It does not replace HR's organization-wide performance and recognition process.

1. TnD receives learning needs from delivery reviews, member development actions, and leadership priorities. Record the gap, requested audience, evidence, owner, and intended learning outcome.
2. Lead creates a program and a specific cohort/cycle. Define enrollment method, eligibility, goals, facilitators, sessions, assignments, completion rules, and assessment rubric before enrollment.
3. Invite/assign participants with explicit account links. Record accepted/pending/withdrawn participation; do not assume every invite attended.
4. Prepare sessions using approved Knowledge versions, schedule, facilitator, venue/meeting link, materials, and tasks. Recurring reminders reference session IDs.
5. Record actual attendance and excused absence separately. Participant records are scoped; a shared calendar does not reveal private assessment notes.
6. Participants submit assignments with evidence/version. Reviewer grades against the cohort's rubric and provides improvement feedback; late, missing, returned, and graded remain distinct states.
7. Record pre/post assessment only when actually administered. Do not fabricate improvement percentages from course attendance.
8. Program lead reviews completion per participant using configured rules. Incomplete, withdrawn, and exempt states have reasons and are not silently reported as passed.
9. Create development follow-up tasks; publish only permitted skill/completion summaries for staffing and HR. Completion does not automatically award a grade or Member of the Month.
10. Close the cohort with outcome evidence, participant feedback, unresolved actions, and a proposed next iteration. Previous cohort rules and grades remain unchanged when next cohort is edited.

Main interface: programs/cohorts, upcoming sessions, participant table, and review queue. First release can implement this explicitly without a full LMS, payment system, or certification platform.

## HR: fortnightly monitoring, grading, development, recognition

### People and eligibility

HR uses stable member IDs with term, unit membership, join/leave dates, and active/excused status. Monitoring eligibility is captured per cycle, so later transfer/leave does not retroactively change an old denominator. Account login identity, organizational membership, and assessment record remain distinct.

### Weekly meeting participant list and absence notes

1. Meeting owner creates each actual weekly meeting occurrence with date/time, owning unit, organizer, agenda, and expected participants. HR can record attendance without becoming organizer of every division meeting.
2. Expected participants are selected from the relevant active membership and explicit invitees. Capture the roster for that meeting; do not count every organization member as absent from every meeting. Guests are recorded separately from assessed members.
3. Member/authorized HR officer records an absence notice linked to that occurrence, with reason category, optional restricted note, and submitted time. Notice, acknowledgment, and an authorized excused-absence decision are distinct states.
4. Assigned attendance officer marks actual presence during/after the meeting. Proposed states: not yet recorded, present, late, absent with approved excuse, absent without approved excuse, and not required. Late thresholds and approval authority require adoption before automatic classification.
5. Member self-check-in, if adopted, is a pending claim until reconciled by the attendance officer. Do not add QR, GPS, biometrics, or a mandatory integration without a demonstrated need.
6. Officer reconciles attendance against expected roster and recorded absence notices, explains exceptions, and finalizes the register. Missing attendance recording stays unknown; it is not silently converted to unexcused absence.
7. Meeting notes record decisions, issues, and follow-up tasks with owners/dates. The meeting's attendance register and minutes are linked records but have separate access: shared minutes do not disclose restricted absence explanations.
8. Member can request correction. An authorized correction preserves prior status, reason, actor, and date. Changing an already consumed attendance record flags linked finalized assessments for explicit review rather than silently rewriting grades.
9. Each fortnightly cycle references the finalized meeting occurrences within its reporting window, using one explicit meeting-date/time attribution rule. Expected, attended, late, excused, and unknown counts remain distinguishable. Any numerical attendance contribution requires the adopted rubric and excused/nonrequired denominator policy.
10. HR views scheduled registers, registers awaiting finalization, unresolved absence notices, corrections, and permitted attendance history. Meeting organizers receive operational attendance summaries, not automatic access to sensitive reasons or all HR assessments.

Weekly attendance, fortnightly evaluation, and monthly recognition have independent occurrence IDs and schedules. Do not make a single generic progress percentage cover all three.

### Fortnightly monitoring and grading

Cadence is confirmed: one cycle every two weeks. Recommended definition: consecutive 14-day windows anchored to a chosen organization date/timezone; exact opening/deadline dates require a policy decision. Do not implement twice-monthly windows as if they were always 14 days.

1. HR configures a routine definition with cycle anchor, reporting window, submission cutoff, rubric version, responsible HR owner, eligible units, reminder policy, and assigned reviewers. Proposed rubric changes apply to future unopened cycles only.
2. Generate one occurrence per scheduled period with immutable identity and start/end dates. Retry generates no duplicate cycle. HR previews eligible members, exemptions, new joiners, transfers, and missing reviewer assignments before opening.
3. Open cycle. Each eligible member receives a My Work item and sees period, deadline, expected submission, rubric, and relevant permitted evidence. Reviewer receives their own scoped review assignment.
4. Member submits achievements, work references, blockers, support needed, and next-period commitments. Link canonical tasks/content/engagement/session IDs where useful; allow a short contribution narrative for work absent from the app.
5. Show only actual recorded attendance, assignment, and completion evidence. Imported/provider evidence names source and date; do not infer effort, quality, or performance from task counts or missing data.
6. Division/unit reviewer verifies evidence, requests clarification, and drafts criterion scores with reason and source references. Missing report or missing evidence is pending/incomplete, not an automatic numerical zero.
7. HR checks consistency: missing criteria, eligible population, role-appropriate evaluation, leave exceptions, contradictory evidence, repeated unsupported scoring, and reviewer conflicts. HR corrections record reason and preserve the original draft/review lineage.
8. A designated alternate reviews the evaluator's own assessment and conflicts. A reviewer cannot approve their own grade by holding two roles.
9. Authorized assessor finalizes grades under the adopted rubric. Preserve per-criterion raw values, weights, calculated result, rubric version, reviewer, and any override reason. A displayed number must be reproducible.
10. Member receives their own result and feedback, can acknowledge or request correction, and sees the adopted response deadline. Acknowledgment is not forced agreement. Pending appeals remain identifiable.
11. Accepted correction creates a revised assessment linked to its predecessor. Never replace finalized feedback without history or silently alter a previous monthly award calculation.
12. Reviewer and member agree development actions: task, check-in, TnD referral, workload discussion, or resource need. Each names an owner and next date; an observed low score does not automatically trigger a punitive decision.
13. HR closes the cycle with counts for eligible, submitted, reviewed, incomplete, exempt, and pending correction. Distinguish reporting coverage from average score. Keep outstanding reviews/actions discoverable after close.

### Proposed grading design, awaiting adoption

Use a published criterion rubric rather than completed-task counts. Candidate criteria: quality against agreed expectations, delivery against agreed commitments, collaboration/communication, and development/contribution. Each needs role-appropriate anchors and acceptable evidence. A 0–4 criterion scale is a proposal; weights must be agreed by leadership/HR and shared with members before grading begins.

If adopted, compute a normalized result as sum((score / criterion maximum) * criterion weight) where weights sum to 100. Incomplete required criteria produce incomplete, not a misleading complete score. For example only: scores 3,4,3,2 with maximum 4 and four equal 25-point weights give 75/100. This is arithmetic illustration, not DWDG's approved rubric.

### Member of the Month

This is a required monthly recognition process with its own decision record. It is not the automatic maximum of task counts or a public performance leaderboard.

1. Open a monthly recognition round with scope, eligibility rules, relevant monitoring cycles, nominations, decision panel, rubric/policy version, and decision/publication dates.
2. Recommended first-release attribution: use finalized monitoring cycles whose period ends in the award month, with equal per-cycle weighting; show coverage dates prominently. This avoids counting the same cycle twice. A calendar-month allocation method is an alternative needing separate agreement; do not quietly split a 14-day assessment into fabricated daily scores.
3. HR previews eligible members, missing grades, excused/new members, resolved corrections, and evidence coverage. An incomplete review queue blocks an allegedly complete automatic shortlist until HR resolves it or records an approved exception.
4. Add permitted nominations with contribution description and evidence, if nominations are adopted. Nomination is not automatically a grade increment.
5. Produce a shortlist from the adopted policy. Present scores, rubric versions, relevant evidence, exceptions, and rationale to the authorized panel. Keep sensitive support/health/disciplinary information out of the recognition record.
6. Panel records decision, reason, reviewers, recusals, and any tie-break/override. The policy may allow joint recognition or no award; the system must not invent a random winner.
7. Confirm publishable name, photo, and contribution summary under the adopted member preference policy. Publish only the approved recognition content, not grade breakdowns/private notes.
8. MarCom receives a scoped publication request and approved copy/assets. MarCom can return missing material, schedule, and record actual publication without opening HR assessments.
9. Record actual announcement date/link. Later assessment correction flags the affected award for review; it never silently changes a published winner or deletes the decision history.

### HR views by account

- Member: own report due, own submitted history, own finalized feedback/correction status, own development actions; no colleagues' grades.
- Unit/division reviewer: assigned members and review queue, evidence permitted for that review, unresolved clarifications; no automatic organization-wide raw HR access.
- HR operator: current cycle, coverage grid, review status, policy versions, exception/correction queue, recognition round, and development follow-ups.
- Leadership: permission-approved aggregate coverage and decisions, plus specifically authorized cases; all-workspace navigation does not itself authorize all private assessment details.

Recommended HR primary sections: People, Monitoring & Development, Programs, Recognition. Historical cycle, criterion breakdown, and correction history belong inside record detail instead of separate permanent navigation items.

## Remaining division processes must have equivalent depth

### External Engagement, including Client and Partnership functions

Preserve the discussed Client/Partnership distinction as configurable units/functions and the future hierarchy draft. Shared partner identity prevents duplicate organizations; separately scoped opportunities preserve distinct commercial/partnership intentions.

1. Search/create organization and contact with provenance, relationship kind, owner, and authorized audience.
2. Create opportunity with need/value hypothesis, stage, PIC, backup, target next action, and permitted source materials.
3. Assign outreach and record actual attempts/responses, not inferred interaction from a stage selection.
4. Schedule next follow-up task and escalation owner; leaving a date in an external Sheet creates no app reminder unless imported/synchronized through an adopted integration.
5. Capture meeting notes, qualification, constraints, commitments, and decision owner. Waiting for external response differs from internally blocked work.
6. Request proposal preparation, Consulting feasibility, or Legal review using linked requests with receiving owner and explicit access.
7. Track proposal/revisions/negotiation and exact approved versions. Opportunity advancement does not prove signed agreement.
8. Record won/lost/withdrawn with reason and evidence. Successful handoff creates/links the relevant engagement or partnership activity with acknowledgment; no duplicate client record.
9. Maintain commitments, renewal/follow-up dates, and owner changes after win. Close an opportunity without deleting the long-lived relationship.

### Legal & Finance: linked but separate authority

1. Requester submits type-specific information, due date, purpose, amount/currency where relevant, and safe evidence.
2. Triager validates completeness and adopted SLA/calendar. Urgent exceptions name approving authority; holidays/calendar and start-of-SLA need explicit policy.
3. Legal drafts/reviews a specific version, handles revisions, assigns numbers under an agreed register, and tracks signature evidence. Draft numbers and officially issued numbers have distinct states.
4. Authorized signer and counterpart signature states are recorded separately; app approval is not an electronic signature implementation.
5. Legal handoff supplies permitted agreement/BAST/gate evidence to Finance with named receiving owner. Returned missing information retains lineage.
6. Finance checks budget category, available allocation/commitment, duplicate claim, evidence, and approver eligibility. Requester cannot approve their own claim.
7. Authorized approval reserves/records commitment under the adopted accounting rules; payment remains a separate action.
8. Finance records actual disbursement/receipt, date, amount, payment evidence, and remaining obligations. Corrections retain the original transaction lineage.
9. Reconcile and close monthly occurrence with balances, exceptions, outstanding commitments, and handover; export totals reconcile against actual records.

### MarCom & IT: production and support

1. Receive communication/design/publication/support request with purpose, audience, channel/system, desired date, requester, and evidence.
2. Coordinator triages scope, owner, dependencies, and realistic due date. Campaigns link to projects; routine publishing creates content records without one project per post.
3. Assign copy/design/documentation contributors and canonical tasks with source brief and deliverable version.
4. Route version-specific review and revisions; changed copy/assets invalidate or require review of the changed publication package under adopted rules.
5. Obtain approved publication copy/assets and permission to use them. HR recognition handoff excludes private grade records.
6. Schedule publication. Scheduled and published are distinct; actual posting is external/manual unless a later integration is adopted.
7. Record actual URL/time/evidence, handle corrections/takedowns with reason, and preserve prior version/history.
8. IT requests use impact/reproduction, assigned technician, change evidence, and requester verification. Request resolution is not proof of production deployment or security validation.
9. Track service/account custodians through safe metadata; never make the resource search a plaintext password vault.

### Strategy & Growth: research, decision, follow-through

1. Record observation/opportunity with question, source/date, owner, and organizational context.
2. Link research, interview/survey findings, and explicitly separate evidence from interpretation.
3. Prepare options with cost, expected benefit, uncertainty, risks, and affected divisions.
4. Request feasibility input and commitments from named receiving owners, without granting hidden access to their private records.
5. Record decision authority, selected option, rationale, exclusions, and pending conditions.
6. Approve and link/create bounded delivery project or program; do not fabricate actual start or outcome from approval.
7. Track milestones, blocker/decision dependencies, and agreed follow-up dates. One canonical task can appear in personal, division, and portfolio views.
8. Review actual observed outcomes against dated source/baseline or explicitly mark inconclusive. Avoid invented health/productivity scores.
9. Preserve decision and research history; hand unresolved work to successor with acknowledgment and permissions.

## Domain records and relationships to add to the PRD deliberately

1. OrganizationalUnit and effective-dated UnitMembership, separate from WorkItem/Project membership.
2. RoutineDefinition and RoutineOccurrence; repeated scheduling is not repeated editing of one task.
3. MeetingOccurrence, ExpectedParticipantSnapshot, AttendanceRevision, AbsenceNotice/ExcuseDecision, MeetingMinutes, plus MonitoringCycle, EligibilitySnapshot, MemberSubmission, AssessmentCriterion/RubricVersion, AssessmentRevision, CorrectionRequest, DevelopmentAction.
4. RecognitionRound, Nomination (if adopted), RecognitionDecision, and scoped PublicationRequest.
5. Program, Cohort/Cycle, Session, Enrollment, Attendance, AssignmentSubmission, and ParticipantOutcome.
6. KnowledgeItem, KnowledgeRevision, ReviewDecision, and historical version references.
7. Engagement, ScopeRevision, StaffingRequest/Assignment, DeliverableRevision, ReviewDecision, and DeliveryEvidence, reusing project/task/resources where appropriate.
8. PartnerOrganization, Contact, Opportunity, Interaction, and linked canonical FollowUpTask.
9. LegalRequest/DocumentRevision/RegisterEntry, FinanceRequest/Commitment/Transaction, ContentItem/PublicationEvidence, SupportRequest, and StrategyDecision with explicit domain contracts.

These are conceptual relationships, not a decree to create one physical database table for every bullet. Physical schema choices follow agreed workflows, validation, permissions, and cost constraints.

## Proposed acceptance checks for this model

1. Six consecutive fortnightly occurrences have six distinct IDs and nonoverlapping 14-day reporting windows; scheduling retry creates zero duplicates.
2. One member transfer after a finalized cycle changes zero historical unit/eligibility/reviewer fields in that cycle.
3. A missing submission or required criterion produces an incomplete state, with zero fabricated grades.
4. For every finalized numeric assessment, stored criterion values/rubric reproduce the displayed result to the defined rounding precision.
5. One accepted correction adds one linked assessment revision and preserves the previous value/author/date.
6. A reviewer assigned multiple organizational roles can finalize zero self-assessments without the designated alternate's decision.
7. A recognition round documents included cycle IDs, eligibility, exceptions, panel, and rationale; zero random tie winners or task-count-only awards.
8. MarCom's award-publication access exposes zero raw HR scores, support notes, or correction content.
9. Reusing one Knowledge version in a completed cohort or reviewed deliverable remains linked to that exact version after the article is updated.
10. One training cohort with ten enrolled members records ten independent participation/outcome records; invite, attend, submit, and pass remain distinct.
11. One deliverable revision request preserves its prior version and review; publishing/sending a later unreviewed version cannot inherit an earlier approval silently.
12. Linking one partner across two opportunities creates one partner identity and two opportunity IDs.
13. A finalized approval creates zero automatic payment, signature, publication, or client-acceptance facts without the corresponding evidence action.
14. My Work, division tables, and detail panels resolve the same task ID; updating one task creates zero duplicate operational records.
15. Workspace Changes exposes permitted events for the selected workspace only. Private HR event details require narrower permissions; local PRD editor history remains a separate system.
16. A meeting expecting twelve members and two guests has twelve assessed-member attendance records and two guest entries; zero uninvolved members are marked absent.
17. A meeting with three unrecorded attendance entries preserves three unknown states and creates zero automatic unexcused-absence grades.
18. An absence notice and excused decision retain independent actor/time/state; submitting a note grants zero automatic exemption.
19. Finalizing a fortnightly assessment references the exact meeting/attendance revisions used; a later attendance correction triggers review and changes zero finalized scores silently.
20. Shared minutes and workspace Changes expose zero restricted absence explanations to actors lacking the corresponding HR permission.

## Policies still to decide

- Complete current/future organization chart, exact Project Associates mapping, full TnD label, unit leads, and effective activation dates.
- HR cycle anchor, reporting cutoff, reminder and correction windows, reviewers, grading criteria/weights, exemptions, and visibility.
- Meeting organizer versus HR attendance roles, required participants, late threshold, absence approval, restricted notes, attendance finalization/correction, and any grading effect.
- Member of the Month eligibility, monthly cycle attribution, nomination method, panel, tie-break, appeals, and publishable member preferences.
- TnD completion rules, assessment visibility, and what staffing can see.
- Knowledge reviewer, permitted reuse, confidentiality sanitization, and review expiry.
- Division-specific stage/approval authority, SLA calendar, and handoff expectations.
- Authoritative data per collection, external spreadsheet boundaries, import/sync behavior, and notification channels within Rp35,000 target / Rp50,000 maximum.
