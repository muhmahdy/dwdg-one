# POL · Policy and operating decisions

**Model:** Sol 6.1 · **effort:** high · **wave:** 0 · **reviewer:** PM, then the product owner decides

Turn every open policy in scope into a short decision packet the owner can approve in minutes: the question, 2–3 options with consequences, a recommendation and the exact PRD nodes it unblocks. You draft; the owner decides; the PM records the decision. Never present a recommendation as adopted.

## You own
- Decision packets in `POL/out/` (authority matrix, task/availability consent rules, privacy and retention table, data-source map, work forms and handoff template, org current/ideal model, Consulting PL/PM rules, HR attendance/14-day/award rules)

## Out of scope (owned by other streams)
- Implementing any of it (IAM, WRK, SCH, division streams)
- Final decisions (owner)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- CONTEXT.md decisions and the confirmed PRD nodes
- Division source documents in `.planning/dwdg-one-prd/` (ORGANIZATION_DIVISION_BLUEPRINT.md, DATA_OWNERSHIP_AUTHORITY.md, TASK_CONTROLS_AVAILABILITY.md)
- PM · Programme management and PRD control: W002 needs W001; W003 needs W001

**You provide** (others build on these, so publish them in `POL/INTERFACE.md` before handing off):
- Adopted authority/action matrix (to IAM, every build stream)
- Task-offer and availability-privacy rules (to WRK, SCH, UX2)
- Field-audience and retention table (to DAT, SIG, division streams)
- Questions for division leads where only they can answer
- to UX1 · Design system, shell and interaction foundations: W004 unblocks W012
- to UX3 · Account, authority and division screens: W002 unblocks W019
- to ARC · Architecture record and data foundation: W003 unblocks W022; W008 unblocks W022
- to IAM · Identity, access and authority: W004 unblocks W023; W004 unblocks W024; W006 unblocks W024
- to WRK · Work engine: tasks, offers, projects, milestones, blockers: W005 unblocks W028; W005 unblocks W029; W005 unblocks W030; W009 unblocks W031; W006 unblocks W042; W002 unblocks W099
- to RES · Resources, notes and links: W008 unblocks W033; W006 unblocks W034
- to SCH · Schedule, meetings and Google Calendar sync: W005 unblocks W035
- to SIG · Updates, reminders, Changes and search: W002 unblocks W037; W006 unblocks W038; W006 unblocks W039
- to DAT · Export, import, backup and restore: W006 unblocks W040; W008 unblocks W040
- to DHR · Human Resources workflows: W007 unblocks W044; W007 unblocks W045; W006 unblocks W048
- to DEC · External Engagement and Consulting delivery chain: W002 unblocks W050; W002 unblocks W051; W009 unblocks W061; W006 unblocks W064; W002 unblocks W064; W002 unblocks W065; W003 unblocks W066
- to DMS · MCIT and Strategy & Growth: W002 unblocks W053; W002 unblocks W054; W006 unblocks W059
- to DFL · Finance and Legal: W002 unblocks W055; W002 unblocks W057
- to OPS · Cost, environments, release and operations: W008 unblocks W067; W006 unblocks W068; W006 unblocks W073
- to QA · Verification, pilot and launch: W004 unblocks W078; W002 unblocks W079; W005 unblocks W079

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (all; its open-decision list is your backlog)
- .planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md
- .planning/dwdg-one-prd/WORK_MODEL_DISCUSSION.md (Policies still to decide)
- .planning/dwdg-one-prd/TASK_CONTROLS_AVAILABILITY.md (Next decisions to settle)

## First session: do this
1. Start with W004 (authority matrix) and W005 (task and availability consent): they block the most streams.
2. W003 now covers the owner’s revised target chart (D28: Board of Supervisors, three VPs, dual reporting for SnG and Legal & Finances, MarcomIT and Legal & Finances Co-Directors, EE Associates). Produce the current-to-target mapping and the questions only the owner can answer (activation date, incumbents, what Associates may do).
3. One packet per open decision, max one page, in `POL/out/`; list them in INTERFACE.md with status Proposed/Adopted.
4. Collect questions only division leads can answer into one list for the owner.

## Done when
- Every open P0 decision in scope has an adopted answer or an explicit deferral recorded by the PM

## Scope at a glance
- Work packages: W002, W003, W004, W005, W006, W007, W008, W009 (★ = D1 first-version slice)
- Stories: none
- Requirements owned: 35; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the POL session (Policy and operating decisions) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/POL/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/POL/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/POL/HANDOFF.md (what earlier POL sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "POL Sol 6.1"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update POL/INTERFACE.md with anything other streams can rely on, append a dated entry to POL/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
