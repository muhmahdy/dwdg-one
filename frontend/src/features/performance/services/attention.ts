/* Attention (blueprint §4, D62): one card per division, each listing only the items that need someone to act. Escalations,
   decisions waiting, blockers, overdue milestones, handoffs between divisions not yet answered, and what is due this week.
   Every count is read from records each division keeps; there is no health score. From screens/perf.js PAGES.attention. */
import { go } from '@/app/router/navigation';
import { divisionOf } from '@/app/config/org';
import { t, plural } from '@/lib/i18n';
import { openDecision, openMilestone, openOffer, openTask } from '@/lib/open';
import { isBoard, isPres, isVP } from '@/lib/roles';
import { addDays, daysBetween, dShort, today } from '@/lib/time';
import { setUi } from '@/lib/workspace/transaction';
import { hrOf } from '@/features/hr/services/hr-data';
import { msLate } from '@/features/projects/services/wbs';
import { projOf, taskDiv, taskOf, unitLeads } from '@/features/work/services/selectors';
import type { DivisionId, Person, PersonId, TeamMember, Workspace } from '@/types/workspace';
import { escalationsOf, type Escalation } from './escalations';
import { liveProject } from './facts';

export type AttnKind = 0 | 1 | 2 | 3 | 4 | 5;
export type AttnTone = 'warn' | 'danger' | 'ink2' | 'mute';
export type EscForm = 'esc-ack' | 'esc-res' | 'esc-again';

export interface AttnItem {
  key: string;
  k: AttnKind;
  icon: string;
  tone: AttnTone;
  text: string;
  sub: string;
  severity?: 'low' | 'medium' | 'high';
  open: () => void;
  button?: { label: string; primary?: boolean; run: () => void };
}

export interface Handoff {
  kind: string;
  title: string;
  from: PersonId;
  to: PersonId;
  at: string;
  need: string | null;
  open: () => void;
}

export const ageDays = (at: string) => Math.max(0, daysBetween(at.slice(0, 10), today()));
export const ageText = (at: string) => {
  const n = ageDays(at);
  return n ? plural(n, '{n} day ago', '{n} days ago') : t('today');
};

/** Opens an escalation in the side panel, optionally already at the form the row offers. */
export const openEscalation = (id: string, form?: EscForm) => {
  setUi((u) => {
    u.palette = false;
    u.menu = null;
    u.form = null;
    u.insp = { type: 'perf-esc', id, ...(form ? { form } : {}) };
  });
};

export const openEscalateBlocker = (id: string) => {
  setUi((u) => {
    u.menu = null;
    u.form = null;
    u.insp = { type: 'perf-esc-new', id };
  });
};

const divOfP = (db: Workspace, id: PersonId | undefined) => db.people.find((p) => p.id === id)?.div ?? '';
const personFirst = (db: Workspace, id: PersonId | null | undefined) =>
  db.people.find((p) => p.id === id)?.first ?? t('Someone');

/** Cross-division offers waiting for an answer. */
export const crossOffers = (db: Workspace, ds: DivisionId[]) =>
  db.offers.filter((o) => {
    const a = db.people.find((p) => p.id === o.from);
    const b = db.people.find((p) => p.id === o.to);
    return (
      o.state === 'pending' &&
      !!a &&
      !!b &&
      a.div !== b.div &&
      ((a.div != null && ds.includes(a.div)) || (b.div != null && ds.includes(b.div)))
    );
  });

