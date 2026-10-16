/* Programs (D47, work_programs): an umbrella for related projects and operations, with a goal, an owner and a period. A project or
   operation stands alone or belongs to one program and keeps its own page. Directors and above create programs; Co-Directors place
   their own projects and operations into a program of their division. Progress is counted from the children's records only.
   From screens/plan.js pgList, pgNew, pgPage, pgForm, pgTimeline. */
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import { go } from '@/app/router/navigation';
import type { Route } from '@/app/router/routes';
import { Avatar } from '@/components/shared/Avatar';
import { openMenu } from '@/components/shared/menus';
import { ProgramObject, ProjectObject, RoutineObject } from '@/components/shared/art/objects';
import { Button, IconButton, buttonClass } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { State, Stage } from '@/components/ui/StatusBadge';
import { Empty, NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { pal } from '@/lib/art/identity';
import { MON, plural, t } from '@/lib/i18n';
import { look } from '@/lib/session';
import { D, addDays, dLong, dShort, daysBetween, iso, today } from '@/lib/time';
import { useMe, useSession, useUi, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { DivChips } from '@/features/collaboration/components/Faces';
import { PartnerBlock, PeopleBlock } from '@/features/collaboration/components/PeopleBlock';
import { pgDivs } from '@/features/collaboration/services/collaboration';
import { ArtEdit } from '@/features/looks/components/Looks';
import { PinButton } from '@/features/pins/components/PinButton';
import { Bar } from '@/features/projects/components/Cells';
import { ENDED, canCreateProgram, msLateOf } from '@/features/projects/services/project-rules';
import { pStats } from '@/features/projects/services/register';
import { cadShort, rtBeats } from '@/features/operations/services/routines';
import { rank } from '@/lib/access';
import type { Program } from '@/types/workspace';
import {
  canManageProgram,
  canPlace,
  canSeeProgram,
  deleteProgram,
  pgKids,
  pgOf,
  pgPeriod,
  pgStats,
  saveProgram,
  setProgram,
} from '../services/programs';

export const ProgramsCrumb = ({ route }: { route: Route }) => {
  const ws = useWs();
  const g = useWorkspace((db) => pgOf(db, route.id));
  const div = divisionOf(g?.div ?? ws);
  return (
    <>
      {div?.short}
      <i className="mx-1.5 text-faint not-italic">/</i>
      {route.id && route.id !== 'new' && g ? (
        <>
          <Link to="/programs" className="no-underline">
            {t('Programs')}
          </Link>
          <i className="mx-1.5 text-faint not-italic">/</i>
          <b>{g.name}</b>
        </>
      ) : route.id === 'new' ? (
        <>
          <Link to="/projects" className="no-underline">
            {t('Projects')}
          </Link>
          <i className="mx-1.5 text-faint not-italic">/</i>
          <b>{t('New program')}</b>
        </>
      ) : (
        <b>{t('Programs')}</b>
      )}
    </>
  );
};

export function ProgramsPage({ route }: { route: Route }) {
  if (!route.id) return <ProgramList />;
  if (route.id === 'new') return <NewProgram />;
  return <ProgramPage id={route.id} />;
}

// ---------- list ----------

function ProgramCard({ g, w }: { g: Program; w: string }) {
  const s = useWorkspace((db) => pgStats(db, g));
  const first = useWorkspace((db) => db.people.find((p) => p.id === g.owner)?.first ?? '');
  const c = pal(g.look?.p ?? 0);
  const ended = !!g.end && g.end < today();
  const div = divisionOf(g.div);
  const chip = 'rounded-full bg-[color-mix(in_srgb,var(--surface)_82%,transparent)]';
  return (
    <div
      className="group/pc3 flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_var(--line-strong)] transition-[transform,box-shadow] duration-[240ms] ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-[3px] hover:shadow-[0_0_0_1px_var(--line-strong),0_14px_30px_-14px_rgb(22_22_21/30%)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 comfortable:rounded-card comfortable:shadow-card"
      style={{ ['--tint' as string]: c[3] }}
      data-art-host=""
      role="link"
      tabIndex={0}
      aria-label={g.name}
      onClick={() => {
        go(`programs/${g.id}`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) go(`programs/${g.id}`);
      }}
    >
      <div className="relative mx-1.5 mt-1.5 h-32 overflow-hidden rounded-xl bg-[radial-gradient(130%_120%_at_0%_100%,color-mix(in_srgb,var(--tint)_62%,var(--surface)),color-mix(in_srgb,var(--tint)_16%,var(--surface))_70%)] comfortable:mx-2 comfortable:mt-2 comfortable:rounded-[13px]">
        <ProgramObject program={g} size="cover" />
        <div className="absolute top-2.5 right-2.5 grid justify-items-end gap-1.5">
          {g.div !== w && (
            <span
              className={cn(
                'inline-flex items-center gap-1 py-px pr-[7px] pl-[5px] text-d11h font-[550] text-ink-2',
                chip,
              )}
            >
              <BrandIcon id={div?.icon ?? ''} label={false} className="size-[13px]" />
              {div?.short}
            </span>
          )}
          <span className={cn('px-2 py-0.5 text-d12 text-ink-2 type-num', chip, ended && 'text-danger')}>
            {pgPeriod(g)}
          </span>
        </div>
      </div>
      <div className="grid min-w-0 flex-1 grid-rows-[auto_auto_auto_auto_1fr] gap-2 px-4 py-3.5 comfortable:pb-4">
        <div className="flex items-center justify-between gap-2 text-d13 text-mute">
          {plural(s.ps.length, '{n} project', '{n} projects')}, {plural(s.rs.length, '{n} operation', '{n} operations')}
        </div>
        <b className="text-d16 leading-[22px] font-semibold comfortable:text-d18 comfortable:leading-6">{g.name}</b>
        <p className="m-0 line-clamp-2 min-h-10 text-d13 leading-5 text-ink-2 comfortable:min-h-11 comfortable:text-d15 comfortable:leading-[22px] comfortable:text-mute">
          {g.goal ? g.goal : <span className="text-mute">{t('No goal written yet.')}</span>}
        </p>
        <div className="grid gap-2.5 border-t border-line pt-2.5">
          {s.tAll ? (
            <span className="flex w-full items-center gap-2">
              <span
                className="flex flex-1"
                role="img"
                aria-label={t('{d} of {n} tasks completed', { d: s.tDone, n: s.tAll })}
              >
                <Bar pct={(s.tDone / s.tAll) * 100} />
              </span>
              <span className="text-ink-2 type-num">
                {s.tDone}/{s.tAll}
              </span>
            </span>
          ) : (
            <span className="text-d12h text-mute">{t('No tasks yet')}</span>
          )}
        </div>
        <div className="flex min-h-7 flex-wrap items-center justify-between gap-x-2 gap-y-1.5 self-end">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Avatar id={g.owner} size="xs" />
            <span className="font-medium">
              {first}
              <small className="ml-1.5 text-d12 font-normal text-mute">{t('Lead')}</small>
            </span>
          </span>
          <DivChips ds={pgDivs(g)} className="ml-1" />
          {s.active > 0 && <span className="text-d12h text-mute">{t('{n} active', { n: s.active })}</span>}
        </div>
      </div>
    </div>
  );
}

function ProgramList() {
  const me = useMe();
  const w = useWs();
  const lk = useSession((s) => look(s));
  const gs = useWorkspace((db) => (me ? (db.programs ?? []).filter((g) => canSeeProgram(me, g)) : []));
  if (!me) return null;
  const comfortable = lk === 'comfortable';
  return (
    <Page wide canvas={comfortable} data-page="programs">
      <PageHeader
        title={t('Programs')}
        sub={t('Each program connects related projects and operations under one goal, owner and period.')}
        className={cn(comfortable && 'px-1')}
      >
        {canCreateProgram(me, w) && (
          <Button
            variant="primary"
            onClick={() => {
              go('programs/new');
            }}
          >
            <Icon name="plus" />
            {t('New program')}
          </Button>
        )}
      </PageHeader>
      <div className="mt-[18px]">
        {gs.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,236px),1fr))] gap-4 [&>*]:min-w-0">
            {gs.map((g) => (
              <ProgramCard key={g.id} g={g} w={w} />
            ))}
          </div>
        ) : (
          <Empty title={t('No programs yet')}>
            {canCreateProgram(me, w)
              ? t('Create one to group the projects and operations that serve the same goal.')
              : t('Directors create programs. Projects and operations can still run on their own.')}
          </Empty>
        )}
      </div>
    </Page>
  );
}

