/* One person: task delivery, handed-in work, weekly attendance and 14-day HR cycles. The person, their leaders, HR and the
   President can open it (D30). From screens/perf.js personPage. */
import { Link } from 'react-router';
import { Avatar, IdentityLine, roleText } from '@/components/shared/Avatar';
import { Empty, Page, PageHeader } from '@/components/ui/page';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { badgeMask } from '@/components/ui/icon-data';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { dShort } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import {
  attDef,
  ATT_ORDER,
  CYCLE_STATE,
  RUBRIC,
  hrOf,
  regDate,
  regTitle,
  weightedTotal,
  type HrCycle,
  type HrRegister,
} from '@/features/hr/services/hr-data';
import { RATING, type Rating } from '@/features/work/services/signoff';
import {
  METRIC,
  hrChipDef,
  hrFacts,
  periods,
  ringFacts,
  span2,
  taskFacts,
  type Period,
  type TaskFacts,
} from '../services/facts';
import { canSeePerson, hrAll } from '../services/scope';
import { PerfCrumb } from './TeamPage';
import { openPerfList, perfKey } from '../services/records';
import {
  Chip,
  Late,
  NoteLine,
  PeriodSelect,
  RateWords,
  RingLine,
  RingLines,
  Rings,
  Unknown,
  cardSurface,
  hasRateWords,
  ringVars,
  usePeriod,
  phClass,
} from './PerfParts';
import { NotAvailable } from '@/components/ui/page';

const TONE_TEXT: Record<string, string> = {
  green: 'text-green-ink',
  warn: 'text-warning-mark',
  ink2: 'text-ink-2',
  danger: 'text-danger',
  mute: 'text-mute',
};

const box = cn('px-4 py-3.5', cardSurface);

export function PersonCrumb({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const p = db.people.find((x) => x.id === id);
  if (!m || !p || !canSeePerson(db, m, id))
    return (
      <PerfCrumb
        parts={[
          ['performance', t('Performance')],
          ['', t('Not available')],
        ]}
      />
    );
  return m.id === id ? (
    <PerfCrumb parts={[['', t('Performance')]]} />
  ) : (
    <PerfCrumb
      parts={[
        ['performance', t('Performance')],
        ['', p.name],
      ]}
    />
  );
}

/** A figure that opens the records behind it (W098 acceptance 2). */
export function Stat({
  k,
  n,
  label,
  hint,
  bad = false,
}: {
  k: string;
  n: number;
  label: string;
  hint?: string;
  bad?: boolean;
}) {
  return (
    <button
      type="button"
      className="grid cursor-pointer content-start justify-items-start gap-0.5 rounded-[10px] border-0 bg-transparent px-1 pt-2.5 pb-0.5 text-left text-ink hover:bg-hover"
      onClick={() => {
        openPerfList(k);
      }}
    >
      <b className={cn('text-[length:22px]/[1.1]! font-semibold! type-num', bad && 'text-danger')}>{n}</b>
      <span className="text-[length:13px] text-ink-2">{label}</span>
      {hint && <small className="text-[length:12px] text-mute">{hint}</small>}
    </button>
  );
}

export const Hero = ({ children }: { children: React.ReactNode }) => (
  <section className={cn('mt-3 grid gap-4 px-5 py-[18px]', cardSurface)}>{children}</section>
);
export const StatsRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] pt-1.5 shadow-[inset_0_1px_0_var(--line)]">
    {children}
  </div>
);

