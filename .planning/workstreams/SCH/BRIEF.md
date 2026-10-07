# SCH · Schedule, meetings and Google Calendar sync

**Model:** Sonnet 5.5 · **effort:** high · **wave:** 1 · **reviewer:** Opus 5.5 (PM)

Build unavailable time, meetings with conflicts and invitation responses, minutes/decisions/follow-ups, .ics export, and the two-way Google Calendar sync the owner put in v1 (D24), following ARC's sync design exactly.

## You own
- Entities: availability block, meeting, attendee, Google Calendar link and imported busy time

## Out of scope (owned by other streams)
- Calendar and composer screens (UX2)
- Decisions and follow-up tasks themselves (WRK records; you link them)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- ARC calendar sync design
- IAM permissions
- WRK decision and task APIs
- RES minutes notes
- POL availability privacy rule (W005)
- ARC · Architecture record and data foundation: W035 needs W022
- IAM · Identity, access and authority: W035 needs W024; W036 needs W024; W102 needs W023
- POL · Policy and operating decisions: W035 needs W005
- OPS · Cost, environments, release and operations: W096 needs W068; W096 needs W070

**You provide** (others build on these, so publish them in `SCH/INTERFACE.md` before handing off):
- Busy/free/unknown query used by the composer and person inspector
- Meeting events for SIG
- to UX2 · Core work screens (My Work, Projects, Resources, Schedule): W035 unblocks W018; W036 unblocks W018
- to DHR · Human Resources workflows: W036 unblocks W044
- to DEC · External Engagement and Consulting delivery chain: W036 unblocks W065
- to AGT · Browser agent tools (WebMCP): W036 unblocks W097
- to WRK · Work engine: tasks, offers, projects, milestones, blockers: W036 unblocks W104

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/TASK_CONTROLS_AVAILABILITY.md
- .planning/REFERENCE_DIGEST.md (R046 scheduling video)
- .planning/dwdg-one-prd/WORK_MODEL_DISCUSSION.md (weekly meeting attendance, so meetings support it)

## First session: do this
1. Do not start sync code until ARC's sync design is accepted by the owner.
2. Build W035 and W036 first; sync (W096) last.

## Done when
- W035, W036, W096 acceptance passes, including the adjacency and unknown-availability tests

## Scope at a glance
- Work packages: W035★, W036★, W096★, W102★ (★ = D1 first-version slice)
- Stories: S024, S025, S027, S028, S076, S082
- Requirements owned: 27; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the SCH session (Schedule, meetings and Google Calendar sync) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/SCH/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/SCH/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/SCH/HANDOFF.md (what earlier SCH sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "SCH Sonnet 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update SCH/INTERFACE.md with anything other streams can rely on, append a dated entry to SCH/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
