/* The ways the Projects register shows a project: a row (76px, two lines when narrow), a card whose picture rises out of its
   pocket on hover, and the timeline from start to target. From screens/plan.js (prow, pcard pc3, projectTimeline). */
import type { KeyboardEvent, ReactNode } from 'react';
import { go } from '@/app/router/navigation';
import { divisionOf } from '@/app/config/org';
import { ProjectObject } from '@/components/shared/art/objects';
import { Stage } from '@/components/ui/StatusBadge';
import { Empty } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { pal } from '@/lib/art/identity';
import { MON, plural, t } from '@/lib/i18n';
import { D, addDays, dLong, dShort, daysBetween, iso, today } from '@/lib/time';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { DivisionId, Project, Workspace } from '@/types/workspace';
import { DivChips } from '@/features/collaboration/components/Faces';
import { cpDivs } from '@/features/collaboration/services/collaboration';
import { ENDED, msLateOf, projMs } from '../services/project-rules';
import { isLate, pStats } from '../services/register';
import { AttnCell, LeadCell, MsCell, OriginTag, Progress } from './Cells';

const open = (id: string) => {
  go(`projects/${id}`);
};
const activate = (id: string) => (e: KeyboardEvent) => {
  if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    open(id);
  }
};

const GRID_COLS = 'grid-cols-[minmax(0,2.3fr)_minmax(0,1.1fr)_120px_minmax(0,1.5fr)_minmax(0,1.3fr)_64px] gap-3';
const ORG_COLS = 'grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)_minmax(0,1.6fr)_minmax(0,1fr)_118px] gap-3';

/** The column heads above the rows; hidden when the box is narrow and rows become two lines. */
export function RowHeads() {
  return (
    <div
      className={cn(
        'grid px-4 pt-3 pb-1 text-mute type-caption @max-[760px]/prows:hidden comfortable:mt-[18px] comfortable:pt-0 comfortable:pb-0',
        GRID_COLS,
      )}
    >
      <span>{t('Project')}</span>
      <span>{t('Lead')}</span>
      <span>{t('Progress')}</span>
      <span>{t('Next milestone')}</span>
      <span>{t('Needs attention')}</span>
      <span className="text-right">{t('Target')}</span>
    </div>
  );
}

/** The rows' frame: it knows its own width, so a narrow box makes each row two lines. */
export const RowsBox = ({ children }: { children: ReactNode }) => <div className="@container/prows">{children}</div>;

const rowShell =
  "relative grid min-h-[76px] cursor-pointer roomy:min-h-[84px] items-center rounded-ctl px-4 py-3 hover:bg-hover comfortable:rounded-none [&+&]:before:absolute [&+&]:before:inset-x-4 [&+&]:before:-top-0.5 [&+&]:before:h-px [&+&]:before:bg-line [&+&]:before:content-['']";

const NameCell = ({ p, sub }: { p: Project; sub: ReactNode }) => (
  <div className="flex min-w-0 items-center gap-3.5 @max-[760px]/prows:[grid-area:pn]">
    <ProjectObject project={p} />
    <span className="min-w-0">
      <b className="block truncate font-semibold">{p.name}</b>
      <small className="block truncate text-d12h text-mute">{sub}</small>
    </span>
  </div>
);

