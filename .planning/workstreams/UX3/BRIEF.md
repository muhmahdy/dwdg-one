# UX3 · Account, authority and division screens

**Model:** Opus 5.5 · **effort:** high · **wave:** 1 · **reviewer:** Product owner

Design the account lifecycle screens (invite, accept, profile, appointments, transfer, isolation, presidency handover) and one working screen per division capability, using the shared shell and the division spec packs. Same rules as UX2. Also the team performance views (D30) and the Board of Supervisors read-only experience (D29).

## You own
- Prototype screens for accounts and the six division capabilities
- UX3/out/ build specs

## Out of scope (owned by other streams)
- Division workflow rules (DHR, DEC, DFL, DMS spec packs)
- Authorization logic (IAM)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- UX1 components and UX2 patterns
- Spec packs from DHR, DEC, DFL, DMS (states, fields, permissions, fixtures)
- POL authority matrix
- UX1 · Design system, shell and interaction foundations: W014 needs W012; W019 needs W012
- IAM · Identity, access and authority: W014 needs W023; W014 needs W026; W014 needs W027
- POL · Policy and operating decisions: W019 needs W002

**You provide** (others build on these, so publish them in `UX3/INTERFACE.md` before handing off):
- Approved division and account screen specs (to IAM and division build streams)
- to UX1 · Design system, shell and interaction foundations: W014 unblocks W021; W019 unblocks W021
- to QA · Verification, pilot and launch: W019 unblocks W079

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md (sections 2, 4–11)
- .planning/dwdg-one-prd/WORK_MODEL_DISCUSSION.md (division interfaces, HR views by account)
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (sections 3–6: offers, appointments, transfer, isolation)
- .planning/ux/DIVISION_PATTERNS.md
- .planning/dwdg-one-prd/UI_UX_IMPLEMENTATION_MAP.md (division layouts, account journeys)

## First session: do this
1. Start with the team performance views (analytics_team_performance, S078): one screen per scope (Co-Director branch, Director division, VP portfolio, HR and President everyone, member self), every figure opening its records, Unknown for missing data, no leaderboard. You may start this now in the prototype, using UX1 components and UX2 patterns, because the owner asked for it.
2. Then the Board of Supervisors read-only experience (access_board_scope, S081).
3. Then the account screens (W014), then one division at a time as each spec pack arrives.

## Done when
- Each division and the account lifecycle have an approved prototype and spec

## Scope at a glance
- Work packages: W014, W019 (★ = D1 first-version slice)
- Stories: none
- Requirements owned: 2; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the UX3 session (Account, authority and division screens) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/UX3/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/UX3/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/UX3/HANDOFF.md (what earlier UX3 sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "UX3 Opus 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update UX3/INTERFACE.md with anything other streams can rely on, append a dated entry to UX3/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
