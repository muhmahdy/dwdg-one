/* The public sign-in page (vision-distribution: it reveals nothing internal), the waiting screen for members an Admin has
   not approved yet, and the screens for paused or ended accounts (security_auth, access_revocation). In demo mode the
   Google button opens the persona picker (decision M9). Port of core/app.js signIn() and its extensions in
   screens/accounts.js and screens/perf.js. */
import { useState, type ReactNode } from 'react';
import { env } from '@/app/config/env';
import { Avatar, IdentityLine, roleText } from '@/components/shared/Avatar';
import { buttonClass, segButtonClass, segClass } from '@/components/ui/Button';
import { LOCKUP, WORDMARK } from '@/components/ui/icon-data';
import { cn } from '@/lib/cn';
import { lang, t } from '@/lib/i18n';
import { setSession } from '@/lib/session';
import { useSession, useWorkspace } from '@/lib/workspace/hooks';
import { signInWithGoogle, signOutEverywhere } from '../services/auth';
import { BLOCKED_TEXT, isBlocked, demoPersonas, pickPersona, signOut } from '../services/session';

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-dvh place-items-center p-6">
      <div className="w-[min(420px,100%)] rounded-[10px] bg-surface p-8 shadow-sheet [&_p]:text-mute">{children}</div>
    </div>
  );
}

const Mark = ({ svg, width }: { svg: string; width: number }) => (
  <div className="text-ink [&_svg]:block [&_svg]:h-auto" style={{ ['--w' as string]: `${width}px` }}>
    <span className="block [&_svg]:w-[var(--w)]" dangerouslySetInnerHTML={{ __html: svg }} />
  </div>
);

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24Z"
    />
    <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
    <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
  </svg>
);

const gbtn = buttonClass('default', false, 'mt-[18px] h-11 w-full justify-center');

function LangSwitch() {
  const l = useSession((s) => s.lang) === 'id' ? 'id' : 'en';
  const btn = (k: 'en' | 'id', label: string) => (
    <button
      type="button"
      className={segButtonClass(l === k, 'h-[26px] px-2 font-mono text-d11h font-semibold')}
      onClick={() => setSession({ lang: k })}
    >
      {label}
    </button>
  );
  return (
    <div className={cn(segClass, 'mt-[18px] flex-none')}>
      {btn('en', 'English')}
      {btn('id', 'Bahasa Indonesia')}
    </div>
  );
}

export function SignIn() {
  const session = useSession((s) => s);
  const people = useWorkspace((db) => db.people);
  const [error, setError] = useState<string | null>(null);
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
            {demoPersonas(people, session.preview).map((p) => (
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
