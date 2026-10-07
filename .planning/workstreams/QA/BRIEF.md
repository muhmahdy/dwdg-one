# QA · Verification, pilot and launch

**Model:** Sonnet 5.5 · **effort:** high · **wave:** 1 (fixtures), 2 · **reviewer:** Opus 5.5 (PM), product owner

Independently check (a different model from the Sol 6.1 builders; Opus reviews QA itself) what the builders claim. Build synthetic role and policy fixtures, run the end-to-end journeys for accounts and all six divisions, cross-division consent and history, performance and visual gates, security, restore, then the pilot and launch decision. You never fix product code; you report with evidence.

## You own
- Fixtures, test journeys, evidence reports in QA/out/
- Pilot plan and go/no-go record

## Out of scope (owned by other streams)
- Fixing defects (the owning stream does)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- Every stream's INTERFACE.md and acceptance criteria
- OPS environments, DAT restore
- POL · Policy and operating decisions: W078 needs W004; W079 needs W002; W079 needs W005
- ARC · Architecture record and data foundation: W078 needs W022; W082 needs W043
- OPS · Cost, environments, release and operations: W078 needs W069; W081 needs W073; W083 needs W075; W086 needs W067; W086 needs W068; W086 needs W077
- UX3 · Account, authority and division screens: W079 needs W019
- DHR · Human Resources workflows: W079 needs W044; W079 needs W047; W079 needs W048; W079 needs W049
- DEC · External Engagement and Consulting delivery chain: W079 needs W050; W079 needs W052; W079 needs W063; W079 needs W064; W079 needs W065; W080 needs W052
- DMS · MCIT and Strategy & Growth: W079 needs W053; W079 needs W054; W079 needs W060
- DFL · Finance and Legal: W079 needs W056; W079 needs W058
- WRK · Work engine: tasks, offers, projects, milestones, blockers: W080 needs W029
- SIG · Updates, reminders, Changes and search: W080 needs W038; W080 needs W039; W082 needs W038; W082 needs W039
- DAT · Export, import, backup and restore: W080 needs W040; W082 needs W040; W083 needs W072; W085 needs W041
- UX1 · Design system, shell and interaction foundations: W081 needs W021
- IAM · Identity, access and authority: W082 needs W024; W082 needs W025; W082 needs W026; W082 needs W027
- RES · Resources, notes and links: W082 needs W034

**You provide** (others build on these, so publish them in `QA/INTERFACE.md` before handing off):
- Evidence reports and defect lists (P0/P1/P2) to the PM, who routes them
- to OPS · Cost, environments, release and operations: W078 unblocks W074

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/VERIFICATION.md and PLANNER_VERIFICATION.md (evidence style)
- The Proposed acceptance sections of WORK_MODEL_DISCUSSION.md, DATA_OWNERSHIP_AUTHORITY.md, ORGANIZATION_DIVISION_BLUEPRINT.md (section 14) and TASK_CONTROLS_AVAILABILITY.md

## First session: do this
1. Build W078 fixtures as soon as IAM publishes its interface.
2. Write each journey as a script that cites the requirement IDs it proves.

## Done when
- W078–W087 acceptance passes; zero open P0/P1 defects in promised scope

## Scope at a glance
- Work packages: W078★, W079, W080, W081, W082, W083, W084★, W085, W086, W087 (★ = D1 first-version slice)
- Stories: none
- Requirements owned: 30; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the QA session (Verification, pilot and launch) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/QA/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/QA/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/QA/HANDOFF.md (what earlier QA sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "QA Sonnet 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update QA/INTERFACE.md with anything other streams can rely on, append a dated entry to QA/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
