/* Attention (blueprint §4, D62): one card per division. Each says in plain words what is wrong, then lists only the items that
   need someone to act, one sentence and one button each. Divisions with nothing open fold into one "all clear" line. Every count
   comes from the records each division keeps; there is no health score. From screens/perf.js PAGES.attention. */
import { useEffect, useState } from 'react';
import { divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import { Avatar } from '@/components/shared/Avatar';
import { BrandIcon } from '@/components/ui/Icon';
import { badgeMask } from '@/components/ui/icon-data';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { State } from '@/components/ui/StatusBadge';
import { SEV } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { isPres, isVP } from '@/lib/roles';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { buildAttention, openEscalation, statusParts, type AttnItem, type AttnTone } from '../services/attention';
import { escalationsOf } from '../services/escalations';
import { attnDivs, canAttn } from '../services/scope';
import { Foot, cardSurface, phClass } from './PerfParts';
import { PerfCrumb } from './TeamPage';

export const AttentionCrumb = () => <PerfCrumb parts={[['', t('Attention')]]} />;

const TONE: Record<AttnTone, string> = {
  warn: 'bg-warning-mark',
  danger: 'bg-danger',
  ink2: 'bg-ink-2',
  mute: 'bg-mute',
};

const Mark = ({ icon, className }: { icon: string; className: string }) => (
  <i className={cn('flex-none mask-icon', className)} style={{ ['--m' as string]: badgeMask(icon) }} />
);

function AttnRow({ item }: { item: AttnItem }) {
  const sev = item.severity;
  return (
    <div
      className="flex cursor-pointer items-center gap-3 px-4 py-2.5 shadow-[inset_0_1px_0_var(--line)] hover:bg-hover max-[600px]:flex-wrap compact:py-[11px] simple:py-[7px]"
      role="button"
      tabIndex={0}
      onClick={item.open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) item.open();
      }}
    >
      <Mark icon={item.icon} className={cn('mt-px size-[18px]', TONE[item.tone])} />
      <div className="min-w-0 flex-1 max-[600px]:basis-[calc(100%-40px)]">
        <b className="block text-d14 leading-[1.35] font-medium compact:leading-5 simple:text-[16px] simple:leading-[21px]">{item.text}</b>
        <small className="mt-0.5 block text-d12h leading-[19px] text-mute compact:leading-5 simple:mt-[5px] simple:leading-6">{item.sub}</small>
      </div>
      {sev && (
        <State
          label={t(SEV[sev][0])}
          icon="warning"
          tone={sev === 'high' ? 'danger' : sev === 'medium' ? 'warn' : 'mute'}
          className="max-[600px]:ml-[30px]"
        />
      )}
      {item.button && (
        <span
          className={cn('flex flex-none cursor-default', !item.button.primary && 'max-[600px]:hidden')}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            className={cn(
              'inline-flex h-[var(--ctl-h-sm)] cursor-pointer items-center rounded-ctl border-0 px-2.5 text-d13 font-[550] whitespace-nowrap active:scale-[.98] simple:px-4 simple:text-[16px]',
              item.button.primary
                ? 'bg-ink text-on-ink shadow-press'
                : 'bg-surface text-ink shadow-[0_0_0_1px_var(--line-strong)] hover:bg-hover',
            )}
            onClick={item.button.run}
          >
            {item.button.label}
          </button>
        </span>
      )}
    </div>
  );
}

function CardHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: React.ReactNode }) {
  return (
    <header className="flex items-center gap-3 px-4 pt-3.5 pb-3">
      <span className="grid size-[38px] flex-none place-items-center rounded-xl bg-surface-2">{icon}</span>
      <div>
        <h2 className="m-0 text-[length:16px] font-semibold">{title}</h2>
        <p className="mt-0.5 mb-0 text-[length:13.5px] text-ink-2">{sub}</p>
      </div>
    </header>
  );
}

function DivisionCard({ d, list }: { d: string; list: AttnItem[] }) {
  const [all, setAll] = useState(false);
  const dv = divisionOf(d);
  const shown = all ? list : list.slice(0, 5);
  const parts = statusParts(list);
  return (
    <section id={`at-${d}`} className={cn('mt-3.5 overflow-hidden', cardSurface)}>
      <CardHead
        icon={dv ? <BrandIcon id={dv.icon} label={false} className="size-[22px]" /> : null}
        title={dv?.name ?? ''}
        sub={parts.map((p, i) => (
          <span key={p.text}>
            {i > 0 && ', '}
            {p.red ? <em className="font-semibold text-danger not-italic">{p.text}</em> : p.text}
          </span>
        ))}
      />
      <div>
        {shown.map((x) => (
          <AttnRow key={x.key} item={x} />
        ))}
        {list.length > 5 && (
          <button
            type="button"
            className="mx-4 mt-0.5 mb-3 cursor-pointer border-0 bg-transparent py-1 text-[length:12.5px] font-semibold text-ink-2 hover:text-ink hover:underline simple:text-[length:14px]"
            onClick={() => {
              setAll(!all);
            }}
          >
            {all ? t('Show fewer') : t('Show all {n}', { n: list.length })}
          </button>
        )}
      </div>
    </section>
  );
}

export function AttentionPage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const exists = !!route.id && escalationsOf(db).some((e) => e.id === route.id);
  // a link to /attention/<escalation> opens that escalation once
  useEffect(() => {
    if (route.id && exists) openEscalation(route.id);
    else setUi((u) => void (u.perfOpened = null));
  }, [route.id, exists]);
  if (!m || !canAttn(m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const ds = attnDivs(m);
  const { mine, open, clear } = buildAttention(db, m, ds);
  const sub = isPres(m)
    ? t('Everything that needs the presidency across all six divisions')
    : isVP(m)
      ? t('Your reporting divisions')
      : m.admin
        ? t('All divisions (Admin)')
        : t('{d}, and work waiting between it and other divisions', { d: divisionOf(m.div)?.name ?? '' });
  return (
    <Page canvas>
      <PageHeader className={phClass} title={t('Attention')} sub={sub} />
      {mine.length > 0 && (
        <section
          className={cn(
            'mt-3.5 overflow-hidden rounded-[var(--cs-r,14px)] bg-surface shadow-[0_0_0_1.5px_var(--ink),var(--cs-card,0_0_0_1px_var(--line-strong))]',
          )}
        >
          <CardHead
            icon={<Avatar id={m.id} size="sm" />}
            title={t('Needs you')}
            sub={
              <span className="font-medium text-danger">
                {plural(mine.length, '{n} thing only you can do', '{n} things only you can do')}
              </span>
            }
          />
          {mine.map((x) => (
            <AttnRow key={x.key} item={x} />
          ))}
        </section>
      )}
      {open.map((c) => (
        <DivisionCard key={c.d} d={c.d} list={c.list} />
      ))}
      {clear.length > 0 && (
        <p className="mx-1.5 mt-4 mb-0 flex items-center gap-2 text-[length:14px] font-medium text-green-ink">
          <Mark icon="check" className="size-[18px] bg-green-ink" />
          <span>
            {clear.length === ds.length
              ? t('Every division is clear. Nothing is stuck, waiting or overdue.')
              : t('All clear: {list}', { list: clear.map((c) => divisionOf(c.d)?.short ?? '').join(', ') })}
          </span>
        </p>
      )}
      <Foot>{t('Counted from the records each division keeps. There is no health score.')}</Foot>
    </Page>
  );
}
