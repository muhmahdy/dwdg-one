# Friendly UI: research, audit and rules (10 October 2026)

Why this exists: members (mostly non-STEM, mostly iPhone users) found the prototype dizzying at the 10 Oct demo. Two quick fixes failed:
- **Round 1** removed features and the original look.
- **Round 2** restored both and the dizziness came back.

The owner asked for research before the next change, keeping every feature. Decisions taken from this: D53 to D55 in `.planning/DECISIONS.md`.

## 1. What makes the current screens dizzying (measured)

Audit of the full prototype, member account Salsa, 1158×914 browser, light theme. The script counts the visible text elements, controls and icons on each screen.

| Screen | Text sizes on screen | Text under 13px | Monospace items | Icons | Controls |
|---|---|---|---|---|---|
| My Work | 10 | 57% | 22 | 51 | 27 |
| Projects | 9 | 46% | 24 | 46 | 15 |
| Project overview | 11 | 27% | 12 | 46 | 20 |
| Project WBS | 8 | 61% | 68 | 64 | 36 |
| Project work | 8 | 41% | 17 | 41 | 28 |
| Task panel open | 12 | 40% | 22 | 54 | 46 |
| Schedule | 10 | 71% | 22 | 37 | 68 |
| Operations | 11 | 63% | 23 | 30 | 13 |

**Sidebar:** 15 destinations in one flat list.

Findings:
- **Too many text sizes.** Sizes come in half-pixel steps (9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5), so the eye cannot tell which text matters.
- **Small text.** Up to 71% of the words on a screen are under 13px. On iPhones, where most members are, normal reading text is 17pt.
- **Code-looking numbers.** Dates, counts and WBS codes are in a monospace font, which reads as "technical" to non-STEM members.
- **Too many controls in view.** The task panel shows about 46 controls at once. The Schedule toolbar has 10 buttons. WBS rows show their menus all the time.
- **What is not the cause:** project art, stage icons, task icons, reactions and colour. Most of these icons carry meaning (task type, stage, division context). The owner explicitly wants them kept.

## 2. What the research says

- **Progressive disclosure** (Nielsen Norman Group):
  - Show a few of the most important options first and keep everything users frequently need on the first display.
  - Put advanced options one clearly labelled step away. Designs beyond two disclosure levels typically have low usability.
  - The usual cause of failure is putting too many options back on the first display.
  - Their visual-complexity guidance adds predictable placement and a clear visual hierarchy.
- **Density** (design-system practice and HCI teaching):
  - Novices benefit from simple, low-density displays; experts tolerate and often prefer dense ones, especially when the wording is already theirs.
  - Offer two or three densities with plain text labels and remember the choice.
  - Density may change spacing, font size and how much metadata shows. It must not change meaning or shrink tap targets.
- **Complexity and usability** (questionnaire validation study): information complexity correlates negatively with usability and positively with mental workload. Complexity here means quantity, variety and relation of items.
- **iOS text:** the iOS default body text is 17 pt, captions 11 to 12 pt. Members' daily apps set this expectation. The figure comes from third-party summaries of Apple's Dynamic Type table; confirm against Apple's page.
- **Market signal** (reviews, not controlled studies): Asana is widely described as easier for non-technical users than monday.com. The friction appears when advanced features (dependencies, custom fields, many views) surface too early.
- **Owner's own references** (`REFERENCE_DIGEST.md`):
  - R012: a CRM inspector with collapsible sections.
  - R014/R016: Samsung grouped rounded sections.

Evidence caveat: progressive disclosure and density guidance are mostly practitioner consensus and case studies, not controlled experiments. The audit numbers above are our own measurements.

## 3. Rules adopted

1. **Every feature stays.** Nothing is removed or hidden behind a mode.
2. **Two densities** (D53).
   - **Comfortable** is the default: five text sizes, nothing under 13px on laptops, iPhone sizes on phones, numbers in Geist with tabular figures, slightly taller rows.
   - **Compact** is the original look, chosen once in Settings.
3. **Two-level navigation** (D54).
   - The sidebar shows My Work, Updates, Schedule, the division, Projects and "More tools", which expands in place for the rest.
   - Organization and Settings are in the profile menu.
   - Phones: My Work, Projects, +, Schedule, More.
