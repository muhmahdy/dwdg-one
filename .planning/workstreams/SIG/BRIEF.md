# SIG · Updates, reminders, Changes and search

**Model:** Sonnet 5.5 · **effort:** high · **wave:** 1 · **reviewer:** Opus 5.5 (PM)

Turn domain events from every stream into the Updates inbox, in-app reminders, the per-workspace Changes history and permission-aware search. Read state and dedupe are yours; the events come from their owners.

## You own
- Entities: notification, activity/change event, search index

## Out of scope (owned by other streams)
- Producing domain events (owning streams emit them)
- Updates and Changes screens (UX2)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- ARC event envelope
- IAM permission API (recheck on delivery and search)
- Events from WRK, RES, SCH and division streams
- IAM · Identity, access and authority: W037 needs W024; W038 needs W024; W039 needs W024
- POL · Policy and operating decisions: W037 needs W002; W038 needs W006; W039 needs W006
- ARC · Architecture record and data foundation: W038 needs W022

**You provide** (others build on these, so publish them in `SIG/INTERFACE.md` before handing off):
- The event catalogue every stream emits into (publish it first)
- Search API
- to QA · Verification, pilot and launch: W038 unblocks W080; W039 unblocks W080; W038 unblocks W082; W039 unblocks W082
- to AGT · Browser agent tools (WebMCP): W039 unblocks W097
- to WRK · Work engine: tasks, offers, projects, milestones, blockers: W037 unblocks W104

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (section 8: audit and Changes)
- .planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md (section 13)

## First session: do this
1. Publish the event catalogue in INTERFACE.md: name, producer stream, recipients, dedupe key.
2. Build Changes (W038) on the ARC audit envelope, then Updates (W037), then search (W039).

## Done when
- W037–W039 acceptance passes; zero cross-workspace leaks in tests

## Scope at a glance
- Work packages: W037, W038, W039 (★ = D1 first-version slice)
- Stories: S003, S062, S063
- Requirements owned: 40; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the SIG session (Updates, reminders, Changes and search) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/SIG/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/SIG/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/SIG/HANDOFF.md (what earlier SIG sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "SIG Sonnet 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update SIG/INTERFACE.md with anything other streams can rely on, append a dated entry to SIG/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
