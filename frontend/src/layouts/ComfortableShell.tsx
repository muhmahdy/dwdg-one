/* The Comfortable look (owner, 11 Oct, D57; screens/calm-shell.js + core/calm.css). Every element traces to a reference:
   R012 (CRM): a short sidebar on the canvas with search, the main pages, pinned items in the "saved views" slot, the
   workspace tools in the "segments" slot and the account at the bottom; the page in one white sheet, details docked beside.
   R025 (Salung, phone): page title with quiet icon buttons, a floating pill tab bar and a separate round black +. */
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { capsFor, navLabel } from '@/app/config/capabilities';
import { divisionOf } from '@/app/config/org';
import { inShip, useRoute } from '@/app/router/routes';
import { Avatar, roleText } from '@/components/shared/Avatar';
import { HistoryButtons } from '@/components/shared/HistoryButtons';
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
import { PinnedLinks } from '@/features/pins/components/PinnedLinks';
import { openMenu } from '@/components/shared/menus';

interface ShellProps {
  crumb: ReactNode;
  children: ReactNode;
  inspector: ReactNode;
}

const navLink =
  'flex min-h-10 items-center gap-3 rounded-[10px] px-2.5 text-[15px] font-medium text-ink-2 no-underline hover:bg-hover [&>.ic]:size-5 [&>.ic]:text-mute';
const navOn = 'bg-surface font-semibold text-ink shadow-card hover:bg-surface [&>.ic]:text-ink';

function NavLink({
  page,
  icon,
  label,
  count,
  on,
}: {
  page: string;
  icon: string;
  label: string;
  count?: number;
  on: boolean;
}) {
  const route = useRoute();
  return (
    <Link
      to={`/${page}`}
      className={cn(navLink, on && navOn)}
      aria-current={route.page === page ? 'page' : undefined}
      data-focus-inset
    >
      <Icon name={icon} selected={route.page === page} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {!!count && <em className="font-sans text-[13px] font-semibold text-mute not-italic">{count}</em>}
    </Link>
  );
}

