/* Side panels of Invitations: the new invitation form (acct-inv-new) and one invitation with its steps, history and the
   actions the viewer may take (acct-inv). From screens/accounts.js INSP['acct-inv-new'] and INSP['acct-inv']. */
import { useState } from 'react';
import { Link } from 'react-router';
import { DIVS, ROLES, divisionOf } from '@/app/config/org';
import type { InspectorRef } from '@/app/ui-state';
import { Avatar } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Button, buttonClass } from '@/components/ui/Button';
import { Field, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Steps } from '@/components/ui/Steps';
import { Chip } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { isAdmin } from '@/lib/roles';
import { dShort } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import type { DivisionId } from '@/types/workspace';
import { INV_ST, acctOf, fmtD, invState } from '../services/acct-data';
import {
  approveInvite,
  copyInviteLink,
  correctInvite,
  createInvite,
  declineInvite,
  inviteProblem,
  renewInvite,
  revokeInvite,
  sameName,
  validEmail,
} from '../services/invite-actions';
import { canInvView, reviewer } from '../services/rules';
import { startInviteAsInvitee } from '../services/sign-in';
import { ByAt, ReasonRestricted } from './AccountsParts';
import { openInvite } from './InvitesPage';

const h2 = 'mt-3 mb-1 type-h2';
const quiet = 'text-mute type-small';
const Acts = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3 flex flex-wrap gap-2">{children}</div>
);
const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);

