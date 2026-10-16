/* Small pieces the Performance pages share: the rings (R040, D61), their legend, state chips, the period and view
   controls, and the "Unknown, never zero" marks. From screens/perf.js. */
import type { CSSProperties, ReactNode } from 'react';
import { SelectField } from '@/components/ui/SelectField';
import { Segmented } from '@/components/ui/forms';
import { State, type Tone } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { setSession } from '@/lib/session';
import { useSession } from '@/lib/workspace/hooks';
import { RATING, type Rating } from '@/features/work/services/signoff';
import { periodOf, periods, type RingValue, type TaskFacts } from '../services/facts';

/** The card surface used on every Performance page (comfortable radius and shadow, with the plain fallback). */
export const cardSurface = 'rounded-[var(--cs-r,14px)] bg-surface shadow-[var(--cs-card,0_0_0_1px_var(--line-strong))]';

/** Ring colours: the delivered ring is the brand green, the other two step lighter. */
export const ringVars =
  '[--rg-del:var(--green)] [--rg-att:#0E8A4B] [--rg-hand:#7FD6A6] dark:[--rg-att:#2FAF6B] dark:[--rg-hand:#A6E9C3]';

/** The page header inside a comfortable canvas page gets 4px side padding (calm.css .cs-canvas .ph). */
export const phClass = 'comfortable:px-1';

export const Unknown = ({ label }: { label?: string }) => <span className="text-mute">{label ?? t('Unknown')}</span>;

export const Dash = () => <span className="text-mute">–</span>;

/** A state word from a [label, icon, tone] definition. */
export const Chip = ({ def, pill = '' }: { def: readonly [string, string, Tone]; pill?: '' | 'pill' | 'pill-o' }) => (
  <State label={t(def[0])} icon={def[1]} tone={def[2]} pill={pill} />
);

export type RingKey = 'del' | 'att' | 'hand';
export const RING_ORDER: RingKey[] = ['del', 'att', 'hand'];
const RING_LABEL: Record<RingKey, string> = {
  del: 'Delivered on time',
  att: 'Meetings attended',
  hand: 'Hand-ins accepted',
};
const DOT: Record<RingKey, string> = {
  del: 'bg-[var(--rg-del)]',
  att: 'bg-[var(--rg-att)]',
  hand: 'bg-[var(--rg-hand)]',
};
const STROKE: Record<RingKey, string> = {
  del: 'stroke-[var(--rg-del)]',
  att: 'stroke-[var(--rg-att)]',
  hand: 'stroke-[var(--rg-hand)]',
};

export type RingData = Partial<Record<RingKey, RingValue | null>>;

