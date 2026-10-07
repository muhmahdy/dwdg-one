# PM · Programme management and PRD control

**Model:** Opus 5.5 · **effort:** high · **wave:** 0, continuous · **reviewer:** Product owner

Keep one coherent plan across every session. Fold owner decisions into the PRD, keep the Kanban truthful, answer REQUESTS.md, review every handoff against the extract it was built from, and decide the next session to run. This is the session you are reading now.

## You own
- `.planning/workstreams/` (briefs, streams.json, generator, CONTEXT.md, README.md, REQUESTS.md)
- `.planning/DECISIONS.md`, `PRD_DIGEST.md`, `PRD_ALIGNMENT.md`
- PRD edits that fold owner decisions in (via planner-cli)
- Kanban status moves after review

## Out of scope (owned by other streams)
- Any product design or code (UX and build streams)
- Policy content (POL drafts, owner decides)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- Every stream's HANDOFF.md and INTERFACE.md
- Owner answers in chat

**You provide** (others build on these, so publish them in `PM/INTERFACE.md` before handing off):
- Briefs and the prompt for each session
- Decisions D1+ folded into the PRD
- Review verdicts and the next-session queue
- to POL · Policy and operating decisions: W001 unblocks W002; W001 unblocks W003
- to UX1 · Design system, shell and interaction foundations: W001 unblocks W010
- to OPS · Cost, environments, release and operations: W001 unblocks W067

## Source documents to read (after your extract)
- .planning/STRATEGY.md
- .planning/DECISIONS.md
- .planning/PRD_DIGEST.md
- .planning/PRD_ALIGNMENT.md
- .planning/dwdg-one-prd/CONSULTATION_REVIEW.md
- .planning/dwdg-one-prd/CONSISTENCY_REVIEW.md

## First session: do this
1. Fold D6–D24 into the PRD as one reviewed planner-cli patch (calendar sync promotion, Geist/green design, official names, My Work as Home).
2. Promote W096/S076 to v1 (D24) and move W010/W011 to Review with the design-system evidence.
3. Keep REQUESTS.md answered within one session.

## Done when
- Every handoff is reviewed and the Kanban matches the evidence
- No open REQUESTS.md item older than one session

## Scope at a glance
- Work packages: W001★, W088, W089, W090, W091, W092, W093, W094 (★ = D1 first-version slice)
- Stories: S069, S070, S071, S072, S073
- Requirements owned: 76; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the PM session (Programme management and PRD control) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/PM/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/PM/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/PM/HANDOFF.md (what earlier PM sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "PM Opus 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update PM/INTERFACE.md with anything other streams can rely on, append a dated entry to PM/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
