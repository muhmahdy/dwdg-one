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
import { inputClass } from '@/components/ui/forms';
import { signInWithPassword, signOutEverywhere, signUpWithPassword } from '../services/auth';
import { BLOCKED_TEXT, isBlocked, demoPersonas, pickPersona, signOut } from '../services/session';

export function SignIn() {
  const session = useSession((s) => s);
  const db = useWorkspace((w) => w);
  const people = db.people;
  const { page, id: routeId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [notice, setNotice] = useState<string | null>(null);
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
    setSession({ picking: true });
  };

  const switchMode = (m: 'in' | 'up') => {
    setMode(m);
    setError(null);
    setNotice(null);
  };

  const register = () => {
    setError(null);
    setNotice(null);
    if (password.length < 8) {
      setError(t('Use a password of at least 8 characters.'));
      return;
    }
    if (password !== confirm) {
      setError(t('The two passwords do not match.'));
      return;
    }
    setBusy(true);
    signUpWithPassword(email, password)
      .then((r) => {
        if (r === 'confirm-email') {
          setNotice(t('Check your e-mail and open the confirmation link, then sign in here.'));
          setMode('in');
          setPassword('');
          setConfirm('');
        }
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message.toLowerCase() : '';
        setError(
          msg.includes('invited') || msg.includes('hook')
            ? t('This e-mail has not been invited. Ask your director for an invite.')
            : msg.includes('rate') || msg.includes('seconds')
              ? t('Too many attempts. Try again in a few minutes.')
              : t('Could not create the account. Check the e-mail and try again.'),
        );
      })
      .finally(() => {
        setBusy(false);
      });
  };

  const submit = () => {
    if (mode === 'up') {
      register();
      return;
    }
    setError(null);
    setBusy(true);
    signInWithPassword(email, password).catch(() => {
      setError(t('Wrong e-mail or password.'));
      setBusy(false);
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
          {env.demo ? (
            <button type="button" className={gbtn} onClick={google}>
              <GoogleMark />
              {t('Continue with Google')}
            </button>
          ) : (
            <form
              className="mt-[18px] grid gap-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <input
                className={inputClass}
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                type="email"
                autoComplete="username"
                placeholder={t('E-mail')}
                aria-label={t('E-mail')}
                required
              />
              <input
                className={inputClass}
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
                placeholder={t('Password')}
                aria-label={t('Password')}
                minLength={mode === 'up' ? 8 : undefined}
                required
              />
              {mode === 'up' && (
                <input
                  className={inputClass}
                  name="confirm"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                  }}
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('Repeat password')}
                  aria-label={t('Repeat password')}
                  required
                />
              )}
              <button type="submit" className={gbtn} disabled={busy}>
                {mode === 'up' ? t('Create account') : t('Sign in')}
              </button>
            </form>
          )}
          {notice && (
            <p className="mt-3" role="status">
              {notice}
            </p>
          )}
          {error && (
            <p className="mt-3 text-danger" role="alert">
              {error}
            </p>
          )}
          {!env.demo && (
            <p className="mt-4 type-small">
              {mode === 'in' ? t('Invited but no account yet?') : t('Already have an account?')}{' '}
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-ink underline"
                onClick={() => {
                  switchMode(mode === 'in' ? 'up' : 'in');
                }}
              >
                {mode === 'in' ? t('Create account') : t('Sign in')}
              </button>
            </p>
          )}
          <p className="mt-2 type-small">{t('Ask your director for an invite if you don’t have one yet.')}</p>
        </>
      )}
      <LangSwitch key={lang()} />
    </Card>
  );
}

export { signOutEverywhere };
