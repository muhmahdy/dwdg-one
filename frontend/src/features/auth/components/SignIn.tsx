/* The public sign-in page (vision-distribution: it reveals nothing internal), the waiting screen for members an Admin has
   not approved yet, and the screens for paused or ended accounts (security_auth, access_revocation). In demo mode the
   Google button opens the persona picker (decision M9). Port of core/app.js signIn() and its extensions in
   screens/accounts.js and screens/perf.js. */
import { useState } from 'react';
import { env } from '@/app/config/env';
import { Avatar, IdentityLine, roleText } from '@/components/shared/Avatar';
import { LOCKUP, WORDMARK } from '@/components/ui/icon-data';
import { lang, t } from '@/lib/i18n';
import { setSession } from '@/lib/session';
import { useSession, useWorkspace } from '@/lib/workspace/hooks';
import { useParams } from 'react-router';
import { InvitePublic } from '@/features/accounts/components/InvitePublic';
import { Card, GoogleMark, LangSwitch, Mark, gbtn } from './SignInCard';
import { signInWithGoogle, signOutEverywhere } from '../services/auth';
import { BLOCKED_TEXT, isBlocked, demoPersonas, pickPersona, signOut } from '../services/session';

export function SignIn() {
  const session = useSession((s) => s);
  const db = useWorkspace((w) => w);
  const people = db.people;
  const { page, id: routeId } = useParams();
  const [error, setError] = useState<string | null>(null);
  if (env.demo && page === 'invite') return <InvitePublic id={routeId ?? ''} />;
  const blockedId = session.blocked ?? session.me;
  const blocked = people.find((p) => p.id === blockedId && isBlocked(p.status));

  if (blocked) {
    const [title, body] = BLOCKED_TEXT[blocked.status] ?? ['', ''];
    return (
      <Card>
        <Mark svg={WORDMARK} width={128} />
        <h1 className="mt-[22px] mb-1.5 type-h2">{t(title)}</h1>
        <p>{t(body)}</p>
        <button type="button" className={gbtn} onClick={() => void signOut()}>
          {t('Use another account')}
        </button>
      </Card>
    );
  }

  if (session.waiting) {
    const p = people.find((x) => x.id === session.waiting);
    const parts = t('An admin needs to approve {name} before you can open dwdg’ONE.').split('{name}');
    return (
      <Card>
        <Mark svg={WORDMARK} width={128} />
        <h1 className="mt-[22px] mb-1.5 type-h2">{t('You’re almost in')}</h1>
        <p>
          {parts[0]}
          <b>{p?.name}</b>
          {parts[1]}
        </p>
        {env.demo && (
          <p className="type-small">
            {t('Prototype: sign in as Mahdy (Admin) and open Members, then Invitations, to approve.')}
          </p>
        )}
        <button type="button" className={gbtn} onClick={() => void signOut()}>
          {t('Use another account')}
        </button>
      </Card>
    );
  }

  const google = () => {
    if (env.demo) {
      setSession({ picking: true });
      return;
    }
    setError(null);
    signInWithGoogle().catch(() => {
      setError(t('Could not sign in. Please try again.'));
    });
  };

  return (
    <Card>
      <Mark svg={LOCKUP} width={230} />
      <p className="mt-[22px]">{t('The workspace for DWDG UII. Invite only.')}</p>
      {session.picking ? (
        <>
          <p className="mt-[18px] type-small">
            {t('Prototype: choose a demo account. In the real app this is your Google account.')}
          </p>
          <div className="mt-4 grid gap-[3px]">
            {demoPersonas(db, session.preview).map((p) => (
              <div
                key={p.id}
                className="flex min-h-[var(--row-h)] cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover roomy:py-[7px]"
                role="button"
                tabIndex={0}
                data-focus-inset
                onClick={() => {
                  pickPersona(p.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pickPersona(p.id);
                  }
                }}
              >
                <Avatar id={p.id} />
                <div className="min-w-0 flex-1 fade-end">
                  <b>{p.name}</b>
                  <small className="block text-d12h text-mute">
                    {p.status === 'pending' ? t('New member, waiting for approval') : roleText(p)}
                  </small>
                </div>
                {p.status === 'active' && <IdentityLine person={p} />}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button type="button" className={gbtn} onClick={google}>
            <GoogleMark />
            {t('Continue with Google')}
          </button>
          {error && <p className="mt-3 text-danger">{error}</p>}
          <p className="mt-4 type-small">{t('Ask your director for an invite if you don’t have one yet.')}</p>
        </>
      )}
      <LangSwitch key={lang()} />
    </Card>
  );
}

export { signOutEverywhere };
