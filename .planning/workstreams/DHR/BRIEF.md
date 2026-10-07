# DHR · Human Resources workflows

**Model:** Sol 6.1 · **effort:** high · **wave:** 0 (spec pack), 2 (build) · **reviewer:** Opus 5.5 (PM), HR lead

Weekly meeting attendance, the 14-day monitoring and grading cycle, member feedback and support actions, Member of the Month, onboarding and member lifecycle. First produce a spec pack; build only after UX3 has the screens and IAM/WRK/SCH exist. Also the data behind the team performance views (W098, D30): which recorded facts count, per role scope.

## You own
- Entities: attendance register, monitoring cycle, assessment, recognition round, onboarding instance
- HR spec pack in DHR/out/

## Out of scope (owned by other streams)
- HR screens (UX3)
- Meetings (SCH) and tasks (WRK): link, never copy

## Connections
**You consume** (wait for these, or work against the agreed contract):
- POL HR rules (W007), privacy table (W006)
- SCH meetings, WRK tasks, IAM transfer
- SCH · Schedule, meetings and Google Calendar sync: W044 needs W036
- POL · Policy and operating decisions: W044 needs W007; W045 needs W007; W048 needs W006
- IAM · Identity, access and authority: W045 needs W027; W049 needs W023; W049 needs W027; W098 needs W024
- WRK · Work engine: tasks, offers, projects, milestones, blockers: W046 needs W028; W098 needs W028

**You provide** (others build on these, so publish them in `DHR/INTERFACE.md` before handing off):
- Spec pack (states, fields, field audiences, fixtures, acceptance scenarios) to UX3 and QA
- Publishable award packet contract to DMS (MCIT)
- to QA · Verification, pilot and launch: W044 unblocks W079; W047 unblocks W079; W048 unblocks W079; W049 unblocks W079

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/WORK_MODEL_DISCUSSION.md (HR section and acceptance checks 1–8, 16–20)
- .planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md (section 7)
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (section 5: transfer)

## First session: do this
1. Write the spec pack from the extract only; mark every unadopted rule as Proposed and list questions for the HR lead.
2. No code until wave 2.

## Done when
- Spec pack accepted (wave 0); W044–W049 acceptance passes (wave 2)

## Scope at a glance
- Work packages: W044, W045, W046, W047, W048, W049, W098★ (★ = D1 first-version slice)
- Stories: S029, S030, S031, S032, S033, S034, S035, S036, S037, S038, S078
- Requirements owned: 30; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the DHR session (Human Resources workflows) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/DHR/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/DHR/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/DHR/HANDOFF.md (what earlier DHR sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "DHR Sol 6.1"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update DHR/INTERFACE.md with anything other streams can rely on, append a dated entry to DHR/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
