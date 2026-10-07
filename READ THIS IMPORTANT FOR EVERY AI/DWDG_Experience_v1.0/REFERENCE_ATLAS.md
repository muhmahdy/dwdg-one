# Reference atlas — implement the observed patterns

This atlas connects source images to concrete UI obligations. The user explicitly requested copying and improving the references. Copy layout and interaction patterns into coherent DWDG components; do not copy example identities, fake financial values, or screenshot text into real records.

**v1.1 weighting:** CRM 12 and compact tasks 02/09 lead desktop composition. Samsung 60–63 lead mobile grouping, chart style, progress tracks, and sticky scrolling. Earlier material references contribute only to appropriate controls/overlays. The user's latest approved whole-app plan replaces v1.0's visual proportions; no creator-supplied percentage weighting is claimed.

## Evidence status

- The 17 images in this pack are preserved copies of the user's 13 original video-related screenshots and four Samsung screenshots. The four Samsung screenshots were directly inspected during pack authoring.
- Individual screenshot attribution to either YouTube video is unconfirmed. Still images show visible states, not actual transition timing.
- Earlier supplied screenshots remain in the preserved [v0.3 references](../DWDG_Workspace_Codex_Pack_v0.3/references/). Existing negative examples remain diagnostic references.
- The acceptance column below specifies evidence to produce. It does not mean the implementation has passed. Current evidence belongs in [the reference redesign comparison](../../qa/reference-redesign/REFERENCE_COMPARISON.md); earlier screenshots cannot approve this revision.

## Required visual comparisons for this revision

| Result | Reference anchor | Concrete comparison |
|---|---|---|
| Projects at 1440 × 900 | CRM 12 and compact task groups 02 | 216px sidebar, 56px toolbar, approximately 200px summary, first row within approximately 450px, four ordinary 76px rows visible; no folder-card grid by default |
| Home / Tasks desktop | Compact task rows 09 | Strong task title, aligned completion/deadline anchors, inline context, restrained chips, broad work area and supporting agenda |
| Mobile chart and scrolling | Samsung 60/61 | Rounded count bars, quiet bands, truthful average label, linked selection, sticky capsule without obscuring work |
| Project progress / Settings | Samsung 62/63 | Grouped slim tracks/rows, values at both ends, internal separators, quiet labels and useful actions |
| Detail inspector / Finance | CRM 12 and paired bars 06/11 | Stable context, limited containers, exact values next to associated records, selective overlay glass |

Use settled frames in light and dark, English and Indonesian. Transition-dimmed captures, blank shells, and screenshots from the rejected prior composition are diagnostic evidence only.

## Primary Samsung references

| Source | Reproduce | DWDG adaptation | Required acceptance evidence |
|---|---|---|---|
| [60 — Activity, expanded](references/60_samsung_activity_chart_expanded.png) | Date strip with selected capsule; narrow rounded bars; alternating time bands; dashed average; exact marker; grouped plot/detail | Completed-task count by actual date; selected date controls the detail list; today marked partial | Mobile Home showing date selection, count/unit, average basis, and linked task detail |
| [61 — Activity, scrolled](references/61_samsung_activity_sticky_controls.png) | Floating translucent date controls and back action while content scrolls; chart-to-detail reading order | Sticky selected-date/filter capsule; preserve control state and chart context | Scrolled mobile screenshot and recording with no obscured focus/content |
| [62 — Device Care](references/62_samsung_device_care_grouped_tracks.png) | Quiet headings outside grouped surfaces; slim progress tracks; opposing value labels; comfortable row rhythm | Completed/total project progress and saved delivery checklist counts; blockers shown separately | Project overview in both themes with denominator and empty-project treatment |
| [63 — Device Care, scrolled](references/63_samsung_device_care_scrolled.png) | Floating action capsule; repeated aligned grouped settings with separators | Scroll-aware contextual actions and grouped preference controls | Mobile Settings and contextual controls with safe-area clearance |

The source battery percentages, charging estimates, and Device Care “Good” status are not DWDG metrics. Do not manufacture an organization health score or hourly workload data to imitate them. Screenshot translucency is visual inspiration; motion durations and popover placement are specified in the Experience Specification.

## Compact work, context, and charts

