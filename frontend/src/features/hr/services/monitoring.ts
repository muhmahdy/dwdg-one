/* Monitoring and grading every 14 days (hr_fortnightly_cycle, hr_scoring_policy, hr_monitoring_member_flow, hr_development,
   W045–W047, S032–S036): a cycle is planned, opened, reviewed, released and closed by HR; each member sends a report, a
   reviewer scores it against the proposed rubric, HR checks it for completeness, and the member may acknowledge or ask for
   a correction. A missing report or score is Incomplete, never zero. From divisions/div-hr-sng.js. */
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { addDays, nowStamp, span2, today } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import { go } from '@/app/router/navigation';
import { hrLead, isBoard, isTop } from '@/lib/roles';
import { addTaskDraft } from '@/features/work/services/task-actions';
import type { Draft } from 'immer';
import type { DateStr, EntityRef, Person, PersonId, Workspace } from '@/types/workspace';
import {
  RUBRIC,
  hrDraft,
  hrOf,
  type HrAssessment,
  type HrCycle,
  type HrReport,
  type HrRosterEntry,
  type HrScores,
} from './hr-data';

type Def = [label: string, icon: string, tone: 'ink2' | 'warn' | 'green' | 'mute' | 'danger'];

export const AS: Record<string, Def> = {
  none: ['Not submitted', 'circle', 'mute'],
  submitted: ['Submitted', 'upload', 'ink2'],
  clarify: ['Clarification asked', 'info', 'warn'],
  draft: ['Scoring in progress', 'edit', 'ink2'],
  reviewed: ['Waiting for HR check', 'search', 'warn'],
  final: ['Finalized', 'check', 'green'],
  incomplete: ['Incomplete', 'warning', 'warn'],
  exempt: ['Exempt', 'minus', 'mute'],
};
export const asDef = (s: string): Def => AS[s] ?? ['Not submitted', 'circle', 'mute'];
export const CYS: Record<string, Def> = {
  planned: ['Setting up', 'settings', 'ink2'],
  open: ['Reporting open', 'edit', 'ink2'],
  review: ['In review', 'search', 'warn'],
  final: ['Corrections open', 'check', 'green'],
  closed: ['Closed', 'archive', 'mute'],
};
export const cysDef = (s: string): Def => CYS[s] ?? ['Setting up', 'settings', 'ink2'];
export const EXEMPT: Record<string, string> = {
  leave: 'Leave',
  joiner: 'Joined after the cycle started',
  transfer: 'Transferred during the cycle',
};

export const cyOf = (db: Workspace, id: string) => hrOf(db)?.cycles.find((c) => c.id === id);
export const cyLabel = (c: HrCycle) => span2(c.start, c.end);
export const cyName = (c: HrCycle) => t('Cycle {d}', { d: cyLabel(c) });
export const rosterOf = (c: HrCycle, p: PersonId): HrRosterEntry | undefined => c.roster.find((x) => x.p === p);
export const asOf = (db: Workspace, c: HrCycle, p: PersonId): HrAssessment | undefined =>
  hrOf(db)?.assessments.find((a) => a.cycle === c.id && a.person === p);
/** The assessment state of a member in a cycle (Exempt, Incomplete once closed, or Not submitted). */
export function asState(db: Workspace, c: HrCycle, p: PersonId): string | null {
  const r = rosterOf(c, p);
  if (!r) return null;
  if (r.exempt) return 'exempt';
  const a = asOf(db, c, p);
  return a ? a.state : c.state === 'closed' ? 'incomplete' : 'none';
}
/** The route of one assessment. */
export const asRoute = (c: HrCycle, p: PersonId) => `monitoring/${c.id}/${p}`;

