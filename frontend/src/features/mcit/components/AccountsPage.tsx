/* Accounts register: who looks after each organization account and how to get access. Passwords, recovery codes and tokens are
   never stored here, in search or in exports (marketing_account_register, integration-credentials, access_hidden_it, S045).
   From divisions/div-fnl-mcit.js accountsPage. */
import { useState } from 'react';
import { Link } from 'react-router';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Chip, DivCrumb, Tag } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { Field, inputClass, invalidClass } from '@/components/ui/forms';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Empty, NotAvailable, Page, PageHeader, SearchField } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { fmtD, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { isBoardP } from '@/features/fnl/services/fnl-data';
import { Acts, Box, GrantsBox, Who, useFieldErrors } from '@/features/fnl/components/fnl-parts';
import { changeCustodian, requestAccess, verifyCustodian } from '../services/it';
import { ACST, MC, accState, hasSecret, itOf, mcitOf, mg, seeAcc, type Account } from '../services/mcit-data';

export const AccountsCrumb = () => <DivCrumb d={MC} parts={[['accounts-register', t('Accounts')]]} />;

function ChangeForm({ a }: { a: Account }) {
  const db = useWorkspace((w) => w);
  const people = db.people.filter((p) => p.status === 'active' && p.div);
  const [who, setWho] = useState(a.custodian ?? '');
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <div className="grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
        <Field label={t('New custodian')} htmlFor="mc-ac-who" help={fe.help('who')} error={fe.bad('who')}>
          <SelectField
            id="mc-ac-who"
            people
            value={who}
            onChange={(v) => {
              setWho(v);
              fe.clear();
            }}
            options={people.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Field>
        <Field
          label={t('Handover note')}
          htmlFor="mc-ac-why"
          required
          help={fe.help('why', t('Ownership is verified in the provider. No password is copied here.'))}
          error={fe.bad('why')}
        >
          <input
            id="mc-ac-why"
            className={cn(inputClass, fe.bad('why') && invalidClass)}
            value={why}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setWhy(e.target.value);
              fe.clear();
            }}
          />
        </Field>
      </div>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!who) return fe.fail('who', t('Choose the new custodian.'));
            if (!why.trim()) return fe.fail('why', t('Write the handover note.'));
            if (hasSecret(why))
              return fe.fail('why', t('This looks like a password or code. Remove it; IT never needs it here.'));
            void changeCustodian(a.id, who);
          }}
        >
          {t('Save custodian')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setUi((u) => {
              u.form = null;
            });
          }}
        >
          {t('Cancel')}
        </Button>
      </Acts>
    </Box>
  );
}

function AccountCard({ a }: { a: Account }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  const canCust = mg(db, 'custody', m?.id) || !!m?.admin;
  const req = a.request ? itOf(db, a.request) : undefined;
  return (
    <div className="rounded-sheet bg-surface px-4 py-3.5 shadow-sheet">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <b>{a.service}</b>
          {a.hidden && <Tag className="ml-1 bg-ink text-on-ink shadow-none">{t('Hidden account')}</Tag>}
          <p className="mt-0.5 mb-0 text-mute type-small">{a.purpose}</p>
        </div>
        <Chip def={ACST[accState(a, today())]} pill="pill" />
      </div>
      <Meta className="mt-2.5 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[760px]:grid-cols-1 [&_dd]:min-w-0 [&_dd]:flex-wrap">
        <MetaRow label={t('Custodian')}>
          {a.custodian ? <Who id={a.custodian} /> : <Tag unknown>{t('Unknown')}</Tag>}
        </MetaRow>
        <MetaRow label={t('Backup')}>{a.backup ? <Who id={a.backup} /> : '–'}</MetaRow>
        <MetaRow label={t('How to get access')}>{a.access}</MetaRow>
        <MetaRow label={t('Vault entry')}>
          {a.vault ? (
            <>
              {a.vault} <span className="text-mute type-small">{t('(name only)')}</span>
            </>
          ) : (
            <span className="text-mute">{t('None')}</span>
          )}
        </MetaRow>
        {a.renewal && <MetaRow label={t('Renewal')}>{fmtD(a.renewal)}</MetaRow>}
        <MetaRow label={t('Last verified')}>
          {a.verifiedAt ? (
            <>
              {fmtD(a.verifiedAt)} <Who id={a.verifiedBy} />
            </>
          ) : (
            <span className="text-mute">{t('Never')}</span>
          )}
        </MetaRow>
        {req && (
          <MetaRow label={t('Open request')}>
            <Link to={`/it-requests/${req.id}`}>{req.title}</Link>
          </MetaRow>
        )}
      </Meta>
      <Acts>
        {!isBoardP(m) && !a.hidden && (
          <Button
            small
            onClick={() => {
              void requestAccess(a.id);
            }}
          >
            {t('Request access')}
          </Button>
        )}
        {canCust && a.custodian && (
          <Button
            small
            variant="ghost"
            onClick={() => {
              void verifyCustodian(a.id);
            }}
          >
            {t('Confirm custodian')}
          </Button>
        )}
        {canCust && (
          <Button
            small
            variant="ghost"
            onClick={() => {
              setUi((u) => {
                u.form = `acc-${a.id}`;
              });
            }}
          >
            {t('Change custodian')}
          </Button>
        )}
      </Acts>
      {form === `acc-${a.id}` && <ChangeForm a={a} />}
    </div>
  );
}

export function AccountsPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const [q, setQ] = useState('');
  useDivisionWorkspace(MC);
  if (!m)
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const s = mcitOf(db);
  const name = (id: string | null) => db.people.find((p) => p.id === id)?.name ?? '';
  const list = s.accounts
    .filter((a) => seeAcc(a, m))
    .filter((a) => !q || `${a.service} ${a.purpose} ${name(a.custodian)}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page>
      <PageHeader
        title={t('Accounts register')}
        sub={t('Who looks after each organization account and how to get access.')}
      />
      <Notice icon="lock" className="mt-3 mb-3" title={<b>{t('No passwords here')}</b>}>
        <p>
          {t(
            'Passwords, recovery codes and tokens are never stored in this register, in search or in exports. Logins live in the organization password manager.',
          )}
        </p>
      </Notice>
      <SearchField
        label={t('Search accounts or custodians')}
        className="mt-4 mb-3 w-full max-w-[520px]"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
        }}
      />
      <div className="grid gap-2.5">
        {list.length ? (
          list.map((a) => <AccountCard key={a.id} a={a} />)
        ) : (
          <Empty title={t('No account matches')}>{t('Try another name, or ask in Requests to MCIT.')}</Empty>
        )}
      </div>
      <GrantsBox grants={s.grants} keys={['custody', 'triage']} />
    </Page>
  );
}