export function ProjectRow({
  p,
  w,
  scoped,
  selected,
}: {
  p: Project;
  w: DivisionId;
  scoped: boolean;
  selected?: boolean;
}) {
  const created = useWorkspace((db) => db.people.find((q) => q.id === p.createdBy)?.first ?? '');
  const late = isLate(p);
  return (
    <div
      className={cn(
        rowShell,
        GRID_COLS,
        '@max-[760px]/prows:grid-cols-[minmax(0,1fr)_minmax(0,.8fr)_minmax(0,1.3fr)_auto] @max-[760px]/prows:gap-x-3.5 @max-[760px]/prows:gap-y-2 @max-[760px]/prows:px-3.5 @max-[760px]/prows:[grid-template-areas:"pn_pn_pn_end"_"a_b_c_d"]',
        '@max-[480px]/prows:grid-cols-[minmax(0,1fr)_auto] @max-[480px]/prows:[grid-template-areas:"pn_end"_"a_b"_"c_d"]',
        selected && 'bg-sel',
      )}
      role="link"
      tabIndex={0}
      onClick={() => {
        open(p.id);
      }}
      onKeyDown={activate(p.id)}
    >
      <NameCell
        p={p}
        sub={
          <>
            {(scoped || p.div !== w || p.org) && (
              <span className="mr-1.5">
                <OriginTag p={p} w={w} />
              </span>
            )}
            {t('Created by {who}, {date}', { who: created, date: dShort(p.createdAt.slice(0, 10)) })}
          </>
        }
      />
      <div className="min-w-0 @max-[760px]/prows:[grid-area:a] [&_span:last-child]:min-w-0">
        <LeadCell p={p} />
      </div>
      <div className="@max-[760px]/prows:[grid-area:b]">
        <Progress p={p} />
      </div>
      <div className="min-w-0 @max-[760px]/prows:[grid-area:c]">
        <MsCell p={p} />
      </div>
      <div className="@max-[760px]/prows:justify-self-end @max-[760px]/prows:[grid-area:d]">
        <AttnCell p={p} />
      </div>
      <span className={cn('text-right text-ink-2 type-num @max-[760px]/prows:[grid-area:end]', late && 'text-danger')}>
        {p.due ? dShort(p.due) : <span className="text-mute">–</span>}
      </span>
    </div>
  );
}

/** The row on the Organization page: every division's active projects together (no progress column). */
export function OrgProjectRow({ p }: { p: Project }) {
  return (
    <div
      className={cn(
        rowShell,
        ORG_COLS,
        '@max-[760px]/prows:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto] @max-[760px]/prows:gap-x-3.5 @max-[760px]/prows:gap-y-2 @max-[760px]/prows:px-3.5 @max-[760px]/prows:[grid-template-areas:"pn_pn_end"_"a_b_c"]',
        '@max-[480px]/prows:grid-cols-[minmax(0,1fr)_auto] @max-[480px]/prows:[grid-template-areas:"pn_end"_"a_a"_"b_c"]',
      )}
      role="link"
      tabIndex={0}
      onClick={() => {
        open(p.id);
      }}
      onKeyDown={activate(p.id)}
    >
      <NameCell p={p} sub={divisionOf(p.div)?.short} />
      <div className="min-w-0 @max-[760px]/prows:[grid-area:a]">
        <LeadCell p={p} />
      </div>
      <div className="min-w-0 @max-[760px]/prows:[grid-area:b]">
        <MsCell p={p} />
      </div>
      <div className="@max-[760px]/prows:justify-self-end @max-[760px]/prows:[grid-area:c]">
        <AttnCell p={p} />
      </div>
      <span className="justify-self-end @max-[760px]/prows:[grid-area:end]">
        <Stage stage={p.stage} />
      </span>
    </div>
  );
}