/** The weighted result, null when any criterion has no score (S034). */
export const totalOf = (sc: HrScores | null | undefined) => {
  if (!sc) return null;
  let sum = 0;
  for (const k of RUBRIC.criteria) {
    const x = sc[k.k];
    if (x?.v == null) return null;
    sum += (x.v / RUBRIC.max) * k.w;
  }
  return Math.round(sum * 10) / 10;
};
export const missingOf = (sc: HrScores | null | undefined) => RUBRIC.criteria.filter((k) => sc?.[k.k]?.v == null);

export const canSubmit = (c: HrCycle) => ['open', 'review'].includes(c.state) && today() <= c.reportDue;

/** HR completeness check: an HR lead who is neither the member nor the reviewer; when none is free, the VP (proposed). */
export function canHrCheck(db: Workspace, m: Person | undefined, c: HrCycle, p: PersonId) {
  const r = rosterOf(c, p);
  if (!m || !r) return false;
  if (hrLead(m) && m.id !== p && m.id !== r.reviewer) return true;
  return (
    m.role === 'vp' && !db.people.some((x) => hrLead(x) && x.status === 'active' && x.id !== p && x.id !== r.reviewer)
  );
}

export const unitLead = (p: Person | undefined, unit: string) =>
  !!p && p.div === unit && ['director', 'codirector', 'vp', 'president'].includes(p.role);

/** What a viewer may open: full (member, reviewer, HR check) or result (President, VP, the member's Director or Co-Director). */
export function asLevel(db: Workspace, m: Person | undefined, c: HrCycle, p: PersonId): 'full' | 'result' | null {
  const r = rosterOf(c, p);
  if (!m || !r || isBoard(m)) return null;
  if (m.id === p || m.id === r.reviewer || hrLead(m) || canHrCheck(db, m, c, p)) return 'full';
  if (isTop(m) || unitLead(m, r.unit)) return 'result';
  return null;
}

export interface CycleCounts {
  eligible: number;
  exempt: number;
  none: number;
  submitted: number;
  reviewing: number;
  final: number;
  incomplete: number;
  corr: number;
  ack: number;
}
export function cycleCounts(db: Workspace, c: HrCycle): CycleCounts {
  const k: CycleCounts = {
    eligible: c.roster.length,
    exempt: 0,
    none: 0,
    submitted: 0,
    reviewing: 0,
    final: 0,
    incomplete: 0,
    corr: 0,
    ack: 0,
  };
  for (const x of c.roster) {
    const st = asState(db, c, x.p);
    const a = asOf(db, c, x.p);
    if (st === 'exempt') k.exempt++;
    else if (st === 'none') k.none++;
    else if (st === 'final') k.final++;
    else if (st === 'incomplete') k.incomplete++;
    else if (st === 'reviewed' || st === 'draft' || st === 'clarify') k.reviewing++;
    else k.submitted++;
    if (a?.corr?.state === 'open') k.corr++;
    if (a?.ack) k.ack++;
  }
  return k;
}

const first = (db: Workspace, id: PersonId | null | undefined) => db.people.find((p) => p.id === id)?.first ?? '';

const asLink = (db: Workspace, a: HrAssessment): EntityRef => {
  const c = cyOf(db, a.cycle);
  return {
    type: 'link',
    id: a.id,
    name: t('{who}, cycle {d}', { who: first(db, a.person), d: c ? cyLabel(c) : '' }),
    h: c ? asRoute(c, a.person) : 'monitoring',
  };
};
const cyLink = (c: HrCycle): EntityRef => ({ type: 'link', id: c.id, name: cyName(c), h: `monitoring/${c.id}` });
const upd = (db: Draft<Workspace>, to: PersonId | null | undefined, type: string, title: string, h: string) => {
  notify(db, to, type, { type: 'link', id: h, h, name: title });
};

const blankAs = (c: HrCycle, p: PersonId, state: string): HrAssessment => ({
  id: `as-${c.id.slice(3)}-${p}`,
  cycle: c.id,
  person: p,
  state,
  report: null,
  clar: [],
  scores: null,
  scoredBy: null,
  scoredAt: null,
  hrBy: null,
  finalAt: null,
  version: 1,
  history: [],
  ack: null,
  corr: null,
  exceptionNote: '',
});