export function ComfortableShell({ crumb, children, inspector }: ShellProps) {
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
  const pinnedHere = useWorkspace((db) => {
    const pins = me ? (db.pins?.[me.id] ?? []) : [];
    const kind =
      route.page === 'projects'
        ? 'project'
        : route.page === 'programs'
          ? 'program'
          : route.page === 'operations'
            ? 'routine'
            : null;
    return !!kind && pins.some((p) => p.k === kind && p.id === route.id);
  });
  if (!me) return null;
  const w = divisionOf(wsId);
  const many = visibleDivs(me).length > 1;
  const tools = [{ page: 'changes', icon: 'activity', label: 'Changes' }, ...capsFor(wsId, me)].filter((x) =>
    inShip(x.page, preview),
  );
  // The tools group opens by itself on one of its pages; otherwise the member's choice, closed by default below Co-Director (D54).
  const toolsOpen = tools.some((x) => x.page === route.page) || (navMore ?? rank(me) >= 2);
  const on = (page: string) => route.page === page && !(route.id && pinnedHere);
  const label = (page: string, l: string) => t(navLabel(page, l, me));

  return (
    <>
      <div className="grid h-dvh grid-cols-[var(--cs-side)_minmax(0,1fr)] max-[760px]:grid-cols-[minmax(0,1fr)]">
        <aside
          className="flex min-h-0 flex-col gap-3 pt-[18px] pr-3 pb-3 pl-3.5 max-[760px]:hidden"
          aria-label={t('Navigation')}
        >
          <Link
            className="block px-2 pt-0.5 pb-1.5 text-ink [&_svg]:block [&_svg]:h-auto [&_svg]:w-28"
            to="/work"
            aria-label={`dwdg’ONE, ${t('My Work')}`}
          >
            <span dangerouslySetInnerHTML={{ __html: WORDMARK }} />
          </Link>
          {many && w && (
            <button
              type="button"
              className="flex h-[42px] w-full items-center gap-2.5 rounded-xl border-0 bg-surface px-2.5 text-left text-ink shadow-card"
              aria-haspopup="menu"
              aria-label={t('Workspace: {name}. Switch workspace', { name: w.name })}
              onClick={(e) => {
                openMenu(e.currentTarget, { type: 'ws' });
              }}
            >
              <BrandIcon id={w.icon} label={false} className="size-5" />
              <b className="min-w-0 flex-1 truncate text-[14px] font-semibold">{w.name}</b>
              <Icon name="chevron-down" size="sm" className="text-mute" />
            </button>
          )}
          <button
            type="button"
            className="flex h-10 w-full items-center gap-2 rounded-xl border-0 bg-surface px-2.5 text-[14px] text-mute shadow-card"
            onClick={() => {
              setUi((u) => void (u.palette = true));
            }}
          >
            <Icon name="search" size="sm" />
            <span className="flex-1 text-left">{t('Search')}</span>
            <span className="rounded-[5px] bg-fill px-1.5 py-px font-mono text-[13px] font-medium text-mute">
              Ctrl K
            </span>
          </button>
          <nav className="mt-1 flex [scrollbar-width:none] flex-col gap-0.5 overflow-auto [&::-webkit-scrollbar]:hidden">
            <NavLink page="work" icon="tasks" label={label('work', 'My Work')} count={c.attention} on={on('work')} />
            <NavLink page="schedule" icon="calendar" label={label('schedule', 'Schedule')} on={on('schedule')} />
            <NavLink
              page="updates"
              icon="bell"
              label={label('updates', 'Updates')}
              count={c.unread}
              on={on('updates')}
            />
            <h6 className="mt-3.5 mb-0.5 flex w-full items-center gap-1.5 px-2.5 font-sans text-[13px] leading-[normal] font-medium text-mute">
              {t('Work')}
            </h6>
            <NavLink page="programs" icon="program" label={label('programs', 'Programs')} on={on('programs')} />
            <NavLink page="projects" icon="projects" label={label('projects', 'Projects')} on={on('projects')} />
            <NavLink page="operations" icon="routine" label={label('operations', 'Operations')} on={on('operations')} />
            {inShip('resources', preview) && (
              <NavLink page="resources" icon="resources" label={label('resources', 'Resources')} on={on('resources')} />
            )}
            <h6 className="mt-3.5 mb-0.5 flex w-full items-center gap-1.5 px-2.5 font-sans text-[13px] leading-[normal] font-medium text-mute">
              {t('Pinned')}
            </h6>
            <PinnedLinks linkClass={navLink} onClass={navOn} />
            {tools.length > 0 && w && (
              <>
                <button
                  type="button"
                  className="mt-3.5 mb-0.5 flex min-h-8 w-full cursor-pointer items-center gap-1.5 rounded-ctl border-0 bg-transparent px-2.5 text-left font-sans text-[13px] font-medium text-mute hover:bg-hover hover:text-ink"
                  aria-expanded={toolsOpen}
                  aria-controls="cs-tools"
                  onClick={() => setSession({ navMore: !toolsOpen })}
                >
                  <span className="flex-1">{w.short || w.name}</span>
                  <Icon name={toolsOpen ? 'chevron-down' : 'chevron'} size="sm" />
                </button>
                <div id="cs-tools" className="flex flex-col gap-0.5" hidden={!toolsOpen}>
                  {tools.map((x) => (
                    <NavLink key={x.page} page={x.page} icon={x.icon} label={label(x.page, x.label)} on={on(x.page)} />
                  ))}
                </div>
              </>
            )}
          </nav>
          <div className="mt-auto flex flex-col gap-0.5">
            <button
              type="button"
              className={cn(
                'mt-1.5 flex w-full cursor-pointer items-center gap-2.5 rounded-[14px] border-0 bg-surface px-2.5 py-2 text-left shadow-card transition-[box-shadow,transform] duration-[var(--d-hover)] ease-ds',
                'hover:shadow-[0_0_0_1px_var(--line-strong),0_4px_14px_rgb(22_22_21/8%)] active:scale-[.99]',
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
                <b className="block truncate text-d13 font-semibold">{me.name}</b>
                <small className="block text-[13px] text-mute">{roleText(me)}</small>
              </span>
              <Icon
                name="chevron-down"
                size="sm"
                className={cn(
                  'text-mute transition-transform duration-[var(--d-hover)] ease-ds',
                  menuOpen && 'rotate-180',
                )}
              />
            </button>
          </div>
        </aside>
        <section
          className="grid min-h-0 min-w-0 grid-rows-[var(--topbar-h)_minmax(0,1fr)] pr-3 pb-3 pl-1 max-[760px]:p-0 max-[760px]:pb-[104px]"
          id="main"
        >
          <header className="flex min-w-0 items-center gap-2.5 px-1 max-[760px]:h-14 max-[760px]:pr-2 max-[760px]:pl-4">
            <span className="truncate text-[14px] whitespace-nowrap text-mute max-[1100px]:min-w-16 max-[1100px]:flex-[0_1_auto] max-[760px]:flex-[1_1_auto] max-[760px]:text-[15px] [&_a]:no-underline [&_b]:font-semibold [&_b]:text-ink [&_i]:mx-1.5 [&_i]:not-italic">
              {crumb}
            </span>
            <HistoryButtons className="max-[760px]:hidden" />
            <PhoneButton
              label={t('Search')}
              onClick={() => {
                setUi((u) => void (u.palette = true));
              }}
              icon="search"
            />
            <Link
              className="relative hidden size-11 place-items-center rounded-[22px] bg-surface text-ink-2 shadow-card max-[760px]:grid [&_.ic]:size-5"
              to="/updates"
              aria-label={t('Updates')}
            >
              <Icon name="bell" />
              {!!c.unread && (
                <em className="absolute top-1.5 right-[7px] size-[9px] rounded-full bg-danger text-[0px] shadow-[0_0_0_2px_var(--surface)]">
                  {c.unread}
                </em>
              )}
            </Link>
            <button
              type="button"
              className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[19px] border-0 bg-ink px-4 text-d13 font-semibold whitespace-nowrap text-on-ink hover:bg-ink-2 max-[760px]:hidden [&_.ic]:size-4 [&_.ic]:text-on-ink"
              aria-haspopup="menu"
              onClick={(e) => {
                openMenu(e.currentTarget, { type: 'new', alignRight: true });
              }}
            >
              <Icon name="plus" />
              <span>{t('New')}</span>
            </button>
          </header>
          <Sheets inspector={inspector}>{children}</Sheets>
        </section>
      </div>
      <PhoneTabs attention={c.attention} unread={c.unread} />
    </>
  );
}

function PhoneButton({ label, onClick, icon }: { label: string; onClick: () => void; icon: string }) {
  return (
    <button
      type="button"
      className="relative hidden size-11 place-items-center rounded-[22px] bg-surface text-ink-2 shadow-card max-[760px]:grid [&_.ic]:size-5"
      aria-label={label}
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  );
}

/* The page sheet and, when open, the docked details sheet. Laptops under 1100px float the details over the page; phones
   show them as a bottom sheet over a scrim. */
function Sheets({ children, inspector }: { children: ReactNode; inspector: ReactNode }) {
  const open = !!inspector;
  return (
    <div
      className={cn(
        'grid min-h-0 grid-cols-[minmax(0,1fr)] gap-2',
        open && 'grid-cols-[minmax(0,1fr)_var(--cs-insp)] gap-3 max-[1100px]:grid-cols-[minmax(0,1fr)]',
      )}
    >
      <div
        id="scroller"
        className="min-h-0 min-w-0 overflow-auto rounded-card bg-surface shadow-card has-[>[data-canvas]]:bg-transparent has-[>[data-canvas]]:shadow-none max-[760px]:rounded-none max-[760px]:shadow-none"
      >
        {children}
      </div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-[24] hidden bg-[rgb(22_22_21/16%)] max-[1100px]:block max-[760px]:bg-[rgb(22_22_21/22%)] min-[1101px]:hidden"
            aria-hidden="true"
            onClick={() => {
              setUi((u) => {
                u.insp = null;
                u.form = null;
              });
            }}
          />
          <aside
            className={cn(
              'insp-sheet min-h-0 min-w-0 overflow-auto rounded-card bg-surface shadow-card',
              'max-[1100px]:fixed max-[1100px]:top-3 max-[1100px]:right-3 max-[1100px]:bottom-3 max-[1100px]:z-[25] max-[1100px]:w-[min(var(--cs-insp),calc(100vw-24px))] max-[1100px]:shadow-[var(--e-pop)]',
              'max-[760px]:inset-x-0 max-[760px]:top-auto max-[760px]:bottom-0 max-[760px]:max-h-[88dvh] max-[760px]:w-auto max-[760px]:rounded-t-[22px] max-[760px]:rounded-b-none',
            )}
            aria-label={t('Details')}
          >
            {inspector}
          </aside>
        </>
      )}
    </div>
  );
}

