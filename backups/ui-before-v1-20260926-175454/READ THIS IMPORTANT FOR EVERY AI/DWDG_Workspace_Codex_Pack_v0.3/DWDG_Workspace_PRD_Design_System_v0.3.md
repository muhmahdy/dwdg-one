# DWDG Workspace — Product Requirements + Design System
## Version 0.3 — Codex Implementation Specification

**Status:** Working product/design specification  
**Primary use:** Give this file and the `/references` folder to Codex or another implementation model.  
**Organization:** DWDG UII — SHARE Do Well Do Good, Universitas Islam Indonesia  
**Date:** 23 September 2026

**v0.3 supersedes v0.2 for layout hierarchy and material behavior.**

### v0.3 key decisions
- Personal Home is deliberately calmer and may scroll; do not force the entire organization into one 1440×900 viewport.
- Personal Home and Division Home are separate concepts.
- All six divisions share one stable global shell, but each division gets contextual navigation and information views.
- Members may inspect other divisions subject to permissions; workspace membership is not the same as workspace visibility.
- Strategy & Growth must not default to an Impact × Certainty matrix. Use only visualizations that reflect real S&G workflows.
- Motivational quote/image cards are prohibited in operational screens unless they carry real information.
- Visual ratio target: roughly **70% restrained productivity UI / 20% useful visualization / 10% tactile-material expression**.
- Shader/material effects are now a formal part of the design system, with strict performance and density budgets.

---

## 0. How an AI implementation model must use this document

This is not a moodboard-only brief. Treat it as a hierarchy of constraints.

When implementation choices conflict, prioritize in this order:

1. Usability and task completion
2. Information hierarchy
3. Data legibility and operational usefulness
4. Consistency with this design system
5. DWDG brand identity
6. Motion and tactile quality
7. Visual novelty
8. Decoration

The goal is **not** to reproduce any one reference screenshot. The goal is to synthesize them into a coherent DWDG product.

The implementation model must inspect the supplied reference images. In particular:

- `00_current_overview.png` and `01_current_gantt.png` show the prototype that must be improved, not copied.
- `10_ref_bird_editorial_brand.png` and `11_ref_bloop_brand_system.png` show expressive identity systems.
- `13_ref_dashboard_monochrome_overview.png`, `14_ref_dashboard_monochrome_detail.png`, and `15_ref_mobile_welcome_salung.png` are structural UI references.
- `20_ref_tactile_button_depth.png` defines the desired tactile button character.
- `21_ref_prism_refraction_01.png` through `23_ref_prism_source_post.png` define the refractive optical material inspiration.
- `24_ref_icon_purple_depth.png` through `28_ref_icon_monochrome_glass.png` define the desired dimensional/rim-lit object character.
- `30_ref_samsung_members_app.png` and `31_ref_samsung_health.png` demonstrate Samsung-like cleanliness, friendly geometry, legibility, and controlled use of color.
- `40_brand_instagram_profile.png` and `41_brand_instagram_grid.png` are the strongest supplied evidence of DWDG's current public-facing brand identity.

Do not silently replace these constraints with a generic shadcn/Tailwind/SaaS aesthetic.

---

# 1. Product definition

DWDG Workspace is the internal operating system for DWDG UII.

It coordinates projects, people, deadlines, documents, decisions, blockers, schedules, reporting, and cross-division work. It must make the state of the organization legible without forcing members to reconstruct it from chat messages and scattered files.

The product is **not primarily a task manager**. Tasks are one data type inside a wider organizational coordination system.

The product should answer, quickly:

- What is happening across DWDG?
- What requires my attention?
- What am I responsible for?
- Which division owns this work?
- Which other divisions are involved?
- What is blocked and why?
- What changed recently?
- What is coming next?
- What decisions were made?
- Where are the relevant files and notes?
- Is a project moving, stalled, or at risk?

---

# 2. Organizational model

DWDG currently has at least six divisions:

1. Human Resource Division
2. External Engagement Division
3. Strategy & Growth Division
4. Marketing, Communication, & IT Division
5. Legal & Finance Division
6. Consulting Division

The interface must not treat the organization as one flat list of projects. Division structure is fundamental to information architecture, permissions, visualization, reporting, and ownership.

Cross-division work is expected and must be first-class.

---

# 3. User problem

The system exists to reduce organizational ambiguity.

Typical failure modes it should address:

- members do not know the current status of a program;
- ownership is unclear;
- work depends on another division but this dependency is invisible;
- deadlines exist in chat but not in a shared operational system;
- meeting outcomes are not converted into decisions/actions;
- blockers become known too late;
- documents are scattered;
- reporting requires manual reconstruction;
- the same status is repeatedly requested from multiple people;
- executive/board members cannot see organizational movement without asking each division;
- projects feel like lists of tasks rather than coherent initiatives.

---

# 4. Product goals

## 4.1 Primary goals

### G1 — Immediate situational awareness
A user should understand their current operational state within 10 seconds of opening the product.

### G2 — Clear ownership
Every actionable object must have an explicit owner or accountable team.

### G3 — Cross-division visibility
Dependencies and shared work must be visible without opening multiple project pages.

### G4 — Low-friction updates
Updating status, assigning work, logging a blocker, or recording a decision should take seconds.

### G5 — Living organizational record
Meaningful state changes should accumulate into a reliable activity history.

### G6 — Distinctive DWDG experience
The product should feel designed for this organization rather than like a generic admin template.

### G7 — Data visualization that earns its existence
Use unusual visualizations where they improve comprehension, not as decoration.

---

# 5. Non-goals for the first release

Do not attempt to build all of the following in v1:

- full ERP accounting;
- payroll;
- enterprise-grade HRIS;
- replacement for Google Drive;
- replacement for chat/WhatsApp;
- complex CRM comparable to Salesforce;
- full resource planning suite;
- social network features;
- deep AI agent autonomy;
- visual novelty on every screen.

The product should integrate or link to external tools where appropriate rather than recreate everything.

---

# 6. Product principles

