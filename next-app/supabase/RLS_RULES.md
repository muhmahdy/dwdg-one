# Who can see and change what (row level security)

Every table has row level security switched on. This page says, in plain words, what each rule is, where it comes from in the
prototype, and what the database does **not** enforce. The SQL is in `migrations/20261012000200_workspace_tables.sql` (generated from
`schema-spec.mjs`); the helper functions are in `migrations/20261012000100_foundation.sql`. `tests/rls_smoke.sql` checks 61 of these rules.

## Words used

| Word | Meaning (same as the prototype) |
|---|---|
| active | The person's status is `active`. People waiting for approval, paused or former members see nothing except themselves. |
| writer | Active and not the Board. "Board accounts are read-only." |
| sees division D | Admin, President, VP and Board see every division; everybody else sees only their own (`visibleDivs`). |
| top | President or VP. `top or admin` adds the Admin flag. |
| unit lead | Same division as the row and rank 2 or more (Co-Director, Director; the Admin counts as rank 9). |
| HR lead | HR division, Co-Director or above. |
| me | The person linked to the signed-in Google account (`people.auth_user_id`). |

## The rule behind every table

* **select**: active AND the table's *read* rule.
* **insert / update / delete**: writer AND the table's *write* rule (equal to the read rule unless noted).

## Tables

| Table(s) | Read rule | Write rule | Prototype source |
|---|---|---|---|
| people | active: everyone; not active: only themselves | self-edit; Admin, top, HR lead may add; Admin, top, HR lead, Director may edit others. A trigger limits role / division / admin / board / status changes: nobody changes their own; Admin, top, HR lead any; Director only pauses/restores someone of lower or equal rank | `can()` in accounts.js |
| tasks | sees the task's division, or owner / reviewer / creator / assignee, or can see the task's project | same | work.js, `canSeeProject` |
| projects | `canSeeProject`: organisation-wide, own division, lead, PM, in team, joint project joined by someone from a division I see, or I own a task in it | create: rank 2+ in a division I see (`canCreateProject`); edit: that, or lead / PM / team member; delete: same as create | plan.js |
| milestones, blockers, decisions | can see the project, or owner / approver / creator | same | plan.js |
| meetings | organiser, note-taker, invited, can see the project, or top / admin | same | schedule.js |
| offers | sender, receiver, top / admin | same | work.js |
| resources | sees the division, owner, creator, contributor, or can see the project | same | plan.js |
| programs | sees the division, owner, creator, or a partner division I see | same | people.js `canSeeProgram` |
| routines | personal: owners and creator; otherwise sees the unit or is an owner | same | work.js `canSeeRt` |
| unavailable, gbusy | every active person (needed to find meeting times) | the person themselves, or Admin | schedule.js |
| updates (notifications) | only the person it is for (Admin sees all) | anyone may send one; only the receiver changes or removes it | app.js |
| changes (activity log) | sees the workspace division, or actor | anyone may add; actor or Admin changes | plan.js |
| pins | only the owner | owner | pins.js |
| hr_registers | HR staff, top / admin, unit lead of the register's unit | same | `canSeeReg` |
| hr_notices, hr_actions | HR lead, top / admin, the person concerned (actions: also the owner) | same | HR rules |
| hr_cycles | HR staff, top / admin, anyone on the roster | same | div-hr-sng.js |
| hr_assessments | HR lead, top / admin, the person, the scorer, the reviewer named in the cycle roster | same | div-hr-sng.js |
| hr_rounds, hr_packets | panel / HR lead / top (rounds); HR lead / top / receiver / creator (packets) | same | `canSeeRound` |
| hr_onboarding_* | HR staff, top / admin; instances also the person, buddy, HR owner | same | div-hr-sng.js |
| sng_* | SnG members, top / admin, owner / creator / reviewer; never the Board | same | `seeDiv` |
| ee_orgs, ee_opps | EE and Consulting (read); EE (write); never the Board | EE | `seeDiv` |
| ee_contacts, ee_interactions, ee_fu, ee_postpones | EE members, top / admin | same | `seeDiv` |
| ee_handoffs | EE; after it is sent, also the receiving unit's lead or the named receiver | EE, receiving lead, receiver | `canSeeHo` |
| cons_* | Consulting members, top / admin; engagements and deliverables also the project's lead / PM; knowledge also owner, author, named people, and `org`-wide articles | same (knowledge: owner / author) | `canSeeEng`, `canSeeArt` |
| fnl_legal | FnL members, top / admin, requester, creator, unit lead | same | `canSeeL` |
| fnl_requests | FnL members, top / admin, requester | + creator | `canSeeF` |
| fnl_allocations | FnL members, top / admin, unit lead | same | FnL rules |
| fnl_register, payments, incoming, periods | FnL members, top / admin | same | FnL rules |
| mcit_campaigns, content, accounts | MCIT members, top / admin, **and the Board (read only)** | MCIT members | `mcFull` |
| mcit_briefs, mcit_it | the above, plus requester, creator, unit lead | same minus the Board | `canSeeIt` |
| acct_invites | Admin, HR lead, top; the invited person's own invitation | Admin, HR lead (the invitee may answer their own) | `canInvView` |
| acct_grants, acct_memberships | Admin, top, HR lead, Directors; each person their own rows | Admin, top, HR lead | `canMembers` |
| acct_handovers | Admin, top | Admin, top | `canHoView` |
| acct_log | Admin, President | any writer (the log is append-only by habit) | `canAudit` |
| perf_escalations | the two people involved, creator, top / admin, Board | involved people, creator, top / admin | perf.js |
| store_values | every active person | every writer; the grant lists, numbering policy and office version only top / admin | accounts.js, fnl |
| divisions | every signed-in person | nobody (fixed list) | data.js |

## What the database does NOT enforce (still only in the prototype's screens)

These stay client-side exactly as before; the database cannot be stricter without writing a trigger per workflow. They are the honest
gaps between "who can open the row" and "what they may do with it". Tell me which you want as triggers in Stage 3/4.

1. **Actions inside a row.** Who may approve a finance request, "no self-approval", who may publish content or issue a document number,
   stage changes (draft, review, approved), Undo rules. Anyone who may write the row may write any field of it.
2. **Fields inside a row.** Private notes (`priv` on legal and IT records), `confidential` flags, restricted source data in SnG,
   a person's phone when `hidePhone` is on, and a knowledge article being published before others may read it. The whole row is
   readable by everyone who may read the row. Only the screens hide the field.
3. **Approximations.** `unit lead` for the HR register, `fnlIn` (FnL membership) and similar helper rules were read from the code, not from
   a specification; the table above is the contract to review.
4. **Concurrent edits.** Last save wins per row. The prototype had one user per browser, so it never had to decide. (Row version
   checks can be added later without changing the data.)
5. **Referential integrity.** Foreign keys exist where the full demo data satisfies them (31 of them, plus people.div → divisions). Links the prototype leaves
   dangling on purpose (for example a milestone's `parent` that points at a task) have none.
6. **Board performance views.** The Board reads core work tables (as `visibleDivs` allows) but not division-private tables, except Marketing / IT.
