# UX3 interface

What other streams may rely on: entity fields, commands, events, routes, components, decisions. Empty until the first session publishes it.

## UI sprint · UXP (6 Oct 2026, prototype)
- Routes: `#/performance`, `#/performance/<personId>`, `#/performance/div/<divId>`, `#/attention`, `#/attention/<escalationId>`, `#/oversight`.
- Board account: `role: 'board'`, `div: null`, id `board-hadi`; `ROLES.board` (rank 0) and brand icon `role-board` are added at runtime by perf.js. Test for Board with `p.role === 'board'`. The record is in `db.people` only on the sign-in screen and during a Board session; Board writes are refused by a capture-phase guard in perf.js.
- `db.perf.escalations[]`: `{id, kind: 'blocker', ref {type, id}, blocker, div, title, from, to, reason, neededBy, state: requested|acknowledged|returned|resolved|withdrawn, reply, nextOwner, nextDate, resolution, answeredBy, answeredAt, resolvedAt, createdBy, createdAt}`. Update types `perf-esc`, `perf-esc-ack`, `perf-esc-ret`, `perf-esc-done`, `perf-esc-next` (ref `{type: 'link', h: 'attention/<id>'}`).
- Attention lists cross-division handoffs from `db.ee.handoffs` items with `state: 'requested'` and `from`/`to` (or `sender`/`receiver`), `title`, `requestedAt`, `neededBy`. UXD2: use these names or tell UXP.
- Performance reads `db.hr` (registers, cycles, assessments) through `window.ensureHrData`; it never writes HR records.

## UI sprint · UXA (7 Oct 2026, prototype)
- Routes: `#/members`, `#/members/<id>`, `#/members/<id>/transfer|pause|leave`, `#/members/audit`, `#/invites`, `#/invites/<id>`, `#/invite/<id>` (public link), `#/appointments`, `#/handover`, `#/welcome`.
- `db.acct` = `{v: 1, invites[], grants[], memberships[], actions[], handovers[], log[], office {version}, hidden[]}`.
  - invite: `{id, name, email, div, role, batch, expires, state: pending|accepted|active|revoked|declined (expired is derived from expires), person, delivery {by, at}, createdBy, createdAt, acceptedAt, acceptedAs, approvedBy, approvedAt, revokedBy, revokedAt, reason, version, history[]}`.
  - grant: `{id, person, role, unit, title, from, to, by (null = recorded at setup), at, reason, predecessor, state: active|ended|scheduled|reversed}`; membership: `{id, person, div, from, to, by}`.
  - action (transfer, pause, left, alumni): `{id, kind, person, from, to, effective, reason, review, map {taskId: keep|open|offer}, offers[], by, at, state: applied|reversed}`.
  - handover: `{id, kind: normal|recovery, from, to, state: nominated|accepted|declined|confirmed|cancelled|superseded, effective, after (outgoing division), ist, reason, ev, version, createdBy, createdAt, answeredAt, confirmedBy, confirmedAt}`.
- Person fields added at runtime: `status` also takes `suspended | left | alumni | declined`; `departedOn`, `welcomedAt`, `email` (invited people).
- Update types (ref `{type: 'link', h}`): `acct-accepted`, `acct-approved`, `acct-moved`, `acct-appointed`, `acct-appt-ended`, `acct-ho`, `acct-ho-rec`, `acct-ho-yes`, `acct-ho-no`, `acct-ho-done`. Changes entries carry `target.h = 'members/<id>'`.
- Other sessions can link to `#/members` (UXD1 People already does) and read `db.acct.actions` for unresolved duties.
