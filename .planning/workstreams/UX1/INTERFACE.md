# UX1 interface

What other streams can rely on. Published 6 Oct 2026 (UX1 session 1, Claude Opus 5.5). Draft until the owner approves the prototype (D8). Source of truth: `.planning/design/system/` (D21). Requirement IDs in brackets.

## 1. Files and ownership

| File | Owner | Others may |
|---|---|---|
| `.planning/design/system/tokens.css`, `components.css`, `README.md`, `gen-system.mjs` | UX1 | Use only. Ask in REQUESTS for a new token or component |
| `prototype/app.js`, `app.css`, `index.html` | UX1 | Register pages, panels, actions and menus through the registries below |
| `prototype/i18n.js` | UX1 (convention) | Append keys for their own strings, inside their own commented block |
| `prototype/work.js`, `plan.js`, `schedule.js`, `screens.css` | UX2 | |

## 2. Tokens (design-measures)

Use tokens, never raw values. Light on `:root`, dark on `[data-theme="dark"]`.

- **Surfaces:** `--canvas`, `--surface`, `--surface-2`, `--fill`, `--hover`, `--sel` (green tint), `--sel-neutral`, `--line` (row hairline), `--line-strong` (section hairline).
- **Text:** `--ink`, `--ink-2`, `--mute` (all at least 4.5:1); `--faint` is decorative only.
- **Accent and meaning:** `--green` (marks only), `--green-ink` (green text), `--danger`, `--warning`/`--warning-mark`, the stage colors `--st-*`.
- **Focus:** `--focus-ring`, a color: 2px outline, 2px offset. `--focus` is a legacy box-shadow value, so never use it as an outline color.
- **Type:** `--t-title` 24/32 (phones 28/34), `--t-h2` 18/24, `--t-h3` 15/22, `--t-body` 14/20 (phones 15/22), `--t-small` 13/19, `--t-caption` 12/16, `--t-num` (mono). On phones, editable fields are 16/24.
- **Space:** `--s1` to `--s16` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Page side padding `--page-x`: 32 / 24 / 16 at 1024+ / 600 to 1023 / under 600.
- **Sizes:** `--sidebar-w` 216, `--topbar-h` 56, `--nav-row-h` 40, `--inspector-w` 360, `--row-h` 48, `--project-row-h` 76, `--resource-row-h` 52, `--dock-h` 64, `--touch` 44, `--ctl-h` 34 (44 on touch), `--ctl-h-sm` 30 (40 on touch).
- **Radius:** `--r-sheet` 12, `--r-ctl` 8, `--r-chip` 6, `--r-round`.
- **Motion:** `--d-press` 120, `--d-hover` 140, `--d-route` 180, `--d-pop` 200, `--d-done` 220, `--d-chart` 240, `--d-panel` 300. All become 0 under reduced motion.
- **Exceptions E1 to E6** are listed in the design system README. E1, E5 and E6 wait for the owner (R22).

## 3. Components (components.css)

| Class | States and variants | Notes |
|---|---|---|
| `.btn` | `.btn-pri` (page primary, one per view), `.btn-ghost`, `.btn-danger`, `.btn-sm`, `[disabled]` | The global New is `.btn.newg` (quiet). Page primaries stay `.btn-pri` |
| `.ib` | icon button, 30px (32 in the top bar, 44 on phones in the top bar) | Always has `aria-label` |
| `.field` > `label` + `.input`/`.textarea`/`.select` + `.help` | `.field.invalid` shows a danger ring and the help text in danger | Label 8px above; error text below the control (measure-forms) |
| `.search`, `.cb`(`.on`), `.toggle`(`.on`), `.seg`(button`.on`), `.tabs`(button`.on`) | | `.seg` and `.tabs` draw focus inside |
| `.ctx`, `.tag` (`-green`, `-warn`, `-danger`, `-ink`, `-outline`, `-unknown`) | | `.tag-unknown` is for Unknown, never Free |
| `.st` + `.st-<stage>` or `.s-<tone>` | `.st-sm`; tones `s-ink`, `s-ink2`, `s-mute`, `s-green`, `s-warn`, `s-danger`, `s-hold` | Every state is an icon plus a colored word |
| `.sheet`, `.pop`, `.quiet` | | Opaque only |
| `.menu` > `.mi` (`.on`), `hr` | 36px desktop, 44px touch | Anchored 8px from the trigger by the shell |
| `.rows` > `.row` (`.sel`) | min 48px | Focus drawn inside |
| Hairlines (D26) | `.page .sec-h`, `.insp .sec-h`, `.hl-sec`, `.grp`, `.colh`, `.hl-rows` (container) | Horizontal only. Section lines use `--line-strong`; row lines use `--line`, inset 16px |
| `.insp`, `.insp-h`, `.meta` | | Created by, Responsible and Reviewer stay separate rows |
| `.notice` + `.n-warn`/`.n-error`/`.n-done`/`.n-info`, `.toast`, `.empty`, `.skel`, `.restricted` | | `.skel` stops under reduced motion |
| `.tbl`, `.selbar`, `.board`/`.col`/`.card`, `.versions`/`.ver`, `.handoff`, `.steps`, `.att`, `.rubric`/`.crit`, `.money`, `.ledger`, `.reg-no`, `.options`, `.cal`/`.ev`, `.feed`/`.chg`, `.idl` | | Division patterns. See `system.html` |
| Scrollbars | global rule at the end of components.css | 4px, shown only while the pointer is over the area, hidden on touch (R10) |

## 4. Shell contract (prototype/app.js)

