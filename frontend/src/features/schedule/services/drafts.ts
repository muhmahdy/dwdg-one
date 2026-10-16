/* The quick card and the full editor share one draft (ui.draft): a meeting, an unavailable block, or a task due that day.
   From screens/schedule.js newDraft / draftFromMeeting. */
import type { Meeting, PersonId } from '@/types/workspace';

export type DraftKind = 'event' | 'busy' | 'task';

export interface MeetingDraft {
  /** Present when editing an existing meeting. */
  id?: string;
  kind: DraftKind;
  title: string;
  date: string;
  /** Minutes since midnight; for a task, the due time when `timed`. */
  start: number;
  end: number;
  guests: PersonId[];
  where: string;
  notes: string;
  agenda: string;
  project: string | null;
  notetaker: PersonId | null;
  repeat: boolean;
  allDay: boolean;
  timed: boolean;
  /** Where the quick card appears (the dragged block), in window pixels. */
  anchor: { x: number; y: number } | null;
}

export const newDraft = (date: string, start: number, end: number, anchor: MeetingDraft['anchor']): MeetingDraft => ({
  kind: 'event',
  title: '',
  date,
  start,
  end,
  guests: [],
  where: '',
  notes: '',
  agenda: '',
  project: null,
  notetaker: null,
  repeat: false,
  allDay: false,
  timed: true,
  anchor,
});

export const draftFromMeeting = (mt: Meeting): MeetingDraft => ({
  ...newDraft(mt.date, mt.start, mt.end, null),
  id: mt.id,
  title: mt.title,
  guests: Object.keys(mt.responses).filter((i) => i !== mt.organizer),
  where: mt.where,
  notes: mt.notes ?? '',
  agenda: mt.agenda,
  project: mt.project,
  notetaker: mt.notetaker,
});
