# RES · Resources, notes and links

**Model:** Sonnet 5.5 · **effort:** medium · **wave:** 1 · **reviewer:** Opus 5.5 (PM)

Build folders, native notes with revisions, safe external links, responsibility bubbles, resource-to-task links and the can't-open report. No binary upload in v1 (D5).

## You own
- Entities: resource, folder, link, note, note revision, resource association, pin

## Out of scope (owned by other streams)
- Explorer and inspector screens (UX2)
- Export bundles (DAT)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- ARC contract
- IAM permissions
- WRK task API (resource-to-task)
- UX2 spec for W017
- ARC · Architecture record and data foundation: W033 needs W022
- IAM · Identity, access and authority: W033 needs W024
- POL · Policy and operating decisions: W033 needs W008; W034 needs W006

**You provide** (others build on these, so publish them in `RES/INTERFACE.md` before handing off):
- Resource APIs and minutes-note creation (to SCH for meeting minutes, divisions for evidence links)
- to UX2 · Core work screens (My Work, Projects, Resources, Schedule): W033 unblocks W017; W034 unblocks W017
- to DMS · MCIT and Strategy & Growth: W033 unblocks W053; W033 unblocks W059
- to DFL · Finance and Legal: W033 unblocks W055
- to DEC · External Engagement and Consulting delivery chain: W033 unblocks W062; W033 unblocks W064
- to QA · Verification, pilot and launch: W034 unblocks W082
- to DAT · Export, import, backup and restore: W034 unblocks W095

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/UI_UX_IMPLEMENTATION_MAP.md (Resources completeness)
- .planning/dwdg-one-prd/CRITIQUE_CONTEXT.md (Resources, Attachment and Resource sections only)
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (section 7: external files)

## First session: do this
1. Publish the resource field list and association rules in INTERFACE.md.
2. Build W033 then W034.

## Done when
- W033–W034 acceptance passes with test output

## Scope at a glance
- Work packages: W033★, W034★ (★ = D1 first-version slice)
- Stories: S020, S021, S023
- Requirements owned: 48; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the RES session (Resources, notes and links) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/RES/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/RES/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/RES/HANDOFF.md (what earlier RES sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "RES Sonnet 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update RES/INTERFACE.md with anything other streams can rely on, append a dated entry to RES/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
