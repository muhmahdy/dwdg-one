# DWDG’ONE PRD — independent consistency review

Reviewed **3 October 2026**, after the latest budget correction and native-upload scope harmonization. Review covers `sections-foundation.json`, `sections-detail.json`, `sections-changes.json`, `sections-product.json` and `sections-operations.json`. It assesses the planning specification, not implementation, live security, rendering or launch readiness.

Latest snapshot: **579 nodes** — foundation 65, detail 48, Changes 19, product 252, operations 195. All IDs are unique. Parent references resolve. Dependency IDs resolve after normalizing array, comma and newline formats; the combined dependency graph has no cycles. This structural check does not mark requirements tested or adopted.

## Current controlling decisions

- Budget target **Rp35,000/month where feasible**, **hard ceiling Rp50,000/month**; earlier near-Rp0 preference is explicitly superseded. Free components are useful within this limit, with no minimum spend. Include annual amortization, tax/payment fees, SMTP/archive/domain if adopted; annual upfront cash is separately reviewed.
- Starting organization is approximately **40+ members**. The proposed 60-account/15-concurrent planning and 100-account/25-concurrent stress cases are assumptions, not headcount facts.
- No organization domain or shared Drive exists. UII entitlement and vendor/archive custody are Open, not invented dependencies.
- Default V1 Resources are **native notes, folders and external links**. Native binary upload is deferred/conditional. A record/native-note/link-manifest export does **not** back up or restore provider document bytes.
- Workspace Changes records only the current authorized workspace. Production actor/time derive from trusted server identity; local PRD editor history is separate and honest.

## Material findings and repairs

| Finding | Result after review |
|---|---|
| Native uploads/previews appeared as default launch features in some foundation clauses, despite deferred product/operations storage policy. | Parent revised `design-project-tabs`, `decision-file-policy`, `integration-previews` and `quality-backup-proof`. Operations upload/file-version/security/quota nodes are deferred P2; release checks, exports, migration backup and restore now conditionalize future native files. Default upload sizing is zero. |
| Launch rules disagreed about whether an essential-flow P1 defect could be accepted. | Operations `launch_gate`, `launch_pilot` and `launch_scope` now align with `quality-defects`: zero unresolved P0/P1 defects in promised essential scope. A P1 **requirement** may be explicitly deferred/excluded; that does not excuse a P1 **defect** in advertised behavior. |
| Budget text and paid fallback examples still reflected the earlier request. | Operations and research now use Rp35k target/Rp50k maximum. Free core + illustrative small archive envelope fits; Pro, continuous paid staging, $20 SMTP and $5 Workers minimum are outside current ceiling. Domain is optional with quoted renewal/upfront approval. Actual eligibility/fees are Open rather than a guarantee of Rp0. |
| Product requires batch-specific VP reporting graph, but entity dictionary only described current unit parent and role scope. | Added `entity_reportingassignment`: term-scoped effective reporting edges, stable references, one active parent, cycle/orphan checks and access derived from verified role + current permitted descendants. History is not rewritten on next-term restructuring. |
| Changes source/destination workspace IDs needed a concrete identity contract after moves/renames. | `entity_workspace` now requires immutable scope identity, with explicit ADR for unit-ID reuse versus separate workspace UUID. Audits preserve both affected scopes and safe tombstones under current permissions. |
| A default fixture asked for failed upload and a root recovery summary implied blob copy. | Operations default fixtures use broken provider links; optional upload adds separate fixture only if enabled. Root reliability now covers app records/native notes/link manifest and conditional future bytes. |

## Final wording follow-up resolved

The product author has now revised `resource_delete`: default removal deletes a DWDG external link or reversibly archives a native note/folder; external provider files remain untouched. Physical file deletion and coordinated blob/metadata cleanup are explicitly conditional on later adoption of native uploads with approved retention, cost and security policy. The default launch has no physical upload-delete action.

## Important Open launch inputs already captured

The specification captures, rather than omits, the remaining decisions: authoritative roster/leadership/reporting assignments; named secondary operator and archive custodian; Google eligibility/external collaborators; provider region/institutional privacy requirements; actual R2/Drive destination credentials/payment eligibility and billing controls; tested independent backup schedule/manual fallback; accepted recovery staffing/window; retention and sensitive-export rules; official legal numbering/SLAs and finance approval rules; migration provenance and external document ownership/version continuity.

These are true operational/organizational inputs. Their Open state is appropriate while the PRD is being discussed, but dependent production onboarding/launch acceptance cannot pass until resolved. A provider link cannot freeze a reviewed document version; `resource_revisions` correctly requires supplied immutable version/export evidence or an explicit warning.

## Reviewed safeguards that remain coherent

- One canonical task/project/resource feeds multiple views; resource responsibility does not silently widen workspace access. Member scope, VP descendants and explicit project collaboration are distinct.
- Approval binds exact reviewed revision; self-approval/role-switching does not satisfy an independent gate. Recorded payment/signature/publication remains distinct from performing an external transaction.
- Current completed-task charts and historical activity events are separate bases; unknown dates remain unknown and date-only deadlines stay all-day.
- Server-enforced access applies to search, counts, events, exports and revocation, including protected HR/finance fields. Safe external credential references exclude secrets.
- Audit save/event transaction, immutable actor, correlation/idempotency, redacted diffs, deleted-record snapshots, Undo as a new event and cross-workspace move visibility are specified without claiming forensic immutability.
- Production/staging/test/sandbox isolation and no real-data fixture copying are consistent with free-project constraints. Native files require extra gates only when adopted.
- Independent archives remain encrypted with scoped credentials and successor recovery. No real data belongs in source control, CI logs or ordinary artifacts. Scheduled jobs are best-effort and freshness/restore evidence, not schedule existence, establishes coverage.

No current review finding justifies a production-complete claim. The PRD is a dense reviewable plan; later implementation needs actual permission, save/conflict, migration/restore, deployment rollback and settled desktop/mobile evidence for the selected version.

Final handoff addition: `entity_task` includes optional nullable `parent_task_id`, same-project/workspace validation, self/cycle rejection and first-V1 one-level nesting only when the P1 subtask capability is adopted. Dependency sequencing remains a separate edge; nesting never grants access. Canonical child fields, explicit parent completion review and eligible-leaf project progress avoid double counting. Default flat tasks remain; no new entity or mandatory launch capability was introduced.
