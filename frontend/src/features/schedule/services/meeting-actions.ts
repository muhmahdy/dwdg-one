/* Writing meetings, unavailable time and Google Calendar state (work_schedule, work_meeting_composer,
   work_meeting_outcomes, availability_declared, integration-calendar), from screens/schedule.js.
   Each exported action is one transaction (act). Unavailable time is private: it is never written to workspace Changes. */
import type { Draft } from 'immer';
import { currentWs } from '@/lib/access';
import { uid } from '@/lib/ids';
import { t as tr, WDL } from '@/lib/i18n';
import { sessionStore } from '@/lib/session';
import { D, dLong, dShort, mins, nowStamp, weekday } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { addTaskDraft } from '@/features/work/services/task-actions';
import type { Meeting, PersonId, Resource, Unavailable, Workspace } from '@/types/workspace';
import { meetingWs } from './meetings';
import { nameList } from './availability';
import type { MeetingDraft } from './drafts';

const W = (db: Draft<Workspace>) => db as Workspace;
const fallbackWs = () => {
  const me = getMe();
  return me ? currentWs(me, sessionStore.get().ws) : 'sng';
};
const span = (d: string, s: number, e: number) => `${dShort(d)} ${mins(s)}–${mins(e)}`;
const firstOf = (db: Workspace, id: PersonId) => db.people.find((p) => p.id === id)?.first ?? tr('Someone');

/** One unread "changed" update per guest and meeting, however often it moves (work_updates: group repeats). */
function notifyChanged(db: Draft<Workspace>, guest: PersonId, mt: Meeting) {
  db.updates = db.updates.filter((u) => !(u.to === guest && u.type === 'changed' && !u.read && u.ref.id === mt.id));
  notify(db, guest, 'changed', { type: 'meeting', id: mt.id });
}

/** Saves the quick card or the full editor: a meeting (new or edited), unavailable time, or a task due that day. */
export function saveDraft(d: MeetingDraft) {
  return act(({ db, ui, toast }) => {
    const m = getMe();
    if (!m) return;
    let msg = '';
    let undo: (ctx: { db: Draft<Workspace> }) => void = () => undefined;

    if (d.kind === 'task') {
      const task = addTaskDraft(db, d.title || tr('Untitled task'), { due: d.date, time: d.timed ? d.start : null });
      const id = task?.id;
      msg = tr('Task added to My Work');
      undo = ({ db: x }) => {
        x.tasks = x.tasks.filter((v) => v.id !== id);
      };
    } else if (d.kind === 'busy') {
      const u: Unavailable = {
        id: uid('u'),
        who: m.id,
        day: weekday(d.date),
        date: d.repeat ? null : d.date,
        from: d.date,
        weekly: d.repeat,
        allDay: d.allDay,
        start: d.allDay ? 0 : d.start,
        end: d.allDay ? 1440 : d.end,
        note: d.title.trim(),
        createdAt: nowStamp(),
      };
      db.unavailable.push(u);
      msg = d.repeat ? tr('Weekly unavailable time saved') : tr('Unavailable time saved');
      undo = ({ db: x }) => {
        x.unavailable = x.unavailable.filter((v) => v.id !== u.id);
      };
    } else if (d.id) {
      const mt = db.meetings.find((x) => x.id === d.id);
      if (!mt) return;
      const prev = structuredClone(mt);
      const moved = mt.date !== d.date || mt.start !== d.start || mt.end !== d.end;
      Object.assign(mt, {
        title: d.title || tr('Meeting'),
        date: d.date,
        start: d.start,
        end: d.end,
        where: d.where,
        notes: d.notes,
        agenda: d.agenda,
        project: d.project,
        notetaker: d.notetaker ?? mt.organizer,
      });
      const keep: Meeting['responses'] = { [mt.organizer]: 'accepted' };
      for (const g of d.guests) {
        keep[g] = mt.responses[g] ?? 'pending';
        if (!mt.responses[g]) notify(db, g, 'invite', { type: 'meeting', id: mt.id });
        else if (moved) notifyChanged(db, g, mt);
      }
      mt.responses = keep;
      logChange(
        db,
        meetingWs(W(db), mt, fallbackWs()),
        'edited meeting',
        { type: 'meeting', id: mt.id, name: mt.title },
        moved ? span(prev.date, prev.start, prev.end) : null,
        moved ? span(mt.date, mt.start, mt.end) : null,
      );
      msg = tr('Meeting updated. Guests see the change.');
      undo = ({ db: x }) => {
        const v = x.meetings.find((y) => y.id === prev.id);
        if (v) Object.assign(v, prev);
      };
    } else {
      const responses: Meeting['responses'] = { [m.id]: 'accepted' };
      for (const g of d.guests) responses[g] = 'pending';
      const mt: Meeting = {
        id: uid('m'),
        title: d.title || tr('Meeting'),
        organizer: m.id,
        date: d.date,
        start: d.start,
        end: d.end,
        where: d.where,
        agenda: d.agenda,
        icon: null,
        reactions: {},
        notes: d.notes,
        notetaker: d.notetaker ?? m.id,
        project: d.project,
        state: 'planned',
        reason: '',
        minutes: null,
        responses,
        createdAt: nowStamp(),
      };
      db.meetings.push(mt);
      for (const g of d.guests) notify(db, g, 'invite', { type: 'meeting', id: mt.id });
      if (d.guests.length)
        logChange(db, meetingWs(W(db), mt, fallbackWs()), 'scheduled', { type: 'meeting', id: mt.id, name: mt.title });
      msg = d.guests.length
        ? tr('Invitations sent to {who}', { who: nameList(W(db), m.id, d.guests) })
        : tr('Saved to your calendar');
      undo = ({ db: x }) => {
        x.meetings = x.meetings.filter((v) => v.id !== mt.id);
        x.updates = x.updates.filter((u) => !(u.ref.type === 'meeting' && u.ref.id === mt.id));
      };
    }
    ui.draft = null;
    if (ui.insp?.type === 'event-edit') ui.insp = null;
    ui.calDate = d.date;
    toast(msg, undo);
  });
}