## P1 — Calm shell, expressive information
Navigation, controls, forms, tables, filters, and settings remain restrained. Projects, divisions, activity, dependencies, and major state changes are allowed to be visually expressive.

## P2 — Operational information before vanity metrics
Do not lead with "9 completed tasks" if the user needs to know that a facilitator is overdue or Legal approval is blocking launch.

## P3 — State changes over static totals
"What changed?" is usually more useful than "total tasks."

## P4 — Progressive disclosure
Show enough information to decide where to go next. Reveal detail on hover, selection, drill-down, or secondary panels.

## P5 — Recognition over recall
Users should visually recognize projects/divisions/statuses rather than repeatedly parse text.

## P6 — Familiar interaction, unusual visualization
Buttons, menus, forms, search, tables, navigation, and keyboard behavior should follow established patterns. Novelty belongs primarily in representations of organizational information.

## P7 — No card soup
A card is not the default layout primitive.

---

# 7. Brand identity translation

## 7.1 What the supplied social media communicates

The current DWDG social identity uses:

- warm cream / yellow-green fields;
- black-to-dark-olive typography;
- editorial poster composition;
- bold, large, outlined or shadowed display type;
- cutout photography and collage;
- subtle paper/print texture;
- layered shapes;
- an energetic student/consulting identity;
- strong DWDG wordmark presence;
- the phrase/idea of "Future Leaders";
- the brand concept "Do Well Beyond Average / Do Good Beyond Yourself";
- a mix of seriousness and youthful ambition rather than corporate sterility.

The UI must remain recognizably related to this brand without literally turning every software screen into an Instagram poster.

## 7.2 Brand translation rule

Use the public-facing identity as an **expressive layer**, not as the entire UI language.

Translate:

- paper texture -> restrained grain;
- poster gradients -> project/hero/prism material;
- large campaign typography -> rare section/launch moments;
- collage -> project covers, onboarding, announcement surfaces;
- warm cream -> secondary surfaces;
- green/yellow atmosphere -> controlled brand accent;
- strong outlines -> occasional graphic motifs, not all UI borders.

Do not translate:

- outlined display type into body text;
- print noise into every panel;
- poster layouts into forms/tables;
- campaign color intensity into every screen.

## 7.3 Working brand palette

These are **provisional digital values** sampled/derived from the supplied social screenshots. Replace them with official brand values if supplied later.

- Brand charcoal: `#0D1115`
- Brand cream: `#EDEED6`
- Straw: `#D3D5A8`
- Olive taupe: `#A09A6D`
- Sage: `#B6C496`
- Earth accent: `#CCA66B`
- Working DWDG green: `#728B43`

The operational UI should still use neutral off-white/white surfaces. Brand colors are accents and expressive materials, not the entire background.

---

# 8. Visual direction

The intended synthesis is:

**Samsung-like cleanliness + Welcome-Salung restraint + tactile depth + soft optical refraction + DWDG editorial identity + unusually useful information visualization.**

The product should feel:

- deliberate;
- quiet;
- premium;
- modern;
- tactile;
- slightly playful;
- intelligent;
- editorial in selected moments;
- suitable for serious work.

It should not feel:

- sterile;
- corporate-template;
- childish;
- cyberpunk;
- excessively glossy;
- "AI-generated SaaS";
- card-heavy;
- decorative for its own sake.

---

# 9. Layout system

Use an 8px base grid.

Allowed spacing scale:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

Avoid arbitrary spacing values unless a specific optical correction is justified.

## Desktop target
Primary canvas: `1440 × 900`

Minimum desktop: `1280 × 720`

Maximum content width: `1600px`

Do not allow content to stretch indefinitely on ultrawide displays.

## Desktop app shell
Sidebar expanded: `232px`  
Sidebar collapsed: `72px`  
Page horizontal padding: `32px`  
Wide screens: `40px`  
Page top padding: `32px`

## Mobile target
Primary reference: `390 × 844`

Horizontal padding: `16px`  
Section gap: `24px`  
Minimum touch target: `44 × 44px`

---

# 10. Typography

## 10.1 UI family

Preferred:
`Pretendard`

Fallback:
`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

Reason: clean contemporary proportions with a Samsung-adjacent product feel without relying on proprietary Samsung fonts.

Do not ship SamsungOne or Samsung Sharp Sans unless licensing is explicitly available.

## 10.2 Display family

For rare editorial/brand moments only:
- use the actual official DWDG campaign font if supplied;
- otherwise use an open fallback such as Archivo/Archivo Black selectively.

Do not use the display face for tables, forms, metadata, or dense operational content.

## 10.3 Type scale

Display:
- 40px / 44px
- 600
- tracking `-0.035em`

Page title:
- 28px / 34px
- 600
- tracking `-0.025em`

Section title:
- 18px / 24px
- 600
- tracking `-0.015em`

Body:
- 14px / 20px
- 400

Small:
- 12px / 16px
- 400

Micro:
- 11px / 14px
- 500

Primary metric:
- 28px / 32px
- 600
- tracking `-0.04em`
- `font-variant-numeric: tabular-nums`

Do not use an excessive number of font sizes.

---

# 11. Core colors

Operational neutral palette:

- Canvas: `#FCFCFB`
- Surface: `#FFFFFF`
- Surface 2: `#F6F6F3`
- Surface 3: `#EFEFEB`
- Text: `#161716`
- Text secondary: `#6E706B`
- Text tertiary: `#A1A39E`
- Border: `rgba(20,20,20,.09)`
- Strong border: `rgba(20,20,20,.15)`

Semantic:

- Success `#258A64`
- Warning `#D88A20`
- Danger `#D94C48`
- Info `#3978C6`

DWDG green should generally occupy less than ~10% of a normal operational screen.

---

# 12. Radius system

Small controls: `8px`  
Standard controls: `10px`  
Buttons: `11px`  
Panels: `14px`  
Project identity tiles: `16px`  
Expressive hero containers: `20–24px`  
Pills: full radius only when the shape semantically behaves like a pill/chip.

Do not use the same large rounded radius on every object.

---

# 13. Border and elevation

