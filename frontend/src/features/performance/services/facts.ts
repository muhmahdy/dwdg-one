/* Recorded facts per person and per division (analytics_team_performance, D30, D61). Only work recorded in dwdg'ONE counts;
   a delegated task or routine run counts as completed once it is signed off. Unknown is never zero, nothing is ranked or
   added into a score. From screens/perf.js. */
import { t } from '@/lib/i18n';
import { addDays, dShort, span2, today } from '@/lib/time';
import { isDone, isSummary, taskDiv, taskPeople } from '@/features/work/services/selectors';
import { ENDED } from '@/features/projects/services/project-rules';
import { msLate } from '@/features/projects/services/wbs';
import type { Submission } from '@/features/work/services/signoff';
import {
  asDef,
  attStatus,
  hrOf,
  regDate,
  type HrAssessment,
  type HrCycle,
  type HrRegister,
  type HrRosterEntry,
} from '@/features/hr/services/hr-data';
import type { Blocker, DateStr, Milestone, Offer, PersonId, Project, Task, Workspace } from '@/types/workspace';
import { activePeople } from './scope';

// ---------- periods: consecutive 14-day windows on the HR cycle anchor (proposed anchor Mon 7 Sep) ----------
export const ANCHOR: DateStr = '2026-09-07';

export interface Period {
  k: string;
  from: DateStr;
  to: DateStr;
  label: string;
}

export { span2 };

export function periods(): Period[] {
  const out: Period[] = [];
  for (let s = ANCHOR; s <= today(); s = addDays(s, 14)) out.push({ k: s, from: s, to: addDays(s, 13), label: '' });
  out.reverse();
  out.forEach((p, i) => {
    p.label = i === 0 ? t('This cycle, {d}', { d: span2(p.from, p.to) }) : span2(p.from, p.to);
  });
  out.push({ k: 'all', from: ANCHOR, to: today(), label: t('All cycles since {d}', { d: dShort(ANCHOR) }) });
  return out;
}
export const periodOf = (k: string | undefined): Period => {
  const all = periods();
  return (
    all.find((p) => p.k === k) ?? all.find((p) => p.k === 'all') ?? { k: 'all', from: ANCHOR, to: today(), label: '' }
  );
};
export const inPeriod = (P: Period, d: string | null | undefined) => !!d && d >= P.from && d <= P.to;

const day = (s: string | null | undefined) => (s ?? '').slice(0, 10);

// ---------- one person ----------
export interface RatedFacts {
  accepted: Task[];
  'r-excellent': Task[];
  'r-good': Task[];
  'r-needs-work': Task[];
  handedIn: Task[];
}

/** Handed-in work (D58): accepted hand-ins in the period by rating, and hand-ins waiting for the giver. */
export function ratedFacts(ts: Task[], P: Period): RatedFacts {
  const acc = ts.filter((x) => isDone(x) && !!x.rating && inPeriod(P, day(x.reviewedAt ?? x.doneAt)));
  return {
    accepted: acc,
    'r-excellent': acc.filter((x) => x.rating === 'excellent'),
    'r-good': acc.filter((x) => x.rating === 'good'),
    'r-needs-work': acc.filter((x) => x.rating === 'needs-work'),
    handedIn: ts.filter(
      (x) =>
        x.status === 'review' &&
        ((x.submissions as Submission[] | undefined) ?? []).some((s) => !s.withdrawn && !s.review),
    ),
  };
}

export interface TaskFacts extends RatedFacts {
  done: Task[];
  late: Task[];
  overdue: Task[];
  signoff: Task[];
  blockers: Blocker[];
  returned: Task[];
  offers: Offer[];
}

