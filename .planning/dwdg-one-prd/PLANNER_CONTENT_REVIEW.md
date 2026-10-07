# DWDG’ONE planner content review

Authored 5 October 2026. Planning content only; no production features, services, accounts, security policies or recovery procedures are established by this seed.

## Artifact and evidence boundary

`planner-seed.json` is a new plain-JSON planning-workspace seed containing the reconciled PRD, deliverable WBS, Kanban work cards, activity backbone and user stories. It does not read or overwrite unseen browser edits. Choose the live workspace revision deliberately; the running planner's canonical saved state is separate from this reusable authoring seed.

The original `DWDG_ONE_PRD.json` remains unchanged. Its SHA-256 at review is `464d67020b630c5087f0139c645918d453a73667090ab35ad7d31fc39a057d6b`. Existing app files, three local product stores, reference assets and historical revisions were not changed by this content work.

Reviewed inputs:

- `README.md` and `DWDG_ONE_PRD.json` for the current draft, schema, old assumptions, IDs and evidence boundaries.
- `ORGANIZATION_DIVISION_BLUEPRINT.md` for the current/ideal chart, account contexts, all six divisions and Consulting branches.
- `DATA_OWNERSHIP_AUTHORITY.md` for dual functions, cross-person consent, Admin authority, concealed IT, appointments, isolation, President transfer/recovery and CD creation threshold.
- `TASK_CONTROLS_AVAILABILITY.md` for own-task CRUD and unavailable calendar, inspected scheduling reference and unresolved privacy/conflict/recurrence policies.
- `PROJECT_REFERENCES/README.md` for the latest solid-surface/no-glass direction. Images were not reinterpreted as product requirements by this content authoring.

No new vendor pricing research was performed here. Budget/architecture work packages require a dated official-provider refresh before choosing operating services. Existing PRD/provider research is planning context, not a guarantee that today's quotas will support production.

## Counts and traceability

| Content | Count | Meaning |
|---|---:|---|
| PRD requirements/groups | 772 | Original 748 stable IDs retained; 24 latest-decision/planner requirements added |
| Original PRD nodes reconciled | 36 | Superseding source information recorded rather than silently leaving contradictory assumptions |
| PRD prerequisite edges | 1,727 | Direct requirement prerequisites, deduplicated; structural parents are separate |
| WBS structural groups | 6 | Product/divisions, experience, backend, operations, delivery, planning control |
| WBS leaf work packages | 96 | Reviewable deliverables rather than 772 fake development tasks |
| Kanban cards | 96 | One canonical work card for each WBS leaf |
| WBS/card prerequisite edges | 235 each | Card dependencies mirror work-package prerequisites with independent stable card IDs |
| Story-map activities | 15 | A journey backbone spanning entry/context/planning/consent/execution/review, division operations and retention/operation |
| User stories | 76 | 73 v1 candidates and 3 later stories; all have actor/action/benefit and scenario criteria |
| Later work packages/cards | 3 | Expertise Network 2027, optional binary upload and external-calendar/advanced integration evaluation |

There is no arbitrary node or story limit. The counts describe document coverage, not product implementation progress or scope approval.

All 96 cards begin **Backlog** with empty implementation evidence. PRD **confirmed/proposed/open/deferred** records decision/source status and never implies a card is Done. Proposed owner strings identify accountable roles to assign; they are not appointments or named people. All `estimateHours` fields are `null`: reliable development estimates, start/due dates and resource allocation have not been established.

Every WBS leaf and every story has valid requirement references. Stories have exactly one activity and one primary package; a card's `storyIds` identifies stories assigned to its package. Some policy, infrastructure and shared foundation packages have no dedicated single-package story: their deliverables are traced to PRD requirements and support several journeys through prerequisites. This is preferable to inventing a fake end-user story for every technical task.

`v1` means a first-release candidate, not automatic adoption of every proposed feature. Policy/scope review can reduce candidate scope and change release slices deliberately. Later work packages are not prerequisites for any v1 package.

## Important reconciliation

The new PRD seed resolves these historical contradictions while retaining stable IDs:

1. Current operation is President → one VP → six divisions. The ideal three-VP chart stays separate until a dated activation decision.
2. Ideal VP External oversees EE with Partner/Client and MarCom & IT. VP Internal oversees HR, **FnL as one division**, and SnG. VP Consulting oversees Consulting Director → **CD of Project Associates, Knowledge and TnD**, plus sibling Expertise Network Director planned for **2027**.
3. CD means Co-Director. Only active CD-and-up with target-context permission creates projects through ordinary create, duplicate, template, API or import routes. PL/PM or consultant assignment alone does not meet that threshold.
4. Every ordinary member has division and consultant functions. A cross-division accepted task retains one person/task identity and bounded grants, without silently transferring division or opening its entire workspace.
5. Anyone may offer another ordinary member work. Recipient consent/version and proposer share authority are independently checked. Pending, declined and silent offers are not accepted assignments.
6. Members may create/edit/delete their own standalone tasks without project or CD approval. Accepted shared-task scope/delete/withdrawal powers remain explicit open decisions.
7. Mahdy's Admin authority is highest and independent from SnG leadership. President controls normal presidency handover; Admin can appoint a replacement through separately recorded emergency recovery.
8. Hidden IT account is absent from ordinary search. Broader concealment surfaces and exact IT powers/custody are separately specified as proposals/open policies, rather than assuming a role label creates highest Admin.
9. HR transfers members. Director-and-up isolation protects higher effective rank; equal-rank/cross-reporting scope and precise CD appointment/discipline powers remain open.
10. HR weekly meeting attendance/absence notes, one **14-day** monitoring-and-grading cycle, and Member of the Month are user-confirmed. Detailed rubric, thresholds, panel/ties, exceptions and appeal/privacy policies require adoption; missing evidence never silently becomes an invented zero.
11. Every ordinary member can record unavailable dates/times with notes. Blocks are not HR leave approvals or actual attendance. Private-note defaults, recurrence edits and invitation/conflict exceptions remain proposals/open choices. No recorded coverage is Unknown, never guaranteed Free.
12. Latest solid-surface direction replaces the old floating-menu/control glass and 22 px blur allowance. Measured design values remain reviewable proposed targets, not claims of rendered acceptance.