/** Drag or keyboard move of your own meeting; guests are told once however often it moves. */
export function moveMeeting(id: string, ns: number, ne: number, nd: string) {
  return act(({ db, toast }) => {
    const mt = db.meetings.find((x) => x.id === id);
    if (!mt) return;
    const prev = { start: mt.start, end: mt.end, date: mt.date };
    mt.start = ns;
    mt.end = ne;
    mt.date = nd;
    for (const g of Object.keys(mt.responses)) if (g !== mt.organizer) notifyChanged(db, g, mt);
    logChange(
      db,
      meetingWs(W(db), mt, fallbackWs()),
      'moved meeting',
      { type: 'meeting', id: mt.id, name: mt.title },
      span(prev.date, prev.start, prev.end),
      span(nd, ns, ne),
    );
    toast(tr('Moved to {when}. Guests see the change.', { when: `${dLong(nd)}, ${mins(ns)}` }), ({ db: d }) => {
      const x = d.meetings.find((y) => y.id === id);
      if (x) Object.assign(x, prev);
    });
  });
}

/** Drag or keyboard move of your own unavailable block; a weekly block moves to the new weekday. */
export function moveUnavailable(id: string, ns: number, ne: number, nd: string) {
  return act(({ db, toast }) => {
    const u = db.unavailable.find((x) => x.id === id);
    if (!u) return;
    const prev = { start: u.start, end: u.end, date: u.date, day: u.day };
    u.start = ns;
    u.end = ne;
    u.day = weekday(nd);
    if (!u.weekly) u.date = nd;
    toast(
      u.weekly
        ? tr('Unavailable time moved to {time} every {day}', { time: mins(ns), day: WDL()[D(nd).getDay()] ?? '' })
        : tr('Unavailable time moved to {when}', { when: `${dLong(nd)}, ${mins(ns)}` }),
      ({ db: d }) => {
        const x = d.unavailable.find((y) => y.id === id);
        if (x) Object.assign(x, prev);
      },
    );
  });
}