const monthName = (ym: string) => ym;

/** A revised finalized score gives every decided award round that used the cycle one review flag (hr_member_month). */
function flagRounds(db: Draft<Workspace>, a: HrAssessment) {
  for (const rd of hrDraft(db).rounds) {
    if (
      !rd.decision ||
      !rd.cycles.includes(a.cycle) ||
      rd.flags.some((f) => f.person === a.person && f.cycle === a.cycle && f.state === 'open')
    )
      continue;
    rd.flags.push({
      id: uid('fl'),
      at: nowStamp(),
      person: a.person,
      cycle: a.cycle,
      state: 'open',
      by: null,
      resolvedAt: null,
      note: '',
    });
    for (const p of rd.panel)
      upd(db, p, 'hr-flag', t('Member of the Month, {m}', { m: monthName(rd.month) }), `recognition/${rd.id}`);
  }
}

const find = (db: Draft<Workspace>, id: string) => hrDraft(db).assessments.find((v) => v.id === id);
const cycleOf = (db: Draft<Workspace>, a: HrAssessment) => hrDraft(db).cycles.find((c) => c.id === a.cycle);

// ---------- cycles ----------
export const setReviewer = (cycleId: string, person: PersonId, reviewer: PersonId | null) =>
  act(({ db }) => {
    const c = hrDraft(db).cycles.find((x) => x.id === cycleId);
    const x = c && rosterOf(c, person);
    if (!c || !x || !hrLead(getMe()) || c.state !== 'planned') return;
    const prev = x.reviewer;
    x.reviewer = reviewer;
    const nm = (id: PersonId | null) => (id ? (db.people.find((p) => p.id === id)?.name ?? '') : 'No reviewer');
    logChange(db, 'hr', 'set the reviewer in', cyLink(c), nm(prev), nm(reviewer));
  });

export function stepCycle(id: string, to: 'open' | 'review' | 'final' | 'closed') {
  const m = getMe();
  return act(({ db, toast }) => {
    const c = hrDraft(db).cycles.find((x) => x.id === id);
    if (!c || !hrLead(m) || !m) return;
    if (to === 'open' && c.roster.some((x) => !x.reviewer && !x.exempt)) {
      showToast(t('Every member needs a reviewer first.'));
      return;
    }
    const prev = {
      state: c.state,
      openedBy: c.openedBy,
      openedAt: c.openedAt,
      releasedBy: c.releasedBy,
      releasedAt: c.releasedAt,
      closedBy: c.closedBy,
      closedAt: c.closedAt,
    };
    const made: string[] = [];
    c.state = to;
    if (to === 'open') {
      c.openedBy = m.id;
      c.openedAt = nowStamp();
      for (const x of c.roster.filter((y) => !y.exempt)) upd(db, x.p, 'hr-cycle-open', cyName(c), asRoute(c, x.p));
    }
    if (to === 'final') {
      c.releasedBy = m.id;
      c.releasedAt = nowStamp();
    }
    if (to === 'closed') {
      c.closedBy = m.id;
      c.closedAt = nowStamp();
      for (const x of c.roster)
        if (!x.exempt && !hrDraft(db).assessments.some((a) => a.cycle === c.id && a.person === x.p)) {
          const a = blankAs(c, x.p, 'incomplete');
          a.hrBy = m.id;
          a.finalAt = nowStamp();
          hrDraft(db).assessments.push(a);
          made.push(a.id);
        }
    }
    const verb = {
      open: 'opened',
      review: 'started the review of',
      final: 'released the results of',
      closed: 'closed',
    }[to];
    logChange(db, 'hr', verb, cyLink(c), t(cysDef(prev.state)[0]), t(cysDef(to)[0]));
    toast(t('{c}: {s}', { c: cyName(c), s: t(cysDef(to)[0]) }), ({ db: u }) => {
      const x = hrDraft(u).cycles.find((y) => y.id === id);
      if (!x) return;
      Object.assign(x, prev);
      const h = hrDraft(u);
      h.assessments = h.assessments.filter((a) => !made.includes(a.id));
      logChange(u, 'hr', 'undid a cycle step on', cyLink(x));
    });
  });
}

