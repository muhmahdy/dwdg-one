# DWDG Experience Specification v1.1 — reference-led visual revision

**Status:** approved implementation target; validation is tracked separately.  
**Audience:** DWDG UII members, division leads, and implementers.  
**Phase:** local UI and working workflows. Backend architecture follows a later phase.

**Revision:** approved whole-app redesign, 26 September 2026. This replaces v1.0's visual composition, palette, and title scale. Its local workflow, chart-truth, preservation, accessibility, and interaction contracts continue below. The directory remains `DWDG_Experience_v1.0` to preserve existing links. Previous results in `qa/experience-v1` are historical; the current evidence location is [qa/reference-redesign](../../qa/reference-redesign/VERIFICATION.md).

## 1. Product outcomes

Members should know what needs attention, complete their work, find related files and decisions, and see dependencies without reconstructing the project from chat messages. Leads should inspect delivery and blockers across divisions. The system must feel consistent during ordinary actions: choose a date, inspect a chart, update a task, open a file, return to the same place.

Desktop composition closely follows the supplied CRM and compact task references: a compact sidebar, broad working surface, aligned rows, and contextual detail. Samsung controls mobile grouping, stylized but useful charts, slim progress tracks, and scrolling behavior. Glass distinguishes floating controls. Earlier DWDG, material, dashboard, and typography references remain active. The correction is more useful content, clearer hierarchy, and fewer competing containers across every page in one implementation.

The implementation remains Vite plus vanilla JavaScript. `index.html` loads `experience-boot.mjs`, which runs the `experience-startup.mjs` error boundary before importing `experience.mjs`. Serve through Vite, never `file://`. Shared appearance remains in the experience styles; consolidate components and remove conflicting overrides while refactoring. Preserve domain validation, storage adapters, and prior supporting/backend modules. This is a complete experience refactor rather than a framework migration.

## 2. One workspace, several useful compositions

Use a persistent **216px desktop sidebar**, **56px toolbar**, compact workspace identity, **40px navigation rows**, and a collapsible division group. Navigation includes Home, My tasks, Projects, Schedule, Documents, Updates, Organization, Divisions, and Settings. Global search is reachable from every page. Active navigation, visible heading, and document title agree. Division pages share the shell but use layouts fitted to their work.

At wide sizes use a 12-column grid with a broad working area and a narrower supporting column where useful. Retain the tablet navigation rail and mobile Home / Tasks / Projects / More dock above the safe area. Mobile follows heading, compact summary/chart, records, then supporting information; retain 44px touch targets and full-screen details. Provide a clear return path. The page may scroll; optimize the first viewport for useful records without cramming the entire organization into it.

| Destination | Primary composition | Required actions and linked behavior |
|---|---|---|
| Home | Needs attention first; compact weekly activity; task list; Today agenda in the support column | Complete/open a task, inspect selected-day completions, open deadlines and meetings, create work |
| My tasks | Overdue, Today, Upcoming, Completed groups; consistent checkbox/title/metadata/deadline columns | Search, filter, assign, set priority/date/status, multi-select, bulk update, complete, undo |
| Projects | Compact combined activity/blocker section; grouped project rows by default; Grid and Timeline alternatives | Create/edit projects, preserve filters across views, open project, inspect underlying records from charts |
| Project detail | Main workspace plus inspector; Overview, Tasks, Timeline, Documents, Decisions, Activity | Manage tasks, milestones, blockers, dependencies, evidence, scope decisions and project ownership |
| Schedule | Date controls, calendar/agenda, all-day deadlines and actual-time meetings | Create/edit meeting, inspect task deadline, record notes, create linked follow-up |
| Documents | Compact searchable library and preview inspector; project/division/type filters | Link/upload, download/open, revise, edit metadata, locate linked project or task |
| Updates | Read/unread actionable inbox, due reminders and review requests | Open relevant record, mark read, filter; catch up when returning |
| Organization | Project matrix, ownership, dependency and division filters | Trace cross-division work and export filtered summaries |
| Divisions | Distinct working layouts described below | Create/update records and follow links into shared projects |
| Settings | Grouped preference sections | System/light/dark, English/Indonesian, motion/transparency, reminders, local backup controls |

### First-view composition requirements

