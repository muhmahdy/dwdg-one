# DWDG’ONE planning workspace — human and AI handoff

5 October 2026. This guide applies to the local PRD planning app, not the production DWDG product.

## Start here

1. Read the root `AGENTS.md`, this file, and the latest decision documents linked in `README.md`.
2. The current saved planning source is **`state/planning-workspace.json`**. It contains the complete PRD, WBS, Kanban, user story map, and workspace history. Read this file before editing. `state/PLANNING_WORKSPACE.md` is a generated readable rendition of the same data.
3. `planner-seed.json` initializes the workspace only when the saved source does not exist. Updating a seed or rebuilding an old inline editor does not update a saved workspace.
4. Preserve stable IDs and unknown fields. Do not generate a replacement document from a handful of visible cards. There is no 80-node or other small presentation cap.
5. Keep decision status separate from implementation status. Confirmed means an established requirement; Done means work has recorded completion evidence. The initial work cards are Backlog.

## Open the app

From the project root:

```powershell
npm.cmd run prd
```

Open `http://127.0.0.1:5174/`. This is a local, file-backed service. It runs separately from the preserved Vite product. Starting it does not provision cloud services or alter the product's three browser stores. The service must stay running for browser saves; if it is stopped, the browser preserves the session draft and provides Export JSON.

The server initializes `state/planning-workspace.json` only if it is missing, after validating the complete seed. A corrupt existing file is preserved and reported; it is never replaced with a seed automatically.

## Shared data contract

| Section | Meaning | Important relationships |
|---|---|---|
| `prd.nodes` | Complete requirements tree | `id`, `parent`, `dependencies`; one `root`; Confirmed/Proposed/Open/Deferred |
| `wbs` | Deliverable-oriented work packages | `parent`, `dependsOn`, `requirementIds`; multiple top-level packages allowed |
| `cards` | Implementation/decision work | `wbsId`, `storyIds`, `requirementIds`, `dependsOn`; Backlog/Ready/Doing/Review/Done/Blocked |
| `activities` | Story-map backbone | Stable `id`, title, numeric order |
| `stories` | User outcomes under activities | `activityId`, actor/action/benefit, acceptance, `wbsId`, `requirementIds`, release and order |
| `history` | File service's saved change log | Preserved by the service; source labels are not authenticated identities |
| `importedHistory` | Historical events carried by imported workspaces, when present | Explicitly imported/unverified; not substituted for local saved history |

Work packages and cards contain acceptance criteria and priority. `estimateHours: null` means not estimated; do not invent precision. Release values are `v1` and `later`. Later scope does not silently become a launch gate. Done cards require nonempty `evidence`. The tool validates the presence of evidence; human review determines whether the cited output is sufficient.

Requirement links, story links, WBS links, parents, and prerequisites must resolve. Duplicate IDs, dangling references, self-dependencies, dependency cycles, invalid statuses, and malformed document sections are rejected before a file is replaced. Unknown JSON properties are preserved so another tool may carry additional planning metadata.

## Preferred edits from Claude, Antigravity, Codex, or another CLI

Use `planner-cli.mjs` for writes while the app is open. It shares the browser's validator, version checks, exclusive file lock, history, and backups.

```powershell
node .planning/dwdg-one-prd/planner-cli.mjs show
node .planning/dwdg-one-prd/planner-cli.mjs list cards
node .planning/dwdg-one-prd/planner-cli.mjs list wbs
node .planning/dwdg-one-prd/planner-cli.mjs list stories
node .planning/dwdg-one-prd/planner-cli.mjs check
```

`show` returns `{ document, etag }`. Keep the `etag` from the revision you actually read. `export` writes a complete document rather than an API envelope and refuses to overwrite an existing export file.

```powershell
node .planning/dwdg-one-prd/planner-cli.mjs export C:/path/to/new-working-copy.json
node .planning/dwdg-one-prd/planner-cli.mjs check C:/path/to/new-working-copy.json
node .planning/dwdg-one-prd/planner-cli.mjs apply C:/path/to/new-working-copy.json --base HASH_FROM_SHOW --actor "Claude" --summary "Refined HR attendance acceptance criteria"
```

For narrow changes, use the supported JSON Patch subset: `test`, `add`, `replace`, `remove`. Resolve the current array index by stable item ID first; use a `test` operation to guard against changing the wrong card. Do not assume an array index from an earlier revision is still correct.