/** Plans the next cycle right after the last one (a retry never creates a duplicate). Returns its id, or null. */
export async function planNextCycle() {
  const m = getMe();
  const h = hrOf(getDb());
  if (!m || !hrLead(m) || !h) return null;
  const last = [...h.cycles].sort((a, b) => b.start.localeCompare(a.start))[0];
  if (!last) return null;
  const start: DateStr = addDays(last.end, 1);
  if (h.cycles.some((c) => c.start === start)) {
    showToast(t('That cycle already exists.'));
    return null;
  }
  const end = addDays(start, 13);
  const c: HrCycle = {
    id: `cy-${start.slice(5, 7)}${start.slice(8, 10)}`,
    start,
    end,
    reportDue: addDays(end, 2),
    reviewDue: addDays(end, 6),
    correctionUntil: addDays(end, 18),
    rubric: RUBRIC.version,
    units: [...last.units],
    roster: last.roster.map((x) => ({ ...x, exempt: null })),
    state: 'planned',
    openedBy: null,
    openedAt: null,
    releasedBy: null,
    releasedAt: null,
    closedBy: null,
    closedAt: null,
    createdBy: m.id,
    createdAt: nowStamp(),
  };
  const ok = await act(({ db, toast }) => {
    hrDraft(db).cycles.push(c);
    logChange(db, 'hr', 'planned', cyLink(c));
    toast(t('Cycle {d} planned', { d: cyLabel(c) }), ({ db: u }) => {
      const hh = hrDraft(u);
      hh.cycles = hh.cycles.filter((v) => v.id !== c.id);
      go('monitoring');
    });
  });
  if (ok) go(`monitoring/${c.id}`);
  return ok ? c.id : null;
}

// ---------- the member's report ----------
export interface ReportInput {
  achievements: string;
  div: string[];
  cons: string[];
  consNote: string;
  blockers: string;
  support: string;
  next: string;
  links: string[];
}

export function submitReport(cycleId: string, f: ReportInput) {
  const m = getMe();
  return act(({ db, toast }) => {
    const c = hrDraft(db).cycles.find((x) => x.id === cycleId);
    const r = c && m && rosterOf(c, m.id);
    if (!c || !m || !r || !canSubmit(c)) {
      showToast(t('The report window is closed.'));
      return;
    }
    const report: HrReport = { ...f, at: nowStamp() };
    let a = hrDraft(db).assessments.find((x) => x.cycle === c.id && x.person === m.id);
    const prev = a ? (JSON.parse(JSON.stringify(a)) as HrAssessment) : null;
    if (!a) {
      a = blankAs(c, m.id, 'submitted');
      a.report = report;
      hrDraft(db).assessments.push(a);
    } else a.report = report;
    logChange(db, 'hr', prev ? 'updated a monitoring report for' : 'submitted a monitoring report for', asLink(db, a));
    if (!prev)
      upd(
        db,
        r.reviewer,
        'hr-report',
        t('{who}’s report, {d}', { who: first(db, m.id), d: cyLabel(c) }),
        asRoute(c, m.id),
      );
    const aid = a.id;
    toast(prev ? t('Report updated') : t('Report submitted to {who}', { who: first(db, r.reviewer) }), ({ db: u }) => {
      const h = hrDraft(u);
      const x = h.assessments.find((y) => y.id === aid);
      if (prev && x) Object.assign(x, prev);
      else h.assessments = h.assessments.filter((y) => y.id !== aid);
      if (x) logChange(u, 'hr', 'withdrew a monitoring report for', asLink(u, x));
    });
  });
}