export function ProjectCard({
  p,
  w,
  scoped,
  selected,
}: {
  p: Project;
  w: DivisionId;
  scoped: boolean;
  selected?: boolean;
}) {
  const c = pal(p.look?.p ?? 0);
  const late = isLate(p);
  const goal = p.goal;
  return (
    <div
      className={cn(
        'group/pc3 flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_var(--line-strong)] transition-[transform,box-shadow] duration-[240ms] ease-[cubic-bezier(.2,.7,.2,1)]',
        'hover:-translate-y-[3px] hover:shadow-[0_0_0_1px_var(--line-strong),0_14px_30px_-14px_rgb(22_22_21/30%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0 comfortable:rounded-card comfortable:shadow-card comfortable:hover:shadow-[var(--cs-card),0_14px_30px_-14px_rgb(22_22_21/26%)]',
        selected && 'shadow-[0_0_0_1.5px_var(--ink)]',
      )}
      style={{ ['--tint' as string]: c[3] }}
      role="link"
      tabIndex={0}
      aria-label={p.name}
      onClick={() => {
        open(p.id);
      }}
      onKeyDown={activate(p.id)}
    >
      <div className="relative mx-1.5 mt-1.5 h-32 overflow-hidden rounded-xl bg-[radial-gradient(130%_120%_at_0%_100%,color-mix(in_srgb,var(--tint)_62%,var(--surface)),color-mix(in_srgb,var(--tint)_16%,var(--surface))_70%)] comfortable:mx-2 comfortable:mt-2 comfortable:rounded-[13px]">
        <ProjectObject project={p} size="cover" />
        <div className="absolute top-2.5 right-2.5 grid justify-items-end gap-1.5">
          {(scoped || p.div !== w || p.org) && (
            <span className="[&>span]:bg-[color-mix(in_srgb,var(--surface)_82%,transparent)]">
              <OriginTag p={p} w={w} />
            </span>
          )}
          <span
            className={cn(
              'rounded-full bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] px-2 py-0.5 text-d12 text-ink-2 type-num',
              late && 'text-danger',
            )}
            title={t('Target')}
          >
            {p.due ? dShort(p.due) : t('No target')}
          </span>
        </div>
      </div>
      <div className="grid min-w-0 flex-1 grid-rows-[auto_auto_auto_auto_1fr] gap-2 px-4 py-3.5 comfortable:pb-4">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <Stage stage={p.stage} />
          {p.start && <span className="text-d12 text-mute type-num">{t('from {d}', { d: dShort(p.start) })}</span>}
        </div>
        <b className="text-d16 leading-[22px] font-semibold comfortable:text-d18 comfortable:leading-6">{p.name}</b>
        <p className="m-0 line-clamp-2 min-h-10 text-d13 leading-5 text-ink-2 comfortable:min-h-11 comfortable:text-d15 comfortable:leading-[22px] comfortable:text-mute">
          {goal || <span className="text-mute">{t('No goal written yet.')}</span>}
        </p>
        <div className="grid gap-2.5 border-t border-line pt-2.5">
          <Progress p={p} wide />
          <MsCell p={p} />
        </div>
        <div className="flex min-h-7 min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1.5 self-end">
          <LeadCell p={p} inline />
          <DivChipsOf p={p} />
          <AttnCell p={p} className="justify-end" />
        </div>
      </div>
    </div>
  );
}

function DivChipsOf({ p }: { p: Project }) {
  const ds = useWorkspace((db) => cpDivs(db, 'project', p));
  return <DivChips ds={ds} className="ml-1" />;
}

export const CardGrid = ({ children }: { children: ReactNode }) => (
  <div className="mt-1.5 grid grid-cols-[repeat(auto-fill,minmax(min(100%,236px),1fr))] gap-4 [&>*]:min-w-0">
    {children}
  </div>
);

// ---------- timeline ----------