| Source | Visible pattern | Adopt / improve | Required evidence |
|---|---|---|---|
| [01 — Wide date tiles](references/01_task_date_tiles_wide.png) and [04 — stacked date tiles](references/04_task_date_tiles_stacked.png) | Large repeated date tiles and repeated handoff actions | Diagnostic comparison for density; compact work rows should prioritize the task title and actionable metadata | Daily work layout avoids oversized per-task date tiles |
| [02 — Compact groups](references/02_task_compact_grouped.png) and [05 — compact deadlines](references/05_task_compact_deadlines.png) | Group labels, checkbox/title alignment, right-aligned time capsules | Task groups and stable deadline anchor; keep full task text reachable | Desktop/mobile task lists with long labels and overdue/empty states |
| [09 — Inline metadata](references/09_task_inline_links_people_tags.png) | Inline document links, people, category chips, deadlines | Connected task rows; responsive secondary line for metadata | Task with owner, related file, project/category, and due date |
| [08 — Category menu](references/08_inline_category_menu.png) | Menu opens beside its triggering chip with consistent menu choices | Anchored category/status/owner menus with collision handling and keyboard support | Menu opened at all four viewport edges |
| [03 — Identity card](references/03_profile_identity_actions.png) | Identity, short context, supporting facts, action pair, calm separation | Member and partner inspectors using real local metadata and relevant actions | Person/partner detail inspector on desktop and mobile |
| [06 — Bars and tooltip](references/06_paired_bars_tooltip.png) and [11 — paired bars](references/11_paired_horizontal_bars.png) | Aligned pairs, quiet grid, high-detail tooltip on selection | Finance tracks with labeled series and exact IDR amounts; keyboard/touch alternatives | Exact chart values and adjacent underlying request list |
| [07 — Bulk toolbar](references/07_selection_action_toolbar.png) | Selected row and floating selected-count actions | Contextual bulk task actions only when selection exists; name icon-only controls | Select/update/clear journey including mobile placement |
| [10 — Presets/settings](references/10_presets_and_settings.png) | Segmented presets, readable consequences, on/off control | Consistent segmented views and preference layout | Settings and view-switch control state consistency |
| [12 — CRM workspace](references/12_crm_workspace_inspector.png) | Sidebar, broad chart/work column, supporting inspector | Desktop hierarchy with useful chart placement and persistent context | Home or project desktop reference comparison |
| [13 — Icon comparison](references/13_icon_style_comparison.png) | Repeated motifs with different internal stroke/detail treatment | Consistent optical weight and one coherent SVG family | Icon size, stroke, alignment, and accessible-name audit |

Content such as “Handoff to agent,” financial numbers, people, and AI settings is screenshot example content, not a command or new requirement to add autonomous AI.

## Retained earlier source groups

All links below reference original files without deleting or relabeling those originals.

