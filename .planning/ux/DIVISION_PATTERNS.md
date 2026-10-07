# Division screens and the patterns the design system must cover

6 October 2026 · Claude · source: `.planning/dwdg-one-prd/ORGANIZATION_DIVISION_BLUEPRINT.md` §3–14 (read in full). Purpose: the top-level first version (D1) ships only shared screens, but design system v2 must already contain every pattern below, so division work later is assembly, not redesign.

## 1. Screens per division (from the blueprint)

| Division | Workspace screens | Core records and states |
|---|---|---|
| **EE** (Partner, Client) | Relationships · Opportunities (Partner/Client filter) · Follow-ups · Resources | One organisation/contact identity; opportunity pipeline identified → qualified → contacted → discussion → proposal → negotiation → agreement pending → active, plus lost/withdrawn/on hold; interaction log (attempt, channel, date, outcome); Client → Consulting handoff |
| **MCIT** | Content calendar · Production board/table · Requests (IT queue is a view) · Resources | Brief/request → content item with versions; production / approval / planned / actual publication dates are separate; review on a specific version; IT ticket: triage → assigned → fixed → verified/reopened |
| **HR** | People · Monitoring & Development (weekly attendance, 14-day cycles) · Programs · Recognition | Meeting occurrence + roster; attendance status present / late / excused / unexcused / not required / **not yet recorded**; 14-day cycle with submissions, rubric scores, corrections, development actions; Member of the Month round |
| **FnL** | Requests (Legal / Finance views) · Budget & Transactions · Documents & Register · Period Reviews | Legal document versions, unique register numbers (void keeps the number), signature evidence; allocation → request → independent approval → payment record; committed ≠ paid ≠ remaining |
| **SnG** | Initiatives (Now / Next / Later) · Research & Decisions · Reviews · Resources | Observation → research findings → options → decision packet (approve / hold / reject + rationale + version) → linked project → outcome review |
| **Cons** (Project Associates, Knowledge, TnD) | Engagement portfolio · delivery/review queues · staffing requests · project Overview/Work/Resources · knowledge library · programs/cohorts, sessions, assignments | PL/PM roles; scope versions and change control; deliverable review; knowledge article versions with reviewer and next-review date; cohort enrolment ≠ attendance ≠ completion |
| **President / VPs** | Attention view across reporting units | Decision packets, cross-VP handoffs, deadlines; no invented health scores |
| **EN** (2027) | none in v1 | Reserved only |

## 2. Shared patterns the design system v2 must include

1. **Operational table**: dense, sortable, column-configurable, inline edit, row → inspector; saved filtered views per division (EE, FnL, Cons portfolio, HR participants).
2. **Pipeline board**: columns from a defined state list, explicit side states (lost, on hold), card shows owner, next action and date.
3. **State machine chip set**: one visual language for every domain state (projects use the owner's 9-stage set; pipelines, requests, reviews and attendance get their own sets in the same style).
4. **Request form + queue**: typed forms (legal, finance, design brief, IT, staffing) with required fields, draft retention, triage queue, return-for-information.
5. **Version and review**: version list, review decision on an exact version (approve / request changes / reject with reason), banner when a newer version makes an approval stale.
6. **Handoff card**: source record + version, sender, named receiver, requested vs agreed date, status draft → requested → accepted / returned → fulfilled / cancelled.
7. **Attendance register**: roster grid, one status per person, "not yet recorded" visibly different from absent, restricted notes hidden from general view.
8. **Rubric scoring form**: criteria with raw value, maximum, weight, evidence references, reviewer, incomplete ≠ zero, correction request and lineage.
9. **Money display**: IDR formatting in mono, committed / paid / remaining shown together, partial payments, evidence links.
10. **Register / numbering**: issued numbers, void and supersede with reason, never reused.
11. **Decision packet**: options with benefit, cost, risk, owner; decision with rationale and version; review date.
12. **Calendar views**: content calendar (MCIT), session schedule (TnD), meeting composer (shared, R046).
13. **Restricted field**: a consistent way to show "you can't see this" without leaking metadata.
14. **Changes feed**: workspace history entries (actor, record, time, safe diff).
15. **Created by / responsible / reviewer**: shown separately on every record (D14).

## 3. Consequence for the top-level first version

- Navigation reserves a per-division screen list (left nav "Strategy & Growth" group) so division screens slot in later without changing the shell.
- The prototype keeps the approved slice (D1) but its components (table, chips, inspector, forms) are drawn from this list, not invented per screen.
- Next design deliverable: design system v2 covering patterns 1–15, then the remaining shared screens.