// ---------- create and edit ----------

function ProgramForm({ g }: { g: Program | null }) {
  const me = useMe();
  const w = useWs();
  const people = useWorkspace((db) => db.people);
  const div = g?.div ?? w;
  const pool = people
    .filter((p) => p.status === 'active' && (p.div === div || !p.div) && rank(p) >= 2)
    .sort((a, b) => rank(b) - rank(a));
  const [name, setName] = useState(g?.name ?? '');
  const [goal, setGoal] = useState(g?.goal ?? '');
  const [owner, setOwner] = useState(g?.owner ?? me?.id ?? '');
  const [start, setStart] = useState(g ? (g.start ?? '') : today());
  const [end, setEnd] = useState(g?.end ?? '');
  const [errors, setErrors] = useState<{ name?: string; end?: string }>({});
  const submit = () => {
    const e = {
      name: name.trim() ? undefined : t('Give the program a name.'),
      end: start && end && end < start ? t('The end comes before the start.') : undefined,
    };
    setErrors(e);
    if (e.name || e.end) return;
    void saveProgram(
      g?.id ?? '',
      { name: name.trim(), goal: goal.trim(), owner, start: start || null, end: end || null },
      div,
    ).then((id) => {
      if (id) go(`programs/${id}`);
    });
  };
  return (
    <div className="mb-[22px] grid max-w-[760px] gap-1 rounded-2xl bg-surface-2 px-[18px] py-4 shadow-[inset_0_0_0_1px_var(--line)]">
      <Field label={t('Name')} htmlFor="pg-name" required help={errors.name} error>
        <input
          id="pg-name"
          className={cn(inputClass, errors.name && invalidClass)}
          placeholder={t('For example: Partner Relations 2026')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Goal')} htmlFor="pg-goal">
        <textarea
          id="pg-goal"
          className={cn(textareaClass, 'min-h-[60px]')}
          placeholder={t('What should be true by the end of the period?')}
          value={goal}
          onChange={(e) => {
            setGoal(e.target.value);
          }}
        />
      </Field>
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 max-[760px]:grid-cols-1">
        <Field label={t('Owner')} htmlFor="pg-owner">
          <OwnerSelect value={owner} onChange={setOwner} ids={pool.map((p) => p.id)} />
        </Field>
        <Field label={t('Starts')} htmlFor="pg-start">
          <DateField id="pg-start" kind="start" label={t('Starts')} value={start} onChange={setStart} />
        </Field>
        <Field label={t('Ends')} htmlFor="pg-end" help={errors.end} error>
          <DateField id="pg-end" kind="due" label={t('Ends')} value={end} onChange={setEnd} />
        </Field>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="primary" onClick={submit}>
          {g ? t('Save') : t('Create program')}
        </Button>
        {g ? (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setUi((u) => {
                  u.form = null;
                });
              }}
            >
              {t('Cancel')}
            </Button>
            <span className="flex-1" />
            <Button
              variant="danger"
              onClick={() => {
                void deleteProgram(g.id).then(() => {
                  go('projects');
                });
              }}
            >
              <Icon name="trash" />
              {t('Delete program')}
            </Button>
          </>
        ) : (
          <Link to="/projects" className={buttonClass('ghost', false, 'no-underline')}>
            {t('Cancel')}
          </Link>
        )}
      </div>
    </div>
  );
}

