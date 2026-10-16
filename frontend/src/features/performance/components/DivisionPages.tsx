/* Division summaries (Board: division level only, D29; also for the VP and the President). From screens/perf.js
   boardSummary and divDetail. */
import { Link, useNavigate } from 'react-router';
import { DIVS, divisionOf, type Division } from '@/app/config/org';
import { Notice } from '@/components/ui/Notice';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { SectionHeading } from '@/components/ui/Headings';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { badgeMask } from '@/components/ui/icon-data';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { isBoard, isPres } from '@/lib/roles';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { ATT_ORDER, asDef, attDef } from '@/features/hr/services/hr-data';
import { METRIC, divFacts, divRing, span2, type DivFacts, type Period } from '../services/facts';
import { perfKey } from '../services/records';
import { hrAll, vpDivs } from '../services/scope';
import {
  Chip,
  Dash,
  Foot,
  NoteLine,
  PeriodSelect,
  RingKeyRow,
  RingLine,
  RingLines,
  Rings,
  Unknown,
  ViewSeg,
  cardSurface,
  ringVars,
  usePerfView,
  usePeriod,
  phClass,
} from './PerfParts';
import { Hero, Stat, StatsRow } from './PersonPage';
import { Num, PerfCrumb } from './TeamPage';
import { openPerfList } from '../services/records';

const DivMark = ({ d, size }: { d: Division; size: 'sm' | 'md' | 'lg' }) => (
  <span
    className={cn(
      'grid flex-none place-items-center bg-surface-2',
      size === 'lg' ? 'size-14 rounded-2xl' : size === 'sm' ? 'size-[30px] rounded-[9px]' : 'size-10 rounded-xl',
    )}
  >
    <BrandIcon
      id={d.icon}
      label={false}
      className={size === 'lg' ? 'size-8' : size === 'sm' ? 'size-[18px]' : 'size-6'}
    />
  </span>
);

const miniTone: Record<string, string> = {
  green: 'text-green-ink',
  warn: 'text-warning-mark',
  ink2: 'text-ink-2',
  danger: 'text-danger',
  mute: 'text-mute',
};

/** The latest finalized HR cycle in a division, as state words with their counts. */
export function HrSummary({ f }: { f: DivFacts }) {
  if (!f.cyc) return <Unknown label={t('Not in a cycle yet')} />;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {['final', 'incomplete', 'exempt', 'none']
        .filter((s) => f.hrC[s])
        .map((s) => {
          const def = asDef(s);
          return (
            <span key={s} className="inline-flex items-center gap-1.5">
              <Chip def={def} />
              <b className="-ml-1.5 font-semibold! type-num">{f.hrC[s]}</b>
            </span>
          );
        })}
    </span>
  );
}

/** Weekly attendance across a division's finalized registers, as icon counts. */
export function AttSummary({ f }: { f: DivFacts }) {
  if (!f.regs) return <Unknown />;
  if (!f.regs.length) return <Unknown label={t('No finalized register')} />;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {ATT_ORDER.filter((s) => f.att[s]).map((s) => {
        const d = attDef(s);
        return (
          <span key={s} className={cn('inline-flex items-center gap-[3px] type-num', miniTone[d[2]])} title={t(d[0])}>
            <i className="size-[13px] bg-current mask-icon" style={{ ['--m' as string]: badgeMask(d[1]) }} />
            <span className="sr-only">{t(d[0])}</span>
            {f.att[s]}
          </span>
        );
      })}
    </span>
  );
}

const tblRow =
  'grid grid-cols-[minmax(170px,1fr)_repeat(6,64px)] items-center gap-2 px-4 py-2.5 text-ink no-underline max-[700px]:grid-cols-3 max-[700px]:gap-y-2';
const cell =
  'text-right text-[length:14px] max-[700px]:grid max-[700px]:text-left max-[700px]:before:text-[length:12.5px] max-[700px]:before:text-mute max-[700px]:before:content-[attr(data-l)]';

