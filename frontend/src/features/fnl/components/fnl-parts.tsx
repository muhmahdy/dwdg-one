/* Small pieces the Finance & Legal pages share: money in whole rupiah, a person with the time, an outbound link, the "Next"
   line, the history list, the next-step ledger and the proposed-grants disclosure. From divisions/div-fnl-mcit.js helpers. */
import { useState, type ReactNode } from 'react';
import { PersonLink } from '@/components/shared/PersonLink';
import { Avatar } from '@/components/shared/Avatar';
import { Tag } from '@/components/shared/division-ui';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { dShort, daysBetween, fmtDT, today } from '@/lib/time';
import type { PersonId, Stamp } from '@/types/workspace';
import { GRANT_LABEL, fmtN, type HistoryRow } from '../services/fnl-data';
import { useFieldErrors } from '@/features/external/components/ext-parts';

export { useFieldErrors };

export { fmtDT };

/** Whole rupiah; an empty value reads "Not recorded" (never zero). In the prototype .money is the mono 600 15px figure with a quiet "Rp". */
export const Money = ({
  n,
  neg = false,
  className,
}: {
  n: number | null | undefined;
  neg?: boolean;
  className?: string;
}) =>
  n == null ? (
    <span className="text-mute">{t('Not recorded')}</span>
  ) : (
    <span className={cn('font-mono text-[15px] font-semibold tracking-[-0.01em]', neg && 'text-danger', className)}>
      <small className="mr-[3px] inline! font-mono text-[13px]! font-medium text-mute">Rp</small>
      {n < 0 ? '−' : ''}
      {fmtN(n)}
    </span>
  );

export const Who = ({ id }: { id: PersonId | null | undefined }) =>
  id ? <PersonLink id={id} avatarClass="size-[22px]" /> : <span className="text-mute">{t('Not assigned')}</span>;
export const ByAt = ({ id, at }: { id: PersonId; at: Stamp | null | undefined }) => (
  <>
    <Who id={id} />
    <span className="ml-1.5 text-d12 whitespace-nowrap text-mute">{fmtDT(at)}</span>
  </>
);

/** A link that leaves the app (.ctx fm-link): a quiet chip with the label; an unsafe address is shown as text only. */
export function LinkOut({ label, url }: { label?: string; url: string | null | undefined }) {
  if (!url) return null;
  const safe = /^https:\/\/\S+$/i.test(url);
  const cls =
    'inline-flex h-6 max-w-full items-center gap-2 overflow-hidden rounded-chip bg-fill pr-2 pl-1.5 text-d12 font-medium whitespace-nowrap text-ink-2 no-underline';
  return safe ? (
    <a className={cn(cls, 'hover:bg-hover hover:text-ink')} href={url} target="_blank" rel="noopener noreferrer">
      <Icon name="external" className="size-3.5 flex-none" />
      <span className="truncate">{label ?? url}</span>
    </a>
  ) : (
    <span className={cls}>{label ?? url}</span>
  );
}

export const Links = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex flex-wrap gap-1.5">{children}</span>
);

/** "Next": who acts next and what they do (legal_requester_view). */
export function NextBox({ who, text }: { who: PersonId | null | undefined; text: string }) {
  return (
    <div className="mt-3.5 mb-1 flex items-start gap-2.5 rounded-[10px] bg-surface-2 px-3.5 py-3 text-d13h">
      <Icon name="flag" size="sm" className="mt-0.5 flex-none text-ink-2" />
      <div>
        <b className="mb-0.5 block font-semibold">{t('Next')}</b>
        <span className="flex flex-wrap items-center gap-x-1.5 text-ink-2">
          {who ? <Who id={who} /> : null}
          <span>{text}</span>
        </span>
      </div>
    </div>
  );
}