/** Planned start to target. Missing dates are listed, never drawn (timeline_unscheduled). */
export function RegisterTimeline({ list }: { list: Project[] }) {
  const db = useWorkspace((w) => w);
  const dated = list.filter((p) => p.start && p.due);
  const undated = list.filter((p) => !(p.start && p.due));
  const noDates = (hint: boolean) =>
    undated.length > 0 && (
      <>
        <h2 className="mt-[22px] mb-2 border-t border-line-strong pt-[18px] type-h3">
          {t('No dates')} {hint && <span className="ml-1 text-mute type-num">{undated.length}</span>}
        </h2>
        <div className="flex flex-col gap-[3px]">
          {undated.map((p) => (
            <div
              key={p.id}
              className="flex min-h-[var(--row-h)] cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover"
              role="link"
              tabIndex={0}
              onClick={() => {
                open(p.id);
              }}
              onKeyDown={activate(p.id)}
            >
              <div className="min-w-0 flex-1">
                {p.name}
                {hint && (
                  <small className="block text-d12h text-mute">
                    {t('Add a start and target date to place it on the timeline.')}
                  </small>
                )}
              </div>
              <Stage stage={p.stage} />
            </div>
          ))}
        </div>
      </>
    );
  if (!dated.length)
    return (
      <>
        <div className="px-2.5 py-3 text-d13h text-mute">{t('No project has both a start and a target date.')}</div>
        {noDates(false)}
      </>
    );
  const sorted = (xs: (string | null)[]) => xs.filter((x): x is string => !!x).sort();
  const lo = D(sorted(dated.map((p) => p.start))[0] ?? today());
  lo.setDate(1);
  const lo0 = iso(lo);
  const hiD = D(addDays(sorted(dated.map((p) => p.due)).pop() ?? today(), 10));
  hiD.setMonth(hiD.getMonth() + 1, 0);
  const hi = iso(hiD);
  const span0 = daysBetween(lo0, hi) + 1;
  const pc = (d: string) => Math.max(0, Math.min(100, (daysBetween(lo0, d) / span0) * 100));
  const months: string[] = [];
  for (const d = D(lo0); iso(d) <= hi; d.setMonth(d.getMonth() + 1, 1)) months.push(iso(d));
  const td = today() >= lo0 && today() <= hi;
  return (
    <>
      <div className="relative mt-1.5 overflow-x-auto rounded-sheet bg-surface shadow-[0_0_0_1px_var(--line-strong)] [--lw:260px] max-[760px]:[--lw:132px]">
        <div className="grid h-11 min-w-[540px] grid-cols-[var(--lw)_minmax(0,1fr)] items-stretch shadow-[inset_0_-1px_0_var(--line-strong)]">
          <span className="flex items-center px-3.5 text-mute shadow-[1px_0_0_var(--line-strong)] type-caption">
            {plural(dated.length, '{n} project', '{n} projects')}
          </span>
          <div className="relative min-w-0">
            {months.map((d, i) => (
              <span
                key={d}
                className="absolute top-0 bottom-0 flex flex-col items-start gap-0 overflow-hidden pt-1.5 pl-2 text-d12 leading-[1.15] whitespace-nowrap shadow-[inset_1px_0_0_var(--line)]"
                style={{ left: `${pc(d)}%`, width: `${pc(months[i + 1] ?? addDays(hi, 1)) - pc(d)}%` }}
              >
                <b className="font-semibold">{MON()[D(d).getMonth()]}</b>
                {(!i || D(d).getMonth() === 0) && (
                  <small className="font-mono text-d11 font-medium text-mute">{D(d).getFullYear()}</small>
                )}
              </span>
            ))}
            {td && (
              <i className="absolute top-0 bottom-0 z-[2] -ml-px w-0.5 bg-green" style={{ left: `${pc(today())}%` }}>
                <b className="absolute bottom-1 left-1 rounded-[4px] bg-green px-1.5 text-d10 leading-4 font-semibold whitespace-nowrap text-white not-italic">
                  {t('Today')}
                </b>
              </i>
            )}
          </div>
        </div>
        {dated.map((p) => (
          <TimelineRow key={p.id} p={p} pc={pc} months={months} td={td} db={db} />
        ))}
      </div>
      {noDates(true)}
      <p className="mt-3.5 text-mute type-small">
        {t(
          'Each band runs from start to target in the project’s own color; the darker part is the share of tasks completed. Diamonds below are milestones.',
        )}
      </p>
    </>
  );
}

