/* Resources (resource_explorer, resource_notes, resource_revisions, resource_tasks, resource_link_validation): folders, notes
   with revisions, and links to files that stay in the person's own drive. Only the link is stored. From screens/plan.js. */
import { visibleDivs } from '@/lib/access';
import { logChange, notify } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { uid } from '@/lib/ids';
import { plural, t as tr } from '@/lib/i18n';
import { nowStamp } from '@/lib/time';
import type { DivisionId, EntityRef, Person, PersonId, Project, Resource, Task, Workspace } from '@/types/workspace';
import { addTaskDraft } from '@/features/work/services/task-actions';
import { KIND, provOf, host, refInfo } from './links';

export const resOf = (db: Workspace, id: string | null | undefined) =>
  id ? db.resources.find((r) => r.id === id) : undefined;
export const resLinks = (db: Workspace, r: Resource) => db.tasks.filter((t) => !t.trashed && t.links.includes(r.id));
export const canEditRes = (me: Person, r: Resource) =>
  me.admin || [r.owner, r.createdBy, ...r.contributors].includes(me.id);
export const canSeeRes = (me: Person, r: Resource) =>
  !r.archived && (visibleDivs(me).includes(r.div) || [r.owner, ...r.contributors].includes(me.id));

export const sortResources = <T extends Resource>(arr: T[]) =>
  [...arr].sort((a, b) => Number(a.kind !== 'folder') - Number(b.kind !== 'folder') || a.name.localeCompare(b.name));

export const itemsIn = (db: Workspace, folderId: string | null) =>
  db.resources.filter((r) => (r.parent ?? null) === folderId && !r.archived);

const under = (db: Workspace, id: string): string[] =>
  db.resources.filter((x) => x.parent === id).flatMap((x) => [x.id, ...under(db, x.id)]);

/** Folders a resource can move into: same workspace and project, never itself or something inside itself. */
export function moveTargets(db: Workspace, r: Resource) {
  const no = [r.id, ...under(db, r.id)];
  return db.resources.filter(
    (x) =>
      x.kind === 'folder' &&
      !x.archived &&
      x.div === r.div &&
      (x.project ?? null) === (r.project ?? null) &&
      !no.includes(x.id),
  );
}

export const resMeta = (db: Workspace, r: Resource): string => {
  if (r.kind === 'folder')
    return plural(db.resources.filter((x) => x.parent === r.id && !x.archived).length, '{n} item', '{n} items');
  if (r.kind === 'link' && r.ref)
    return tr('{type} in dwdg’ONE', {
      type: tr(
        ({ project: 'Project', task: 'Task', meeting: 'Meeting' } as Record<string, string>)[r.ref.type] ?? 'Resource',
      ),
    });
  if (r.kind === 'link') return provOf(r.url)?.name ?? host(r.url);
  return `${r.brief ? tr('Project brief') : tr('Note')}${r.revisions ? `, ${tr('revision {n}', { n: r.revisions })}` : ''}`;
};

const refOf = (r: Resource): EntityRef => ({ type: 'resource', id: r.id, name: r.name });

export interface NewResource {
  kind: Resource['kind'];
  name: string;
  url: string;
  purpose: string;
  body: string;
  project: string | null;
  parent: string | null;
  div: DivisionId;
}

export function createResource(v: NewResource) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    if (!me) return;
    const p = v.project ? db.projects.find((x) => x.id === v.project) : undefined;
    const r: Resource = {
      id: uid('r'),
      kind: v.kind,
      name: v.name,
      div: p ? p.div : v.div,
      parent: v.parent,
      url: v.url,
      body: v.body,
      purpose: v.purpose,
      project: p?.id ?? null,
      meeting: null,
      owner: me.id,
      contributors: [],
      createdBy: me.id,
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
    logChange(
      db,
      r.div,
      v.kind === 'folder' ? 'created folder' : v.kind === 'note' ? 'created note' : 'added link',
      refOf(r),
    );
    ui.insp = { type: 'res', id: r.id };
    toast(tr('{k} added', { k: tr(KIND[v.kind][0]) }), ({ db: d, ui: u }) => {
      d.resources = d.resources.filter((x) => x.id !== r.id);
      u.insp = null;
    });
  });
}

