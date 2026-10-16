/* The Compact look (core/app.js shell, core/app.css): a flat sidebar with the main pages, the workspace as a quiet group
   heading, Projects and one "More tools" group; a top bar with the crumb, history, one wide search and New; the page in one
   sheet with the details docked beside it. Phones get the dock with a square New button. */
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { capsFor, navLabel } from '@/app/config/capabilities';
import { divisionOf } from '@/app/config/org';
import { inShip, useRoute } from '@/app/router/routes';
import { Avatar, roleText } from '@/components/shared/Avatar';
import { HistoryButtons } from '@/components/shared/HistoryButtons';
import { openMenu } from '@/components/shared/menus';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { WORDMARK } from '@/components/ui/icon-data';
import { cn } from '@/lib/cn';
import { rank, visibleDivs } from '@/lib/access';
import { t } from '@/lib/i18n';
import { setSession } from '@/lib/session';
import { today } from '@/lib/time';
import { useMe, useSession, useUi, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { counts } from '@/features/work/services/selectors';

interface ShellProps {
  crumb: ReactNode;
  children: ReactNode;
  inspector: ReactNode;
}

const navLink =
  'flex min-h-[var(--nav-row-h)] items-center gap-3 rounded-ctl px-2.5 font-medium text-ink-2 no-underline hover:bg-hover [&>.ic]:size-5 [&>.ic]:text-mute';
const navOn = 'bg-surface text-ink shadow-sheet hover:bg-surface [&>.ic]:text-ink';

function Nav({ page, icon, label, count }: { page: string; icon: string; label: string; count?: number | undefined }) {
  const route = useRoute();
  const on = route.page === page;
  return (
    <Link to={`/${page}`} className={cn(navLink, on && navOn)} aria-current={on ? 'page' : undefined} data-focus-inset>
      <Icon name={icon} />
      <span>{label}</span>
      {!!count && <em className="ml-auto font-mono text-[11.5px] font-medium text-mute not-italic">{count}</em>}
    </Link>
  );
}

const group =
  'relative mt-2.5 mb-0.5 pt-2.5 before:absolute before:top-0 before:right-2.5 before:left-2.5 before:h-px before:bg-line-strong before:content-[""]';

export function CompactShell({ crumb, children, inspector }: ShellProps) {
  const me = useMe();
  const route = useRoute();
  const wsId = useWs();
  const preview = useSession((s) => s.preview);
  const navMore = useSession((s) => s.navMore);
  const menuOpen = useUi((u) => u.menu?.type === 'fme');
  const c = useWorkspace(
    (db) => (me ? counts(db, me, today()) : { attention: 0, unread: 0 }),
    (a, b) => a.attention === b.attention && a.unread === b.unread,
  );
  const projCount = useWorkspace(
    (db) =>
      db.projects.filter((p) => p.div === wsId && !['completed', 'cancelled', 'archived'].includes(p.stage)).length,
  );
  const opsCount = useWorkspace(
    (db) => (db.routines ?? []).filter((x) => !x.personal && x.unit === wsId && !x.paused).length,
  );
  if (!me) return null;
  const w = divisionOf(wsId);
  const many = visibleDivs(me).length > 1;
  const tools = [
    { page: 'programs', icon: 'program', label: 'Programs', count: undefined as number | undefined },
    { page: 'operations', icon: 'routine', label: 'Operations', count: opsCount },
    { page: 'resources', icon: 'resources', label: 'Resources', count: undefined },
    { page: 'changes', icon: 'activity', label: 'Changes', count: undefined },
    ...capsFor(wsId, me).map((x) => ({ page: x.page, icon: x.icon, label: x.label, count: undefined })),
  ].filter((x) => inShip(x.page, preview));
  const open = tools.some((x) => x.page === route.page) || (navMore ?? rank(me) >= 2);
  const label = (page: string, l: string) => t(navLabel(page, l, me));
  return (
    <>
      <div className="grid h-dvh grid-cols-[var(--sidebar-w)_minmax(0,1fr)] max-[760px]:grid-cols-[minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col gap-3 px-3 pt-4 pb-3 max-[760px]:hidden" aria-label={t('Navigation')}>
          <Link
            className="block px-2 pt-0.5 pb-1.5 text-ink [&_svg]:block [&_svg]:h-auto [&_svg]:w-32"
            to="/work"
            aria-label={`dwdg’ONE, ${t('My Work')}`}
          >
            <span dangerouslySetInnerHTML={{ __html: WORDMARK }} />
          </Link>
          <nav className="-mx-1 flex flex-col gap-0.5 overflow-auto px-1">
            <Nav page="work" icon="tasks" label={label('work', 'My Work')} count={c.attention} />
            <Nav page="updates" icon="bell" label={label('updates', 'Updates')} count={c.unread} />
            <Nav page="schedule" icon="calendar" label={label('schedule', 'Schedule')} />
            <div className={group}>
              {many && w ? (
                <button
                  type="button"
                  className="flex min-h-[var(--nav-row-h)] w-full items-center gap-2 rounded-ctl border-0 bg-transparent px-2.5 text-left text-ink-2"
                  aria-haspopup="menu"
                  aria-label={t('Workspace: {name}. Switch workspace', { name: w.name })}
                  onClick={(e) => {
                    openMenu(e.currentTarget, { type: 'ws' });
                  }}
                >
                  <BrandIcon id={w.icon} label={false} className="size-4" />
                  <b className="min-w-0 truncate text-[12.5px] font-semibold">{w.name}</b>
                  <Icon name="chevron-down" size="sm" className="ml-auto text-mute" />
                </button>
              ) : (
                w && (
                  <div
                    className="flex min-h-[var(--nav-row-h)] w-full cursor-default items-center gap-2 px-2.5 text-ink-2"
                    aria-label={t('Your workspace')}
                  >
                    <BrandIcon id={w.icon} label={false} className="size-4" />
                    <b className="min-w-0 truncate text-[12.5px] font-semibold">{w.name}</b>
                  </div>
                )
              )}
            </div>
            <Nav page="projects" icon="projects" label={label('projects', 'Projects')} count={projCount} />
            <button
              type="button"
              className={cn(navLink, 'w-full cursor-pointer border-0 bg-transparent text-left')}
              aria-expanded={open}
              aria-controls="nav-more-list"
              onClick={() => setSession({ navMore: !open })}
            >
              <Icon name={open ? 'chevron-down' : 'chevron'} />
              <span>{t('More tools')}</span>
              {!open && (
                <em className="ml-auto font-mono text-[11.5px] font-medium text-mute not-italic">{tools.length}</em>
              )}
            </button>
            <div id="nav-more-list" className="flex flex-col gap-0.5 pl-3" hidden={!open}>
              {tools.map((x) => (
                <Nav
                  key={x.page}
                  page={x.page}
                  icon={x.icon}
                  label={label(x.page, x.label)}
                  {...(x.count ? { count: x.count } : {})}
                />
              ))}
            </div>
          </nav>
          <div className="mt-auto flex items-center gap-1.5">
            <button
              type="button"
              className={cn(
                'flex w-full min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-surface px-2.5 py-2 text-left shadow-[0_0_0_1px_var(--line),0_1px_3px_rgb(22_22_21/6%)] hover:shadow-[0_0_0_1px_var(--line-strong),0_4px_14px_rgb(22_22_21/8%)]',
                menuOpen && 'shadow-[0_0_0_1.5px_var(--ink)] hover:shadow-[0_0_0_1.5px_var(--ink)]',
              )}
              aria-haspopup="menu"
              aria-label={t('Your account, Settings and Organization')}
              data-focus-inset
              onClick={(e) => {
                openMenu(e.currentTarget, {
                  type: 'fme',
                  up: true,
                  width: Math.max(260, Math.round(e.currentTarget.getBoundingClientRect().width)),
                  est: 240,
                });
              }}
            >
              <Avatar id={me.id} />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[13px] font-semibold">{me.name}</b>
                <small className="block truncate text-[12px] text-mute">{roleText(me)}</small>
              </span>
              <Icon
                name="chevron-down"
                size="sm"
                className={cn('flex-none text-mute transition-transform', menuOpen && 'rotate-180')}
              />
            </button>
          </div>
        </aside>
        <section
          className="grid min-h-0 min-w-0 grid-rows-[var(--topbar-h)_minmax(0,1fr)] pr-2 pb-2 max-[760px]:p-0 max-[760px]:pb-[calc(var(--dock-h)+env(safe-area-inset-bottom))]"
          id="main"
        >
          <header className="flex min-w-0 items-center gap-2 pr-1 pl-2 max-[760px]:px-3">
            <span className="truncate text-[13px] whitespace-nowrap text-mute max-[760px]:flex-[1_1_auto] [&_a]:no-underline [&_b]:font-semibold [&_b]:text-ink [&_i]:mx-1.5 [&_i]:not-italic">
              {crumb}
            </span>
            <HistoryButtons className="max-[760px]:[&>span:first-child]:hidden" />
            <button
              type="button"
              className="flex h-[var(--ctl-h)] w-[calc(var(--inspector-w)-74px)] cursor-pointer items-center gap-2 rounded-ctl border-0 bg-surface px-2.5 text-[13px] text-mute shadow-sheet max-[760px]:w-auto max-[760px]:min-w-[var(--touch)] max-[760px]:justify-center"
              onClick={() => {
                setUi((u) => void (u.palette = true));
              }}
              aria-label={t('Search or jump to')}
            >
              <Icon name="search" size="sm" />
              <span className="flex-1 truncate text-left max-[760px]:hidden">{t('Search or jump to')}</span>
              <span className="rounded-[5px] bg-fill px-1.5 py-px font-mono text-[12px] whitespace-nowrap max-[760px]:hidden">
                Ctrl K
              </span>
            </button>
            <button
              type="button"
              className="inline-flex h-[var(--ctl-h)] items-center gap-1.5 rounded-ctl border-0 bg-surface px-3 text-[13px] font-medium whitespace-nowrap text-ink-2 shadow-sheet hover:bg-hover hover:text-ink max-[760px]:hidden"
              aria-haspopup="menu"
              onClick={(e) => {
                openMenu(e.currentTarget, { type: 'new', alignRight: true });
              }}
            >
              <Icon name="plus" size="sm" />
              {t('New')}
            </button>
          </header>
          <div
            className={cn(
              'grid min-h-0 grid-cols-[minmax(0,1fr)] gap-2',
              inspector && 'grid-cols-[minmax(0,1fr)_var(--inspector-w)] max-[1100px]:grid-cols-[minmax(0,1fr)]',
            )}
          >
            <div
              id="scroller"
              className="min-h-0 min-w-0 overflow-auto rounded-sheet bg-surface shadow-sheet max-[760px]:rounded-none max-[760px]:shadow-none"
            >
              {children}
            </div>
            {inspector && (
              <>
                <div
                  className="fixed inset-0 z-[24] hidden bg-[rgb(22_22_21/16%)] max-[1100px]:block"
                  aria-hidden="true"
                  onClick={() => {
                    setUi((u) => {
                      u.insp = null;
                      u.form = null;
                    });
                  }}
                />
                <aside
                  className="insp-sheet min-h-0 min-w-0 overflow-auto rounded-sheet bg-surface shadow-sheet max-[1100px]:fixed max-[1100px]:top-3 max-[1100px]:right-3 max-[1100px]:bottom-3 max-[1100px]:z-[25] max-[1100px]:w-[min(var(--inspector-w),calc(100vw-24px))] max-[1100px]:shadow-[var(--e-pop)] max-[760px]:inset-0 max-[760px]:w-auto max-[760px]:rounded-none"
                  aria-label={t('Details')}
                >
                  {inspector}
                </aside>
              </>
            )}
          </div>
        </section>
      </div>
      <Dock attention={c.attention} unread={c.unread} />
    </>
  );
}

const MORE_PAGES = ['updates', 'programs', 'operations', 'resources', 'changes', 'organisation', 'settings'];

function Dock({ attention, unread }: { attention: number; unread: number }) {
  const route = useRoute();
  const me = useMe();
  const wsId = useWs();
  if (!me) return null;
  const moreOn = MORE_PAGES.includes(route.page) || capsFor(wsId, me).some((x) => x.page === route.page);
  const cell =
    'relative grid min-h-[var(--touch)] max-w-full content-center justify-items-center gap-[3px] border-0 bg-transparent text-[10.5px] font-medium whitespace-nowrap text-mute no-underline';
  const badge =
    'absolute top-px left-[calc(50%+4px)] h-4 min-w-4 rounded-lg bg-ink px-1 font-mono text-[10px] leading-4 font-semibold text-on-ink not-italic shadow-[0_0_0_2px_var(--surface)]';
  const tab = (page: string, icon: string, label: string, n?: number) => (
    <Link
      to={`/${page}`}
      className={cn(cell, route.page === page && 'text-ink')}
      aria-current={route.page === page ? 'page' : undefined}
    >
      <Icon name={icon} />
      {!!n && <em className={badge}>{n}</em>}
      {t(label)}
    </Link>
  );
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 hidden h-[calc(var(--dock-h)+env(safe-area-inset-bottom))] grid-cols-[1fr_1fr_64px_1fr_1fr] items-center bg-surface px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_var(--line)] max-[760px]:grid"
      aria-label={t('Main')}
    >
      {tab('work', 'tasks', 'My Work', attention)}
      {tab('projects', 'projects', 'Projects')}
      <button
        type="button"
        className="grid size-[46px] place-items-center justify-self-center rounded-[14px] border-0 bg-ink text-on-ink"
        aria-label={t('New')}
        onClick={(e) => {
          openMenu(e.currentTarget, { type: 'new', alignRight: true });
        }}
      >
        <Icon name="plus" />
      </button>
      {tab('schedule', 'calendar', 'Schedule')}
      <button
        type="button"
        className={cn(cell, moreOn && 'text-ink')}
        aria-haspopup="menu"
        onClick={(e) => {
          openMenu(e.currentTarget, { type: 'more', alignRight: true });
        }}
      >
        <Icon name="menu" />
        {!!unread && <em className={badge}>{unread}</em>}
        {t('More')}
      </button>
    </nav>
  );
}
