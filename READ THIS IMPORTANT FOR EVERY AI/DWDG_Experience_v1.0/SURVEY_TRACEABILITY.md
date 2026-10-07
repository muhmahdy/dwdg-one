# Survey → product requirements

Source: `C:\Users\muhma\Downloads\Survei Kebutuhan Fitur Web Management System ERP DWDG UII.xlsx`, sheet `Form Responses 1`, responses in rows 2–9. **Fresh read-only recount verified on 26 September 2026.** The original workbook was read without modification. All feature counts below match the earlier conversation summary.

Source ranges: `A2:A9` timestamps; `D2:D9` divisions; `E2:F9` current process/pain points; `G2:G9` feature selections; `H2:H9` most-important answers; `I2:J9` familiar tools and additional ideas. Row 1 contains the original question labels. Names and email addresses are not copied into this pack.

Recount method: count each known feature label once per nonempty answer in column G, preserving the multi-select basis; separately count mentions of the same labels in H. There are 8 nonempty responses, 8 unique nonempty email identifiers, and no blank G/H answers. Multi-select answers can contain free text, so this method avoids splitting every comma in written comments into a supposed feature. No workbook formulas or cached totals were used.

Verified source SHA-256: `4ad8ca1fc4f7805d76707967e78f078ca9aae7ece57ebac2f2cd9ed3b240e72d`. A future source update requires a new recount rather than reusing these figures.

The verified review covers **8 respondents**, dated September 19–24, 2026: Consulting 3, Marketing/Communication/IT 2, Legal & Finance 2, Client Engagement 1. HR and Strategy & Growth are not represented in this sample. This is directional feedback from a small response set, not a claim about all members.

Feature counts come from the multi-select feature question, not a ranking. The separate most-important answers and written comments have a different basis. Client Engagement maps to the application's External Engagement naming.

## Requirement traceability

| ID | Survey need / evidence | Local requirement, retained in v1.1 | Later integration / qualification |
|---|---|---|---|
| S01 | Deadline reminders, 8/8 | Due dates, overdue/today grouping, in-app due reminders and reopening catch-up | Closed-app delivery, email, WhatsApp, push require a later service |
| S02 | Progress tracking, 7/8 | Shared tasks/statuses, honest progress denominators, dated completion chart, project/portfolio rollups | Shared synchronization deferred |
| S03 | Documents, 7/8 | Searchable document metadata, project links, local attachments, previews, revision records | Cloud storage, collaborative editing and external access policies deferred |
| S04 | Assignment/PJ, 5/8 | Explicit owners/assignees and relevant PL/PM fields; clear responsibility in rows and inspectors | Multi-user authorization is not enforced by local preview |
| S05 | Automatic reports, 5/8 | Calculated filtered local summary, CSV export and print layout | Scheduled generation/delivery is a later integration |
| S06 | Blockers, 5/8 | Owner, severity, linked task/milestone, requested action, resolution; visible beside project work | No inferred blocker score |
| S07 | Division/project dashboard, 4/8 | Six distinct division workflows and a linked portfolio within one shell | HR/Strategy details remain hypotheses from existing product scope pending feedback |
| S08 | Update notifications, 3/8 | Local activity/inbox, read states, review requests, due context | Realtime other-user notifications deferred |
| S09 | Calendar, 3/8 | Meetings, date-only deadlines, milestones and follow-ups with clear timing semantics | External calendar sync deferred |
| S10 | Meeting notes, 3/8 | Agenda/minutes linked to decisions and follow-up tasks | Collaborative editing deferred |
| S11 | Budget/expenses, 1/8 | Local allocations, requests, recorded approvals/payment states, exact IDR charts | Accounting, payments, bank connection, payroll are outside this phase |
| S12 | Search, written comments | Unified local search of advertised record metadata and links | Do not include plaintext account passwords in ordinary search |
| S13 | Mobile use and external follow-ups, written comments | Mobile dock/sheets, partner owner/stage, timelines, reminders | External messaging delivery deferred |
| S14 | Consulting connected delivery, detailed comments | Tasks, milestones, blockers, decisions, revisions, PL/PM, review readiness and shared overview | Avoid duplicate records/input between project and portfolio |
| S15 | Legal document flow, detailed comments | Requests, templates/links, revision and signature-status tracking, provisional number/register, finance handoff links | Official numbering policy, H-2/H-3 SLAs, signature execution, BAST verification require organizational confirmation/integration |
| S16 | Marketing executor and evidence, written comments | Owner deadline, content stage, evidence/asset link/file, review notes | Social publishing and channel analytics deferred |

The separate “most important” column H was also rechecked: reminders and documents have 5 mentions each; progress tracking 4; dashboard and update notifications 2 each; assignment, reports, blockers, meeting notes, and budget tracking 1 each; calendar 0. Do not merge those mentions into the multi-select counts above. Written answers also include timeline integration and legal ticketing/numbering, which remain qualitative requirements rather than extra votes for every adjacent feature.

## Workflow conclusions

The common problem is fragmented work across WhatsApp, spreadsheets, forms, and Drive. The local experience should reduce duplicate entry by linking a single task, milestone, document, decision, or partner record across views. A project status change must appear consistently in the portfolio and division context. The v1.1 visual revision keeps these requirements and the eight-response evidence unchanged.

Consulting supplied 3 of 8 responses and External/Client Engagement 1 of 8. Their limited earlier screens must become real local working views in this phase. Legal requests are more specific than a generic task form. Marketing needs ownership, deadlines, and completion evidence. HR and Strategy remain in scope from the approved product plan, with their unrepresented survey status stated honestly.

The survey mentioned Notion, ClickUp, Trello, Jira, and Slack as familiar tools. These are product context, not instructions to copy their branding or every capability.

## Evidence discipline

The user asked for a UI-first implementation. This pack does not convert survey suggestions into settled organization rules. Label provisional process defaults, avoid invented field facts, and test local interactions against [ACCEPTANCE.md](ACCEPTANCE.md). Future survey additions should update the source range, sample size, counts, and requirements together.
