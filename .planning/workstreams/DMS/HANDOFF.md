# DMS handoff log

Newest first. Each session appends: date, model, what changed (paths), evidence, open questions, next step.

## UI sprint · UXD3 (MCIT screens), 7 Oct 2026, Claude Opus 5.5

**Files:** `prototype/div-fnl-mcit.js` and `prototype/div-fnl-mcit.css` (MCIT part; FnL is in DFL/HANDOFF.md).

**Data:**
- Seeds `db.mcit` once per demo store. Hook: `window.ensureMcitData()`.
- Reuses `p-site`, `p-oprec`, task `t18` and blocker `b3` by ID; adds one canonical task `tk-it-forms`. Reads HR's Member of the Month packet from `db.hr.packets` (via `window.ensureHrData`) without copying it.

**Screens and routes** (MCIT workspace nav: Content, Requests, Accounts; every other workspace gets "Requests to MCIT"):
- `#/content`: Calendar (month view; planned publication, "planned date passed, not published", published with evidence, internal due, and HR's agreed date, each with its own icon and word), Board (content states plus Canceled) and Table (internal due, planned and actual dates in separate columns). Campaign filter, campaign list, CSV export.
- `#/content/new` and `#/content/new/<briefId>`: one item with executor, reviewer (must differ), channels, planned date and internal due. From a brief it also marks the brief accepted.
- `#/content/<id>`: a dates table that keeps internal due, approval, planned and actual publication apart per channel; versions with review on an exact version; a new version after approval makes it "Approval stale"; request changes creates one revision task for the executor; schedule only the approved version; record publication per channel (link or attestation, never a future time); a failed channel creates a follow-up task; move the planned date with a reason (approval unchanged); corrections and takedowns; cancel with a reason. `ct-pages` links the existing task `t18`.
- `#/it-requests`: IT and Briefs tabs, plus HR publication requests (read only, linked to `#/recognition/...`). Non-MCIT members see only their own requests.
- `#/it-requests/new/it` and `/new/brief`: drafts kept; text that looks like a password or token is refused.
- `#/it-requests/<it-…>`: triage (owner, priority, not a response-time promise), questions, linked canonical tasks, blocker, resolve with evidence, then the requester confirms or reopens with new facts; IT notes restricted.
- `#/it-requests/<br-…>`: accept as content or return with a reason; the requester answers and resends.
- `#/accounts-register`: search; custodian, backup, access route, vault entry name only, renewal, last verified; "Custodian unknown" for hosting, linked to its open request; Request access pre-fills an IT request; the custody grant confirms or changes a custodian. The hidden system account shows only to Admin and the MCIT Director.

**Demo click path:**
1. **Galih** (MCIT Director) → Content → Calendar: 5 Oct shows Instagram published and LinkedIn "Planned date passed, not published". Open "Open recruitment poster": still Scheduled, 1 of 2 channels.
2. Open "Website relaunch announcement": "Approval stale" (v2 approved, v3 sent). Approve v3.
3. **Hana** → same item → Schedule v3 → Record publication on Instagram with any https link and today's time. Stage stays Scheduled until the Website channel is recorded.
4. **Galih** → "Open recruitment teaser" → Request changes on v2: one revision task appears in Hana's My Work.
5. **Salsa** → Updates → "Gilang resolved your IT request" → Yes, it is solved (or reopen with new facts).
6. Salsa → Requests to MCIT → New IT request; type "password: abc" in the description: refused.
7. **Galih** → Accounts: hosting shows "Custodian unknown" and its open request; Request access pre-fills an IT request.

**Requirement IDs:** W053, W054; S042–S045; marketing_campaign, marketing_lifecycle, marketing_cadence, marketing_dates, marketing_stale_approval, marketing_publication_records, marketing_events (Updates), marketing_exports, marketing_it_requests, marketing_account_register, marketing_acceptance (both journeys clickable), integration-credentials, resource_secret_links, access_hidden_it, entity_contentitem, entity_itrequest; flows flow-marketing-brief/-review/-publication, flow-it-request-triage, flow-it-resolve; blueprint §6 and §12.

**Assumptions POL or the MCIT lead must confirm:**
- Grants: content review Laras and Galih; publication recording Laras and Hana; IT triage Galih and Gilang; IT technician Gilang and Farah; account custody Galih (plus Admin). Creating content: MCIT Co-Directors and up, or anyone with review or publish grants.
- Any new version after approval makes the approval stale (no minor-edit exemption).
- An item is Published only when every channel has a record; an attestation without a link is allowed with a note.
- Custodian "not verified recently" after 90 days.
- The secret check is a simple pattern (password/token/OTP followed by a value); the real build needs the OPS rule.

**Unfinished:**
- Campaigns are seeded only (no create or edit screen); no separate brand-asset library (assets are links on each item).
- Duplicate merge for IT requests is not built.
- Undo restores the MCIT store slice and appends "Undid"; tasks created by a revision or failure are not removed by Undo.
- No engagement metrics anywhere, by design.

## UI sprint · UXD1 (SnG screens), 6 Oct 2026, Claude Opus 5.5

**Files:** `prototype/div-hr-sng.js` and `prototype/div-hr-sng.css` (SnG part).

**Data:**
- Seeds lazily into `db.sng`; the hook is `window.ensureSngData()`.
- Reuses existing records by ID:
  - projects p-mentoring, p-roadmap, p-prio25, p-map, p-orient;
  - tasks t1, t3, t7–t12, t17, t20;
  - resources r-survey, r-retro, r-lk-guide.
- The page says these are sample records for the walkthrough (strategy_validation).

**Screens and routes** (SnG workspace nav: Initiatives, Research & decisions)
- `#/initiatives`: Now / Next / Later board, or a list. New initiative opens in the side panel.
- `#/initiatives/<id>`: one initiative.
  - Horizon switch: a planning choice; record IDs stay the same.
  - Stage, problem and hypothesis.
  - Evidence: each source shows its observed date or "Date unknown". The finding is kept apart from our reading and its limits. Restricted raw data shows "Request access" to viewers outside SnG.
  - Investigation tasks, created in Work.
  - Decision packet versions.
  - Requests to other units, using the §12 handoff: named receiver, needed-by date, accept or return. Silence never accepts.
  - Delivery: link one existing project, or create one with no start date.
  - Outcome review: each observation needs a source. The outcome is recorded as observed or Inconclusive, with continue, adjust, stop or hand over.
- A receiver outside SnG (for example Kirana on `#/initiatives/in-buddy`) sees only the request addressed to them.
- `#/decisions`: three tabs.
  - Decision queue.
  - Research: every source across initiatives.
  - Outcome reviews: overdue review dates are flagged.
- `#/decisions/<packetId>`: options with benefit, cost, risk, unknowns, owner and the recommendation.
  - The designated reviewer approves, holds or rejects, with a rationale.
  - A hold needs a review date, or the date is left unset on purpose.
  - A stale guard blocks decisions on superseded versions.
- `#/decisions/new/<initiativeId>`: builds the next packet version.

**Demo click path**
1. Sign in as **Mahdy** and switch to SnG → Initiatives. The board shows one initiative in each state: approved, held, rejected, pending, in research and idea.
2. Open "Why members leave after one term". See the dated sources, one "Date unknown" source and the investigation tasks. Add a task.
3. Sign in as **Raka** (VP). Updates → decision request → packet v2 for Buddy pairs. On the initiative, the restricted survey finding is hidden from him.
4. Before Raka decides, sign in as **Salsa** → Buddy pairs → Prepare a new version → submit v3.
   - Back as **Raka**, v2 now says "Version 3 replaced this packet" and nothing can be recorded on it.
   - He opens v3 and approves it with a rationale.
5. As **Salsa**: the initiative shows "No delivery project linked yet". Link the existing project Batch 2026 orientation. Salsa cannot create projects; Mahdy can.
6. Sign in as **Kirana** (HR). Updates → "Salsa asked your unit to commit". She sees only that request and accepts it. Changes in both workspaces record it.
7. As **Mahdy**: Alumni mentoring → Add observation (a source is required). Division priorities 2025 shows an Inconclusive outcome because no baseline was recorded.

**Requirements covered**
- PRD requirements: division_strategy, strategy_initiative, strategy_research, strategy_reviews, strategy_dependencies, strategy_metric_definition, strategy_experiment (outcome or inconclusive), strategy_acceptance (approved, held and rejected fixtures), strategy_events_export (Updates only), analytics_metric_policy (no scores).
- Flows: flow-strategy-intake, flow-strategy-decision, flow-strategy-deliver.
- Work packages W059 and W060; stories S052 and S053.
- Blueprint §9 and §12.

**Assumptions for POL or the SnG lead to confirm**
- Decision authority, chosen per packet:
  - SnG Director for SnG-only work;
  - VP when other units are affected;
  - President for organization-wide work.
- Any SnG member can create an initiative.
- The owner, the creator, SnG Co-Directors and up, and Admin can edit it.
- Only Co-Directors and up create the delivery project.
- Restricted sources are visible inside SnG only.
- Packet fields, with up to 3 options.
- Metric registry: name, unit, source and owner, with observations entered by people.
- Next steps after an outcome: continue, adjust, stop, hand over.

**Unfinished**
- Scoped export of initiatives (strategy_events_export) is not built.
- No experiment-specific screen (optional P1).
- The blueprint's SnG "Reviews" screen is the Outcome reviews tab of `#/decisions`, because the agreed routes were initiatives and decisions only.
