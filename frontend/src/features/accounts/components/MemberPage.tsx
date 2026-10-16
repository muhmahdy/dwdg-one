/* One member: membership, the actions the viewer may take (each with the reason when refused), open duties, roles, division
   membership and account history. From screens/accounts.js memberPage. */
import { useState } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import { Avatar, IdentityLine, roleLabel } from '@/components/shared/Avatar';
import { Button, buttonClass } from '@/components/ui/Button';
import { Field, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SettingBox, SettingRow } from '@/components/ui/SettingRows';
import { Chip } from '@/components/ui/StatusBadge';
import { EmptyLine } from '@/components/ui/Headings';
import { NotAvailable, Page, Restricted, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { isBoard } from '@/lib/roles';
import { dShort } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { TaskRow } from '@/features/work/components/TaskRow';
import type { Person } from '@/types/workspace';
import { restoreAccess } from '../services/account-actions';
import { GRANT_ST, accDef, acctOf, fmtD, grantName, mailOf, type AuditEntry } from '../services/acct-data';
import { dutiesOf, dutyCount, unresolvedOf } from '../services/duties';
import { can, canApptView, canMembers, canReason, inView, reviewer } from '../services/rules';
import { AcctCrumb, ByAt, Hint, ReasonRestricted } from './AccountsParts';

export function MemberCrumb({ id }: { id: string }) {
  const p = useWorkspace((db) => db.people.find((x) => x.id === id));
  return (
    <AcctCrumb
      parts={[
        ['members', t('Members')],
        ['', p ? p.name : t('Person')],
      ]}
    />
  );
}

const ACTIONS: [kind: 'transfer' | 'pause' | 'restore' | 'leave', label: string, icon: string, help: string][] = [
  [
    'transfer',
    'Move to another division',
    'arrow',
    'Preview open duties first. Their history stays with the old division.',
  ],
  ['pause', 'Pause access', 'lock', 'Stops sign-in and every function. Work and history stay.'],
  ['restore', 'Restore access', 'undo', 'Lets them sign in again. Roles that ended meanwhile stay ended.'],
  ['leave', 'End membership', 'logout', 'Leaving DWDG or becoming alumni at the end of a term.'],
];

function AccountAction({
  kind,
  label,
  icon,
  help,
  p,
}: {
  kind: (typeof ACTIONS)[number][0];
  label: string;
  icon: string;
  help: string;
  p: Person;
}) {
  const m = useMe();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const c = can(kind, m, p);
  return (
    <>
      <SettingRow label={t(label)} help={c.ok ? t(help) : c.why}>
        {!c.ok ? (
          <Restricted>{t('Not available to you')}</Restricted>
        ) : kind === 'restore' ? (
          !open && (
            <Button
              small
              onClick={() => {
                setOpen(true);
              }}
            >
              <Icon name={icon} />
              {t(label)}
            </Button>
          )
        ) : (
          <Link className={buttonClass('default', true)} to={`/members/${p.id}/${kind}`}>
            <Icon name={icon} />
            {t(label)}
          </Link>
        )}
      </SettingRow>
      {kind === 'restore' && c.ok && open && (
        <div className="mx-4 mb-3 rounded-[10px] bg-surface p-3.5">
          <Field label={t('Note')} htmlFor="acct-rs-note" optional help={t('Recorded in the account audit.')}>
            <textarea
              id="acct-rs-note"
              className={textareaClass}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
              }}
            />
          </Field>
          <div className="flex gap-2">
            <Button
              variant="primary"
              small
              onClick={() => {
                void restoreAccess(p.id, note.trim()).then((ok) => {
                  if (ok) setOpen(false);
                });
              }}
            >
              {t('Restore {who}’s access', { who: p.first })}
            </Button>
            <Button
              variant="ghost"
              small
              onClick={() => {
                setOpen(false);
              }}
            >
              {t('Cancel')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function EventRow({ e }: { e: AuditEntry }) {
  const m = useMe();
  const who = useWho();
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-d13h leading-[21px]">
      {e.actor ? <Avatar id={e.actor} size="sm" /> : <span />}
      <div className="min-w-0 [overflow-wrap:anywhere] [&_b]:font-semibold">
        <b>{who.name(e.actor)}</b> {t(e.verb)}
        {e.detail && <span className="text-mute"> {t(e.detail)}</span>}
        {e.reason && (
          <div className="mt-1.5">
            {canReason(m, e.actor) ? (
              <span className="inline-flex h-6 items-center rounded-chip px-2 text-d12 font-semibold text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
                {e.reason}
              </span>
            ) : (
              <ReasonRestricted />
            )}
          </div>
        )}
      </div>
      <time className="whitespace-nowrap text-mute type-num">{dShort(e.at.slice(0, 10))}</time>
    </div>
  );
}

export function MemberPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const p = db.people.find((x) => x.id === id);
  if (!m || !p || isBoard(p) || !canMembers(m) || !inView(m, p))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const a = acctOf(db);
  const inv = a.invites.find((i) => i.person === p.id);
  const last = a.actions.find(
    (x) => x.person === p.id && x.state === 'applied' && x.kind === (p.status === 'suspended' ? 'pause' : p.status),
  );
  const rows = ACTIONS.filter(([k]) =>
    k === 'restore' ? p.status === 'suspended' : k === 'pause' ? p.status !== 'suspended' : true,
  );
  const grants = a.grants.filter((g) => g.person === p.id).sort((x, y) => (y.from ?? '').localeCompare(x.from ?? ''));
  const mships = a.memberships
    .filter((x) => x.person === p.id)
    .sort((x, y) => (y.from ?? '').localeCompare(x.from ?? ''));
  const hist = a.log.filter((e) => e.person === p.id);
  const d = dutiesOf(db, p.id);
  const un = unresolvedOf(db, p.id);
  const dv = divisionOf(p.div);
  const showReason = !!last && canReason(m, last.by);
  const counts = (
    [
      ['tasks', 'Tasks'],
      ['reviews', 'Reviews'],
      ['projects', 'Projects led'],
      ['decisions', 'Decisions'],
      ['routines', 'Routines'],
      ['resources', 'Resources'],
      ['offersIn', 'Offers unanswered'],
    ] as const
  ).filter(([k]) => d[k].length);
  return (
    <Page>
      <div className="mb-3.5 flex items-center gap-4 max-[600px]:items-start">
        <Avatar id={p.id} size="xl" />
        <div>
          <h1 className="m-0 type-title">{p.name}</h1>
          <p className="mt-1 mb-0 flex flex-wrap items-center gap-2 text-mute">
            {p.status === 'active' && <IdentityLine person={p} />}
            <span>{roleLabel(p)}</span>
            <span>{dv?.name ?? t('Presidency')}</span>
            <Chip def={accDef(p.status)} pill="pill-o" />
          </p>
        </div>
      </div>
      {p.status === 'suspended' && last ? (
        <Notice icon="lock" tone="warn" title={<b>{t('Access paused since {d}', { d: fmtD(last.effective) })}</b>}>
          <p>
            {t('By {who}.', { who: who.name(last.by) })} {showReason ? last.reason : ''}
            {!showReason && (
              <>
                {' '}
                <Restricted>{t('Reason restricted')}</Restricted>
              </>
            )}
          </p>
        </Notice>
      ) : ['left', 'alumni'].includes(p.status) && last ? (
        <Notice
          icon="logout"
          title={
            <b>
              {p.status === 'alumni'
                ? t('Alumni since {d}', { d: fmtD(last.effective) })
                : t('Left DWDG on {d}', { d: fmtD(last.effective) })}
            </b>
          }
        >
          <p>{t('Their work and authorship stay under their name. Current access has ended.')}</p>
        </Notice>
      ) : p.status === 'pending' ? (
        <Notice icon="clock" tone="warn" title={<b>{t('Waiting for the Admin to approve')}</b>}>
          <p>{t('Signing in alone never gives access.')}</p>
          {inv && (
            <Link className={cn(buttonClass('default', true), 'mt-2')} to={`/invites/${inv.id}`}>
              {t('Open the invitation')}
            </Link>
          )}
        </Notice>
      ) : null}
      <SectionHeading as="h2">{t('Membership')}</SectionHeading>
      <Meta className="mt-1 grid-cols-[148px_1fr] max-[600px]:grid-cols-[112px_1fr]">
        <MetaRow label={t('Organization')}>DWDG UII</MetaRow>
        <MetaRow label={t('Batch')}>2026</MetaRow>
        <MetaRow label={t('Workspace')}>
          {dv ? (
            <>
              <BrandIcon id={dv.icon} label={false} className="size-3.5" />
              {dv.name}
            </>
          ) : (
            t('Presidency, all workspaces')
          )}
        </MetaRow>
        <MetaRow label={t('Role')}>
          {roleLabel(p)}
          {p.admin && (
            <span className="ml-1 rounded-chip bg-fill px-1.5 py-0.5 text-d11h font-semibold text-ink-2">Admin</span>
          )}
        </MetaRow>
        <MetaRow label={t('Consultant function')}>{t('Yes, like every member. It stays through any move.')}</MetaRow>
        <MetaRow label={t('Joined')}>
          {p.joined ? fmtD(p.joined) : <span className="text-mute">{t('Not recorded')}</span>}
        </MetaRow>
        {reviewer(m) && (
          <MetaRow label={t('Google account')}>
            <span className="[overflow-wrap:anywhere] type-num">{inv ? (inv.acceptedAs ?? inv.email) : mailOf(p)}</span>
          </MetaRow>
        )}
        {inv && (
          <MetaRow label={t('Invited by')}>
            <ByAt id={inv.createdBy} at={inv.createdAt} />
          </MetaRow>
        )}
        {inv?.approvedBy && (
          <MetaRow label={t('Approved by')}>
            <ByAt id={inv.approvedBy} at={inv.approvedAt} />
          </MetaRow>
        )}
      </Meta>
      <SectionHeading as="h2">{t('Account actions')}</SectionHeading>
      <SettingBox>
        {rows.map(([k, label, icon, help]) => (
          <AccountAction key={k} kind={k} label={label} icon={icon} help={help} p={p} />
        ))}
        {canApptView(m) && (
          <SettingRow
            label={t('Appoint to a role')}
            help={t('Roles change only through a dated appointment. A task never promotes anyone.')}
          >
            <Link className={buttonClass('default', true)} to="/appointments">
              <Icon name="flag" />
              {t('Open appointments')}
            </Link>
          </SettingRow>
        )}
      </SettingBox>
      {un.length > 0 && (
        <>
          <SectionHeading as="h2" count={un.length}>
            {t('Duties left unresolved')}
          </SectionHeading>
          <Rows>
            {un.map((tk) => (
              <TaskRow key={tk.id} task={tk} owner />
            ))}
          </Rows>
        </>
      )}
      <SectionHeading as="h2" count={dutyCount(d)}>
        {t('Open duties')}
      </SectionHeading>
      {counts.length ? (
        <div className="flex flex-wrap gap-2">
          {counts.map(([k, label]) => (
            <span
              key={k}
              className="inline-flex items-baseline gap-1.5 rounded-ctl bg-surface-2 px-3 py-2 text-d13 text-ink-2"
            >
              <b className="text-ink type-num">{d[k].length}</b>
              {t(label)}
            </span>
          ))}
        </div>
      ) : (
        <EmptyLine>{t('None recorded')}</EmptyLine>
      )}
      <SectionHeading as="h2" count={grants.length}>
        {t('Roles')}
      </SectionHeading>
      <Rows>
        {grants.length ? (
          grants.map((g) => (
            <Row key={g.id} className="cursor-default gap-2.5">
              <RowText
                title={<b>{grantName(g)}</b>}
                sub={`${g.from ? t('From {d}', { d: fmtD(g.from) }) : t('Start not recorded')}${g.to ? `, ${t('until {d}', { d: fmtD(g.to) })}` : ''}${g.predecessor ? `, ${t('after {who}', { who: who.name(g.predecessor) })}` : ''}`}
              />
              <span className="flex-none text-d12h text-ink-2 max-[600px]:hidden">
                {g.by ? <ByAt id={g.by} at={g.at} /> : <span className="text-mute">{t('Recorded at setup')}</span>}
              </span>
              <Chip def={GRANT_ST[g.state]} pill="pill-o" />
            </Row>
          ))
        ) : (
          <EmptyLine>{t('Member, no leadership role.')}</EmptyLine>
        )}
      </Rows>
      <SectionHeading as="h2" count={mships.length}>
        {t('Division membership')}
      </SectionHeading>
      <Rows>
        {mships.length ? (
          mships.map((x) => {
            const xd = divisionOf(x.div);
            return (
              <Row key={x.id} className="cursor-default gap-2.5">
                <BrandIcon id={xd?.icon ?? ''} label={false} className="size-4" />
                <RowText
                  title={<b>{xd?.name}</b>}
                  sub={`${x.from ? t('From {d}', { d: fmtD(x.from) }) : t('Start not recorded')}${x.to ? `, ${t('until {d}', { d: fmtD(x.to) })}` : ''}`}
                />
                <Chip def={x.to ? GRANT_ST.ended : GRANT_ST.active} pill="pill-o" />
              </Row>
            );
          })
        ) : (
          <EmptyLine>{t('No division membership. Presidency accounts see all workspaces.')}</EmptyLine>
        )}
      </Rows>
      <SectionHeading as="h2" count={hist.length}>
        {t('Account history')}
      </SectionHeading>
      {hist.length ? (
        <div>
          {hist.map((e) => (
            <EventRow key={e.id} e={e} />
          ))}
        </div>
      ) : (
        <EmptyLine>{t('No account changes recorded yet.')}</EmptyLine>
      )}
      <Hint>{t('Attendance, assessments and authorship keep the division they were recorded in.')}</Hint>
    </Page>
  );
}

export { EventRow };
