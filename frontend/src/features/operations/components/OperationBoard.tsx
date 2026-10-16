/* Operations (owner, 6 Oct round 13; D31 work_routines): work that keeps a division running, week after week. The board shows
   this week's runs and each routine's rhythm on one shared time axis. Each run is still its own task. From screens/work.js opsBoard. */
import { Link } from 'react-router';
import { DIVS, divisionOf } from '@/app/config/org';
import { go } from '@/app/router/navigation';
import { Avatar } from '@/components/shared/Avatar';
import { RoutineObject } from '@/components/shared/art/objects';
import { LineGlyph } from '@/components/shared/art/task-icons';
import { Button, segButtonClass, segClass } from '@/components/ui/Button';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { Empty, Page, PageHeader } from '@/components/ui/page';
import { canCreateProject } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { look, setSession } from '@/lib/session';
import { addDays, daysBetween, dShort, today, weekStart } from '@/lib/time';
import { openTask } from '@/lib/open';
import { useMe, useSession, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { toggleGroupByProgram, useGroupByProgram } from '@/features/programs/components/ProgramGroups';
import { PG_D } from '@/features/programs/services/programs';
import { isHigh } from '@/features/projects/services/register';
import { canEditTask, isDone } from '@/features/work/services/selectors';
import { canSignOff } from '@/features/work/services/signoff';
import { setStatus } from '@/features/work/services/task-actions';
import type { Routine, Task } from '@/types/workspace';
import { nextTurn, rtOf, runDate, runState } from '../services/routines';
import { RunWord, Rhythm, RhythmLegend, type RhythmItem } from './Rhythm';

type Scope = 'unit' | 'mine' | 'all';

export function WeekRow({ task }: { task: Task }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const r = rtOf(db, task.routine);
  if (!r || !me) return null;
  const st = runState(task);
  const cl = task.checklist ?? [];
  const n = cl.filter((c) => c.done).length;
  const mine = task.owner === me.id;
  const late = st === 'miss';
  const can =
    (canEditTask(db, me, task) || canSignOff(db, me, task)) &&
    !isDone(task) &&
    (task.status !== 'review' || canSignOff(db, me, task));
  const nx = nextTurn(db, r, task.occ);
  const first = (id: string) => db.people.find((p) => p.id === id)?.first ?? '';
  return (
    <div
      className={cn(
        'flex min-h-[58px] cursor-pointer items-center gap-3 px-3.5 py-2 not-first:shadow-[inset_0_1px_0_var(--line)] hover:bg-hover comfortable:min-h-[60px] comfortable:px-4',
      )}
      role="button"
      tabIndex={0}
      onClick={() => {
        openTask(task.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) openTask(task.id);
      }}
    >
      {can ? (
        <button
          type="button"
          className="group/tick grid size-6 flex-none place-items-center border-0 bg-transparent p-0"
          aria-label={t('Mark done')}
          onClick={(e) => {
            e.stopPropagation();
            void setStatus(task.id, 'done', e.currentTarget);
          }}
        >
          <span className="inline-grid size-[18px] place-items-center rounded-[6px] bg-surface shadow-[inset_0_0_0_1.5px_var(--line-strong)] group-hover/tick:shadow-[inset_0_0_0_1.5px_var(--green)] comfortable:size-[22px] comfortable:rounded-[7px] comfortable:bg-pill comfortable:shadow-[inset_0_0_0_1px_rgb(22_22_21/6%)]" />
        </button>
      ) : (
        <span className="grid size-6 flex-none place-items-center">
          <span
            className={cn(
              'inline-grid size-[18px] place-items-center rounded-[6px] bg-surface shadow-[inset_0_0_0_1.5px_var(--line-strong)] comfortable:size-[22px] comfortable:bg-pill comfortable:shadow-none',
              isDone(task) && 'bg-green-ink',
            )}
          >
            {isDone(task) && <Icon name="check" size="xs" className="text-surface" />}
          </span>
        </span>
      )}
      <RoutineObject routine={r} size="sm" />
      <span className="grid min-w-0 flex-1">
        <b className={cn('truncate font-medium comfortable:text-[16px]', isDone(task) && 'text-mute line-through')}>
          {r.name}
        </b>
        <small className="flex flex-wrap items-center gap-x-2 text-d12h text-mute comfortable:text-[14px]">
          <Avatar id={task.owner} size="xs" />
          {mine ? <strong className="font-semibold text-green-ink">{t('Your turn')}</strong> : first(task.owner)}
          {nx && <span>{t('then {who}', { who: nx === me.id ? t('you') : first(nx) })}</span>}
          {cl.length > 0 && <span>{t('{d} of {n} steps', { d: n, n: cl.length })}</span>}
        </small>
      </span>
      {(st === 'rev' || st === 'done' || st === 'late') && <RunWord b={{ st, t: task }} />}
      <span
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-full bg-fill px-2.5 text-d12h text-ink-2 type-num comfortable:h-[30px] comfortable:bg-pill comfortable:text-[14px]',
          late && 'text-danger',
        )}
      >
        <Icon name="clock" size="xs" />
        {late ? t('Overdue {n}d', { n: daysBetween(task.due ?? '', today()) }) : dShort(runDate(task))}
      </span>
    </div>
  );
}