const MORE_BASE = ['updates', 'programs', 'operations', 'resources', 'changes', 'organisation', 'settings'];

function PhoneTabs({ attention, unread }: { attention: number; unread: number }) {
  const route = useRoute();
  const me = useMe();
  const wsId = useWs();
  if (!me) return null;
  const moreOn = MORE_BASE.includes(route.page) || capsFor(wsId, me).some((c) => c.page === route.page);
  const tab =
    'relative grid h-[50px] w-[52px] place-items-center justify-self-center rounded-[25px] border-0 bg-transparent text-[0px] text-mute no-underline [&_.ic]:size-6';
  const tabOn = 'bg-pill text-ink';
  const dot =
    'absolute top-2 right-[9px] size-[9px] rounded-full bg-danger text-[0px] shadow-[0_0_0_2px_var(--surface)]';
  const item = (page: string, icon: string, label: string, count?: number) => (
    <Link
      to={`/${page}`}
      className={cn(tab, route.page === page && tabOn)}
      aria-current={route.page === page ? 'page' : undefined}
    >
      <Icon name={icon} selected={route.page === page} />
      {!!count && <em className={dot}>{count}</em>}
      <span className="sr-only">{t(label)}</span>
    </Link>
  );
  return (
    <nav
      className="fixed right-4 bottom-[calc(14px+env(safe-area-inset-bottom))] left-4 z-20 hidden items-center gap-2.5 max-[760px]:flex"
      aria-label={t('Main')}
    >
      <div className="grid h-[62px] flex-1 grid-cols-4 items-center rounded-[31px] bg-surface px-1.5 shadow-pop">
        {item('work', 'tasks', 'My Work', attention)}
        {item('projects', 'projects', 'Projects')}
        {item('schedule', 'calendar', 'Schedule')}
        <button
          type="button"
          className={cn(tab, moreOn && tabOn)}
          aria-haspopup="menu"
          onClick={(e) => {
            openMenu(e.currentTarget, { type: 'more', alignRight: true });
          }}
        >
          <Icon name="menu" />
          {!!unread && <em className={dot}>{unread}</em>}
          <span className="sr-only">{t('More')}</span>
        </button>
      </div>
      <button
        type="button"
        className="grid size-[62px] flex-none place-items-center rounded-full border-0 bg-ink text-on-ink shadow-pop [&_.ic]:size-[26px]"
        aria-label={t('New')}
        onClick={(e) => {
          openMenu(e.currentTarget, { type: 'new', alignRight: true });
        }}
      >
        <Icon name="plus" />
      </button>
    </nav>
  );
}