function OwnerSelect({ value, onChange, ids }: { value: string; onChange: (v: string) => void; ids: string[] }) {
  const people = useWorkspace((db) => db.people);
  return (
    <SelectField
      id="pg-owner"
      value={value}
      people
      onChange={onChange}
      options={ids.flatMap((id) => {
        const p = people.find((x) => x.id === id);
        return p ? [{ value: p.id, label: p.name }] : [];
      })}
    />
  );
}

function NewProgram() {
  const me = useMe();
  const w = useWs();
  if (!me) return null;
  if (!canCreateProgram(me, w))
    return (
      <Page>
        <Empty title={t('Programs are created by Directors and above')}>
          {t('You can still place your own projects and operations into a program of your division.')}
          <Link to="/projects" className={cn(buttonClass('default', false, 'no-underline'), 'mt-3')}>
            {t('Back to Projects')}
          </Link>
        </Empty>
      </Page>
    );
  return (
    <Page data-page="programs">
      <p className="m-0 text-d12h font-semibold text-mute">
        {t('New program for {d}', { d: divisionOf(w)?.name ?? '' })}
      </p>
      <h1 className="m-0 type-title">{t('New program')}</h1>
      <p className="mt-1 mb-4 text-d13h text-mute">
        {t('An umbrella for related projects and operations, with a goal, an owner and a period.')}
      </p>
      <ProgramForm g={null} />
    </Page>
  );
}

