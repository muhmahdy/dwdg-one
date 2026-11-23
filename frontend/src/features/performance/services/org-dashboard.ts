/* The organisation dashboard (Strategy & Growth brief: "Organizational Performance Dashboard", reviewed monthly with the
   President and VP). Each line is one batch target from a division's operating brief, counted from records saved in
   dwdg'ONE. Nothing is added into a score, nothing is ranked, and a division the viewer may not read stays Unknown, never
   zero (analytics_team_performance, D30). A share with nothing to count reads "No data yet", not 0%. */
import { visibleDivs } from '@/lib/access';
import { isBoard, isTopOrAdmin } from '@/lib/roles';
import { addDays, today } from '@/lib/time';
import type { DivisionId, Person, Project, Workspace } from '@/types/workspace';
import { CONS, eeOf } from '@/features/external/services/ee-data';
import { consOf } from '@/features/consulting/services/cons-data';
import { engOf, engProjects } from '@/features/consulting/services/cons-rules';
import { hrOf } from '@/features/hr/services/hr-data';
import { canReadComps, isRated, matrixPeople, profileOf } from '@/features/hr/services/competency';
import { fnlOf } from '@/features/fnl/services/fnl-data';
import { mcitOf, type Publication } from '@/features/mcit/services/mcit-data';
import { sngOf } from '@/features/strategy/services/sng-data';

export type Target =
  | { kind: 'atLeast'; n: number }
  | { kind: 'moreThan'; n: number }
  | { kind: 'all' }
  | { kind: 'range'; n: number; max: number };

export interface Metric {
  k: string;
  /** The division whose brief sets the target. */
  div: DivisionId;
  label: string;
  /** How it is counted, in one line. */
  help: string;
  /** A count, or the part of a share. Null when the viewer may not read the records. */
  value: number | null;
  /** The whole of a share (n of `of`); absent for a count. */
  of?: number | null;
  target: Target | null;
  /** Shown instead of a target when the brief sets a rhythm, not a number ("Monthly"). */
  targetText?: string;
  /** The page the records come from. */
  page?: string;
  /** The viewer may not read the records behind it: shown as not visible, never as zero. */
  hidden?: boolean;
}

export type MetricState = 'met' | 'below' | 'nodata' | 'notarget' | 'hidden';

/** The batch the briefs plan for (Operating roadmap, September 2026 to March 2027). */
export const BATCH = { from: '2026-09-01', to: '2027-03-31' };

/** Strategy & Growth, the President, the VP and the Admin; never the Board (division records are closed to it). */
export const canSeeDashboard = (m: Person | undefined) => !!m && !isBoard(m) && (isTopOrAdmin(m) || m.div === 'sng');

/** Whether the viewer may read a division's own records (the same rule the database applies: sees_div). */
export const readsDiv = (m: Person | undefined, d: DivisionId) => !!m && !isBoard(m) && visibleDivs(m).includes(d);

const OPEN_OPP = ['identified', 'qualified', 'contacted', 'discussion', 'proposal', 'negotiation', 'pending'];
const QUALIFIED = ['qualified', 'contacted', 'discussion', 'proposal', 'negotiation', 'pending'];
const RUNNING = ['planned', 'active', 'review'];
const OPEN_IT = ['new', 'triaged', 'working', 'waiting', 'reopened'];

/** Engagements for a real external client (a dummy case or a cohort has no client). */
export const clientEngagements = (db: Workspace): Project[] =>
  engProjects(db).filter((p) => !!engOf(db, p.id)?.client && p.stage !== 'cancelled');

/** People on a project: lead, PM, and team members who joined. */
const onProject = (p: Project): string[] =>
  [p.lead, p.pm, ...p.team.filter((x) => x.state === 'joined').map((x) => x.id)].filter((x): x is string => !!x);

