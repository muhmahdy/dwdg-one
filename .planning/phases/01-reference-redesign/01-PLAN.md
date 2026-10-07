# Phase 01 plan — whole-app reference redesign

## Outcome

All primary pages and six divisions follow the approved compact CRM/task desktop and Samsung mobile/chart direction. Local workflows, stored records, truthful charts, accessibility, and language/theme parity remain intact. The [active specification](<../../../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/EXPERIENCE_SPEC.md>) is the implementation contract.

## Execute

1. Preserve source and inspect the active boot entry, shared styles, page controllers, and referenced images. Keep storage/domain behavior and the existing startup error boundary.
2. Consolidate shared tokens and components: neutral palette, 216px sidebar, 56px toolbar, 40px nav, collapsible divisions, type scale, 32/24/16px page gutters, 12/20/28px radii, 44px touch targets. Keep reading/plot surfaces opaque and glass limited to floating controls.
3. Recompose Projects to grouped 76px rows by default, with compact combined activity/blocker section and 32px square marks. Preserve Grid/Timeline, records, filters, and accessible exact-value selection. Meet the 1440 × 900 density target with representative ordinary rows.
4. Recompose Home, Tasks, and project detail around compact aligned work rows and a narrower contextual column. Retain list/board/timeline, bulk changes, progress, ownership, blockers, decisions, documents, milestones, and actual-time schedule behavior.
5. Apply coherent reading surfaces and meaningful layouts to Schedule, Documents, Updates, Organization, and Settings. Preserve all six distinct division compositions and their local edit/reload journeys. Translate interface strings and accessible names centrally.
6. Remove conflicting style overrides and unnecessary folder tiles, decorative eyebrows, repeated descriptions, nested cards, and shadows. Preserve the shared overlays, collision handling, focus/draft lifecycle, motion timings, reduced motion/solid surfaces, successful-save dissolve, and Undo. No staggered page entry may delay work.
7. Integrate concurrent edits; run all existing tests, startup integration checks, and production build. Add targeted regression tests only for changed behavioral contracts or discovered defects.
8. Inspect settled rendering at 1440, 1024, 768, 390, and 360px plus 200% zoom, mobile keyboard, long labels, empty/dense/error data. Review every primary page and six divisions in light/dark and English/Indonesian. Correct visual findings before collecting final captures.
9. Exercise chart/date/detail selection, sticky filters, all-edge menus, edit/save/reload, completion/dissolve/rapid Undo, attachments/revisions, storage failure, and filtered report/export/print. Record actual outcomes and short clips. A blocked browser capability remains a disclosed limitation, never a substituted test pass.
10. Update [verification](../../../qa/reference-redesign/VERIFICATION.md), [reference comparisons](../../../qa/reference-redesign/REFERENCE_COMPARISON.md), and planning state with final evidence. Hand off the complete result with the running-app address and honest remaining gaps.

## Safety and compatibility

No backend schema, framework replacement, store reset, seeding over saved records, invented completion history, or automatic translation of user content. Preserve all historical reference assets. Internal parallel waves require no intermediate approval. Tests passing is necessary but insufficient for visual acceptance.
