# Home and My Work visual audit — 3 October 2026

Inspected all 32 final `home/work-{1440|1024|390|320}-{en-light|en-dark|id-light|id-dark}.jpg` captures through four contact sheets, with original-size follow-up inspection of Home's light/dark checkbox and My Work's 1024px Indonesian filters. Re-inspected all 16 replaced Work captures after the shorter-label correction, and inspected `project-work-320-guard.jpg` at original size. Old `*review.jpg` frames were excluded. `geometry.json` supplements the images.

## Confirmed in these captures

- Every image matches its filename's page, width, language and theme. Home's native desktop images measure 1437×898 and 1021×897; Work measures 1440×900 and 1024×900. Both phone widths are exact at 390×844 and 320×844.
- No visible horizontal clipping or overlapping controls. Document width does not exceed requested viewport width in all 32 geometry records.
- Home's completion checkbox now has a visible outline in both themes, including the agenda. Text and action colors remain readable in the captured states.
- Desktop shell retains the 216px sidebar and 56px toolbar. My Work's first row starts at y=294; all four ordinary rows fit at 1440px and measure 64px. At 1024px the long final title expands to 78px; the other rows remain 64px.
- Task titles wrap naturally on phones. Completion and selection remain separate, with More in the trailing column. New task becomes a compact + control at 320px. Home's attention groups and My Work's date groups preserve their reading order.
- Captured focus rings on navigation/theme remain visible. No focus-ring clipping is visible in these frames.
- The separate 320px project Work capture shows completion on the left, More in the right column, and owner/date beneath the title. The shared action-wrapper guard is visually confirmed in this English/light List state; its focus ring on the Work tab remains visible.

## Resolved finding

The earlier ambiguous filter truncation is resolved in all 16 replacement Work images. Defaults now read Project / Date / Status / Mine and Proyek / Tanggal / Status / Saya, including 1024px and both phone widths. Source inspection confirms the button helper receives full accessible labels such as All projects / All statuses / Assigned to me. Selected project/person values can still shorten naturally; this audit covers the displayed default states. No remaining material clipping or contrast concern was found in this matrix.

## Density and limits

At 320px My Work begins at y=404 and initially shows two complete task rows; ordinary rows measure 130–152px and the linked-source row reaches 178px. At 390px rows measure 111–159px. This accommodates wrapping and touch actions but mobile density remains an iterative refinement. Home's supporting agenda sits below attention and assigned groups on phones.

This is a visual audit of initial List states, not complete interaction acceptance. Geometry does not measure every touch target. The CSS defines 44px mobile/coarse-pointer actions, but physical touch, screen keyboard, screen-reader behavior, task-form states, exhaustive focus restoration, Board/Timeline and bulk-toolbar placement are outside this 32-frame matrix. Project Work's separate guard capture covers one 320px English/light state. Motion and solid-surface behavior are not established by still images.

Diagnostic sheets: `home-desktop-audit.jpg`, `home-phone-audit.jpg`, `work-desktop-audit.jpg`, `work-phone-audit.jpg`.
