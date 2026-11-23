/* Organisation dashboard (Strategy & Growth brief: "Organizational Performance Dashboard", the monthly review with the
   President and VP). One card per batch target from the divisions' briefs, counted from saved records. No overall score,
   no ranking; Unknown when the viewer may not read a division, "No data yet" when there is nothing to count. The work
   execution of each division (delivery, attendance) stays on Performance. Counting: ../services/org-dashboard.ts. */
import { Link } from 'react-router';
import { DIVS, divisionOf } from '@/app/config/org';
import { inShip } from '@/app/router/routes';
import { Notice } from '@/components/ui/Notice';
import { SectionHeading } from '@/components/ui/Headings';
import { BrandIcon } from '@/components/ui/Icon';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import type { Tone } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { lang, t } from '@/lib/i18n';
import { fmtD, today } from '@/lib/time';
import { useMe, useSession, useWorkspace } from '@/lib/workspace/hooks';
import {
  BATCH,
  NOT_MEASURED,
  canSeeDashboard,
  dashboardMetrics,
  progressOf,
  stateOf,
  type Metric,
  type MetricState,
} from '../services/org-dashboard';
import { activePeople } from '../services/scope';
import { Chip, Foot, barStyle, cardSurface, phClass } from './PerfParts';
import { PerfCrumb } from './TeamPage';

export const OrgDashboardCrumb = () => <PerfCrumb parts={[['', t('Organisation dashboard')]]} />;

/** The three outcomes every brief points at: clients, delivered projects, and the people ready to staff them. */
const HEADLINE = ['ee-won', 'cons-delivered', 'hr-competency'];

const STATE: Record<MetricState, readonly [string, string, Tone]> = {
  met: ['Target met', 'check', 'green'],
  below: ['Below target', 'warning', 'warn'],
  nodata: ['No data yet', 'circle', 'mute'],
  notarget: ['No numeric target', 'minus', 'ink2'],
  hidden: ['Not visible to you', 'lock', 'mute'],
};

const num = (v: number) => v.toLocaleString(lang() === 'id' ? 'id-ID' : 'en-GB');

function targetText(x: Metric) {
  if (x.targetText) return t('Target: {x}', { x: t(x.targetText) });
  const g = x.target;
  if (!g) return t('Tracked, no number set in the brief');
  switch (g.kind) {
    case 'atLeast':
      return t('Target: about {n}', { n: g.n });
    case 'moreThan':
      return t('Target: more than {n}', { n: g.n });
    case 'range':
      return t('Target: {n} to {m}', { n: g.n, m: g.max });
    case 'all':
      return t('Target: 100%');
  }
}

function Value({ x, big }: { x: Metric; big: boolean }) {
  const size = big ? 'text-[28px] leading-8 font-semibold' : 'type-h2';
  if (x.hidden) return <span className={cn(size, 'text-mute')}>{t('Unknown')}</span>;
  if (x.value === null) return <span className={cn(size, 'text-mute')}>–</span>;
  if (x.of === undefined) return <span className={cn(size, 'type-num')}>{num(x.value)}</span>;
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className={cn(size, 'type-num')}>
        {num(x.value)} <span className="text-mute">/ {x.of === null ? '–' : num(x.of)}</span>
      </span>
      {!!x.of && <span className="text-mute type-small type-num">{Math.round((x.value / x.of) * 100)}%</span>}
    </span>
  );
}

function MetricCard({ x, big = false }: { x: Metric; big?: boolean }) {
  const preview = useSession((s) => s.preview);
  const st = stateOf(x);
  const p = progressOf(x);
  const open = x.page && !x.hidden && inShip(x.page, preview) ? x.page : null;
  return (
    <div className={cn(cardSurface, 'grid content-start gap-2 px-4 py-3.5')}>
      <div className="flex items-start gap-2">
        <b className="text-d13 font-[550]">{t(x.label)}</b>
        {open && (
          <Link to={`/${open}`} className="ml-auto text-d12 whitespace-nowrap text-mute">
            {t('Open')}
          </Link>
        )}
      </div>
      <Value x={x} big={big} />
      {p !== null && (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-fill"
          role="img"
          aria-label={t('{p}% of the target', { p: Math.round(p * 100) })}
        >
          <div className={cn('h-full rounded-full', st === 'met' ? 'bg-green' : 'bg-ink-2')} style={barStyle(p * 100)} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Chip def={STATE[st]} pill="pill-o" />
        <span className="text-mute type-small">{targetText(x)}</span>
      </div>
      <p className="m-0 text-mute type-small">{t(x.help)}</p>
    </div>
  );
}

const grid = 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-2.5';

export function OrgDashboardPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  if (!canSeeDashboard(m)) return <NotAvailable />;
  const all = dashboardMetrics(db, m);
  const head = HEADLINE.map((k) => all.find((x) => x.k === k)).filter((x): x is Metric => !!x);
  const members = activePeople(db).length;
  const anyHidden = all.some((x) => x.hidden);
  return (
    <Page wide canvas>
      <PageHeader
        className={phClass}
        title={t('Organisation dashboard')}
        sub={t("Batch targets from each division brief, counted from records saved in dwdg'ONE. For the monthly review.")}
      >
        <span className="text-mute type-small">
          {t('Batch {a} to {b}', { a: fmtD(BATCH.from), b: fmtD(BATCH.to) })}
        </span>
      </PageHeader>
      {anyHidden && (
        <Notice icon="lock" className="mt-4" title={<b>{t('Some divisions are not visible to you')}</b>}>
          <p>
            {t('Their figures read Unknown, not zero. The President, the VP and the Admin see every division.')}
          </p>
        </Notice>
      )}

      <SectionHeading as="h2" plain>
        {t('Batch outcomes')}
      </SectionHeading>
      <div className={grid}>
        {head.map((x) => (
          <MetricCard key={x.k} x={x} big />
        ))}
        <div className={cn(cardSurface, 'grid content-start gap-2 px-4 py-3.5')}>
          <b className="text-d13 font-[550]">{t('Active members')}</b>
          <span className="text-[28px] leading-8 font-semibold type-num">{num(members)}</span>
          <p className="m-0 text-mute type-small">{t('Active accounts, the Board left out. The base of every share.')}</p>
        </div>
      </div>

      {DIVS.map((d) => {
        const list = all.filter((x) => x.div === d.id && !HEADLINE.includes(x.k));
        if (!list.length) return null;
        return (
          <section key={d.id}>
            <SectionHeading as="h2">
              <span className="inline-flex items-center gap-2">
                <BrandIcon id={d.icon} label={false} className="size-[18px]" />
                {d.name}
              </span>
            </SectionHeading>
            <div className={grid}>
              {list.map((x) => (
                <MetricCard key={x.k} x={x} />
              ))}
            </div>
          </section>
        );
      })}

      <SectionHeading as="h2">{t("Not measured in dwdg'ONE yet")}</SectionHeading>
      <p className="mt-0 mb-2 text-mute type-small">
        {t('Targets in the briefs that no saved record can show yet. Agree with each division how to record them.')}
      </p>
      <ul className="m-0 grid gap-1 pl-5 text-d13">
        {NOT_MEASURED.map(([d, text]) => (
          <li key={text}>
            <b className="font-semibold">{divisionOf(d)?.short}</b> {t(text)}
          </li>
        ))}
      </ul>

      <Foot>
        {t(
          'Counted on {d} from the records each division keeps. Unknown means not visible to you; No data yet means nothing to count. There is no overall score and no ranking.',
          { d: fmtD(today()) },
        )}
      </Foot>
    </Page>
  );
}
