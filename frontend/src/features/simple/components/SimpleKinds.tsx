/* Programs and Operations in the Simple look (D63): a program is a stack of projects and operations that share one aim; an
   operation is work that comes back on a schedule, shown with whose turn it is. The three kinds keep their pictures (a folder,
   a stack, a ring). From screens/simple.js sPrograms, sProgramPage, sOperations. */
import { Link } from 'react-router';
import { Avatar } from '@/components/shared/Avatar';
import { Icon } from '@/components/ui/Icon';
import { NotAvailable, Page as DsPage } from '@/components/ui/page';
import { plural, t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { addDays, dLong, dShort, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { isDone, personOf } from '@/features/work/services/selectors';
import { canSeeProgram, pgKids, pgPeriod } from '@/features/programs/services/programs';
import { pgDivs } from '@/features/collaboration/services/collaboration';
import { DoneButton } from '@/features/operations/components/OperationDetail';
import { Rhythm } from '@/features/operations/components/Rhythm';
import { canSeeRt } from '@/features/operations/services/access';
import { cadText, nextTurn, rtBeats, rtOf, runDate } from '@/features/operations/services/routines';
import { TaskTimeline } from '@/features/work/components/TaskTimeline';
import { visibleDivs } from '@/lib/access';
import { divisionOf } from '@/app/config/org';
import type { Routine } from '@/types/workspace';
import {
  Card,
  Empty,
  KindSwitch,
  Page,
  PageHead,
  ProgramObject,
  ProjectObject,
  RoutineObject,
  Section,
  ViewSeg,
  canSee,
  useRememberKind,
  useSimpleView,
} from './parts';

function ProjectTile({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const p = db.projects.find((x) => x.id === id);
  if (!p) return null;
  const s = db.tasks.filter((x) => x.project === p.id && !x.trashed);
  return (
    <Link
      to={`/projects/${p.id}`}
      className="flex flex-col gap-3.5 rounded-2xl bg-surface p-5 text-inherit no-underline shadow-sheet transition-shadow hover:shadow-pop"
    >
      <div className="flex items-center gap-3">
        <ProjectObject project={p} size="sm" />
        <h3 className="m-0 min-w-0 flex-1 type-h3">{p.name}</h3>
      </div>
      {p.goal && <p className="m-0 line-clamp-2 text-ink-2 type-small">{p.goal}</p>}
      <span className="text-mute type-small">
        {t('{d} of {n} tasks done', { d: s.filter(isDone).length, n: s.length })}
      </span>
    </Link>
  );
}

function RoutineCard({ r }: { r: Routine }) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const nx = rtBeats(db, r, today(), addDays(today(), 120)).find((b) => b.st !== 'skip' && !(b.t && isDone(b.t)));
  const who = nx ? (nx.owner ?? nx.t?.owner) : null;
  return (
    <Link
      to={`/operations/${r.id}`}
      className="flex flex-col gap-3.5 rounded-2xl bg-surface p-5 text-inherit no-underline shadow-sheet transition-shadow hover:shadow-pop"
    >
      <div className="flex items-center gap-3">
        <RoutineObject routine={r} size="sm" />
        <h3 className="m-0 min-w-0 flex-1 type-h3">{r.name}</h3>
        {r.paused && <span className="text-[14px] font-semibold text-st-hold">{t('Paused')}</span>}
      </div>
      <p className="m-0 line-clamp-1 text-ink-2 type-small">{cadText(r)}</p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5 type-small">
        {nx ? (
          <>
            <span className="inline-flex items-center gap-2 text-ink">
              {who && <Avatar id={who} size="sm" className="size-7" />}
              {who === me?.id ? t('Your turn') : who ? (personOf(db, who)?.name ?? '') : ''}
            </span>
            <span className="text-mute">{nx.d === today() ? t('Today') : t('Next {d}', { d: dShort(nx.d) })}</span>
          </>
        ) : (
          <span className="text-mute">{t('Nothing coming up')}</span>
        )}
      </div>
    </Link>
  );
}

const grid =
  'grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 max-[899px]:grid-cols-[minmax(0,1fr)] max-[899px]:gap-3';

export function SimplePrograms() {
  const db = useWorkspace((w) => w);
  const me = useMe();
  useRememberKind('programs');
  if (!me) return null;
  const gs = (db.programs ?? []).filter((g) => canSeeProgram(me, g) && g.state !== 'archived');
  return (
    <Page>
      <KindSwitch cur="programs" />
      <PageHead title={t('Programs')} sub={t('Projects and operations that share one aim')} />
      {gs.length ? (
        <div className={grid}>
          {gs.map((g) => {
            const k = pgKids(db, g);
            return (
              <Link
                key={g.id}
                to={`/programs/${g.id}`}
                className="grid justify-items-start gap-1 rounded-2xl bg-surface p-5 text-inherit no-underline shadow-sheet transition-shadow hover:shadow-pop"
              >
                <span className="mb-1.5">
                  <ProgramObject program={g} size="hero" className="h-[68px] w-[76px]" />
                </span>
                <b className="type-h3">{g.name}</b>
                {g.goal && <p className="mt-0.5 mb-1 line-clamp-2 text-ink-2 type-small">{g.goal}</p>}
                <small className="text-mute type-small">
                  {plural(k.ps.length, '{n} project', '{n} projects')},{' '}
                  {plural(k.rs.length, '{n} operation', '{n} operations')}
                </small>
              </Link>
            );
          })}
        </div>
      ) : (
        <Empty title={t('No programs yet')}>
          {t('A program groups projects and operations that share one aim, like a year of partner work.')}
        </Empty>
      )}
    </Page>
  );
}

export function SimpleProgram({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const view = useSimpleView('program');
  useRememberKind('programs');
  const g = (db.programs ?? []).find((x) => x.id === id);
  if (!g || !me || !canSeeProgram(me, g))
    return (
      <DsPage>
        <NotAvailable />
      </DsPage>
    );
  const k = pgKids(db, g);
  const ps = k.ps.filter((p) => canSee(db, me, p));
  const rs = k.rs.filter((r) => canSeeRt(db, me, r));
  const ds = pgDivs(g);
  return (
    <Page>
      <Link
        className="-mt-3 mr-0 mb-1 -ml-2 inline-flex h-11 items-center gap-0.5 rounded-[10px] px-2 text-[16px] font-[550] text-ink-2 no-underline hover:bg-hover [&>.ic]:size-5"
        to="/programs"
      >
        <Icon name="chevron-left" />
        {t('Programs')}
      </Link>
      <Card className="mb-4 grid gap-4 overflow-visible p-6 max-[899px]:p-5">
        <div className="flex items-center gap-3">
          <ProgramObject program={g} size="hero" />
          <div className="min-w-0 flex-1">
            <p className="m-0 mb-0.5 text-mute type-small">{t('Program')}</p>
            <h1 className="m-0 tracking-[-0.02em] type-title">{g.name}</h1>
          </div>
        </div>
        {g.goal && <p className="m-0 text-ink-2 type-body">{g.goal}</p>}
        <dl className="m-0 grid grid-cols-3 gap-3 border-y border-line py-4 max-[600px]:grid-cols-1 [&_dd]:m-0 [&_dd]:mt-1.5 [&_dt]:text-mute [&_dt]:type-small">
          <div>
            <dt>{t('Period')}</dt>
            <dd>{pgPeriod(g)}</dd>
          </div>
          <div>
            <dt>{t('Lead')}</dt>
            <dd>
              {g.owner ? (
                <span className="inline-flex items-center gap-2">
                  <Avatar id={g.owner} size="sm" className="size-7" />
                  {personOf(db, g.owner)?.name}
                </span>
              ) : (
                t('No lead yet')
              )}
            </dd>
          </div>
          <div>
            <dt>{ds.length > 1 ? t('Divisions') : t('Division')}</dt>
            <dd>{ds.map((d) => divisionOf(d)?.name ?? '').join(', ')}</dd>
          </div>
        </dl>
        <Link
          to={`/programs/${g.id}/full`}
          className="flex min-h-14 items-center gap-3 rounded-xl bg-surface-2 px-3.5 py-2.5 text-ink no-underline hover:bg-hover [&>.ic]:size-5 [&>.ic]:text-mute"
        >
          <Icon name="program" />
          <span className="grid flex-1 gap-0.5">
            <b>{t('See the full program')}</b>
            <small className="text-mute type-small">{t('Partners, people and the timeline')}</small>
          </span>
          <Icon name="chevron" />
        </Link>
      </Card>
      {(ps.length > 0 || rs.length > 0) && (
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <span />
          <ViewSeg k="program" />
        </div>
      )}
      {view === 'timeline' ? (
        <Card className="px-4 py-3.5">
          <TaskTimeline tasks={ps.flatMap((p) => db.tasks.filter((x) => x.project === p.id && !x.trashed))} />
        </Card>
      ) : (
        <>
          {ps.length > 0 && (
            <section className="mt-7">
              <h2 className="mx-1 mb-2.5 flex items-baseline gap-2 type-h3">
                {t('Projects')}
                <span className="font-medium text-mute">{ps.length}</span>
              </h2>
              <div className={grid}>
                {ps.map((p) => (
                  <ProjectTile key={p.id} id={p.id} />
                ))}
              </div>
            </section>
          )}
          {rs.length > 0 && (
            <section className="mt-7">
              <h2 className="mx-1 mb-2.5 flex items-baseline gap-2 type-h3">
                {t('Operations')}
                <span className="font-medium text-mute">{rs.length}</span>
              </h2>
              <div className={grid}>
                {rs.map((r) => (
                  <RoutineCard key={r.id} r={r} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
      {!ps.length && !rs.length && (
        <Empty title={t('Nothing in this program yet')}>
          {t('Its lead adds projects and operations from the full program.')}
        </Empty>
      )}
    </Page>
  );
}

export function SimpleOperations() {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const view = useSimpleView('operations');
  useRememberKind('operations');
  if (!me) return null;
  const mine = db.tasks
    .filter(
      (x) =>
        x.routine &&
        !x.trashed &&
        !isDone(x) &&
        x.owner === me.id &&
        runDate(x) <= addDays(today(), 7) &&
        rtOf(db, x.routine),
    )
    .sort((a, b) => runDate(a).localeCompare(runDate(b)));
  const rs = (db.routines ?? [])
    .filter(
      (r) =>
        canSeeRt(db, me, r) &&
        (r.personal ? r.owners.includes(me.id) : visibleDivs(me).includes(r.unit as never) || r.owners.includes(me.id)),
    )
    .sort(
      (a, b) =>
        Number(a.paused) - Number(b.paused) ||
        Number(b.owners.includes(me.id)) - Number(a.owners.includes(me.id)) ||
        a.name.localeCompare(b.name),
    );
  return (
    <Page>
      <KindSwitch cur="operations" />
      <PageHead
        title={t('Operations')}
        sub={t('Work that comes back on a schedule. When it is your turn, it shows here and in My tasks.')}
      />
      {mine.length > 0 && (
        <Section title={t('Your turn')} n={mine.length}>
          {mine.map((x, i) => {
            const r = rtOf(db, x.routine);
            if (!r) return null;
            const cl = x.checklist ?? [];
            const n = cl.filter((c) => c.done).length;
            const late = !!x.due && x.due < today();
            const nt = nextTurn(db, r, x.occ);
            return (
              <div key={x.id} className={i > 0 ? 'border-t border-line' : ''}>
                <div
                  className="flex cursor-pointer flex-wrap items-center gap-3.5 px-4 py-3.5 hover:bg-hover"
                  tabIndex={0}
                  role="button"
                  onClick={() => {
                    openTask(x.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      openTask(x.id);
                    }
                  }}
                >
                  <RoutineObject routine={r} size="hero" className="size-[52px]" />
                  <div className="grid min-w-0 flex-1 gap-0.5">
                    <b className="type-body font-semibold!">{r.name}</b>
                    <span className={late ? 'text-danger type-small' : 'text-mute type-small'}>
                      {late
                        ? t('Was due {d}', { d: dLong(x.due ?? '') })
                        : runDate(x) === today()
                          ? t('Today')
                          : dLong(runDate(x))}
                      {cl.length ? `, ${t('{d} of {n} steps', { d: n, n: cl.length })}` : ''}
                    </span>
                    {nt && (
                      <small className="text-mute type-small">
                        {t('Then {who}', { who: nt === me.id ? t('you') : (personOf(db, nt)?.first ?? '') })}
                      </small>
                    )}
                  </div>
                  <span
                    className="flex-none cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <DoneButton task={x} />
                  </span>
                </div>
              </div>
            );
          })}
        </Section>
      )}
      {rs.length ? (
        <section className="mt-7">
          <h2 className="mx-1 mb-2.5 flex items-center gap-2 type-h3">
            {t('All operations')}
            <span className="font-medium text-mute">{rs.length}</span>
            <span className="ml-auto">
              <ViewSeg k="operations" />
            </span>
          </h2>
          {view === 'timeline' ? (
            <Card className="px-4 py-3.5">
              <p className="m-0 mb-2.5 text-mute type-small">
                {t('Each dot is one run, with the person whose turn it was')}
              </p>
              <Rhythm items={rs.filter((r) => !r.personal).map((r) => ({ r }))} />
            </Card>
          ) : (
            <div className={grid}>
              {rs.map((r) => (
                <RoutineCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <Empty title={t('No operations yet')}>
          {t('An operation is work that comes back on a schedule, like a weekly post or a monthly report.')}
        </Empty>
      )}
    </Page>
  );
}
