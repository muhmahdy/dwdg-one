# DWDG’ONE planning draft — verification evidence

Checked 3 October 2026. This evidence concerns the editable PRD and its source consistency. It does not establish that the future product has been implemented, deployed, or accepted.

## Final source snapshot

- 579 nodes across 25 top-level branches; 57,643 generated Markdown words.
- 39 Confirmed, 473 Proposed, 45 Open, 22 Deferred. These describe decisions, not implementation progress.
- Final conversation fragment: 562,507 bytes, below the 1 MB surface limit.
- Fragment SHA-256: `b0bb285787b861f167f8dc3cb740dcf856a9f8dddc4580f6e738264c2615d2fa`.
- Section counts: foundation 65, product 252, detail 48, Changes 19, operations 195.
- Generated files and the conversation copy were rebuilt from all final section inputs. No existing product data was reseeded or migrated.

The builder validated required fields, allowed statuses/priorities, one root, unique IDs, resolving parents and an acyclic hierarchy. The independent consistency review additionally checked normalized dependency references and their graph. The review reconciled current budget, conditional upload scope, subtask semantics, workspace audit identity and launch defect criteria. See `CONSISTENCY_REVIEW.md`.

## Functional checks

All 31 focused planning-editor checks passed. They cover draft flushing, all-field editing, additions, concrete subtree deletion confirmation, Undo/Redo, safe moves, searching, map rendering, stored-document restoration, malformed/cyclic import rejection, deliberate import replacement, recovery of corrupt/incompatible state, concurrent stored-revision conflicts, append-only history, imported-history labeling and opaque-origin compact persistence.

The fallback tests also proved that oversized host state shows an export-required message rather than claiming it was retained or erasing the last saved copy. Storage scope is separate from the existing product's local stores.

## Actual browser evidence

The complete draft was loaded through the existing Vite preview in the Codex in-app browser. Real UI actions verified:

- Adding a disposable child changed 579 to 580 entries. Its title and behavior text saved.
- Changes showed the addition and field edits attributed to **This device**, with readable before/after values.
- Deletion displayed the affected branch and count before confirmation. Delete returned to 579; Undo restored the test child; Redo removed it. All six events remained in history.
- Portable JSON contained all 579 requirements and all fields, six audit events, the correct Rp35,000 target/Rp50,000 ceiling, and no deleted test node.
- Readable export contained 579 requirement IDs and 579 acceptance sections.
- Reload restored the test history and the expected requirement count under the compact chat-state fallback.
- A final rebuild changed the seed fingerprint. The preview refused to silently apply the old test-state delta. The obsolete disposable QA state was explicitly replaced through its concrete confirmation; the delivered source remains a clean baseline.
- The final map opened 6 of 25 top branches with a clear display-page label; all 579 nodes remained in the document. Paging limits rendering, not document content.
- At a 1,024px browser viewport, the inner page width and scroll width both measured 977px. At 390px they both measured 343px; at 320px both measured 273px. No horizontal page overflow was observed. Narrow editor fields stacked; the budget requirement remained readable. The wrapper and browser scrollbars explain the inner widths.
- No browser console errors were present in the final check. The temporary viewport override was reset.

The saved desktop evidence is `qa/desktop-map.jpg`. A browser action targeting an unfocusable body for a page-top shortcut timed out; the enabled toolbar button provided the keyboard route. This was an inspection action, not a failed document mutation.

## Saving and evidence limits

The tested sandboxed preview used compact host retention, not unlimited browser storage. Full-document browser saving is covered by focused functional checks but was not used by this opaque-origin preview. Inline host behavior can vary. Portable JSON is the durable handoff; browser edits do not automatically rewrite seeded project files. Download or clipboard may be restricted, so exports also expose selectable text. An actual downloaded edited file was not claimed or verified here.

Desktop/phone-width rendering and mouse/keyboard actions were inspected. Physical phone touch/keyboard behavior, assistive-technology conformance, every host theme, and exhaustive usability testing are not established by these checks. The rightward map is a scoped navigable view; Read & outline is the alternative for dense reading.

No authenticated multi-user production history, cloud permissions, live OAuth, database isolation, provider billing, backup automation, recovery drill, migration, deployment or rollback was performed. Those remain explicit requirements and Open launch decisions. No vendor accounts or organizational domain were created and no payments were made.

The referenced chats, required experience pack, relevant actual design references and original survey were read as context. The survey's eight responses remain a small sample with no HR or Strategy & Growth respondent. The retrieved ChatGPT handoff was bounded at 20,000 characters, as documented in the source notes; unseen content has not been presented as confirmed fact.