Thirty-six revised original nodes include their prior seed version and superseding source. Twenty-four additions retain normal parent/dependency structure. The PRD's `sourceReconciliation` metadata names revised/added IDs; it is local authoring provenance, not an editor mutation or authenticated server audit. `prd.changeHistory` uses the editor-compatible `dwdg-one-prd-history` envelope with an empty event list; future actual editor mutations populate it. Original historical state remains separately preserved.

## WBS coverage and sequencing

The six WBS areas contain 32 product/division packages, 12 experience packages, 24 backend/shared-engine packages, 11 operating packages, 10 verification/delivery packages and 7 planning-tool packages.

Work packages separate decisions, data/API behavior, UI behavior and verification. For example, shared-task policy must be decided before accepted-work edit/cancellation enforcement; consent API and role checks support My Work and cross-division execution; actual journey/security/restore evidence supports pilot before broad launch. The WBS is deliverable based and does not replace PRD requirements or a detailed developer design.

Concrete outputs include a versioned authority matrix, authoritative-source/custody map, adopted HR rubric, current/ideal hierarchy fixtures, responsive component states, own-task/offer/calendar APIs, safe resource registry, workspace Changes, scoped exports, independent backup and isolated restore, budget/custodian/runbook, representative pilot and launch decision.

The 235 package dependencies are immediate prerequisites for those outputs. They are not every related concept or person, nor statements of linear scheduling. WBS parent structure and user-story association are separate from blocking edges. Estimates remain unknown, and a card's priority does not justify advancing it past unmet adopted prerequisites.

## Story coverage

The map contains substantive account journeys for verified first Admin, invitation/acceptance, ordinary public-profile discovery, incumbent handover, emergency Admin recovery, appointments, HR transfer, rank-protected isolation, VP/President oversight and dual-function consultancy.

Shared work stories cover own-task CRUD/Undo, cross-division offers and decisions, changed commitments and withdrawal, CD project creation, canonical work views/dependencies, Resources/revisions/delegation/provider failure, unavailable blocks/recurrence, manual/keyboard meeting scheduling, invite conflict recheck, minutes, notifications, workspace Changes, export and isolated recovery.

Division stories cover HR weekly roster/absence/correction, 14-day cycle/report/reviewer assessment/own feedback/support and monthly recognition/MarCom handoff; EE Partner and Client pipelines with accepted receivers; MarCom brief/version review/actual publishing and IT ticket/custody recovery; FnL intake/numbering/signature gates, independent approval/partial payment and monthly reconciliation; SnG evidence/options/decision/inconclusive outcomes; Project Associates consented staffing/version-specific delivery/close, Knowledge review/reuse and TnD sessions/evidence/outcomes.

Planning-tool stories cover full horizontal hierarchy, editable WBS, saved Kanban, activity/release story editing and external AI/CLI file editing. Later stories preserve future Expertise Network, private upload and external-calendar integration without promoting them to launch prerequisites.

All stories include denial, incomplete evidence, stale version, privacy or failure/retry behavior where material. Numeric criteria use concrete fixtures such as one canonical ID, zero unauthorized disclosure, seven recurring instances, three consecutive 14-day periods, 100000 approved minus 40000 paid yielding 60000 outstanding, 44 × 44 px touch controls and 76 px project rows. UI measurements and policies are targets requiring actual review.

## Validation actually performed

The planner CLI command `check planner-seed.json` passes with **772 requirements, 102 WBS records, 96 cards and 76 stories**. Validation covers schema fields, allowed states, stable/unique IDs, hierarchy/reference integrity and directed dependency cycles. PRD dependency strings were normalized and duplicate tokens removed, including the historical repeated `entity_membership` prerequisite. The PRD history envelope was checked against the actual editor contract: source reconciliation metadata is separate from mutation events.

Independent count review confirms one card per leaf, 235 mirrored card/package prerequisite edges, zero seed Done claims, null estimates, three later cards/stories and no later package as a v1 prerequisite. The old seed's SHA-256 above confirms it remains a separately preserved input.

These content checks do not prove browser rendering, disk-save behavior, external-edit conflict recovery, live product authorization, multi-user operation, provider delivery, production security, backups or launch readiness. Planning-app rendering/save/CLI interoperability evidence belongs in the root integration verification. Production acceptance remains future work with actual evidence required.

## Open decisions deliberately left open

Shared-task deletion/material change/withdrawal; unavailable-note audience/recurrence/conflict acceptance; equal-rank/reporting-scope discipline; exact CD appointment and hidden IT powers; Admin-grant/last-Admin recovery; per-collection source/retention/custody; HR rubric/reviewer/recognition rules; specialist signatures/payment authority; reminder delivery channel; budget/provider/account funding; ideal-chart activation; named pilot and operating owners.

The work-board decision packages make these choices visible. They do not claim a policy is agreed merely because its proposed implementation has been written into a plan.
