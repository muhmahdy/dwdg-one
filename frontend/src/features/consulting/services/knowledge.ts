/* Knowledge actions (consulting_knowledge, W064, S058, S059): a contribution, a curator's review of one exact version, the
   audience and next review at publication, reports of a problem, and withdrawal. Restricted articles never leak, title included. */
import { go } from '@/app/router/navigation';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { addDays, nowStamp, today } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { registerUpdateText } from '@/features/updates/services/update-text';
import { CONS, activeIds, branchOf, rk } from '@/features/external/services/ee-data';
import type { EntityRef, PersonId, Workspace } from '@/types/workspace';
import type { Draft } from 'immer';
import { consDraft, type Article, type KnVersion } from './cons-data';
import { artOf, isCurator, pubV } from './cons-rules';

registerUpdateText({
  'kn-review': '{who} sent an article for review',
  'kn-published': '{who} published your article',
  'kn-changes': '{who} asked for changes to your article',
  'kn-report': '{who} reported a problem with your article',
  'kn-report-done': '{who} resolved your report',
});

const artLink = (a: { id: string; title: string }): EntityRef => ({
  type: 'cons',
  id: a.id,
  name: a.title,
  h: `knowledge/${a.id}`,
});
const upd = (db: Draft<Workspace>, to: PersonId | null | undefined, type: string, title: string, id: string) => {
  notify(db, to, type, { type: 'link', id: `knowledge/${id}`, h: `knowledge/${id}`, name: title });
};
const find = (db: Draft<Workspace>, id: string) => consDraft(db).kn.find((a) => a.id === id);

export interface Contribution {
  title: string;
  kind: Article['kind'];
  audience: Article['audience'];
  topics: string[];
  source: string;
  perm: string;
  url: string;
  note: string;
}

export async function contribute(f: Contribution) {
  const m = getMe();
  const db0 = getDb();
  if (!m) return;
  const cur =
    activeIds(db0, (z) => branchOf(z) === 'kn')[0] ?? activeIds(db0, (z) => z.div === CONS && rk(z) >= 3)[0] ?? m.id;
  const a: Article = {
    id: uid('kn-'),
    title: f.title,
    kind: f.kind,
    topics: f.topics,
    audience: f.audience,
    named: [],
    author: m.id,
    owner: cur,
    source: f.source,
    perm: f.perm,
    nextReview: null,
    at: nowStamp(),
    versions: [
      {
        v: 1,
        by: m.id,
        at: nowStamp(),
        note: f.note || t('First version'),
        url: f.url,
        state: 'review',
        reviewer: null,
        reviewedAt: null,
        reviewNote: '',
      },
    ],
    uses: [],
    reports: [],
  };
  const ok = await act(({ db, ui, toast }) => {
    consDraft(db).kn.push(a);
    logChange(db, CONS, 'contributed', artLink(a));
    upd(db, cur, 'kn-review', a.title, a.id);
    ui.insp = null;
    toast(t('Sent to {who} for review', { who: db.people.find((p) => p.id === cur)?.first ?? '' }), ({ db: u }) => {
      const s = consDraft(u);
      s.kn = s.kn.filter((z) => z.id !== a.id);
      go('knowledge');
    });
  });
  if (ok) go(`knowledge/${a.id}`);
}

const inReview = (a: Article) => a.versions.find((z) => z.state === 'review');

export function publish(id: string, f: { audience: Article['audience']; nextReview: string; note: string }) {
  const m = getMe();
  const a0 = artOf(getDb(), id);
  const v0 = a0 && inReview(a0);
  if (!m || !a0 || !v0 || !isCurator(m) || v0.by === m.id) return Promise.resolve(false);
  const prev = { versions: structuredClone(a0.versions), audience: a0.audience, nextReview: a0.nextReview };
  return act(({ db, ui, toast }) => {
    const a = find(db, id);
    const v = a && inReview(a);
    if (!a || !v) return;
    a.versions.forEach((z) => {
      if (z.state === 'published') z.state = 'superseded';
    });
    Object.assign(v, { state: 'published', reviewer: m.id, reviewedAt: nowStamp(), reviewNote: f.note });
    a.audience = f.audience;
    a.nextReview = f.nextReview;
    logChange(db, CONS, 'published', artLink(a), null, t('Version {v}', { v: v.v }));
    upd(db, v.by, 'kn-published', a.title, a.id);
    ui.form = null;
    toast(t('Version {v} published', { v: v.v }), ({ db: u }) => {
      const x = find(u, id);
      if (!x) return;
      Object.assign(x, prev);
      logChange(u, CONS, 'unpublished', artLink(x));
    });
  });
}

