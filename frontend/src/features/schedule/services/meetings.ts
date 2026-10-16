/* Meetings (entity_meeting, work_meeting_composer, work_meeting_outcomes), from screens/schedule.js. */
import { getMe } from '@/lib/workspace/hooks';
import { notify } from '@/lib/workspace/feed';
import { act } from '@/lib/workspace/transaction';
import { t as tr } from '@/lib/i18n';
import { nowStamp } from '@/lib/time';
import type { DivisionId, Meeting, Unavailable, Workspace } from '@/types/workspace';
import { personOf, projOf } from '@/features/work/services/selectors';

/** The workspace a meeting belongs to: its project's division, else its organizer's. */
export const meetingWs = (db: Workspace, mt: Meeting, fallback: DivisionId): DivisionId =>
  projOf(db, mt.project)?.div ?? personOf(db, mt.organizer)?.div ?? fallback;

/** Whether an unavailable entry covers a date (weekly series repeat on their weekday from their start). */
export const uOn = (u: Unavailable, d: string, weekdayOf: (d: string) => number) =>
  u.weekly ? u.day === weekdayOf(d) && (!u.from || d >= u.from) : u.date === d;

/** Reply to an invitation. The organizer is told; updates about this meeting count as read. */
export function rsvp(id: string, r: 'accepted' | 'declined') {
  return act(({ db, toast }) => {
    const mt = db.meetings.find((x) => x.id === id);
    const m = getMe();
    if (!mt || !m) return;
    const prev = mt.responses[m.id];
    mt.responses[m.id] = r;
    const replied = (mt.repliedAt ??= {}) as Record<string, string>;
    replied[m.id] = nowStamp();
    notify(db, mt.organizer, r === 'accepted' ? 'rsvp-yes' : 'rsvp-no', { type: 'meeting', id: mt.id });
    for (const u of db.updates) if (u.to === m.id && u.ref.type === 'meeting' && u.ref.id === id) u.read = true;
    const organizer = personOf(db, mt.organizer)?.first ?? tr('Someone');
    toast(
      r === 'accepted'
        ? tr('You are going to {what}', { what: mt.title })
        : tr('You declined {what}. {who} was told.', { what: mt.title, who: organizer }),
      ({ db: d }) => {
        const x = d.meetings.find((y) => y.id === id);
        if (x && prev) x.responses[m.id] = prev;
      },
    );
  });
}