function NewInvitePanel() {
  const m = useMe();
  const db = useWorkspace((w) => w);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [div, setDiv] = useState<DivisionId>(m?.div && m.div !== 'hr' ? m.div : 'sng');
  const [days, setDays] = useState('14');
  const [err, setErr] = useState<{ field: 'name' | 'email'; text: string } | null>(null);
  const [dup, setDup] = useState<string | null>(null);
  if (!m || !reviewer(m))
    return (
      <>
        <InspectorHead>{t('Invite someone')}</InspectorHead>
        <p className="text-mute">{t('HR leads and the Admin send invitations.')}</p>
      </>
    );
  const submit = () => {
    const f = { name, email, div, days: Number(days) };
    const problem = inviteProblem(db, f);
    if (problem) {
      setErr(problem);
      return;
    }
    const same = sameName(db, name);
    if (same && dup !== same.name) {
      setDup(same.name);
      return;
    }
    setErr(null);
    void createInvite(f).then((id) => {
      if (id) openInvite(id);
    });
  };
  const bad = (f: 'name' | 'email') => err?.field === f;
  return (
    <>
      <InspectorHead>{t('Invite someone')}</InspectorHead>
      <h2 className={h2}>{t('New invitation')}</h2>
      <p className={quiet}>{t('Nothing is shared until the invited account accepts and the Admin approves.')}</p>
      <Field label={t('Name')} htmlFor="acct-in-name" help={bad('name') ? err?.text : undefined} error={bad('name')}>
        <input
          id="acct-in-name"
          className={cn(inputClass, bad('name') && invalidClass)}
          placeholder={t('As the person writes it')}
          value={name}
          autoFocus
          autoComplete="off"
          onChange={(e) => {
            setName(e.target.value);
            setDup(null);
          }}
        />
      </Field>
      <Field
        label={t('Google account')}
        htmlFor="acct-in-mail"
        help={
          bad('email')
            ? err?.text
            : t('Acceptance must come from this exact account. A university domain alone is not membership.')
        }
        error={bad('email')}
      >
        <input
          id="acct-in-mail"
          type="email"
          className={cn(inputClass, bad('email') && invalidClass)}
          placeholder="name@students.uii.ac.id"
          value={email}
          autoComplete="off"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Workspace')} htmlFor="acct-in-div">
        <SelectField
          id="acct-in-div"
          value={div}
          onChange={(v) => {
            setDiv(v as DivisionId);
          }}
          options={DIVS.map((d) => ({ value: d.id, label: d.name }))}
        />
      </Field>
      <Field label={t('Role')} htmlFor="acct-in-role" help={t('Leadership roles come later through an appointment.')}>
        <SelectField
          id="acct-in-role"
          value="member"
          onChange={() => undefined}
          options={[{ value: 'member', label: t('Member') }]}
        />
      </Field>
      <Field label={t('Link works for')} htmlFor="acct-in-exp" help={t('Proposed default: 14 days.')}>
        <SelectField
          id="acct-in-exp"
          value={days}
          onChange={setDays}
          options={[
            { value: '7', label: t('7 days') },
            { value: '14', label: t('14 days') },
            { value: '30', label: t('30 days') },
          ]}
        />
      </Field>
      {dup && (
        <Notice icon="warning" tone="warn" title={<b>{t('{who} already has this name', { who: dup })}</b>}>
          <p>
            {t(
              'A matching name is not proof it’s the same person. Check the Google account, then create the invitation anyway or change it.',
            )}
          </p>
        </Notice>
      )}
      <Acts>
        <Button variant="primary" onClick={submit}>
          {dup ? t('Create anyway') : t('Create invitation')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

type Form = 'edit' | 'revoke' | 'decline' | null;

function InvitePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const i = acctOf(db).invites.find((x) => x.id === insp.id);
  const [form, setForm] = useState<Form>(null);
  const [name, setName] = useState(i?.name ?? '');
  const [email, setEmail] = useState(i?.email ?? '');
  const [div, setDiv] = useState<DivisionId>(i?.div ?? 'sng');
  const [why, setWhy] = useState('');
  const [err, setErr] = useState<string | null>(null);
  if (!m || !i || !canInvView(m))
    return (
      <>
        <InspectorHead>{t('Invitation')}</InspectorHead>
        <p className="text-mute">{t('This is not available to you.')}</p>
      </>
    );
  const st = invState(i);
  const r = reviewer(m);
  const step = ({ pending: 1, expired: 1, accepted: 2, active: 3 } as Record<string, number>)[st] ?? 0;
  const dv = divisionOf(i.div);
  const open = (f: Form) => {
    setForm(f);
    setErr(null);
    setWhy('');
  };
  const cancel = (
    <Button
      variant="ghost"
      small
      onClick={() => {
        open(null);
      }}
    >
      {t('Cancel')}
    </Button>
  );
  const whyArea = (id: string, label: string, help?: string) => (
    <Field label={label} htmlFor={id} help={err ?? help} error={!!err}>
      <textarea
        id={id}
        className={cn(textareaClass, err && invalidClass)}
        value={why}
        autoFocus
        onChange={(e) => {
          setWhy(e.target.value);
          setErr(null);
        }}
      />
    </Field>
  );
  const revokeForm = (
    <SubForm>
      {whyArea('acct-ir-why', t('Why revoke it?'))}
      <Acts>
        <Button
          variant="danger"
          small
          onClick={() => {
            if (!why.trim()) {
              setErr(t('Say why, so the next person knows.'));
              return;
            }
            void revokeInvite(i.id, why.trim()).then(() => {
              open(null);
            });
          }}
        >
          {t('Revoke invitation for {who}', { who: i.name })}
        </Button>
        {cancel}
      </Acts>
    </SubForm>
  );
  let acts: React.ReactNode = null;
  if (r && st === 'pending')
    acts =
      form === 'edit' ? (
        <SubForm>
          <Field label={t('Name')} htmlFor="acct-ie-name">
            <input
              id="acct-ie-name"
              className={inputClass}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </Field>
          <Field label={t('Google account')} htmlFor="acct-ie-mail" help={err} error={!!err}>
            <input
              id="acct-ie-mail"
              type="email"
              className={cn(inputClass, err && invalidClass)}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr(null);
              }}
            />
          </Field>
          <Field label={t('Workspace')} htmlFor="acct-ie-div">
            <SelectField
              id="acct-ie-div"
              value={div}
              onChange={(v) => {
                setDiv(v as DivisionId);
              }}
              options={DIVS.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Field>
          <p className={quiet}>{t('Saving makes a new link. The old link stops working.')}</p>
          <Acts>
            <Button
              variant="primary"
              small
              onClick={() => {
                if (!name.trim()) {
                  setErr(t('Write the person’s name.'));
                  return;
                }
                if (!validEmail(email)) {
                  setErr(t('Enter a full Google account address.'));
                  return;
                }
                void correctInvite(i.id, { name, email, div }).then(() => {
                  open(null);
                });
              }}
            >
              {t('Save correction')}
            </Button>
            {cancel}
          </Acts>
        </SubForm>
      ) : form === 'revoke' ? (
        revokeForm
      ) : (
        <>
          <Acts>
            <Button
              variant="primary"
              small
              onClick={() => {
                void copyInviteLink(i.id);
              }}
            >
              <Icon name="link" />
              {t('Copy invitation link')}
            </Button>
            <Button
              small
              onClick={() => {
                setName(i.name);
                setEmail(i.email);
                setDiv(i.div ?? 'sng');
                open('edit');
              }}
            >
              <Icon name="edit" />
              {t('Correct details')}
            </Button>
            <Button
              variant="ghost"
              small
              onClick={() => {
                open('revoke');
              }}
            >
              {t('Revoke')}
            </Button>
          </Acts>
          <button
            type="button"
            className="mt-2.5 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[length:12.5px] text-mute"
            onClick={() => {
              startInviteAsInvitee(i.id);
            }}
          >
            <Icon name="external" className="size-3" /> {t('Prototype: open the link as the invited person')}
          </button>
        </>
      );
  else if (r && st === 'expired')
    acts =
      form === 'revoke' ? (
        revokeForm
      ) : (
        <>
          <Acts>
            <Button
              variant="primary"
              small
              onClick={() => {
                void renewInvite(i.id);
              }}
            >
              <Icon name="undo" />
              {t('Renew for 14 days')}
            </Button>
            <Button
              variant="ghost"
              small
              onClick={() => {
                open('revoke');
              }}
            >
              {t('Revoke')}
            </Button>
          </Acts>
          <p className={quiet}>{t('Renewing makes a new link. The expired link never works again.')}</p>
        </>
      );
  else if (st === 'accepted')
    acts = isAdmin(m) ? (
      form === 'decline' ? (
        <SubForm>
          {whyArea('acct-id-why', t('Why not approve?'), t('Recorded in the account audit.'))}
          <Acts>
            <Button
              variant="danger"
              small
              onClick={() => {
                if (!why.trim()) {
                  setErr(t('Say why, for the record.'));
                  return;
                }
                void declineInvite(i.id, why.trim()).then(() => {
                  open(null);
                });
              }}
            >
              {t('Don’t approve {who}', { who: i.name })}
            </Button>
            {cancel}
          </Acts>
        </SubForm>
      ) : (
        <>
          <Acts>
            <Button
              variant="primary"
              small
              onClick={() => {
                void approveInvite(i.id);
              }}
            >
              <Icon name="check" />
              {t('Approve {who}', { who: i.name.split(' ')[0] ?? i.name })}
            </Button>
            <Button
              variant="ghost"
              small
              onClick={() => {
                open('decline');
              }}
            >
              {t('Don’t approve')}
            </Button>
          </Acts>
          <p className={quiet}>
            {t('Approving opens only the {d} workspace as a Member.', { d: dv?.name ?? t('Presidency') })}
          </p>
        </>
      )
    ) : (
      <p className={quiet}>{t('Waiting for the Admin to approve. Only the Admin approves members.')}</p>
    );
  else if (st === 'active' && i.person)
    acts = (
      <Acts>
        <Link className={buttonClass('default', true)} to={`/members/${i.person}`}>
          {t('Open member')}
        </Link>
      </Acts>
    );
  else if (st === 'revoked' || st === 'declined')
    acts = <p className={quiet}>{t('This link never works again. Create a new invitation if needed.')}</p>;
  return (
    <>
      <InspectorHead>{t('Invitation')}</InspectorHead>
      <h2 className={h2}>{i.name}</h2>
      <Chip def={INV_ST[st] ?? ['', '', 'mute']} pill="pill" />
      <Steps
        className="my-3.5"
        labels={[t('Invited'), t('Accepted'), t('Approved')]}
        current={st === 'active' ? 3 : step - 1}
      />
      <Meta>
        <MetaRow label={t('Google account')}>
          <span className="[overflow-wrap:anywhere] type-num">{i.email}</span>
        </MetaRow>
        <MetaRow label={t('Workspace')}>
          {dv ? (
            <>
              <BrandIcon id={dv.icon} label={false} className="size-3.5" />
              {dv.name}
            </>
          ) : (
            '–'
          )}
        </MetaRow>
        <MetaRow label={t('Role')}>{t(ROLES[i.role].label)}</MetaRow>
        <MetaRow label={t('Batch')}>{i.batch}</MetaRow>
        <MetaRow label={t('Expires')}>
          {fmtD(i.expires)}
          {st === 'expired' && <span className="text-mute"> {t('(expired)')}</span>}
        </MetaRow>
        <MetaRow label={t('Link')}>
          {i.delivery ? (
            t('Copied by {who}, {d}', { who: who.first(i.delivery.by), d: dShort(i.delivery.at.slice(0, 10)) })
          ) : (
            <span className="text-mute">{t('Not shared yet')}</span>
          )}
        </MetaRow>
        <MetaRow label={t('Created by')}>
          <ByAt id={i.createdBy} at={i.createdAt} />
        </MetaRow>
        {i.acceptedAt && (
          <MetaRow label={t('Accepted')}>
            {t('{d} by {mail}', { d: fmtD(i.acceptedAt.slice(0, 10)), mail: i.acceptedAs ?? '' })}
          </MetaRow>
        )}
        {i.approvedBy && (
          <MetaRow label={t('Approved by')}>
            <ByAt id={i.approvedBy} at={i.approvedAt} />
          </MetaRow>
        )}
        {i.revokedBy && (
          <MetaRow label={t('Revoked by')}>
            <ByAt id={i.revokedBy} at={i.revokedAt} />
          </MetaRow>
        )}
      </Meta>
      {acts}
      <SectionHeading count={i.history.length}>{t('History')}</SectionHeading>
      <div>
        {i.history.map((h) => (
          <div
            key={`${h.at}${h.verb}`}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2.5 text-[length:13.5px] leading-[21px]"
          >
            <Avatar id={h.by} size="sm" />
            <div className="min-w-0 [overflow-wrap:anywhere] [&_b]:font-semibold">
              <b>{who.name(h.by)}</b> {t(h.verb)}
              {h.note && (
                <div className="mt-1.5">
                  {r || isAdmin(m) ? (
                    <span className="inline-flex h-6 items-center rounded-chip px-2 text-d12 font-semibold text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
                      {t(h.note)}
                    </span>
                  ) : (
                    <ReasonRestricted />
                  )}
                </div>
              )}
            </div>
            <time className="whitespace-nowrap text-mute type-num">{dShort(h.at.slice(0, 10))}</time>
          </div>
        ))}
      </div>
    </>
  );
}

PANELS['acct-inv-new'] = NewInvitePanel;
/** One panel per invitation, so a form left open on one never shows on another. */
PANELS['acct-inv'] = (p) => <InvitePanel key={String(p.insp.id)} {...p} />;
