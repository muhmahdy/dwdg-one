/* Small pieces the Accounts pages share: the tabs, "who, when" marks, the "what changes" list and the restricted-reason mark.
   From screens/accounts.js (tabs, byAt, avName, acct-delta). */
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/shared/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Restricted, TabLinks } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { canApptView, canAudit, canHoView, canInvView, canMembers } from '../services/rules';

export const AcctCrumb = ({ parts }: { parts: [href: string, text: string][] }) => (
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

/** Members, Invitations, Appointments, Presidency and the audit, for the ones the viewer may open. */
export function AcctTabs({ cur }: { cur: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const tabs = (
    [
      ['members', 'Members', canMembers(m)],
      ['invites', 'Invitations', canInvView(m)],
      ['appointments', 'Appointments', canApptView(m)],
      ['handover', 'Presidency', canHoView(db, m)],
      ['members/audit', 'Account audit', canAudit(m)],
    ] as [string, string, boolean][]
  ).filter((x) => x[2]);
  if (tabs.length < 2) return null;
  return (
    <TabLinks
      className="mt-2.5 mb-3.5 gap-6 overflow-x-auto"
      label={t('Accounts')}
      tabs={tabs.map(([to, label]) => ({ to: `/${to}`, label: t(label), on: cur === to }))}
    />
  );
}

/** "Mahdy, 6 Oct 2026 at 09:30" with the avatar, or a quiet "Recorded at setup". */
export function ByAt({ id, at }: { id: string | null | undefined; at: string | null | undefined }) {
  const who = useWho();
  if (!id || !at) return <span className="text-mute">{t('Recorded at setup')}</span>;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Avatar id={id} size="xs" />
      <span className="min-w-0 truncate">{who.stamp(id, at)}</span>
    </span>
  );
}

/** Initials in the avatar style for someone who is not a person record yet (an invitation). */
export const NameMark = ({ name, className }: { name: string; className?: string }) => (
  <span
    className={cn(
      'inline-grid size-9 flex-none place-items-center rounded-full bg-fill text-[length:12px] font-semibold text-ink-2',
      className,
    )}
    role="img"
    aria-label={name}
  >
    {name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')}
  </span>
);

export const Hint = ({ children }: { children: ReactNode }) => (
  <p className="mt-[18px] mb-0 max-w-[80ch] text-mute type-small">{children}</p>
);

export const ReasonRestricted = () => <Restricted>{t('Reason restricted')}</Restricted>;

export interface DeltaItem {
  kind?: 'plus' | 'minus';
  icon: string;
  text: ReactNode;
}

/** The "what changes" list: a plus, a minus or a plain check, each with one sentence. */
export function DeltaList({ items }: { items: DeltaItem[] }) {
  return (
    <ul className="m-0 mt-1 grid max-w-[72ch] list-none gap-2 p-0 text-d13h">
      {items.map((x, i) => (
        <li key={i} className="flex items-start gap-2.5 text-ink-2">
          <Icon
            name={x.icon}
            className={cn(
              'mt-0.5 flex-none text-mute',
              x.kind === 'plus' && 'text-green-ink',
              x.kind === 'minus' && 'text-danger',
            )}
          />
          <span>{x.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** Two-line text of a row: a bold line and a quiet one. */
export const Duty = ({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children?: ReactNode }) => (
  <div className="flex min-h-[var(--row-h)] items-center gap-3 rounded-ctl bg-surface-2 px-2.5 py-1.5 max-[600px]:flex-wrap">
    <div className="min-w-0 flex-1">
      <b className="block truncate font-[550]">{title}</b>
      {sub != null && <small className="block text-d12h text-mute">{sub}</small>}
    </div>
    {children}
  </div>
);
