/* The shell's menus: workspace switch, New, the phone's More, and the account menu (core/app.js MENUS.ws/new/more,
   screens/friendly.js acctMenu, D54, D60, D63). */
import { chooseLook } from '@/features/settings/services/preferences';
import { openComposer } from '@/features/schedule/services/composer-state';
import { capsFor, navLabel } from '@/app/config/capabilities';
import { divisionOf } from '@/app/config/org';
import { go } from '@/app/router/navigation';
import { inShip } from '@/app/router/routes';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { signOut } from '@/features/auth/services/session';
import { canCreateProject, visibleDivs } from '@/lib/access';
import { t } from '@/lib/i18n';
import { look, setSession, type Look, type Theme } from '@/lib/session';
import { getMe, useMe, useSession, useUi, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { closeMenu, Kbd, MENUS, MenuHeading, MenuItem, MenuRule, Tick } from './menus';

const LOOK_OPTS: [Look, string, string][] = [
  ['simple', 'Simple', 'Only what you need, bigger text'],
  ['comfortable', 'Comfortable', 'Every feature, calm'],
  ['compact', 'Compact', 'Every feature, dense'],
];

const goTo = (page: string) => {
  closeMenu();
  setUi((u) => void (u.palette = false));
  go(page);
};

function WsMenu() {
  const me = useMe();
  const ws = useWs();
  if (!me) return null;
  return visibleDivs(me).map((id) => {
    const d = divisionOf(id);
    if (!d) return null;
    return (
      <MenuItem
        key={id}
        role="menuitemradio"
        on={id === ws}
        icon={<BrandIcon id={d.icon} label={false} />}
        extra={id === ws ? <Tick /> : null}
        onSelect={() => {
          setSession({ ws: id });
          setUi((u) => {
            u.menu = null;
            u.folder = null;
            u.stage = 'all';
          });
        }}
      >
        {d.name}
      </MenuItem>
    );
  });
}

/* Co-Director and up create projects and division routines; everyone else can repeat a personal task (D31, D34). */
function NewMenu() {
  const me = useMe();
  const ws = useWs();
  const preview = useSession((s) => s.preview);
  if (!me) return null;
  const can = canCreateProject(me, ws);
  const open = (insp: { type: string; [k: string]: unknown }) => {
    setUi((u) => {
      u.menu = null;
      u.insp = insp;
    });
  };
  return (
    <>
      <MenuItem
        icon="tasks"
        extra={<Kbd>N</Kbd>}
        onSelect={() => {
          closeMenu();
          go('work');
          setUi((u) => void (u.focusQuickAdd = Date.now()));
        }}
      >
        {t('Task')}
      </MenuItem>
      <MenuItem
        icon="people"
        onSelect={() => {
          open({ type: 'new-offer', to: null, fromTask: null });
        }}
      >
        {t('Task for someone else')}
      </MenuItem>
      <MenuItem
        icon="calendar"
        extra={<Kbd>M</Kbd>}
        onSelect={() => {
          openComposer();
        }}
      >
        {t('Meeting')}
      </MenuItem>
      <MenuItem
        icon="clock"
        onSelect={() => {
          open({ type: 'unavail' });
        }}
      >
        {t('Unavailable time')}
      </MenuItem>
      {inShip('resources', preview) && (
        <MenuItem
          icon="note"
          onSelect={() => {
            open({ type: 'new-res', kind: 'note' });
          }}
        >
          {t('Note')}
        </MenuItem>
      )}
      <MenuItem
        icon="link"
        onSelect={() => {
          open({ type: 'new-res', kind: 'link' });
        }}
      >
        {t('Link')}
      </MenuItem>
      <MenuRule />
      {can && (
        <MenuItem
          icon="projects"
          onSelect={() => {
            open({ type: 'new-project' });
          }}
        >
          {t('Project')}
        </MenuItem>
      )}
      <MenuItem
        icon="routine"
        onSelect={() => {
          open({ type: 'routine-new', personal: !can });
        }}
      >
        {can ? t('Routine') : t('Repeating task')}
      </MenuItem>
    </>
  );
}

/* Phone dock "More" (D54): Updates, the workspace tools, Organization and Settings. */
function MoreMenu() {
  const me = useMe();
  const ws = useWs();
  const preview = useSession((s) => s.preview);
  if (!me) return null;
  const items: [string, string, string][] = [
    ['updates', 'bell', 'Updates'],
    ['programs', 'program', 'Programs'],
    ['operations', 'routine', 'Operations'],
    ['resources', 'resources', 'Resources'],
    ['changes', 'activity', 'Changes'],
    ...capsFor(ws, me).map((c): [string, string, string] => [c.page, c.icon, c.label]),
    ['organisation', 'people', 'Organization'],
    ['settings', 'settings', 'Settings'],
  ];
  return items
    .filter(([h]) => inShip(h, preview))
    .map(([h, i, l]) => (
      <MenuItem
        key={h}
        icon={i}
        onSelect={() => {
          goTo(h);
        }}
      >
        {t(navLabel(h, l, me))}
      </MenuItem>
    ));
}

const acctMail = (name: string, email?: string) =>
  email ?? `${name.toLowerCase().split(' ').join('.')}@students.uii.ac.id`;

/* The account menu (D60, in Claude's order): who you are, Settings, Language, Look, Theme, Organization, Sign out.
   Language, Look and Theme open in place with a way back, so the menu never jumps around the screen. */
function AccountMenu() {
  const me = useMe();
  const sub = useUi((u) => u.acctSub);
  const session = useSession((s) => s);
  const ws = useWs();
  if (!me) return null;
  const th: Theme = session.theme ?? 'light';
  const lk = look(session);
  const lang = session.lang === 'id' ? 'id' : 'en';
  const setSub = (k: string) => {
    setUi((u) => void (u.acctSub = k));
  };
  const back = (label: string) => (
    <MenuItem
      icon="chevron-left"
      className="[&>span]:font-semibold"
      onSelect={() => {
        setSub('');
      }}
    >
      {label}
    </MenuItem>
  );
  const pick = (on: boolean, label: string, select: () => void) => (
    <MenuItem role="menuitemradio" on={on} extra={on ? <Tick /> : null} onSelect={select}>
      {label}
    </MenuItem>
  );
  if (sub === 'lang')
    return (
      <>
        {back(t('Language'))}
        <MenuRule />
        {pick(lang === 'en', 'English', () => setSession({ lang: 'en' }))}
        {pick(lang === 'id', 'Bahasa Indonesia', () => setSession({ lang: 'id' }))}
      </>
    );
  if (sub === 'look')
    return (
      <>
        {back(t('Look'))}
        <MenuRule />
        {LOOK_OPTS.map(([k, l, d]) => (
          <MenuItem
            key={k}
            role="menuitemradio"
            on={lk === k}
            extra={lk === k ? <Tick /> : null}
            onSelect={() => {
              chooseLook(k);
            }}
          >
            <span className="grid gap-px">
              <b>{t(l)}</b>
              <small className="text-[12.5px] font-normal text-mute">{t(d)}</small>
            </span>
          </MenuItem>
        ))}
      </>
    );
  if (sub === 'theme')
    return (
      <>
        {back(t('Theme'))}
        <MenuRule />
        {(
          [
            ['light', 'Light'],
            ['dark', 'Dark'],
            ['system', 'Match your device'],
          ] as const
        ).map(([k, l]) => (
          <span key={k}>{pick(th === k, t(l), () => setSession({ theme: k }))}</span>
        ))}
      </>
    );
  const next = (k: string, icon: string, label: string, value: string) => (
    <MenuItem
      icon={icon}
      extra={
        <>
          <small className="ml-auto text-[13px] text-mute">{value}</small>
          <Icon name="chevron" className="ml-1 size-3.5 text-mute" />
        </>
      }
      onSelect={() => {
        setSub(k);
      }}
    >
      {label}
    </MenuItem>
  );
  // In Simple, leaders reach Attention and Performance from here (the Simple tabs stay at four).
  const team = lk === 'simple' ? capsFor(ws, me).filter((c) => c.page === 'attention' || c.page === 'performance') : [];
  return (
    <>
      <div className="truncate px-3 pt-2 pb-1.5 text-[13px] text-mute">{acctMail(me.name, me.email)}</div>
      <MenuItem
        icon="settings"
        extra={<Kbd>Ctrl+,</Kbd>}
        onSelect={() => {
          goTo('settings');
        }}
      >
        {t('Settings')}
      </MenuItem>
      {next('lang', 'globe', t('Language'), lang === 'en' ? 'English' : 'Bahasa Indonesia')}
      {next('look', 'home', t('Look'), t(LOOK_OPTS.find((x) => x[0] === lk)?.[1] ?? 'Comfortable'))}
      {next(
        'theme',
        th === 'dark' ? 'moon' : 'sun',
        t('Theme'),
        t(th === 'dark' ? 'Dark' : th === 'system' ? 'Match your device' : 'Light'),
      )}
      <MenuItem
        icon="people"
        onSelect={() => {
          goTo('organisation');
        }}
      >
        {t('Organization')}
      </MenuItem>
      {team.length > 0 && (
        <>
          <MenuRule />
          {team.some((c) => c.page === 'attention') && <MenuHeading>{t('Team')}</MenuHeading>}
          {team.map((c) => (
            <MenuItem
              key={c.page}
              icon={c.icon}
              onSelect={() => {
                goTo(c.page);
              }}
            >
              {t(navLabel(c.page, c.label, getMe()))}
            </MenuItem>
          ))}
        </>
      )}
      <MenuRule />
      <MenuItem
        icon="logout"
        onSelect={() => {
          closeMenu();
          void signOut();
        }}
      >
        {t('Sign out')}
      </MenuItem>
    </>
  );
}

MENUS.ws = WsMenu;
MENUS.new = NewMenu;
MENUS.more = MoreMenu;
MENUS.fme = AccountMenu;