/** Cross-division handoffs, read from each module's own records when they exist (blueprint §12). Unknown shapes are skipped. */
export function handoffs(db: Workspace, ds: DivisionId[]): Handoff[] {
  const out: Handoff[] = [];
  const inDs = (d: string | null | undefined) => !!d && (ds as string[]).includes(d);
  const person = (id: PersonId) => db.people.find((p) => p.id === id);
  for (const o of crossOffers(db, ds))
    out.push({
      kind: t('Task offer'),
      title: o.title,
      from: o.from,
      to: o.to,
      at: o.at,
      need: o.due,
      open: () => {
        openOffer(o.id);
      },
    });
  for (const p of db.projects)
    for (const x of p.team.filter(
      (m) =>
        m.state === 'invited' &&
        person(m.id) &&
        person(m.id)?.div !== p.div &&
        (inDs(p.div) || inDs(person(m.id)?.div)),
    ))
      out.push({
        kind: t('Project invitation'),
        title: p.name,
        from: x.by,
        to: x.id,
        at: x.at,
        need: null,
        open: () => {
          go(`projects/${p.id}`);
        },
      });
  for (const r of db.routines ?? [])
    for (const x of ((r.invites as TeamMember[] | undefined) ?? []).filter(
      (m) =>
        m.state === 'invited' &&
        person(m.id) &&
        person(m.id)?.div !== r.unit &&
        (inDs(r.unit) || inDs(person(m.id)?.div)),
    ))
      out.push({
        kind: t('Rotation invitation'),
        title: r.name,
        from: x.by,
        to: x.id,
        at: x.at,
        need: null,
        open: () => {
          go(`operations/${r.id}`);
        },
      });
  for (const g of db.programs ?? [])
    for (const x of (g.partners ?? []).filter((m) => m.state === 'invited' && (inDs(g.div) || inDs(m.div)))) {
      const to = unitLeads(db, x.div)[0];
      if (to && x.by && x.at) {
        const by = x.by;
        const at = x.at;
        out.push({
          kind: t('Program partnership'),
          title: g.name,
          from: by,
          to,
          at,
          need: null,
          open: () => {
            go(`programs/${g.id}`);
          },
        });
      }
    }
  for (const k of hrOf(db)?.packets.filter((x) => x.state === 'requested') ?? [])
    out.push({
      kind: t('Publication request'),
      title: k.title,
      from: k.createdBy,
      to: k.receiver,
      at: k.requestedAt ?? k.createdAt,
      need: k.neededBy,
      open: () => {
        go('recognition');
      },
    });
  const ee = db.ee as { handoffs?: Record<string, string>[] } | undefined;
  if (Array.isArray(ee?.handoffs))
    for (const k of ee.handoffs.filter((x) => x.state === 'requested'))
      out.push({
        kind: t('Client handoff'),
        title: k.title ?? k.name ?? k.id ?? '',
        from: k.from ?? k.sender ?? k.createdBy ?? '',
        to: k.to ?? k.receiver ?? '',
        at: k.requestedAt ?? k.createdAt ?? '',
        need: k.neededBy ?? null,
        open: () => {
          go('engagements');
        },
      });
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

const sevN = { high: 0, medium: 1, low: 2 };

function escalationItem(db: Workspace, m: Person, e: Escalation): { item: AttnItem; mine: boolean } {
  const toMe = e.to === m.id && !isBoard(m);
  const fromMe = e.from === m.id;
  const f: EscForm | '' =
    toMe && e.state === 'requested'
      ? 'esc-ack'
      : toMe && e.state === 'acknowledged'
        ? 'esc-res'
        : fromMe && e.state === 'returned'
          ? 'esc-again'
          : '';
  const text =
    e.state === 'returned'
      ? t('{who} asked for more information: {t}', { who: personFirst(db, e.to), t: e.title })
      : e.state === 'acknowledged'
        ? t('{who} is working on it: {t}', { who: personFirst(db, e.nextOwner ?? e.to), t: e.title })
        : e.to === m.id
          ? t('Escalated to you: {t}', { t: e.title })
          : t('Escalated to {who}: {t}', { who: personFirst(db, e.to), t: e.title });
  const tail =
    e.neededBy && e.state !== 'acknowledged'
      ? `, ${t('needed by {d}', { d: dShort(e.neededBy) })}`
      : e.nextDate
        ? `, ${t('next step by {d}', { d: dShort(e.nextDate) })}`
        : '';
  const sub = `${t('From {who}', { who: personFirst(db, e.from) })}, ${ageText(e.createdAt)}${tail}`;
  const button: AttnItem['button'] = f
    ? {
        label: f === 'esc-ack' ? t('Acknowledge') : f === 'esc-res' ? t('Record resolution') : t('Add information'),
        primary: true,
        run: () => {
          openEscalation(e.id, f);
        },
      }
    : {
        label: t('Open'),
        run: () => {
          openEscalation(e.id);
        },
      };
  return {
    mine: !!f,
    item: {
      key: e.id,
      k: 0,
      icon: 'escalate',
      tone: 'warn',
      text,
      sub,
      open: () => {
        openEscalation(e.id);
      },
      button,
    },
  };
}

export interface AttnCard {
  d: DivisionId;
  list: AttnItem[];
}

export interface Attention {
  ds: DivisionId[];
  mine: AttnItem[];
  open: AttnCard[];
  clear: AttnCard[];
}

export function buildAttention(db: Workspace, m: Person, ds: DivisionId[]): Attention {
  const week = addDays(today(), 7);
  const escs = escalationsOf(db).filter(
    (e) =>
      (e.to === m.id || e.from === m.id || isPres(m) || m.admin) &&
      ['requested', 'returned', 'acknowledged'].includes(e.state),
  );
  const hos = handoffs(db, ds);
  const mine: AttnItem[] = [];
  const pDiv = (id: string) => projOf(db, id)?.div;

  const items = (d: DivisionId): AttnItem[] => {
    const out: AttnItem[] = [];
    for (const e of escs.filter((x) => x.div === d)) {
      const r = escalationItem(db, m, e);
      (r.mine ? mine : out).push(r.item);
    }
    for (const x of db.decisions.filter((v) => v.state === 'awaiting' && pDiv(v.project) === d)) {
      const p = projOf(db, x.project);
      const mineD = x.approver === m.id;
      const item: AttnItem = {
        key: x.id,
        k: 1,
        icon: 'clock',
        tone: 'warn',
        text: mineD
          ? t('Your decision: {q}', { q: x.question })
          : t('Waiting for {who} to decide: {q}', { who: personFirst(db, x.approver), q: x.question }),
        sub: `${p ? `${p.name}, ` : ''}${t('asked by {who}', { who: personFirst(db, x.createdBy) })} ${ageText(x.createdAt)}`,
        open: () => {
          openDecision(x.id);
        },
        button: {
          label: mineD ? t('Decide') : t('Open'),
          primary: mineD,
          run: () => {
            openDecision(x.id);
          },
        },
      };
      (mineD ? mine : out).push(item);
    }
    const blockers = db.blockers
      .filter((b) => {
        const tk = taskOf(db, b.task);
        return b.state === 'open' && !!tk && taskDiv(db, tk) === d;
      })
      .sort((a, b) => sevN[a.severity] - sevN[b.severity] || a.openedAt.localeCompare(b.openedAt));
    for (const b of blockers) {
      const tk = taskOf(db, b.task);
      const n = ageDays(b.openedAt);
      const escd = escalationsOf(db).some((e) => e.blocker === b.id && !['withdrawn', 'resolved'].includes(e.state));
      const canEscalate = isVP(m) && !escd;
      out.push({
        key: b.id,
        k: 2,
        icon: 'warning',
        tone: b.severity === 'high' ? 'danger' : 'warn',
        text: `${n ? t('Stuck for {n}:', { n: plural(n, '{n} day', '{n} days') }) : t('Stuck since today:')} ${b.text}`,
        sub: `${tk?.title ?? ''}. ${t('{who} can unblock it', { who: personFirst(db, b.owner) })}${escd ? `. ${t('Already escalated')}` : ''}`,
        severity: b.severity,
        open: () => {
          openTask(b.task);
        },
        button: canEscalate
          ? {
              label: t('Escalate'),
              run: () => {
                openEscalateBlocker(b.id);
              },
            }
          : {
              label: t('Open'),
              run: () => {
                openTask(b.task);
              },
            },
      });
    }
    const msOf = (x: { project: string }) => {
      const p = projOf(db, x.project);
      return liveProject(p) && p.div === d ? p : null;
    };
    for (const x of db.milestones
      .filter((v) => msOf(v) && msLate(v))
      .sort((a, b) => a.target.localeCompare(b.target))) {
      const p = msOf(x);
      out.push({
        key: x.id,
        k: 3,
        icon: 'flag',
        tone: 'danger',
        text: t('Overdue since {d}: {t}', { d: dShort(x.target), t: x.title }),
        sub: `${p?.name ?? ''}, ${t('owner {who}', { who: personFirst(db, x.owner) })}`,
        open: () => {
          openMilestone(x.id);
        },
        button: {
          label: t('Open'),
          run: () => {
            openMilestone(x.id);
          },
        },
      });
    }
    // handoffs live with the division that has to answer; one that leaves this view's divisions also shows on the sender's card
    hos.forEach((x, i) => {
      const toDiv = divOfP(db, x.to);
      const fromDiv = divOfP(db, x.from);
      if (!(toDiv === d || (fromDiv === d && !(ds as string[]).includes(toDiv)))) return;
      const inbound = toDiv === d;
      const short = (id: string) => divisionOf(id)?.short ?? t('Presidency');
      out.push({
        key: `h${i}`,
        k: 4,
        icon: 'clock',
        tone: 'ink2',
        text: inbound
          ? t('{who} has not answered {d} yet: {t}', { who: personFirst(db, x.to), d: short(fromDiv), t: x.title })
          : t('Waiting for {d} to answer: {t}', { d: short(toDiv), t: x.title }),
        sub: `${x.kind} ${t('from {a} to {b}', { a: personFirst(db, x.from), b: personFirst(db, x.to) })}, ${x.at ? ageText(x.at) : ''}`,
        open: x.open,
        button: { label: t('Open'), run: x.open },
      });
    });
    for (const x of db.milestones
      .filter(
        (v) => msOf(v) && !msLate(v) && !['achieved', 'cancelled'].includes(v.state) && v.target && v.target <= week,
      )
      .sort((a, b) => a.target.localeCompare(b.target))) {
      const p = msOf(x);
      out.push({
        key: `w${x.id}`,
        k: 5,
        icon: 'calendar',
        tone: 'mute',
        text:
          x.target === today()
            ? t('Due today: {t}', { t: x.title })
            : t('Due {d}: {t}', { d: dShort(x.target), t: x.title }),
        sub: `${p?.name ?? ''}, ${t('owner {who}', { who: personFirst(db, x.owner) })}`,
        open: () => {
          openMilestone(x.id);
        },
      });
    }
    return out;
  };

  const cards = ds.map((d) => ({ d, list: items(d) }));
  const urgent = (l: AttnItem[]) => l.some((x) => x.k <= 3);
  const open = cards
    .filter((c) => c.list.length)
    .sort(
      (a, b) =>
        Number(urgent(b.list)) - Number(urgent(a.list)) ||
        b.list.filter((x) => x.k <= 3).length - a.list.filter((x) => x.k <= 3).length,
    );
  return { ds, mine, open, clear: cards.filter((c) => !c.list.length) };
}

/** The plain status line under each division name. */
export function statusParts(list: AttnItem[]): { text: string; red: boolean }[] {
  const c = (k: AttnKind) => list.filter((x) => x.k === k).length;
  const parts: { text: string; red: boolean }[] = [];
  if (c(0)) parts.push({ text: plural(c(0), '{n} escalation', '{n} escalations'), red: false });
  if (c(1)) parts.push({ text: plural(c(1), '{n} decision waiting', '{n} decisions waiting'), red: false });
  if (c(2)) parts.push({ text: plural(c(2), '{n} blocker', '{n} blockers'), red: true });
  if (c(3)) parts.push({ text: plural(c(3), '{n} overdue milestone', '{n} overdue milestones'), red: true });
  if (c(4)) parts.push({ text: plural(c(4), '{n} handoff not answered', '{n} handoffs not answered'), red: false });
  if (c(5)) parts.push({ text: plural(c(5), '{n} due this week', '{n} due this week'), red: false });
  return parts;
}