```json
[
  { "op": "test", "path": "/cards/0/id", "value": "THE_CARD_ID_YOU_READ" },
  { "op": "replace", "path": "/cards/0/owner", "value": "HR Director / Co-Director" }
]
```

```powershell
node .planning/dwdg-one-prd/planner-cli.mjs patch C:/path/to/operations.json --base HASH_FROM_SHOW --actor "Antigravity" --summary "Assigned the reviewed work owner"
```

If the saved file has changed, the write fails with a conflict. Read the current revision, reconcile it with the working copy, and apply with the new hash. Do not bypass this by supplying an unread current hash or replacing the state file blindly.

## Direct filesystem editing

Every local AI app with access to this project can read and edit the JSON using ordinary file tools. A valid direct edit is detected on the next API read or browser refresh/poll; the Markdown rendition is then regenerated. The app checks about every eight seconds while visible. If the browser has a draft, it reports a conflict and preserves the draft for export.

Direct editors do not participate in the service's lock or automatic per-save backup/history. For safe simultaneous editing, use the CLI or API. If direct editing is necessary, save a copy first, stop other writes, preserve complete JSON, validate the edited document, and then reopen the app. Do not edit the generated Markdown as the source.

## Browser controls

- **Horizontal tree:** root at left, planning branches toward the right, Root overview/expand/collapse/show every node, pan and readable zoom. Selecting a requirement opens its editor.
- **Requirements:** continuous complete list and requirement editor, add/move/delete, acceptance and dependency links, requirement Undo/Redo.
- **Work breakdown:** full hierarchy with computed numbering, deliverables, owners, prerequisites, release and linked-card completion. Add/edit/move packages through the editor.
- **Kanban:** add/edit/delete cards; drag between columns or use each card's status menu; edit acceptance, prerequisites, links and evidence. Prerequisites still open are shown; changing a planning status does not prove launch readiness.
- **Story map:** activities as the horizontal backbone; version-one and later slices; add/edit/delete activities and stories, order them, or drag stories between activities and releases. All stories are rendered; no branch paging.
- **Changes:** file-saved edits across the workspace with source label, time and recorded differences. Requirement-specific history also remains in the PRD.
- **AI handoff:** source paths, startup, portability and recovery guidance.

Browser edits save after a short pause or with Save now. The status must say Saved to project file. A failure preserves the tab draft; export before closing it. Local form drafts are not durable until saved. Navigation flushes valid PRD field edits. Close with unsaved form edits requests a concrete discard confirmation.

Deleting a linked work package/story/activity/card is blocked until its relationships are deliberately removed. A package subtree deletion lists its size and can be undone. A PRD subtree deletion that would leave WBS/card/story links unresolved is rejected by file validation; use requirement Undo to restore it or repair the linked items before saving.

## Imports, backups, and history

Export JSON carries every planning view and history. Import first validates all sections and relationships, then requires the reviewed-copy button. A PRD-only import preserves the delivery views and is blocked if it would break their requirement links. Older inline PRD browser/chat revisions must be exported and imported deliberately; the new app cannot read unseen edits in another host's browser storage.

Before each successful replacement, the file service writes the prior source bytes to `state/backups/`. It writes the new source through a temporary file and atomic rename. Revision/hash checks prevent an older browser/CLI write from silently replacing a newer service-managed revision. Backups are local copies on this computer; use a separate-device copy of the planning directory or exported JSON for device-loss recovery.

The service retains existing local history and appends its own diff. A complete imported workspace's previous events are carried separately as imported/unverified history. Changing Editor label does not authenticate the editor; the planning log is separate from the future product's server audit.

## Maintain the app

The existing PRD editing engine remains in `editor-shell.html`. `planner.html`, `planner.css`, and `planner.mjs` add WBS, Kanban, story mapping and file persistence. `planner-store.mjs`, `planner-server.mjs`, and `planner-cli.mjs` share the saved data contract. Do not change the existing product entrypoints, local stores, or reference assets as part of a planning-tool update.

```powershell
npm.cmd run prd:check
npm.cmd run prd:test
node .planning/dwdg-one-prd/editor-test.mjs
node .planning/dwdg-one-prd/editor-tree.test.mjs
```

These checks verify the local planning tool. They do not verify DWDG product authentication, live permissions, cloud deployments, department SOP adoption, or production backups. Actual evidence and remaining limits are recorded in `PLANNER_VERIFICATION.md`.
