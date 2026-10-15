# UI inventory

What the user sees in the migration source (`frontend/prototype/`), grounded in its source and the baseline screenshots taken on 15 Oct 2026. The React app must reproduce every item here. Visual references: `qa/refactor-baseline/desktop/*.png` (1440×900) and `qa/refactor-baseline/mobile/*.png` (390×844). Each folder holds 42 page captures plus `work-dark`, `work-compact`, `work-simple` and `work-id`, 92 images in total, captured by `scripts/qa/capture-screens.mjs` signed in as Mahdy (SnG Director, Admin) with Release preview on.

## 1. Page skeleton

`index.html`: `<html lang data-theme>`, `<body class="ds" data-look data-density>`, skip link "Skip to content" → `#main`, `#app` (shell and page), `#layer` (menus, palette, composer, quick-add card), `#toast` (`role="status"`, `aria-live="polite"`). The title is "dwdg’ONE prototype" and the favicon is `.planning/brand/dwdg-one-mark.svg`. Fonts are Geist 400/500/600/700 and Geist Mono 400/500/600.

## 2. Layouts (three looks, chosen per device in the account menu and in Settings)

| Look | Default | Desktop | Phone (≤ 800px) | Source |
|---|---|---|---|---|
| Comfortable | yes (D57) | Sidebar on the canvas: wordmark, workspace switcher (when the person sees more than one division), Search (Ctrl K), My Work, Schedule, Updates; a "Work" heading with Programs, Projects, Operations and Resources; "Pinned" (up to 8); a collapsible workspace-tools group (Changes and division capabilities); account button at the bottom. The page sits in a white sheet, and the inspector docks beside it in a second sheet. Top bar: breadcrumb, history buttons (back, forward, undo, redo), black "New" button. | Page title with quiet search and bell buttons; a floating pill tab bar (My Work, Projects, Schedule, More) and a separate round black + button; the inspector opens as a bottom sheet with a scrim | `screens/calm-shell.js`, `core/calm.css`, `core/friendly.css`, `core/comfortable.gen.css` |
| Compact | no | Original dense sidebar: brand, My Work, Updates, Schedule, workspace group, Projects, a "More tools" disclosure (closed by default below Co-Director, D54); top bar with breadcrumb, history, search field, "New" | Tab bar: My Work, Projects, centred New, Schedule, More | `core/app.js` `shell()`, `core/app.css`, `core/screens.css` |
| Simple | no | Top bar only; nine pages (`work`, `projects`, `schedule`, `settings`, `updates`, `operations`, `programs`, `attention`, `performance`); bigger text; simplified My Work and Projects pages | Same, with simple menus (`snew`, `sbell`, `sme`) | `screens/simple.js`, `core/simple.css` |

Themes: light (default, D52), dark (re-tuned charcoal palette, never pure black), system. Density follows the look: Compact → compact, otherwise comfortable.

## 3. Navigation destinations

Primary: My Work (`work`, the landing page, D12), Schedule, Updates, Projects. Work group: Programs, Projects, Operations, Resources. Workspace tools: Changes (Release preview only) plus capabilities registered per division (`CAPS`): Performance and Attention in every workspace; HR (Attendance, Monitoring, Recognition, HR people); SnG (Initiatives, Decisions); EE (Relationships, Opportunities, Follow-ups); Consulting (Engagements, Staffing, Knowledge, Cohorts); FnL (Requests, Budget, Register, Period reviews); MCIT (Content, IT requests, Accounts register). Account menu: Settings, Language, Look, Theme, Organization, Sign out, and in Simple the Team items (Attention, Performance). The phone "More" menu holds Updates, Programs, Operations, Resources, Changes, the capabilities, Organization and Settings.

"Performance" is labelled "My performance" for members below Co-Director without Admin (`navLabel`).

## 4. Shared components and patterns

Design-system primitives from `.planning/design/system/components.css`, used across every page:

