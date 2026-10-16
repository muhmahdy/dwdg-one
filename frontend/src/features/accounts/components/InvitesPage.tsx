/* Invitations (flow-admin-invite, flow-invite-delivery, onboarding-invitations): invite only. The invited Google account
   accepts, then the Admin approves each member. From screens/accounts.js invitesPage. */
import { useEffect } from 'react';
import { divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import { Avatar } from '@/components/shared/Avatar';
import { BrandIcon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/forms';
import { Chip } from '@/components/ui/StatusBadge';
import { Empty, NotAvailable, Page, PageHeader, Row, Rows, Toolbar } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { ago, dShort } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { INV_ST, acctOf, invState, type Invite } from '../services/acct-data';
import { canInvView, reviewer } from '../services/rules';
import { AcctCrumb, AcctTabs, Hint, NameMark } from './AccountsParts';
import { InviteButton } from './MembersPage';

export const InvitesCrumb = () => (
  <AcctCrumb
    parts={[
      ['members', t('Members')],
      ['', t('Invitations')],
    ]}
  />
);

type Filter = 'open' | 'active' | 'closed' | 'all';
const G: Record<Filter, (i: Invite) => boolean> = {
  open: (i) => ['pending', 'accepted'].includes(invState(i)),
  active: (i) => invState(i) === 'active',
  closed: (i) => ['expired', 'revoked', 'declined'].includes(invState(i)),
  all: () => true,
};
const FILTERS: [Filter, string][] = [
  ['open', 'Open'],
  ['active', 'Joined'],
  ['closed', 'Expired or revoked'],
  ['all', 'All'],
];

export const openInvite = (id: string) => {
  setUi((u) => {
    u.insp = { type: 'acct-inv', id };
    u.form = null;
  });
};

export function InvitesPage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const f = useUi((u) => (typeof u.acctIf === 'string' ? (u.acctIf as Filter) : 'open'));
  const sel = useUi((u) => (u.insp?.type === 'acct-inv' ? u.insp.id : undefined));
  // a link to /invites/<id> opens that invitation once
  const exists = !!route.id && acctOf(db).invites.some((i) => i.id === route.id);
  useEffect(() => {
    if (route.id && exists) openInvite(route.id);
  }, [route.id, exists]);
  if (!m || !canInvView(m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const a = acctOf(db);
  const list = a.invites.filter(G[f]).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  return (
    <Page wide>
      <PageHeader
        title={t('Invitations')}
        sub={t('Invite only. The invited Google account accepts, then the Admin approves each member.')}
      >
        {reviewer(m) && <InviteButton />}
      </PageHeader>
      <AcctTabs cur="invites" />
      <Toolbar className="mt-1 mb-1.5 gap-2.5">
        <Segmented<Filter>
          label={t('Filter')}
          value={f}
          onChange={(v) => {
            setUi((u) => {
              u.acctIf = v;
            });
          }}
          options={FILTERS.map(([k, label]) => [
            k,
            <>
              {t(label)} <span className="ml-0.5 text-mute type-num">{a.invites.filter(G[k]).length}</span>
            </>,
          ])}
        />
      </Toolbar>
      <Rows>
        {list.length ? (
          list.map((i) => {
            const st = invState(i);
            const dv = divisionOf(i.div);
            const personKnown = i.person && db.people.some((p) => p.id === i.person);
            return (
              <Row
                key={i.id}
                className="gap-2.5"
                selected={sel === i.id}
                onOpen={() => {
                  openInvite(i.id);
                }}
              >
                {personKnown ? <Avatar id={i.person} /> : <NameMark name={i.name} />}
                <div className="min-w-0 flex-1 fade-end overflow-hidden whitespace-nowrap">
                  <b>{i.name}</b>
                  <small className="block text-[length:12.5px] text-mute type-num">{i.email}</small>
                </div>
                <span className="inline-flex w-[72px] flex-none items-center gap-1.5 text-[length:13px] text-ink-2 max-[600px]:hidden">
                  {dv && (
                    <>
                      <BrandIcon id={dv.icon} label={false} className="size-3.5" />
                      {dv.short}
                    </>
                  )}
                </span>
                <Chip def={INV_ST[st] ?? INV_ST.pending ?? ['', '', 'mute']} pill="pill-o" />
                <time
                  className={cn(
                    'w-[84px] flex-none text-right text-[length:12px] text-mute type-num max-[600px]:hidden',
                  )}
                >
                  {st === 'pending' ? t('until {d}', { d: dShort(i.expires) }) : ago(i.history[0]?.at ?? i.createdAt)}
                </time>
              </Row>
            );
          })
        ) : (
          <Empty title={t('No invitations here')}>
            {reviewer(m)
              ? t('Invite someone with their Google account address, workspace and role.')
              : t('HR leads and the Admin send invitations.')}
          </Empty>
        )}
      </Rows>
      <Hint>
        {t(
          'dwdg’ONE doesn’t send email yet. Copy the link and send it yourself. A link never shows anything about DWDG until the right account signs in.',
        )}
      </Hint>
    </Page>
  );
}
