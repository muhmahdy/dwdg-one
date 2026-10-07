# UX2 · Core work screens (My Work, Projects, Resources, Schedule)

**Model:** Opus 5.5 · **effort:** high · **wave:** 0 · **reviewer:** Product owner

Finish the clickable prototype of the first version's daily screens so the owner can approve it (D8, D22), then turn the approved screens into a build spec for WRK, RES and SCH. Every element cites a requirement; nothing outside the extract.

## You own
- `prototype/` screens: work.js (My Work, tasks), plan.js (projects, resources, updates, changes, organisation, settings), schedule.js (calendar, composer, meetings)
- `prototype/data.js` demo data
- UX2/out/ build specs per screen after approval

## Out of scope (owned by other streams)
- Tokens and shell (UX1)
- Real backend behaviour (WRK, RES, SCH, SIG)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- UX1 component contract
- POL consent rules for offers and availability (use the PRD's proposed defaults until adopted)
- ARC Google Calendar sync design (D24) for how sync appears in the UI
- UX1 · Design system, shell and interaction foundations: W015 needs W012; W016 needs W012; W017 needs W012; W018 needs W012
- WRK · Work engine: tasks, offers, projects, milestones, blockers: W015 needs W028; W015 needs W029; W015 needs W030; W016 needs W031; W016 needs W032
- RES · Resources, notes and links: W017 needs W033; W017 needs W034
- SCH · Schedule, meetings and Google Calendar sync: W018 needs W035; W018 needs W036

**You provide** (others build on these, so publish them in `UX2/INTERFACE.md` before handing off):
- Approved screen specs: fields, states, empty/error/denied states, permissions shown, events triggered (to WRK, RES, SCH, SIG)
- Demo fixtures that QA can reuse
- to UX1 · Design system, shell and interaction foundations: W015 unblocks W021; W016 unblocks W021; W017 unblocks W021; W018 unblocks W021

## Source documents to read (after your extract)
- .planning/PRD_ALIGNMENT.md (section 7 is your plan)
- .planning/dwdg-one-prd/UI_UX_IMPLEMENTATION_MAP.md (core pages, Resources)
- .planning/dwdg-one-prd/TASK_CONTROLS_AVAILABILITY.md (task controls, unavailable time, the R046 meeting video)
- .planning/REFERENCE_DIGEST.md (R046)
- .planning/ux/wireframes.html
- .planning/design/system/README.md

## First session: do this
1. Session 3 is a short clean-up, no new features: (1) R20: delete your interim shell code and styles exactly as listed in REQUESTS R20, switch to icon('routine'), the sh-* acts and the shared toast, and change the British L() strings it names to US spelling; then tell UX1 in REQUESTS.md so it removes the handover block. (2) R21: use var(--focus-ring) for every outline, 24 px desktop / 44 px touch tick targets, 16/24 quick-add text on phones, fix "Tanpa tanggal" wrapping in the due column, and put reactions or state on a second line on phones. (3) Use "Canceled" (US) everywhere you show the stage (R22d). (4) Re-check My Work, Projects, Operations, Resources and Schedule at 390 and 1440 px with 0 runtime errors.
2. Specs: update UX2/out/specs/README.md so every item in the size table is P0 (owner decision D48) and record the total.
3. Feature freeze continues: new owner ideas go to owner-review.md and REQUESTS.md for the PM.

## Done when
- Owner says the daily screens are good enough to build from
- Build specs exist for W015–W018 in UX2/out/

## Scope at a glance
- Work packages: W015★, W016★, W017★, W018★ (★ = D1 first-version slice)
- Stories: S018, S022, S026
- Requirements owned: 36; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the UX2 session (Core work screens (My Work, Projects, Resources, Schedule)) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/UX2/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/UX2/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/UX2/HANDOFF.md (what earlier UX2 sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "UX2 Opus 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update UX2/INTERFACE.md with anything other streams can rely on, append a dated entry to UX2/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