export function markHeld(id: string) {
  return act(({ db, toast }) => {
    const mt = db.meetings.find((x) => x.id === id);
    if (!mt) return;
    mt.state = 'held';
    mt.heldAt = nowStamp();
    logChange(db, meetingWs(W(db), mt, fallbackWs()), 'marked held', { type: 'meeting', id: mt.id, name: mt.title });
    toast(tr('Marked as held. Add minutes, decisions and follow-ups.'), ({ db: d }) => {
      const x = d.meetings.find((y) => y.id === id);
      if (x) {
        x.state = 'planned';
        x.heldAt = null;
      }
    });
  });
}

export function cancelMeeting(id: string, reason: string) {
  if (!reason.trim()) return tr('Give guests a reason.');
  return act(({ db, ui, toast }) => {
    const mt = db.meetings.find((x) => x.id === id);
    if (!mt) return;
    mt.state = 'cancelled';
    mt.reason = reason.trim();
    for (const g of Object.keys(mt.responses)) notify(db, g, 'cancelled', { type: 'meeting', id: mt.id });
    logChange(db, meetingWs(W(db), mt, fallbackWs()), 'canceled meeting', {
      type: 'meeting',
      id: mt.id,
      name: mt.title,
    });
    ui.form = null;
    toast(tr('Meeting canceled. Guests were told.'), ({ db: d }) => {
      const x = d.meetings.find((y) => y.id === id);
      if (x) {
        x.state = 'planned';
        x.reason = '';
      }
    });
  });
}

/** Starts the minutes: a note in Resources with the agenda items as headings, linked to the meeting; opens it. */
export function writeMinutes(id: string) {
  return act(({ db, ui }) => {
    const mt = db.meetings.find((x) => x.id === id);
    const m = getMe();
    if (!mt || !m) return;
    const r: Resource = {
      id: uid('r'),
      kind: 'note',
      name: tr('{title} minutes, {date}', { title: mt.title, date: dShort(mt.date) }),
      div: meetingWs(W(db), mt, fallbackWs()),
      parent: null,
      url: '',
      body: mt.agenda
        ? mt.agenda
            .split('\n')
            .filter(Boolean)
            .map((a) => `${a}:\n`)
            .join('\n')
        : '',
      purpose: '',
      project: mt.project,
      meeting: mt.id,
      owner: mt.notetaker || m.id,
      contributors: [],
      createdBy: m.id,
      createdAt: nowStamp(),
      pinned: false,
      revisions: 0,
      archived: false,
      reports: [],
      brief: false,
      ref: null,
      editedBy: null,
      editedAt: null,
    };
    db.resources.push(r);
    mt.minutes = r.id;
    logChange(db, r.div, 'created note', { type: 'resource', id: r.id, name: r.name });
    ui.insp = { type: 'res', id: r.id, focusBody: true };
  });
}

export function addDecision(meetingId: string, question: string, result: string, approver: PersonId) {
  if (!question.trim()) return tr('Write the question that was decided.');
  return act(({ db, ui, toast }) => {
    const mt = db.meetings.find((x) => x.id === meetingId);
    const m = getMe();
    if (!mt || !m) return;
    const self = approver === m.id;
    const dc = {
      id: uid('d'),
      project: mt.project ?? '',
      meeting: mt.id,
      question: question.trim(),
      result: result.trim(),
      approver,
      state: self ? 'approved' : 'awaiting',
      decidedAt: self ? nowStamp() : null,
      createdBy: m.id,
      createdAt: nowStamp(),
    };
    db.decisions.push(dc);
    if (!self) notify(db, approver, 'decision', { type: 'decision', id: dc.id });
    logChange(db, meetingWs(W(db), mt, fallbackWs()), 'recorded a decision on', {
      type: 'meeting',
      id: mt.id,
      name: mt.title,
    });
    ui.form = null;
    toast(
      self ? tr('Decision recorded') : tr('Sent to {who} to decide', { who: firstOf(W(db), approver) }),
      ({ db: d }) => {
        d.decisions = d.decisions.filter((x) => x.id !== dc.id);
      },
    );
  });
}

