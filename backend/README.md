# Backend

dwdg'ONE has **no dedicated backend service**, and this folder deliberately contains no server code (decision M5 in [docs/architecture/decision-log.md](../docs/architecture/decision-log.md)).

Supabase is the backend:

| Need | Provided by |
|---|---|
| Sign-in (Google, invite-only) | Supabase Auth plus the `private.before_user_created` hook ([database/migrations/20261012000100_foundation.sql](../database/migrations/20261012000100_foundation.sql)) |
| Reading the workspace | RPC `load_workspace()`, filtered by row level security |
| Saving changes atomically | RPC `apply_changes(text)`: one transaction across tables |
| Authorisation | RLS policies on every table ([database/policies/RLS_RULES.md](../database/policies/RLS_RULES.md)) |
| Linking an account to a person, invitation preview | RPCs `link_current_user()`, `invite_preview(id)` |

Why: every action in the product is a record change that RLS can authorise as the signed-in person. The PRD asks for no second general backend runtime for simple UI actions (`infrastructure_functions`), and the master prompt says not to build a backend for appearance.

When one is needed, for example scheduled exports, reminders, or privileged multi-record operations that RLS cannot express (PRD `engineering-transactions`), add a Supabase Edge Function or a Postgres function first. Only if that is not enough, add `backend/src/` following master prompt §4, with its own README, tests and deployment notes.

The browser-side v0.3 adapter that used to live in `backend/client/` is archived in `bin/backend-client-v0.3/`.