// ---------- scoring ----------
export const scoreCriterion = (assessmentId: string, key: string, value: number) => {
  const m = getMe();
  return act(({ db }) => {
    const a = find(db, assessmentId);
    if (!a || !m) return;
    const c = cycleOf(db, a);
    const r = c ? rosterOf(c, a.person) : undefined;
    if (r?.reviewer !== m.id) return;
    a.scores ??= {};
    const prev = a.scores[key];
    a.scores[key] = { v: value, why: prev?.why ?? '' };
    if (a.state === 'submitted') a.state = 'draft';
    a.scoredBy = m.id;
    a.scoredAt = nowStamp();
  });
};

export const setRationale = (assessmentId: string, key: string, why: string) =>
  act(({ db }) => {
    const a = find(db, assessmentId);
    if (!a) return;
    a.scores ??= {};
    const cur = a.scores[key] ?? { v: null as unknown as number, why: '' };
    a.scores[key] = { ...cur, why: why.trim() };
  });

export const sendToHrCheck = (id: string) => {
  const m = getMe();
  return act(({ db, toast }) => {
    const a = find(db, id);
    if (!a || !m) return;
    const c = cycleOf(db, a);
    const r = c ? rosterOf(c, a.person) : undefined;
    if (!c || r?.reviewer !== m.id) return;
    const prev = a.state;
    a.state = 'reviewed';
    a.scoredBy = m.id;
    a.scoredAt = nowStamp();
    logChange(db, 'hr', 'sent for the HR check', asLink(db, a));
    for (const p of db.people.filter(
      (x) => x.status === 'active' && hrLead(x) && x.id !== a.person && x.id !== r.reviewer,
    ))
      upd(
        db,
        p.id,
        'hr-scored',
        t('{who}’s assessment, {d}', { who: first(db, a.person), d: cyLabel(c) }),
        asRoute(c, a.person),
      );
    toast(t('Sent to the HR check'), ({ db: u }) => {
      const x = find(u, id);
      if (!x) return;
      x.state = prev;
      logChange(u, 'hr', 'took back from the HR check', asLink(u, x));
    });
  });
};

export const askClarification = (id: string, q: string) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const a = find(db, id);
    const c = a && cycleOf(db, a);
    if (!a || !c || !m) return;
    const prev = a.state;
    a.clar.push({ by: m.id, at: nowStamp(), q, a: '', aAt: null });
    a.state = 'clarify';
    ui.form = null;
    logChange(db, 'hr', 'asked for clarification on', asLink(db, a));
    upd(db, a.person, 'hr-clarify', t('Your report, {d}', { d: cyLabel(c) }), asRoute(c, a.person));
    toast(t('Question sent'), ({ db: u }) => {
      const x = find(u, id);
      if (!x) return;
      x.clar.pop();
      x.state = prev;
    });
  });
};

export const answerClarification = (id: string, i: number, answer: string) =>
  act(({ db, toast }) => {
    const a = find(db, id);
    const c = a && cycleOf(db, a);
    const q = a?.clar[i];
    if (!a || !c || !q || a.person !== getMe()?.id) return;
    const prev = { a: q.a, aAt: q.aAt, state: a.state };
    q.a = answer;
    q.aAt = nowStamp();
    a.state = a.scores ? 'draft' : 'submitted';
    logChange(db, 'hr', 'answered a clarification on', asLink(db, a));
    upd(
      db,
      rosterOf(c, a.person)?.reviewer,
      'hr-clarified',
      t('{who}’s report, {d}', { who: first(db, a.person), d: cyLabel(c) }),
      asRoute(c, a.person),
    );
    toast(t('Answer sent'), ({ db: u }) => {
      const x = find(u, id);
      const y = x?.clar[i];
      if (!x || !y) return;
      y.a = prev.a;
      y.aAt = prev.aAt;
      x.state = prev.state;
    });
  });

