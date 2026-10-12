# bin

Command-line tools run by hand from the repository root. None of them is part of the app bundle.

| Command | What it does |
|---|---|
| `node bin/generate-db-relations.mjs` | Rebuilds `database/relations/ERD.md` (full diagram, one diagram per feature, foreign-key table) from `database/migrations/*.sql` |
| `node bin/generate-code-maps.mjs` | Rebuilds `docs/PAGE_MAP.md` (every page of the three frontends) and `backend/client/API_MAP.md` (backend functions by feature, with tables) from the source |
| `node bin/generate-comfortable-css.mjs` | Rebuilds `frontend/prototype/core/comfortable.gen.css`, the Comfortable text sizes (D53). Re-run after any stylesheet change |
| `node bin/generate-v03-tokens.mjs` | Writes the v0.3 token stylesheet `frontend/app/src/legacy/v03-tokens.css` from the v0.3 token JSON |

Tools that belong to one area stay beside it:

| Command | Area |
|---|---|
| `node frontend/prototype/core/build-assets.mjs` | Rebuilds the prototype's icon bundle `assets.js` |
| `node .planning/dwdg-one-prd/planner-cli.mjs` | Planning workspace CLI (also `npm run prd:check`) |
| `node .planning/workstreams/build-workstreams.mjs` | Regenerates the workstream briefs |
