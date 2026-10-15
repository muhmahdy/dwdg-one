# Path map — where things moved (8 October 2026)

On 8 October 2026 the loose root files were sorted into `frontend/`, `backend/`, `database/` and `bin/`, then grouped by feature and page. Files were moved with `git mv` (history is kept) and only path strings were changed; no behaviour was edited. Older planning notes, QA reports and the planning workspace still quote the original root paths. Use this table to translate them.

## Folder rules

| Original location | Current location |
|---|---|
| `index.html`, `dwdg-one-preview.html`, `vite.config.mjs` | `frontend/app/` |
| `assets/` (fonts, grain, ribbons) | `frontend/app/assets/` |
| `experience-ui.*` | `frontend/app/src/shared/ui/` |
| `experience-i18n.mjs` | `frontend/app/src/experience/i18n/` |
| `experience-boot.mjs`, `experience-startup.*` | `frontend/app/src/experience/boot/` |
| `experience.mjs`, `experience.css`, `experience-integration.test.mjs` | `frontend/app/src/experience/shell/` |
| `experience-data.*`, `experience-records.mjs` | `frontend/app/src/experience/data/` |
| `experience-editors.mjs` | `frontend/app/src/experience/editors/` |
| `experience-divisions.*` | `frontend/app/src/experience/pages/divisions/` |
| `experience-secondary.*` (Documents, Organization, Settings, Updates) | `frontend/app/src/experience/pages/secondary/` |
| `experience-timeline.*` | `frontend/app/src/experience/pages/timeline/` |
| `model.*` | `frontend/app/src/domain/model/` |
| `division-workspaces.*` | `frontend/app/src/domain/division-workspaces/` |
| `project-extras.*` | `frontend/app/src/domain/project-extras/` |
| `dwdg-one-preview*`, `dwdg-one-accessibility.css`, `dwdg-one-role-shell.test.mjs`, `dwdg-one-optical.*` | `frontend/app/src/dwdg-one/shell/` (`preview-data*` in `data/`) |
| `dwdg-one-home.*` | `frontend/app/src/dwdg-one/features/home/` |
| `dwdg-one-daily*` | `.../features/daily/` |
| `dwdg-one-work*`, `dwdg-one-role-work.test.mjs` | `.../features/work/` |
| `dwdg-one-project-page.mjs`, `dwdg-one-stages.*` | `.../features/projects/` |
| `dwdg-one-schedule*` | `.../features/schedule/` |
| `dwdg-one-resource*`, `dwdg-one-role-resources.test.mjs` | `.../features/resources/` |
| `dwdg-one-note*` | `.../features/notes/` |
| `dwdg-one-access*` | `.../features/access/` |
| `workspace.*`, `v03*.*`, `home-shell.css`, `materials.mjs`, `chart.mjs` (v0.3, kept for reference) | `frontend/app/src/legacy/` |
| `concept-v1.html`, `concept-v2.html`, `refinement.*`, `typography.css`, `card-accents.js` | `frontend/concepts/` |
| `prototype/app|data|i18n|assets|screens|build-assets` | `frontend/prototype/core/` |
| `prototype/work|plan|schedule|perf|accounts` | `frontend/prototype/screens/` |
| `prototype/div-*` | `frontend/prototype/divisions/` |
| `prototype/index.html`, `README.md` | `frontend/prototype/` |
| `shared-backend.mjs`, `shared-backend.test.mjs`, `backend-import-contract.test.mjs` | `backend/client/` |
| `supabase/tests/database/workspace_rls.sql` | `database/tests/workspace_rls.sql` |
| `supabase/README.md` | `database/README.md` |
| `scripts/generate-v03-tokens.mjs` | `bin/generate-v03-tokens.mjs` |

Unchanged: `.planning/`, `PROJECT_REFERENCES/`, `READ THIS IMPORTANT FOR EVERY AI/`, `qa/`, `backups/`, `notes/`, `package.json`, `.env.example`, `.gitignore`, and the agent hand-off files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`).

## Commands that changed

| Before | Now |
|---|---|
| `vite` / `npm run dev` | `npm run dev` (uses `frontend/app/vite.config.mjs`; same address, `http://127.0.0.1:5173/`) |
| `node --test *.test.mjs` | `npm test` (frontend and backend tests together) |
| `node prototype/build-assets.mjs` | `node frontend/prototype/core/build-assets.mjs` |
| `node scripts/generate-v03-tokens.mjs` | `node bin/generate-v03-tokens.mjs` |
| prototype at `/prototype/index.html` | `/frontend/prototype/index.html` on a server rooted at the repository |

