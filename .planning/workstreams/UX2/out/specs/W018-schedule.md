# W018 · Schedule, unavailable time and Find a time

**Packages:** W018 (frontend), W035, W036 (SCH), W096 (Google Calendar two-way sync, D24). **Stories:** S026.
**Requirements:** work_schedule, work_meeting_composer, work_meeting_outcomes, work_availability, availability_declared, availability_overlap, availability_stale, availability_person_inspector, design-availability-evidence, integration-calendar, entity_meeting, flow-meeting-compose, flow-meeting-change, flow-meeting-outcomes, access_availability_privacy_policy, org_timezone_calendar. Owner decisions D13, D23, D24, D33.
**Prototype:** `prototype/schedule.js`.

## Records

- **Meeting:** title, date, start and end (minutes), location (free text or link, often a Maps link, D13), `meet` (Google Meet requested; the link comes from sync), organizer, `responses {person: accepted | pending | declined}`, `repliedAt`, agenda, note-taker, project, `state` planned | held | cancelled, `reason` (required to cancel), `heldAt`, minutes (resource ID), decisions, follow-ups, icon, reactions.
- **Unavailable time:** one-off `date` or weekly `day` with `from`, all-day or start and end, private `note`. Never written to workspace Changes.
- **Google busy:** blocks from the person's Google Calendar (sync, D24), shown to others as "Busy" only.

## 1. Calendar

**Route** `#/schedule`. As intuitive as Google Calendar (D23); own look with striped busy blocks.

- **Left panel:** Create, mini month (busy-day dots, click to jump), Meet with (people picker: overlay their busy time), calendar checkboxes (Meetings, Unavailable, Google busy, Task due dates), sync status.
- **Toolbar:** Find a time, Today, previous and next, the date label, help popover (shortcuts), view switch Day, Week, Month. Day is the default under 1000 px.
- **Grid:** 15-minute slots, all-day row (due dates, all-day unavailable), now line. Overlapping events cascade like Google (later starts indent, same starts split). Events show title first, full title and time on hover.
- **Create:** click or drag on empty time: start is the slot under the pointer (floored to 15 minutes), default 60 minutes (O26). A quick card asks: title, Meeting or Unavailable time, then Save or More options (full editor).
- **Own items:** drag to move, drag the edge to resize. Keyboard equivalents for every drag: arrows move 15 minutes, Shift+arrows resize, Left and Right change day (W018 acceptance 1). Others' meetings and Google busy are locked.
- **Shortcuts on this page:** T today, D day, W week, M month, J or N next, K or P previous, C create.
- **Event card** (popover beside the event): title, time, location, Going? Yes or No, Details, Edit (organizer), download .ics.

**States:** Google not connected: banner "Connect Google Calendar" in the side panel (never pretends to know busy time). Sync stale: "Last synced {time}" in amber with Retry (availability_stale). Save failed on drag: the event returns to its place and says "Could not move. Retry". **Size:** L.

## 2. Unavailable time

- Editor: one-off by default, Repeat weekly explicit, all-day or times, private note ("Only you see this note"), overlap warning with own meetings.
- Others see only "Unavailable", never the note (W018 acceptance 3). Editing a weekly block moves the whole series in v1 (occurrence editing waits on access_availability_privacy_policy). **Size:** M.

## 3. Meeting inspector

- Agenda, note-taker, project link, time zone, guests with their replies and reply times, organizer controls: Mark as held, Cancel (reason required; guests get "cancelled"), change time (guests get one "changed" update, deduplicated while unread).
- **Outcomes** after it is held (work_meeting_outcomes): minutes note (a resource), decisions (question, result, who decides), follow-ups (a follow-up for someone else is an offer, never a task forced on them).
- **Size:** M.

## 4. Find a time composer (R046, work_meeting_composer)

- Opens from Find a time, the New menu (M), the person panel and Meet with. One sentence input with highlighted people, day and length ("Roadmap sync with Salsa and Dimas thu 1 hour"), English and Indonesian words understood, example prompts.
- **People rows:** each guest's day as recorded busy intervals with categories (Meeting, Unavailable, Google busy), never private notes or others' titles. No declared time and no Google connection shows **Unknown**, never free (availability_stale, S026 acceptance 2).
- **Slot:** a draggable slot over the rows with exact controls for date, start and duration (stepper); arrows move it. The slot turns red on a clash; clash text names the people. Suggestions list open start times per day from 08:00 ("free at" chips).
- **Overlap rule:** half-open intervals: a 09:00–10:00 block clashes with a 09:30 start and not with 10:00 (W018 acceptance 2, S026 acceptance 1).
- **Send:** title, guests, Google Meet toggle (no fake link), location. With a clash, a second confirmation; a clash is never treated as a yes. Creates one meeting and one invite Update per guest.
- **Size:** L.

## 5. Google Calendar sync (D24)

Two-way sync is in v1; ARC designs it and SCH builds it (W096). The UI shows: connection state, last sync time, errors with Retry, which calendars are read for busy time, and that DWDG meetings are written to the organizer's Google Calendar. Google event titles from a person's own calendar are never shown to others.

## 6. Permissions shown

| Action | Who |
|---|---|
| Create own meetings and unavailable time | any member |
| Edit, move, cancel, mark held | the organizer |
| Reply | each guest |
| See a meeting's title | the organizer, guests, and members of the meeting's workspace or an organization-wide project (D33 person panel rule) |
| See unavailable notes | the person only |

## 7. Events

meeting created (invite per guest), changed (one changed update per guest), cancelled (with reason), held, reply (rsvp-yes or rsvp-no with repliedAt), minutes shared, decision requested and decided, follow-up offered; unavailable time created, edited, deleted (no Changes, no notifications); sync connected, failed, restored.

## 8. QA checks

1. Every drag has an exact keyboard or field equivalent (W018 acceptance 1).
2. A 09:00–10:00 block clashes with 09:30 and not with a 10:00 start (acceptance 2).
3. A private note never appears in another person's view; empty coverage says Unknown, never Free (acceptance 3).
4. Sending with a clash needs a second confirmation.