/** Adds a link resource to a project from its Links section: a web address or a record inside dwdg’ONE. */
export function addProjectLink(projectId: string, target: { url: string } | { ref: EntityRef }, name: string) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const p = db.projects.find((x) => x.id === projectId);
    if (!me || !p) return;
    let label: string;
    let url = '';
    let ref: EntityRef | null = null;
    if ('url' in target) {
      url = target.url;
      label = name.trim() || (provOf(url)?.name ?? host(url));
    } else {
      ref = target.ref;
      label = name.trim() || (refInfo(db, ref)?.name ?? '');
    }
    const r: Resource = {
      id: uid('r'),
      kind: 'link',
      name: label,
      div: p.div,
      parent: null,
      url,
      body: '',
      purpose: '',
      project: p.id,
      meeting: null,
      owner: me.id,
      contributors: [],
      createdBy: me.id,
      createdAt: nowStamp(),
      pinned: false,
      revisions: 0,
      archived: false,
      reports: [],
      brief: false,
      ref,
      editedBy: null,
      editedAt: null,
    };
    db.resources.push(r);
    logChange(db, p.div, 'added link', refOf(r));
    ui.form = null;
    toast(tr('Link added'), ({ db: d }) => {
      d.resources = d.resources.filter((x) => x.id !== r.id);
    });
  });
}

export function setPurpose(id: string, purpose: string) {
  return act(({ db, toast }) => {
    const r = db.resources.find((x) => x.id === id);
    if (!r) return;
    r.purpose = purpose.trim();
    logChange(db, r.div, 'edited purpose of', refOf(r));
    toast(tr('Saved'));
  });
}

export function addContributor(id: string, who: PersonId) {
  return act(({ db, toast }) => {
    const r = db.resources.find((x) => x.id === id);
    if (!r || !who) return;
    r.contributors.push(who);
    notify(db, who, 'delegated', { type: 'resource', id: r.id });
    logChange(db, r.div, 'changed contributors of', refOf(r));
    toast(
      tr('{who} added. They were told.', { who: db.people.find((p) => p.id === who)?.first ?? '' }),
      ({ db: d }) => {
        const y = d.resources.find((x) => x.id === id);
        if (y) y.contributors = y.contributors.filter((x) => x !== who);
      },
    );
  });
}

export function removeContributor(id: string, who: PersonId) {
  return act(({ db, toast }) => {
    const r = db.resources.find((x) => x.id === id);
    if (!r) return;
    r.contributors = r.contributors.filter((x) => x !== who);
    logChange(db, r.div, 'changed contributors of', refOf(r));
    toast(tr('{who} removed', { who: db.people.find((p) => p.id === who)?.first ?? '' }), ({ db: d }) => {
      d.resources.find((x) => x.id === id)?.contributors.push(who);
    });
  });
}

export function archiveResource(id: string) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const r = db.resources.find((x) => x.id === id);
    ui.menu = null;
    if (!r || !me || !canEditRes(me, r)) return;
    r.archived = true;
    logChange(db, r.div, 'archived', refOf(r));
    if (ui.insp?.id === id) ui.insp = null;
    toast(tr('Archived. Linked tasks stay as they are.'), ({ db: d }) => {
      const y = d.resources.find((x) => x.id === id);
      if (y) y.archived = false;
    });
  });
}

export function moveResource(id: string, to: string | null) {
  return act(({ db, toast }) => {
    const me = getMe();
    const r = db.resources.find((x) => x.id === id);
    if (!r || !me || !canEditRes(me, r) || (r.parent ?? null) === to) return;
    for (let x = to ? resOf(db, to) : undefined; x; x = x.parent ? resOf(db, x.parent) : undefined)
      if (x.id === r.id) return;
    const prev = r.parent;
    r.parent = to;
    logChange(db, r.div, 'moved', refOf(r));
    toast(to ? tr('Moved to {f}', { f: resOf(db, to)?.name ?? '' }) : tr('Moved out of the folder'), ({ db: d }) => {
      const y = d.resources.find((x) => x.id === id);
      if (y) y.parent = prev;
    });
  });
}

