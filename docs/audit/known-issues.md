# Known issues and open items

Found during the migration. Each item says where it came from and what closes it. Status: **open**, **fixed** (with the commit), **accepted** (documented limitation).

| # | Found | Issue | Source | Closes when | Status |
|---|---|---|---|---|---|
| K1 | 2026-10-15 | The first administrator cannot finish signing in. The "before user created" hook admits the e-mail in `private.bootstrap_settings`, but `link_current_user()` only links an existing person or one created from an invitation, so the first admin gets "This account has not been invited". | `database/migrations/20261012000100_foundation.sql` (carried over from the Stage 2 plan) | A new migration lets `link_current_user()` create an active Admin person for the bootstrap e-mail when no person has it yet, plus an `rls_smoke.sql` check. Phase 4. | open |
| K2 | 2026-10-15 | `load_workspace()` returns every visible row in one call, with no pagination. | Stage 2 design (M6) | Acceptable for about 40 members (PRD `vision-capacity`). Per-table paging when measured size grows (PRD `infrastructure_scaling`). | accepted |
| K3 | 2026-10-15 | In-row workflow rules (who approves, private fields, publication) are enforced only by the screens, not by the database. | `database/policies/RLS_RULES.md` "What the database does NOT enforce" | Owner specifies which rules need server triggers. | open (owner decision) |
| K4 | 2026-10-15 | Last save wins per row; there is no version check for concurrent edits. | Stage 2 design | Row version column plus a conflict message (PRD `engineering-errors` "stale/conflict"). | open |
| K5 | 2026-10-15 | Lists that are kept newest-first (`updates`, `changes`) shift every row's position when one is added, so each new update re-sends all position values. | Positional `pos` column (M6) | Acceptable at current volume; a time-ordered key or descending position would avoid it. | accepted |
| K6 | 2026-10-15 | The production JavaScript bundle is 1.1 MB (326 KB gzipped). Most of it is the 4,915-entry Indonesian dictionary and libraries, loaded even for English users, plus all pages in one chunk. | First React build | Load the dictionary on demand and split pages by route once the features are migrated. | open |
| K7 | 2026-10-15 | Sidebar pins have no item art yet; the art comes with the Projects, Programs, Operations and Resources modules (shader identity art). | Migration in progress | Those modules migrate. | open |
| K8 | 2026-10-15 | Hosting choice conflicts: master prompt says Vercel, owner decision D3 says Cloudflare Pages. | decision-log M13 | Owner decides. | open (owner decision) |
