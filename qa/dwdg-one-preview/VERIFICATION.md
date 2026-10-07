# DWDG’ONE — Shell + Projects preview verification

3 October 2026. **Functional checks and final browser inspection completed. Visual direction remains open for the user’s review.** This report covers the isolated local design preview, not the complete PRD or production readiness.

## Scope and preservation

The preview contains one shared shell, a searchable selector for the six current division workspaces, grouped Projects, project detail, and project creation/metadata editing. Other destinations disclose their later-iteration status. Illustrative people, projects, tasks and blockers are labeled demo data; the administrator view is a demonstration, not authentication or permission enforcement.

The only preview storage key is `dwdg-one-ui-preview-v1`. Product stores, attachments, the existing application and the PRD seed/browser revisions remain separate. Tests verify product-store bytes remain unchanged. No data reset, product migration or unseen PRD-edit merge is performed. The authored PRD remains draft 0.2; no newer exported user revision was found.

The latest user constraints for this correction are one theme button, custom dropdowns for every preview selection control, a minimized unobtrusive scrollbar, closer tactile controls, and no decorative quotes. They override earlier visual choices. Other pages remain deferred.

## Observed checks and remaining evidence

| Check | Evidence / outcome |
|---|---|
| Full automated suite | **122 passed, 0 failed, 0 skipped**, recorded in [tests.log](tests.log). Includes 17 preview data checks and 15 preview controller checks. |
| Build | Final [build.log](build.log): **passed**, 25 modules, after the last controller, fixture and visual changes. |
| Isolated saved data | Passed: six-workspace scope, stable IDs, no product-store reads/writes, reload persistence, task-derived progress and truthful zero-task/missing-date states. |
| Create/edit/Undo | Passed in executed data/controller checks: title/date/lead validation, retained lifecycle and links, atomic save/draft clearing, workspace-scoped Undo and restored saved records. |
| Drafts and errors | Passed: retained forms across context/reload, deliberate Cancel/discard removal, unavailable/quota storage, protected corrupt bytes, concurrency conflicts, and no false save success. |
| Custom menus and theme | Controller checks passed: no native select controls, one theme switch, option selection, arrows/Home/End/typeahead/Escape, focus return and listbox relationships. Motion/solid preferences remain available in Settings. |
| Actual browser menu | Actual browser: **Active → count 1**, Arya lead → **3**, All → **6**; native Enter/Space activation and Escape/focus return worked. Nadia form choice + title survived reload; saving and Undo restored 6 projects. Mobile Finance showed **2**, returned focus to the navigation button, and Consulting restored **6**. The 320px stage menu flipped above its trigger and stayed within the viewport; the 390px form-lead menu fit from x16 to374. |
| Final rendering and motion | Inspected actual corrected desktop/mobile rendering. Desktop rail measured **3px**, mobile **0px** while scrolling remained available. Theme/menus/inspector captured during real interaction. Reduced motion returned inspector animation **none** and transitions **0s**; solid menus returned opaque white with backdrop blur **none**. All 24 measured text/control samples met **4.5:1** (minimum **4.91:1**), testing every gradient stop for button labels. See [contrast-results.json](contrast-results.json) and [accessibility-checks.json](accessibility-checks.json). |

The **16 final settled screenshots** cover 1440×900, 1024×900, 390×844 and 320×740 in English/Indonesian and light/dark. All 16 had **zero horizontal overflow**. At 1440×900, sidebar width is **216px**, toolbar **56px**, ordinary rows **76px**, and **four complete ordinary rows** fit alongside the expanding long-title row. Phone controls meet 44px hit areas; desktop text-row actions use 24px minimum and expand to 44px for coarse pointers. Geometry is saved in [geometry.json](geometry.json).

[Revised controls](revised-preview.jpg), [narrow-phone menu](menu-320-id-dark.jpg), [mobile form](mobile-form-en-light.jpg), and [all responsive views](responsive-contact-sheet.jpg) are saved for comparison. Earlier `desktop-en-light.jpg`, `mobile-form-id-dark.jpg` and `walkthrough-frames/` are historical diagnostics, not the final visual baseline.

[Interaction recording](interactions.mp4) is **13.2 seconds**, captured from **184 actual browser frames** with original capture timestamps. It shows the theme switch, stage menu/filtering, Finance/Consulting switching and inspector opening/return. Capture averages about 14 frames/second; the MP4 repeats frames at 30fps, with no synthetic interpolation. The encoded file decoded successfully. This records the implemented motion; static references cannot establish exact source animation timing.

Physical phone/onscreen-keyboard behavior, assistive technologies, browser 200% zoom and every extreme viewport-corner combination remain unverified. These limits do not imply product security, backend or complete PRD acceptance.

## Actual reference anchors

| Reference | Pattern to reproduce in this slice |
|---|---|
| [12 — CRM workspace](<../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/references/12_crm_workspace_inspector.png>) | Compact sidebar, broad aligned work area, calm separators and stable right-side context. |
| [02 — Compact groups](<../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/references/02_task_compact_grouped.png>) | Quiet grouped rows, clear titles and stable right-side metadata anchors. |
| [08 — Inline menu](<../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/references/08_inline_category_menu.png>) | Custom choice surface positioned near its trigger, coherent rows and a clear selected state. |
| [62 — Device Care](<../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/references/62_samsung_device_care_grouped_tracks.png>) | Slim progress tracks, opposing exact values and readable mobile grouping. Example battery/health labels are not DWDG metrics. |
| [20 — Tactile button](<../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Workspace_Codex_Pack_v0.3/references/20_ref_tactile_button_depth.png>) and the supplied blue button/calendar capsule | Raised curvature, a light rim, shallow depth and a deliberate pressed response on selected controls. Routine reading surfaces remain quiet. |

The [reference atlas](<../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/REFERENCE_ATLAS.md>) identifies the retained sources. Static images support appearance and composition; they do not establish exact animation timing. The supplied video is motion reference material, not permission to invent product actions or copy screenshot content into real records.

## Boundary and next iteration

Production workspace Changes, authentication, backend, domain/shared-Drive ownership, service provisioning, billing and cloud recovery are outside this preview. No actual service account, deployment, payment, signature or external message is claimed.

After the user reviews this visual direction, the next small slice should be **Project Work**: one task list and contextual task detail using the same shell and project identity. This report does not authorize or implement that slice.