export function taskFacts(db: Workspace, pid: PersonId, P: Period): TaskFacts {
  const ts = db.tasks.filter((x) => !x.trashed && !isSummary(db, x) && taskPeople(x).includes(pid));
  const done = ts.filter((x) => isDone(x) && inPeriod(P, day(x.doneAt)));
  return {
    done,
    late: done.filter((x) => x.due && day(x.doneAt) >= x.due),
    overdue: ts.filter((x) => !isDone(x) && x.due && x.due < today()),
    signoff: ts.filter((x) => x.status === 'review'),
    blockers: db.blockers.filter((b) => b.state === 'open' && ts.some((x) => x.id === b.task && !isDone(x))),
    returned: ts.filter(
      (x) =>
        (x.reviewChoice === 'returned' && inPeriod(P, day(x.reviewedAt))) ||
        ((x.submissions as Submission[] | undefined) ?? []).some(
          (s) => !s.withdrawn && s.review?.result === 'returned' && inPeriod(P, s.review.at.slice(0, 10)),
        ),
    ),
    offers: db.offers.filter((o) => o.to === pid && o.state === 'accepted' && inPeriod(P, day(o.answeredAt))),
    ...ratedFacts(
      ts.filter((x) => x.owner === pid),
      P,
    ),
  };
}

export interface AttFacts {
  regs: { g: HrRegister; st: string; final: boolean }[];
  counts: Record<string, number>;
  finals: number;
  drafts: number;
}

/** Attendance: only registers that expect the person (guests and not-required people are not assessed). */
export function attFacts(db: Workspace, pid: PersonId, P: Period): AttFacts | null {
  const h = hrOf(db);
  if (!h) return null;
  const regs = h.registers
    .filter((g) => g.expected.includes(pid) && inPeriod(P, regDate(db, g)))
    .map((g) => ({ g, st: attStatus(g, pid), final: !!g.finalAt }))
    .sort((a, b) => regDate(db, b.g).localeCompare(regDate(db, a.g)));
  const counts: Record<string, number> = {};
  for (const x of regs) if (x.final) counts[x.st] = (counts[x.st] ?? 0) + 1;
  return { regs, counts, finals: regs.filter((x) => x.final).length, drafts: regs.filter((x) => !x.final).length };
}

export interface HrFact {
  k: string;
  cyc?: HrCycle;
  a?: HrAssessment;
  ro?: HrRosterEntry;
}

/** HR cycle: a window shows that cycle's state; All shows the latest finalized cycle. None finalized stays Unknown. */
export function hrFacts(db: Workspace, pid: PersonId, P: Pick<Period, 'k' | 'from'>): HrFact {
  const h = hrOf(db);
  if (!h) return { k: 'unknown' };
  const cyc =
    P.k === 'all'
      ? h.cycles
          .filter((c) => ['final', 'closed'].includes(c.state) && c.roster.some((r) => r.p === pid))
          .sort((a, b) => b.end.localeCompare(a.end))[0]
      : h.cycles.find((c) => c.start === P.from);
  if (!cyc) return { k: 'unknown' };
  const ro = cyc.roster.find((r) => r.p === pid);
  if (!ro) return { k: 'unknown', cyc };
  if (ro.exempt) return { k: 'exempt', cyc, ro };
  const a = h.assessments.find((x) => x.cycle === cyc.id && x.person === pid);
  let k = a ? a.state : 'none';
  if (k === 'none' && cyc.state === 'closed') k = 'incomplete';
  return { k, cyc, ...(a ? { a } : {}), ro };
}

export const hrChipDef = (f: HrFact) => asDef(f.k);

export interface RingValue {
  n: number;
  of: number;
}
export interface RingFacts {
  tf: TaskFacts;
  af: AttFacts | null;
  del: RingValue | null;
  att: RingValue | null;
  hand: RingValue | null;
}

/** Three separate recorded ratios, never added or averaged: delivered on time, meetings attended, hand-ins accepted. */
export function ringFacts(db: Workspace, pid: PersonId, P: Period): RingFacts {
  const tf = taskFacts(db, pid, P);
  const af = attFacts(db, pid, P);
  const done = tf.done.length;
  const late = tf.done.filter((x) => x.due && day(x.doneAt) > x.due).length;
  const acc = tf.accepted.length;
  const ret = tf.returned.length;
  return {
    tf,
    af,
    del: done ? { n: done - late, of: done } : null,
    att: af?.finals ? { n: (af.counts.present ?? 0) + (af.counts.late ?? 0), of: af.finals } : null,
    hand: acc + ret ? { n: acc, of: acc + ret } : null,
  };
}