Default border:
`1px solid rgba(17,17,17,.08)`

Use borders only where boundaries matter.

Prefer:
- spacing;
- background contrast;
- typography;
- separators;
- alignment;

before adding another outlined container.

Elevation levels:

Level 0:
`none`

Level 1:
`0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.03)`

Level 2:
`0 2px 4px rgba(0,0,0,.05), 0 8px 24px rgba(0,0,0,.07)`

Overlay:
`0 12px 40px rgba(0,0,0,.14)`

---

# 14. Tactile controls

The primary CTA may use a raised, object-like treatment inspired by `20_ref_tactile_button_depth.png`.

Reference implementation:

```css
.btn-primary {
  height: 40px;
  padding: 0 16px;
  border-radius: 11px;
  color: #fff;
  background: linear-gradient(180deg,#343532 0%,#222320 100%);
  border: 1px solid rgba(255,255,255,.10);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.15),
    inset 0 -1px 0 rgba(0,0,0,.35),
    0 1px 2px rgba(0,0,0,.18),
    0 5px 10px rgba(0,0,0,.14);
}
```

Hover:
- translate Y by `-1px`;
- modestly strengthen specular highlight;
- duration ~140ms.

Pressed:
```css
transform: translateY(1px) scale(.985);
box-shadow:
  inset 0 2px 5px rgba(0,0,0,.22),
  0 1px 2px rgba(0,0,0,.12);
```

The control should feel tactile, not cartoonishly 3D.

Secondary buttons should be quieter.

---

# 15. Liquid interaction language

"Liquid" does not mean literal liquid simulation on all controls.

Approved effects:

- cursor-responsive highlight displacement;
- subtle gradient movement;
- a small internal ripple;
- 1px elevation change;
- spring return;
- soft surface deformation.

Recommended spring:
- stiffness: 420
- damping: 32
- mass: 0.6

Avoid:
- jelly wobble;
- exaggerated bouncing;
- long elastic easing;
- constant idle animation.

Support `prefers-reduced-motion`.

---

# 16. Surface and shader material system

The visual language has three material classes. Every surface must belong to one of them.

## 16.1 Operational Surface

Use for:
- navigation;
- tables;
- forms;
- lists;
- schedules;
- documents;
- dense text;
- ordinary panels.

Character:
- warm neutral surface;
- extremely subtle border;
- little or no shadow;
- no animated shader;
- high contrast and high information legibility.

Typical background:
`#FCFCF9`, `#F7F7F2`, or controlled translucent equivalents.

Operational surfaces should account for most of the product.

## 16.2 Tactile Surface

Use for:
- primary buttons;
- important compact controls;
- selected tabs;
- small floating actions.

Character:
- physical depth;
- top specular highlight;
- lower inset shadow;
- tiny external shadow;
- slight cursor-responsive highlight;
- visible pressed compression.

The tactile effect must feel like industrial/product design, not neumorphism.

Primary dark button reference:

```css
.btn-primary {
  height: 40px;
  padding: 0 16px;
  border-radius: 11px;
  color: #fff;
  background: linear-gradient(180deg,#343532 0%,#222320 100%);
  border: 1px solid rgba(255,255,255,.10);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.15),
    inset 0 -1px 0 rgba(0,0,0,.35),
    0 1px 2px rgba(0,0,0,.18),
    0 5px 10px rgba(0,0,0,.14);
}
```

Pressed:
```css
transform: translateY(1px) scale(.985);
box-shadow:
  inset 0 2px 5px rgba(0,0,0,.22),
  0 1px 2px rgba(0,0,0,.12);
```

## 16.3 Prism / Shader Surface

This is the experimental material layer.

Visual basis:
- `21_ref_prism_refraction_01.png`
- `22_ref_prism_refraction_02.png`
- `23_ref_prism_source_post.png`
- icon references `24–28`

Use for:
- selected initiative/project identity;
- project hero detail;
- high-value visualization highlight;
- AI-specific action or result;
- onboarding;
- one selected card/object that benefits from material identity.

Do **not** use on every card.

Approved characteristics:
- soft spectral refraction;
- blurred cyan/violet/white with tiny warm highlights;
- subtle procedural noise;
- rim illumination;
- very small cursor-responsive specular movement;
- optional displacement/distortion at low amplitude;
- soft depth, never neon glow.

Default static treatment:
- blur: ~24–32px;
- saturation: ~0.75–0.9;
- visible opacity: ~0.10–0.20;
- grain: ~2–4%;
- rim light: low contrast;
- optional `mix-blend-mode: screen` only when contrast remains safe.

### Live shader budget

Desktop:
- maximum 2 live shader surfaces visible in one viewport by default;
- absolute maximum 4 only on a dedicated expressive/visualization screen.

Mobile:
- maximum 1 live shader surface visible by default;
- maximum 2 on a dedicated detail screen.

If more surfaces need the visual language, use pre-rendered/static material thumbnails.

### Shader motion limits

Cursor displacement:
- usually <= 4–6px equivalent visual displacement.

Idle motion:
- very slow;
- amplitude nearly imperceptible;
- never distract from reading.

No continuous "liquid wallpaper" behind the full app.

### Shader performance requirements

- Prefer CSS gradients, masks, pseudo-elements and static textures first.
- Use WebGL/WebGPU/canvas only when the effect materially benefits.
- Pause animated shaders when the surface is offscreen.
- Pause or reduce animation when the tab is hidden.
- Support `prefers-reduced-motion`.
- Provide a static CSS/image fallback.
- Avoid multiple full-resolution backdrop-filter stacks.
- Keep normal interaction smooth on mid-range laptops and phones.
- Do not make shader rendering a prerequisite for understanding content.

### Text safety

Do not place small/dense text directly over an active shader.

If text must overlap:
- add a sufficiently opaque local surface;
- preserve WCAG contrast;
- keep the shader as edge/background atmosphere rather than text fill.

## 16.4 Background atmosphere

The application must not default to stale pure white.

Base:
- warm near-white / ivory;
- subtle variation, not a visible gradient design.

Recommended concept:

