# DWDG UII Workspace

DWDG Workspace is an internal work system for projects, tasks, schedules, documents, decisions, blockers, and six division workflows. The active v1.1 visual revision follows the supplied compact CRM/task references on desktop and Samsung's grouped surfaces, useful charts, and scrolling patterns on mobile. Neutral reading surfaces, aligned records, contextual inspectors, selective glass, and consistent motion keep the work clear.

This phase focuses on a working **local application**. Changes stay in this browser. Backend architecture, cloud synchronization, external reminders, real signatures, and multi-user enforcement are deferred. Preserved backend modules are available for later work; their presence is not a claim that the new experience is connected to a verified shared service.

## Run locally

From this directory in PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local address shown by Vite. No cloud configuration is required for the local experience.

Do not open `index.html` through `file://`: browser module loading requires the local server. The usual address is `http://127.0.0.1:5173/`. Direct-file opening now displays a link to that preview instead of an empty shell. `experience-boot.mjs` starts the application through `experience-startup.mjs`, which reports startup failures without clearing saved records.

```powershell
npm.cmd test
npm.cmd run build
```

## Active specification

Every implementation agent must start with [READ_FIRST](READ%20THIS%20IMPORTANT%20FOR%20EVERY%20AI/DWDG_Experience_v1.0/READ_FIRST.md). The pack contains:

- [Experience Specification](READ%20THIS%20IMPORTANT%20FOR%20EVERY%20AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md): page composition, local journeys, chart semantics, popups, motion, themes, and localization.
- [Reference atlas](READ%20THIS%20IMPORTANT%20FOR%20EVERY%20AI/DWDG_Experience_v1.0/REFERENCE_ATLAS.md): preserved Samsung, compact task, CRM, chart, brand, and material references with concrete acceptance targets.
- [Design tokens](READ%20THIS%20IMPORTANT%20FOR%20EVERY%20AI/DWDG_Experience_v1.0/design-tokens.json): shared visual baseline.
- [Survey traceability](READ%20THIS%20IMPORTANT%20FOR%20EVERY%20AI/DWDG_Experience_v1.0/SURVEY_TRACEABILITY.md): feature priorities, local requirements, and deferred integrations.
- [Acceptance contract](READ%20THIS%20IMPORTANT%20FOR%20EVERY%20AI/DWDG_Experience_v1.0/ACCEPTANCE.md): required tests and visual/interaction evidence.

The specification is the delivery target. The directory retains its v1.0 name to preserve links; its active content is v1.1. Consult [the current verification report](qa/reference-redesign/VERIFICATION.md) and [reference comparisons](qa/reference-redesign/REFERENCE_COMPARISON.md) for actual checks and known gaps. Do not infer acceptance from this README. Earlier v0.3 and `qa/experience-v1` reports describe previous revisions. GSD execution records are in [.planning](.planning/PROJECT.md).

## Application structure

The project remains Vite and vanilla JavaScript. `experience-boot.mjs` uses the startup boundary before loading `experience.mjs`, with the experience styles for the shared visual system. Existing `model.mjs`, `division-workspaces.mjs`, and `project-extras.mjs` contain useful domain and compatibility behavior. Earlier `workspace.mjs`, other legacy UI files, and `shared-backend.mjs` are preserved for compatibility and reference.

The main destinations are Home, My tasks, Projects, Schedule, Documents, Updates, Organization, Divisions, and Settings. Six division experiences live within one shell: Strategy & Growth; Legal & Finance; Human Resource; Marketing, Communication & IT; External Engagement; and Consulting.

Light/dark themes and English/Bahasa Indonesia belong to the shared experience. User-entered text is preserved when the interface language changes. Charts must derive from saved records and explain unknown history instead of inventing past activity.

## Existing local records

The original local stores are preserved:

- `dwdg-workspace-v1`: projects, tasks, meetings/events, people, and settings.
- `dwdg-division-preview-v03`: division working records.
- `dwdg-project-extras-v1`: project-level supporting records.

New local features may use versioned extension state and IndexedDB attachment storage. These are browser-local records, not a cloud backup. Export controls must state their scope, especially whether binary attachments are included. Illustrative first-run records must never replace existing saved work.

A pre-overhaul source snapshot is preserved in `backups/ui-before-v1-20260926-175454`. The old v0.3 instruction pack and all its references are retained but marked superseded. The new pack also preserves the 13 original video-related screenshots and four Samsung screenshots.

## Preserved backend material

The existing [Supabase setup](supabase/README.md), migrations, backend client, and policy tests remain available as historical/future integration material. They are not part of the UI-first acceptance claim. A later backend phase must independently verify authentication, permissions, realtime updates, cloud files, external reminders, and shared workflows.

The [video notes](notes/ui-video-notes.md) are based on previously retrieved chapter metadata and supplied screenshots. Full playback/narration remains unverified; the reference atlas states that limitation explicitly.