4. **Progressive disclosure where the audit found overload** (D55).
   - **Task panel:** essentials, then Planning, People, Review and sign-off, Dependencies and Details. A section opens by itself when something in it needs the member.
   - **Projects toolbar:** Sort and Group by program sit under "View options".
   - **Schedule toolbar:** Go to a date and Help sit under "⋯".
   - **WBS and resource rows:** menus show on hover on laptops.
5. **Identity stays:** project art, the nine stages with icons, task icons, reactions and colour.

## 4. Result (same audit, Comfortable vs Compact, 10 Oct)

On laptop (1158px), Comfortable, every audited screen:
- **Text under 13px:** 2% to 10%, almost all of it avatar initials, which stay inside their circles.
- **Monospace items:** 0.
- **Text sizes per screen:** 6 to 8, including avatar initials.
- **Sidebar:** 6 lines for a member.
- **Task panel:** 20 controls with its sections closed.
- **Compact:** keeps the original numbers.

On phone (375px), Comfortable:
- **Readable text:** 82% to 100% of content text at 15px or larger on My Work, Projects and project pages.
- **Exception:** Schedule's calendar grid labels stay at 14px.
- **No horizontal scroll**, and tap areas at least 44px on the main controls.

**Reachability:** every destination a role could open before (14 to 17 per account) still opens, from the sidebar, More tools, the profile menu or the phone More list. Checked for a member, the admin, the VP and two division directors.

## Sources

- Nielsen Norman Group, *Progressive Disclosure*: https://www.nngroup.com/articles/progressive-disclosure/
- Nielsen Norman Group, *3 Strategies for Managing Visual Complexity* (video): https://www.nngroup.com/videos/managing-visual-complexity/
- Apple Human Interface Guidelines, Typography: https://developer.apple.com/design/human-interface-guidelines/typography
- BASIS design system, Density: https://design.basis.com/foundations/density
- Cornell CS 2112, UI design lecture (novice vs power users): https://www.cs.cornell.edu/courses/cs2112/2025fa/lectures/uidesign/uidesign.key.pdf
- Information complexity questionnaires validation study: https://metatoc.com/papers/21594-complexity-questionnaires-of-visual-displays-a-validation-study-of-two-information-complexity-questionnaires-of-visual-displays
- Asana vs monday.com (review comparison, opinion): https://toolfinder.com/comparisons/asana-vs-monday-dot-com

## 5. Addendum, same day: from sizes to a visible overhaul (D56)

The owner found the Comfortable density alone looked "no different". Type and spacing changes measure well but don't change the look. The owner kept four things from the first focus-mode style:
- top navigation;
- big rounded cards;
- very simple task rows;
- a floating panel.

They asked for three looks. The Comfortable look now applies that visual language to all 32 pages through the shared pieces the inventory found:
- page header (30 pages);
- tables (17 pages);
- segmented controls (16 pages);
- section titles (15 pages);
- lists (11 pages);
- tabs (7 pages);
- toolbars (6 pages);
- boards, plus page-specific passes for projects, WBS, Gantt, Schedule, Operations, Performance, Organization and the division tools.

Same audit after the overhaul (Comfortable, member, 1158px), across My Work, Projects, Overview, WBS, Work, Schedule, Updates, Operations, Initiatives and Settings:
- 4 to 6 text sizes per page;
- no text under 13px apart from avatar initials;
- no monospace text.

## 6. Addendum, 11 October: build from the owner's references (D57)

The D56 overhaul and three invented mockups were rejected:
- **D56 overhaul:** called "shite", because of boxes everywhere, stacked controls and a cheap feel.
- **Mockups:** called "vibecoded", because colour circles with counts, greetings, art banners and a tinted icon on every row add up to the generic AI dashboard look.

The lesson is that the owner's reference board already defines the target, and inventing a style each round kept missing it. Comfortable is now rebuilt element by element from R009, R016/R039, R025 and R012, and each screen is checked next to its reference (`frontend/concepts/reference-check.html`).

Measured on the rebuilt pages (My Work, Projects, member, 800px):
- no text under 13px apart from avatar initials;
- no monospace;
- every destination reachable for 8 accounts (14 to 17 each).