```css
background:
  radial-gradient(circle at 78% 12%, rgba(190,210,145,.10), transparent 30%),
  radial-gradient(circle at 18% 76%, rgba(236,221,178,.08), transparent 34%),
  #F7F7F2;
```

Add extremely fine low-opacity grain if performance allows.

The background should feel like quiet material and light, not like a Behance hero composition.

## 16.5 Visual intensity rule

Normal product screen target:
- ~70% restrained operational UI
- ~20% meaningful visualization
- ~10% tactile/material expression

If the experimental material is the first thing noticed before the information hierarchy, reduce it.

---

# 17. Grain

Global texture: 1–2% perceived strength.
Expressive/shader surfaces: 2–4%.

It must remain almost subconscious.

Do not make the interface visibly dirty or simulate heavy paper texture on work screens.

---

# 18. Rim-lit object language

Project identity tiles and a limited number of expressive objects may use:

```css
box-shadow:
  inset 1px 1px 0 rgba(255,255,255,.70),
  inset -1px -1px 2px rgba(0,0,0,.08),
  0 4px 12px rgba(0,0,0,.10);
```

Add a very subtle directional specular highlight on hover where appropriate.

Do not apply this to ordinary sidebar/navigation icons.

---

# 19. Iconography

Operational navigation:
- one consistent family only;
- prefer Lucide or Phosphor;
- 18px;
- 1.75px stroke;
- selected state may use 2px/filled variant where available.

Project identity:
- bespoke/generated visual tile;
- 48×48 standard;
- 64×64 large;
- 14–18px radius;
- may use prism, division motif, or object-like depth.

Do not use emoji as project icons.

---

# 20. Division visual grammar

Do not assign six saturated rainbow colors and stop there.

Each division receives a motif:

## Human Resource Division
Primitive:
- clusters;
- circles;
- people/group topology.

## External Engagement Division
Primitive:
- outward trajectories;
- connection arcs;
- linked external nodes.

## Strategy & Growth Division
Primitive:
- vectors;
- expansion;
- directional/branching geometry.

## Marketing, Communication, & IT Division
Primitive:
- signal;
- waveform;
- pixel;
- media frame;
- transmission.

## Legal & Finance Division
Primitive:
- ledger;
- balanced lines;
- precise grid;
- measured segmentation.

## Consulting Division
Primitive:
- frameworks;
- matrices;
- modular blocks;
- diagnostic structure.

These motifs may alter project artwork and data graphics while preserving a single product system.

---

# 21. Information architecture

DWDG Workspace uses **one stable global shell plus contextual division workspaces**.

Do not build six visually unrelated apps.

## 21.1 Global shell

Global navigation should remain predictable regardless of active division.

Recommended desktop structure:

```text
DWDG UII
[ Active workspace ▾ ]

PERSONAL
Home
My Work
Schedule
Updates

WORKSPACES
Strategy & Growth
Human Resource
External Engagement
Marketing, Comms & IT
Legal & Finance
Consulting

ORGANIZATION
All Projects
Documents
People
Reports

[ profile / settings ]
```

The workspace selector changes context, not the fundamental interaction model.

## 21.2 Workspace membership vs visibility

A user may belong to one or more divisions but still inspect another division's work subject to permissions.

Example:
- Mahdy belongs to Strategy & Growth.
- He may open Human Resource and inspect public/shared initiatives.
- HR members may have edit rights where Mahdy has view-only rights.
- Sensitive Legal & Finance detail may be restricted.

Do not hide other divisions merely because the user is not a member.

## 21.3 Contextual division navigation

The active division may expose secondary navigation relevant to its actual work.

Example — Strategy & Growth:
- Overview
- Initiatives
- Research & Insights
- Strategic Planning
- Cross-Division Work
- Documents
- Division Calendar

Example — Human Resource:
- Overview
- Members
- Recruitment
- Onboarding
- Development
- Assignments
- Documents
- Division Calendar

Example — Legal & Finance:
- Overview
- Budgets
- Expenses
- Approvals
- Legal Documents
- Requests
- Division Calendar

These are examples, not fixed requirements. Final labels must follow the division's real operating process.

Mobile bottom navigation: maximum five global destinations. Division sub-navigation may live inside the division screen.

---

# 22. Personal Home

Personal Home is about the **person**, not the entire organization.

It must be calmer than a division dashboard.

The first viewport should answer:

**What needs me today?**

## 22.1 Above-the-fold density budget

A 1440×900 first viewport should contain no more than approximately:
- 3 primary information modules;
- 1 compact contextual strip/control area;
- 1 small non-dominant visualization at most.

It is acceptable and preferred for the page to scroll.

Do not force every useful module into the first screen.

## 22.2 Recommended first viewport

```text
Good evening, Mahdy                     Search / Create
Wednesday, 23 September

NEEDS YOU
2 compact actionable items

TODAY
meetings + deadlines in one calm timeline

MY WORK
3–5 highest-relevance tasks/projects
```

This should have visual breathing room.

No giant KPI cards.
No organization constellation.
No focus donut unless a real validated use case exists.
No motivational poster.
No decorative quote card.
No generic Quick Access grid occupying valuable space.

## 22.3 Below the first viewport

After scroll, Personal Home may show:

- Strategy & Growth snapshot;
- one meaningful division visualization;
- cross-division dependencies relevant to the user;
- recent movement/activity;
- upcoming milestones.

Do not show all of these at once if they create overload.

## 22.4 Personal Home material rule

The personal Home should feel approximately:
- 80% calm operational UI;
- 15% DWDG brand atmosphere;
- 5% experimental material.

One selected project or small visualization may receive a shader/prism treatment. The entire Home should not shimmer.

---

# 23. Division workspaces

Division Overview is where richer operational and strategic visualization belongs.

Every division shares the product shell and component system, but the **information grammar** may differ.

## 23.1 General division overview structure

Recommended structure:

```text
Division name
short operational subtitle

Current priorities

Primary division-specific visualization

Cross-division dependencies

Recent decisions / recent movement
```

Keep secondary task lists, generic calendars, and activity feeds off the first viewport unless they are unusually important to that division.

