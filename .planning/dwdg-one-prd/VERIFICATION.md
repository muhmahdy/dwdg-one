# DWDG’ONE planning draft — verification, version 0.2

Checked 3 October 2026. This evidence concerns the editable PRD, source consistency and observed planning-editor behavior. It does not establish implementation, live security or production launch acceptance. Draft0.1 evidence is preserved in revisions/0.1/VERIFICATION.md.

## Final source snapshot

- 748 unique nodes in six top-level groups; 92,413 generated Markdown words.
- 40 Confirmed, 638 Proposed, 47 Open, 23 Deferred. These are decision states, not build progress.
- 1,685 direct prerequisite edges on681 nodes; zero missing references, self-dependencies or hierarchy/dependency cycles.
- Independent reachability review found zero nondeferred P0/P1 prerequisite paths to Deferred scope.
- 122 flow nodes describe31 journeys and84 numbered stage groups. Measured design adds28 nodes; high-level groups/PRD contracts10; operations204; Changes19; original foundation65, product252, detail48 retained.
- Final fragment867,847 bytes, below the1MB conversation limit. No requirements were dropped to meet presentation size.
- Final fragment SHA256: da6c718d984ac8be2842eda1bc4b31490a3ee0db096f63dd5f2a09229ef9f609.
- Earlier conversation source remains unchanged at SHA256 b0bb285787b861f167f8dc3cb740dcf856a9f8dddc4580f6e738264c2615d2fa.
- Build validated all authoring inputs before writing the portable/readable seed and current conversation source. Generated seed has no disposable browser QA edits/history.

## Functional checks

All41 focused planning-editor checks passed against the final748-node source. Coverage includes all-field editing/draft flushing, additions, deliberate subtree deletion, safe moves, Undo/Redo, search, persistence/restoration, corrupt/incompatible-state recovery, concurrent stored revision protection, import validation/replacement, append-only local history/imported labels, compact host fallback and export-required behavior.

New checks establish continuous default All nodes rendering in complete hierarchy order, full title/path display, independence from outline search, Read & edit routes, numbered acceptance lists, clickable prerequisites/missing-ID flags, entire-map scope and selection, and readable minimum100% zoom across restore/buttons/wheel. The actual seed rendered748 distinct rows and748 map nodes/747 hierarchy connectors. The happy-dom All nodes load observed277ms is a local functional-test measurement, not browser performance or a product SLA.

## Actual browser observations

The complete source was served through the existing local Vite preview and inspected in the Codex in-app browser.

- All nodes contained748 rows with748 unique IDs, including the final prd-management-consultation node. The accessibility snapshot abbreviates large trees; DOM counts established full actual rendering, with no user-facing branch pagination.
- Six group jump routes were present; the UI/UX group jump brought its complete heading into view.
- Read & edit opened a Consulting journey with its five numbered stage groups. Clicking consulting_roles prerequisite selected that target ID.
- Desktop typography displayed four native ordered acceptance items and two prerequisite routes. Forms displayed three numerical acceptance items.
- A disposable owner edit saved; Changes attributed it to This device. Undo restored Design + frontend and appended its own event. Both recorded events remained available;748 requirements remained.
- Portable JSON exposed748 unique nodes, six roots-under-root, the correct v02 seed, two test audit events and the restored owner. Readable Markdown exposed748 requirement IDs and748 acceptance sections. Downloads/clipboard were not claimed verified; selectable export text was inspected.
- Entire map drew748 nodes and747 connectors, with both Previous/Next branch controls hidden. Zoom remained100%; pan allows inspection without reducing text below its ordinary size.
- At1024px viewport, final inner document width/scroll width both977px. At390px All nodes both328px, and ordinary Read/forms both343px; at320px both273px. Form field widths319px and249px at390/320 respectively. Different wrapper/inner scrollbars explain these available widths. No horizontal page overflow was observed.
- Narrow-width screenshot showed readable wrapped criteria/dependencies and stacked editing layout. Physical phone/on-screen keyboard interaction was not exercised.
- Final source was reloaded into a separate clean QA preview after prose-spacing polish. Its full list/map counts were verified again, and console error query returned an empty list.
- Temporary viewport overrides were reset, QA tabs closed and preview service stopped after inspection.

Saved final desktop proof: qa/all-nodes-v02.jpg. It shows the header, complete748 count, All nodes selection, group jumps and continuously readable requirement rows.

## Preservation and saving limits

No actual user-exported revision was available. This update expands the authored seed; it does not silently merge unseen browser edits. Draft0.1 files and its original conversation source remain available. The first reused preview correctly refused mismatched old host state and preserved it; a separate QA URL was used for disposable tests instead of replacing that saved state. Final prose polish used another clean QA URL. These are test copies; the supplied seed is clean.

The sandboxed preview used compact host retention, not unlimited browser storage. Small edits/history were exercised there; the functional suite covers full browser storage and large-state refusal. Inline host behavior can vary. Portable JSON is the durable handoff; browser edits do not automatically rewrite seeded project files. Use deliberate import/export when choosing a revision. The8MB portable-package validation limit is a safety bound on imports, not an arbitrary document node-count cap.

Inspection limitations: desktop/phone-width rendering and mouse/keyboard paths were observed; real-device touch/keyboards, assistive-technology conformance, every host/theme and exhaustive usability are unverified. A page-top shortcut inside the preview moved the inner document but left the outer wrapper scroll position; a fresh clean preview provided final page-top proof. A read-only export-inspection helper could not use TextEncoder in its restricted scope; counts were then obtained directly from the textarea. Neither inspection issue mutated requirements.

## Product evidence boundary

No existing app code, three local stores, original survey, useful domain logic or reference assets were reset. No authenticated multi-user product history, OAuth/RLS, provider billing, cloud deployment, backup automation, real-data migration/restore or rollback was performed. Those remain planned requirements and Open launch decisions.

Source boundaries remain: survey has eight responses and no HR/S&G respondent; the referenced ChatGPT handoff retrieval was bounded at20,000 characters. Official process, accessibility, provider and database sources are linked in source fields, CONSULTATION_REVIEW.md and OPERATIONS_RESEARCH.md. Proposed values and institution-specific SOP/authority decisions are not passed evidence.