## Every moved file (126)

<details><summary>Show the full list</summary>

| Original | Current |
|---|---|
| `supabase/tests/database/workspace_rls.sql` | `database/tests/workspace_rls.sql` |
| `supabase/README.md` | `database/README.md` |
| `scripts/generate-v03-tokens.mjs` | `bin/generate-v03-tokens.mjs` |
| `backend-import-contract.test.mjs` | `backend/client/backend-import-contract.test.mjs` |
| `card-accents.js` | `frontend/concepts/card-accents.js` |
| `chart.mjs` | `frontend/app/src/legacy/chart.mjs` |
| `concept-v1.html` | `frontend/concepts/concept-v1.html` |
| `concept-v2.html` | `frontend/concepts/concept-v2.html` |
| `division-workspaces.css` | `frontend/app/src/domain/division-workspaces/division-workspaces.css` |
| `division-workspaces.mjs` | `frontend/app/src/domain/division-workspaces/division-workspaces.mjs` |
| `division-workspaces.test.mjs` | `frontend/app/src/domain/division-workspaces/division-workspaces.test.mjs` |
| `dwdg-one-access.mjs` | `frontend/app/src/dwdg-one/features/access/dwdg-one-access.mjs` |
| `dwdg-one-access.test.mjs` | `frontend/app/src/dwdg-one/features/access/dwdg-one-access.test.mjs` |
| `dwdg-one-accessibility.css` | `frontend/app/src/dwdg-one/shell/dwdg-one-accessibility.css` |
| `dwdg-one-daily-ui.test.mjs` | `frontend/app/src/dwdg-one/features/daily/dwdg-one-daily-ui.test.mjs` |
| `dwdg-one-daily.css` | `frontend/app/src/dwdg-one/features/daily/dwdg-one-daily.css` |
| `dwdg-one-daily.mjs` | `frontend/app/src/dwdg-one/features/daily/dwdg-one-daily.mjs` |
| `dwdg-one-daily.test.mjs` | `frontend/app/src/dwdg-one/features/daily/dwdg-one-daily.test.mjs` |
| `dwdg-one-home.css` | `frontend/app/src/dwdg-one/features/home/dwdg-one-home.css` |
| `dwdg-one-home.mjs` | `frontend/app/src/dwdg-one/features/home/dwdg-one-home.mjs` |
| `dwdg-one-home.test.mjs` | `frontend/app/src/dwdg-one/features/home/dwdg-one-home.test.mjs` |
| `dwdg-one-note-store.test.mjs` | `frontend/app/src/dwdg-one/features/notes/dwdg-one-note-store.test.mjs` |
| `dwdg-one-note.mjs` | `frontend/app/src/dwdg-one/features/notes/dwdg-one-note.mjs` |
| `dwdg-one-note.test.mjs` | `frontend/app/src/dwdg-one/features/notes/dwdg-one-note.test.mjs` |
| `dwdg-one-notes.css` | `frontend/app/src/dwdg-one/features/notes/dwdg-one-notes.css` |
| `dwdg-one-optical.mjs` | `frontend/app/src/dwdg-one/shell/dwdg-one-optical.mjs` |
| `dwdg-one-optical.test.mjs` | `frontend/app/src/dwdg-one/shell/dwdg-one-optical.test.mjs` |
| `dwdg-one-preview-data.mjs` | `frontend/app/src/dwdg-one/data/dwdg-one-preview-data.mjs` |
| `dwdg-one-preview-data.test.mjs` | `frontend/app/src/dwdg-one/data/dwdg-one-preview-data.test.mjs` |
| `dwdg-one-preview.css` | `frontend/app/src/dwdg-one/shell/dwdg-one-preview.css` |
| `dwdg-one-preview.html` | `frontend/app/dwdg-one-preview.html` |
| `dwdg-one-preview.mjs` | `frontend/app/src/dwdg-one/shell/dwdg-one-preview.mjs` |
| `dwdg-one-preview.test.mjs` | `frontend/app/src/dwdg-one/shell/dwdg-one-preview.test.mjs` |
| `dwdg-one-project-page.mjs` | `frontend/app/src/dwdg-one/features/projects/dwdg-one-project-page.mjs` |
| `dwdg-one-resource-density.css` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resource-density.css` |
| `dwdg-one-resource-identity.mjs` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resource-identity.mjs` |
| `dwdg-one-resource-identity.test.mjs` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resource-identity.test.mjs` |
| `dwdg-one-resource-material.css` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resource-material.css` |
| `dwdg-one-resource-material.mjs` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resource-material.mjs` |
| `dwdg-one-resource-material.test.mjs` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resource-material.test.mjs` |
| `dwdg-one-resources-data.mjs` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resources-data.mjs` |
| `dwdg-one-resources-data.test.mjs` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resources-data.test.mjs` |
| `dwdg-one-resources.mjs` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resources.mjs` |
| `dwdg-one-resources.test.mjs` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-resources.test.mjs` |
| `dwdg-one-role-resources.test.mjs` | `frontend/app/src/dwdg-one/features/resources/dwdg-one-role-resources.test.mjs` |
| `dwdg-one-role-shell.test.mjs` | `frontend/app/src/dwdg-one/shell/dwdg-one-role-shell.test.mjs` |
| `dwdg-one-role-work.test.mjs` | `frontend/app/src/dwdg-one/features/work/dwdg-one-role-work.test.mjs` |
| `dwdg-one-schedule-data.mjs` | `frontend/app/src/dwdg-one/features/schedule/dwdg-one-schedule-data.mjs` |
| `dwdg-one-schedule.css` | `frontend/app/src/dwdg-one/features/schedule/dwdg-one-schedule.css` |
| `dwdg-one-stages.css` | `frontend/app/src/dwdg-one/features/projects/dwdg-one-stages.css` |
| `dwdg-one-stages.mjs` | `frontend/app/src/dwdg-one/features/projects/dwdg-one-stages.mjs` |
| `dwdg-one-stages.test.mjs` | `frontend/app/src/dwdg-one/features/projects/dwdg-one-stages.test.mjs` |
| `dwdg-one-work-data.test.mjs` | `frontend/app/src/dwdg-one/features/work/dwdg-one-work-data.test.mjs` |
| `dwdg-one-work.mjs` | `frontend/app/src/dwdg-one/features/work/dwdg-one-work.mjs` |
| `experience-boot.mjs` | `frontend/app/src/experience/boot/experience-boot.mjs` |
| `experience-data.mjs` | `frontend/app/src/experience/data/experience-data.mjs` |
| `experience-data.test.mjs` | `frontend/app/src/experience/data/experience-data.test.mjs` |
| `experience-divisions.css` | `frontend/app/src/experience/pages/divisions/experience-divisions.css` |
| `experience-divisions.mjs` | `frontend/app/src/experience/pages/divisions/experience-divisions.mjs` |
| `experience-editors.mjs` | `frontend/app/src/experience/editors/experience-editors.mjs` |
| `experience-i18n.mjs` | `frontend/app/src/experience/i18n/experience-i18n.mjs` |
| `experience-integration.test.mjs` | `frontend/app/src/experience/shell/experience-integration.test.mjs` |
| `experience-records.mjs` | `frontend/app/src/experience/data/experience-records.mjs` |
| `experience-secondary.css` | `frontend/app/src/experience/pages/secondary/experience-secondary.css` |
| `experience-secondary.mjs` | `frontend/app/src/experience/pages/secondary/experience-secondary.mjs` |
| `experience-startup.mjs` | `frontend/app/src/experience/boot/experience-startup.mjs` |
| `experience-startup.test.mjs` | `frontend/app/src/experience/boot/experience-startup.test.mjs` |
| `experience-timeline.css` | `frontend/app/src/experience/pages/timeline/experience-timeline.css` |
| `experience-timeline.mjs` | `frontend/app/src/experience/pages/timeline/experience-timeline.mjs` |
| `experience-timeline.test.mjs` | `frontend/app/src/experience/pages/timeline/experience-timeline.test.mjs` |
| `experience-ui.css` | `frontend/app/src/shared/ui/experience-ui.css` |
| `experience-ui.mjs` | `frontend/app/src/shared/ui/experience-ui.mjs` |
| `experience-ui.test.mjs` | `frontend/app/src/shared/ui/experience-ui.test.mjs` |
| `experience.css` | `frontend/app/src/experience/shell/experience.css` |
| `experience.mjs` | `frontend/app/src/experience/shell/experience.mjs` |
| `home-shell.css` | `frontend/app/src/legacy/home-shell.css` |
| `index.html` | `frontend/app/index.html` |
| `materials.mjs` | `frontend/app/src/legacy/materials.mjs` |
| `model.mjs` | `frontend/app/src/domain/model/model.mjs` |
| `model.test.mjs` | `frontend/app/src/domain/model/model.test.mjs` |
| `project-extras.css` | `frontend/app/src/domain/project-extras/project-extras.css` |
| `project-extras.mjs` | `frontend/app/src/domain/project-extras/project-extras.mjs` |
| `project-extras.test.mjs` | `frontend/app/src/domain/project-extras/project-extras.test.mjs` |
| `refinement.css` | `frontend/concepts/refinement.css` |
| `refinement.js` | `frontend/concepts/refinement.js` |
| `shared-backend.mjs` | `backend/client/shared-backend.mjs` |
| `shared-backend.test.mjs` | `backend/client/shared-backend.test.mjs` |
| `typography.css` | `frontend/concepts/typography.css` |
| `v03-materials.mjs` | `frontend/app/src/legacy/v03-materials.mjs` |
| `v03-tokens.css` | `frontend/app/src/legacy/v03-tokens.css` |
| `v03.css` | `frontend/app/src/legacy/v03.css` |
| `vite.config.mjs` | `frontend/app/vite.config.mjs` |
| `workspace.css` | `frontend/app/src/legacy/workspace.css` |
| `workspace.mjs` | `frontend/app/src/legacy/workspace.mjs` |
| `prototype/accounts.css` | `frontend/prototype/screens/accounts.css` |
| `prototype/accounts.js` | `frontend/prototype/screens/accounts.js` |
| `prototype/app.css` | `frontend/prototype/core/app.css` |
| `prototype/app.js` | `frontend/prototype/core/app.js` |
| `prototype/assets.js` | `frontend/prototype/core/assets.js` |
| `prototype/build-assets.mjs` | `frontend/prototype/core/build-assets.mjs` |
| `prototype/data.js` | `frontend/prototype/core/data.js` |
| `prototype/div-ee-cons.css` | `frontend/prototype/divisions/div-ee-cons.css` |
| `prototype/div-ee-cons.js` | `frontend/prototype/divisions/div-ee-cons.js` |
| `prototype/div-fnl-mcit.css` | `frontend/prototype/divisions/div-fnl-mcit.css` |
| `prototype/div-fnl-mcit.js` | `frontend/prototype/divisions/div-fnl-mcit.js` |
| `prototype/div-hr-sng.css` | `frontend/prototype/divisions/div-hr-sng.css` |
| `prototype/div-hr-sng.js` | `frontend/prototype/divisions/div-hr-sng.js` |
| `prototype/i18n.js` | `frontend/prototype/core/i18n.js` |
| `prototype/index.html` | `frontend/prototype/index.html` |
| `prototype/perf.css` | `frontend/prototype/screens/perf.css` |
| `prototype/perf.js` | `frontend/prototype/screens/perf.js` |
| `prototype/plan.js` | `frontend/prototype/screens/plan.js` |
| `prototype/README.md` | `frontend/prototype/README.md` |
| `prototype/schedule.js` | `frontend/prototype/screens/schedule.js` |
| `prototype/screens.css` | `frontend/prototype/core/screens.css` |
| `prototype/work.js` | `frontend/prototype/screens/work.js` |
| `assets/grain.svg` | `frontend/app/assets/grain.svg` |
| `assets/prism-ribbons.svg` | `frontend/app/assets/prism-ribbons.svg` |
| `assets/fonts/InterVariable.woff2` | `frontend/app/assets/fonts/InterVariable.woff2` |
| `assets/fonts/LICENSE.txt` | `frontend/app/assets/fonts/LICENSE.txt` |
| `assets/fonts/Pretendard-LICENSE.txt` | `frontend/app/assets/fonts/Pretendard-LICENSE.txt` |
| `assets/fonts/PretendardVariable.woff2` | `frontend/app/assets/fonts/PretendardVariable.woff2` |
| `supabase/migrations/202609230001_workspace_core.sql` | `database/migrations/202609230001_workspace_core.sql` |
| `supabase/migrations/202609230002_security_and_events.sql` | `database/migrations/202609230002_security_and_events.sql` |
| `supabase/migrations/202609230003_admin_import_and_views.sql` | `database/migrations/202609230003_admin_import_and_views.sql` |
| `supabase/migrations/202609240001_atomic_commits_and_catalog.sql` | `database/migrations/202609240001_atomic_commits_and_catalog.sql` |

</details>