- **Navigation (design-navigation, D12, D34, D45):**
  - Global: My Work `#/work` (landing), Updates `#/updates`, Schedule `#/schedule`.
  - Workspace group, under the quiet workspace heading: Projects `#/projects`, Operations `#/operations`, Resources `#/resources`, Changes `#/changes`.
  - Organization group: Organization `#/organisation` (slug kept, R22e) and Settings `#/settings`.
  - Phone dock: My Work, Updates, New, Schedule, More. More lists Projects, Operations, Resources, Changes, Organization and Settings, and lights up on any of them (`MORE_PAGES`).
- **Workspace selector:**
  - Members who can see more than one workspace get a menu (`MENUS.ws`) listing only `visibleDivs(me())`.
  - Members with one workspace see its name only, with no menu.
  - Switching resets folder and stage filters. IAM supplies the real scope matrix (W004, W024).
- **Registries** (fill them from page files):
  - `PAGES[name](route)` returns `{content, crumb}`.
  - `INSP[type](insp)` renders the side panel.
  - `ACT[name](el, id, event)` handles `data-act` clicks.
  - `MENUS[type](mm)` builds menus.
  - `ON_INPUT`/`ON_CHANGE[id]` handle field events.
  - `ON_KEY.push(fn(e, typing))` adds key handlers; return true to stop.
- **Undo and redo (D45, work_undo_archive):**
  - `toast(msg, undo)` with an undo function puts the change on the one shared stack (max 50). The toast's Undo, the top-bar button and Ctrl+Z all undo the same change.
  - Ctrl+Y or Ctrl+Shift+Z redoes.
  - While the member is typing in a field, the field keeps its own undo.
  - Your undo function must append a reversal, not erase history.
  - `toast(msg)` without a function is a plain message.
- **Back and forward:**
  - A page state is the hash plus the open side panel (`ui.insp`). Each state remembers its scroll, which comes back when the member returns.
  - Actions: `sh-back`, `sh-fwd`, `sh-undo`, `sh-redo`.
- **Scroll keeping (R16):**
  - Re-rendering the same page (page, id and sub) keeps `#scroller`.
  - The side panel `.insp-sheet` keeps its scroll while it shows the same item.
- **Icons:**
  - `icon(name, cls)` draws from the UI set; `icon('routine')` is the Operations loop.
  - `bicon(id)` draws brand, division and role icons.
- **New menu:**
  - Everyone gets Task, Task for someone else, Meeting, Unavailable time, Note and Link.
  - CD and up also get Project and Routine. Everyone else gets Repeating task (`new-rt` with `data-personal`, an action UX2 owns).

## 5. String keys (design-languages, D7, D43)

- **Keys:**
  - The key is the exact English string passed to `L()`, in US spelling and sentence case, without em dashes.
  - Use `{name}` placeholders. Never build a sentence by joining pieces, because Indonesian word order differs.
  - Plurals: `plural(n, '{n} task', '{n} tasks')`, with both keys translated.
- **Indonesian:**
  - Values in `window.ID_DICT` use formal "Anda". Missing keys fall back to English, so a missing key is a defect.
- **What not to translate:**
  - User content: titles, notes, names and file names.
  - Official division names (D18).
  - Code identifiers.
- **Accessible names:** they go through `L()` too.
- **Adding keys:**
  - Each stream appends inside its own commented block in i18n.js and never edits another stream's block.
  - When an English string changes, add the new key next to the old one until every call site has moved, then remove the old key.

## 6. Confirmation for actions a browser agent prepares (D25, integration-webmcp; used by AGT)

A member's own browser AI agent can call DWDG'ONE tools with exactly that member's permissions. Any tool call that reaches other people needs an in-page confirmation before anything is written. This covers sending an offer or invitation, assigning, notifying, changing a shared record's status, cancelling a meeting, deleting or sharing.

**Pattern: a prepared-action sheet.**

1. **The agent prepares, the page shows.**
   - The tool call creates a pending, unsaved draft, never a record. The draft follows the save-truth rules (work_forms).
   - The shell opens a dialog: `.pop`, 480px preferred, labelled by its title, focus trapped (measure-dialogs).
2. **What the dialog shows:**
   - The title "Your browser assistant prepared this", with an icon and the word "Prepared", never color alone.
   - What will happen, in one sentence that names the record and the people affected, e.g. "Send Salsa an offer for Draft brief, due Fri 9 Oct".
   - Who will be notified, with avatars and names.
   - The editable fields, prefilled.
   - What happens if they confirm: who is notified, what is recorded in Changes, and whether Undo is available.
3. **Buttons:**
   - Confirm uses `.btn-pri` with the specific verb, e.g. "Send offer", not "OK".
   - "Edit first" keeps the dialog open.
   - Discard uses `.btn-ghost`.
   - Focus starts on the first field, never on Confirm. Destructive actions use `.btn-danger` and name the record.
4. **Attribution:**
   - The saved record and its Changes entry show the member as the actor, with "via browser assistant" as a separate field (D14: who created it, separate from who is responsible).
   - The agent is never the author of record.
5. **Rules:**
   - One confirmation per action; there is no "confirm all".
   - Silence or closing the tab discards the draft.
   - The confirmation can't be clicked by script. The confirm control only acts on a trusted user event (`event.isTrusted`), so an agent can't confirm on the member's behalf.
   - Actions that affect only the member (their own draft task, their own filter, reading) need no dialog.
   - A denied permission shows the same neutral denial as the page would.

Strings for this pattern go in the UX1 block of i18n.js when AGT builds it. UX1 will add the dialog component to components.css when AGT starts (wave 2).
