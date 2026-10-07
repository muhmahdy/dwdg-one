# DMS · MCIT and Strategy & Growth

**Model:** Sonnet 5.5 · **effort:** medium · **wave:** 0 (spec pack), 2 (build) · **reviewer:** Opus 5.5 (PM), MCIT and SnG leads

MCIT content production with exact-version review and recorded publication, IT requests with a safe account register (no passwords), and SnG research, decisions and outcome review. Spec pack first, build in wave 2.

## You own
- Entities: campaign, content item, publication record, IT request, account register entry, initiative

## Out of scope (owned by other streams)
- Decisions and tasks (WRK)
- Screens (UX3)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- WRK decisions/tasks, RES versions
- DHR award packet contract
- RES · Resources, notes and links: W053 needs W033; W059 needs W033
- WRK · Work engine: tasks, offers, projects, milestones, blockers: W053 needs W029; W054 needs W029; W060 needs W031; W060 needs W032
- POL · Policy and operating decisions: W053 needs W002; W054 needs W002; W059 needs W006

**You provide** (others build on these, so publish them in `DMS/INTERFACE.md` before handing off):
- Spec pack to UX3 and QA
- to QA · Verification, pilot and launch: W053 unblocks W079; W054 unblocks W079; W060 unblocks W079

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md (sections 6, 9)
- .planning/dwdg-one-prd/WORK_MODEL_DISCUSSION.md (MarCom & IT, Strategy & Growth)

## First session: do this
1. Write the spec pack; SnG has no survey evidence, so every SnG rule is Proposed with questions for Mahdy.
2. No code until wave 2.

## Done when
- Spec pack accepted; W053, W054, W059, W060 acceptance passes

## Scope at a glance
- Work packages: W053, W054, W059, W060 (★ = D1 first-version slice)
- Stories: S042, S043, S044, S045, S052, S053
- Requirements owned: 39; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the DMS session (MCIT and Strategy & Growth) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/DMS/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/DMS/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/DMS/HANDOFF.md (what earlier DMS sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "DMS Sonnet 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update DMS/INTERFACE.md with anything other streams can rely on, append a dated entry to DMS/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
