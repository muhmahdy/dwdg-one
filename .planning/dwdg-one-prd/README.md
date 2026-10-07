# DWDG’ONE — PRD-first restart

Planning workspace 0.3 · 5 October 2026 · Universitas Islam Indonesia. Historical v0.2 drafts remain preserved below.

## Current planning workspace — 5 October 2026

Run `npm.cmd run prd` from the project root and open `http://127.0.0.1:5174/`. This is the current editable planning app: Horizontal tree, Requirements, Work breakdown structure, Kanban, User story map, Changes, and AI handoff. It extends the preserved requirement editor rather than changing the DWDG product.

Read [AI_EDITING.md](AI_EDITING.md) for startup, data contracts, Claude/Antigravity/Codex editing, validated CLI updates, conflicts, imports, and backups. The authoritative saved source is [state/planning-workspace.json](state/planning-workspace.json); [state/PLANNING_WORKSPACE.md](state/PLANNING_WORKSPACE.md) is its generated complete readable rendition. The saved source contains all views, their relationships, and history. Changes save to the project file, rather than requiring browser storage or a manually downloaded file for each edit.

`planner-seed.json` is a reconciled starting draft: it carries the earlier complete requirements hierarchy plus later organization/authority/task/calendar corrections, deliverable-oriented work packages, work cards, and user stories. See [PLANNER_CONTENT_REVIEW.md](PLANNER_CONTENT_REVIEW.md) for sources and reconciliation. All initial work cards are Backlog; no actual product implementation is newly asserted. Seed status is still a working planning draft, not an approved launch baseline.

The state file is initialized only if missing. Starting or rebuilding the tool never reseeds an existing state file. Previous inline editors and their browser/chat revisions remain preserved; import their exported JSON deliberately if they contain unseen edits. The historical v0.2 files below remain references and portable prior baselines. They do not override the newer saved workspace. See [PLANNER_VERIFICATION.md](PLANNER_VERIFICATION.md) for actual checks and limits.

## Consolidated reference library — 5 October 2026

Open [the reference gallery](../../PROJECT_REFERENCES/index.html) to browse the available user-shared images, scheduling video, and YouTube links in one place. Read [the library guide](../../PROJECT_REFERENCES/README.md) and [source manifest](../../PROJECT_REFERENCES/manifest.json) for provenance, historical/diagnostic labels, supporting documents, and recovery limits. Originals and existing reference packs remain preserved; library snapshots do not supersede the latest planning decisions.

## Latest authority, dual functions, and data ownership — 5 October 2026

Latest task/calendar clarification: CD abbreviates Co-Director; members can add/edit/delete their own tasks; every member can record unavailable dates/times with notes. Read `TASK_CONTROLS_AVAILABILITY.md` for these confirmed requirements and the inspected WhatsApp video scheduling interaction. Shared-task deletion, note visibility, and meeting-conflict policy are explicitly proposed/open. Personal task CRUD does not grant project creation.

The user's supplied hierarchy image confirms Director/Co-Director roles for EE, MarCom & IT, HR, FnL, SnG, and CD of Project Associates/Knowledge/TnD beneath Consulting Director. Only CD/Co-Director and higher may create projects; member task offers/consent and consultant participation remain separate. See the updated ideal tree in `ORGANIZATION_DIVISION_BLUEPRINT.md` and project-creation contract in `DATA_OWNERSHIP_AUTHORITY.md`.

Read `DATA_OWNERSHIP_AUTHORITY.md` for the user's latest rules: all ordinary members are consultants as well as division members; anyone can offer cross-division tasks with recipient consent; Mahdy has highest Admin authority alongside SnG leadership; hidden IT admin is excluded from search; President controls normal presidency handover while Admin can appoint in emergency recovery; HR moves members; leadership appointment/ban rules and Co-Director title are captured. This document supersedes conflicting older access/assignment assumptions. Data custody and implementation details are marked as proposals, with equal-rank discipline, exact Co-Director appointment/discipline scope, and hidden IT Admin powers still open.