- **Projects:** combined activity and blocker summary approximately 200px high on desktop. Use 32px square activity marks with sparse date labels and one selected-date readout; preserve accessible exact values and 44px touch hit areas. Default project groups use 76px ordinary rows with aligned name, owner, completed/total progress, deadline, and overflow action. Show blockers beside the affected project. At 1440 × 900, the first project starts within approximately 450px of the top and four ordinary rows are visible without scrolling. Long labels can expand responsibly and are reviewed separately.
- **Home / My tasks:** actionable work leads. Weekly activity stays compact; Today's agenda supports the main task list. Titles, inline context, restrained chips, due dates, and completion controls share stable alignment. List, board, timeline, and bulk actions remain functional.
- **Project detail:** broad main workspace, narrow ownership/deadline/blocker column; tabs directly above content. Group progress tracks and supporting records instead of scattering small cards.
- **Schedule / Documents / Updates / Organization / Settings:** connected calendar-agenda; compact document library-inspector; actionable chronological updates; readable ownership/project matrix; Samsung-style grouped preference rows, respectively.
- **Six divisions:** retain finance comparisons, consulting delivery lanes, partner stages/follow-ups, publishing cadence, recruitment/onboarding, and strategy dependencies. Shared styling must not flatten them into the same card grid.

## 3. Visual contract

The machine-readable token baseline is [design-tokens.json](design-tokens.json). Central semantic tokens govern all components; adjust the central token definition when a verified implementation choice changes.

### Typography and spacing

- Locally served Pretendard for operational text, with system sans-serif fallback. Keep the DWDG wordmark as identity.
- Desktop page title 24px/32px at weight 600; mobile page title 28px/34px at weight 600; section title 18px/24px at weight 600; desktop body 14px/20px; mobile body 15px/22px; metadata 12px/16px. Smaller text is reserved for optional chart ticks.
- Tabular numerals for chart values, dates, counts, percentages, IDR amounts, and time labels. Prefer normal sentence case for controls.
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px. Desktop page gutter 32px, tablet 24px, mobile 16px. Panel padding 24px desktop and 16px mobile.
- Use 12px control corners, 20px ordinary panels, 28px major grouped surfaces. Inner corners take their inset into account. Capsules identify segmented controls, date selection, and floating navigation.
- Desktop control height 40px. Interactive touch areas and standalone icon buttons are at least 44px. Compact icons are 18–20px with consistent stroke weight and optical alignment.

### Color and materials

Use a neutral mineral canvas, white reading surfaces, charcoal text, and restrained sage identity/selection accents. Sage must not tint nearly every surface. Dark mode uses separately tuned elevated surfaces, borders, text colors, and chart palette. Status colors preserve meaning in both themes and always pair with labels or shapes.

The implementation's centralized palette in `experience.css` is mirrored by the token JSON, including the exact CSS-variable map. Current key colors are:

| Role | Light | Dark |
|---|---|---|
| Canvas | `#F5F6F8` | `#131619` |
| Reading surface | `#FFFFFF` | `#1C2024` |
| Quiet inset surface | `#EEF1F4` | `#252B31` |
| Main text | `#171A1F` | `#F3F5F7` |
| Secondary text | `#606874` | `#ACB4BD` |
| DWDG accent | `#58703F` | `#BFD696` |
| Activity blue | `#3478F6` | `#71A5FF` |

These shared values do not by themselves establish contrast acceptance. Check the actual text size, background, state, and chart mark in rendered light/dark views, then change central tokens and this baseline together if correction is required.

The approved light activity blue is a chart/selection accent: its contrast against white is approximately 4.07:1. Use the main text color for normal-size labels and exact values; do not assume white text on that blue is an accessible ordinary button. Primary/secondary text and the DWDG accent have stronger contrast on the white reading surface. Verify final opacity and background combinations in the rendered UI.

Use three surface roles:

1. **Reading surface:** stable, sufficiently opaque panels for text, tables, and chart plots; quiet borders and little shadow.
2. **Tactile control:** subtle top highlight, shallow depth, and pressed compression for important controls. Routine fields use simpler treatment.
3. **Floating glass:** translucent tint, blur, fine rim, and soft elevation on floating filters, menus, navigation, and overlays. Inspector reading areas remain opaque enough for sustained work. Keep dense chart marks and text readable.

Provide deliberate solid surfaces when transparency is disabled or unavailable. Prism-like highlights are localized identity accents, not moving backgrounds behind work. Do not use oversized decorative statistics, quote cards, or fictional health scores.

### Compact rows and grouped surfaces

Task rows align checkbox, title, associated person/project/category, and deadline consistently. Primary title remains the clearest element. Inline links, avatars, restrained chips, and right-aligned due labels reproduce the task references. At narrow widths retain the title and deadline; move secondary metadata to one subordinate line instead of causing horizontal overflow. Full titles remain available in the inspector and accessible name.

Place related content in one reading surface with internal separators. Quiet section captions may sit outside mobile groups, following Device Care. Remove unnecessary folder tiles, decorative eyebrows, repeated descriptions, card shadows, and nested containers. Do not use equal-sized cards for unrelated information solely to fill a grid. Desktop reading panels use 20px corners; major mobile groups use 28px.

## 4. Chart and date-selection contract