/** Paired bars (R006/R011): the chosen period strong, the period before it pale, for the same person. Never compared with others. */
function PairBars({ pid, P }: { pid: string; P: Period }) {
  const db = useWorkspace((w) => w);
  const ps = periods();
  const cur = P.k === 'all' ? ps[0] : P;
  const i = ps.findIndex((x) => x.k === cur?.k);
  const prevP = ps[i + 1];
  const prev = prevP && prevP.k !== 'all' ? prevP : null;
  if (!cur) return null;
  const a = taskFacts(db, pid, cur);
  const b = prev ? taskFacts(db, pid, prev) : null;
  const rows: [keyof TaskFacts, string][] = [
    ['done', 'Completed'],
    ['late', 'Completed on or after the due date'],
    ['returned', 'Sent back after review'],
    ['accepted', 'Accepted hand-ins'],
  ];
  const max = Math.max(1, ...rows.flatMap(([x]) => [a[x].length, b ? b[x].length : 0]));
  return (
    <div className={cn('mt-3 px-4 py-3', cardSurface)}>
      <div className="mb-1.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[length:13.5px] text-mute">
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-[3px] bg-ink" />
          {cur.label}
        </span>
        {prev && (
          <span className="inline-flex items-center gap-1.5">
            <i className="size-2.5 rounded-[3px] bg-[color-mix(in_srgb,var(--ink)_22%,var(--surface))]" />
            {t('Previous cycle, {d}', { d: span2(prev.from, prev.to) })}
          </span>
        )}
      </div>
      {rows.map(([x, l]) => (
        <button
          key={x}
          type="button"
          className="grid w-full cursor-pointer grid-cols-[minmax(120px,220px)_1fr_auto] items-center gap-3 border-0 bg-transparent py-2 text-left text-ink [&+&]:shadow-[inset_0_1px_0_var(--line)]"
          onClick={() => {
            openPerfList(perfKey('p', pid, x, cur.k));
          }}
        >
          <span className="text-[length:14px] text-ink-2">{t(l)}</span>
          <span className="grid gap-[3px]">
            <span className="block h-2 min-w-0.5 rounded bg-ink" style={{ width: `${(a[x].length / max) * 100}%` }} />
            {b && (
              <span
                className="block h-2 min-w-0.5 rounded bg-[color-mix(in_srgb,var(--ink)_22%,var(--surface))]"
                style={{ width: `${(b[x].length / max) * 100}%` }}
              />
            )}
          </span>
          <span className="grid min-w-7 justify-items-end">
            <b className="font-[650]">{a[x].length}</b>
            {b && <small className="text-[length:12.5px] text-mute">{b[x].length}</small>}
          </span>
        </button>
      ))}
    </div>
  );
}

const RATINGS: Rating[] = ['excellent', 'good', 'needs-work'];

/** Handed-in work as slim tracks (R016): how much of the accepted work got each rating. */
function RateTracks({ tf, pid, P }: { tf: TaskFacts; pid: string; P: Period }) {
  const n = tf.accepted.length;
  const trk =
    'grid cursor-pointer gap-2 border-0 bg-transparent px-4 py-3.5 text-left text-ink shadow-[inset_0_-1px_0_var(--line)]';
  return (
    <div className={cn('mt-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] overflow-hidden', cardSurface)}>
      {RATINGS.map((r) => {
        const c = tf[`r-${r}`].length;
        return (
          <button
            key={r}
            type="button"
            className={trk}
            onClick={() => {
              openPerfList(perfKey('p', pid, `r-${r}`, P.k));
            }}
          >
            <div className="flex items-baseline justify-between gap-2 text-[length:14px] text-ink-2">
              <span>
                <Chip def={RATING[r]} />
              </span>
              <b className="text-[length:20px]! font-[650]! text-ink type-num">
                {c}
                <em className="text-[length:14px] font-medium text-mute not-italic">/{n}</em>
              </b>
            </div>
            <span className="block h-1.5 overflow-hidden rounded-[3px] bg-surface-2">
              <i
                className={cn('block h-full rounded-[3px]', RATING[r][2] === 'green' ? 'bg-green' : 'bg-warning-mark')}
                style={{ width: `${n ? (c / n) * 100 : 0}%` }}
              />
            </span>
          </button>
        );
      })}
      <button
        type="button"
        className={trk}
        onClick={() => {
          openPerfList(perfKey('p', pid, 'handedIn', P.k));
        }}
      >
        <div className="flex items-baseline justify-between gap-2 text-[length:14px] text-ink-2">
          <span>{t('Handed in, waiting for assessment')}</span>
          <b className="text-[length:20px]! font-[650]! text-ink type-num">{tf.handedIn.length}</b>
        </div>
        <small className="text-[length:13px] text-mute">{t('Right now')}</small>
      </button>
    </div>
  );
}