function DivisionTable({ P }: { P: Period }) {
  const db = useWorkspace((w) => w);
  const head = [
    t('Division'),
    t('Members'),
    t('Finished'),
    t('On time'),
    t('Overdue now'),
    t('Open blockers'),
    t('Active projects'),
  ];
  return (
    <div className={cn('mt-3 overflow-hidden', cardSurface)} role="table">
      <div className={cn(tblRow, 'pt-3 pb-2 text-[length:12.5px] font-medium text-mute max-[700px]:hidden')} role="row">
        {head.map((h, i) => (
          <span key={h} role="columnheader" className={i === 0 ? 'text-left' : 'text-right'}>
            {h}
          </span>
        ))}
      </div>
      {DIVS.map((d) => {
        const f = divFacts(db, d.id, P);
        const rf = divRing(f);
        const c = (i: number, n: React.ReactNode, bad = false) => (
          <span role="cell" data-l={head[i]} className={cn(cell, bad && '[&_b]:text-danger')}>
            {n}
          </span>
        );
        return (
          <Link
            key={d.id}
            to={`/performance/div/${d.id}`}
            role="row"
            className={cn(tblRow, 'hover:bg-hover [&+&]:shadow-[inset_0_1px_0_var(--line)]')}
          >
            <span role="cell" className="flex min-w-0 items-center gap-2.5 max-[700px]:col-span-full">
              <DivMark d={d} size="sm" />
              <span className="grid">
                <b className="font-semibold">{d.name}</b>
              </span>
            </span>
            {c(1, <Num n={f.ppl.length} />)}
            {c(2, <Num n={f.done.length} />)}
            {c(3, rf.del ? <Num n={rf.del.n} /> : <Dash />)}
            {c(4, <Num n={f.overdue.length} />, f.overdue.length > 0)}
            {c(5, <Num n={f.blockers.length} />)}
            {c(6, <Num n={f.projects.length} />)}
          </Link>
        );
      })}
    </div>
  );
}

const NumBtn = ({ k, n, metric, warn = false }: { k: string; n: number; metric: string; warn?: boolean }) => (
  <button
    type="button"
    className={cn(
      'h-[30px] min-w-[34px] cursor-pointer rounded-ctl border-0 bg-transparent px-2 text-ink type-num hover:bg-fill',
      n === 0 && 'text-mute',
      warn && 'font-semibold text-danger',
    )}
    aria-label={`${t(METRIC[metric] ?? '')}: ${n}`}
    title={t(METRIC[metric] ?? '')}
    onClick={(e) => {
      e.stopPropagation();
      openPerfList(k);
    }}
  >
    {n}
  </button>
);

