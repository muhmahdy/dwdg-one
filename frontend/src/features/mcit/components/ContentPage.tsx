/* Content: a calendar, a production board and a table of the same items (marketing_cadence, marketing_dates; patterns
   p-calendar, p-board, p-table). Internal due dates, planned publication and actual publication are kept apart, and a planned
   date passing never publishes anything. Campaigns sit below. From divisions/div-fnl-mcit.js contentPage and calendarView. */
import { useState } from 'react';
import { Link } from 'react-router';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar } from '@/components/shared/Avatar';
import { Chip, DivCrumb } from '@/components/shared/division-ui';
import { Button, buttonClass, IconButton } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { State } from '@/components/ui/StatusBadge';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { MONTH, WD, plural, t } from '@/lib/i18n';
import { D, addDays, dLong, dShort, fmtD, iso, today, weekStart, weekday } from '@/lib/time';
import { useWho } from '@/lib/people';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { hrOf, type HrPacket } from '@/features/hr/services/hr-data';
import { projOf } from '@/features/work/services/selectors';
import { GrantsBox, Note, Who, fmtDT } from '@/features/fnl/components/fnl-parts';
import { LinkRow, Tbl, Td, Th } from '@/features/fnl/components/fnl-table';
import { NeededTag } from '@/features/fnl/components/fnl-parts';
import { exportContent } from '../services/content';
import {
  CORDER,
  CST,
  MC,
  canMakeContent,
  chName,
  cmpOf,
  ctOf,
  mcFull,
  mcitOf,
  pubCount,
  stale,
  type Content,
} from '../services/mcit-data';
import { ContentItemPage } from './ContentItemPage';
import { NewContentPage } from './NewContentPage';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function ContentCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const parts: [string, string][] = [['content', t('Content')]];
  if (route.id === 'new') parts.push(['', t('New content')]);
  else if (route.id) {
    const c = ctOf(db, route.id);
    if (c) parts.push(['', c.title]);
  }
  return <DivCrumb d={MC} parts={parts} />;
}

type EvKind = 'plan' | 'late' | 'pub' | 'due' | 'hr';
const KIND: Record<EvKind, [string, string]> = {
  plan: ['Planned publication', 'calendar'],
  late: ['Planned date passed, not published', 'warning'],
  pub: ['Published (recorded)', 'check'],
  due: ['Internal due', 'clock'],
  hr: ['From HR', 'heart'],
};
interface Ev {
  k: EvKind;
  c?: Content;
  ch?: Content['channels'][number];
  pk?: HrPacket;
  t: string;
}

const EV_CLASS: Record<EvKind, string> = {
  plan: '',
  late: 'text-warning shadow-[inset_0_0_0_1px_currentColor]',
  pub: 'bg-sel text-green-ink shadow-none',
  due: 'bg-transparent pl-0.5 shadow-none',
  hr: 'bg-fill shadow-none',
};
const evPill =
  'flex h-5 min-w-0 items-center gap-1 rounded-chip bg-surface px-1.5 text-[13px] whitespace-nowrap text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong)]';