## 23.2 Strategy & Growth

Do not hard-code an Impact × Certainty matrix as the default Strategy & Growth chart.

Only use such a matrix if S&G actually evaluates initiatives using those dimensions.

Potential useful primary views:

### Initiative Horizon
Organize initiatives by:
- Now
- Next
- Later

Useful for strategic sequencing and communicating time horizon.

### Strategy Tree
Show strategic objectives branching into:
- themes;
- initiatives;
- measures;
- dependencies.

Useful for explaining why projects exist.

### Experiment / Opportunity Pipeline
Example stages:
- Signal
- Idea
- Validating
- Active
- Adopted / Stopped

Useful if S&G runs experiments or evaluates new programs.

### Portfolio Matrix
Examples:
- Impact × effort
- Value × feasibility
- importance × maturity
- certainty × upside

This is a selectable analytical view, not necessarily the default Overview.

## 23.3 Division-specific visualization examples

Human Resource:
- member journey;
- recruitment/onboarding funnel;
- capability/development map;
- workload/assignment field.

External Engagement:
- stakeholder pipeline;
- relationship map;
- outreach stages;
- partner portfolio.

Marketing, Communication & IT:
- campaign/content pipeline;
- channel activity;
- communication calendar;
- system/project status.

Legal & Finance:
- budget flow;
- approval queue;
- spend/commitment tracking;
- document/request lifecycle.

Consulting:
- engagement pipeline;
- project stages;
- deliverable map;
- capability/framework library.

## 23.4 Division style rule

Different divisions do **not** receive six unrelated color themes.

Keep:
- same base canvas;
- same typography;
- same sidebar;
- same interaction patterns;
- same material system.

Differentiate using:
- data model;
- visualization grammar;
- subtle motif;
- project identity art;
- limited accent behavior.

## 23.5 Organization-wide view

An organization-wide network/field may exist as a dedicated `Organization` or `All Projects` analytical view.

It should not dominate Personal Home by default.

If used, it must answer a real question such as:
- which divisions are interdependent;
- where blockers accumulate;
- what projects span multiple divisions.

Do not create a decorative constellation merely because it looks unusual.

---

# 24. Project visualization modes

The same project data may have multiple views.

## 24.1 List
Efficient, filterable, keyboard-friendly.

## 24.2 Board
By stage/status.

## 24.3 Timeline
Conventional Gantt for precise date planning.

## 24.4 Flow
Narrative milestone trail.

## 24.5 Dependencies
Metro/network view.

The current Gantt screen remains useful as one mode, but should not be the only representation of project time.

---

# 25. Project trail

Replace overused percentage bars with milestone progression where possible.

Example:

`Kickoff ●━━━━● Discovery ━━━━● Review ━━━○ Launch`

Show:
- completed milestones;
- active stage;
- upcoming milestone;
- blocker;
- overdue milestone.

Percentage may still exist as metadata when useful.

---

# 26. Dependency map

Use metro-style topology for cross-division dependency analysis.

A node is a dependency-relevant milestone, approval, decision, or deliverable.

A line may represent:
- project;
- division ownership;
- dependency path.

Do not use a force-directed graph if it creates unstable/unreadable layouts.

The user should be able to answer:
- "What is blocked by this?"
- "Who is waiting on whom?"
- "What happens if this milestone slips?"

---

# 27. Activity field

Prefer a compact temporal matrix/heatmap over a large empty line chart.

Cell units may represent:
- task completion;
- meeting;
- milestone;
- document update;
- decision;
- blocker state change;
- approval;
- assignment.

Hover example:

```text
23 Sep
12 meaningful actions
4 tasks completed
2 documents updated
1 milestone reached
1 blocker opened
```

Filtering:
- all DWDG;
- division;
- project;
- person;
- event type.

---

# 28. Project pulse

A project pulse is not a vanity score.

It should summarize multiple operational signals:
- days to next milestone;
- overdue count;
- blocker age;
- dependency waiting time;
- recent activity;
- task completion trend;
- owner confirmation/update recency.

Do not fabricate a mysterious AI "health score" without explaining its basis.

Prefer a compact explanatory state:
- Moving
- Waiting
- Blocked
- At risk
- Quiet / no recent update

These are system states, not performance judgments about people.

---

# 29. Projects

Project object fields:

Required:
- title;
- owning division;
- project lead;
- status;
- start date;
- target/end date;
- description;
- next milestone.

Optional:
- collaborating divisions;
- members;
- goals;
- deliverables;
- dependencies;
- blockers;
- documents;
- budget;
- external stakeholders;
- project visual identity;
- tags.

Project page sections:

- Overview
- Work
- Timeline
- Dependencies
- Schedule
- Documents
- Decisions
- Activity
- Budget (permission dependent)

---

# 30. Tasks / My Work

Task fields:

- title;
- project;
- owner;
- status;
- due date;
- priority;
- description;
- blocker state;
- dependency;
- assignees/watchers;
- attachments;
- comments;
- completion timestamp.

"My Work" should prioritize:
- due/overdue;
- waiting on me;
- waiting on others;
- upcoming;
- recently assigned.

Do not force every task into a card.

Use compact rows when scanning matters.

---

# 31. Blockers

Blockers must be first-class objects, not just red status labels.

Fields:
- title;
- description;
- project;
- affected task/milestone;
- owner responsible for resolution;
- opened by;
- opened at;
- severity;
- blocking dependency;
- requested action;
- target resolution date;
- resolution note;
- resolved at.

The product should make blocker age visible.

---

# 32. Schedule

Support:
- meetings;
- project deadlines;
- milestones;
- organizational events;
- recurring division meetings.

Views:
- agenda;
- week;
- month.

Mobile agenda should be visually similar in clarity to the supplied Welcome-Salung schedule reference.

Do not overdecorate calendar cells.

---

# 33. Meeting notes and decisions

Meetings are operational events.

A meeting can contain:
- agenda;
- attendees;
- notes;
- decisions;
- action items;
- linked project;
- attachments;
- follow-up date.

