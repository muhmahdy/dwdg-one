# ARC · Architecture record and data foundation

**Model:** Opus 5.5 · **effort:** max · **wave:** 0 · **reviewer:** PM, then owner

Write the architecture decision record (Iteration 2b) and the shared data contract every build stream follows: stack within the budget (Supabase Free, Cloudflare Pages, Google OAuth: D2, D3), entity dictionary with single ownership, command envelope (version, idempotency, audit event), folder layout for the real build, and the two-way Google Calendar sync design (D24, PRD W096 promoted).

## You own
- `.planning/architecture/` ADR and entity dictionary
- Shared command/version/idempotency/error contract
- Repository layout for the real build and its conventions
- Google Calendar sync design: OAuth scopes and app verification, token lifetime, event identity, conflict and deletion rules, privacy of imported titles, cost
- WebMCP tool contract rules: which commands may become tools, confirmation and audit rules (D25), with AGT

## Out of scope (owned by other streams)
- Implementing entities (each owning build stream)
- Environments and release pipeline (OPS)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- POL authority matrix and data-source map
- OPS budget verification (W067)
- UX2 screen specs (for API shape)
- POL · Policy and operating decisions: W022 needs W003; W022 needs W008

**You provide** (others build on these, so publish them in `ARC/INTERFACE.md` before handing off):
- Entity dictionary with the owning stream of each entity (to every build stream)
- Command and event envelope (to SIG for Updates and Changes)
- Calendar sync contract (to SCH)
- Code layout and test conventions (to all builders, QA)
- WebMCP tool contract rules (to AGT)
- to IAM · Identity, access and authority: W022 unblocks W023; W022 unblocks W024
- to WRK · Work engine: tasks, offers, projects, milestones, blockers: W022 unblocks W028; W022 unblocks W031; W022 unblocks W042
- to RES · Resources, notes and links: W022 unblocks W033
- to SCH · Schedule, meetings and Google Calendar sync: W022 unblocks W035
- to SIG · Updates, reminders, Changes and search: W022 unblocks W038
- to DAT · Export, import, backup and restore: W022 unblocks W040
- to DEC · External Engagement and Consulting delivery chain: W022 unblocks W050; W022 unblocks W051
- to DFL · Finance and Legal: W043 unblocks W056; W022 unblocks W057
- to OPS · Cost, environments, release and operations: W022 unblocks W075
- to QA · Verification, pilot and launch: W022 unblocks W078; W043 unblocks W082

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/OPERATIONS_RESEARCH.md
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (sections 7–8: stewardship matrix, audit)
- .planning/dwdg-one-prd/WORK_MODEL_DISCUSSION.md (Domain records and relationships)
- .planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md (sections 12–13: handoff contract, data ownership)
- .planning/dwdg-one-prd/CONSULTATION_REVIEW.md

## First session: do this
1. Draft the ADR skeleton and the entity ownership table using the PRD's entity_* nodes; publish the ownership table in INTERFACE.md first, because builders need it before anything else.
2. Write the Google Calendar sync design as its own section with the open risks the owner must accept.
3. Note that backend building starts only after the owner approves the prototype (D8).
4. Add a short WebMCP section: verify the current spec and browser support, and state which commands may be exposed as tools under the same permission checks.

## Done when
- Owner accepts the ADR
- Every entity has exactly one owning stream and a field list

## Scope at a glance
- Work packages: W022★, W043 (★ = D1 first-version slice)
- Stories: none
- Requirements owned: 48; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the ARC session (Architecture record and data foundation) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/ARC/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/ARC/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/ARC/HANDOFF.md (what earlier ARC sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "ARC Opus 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update ARC/INTERFACE.md with anything other streams can rely on, append a dated entry to ARC/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
