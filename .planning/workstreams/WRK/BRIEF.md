# WRK · Work engine: tasks, offers, projects, milestones, blockers

**Model:** Sonnet 5.5 · **effort:** high · **wave:** 1 · **reviewer:** Opus 5.5 (PM)

Build the canonical work records every division reuses: own tasks, task offers with consent, CD-and-up projects, milestones, dependencies, blockers, decisions and honest progress metrics. One record, many views.

## You own
- Entities: task, assignee, offer, project, project-unit, milestone, dependency, blocker, decision
- Progress and completion metrics

## Out of scope (owned by other streams)
- Screens (UX2 spec)
- Notifications (SIG consumes your events)
- Meetings (SCH)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- ARC contract
- IAM permission API
- UX2 specs for W015/W016
- POL task consent rules (W005)
- ARC · Architecture record and data foundation: W028 needs W022; W031 needs W022; W042 needs W022
- IAM · Identity, access and authority: W028 needs W024; W029 needs W024; W031 needs W024
- POL · Policy and operating decisions: W028 needs W005; W029 needs W005; W030 needs W005; W031 needs W009; W042 needs W006; W099 needs W002
- SCH · Schedule, meetings and Google Calendar sync: W104 needs W036
- SIG · Updates, reminders, Changes and search: W104 needs W037

**You provide** (others build on these, so publish them in `WRK/INTERFACE.md` before handing off):
- Task/project/milestone/blocker/decision APIs and the events SIG turns into Updates and Changes
- The task record division streams link to (never copy)
- to UX2 · Core work screens (My Work, Projects, Resources, Schedule): W028 unblocks W015; W029 unblocks W015; W030 unblocks W015; W031 unblocks W016; W032 unblocks W016
- to DHR · Human Resources workflows: W028 unblocks W046; W028 unblocks W098
- to DEC · External Engagement and Consulting delivery chain: W031 unblocks W052; W029 unblocks W061; W032 unblocks W062; W029 unblocks W065
- to DMS · MCIT and Strategy & Growth: W029 unblocks W053; W029 unblocks W054; W031 unblocks W060; W032 unblocks W060
- to QA · Verification, pilot and launch: W029 unblocks W080
- to AGT · Browser agent tools (WebMCP): W028 unblocks W097; W029 unblocks W097

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/WORK_MODEL_DISCUSSION.md (work types, tasks, records)
- .planning/dwdg-one-prd/TASK_CONTROLS_AVAILABILITY.md (member task CRUD)
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (section 3: offers and consent)

## First session: do this
1. Publish the task, offer and blocker field lists in INTERFACE.md from ARC's dictionary before coding.
2. Build W028 first (own task lifecycle); W029 offers next.

## Done when
- W028–W032, W042 acceptance passes with test output

## Scope at a glance
- Work packages: W028★, W029, W030, W031★, W032★, W042, W099★, W100★, W103★, W104★, W106★ (★ = D1 first-version slice)
- Stories: S011, S012, S013, S014, S015, S016, S017, S019, S079, S080, S083, S084, S086
- Requirements owned: 59; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the WRK session (Work engine: tasks, offers, projects, milestones, blockers) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/WRK/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/WRK/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/WRK/HANDOFF.md (what earlier WRK sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "WRK Sonnet 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update WRK/INTERFACE.md with anything other streams can rely on, append a dated entry to WRK/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