function CycleDetail({ c, pid }: { c: HrCycle; pid: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const f = hrFacts(db, pid, { k: c.start, from: c.start });
  const a = f.a;
  const total = f.k === 'final' ? weightedTotal(a) : null;
  const full = !!m && (m.id === pid || hrAll(m));
  const see = full || (!!a && a.scoredBy === m?.id);
  const extra =
    f.k === 'incomplete'
      ? t('Missing report or criteria stay Incomplete, never zero.')
      : f.k === 'exempt'
        ? t('Exempt in this cycle. The reason stays with HR.')
        : '';
  return (
    <div className="px-0.5 pt-1">
      <div className="flex flex-wrap items-center gap-2.5">
        <b className="font-semibold! type-num">{span2(c.start, c.end)}</b>
        <span className="text-mute type-small">{t('Cycle {s}', { s: t(CYCLE_STATE[c.state] ?? c.state) })}</span>
        <Chip def={hrChipDef(f)} />
        {a?.version != null && a.version > 1 && (
          <span className="inline-flex h-6 items-center rounded-chip px-2 text-[length:12px] font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong)]">
            {t('Corrected, version {n}', { n: a.version })}
          </span>
        )}
        <Link
          className="ml-auto inline-flex items-center gap-1 text-[length:12.5px] font-semibold text-green-ink no-underline max-[600px]:ml-0"
          to={`/monitoring/${c.id}/${pid}`}
        >
          {t('Open in HR')}
        </Link>
      </div>
      {f.k === 'final' && a?.scores && (
        <div className="mt-2.5 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1.5">
          {RUBRIC.criteria.map((c2) => {
            const s = a.scores?.[c2.k];
            return (
              <span key={c2.k} className="grid gap-0.5 rounded-ctl bg-surface px-2.5 py-2" title={t(c2.desc)}>
                <small className="text-mute type-caption">{t(c2.name)}</small>
                <b className="text-[length:15px]! type-num">{s ? `${s.v}/${RUBRIC.max}` : '–'}</b>
                {see && s?.why && <em className="text-[length:12px] text-ink-2 not-italic">{s.why}</em>}
              </span>
            );
          })}
          {total != null && (
            <span className="grid gap-0.5 rounded-ctl bg-sel-neutral px-2.5 py-2">
              <small className="text-mute type-caption">{t('Weighted result')}</small>
              <b className="text-[length:15px]! type-num">{total}</b>
              <em className="text-[length:12px] text-ink-2 not-italic">
                {t('of 100, rubric {v} (proposed)', { v: RUBRIC.version })}
              </em>
            </span>
          )}
        </div>
      )}
      {extra && <p className="mt-2 mb-0 text-mute type-small">{extra}</p>}
    </div>
  );
}

function Cycles({ pid, cycles }: { pid: string; cycles: HrCycle[] }) {
  const db = useWorkspace((w) => w);
  const pfCy = useUi((u) => (typeof u.pfCy === 'string' ? u.pfCy : ''));
  const sel =
    cycles.find((c) => c.id === pfCy) ??
    [...cycles].reverse().find((c) => ['final', 'closed'].includes(c.state)) ??
    cycles.at(-1);
  return (
    <>
      <div
        className="mb-3 grid auto-cols-[minmax(130px,1fr)] grid-flow-col gap-1 overflow-x-auto pb-0.5"
        role="group"
        aria-label={t('14-day HR cycles')}
      >
        {cycles.map((c) => {
          const f = hrFacts(db, pid, { k: c.start, from: c.start });
          const on = sel?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              className={cn(
                'grid cursor-pointer justify-items-start gap-1.5 rounded-[10px] border-0 bg-surface-2 px-3 py-2.5 text-left text-[length:12.5px] text-ink hover:bg-hover',
                on && 'bg-surface shadow-[inset_0_0_0_1.5px_var(--ink)]',
              )}
              onClick={() => {
                setUi((u) => {
                  u.pfCy = c.id;
                });
              }}
            >
              <span className="type-num">{span2(c.start, c.end)}</span>
              {f.k === 'unknown' ? <Unknown /> : <Chip def={hrChipDef(f)} />}
            </button>
          );
        })}
      </div>
      {sel && <CycleDetail c={sel} pid={pid} />}
    </>
  );
}

