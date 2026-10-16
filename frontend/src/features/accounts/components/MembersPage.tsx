/* Members (flow-admin-proof 9, hr_roster_change): everyone in view by account state and division, with a note when duties were
   left unresolved. From screens/accounts.js membersList. */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DIVS, divisionOf } from '@/app/config/org';
import { Avatar, IdentityLine, roleLabel } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { Chip } from '@/components/ui/StatusBadge';
import { SelectField } from '@/components/ui/SelectField';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows, Toolbar } from '@/components/ui/page';
import { rank } from '@/lib/access';
import { plural, t } from '@/lib/i18n';
import { isBoard, wideView } from '@/lib/roles';
import { setUi } from '@/lib/workspace/transaction';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { Person } from '@/types/workspace';
import { accDef, acctOf } from '../services/acct-data';
import { unresolvedOf } from '../services/duties';
import { canMembers, inView, reviewer } from '../services/rules';
import { AcctTabs, Hint } from './AccountsParts';

type Filter = 'current' | 'waiting' | 'paused' | 'former';
const GROUPS: Record<Filter, (p: Person) => boolean> = {
  current: (p) => p.status === 'active',
  waiting: (p) => p.status === 'pending',
  paused: (p) => p.status === 'suspended',
  former: (p) => ['left', 'alumni', 'declined'].includes(p.status),
};
const FILTERS: [Filter, string][] = [
  ['current', 'Active'],
  ['waiting', 'Waiting'],
  ['paused', 'Paused'],
  ['former', 'Former'],
];

/** Opens the invitation form in the side panel on the Invitations page. */
export const openInviteForm = () => {
  setUi((u) => {
    u.form = null;
    u.insp = { type: 'acct-inv-new' };
  });
};

export function InviteButton() {
  const navigate = useNavigate();
  return (
    <Button
      variant="primary"
      onClick={() => {
        openInviteForm();
        void navigate('/invites');
      }}
    >
      <Icon name="plus" />
      {t('Invite someone')}
    </Button>
  );
}

export function MembersPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  const [f, setF] = useState<Filter>('current');
  const [dv, setDv] = useState('');
  if (!m || !canMembers(m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const a = acctOf(db);
  const pool = db.people.filter((p) => !isBoard(p) && inView(m, p) && (!dv || p.div === dv));
  const list = pool.filter(GROUPS[f]);
  const groups = [
    { id: null as string | null, name: t('Presidency') },
    ...DIVS.map((d) => ({ id: d.id, name: d.name })),
  ]
    .map((g) => ({
      ...g,
      ps: list
        .filter((p) => (p.div ?? null) === g.id)
        .sort((x, y) => rank(y) - rank(x) || x.name.localeCompare(y.name)),
    }))
    .filter((g) => g.ps.length);
  const unres = pool.filter((p) => unresolvedOf(db, p.id).length);
  const empty =
    f === 'waiting'
      ? t('New members appear here after they accept an invitation.')
      : f === 'paused'
        ? t('No account is paused.')
        : f === 'former'
          ? t('No one has left or become alumni yet.')
          : t('Nobody matches this filter.');
  return (
    <Page wide>
      <PageHeader
        title={t('Members')}
        sub={
          wideView(m)
            ? t('Everyone in DWDG UII, batch 2026. Accounts, roles and membership changes.')
            : t('{d} only. Pausing access works below your own rank.', { d: divisionOf(m.div)?.name ?? '' })
        }
      >
        {reviewer(m) && <InviteButton />}
      </PageHeader>
      <AcctTabs cur="members" />
      {unres.length > 0 && wideView(m) && (
        <Notice
          icon="warning"
          tone="warn"
          title={
            <b>
              {plural(unres.length, '{n} person has duties left unresolved', '{n} people have duties left unresolved')}
            </b>
          }
        >
          <p>{unres.map((p) => p.name).join(', ')}</p>
        </Notice>
      )}
      <Toolbar className="mt-1 mb-1.5 gap-2.5">
        <Segmented<Filter>
          label={t('Account state')}
          value={f}
          onChange={setF}
          options={FILTERS.map(([k, label]) => [
            k,
            <>
              {t(label)} <span className="ml-0.5 text-mute type-num">{pool.filter(GROUPS[k]).length}</span>
            </>,
          ])}
        />
        {wideView(m) && (
          <SelectField
            small
            label={t('Division')}
            value={dv}
            onChange={setDv}
            options={[{ value: '', label: t('All divisions') }, ...DIVS.map((d) => ({ value: d.id, label: d.name }))]}
          />
        )}
      </Toolbar>
      {groups.length ? (
        groups.map((g) => (
          <div key={g.id ?? 'pres'}>
            <h3 className="mt-[18px] mb-1 flex items-center gap-2 font-semibold! type-small">
              {g.id && <BrandIcon id={divisionOf(g.id)?.icon ?? ''} label={false} className="size-4" />}
              {g.name} <span className="text-mute type-num">{g.ps.length}</span>
            </h3>
            <Rows>
              {g.ps.map((p) => {
                const u = unresolvedOf(db, p.id).length;
                return (
                  <Row
                    key={p.id}
                    className="gap-2.5"
                    onOpen={() => {
                      void navigate(`/members/${p.id}`);
                    }}
                  >
                    <Avatar id={p.id} />
                    <RowText title={<b>{p.name}</b>} sub={`${roleLabel(p)}${p.admin ? ', Admin' : ''}`} />
                    {p.status === 'active' && <IdentityLine person={p} />}
                    {u > 0 && <Chip def={[t('{n} unresolved', { n: u }), 'warning', 'warn']} pill="pill-o" />}
                    {p.status !== 'active' && <Chip def={accDef(p.status)} pill="pill-o" />}
                  </Row>
                );
              })}
            </Rows>
          </div>
        ))
      ) : (
        <Empty title={t('Nobody here')}>{empty}</Empty>
      )}
      {m.admin && (
        <>
          <SectionHeading as="h2" count={a.hidden.length}>
            {t('Hidden accounts')}
          </SectionHeading>
          <Rows>
            {a.hidden.map((h) => (
              <Row key={h.id} className="cursor-default gap-2.5">
                <span className="inline-grid size-9 flex-none place-items-center rounded-full bg-fill">
                  <Icon name="shield" />
                </span>
                <RowText
                  title={<b>{t(h.label)}</b>}
                  sub={t('Hidden from search, pickers, the directory and exports. Only the Admin sees it here.')}
                />
                <Chip def={['Powers not decided', 'info', 'mute']} pill="pill-o" />
              </Row>
            ))}
          </Rows>
        </>
      )}
      <Hint>
        {t('One person record for each member. A move, a pause or leaving never deletes their work or history.')}
      </Hint>
    </Page>
  );
}
