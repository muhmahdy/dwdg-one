# IAM · Identity, access and authority

**Model:** Sol 6.1 · **effort:** high · **wave:** 1 · **reviewer:** Opus 5.5 security review, then PM

Build invite-only Google sign-in, the first-Admin bootstrap, and server-side permissions that every other stream calls: workspace scope, rank-protected actions, appointments, presidency transfer, HR transfer and isolation, with denial tests.

## You own
- Entities: person, account link, membership, invitation, role grant, reporting assignment, workspace/unit/term configuration
- The permission check API used by all streams

## Out of scope (owned by other streams)
- Account screens (UX3)
- Policy content (POL)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- POL authority matrix (W004)
- ARC entity dictionary and command contract
- ARC · Architecture record and data foundation: W023 needs W022; W024 needs W022
- POL · Policy and operating decisions: W023 needs W004; W024 needs W004; W024 needs W006

**You provide** (others build on these, so publish them in `IAM/INTERFACE.md` before handing off):
- `can(actor, action, record)` contract and scoped query helpers (to every build stream)
- Fixture accounts for QA
- to UX3 · Account, authority and division screens: W023 unblocks W014; W026 unblocks W014; W027 unblocks W014
- to WRK · Work engine: tasks, offers, projects, milestones, blockers: W024 unblocks W028; W024 unblocks W029; W024 unblocks W031
- to RES · Resources, notes and links: W024 unblocks W033
- to SCH · Schedule, meetings and Google Calendar sync: W024 unblocks W035; W024 unblocks W036; W023 unblocks W102
- to SIG · Updates, reminders, Changes and search: W024 unblocks W037; W024 unblocks W038; W024 unblocks W039
- to DAT · Export, import, backup and restore: W024 unblocks W040
- to DHR · Human Resources workflows: W027 unblocks W045; W023 unblocks W049; W027 unblocks W049; W024 unblocks W098
- to DEC · External Engagement and Consulting delivery chain: W024 unblocks W050; W024 unblocks W051
- to DFL · Finance and Legal: W024 unblocks W055; W024 unblocks W057
- to QA · Verification, pilot and launch: W024 unblocks W082; W025 unblocks W082; W026 unblocks W082; W027 unblocks W082
- to AGT · Browser agent tools (WebMCP): W024 unblocks W097

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (sections 1–6, 9)
- .planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md (sections 1–2)

## First session: do this
1. Read the authority matrix and ARC contract; publish the permission API signature in INTERFACE.md before writing code.
2. Write denial tests first (direct API, search, counts, export).

## Done when
- W023–W027 acceptance passes with recorded test output; Opus security review signed off

## Scope at a glance
- Work packages: W023★, W024★, W025, W026, W027, W101★ (★ = D1 first-version slice)
- Stories: S001, S002, S004, S005, S006, S007, S008, S081
- Requirements owned: 59; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the IAM session (Identity, access and authority) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/IAM/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/IAM/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/IAM/HANDOFF.md (what earlier IAM sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "IAM Sol 6.1"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update IAM/INTERFACE.md with anything other streams can rely on, append a dated entry to IAM/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
