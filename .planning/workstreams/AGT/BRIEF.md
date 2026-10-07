# AGT · Browser agent tools (WebMCP)

**Model:** Sonnet 5.5 · **effort:** high · **wave:** 2 · **reviewer:** Opus 5.5 (PM) with a security pass

Expose DWDG’ONE actions to the member’s own browser AI agent through WebMCP (owner requirement D25): tools that read the member’s work and schedule and prepare changes, running the same permission, consent and version checks as the UI. Anything that reaches other people waits for the member’s confirmation in the page. No AI backend or paid model.

## You own
- The WebMCP tool layer (registration, schemas, feature detection, confirmation handoff to the UI)
- Tool denial tests

## Out of scope (owned by other streams)
- The commands themselves (WRK, SCH, RES, SIG)
- Permission rules (IAM)
- Confirmation UI design (UX1)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- ARC WebMCP tool contract rules
- IAM permission API
- WRK, SCH, RES, SIG command APIs
- UX1 confirmation pattern
- IAM · Identity, access and authority: W097 needs W024
- WRK · Work engine: tasks, offers, projects, milestones, blockers: W097 needs W028; W097 needs W029
- SCH · Schedule, meetings and Google Calendar sync: W097 needs W036
- SIG · Updates, reminders, Changes and search: W097 needs W039

**You provide** (others build on these, so publish them in `AGT/INTERFACE.md` before handing off):
- Tool catalogue in AGT/INTERFACE.md (to QA)

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/DATA_OWNERSHIP_AUTHORITY.md (section 8: audit labels)
- The current WebMCP specification (W3C Web Machine Learning community group); verify date and status

## First session: do this
1. Verify the current WebMCP spec (navigator.modelContext) and which browsers support it; record the date and source in INTERFACE.md.
2. Publish the tool catalogue (name, input schema, underlying command, confirmation needed or not) before writing code.
3. Build read tools first, then write tools behind confirmation.

## Done when
- W097 acceptance passes, including the denial and no-WebMCP fixtures

## Scope at a glance
- Work packages: W097 (★ = D1 first-version slice)
- Stories: S077
- Requirements owned: 2; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the AGT session (Browser agent tools (WebMCP)) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/AGT/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/AGT/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/AGT/HANDOFF.md (what earlier AGT sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "AGT Sonnet 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update AGT/INTERFACE.md with anything other streams can rely on, append a dated entry to AGT/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
