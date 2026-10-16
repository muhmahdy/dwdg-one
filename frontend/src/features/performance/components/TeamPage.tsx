/* Team performance (D30, analytics_team_performance): recorded facts per person, scoped by role, every figure opens its
   records, Unknown is never zero and nobody is ranked. A Simple table (default) or ring cards. From screens/perf.js teamPage. */
import { Link } from 'react-router';
import { DIVS, divisionOf } from '@/app/config/org';
import { Avatar, roleLabel } from '@/components/shared/Avatar';
import { Notice } from '@/components/ui/Notice';
import { Empty, Page, PageHeader } from '@/components/ui/page';
import { Segmented } from '@/components/ui/forms';
import { badgeMask } from '@/components/ui/icon-data';
import { BrandIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { setSession } from '@/lib/session';
import { daysBetween, today } from '@/lib/time';
import { useMe, useSession, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { hrOf } from '@/features/hr/services/hr-data';
import type { Person, Workspace } from '@/types/workspace';
import { hrChipDef, hrFacts, periods, ringFacts, span2, taskFacts, type Period } from '../services/facts';
import type { Team } from '../services/scope';
import {
  Chip,
  Dash,
  Foot,
  PeriodSelect,
  RateWords,
  RingKeyRow,
  RingLine,
  RingLines,
  Rings,
  Unknown,
  ViewSeg,
  cardSurface,
  hasRateWords,
  ringVars,
  usePerfView,
  usePeriod,
  phClass,
} from './PerfParts';

export const PerfCrumb = ({ parts }: { parts: [href: string, text: string][] }) => (
  <>
    {parts.map(([h, text], i) => (
      <span key={`${h}${text}`}>
        {i > 0 && <i className="mx-1.5 text-faint not-italic">/</i>}
        {i === parts.length - 1 ? (
          <b>{text}</b>
        ) : (
          <Link to={`/${h}`} className="no-underline">
            {text}
          </Link>
        )}
      </span>
    ))}
  </>
);

const hrChip = (db: Workspace, id: string, P: Period) => {
  const f = hrFacts(db, id, P);
  return f.k === 'unknown' ? <Unknown /> : <Chip def={hrChipDef(f)} />;
};

/** The three header cells and grid of the Simple table (Name, Finished, On time, Overdue, Meetings, Hand-ins, HR cycle). */
const tblRow =
  'grid grid-cols-[minmax(150px,1fr)_repeat(5,62px)_118px] items-center gap-2 px-4 py-2.5 text-ink no-underline max-[700px]:grid-cols-3 max-[700px]:gap-y-2';
const tblCell =
  'text-right text-[length:14px] max-[700px]:grid max-[700px]:text-left max-[700px]:before:text-[length:12.5px] max-[700px]:before:text-mute max-[700px]:before:content-[attr(data-l)]';

function Cell({
  label,
  children,
  bad = false,
  left = false,
}: {
  label: string;
  children: React.ReactNode;
  bad?: boolean;
  left?: boolean;
}) {
  return (
    <span role="cell" data-l={label} className={cn(tblCell, bad && '[&_b]:text-danger', left && 'text-left')}>
      {children}
    </span>
  );
}

export const Num = ({ n, of }: { n: number; of?: number }) => (
  <>
    <b className="font-semibold! type-num">{n}</b>
    {of != null && <small className="text-[length:12px] text-mute">/{of}</small>}
  </>
);

function SimpleTable({ ids, P }: { ids: string[]; P: Period }) {
  const db = useWorkspace((w) => w);
  const head = [t('Name'), t('Finished'), t('On time'), t('Overdue'), t('Meetings'), t('Hand-ins'), t('HR cycle')];
  return (
    <div className={cn('mt-3 overflow-hidden', cardSurface)} role="table" aria-label={t('Team performance')}>
      <div className={cn(tblRow, 'pt-3 pb-2 text-[length:12.5px] font-medium text-mute max-[700px]:hidden')} role="row">
        {head.map((h, i) => (
          <span key={h} role="columnheader" className={i === 0 || i === 6 ? 'text-left' : 'text-right'}>
            {h}
          </span>
        ))}
      </div>
      {ids.map((id) => {
        const p = db.people.find((x) => x.id === id);
        if (!p) return null;
        const f = ringFacts(db, id, P);
        const od = f.tf.overdue.length;
        return (
          <Link
            key={id}
            to={`/performance/${id}`}
            role="row"
            className={cn(tblRow, 'hover:bg-hover [&+&]:shadow-[inset_0_1px_0_var(--line)]')}
          >
            <span role="cell" className="flex min-w-0 items-center gap-2.5 max-[700px]:col-span-full">
              <Avatar id={id} size="sm" />
              <span className="grid min-w-0">
                <b className="truncate font-semibold">{p.name}</b>
                <small className="text-[length:12.5px] text-mute">{roleLabel(p)}</small>
              </span>
            </span>
            <Cell label={head[1] ?? ''}>
              <Num n={f.tf.done.length} />
            </Cell>
            <Cell label={head[2] ?? ''}>{f.del ? <Num n={f.del.n} /> : <Dash />}</Cell>
            <Cell label={head[3] ?? ''} bad={od > 0}>
              <Num n={od} />
            </Cell>
            <Cell label={head[4] ?? ''}>{f.att ? <Num n={f.att.n} of={f.att.of} /> : <Dash />}</Cell>
            <Cell label={head[5] ?? ''}>{f.hand ? <Num n={f.hand.n} of={f.hand.of} /> : <Dash />}</Cell>
            <Cell label={head[6] ?? ''}>{hrChip(db, id, P)}</Cell>
          </Link>
        );
      })}
    </div>
  );
}

export const WarnMark = ({ className }: { className?: string }) => (
  <i
    className={cn('size-[15px] flex-none bg-danger mask-icon', className)}
    style={{ ['--m' as string]: badgeMask('warning') }}
  />
);

function PersonCard({ p, P }: { p: Person; P: Period }) {
  const db = useWorkspace((w) => w);
  const f = ringFacts(db, p.id, P);
  const od = f.tf.overdue.length;
  return (
    <Link
      to={`/performance/${p.id}`}
      className={cn(
        'grid content-start gap-3 px-4 py-3.5 text-ink no-underline transition-shadow hover:shadow-[0_0_0_1px_var(--line-strong),0_8px_22px_rgb(22_22_21/8%)]',
        cardSurface,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar id={p.id} />
        <span className="grid min-w-0 flex-1">
          <b className="truncate font-semibold">{p.name}</b>
          <small className="text-[length:13.5px] text-mute">{roleLabel(p)}</small>
        </span>
        {od > 0 && (
          <span className="inline-flex items-center gap-1 text-[length:13px] font-semibold text-danger">
            <WarnMark />
            {od}
          </span>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-3.5">
        <Rings f={f} />
        <RingLines>
          <RingLine f={f} k="del" />
          <RingLine f={f} k="att" />
          {f.hand ? (
            <li className="flex min-w-0 items-baseline gap-2">
              <i className="size-[9px] flex-none -translate-y-px rounded-full bg-[var(--rg-hand)]" />
              <span className="min-w-0">
                {hasRateWords(f.tf) ? (
                  <RateWords tf={f.tf} />
                ) : (
                  <>
                    <b className="font-semibold! text-ink type-num">
                      {t('{n} of {of}', { n: f.hand.n, of: f.hand.of })}
                    </b>{' '}
                    {t('hand-ins accepted')}
                  </>
                )}
              </span>
            </li>
          ) : (
            <RingLine f={f} k="hand" />
          )}
        </RingLines>
      </div>
      <div className="flex items-center justify-between gap-2 pt-2.5 text-[length:12.5px] text-mute shadow-[inset_0_1px_0_var(--line)]">
        <span>{t('HR cycle')}</span>
        {hrChip(db, p.id, P)}
      </div>
    </Link>
  );
}

/** Where today sits in the current 14-day cycle, and what the people shown recorded (facts only). */
function CycleBand({ P, ids }: { P: Period; ids: string[] }) {
  const db = useWorkspace((w) => w);
  const cur = periods()[0];
  if (!cur) return null;
  const dayN = daysBetween(cur.from, today()) + 1;
  const facts = ids.map((id) => taskFacts(db, id, P));
  const sum = (pick: (f: (typeof facts)[number]) => number) => facts.reduce((s, f) => s + pick(f), 0);
  const lateN = sum((f) => f.done.filter((x) => x.due && (x.doneAt ?? '') > x.due).length);
  const over = sum((f) => f.overdue.length);
  return (
    <div className={cn('mt-2.5 grid gap-2.5 px-[18px] py-4', cardSurface)}>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <b className="text-[length:16px] font-semibold">{t('This cycle, {d}', { d: span2(cur.from, cur.to) })}</b>
        <span className="text-mute">{t('Day {n} of 14', { n: dayN })}</span>
      </div>
      <div className="grid grid-cols-14 gap-1" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <i
            key={i}
            className={cn(
              'h-2 rounded bg-surface-2',
              i + 1 < dayN && 'bg-[color-mix(in_srgb,var(--green)_45%,var(--surface))]',
              i + 1 === dayN && 'bg-green shadow-[0_0_0_2px_color-mix(in_srgb,var(--green)_25%,transparent)]',
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1 text-[length:13.5px] text-ink-2">
        {(
          [
            [sum((f) => f.done.length), t('completed'), false],
            [lateN, t('late'), false],
            [sum((f) => f.accepted.length), t('hand-ins accepted'), false],
            [over, t('overdue now'), over > 0],
          ] as [number, string, boolean][]
        ).map(([n, label, bad]) => (
          <span key={label} className={cn(bad && 'text-danger')}>
            <b className={cn('text-[length:18px]! font-semibold! type-num', bad ? 'text-danger' : 'text-ink')}>{n}</b>{' '}
            {label}
          </span>
        ))}
        <small className="ml-auto text-[length:12.5px] text-mute max-[600px]:ml-0 max-[600px]:basis-full">
          {P.label}
        </small>
      </div>
    </div>
  );
}

function scopeText(T: Team, w: string) {
  const wname = divisionOf(w)?.name ?? '';
  if (T.kind === 'branch') return t('Your branch: {b}, {n} people', { b: t(T.branch), n: T.ids.length });
  if (T.kind === 'div' || T.kind === 'cd') return t('Your team in {d}, {n} people', { d: wname, n: T.ids.length });
  if (T.kind === 'vp') return t('Your reporting divisions');
  return t('Everyone in DWDG UII');
}

export function TeamPage({ team }: { team: Team }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const w = useWs();
  const P = usePeriod();
  const view = usePerfView();
  const perfAll = useSession((s) => !!s.perfAll);
  if (!m) return null;
  const wide = team.kind === 'all' || team.kind === 'vp';
  const all = wide && perfAll;
  const ids = team.ids.filter((id) => {
    const p = db.people.find((x) => x.id === id);
    return !!p && (!wide || all || p.div === w || (!p.div && id === m.id));
  });
  const byName = (a: Person, b: Person) => a.name.localeCompare(b.name);
  const peopleOf = (pred: (p: Person) => boolean) =>
    ids
      .map((id) => db.people.find((x) => x.id === id))
      .filter((p): p is Person => !!p && pred(p))
      .sort(byName);
  const groups: { d: string; name: string; list: Person[] }[] = all
    ? [
        ...DIVS.map((d) => ({ d: d.id, name: d.name, list: peopleOf((p) => p.div === d.id) })),
        { d: '', name: t('Presidency'), list: peopleOf((p) => !p.div) },
      ].filter((g) => g.list.length)
    : [{ d: '', name: '', list: peopleOf(() => true) }];
  const simple = view === 'simple';
  const wdiv = divisionOf(w);
  const sub = wide && !all ? t('{d}, {n} people', { d: wdiv?.name ?? '', n: ids.length }) : scopeText(team, w);
  return (
    <Page wide canvas className={ringVars}>
      <PageHeader className={phClass} title={t('Team performance')} sub={sub}>
        <ViewSeg />
        {wide && (
          <Segmented<'0' | '1'>
            label={t('Scope')}
            value={all ? '1' : '0'}
            options={[
              ['0', wdiv?.short ?? ''],
              ['1', team.kind === 'vp' ? t('All reporting divisions') : t('Everyone')],
            ]}
            onChange={(v) => {
              setSession({ perfAll: v === '1' });
            }}
          />
        )}
        <PeriodSelect />
      </PageHeader>
      {!hrOf(db) && (
        <Notice icon="info" title={<b>{t('HR records are not available yet')}</b>} className="mt-3">
          <p>{t('Attendance and 14-day results show as Unknown until HR records exist.')}</p>
        </Notice>
      )}
      {ids.length ? (
        <>
          <CycleBand P={P} ids={ids} />
          {!simple && <RingKeyRow />}
          {groups.map((g) => (
            <div key={g.d || 'all'}>
              {all && (
                <h3 className="mx-1 mt-6 mb-0 flex items-center gap-2 type-h3">
                  {g.d && <BrandIcon id={divisionOf(g.d)?.icon ?? ''} label={false} />}
                  {g.name} <span className="font-medium text-mute">{g.list.length}</span>
                  {g.d && (
                    <Link
                      className="ml-auto inline-flex items-center gap-1 text-[length:13px] font-semibold text-green-ink no-underline"
                      to={`/performance/div/${g.d}`}
                    >
                      {t('Division summary')}
                    </Link>
                  )}
                </h3>
              )}
              {simple ? (
                <SimpleTable ids={g.list.map((p) => p.id)} P={P} />
              ) : (
                <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-2.5">
                  {g.list.map((p) => (
                    <PersonCard key={p.id} p={p} P={P} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <Empty title={t('Nobody in this view')}>
          {t('Nobody in your team belongs to this workspace. Choose another scope.')}
        </Empty>
      )}
      <Foot>
        {simple
          ? t('Sorted by name. There is no ranking and no score. Open a person to see the records behind each number.')
          : t(
              'Sorted by name. Each ring is one recorded fact on its own; they are never added up, and nobody is ranked.',
            )}{' '}
        {t(
          'Task figures count only work recorded in dwdg’ONE; a delegated task or routine run counts as completed once it is signed off.',
        )}{' '}
        {t('Private absence reasons, private notes and support details are never shown here.')}
      </Foot>
    </Page>
  );
}