// ---------- the program page ----------

function Track({ label, d, n, note, color }: { label: string; d: number; n: number; note?: string; color: string }) {
  return (
    <div className="grid gap-2 px-4 py-3.5 shadow-[inset_0_-1px_0_var(--line)]">
      <div className="flex items-baseline justify-between gap-2 text-[length:14px] text-ink-2">
        <span>{label}</span>
        <b className="font-mono text-[length:20px] font-[650] text-ink">
          {d}
          <em className="text-d14 font-medium text-mute not-italic">/{n}</em>
        </b>
      </div>
      <span
        className="block h-1.5 overflow-hidden rounded-[3px]"
        style={{ background: `color-mix(in srgb, ${color} 16%, var(--surface))` }}
      >
        <i className="block h-full rounded-[3px]" style={{ width: `${n ? (d / n) * 100 : 0}%`, background: color }} />
      </span>
      {note && <small className="text-d13 text-mute">{note}</small>}
    </div>
  );
}

const ListHead = ({ title, count, children }: { title: string; count: number; children?: ReactNode }) => (
  <h2 className="mt-[30px] mb-3.5 flex items-center gap-2 border-t border-line pt-[22px] text-d15 type-h3 comfortable:mx-1.5">
    {title} <span className="text-faint type-num">{count}</span>
    {children}
  </h2>
);

function ChildRow({
  href,
  art,
  title,
  sub,
  status,
  count,
  removeKey,
  removable,
  name,
}: {
  href: string;
  art: ReactNode;
  title: string;
  sub: ReactNode;
  status: ReactNode;
  count: ReactNode;
  removeKey: string;
  removable: boolean;
  name: string;
}) {
  return (
    <div
      className="group/li grid min-h-[52px] cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto_auto_28px] items-center gap-3 px-2 py-1.5 not-first:shadow-[inset_0_1px_0_var(--line)] hover:bg-hover max-[760px]:grid-cols-[auto_minmax(0,1fr)_auto_28px]"
      data-art-host=""
      role="link"
      tabIndex={0}
      onClick={() => {
        go(href);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) go(href);
      }}
    >
      {art}
      <span className="grid min-w-0">
        <b className="truncate text-d14 font-semibold">{title}</b>
        <small className="text-d12 text-mute">{sub}</small>
      </span>
      {status}
      <span className="text-d12 text-ink-2 max-[760px]:hidden">{count}</span>
      {removable ? (
        <IconButton
          className="opacity-0 group-hover/li:opacity-100 focus-visible:opacity-100"
          aria-label={t('Take {name} out of the program', { name })}
          onClick={(e) => {
            e.stopPropagation();
            void setProgram(removeKey, null);
          }}
        >
          <Icon name="close" size="sm" />
        </IconButton>
      ) : (
        <span />
      )}
    </div>
  );
}