/** Concentric rings, one recorded ratio each. Never added up, averaged or sorted by (D30). Nothing recorded is a dashed track. */
export function Rings({ f, keys = RING_ORDER, size = 'md' }: { f: RingData; keys?: RingKey[]; size?: 'md' | 'lg' }) {
  const three = keys.length === 3;
  const R: Record<RingKey, number> = { del: 42, att: 31, hand: 20 };
  const w = three ? 9 : 11;
  const label = keys
    .map((k) => {
      const v = f[k];
      return `${t(RING_LABEL[k])}: ${v ? t('{n} of {of}', { n: v.n, of: v.of }) : t('No record yet')}`;
    })
    .join('. ');
  return (
    <svg
      className={cn('flex-none', size === 'lg' ? 'size-[148px] max-[600px]:size-[120px]' : 'size-[92px]')}
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
    >
      {keys.map((k, i) => {
        const r = three ? R[k] : ([40, 26][i] ?? 40);
        const c = 2 * Math.PI * r;
        const v = f[k];
        if (!v)
          return (
            <circle
              key={k}
              className="fill-none stroke-line-strong [stroke-dasharray:1.5_3.5] [stroke-linecap:round]"
              cx="50"
              cy="50"
              r={r}
              strokeWidth={w * 0.5}
            />
          );
        const p = v.of ? Math.min(1, v.n / v.of) : 0;
        return (
          <g key={k}>
            <circle
              className={cn('fill-none opacity-[.16] [stroke-linecap:round]', STROKE[k])}
              cx="50"
              cy="50"
              r={r}
              strokeWidth={w}
            />
            {p > 0 && (
              <circle
                className={cn(
                  'fill-none transition-[stroke-dasharray] duration-[400ms] [stroke-linecap:round] motion-reduce:transition-none',
                  STROKE[k],
                )}
                cx="50"
                cy="50"
                r={r}
                strokeWidth={w}
                strokeDasharray={`${(p * c).toFixed(2)} ${c.toFixed(2)}`}
                transform="rotate(-90 50 50)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

const lineText: Record<RingKey, [on: string, none: string]> = {
  del: ['on time', 'No finished work yet'],
  att: ['meetings', 'No finalized meeting yet'],
  hand: ['hand-ins accepted', 'No hand-in assessed yet'],
};

/** One legend line beside a ring: "3 of 4 on time", or the quiet reason there is nothing yet. */
export function RingLine({ f, k, extra, big = false }: { f: RingData; k: RingKey; extra?: ReactNode; big?: boolean }) {
  const v = f[k];
  return (
    <li className="flex min-w-0 items-baseline gap-2">
      <i className={cn('flex-none -translate-y-px rounded-full', big ? 'size-[11px]' : 'size-[9px]', DOT[k])} />
      <span className="min-w-0">
        {v ? (
          <>
            <b className="font-semibold! text-ink type-num">{t('{n} of {of}', { n: v.n, of: v.of })}</b>{' '}
            {t(lineText[k][0])}
          </>
        ) : (
          <Unknown label={t(lineText[k][1])} />
        )}
        {extra}
      </span>
    </li>
  );
}

export const RingLines = ({ children, big = false }: { children: ReactNode; big?: boolean }) => (
  <ul
    className={cn(
      'm-0 grid min-w-0 list-none gap-[7px] p-0 text-[length:13.5px] text-ink-2',
      big && 'gap-3 text-[length:15px]',
    )}
  >
    {children}
  </ul>
);

export const Late = ({ children }: { children: ReactNode }) => (
  <em className="font-medium text-warning not-italic">{children}</em>
);

/** The ring legend above a list of people (what each ring means, and what a dashed track is). */
export function RingKeyRow({ keys = RING_ORDER }: { keys?: RingKey[] }) {
  return (
    <div className="mx-1.5 mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[length:12.5px] font-medium text-mute">
      {keys.map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <i className={cn('size-[9px] flex-none -translate-y-px rounded-full', DOT[k])} />
          {t(RING_LABEL[k])}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <i className="size-[9px] flex-none -translate-y-px rounded-full shadow-[inset_0_0_0_1.5px_var(--line-strong)]" />
        {t('Nothing recorded yet')}
      </span>
    </div>
  );
}

const RATE_TONE: Record<Rating, string> = {
  excellent: 'text-green-ink',
  good: 'text-green-ink',
  'needs-work': 'text-warning-mark',
};
const RATINGS: Rating[] = ['excellent', 'good', 'needs-work'];

/** "2 Excellent, 1 Good": the accepted hand-ins by rating, in words. */
export function RateWords({ tf }: { tf: TaskFacts }) {
  const on = RATINGS.filter((r) => tf[`r-${r}`].length);
  if (!on.length) return null;
  return (
    <>
      {on.map((r, i) => (
        <span key={r}>
          {i > 0 && ', '}
          <span className={cn('font-semibold', RATE_TONE[r])}>
            {tf[`r-${r}`].length} {t(RATING[r][0])}
          </span>
        </span>
      ))}
    </>
  );
}

export const hasRateWords = (tf: TaskFacts) => RATINGS.some((r) => tf[`r-${r}`].length);

// ---------- controls ----------
export function PeriodSelect() {
  const k = useSession((s) => (typeof s.perfPeriod === 'string' ? s.perfPeriod : 'all'));
  const cur = periodOf(k);
  return (
    <SelectField
      small
      label={t('Period')}
      value={cur.k}
      onChange={(v) => {
        setSession({ perfPeriod: v });
      }}
      options={periods().map((p) => ({ value: p.k, label: p.label }))}
    />
  );
}

export type PerfView = 'simple' | 'rings';
export const usePerfView = (): PerfView => useSession((s) => (s.perfView === 'rings' ? 'rings' : 'simple'));
export const usePeriod = () => periodOf(useSession((s) => (typeof s.perfPeriod === 'string' ? s.perfPeriod : 'all')));

export function ViewSeg() {
  const v = usePerfView();
  return (
    <Segmented<PerfView>
      label={t('View')}
      value={v}
      options={[
        ['simple', t('Simple')],
        ['rings', t('Rings')],
      ]}
      onChange={(x) => {
        setSession({ perfView: x });
      }}
    />
  );
}

export const Foot = ({ children }: { children: ReactNode }) => (
  <p className="mt-[18px] mb-0 max-w-[80ch] text-mute type-small comfortable:mx-1.5">{children}</p>
);

export const NoteLine = ({ children }: { children: ReactNode }) => (
  <p className="mt-3.5 mb-2 text-mute type-small">{children}</p>
);

export const barStyle = (pct: number): CSSProperties => ({ width: `${pct}%` });