"Decision" should be a separate structured entity because decisions need to remain searchable and attributable after the meeting is over.

Decision fields:
- decision text;
- date;
- project/division;
- participants;
- rationale/notes;
- supersedes decision (optional);
- related files.

---

# 34. Documents

The workspace should not attempt to replace Google Drive.

It should provide:
- linked/uploaded files;
- document metadata;
- association with project/division/meeting;
- notes;
- owner;
- version/link;
- quick search.

Empty states should have purpose and personality.

Do not display a giant dead blank panel that simply says "No documents."

---

# 35. Reports

Priority reports:

- weekly organizational brief;
- division progress;
- project progress;
- overdue work;
- blockers;
- upcoming milestones;
- cross-division dependencies;
- activity recap;
- budget snapshot where permitted.

Reports should be generated from structured operational data where possible.

---

# 36. Finance

Initial scope:

- project budget;
- budget allocation;
- expenses;
- approval status;
- receipt/document link;
- remaining budget;
- category;
- requester;
- approver.

Permissions should restrict financial detail appropriately.

Do not build full accounting in v1.

---

# 37. Notifications / Updates

Notification categories:

- assignment;
- approaching deadline;
- overdue;
- blocker;
- dependency resolved;
- comment/mention;
- milestone;
- decision;
- schedule change;
- project status change;
- document request.

Bundle low-priority activity.

Do not produce notification spam for every minor field edit.

---

# 38. Universal search

Search should cover:

- projects;
- tasks;
- divisions;
- members;
- meetings;
- documents;
- decisions;
- blockers.

Keyboard shortcut:
`Cmd/Ctrl + K`

Search result should state the entity type and relevant context.

---

# 39. AI assistance

AI is contextual, not a permanent centerpiece.

Remove the current persistent "Work with ChatGPT" pill from the center of the interface.

Approved contextual actions:

Project:
- summarize current project state;
- identify unresolved blockers;
- draft weekly update;
- summarize recent changes;
- find missing ownership/dependencies.

Meeting:
- summarize notes;
- extract decisions;
- extract action items;
- suggest owners from meeting context, requiring confirmation.

Division:
- draft weekly division brief;
- summarize workload and dependencies.

Reports:
- explain unusual changes;
- draft narrative summary from structured data.

Use DWDG Prism as a subtle AI signifier.

Do not make AI actions visually dominate ordinary work.

---

# 40. Roles and permissions

Initial roles:

- Super Admin
- Board / Executive
- Division Head
- Project Lead
- Member
- Viewer

Permissions should eventually be configurable.

At minimum, control:
- project editing;
- member management;
- division settings;
- financial detail;
- report access;
- document deletion;
- role/permission administration.

---

# 41. Core data model

Core entities:

- Organization
- Division
- User
- Membership
- Project
- ProjectMember
- Task
- Milestone
- Dependency
- Blocker
- Meeting
- MeetingAttendee
- Decision
- Document
- Notification
- Budget
- Expense
- ActivityEvent

## ActivityEvent is mandatory

Every meaningful state change should produce an event.

Examples:
- task completed;
- milestone reached;
- due date changed;
- project blocked;
- blocker resolved;
- member assigned;
- document added;
- decision recorded;
- budget approved;
- meeting completed;
- project status changed.

This powers:
- organization feed;
- activity visualization;
- change summaries;
- reports;
- auditability.

---

# 42. Empty states

Never use only:

`No tasks here.`

Pattern:

1. visual element or subtle motif;
2. plain-language state;
3. useful explanation;
4. relevant action.

Example:

**Nothing demanding your attention.**  
Your assigned work is clear for now.  
`Browse division work`

Empty-state art may use the DWDG node/prism/brand motif at low intensity.

---

# 43. Cards

Before creating a card, ask:

"Does this content need an independent container?"

Cards are appropriate for:
- independently actionable items;
- project identity;
- isolated summaries;
- draggable entities;
- meaningful grouped content.

Cards are not required for:
- every metric;
- every section heading;
- every small chart;
- every row;
- every empty state.

Prefer composition and alignment over boxes.

---

# 44. Motion system

Fast:
120–160ms

Standard:
180–240ms

Large transitions:
280–360ms

Primary easing:
`cubic-bezier(.2,.8,.2,1)`

Exit:
`cubic-bezier(.4,0,1,1)`

Page change:
- opacity 0 -> 1;
- translateY 4px -> 0;
- ~180ms.

Do not slide whole desktop pages dramatically.

---

# 45. Interaction states

Every interactive control must define:

- default;
- hover;
- focus-visible;
- pressed;
- disabled;
- loading;
- success/error where relevant.

Do not rely on color alone.

Keyboard focus must be clearly visible.

---

# 46. Mobile direction

Use the **Welcome-Salung mobile layout reference as the stronger structural inspiration**, then apply Samsung-level refinement in spacing, shape quality, typography, and touch behavior.

Do not copy Samsung Health's amount of colorful card segmentation.

## Mobile bottom navigation

Maximum five destinations.

Height: ~64px.

A floating rounded navigation treatment is acceptable if:
- labels/icons remain understandable;
- safe-area padding is respected;
- it does not obscure content.

Floating create button:
- 56×56;
- tactile dark treatment;
- subtle press compression;
- optional tiny prism rim on interaction.

## Mobile project carousel

Project cards: ~210–240px wide.

Each card should communicate:
- identity art;
- title;
- division;
- active stage;
- next milestone.

Avoid meaningless decorative charts.

---

# 47. Responsive behavior

Breakpoints:
- mobile: <768
- tablet: 768–1023
- desktop: 1024–1439
- wide: >=1440

Rules:

- sidebar becomes drawer/bottom navigation on mobile;
- organization field may transform to a vertically scrollable division constellation/list hybrid;
- dependency graph may switch to an ordered dependency chain;
- tables become stacked rows only when necessary;
- retain labels; do not replace everything with unlabeled icons;
- critical actions stay within thumb reach on mobile.

---

# 48. Accessibility

Target WCAG 2.2 AA.

