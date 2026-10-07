# DAT · Export, import, backup and restore

**Model:** Sol 6.1 · **effort:** high · **wave:** 1 · **reviewer:** Opus 5.5 (PM)

Make every record portable and recoverable: scoped CSV/JSON/Markdown export with a link manifest, safe import of selected legacy data (the three existing browser stores are preserved, never reset), encrypted independent backup and a rehearsed isolated restore.

## You own
- Export and import jobs, backup routine, restore runbook
- Legacy store inventory

## Out of scope (owned by other streams)
- Environments and secrets (OPS)
- Record schemas (owning streams)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- ARC dictionary
- IAM scope API
- OPS environments and custody (W068, W069)
- ARC · Architecture record and data foundation: W040 needs W022
- IAM · Identity, access and authority: W040 needs W024
- POL · Policy and operating decisions: W040 needs W006; W040 needs W008
- OPS · Cost, environments, release and operations: W071 needs W068; W071 needs W069
- RES · Resources, notes and links: W095 needs W034

**You provide** (others build on these, so publish them in `DAT/INTERFACE.md` before handing off):
- Export formats and the restore procedure (to QA, OPS)
- to DFL · Finance and Legal: W040 unblocks W058
- to OPS · Cost, environments, release and operations: W072 unblocks W075
- to QA · Verification, pilot and launch: W040 unblocks W080; W040 unblocks W082; W072 unblocks W083; W041 unblocks W085

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/OPERATIONS_RESEARCH.md (backup mechanism)
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (section 7: one source of truth per collection)
- .planning/dwdg-one-prd/README.md (preserved app and its three stores)

## First session: do this
1. Inventory the preserved app's three local stores read-only and document them; change nothing.
2. Publish export schemas in INTERFACE.md.

## Done when
- W040, W041, W071, W072 acceptance passes with a recorded restore rehearsal

## Scope at a glance
- Work packages: W040★, W041, W071★, W072, W095 (★ = D1 first-version slice)
- Stories: S064, S065, S075
- Requirements owned: 31; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the DAT session (Export, import, backup and restore) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/DAT/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/DAT/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/DAT/HANDOFF.md (what earlier DAT sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "DAT Sol 6.1"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update DAT/INTERFACE.md with anything other streams can rely on, append a dated entry to DAT/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
