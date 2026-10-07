# W017 · Resources explorer and inspector

**Packages:** W017 (frontend), W033, W034 (RES). **Stories:** S022.
**Requirements:** resource_explorer, resource_inspector, resource_bubbles, resource_tasks, resource_types, resource_folder, resource_notes, resource_revisions, resource_pin, resource_move, resource_link_issue, resource_link_validation, resource_references, resource_responsibility, resource_search, resource_provider_access, measure-resource-row, measure-inspector, design-resource-identity, access_delegation. Owner decisions D36, D37.
**Prototype:** `prototype/plan.js` (PAGES.resources, INSP.res, linkTile, projResources, briefSection).

## Resource types

| Type | Stored | Opens |
|---|---|---|
| Note | title, body (safe rich text), revisions | the note view |
| Link | title, `url` (https only) or `ref {type, id}` for a page inside dwdg'ONE | the site in a new tab, or the in-app page |
| Folder | title, `parent` | the folder's contents |

Files are never uploaded: "Files stay in your drive. Only the link is stored." (resource_provider_access). Every resource has `owner` (responsible), `contributors`, `purpose`, workspace `div`, optional `project`, `parent` folder, `pinned`, `archived`, `history`, `reports`, `look` (identity art, D36).

## 1. Explorer

**Route** `#/resources` (workspace) and the project Resources tab (same component scoped to the project).

- **Layout:** search ("Search resources"), type filter (All resources, Notes, Links, Folders), New (New note, Add a link, New folder). **Pinned** strip on top. Then the list with breadcrumbs when inside a folder.
- **Row (52 px target, 20 px icon, 12 px metadata gap; measure-resource-row, W017 acceptance 1):** identity art tile (folder, note) or the link squircle with the site's favicon (D37; Google Docs, Sheets, Slides, Forms and Classroom use their own product icons, otherwise a round web glyph), name, short purpose, responsibility faces (owner then contributors, three then +n; resource_bubbles), last edited.
- **Clicks:** one click on the row opens the inspector; the bold name, or a double-click, opens the target (link, note, folder). A short delay keeps a double-click from opening the panel first (O29).
- **Right-click or ⋯ menu:** Open, Pin or Unpin, Move to folder, Link a task, Report it will not open (links), Archive.
- **Folders:** create inside the workspace or a project ("Name the folder"); move by menu or drag; a folder cannot move into itself; moving checks edit rights.
- **Empty:** workspace: "Add a note or a link to a file in your drive." Folder: "This folder is empty". Project: "No resources linked to this project yet." **Search no match:** "No matches." **Denied** (resource outside scope or archived): "It was archived or is outside your workspace."

**Size:** M.

## 2. Inspector (side panel)

360 px on desktop with 24 px padding, full-screen sheet on phones (measure-inspector, W017 acceptance 2).

| Part | Content |
|---|---|
| Header | art or favicon tile, name, type, Open |
| Purpose | `purpose` ("No purpose written." when empty) |
| Responsible | owner; contributors with Add a contributor and remove. Avatars are responsibility only and grant no access in Google Drive or any provider (W017 acceptance 3) |
| Linked tasks | tasks with their state; Link a task; **Make a task from this** (section 4) |
| Problems opening it | open reports (reason: not found, access denied, expired, wrong link; who, when, note) with Fixed for the owner |
| History | created, edited, moved, archived entries |
| Actions | Pin, Move, Archive ("Archived. Linked tasks stay as they are.") |

## 3. Notes

- Editor with headings, paragraphs, lists, bold, italic, https links and in-app references (`data-ref="type:id"`). RES sanitizes on the server to the same subset.
- Save states are honest: Unsaved changes, Saving, Saved {time}, Could not save (text kept, Retry). A failed save writes nothing (QA hook `?fail=save`).
- Save revision keeps a named version; earlier revisions can be viewed and restored (resource_revisions).
- A project's brief is one note marked `brief: true`, edited on the project Overview.

## 4. Resource to task (resource_tasks, S022)

- "Make a task from this" asks: title (prefilled), who (people picker), due. For yourself it creates one task with `links: [resource]`. For someone else it creates one **offer**; accepting creates exactly one task carrying the resource ID. A pending offer creates no responsibility (S022 acceptance 1–3).
- The task appears in My Work and in the inspector's Linked tasks with the same ID.

## 5. Link issues (resource_link_issue)

- Anyone who can see a link can report "it will not open" with a reason and note. The owner gets an Update (link-issue) and can mark it Fixed. Reports never reveal the target to people outside scope.

## 6. Permissions shown

| Action | Who |
|---|---|
| See | members of the resource's workspace or project |
| Create notes, links, folders | members of the workspace or project |
| Edit, move, archive | owner, contributors, project lead or PM, workspace leaders |
| Add contributors | owner, project lead or PM |
| Report a link | anyone who can see it |

## 7. Events

resource created, edited (with revision), moved, pinned and unpinned (personal, no Changes), archived, contributor added or removed (Update "delegated"), link issue reported and fixed, task made from a resource (or offer sent). Changes entries in the workspace except pins.

## 8. Builders and sizes

RES: records, revisions, sanitizing, link validation, favicon fetch and cache server-side (D37, request R7). Frontend: explorer M, inspector M, notes editor M, resource to task S (shares the offer flow). UX1: art tiles (W105).

## 9. QA checks

1. Row 52 px, icon 20 px, metadata gap 12 px; inspector 360 px with 24 px padding (W017 acceptance 1, 2).
2. One resource-to-task action creates exactly one task or one offer; avatars grant no provider permission (acceptance 3).
3. A failed note save keeps the text and shows the failure.
4. An in-app link to a removed page shows "Removed page" and no title.
