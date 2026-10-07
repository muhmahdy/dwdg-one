# DWDG UII Workspace

DWDG Workspace is an internal work system for projects, tasks, schedules, decisions, approvals, and division work. This v0.3 build has one DWDG shell and four distinct working spaces: Strategy & Growth, Legal & Finance, Human Resource, and Marketing, Communication & IT. External Engagement and Consulting remain in the workspace switcher with limited project summaries for now.

The app has two modes. **Local preview** runs immediately with illustrative data in this browser. **Shared mode** connects to a configured Supabase project and requires an invited Google account. Local preview is for reviewing the product; it does not enforce account permissions or sync between people.

## Run the local preview

From this directory in PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local address shown by Vite (normally `http://127.0.0.1:5173/`). Use the sidebar or mobile Workspaces control to move between divisions. No Supabase configuration is needed for this mode.

Personal Home puts **Needs You**, **Today**, and **My Work** first. The shared project area retains project and task editing, list and board views, filters, calendar, and the Gantt timeline. Project details also include milestones, blockers, decisions, document links, and cross-project dependencies. Search currently finds projects, tasks, and divisions.

Each division answers a different question:

| Division | Working view |
| --- | --- |
| Strategy & Growth | Now / Next / Later initiative horizon, research links, decisions, and cross-division dependencies. |
| Legal & Finance | Requests and approvals beside an IDR budget flow for allocated, committed, paid, and remaining funds. |
| Human Resource | Recruitment journey, onboarding, assignments, and development records. |
| Marketing, Communication & IT | Content review and publishing pipeline, campaigns, assets, and IT delivery linked to shared projects. |

Division heads can edit starter workflow stages in shared mode. They are editable defaults, not statements of DWDG's approved procedures. The local preview allows experimenting with those flows without account restrictions.

## Enable the shared workspace

With the documented Vite setup, shared mode starts when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set. A host can also supply the corresponding `window.DWDG_BACKEND_CONFIG` values. Shared mode needs a Supabase project with the migrations, Google OAuth, and the invitation hook configured before anyone signs in.

1. Create a Supabase project and configure Google sign-in, its redirect URLs, and the **Before User Created** database hook.
2. Apply the SQL files in `supabase/migrations` in filename order. With a linked Supabase CLI project, use `supabase db push`.
3. Set `private.bootstrap_settings.first_admin_email` to the explicitly chosen first Super Admin email **before the first sign-in**. No email is chosen in this repository. The student email in earlier screenshots is not a default administrator.
4. Copy `.env.example` to `.env` and fill in the project URL and **publishable** key. Restart the Vite server.
5. Sign in as the first Super Admin, create invitations by exact email, and assign division membership in Workspace settings.

The full sequence, bootstrap SQL, private file-storage setup, and policy-test guidance are in [Supabase setup](supabase/README.md). Keep secret and service-role keys out of browser code and all `VITE_` variables.

In shared mode, the server is authoritative. Database policies separate division discovery from membership and full record access. HR candidate notes and finance/legal details have narrower access. Finance transitions are checked on the server, including the rule that a requester cannot approve their own request. The app loads activity and in-app notifications and refreshes when another member changes accessible records. A new shared organization starts with empty working records rather than the preview's example data.

## Existing browser data and import

The existing `dwdg-workspace-v1` browser key is retained for local projects, tasks, events, members, and settings. The four division previews use `dwdg-division-preview-v03`; project detail records use `dwdg-project-extras-v1`. Those stores stay in this browser. **Export local backup** exports the v1 workspace only; it is not an export of the division previews, project detail records, or the shared server.

Nothing uploads an old browser workspace automatically. In shared mode, only a Super Admin can import a v1 JSON backup. The importer previews counts and errors, requires mapping each name-only legacy member to a real account, maps `Client Engagement` to `External Engagement`, and requires a separate commit. Keep the original backup until the imported records have been checked. In local preview, Import replaces the local v1 workspace after an explicit confirmation; it does not import the separate division or project-detail stores.

## Design and code

The [v0.3 pack](READ%20THIS%20IMPORTANT%20FOR%20EVERY%20AI/DWDG_Workspace_Codex_Pack_v0.3/CODEX_BUILD_BRIEF.md) is the source of truth. Its PRD defines product behavior and hierarchy, its token JSON defines concrete values, and its reference manifest distinguishes positive references from negative examples. `scripts/generate-v03-tokens.mjs` generates `v03-tokens.css` from that JSON. The interface serves Pretendard locally, with the existing local Inter as fallback.

The visual system uses a warm neutral canvas and readable operational surfaces. Important controls use a tactile treatment; Prism is reserved for selected objects, with reduced-motion and static fallbacks and a live-surface budget. It is not applied to ordinary data panels.

Key files:

- `workspace.mjs`, `index.html`, and the CSS files: shell, Personal Home, shared project/task/schedule pages, and responsive layout.
- `division-workspaces.mjs` and `project-extras.mjs`: division workflows and project-level records.
- `model.mjs`: local work model and project/task/date validation.
- `shared-backend.mjs`: Supabase Auth, data operations, notifications, and legacy import client.
- `supabase/migrations`: versioned database schema, access policies, transitions, and activity recording.

## Checks and current limits

```powershell
npm.cmd test
npm.cmd run build
```

The tests cover the work model, division records, backend client contracts, and legacy-import preview. The SQL policy script is at `supabase/tests/database/workspace_rls.sql` and should be run against a disposable Supabase database.

The repository does not include a configured Supabase project, Google OAuth credentials, or a designated first-admin email. Live sign-in, database policy behavior, private files, realtime updates, and end-to-end shared workflows therefore still need verification in the target project. The [v0.3 browser review](qa/v03-verification.md) records the current local-preview checks and screenshots. Earlier [verification notes](qa/verification.md) describe the previous prototype and are not evidence that the v0.3 shared mode has passed those checks.

This iteration does not include full accounting, payroll, an enterprise HR suite, automatic social posting, autonomous AI, or complete External Engagement and Consulting workflows.
