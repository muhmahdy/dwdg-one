/* The Simple look's three menus: New (a task, a meeting, a project), the bell with the latest updates, and the profile with the
   shared account menu. From screens/simple.js MENUS.snew, sbell, sme. */
import { go } from '@/app/router/navigation';
import { Avatar, roleLabel } from '@/components/shared/Avatar';
import { AccountMenu } from '@/components/shared/shell-menus';
import { MENUS, MenuItem, MenuRule, closeMenu, Kbd } from '@/components/shared/menus';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { canCreateProject, visibleDivs } from '@/lib/access';
import { divisionOf } from '@/app/config/org';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { openComposer } from '@/features/schedule/services/composer-state';
import { updateText } from '@/features/updates/services/update-text';
import { openUpdate, refTitle } from '@/features/updates/services/updates';

function NewMenu() {
  const me = useMe();
  if (!me) return null;
  const can = visibleDivs(me).some((d) => canCreateProject(me, d));
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
        icon="calendar"
        extra={<Kbd>M</Kbd>}
        onSelect={() => {
          openComposer();
        }}
      >
        {t('Meeting')}
      </MenuItem>
      {can && (
        <MenuItem
          icon="projects"
          onSelect={() => {
            closeMenu();
            go('projects');
            setUi((u) => void (u.insp = { type: 's-project' }));
          }}
        >
          {t('Project')}
        </MenuItem>
      )}
    </>
  );
}

function BellMenu() {
  const me = useMe();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const all = db.updates.filter((u) => u.to === me.id).slice(0, 8);
  return (
    <>
      <div className="px-2.5 pt-1.5 pb-1 text-[13px] font-semibold text-mute">{t('Updates')}</div>
      {all.length ? (
        all.map((u) => {
          const who = db.people.find((p) => p.id === u.actor)?.first ?? t('Someone');
          const title = refTitle(db, u.ref);
          return (
            <MenuItem
              key={u.id}
              className="items-start justify-start gap-2.5 p-2.5"
              onSelect={() => {
                closeMenu();
                openUpdate(u.id);
              }}
            >
              <span className="flex min-w-0 flex-1 items-start gap-2.5">
                {u.actor ? <Avatar id={u.actor} size="sm" /> : <Icon name="clock" size="sm" />}
                <span className="grid min-w-0 flex-1 gap-0.5 font-normal">
                  <span>{updateText(u.type, who)}</span>
                  {title && <small className="truncate text-[13px] text-mute">{title}</small>}
                </span>
                {!u.read && <i className="mt-2 size-2 flex-none rounded-full bg-green-ink" />}
              </span>
            </MenuItem>
          );
        })
      ) : (
        <div className="px-3 py-6 text-center text-mute type-small">{t('No updates yet.')}</div>
      )}
      <MenuRule />
      <MenuItem
        icon="bell"
        onSelect={() => {
          closeMenu();
          go('updates');
        }}
      >
        {t('See all updates')}
      </MenuItem>
    </>
  );
}

function ProfileMenu() {
  const me = useMe();
  if (!me) return null;
  const d = divisionOf(me.div);
  return (
    <>
      <div className={cn('flex items-center gap-3 px-2.5 pt-2 pb-2.5')}>
        <Avatar id={me.id} size="lg" />
        <div className="min-w-0">
          <b className="block truncate">{me.name}</b>
          <small className="block text-[13px] text-mute">
            {roleLabel(me)}, {d?.name ?? t('Organization')}
          </small>
        </div>
      </div>
      <MenuRule />
      <AccountMenu />
    </>
  );
}

MENUS.snew = NewMenu;
MENUS.sbell = BellMenu;
MENUS.sme = ProfileMenu;
