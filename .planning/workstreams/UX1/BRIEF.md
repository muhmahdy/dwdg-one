# UX1 · Design system, shell and interaction foundations

**Model:** Opus 5.5 · **effort:** high · **wave:** 0 · **reviewer:** Product owner

Own the visual and interaction language: tokens, components, shell, navigation, overlays, forms and honest save states, EN/ID and accessibility. Design system v2 (`.planning/design/system/`) is the source (D21). UI/UX is never delegated outside Claude (D10).

## You own
- .planning/design/system/ (tokens.css, components.css, system.html, README rules)
- prototype/app.js, app.css, i18n.js and index.html (shell, navigation, overlays, string dictionary)

## Out of scope (owned by other streams)
- Screen content of My Work, Projects, Resources, Schedule (UX2)
- Account and division screens (UX3)

## Connections
**You consume** (wait for these, or work against the agreed contract):
- Owner taste rules (CONTEXT.md, memory) and reference digest
- PM · Programme management and PRD control: W010 needs W001
- POL · Policy and operating decisions: W012 needs W004
- UX3 · Account, authority and division screens: W021 needs W014; W021 needs W019
- UX2 · Core work screens (My Work, Projects, Resources, Schedule): W021 needs W015; W021 needs W016; W021 needs W017; W021 needs W018

**You provide** (others build on these, so publish them in `UX1/INTERFACE.md` before handing off):
- Component and token contract every screen uses
- Navigation map: My Work, Updates, Schedule; workspace: Projects, Resources, Changes; Organisation, Settings; phone dock with More
- String-key convention for EN/ID
- Confirmation pattern for actions a browser agent prepares (D25), used by AGT
- to UX3 · Account, authority and division screens: W012 unblocks W014; W012 unblocks W019
- to UX2 · Core work screens (My Work, Projects, Resources, Schedule): W012 unblocks W015; W012 unblocks W016; W012 unblocks W017; W012 unblocks W018
- to QA · Verification, pilot and launch: W021 unblocks W081

## Source documents to read (after your extract)
- .planning/dwdg-one-prd/UI_UX_IMPLEMENTATION_MAP.md
- .planning/design/system/README.md and system.html
- .planning/ux/UX_FOUNDATIONS.md
- .planning/REFERENCE_DIGEST.md
- PROJECT_REFERENCES/README.md
- .claude/skills/ (design-taste-frontend, minimalist-ui, redesign-existing-projects)

## First session: do this
1. Session 2: after UX2 reports R20 done in REQUESTS.md, delete the handover block at the end of app.js and the British duplicate keys in i18n.js.
2. Record the R22 design calls (PM as design lead, owner may overrule) in the design system README: E1 compact 34 px desktop buttons with 44 px on touch; E5 tablet keeps the sidebar; E6 phone top bar shows undo/redo only; stage label "Canceled"; route slug #/organisation stays.
3. Run the W021 matrix on the other screens (Projects incl. WBS and programs, Operations, Resources, Schedule, Updates, Settings) at 390/768/1440, EN/ID, light/dark; plus 200% zoom and reduced motion on My Work. Fix shell-level issues; send screen-level ones to UX2 through REQUESTS.md.
4. Then start W013: shared form controls, save-state (saving, saved, failed with Retry), dialogs and empty/loading/error/denied states as components in components.css, documented in INTERFACE.md.

## Done when
- W021 matrix: 390/768/1440 px, EN/ID, light/dark reviewed with screenshots; owner approves

## Scope at a glance
- Work packages: W010★, W011★, W012★, W013★, W020★, W021★, W105★ (★ = D1 first-version slice)
- Stories: S009, S085
- Requirements owned: 56; full text in `EXTRACT.md`

## Prompt to paste into the session
```text
You are the UX1 session (Design system, shell and interaction foundations) for DWDG'ONE, working inside the project folder. The project manager (Claude Opus 5.5) wrote your brief; the product owner is Mahdy.

Read, in this order, before doing anything:
1. AGENTS.md (project rules)
2. .planning/workstreams/CONTEXT.md (shared context and owner decisions)
3. .planning/workstreams/README.md (the protocol: ownership, files you may touch, handoff)
4. .planning/workstreams/UX1/BRIEF.md (your mission, connections, first steps)
5. .planning/workstreams/UX1/EXTRACT.md (the full requirements for your scope)
6. The source documents listed in your brief
7. .planning/workstreams/UX1/HANDOFF.md (what earlier UX1 sessions did) and the INTERFACE.md of every stream your brief says you consume

Rules: stay inside your scope. Cite requirement IDs (e.g. work_task_fields, W015, S018) for every behaviour you add; if something is not in the extract or CONTEXT.md, do not build it, add it to .planning/workstreams/REQUESTS.md as a question for the PM. Never edit files owned by another stream. Never change the planning workspace except through planner-cli (actor "UX1 Opus 5.5"), and never mark a card Done: move it to Review with evidence. Do not reset the preserved app, its browser stores or the reference library.

Before you stop: update UX1/INTERFACE.md with anything other streams can rely on, append a dated entry to UX1/HANDOFF.md (what changed with paths, evidence, open questions, next step), and reply with a short summary for the PM.

Start with the 'First session: do this' list in your brief.
```
