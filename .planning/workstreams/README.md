# DWDG’ONE workstreams

The plan is split into workstreams so that separate AI sessions can each work on one group of related features without losing the connections to the rest. Claude (Opus 5.5) is the project manager. Mahdy is the product owner and makes every decision.

This file is generated from `README.template.md` by `build-workstreams.mjs` (planning workspace revision 14). Edit the template or `streams.json`, then run:

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
| [PM](PM/BRIEF.md) | Programme management and PRD control | 0, continuous | Opus 5.5, high | 8 | 5 | 76 |
| [POL](POL/BRIEF.md) | Policy and operating decisions | 0 | Sol 6.1, high | 8 | 0 | 35 |
| [UX1](UX1/BRIEF.md) | Design system, shell and interaction foundations | 0 | Opus 5.5, high | 7 | 2 | 56 |
| [UX2](UX2/BRIEF.md) | Core work screens (My Work, Projects, Resources, Schedule) | 0 | Opus 5.5, high | 4 | 3 | 36 |
| [UX3](UX3/BRIEF.md) | Account, authority and division screens | 1 | Opus 5.5, high | 2 | 0 | 2 |
| [ARC](ARC/BRIEF.md) | Architecture record and data foundation | 0 | Opus 5.5, max | 2 | 0 | 48 |
| [IAM](IAM/BRIEF.md) | Identity, access and authority | 1 | Sol 6.1, high | 6 | 8 | 59 |
| [WRK](WRK/BRIEF.md) | Work engine: tasks, offers, projects, milestones, blockers | 1 | Sonnet 5.5, high | 11 | 13 | 59 |
| [RES](RES/BRIEF.md) | Resources, notes and links | 1 | Sonnet 5.5, medium | 2 | 3 | 48 |
| [SCH](SCH/BRIEF.md) | Schedule, meetings and Google Calendar sync | 1 | Sonnet 5.5, high | 4 | 6 | 27 |
| [SIG](SIG/BRIEF.md) | Updates, reminders, Changes and search | 1 | Sonnet 5.5, high | 3 | 3 | 40 |
| [AGT](AGT/BRIEF.md) | Browser agent tools (WebMCP) | 2 | Sonnet 5.5, high | 1 | 1 | 2 |
| [DAT](DAT/BRIEF.md) | Export, import, backup and restore | 1 | Sol 6.1, high | 5 | 3 | 31 |
| [OPS](OPS/BRIEF.md) | Cost, environments, release and operations | 0 (W067), then 1 | Sol 6.1, medium | 9 | 3 | 62 |
| [DHR](DHR/BRIEF.md) | Human Resources workflows | 0 (spec pack), 2 (build) | Sol 6.1, high | 7 | 11 | 30 |
| [DEC](DEC/BRIEF.md) | External Engagement and Consulting delivery chain | 0 (spec pack), 2 (build) | Sol 6.1, high | 9 | 13 | 50 |
| [DFL](DFL/BRIEF.md) | Finance and Legal | 0 (spec pack), 2 (build) | Sol 6.1, max | 4 | 6 | 48 |
| [DMS](DMS/BRIEF.md) | MCIT and Strategy & Growth | 0 (spec pack), 2 (build) | Sonnet 5.5, medium | 4 | 6 | 39 |
| [QA](QA/BRIEF.md) | Verification, pilot and launch | 1 (fixtures), 2 | Sonnet 5.5, high | 10 | 0 | 30 |

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
| ARC | DAT | W022→W040 |
| ARC | DEC | W022→W050, W022→W051 |
| ARC | DFL | W043→W056, W022→W057 |
| ARC | IAM | W022→W023, W022→W024 |
| ARC | OPS | W022→W075 |
| ARC | QA | W022→W078, W043→W082 |
| ARC | RES | W022→W033 |
| ARC | SCH | W022→W035 |
| ARC | SIG | W022→W038 |
| ARC | WRK | W022→W028, W022→W031, W022→W042 |
| DAT | DFL | W040→W058 |
| DAT | OPS | W072→W075 |
| DAT | QA | W040→W080, W040→W082, W072→W083, W041→W085 |
| DEC | QA | W050→W079, W052→W079, W063→W079, W064→W079, W065→W079, W052→W080 |
| DFL | DEC | W055→W052, W057→W052, W056→W063, W058→W063 |
| DFL | QA | W056→W079, W058→W079 |
| DHR | QA | W044→W079, W047→W079, W048→W079, W049→W079 |
| DMS | QA | W053→W079, W054→W079, W060→W079 |
| IAM | AGT | W024→W097 |
| IAM | DAT | W024→W040 |
| IAM | DEC | W024→W050, W024→W051 |
| IAM | DFL | W024→W055, W024→W057 |
| IAM | DHR | W027→W045, W023→W049, W027→W049, W024→W098 |
| IAM | QA | W024→W082, W025→W082, W026→W082, W027→W082 |
| IAM | RES | W024→W033 |
| IAM | SCH | W024→W035, W024→W036, W023→W102 |
| IAM | SIG | W024→W037, W024→W038, W024→W039 |
| IAM | UX3 | W023→W014, W026→W014, W027→W014 |
| IAM | WRK | W024→W028, W024→W029, W024→W031 |
| OPS | DAT | W068→W071, W069→W071 |
| OPS | QA | W069→W078, W073→W081, W075→W083, W067→W086, W068→W086, W077→W086 |
| OPS | SCH | W068→W096, W070→W096 |
| PM | OPS | W001→W067 |
| PM | POL | W001→W002, W001→W003 |
| PM | UX1 | W001→W010 |
| POL | ARC | W003→W022, W008→W022 |
| POL | DAT | W006→W040, W008→W040 |
| POL | DEC | W002→W050, W002→W051, W009→W061, W006→W064, W002→W064, W002→W065, W003→W066 |
| POL | DFL | W002→W055, W002→W057 |
| POL | DHR | W007→W044, W007→W045, W006→W048 |
| POL | DMS | W002→W053, W002→W054, W006→W059 |
| POL | IAM | W004→W023, W004→W024, W006→W024 |
| POL | OPS | W008→W067, W006→W068, W006→W073 |
| POL | QA | W004→W078, W002→W079, W005→W079 |
| POL | RES | W008→W033, W006→W034 |
| POL | SCH | W005→W035 |
| POL | SIG | W002→W037, W006→W038, W006→W039 |
| POL | UX1 | W004→W012 |
| POL | UX3 | W002→W019 |
| POL | WRK | W005→W028, W005→W029, W005→W030, W009→W031, W006→W042, W002→W099 |
| QA | OPS | W078→W074 |
| RES | DAT | W034→W095 |
| RES | DEC | W033→W062, W033→W064 |
| RES | DFL | W033→W055 |
| RES | DMS | W033→W053, W033→W059 |
| RES | QA | W034→W082 |
| RES | UX2 | W033→W017, W034→W017 |
| SCH | AGT | W036→W097 |
| SCH | DEC | W036→W065 |
| SCH | DHR | W036→W044 |
| SCH | UX2 | W035→W018, W036→W018 |
| SCH | WRK | W036→W104 |
| SIG | AGT | W039→W097 |
| SIG | QA | W038→W080, W039→W080, W038→W082, W039→W082 |
| SIG | WRK | W037→W104 |
| UX1 | QA | W021→W081 |
| UX1 | UX2 | W012→W015, W012→W016, W012→W017, W012→W018 |
| UX1 | UX3 | W012→W014, W012→W019 |
| UX2 | UX1 | W015→W021, W016→W021, W017→W021, W018→W021 |
| UX3 | QA | W019→W079 |
| UX3 | UX1 | W014→W021, W019→W021 |
| WRK | AGT | W028→W097, W029→W097 |
| WRK | DEC | W031→W052, W029→W061, W032→W062, W029→W065 |
| WRK | DHR | W028→W046, W028→W098 |
| WRK | DMS | W029→W053, W029→W054, W031→W060, W032→W060 |
| WRK | QA | W029→W080 |
| WRK | UX2 | W028→W015, W029→W015, W030→W015, W031→W016, W032→W016 |

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
