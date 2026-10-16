/* The resource menu (right-click a row or use its ⋯ button): open, details, make a task, pin, report, archive.
   From screens/plan.js MENUS.res. */
import type { MenuRef } from '@/app/ui-state';
import { useRoute } from '@/app/router/routes';
import { MENUS, MenuItem, MenuRule, closeMenu } from '@/components/shared/menus';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { isPinned, togglePin } from '@/features/pins/services/pins';
import { archiveResource, canEditRes, resOf } from '../services/resources';
import { openDetails, openFolder, useOpenResource } from './ResourceRow';

function ResourceMenu({ menu }: { menu: MenuRef }) {
  const me = useMe();
  const inProject = useRoute().page === 'projects';
  const open = useOpenResource(inProject);
  const r = useWorkspace((db) => resOf(db, menu.id));
  const pinned = useWorkspace((db) => (me && r ? isPinned(db, me, 'res', r.id) : false));
  if (!r || !me) return null;
  const own = canEditRes(me, r);
  const details = () => {
    closeMenu();
    openDetails(r.id);
  };
  return (
    <>
      {r.kind === 'folder' ? (
        <MenuItem
          icon="folder"
          onSelect={() => {
            closeMenu();
            openFolder(r.id, inProject);
          }}
        >
          {t('Open folder')}
        </MenuItem>
      ) : r.kind === 'link' ? (
        <MenuItem
          icon="external"
          onSelect={() => {
            closeMenu();
            open(r);
          }}
        >
          {t('Open link')}
        </MenuItem>
      ) : (
        <MenuItem icon="note" onSelect={details}>
          {t('Open note')}
        </MenuItem>
      )}
      <MenuItem icon="info" onSelect={details}>
        {t('Details')}
      </MenuItem>
      <MenuItem
        icon="tasks"
        onSelect={() => {
          setUi((u) => {
            u.menu = null;
            u.insp = { type: 'res', id: r.id };
            u.form = 'rtask';
          });
        }}
      >
        {t('Make a task from this')}
      </MenuItem>
      <MenuItem
        icon="pin"
        onSelect={() => {
          closeMenu();
          void togglePin(me, 'res', r.id);
        }}
      >
        {pinned ? t('Unpin') : t('Pin')}
      </MenuItem>
      {r.kind === 'link' && (
        <MenuItem
          icon="warning"
          onSelect={() => {
            setUi((u) => {
              u.menu = null;
              u.insp = { type: 'res', id: r.id };
              u.form = 'report';
            });
          }}
        >
          {t('Report it will not open')}
        </MenuItem>
      )}
      {own && (
        <>
          <MenuRule />
          <MenuItem
            icon="archive"
            onSelect={() => {
              void archiveResource(r.id);
            }}
          >
            {t('Archive')}
          </MenuItem>
        </>
      )}
    </>
  );
}

MENUS.res = ResourceMenu;
