# OPS · Cost, environments, release and operations

**Model:** Sol 6.1 · **effort:** medium · **wave:** 0 (W067), then 1 · **reviewer:** Opus 5.5 (PM)

Keep the product affordable and operable: verify the stack fits Rp35k target / Rp50k ceiling with dated provider facts, set up separated environments and secrets, the release pipeline with checks, monitoring, and the semester succession runbook.

## You own
- Budget model, environment inventory, CI and release pipeline, monitoring, runbooks

## Out of scope (owned by other streams)
- Backup and restore content (DAT)
- Architecture choices (ARC; you supply cost facts)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- ARC stack choice
- POL privacy and custody table
- PM · Programme management and PRD control: W067 needs W001
- POL · Policy and operating decisions: W067 needs W008; W068 needs W006; W073 needs W006
- QA · Verification, pilot and launch: W074 needs W078
- DAT · Export, import, backup and restore: W075 needs W072
- ARC · Architecture record and data foundation: W075 needs W022

**You provide** (others build on these, so publish them in `OPS/INTERFACE.md` before handing off):
- Dated cost facts (to ARC first)
- Environments and deploy pipeline (to every builder and QA)
- to DAT · Export, import, backup and restore: W068 unblocks W071; W069 unblocks W071
- to QA · Verification, pilot and launch: W069 unblocks W078; W073 unblocks W081; W075 unblocks W083; W067 unblocks W086; W068 unblocks W086; W077 unblocks W086
- to SCH · Schedule, meetings and Google Calendar sync: W068 unblocks W096; W070 unblocks W096

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/OPERATIONS_RESEARCH.md (dated facts to re-verify)

## First session: do this
1. Do W067 now: dated official quota and pricing facts for Supabase Free, Cloudflare Pages, Google OAuth and Calendar API, GitHub Actions; give ARC the numbers.
2. Leave the rest until the prototype is approved.

## Done when
- W067–W077 acceptance passes; monthly model at or under Rp50,000

## Scope at a glance
- Work packages: W067★, W068, W069★, W070, W073, W074★, W075, W076, W077 (★ = D1 first-version slice)
- Stories: S066, S067, S068
- Requirements owned: 62; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the OPS session (Cost, environments, release and operations) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/OPS/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/OPS/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/OPS/HANDOFF.md (what earlier OPS sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "OPS Sol 6.1"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update OPS/INTERFACE.md with anything other streams can rely on, append a dated entry to OPS/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