function TimelineRow({
  p,
  pc,
  months,
  td,
  db,
}: {
  p: Project;
  pc: (d: string) => number;
  months: string[];
  td: boolean;
  db: Workspace;
}) {
  const c = pal(p.look?.p ?? 0);
  const s = pStats(db, p);
  const start = p.start ?? '';
  const due = p.due ?? '';
  const l = pc(start);
  const w = Math.max(0.8, pc(addDays(due, 1)) - l);
  const late = due < today() && !ENDED.includes(p.stage);
  const done = s.total ? (s.done / s.total) * 100 : 0;
  return (
    <div
      className="grid min-h-16 min-w-[540px] cursor-pointer grid-cols-[var(--lw)_minmax(0,1fr)] items-center not-first:shadow-[inset_0_1px_0_var(--line)] first:shadow-none hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring [&:hover_.bar]:scale-y-[1.15]"
      role="link"
      tabIndex={0}
      aria-label={`${p.name}, ${dShort(start)} – ${dShort(due)}`}
      onClick={() => {
        open(p.id);
      }}
      onKeyDown={activate(p.id)}
    >
      <span className="flex h-full min-w-0 items-center gap-3 px-3.5 shadow-[1px_0_0_var(--line-strong)]">
        <ProjectObject project={p} size="sm" className="max-[760px]:hidden" />
        <span className="grid min-w-0 gap-0.5">
          <b className="truncate text-d13h font-semibold">{p.name}</b>
          <Stage stage={p.stage} />
        </span>
      </span>
      <div
        className="relative h-16 min-w-0"
        style={{ ['--a' as string]: c[1], ['--b' as string]: c[2], ['--t' as string]: c[3] }}
      >
        {months.map((d) => (
          <i key={d} className="absolute top-0 bottom-0 w-px bg-line" style={{ left: `${pc(d)}%` }} />
        ))}
        {td && (
          <i className="absolute top-0 bottom-0 z-[2] -ml-px w-0.5 bg-green" style={{ left: `${pc(today())}%` }} />
        )}
        <span
          className={cn(
            'bar absolute top-4 h-[18px] overflow-hidden rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--t)_70%,var(--surface)),color-mix(in_srgb,var(--a)_40%,var(--surface)))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--b)_35%,transparent)] transition-transform duration-200 motion-reduce:transition-none',
            ENDED.includes(p.stage) && 'opacity-70 saturate-[.4]',
          )}
          style={{ left: `${l}%`, width: `${w}%` }}
          title={`${dLong(start)} – ${dLong(due)}. ${s.total ? t('{d} of {n} tasks completed', { d: s.done, n: s.total }) : t('No tasks yet')}`}
        >
          <i
            className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,var(--a),var(--b))] opacity-90"
            style={{ width: `${done}%` }}
          />
        </span>
        <span
          className={cn(
            'absolute top-[17px] text-d11h whitespace-nowrap text-ink-2 type-num max-[760px]:hidden',
            late && 'text-danger',
          )}
          style={l + w > 78 ? { right: `${100 - l + 1}%` } : { left: `calc(${l + w}% + 8px)` }}
        >
          {dShort(start)} – {dShort(due)}
          {s.total ? `, ${s.done}/${s.total}` : ''}
        </span>
        {projMs(db, p)
          .filter((x) => x.target)
          .map((x) => {
            const ok = x.state === 'achieved';
            const lateMs = msLateOf(x);
            return (
              <i
                key={x.id}
                className={cn(
                  'absolute top-[42px] -ml-[4.5px] size-[9px] rotate-45 rounded-[2px] bg-ink-2 shadow-[0_0_0_2px_var(--surface)]',
                  ok && 'bg-green',
                  lateMs && 'bg-danger',
                )}
                style={{ left: `${pc(x.target)}%` }}
                title={`${x.title}, ${dShort(x.target)}${ok ? `, ${t('achieved')}` : lateMs ? `, ${t('overdue')}` : ''}`}
              />
            );
          })}
      </div>
    </div>
  );
}

export const EmptyProjects = ({ title, children }: { title: string; children: string }) => (
  <Empty
    title={title}
    className="comfortable:mt-[18px] comfortable:rounded-card comfortable:bg-surface comfortable:shadow-card"
  >
    {children}
  </Empty>
);
