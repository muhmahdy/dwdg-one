# dwdg'ONE clickable prototype

Front-end prototype of the top-level first version (`.planning/STRATEGY.md`, decision D8). Demo data only, stored in this browser's localStorage. Nothing is sent anywhere. Not connected to the preserved app or its stores.

## Open it

Double-click `prototype/index.html` (Chrome or Edge), or serve the project folder and open `/prototype/index.html`. Fonts load from Google Fonts, so internet is needed for the intended type.

## Demo accounts (chosen after "Continue with Google")

| Account | What to try |
|---|---|
| Mahdy, Director of SnG and Admin | Everything; approve Sekar in Settings; create projects in any division |
| Salsa, SnG member | No "New project"; sees invitations Mahdy sends |
| Raka, Vice President | Sees all six divisions in the workspace switcher |
| Dimas, Cons CD of Knowledge | Has no schedule recorded, so the composer shows him as unknown |
| Fadhil, President | Organisation-wide view |
| Sekar, new member | Waiting-for-approval screen |

## What works

- My Work: invitations (accept/decline), today, upcoming, done; one-line task capture (`Draft brief Fri @Salsa 14:00`); task panel with edit, created-by, trash with Undo.
- Schedule: week view (Google-style layout, dwdg'ONE look), meetings, pending invites, striped busy time, tasks in the all-day row, "now" line; mark unavailable (weekly, private note).
- Meeting composer (press M): sentence parsing for people, day and duration; one availability row per person; unknown is never shown as free; suggested times; drag the slot or use arrow keys; clash warning; send invitations.
- Projects: list with the owner's stage filter, project page with Overview / Work / Resources, stage change with Undo, create project (Co-Director and above only).
- Resources: folders, notes with revisions, links (files stay in your drives), pin, make a task from a resource.
- People: 40 members by division with division and role icons. Settings: theme (system/light/dark), approvals, reset demo data.
- Search (Ctrl K), + New menu, keyboard N (task) and M (meeting), phone layout with tab bar.

## Not in this prototype (later iterations)

Division workflows (HR attendance, FnL requests, EE pipeline and others; patterns exist in the design system), Indonesian language, real sign-in, server data, notifications, Changes feed, export.

## Rebuild icons

`node prototype/build-assets.mjs` after changing `.planning/brand/` icons.
