# DWDG reference-led redesign

**Goal:** replace the rejected visual composition across the entire local application with the user's approved compact CRM/task desktop and Samsung mobile/chart direction. Useful work, clear hierarchy, and fewer competing containers are the acceptance target.

## Source of truth

- [Read first](<../READ THIS IMPORTANT FOR EVERY AI/DWDG_Experience_v1.0/READ_FIRST.md>) and the active v1.1 specification in the preserved v1.0 directory.
- [Requirements](REQUIREMENTS.md), [roadmap](ROADMAP.md), [current state](STATE.md), and [execution plan](phases/01-reference-redesign/01-PLAN.md).
- [Current verification](../qa/reference-redesign/VERIFICATION.md) and [reference comparisons](../qa/reference-redesign/REFERENCE_COMPARISON.md).

## Constraints and decisions

- Keep Vite and vanilla JavaScript, the persistent shell, local stores, stable record IDs, validation, translations, and theme settings. Never reset records or reseed over saved data.
- Deliver every primary page and all six divisions in one implementation. Execution may run in parallel internally; no intermediate user-approval checkpoint is required.
- Backend architecture, cloud files/sync, real signatures, external messaging, and multi-user enforcement remain deferred.
- Reuse the startup boundary. Run via the Vite address, never direct `file://` opening.
- User content remains in its original language. UI labels, validation, accessible names, and chart explanations use the shared English/Indonesian system.
- Source is preserved in `backups/reference-redesign-before-20260926-195458.zip`; do not remove the original v0.3 references or earlier source snapshot.

The GSD and UI-brand skills guide goal-based execution and consistency. The user's concrete approved design rules take precedence over generic skill examples. Task completion and passing tests do not by themselves establish visual acceptance.