Requirements:
- minimum text contrast 4.5:1 for standard text;
- 3:1 for large text/UI boundaries where applicable;
- focus-visible state on all keyboard-interactive elements;
- logical tab order;
- reduced-motion support;
- charts have textual/table alternatives;
- status never encoded only by color;
- minimum target 44×44px on mobile;
- form errors explain what happened and how to fix it.

Optical/prism material must never reduce text contrast.

---

# 49. Performance constraints

Visual sophistication must not make the workspace sluggish.

Guidelines:
- avoid stacking many live backdrop-filter layers;
- prefer one composited prism texture over multiple full-page animated gradients;
- animate transforms/opacity where possible;
- lazy-load heavy project artwork;
- no continuously animated background on ordinary work screens;
- virtualize long tables/lists;
- keep interactions responsive on mid-range laptops and phones.

---

# 50. Current prototype diagnosis and migration

## 50.1 Current overview problems

Observed in `00_current_overview.png`:

- equal-weight KPI cards create weak hierarchy;
- pale green ambient wash reduces crispness;
- large areas communicate little;
- line chart is mostly empty baseline;
- empty "My priorities" panel wastes high-value space;
- project list feels generic;
- sidebar is oversized;
- the product identity is mostly logo + green rather than a coherent visual language;
- central AI pill is visually intrusive and context-poor.

## 50.2 Current Gantt problems

Observed in `01_current_gantt.png`:

- dense spreadsheet visual;
- strong contrast with the airy overview, making the product feel inconsistent;
- too much grid as default representation;
- project structure and dependencies are not narratively obvious;
- little DWDG-specific identity;
- high cognitive scanning cost.

## 50.3 Migration rule

Do not "reskin" these screens.

Keep useful underlying functions/data, but redesign hierarchy and representations.

---

# 50.4 Learnings from exploratory mockups

The later generated mockups in `/references/50–52` are **negative/diagnostic references**, not implementation targets.

Observed failure modes:

### Bland Home
`50_negative_home_bland_motivation.png`
- clean but generic;
- too much stale white;
- motivational/decorative cards waste operational space;
- not enough meaningful diagrams;
- little DWDG-specific intelligence.

### Overloaded Home
`51_negative_home_overloaded.png`
- too many simultaneous modules;
- too many cards;
- too many visualizations in one viewport;
- decorative material competes with information;
- no visual resting point.

### Strategy & Growth mockup
`52_negative_strategy_growth_too_dense.png`
- visually polished but still too much information at once;
- default strategic visualization chosen without proving it matches S&G workflow;
- material/editorial treatment too strong for a daily work surface;
- demonstrates why Personal Home and Division Overview must be separated.

Implementation instruction:
**Use these images to understand what to avoid. Do not imitate them literally.**


---

# 51. Feature priorities

## P0 — first usable release
- authentication/user session;
- members + divisions;
- projects;
- tasks;
- project lead/owners;
- dates/deadlines;
- blockers;
- milestones;
- overview/home;
- schedule;
- activity events;
- division workspaces;
- basic documents/links;
- notifications;
- responsive design.

## P1
- cross-project dependency map;
- reporting;
- meeting notes;
- decisions;
- project pulse;
- activity heatfield;
- search;
- budget/expense tracking;
- richer permissions.

## P2
- contextual AI summaries;
- advanced analytics;
- integrations;
- auto-generated project visual identities;
- deeper executive reporting;
- automation rules.

---

# 52. Example homepage content

Use realistic DWDG-like data while prototyping.

Attention:
- Consulting Bootcamp: facilitator confirmation overdue
- New Member Onboarding: External Engagement waiting for HR shortlist

Upcoming:
- Weekly Division Sync — today 15:30
- Bootcamp Planning Session — tomorrow 19:00

Projects:
- New Member Onboarding
- Consulting Bootcamp
- DWDG Digital Workspace
- Campus Partnership Outreach

Divisions:
- Human Resource
- External Engagement
- Strategy & Growth
- Marketing, Communication & IT
- Legal & Finance
- Consulting

Do not fill the UI with random e-commerce revenue metrics.

---

# 53. Content voice

Use clear, concise operational language.

Prefer:
- "Waiting on Legal approval"
- "2 tasks need you"
- "Updated 18 minutes ago"
- "No blockers"

Avoid:
- "Unlock productivity"
- "Supercharge your workflow"
- "Empower your journey"
- generic startup marketing language inside the product.

DWDG's brand personality can appear in onboarding, empty states, milestones, and celebratory moments without compromising clarity.

---

# 54. Microcopy and emotional design

The product should have personality without sounding unserious.

Example completion:
"Milestone reached. Consulting Bootcamp is ready for the next stage."

Example empty state:
"Nothing demanding your attention. Your assigned work is clear for now."

Example blocker:
"Waiting on External Engagement since Monday."

Use restrained celebration:
- a small state transition;
- subtle prism glint;
- brief haptic on mobile if native/wrapped;
- no confetti for ordinary task completion.

---

# 55. Do-not rules for implementation models

DO NOT create a generic SaaS dashboard.

DO NOT place every piece of content inside a rounded white card.

DO NOT force the entire product into one above-the-fold dashboard.

DO NOT add motivational quote cards, brand slogans, decorative image cards, or "inspiration" panels that consume operational space.

DO NOT create a generic Quick Access card grid when the same actions can live in navigation or a Create menu.

DO NOT use gradients indiscriminately.

DO NOT use green as a page-wide wash.

DO NOT use pure stale white as the only background material.

DO NOT create huge empty whitespace with little information.

DO NOT use arbitrary border radii.

DO NOT use random shadow values.

DO NOT represent six divisions merely as six saturated rainbow colors.

DO NOT give six divisions six unrelated app themes.

DO NOT hide critical labels/helper text for minimalism.

DO NOT use excessive glassmorphism.

DO NOT use cyberpunk HUD styling.

DO NOT animate every object.

DO NOT run animated shaders on every card.

DO NOT place dense text directly over active shader/refraction effects.

DO NOT use more live shader surfaces than the material budget allows.

