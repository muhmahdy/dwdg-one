# DWDG’ONE shared context (read by every session)

Maintained by the PM (Claude Opus 5.5). Sources:
- owner decisions: `.planning/DECISIONS.md`;
- the plan: `.planning/dwdg-one-prd/state/planning-workspace.json`;
- a cited digest of the whole plan: `.planning/PRD_DIGEST.md`.

When sources disagree, the order of authority is:
1. the owner's latest decision;
2. a Confirmed PRD node;
3. a Proposed node;
4. digests.

## The product

- DWDG’ONE is the private, invite-only workspace for DWDG UII, a student consulting organisation of about 40 members.
- One place to see your responsibilities, run projects, find resources and keep knowledge across yearly batches, without WhatsApp chasing.
- Mobile matters. English is the default, with Bahasa Indonesia one tap away. Timezone is Asia/Jakarta.
- **Budget:** target Rp35,000 per month, hard ceiling Rp50,000. Stack: Supabase Free, Cloudflare Pages, Google sign-in. No binary uploads in v1; files stay in members' drives as links.
- **Current phase:** a clickable prototype of the first version, with demo data in the browser only (D8). No backend is built until the owner approves the prototype.

## Organisation (confirmed)

- **Hierarchy:** President, one VP, six divisions. Use these names only (D18):
  - External Engagement **EE** (Partner and Client branches)
  - Marketing Communication & IT **MCIT**
  - Human Resources **HR**
  - Finance & Legal **FnL** (one division)
  - Strategy & Growth **SnG**
  - Consulting **Cons** (branches: Project Associates, Knowledge, TnD)
  - Expertise Network **EN** is planned for 2027. Do not invent other divisions or categories.
- **Roles (D6):** Admin (Mahdy, highest, separate grant), President, VP, Director, Co-Director (CD), Member.
- **Board of Supervisors (D29):** read-only accounts with no division, absent from pickers.
- **Target structure (D28, for a later batch; inactive until a handover activates it):**
  - Board of Supervisors, then President, then three VPs: Internal (HR, SnG, Legal & Finances), External (MarcomIT, EE) and Consulting (Consulting, Expertise Networks in 2027).
  - **SnG and Legal & Finances report to both VP Internal and VP External.**
  - MarcomIT has a Director and Co-Directors of Creative, Communication and IT. Legal & Finances is one division with Co-Directors of Legal and Finance.
  - EE has a Co-Director and Associates of Partner and of Project Engagement. Consulting has Co-Directors of Project, Knowledge and TnD, plus Associates of Project.
  - Model it as configuration; never hard-code it. Projects are created by CD and above only.
- Every member has a division function and a consultant function under one identity.
- **Scope:**
  - Members see their own division.
  - Cross-division work is offered and needs the recipient's consent; silence never accepts.
  - The VP sees reporting divisions; the President sees all; Admin is separate.
- A hidden IT account never appears in search or pickers.

## Vocabulary (confirmed)

- **Workspace:** one division context.
- **Project:** an initiative. It has exactly four tabs: **Overview / WBS / Work / Resources** (D46).
- **Work:** execution (tasks in list, board and timeline views).
- **Resources:** notes, folders, links.
- **Program:** an umbrella grouping related projects and operations (D47).
- **Operations:** the home of routines. A **run** is one occurrence of a routine (D34).
- **Capability:** a division-specific workflow.
- **Updates:** a person's inbox.
- **Changes:** one workspace's history.
- **Offer:** a task proposed to someone, pending until they accept.
- **Blocker:** an owned obstacle with severity and the action needed.

## Owner decisions in force (full text in `.planning/DECISIONS.md`)