Every visualization has a visible title, unit, meaningful legend where needed, readable value list, empty/missing-data state, and underlying records. Marks support mouse hover, keyboard focus, and touch selection. Selection must be apparent without color alone. Selecting a chart mark opens or filters the same local records that generate it.

Chart components accept controlled `data`, `selectedDate`, `onSelect`, and explicit updates. The page owns the selected date and feeds it to the capsule control, chart, and detail list. Preserve selection through viewport changes and route return. Do not reconstruct the entire application to change a date.

### Weekly completed-task activity

- Use narrow rounded columns, faint alternating day bands, controlled blue/green gradients, a dashed comparison line, and a small edge label inspired by Samsung Battery activity.
- Quantity is **currently completed tasks by recorded completion date**, never hours, productivity, or a historical ledger. Completion dates must be genuine record values; legacy completed records with no date are undated and excluded from date bars.
- The recorded interval begins when observation is known. Known days with zero completions count as zero; dates before observation are unavailable, not zero.
- Average = sum of counts on completed observed calendar days / number of those days. Exclude today and future days; today is visibly partial. If no eligible day exists, display unavailable instead of dividing by zero.
- Reopening or deleting a task changes the current-record totals. Describe this in chart help. Finishing a task sets its actual local completion timestamp; Undo restores the record and its previous completion fields.
- A selected bar updates the selected-date capsule, exact count, and completed-task list. Keep the y-axis stable within the selected comparison period so comparisons stay legible.

### Selected-day detail

Completed tasks appear as a linked list. Meetings use actual start times and durations. Tasks and milestones that only have a date belong in an all-day section. Never manufacture an hour from a date-only deadline. Only actual timed records may use hourly bands or a time marker.

### Project progress

Reproduce Device Care's slim rounded tracks and opposing labels: completed tasks / all tasks on the left, percentage on the right. Compute from the same task records shown below. Empty project = “No tasks yet,” not a fabricated success state. Surface blockers separately with severity, owner, and required action. Do not collapse them into an unsupported health score.

### Distinct division and portfolio charts

| Area | Composition | Semantic rule and action |
|---|---|---|
| Portfolio | 32px square-cell activity plot and narrow blocker breakdown inside one compact section | Recorded activity/counts only; sparse dates and one selected-date readout; select day/project/severity to see underlying work |
| Finance | Aligned horizontal allocation, committed, paid tracks with exact IDR values; requests adjacent | Values and basis visibly labeled; no stacked double-counting of committed and paid amounts |
| Consulting | Delivery lanes with milestone and review markers | Markers correspond to saved milestones/checklists; open their records |
| External Engagement | Stage distribution beside dated follow-ups | Counts of partners at each stage; select stage to filter partners |
| Marketing | Publishing cadence plus content-stage counts | Scheduled dates and actual statuses; no claimed engagement without recorded metrics |
| HR | Recruitment stage counts and onboarding checklist progress | Show counts; do not infer conversion or employee performance |
| Strategy | Now / Next / Later initiative horizon with dependency connections | Horizon is explicit planning state; links identify saved dependencies |

### Sticky control behavior

Reserve the date/filter control's original layout space. When its original position leaves view, present a compact glass capsule with the same selection and controls. Do not cover focused controls, interactive chart marks, content headings, or mobile safe areas. Use a stable threshold/hysteresis so slight scroll changes do not repeatedly replay the transition. The compact form remains keyboard reachable and its labels match the expanded form.

## 5. Local workflows

All actions validate, persist locally, confirm success truthfully, and expose recoverable errors. New records share stable IDs so project/task/calendar/document links stay intact.

| Workflow | Minimum local working journey |
|---|---|
| Projects and tasks | Create project → assign owner/division → create dated task → assign person → edit/move list or board status → complete with optional evidence → update progress and activity → Undo |
| Delivery | Add milestone → link tasks/dependencies → record blocker with owner/severity/action → resolve blocker → record decision and scope notes → review delivery |
| Documents | Add file/link and metadata → associate project/task/division → preview/open → add revision → inspect revision history → retrieve original attachment |
| Meetings | Create actual-time meeting → write agenda/minutes → link decision → create linked follow-up task → surface on Schedule |
| Consulting | Assign PL/PM → define milestones/review checklist → record scope change/review notes → resolve required items → update readiness using saved checklist state |
| External Engagement | Create partner/contact → set stage/owner → log interaction → schedule follow-up → link project → complete follow-up |
| Legal | Create document request → review → request/record revision → track signature status → register provisional local document number → connect to finance handoff |
| Finance | Set project allocation → create request → record approval/rejection → record paid status/amount → reconcile local budget display |
| Marketing | Create campaign/content/IT work → assign executor and deadline → attach asset/evidence → review → update scheduled/completed state |
| HR | Create recruitment/onboarding/development record → move explicit stage → assign owner → update checklist and linked work |
| Strategy | Create initiative/research link → assign horizon → record decision → connect cross-division dependencies → update work |
| Reminder | Save due date/follow-up → show in-app reminder while open → on reopening surface outstanding due work without duplicating reminders |
| Reporting | Filter records → inspect scope and counts → export CSV or use print layout reflecting the selected filters |

