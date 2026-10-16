/* Account audit: invitations, approvals, moves, pauses, appointments and handovers with reasons. Only the Admin and the
   President see it; workspace Changes show only that something changed. From screens/accounts.js auditPage. */
import { Link } from 'react-router';
import { Avatar } from '@/components/shared/Avatar';
import { EmptyLine } from '@/components/ui/Headings';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { dShort } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { acctOf } from '../services/acct-data';
import { canAudit } from '../services/rules';
import { AcctCrumb, AcctTabs, Hint } from './AccountsParts';

export const AuditCrumb = () => (
  <AcctCrumb
    parts={[
      ['members', t('Members')],
      ['', t('Account audit')],
    ]}
  />
);

export function AuditPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  if (!m || !canAudit(m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const log = acctOf(db).log;
  return (
    <Page>
      <PageHeader
        title={t('Account audit')}
        sub={t(
          'Invitations, approvals, moves, pauses, appointments and handovers, with reasons. Only the Admin and the President see this.',
        )}
      />
      <AcctTabs cur="members/audit" />
      {log.length ? (
        <div>
          {log.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-d13h leading-[21px]"
            >
              {e.actor ? <Avatar id={e.actor} size="sm" /> : <span />}
              <div className="min-w-0 [overflow-wrap:anywhere] [&_b]:font-semibold">
                <b>{who.name(e.actor)}</b> {t(e.verb)}{' '}
                {e.actor === e.person ? null : e.ref ? (
                  <Link className="font-[550] text-ink no-underline hover:underline" to={`/${e.ref}`}>
                    {e.name}
                  </Link>
                ) : (
                  e.name
                )}
                {e.detail && <span className="text-mute"> {t(e.detail)}</span>}
                {e.reason && (
                  <div className="mt-1.5">
                    <span className="inline-flex h-6 items-center rounded-chip px-2 text-d12 font-semibold text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
                      {t(e.reason)}
                    </span>
                  </div>
                )}
              </div>
              <time className="whitespace-nowrap text-mute type-num">
                {dShort(e.at.slice(0, 10))} {e.at.slice(11, 16)}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <EmptyLine>{t('Nothing recorded yet.')}</EmptyLine>
      )}
      <Hint>{t('Workspace Changes show only that something changed. Reasons and private details stay here.')}</Hint>
    </Page>
  );
}
