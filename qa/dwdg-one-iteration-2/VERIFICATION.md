# DWDG’ONE — Resources and connected Work review

3 October 2026. Local preview evidence for the current iteration; the full PRD UI/UX goal remains incomplete.

## Current implementation

The separate Vite preview now connects Overview / Work / Resources. Resources includes native folders and plain-text notes, HTTPS file/folder/app links, responsible people, contextual details, pin/search, note revisions, folder moves, archive/Undo, link reports and metadata/Markdown export. Related tasks use the same saved task IDs in project Work and the basic My Work page. Work supports create/edit/assignment/dates/priority, completion/reopening/Undo and list/board/date-grouped timeline views. Workspace Changes combines local preview mutations; it is not a trusted production server audit.

Existing product and planning storage remain separate. Preservation tests check their stored bytes. Preview storage keys are `dwdg-one-ui-preview-v1` and `dwdg-one-resources-preview-v1`; no backend provisioning, migration or reseed was performed.

## Automated checks

- Latest `tests.txt`: **158 passed, 0 failed**. Includes isolation, invalid dates/URLs/owners, hierarchy safety, canonical task IDs, atomic storage failures, a 1,000-word note, draft recovery and workspace-safe Undo.
- Latest `build.txt`: production build passed after the final code changes.
- Regressions cover workspace-wide folder browsing, guarded resource draft replacement, link-report drafts, same-task draft reopening, Work keyboard opening/focus restoration and untouched-task draft cleanup.

## Actual browser checks

- Created illustrative Review materials folder and Campaign review notes inside the MarCom welcome campaign. Entered note text survived reload before saving; saved ownership/contributor and revision appeared in the inspector.
- Created Review the campaign notes from that resource. Project Work showed the same linked task, owner and target date. Completion changed the count from 3/7 to 4/7; Undo restored 3/7 and survived reload.
- Workspace-wide Working materials folder now displays exactly its three direct children. Consulting records remained separate when switching workspaces.
- Work filter opens with Arrow Down. Task Escape restores its row focus. Automated checks establish filter Escape restoration; the immediate browser sample was taken during the exit transition and is not a settled filter-focus proof.
- The actual checkbox target is 44×44px. Computed unchecked edge/fill contrast is 4.97:1 in light and 6.82:1 in dark. This is a control-specific check, not an audit of every text/control pair.

## Rendering evidence

The final **32 native captures** cover Work List and project Resources at 1440×900, 1024×900, 390×844 and 320×844, English/Indonesian and light/dark. Every final frame was visually reviewed for locale/theme, dimensions, clipping and overlap. Desktop native captures are 2–3 pixels smaller than the requested viewport because of browser capture bounds; DOM measurements record the requested CSS viewport.

Earlier rapid screenshot batches returned stale compositor frames. Those 32 filenames were overwritten with synchronized native captures. `*-before.jpg` and the completion diagnostic are intermediate evidence, not final acceptance. The latest `*-desktop-audit.jpg` / `*-phone-audit.jpg` contact sheets summarize the corrected captures.

- No horizontal overflow in these 32 configurations. See `resources-geometry.json` and `work-geometry.json`.
- Work ordinary rows at 1024px measure 64px in all four variants; owner/date columns stay aligned.
- Projects recheck at 1440×900: sidebar 216px, toolbar 56px, ordinary rows 76px; four complete ordinary rows and one naturally expanded 84px long-title row fit. See `projects-geometry.json` / `projects-preserved-desktop.jpg`.
- At 320px, Resources shows two complete rows initially; pinned shortcuts and long titles consume vertical space. This is readable but remains a density refinement opportunity.

## WebGL prototype and recording

The project identity uses a small local WebGL shader. The live browser reported `webgl` and one initial draw. Reduced-motion and solid-surface preferences hide the canvas and use the static icon; reduced motion reports zero-duration transitions. These checks are in `optical-checks.json` and the Overview fallback captures. The PRD still classifies `design-shaders` as Deferred P2; this prototype does not approve production enablement or establish battery/GPU/device acceptance.

`resource-work-interaction.mp4` is an approximately 8-second review clip assembled from 11 actual browser frames of folder → note → Work → completion → Undo/reload. Long idle gaps were trimmed; frames were not interpolated. It is interaction evidence, not a frame-accurate motion measurement.

## Still incomplete

These checks do not establish Board/mobile-form visual acceptance, physical touch or software-keyboard behavior, assistive-technology behavior, the full 768/360/zoom matrix, every control’s contrast, live provider access, production authentication/permissions or backend reliability. No external provider links were presented as verified file access.

My Work currently shows workspace demo tasks rather than assignment-aware overdue/today/upcoming/undated groups. Work milestones/dependencies/review/blocker flows, richer Overview, Home, Schedule, Updates, Organization, complete Settings and six specialist division layouts remain incomplete. See the full implementation map; the PRD seed and its decision statuses were not changed.

Recommended next small slice: assignment-aware **My Work**, grouped by due date, opening the same task and original resource, with completion/Undo synchronized to Projects. Home can consume that daily queue in a later iteration.