The division blueprint remains authoritative for current/ideal organization structure. Its earlier statement that administrative navigation does not grant business authority must now be read with the user's explicit highest-Admin authority and the President-only normal-transfer / Admin emergency-recovery distinction. None of these discussion documents has been silently merged into unseen browser revisions or implemented as live enforcement.

## Latest organization and division direction — 4 October 2026

Read `ORGANIZATION_DIVISION_BLUEPRINT.md` before relying on v0.2's organization or division assumptions. It records the user's corrected current/ideal hierarchy and replaces the earlier incomplete division summaries with roles, account scopes, workflows, handoffs, screens, data boundaries, and proposed acceptance scenarios. `WORK_MODEL_DISCUSSION.md` retains detailed HR/Consulting discussion but defers to this blueprint for the hierarchy.

The existing v0.2 editor/JSON/Markdown remain an earlier working draft; these discussion revisions have not been merged into its nodes or unseen browser edits. In particular, v0.2's direct VP Consulting → Project Delivery/Knowledge/Training tree, separate Legal/Finance future units, prohibition on all HR grades, and “Expert Network two batches later / parent undecided” claims are superseded. Do not treat them as current approved constraints. Reconcile the selected exported browser revision deliberately when integrating the new direction.

The current request is to restart product planning and agree a detailed PRD before further product implementation. This planning artifact does not launch the app or overwrite existing code, local records, reference assets, or prior QA. The older Experience v1.1 remains useful reference/history; it is not the production launch specification for this restart. This draft becomes a baseline only after its important decisions have been discussed.

## Historical v0.2 planning draft

- `dwdg-one-prd.html` is the preserved historical editable conversation fragment, with a continuous All nodes view, outline, rightward map, Changes history, and full requirement editor. Use the file-backed planning workspace above for current work.
- `DWDG_ONE_PRD.md` is the complete readable seeded draft.
- `DWDG_ONE_PRD.json` is its portable editable hierarchy. Browser edits do not automatically rewrite these seed files.
- `coverage.json` gives generated node counts, statuses, source inputs, and hash. These are document statistics, not implementation progress.
- `VERIFICATION.md` records checks actually performed on the planning tool. Product launch checks remain requirements, not passed evidence.

Each node carries a stable ID, parent, title, behavior/limits, decision status, priority, owner, source/assumption, acceptance criteria, and dependencies. There is no arbitrary document node-count limit. All nodes is the default continuous hierarchy with complete titles, paths, expandable details and an edit/open route. Group jump controls navigate the long list. The map offers Focused branch or All nodes; the latter draws every node and connector with pan/zoom, without Next branches. Outline search does not filter the continuous All nodes view.

## Six planning groups

1. Product, organization and division requirements.
2. UI/UX, user flows and frontend experience.
3. Backend, data, security and change history.
4. Hosting, cost, environments, releases and recovery.
5. Implementation sequence, acceptance and launch.
6. Decisions, sources and PRD maintenance.

The UI/UX group includes account lifecycle and six-division journeys. Steps describe actor, screen/action, guard, saved output, failure/return and handoff. Specialist Legal/Finance and MarCom/IT tracks have separate guards; optional recruitment/receivables/capacity variants remain conditional. HR and Strategy & Growth SOPs need direct validation.

The measured design subtree specifies CSS-pixel padding, gaps, typography, rows, controls, overlays, breakpoints, touch targets, contrast, zoom and motion. Values inherited from Experience v1.1 are proposed restart targets, not proof that the current app meets them. Numbered acceptance criteria distinguish proposed counts/timings from verified provider constraints and actual QA.

Dependencies are direct prerequisite IDs, rather than every related feature. Build validation rejects missing IDs, self-dependencies and directed cycles. Structural groups and confirmed source facts can correctly have no prerequisites. Optional/deferred capabilities do not silently become mandatory launch gates. `CONSULTATION_REVIEW.md` records the software/process review, primary sources, repairs and unresolved policy decisions; SAP guidance informs process rigor, not a licensed SAP implementation.

## Confirmed starting decisions