Legal stages and local numbering are working local aids, not assertions about DWDG's officially adopted SOP. Local approval/signature/payment states represent recorded status; they do not perform external transactions or signatures. Local reminder handling cannot send while the app is closed. Email, WhatsApp, cloud file delivery, actual electronic signatures, external publishing, and multi-user enforcement are future integrations.

### Preservation and local storage

Retain `dwdg-workspace-v1`, `dwdg-division-preview-v03`, and `dwdg-project-extras-v1`. Extend additively using versioned extension state as needed. Keep stable IDs and existing domain validation. Do not silently replace saved records with examples. Clearly identify illustrative first-run records and support an empty workspace.

Store attachment blobs in IndexedDB and metadata in persistent local state. Handle quota, transaction, serialization, and missing-file errors visibly. A failed save must not produce a success toast or remove an item. Make the scope of any backup/export explicit; a record-only export cannot promise to include attachment blobs.

No production database schema or server API changes belong to this phase. Preserved Supabase/backend code is not evidence of a verified shared system.

## 6. Overlay, form, and motion system

Use one shared overlay controller with placement, collision handling, focus lifecycle, and Escape handling. Keep one clear topmost interactive layer. Restore focus to the opener when possible; when the opener was removed choose the next logical item. Retain unsaved drafts during harmless outside actions. Destructive dismissal requires an explicit decision when it would discard work.

| Interaction | Desktop | Mobile |
|---|---|---|
| Status, owner, priority, date, filter, overflow | Anchored at opener, 8px gap; flip/shift at viewport edges | Anchored when practical; short choices use bottom sheet |
| Task/document/person/partner detail | Right inspector; preserve background context | Full-screen detail sheet with visible back/close |
| Ordinary create/edit | Contextual inspector/form | Full-screen form; keyboard must not hide active input or save |
| Destructive confirmation | Centered dialog, explicit item/action wording | Centered accessible dialog |
| Search | Upper-center command palette | Full-screen search |
| Bulk actions | Float at bottom of active working list | Above dock and safe area |
| Toast / Undo | Bottom-end, unobtrusive | Above dock and keyboard-safe area |
| Chart exact values | Near selected mark; contained in viewport | Tap/focus selected mark and show exact values without hover dependency |

Shared duration tokens: press/hover 120–140ms, anchored menu 180–220ms, inspectors/sheets 260–320ms, route content 180ms, chart updates 240ms, dissolve 220ms. Use ease-out for entry, shorter ease-in for exit, and avoid overshoot on dense working surfaces. No staggered page entrance may delay access to records. Screenshot evidence must be captured after transitions settle.

For removal/completion: validate and commit first; then fade, apply at most 4px blur and a small scale reduction, and close the layout gap. Undo preserves the record identity, original location where possible, links, and earlier completion fields. Rapid repeated actions must not double-save or lose undo state. Failed saves leave the row intact. Reduced motion removes spatial/blur effects and uses immediate updates or a short fade. Keep the application shell mounted during navigation; use restrained content crossfades.

## 7. Themes, language, and accessibility

Default theme follows the system; user light/dark choice persists. Default language remains English; Bahasa Indonesia is available from the same Settings location. Use translation keys for navigation, forms, validation, empty states, charts, tooltips, ARIA labels, and dialogs. Preserve user-entered text. Dates, decimal formatting, and IDR values use the chosen interface locale.

Keyboard users can reach all actions and chart values. Use visible focus rings, semantic controls, labels, `aria-expanded` where relevant, and correct dialog/menu behavior. Avoid color-only status and hover-only information. Verify text contrast, 200% zoom, long Indonesian labels, 360px widths, mobile keyboard obstruction, and reduced-motion/solid-surface settings.

## 8. Completion evidence

[ACCEPTANCE.md](ACCEPTANCE.md) is the handoff checklist. Deliver the complete app revision in one implementation, without an intermediate approval checkpoint. Requirements are not complete merely because a feature appears in this document or a screenshot. Record executed tests, reference comparisons, settled screenshots, interaction recordings, and known gaps in [the current verification record](../../qa/reference-redesign/VERIFICATION.md). Earlier v0.3 and v1.0 reports are historical context only. Browser access failures must be reported accurately even if testing was authorized; do not replace actual rendering/interaction checks with passing build claims.