export function requestChanges(id: string, note: string) {
  const m = getMe();
  const a0 = artOf(getDb(), id);
  const v0 = a0 && inReview(a0);
  if (!m || !a0 || !v0 || !isCurator(m) || v0.by === m.id) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const a = find(db, id);
    const v = a && inReview(a);
    if (!a || !v) return;
    Object.assign(v, { state: 'changes', reviewer: m.id, reviewedAt: nowStamp(), reviewNote: note });
    logChange(db, CONS, 'requested changes on', artLink(a));
    upd(db, v.by, 'kn-changes', a.title, a.id);
    ui.form = null;
    toast(t('Changes requested'), ({ db: u }) => {
      const x = find(u, id);
      const vx = x?.versions.find((z) => z.v === v.v);
      if (vx) Object.assign(vx, { state: 'review', reviewer: null, reviewedAt: null, reviewNote: '' });
    });
  });
}

export function submitNewVersion(id: string, f: { note: string; url: string }) {
  const m = getMe();
  const a0 = artOf(getDb(), id);
  if (!m || !a0) return Promise.resolve(false);
  const v: KnVersion = {
    v: a0.versions.length + 1,
    by: m.id,
    at: nowStamp(),
    note: f.note,
    url: f.url,
    state: 'review',
    reviewer: null,
    reviewedAt: null,
    reviewNote: '',
  };
  return act(({ db, ui, toast }) => {
    const a = find(db, id);
    if (!a) return;
    a.versions.forEach((z) => {
      if (z.state === 'changes') z.state = 'superseded';
    });
    a.versions.push(v);
    logChange(db, CONS, 'submitted a version of', artLink(a), null, t('Version {v}', { v: v.v }));
    upd(db, a.owner, 'kn-review', a.title, a.id);
    ui.form = null;
    toast(t('Version {v} sent for review', { v: v.v }), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.versions = x.versions.filter((z) => z.v !== v.v);
    });
  });
}

export function reportProblem(id: string, reason: string) {
  const m = getMe();
  const a0 = artOf(getDb(), id);
  if (!m || !a0) return Promise.resolve(false);
  const r = { id: uid('rp-'), by: m.id, at: nowStamp(), reason, state: 'open' };
  return act(({ db, ui, toast }) => {
    const a = find(db, id);
    if (!a) return;
    a.reports.push(r);
    logChange(db, CONS, 'reported a problem with', artLink(a));
    upd(db, a.owner, 'kn-report', a.title, a.id);
    ui.form = null;
    toast(t('Report sent to {who}', { who: db.people.find((p) => p.id === a.owner)?.first ?? '' }), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.reports = x.reports.filter((z) => z.id !== r.id);
    });
  });
}

export function resolveReport(id: string, rid: string) {
  const m = getMe();
  const a0 = artOf(getDb(), id);
  const r0 = a0?.reports.find((z) => z.id === rid);
  if (!m || !a0 || !r0) return Promise.resolve(false);
  return act(({ db, toast }) => {
    const a = find(db, id);
    const r = a?.reports.find((z) => z.id === rid);
    if (!a || !r) return;
    r.state = 'resolved';
    r.note = t('Resolved by {who}', { who: m.first });
    logChange(db, CONS, 'resolved a report on', artLink(a));
    upd(db, r.by, 'kn-report-done', a.title, a.id);
    toast(t('Report resolved'), ({ db: u }) => {
      const x = find(u, id)?.reports.find((z) => z.id === rid);
      if (x) {
        x.state = 'open';
        x.note = '';
      }
    });
  });
}

export function withdrawArticle(id: string, reason: string) {
  const m = getMe();
  const a0 = artOf(getDb(), id);
  const p0 = a0 && pubV(a0);
  if (!m || !a0 || !p0 || !isCurator(m)) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const a = find(db, id);
    const p = a && pubV(a);
    if (!a || !p) return;
    p.state = 'withdrawn';
    p.reviewNote = reason;
    logChange(db, CONS, 'withdrew', artLink(a));
    ui.form = null;
    toast(t('Article withdrawn. Its history stays.'), ({ db: u }) => {
      const x = find(u, id)?.versions.find((z) => z.v === p.v);
      if (x) x.state = 'published';
    });
  });
}

export const defaultNextReview = () => addDays(today(), 180);
