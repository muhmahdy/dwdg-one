# Reference digest — what the product owner loves

5 October 2026, by Claude after inspecting `PROJECT_REFERENCES/` (video watched frame by frame; images viewed at full resolution). Read this instead of re-opening the images; open an original only when designing the specific component it informs.

## R046 — meeting scheduling video (the owner's favourite)

A single floating composer, not a form. Sequence observed (27 s):

1. **Natural-language input** with an icon and a ⏎ submit chip. Empty state shows 3 example prompts in which people, days and durations are colour-highlighted tokens ("Coffee with *Developer* *Friday* at *10am* for *30 min*").
2. Typing "meet" instantly shows **Tomorrow · 30 Sep** with ‹ › day arrows and an **hour ruler (9 → 6)**, one **availability row per participant** (avatar, name, email/location; busy time = grey block).
3. A **selected-slot capsule** (rounded, green tint, outlined) spans all rows at the proposed time.
4. **"You're free at"** chips — three suggested times, the chosen one filled green.
5. A **summary card**: coloured left bar, title ("Meeting with Jilles & Harshil"), "Wed 30 Sep · 9:00 – 9:30 AM · 2 guests", stacked avatars; controls: video toggle, **− 30 min +** stepper, blue **Book ⏎** pill.
6. Typing names ("with jilles and harshil") parses them into highlighted tokens; each person **adds a row live**; "Checking calendars…" shows while loading (Book disabled).
7. Chip text changes to **"Everyone's free at"** once there are guests.
8. Duration **+** grows the capsule (30 → 45 min); the summary updates instantly.
9. **Dragging the capsule** onto a conflict turns it **red with a floating time pill** ("2:00 PM"); the summary's left bar turns red too. Dropping on a free slot returns green.
10. Clicking a suggestion chip snaps the capsule there.

Principles to carry: one surface; everything updates live; conflict shown in place by colour + position, not an error dialog; keyboard first (⏎ everywhere); numbers adjusted with steppers, not inputs.

## Task lists (R001, R002, R005, R008, R009)

- Grouped by relative time ("Tomorrow", "Next week") with small muted captions.
- Row = quiet checkbox · sentence-like title with **inline links (underlined), inline person (avatar + dotted-underlined name)** and a **coloured category chip with icon** (FINANCE purple, PAYROLL red, VC green) · right-aligned **time pill** ("9:30am", "in 5 days").
- Long titles **fade out** instead of ellipsis.
- Category chip opens an **inline menu of chips** right below it (R008).
- R001 variant: **date tile** (red month, big day) on the left, #tag, a ghost action on the right.

## Data and controls

- R006/R011: horizontal paired bars (this period strong, average pale), dashed gridlines, dark tooltip with values and a pointer.
- R007: table row selection → **floating dark action bar** ("1 of 212 selected" + icon actions).
- R010: segmented presets (Custom/Safe/Standard/Full) above a **tree of settings rows**, each with a value pill and a chevron; a toggle on the last row.
- R003/R029: profile card with stats row and two buttons; **tactile raised buttons** — dark pill primary with real depth, soft light secondary.
- R047: sculpted day selector, **red selected day** in a raised pill. R048/R049: soft rounded pills with pastel glossy icons.

## Layouts

- R012 (CRM): sidebar with workspace switcher, search ⌘K, saved views with coloured dots; centre = title, chart, tasks, activity feed; right = profile **inspector** with collapsible sections. This is the desktop composition target.
- R022/R023/R024/R027: warm off-white/grey canvas, white cards **nested inside a tinted section frame** (section header sits on the grey frame, content on white), **monospace uppercase section labels and numbers**, pixel/block bar charts, black primary button ("Export CSV"), segmented Weekly/Monthly/Yearly, status pills with icons (Success green, Pending amber, Refunded faded).
- R025: warm stone mobile UI, schedule with time rail + event cards with left bar, floating pill tab bar + round black **+**.
- R026: documents page with three colourful "create" cards on top and a calm empty state.
- R014/R016 (Samsung): grouped rounded sections, slim progress tracks, day selector capsule, charts with average line.

## Brand mood

- R020 (bird): editorial serif headlines, vivid prism/rainbow gradients used as *imagery*, not UI chrome.
- R021 (bloop): lime green identity, playful rounded logotype.

## Avoid (owner rejected)

- R043/R044: earlier DWDG homes — motivational quote cards, decorative imagery tiles, too many widgets, 2×2 strategy plot with glossy orbs. Too dense / too decorative.
- R054: the current DWDG’ONE Projects screen — the owner calls the current UI sloppy.
- Glassmorphism on interface surfaces (manifest: latest direction uses solid surfaces).