| Group | Classes | React component (planned) |
|---|---|---|
| Buttons | `.btn`, `.btn-pri`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.ib` (icon button), `.seg` (segmented control), `.toggle`, `.tabs` | `components/ui/Button`, `IconButton`, `Segmented`, `Toggle`, `Tabs` |
| Inputs | `.input`, `.textarea`, `.select`, `.field`, `.cb` (checkbox), `.search` | `components/ui/Input`, `Textarea`, `Select`, `Field`, `Checkbox` |
| Status | `.st`, `.st-sm`, `.st-ic`, `.st-{stage}`, `.s-{tone}`, `.tag`, `.tag-*`, `.due`, `.kbd`, `.ver` | `components/ui/StatusBadge`, `StageBadge`, `Tag`, `DueChip`, `Kbd` |
| Containers | `.sheet`, `.card`, `.page`, `.split`, `.sec-h`, `.grp`, `.rows`, `.row`, `.tbl`, `.board`, `.col`, `.empty`, `.skel`, `.notice`, `.help` | `components/ui/Sheet`, `Card`, `SectionHeader`, `Row`, `Table`, `EmptyState`, `Skeleton`, `Notice` |
| Overlays | `.pop`, `.menu`, `.mi`, `.insp`, `.insp-h`, `.toast`, `.scrim` | `components/ui/Popover`, `Menu`, `MenuItem`; `components/shared/Inspector`, `Toast` |
| People | `.av`, `.av-group`, `.av-xs`, `.idl`, `.bi`, `.person` | `components/shared/Avatar`, `AvatarGroup`, `IdentityLine`, `BrandIcon` |
| Calendar | `.cal`, `.cal-*`, `.allday`, `.ev`, `.now` | `features/schedule/components/*` |
| Records | `.feed`, `.feed-day`, `.chg`, `.chg-t`, `.ledger`, `.money`, `.reg-no`, `.decision`, `.handoff`, `.rubric`, `.scale`, `.steps`, `.versions`, `.restricted`, `.crit`, `.ctx`, `.meta`, `.quiet` | feature components |
| Type | `.t-display`, `.t-title`, `.t-h2`, `.t-small`, `.t-num` | Tailwind text utilities mapped to the token type scale |

Prototype-level patterns (app.js and screens): workspace switcher, history button group, breadcrumb, quick-add bar ("Add a task, for example: Sync with @Salsa Fri 14:00"), quick card (draft popover), meeting composer, command palette, people picker (`.pm`, two-column with roles), collapsible section (`fdisc`, D55), batch roadmap strip on My Work, identity art (WebGL shaders), reaction chips, task icons, bubbles (three avatars then +N).

CSS volume being converted to Tailwind (M3): app.css 223 rules, screens.css 1,492, comfortable.gen.css 899 (generated by `bin/generate-comfortable-css.mjs`), calm.css 228, simple.css 225, friendly.css 60, perf.css 189, accounts.css 91, div-hr-sng.css 167, div-ee-cons.css 132, div-fnl-mcit.css 142, plus tokens.css and components.css (307 lines).

## 5. Interaction states that must survive the migration

- **Loading:** the prototype never loads; data is synchronous. With Supabase the app needs a first-load state. It uses the `.skel` skeleton primitive that already exists, so nothing new is designed.
- **Empty:** every list has its own empty text (for example "Pin anything from its page.", "No matches."). They are copied verbatim through the dictionary.
- **Error:** a failed save shows the toast "Could not save. Your changes are still here. Please try again." and rolls back (`DBCommit`). Any other change is "Coming in a later release" for a hidden page.
- **Success and undo:** a toast with an Undo button for 6 s; a 50-entry shared undo stack; history buttons in the top bar.
- **Selection and focus:** the inspector panel keeps its scroll while it shows the same item; the page keeps its scroll on re-render; focus returns to the opener when a layer or panel closes; drafts in fields survive re-renders (`UIPolish.capture`/`restore`); background is `inert` while a modal layer is open; Tab is trapped in dialogs; one Escape closes exactly one layer.
- **Motion:** route 180 ms, popover 200 ms, completion 220 ms, inspector 300 ms (tokens); completion pop and pin animation; all disabled with reduced motion.
- **Responsive:** breakpoints at 599px (type scale), 800px (phone shell and inspector sheet), `pointer: coarse` (44px touch targets).

## 6. Accessibility contract already in the prototype

Skip link; `aria-current="page"` on the active navigation item; `role="menu"`/`menuitem`/`menuitemradio` with `aria-checked`; `aria-haspopup`, `aria-expanded`, `aria-controls` on disclosures; arrow-key navigation in menus; `role="dialog"` and `aria-modal` on modal layers; the toast is a polite live region; avatars without a photo use `role="img"` with the person's name; focus ring is 2px `--focus-ring` (5.5:1 on white); text colours meet 4.5:1 (tokens.css).
