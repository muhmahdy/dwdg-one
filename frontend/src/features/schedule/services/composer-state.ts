/* The composer's screen state (ui.composer) and sending. Opening it from anywhere (New menu, "Find a time", Meet with…) goes
   through openComposer; every edit re-reads the sentence so people, day, time and suggestions stay in step. */
import { uid } from '@/lib/ids';
import { t as tr } from '@/lib/i18n';
import { nowStamp } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, setUi } from '@/lib/workspace/transaction';
import type { Draft } from 'immer';
import type { Meeting, PersonId, Workspace } from '@/types/workspace';
import { currentWs } from '@/lib/access';
import { sessionStore } from '@/lib/session';
import { nameList } from './availability';
import { conflicts, initialComposer, parseComposer, type ComposerState } from './composer';
import { meetingWs } from './meetings';

const W = (db: Draft<Workspace>) => db as Workspace;

export const composerOf = (ui: { composer: unknown }) => ui.composer as ComposerState | null;

export function openComposer(prefill = '', extra: Partial<ComposerState> = {}) {
  const me = getMe();
  if (!me) return;
  const c = parseComposer(getDb(), me, initialComposer(prefill, extra));
  setUi((u) => {
    u.menu = null;
    u.composer = c;
  });
}

export const closeComposer = () => {
  setUi((u) => {
    u.composer = null;
  });
};

/** Changes the composer and re-reads the sentence. Newly added people with Google Calendar show "Checking…" briefly. */
export function patchComposer(patch: Partial<ComposerState>) {
  const me = getMe();
  if (!me) return;
  setUi((u) => {
    const c = composerOf(u);
    if (!c) return;
    const merged = { ...c, ...patch };
    const next = parseComposer(getDb(), me, merged);
    const fresh = next.people.filter((p) => !c.people.includes(p) && getDb().people.find((x) => x.id === p)?.gcal);
    u.composer = fresh.length ? { ...next, checking: [...c.checking, ...fresh] } : next;
    if (fresh.length)
      setTimeout(() => {
        setUi((v) => {
          const cur = composerOf(v);
          if (cur) v.composer = { ...cur, checking: cur.checking.filter((p) => !fresh.includes(p)) };
        });
      }, 450);
  });
}

/** Changes a field that never changes what the sentence says (place, agenda, project, note-taker, Meet). */
export function setComposerField(patch: Partial<ComposerState>) {
  setUi((u) => {
    const c = composerOf(u);
    if (c) u.composer = { ...c, ...patch };
  });
}

export const addGuest = (c: ComposerState, id: PersonId) => {
  patchComposer({ manual: [...c.manual, id], removed: c.removed.filter((x) => x !== id) });
};
export const removeGuest = (c: ComposerState, id: PersonId) => {
  patchComposer({ manual: c.manual.filter((x) => x !== id), removed: [...c.removed, id] });
};

/** Sends the invitations. A clash needs a second confirm first (availability_override is open); returns 'confirm' for that. */
export function sendMeeting(c: ComposerState): 'confirm' | Promise<boolean> | undefined {
  const me = getMe();
  if (!me || !c.people.length) return undefined;
  const bad = conflicts(getDb(), me, c, c.start, c.dur);
  if (bad.length && !c.ack) {
    setComposerField({ ack: true });
    return 'confirm';
  }
  return act(({ db, ui, toast }) => {
    const mt: Meeting = {
      id: uid('m'),
      title: c.title,
      organizer: me.id,
      date: c.date,
      start: c.start,
      end: c.start + c.dur,
      where: c.where,
      meet: c.meet,
      agenda: c.agenda,
      icon: null,
      reactions: {},
      notetaker: c.notetaker ?? me.id,
      project: c.project,
      state: 'planned',
      reason: '',
      minutes: null,
      responses: { [me.id]: 'accepted', ...Object.fromEntries(c.people.map((p) => [p, 'pending'])) },
      createdAt: nowStamp(),
    };
    db.meetings.push(mt);
    for (const p of c.people) notify(db, p, 'invite', { type: 'meeting', id: mt.id });
    logChange(db, meetingWs(W(db), mt, currentWs(me, sessionStore.get().ws)), 'scheduled', {
      type: 'meeting',
      id: mt.id,
      name: mt.title,
    });
    ui.composer = null;
    ui.calDate = c.date;
    toast(tr('Invitations sent to {who}', { who: nameList(W(db), me.id, c.people) }), ({ db: d }) => {
      d.meetings = d.meetings.filter((x) => x.id !== mt.id);
      d.updates = d.updates.filter((u) => !(u.ref.type === 'meeting' && u.ref.id === mt.id));
    });
  });
}
