# DFL · Finance and Legal

**Model:** Sol 6.1 · **effort:** max · **wave:** 0 (spec pack), 2 (build) · **reviewer:** Opus 5.5 (PM), FnL lead

Legal intake, review versions, signature readiness, unique document numbering with void/reissue, PKS→BAST→invoice gates, budgets, requests, independent approval, recorded payments and monthly reconciliation in integer IDR. Correctness over speed: these are money and legal records.

## You own
- Entities: legal request, document register, finance budget, finance request, approval, payment record

## Out of scope (owned by other streams)
- Screens (UX3)
- Client/partner records (DEC)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- POL finance and legal policy (access_finance_policy, access_legal_policy, finance_sop)
- IAM approval rights, WRK tasks, RES versions
- DEC handoff contract
- RES · Resources, notes and links: W055 needs W033
- IAM · Identity, access and authority: W055 needs W024; W057 needs W024
- POL · Policy and operating decisions: W055 needs W002; W057 needs W002
- ARC · Architecture record and data foundation: W056 needs W043; W057 needs W022
- DAT · Export, import, backup and restore: W058 needs W040

**You provide** (others build on these, so publish them in `DFL/INTERFACE.md` before handing off):
- Gate contract (signed/BAST/finance-ready) to DEC
- Spec pack to UX3 and QA
- to DEC · External Engagement and Consulting delivery chain: W055 unblocks W052; W057 unblocks W052; W056 unblocks W063; W058 unblocks W063
- to QA · Verification, pilot and launch: W056 unblocks W079; W058 unblocks W079

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md (sections 8, 12)
- .planning/dwdg-one-prd/WORK_MODEL_DISCUSSION.md (Legal & Finance)
- .planning/dwdg-one-prd/SURVEY_RECOUNT.md

## First session: do this
1. Write the spec pack with worked IDR examples from the extract; list every unadopted SOP as a blocker question for the FnL lead.
2. No code until wave 2.

## Done when
- Spec pack accepted; W055–W058 acceptance passes with the reconciliation fixtures

## Scope at a glance
- Work packages: W055, W056, W057, W058 (★ = D1 first-version slice)
- Stories: S046, S047, S048, S049, S050, S051
- Requirements owned: 48; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the DFL session (Finance and Legal) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/DFL/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/DFL/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/DFL/HANDOFF.md (what earlier DFL sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "DFL Sol 6.1"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update DFL/INTERFACE.md with anything other streams can rely on, append a dated entry to DFL/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
