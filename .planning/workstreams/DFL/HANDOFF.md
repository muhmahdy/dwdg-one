# DFL handoff log

Newest first. Each session appends: date, model, what changed (paths), evidence, open questions, next step.

## UI sprint · UXD3 (FnL screens), 7 Oct 2026, Claude Opus 5.5

**Files:** `prototype/div-fnl-mcit.js` and `prototype/div-fnl-mcit.css` (FnL part; MCIT is in DMS/HANDOFF.md). Added the `prototype-uxd3` preview config (port 5199) to `.claude/launch.json`.

**Data:**
- Seeds `db.fnl` once per demo store, at load and lazily on every FnL page. Hook: `window.ensureFnlData()`.
- Agreed IDs: `lgl-hms-pks` (awaiting the HMS signature, number 015), `lgl-hms-bast` (v1 in review), `inv-hms-1` (waiting for the legal gate). Links to `#/opportunities/opp-hms` and `p-hms` / `p-close` by ID, never copied.
- Paid, outstanding and remaining are always computed from the payment rows, never stored.

**Screens and routes** (FnL workspace nav: Requests, Budget & transactions, Documents & register, Period reviews; every other workspace gets "Requests to FnL"):
- `#/fnl-requests`: Legal, Finance and Incoming tabs with an Open/Done/All filter. Non-FnL members see only their own requests and the next step. The Board sees counts only.
- `#/fnl-requests/new/legal` and `/new/finance`: typed forms. Drafts save as you type and survive reloads and `?fail=save`. Submitting twice returns the same record. Short notice shows the survey H-2/H-3 as a warning only.
- `#/fnl-requests/<lgl-…>`: next step, steps, triage, questions to the requester, versions with review on an exact version (stale guard, drafter can't approve own), provisional number with void and reissue, signatures (signed copy or unverified attestation), private reviewer notes. The BAST page adds the ready-for-invoice gate (PKS signed, BAST signed, delivery evidence) with an exception path and a §12 handoff card to a named Finance receiver.
- `#/fnl-requests/<fr-…>`: requested / approved / paid / outstanding, budget-line headroom, independent approval (no self-approval), return and resubmit as a new version, payment recording (capped at what is owed, duplicate reference refused), signed corrections that keep the original, duplicate flag that deletes nothing.
- `#/fnl-requests/inv-hms-1`: incoming term on a separate basis. Gate checklist, accept or return the handoff, record the invoice issued outside the app, partial receipts.
- `#/budget`: term summary with formula note, allocations with committed/paid/outstanding/remaining and deficit flag, "No allocation recorded" for HR (unknown, not zero), allocation side panel (approve by someone other than the proposer, amend with preview), transactions, incoming kept separate, CSV export. The Board sees approved totals by division only.
- `#/register`: issued and void numbers with versions and request state, "number format not adopted" notice, next number, CSV export.
- `#/period-reviews` and `/<id>`: totals recomputed from rows, per-row check (matched needs evidence) or discrepancy with owner, still owed at period end, bank reconciliation labelled incomplete, snapshots (September keeps S1 as past basis after the py-4 correction made S2), close with carried actions, CSV export.

**Demo click path** (sign-in names as on the sign-in list):
1. **Daniel** (FnL Director) → Updates shows 6 FnL items. Open "Handover record (BAST) for the HMS data workshop".
2. Approve v1 for signature → Issue number → Mark as sent for signature. The gate below reads "Not ready for invoice".
3. Open the linked PKS ("Cooperation agreement… Himpunan Mahasiswa Statistika"): 1 of 2 signatures, still Awaiting. Record the HMS signature with any https link → Signed.
4. Back on the BAST: record both signatures, record the delivery evidence check, Send ready-for-invoice to Finance (receiver Citra). No invoice or payment is created.
5. **Citra** → Requests → Incoming → "HMS data workshop fee": accept the handoff, record the invoice issued outside the app, record a partial receipt.
6. Still Citra → Finance tab → "Printer ink for agreement copies": no approve buttons ("You requested this").
7. **Daniel** → "Snacks and printed consent forms…" is partly paid (Rp 30.000 of 90.000). As **Citra**, record Rp 60.000: Paid; Budget shows the survey line with Rp 210.000 remaining.
8. **Salsa** → "Requests to FnL" in the SnG nav → New finance request; leave a field empty to see the draft kept.
9. **Daniel** → Period reviews → September: two snapshots, S1 kept as past basis.

**Requirement IDs:** W055, W056, W057, W058; S046–S051; legal_request, legal_pipeline, legal_sla (warning only), legal_urgent, legal_requester_view, legal_numbering, legal_number_void, legal_signature_status, legal_bast_gate, legal_events (Updates), legal_export, finance_budget, finance_request, finance_validation, finance_comparisons, finance_amend, finance_adjustments, finance_receipts_export, finance_events, finance_period_snapshot, finance_incoming_terms, integration-signature, integration-payments, security_finance, entity_legalrequest, entity_documentregister, entity_financebudget, entity_financerequest, entity_approval, entity_paymentrecord; flows flow-legal-intake/-draft-review/-number/-signatures/-handoff, flow-finance-allocation/-submit/-review/-payment/-reconcile, flow-finance-income-open/-close; blueprint §8 and §12.

**Assumptions POL or the FnL lead must confirm:**
- Grants (shown on each page under "Who can do what here"): Legal triage Rafi and Daniel; legal review, numbering, allocation approval and period review Daniel; finance approval Daniel and Citra; payment recording Citra and Kevin; incoming terms Citra.
- Number format `DWDG/FnL/{type}/{year}/{seq}`, one yearly series across types, issued at "approved for signature" before signatures. Shown as provisional; the browser computes it, the real build must issue on the server.
- Lead times H-3 agreements / H-2 others counted in calendar days, warning only; urgent exception decided by the legal reviewer.
- Self-approval denied; approved amount may be lower than requested, never higher; approval capped at remaining allocation (going over has no rule yet).
- Payment capped at the approved amount; duplicate = same request and reference; correction is a signed amount pointing at the original.
- Gate exception approvers: FnL Director or President.
- Visibility: FnL members, President, VP and Admin see all queues; requesters see their own; unit Directors/CDs see their unit's legal requests as status; the Board sees counts and approved totals only. Payee, reference and evidence are limited to the requester and the finance grants; reviewer notes to Legal grants.
- Categories (Operations, Events, Printing, Tools and hosting, Transport, Consumption) and term label "2026/1" are placeholders.

**Unfinished:**
- No template register (legal_templates): the template is a text field on the request.
- Undo restores the FnL store slice and appends "Undid" to the record and Changes; it does not withdraw Updates already sent.
- Concurrent issuance and stale-review races can only be shown for one user in a browser prototype.
- The Updates and Changes rows for these records rely on UXD1's wrappers in `div-hr-sng.js` (records carry `ref.h` / `target.h`). A shared registry in plan.js would be cleaner (same request as UXD1).
- In a freshly reset store, signing in as the Board account before perf.js creates it fails on every page, including core ones; not caused by these files.
