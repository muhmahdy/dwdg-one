/* The pieces every sign-in screen shares: the card, the wordmark, the Google mark and button, the language switch. */
import type { ReactNode } from 'react';
import { buttonClass, segButtonClass, segClass } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { setSession } from '@/lib/session';
import { useSession } from '@/lib/workspace/hooks';

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-dvh place-items-center p-6">
      <div className="w-[min(420px,100%)] rounded-[10px] bg-surface p-8 shadow-sheet [&_p]:text-mute">{children}</div>
    </div>
  );
}

export const Mark = ({ svg, width }: { svg: string; width: number }) => (
  <div className="text-ink [&_svg]:block [&_svg]:h-auto" style={{ ['--w' as string]: `${width}px` }}>
    <span className="block [&_svg]:w-[var(--w)]" dangerouslySetInnerHTML={{ __html: svg }} />
  </div>
);

export const GoogleMark = () => (
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

export const gbtn = buttonClass('default', false, 'mt-[18px] h-11 w-full justify-center');

export function LangSwitch() {
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