// ---------- one division ----------
export interface DivFacts {
  ppl: PersonId[];
  cyc: HrCycle | null;
  hrC: Record<string, number>;
  regs: HrRegister[] | null;
  att: Record<string, number>;
  done: Task[];
  late: Task[];
  overdue: Task[];
  blockers: Blocker[];
  projects: Project[];
  msLate: Milestone[];
}

export function divFacts(db: Workspace, d: string, P: Period): DivFacts {
  const ppl = activePeople(db)
    .filter((p) => p.div === d)
    .map((p) => p.id);
  const h = hrOf(db);
  const ts = db.tasks.filter((x) => !x.trashed && !isSummary(db, x) && taskDiv(db, x) === d);
  const hrC: Record<string, number> = {};
  let cyc: HrCycle | null = null;
  if (h) {
    cyc =
      h.cycles
        .filter((c) => ['final', 'closed'].includes(c.state) && (c.units as string[]).includes(d))
        .sort((a, b) => b.end.localeCompare(a.end))[0] ?? null;
    if (cyc) {
      const c = cyc;
      for (const id of ppl) {
        const f = hrFacts(db, id, { k: c.start, from: c.start });
        if (f.cyc) hrC[f.k] = (hrC[f.k] ?? 0) + 1;
      }
    }
  }
  const regs = h ? h.registers.filter((g) => g.unit === d && g.finalAt && inPeriod(P, regDate(db, g))) : null;
  const att: Record<string, number> = {};
  if (regs)
    for (const g of regs)
      for (const pid of g.expected) {
        const s = attStatus(g, pid);
        att[s] = (att[s] ?? 0) + 1;
      }
  const projs = db.projects.filter((p) => p.div === d && p.stage === 'active');
  const done = ts.filter((x) => isDone(x) && inPeriod(P, day(x.doneAt)));
  return {
    ppl,
    cyc,
    hrC,
    regs,
    att,
    done,
    late: done.filter((x) => x.due && day(x.doneAt) >= x.due),
    overdue: ts.filter((x) => !isDone(x) && x.due && x.due < today()),
    blockers: db.blockers.filter((b) => b.state === 'open' && ts.some((x) => x.id === b.task)),
    projects: projs,
    msLate: db.milestones.filter((x) => projs.some((p) => p.id === x.project) && msLate(x)),
  };
}

/** Division rings: on time and meetings attended only (hand-in ratings stay with the people involved). */
export function divRing(f: DivFacts): { del: RingValue | null; att: RingValue | null } {
  const seen = Object.values(f.att).reduce((s, n) => s + n, 0) - (f.att.unknown ?? 0);
  return {
    del: f.done.length ? { n: f.done.filter((x) => !x.due || day(x.doneAt) <= x.due).length, of: f.done.length } : null,
    att: seen ? { n: (f.att.present ?? 0) + (f.att.late ?? 0), of: seen } : null,
  };
}

export const METRIC: Record<string, string> = {
  accepted: 'Accepted hand-ins',
  'r-excellent': 'Rated Excellent',
  'r-good': 'Rated Good',
  'r-needs-work': 'Rated Needs work',
  handedIn: 'Handed in, waiting for assessment',
  done: 'Completed',
  late: 'Completed on or after the due date',
  overdue: 'Overdue now',
  signoff: 'Waiting for sign-off',
  blockers: 'Open blockers',
  returned: 'Sent back after review',
  offers: 'Offers accepted',
  att: 'Weekly meeting attendance',
  hr: '14-day HR cycles',
  projects: 'Active projects',
  msLate: 'Overdue milestones',
};

export const liveProject = (p: Project | undefined): p is Project => !!p && !ENDED.includes(p.stage);
