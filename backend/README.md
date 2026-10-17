# Backend

The server now lives in [`../server/`](../server/README.md) (decisions M25 and M26 in [docs/architecture/decision-log.md](../docs/architecture/decision-log.md); it replaces M5, "no dedicated backend service"). This folder stays documentation only.

## Today

Until the division Supabase projects exist, the app still talks to one Supabase project directly (`VITE_DATA_MODE=supabase`, the default):

| Need | Provided by |
|---|---|
| Sign-in (Google, invite-only) | Supabase Auth plus the `private.before_user_created` hook ([database/migrations/20261012000100_foundation.sql](../database/migrations/20261012000100_foundation.sql)) |
| Reading the workspace | RPC `load_workspace()`, filtered by row level security |
| Saving changes atomically | RPC `apply_changes(text)`: one transaction across tables |
| Authorisation | RLS policies on every table ([database/policies/RLS_RULES.md](../database/policies/RLS_RULES.md)) |
| Linking an account to a person, invitation preview | RPCs `link_current_user()`, `invite_preview(id)` |

## Target

One hub project and six division projects, with the server in `../server/` as the only holder of the division keys. The browser keeps Supabase only for signing in. Plan: [.planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md](../.planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md). Database layout: [database/README.md](../database/README.md).

The browser-side v0.3 adapter that used to live in `backend/client/` is archived in `bin/backend-client-v0.3/`.
