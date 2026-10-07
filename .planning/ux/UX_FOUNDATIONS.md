# DWDG’ONE — UX foundations (Iteration 1)

5 October 2026 · Claude · status: **proposed, awaiting product-owner review**. Scope: the approved top-level first version (`../STRATEGY.md`, `../DECISIONS.md`). Visual style is deliberately absent; it is Iteration 2. Wireframes: `wireframes.html` (open in a browser).

## 1. Principles

1. **One surface, live feedback** (from R046). Compose things in place; the result updates as you type or drag. Conflicts and errors appear where they happen, never as a blocking dialog.
2. **Sentences, not forms.** Task and meeting titles read like sentences with inline people, links and category chips (R002/R009). Structured fields exist, but the quick path is one line.
3. **Me first, then my workspace.** Personal work (tasks, schedule) is always one click away; workspace material (projects, resources) is scoped by the workspace switcher.
4. **Context stays put.** Opening a record uses the right-hand inspector (desktop) or a sheet (mobile); the list behind keeps its scroll, filters and selection.
5. **Honest states.** "Unknown" availability is never shown as free; saved means committed; empty states say what belongs there.
6. **Calm density.** Compact rows separated by hairlines, no widget walls, quotes or decorative tiles (avoid R043/R044).

## 2. Information architecture

```
DWDG’ONE
├─ Sign in (Google) → Waiting for approval (first time) → app
├─ ME
│  ├─ My Work            (landing page)
│  │   ├─ Needs your response   — meeting invitations, (later: task offers)
│  │   ├─ Today                 — today's meetings (time rail) + tasks due today
│  │   ├─ Upcoming              — grouped: Tomorrow / This week / Later / No date
│  │   └─ Done (collapsed)
│  └─ Schedule
│      ├─ Week view (default) / Day / Agenda (mobile default)
│      ├─ Meeting composer      — floating panel, R046 pattern
│      └─ Unavailable-time composer
├─ WORKSPACE  [switcher: 6 divisions; "All of DWDG" for President/Admin]
│  ├─ Projects
│  │   ├─ Register: grouped rows by stage (default), Grid, Timeline
│  │   └─ Project page — tabs: Overview · Work · Resources (exactly 3)
│  └─ Resources
│      └─ Explorer (folders, notes, links, pinned) + inspector
├─ People (directory, read-only in v1 — needed to pick participants/assignees)
├─ Settings (profile, language, theme, motion; Admin: members & approvals, export)
└─ Global: ⌘K search/command · "+ New" menu · notifications dot on My Work
```

Navigation chrome:

- **Desktop (≥1024px):** left sidebar 216–240px — brand, workspace switcher, ME group, WORKSPACE group, People, footer with profile/settings. Top bar: breadcrumb, ⌘K search, + New.
- **Tablet (768–1023px):** sidebar collapses to icons; inspector overlays content.
- **Mobile (<768px):** bottom pill tab bar — My Work · Schedule · Projects · Resources — plus a round **+** button (R025). Workspace switcher at the top of Projects/Resources. Inspector becomes a full sheet.

Workspaces are the six real divisions: **External Engagement** (Partner, Client branches), **Marketing Communication & IT (MCIT)**, **Human Resources (HR)**, **Finance & Legal (FnL)**, **Strategy & Growth (SnG)**, **Consulting (Cons)** (Project Associates, Knowledge, TnD branches). Branches are filters inside a workspace, not separate workspaces. Expertise Network (EN) appears only when activated (2027).

Roles (D6, real role classes) only change what appears, never the layout:

| | Member | Co-Director / CD | Director | VP | President | Admin |
|---|---|---|---|---|---|---|
| My Work, Schedule, People | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Own division's Projects & Resources | ✓ (+ granted cross-division work) | ✓ | ✓ | reporting divisions | all | all |
| Create / close projects | – | ✓ in own scope | ✓ | ✓ | ✓ | ✓ |
| Workspace switcher shows | own division (+ granted) | own division | own division | reporting divisions + rollup | all six + "All of DWDG" | all |
| Members & approvals, export | – | – | – | – | – | ✓ |

Every record (task, project, folder, note, link, meeting) shows **Created by · date** separately from **Responsible** (D14).

## 3. Key flows