export function OperationBoard() {
  const me = useMe();
  const w = useWs();
  const lk = useSession((s) => look(s));
  const scopeRaw = useSession((s) => s.oscope as Scope | undefined);
  const byProgram = useGroupByProgram('operations');
  const db = useWorkspace((x) => x);
  if (!me) return null;
  const high = isHigh(me);
  const sc: Scope =
    scopeRaw && ['unit', 'mine', 'all'].includes(scopeRaw) && (scopeRaw !== 'all' || high) ? scopeRaw : 'unit';
  const all = db.routines ?? [];
  const unitRs = (u: string) => all.filter((r) => !r.personal && r.unit === u);
  const mine = all.filter((r) => r.personal && r.owners.includes(me.id));
  let rs: Routine[] = sc === 'unit' ? unitRs(w) : sc === 'mine' ? mine : DIVS.flatMap((d) => unitRs(d.id));
  if (sc !== 'all') rs = [...rs].sort((a, b) => Number(a.paused) - Number(b.paused));
  const ids = new Set(rs.map((r) => r.id));
  const we = addDays(weekStart(today()), 6);
  const canNew = sc === 'mine' || canCreateProject(me, w);
  const week = db.tasks
    .filter(
      (x) =>
        !!x.routine &&
        ids.has(x.routine) &&
        !x.trashed &&
        ((!isDone(x) && runDate(x) <= we) || (runDate(x) >= weekStart(today()) && runDate(x) <= we)),
    )
    .sort(
      (a, b) =>
        Number(isDone(a)) - Number(isDone(b)) ||
        (a.owner === me.id ? -1 : 0) - (b.owner === me.id ? -1 : 0) ||
        (a.due ?? '').localeCompare(b.due ?? ''),
    );
  const short = divisionOf(w)?.short ?? '';
  const scopes: [Scope, string, number][] = [
    ['unit', short, unitRs(w).length],
    ['mine', t('Your repeating tasks'), mine.length],
    ...(high
      ? ([['all', t('All divisions'), all.filter((r) => !r.personal).length]] as [Scope, string, number][])
      : []),
  ];
  const comfortable = lk === 'comfortable';
  const sub =
    sc === 'mine'
      ? t('Tasks of your own that come back on a schedule')
      : sc === 'all'
        ? t('Every division’s recurring work')
        : t('Work that keeps {d} running, week after week', { d: divisionOf(w)?.name ?? '' });
  const items: RhythmItem[] = (() => {
    if (sc !== 'all' && byProgram) {
      const gs = (db.programs ?? []).filter((g) => rs.some((r) => r.program === g.id));
      const out: RhythmItem[] = [];
      for (const g of gs)
        rs.filter((r) => r.program === g.id).forEach((r, i) =>
          out.push({
            r,
            head:
              i === 0 ? (
                <h3 className="mt-[18px] flex items-center gap-2 pb-2 text-d12h font-[650] text-ink-2">
                  <Link
                    to={`/programs/${g.id}`}
                    className="inline-flex items-center gap-2 text-inherit no-underline hover:underline"
                  >
                    <LineGlyph d={PG_D} className="size-4" />
                    {g.name}
                  </Link>
                  <small className="ml-2 font-normal text-mute">{db.people.find((p) => p.id === g.owner)?.first}</small>
                </h3>
              ) : null,
          }),
        );
      rs.filter((r) => !r.program || !gs.some((g) => g.id === r.program)).forEach((r, i) =>
        out.push({
          r,
          head:
            i === 0 && gs.length ? (
              <h3 className="mt-[18px] pb-2 text-d12h font-[650] text-ink-2">{t('Not in a program')}</h3>
            ) : null,
        }),
      );
      return out;
    }
    if (sc === 'all') {
      let last = '';
      return rs.map((r) => {
        const head =
          r.unit && r.unit !== last ? (
            <h3 className="mt-[18px] flex items-center gap-2 pb-2 text-d12h font-[650] text-ink-2">
              <BrandIcon id={divisionOf(r.unit)?.icon ?? ''} label={false} className="size-4" />
              {divisionOf(r.unit)?.name}
            </h3>
          ) : null;
        last = r.unit ?? last;
        return { r, head };
      });
    }
    return rs.map((r) => ({ r }));
  })();
  const newBtn =
    sc === 'mine' ? (
      <Button
        variant="primary"
        onClick={() => {
          go('operations/new/personal');
        }}
      >
        <Icon name="plus" />
        {t('New repeating task')}
      </Button>
    ) : canCreateProject(me, w) ? (
      <Button
        variant="primary"
        onClick={() => {
          go('operations/new');
        }}
      >
        <Icon name="plus" />
        {t('New routine')}
      </Button>
    ) : null;
  return (
    <Page wide canvas={comfortable} data-page="operations">
      <PageHeader title={t('Operations')} sub={sub} className={cn(comfortable && 'px-1')}>
        {newBtn}
      </PageHeader>
      <div className="mt-4 mb-1 flex flex-wrap items-center gap-2">
        <div
          className={cn(segClass, 'comfortable:rounded-[20px] comfortable:bg-[rgb(22_22_21/5%)] comfortable:p-[3px]')}
          role="radiogroup"
          aria-label={t('Which routines')}
        >
          {scopes.map(([k, l, n]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={sc === k}
              className={cn(
                segButtonClass(sc === k),
                'comfortable:rounded-[17px] comfortable:aria-checked:shadow-card',
              )}
              onClick={() => {
                setSession({ oscope: k });
              }}
            >
              {l}
              <span className="ml-1.5 font-medium text-mute">{n}</span>
            </button>
          ))}
        </div>
        <span className="flex-1" />
        {rs.length > 0 && sc !== 'all' && (
          <Button
            aria-pressed={byProgram}
            className={cn(byProgram && 'bg-ink text-on-ink [&_.ic]:text-on-ink')}
            onClick={() => {
              toggleGroupByProgram('operations');
            }}
          >
            <LineGlyph d={PG_D} />
            {t('Group by program')}
          </Button>
        )}
      </div>
      {rs.length ? (
        <>
          <h2 className="mt-1.5 mb-3.5 flex items-baseline gap-2 text-[15px] type-h3 comfortable:mx-1.5">
            {t('This week')} <span className="text-faint type-num">{week.length}</span>
            <small className="ml-auto text-d12h font-[450] text-mute max-[760px]:hidden">
              {dShort(weekStart(today()))} – {dShort(we)}
            </small>
          </h2>
          {week.length ? (
            <div className="overflow-hidden rounded-sheet bg-surface shadow-[0_0_0_1px_var(--line-strong)] comfortable:rounded-card comfortable:shadow-card">
              {week.map((x) => (
                <WeekRow key={x.id} task={x} />
              ))}
            </div>
          ) : (
            <p className="mb-1 text-mute type-small">{t('Nothing due this week.')}</p>
          )}
          <h2 className="mt-[30px] mb-3.5 flex items-baseline gap-2 border-t border-line pt-[22px] text-[15px] type-h3 comfortable:mx-1.5">
            {t('Rhythm')}
            <small className="ml-auto text-d12h font-[450] text-mute max-[760px]:hidden">
              {t('Each dot is one run, with the person whose turn it was')}
            </small>
          </h2>
          <div className="rounded-sheet px-1 comfortable:rounded-card comfortable:bg-surface comfortable:px-4 comfortable:pb-3 comfortable:shadow-card">
            <Rhythm items={items} />
            <RhythmLegend />
          </div>
        </>
      ) : sc === 'mine' ? (
        <Empty title={t('Nothing repeats yet')} className="mt-[18px]">
          {t('Make a task of your own come back every week or month, like reviewing your tasks on Friday.')}
          <Button
            className="mt-3"
            onClick={() => {
              go('operations/new/personal');
            }}
          >
            <Icon name="plus" />
            {t('New repeating task')}
          </Button>
        </Empty>
      ) : (
        <Empty title={t('No routines yet')} className="mt-[18px]">
          {t(
            'A routine is work that comes back on a schedule: posting content every week, a report every month. Each time it comes round, the person whose turn it is gets their own task.',
          )}
          {canNew ? (
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => {
                go('operations/new');
              }}
            >
              <Icon name="plus" />
              {t('New routine')}
            </Button>
          ) : (
            <span className="mt-2 block text-mute type-small">
              {t('Co-directors and above set up routines for a division. You can repeat a task of your own.')}
            </span>
          )}
        </Empty>
      )}
    </Page>
  );
}
