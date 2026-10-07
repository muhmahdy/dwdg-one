# DWDG’ONE workstreams

The plan is split into workstreams so that separate AI sessions can each work on one group of related features without losing the connections to the rest. Claude (Opus 5.5) is the project manager. Mahdy is the product owner and makes every decision.

This file is generated from `README.template.md` by `build-workstreams.mjs` (planning workspace revision {{REV}}). Edit the template or `streams.json`, then run:

```bash
node .planning/workstreams/build-workstreams.mjs
```

## How it fits the planning workspace

- The canonical plan is still `.planning/dwdg-one-prd/state/planning-workspace.json`. Workstreams are an **overlay**: no ID is moved or renamed.
- Every WBS package, story and PRD requirement has exactly one owning stream (`map.json`). The generator stops with an error if anything is unassigned.
- Each stream folder has:
  - `BRIEF.md`: mission, ownership, connections, first steps and the prompt to paste.
  - `EXTRACT.md`: full text of its packages, stories and requirements, plus one-line summaries of other streams' requirements it must respect.
  - `INTERFACE.md`: what it publishes for others.
  - `HANDOFF.md`: its session log.

## Streams

| Stream | Name | Wave | Model, effort | Packages | Stories | Requirements owned |
|---|---|---|---|---|---|---|
{{TABLE}}

**Waves:**
- **Wave 0, now:**
  - PM, POL and ARC.
  - UX1 and UX2 finish the prototype for owner approval.
  - OPS checks the budget facts (W067).
  - The four division streams write spec packs (no code).
- **Wave 1, after the owner approves the prototype (D8):**
  - The foundation builders: IAM, WRK, RES, SCH, SIG, DAT, OPS.
  - UX3 designs the account and division screens.
  - QA builds fixtures.
- **Wave 2:** division builds, WebMCP tools (AGT), and full verification, pilot and launch.

**Models:**
- Opus 5.5 does project management, all UI/UX design (never delegated outside Claude, D10), architecture and security review.
- Sonnet 5.5 builds well-specified features and runs QA, so checking stays independent of the Sol builders.
- Sol 6.1 drafts policy and builds rule-heavy backend, operations and division specs.
- Astra is not used (owner, 6 Oct).

## Connections between streams (derived from package prerequisites)

| From | To | Package needs |
|---|---|---|
{{FLOW}}

`W016→W021` means W021 (in the "To" stream) needs W016 (in the "From" stream) first.

## Single ownership of shared records

Each record type has one owning stream. Other streams link to it by ID and never copy it, which is the PRD's one-record-many-views rule.

| Records | Owner |
|---|---|
| Person, account, membership, invitation, role grant, reporting, workspace/unit/term | IAM |
| Task, offer, project, milestone, dependency, blocker, decision | WRK |
| Resource, folder, link, note, revision, association | RES |
| Availability, meeting, attendee, Google Calendar link and imported busy time | SCH |
| Notification, change event, search index | SIG |
| Export, import, backup | DAT |
| Legal request, document register, budget, finance request, approval, payment | DFL |
| Partner, contact, interaction, opportunity, handoff, deliverable, knowledge, TnD | DEC |
| Attendance register, monitoring cycle, assessment, recognition, onboarding | DHR |
| Campaign, content item, publication record, IT request, account register, initiative | DMS |
| Tokens, components, shell, navigation, strings | UX1 |
| WebMCP tool layer (tools call the owning streams' commands, never their own copies) | AGT |
| Entity dictionary, command/event envelope, code layout, calendar sync design | ARC |

## Session protocol (every session)

1. **Read first:** AGENTS.md, then `CONTEXT.md`, this README, your `BRIEF.md`, your `EXTRACT.md`, your `HANDOFF.md`, and the `INTERFACE.md` of each stream you consume.
2. **Stay in scope.** Build only what your extract or an owner decision asks for, and cite the requirement ID in code comments or specs. Anything else goes to `REQUESTS.md` as a question for the PM.
3. **Touch only what you own.**
   - Write only your own folder, plus the code paths your brief or ARC's layout assigns you.
   - If you need another stream to change something, add a request to `REQUESTS.md`.
4. **Publish before you build.** If others depend on you, put the field list or API signature in `INTERFACE.md` first.
5. **Planning workspace:**
   - Change it only through `planner-cli.mjs`, with actor `"<stream> <model>"` and the etag you read.
   - Move cards to Review with evidence. Only the PM moves a card to Done.
6. **Honesty:**
   - No invented success: build output alone is not evidence.
   - Unknown never becomes "free" or "zero".
   - No fabricated people, dates or approvals presented as real.
7. **Preserve:** never reset the preserved Vite app, its three browser stores, or the reference library.
8. **Before stopping:**
   - Update `INTERFACE.md`.
   - Append to `HANDOFF.md`: date, model, what changed with paths, evidence, open questions and the next step.
   - Reply with a short summary for the PM.

## The PM loop (Claude Opus 5.5)

1. Pick the next session from the wave plan and the Kanban. Give the owner the `BRIEF.md` prompt to paste.
2. When a session hands off:
   - Review its `HANDOFF.md` against its `EXTRACT.md`.
   - Check that the connections it promised are published in `INTERFACE.md`.
   - Move its cards, answer its requests, and update the dependent briefs if the contract changed.
3. Ask the owner only for decisions that are theirs. Record each one in `.planning/DECISIONS.md` and fold it into the PRD.