// ---------- HR check ----------
export const finalizeAssessment = (id: string) => {
  const m = getMe();
  return act(({ db, toast }) => {
    const a = find(db, id);
    const c = a && cycleOf(db, a);
    if (!a || !c || !m || !canHrCheck(db, m, c, a.person)) return;
    const prev = { state: a.state, hrBy: a.hrBy, finalAt: a.finalAt };
    a.state = missingOf(a.scores).length ? 'incomplete' : 'final';
    a.hrBy = m.id;
    a.finalAt = nowStamp();
    logChange(db, 'hr', a.state === 'final' ? 'finalized the assessment' : 'finalized as Incomplete', asLink(db, a));
    upd(db, a.person, 'hr-final', t('Your result, {d}', { d: cyLabel(c) }), asRoute(c, a.person));
    toast(a.state === 'final' ? t('Assessment finalized') : t('Finalized as Incomplete'), ({ db: u }) => {
      const x = find(u, id);
      if (!x) return;
      Object.assign(x, prev);
      logChange(u, 'hr', 'reopened the assessment', asLink(u, x));
    });
  });
};

export const returnToReviewer = (id: string, why: string) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const a = find(db, id);
    const c = a && cycleOf(db, a);
    if (!a || !c || !m) return;
    a.state = 'draft';
    a.clar.push({ by: m.id, at: nowStamp(), q: t('HR check: {w}', { w: why }), a: '-', aAt: nowStamp() });
    ui.form = null;
    logChange(db, 'hr', 'returned to the reviewer', asLink(db, a));
    upd(
      db,
      rosterOf(c, a.person)?.reviewer,
      'hr-returned',
      t('{who}’s assessment, {d}', { who: first(db, a.person), d: cyLabel(c) }),
      asRoute(c, a.person),
    );
    toast(t('Returned to the reviewer'));
  });
};

// ---------- the member's response and corrections ----------
export const acknowledgeResult = (id: string) =>
  act(({ db, toast }) => {
    const a = find(db, id);
    if (!a || a.person !== getMe()?.id) return;
    a.ack = nowStamp();
    logChange(db, 'hr', 'acknowledged the result', asLink(db, a));
    toast(t('Result acknowledged'), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.ack = null;
    });
  });

export const askCorrection = (id: string, why: string) =>
  act(({ db, ui, toast }) => {
    const a = find(db, id);
    const c = a && cycleOf(db, a);
    if (!a || !c || a.person !== getMe()?.id) return;
    a.corr = { by: a.person, at: nowStamp(), reason: why, state: 'open', resolvedBy: null, resolvedAt: null };
    ui.form = null;
    logChange(db, 'hr', 'asked for a correction to', asLink(db, a));
    upd(
      db,
      rosterOf(c, a.person)?.reviewer,
      'hr-corr',
      t('{who}’s result, {d}', { who: first(db, a.person), d: cyLabel(c) }),
      asRoute(c, a.person),
    );
    toast(t('Correction request sent'));
  });

/** The reviewer saves a corrected version; the earlier one stays in the history and award rounds get a review flag. */
export const saveCorrectedVersion = (id: string, scores: HrScores) => {
  const m = getMe();
  return act(({ db, toast }) => {
    const a = find(db, id);
    const c = a && cycleOf(db, a);
    if (!a || !c || !m) return;
    a.history.push({
      version: a.version,
      scores: JSON.parse(JSON.stringify(a.scores ?? {})) as HrScores,
      by: a.scoredBy,
      at: a.scoredAt,
      reason: '',
    });
    a.version += 1;
    a.scores = scores;
    a.scoredBy = m.id;
    a.scoredAt = nowStamp();
    if (a.corr) a.corr = { ...a.corr, state: 'accepted', resolvedBy: m.id, resolvedAt: nowStamp() };
    flagRounds(db, a);
    logChange(db, 'hr', 'saved a corrected version of', asLink(db, a), `v${a.version - 1}`, `v${a.version}`);
    upd(db, a.person, 'hr-corr-done', t('Your result, {d}', { d: cyLabel(c) }), asRoute(c, a.person));
    toast(t('Corrected version saved. The earlier version stays on record.'));
  });
};