**F1 · First sign-in.** Invite link → "Continue with Google" → (not yet approved) *Waiting for approval* screen naming who approves → Admin approves in Settings › Members → member lands on My Work with a 3-step checklist: set language, mark regular unavailable times, open your workspace.

**F2 · Capture a task (≤5 s).** Anywhere: press `N` or + New › Task → one-line composer: "Draft recruitment post copy Fri @Rani /Open Recruitment 2026" → chips appear for date, person and context (project/division) → ⏎ saves to My Work. No free-floating categories (D15): the chip on a task row is its real context. Undo toast. Details (notes, link to project) in the inspector afterwards.

**F3 · Work the day.** My Work › Today: tick a task (row dissolves, Undo); open a row → inspector (notes, dates, links, delete to trash). Drag or keyboard-reorder within Upcoming groups.

**F4 · Create a project (Director).** Projects › + New project → inspector form: name, goal, lead, dates (may be unknown), stage → lands on Overview tab. Members see no "New project" control at all.

**F5 · Run a project.** Project › Work tab: same task rows as My Work (one canonical task), list/board switch; Resources tab: the project's notes and links. Overview: goal, progress (real counts), next due items, people.

**F6 · Add a resource.** Resources or project › Resources: + Note / + Link / + Folder. Link → paste URL → title fetched or typed → choose folder → saved. Note → simple editor with saved revisions. "Make a task from this" → F2 composer prefilled with the resource linked.

**F7 · Mark unavailable.** Schedule › Unavailable → drag on the week grid or type "Classes Mon Wed 08:00–11:00 every week" → preview blocks → save. Optional note with audience (only me / visible as "busy" to others).

**F8 · Schedule a meeting (R046).** Schedule › New meeting (or `M`, or + New) → floating composer:
1. Type "Sync with Rani and Dimas tomorrow 45 min". People and time words become chips as they parse.
2. Each person adds an availability row on an hour ruler (busy = solid, unavailable-with-note = hatched, **unknown = dotted outline, never "free"**).
3. A slot capsule spans all rows; "Everyone's free at" chips offer the next 3 safe times.
4. Drag the capsule, use ← → keys, or edit the time field; on conflict the capsule and the summary bar turn red and name who is busy.
5. Summary card: title, date/time, guests, − 30 min + stepper, location as free text or a link — a pasted Google Maps link shows the place name (D13) — then **Send invitations ⏎**.
6. Invitees see it in My Work › Needs your response: Accept · Decline · Suggest another time. Organizer sees responses per person.

**F9 · Respond to a meeting.** My Work row with Accept/Decline inline; accepted meetings appear in Today and Schedule. A newly added unavailable block that collides is flagged to the organizer before confirmation is rechecked.

## 4. Screen inventory (first version)

| # | Screen | Desktop | Mobile |
|---|---|---|---|
| S0 | Sign in / waiting for approval | centered card | same |
| S1 | My Work | list + optional inspector | list, sheet |
| S2 | Schedule | week grid + composer panel | agenda + full-screen composer |
| S3 | Meeting composer | floating panel 560px | full screen |
| S4 | Projects register | grouped 76px rows | stacked cards |
| S5 | Project page (3 tabs) | main + context column | tabs as segmented control |
| S6 | Resources explorer | list 52px rows + 360px inspector | list, sheet |
| S7 | People | directory list | same |
| S8 | Settings / Members & approvals | grouped rows (R010/R016) | same |

## 5. Shared interaction patterns

- **Inspector** 360px, 24px padding, closes with Esc, focus returns to the row.
- **Selection bar** floats at the bottom of a list when ≥1 row is selected (R007).
- **Inline chip menus** for category/stage/person (R008), keyboard-searchable.
- **Toasts with Undo** bottom-end; saves are confirmed only after commit.
- **Empty states** name the thing and offer the first action (R026).
- **Every drag has a keyboard/manual equivalent** (W018 acceptance).

## 6. Product-owner review (5 Oct) — resolved and carried forward

- Resolved: My Work is the landing page (D12); location is text or link (D13); created-by on every record (D14); context chips replace categories (D15, to confirm).
- Carried to Iteration 2 (visual): schedule event cards without the left accent stripe; dates right-aligned in project rows; a redesigned mobile navigation (current dock rejected); a sign-in screen with real identity; the new dwdg’ONE logo, role icons and division icons (D16).
- Later iterations: division-specific features (HR attendance, FnL requests, EE pipeline, etc.) after the top-level version.