/** One combined timeline: projects as bars with their milestones, operations as their runs. */
function ProgramTimeline({ g }: { g: Program }) {
  const db = useWorkspace((w) => w);
  const { ps, rs } = pgKids(db, g);
  if (!ps.length && !rs.length) return null;
  const ds = [g.start, g.end, ...ps.flatMap((p) => [p.start, p.due])].filter((x): x is string => !!x).sort();
  const lo = `${(ds[0] ?? today()).slice(0, 8)}01`;
  const hi0 = ds[ds.length - 1] ?? addDays(today(), 90);
  const hi = iso(new Date(D(hi0).getFullYear(), D(hi0).getMonth() + 1, 0));
  const span = daysBetween(lo, hi) + 1;
  const pc = (d: string) => Math.max(0, Math.min(100, ((daysBetween(lo, d) + 0.5) / span) * 100));
  const months: string[] = [];
  for (const d = D(lo); iso(d) <= hi; d.setMonth(d.getMonth() + 1, 1)) months.push(iso(d));
  const rowCls = 'grid grid-cols-[var(--pl)_minmax(0,1fr)] items-center min-h-[52px] border-t border-line';
  const labelCls =
    'flex min-w-0 items-center gap-2.5 px-3.5 py-1.5 text-inherit no-underline [&:hover_b]:underline [&:hover_b]:underline-offset-[3px]';
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_var(--line-strong)] [--pl:240px] max-[760px]:[--pl:120px] comfortable:rounded-card comfortable:shadow-card">
      <div className={cn(rowCls, 'min-h-[34px] border-t-0 bg-surface-2')}>
        <span className="px-3.5 font-mono text-d11 font-medium text-mute">
          {D(lo).getFullYear()}
          {D(hi).getFullYear() !== D(lo).getFullYear() ? ` – ${D(hi).getFullYear()}` : ''}
        </span>
        <div className="relative mr-[18px] h-full min-h-[inherit]">
          {months.map((d) => (
            <span
              key={d}
              className="absolute top-1/2 -translate-y-1/2 pl-1.5 font-mono text-d11 font-medium whitespace-nowrap text-mute"
              style={{ left: `${pc(d)}%` }}
            >
              {MON()[D(d).getMonth()]}
            </span>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute top-0 right-[18px] bottom-0 left-[var(--pl)]">
          <i className="absolute top-0 bottom-0 z-[2] -ml-px w-0.5 bg-green" style={{ left: `${pc(today())}%` }} />
          {g.start && (
            <i
              className="absolute top-0 bottom-0 bg-[color-mix(in_srgb,var(--green)_6%,transparent)]"
              style={{ left: `${pc(g.start)}%`, width: `${pc(g.end ?? hi) - pc(g.start)}%` }}
            />
          )}
        </div>
        {ps.map((p) => {
          const s = p.start ?? p.due;
          const e = p.due ?? p.start;
          const st = pStats(db, p);
          const c = pal(p.look?.p ?? 0);
          return (
            <div key={p.id} className={rowCls}>
              <Link className={labelCls} to={`/projects/${p.id}`}>
                <ProjectObject project={p} size="sm" />
                <span className="grid min-w-0">
                  <b className="truncate text-d13 font-semibold">{p.name}</b>
                  <small className="text-d11h text-mute">
                    <Stage stage={p.stage} />
                  </small>
                </span>
              </Link>
              <div className="relative mr-[18px] h-full min-h-[inherit]">
                {s && e ? (
                  <span
                    className={cn(
                      'absolute top-1/2 -mt-2.5 h-5 overflow-hidden rounded-md bg-[var(--tint)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--ink-t)_30%,transparent)]',
                      ENDED.includes(p.stage) && 'opacity-60',
                    )}
                    style={{
                      left: `${pc(s)}%`,
                      width: `${Math.max(1.2, pc(e) - pc(s))}%`,
                      ['--tint' as string]: c[3],
                      ['--ink-t' as string]: c[2],
                    }}
                  >
                    <i
                      className="block h-full bg-[color-mix(in_srgb,var(--ink-t)_45%,var(--tint))]"
                      style={{ width: `${st.total ? (st.done / st.total) * 100 : 0}%` }}
                    />
                  </span>
                ) : (
                  <span className="absolute top-1/2 -translate-y-1/2 text-d12 text-mute">{t('No dates yet')}</span>
                )}
                {db.milestones
                  .filter((m) => m.project === p.id && m.target)
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={cn(
                        'group/ms absolute top-1/2 z-[3] -mt-1.5 -ml-1.5 size-3 rotate-45 cursor-pointer rounded-[3px] border-0 bg-surface p-0 shadow-[0_0_0_2px_var(--ink-2)]',
                        m.state === 'achieved' && 'bg-green shadow-[0_0_0_2px_var(--green)]',
                        msLateOf(m) && 'shadow-[0_0_0_2px_var(--danger)]',
                      )}
                      style={{ left: `${pc(m.target)}%` }}
                      aria-label={`${m.title}, ${dLong(m.target)}`}
                      onClick={() => {
                        setUi((u) => {
                          u.insp = { type: 'ms', id: m.id };
                        });
                      }}
                    >
                      <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 hidden -translate-x-[30%] -rotate-45 gap-px rounded-[9px] bg-ink px-2.5 py-[7px] text-left text-d12 leading-[1.35] whitespace-nowrap text-on-ink group-hover/ms:grid group-focus-visible/ms:grid">
                        <b className="font-[650]">{m.title}</b>
                        <em className="not-italic opacity-70">{dLong(m.target)}</em>
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
        {rs.map((r) => (
          <div key={r.id} className={rowCls}>
            <Link className={labelCls} to={`/operations/${r.id}`}>
              <RoutineObject routine={r} size="sm" />
              <span className="grid min-w-0">
                <b className="truncate text-d13 font-semibold">{r.name}</b>
                <small className="text-d11h text-mute">{cadShort(r)}</small>
              </span>
            </Link>
            <div className="relative mr-[18px] h-full min-h-[inherit]">
              {rtBeats(db, r, lo, hi).map((b) => (
                <i
                  key={`${b.d}-${b.st}`}
                  className={cn(
                    'absolute top-1/2 -mt-[4.5px] -ml-[4.5px] size-[9px] rounded-full bg-surface shadow-[inset_0_0_0_1.5px_var(--line-strong)]',
                    b.st === 'done' && 'bg-green shadow-none',
                    b.st === 'late' && 'bg-warning-mark shadow-none',
                    b.st === 'miss' && 'shadow-[inset_0_0_0_2px_var(--danger)]',
                    (b.st === 'now' || b.st === 'rev') && 'shadow-[inset_0_0_0_2px_var(--ink)]',
                    b.st === 'skip' && 'mt-[-1px] h-0.5 w-[7px] rounded-[1px] bg-line-strong shadow-none',
                  )}
                  style={{ left: `${pc(b.d)}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgramPage({ id }: { id: string }) {
  const me = useMe();
  const lk = useSession((s) => look(s));
  const form = useUi((u) => u.form);
  const db = useWorkspace((w) => w);
  const g = pgOf(db, id);
  if (!me || !g || !canSeeProgram(me, g)) return <NotAvailable />;
  const s = pgStats(db, g);
  const can = canManageProgram(me, g);
  const placeP = db.projects.some((p) => pgDivs(g).includes(p.div) && !p.program && canPlace(db, me, 'project', p, g));
  const placeR = (db.routines ?? []).some(
    (r) => !r.personal && !!r.unit && pgDivs(g).includes(r.unit) && !r.program && canPlace(db, me, 'routine', r, g),
  );
  const first = (pid: string) => db.people.find((p) => p.id === pid)?.first ?? '';
  const trk = pal(g.look?.p ?? 0)[2];
  const comfortable = lk === 'comfortable';
  return (
    <Page wide canvas={comfortable} data-page="program">
      <div className="mt-0.5 mb-5 flex items-start gap-[18px] max-[760px]:flex-wrap comfortable:p-1" data-art-host="">
        <span className="mr-1.5">
          <ArtEdit kind="program" x={g}>
            <ProgramObject program={g} size="hero" />
          </ArtEdit>
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-d12h font-semibold text-mute">
            {t('Program of {d}', { d: divisionOf(g.div)?.name ?? '' })}
          </p>
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <h1 className="m-0 mt-0.5 min-w-0 flex-[1_1_260px] type-title comfortable:tracking-[-0.01em]">{g.name}</h1>
            <div className="flex flex-none flex-wrap items-start gap-2 pt-1">
              <PinButton kind="program" id={g.id} />
              {can && (
                <Button
                  small
                  onClick={() => {
                    setUi((u) => {
                      u.form = 'pg-edit';
                    });
                  }}
                >
                  <Icon name="edit" />
                  {t('Edit details')}
                </Button>
              )}
            </div>
          </div>
          <p className="mt-1.5 mb-2.5 max-w-[720px] text-d14h leading-[1.55] text-ink-2">
            {g.goal || <span className="text-mute">{t('No goal written yet.')}</span>}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-d13 text-mute">
            <span className="inline-flex h-[21px] items-center gap-1.5 align-top font-[550]">
              <Avatar id={g.owner} size="xs" />
              {t('Owner {who}', { who: first(g.owner) })}
            </span>
            <span className="type-num">{pgPeriod(g)}</span>
            <span>{t('Created by {who}, {date}', { who: first(g.createdBy), date: dShort(g.at.slice(0, 10)) })}</span>
          </div>
        </div>
      </div>
      {can && form === 'pg-edit' && <ProgramForm g={g} />}
      <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] overflow-hidden rounded-sheet bg-surface shadow-[0_0_0_1px_var(--line-strong)] comfortable:rounded-card comfortable:shadow-card">
        <Track label={t('Tasks done')} d={s.tDone} n={s.tAll} color={trk} />
        <Track label={t('Milestones achieved')} d={s.mDone} n={s.mAll} color={trk} />
        <Track label={t('Runs done so far')} d={s.rDone} n={s.rAll} color={trk} />
        <Track
          label={t('Projects active')}
          d={s.active}
          n={s.ps.length}
          note={s.ended ? t('{n} ended', { n: s.ended }) : ''}
          color={trk}
        />
      </div>
      <p className="mt-2.5 text-mute type-small">
        {t('Counted from the projects and operations below. Nobody types a percentage.')}
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-[18px]">
        <PartnerBlock g={g} />
        <PeopleBlock kind="program" x={g} title={t('Who runs it')} />
      </div>
      <h2 className="mt-[30px] mb-3.5 border-t border-line pt-[22px] text-d15 type-h3 comfortable:mx-1.5">
        {t('Timeline')}
      </h2>
      {s.ps.length || s.rs.length ? (
        <ProgramTimeline g={g} />
      ) : (
        <p className="mb-1 text-mute type-small">{t('Add a project or an operation to see them on one timeline.')}</p>
      )}
      <div className="grid grid-cols-2 gap-x-9 max-[1000px]:grid-cols-1">
        <section>
          <ListHead title={t('Projects')} count={s.ps.length}>
            {placeP && (
              <Button
                small
                variant="ghost"
                className="ml-auto"
                onClick={(e) => {
                  openMenu(e.currentTarget, { type: 'pgpick', id: g.id, k: 'project', width: 300 });
                }}
              >
                <Icon name="plus" size="sm" />
                {t('Add a project')}
              </Button>
            )}
          </ListHead>
          <div className="overflow-hidden rounded-sheet bg-surface shadow-[0_0_0_1px_var(--line-strong)] comfortable:rounded-card comfortable:shadow-card">
            {s.ps.length ? (
              s.ps.map((p) => {
                const st = pStats(db, p);
                return (
                  <ChildRow
                    key={p.id}
                    href={`projects/${p.id}`}
                    art={<ProjectObject project={p} size="sm" />}
                    title={p.name}
                    sub={`${p.lead ? first(p.lead) : t('No lead')}, ${p.start ? dShort(p.start) : '?'} – ${p.due ? dShort(p.due) : t('no target')}`}
                    status={<Stage stage={p.stage} />}
                    count={
                      <span className="type-num">
                        {st.done}/{st.total}
                      </span>
                    }
                    removeKey={`project:${p.id}`}
                    removable={canPlace(db, me, 'project', p, g)}
                    name={p.name}
                  />
                );
              })
            ) : (
              <p className="m-0 px-4 py-3.5 text-mute type-small">{t('No projects in this program yet.')}</p>
            )}
          </div>
        </section>
        <section>
          <ListHead title={t('Operations')} count={s.rs.length}>
            {placeR && (
              <Button
                small
                variant="ghost"
                className="ml-auto"
                onClick={(e) => {
                  openMenu(e.currentTarget, { type: 'pgpick', id: g.id, k: 'routine', width: 300 });
                }}
              >
                <Icon name="plus" size="sm" />
                {t('Add an operation')}
              </Button>
            )}
          </ListHead>
          <div className="overflow-hidden rounded-sheet bg-surface shadow-[0_0_0_1px_var(--line-strong)] comfortable:rounded-card comfortable:shadow-card">
            {s.rs.length ? (
              s.rs.map((r) => {
                const b = rtBeats(db, r, '2000-01-01', addDays(today(), 60));
                const nx = b.find((x) => x.d >= today() && x.st !== 'skip');
                return (
                  <ChildRow
                    key={r.id}
                    href={`operations/${r.id}`}
                    art={<RoutineObject routine={r} size="sm" />}
                    title={r.name}
                    sub={`${cadShort(r)}${nx ? `, ${t('next {d}', { d: dShort(nx.d) })}` : ''}`}
                    status={
                      r.paused ? (
                        <State label={t('Paused')} icon="hand" tone="warn" />
                      ) : (
                        <State label={t('Running')} icon="activity" tone="green" />
                      )
                    }
                    count={nx?.owner ? <Avatar id={nx.owner} size="xs" /> : null}
                    removeKey={`routine:${r.id}`}
                    removable={canPlace(db, me, 'routine', r, g)}
                    name={r.name}
                  />
                );
              })
            ) : (
              <p className="m-0 px-4 py-3.5 text-mute type-small">{t('No operations in this program yet.')}</p>
            )}
          </div>
        </section>
      </div>
      <p className="mt-2.5 text-mute type-small">
        {t(
          'Projects and operations keep their own pages. Taking one out of the program changes the program, never the project or operation.',
        )}
      </p>
    </Page>
  );
}