DO NOT use oversized KPI cards unless a metric is genuinely primary.

DO NOT use a focus donut, activity heatmap, matrix, or any other chart just because it looks good.

DO NOT use an Impact × Certainty chart for Strategy & Growth unless that model is actually part of its decision process.

DO NOT use emoji as core product/project icons.

DO NOT mix unrelated icon libraries.

DO NOT add visualizations that do not encode useful information.

DO NOT add e-commerce/revenue dashboard patterns unless the actual DWDG feature requires them.

DO NOT recreate Samsung screens literally.

DO NOT recreate the Instagram poster grid literally inside operational screens.

DO NOT use prism/refraction behind dense body text.

DO NOT use AI as a permanent floating centerpiece.

DO NOT treat generated mockups in references 50–52 as implementation targets.

---

# 56. Definition of quality

A successful screen should pass these questions:

### Hierarchy
Can a member identify the most important thing in <3 seconds?

### Actionability
Is the next action obvious?

### Context
Can they tell which project/division/person an item belongs to?

### Density
Is the information useful per unit of space without feeling cramped?

### Brand
Would this still feel like DWDG if the logo were temporarily hidden?

### Novelty
Is any unusual visualization easier to understand than a conventional alternative?

### Consistency
Are spacing, radius, typography, iconography, motion, and state patterns shared?

### Tactility
Do primary interactions visibly respond to hover/press/focus?

### Restraint
Could any decorative effect be removed without losing meaning? If yes, ask whether it is earning its visual cost.

---

# 57. Acceptance criteria for Personal Home

A Personal Home implementation is not accepted unless:

1. the first viewport clearly prioritizes the user's own attention, schedule, and work;
2. no more than approximately three primary content modules dominate the first viewport;
3. the page may scroll rather than compressing everything into one dashboard;
4. attention-needed work is visible above the fold;
5. current/upcoming work is visible above the fold;
6. no motivational/quote/decorative image cards consume operational space;
7. no generic Quick Access panel occupies major space;
8. there is no four-equal-KPI-card composition;
9. organizational/division analytics are secondary or below the fold;
10. DWDG brand appears through controlled cream/green/material details rather than full-page decoration;
11. the background has subtle warm material depth rather than stale pure white;
12. live shader effects respect the shader budget;
13. primary actions have hover/focus/pressed states;
14. mobile behavior is defined;
15. keyboard and reduced-motion behavior work;
16. the interface remains useful with shaders and animations disabled.

## 57.1 Acceptance criteria for Division Overview

A Division Overview is not accepted unless:

1. it has a clear division-specific information purpose;
2. current priorities are obvious;
3. the primary visualization is justified by the division's actual workflow;
4. cross-division work/dependencies can be understood;
5. there is at least one path to recent decisions or meaningful state changes;
6. the page does not simply repeat Personal Home with a different title;
7. division identity comes from information grammar and subtle motif, not a whole new theme;
8. no chart exists only for visual novelty;
9. secondary task lists/calendars do not crowd out the primary division view.

---

# 58. Acceptance criteria for project pages

A project page is not accepted unless users can quickly identify:

- owner;
- owning division;
- collaborating divisions;
- project state;
- next milestone;
- due date/target;
- blockers;
- dependencies;
- recent change;
- current work;
- key documents.

The user should not need to open five tabs merely to understand basic project state.

---

# 59. Suggested technical implementation pattern

This is framework-agnostic, but if using React/Next:

- central design-token module;
- CSS variables generated from `dwdg_design_tokens_v0.3.json`;
- component primitives for Button, Input, Select, Popover, Dialog, Tooltip, Tabs, Table/Row, Badge, Avatar;
- dedicated visualization components, not visual hacks inside generic Card;
- Framer Motion or equivalent only where motion is purposeful;
- CSS pseudo-elements, masks and static textures for prism/grain where possible;
- optional WebGL/WebGPU/canvas shader component only for approved Prism/Shader Surfaces;
- shader component must pause offscreen, respect reduced motion, and expose a static fallback;
- chart library only for conventional charts; custom SVG/Canvas for justified division/dependency/activity visualizations if required;
- shared entity/status models;
- events feed based on ActivityEvent records.

Do not hard-code reference screenshot dimensions into individual pages.

---

# 60. Build sequence recommended for Codex

## Phase 1 — foundation
- tokens;
- typography;
- app shell;
- sidebar;
- topbar/search;
- buttons;
- form primitives;
- status language;
- responsive breakpoints.

## Phase 2 — data primitives
- users;
- divisions;
- projects;
- tasks;
- milestones;
- blockers;
- activity events.

## Phase 3 — Personal Home
- attention / needs-you;
- Today schedule;
- My Work;
- scrollable secondary division snapshot;
- optional relevant dependency/recent-movement section.

## Phase 4 — Division workspaces
- contextual division navigation;
- Strategy & Growth overview first;
- validate the real S&G workflow before fixing the primary chart;
- cross-division dependencies;
- recent decisions/movement;
- division-specific visualization patterns.

## Phase 5 — project system
- project overview;
- work list;
- milestone trail;
- timeline;
- blocker/dependency handling.

## Phase 6 — schedule/documents
- division workspaces;
- schedule;
- notes;
- files/links;
- decisions.

## Phase 7 — reporting/finance
- progress reports;
- activity recap;
- budget snapshot;
- expenses.

## Phase 8 — AI and polish
- contextual AI;
- project identity generation;
- richer motion;
- refined prism;
- performance tuning;
- accessibility pass.

---

# 61. Single-sentence design north star

**DWDG Workspace should feel calm first, intelligent second, and expressive only where expression makes work easier to understand—using restrained DWDG atmosphere, useful visualizations, tactile controls, and localized shader material rather than dashboard spectacle.**

---

# 62. Final instruction to Codex

Do not optimize for screenshot similarity alone.

Optimize for:
- hierarchy;
- organizational comprehension;
- interaction quality;
- DWDG identity;
- coherent system behavior.

Use the supplied images as visual evidence, this document as behavioral/design constraints, and the product requirements as the source of truth.
