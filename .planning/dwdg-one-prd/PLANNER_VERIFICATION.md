# Planning workspace verification

5 October 2026. Evidence for the local PRD planning tool; this is not product launch acceptance.

## Delivered and initialized

`npm.cmd run prd` serves the current planning app at `http://127.0.0.1:5174/`. The canonical source is `state/planning-workspace.json`, with a complete generated reading copy in `state/PLANNING_WORKSPACE.md`.

The checked initial source has 772 requirements, 102 WBS records (six groups plus 96 delivery packages), 96 Kanban cards, 15 activities and 76 stories. All 96 cards are Backlog with empty completion evidence. The canonical source is revision 0 with no test edits or fabricated saved-change events. Unknown estimates remain null. The 748-node historical PRD JSON is preserved: SHA-256 `464d67020b630c5087f0139c645918d453a73667090ab35ad7d31fc39a057d6b`.

Read `PLANNER_CONTENT_REVIEW.md` for the sources, 36 reconciled requirements, 24 added requirements, dependency coverage and intentionally open decisions.

## Automated checks actually passed

| Check | Result |
|---|---|
| `node .planning/dwdg-one-prd/editor-test.mjs` | 41 existing editor functional checks |
| `node --test .planning/dwdg-one-prd/editor-tree.test.mjs` | 12 rooted-tree/bridge checks |
| `node --test .planning/dwdg-one-prd/planner-store.test.mjs` | 18 file, API, validation and CLI checks |
| `node --test .planning/dwdg-one-prd/planner-ui.test.mjs` | 16 planning UI functional checks |
| `npm.cmd run prd:check` | Valid canonical document, revision 0, 772/102/96/76 records |

These are 87 individual functional checks; Node's outer test-file counts differ where a test script reports its own checks. The last CSS-only compact-map adjustment was followed by all 16 planning UI checks and actual browser inspection.

Checks cover preservation of existing state/unknown fields, malformed-history rejection, complete wide trees, reference and cycle validation, atomic replacement, exact prior-byte backups, stale revisions, simultaneous CLI/service commits, corrupt-state preservation, read-only import validation, import review, persistent Changes, real linked-requirement navigation, CRUD guards, Done evidence, and preserving newer edits during asynchronous saves/polls. Work Undo cannot discard a later PRD edit from an older full-document snapshot.

## Actual browser and cross-tool evidence

An isolated copy at `qa/planner-v03/fixture/` was served on port 5175; the canonical planning source was not used for destructive or mutation tests.

1. A Kanban card was moved through its status menu and saved, then the page was reloaded. The saved card remained In progress.
2. The shared CLI then changed that same card's owner with the revision hash and recorded actor `QA external CLI`. The app read the external saved change and showed the edited owner.
3. A linked card opened the correct requirement through the iframe editor's public interface.
4. That requirement's owner was edited and Save now was pressed. The actual fixture file reached revision 4, contained `QA requirement owner`, one requirement mutation event and four file-service history events. The Changes page displayed the saved requirement change, CLI change and card move.
5. The canonical app's Show every node control rendered **772 nodes and 771 parent connectors** together, with no Next-branch paging. Root overview restored the root plus six main branches. Main branch titles remain readable and controls provide pan/zoom and keyboard alternatives.
6. The canonical WBS rendered all **102 table rows**, Kanban all **96 cards**, and the story map all **76 stories under 15 activities**, without a small presentation cap.
7. At a temporary 412 × 915 viewport, the page itself fit the viewport (397 px document width including scrollbar layout). The tab bar and Kanban remain scrollable inside their own regions. The viewport was reset after inspection.

Saved visual evidence:

- [Horizontal rooted tree](qa/planner-v03/horizontal-tree.png)
- [Work Breakdown Structure](qa/planner-v03/work-breakdown.png)
- [Kanban](qa/planner-v03/kanban.png)
- [User story map](qa/planner-v03/story-map.png)
- [Phone-width Kanban](qa/planner-v03/mobile-kanban.png)

## Portability and remaining limits

The JSON/Markdown files and documented Node CLI are available to Codex, Claude, Antigravity and any other local tool with access to this project. The real shared CLI/browser edit round trip was verified. Claude and Antigravity applications themselves were not launched or connected during these checks. `AGENTS.md`, `CLAUDE.md` and `GEMINI.md` point future sessions to the current source and `AI_EDITING.md`.

The local service must run for file saves. Browser drafts and direct raw-file edits do not provide the same durability/history guarantees as a successful service/CLI save. Use the visible Saved to project file status, validated CLI writes and independent portable exports. Direct raw-file writers do not participate in the service lock; no claim of safe arbitrary concurrent editors is made.

Native touch drag gestures, full screen-reader usability, other browsers and prolonged large-history use remain unverified. The status-menu and edit-form alternatives are present. Earlier unseen conversation/browser PRD revisions are not automatically merged and must be exported/imported deliberately.

No product authentication, cloud deployment, live role enforcement, multi-user audit identity, provider limits, production restore or department adoption is proven by this planning tool. No external service was provisioned. Local actor labels are source labels, not authenticated identities. Product completion remains separate from PRD decision status.