/** Saves a note as a new revision; earlier text is kept. Resolves false when the save failed (the text stays in the editor). */
export function saveNote(id: string, body: string): Promise<boolean> {
  return act(({ db }) => {
    const me = getMe();
    const r = db.resources.find((x) => x.id === id);
    if (!r || !me) return;
    const prev = r.revisions;
    (r.history as { n: number; body: string; at: string }[] | undefined) ??= [];
    (r.history as { n: number; body: string; at: string }[]).push({
      n: r.revisions,
      body: r.body,
      at: r.editedAt ?? r.createdAt,
    });
    r.body = body;
    r.revisions++;
    r.editedAt = nowStamp();
    r.editedBy = me.id;
    if (r.meeting && !r.notified) {
      r.notified = true;
      const mt = db.meetings.find((m) => m.id === r.meeting);
      if (mt) for (const g of Object.keys(mt.responses)) notify(db, g, 'minutes', { type: 'meeting', id: mt.id });
    }
    logChange(
      db,
      r.div,
      'saved a revision of',
      refOf(r),
      tr('Revision {n}', { n: prev }),
      tr('Revision {n}', { n: r.revisions }),
    );
  });
}

/** resource_tasks: exactly one canonical record, linked by resource id; another person gets an offer (access_delegation). */
export function makeTaskFromResource(id: string, v: { title: string; who: PersonId; due: string | null }) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const r = db.resources.find((x) => x.id === id);
    if (!me || !r) return;
    if (v.who === me.id) {
      const t = addTaskDraft(db, v.title, { due: v.due, project: r.project, div: r.div, links: [r.id] });
      if (!t) return;
      const tid = t.id;
      ui.form = null;
      toast(tr('Task added to My Work'), ({ db: d }) => {
        d.tasks = d.tasks.filter((x: Task) => x.id !== tid);
      });
      return;
    }
    const oid = uid('o');
    db.offers.push({
      id: oid,
      from: me.id,
      to: v.who,
      title: v.title,
      result: '',
      due: v.due,
      project: r.project,
      resource: r.id,
      state: 'pending',
      note: '',
      task: null,
      at: nowStamp(),
      answeredAt: null,
    });
    notify(db, v.who, 'offer', { type: 'offer', id: oid });
    ui.form = null;
    toast(
      tr('Offered to {who}. Nothing is assigned until they accept.', {
        who: db.people.find((p) => p.id === v.who)?.first ?? '',
      }),
      ({ db: d }) => {
        d.offers = d.offers.filter((x) => x.id !== oid);
      },
    );
  });
}

export function reportLink(id: string, reason: string, note: string) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const r = db.resources.find((x) => x.id === id);
    if (!me || !r) return;
    const v = { id: uid('lr'), by: me.id, at: nowStamp(), reason, note: note.trim(), state: 'open' };
    r.reports.push(v);
    notify(db, r.owner, 'link-issue', { type: 'resource', id: r.id });
    ui.form = null;
    toast(
      tr('Reported. {who} was told.', { who: db.people.find((p) => p.id === r.owner)?.first ?? '' }),
      ({ db: d }) => {
        const y = d.resources.find((x) => x.id === id);
        if (y) y.reports = y.reports.filter((x) => (x as { id: string }).id !== v.id);
      },
    );
  });
}

export function markFixed(id: string, reportId: string) {
  return act(({ db, toast }) => {
    const r = db.resources.find((x) => x.id === id);
    const v = r?.reports.find((x) => (x as { id: string }).id === reportId) as
      { state: string; fixedAt?: string } | undefined;
    if (!v) return;
    v.state = 'fixed';
    v.fixedAt = nowStamp();
    toast(tr('Marked as fixed'));
  });
}

export interface LinkReport {
  id: string;
  by: PersonId;
  at: string;
  reason: string;
  note: string;
  state: string;
}

export const REPORT_REASONS: Record<string, string> = {
  notfound: 'Not found',
  denied: 'Access denied',
  expired: 'Link expired',
  wrong: 'Wrong file or page',
};

export const projBrief = (db: Workspace, p: Project) =>
  db.resources.find((r) => r.project === p.id && r.brief && !r.archived);
export const projLinks = (db: Workspace, p: Project) =>
  db.resources.filter((r) => r.project === p.id && r.kind === 'link' && !r.archived);