- Name: DWDG’ONE — Universitas Islam Indonesia.
- Intended real launch; PRD first and planning only during this request.
- Budget target Rp35,000/month and hard ceiling Rp50,000/month; approximately 40 or more members.
- No existing organization domain or shared Drive account.
- Mahdy is SnG head plus highest Admin; President has all workspaces; each VP has reporting divisions; ordinary members retain division context plus consultant function and consented cross-division work. See `DATA_OWNERSHIP_AUTHORITY.md` for appointments, isolation, concealed IT account, and presidency recovery rules.
- Current structure: President → one VP → six divisions. Ideal structure: President → VP External (EE with Partner/Client, MarCom & IT), VP Internal (HR, FnL as one division, SnG), VP Consulting (Consulting with Project Associates/Knowledge/TnD, plus sibling Expertise Network planned for 2027). Ideal activation date remains open; current operational configuration is preserved.
- HR records weekly meeting participants/absence notes, runs one monitoring-and-grading cycle every two weeks, and manages Member of the Month. Detailed rubric, reviewers, cutoffs, exceptions, and recognition policy remain proposed/open.
- One Workspace concept; project main tabs are Overview, Work, Resources.
- Resources combines notes/folders/files/app links, with responsible people/avatar bubbles and contextual task/delegation actions.
- Workspace-scoped Changes history is required for additions, edits, deletions and related mutations.

Exact action permissions, specialist SOPs, account identities/custodians, file ownership, backup mechanism, retention, notification channels, and launch date still need decisions. No accounts/services were provisioned, payments made, external messages sent, or production data migrated for this draft.

## Saving and portable revisions

The editor reports the saving mechanism actually available. Full browser storage is separate from the existing app's stores. The embedded conversation may restrict browser storage; a compact host-state fallback has a size limit and cannot be assumed to preserve unlimited edits/history. Keep a Portable JSON export before changing devices, closing a session with export-required status, or asking another session to continue. Export PRD provides a readable Markdown copy. Import validates a revision and asks for concrete replacement confirmation; Undo records a reversal without erasing Changes history.

Draft 0.1 is preserved in `revisions/0.1/` and its original conversation source remains separate. Draft 0.2 uses a new conversation source path so the earlier surface can still export edits against its original baseline. No exported user revision was available for this update; 0.2 expands the authored seed, not unseen browser edits. Import the chosen portable revision deliberately. Cross-version saved state must not silently overwrite the new seed or discard the old state.

The planning Changes page logs this draft's local editor operations. It does not authenticate other organization members or replace the production server audit requirements. Imported history is identified as external/unverified. Download/clipboard restrictions have selectable-text fallback.

## Source and evidence boundaries

The two referenced Codex chats and Critique App Development were retrieved with `read_thread` in this session. The ChatGPT handoff message is bounded at 20,000 characters; its stored source extract is incomplete at that boundary. Complete available user turns and subsequent resource/tab discussions were also read. Assistant brainstorming is context, not automatically a confirmed decision.

The original survey workbook was read without modification. A fresh read on 3 October 2026 found the same eight-response source hash recorded in the prior pack. HR and Strategy & Growth are absent from that survey; their detailed workflows remain hypotheses pending direct review. Individual names/email responses are not copied into this PRD.

Current vendor pricing/quotas and limitations are recorded with official source URLs and a verification date in `OPERATIONS_RESEARCH.md` and requirement source fields. Workload, IDR conversion, retention, recovery and cost forecasts are planning assumptions unless explicitly marked otherwise. University domain/Drive entitlements have not been verified. The budget-limited stack’s suitability still depends on configured and rehearsed recovery/ownership, not a zero-dollar price label.

## Maintain the seed

Section JSON files are authoring inputs. `build-prd.mjs` combines them, rejects invalid statuses/parents/hierarchy or dependency cycles/duplicate IDs, validates presentation size, writes the portable/readable seed and conversation fragment, and updates coverage. Do not run it over a user browser revision without first exporting/importing that revision as the chosen source; otherwise it rebuilds from authoring inputs, not browser edits.

Existing product files and the three local stores remain independent. Future implementation should read the user's latest exported PRD revision, decision queue and evidence, then resolve critical open decisions before treating proposed behavior as an approved commitment.