/** Every metric of the dashboard for this viewer. `now` is today's date (a parameter for tests). */
export function dashboardMetrics(db: Workspace, m: Person | undefined, now = today()): Metric[] {
  const sees = (d: DivisionId) => readsDiv(m, d);
  const hide = (x: Metric, ok: boolean): Metric =>
    ok ? x : { ...x, hidden: true, value: null, ...(x.of !== undefined ? { of: null } : {}) };
  const out: Metric[] = [];

  // ---------- External Engagement ----------
  const ee = eeOf(db);
  const clientOpps = ee.opps.filter((o) => o.kind === 'client');
  const won = clientOpps.filter((o) => o.stage === 'active');
  const open = ee.opps.filter((o) => OPEN_OPP.includes(o.stage));
  const handed = won.filter((o) => {
    const h = ee.handoffs.find((x) => x.id === o.handoff || x.opp === o.id);
    return !!h && (h.state === 'accepted' || h.state === 'fulfilled');
  });
  // Opportunities are read by External Engagement and by Consulting (schema-spec ee_opps).
  const eeOk = sees('ee') || sees(CONS);
  out.push(
    hide(
      {
        k: 'ee-pipeline',
        div: 'ee',
        label: 'Qualified client pipeline',
        help: 'Client opportunities from Qualified up to Agreement pending.',
        value: clientOpps.filter((o) => QUALIFIED.includes(o.stage)).length,
        target: { kind: 'moreThan', n: 4 },
        page: 'opportunities',
      },
      eeOk,
    ),
    hide(
      {
        k: 'ee-won',
        div: 'ee',
        label: 'Real clients secured',
        help: 'Client opportunities marked Won.',
        value: won.length,
        target: { kind: 'atLeast', n: 4 },
        page: 'opportunities',
      },
      eeOk,
    ),
    hide(
      {
        k: 'ee-next',
        div: 'ee',
        label: 'Open opportunities with a next action',
        help: 'Open opportunities that name a next action and its date.',
        value: open.filter((o) => !!o.nextAction.trim() && !!o.nextDate).length,
        of: open.length,
        target: { kind: 'all' },
        page: 'opportunities',
      },
      sees('ee'),
    ),
    hide(
      {
        k: 'ee-handoff',
        div: 'ee',
        label: 'Won clients handed to Consulting',
        help: 'Won client opportunities whose hand-off Consulting accepted.',
        value: handed.length,
        of: won.length,
        target: { kind: 'all' },
        page: 'opportunities',
      },
      eeOk,
    ),
  );

  // ---------- Consulting ----------
  const cs = consOf(db);
  const clientEngs = clientEngagements(db);
  const delivered = clientEngs.filter((p) => p.stage === 'completed');
  const analysts = matrixPeople(db).filter((p) => p.role === 'member');
  const exposed = new Set(clientEngs.filter((p) => p.stage !== 'draft').flatMap(onProject));
  out.push(
    hide(
      {
        k: 'cons-running',
        div: CONS,
        label: 'Client engagements running',
        help: 'Engagements for a real client that are planned, active or in review.',
        value: clientEngs.filter((p) => RUNNING.includes(p.stage)).length,
        target: null,
        page: 'engagements',
      },
      sees(CONS),
    ),
    hide(
      {
        k: 'cons-delivered',
        div: CONS,
        label: 'Client projects delivered',
        help: 'Engagements for a real client marked Completed.',
        value: delivered.length,
        target: { kind: 'atLeast', n: 4 },
        page: 'engagements',
      },
      sees(CONS),
    ),
    hide(
      {
        k: 'cons-closure',
        div: CONS,
        label: 'Delivered projects with a closure and lessons',
        help: 'Delivered client engagements whose closure (outcome and lessons) is recorded.',
        value: delivered.filter((p) => !!engOf(db, p.id)?.closure).length,
        of: delivered.length,
        target: { kind: 'all' },
        page: 'engagements',
      },
      sees(CONS),
    ),
    hide(
      {
        k: 'cons-exposure',
        div: CONS,
        label: 'Analysts with real-client exposure',
        help: 'Active members (role Member) named on at least one client engagement as lead, PM or team.',
        value: analysts.filter((p) => exposed.has(p.id)).length,
        of: analysts.length,
        target: { kind: 'all' },
        page: 'engagements',
      },
      sees(CONS),
    ),
    hide(
      {
        k: 'cons-knowledge',
        div: CONS,
        label: 'Knowledge articles published',
        help: 'Articles in Knowledge with a published version.',
        value: cs.kn.filter((a) => a.versions.some((v) => v.state === 'published')).length,
        target: null,
        page: 'knowledge',
      },
      sees(CONS),
    ),
  );

  // ---------- Human Resource ----------
  const everyone = matrixPeople(db);
  const h = hrOf(db);
  const closedCycles = (h?.cycles ?? []).filter((c) => c.state === 'final' || c.state === 'closed');
  const lastCycle = closedCycles.sort((a, b) => b.end.localeCompare(a.end))[0] ?? null;
  const finished = lastCycle
    ? lastCycle.roster.filter((r) => {
        const a = h?.assessments.find((x) => x.cycle === lastCycle.id && x.person === r.p);
        return !!a && (a.state === 'final' || a.state === 'exempt');
      }).length
    : null;
  out.push(
    hide(
      {
        k: 'hr-competency',
        div: 'hr',
        label: 'Competency matrix coverage',
        help: 'Active members with at least one competency level recorded.',
        value: everyone.filter((p) => isRated(profileOf(db, p.id))).length,
        of: everyone.length,
        target: { kind: 'all' },
        page: 'competencies',
      },
      canReadComps(m),
    ),
    hide(
      {
        k: 'hr-cycle',
        div: 'hr',
        label: 'Last HR cycle completed',
        help: 'Members of the last finalized 14-day cycle whose assessment is final or exempt.',
        value: finished,
        of: lastCycle ? lastCycle.roster.length : null,
        target: { kind: 'all' },
        page: 'monitoring',
      },
      sees('hr'),
    ),
  );

  // ---------- Finance & Legal ----------
  const fnl = fnlOf(db);
  out.push(
    hide(
      {
        k: 'fnl-legal',
        div: 'fnl',
        label: 'Client engagements with a signed agreement',
        help: 'Running or delivered client engagements with a legal document signed or registered.',
        value: clientEngs.filter(
          (p) =>
            p.stage !== 'draft' &&
            fnl.legal.some((l) => l.project === p.id && (l.stage === 'signed' || l.stage === 'registered')),
        ).length,
        of: clientEngs.filter((p) => p.stage !== 'draft').length,
        target: { kind: 'all' },
        page: 'register',
      },
      sees('fnl'),
    ),
    hide(
      {
        k: 'fnl-periods',
        div: 'fnl',
        label: 'Period reviews closed',
        help: 'Finance period reviews marked Closed.',
        value: fnl.periods.filter((x) => x.state === 'closed').length,
        target: null,
        targetText: 'Monthly',
        page: 'period-reviews',
      },
      sees('fnl'),
    ),
    hide(
      {
        k: 'fnl-waiting',
        div: 'fnl',
        label: 'Finance requests waiting for FnL',
        help: 'Requests submitted or in review.',
        value: fnl.requests.filter((x) => x.state === 'submitted' || x.state === 'review').length,
        target: null,
        page: 'fnl-requests',
      },
      sees('fnl'),
    ),
  );

  // ---------- Marketing, Communication & IT ----------
  const mc = mcitOf(db);
  const since = addDays(now, -30);
  const pubs = mc.content
    .flatMap((c) => c.channels.map((x) => x.pub))
    .filter((p): p is Publication => !!p && p.at.slice(0, 10) >= since);
  const withReach = pubs.filter((p) => typeof p.metrics?.reach === 'number');
  out.push(
    hide(
      {
        k: 'mcit-published',
        div: 'mcit',
        label: 'Posts published, last 30 days',
        help: 'Channel publications recorded in the content tracker.',
        value: pubs.length,
        target: null,
        page: 'content',
      },
      sees('mcit'),
    ),
    hide(
      {
        k: 'mcit-reach',
        div: 'mcit',
        label: 'Reach recorded, last 30 days',
        help: 'Reach typed in by Communications for those posts. Posts without results are left out, not counted as 0.',
        value: withReach.length ? withReach.reduce((s, p) => s + (p.metrics?.reach ?? 0), 0) : null,
        target: null,
        page: 'content',
      },
      sees('mcit'),
    ),
    hide(
      {
        k: 'mcit-it',
        div: 'mcit',
        label: 'IT requests open',
        help: 'Requests to IT that are new, triaged, in progress, waiting or reopened.',
        value: mc.it.filter((x) => OPEN_IT.includes(x.stage)).length,
        target: null,
        page: 'it-requests',
      },
      sees('mcit'),
    ),
  );

  // ---------- Strategy & Growth ----------
  const sg = sngOf(db);
  out.push(
    hide(
      {
        k: 'sng-priorities',
        div: 'sng',
        label: 'Strategic priorities with an owner',
        help: 'Initiatives approved and owned by a named person.',
        value: sg.initiatives.filter((x) => x.stage === 'approved' && !!x.owner).length,
        target: { kind: 'range', n: 3, max: 5 },
        page: 'initiatives',
      },
      sees('sng'),
    ),
    hide(
      {
        k: 'sng-decisions',
        div: 'sng',
        label: 'Decisions waiting',
        help: 'Decision packets submitted and not yet decided.',
        value: sg.packets.filter((x) => x.state === 'pending').length,
        target: null,
        page: 'decisions',
      },
      sees('sng'),
    ),
  );
  return out;
}