function AttendanceDots({ regs, who }: { regs: { g: HrRegister; st: string; final: boolean }[]; who: string }) {
  const db = useWorkspace((w) => w);
  const rs = [...regs].reverse();
  if (!rs.length)
    return (
      <Empty title={t('Unknown')}>
        {t('No weekly register in this period lists {who} as expected. That is not the same as absent.', { who })}
      </Empty>
    );
  const eff = (x: { st: string; final: boolean }) => (x.final ? x.st : 'unknown');
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {rs.map((x) => {
          const d = attDef(eff(x));
          const title = `${regTitle(db, x.g)}: ${t(x.final ? d[0] : 'Register not finalized yet')}`;
          return (
            <Link
              key={x.g.id}
              to={`/attendance/${x.g.id}`}
              title={title}
              aria-label={title}
              className={cn(
                'grid min-w-[52px] justify-items-center gap-1 rounded-xl bg-surface-2 px-1.5 pt-2 pb-1.5 no-underline hover:bg-hover',
                TONE_TEXT[d[2]],
                !x.final && 'opacity-60',
              )}
            >
              <i className="size-[22px] bg-current mask-icon" style={{ ['--m' as string]: badgeMask(d[1]) }} />
              <small className="text-[length:12.5px]! text-ink-2 type-num">{dShort(regDate(db, x.g))}</small>
            </Link>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[length:12.5px] font-semibold">
        {ATT_ORDER.filter((s) => rs.some((x) => eff(x) === s)).map((s) => {
          const d = attDef(s);
          return (
            <span key={s} className={cn('inline-flex items-center gap-[5px]', TONE_TEXT[d[2]])}>
              <i className="size-3.5 bg-current mask-icon" style={{ ['--m' as string]: badgeMask(d[1]) }} />
              {t(d[0])}
            </span>
          );
        })}
      </div>
    </>
  );
}

export function PersonPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const P = usePeriod();
  const p = db.people.find((x) => x.id === id);
  if (!m || !p || !canSeePerson(db, m, id))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const self = id === m.id;
  const f = ringFacts(db, id, P);
  const tf = f.tf;
  const af = f.af;
  const h = hrOf(db);
  const cycles = h
    ? h.cycles.filter((c) => c.roster.some((r) => r.p === id)).sort((a, b) => a.start.localeCompare(b.start))
    : [];
  const k = (x: string) => perfKey('p', id, x, P.k);
  const sh = <span className="ml-[9px] font-normal text-mute type-small">{P.label}</span>;
  return (
    <Page canvas className={ringVars}>
      {!self && (
        <Link
          className="mb-2.5 inline-flex items-center gap-1 py-2 text-[length:14px] font-semibold text-green-ink no-underline"
          to="/performance"
        >
          <Icon name="left" className="size-3" /> {t('Team performance')}
        </Link>
      )}
      <PageHeader
        className={phClass}
        title={self ? t('Your performance') : p.name}
        sub={
          self
            ? t('Only you, your leaders, HR and the President can open this page.')
            : t('{who} can open this page too. So can their leaders, HR and the President.', { who: p.first })
        }
      >
        <PeriodSelect />
      </PageHeader>
      <Hero>
        <div className="flex items-center gap-3">
          <Avatar id={id} size="lg" />
          <div className="grid gap-0.5">
            <b className="text-[length:17px] font-semibold">{p.name}</b>
            <small className="flex items-center gap-1.5 text-[length:13.5px] text-mute">
              <IdentityLine person={p} /> {roleText(p)}
            </small>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-[26px] max-[600px]:gap-4">
          <Rings f={f} size="lg" />
          <RingLines big>
            <RingLine
              f={f}
              k="del"
              big
              extra={
                f.del && f.del.n < f.del.of ? (
                  <>
                    {' '}
                    <Late>{t('{n} late', { n: f.del.of - f.del.n })}</Late>
                  </>
                ) : undefined
              }
            />
            <RingLine f={f} k="att" big />
            <RingLine
              f={f}
              k="hand"
              big
              extra={
                hasRateWords(tf) ? (
                  <em className="mt-0.5 block font-medium text-ink-2 not-italic">
                    <RateWords tf={tf} />
                  </em>
                ) : undefined
              }
            />
          </RingLines>
        </div>
        <StatsRow>
          <Stat
            k={k('overdue')}
            n={tf.overdue.length}
            label={t(METRIC.overdue ?? '')}
            hint={t('Right now')}
            bad={tf.overdue.length > 0}
          />
          <Stat k={k('signoff')} n={tf.signoff.length} label={t(METRIC.signoff ?? '')} hint={t('Not counted yet')} />
          <Stat k={k('blockers')} n={tf.blockers.length} label={t(METRIC.blockers ?? '')} hint={t('Right now')} />
          <Stat k={k('offers')} n={tf.offers.length} label={t(METRIC.offers ?? '')} />
        </StatsRow>
      </Hero>
      <SectionHeading as="h2" count={null}>
        {t('Task delivery')}
        {sh}
      </SectionHeading>
      <PairBars pid={id} P={P} />
      <NoteLine>{t('Counts only work recorded in dwdg’ONE. Task counts are never a grade.')}</NoteLine>
      <SectionHeading as="h2">
        {t('Handed-in work')}
        {sh}
      </SectionHeading>
      <RateTracks tf={tf} pid={id} P={P} />
      <NoteLine>{t('Ratings come from the person who gave the task, when they accept the work.')}</NoteLine>
      <SectionHeading as="h2" count={af ? af.regs.length : null}>
        {t('Weekly meeting attendance')}
        {af && af.drafts > 0 && (
          <span className="ml-[9px] font-normal text-mute type-small">
            {plural(af.drafts, '{n} register not finalized', '{n} registers not finalized')}
          </span>
        )}
      </SectionHeading>
      {af ? (
        <div className={box}>
          <AttendanceDots regs={[...af.regs]} who={p.first} />
        </div>
      ) : (
        <Empty title={t('Unknown')}>{t('HR records are not available yet.')}</Empty>
      )}
      <NoteLine>{t('Absence reasons are private and never shown here.')}</NoteLine>
      <SectionHeading as="h2" count={cycles.length || null}>
        {t('14-day HR cycles')}
      </SectionHeading>
      {cycles.length ? (
        <div className={box}>
          <Cycles pid={id} cycles={cycles} />
        </div>
      ) : (
        <Empty title={t('Unknown')}>
          {t('{who} is not in a 14-day cycle yet. Results stay Unknown until HR finalizes one.', { who: p.first })}
        </Empty>
      )}
      <NoteLine>
        {t(
          'Results come from HR’s finalized cycles. The rubric is proposed and not adopted yet. Support and development details stay with HR.',
        )}
      </NoteLine>
    </Page>
  );
}