| # | Decision |
|---|---|
| D1 | Top-level first version first. P0 slice listed in `streams.json` (p0slice) |
| D2–D5 | Google sign-in, invite-only with admin approval. Free tiers. Two custodians. Notes and links only |
| D6 | Real role classes; CD and up create projects |
| D7 | English default, Indonesian one tap away |
| D8 | Prototype first; backend only after owner approval |
| D9 | Meeting scheduler (reference R046) is in v1 |
| D10 | UI/UX is never delegated outside Claude |
| D12 | My Work is the landing page; it serves as Home |
| D13 | Meeting location is free text or a link (often a Google Maps café link) |
| D14 | Every item shows who created it and when, separately from who is responsible |
| D15 | No invented task categories. A chip shows real context: division, project, programme, routine or request |
| D16–D17 | Official logo `.planning/brand/source/logo-dwdg-official.svg`; never redraw its letters. Green #00C25A |
| D18 | Official division names above |
| D19 | Role icons as in `.planning/brand/icons/` |
| D20 | Visual rules: no side stripes, one accent, Geist and Geist Mono, circular photo avatars, the owner's nine-stage colours, no light sweep |
| D21 | Design system v2 (`.planning/design/system/`) is the UI source of truth |
| D22 | Clickable prototype in `prototype/` |
| D23 | Schedule at least as intuitive as Google Calendar; others' meetings locked |
| D24 | **Full two-way Google Calendar sync is in v1** (promotes W096/S076). ARC designs it before SCH builds it |
| D26 | Thin horizontal hairlines between sections and grouped rows are allowed; vertical rules and side stripes stay banned |
| D27 | Quick-add @mentions with inline photo and name; a mention never assigns |
| D28 | Revised target org chart with dual reporting (see Organisation above) |
| D29 | Board of Supervisors: read-only oversight accounts |
| D30 | Team performance views: Co-Director/Director see their team, VP their divisions, HR and the President everyone, members themselves, the Board division summaries. Recorded facts only; no leaderboard |
| D31 | Teams define their own routines (Co-Director and up; members can repeat personal tasks) |
| D32 | Batch roadmap strip in My Work (confirmed for the pilot by D48) |
| D33 | Person panel on any name or mention: roles, optional LinkedIn and phone, date joined, and a calendar that names only shared items |
| D34 | Operations area beside Projects holds routines; one occurrence is a "run" |
| D35 | Sign-off for delegated tasks and routine runs (confirmed); see work_task_lifecycle |
| D36 | Shader identity art for projects and resources in v1 (P1), static unless hovered |
| D37 | Link tiles show the site favicon, fetched and cached server-side |
| D38 | Joint cross-division projects: other divisions join only after accepting |
| D39 | Organisation-wide projects (set by President, VP or Admin) visible to all |
| D40 | Four dependency types (FS, SS, FF, SF); nothing reschedules silently |
| D41, D42 | Task and meeting icons; one emoji reaction per person per item, never counted as approval |
| D43 | English copy uses US spelling (Organization) |
| D44 | Several responsible people per task; other divisions accept first |
| D45 | Back/forward and undo/redo buttons with Ctrl+Z / Ctrl+Y |
| D46 | Projects have four tabs: Overview, WBS, Work, Resources; tasks form a leveled tree |
| D47 | Program = umbrella over projects and operations (Director and up create); requests stay in division queues |
| D48 | Every prototype feature is in the pilot build (P0); UI design calls in R22: compact 34 px desktop buttons (44 touch), tablet keeps the sidebar, phone top bar shows undo/redo only, US "Canceled" |
| D25 | **WebMCP is a requirement** (`integration-webmcp`, W097, S077, stream AGT). The member's own browser AI agent can call DWDG'ONE tools with exactly the member's permissions. Actions that reach other people need in-page confirmation. No AI backend or paid model |

## Cross-cutting models every stream must respect

These come from the plan's source documents in `.planning/dwdg-one-prd/`. Your brief lists the sections to read in full.

**Work model** (`WORK_MODEL_DISCUSSION.md`, `work_type_model`):
- Organisation (units, terms, memberships, roles) is separate from work. A unit is not a project.
- Work comes in four forms that share one canonical task and resource layer:
  - **Project:** bounded delivery with scope, milestones, reviews and closure.
  - **Program:** an umbrella over related projects and operations, with a goal, owner and period (D47). A TnD cohort is a project inside a program.
  - **Routine:** a definition that generates separate occurrences.
  - **Request:** an item in a division’s queue (intake, handler, review, resolution). It is not a container (D47).
