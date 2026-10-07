# DEC · External Engagement and Consulting delivery chain

**Model:** Sol 6.1 · **effort:** high · **wave:** 0 (spec pack), 2 (build) · **reviewer:** Opus 5.5 (PM), EE and Consulting leads

EE Partner and Client relationships, the EE-to-Consulting/FnL handoff, Project Associates staffing with consent, exact-version reviews, delivery and closure, Knowledge and TnD. Spec pack first, build in wave 2.

## You own
- Entities: partner, contact, interaction, opportunity, handoff, deliverable, knowledge article, TnD programme/session

## Out of scope (owned by other streams)
- Legal requests and finance gates (DFL)
- Projects and tasks themselves (WRK)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- POL Consulting policy (W009), work forms and handoff template (W002)
- WRK projects/offers, RES versions, SCH sessions
- DFL legal/BAST gate contract
- ARC · Architecture record and data foundation: W050 needs W022; W051 needs W022
- IAM · Identity, access and authority: W050 needs W024; W051 needs W024
- POL · Policy and operating decisions: W050 needs W002; W051 needs W002; W061 needs W009; W064 needs W006; W064 needs W002; W065 needs W002; W066 needs W003
- WRK · Work engine: tasks, offers, projects, milestones, blockers: W052 needs W031; W061 needs W029; W062 needs W032; W065 needs W029
- DFL · Finance and Legal: W052 needs W055; W052 needs W057; W063 needs W056; W063 needs W058
- RES · Resources, notes and links: W062 needs W033; W064 needs W033
- SCH · Schedule, meetings and Google Calendar sync: W065 needs W036

**You provide** (others build on these, so publish them in `DEC/INTERFACE.md` before handing off):
- Spec pack to UX3 and QA
- Handoff contract to DFL
- to QA · Verification, pilot and launch: W050 unblocks W079; W052 unblocks W079; W063 unblocks W079; W064 unblocks W079; W065 unblocks W079; W052 unblocks W080

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md (sections 5, 10, 12)
- .planning/dwdg-one-prd/WORK_MODEL_DISCUSSION.md (Consulting units and External Engagement)
- .planning/dwdg-one-prd/SURVEY_RECOUNT.md

## First session: do this
1. Write the spec pack; agree the handoff contract with DFL through REQUESTS.md.
2. No code until wave 2.

## Done when
- Spec pack accepted; W050–W065 acceptance passes

## Scope at a glance
- Work packages: W050, W051, W052, W061, W062, W063, W064, W065, W066 (★ = D1 first-version slice)
- Stories: S010, S039, S040, S041, S054, S055, S056, S057, S058, S059, S060, S061, S074
- Requirements owned: 50; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the DEC session (External Engagement and Consulting delivery chain) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/DEC/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/DEC/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/DEC/HANDOFF.md (what earlier DEC sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "DEC Sol 6.1"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update DEC/INTERFACE.md with anything other streams can rely on, append a dated entry to DEC/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