export const declineCorrection = (id: string, why: string) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const a = find(db, id);
    const c = a && cycleOf(db, a);
    if (!a || !c || !m || !a.corr) return;
    a.corr = { ...a.corr, state: 'declined', resolvedBy: m.id, resolvedAt: nowStamp(), note: why };
    ui.form = null;
    logChange(db, 'hr', 'kept the result after a correction request on', asLink(db, a));
    upd(db, a.person, 'hr-corr-done', t('Your result, {d}', { d: cyLabel(c) }), asRoute(c, a.person));
    toast(t('Answer sent'));
  });
};

// ---------- support actions ----------
export interface NewAction {
  assessment: string;
  goal: string;
  owner: PersonId;
  due: DateStr;
  tnd: boolean;
  tndNote: string;
}

/** Agrees a support action. Returns its id, or null when it was not saved. */
export async function saveSupportAction(f: NewAction) {
  const m = getMe();
  const db0 = getDb();
  const a0 = hrOf(db0)?.assessments.find((v) => v.id === f.assessment);
  if (!m || !a0) return null;
  const x = {
    id: uid('da'),
    assessment: a0.id,
    person: a0.person,
    goal: f.goal,
    owner: f.owner,
    due: f.due,
    tnd: f.tnd,
    tndNote: f.tndNote,
    state: 'open' as const,
    task: null,
    outcome: '',
    createdBy: m.id,
    createdAt: nowStamp(),
  };
  const ok = await act(({ db, ui, toast }) => {
    const a = find(db, f.assessment);
    if (!a) return;
    hrDraft(db).actions.push(x);
    logChange(db, 'hr', 'agreed a support action for', asLink(db, a));
    upd(db, f.owner, 'hr-action', f.goal, 'monitoring');
    ui.insp = { type: 'hr-act', id: x.id };
    toast(t('Support action saved'), ({ db: u, ui: uu }) => {
      const h = hrDraft(u);
      h.actions = h.actions.filter((v) => v.id !== x.id);
      uu.insp = null;
    });
  });
  return ok ? x.id : null;
}

/** The canonical task carries a neutral title only; the assessment stays restricted (S036). */
export const makeActionTask = (id: string) =>
  act(({ db, toast }) => {
    const x = hrDraft(db).actions.find((v) => v.id === id);
    if (!x || x.task) return;
    const tk = addTaskDraft(db, t('Support check-in with {who}', { who: first(db, x.person) }), {
      owner: x.owner,
      due: x.due,
      div: 'hr',
    });
    if (!tk) return;
    x.task = tk.id;
    notify(db, x.owner, 'hr-task', { type: 'task', id: tk.id });
    const tid = tk.id;
    toast(t('Task created for {who}', { who: first(db, x.owner) }), ({ db: u }) => {
      const task = u.tasks.find((y) => y.id === tid);
      if (task) task.trashed = true;
      const y = hrDraft(u).actions.find((v) => v.id === id);
      if (y) y.task = null;
    });
  });

export const markActionDone = (id: string, outcome: string) =>
  act(({ db, ui, toast }) => {
    const x = hrDraft(db).actions.find((v) => v.id === id);
    if (!x) return;
    x.state = 'done';
    x.outcome = outcome;
    ui.form = null;
    logChange(db, 'hr', 'recorded the outcome of a support action for', {
      type: 'link',
      id: x.id,
      name: first(db, x.person),
      h: 'monitoring',
    });
    toast(t('Outcome recorded'), ({ db: u }) => {
      const y = hrDraft(u).actions.find((v) => v.id === id);
      if (!y) return;
      y.state = 'open';
      y.outcome = '';
    });
  });