/** A follow-up from a meeting: your own task, or an offer to someone else (nothing is assigned until they accept). */
export function addFollowup(meetingId: string, title: string, owner: PersonId, due: string | null) {
  if (!title.trim()) return tr('Name the follow-up.');
  return act(({ db, ui, toast }) => {
    const mt = db.meetings.find((x) => x.id === meetingId);
    const m = getMe();
    if (!mt || !m) return;
    let undo: (ctx: { db: Draft<Workspace> }) => void;
    if (owner === m.id) {
      const task = addTaskDraft(db, title.trim(), { due, project: mt.project, meeting: mt.id });
      const id = task?.id;
      undo = ({ db: x }) => {
        x.tasks = x.tasks.filter((v) => v.id !== id);
      };
    } else {
      const o = {
        id: uid('o'),
        from: m.id,
        to: owner,
        title: title.trim(),
        result: '',
        due,
        project: mt.project,
        meeting: mt.id,
        state: 'pending',
        note: tr('Follow-up from {what}', { what: mt.title }),
        task: null,
        at: nowStamp(),
        answeredAt: null,
      };
      db.offers.push(o);
      notify(db, owner, 'offer', { type: 'offer', id: o.id });
      undo = ({ db: x }) => {
        x.offers = x.offers.filter((v) => v.id !== o.id);
      };
    }
    ui.form = null;
    toast(
      owner === m.id
        ? tr('Follow-up added to your tasks')
        : tr('Offered to {who}. Nothing is assigned until they accept.', { who: firstOf(W(db), owner) }),
      undo,
    );
  });
}

export interface UnavailableDraft {
  date: string;
  start: number;
  end: number;
  allDay: boolean;
  weekly: boolean;
  note: string;
}

/** Saves one unavailable block: new, or an edit of your own. Returns an error message when the end is before the start. */
export function saveUnavailable(id: string | null, u: UnavailableDraft): string | Promise<boolean> {
  if (!u.allDay && !(u.end > u.start)) return tr('End must be after start.');
  return act(({ db, ui, toast }) => {
    const m = getMe();
    if (!m) return;
    const data = {
      date: u.weekly ? null : u.date,
      from: u.date,
      day: weekday(u.date),
      weekly: u.weekly,
      allDay: u.allDay,
      start: u.allDay ? 0 : u.start,
      end: u.allDay ? 1440 : u.end,
      note: u.note.trim(),
    };
    const own = id ? db.unavailable.find((x) => x.id === id) : undefined;
    const prev = own ? { ...own } : null;
    const newId = uid('u');
    if (own) Object.assign(own, data);
    else db.unavailable.push({ id: newId, who: m.id, createdAt: nowStamp(), ...data });
    ui.insp = null;
    toast(tr('Unavailable time saved'), ({ db: d }) => {
      if (own && prev) {
        const x = d.unavailable.find((y) => y.id === own.id);
        if (x) Object.assign(x, prev);
      } else d.unavailable = d.unavailable.filter((y) => y.id !== newId);
    });
  });
}

export function deleteUnavailable(id: string) {
  return act(({ db, ui, toast }) => {
    const u = db.unavailable.find((x) => x.id === id);
    if (!u) return;
    const saved = { ...u };
    db.unavailable = db.unavailable.filter((x) => x.id !== id);
    ui.insp = null;
    toast(tr('Unavailable time removed'), ({ db: d }) => {
      d.unavailable.push(saved);
    });
  });
}

/** Simulated Google Calendar connection (the real sync arrives with the integration; nothing is sent to Google). */
export function connectGoogleCalendar() {
  return act(({ db, toast }) => {
    const m = getMe();
    const p = db.people.find((x) => x.id === m?.id);
    if (!p) return;
    p.gcal = true;
    const id = p.id;
    toast(tr('Prototype: Google Calendar connection simulated. Nothing was sent to Google.'), ({ db: d }) => {
      const x = d.people.find((y) => y.id === id);
      if (x) x.gcal = false;
    });
  });
}