function DivisionCard({ d, P }: { d: Division; P: Period }) {
  const db = useWorkspace((w) => w);
  const navigate = useNavigate();
  const f = divFacts(db, d.id, P);
  const rf = divRing(f);
  const k = (x: string) => perfKey('d', d.id, x, P.k);
  const go = () => {
    void navigate(`/performance/div/${d.id}`);
  };
  return (
    <article
      className={cn(
        'grid cursor-pointer content-start gap-3 px-4 py-3.5 transition-shadow hover:shadow-[0_0_0_1px_var(--line-strong),0_8px_22px_rgb(22_22_21/8%)]',
        cardSurface,
      )}
      tabIndex={0}
      role="link"
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) go();
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <DivMark d={d} size="md" />
        <span className="grid min-w-0 flex-1">
          <b className="font-semibold">{d.name}</b>
          <small className="text-[length:13.5px] text-mute">{plural(f.ppl.length, '{n} member', '{n} members')}</small>
        </span>
      </div>
      <div className="flex min-w-0 items-center gap-3.5">
        <Rings f={rf} keys={['del', 'att']} />
        <RingLines>
          <RingLine f={rf} k="del" />
          <RingLine f={rf} k="att" />
        </RingLines>
      </div>
      <div className="grid cursor-default grid-cols-4 gap-1.5 max-[600px]:grid-cols-2">
        {(
          [
            ['done', 'Completed', f.done.length],
            ['overdue', 'Overdue now', f.overdue.length],
            ['blockers', 'Open blockers', f.blockers.length],
            ['projects', 'Active projects', f.projects.length],
          ] as [string, string, number][]
        ).map(([x, l, n]) => (
          <span key={x} className="grid justify-items-start gap-px">
            <NumBtn k={k(x)} n={n} metric={x} warn={x === 'overdue' && n > 0} />
            <small className="text-[length:11.5px] leading-tight text-mute">{t(l)}</small>
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 pt-2.5 text-[length:12.5px] text-mute shadow-[inset_0_1px_0_var(--line)]">
        <span>{t('Latest finalized HR cycle')}</span>
        <HrSummary f={f} />
      </div>
    </article>
  );
}

/** The Board's Performance page: division-level summaries only. */
export function BoardSummary() {
  const P = usePeriod();
  const view = usePerfView();
  return (
    <Page wide canvas className={ringVars}>
      <PageHeader
        className={phClass}
        title={t('Division performance')}
        sub={t('Division-level summaries for the Board of Supervisors')}
      >
        <ViewSeg />
        <PeriodSelect />
      </PageHeader>
      <Notice icon="lock" title={<b>{t('Division level only')}</b>}>
        <p>
          {t('Individual results, assessments, absence reasons and private notes stay inside each division and HR.')}
        </p>
      </Notice>
      {view === 'simple' ? (
        <DivisionTable P={P} />
      ) : (
        <>
          <RingKeyRow keys={['del', 'att']} />
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-2.5">
            {DIVS.map((d) => (
              <DivisionCard key={d.id} d={d} P={P} />
            ))}
          </div>
        </>
      )}
      <Foot>
        {t(
          'Counted from the same records each division uses. Unknown means nothing was recorded, not zero. There is no health score.',
        )}
      </Foot>
    </Page>
  );
}

export function DivisionCrumb({ id }: { id: string }) {
  const dv = divisionOf(id);
  return (
    <PerfCrumb
      parts={[
        ['performance', t('Performance')],
        ['', dv?.name ?? t('Not available')],
      ]}
    />
  );
}

export function DivisionDetail({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const P = usePeriod();
  const dv = divisionOf(id);
  const ok =
    !!m &&
    (isBoard(m) ||
      isPres(m) ||
      hrAll(m) ||
      (vpDivs(m) as string[]).includes(id) ||
      m.admin ||
      (m.role === 'director' && m.div === id));
  if (!dv || !m || !ok)
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const f = divFacts(db, id, P);
  const rf = divRing(f);
  const k = (x: string) => perfKey('d', id, x, P.k);
  const st = (x: string, n: number, hint?: string) => (
    <Stat k={k(x)} n={n} label={t(METRIC[x] ?? '')} {...(hint ? { hint } : {})} bad={x === 'overdue' && n > 0} />
  );
  const sh = (s: string) => <span className="ml-[9px] font-normal text-mute type-small">{s}</span>;
  return (
    <Page canvas className={ringVars}>
      <Link
        className="mb-2.5 inline-flex items-center gap-1 py-2 text-[length:14px] font-semibold text-green-ink no-underline"
        to="/performance"
      >
        <Icon name="left" className="size-3" /> {t('Performance')}
      </Link>
      <PageHeader className={phClass} title={dv.name} sub={t('Division summary, {n} members', { n: f.ppl.length })}>
        <PeriodSelect />
      </PageHeader>
      <Hero>
        <div className="flex items-center gap-3">
          <DivMark d={dv} size="lg" />
          <div className="grid gap-0.5">
            <b className="text-[length:17px] font-semibold">{dv.name}</b>
            <small className="text-[length:13.5px] text-mute">{P.label}</small>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-[26px] max-[600px]:gap-4">
          <Rings f={rf} keys={['del', 'att']} size="lg" />
          <RingLines big>
            <RingLine f={rf} k="del" big />
            <RingLine f={rf} k="att" big />
          </RingLines>
        </div>
        <StatsRow>
          {st('done', f.done.length)}
          {st('overdue', f.overdue.length, t('Right now'))}
          {st('blockers', f.blockers.length, t('Right now'))}
          {st('projects', f.projects.length)}
          {st('msLate', f.msLate.length)}
        </StatsRow>
      </Hero>
      <SectionHeading as="h2">
        {t('Latest finalized HR cycle')}
        {f.cyc && sh(span2(f.cyc.start, f.cyc.end))}
      </SectionHeading>
      <div className={cn('px-4 py-3.5', cardSurface)}>
        <HrSummary f={f} />
      </div>
      <SectionHeading as="h2" count={f.regs ? f.regs.length : null}>
        {t('Weekly meeting attendance')}
      </SectionHeading>
      <div className={cn('px-4 py-3.5', cardSurface)}>
        <AttSummary f={f} />
      </div>
      <NoteLine>
        {isBoard(m)
          ? t('Counts only. Individual records stay inside the division and HR.')
          : t('Open a person from Team performance to see the records behind their numbers.')}
      </NoteLine>
    </Page>
  );
}