/** The record's own history, newest first. */
export function HistoryList({ rows }: { rows: HistoryRow[] }) {
  const who = useWho();
  return (
    <div className="flex max-w-[760px] flex-col gap-0.5">
      {[...rows].reverse().map((h, i) => (
        <div
          key={`${h.at}${String(i)}`}
          className="grid min-h-[34px] grid-cols-[22px_1fr_auto] items-center gap-2.5 px-1.5 py-1 text-d13 max-[760px]:grid-cols-[22px_1fr]"
        >
          <Avatar id={h.by} size="xs" className="size-[22px]" />
          <span className="min-w-0 text-ink-2">
            <b className="font-semibold text-ink">{who.first(h.by)}</b> {t(h.what, h.v ?? undefined)}
          </span>
          <time className="text-d12 whitespace-nowrap text-mute type-num max-[760px]:col-start-2">{fmtDT(h.at)}</time>
        </div>
      ))}
    </div>
  );
}

/** A row of figures (.ledger): quiet cells, each a label over a value. The prototype's `.ledger span` rule restyles every span in
 *  a cell, so a figure here reads as a quiet caption line, not as the bold money figure. */
export function Ledger({ items, className }: { items: [label: string, value: ReactNode][]; className?: string }) {
  return (
    <div
      className={cn(
        'my-3 grid grid-cols-4 gap-[3px] max-[760px]:grid-cols-2',
        items.length === 3 && 'grid-cols-3',
        className,
      )}
    >
      {items.map(([l, v]) => (
        <div
          key={l}
          className="rounded-[10px] bg-surface-2 px-3.5 py-3 [&_span]:mb-1 [&_span]:block [&_span]:text-mute [&_span]:type-caption"
        >
          <span>{l}</span>
          <b className="font-bold">{v}</b>
        </div>
      ))}
    </div>
  );
}

/** A quiet box for a form or a note inside a page. */
export const Box = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('my-2.5 rounded-[10px] bg-surface-2 px-4 py-3.5 [&>p]:my-1', className)}>{children}</div>
);
export const Acts = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('mt-3 flex flex-wrap items-center gap-2', className)}>{children}</div>
);
export const Note = ({ children }: { children: ReactNode }) => (
  <p className="mt-3 mb-2 text-mute type-small">{children}</p>
);

/** "Who can do what here (proposed)": separate grants, not job titles. */
export function GrantsBox({ grants, keys }: { grants: Record<string, PersonId[] | undefined>; keys: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="mt-7 border-t border-line-strong pt-3.5 text-d13"
      open={open}
      onToggle={(e) => {
        setOpen(e.currentTarget.open);
      }}
    >
      <summary className="inline-flex min-h-[30px] cursor-pointer list-none items-center gap-1.5 font-[550] text-ink-2 [&::-webkit-details-marker]:hidden">
        <Icon name="shield" size="sm" />
        {t('Who can do what here (proposed)')}
      </summary>
      <dl className="mx-0 mt-4 mb-1.5 grid max-w-[760px] grid-cols-[150px_1fr] gap-x-2.5 gap-y-3 text-d13 max-[760px]:grid-cols-1 [&_dd]:m-0 [&_dd]:flex [&_dd]:min-w-0 [&_dd]:flex-wrap [&_dd]:gap-1 [&_dt]:text-mute">
        {keys.map((k) => (
          <div key={k} className="contents">
            <dt>{t(GRANT_LABEL[k] ?? k)}</dt>
            <dd>
              {(grants[k] ?? []).map((id) => (
                <Who key={id} id={id} />
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="my-2 text-mute type-small">
        {t('Separate grants, not job titles. POL and the division lead confirm them before launch.')}
      </p>
    </details>
  );
}

/** Needed-by with a quiet warning when it is today, tomorrow or past (legal_urgent). */
export function NeededTag({ d }: { d: string | null | undefined }) {
  if (!d) return <span className="text-mute">{t('Not set')}</span>;
  const n = daysBetween(today(), d);
  return (
    <>
      <span className="type-num">{dShort(d)}</span>
      {n < 0 ? (
        <Tag tone="danger" className="ml-1">
          {t('Past due')}
        </Tag>
      ) : n <= 1 ? (
        <Tag tone="warn" className="ml-1">
          {n === 0 ? t('Today') : t('Tomorrow')}
        </Tag>
      ) : null}
    </>
  );
}
