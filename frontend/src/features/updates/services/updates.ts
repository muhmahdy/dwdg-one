/* Updates (work_updates): what is for you, with "Your replies" (owner review O8) listing everything that asked you for an
   answer, and the actions to read one or all. From screens/plan.js. */
import { go } from '@/app/router/navigation';
import { act } from '@/lib/workspace/transaction';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { mins, dShort } from '@/lib/time';
import type { EntityRef, Person, Workspace } from '@/types/workspace';

/** The record an update points at, as a title; null when it no longer exists. */
export function refTitle(db: Workspace, ref: EntityRef): string | null {
  const has = <T extends { id: string }>(list: T[] | undefined) => list?.find((v) => v.id === ref.id);
  switch (ref.type) {
    case 'task':
      return has(db.tasks)?.title ?? null;
    case 'offer':
      return has(db.offers)?.title ?? null;
    case 'meeting':
      return has(db.meetings)?.title ?? null;
    case 'decision':
      return has(db.decisions)?.question ?? null;
    case 'resource':
      return has(db.resources)?.name ?? null;
    case 'project':
      return has(db.projects)?.name ?? null;
    case 'program':
      return has(db.programs)?.name ?? null;
    case 'routine':
      return has(db.routines)?.name ?? null;
    default:
      return null;
  }
}

export type ReplyKind = 'Meeting' | 'Task offer' | 'Review' | 'Decision' | 'Shared task' | 'Project invitation';
export type ReplyChoice = 'Accepted' | 'Approved' | 'Declined' | 'Rejected' | 'Asked for changes';

export interface Reply {
  kind: ReplyKind;
  at: string;
  title: string;
  from: string;
  /** What the person chose; null while it still waits for them. */
  choice: ReplyChoice | null;
  open: EntityRef;
  extra: string;
}

/** Everything that asked you for an answer, whether you answered and what you chose, newest first. */
export function myReplies(db: Workspace, me: Person): Reply[] {
  const out: Reply[] = [];
  for (const mt of db.meetings) {
    const r = mt.responses[me.id];
    if (mt.organizer === me.id || !r) continue;
    out.push({
      kind: 'Meeting',
      at: mt.repliedAt?.[me.id] ?? mt.createdAt,
      title: mt.title,
      from: mt.organizer,
      choice: r === 'pending' ? null : r === 'accepted' ? 'Accepted' : 'Declined',
      open: { type: 'meeting', id: mt.id },
      extra: `${dShort(mt.date)} ${mins(mt.start)}`,
    });
  }
  for (const o of db.offers)
    if (o.to === me.id && o.state !== 'withdrawn')
      out.push({
        kind: 'Task offer',
        at: o.answeredAt ?? o.at,
        title: o.title,
        from: o.from,
        choice:
          o.state === 'pending'
            ? null
            : o.state === 'accepted'
              ? 'Accepted'
              : o.state === 'declined'
                ? 'Declined'
                : 'Asked for changes',
        open: { type: 'offer', id: o.id },
        extra: '',
      });
  for (const x of db.tasks) {
    if (x.trashed) continue;
    if (x.reviewer === me.id && x.owner !== me.id && (x.status === 'review' || x.reviewChoice))
      out.push({
        kind: 'Review',
        at: x.reviewedAt ?? x.createdAt,
        title: x.title,
        from: x.owner,
        choice: x.status === 'review' ? null : x.reviewChoice === 'approved' ? 'Approved' : 'Asked for changes',
        open: { type: 'task', id: x.id },
        extra: '',
      });
    for (const a of x.assignees)
      if (a.id === me.id && !a.direct && (a.state === 'invited' || a.answeredAt))
        out.push({
          kind: 'Shared task',
          at: a.answeredAt ?? a.at,
          title: x.title,
          from: a.by,
          choice: a.state === 'invited' ? null : a.state === 'joined' ? 'Accepted' : 'Declined',
          open: { type: 'task', id: x.id },
          extra: '',
        });
  }
  for (const d of db.decisions)
    if (d.approver === me.id && d.createdBy !== me.id)
      out.push({
        kind: 'Decision',
        at: d.decidedAt ?? d.createdAt,
        title: d.question,
        from: d.createdBy,
        choice: d.state === 'awaiting' ? null : d.state === 'approved' ? 'Approved' : 'Rejected',
        open: { type: 'decision', id: d.id },
        extra: '',
      });
  for (const p of db.projects)
    for (const x of p.team)
      if (x.id === me.id && x.by !== me.id && !x.direct && (x.state === 'invited' || x.answeredAt))
        out.push({
          kind: 'Project invitation',
          at: x.answeredAt ?? x.at,
          title: p.name,
          from: x.by,
          choice: x.state === 'invited' ? null : x.state === 'joined' ? 'Accepted' : 'Declined',
          open: { type: 'project', id: p.id },
          extra: '',
        });
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

const PANEL: Record<string, string> = {
  task: 'task',
  offer: 'offer',
  meeting: 'meeting',
  decision: 'decision',
  resource: 'res',
};

/** Opens what an update is about (a panel, or the project, program or operation page) and marks it read. */
export function openUpdate(id: string) {
  const u = getDb().updates.find((v) => v.id === id);
  if (!u) return;
  const { type, id: ref } = u.ref;
  const base = { project: 'projects', program: 'programs', routine: 'operations' }[type];
  const page = base
    ? `${base}/${ref}${type === 'project' && /^cp-|pinvite|padded/.test(u.type) ? '/people' : ''}`
    : null;
  void act(({ db, ui }) => {
    const x = db.updates.find((v) => v.id === id);
    if (x) x.read = true;
    ui.form = null;
    if (page) ui.insp = null;
    else if (PANEL[type]) ui.insp = { type: PANEL[type], id: ref };
  });
  if (page) go(page);
}

export function markAllRead() {
  return act(({ db }) => {
    const me = getMe();
    for (const u of db.updates) if (u.to === me?.id) u.read = true;
  });
}