/** Where a metric stands against its target. Hidden and missing data are never read as zero. */
export function stateOf(x: Metric): MetricState {
  if (x.hidden) return 'hidden';
  if (x.value === null) return 'nodata';
  if (x.of !== undefined && !x.of) return 'nodata';
  if (!x.target) return 'notarget';
  const v = x.value;
  switch (x.target.kind) {
    case 'atLeast':
      return v >= x.target.n ? 'met' : 'below';
    case 'moreThan':
      return v > x.target.n ? 'met' : 'below';
    case 'range':
      return v >= x.target.n && v <= x.target.max ? 'met' : 'below';
    case 'all':
      return v === x.of ? 'met' : 'below';
  }
}

/** How far along the bar is, 0 to 1, or null when there is nothing to draw. */
export function progressOf(x: Metric): number | null {
  if (x.value === null) return null;
  if (x.of !== undefined) return x.of ? Math.min(1, x.value / x.of) : null;
  if (!x.target || x.target.kind === 'all') return null;
  return Math.min(1, x.value / (x.target.kind === 'moreThan' ? x.target.n + 1 : x.target.n));
}

/** Targets from the briefs that no record in dwdg'ONE can show yet (so the review knows what is still on paper). */
export const NOT_MEASURED: [DivisionId, string][] = [
  ['ee', 'Active mentors (3 to 4)'],
  [CONS, 'Client feedback completion'],
  ['hr', 'Member pulse response rate'],
  ['fnl', 'Budget variance and donation records'],
  ['mcit', 'Template reuse and system adoption'],
  ['sng', 'Benchmarking implementation rate'],
];
