/* Applies the per-device preferences to the document: theme on <html> (light by default, D52; "system" follows the
   device), look and density on <body> (D53, D56, D57), and the interface language (D7). Changing the language re-renders
   the whole app, as the prototype's render() did. */
import { Fragment, useLayoutEffect, useSyncExternalStore, type ReactNode } from 'react';
import { setLang } from '@/lib/i18n';
import { density, look } from '@/lib/session';
import { useSession } from '@/lib/workspace/hooks';

const query = '(prefers-color-scheme: dark)';
const subscribeScheme = (cb: () => void) => {
  const m = window.matchMedia(query);
  m.addEventListener('change', cb);
  return () => {
    m.removeEventListener('change', cb);
  };
};

export function PreferencesSync({ children }: { children: ReactNode }) {
  const session = useSession((s) => s);
  const systemDark = useSyncExternalStore(subscribeScheme, () => window.matchMedia(query).matches);
  const lang = session.lang === 'id' ? 'id' : 'en';
  setLang(lang);
  useLayoutEffect(() => {
    const theme = session.theme ?? 'light';
    document.documentElement.dataset.theme = theme === 'dark' || (theme === 'system' && systemDark) ? 'dark' : 'light';
    document.documentElement.lang = lang;
    document.body.dataset.look = look(session);
    document.body.dataset.density = density(session);
  }, [session, systemDark, lang]);
  return <Fragment key={lang}>{children}</Fragment>;
}