- Division facts are **Records**: partner, assessment, content item, agreement, transaction, knowledge article, attendance, award.
- Records can have workflows without being forced into projects. Do not build one generic "work items" table, and do not add a fifth work form per division.

**Data ownership** (`DATA_OWNERSHIP_AUTHORITY.md` section 7, `data_custody_matrix`):
- Keep four meanings apart:
  1. **Custody:** DWDG keeps the official records.
  2. **Stewardship:** who keeps the data accurate.
  3. **Authorship:** who created or changed each version.
  4. **Access:** who may see, edit or export.
- A task owner, an avatar bubble, a resource author and a provider file owner are different things.
- Each data collection has exactly one authoritative source. A well-working Google Sheet is not forced into the app; a Sheet date is not an app deadline until it is imported deliberately.

**Consent and authority** (`DATA_OWNERSHIP_AUTHORITY.md` sections 3–6):
- Any member can offer a task across divisions. The recipient accepts, asks for changes or declines; silence never accepts, and declining has no penalty.
- Appointments, transfers, isolation and presidency handover follow the confirmed actor table.
- A Director can never act on someone of higher effective rank, including Mahdy's Admin grant.

**Division journeys** (`ORGANIZATION_DIVISION_BLUEPRINT.md` sections 4–12, PRD `flows-divisions`):
- Each division has an intake, an action, a review, a handoff and a return, using the shared handoff contract (section 12): named receiver, version, needed-by date, and accept or return.
- Chains cross divisions, for example EE to Consulting to FnL Legal to FnL Finance. Each step links the same records by ID.

**Design** (D20, D21, `UI_UX_IMPLEMENTATION_MAP.md`, `.planning/design/system/`):
- One shell and one component system for all six divisions, not six styled apps.
- Every division screen sits inside the same navigation and project tabs.

## Historical documents (do not follow)

- `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md` and `phases/` describe the September redesign of the old app.
- `.planning/directions.html` holds rejected visual directions.
- `DWDG_ONE_PRD.json` and `planner-seed.json` are seeds.

The current plan is the planning workspace plus `DECISIONS.md`.

## Non-negotiable behaviour rules (from the PRD)

- One record, many views. Never copy a task, project or resource into a second place.
- Unknown availability is shown as Unknown, never Free. Task count never means busy. A date-only due date never blocks hours.
- No fabricated success, scores, health ratings, attendance, payments, signatures or publication. The app records what people did elsewhere.
- Every visible action has a defined result, a permission rule, failure handling and recovery.
- Undo appends a reversal; history is never erased. Changes is per selected workspace only.
- Every action works by keyboard and touch. Contrast is 4.5:1 for text and 3:1 for marks. Status is never shown by colour alone.

## Design taste (owner)

- No side stripes or vertical accent rules. No serif or cream palette. No mono-caps eyebrows. No em dashes in UI copy.
- Real photos rather than initials when a photo exists. Quiet, Notion-like work surfaces. One accent.
- UI work is Claude-only.

## Current state (6 Oct 2026)

- The planning workspace is at revision 14 (D26–D48 folded in; W098–W106 added):
  - Owner decisions D2–D24 are folded into the PRD, including two-way Google Calendar sync in v1 (W096/S076 now v1, P0).
  - Official division names are applied.
  - WebMCP is added (D25: integration-webmcp, W097, C097, S077).
  - Every package, card, story and requirement carries a `stream` field matching `map.json`.
- Kanban:
  - C088–C094 are Done.
  - C010 is in Review.
  - C001, C011 and C015–C018 are Doing.
  - The rest are Backlog.
- The design system v2 is built.
- The prototype is **mid-rebuild and does not load**. The UX2 stream finishes it first.
- Gap analysis of prototype against plan: `.planning/PRD_ALIGNMENT.md`.
