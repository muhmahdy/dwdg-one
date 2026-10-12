# Backend

Code that talks to a server or shared service. At present this is the browser-side adapter only; there is no server code yet.

| Folder | What it is |
|---|---|
| `client/` | `shared-backend.mjs`: the Supabase client wrapper (Google sign-in, division state load and atomic commit, change subscriptions, signed document downloads, legacy import preview) with its tests. Only the legacy v0.3 workspace imports it; the current UI does not use it. |

Every function, grouped by feature with the tables it touches, is in [client/API_MAP.md](client/API_MAP.md) (generated).

Its schema is in [`../database`](../database/README.md). Setup steps for a Supabase project are in that README.

New server-side services get their own folder here (`backend/<service-name>/`) with a README that states what it owns and how to run it. Run all tests with `npm test` from the repository root.
