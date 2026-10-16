/* The Simple look's shell (screens/simple.js simpleShell): a top bar with three destinations (My tasks, Work, Schedule), New,
   the bell and the profile; the page centred on a cool canvas; details open as a floating sheet; phones get a bottom bar with a
   round New. From core/simple.css. */
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useRoute } from '@/app/router/routes';
import { Avatar } from '@/components/shared/Avatar';
import { openMenu } from '@/components/shared/menus';
import { Icon } from '@/components/ui/Icon';
import { WORDMARK } from '@/components/ui/icon-data';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { today } from '@/lib/time';
import { useMe, useSession, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import '@/features/simple/components/SimpleMenus';
import { counts } from '@/features/work/services/selectors';

const KINDS = ['programs', 'projects', 'operations'];

const tab =
  'relative inline-flex h-11 items-center gap-2 rounded-full px-[18px] text-[16px] font-[550] text-ink-2 no-underline transition-colors hover:bg-hover [&>.ic]:size-5';
const badge =
  'h-5 min-w-5 rounded-[10px] bg-danger px-1.5 text-center text-[14px] leading-5 font-bold text-surface not-italic';

export function SimpleShell({ children, inspector }: { crumb: ReactNode; children: ReactNode; inspector: ReactNode }) {
  const me = useMe();
  const route = useRoute();
  const c = useWorkspace(
    (db) => (me ? counts(db, me, today()) : { attention: 0, unread: 0 }),
    (a, b) => a.attention === b.attention && a.unread === b.unread,
  );
  const kind = useSession((x) => (typeof x.sKind === 'string' ? x.sKind : 'projects'));
  if (!me) return null;
  const inWork = KINDS.includes(route.page);
  const tabs: [string, string, string, number][] = [
    ['work', 'tasks', 'My tasks', c.attention],
    [inWork ? route.page : kind, 'projects', 'Work', 0],
    ['schedule', 'calendar', 'Schedule', 0],
  ];
  const on = (h: string) => (KINDS.includes(h) ? inWork : route.page === h);
  const link = ([h, ic, l, n]: [string, string, string, number], dock = false) => (
    <Link
      key={l}
      to={`/${h}`}
      className={cn(
        tab,
        on(h) && 'bg-surface text-ink shadow-sheet',
        dock &&
          'h-14 flex-1 flex-col justify-center gap-[3px] rounded-xl bg-transparent px-0 text-[15px] leading-[18px] font-semibold text-mute shadow-none [&>.ic]:size-[26px]',
        dock && on(h) && 'bg-transparent text-green-ink shadow-none',
      )}
      aria-current={on(h) ? 'page' : undefined}
    >
      <Icon name={ic} selected={on(h)} />
      <span>{t(l)}</span>
      {!!n && (
        <em
          className={cn(badge, dock && 'absolute top-0.5 left-[calc(50%+6px)]')}
          aria-label={plural(n, '{n} needs you', '{n} need you')}
        >
          {n}
        </em>
      )}
    </Link>
  );
  const menuBtn =
    'relative grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-ink-2 hover:bg-hover';
  const openAt = (type: string, width: number, est: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(e.currentTarget, { type, alignRight: true, width, est });
  };
  return (
    <div className="flex h-dvh flex-col">
      <header className="grid h-16 flex-none grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line bg-canvas px-6 max-[899px]:h-14 max-[899px]:grid-cols-[1fr_auto] max-[899px]:pr-2 max-[899px]:pl-4">
        <Link
          className="flex items-center justify-self-start text-ink [&_svg]:block [&_svg]:h-[22px] [&_svg]:w-auto max-[899px]:[&_svg]:h-5"
          to="/work"
          aria-label={`dwdg’ONE, ${t('My tasks')}`}
        >
          <span dangerouslySetInnerHTML={{ __html: WORDMARK }} />
        </Link>
        <nav className="flex gap-1 max-[899px]:hidden" aria-label={t('Main')}>
          {tabs.map((x) => link(x))}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <button
            type="button"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-ctl border-0 bg-ink px-4 text-[16px] font-[550] text-on-ink hover:bg-ink-2 max-[899px]:hidden [&>.ic]:size-[18px]"
            aria-haspopup="menu"
            onClick={openAt('snew', 240, 300)}
          >
            <Icon name="plus" />
            <span>{t('New')}</span>
          </button>
          <button
            type="button"
            className={menuBtn}
            aria-haspopup="menu"
            aria-label={c.unread ? plural(c.unread, '{n} new update', '{n} new updates') : t('Updates')}
            onClick={openAt('sbell', 360, 480)}
          >
            <Icon name="bell" className="size-[22px]" />
            {!!c.unread && <em className={cn(badge, 'absolute top-0.5 right-0')}>{c.unread}</em>}
          </button>
          <button
            type="button"
            className={menuBtn}
            aria-haspopup="menu"
            aria-label={t('Your profile')}
            onClick={openAt('sme', 300, 300)}
          >
            <Avatar id={me.id} className="size-9 text-[15px]" />
          </button>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col" id="main">
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-8 pb-[72px] max-[899px]:px-4 max-[899px]:pt-3 max-[899px]:pb-8"
          id="scroller"
        >
          {children}
        </div>
      </main>
      {inspector && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/[.22]"
            aria-hidden="true"
            onClick={() => {
              setUi((u) => {
                u.insp = null;
                u.form = null;
              });
            }}
          />
          <aside
            className="insp-sheet fixed top-3 right-3 bottom-3 z-[41] w-[min(460px,calc(100vw-24px))] overflow-y-auto overscroll-contain rounded-[20px] bg-surface shadow-pop max-[899px]:top-auto max-[899px]:right-0 max-[899px]:bottom-0 max-[899px]:left-0 max-[899px]:max-h-[90dvh] max-[899px]:w-auto max-[899px]:rounded-b-none max-[899px]:pb-[env(safe-area-inset-bottom)]"
            role="dialog"
            aria-label={t('Details')}
          >
            {inspector}
          </aside>
        </>
      )}
      <nav
        className="hidden flex-none items-center justify-around gap-1 border-t border-line bg-surface/95 px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] backdrop-blur-lg max-[899px]:flex"
        aria-label={t('Main')}
      >
        {tabs.map((x) => link(x, true))}
        <button
          type="button"
          className="mr-1 ml-0.5 grid size-12 flex-none cursor-pointer place-items-center rounded-full border-0 bg-ink text-surface shadow-[0_4px_12px_rgb(22_22_21/22%)] [&>.ic]:size-6"
          aria-haspopup="menu"
          aria-label={t('New')}
          onClick={openAt('snew', 240, 300)}
        >
          <Icon name="plus" />
        </button>
      </nav>
    </div>
  );
}