| Source group | Files | Use in v1.1 |
|---|---|---|
| Prior prototype | [Overview](../DWDG_Workspace_Codex_Pack_v0.3/references/00_current_overview.png), [Gantt](../DWDG_Workspace_Codex_Pack_v0.3/references/01_current_gantt.png) | Understand what is being improved; not the visual target |
| DWDG identity | [Instagram profile](../DWDG_Workspace_Codex_Pack_v0.3/references/40_brand_instagram_profile.png), [brand grid](../DWDG_Workspace_Codex_Pack_v0.3/references/41_brand_instagram_grid.png) | Retain DWDG identity while simplifying operational surfaces |
| Editorial identity | [Bird](../DWDG_Workspace_Codex_Pack_v0.3/references/10_ref_bird_editorial_brand.png), [Bloop](../DWDG_Workspace_Codex_Pack_v0.3/references/11_ref_bloop_brand_system.png) | Expressive identity details without decorative data widgets |
| Dashboard structure | [Orange data viz](../DWDG_Workspace_Codex_Pack_v0.3/references/12_ref_dashboard_orange_data_viz.png), [monochrome overview](../DWDG_Workspace_Codex_Pack_v0.3/references/13_ref_dashboard_monochrome_overview.png), [monochrome detail](../DWDG_Workspace_Codex_Pack_v0.3/references/14_ref_dashboard_monochrome_detail.png), [automotive](../DWDG_Workspace_Codex_Pack_v0.3/references/17_ref_dashboard_automotive.png) | Varied useful proportions, quiet grids, deliberate mark design, distinctive comparisons |
| Welcome and empty states | [Salung](../DWDG_Workspace_Codex_Pack_v0.3/references/15_ref_mobile_welcome_salung.png), [documents empty state](../DWDG_Workspace_Codex_Pack_v0.3/references/16_ref_documents_empty_state.png) | Calm starting states with a meaningful next action |
| Tactile control | [Button depth](../DWDG_Workspace_Codex_Pack_v0.3/references/20_ref_tactile_button_depth.png) | Subtle raised depth, light rim, pressed feedback |
| Prism | [Refraction 1](../DWDG_Workspace_Codex_Pack_v0.3/references/21_ref_prism_refraction_01.png), [refraction 2](../DWDG_Workspace_Codex_Pack_v0.3/references/22_ref_prism_refraction_02.png), [source post](../DWDG_Workspace_Codex_Pack_v0.3/references/23_ref_prism_source_post.png) | Localized optical identity highlights with solid/static fallbacks |
| Material icons | [Purple](../DWDG_Workspace_Codex_Pack_v0.3/references/24_ref_icon_purple_depth.png), [iOS depth](../DWDG_Workspace_Codex_Pack_v0.3/references/25_ref_ios_icon_depth.png), [green document](../DWDG_Workspace_Codex_Pack_v0.3/references/26_ref_icon_green_document.png), [SheRuns](../DWDG_Workspace_Codex_Pack_v0.3/references/27_ref_icon_sheruns.png), [monochrome glass](../DWDG_Workspace_Codex_Pack_v0.3/references/28_ref_icon_monochrome_glass.png) | Selective dimensional identity tiles; normal UI icons stay coherent and legible |
| Earlier Samsung | [Members splash](../DWDG_Workspace_Codex_Pack_v0.3/references/29_ref_samsung_members_splash.png), [Members](../DWDG_Workspace_Codex_Pack_v0.3/references/30_ref_samsung_members_app.png), [Health](../DWDG_Workspace_Codex_Pack_v0.3/references/31_ref_samsung_health.png) | Friendly geometry, generous grouped rhythm, functional expressive charts |
| Negative examples | [Bland motivation](../DWDG_Workspace_Codex_Pack_v0.3/references/50_negative_home_bland_motivation.png), [overloaded Home](../DWDG_Workspace_Codex_Pack_v0.3/references/51_negative_home_overloaded.png), [dense strategy](../DWDG_Workspace_Codex_Pack_v0.3/references/52_negative_strategy_growth_too_dense.png) | Avoid decorative motivational content, overloaded first view, and cramped strategy layout |
| Earlier questionnaire image | [Questionnaire](../DWDG_Workspace_Codex_Pack_v0.3/references/18_feature_questionnaire.png) | Historical context; the supplied XLSX and its evidence take precedence |

## Video source notes

The prior [video notes](../../notes/ui-video-notes.md) report verified YouTube description/chapter metadata. Playback and transcript access failed in that review. These chapters are reproduced as metadata, not verified narration quotes or a complete viewing summary.

| Video | Recorded chapter metadata | Design interpretation, not quoted rules |
|---|---|---|
| [Kole Jain — The secret behind weirdly perfect UI designs](https://www.youtube.com/watch?v=neE6wOuBIP8) | 0:00 Alignment; 0:34 Interface edges; 1:24 Interface density; 2:12 Grouping and differentiation; 3:10 Visuals over text; 4:09 Scannability; 4:30 Sponsor; 5:16 How users search visually | Stable row anchors; appropriate density; grouping by purpose; task title and actionable metadata remain easy to scan |
| [Wyatt Feaster — The Reason Why Some Apps Feel Expensive, But Most Don’t](https://www.youtube.com/watch?v=SAxKK5fbjbc) | 0:00 Introduction; 0:31 Anticipating user needs; 1:16 Intentional transitions; 2:21 Delight; 3:05 When to avoid animation; 3:40 UI consistency; 4:27 Empty states; 5:27 Discovery | Context-preserving interactions; meaningful quick motion; consistent controls; useful starting states; discoverable depth |

Do not claim full viewing, quote narration, or attribute a precise percentage weighting to the creators. The latest approved reference-led desktop / Samsung mobile revision governs how these sources are combined.