function EvPill({ e }: { e: Ev }) {
  const label =
    e.k === 'hr'
      ? (e.pk?.title ?? '')
      : e.k === 'due'
        ? t('Due: {t}', { t: e.c?.title ?? '' })
        : `${chName(e.ch?.ch ?? '')} · ${e.c?.title ?? ''}`;
  return (
    <span className={cn(evPill, EV_CLASS[e.k])} title={t(KIND[e.k][0])}>
      <Icon name={KIND[e.k][1]} size="sm" className="size-3 flex-none" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function Calendar({ items, all }: { items: Content[]; all: boolean }) {
  const db = useWorkspace((w) => w);
  const [mo, setMo] = useState(today().slice(0, 7));
  const [sel, setSel] = useState(today());
  const y = Number(mo.slice(0, 4));
  const mi0 = Number(mo.slice(5, 7)) - 1;
  const first0 = iso(new Date(y, mi0, 1));
  const start = weekStart(first0);
  const last = iso(new Date(y, mi0 + 1, 0));
  const ev: Record<string, Ev[]> = {};
  const push = (d: string, e: Ev) => {
    (ev[d] ??= []).push(e);
  };
  items.forEach((c) => {
    if (c.stage === 'cancelled') return;
    c.channels.forEach((ch) => {
      if (ch.pub) push(ch.pub.at.slice(0, 10), { k: 'pub', c, ch, t: ch.pub.at.slice(11, 16) });
      else
        push(ch.planned.slice(0, 10), {
          k: ch.planned.slice(0, 10) < today() ? 'late' : 'plan',
          c,
          ch,
          t: ch.planned.slice(11, 16),
        });
    });
    if (c.due && !['published', 'scheduled', 'approved', 'archived'].includes(c.stage))
      push(c.due, { k: 'due', c, t: '' });
  });
  if (all)
    (hrOf(db)?.packets ?? [])
      .filter((pk) => ['requested', 'accepted', 'fulfilled'].includes(pk.state))
      .forEach((pk) => {
        const d = pk.announcement ? pk.announcement.date || pk.agreedDate : (pk.agreedDate ?? pk.neededBy);
        if (d) push(d, { k: 'hr', pk, t: '' });
      });
  const cells: string[] = [];
  for (let d = start; d <= last || weekday(d) !== 1; d = addDays(d, 1)) cells.push(d);
  const prevM = iso(new Date(y, mi0 - 1, 1)).slice(0, 7);
  const nextM = iso(new Date(y, mi0 + 1, 1)).slice(0, 7);
  const go = (m: string) => {
    setMo(m);
    setSel(m === today().slice(0, 7) ? today() : `${m}-01`);
  };
  const day = ev[sel] ?? [];
  return (
    <>
      <div className="mt-1 rounded-sheet bg-surface shadow-sheet">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <IconButton
              aria-label={t('Previous month')}
              onClick={() => {
                go(prevM);
              }}
            >
              <Icon name="chevron-left" />
            </IconButton>
            <b className="min-w-[140px] text-center type-h3">{`${MONTH()[mi0] ?? ''} ${String(y)}`}</b>
            <IconButton
              aria-label={t('Next month')}
              onClick={() => {
                go(nextM);
              }}
            >
              <Icon name="chevron-right" />
            </IconButton>
            <Button
              small
              onClick={() => {
                go(today().slice(0, 7));
              }}
            >
              {t('Today')}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(KIND) as EvKind[]).map((k) => (
              <span key={k} className={cn(evPill, 'h-6 text-d12', EV_CLASS[k])}>
                <Icon name={KIND[k][1]} size="sm" className="size-3 flex-none" />
                <span>{t(KIND[k][0])}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-[3px]">
          {[1, 2, 3, 4, 5, 6, 0].map((i) => (
            <span key={i} className="px-1.5 py-1 text-mute type-caption">
              {WD()[i]}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[3px]">
          {cells.map((d) => {
            const es = ev[d] ?? [];
            const out = d.slice(0, 7) !== mo;
            return (
              <button
                key={d}
                type="button"
                className={cn(
                  'flex min-h-[104px] min-w-0 cursor-pointer flex-col items-stretch gap-[3px] rounded-ctl border-0 bg-surface-2 p-1.5 text-left font-[inherit] text-ink hover:bg-hover',
                  out && 'bg-transparent text-mute hover:bg-hover',
                  d === sel && 'shadow-[inset_0_0_0_1.5px_var(--ink)]',
                )}
                aria-label={`${dLong(d)}, ${plural(es.length, '{n} item', '{n} items')}`}
                aria-pressed={d === sel}
                onClick={() => {
                  setSel(d);
                }}
              >
                <span
                  className={cn(
                    'font-mono text-[14px] leading-[18px] font-semibold text-ink-2',
                    d === today() && 'inline-grid size-[22px] place-items-center rounded-full bg-ink text-on-ink',
                  )}
                >
                  {D(d).getDate()}
                </span>
                {es.slice(0, 3).map((e, i) => (
                  <EvPill key={`${e.k}${String(i)}`} e={e} />
                ))}
                {es.length > 3 && (
                  <span className="pl-1 text-[13px] text-mute">{t('+{n} more', { n: es.length - 3 })}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <SectionHeading as="h2" count={day.length}>
        {dLong(sel)}
      </SectionHeading>
      {day.length ? (
        <Rows>
          {day.map((e, i) =>
            e.k === 'hr' && e.pk ? (
              <Link key={`hr${String(i)}`} to={`/recognition/${e.pk.round}`} className="block">
                <Row className="gap-2.5">
                  <Icon name="heart" />
                  <RowText
                    title={<b>{e.pk.title}</b>}
                    sub={t('Publication request from HR. Agreed date {d}.', {
                      d: fmtD(e.pk.agreedDate ?? e.pk.neededBy),
                    })}
                  />
                  <Chip
                    def={e.pk.state === 'fulfilled' ? ['Announced', 'check', 'green'] : ['Accepted', 'check', 'ink']}
                  />
                </Row>
              </Link>
            ) : (
              e.c && (
                <Link key={`${e.c.id}${e.k}${String(i)}`} to={`/content/${e.c.id}`} className="block">
                  <Row className="gap-2.5">
                    <Icon name={KIND[e.k][1]} />
                    <RowText
                      title={<b>{e.c.title}</b>}
                      sub={`${t(KIND[e.k][0])}${e.ch ? ` · ${chName(e.ch.ch)} ${e.t}` : ''}${e.k === 'pub' && e.ch?.pub?.url ? ` · ${t('evidence recorded')}` : ''}`}
                    />
                    <Chip def={CST[e.c.stage]} />
                  </Row>
                </Link>
              )
            ),
          )}
        </Rows>
      ) : (
        <Note>{t('Nothing planned, due or published on this day.')}</Note>
      )}
    </>
  );
}

function Card({ c }: { c: Content }) {
  const nx = c.channels.find((ch) => !ch.pub);
  const n = pubCount(c);
  return (
    <Link
      to={`/content/${c.id}`}
      className="mb-1.5 block rounded-[10px] bg-surface px-3 py-2.5 text-inherit no-underline shadow-sheet hover:bg-hover"
    >
      <b className="block text-d13 font-semibold">{c.title}</b>
      <div className="mt-2 flex items-center gap-1.5 text-d12 text-mute">
        <Avatar id={c.executor} size="xs" />
        <FirstName id={c.executor} />
        <span className="ml-auto text-ink-2 type-num">{nx ? dShort(nx.planned.slice(0, 10)) : ''}</span>
      </div>
      {stale(c) ? (
        <div className="mt-2 flex items-center gap-1.5 text-d12">
          <Chip def={['Approval stale', 'warning', 'danger']} />
        </div>
      ) : (
        c.channels.length > 1 &&
        n > 0 &&
        n < c.channels.length && (
          <div className="mt-2 flex items-center gap-1.5 text-d12">
            <State label={t('Published on {a} of {b}', { a: n, b: c.channels.length })} icon="globe" tone="warn" />
          </div>
        )
      )}
    </Link>
  );
}
function FirstName({ id }: { id: string }) {
  const who = useWho();
  return <>{who.first(id)}</>;
}

function Board({ items }: { items: Content[] }) {
  const col = (s: (typeof CORDER)[number] | 'cancelled') => {
    const cs = items.filter((c) => c.stage === s);
    return (
      <div key={s} className="flex flex-col gap-1.5 rounded-sheet bg-fill p-2">
        <div className="flex items-center justify-between px-1.5 pt-1 pb-1.5 text-d13 font-semibold">
          <Chip def={CST[s]} />
          <span className="text-mute type-num">{cs.length}</span>
        </div>
        {cs.map((c) => (
          <Card key={c.id} c={c} />
        ))}
      </div>
    );
  };
  return (
    <>
      <div className="grid auto-cols-[232px] grid-flow-col gap-3 overflow-x-auto pb-1.5">
        {CORDER.map(col)}
        {col('cancelled')}
      </div>
      <Note>{t('Columns come from the content states. Canceled stays visible with its reason.')}</Note>
    </>
  );
}

function Table({ items }: { items: Content[] }) {
  const db = useWorkspace((w) => w);
  return (
    <Tbl
      head={
        <>
          <Th>{t('Content')}</Th>
          <Th>{t('Executor')}</Th>
          <Th>{t('Reviewer')}</Th>
          <Th>{t('Internal due')}</Th>
          <Th>{t('Planned publication')}</Th>
          <Th>{t('Actual publication')}</Th>
          <Th>{t('State')}</Th>
        </>
      }
    >
      {items.map((c) => {
        const cmp = cmpOf(db, c.campaign);
        return (
          <LinkRow key={c.id} to={`content/${c.id}`}>
            <Td>
              <b>{c.title}</b>
              <small className="text-mute">
                {c.kind}
                {cmp ? ` · ${cmp.name}` : ''}
              </small>
            </Td>
            <Td>
              <Who id={c.executor} />
            </Td>
            <Td>
              <Who id={c.reviewer} />
            </Td>
            <Td>
              <NeededTag d={['published', 'cancelled', 'archived'].includes(c.stage) ? null : c.due} />
            </Td>
            <Td>
              {c.channels.map((ch) => (
                <small key={ch.ch} className="block whitespace-nowrap">
                  {chName(ch.ch)} {fmtDT(ch.planned)}
                </small>
              ))}
            </Td>
            <Td>
              {c.channels.map((ch) => (
                <small key={ch.ch} className="block whitespace-nowrap">
                  {chName(ch.ch)} {ch.pub ? fmtDT(ch.pub.at) : <span className="text-mute">{t('Not recorded')}</span>}
                </small>
              ))}
            </Td>
            <Td>
              <Chip def={CST[c.stage]} pill="pill" />
              {stale(c) && <Chip def={['Approval stale', 'warning', 'danger']} className="ml-1" />}
            </Td>
          </LinkRow>
        );
      })}
    </Tbl>
  );
}

export function ContentPage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const v = useUi((u) => u.view.mcv ?? 'calendar');
  const fc = useUi((u) => u.view.mccmp ?? 'all');
  useDivisionWorkspace(MC);
  if (route.id === 'new') return <NewContentPage fromBrief={route.sub} />;
  if (!mcFull(m)) return <Unavailable />;
  if (route.id) {
    const c = ctOf(db, route.id);
    return c ? <ContentItemPage id={c.id} /> : <Unavailable />;
  }
  const s = mcitOf(db);
  const items = s.content.filter((c) => fc === 'all' || (fc === 'none' ? !c.campaign : c.campaign === fc));
  return (
    <Page wide>
      <PageHeader
        title={t('Content')}
        sub={t(
          'Internal due dates, planned publication and actual publication are kept apart. A planned date passing never publishes anything.',
        )}
      >
        <Button
          onClick={() => {
            void exportContent();
          }}
        >
          <Icon name="download" />
          {t('Export CSV')}
        </Button>
        {canMakeContent(db, m) && (
          <Link className={buttonClass('primary', false, 'no-underline')} to="/content/new">
            <Icon name="plus" />
            {t('New content')}
          </Link>
        )}
      </PageHeader>
      <div className="mt-[18px] mb-2.5 flex flex-wrap items-center justify-between gap-3">
        <Segmented<string>
          label={t('View')}
          value={v}
          buttonClassName="inline-flex items-center gap-1.5"
          onChange={(k) => {
            setUi((u) => {
              u.view.mcv = k;
            });
          }}
          options={(
            [
              ['calendar', 'Calendar', 'calendar'],
              ['board', 'Board', 'board'],
              ['table', 'Table', 'list'],
            ] as const
          ).map(([k, l, i]) => [
            k,
            <>
              <Icon name={i} size="sm" />
              {t(l)}
            </>,
          ])}
        />
        <label className="inline-flex items-center gap-2 text-d13 text-mute">
          {t('Campaign')}
          <SelectField
            small
            value={fc}
            className="min-w-[200px]"
            onChange={(k) => {
              setUi((u) => {
                u.view.mccmp = k;
              });
            }}
            options={[
              { value: 'all', label: t('All content') },
              ...s.campaigns.map((c) => ({ value: c.id, label: c.name })),
              { value: 'none', label: t('No campaign') },
            ]}
          />
        </label>
      </div>
      {v === 'calendar' ? (
        <Calendar items={items} all={fc === 'all'} />
      ) : v === 'board' ? (
        <Board items={items} />
      ) : (
        <Table items={items} />
      )}
      <SectionHeading as="h2" count={s.campaigns.length}>
        {t('Campaigns')}
      </SectionHeading>
      <Rows>
        {s.campaigns.map((c) => {
          const n = s.content.filter((x) => x.campaign === c.id).length;
          const p = c.project ? projOf(db, c.project) : undefined;
          return (
            <Row key={c.id} className="cursor-default gap-2.5">
              <RowText
                title={<b>{c.name}</b>}
                className="whitespace-normal"
                sub={
                  <>
                    {c.purpose}
                    <small className="block">
                      {dShort(c.start)} – {dShort(c.end)} · {c.channels.map(chName).join(', ')}
                      {p && (
                        <>
                          {' · '}
                          <Link to={`/projects/${p.id}`}>{p.name}</Link>
                        </>
                      )}
                    </small>
                  </>
                }
              />
              <Who id={c.owner} />
              <span className="text-mute type-small">{plural(n, '{n} item', '{n} items')}</span>
            </Row>
          );
        })}
      </Rows>
      <Note>{t('A routine post needs no campaign. Engagement numbers are not shown because none are recorded.')}</Note>
      <GrantsBox grants={s.grants} keys={['review', 'publish']} />
    </Page>
  );
}
