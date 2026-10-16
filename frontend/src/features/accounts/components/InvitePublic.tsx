/* The public invitation link (flow-accept-signin; minimal public content, a wrong account sees nothing). Shown instead of the
   sign-in screen at /invite/<id>. In demo mode you choose which Google account signs in; with Supabase the real sign-in does
   the same job. From screens/accounts.js invitePublic. */
import { divisionOf, ROLES } from '@/app/config/org';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { LOCKUP } from '@/components/ui/icon-data';
import { BrandIcon } from '@/components/ui/Icon';
import { Card, GoogleMark, LangSwitch, Mark, gbtn } from '@/features/auth/components/SignInCard';
import { t } from '@/lib/i18n';
import { useSession, useWorkspace } from '@/lib/workspace/hooks';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { acctOf, fmtD, invState } from '../services/acct-data';
import { acceptAndWait, inviteAs, inviteGoogle, inviteReset, inviteSwitch } from '../services/sign-in';
import { NameMark } from './AccountsParts';

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h1 className="mt-[22px] mb-1.5 type-h2">{children}</h1>
);

function GoogleButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={gbtn} onClick={onClick}>
      <GoogleMark />
      {children}
    </button>
  );
}

export function InvitePublic({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const session = useSession((s) => s);
  const i = acctOf(db).invites.find((x) => x.id === id);
  const st = i ? invState(i) : 'missing';
  const s =
    (session.inv as { id?: string; as?: string } | null | undefined)?.id === id
      ? (session.inv as { as?: string })
      : null;
  const shell = (inner: React.ReactNode) => (
    <Card>
      <Mark svg={LOCKUP} width={230} />
      {inner}
      <LangSwitch />
    </Card>
  );
  if (!i || st === 'missing' || st === 'revoked' || st === 'declined')
    return shell(
      <>
        <Heading>{t('This invitation link doesn’t work')}</Heading>
        <p>{t('It may have been replaced or withdrawn. Ask the person who invited you for a new link.')}</p>
      </>,
    );
  if (st === 'expired')
    return shell(
      <>
        <Heading>{t('This invitation has expired')}</Heading>
        <p>{t('Ask the person who invited you to renew it. A renewed invitation comes with a new link.')}</p>
      </>,
    );
  if (st === 'accepted' || st === 'active')
    return shell(
      <>
        <Heading>{t('This invitation was already accepted')}</Heading>
        <p>{t('Sign in with the Google account that accepted it. Accepting again never creates a second account.')}</p>
        <Button
          className={gbtn}
          onClick={() => {
            inviteSwitch();
          }}
        >
          {t('Go to sign in')}
        </Button>
      </>,
    );
  if (!s)
    return shell(
      <>
        <Heading>{t('You’re invited to dwdg’ONE')}</Heading>
        <p>
          {t('Sign in with Google to see your invitation. Nothing about the organization shows before you sign in.')}
        </p>
        <GoogleButton
          onClick={() => {
            inviteGoogle(id);
          }}
        >
          {t('Continue with Google')}
        </GoogleButton>
      </>,
    );
  if (!s.as) {
    const choice = (as: 'invitee' | 'other', name: string, mail: string) => (
      <div
        className="flex min-h-[var(--row-h)] cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover"
        role="button"
        tabIndex={0}
        onClick={() => {
          inviteAs(id, as);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inviteAs(id, as);
          }
        }}
      >
        <NameMark name={name} />
        <div className="min-w-0 flex-1">
          <b>{name}</b>
          <small className="block text-d12h text-mute type-num">{mail}</small>
        </div>
      </div>
    );
    return shell(
      <>
        <p className="mt-[18px] type-small">{t('Prototype: choose which Google account signs in.')}</p>
        <div className="mt-4 grid gap-[3px]">
          {choice('invitee', i.name, i.email)}
          {choice('other', 'Andi Pratama', 'andi.pratama@gmail.com')}
        </div>
      </>,
    );
  }
  if (s.as === 'other')
    return shell(
      <>
        <Heading>{t('This invitation is for a different Google account')}</Heading>
        <p>
          {t(
            'You’re signed in as {mail}. Sign out and use the account the invitation was sent to. Nothing from the organization is shown to this account.',
            {
              mail: 'andi.pratama@gmail.com',
            },
          )}
        </p>
        <Button
          className={gbtn}
          onClick={() => {
            inviteReset(id);
          }}
        >
          {t('Use another account')}
        </Button>
      </>,
    );
  const inviter = db.people.find((p) => p.id === i.createdBy);
  const dv = divisionOf(i.div);
  return shell(
    <>
      <Heading>{t('Your invitation')}</Heading>
      <p>{t('Check the details, then accept. You’re signed in as {mail}.', { mail: i.email })}</p>
      <Meta className="my-3.5 grid-cols-[148px_1fr]">
        <MetaRow label={t('Organization')}>DWDG UII</MetaRow>
        <MetaRow label={t('Workspace')}>
          {dv && <BrandIcon id={dv.icon} label={false} className="size-3.5" />}
          {dv?.name}
        </MetaRow>
        <MetaRow label={t('Role')}>{t(ROLES[i.role].label)}</MetaRow>
        <MetaRow label={t('Batch')}>{i.batch}</MetaRow>
        <MetaRow label={t('Invited by')}>{inviter?.name ?? ''}</MetaRow>
        <MetaRow label={t('Expires')}>{fmtD(i.expires)}</MetaRow>
      </Meta>
      <Notice icon="info" title={<b>{t('An admin approves you next')}</b>} className="my-3">
        <p>{t('Accepting doesn’t open the workspace yet. The Admin approves each new member first.')}</p>
      </Notice>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => {
            void acceptAndWait(id);
          }}
        >
          {t('Accept invitation')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            inviteReset(id);
          }}
        >
          {t('Not me')}
        </Button>
      </div>
    </>,
  );
}
